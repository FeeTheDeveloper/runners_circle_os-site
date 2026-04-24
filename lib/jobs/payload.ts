import type { Prisma } from "@prisma/client";

import type { AgentPromptJobPayload } from "@/lib/agents/types";
import { normalizeContentPlatform } from "@/lib/utils/domain-options";

export type ContentPublishJobPayload = {
  createdById: string;
  supabaseUserId: string;
  contentItemId: string;
  contentTitle: string;
  campaignId: string | null;
  campaignName: string | null;
  platform: string;
};

export type CreatorGenerationJobPayload = {
  createdById: string;
  supabaseUserId: string;
  requestId: string;
  requestType: string;
  requestHeadline: string;
  templateKey: string;
  brandSlug: string;
  platform: string;
  format: string;
  campaignId: string | null;
  campaignName: string | null;
};

const validAgentTypes = ["campaign_builder", "content_creator", "video_prompt", "automation_builder"] as const;
const validAgentJobTypes = [
  "generate_campaign_plan",
  "generate_content_pack",
  "generate_video_prompt",
  "generate_automation_prompt"
] as const;

type JsonObject = Record<string, Prisma.JsonValue>;

function isJsonObject(payload: Prisma.JsonValue | null): payload is JsonObject {
  return Boolean(payload) && typeof payload === "object" && !Array.isArray(payload);
}

function getStringValue(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getNumberValue(value: Prisma.JsonValue | undefined) {
  return typeof value === "number" ? value : null;
}

function getBooleanValue(value: Prisma.JsonValue | undefined) {
  return typeof value === "boolean" ? value : null;
}

export function getContentPublishJobPayload(payload: Prisma.JsonValue | null) {
  if (!isJsonObject(payload)) {
    return null;
  }

  return {
    createdById: getStringValue(payload.createdById) ?? null,
    supabaseUserId: getStringValue(payload.supabaseUserId) ?? null,
    contentItemId: getStringValue(payload.contentItemId) ?? null,
    contentTitle: getStringValue(payload.contentTitle) ?? null,
    campaignId: getStringValue(payload.campaignId) ?? null,
    campaignName: getStringValue(payload.campaignName) ?? null,
    platform: getStringValue(payload.platform) ?? null
  };
}

export function getCreatorGenerationJobPayload(payload: Prisma.JsonValue | null) {
  if (!isJsonObject(payload)) {
    return null;
  }

  return {
    createdById: getStringValue(payload.createdById) ?? null,
    supabaseUserId: getStringValue(payload.supabaseUserId) ?? null,
    requestId: getStringValue(payload.requestId) ?? null,
    requestType: getStringValue(payload.requestType) ?? null,
    requestHeadline: getStringValue(payload.requestHeadline) ?? null,
    templateKey: getStringValue(payload.templateKey) ?? null,
    brandSlug: getStringValue(payload.brandSlug) ?? null,
    platform: getStringValue(payload.platform) ?? null,
    format: getStringValue(payload.format) ?? null,
    campaignId: getStringValue(payload.campaignId) ?? null,
    campaignName: getStringValue(payload.campaignName) ?? null
  };
}

export function getAgentPromptJobPayload(payload: Prisma.JsonValue | null): AgentPromptJobPayload | null {
  if (!isJsonObject(payload)) {
    return null;
  }

  const agentTypeValue = getStringValue(payload.agentType);
  const recommendedJobTypeValue = getStringValue(payload.recommendedJobType);
  const agentType = validAgentTypes.find((value) => value === agentTypeValue);
  const recommendedJobType = validAgentJobTypes.find((value) => value === recommendedJobTypeValue);

  if (!agentType || !recommendedJobType) {
    return null;
  }

  return {
    agentPromptId: getStringValue(payload.agentPromptId) ?? "",
    agentType,
    promptTitle: getStringValue(payload.promptTitle) ?? "",
    prompt: getStringValue(payload.prompt) ?? "",
    businessSlug: getStringValue(payload.businessSlug) ?? getStringValue(payload.brandSlug) ?? "",
    businessLabel: getStringValue(payload.businessLabel) ?? "",
    brandSlug: getStringValue(payload.brandSlug) ?? getStringValue(payload.businessSlug) ?? "",
    goal: getStringValue(payload.goal) ?? "",
    outputPresetKey: getStringValue(payload.outputPresetKey) ?? getStringValue(payload.outputType) ?? "",
    outputLabel: getStringValue(payload.outputLabel) ?? "",
    outputType: getStringValue(payload.outputType) ?? "",
    recommendedJobType,
    campaignId: getStringValue(payload.campaignId) ?? null,
    campaignName: getStringValue(payload.campaignName) ?? null,
    contentId: getStringValue(payload.contentId) ?? null,
    contentTitle: getStringValue(payload.contentTitle) ?? null,
    platform: normalizeContentPlatform(getStringValue(payload.platform)),
    createdById: getStringValue(payload.createdById) ?? "",
    supabaseUserId: getStringValue(payload.supabaseUserId) ?? "",
    postCount: getNumberValue(payload.postCount),
    videoScriptCount: getNumberValue(payload.videoScriptCount),
    includeCaptions: getBooleanValue(payload.includeCaptions),
    includeImagePrompts: getBooleanValue(payload.includeImagePrompts),
    includeCtas: getBooleanValue(payload.includeCtas)
  };
}
