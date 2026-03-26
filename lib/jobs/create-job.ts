import "server-only";

import type { AutomationJob } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type JobWriteClient = Pick<typeof prisma, "automationJob" | "contentItem">;

export async function createContentPublishJob(
  contentItemId: string,
  db: JobWriteClient = prisma
): Promise<AutomationJob> {
  const contentItem = await db.contentItem.findUnique({
    where: {
      id: contentItemId
    },
    select: {
      id: true,
      title: true,
      platform: true,
      campaignId: true,
      scheduledFor: true
    }
  });

  if (!contentItem) {
    throw new Error("Content item could not be found for publish job creation.");
  }

  return db.automationJob.create({
    data: {
      type: "CONTENT_PUBLISH",
      status: "QUEUED",
      scheduledFor: contentItem.scheduledFor ?? new Date(),
      payload: {
        contentItemId: contentItem.id,
        title: contentItem.title,
        platform: contentItem.platform,
        campaignId: contentItem.campaignId
      }
    }
  });
}

export async function createCRMsyncJob(db: Pick<typeof prisma, "automationJob"> = prisma): Promise<AutomationJob> {
  return db.automationJob.create({
    data: {
      type: "CRM_SYNC",
      status: "QUEUED",
      scheduledFor: new Date(),
      payload: {
        provider: "crm",
        trigger: "manual"
      }
    }
  });
}
