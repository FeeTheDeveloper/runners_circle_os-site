import "server-only";

import type { AutomationJob, Prisma } from "@prisma/client";

import { generateImageAsset } from "@/lib/creator/generate-image";
import { generateVideoAsset } from "@/lib/creator/generate-video";
import type { CreatorTemplateKey } from "@/lib/creator/types";
import { getAutomationJobById, markJobComplete, markJobFailed, markJobProcessing } from "@/lib/db/jobs";
import { prisma } from "@/lib/db/prisma";
import { JOB_STATUS, JOB_STATUS_TO_DB } from "@/lib/jobs/constants";
import { getContentPublishJobPayload, getCreatorGenerationJobPayload } from "@/lib/jobs/payload";

const PROCESSING_LOCK_WINDOW_MS = 5 * 60 * 1000;

type ExecuteAutomationJobResult = {
  ok: boolean;
  jobId: string;
  message: string;
  state: "completed" | "failed" | "already-completed" | "already-processing" | "not-runnable";
};

type ExecuteAutomationJobOptions = {
  allowFailedRetry: boolean;
  allowStaleProcessingTakeover: boolean;
  ignoreProcessingLock: boolean;
};

type JobFailureContext = {
  action: string;
  requestId: string | null;
  contentId: string | null;
  contentTitle: string | null;
  campaignId: string | null;
  campaignName: string | null;
};

function isWithinProcessingLockWindow(job: AutomationJob) {
  if (!job.startedAt) {
    return false;
  }

  return Date.now() - job.startedAt.getTime() < PROCESSING_LOCK_WINDOW_MS;
}

function getJsonObject(value: Prisma.JsonValue | null) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Prisma.JsonValue>)
    : {};
}

function getJsonString(value: Prisma.JsonValue | null, key: string) {
  const candidate = getJsonObject(value)[key];

  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function mergeJsonPayload(
  value: Prisma.JsonValue | null,
  patch: Record<string, Prisma.InputJsonValue | null>
): Prisma.InputJsonValue {
  return {
    ...getJsonObject(value),
    ...patch
  } satisfies Prisma.InputJsonObject;
}

function getContentJobContext(job: AutomationJob): JobFailureContext {
  const payload = getContentPublishJobPayload(job.payload);

  return {
    action: "content_publish",
    requestId: null,
    contentId: payload?.contentItemId ?? null,
    contentTitle: payload?.contentTitle ?? null,
    campaignId: payload?.campaignId ?? null,
    campaignName: payload?.campaignName ?? null
  };
}

function getCreatorJobContext(job: AutomationJob): JobFailureContext {
  const payload = getCreatorGenerationJobPayload(job.payload);

  return {
    action: job.type === "GENERATE_VIDEO" ? "generate_video" : "generate_image",
    requestId: payload?.requestId ?? null,
    contentId: null,
    contentTitle: payload?.requestHeadline ?? null,
    campaignId: payload?.campaignId ?? null,
    campaignName: payload?.campaignName ?? null
  };
}

function getJobFailureContext(job: AutomationJob): JobFailureContext {
  if (job.type === "GENERATE_IMAGE" || job.type === "GENERATE_VIDEO") {
    return getCreatorJobContext(job);
  }

  return getContentJobContext(job);
}

async function processContentPublishJob(job: AutomationJob) {
  const payload = getContentPublishJobPayload(job.payload);
  const contentId = payload?.contentItemId;

  if (!contentId) {
    throw new Error(`Automation job ${job.id} is missing the related content item id.`);
  }

  const content = await prisma.contentItem.findUnique({
    where: {
      id: contentId
    },
    select: {
      id: true,
      title: true,
      campaignId: true,
      campaign: {
        select: {
          name: true
        }
      }
    }
  });

  if (!content) {
    throw new Error(`Content item ${contentId} could not be found for automation job ${job.id}.`);
  }

  return {
    success: true,
    action: "content_publish",
    contentId: content.id,
    contentTitle: content.title,
    campaignId: content.campaignId ?? payload?.campaignId ?? null,
    campaignName: content.campaign?.name ?? payload?.campaignName ?? null,
    processedAt: new Date().toISOString(),
    summary: "Content publish job processed successfully"
  } satisfies Prisma.InputJsonValue;
}

async function markCreatorRequestStatus(
  requestId: string,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
  patch: Record<string, Prisma.InputJsonValue | null>
) {
  const request = await prisma.creatorRequest.findUnique({
    where: {
      id: requestId
    },
    select: {
      payload: true
    }
  });

  if (!request) {
    return;
  }

  await prisma.creatorRequest.update({
    where: {
      id: requestId
    },
    data: {
      status,
      payload: mergeJsonPayload(request.payload, patch)
    }
  });
}

async function processCreatorGenerationJob(job: AutomationJob, mode: "IMAGE" | "VIDEO") {
  const payload = getCreatorGenerationJobPayload(job.payload);
  const requestId = payload?.requestId;

  if (!requestId) {
    throw new Error(`Automation job ${job.id} is missing the related creator request id.`);
  }

  const request = await prisma.creatorRequest.findUnique({
    where: {
      id: requestId
    },
    select: {
      id: true,
      type: true,
      templateKey: true,
      platform: true,
      format: true,
      brandSlug: true,
      headline: true,
      body: true,
      cta: true,
      status: true,
      payload: true,
      campaignId: true,
      createdById: true,
      campaign: {
        select: {
          name: true
        }
      },
      generatedAssets: {
        where: {
          status: "READY"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        select: {
          id: true,
          title: true,
          campaignId: true,
          contentId: true,
          content: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  if (!request) {
    throw new Error(`Creator request ${requestId} could not be found for automation job ${job.id}.`);
  }

  if (request.type !== mode) {
    throw new Error(
      `Creator request ${request.id} is ${request.type}, but automation job ${job.id} is trying to run ${mode}.`
    );
  }

  const existingAsset = request.generatedAssets[0];

  if (existingAsset) {
    await markCreatorRequestStatus(request.id, "COMPLETED", {
      lastJobId: job.id,
      recoveredAt: new Date().toISOString(),
      generatedAssetId: existingAsset.id,
      contentId: existingAsset.contentId,
      summary: `${mode === "IMAGE" ? "Image" : "Video"} asset already existed and was reused.`
    });

    return {
      success: true,
      action: mode === "IMAGE" ? "generate_image" : "generate_video",
      requestId: request.id,
      generatedAssetId: existingAsset.id,
      contentId: existingAsset.contentId,
      contentTitle: existingAsset.content?.title ?? request.headline,
      campaignId: existingAsset.campaignId ?? request.campaignId,
      campaignName: request.campaign?.name ?? payload?.campaignName ?? null,
      processedAt: new Date().toISOString(),
      summary: `${mode === "IMAGE" ? "Image" : "Video"} asset already existed and was reused.`
    } satisfies Prisma.InputJsonValue;
  }

  await markCreatorRequestStatus(request.id, "PROCESSING", {
    lastJobId: job.id,
    startedAt: new Date().toISOString()
  });

  const accentText = getJsonString(request.payload, "accentText");
  const generatedAsset =
    mode === "IMAGE"
      ? await generateImageAsset({
          templateKey: request.templateKey as Extract<CreatorTemplateKey, "image_offer_card" | "image_quote_card">,
          brandSlug: request.brandSlug,
          headline: request.headline,
          body: request.body,
          cta: request.cta,
          accentText,
          platform: request.platform,
          format: request.format
        })
      : await generateVideoAsset({
          templateKey: request.templateKey as Extract<CreatorTemplateKey, "video_service_promo" | "video_music_teaser">,
          brandSlug: request.brandSlug,
          headline: request.headline,
          body: request.body,
          cta: request.cta,
          accentText,
          platform: request.platform,
          format: request.format
        });

  const processedAt = new Date().toISOString();
  const summary =
    mode === "IMAGE" ? "Creator image generated successfully." : "Creator video generated successfully.";

  const createdRecords = await prisma.$transaction(async (tx) => {
    const content = await tx.contentItem.create({
      data: {
        title: request.headline,
        platform: request.platform,
        format: request.format,
        copy: request.cta ? `${request.body}\n\nCTA: ${request.cta}` : request.body,
        mediaUrl: generatedAsset.url,
        status: "DRAFT",
        campaignId: request.campaignId ?? null,
        createdById: request.createdById
      },
      select: {
        id: true,
        title: true
      }
    });

    const asset = await tx.generatedAsset.create({
      data: {
        requestId: request.id,
        assetType: generatedAsset.assetType,
        title: generatedAsset.title,
        url: generatedAsset.url,
        storageKey: generatedAsset.storageKey,
        width: generatedAsset.width,
        height: generatedAsset.height,
        durationSec: generatedAsset.durationSec,
        status: "READY",
        metadata: generatedAsset.metadata,
        campaignId: request.campaignId ?? null,
        contentId: content.id,
        createdById: request.createdById
      },
      select: {
        id: true
      }
    });

    const latestRequest = await tx.creatorRequest.findUnique({
      where: {
        id: request.id
      },
      select: {
        payload: true
      }
    });

    await tx.creatorRequest.update({
      where: {
        id: request.id
      },
      data: {
        status: "COMPLETED",
        payload: mergeJsonPayload(latestRequest?.payload ?? request.payload, {
          lastJobId: job.id,
          processedAt,
          generatedAssetId: asset.id,
          contentId: content.id,
          summary
        })
      }
    });

    return {
      assetId: asset.id,
      contentId: content.id,
      contentTitle: content.title
    };
  });

  return {
    success: true,
    action: mode === "IMAGE" ? "generate_image" : "generate_video",
    requestId: request.id,
    generatedAssetId: createdRecords.assetId,
    contentId: createdRecords.contentId,
    contentTitle: createdRecords.contentTitle,
    campaignId: request.campaignId ?? payload?.campaignId ?? null,
    campaignName: request.campaign?.name ?? payload?.campaignName ?? null,
    processedAt,
    summary
  } satisfies Prisma.InputJsonValue;
}

async function executeLoadedJob(job: AutomationJob) {
  switch (job.type) {
    case "CONTENT_PUBLISH":
      return processContentPublishJob(job);
    case "GENERATE_IMAGE":
      return processCreatorGenerationJob(job, "IMAGE");
    case "GENERATE_VIDEO":
      return processCreatorGenerationJob(job, "VIDEO");
    default:
      throw new Error(
        `Automation job ${job.id} has unsupported type ${job.type}. Supported types are CONTENT_PUBLISH, GENERATE_IMAGE, and GENERATE_VIDEO.`
      );
  }
}

async function runAutomationJob(
  jobId: string,
  options: ExecuteAutomationJobOptions
): Promise<ExecuteAutomationJobResult> {
  const existingJob = await getAutomationJobById(jobId);

  if (!existingJob) {
    throw new Error(`Automation job ${jobId} could not be found.`);
  }

  if (existingJob.status === JOB_STATUS_TO_DB[JOB_STATUS.COMPLETED]) {
    return {
      ok: true,
      jobId,
      message: "This automation job has already completed.",
      state: "already-completed"
    };
  }

  let job = existingJob;

  if (existingJob.status === JOB_STATUS_TO_DB[JOB_STATUS.PROCESSING]) {
    if (options.ignoreProcessingLock) {
      job = existingJob;
    } else if (isWithinProcessingLockWindow(existingJob)) {
      return {
        ok: true,
        jobId,
        message: "This automation job is already processing.",
        state: "already-processing"
      };
    }

    if (!options.allowStaleProcessingTakeover) {
      return {
        ok: false,
        jobId,
        message: "This automation job is already processing and cannot be claimed right now.",
        state: "not-runnable"
      };
    }

    job = await markJobProcessing(jobId, ["RUNNING"]);
  } else if (existingJob.status === JOB_STATUS_TO_DB[JOB_STATUS.FAILED]) {
    if (!options.allowFailedRetry) {
      return {
        ok: false,
        jobId,
        message: "This automation job is failed and must be re-queued before it can run again.",
        state: "not-runnable"
      };
    }

    job = await markJobProcessing(jobId, ["FAILED"]);
  } else {
    job = await markJobProcessing(jobId, ["QUEUED"]);
  }

  try {
    const result = await executeLoadedJob(job);

    await markJobComplete(job.id, result);

    return {
      ok: true,
      jobId: job.id,
      message: typeof result.summary === "string" ? result.summary : "Automation job completed successfully.",
      state: "completed"
    };
  } catch (error) {
    const context = getJobFailureContext(job);
    const message = error instanceof Error ? error.message : "Automation job execution failed.";

    if (context.requestId) {
      await markCreatorRequestStatus(context.requestId, "FAILED", {
        lastJobId: job.id,
        failedAt: new Date().toISOString(),
        lastError: message
      });
    }

    await markJobFailed(job.id, {
      success: false,
      action: context.action,
      requestId: context.requestId,
      contentId: context.contentId,
      contentTitle: context.contentTitle,
      campaignId: context.campaignId,
      campaignName: context.campaignName,
      processedAt: new Date().toISOString(),
      error: message,
      summary: message
    });

    return {
      ok: false,
      jobId: job.id,
      message,
      state: "failed"
    };
  }
}

export async function executeAutomationJob(jobId: string) {
  return runAutomationJob(jobId, {
    allowFailedRetry: false,
    allowStaleProcessingTakeover: true,
    ignoreProcessingLock: false
  });
}

export async function continueAutomationJob(jobId: string) {
  return runAutomationJob(jobId, {
    allowFailedRetry: false,
    allowStaleProcessingTakeover: true,
    ignoreProcessingLock: true
  });
}
