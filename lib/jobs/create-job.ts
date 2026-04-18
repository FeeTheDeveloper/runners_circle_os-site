import "server-only";

import type { AutomationJob } from "@prisma/client";

import { JOB_STATUS, JOB_STATUS_TO_DB } from "@/lib/jobs/constants";
import type { ContentPublishJobPayload } from "@/lib/jobs/payload";
import { prisma } from "@/lib/db/prisma";

type JobWriteClient = Pick<typeof prisma, "automationJob" | "contentItem">;

type CreateContentPublishJobInput = {
  contentItemId: string;
  createdById: string;
  supabaseUserId: string;
};

export async function createContentPublishJob(
  input: CreateContentPublishJobInput,
  db: JobWriteClient = prisma
): Promise<AutomationJob> {
  const contentItem = await db.contentItem.findUnique({
    where: {
      id: input.contentItemId
    },
    select: {
      id: true,
      title: true,
      platform: true,
      campaignId: true,
      scheduledFor: true,
      campaign: {
        select: {
          name: true
        }
      }
    }
  });

  if (!contentItem) {
    throw new Error("Content item could not be found for publish job creation.");
  }

  const payload: ContentPublishJobPayload = {
    createdById: input.createdById,
    supabaseUserId: input.supabaseUserId,
    contentItemId: contentItem.id,
    contentTitle: contentItem.title,
    campaignId: contentItem.campaignId,
    campaignName: contentItem.campaign?.name ?? null,
    platform: contentItem.platform
  };

  return db.automationJob.create({
    data: {
      type: "CONTENT_PUBLISH",
      status: JOB_STATUS_TO_DB[JOB_STATUS.QUEUED],
      scheduledFor: contentItem.scheduledFor ?? new Date(),
      payload
    }
  });
}

export async function createCRMsyncJob(db: Pick<typeof prisma, "automationJob"> = prisma): Promise<AutomationJob> {
  return db.automationJob.create({
    data: {
      type: "CRM_SYNC",
      status: JOB_STATUS_TO_DB[JOB_STATUS.QUEUED],
      scheduledFor: new Date(),
      payload: {
        provider: "crm",
        trigger: "manual"
      }
    }
  });
}
