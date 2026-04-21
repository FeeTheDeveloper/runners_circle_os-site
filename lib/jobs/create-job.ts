import "server-only";

import type { AutomationJob } from "@prisma/client";

import { JOB_STATUS, JOB_STATUS_TO_DB } from "@/lib/jobs/constants";
import type { ContentPublishJobPayload, CreatorGenerationJobPayload } from "@/lib/jobs/payload";
import { prisma } from "@/lib/db/prisma";

type JobWriteClient = Pick<typeof prisma, "automationJob" | "contentItem" | "creatorRequest">;

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

type CreateCreatorGenerationJobInput = {
  requestId: string;
  createdById: string;
  supabaseUserId: string;
};

export async function createCreatorGenerationJob(
  input: CreateCreatorGenerationJobInput,
  db: JobWriteClient = prisma
): Promise<AutomationJob> {
  const request = await db.creatorRequest.findUnique({
    where: {
      id: input.requestId
    },
    select: {
      id: true,
      type: true,
      headline: true,
      templateKey: true,
      brandSlug: true,
      platform: true,
      format: true,
      campaignId: true,
      campaign: {
        select: {
          name: true
        }
      }
    }
  });

  if (!request) {
    throw new Error("Creator request could not be found for automation job creation.");
  }

  const payload: CreatorGenerationJobPayload = {
    createdById: input.createdById,
    supabaseUserId: input.supabaseUserId,
    requestId: request.id,
    requestType: request.type,
    requestHeadline: request.headline,
    templateKey: request.templateKey,
    brandSlug: request.brandSlug,
    platform: request.platform,
    format: request.format,
    campaignId: request.campaignId,
    campaignName: request.campaign?.name ?? null
  };

  return db.automationJob.create({
    data: {
      type: request.type === "IMAGE" ? "GENERATE_IMAGE" : "GENERATE_VIDEO",
      status: JOB_STATUS_TO_DB[JOB_STATUS.QUEUED],
      scheduledFor: new Date(),
      payload
    }
  });
}
