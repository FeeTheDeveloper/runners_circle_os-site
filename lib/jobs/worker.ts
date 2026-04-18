import type { AutomationJob, Prisma } from "@prisma/client";

import { markJobComplete, markJobFailed } from "@/lib/db/jobs";
import { getContentPublishJobPayload } from "@/lib/jobs/payload";
import { prisma } from "@/lib/db/prisma";

function getPayloadValue(payload: Prisma.JsonValue | null, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  return payload[key as keyof typeof payload];
}

async function processContentPublishJob(job: AutomationJob) {
  const payload = getContentPublishJobPayload(job.payload);
  const contentItemId = payload?.contentItemId ?? getPayloadValue(job.payload, "contentItemId");

  if (typeof contentItemId !== "string" || contentItemId.length === 0) {
    throw new Error("CONTENT_PUBLISH jobs require a contentItemId payload.");
  }

  const contentItem = await prisma.contentItem.update({
    where: {
      id: contentItemId
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date()
    },
    select: {
      id: true,
      title: true,
      platform: true,
      campaignId: true,
      publishedAt: true
    }
  });

  return {
    contentItemId: contentItem.id,
    title: contentItem.title,
    platform: contentItem.platform,
    campaignId: contentItem.campaignId,
    publishedAt: contentItem.publishedAt?.toISOString() ?? null
  };
}

async function processCRMSyncJob(job: AutomationJob) {
  return {
    provider: "crm",
    jobId: job.id,
    syncedAt: new Date().toISOString(),
    mode: "mock"
  };
}

export async function processJob(job: AutomationJob) {
  if (job.status !== "RUNNING") {
    return {
      ok: false,
      error: `Automation job ${job.id} must be RUNNING before worker execution.`
    };
  }

  try {
    let result: Prisma.InputJsonValue;

    switch (job.type) {
      case "CONTENT_PUBLISH":
        result = await processContentPublishJob(job);
        break;
      case "CRM_SYNC":
        result = await processCRMSyncJob(job);
        break;
      default:
        throw new Error(`No worker implementation exists yet for job type ${job.type}.`);
    }

    await markJobComplete(job.id, result);

    return {
      ok: true
    };
  } catch (error) {
    await markJobFailed(job.id, error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Job processing failed."
    };
  }
}
