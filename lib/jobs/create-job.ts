import "server-only";

import type { AutomationJob } from "@prisma/client";

import type { AgentPromptJobPayload } from "@/lib/agents/types";
import { agentJobTypeToDb } from "@/lib/agents/types";
import { JOB_STATUS, JOB_STATUS_TO_DB } from "@/lib/jobs/constants";
import type { ContentPublishJobPayload, CreatorGenerationJobPayload } from "@/lib/jobs/payload";
import { prisma } from "@/lib/db/prisma";
import { normalizeContentPlatform } from "@/lib/utils/domain-options";

type JobWriteClient = Pick<typeof prisma, "automationJob" | "contentItem" | "creatorRequest" | "agentPrompt">;

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

type CreateAgentPromptJobInput = {
  agentPromptId: string;
  createdById: string;
  supabaseUserId: string;
  recommendedJobType: keyof typeof agentJobTypeToDb;
};

function getStringProperty(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "string" ? value : null;
}

function getNumberProperty(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "number" ? value : null;
}

function getBooleanProperty(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "boolean" ? value : null;
}

export async function createAgentPromptJob(
  input: CreateAgentPromptJobInput,
  db: JobWriteClient = prisma
): Promise<AutomationJob> {
  const agentPrompt = await db.agentPrompt.findUnique({
    where: {
      id: input.agentPromptId
    },
    select: {
      id: true,
      title: true,
      prompt: true,
      payload: true,
      campaignId: true,
      contentId: true,
      campaign: {
        select: {
          name: true
        }
      },
      content: {
        select: {
          title: true
        }
      }
    }
  });

  if (!agentPrompt) {
    throw new Error("Agent prompt could not be found for automation job creation.");
  }

  const payloadJson =
    agentPrompt.payload && typeof agentPrompt.payload === "object" && !Array.isArray(agentPrompt.payload)
      ? (agentPrompt.payload as Record<string, unknown>)
      : {};

  const payload: AgentPromptJobPayload = {
    agentPromptId: agentPrompt.id,
    agentType:
      typeof payloadJson.agentType === "string" ? (payloadJson.agentType as AgentPromptJobPayload["agentType"]) : "campaign_builder",
    promptTitle: agentPrompt.title,
    prompt: agentPrompt.prompt,
    businessSlug: getStringProperty(payloadJson, "businessSlug") ?? getStringProperty(payloadJson, "brandSlug") ?? "",
    businessLabel: getStringProperty(payloadJson, "businessLabel") ?? "",
    brandSlug: getStringProperty(payloadJson, "brandSlug") ?? getStringProperty(payloadJson, "businessSlug") ?? "",
    goal: getStringProperty(payloadJson, "goal") ?? "",
    outputPresetKey: getStringProperty(payloadJson, "outputPresetKey") ?? getStringProperty(payloadJson, "outputType") ?? "",
    outputLabel: getStringProperty(payloadJson, "outputLabel") ?? "",
    outputType: getStringProperty(payloadJson, "outputType") ?? "",
    recommendedJobType: input.recommendedJobType,
    campaignId: agentPrompt.campaignId,
    campaignName: agentPrompt.campaign?.name ?? null,
    contentId: agentPrompt.contentId,
    contentTitle: agentPrompt.content?.title ?? null,
    platform: normalizeContentPlatform(getStringProperty(payloadJson, "platform")),
    createdById: input.createdById,
    supabaseUserId: input.supabaseUserId,
    postCount: getNumberProperty(payloadJson, "postCount"),
    videoScriptCount: getNumberProperty(payloadJson, "videoScriptCount"),
    includeCaptions: getBooleanProperty(payloadJson, "includeCaptions"),
    includeImagePrompts: getBooleanProperty(payloadJson, "includeImagePrompts"),
    includeCtas: getBooleanProperty(payloadJson, "includeCtas")
  };

  return db.automationJob.create({
    data: {
      type: agentJobTypeToDb[input.recommendedJobType],
      status: JOB_STATUS_TO_DB[JOB_STATUS.QUEUED],
      scheduledFor: new Date(),
      payload
    }
  });
}
