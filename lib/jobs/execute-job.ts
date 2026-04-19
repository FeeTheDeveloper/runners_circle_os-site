import "server-only";

import type { AutomationJob, Prisma } from "@prisma/client";

import { getAutomationJobById, markJobComplete, markJobFailed, markJobProcessing } from "@/lib/db/jobs";
import { prisma } from "@/lib/db/prisma";
import { JOB_STATUS, JOB_STATUS_TO_DB } from "@/lib/jobs/constants";
import { getContentPublishJobPayload } from "@/lib/jobs/payload";

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

function isWithinProcessingLockWindow(job: AutomationJob) {
  if (!job.startedAt) {
    return false;
  }

  return Date.now() - job.startedAt.getTime() < PROCESSING_LOCK_WINDOW_MS;
}

function getContentJobContext(job: AutomationJob) {
  const payload = getContentPublishJobPayload(job.payload);

  return {
    contentId: payload?.contentItemId ?? null,
    campaignId: payload?.campaignId ?? null
  };
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
      campaignId: true
    }
  });

  if (!content) {
    throw new Error(`Content item ${contentId} could not be found for automation job ${job.id}.`);
  }

  return {
    success: true,
    action: "content_publish",
    contentId: content.id,
    campaignId: content.campaignId ?? payload?.campaignId ?? null,
    processedAt: new Date().toISOString(),
    summary: "Content publish job processed successfully"
  } satisfies Prisma.InputJsonValue;
}

async function executeLoadedJob(job: AutomationJob) {
  if (job.type !== "CONTENT_PUBLISH") {
    throw new Error(`Automation job ${job.id} has unsupported type ${job.type}. Only CONTENT_PUBLISH is supported.`);
  }

  return processContentPublishJob(job);
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
    const context = getContentJobContext(job);
    const message = error instanceof Error ? error.message : "Automation job execution failed.";

    await markJobFailed(job.id, {
      success: false,
      action: "content_publish",
      contentId: context.contentId,
      campaignId: context.campaignId,
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
