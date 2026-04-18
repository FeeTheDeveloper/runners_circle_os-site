import type { Prisma } from "@prisma/client";

export type ContentPublishJobPayload = {
  createdById: string;
  supabaseUserId: string;
  contentItemId: string;
  contentTitle: string;
  campaignId: string | null;
  campaignName: string | null;
  platform: string;
};

type JsonObject = Record<string, Prisma.JsonValue>;

function isJsonObject(payload: Prisma.JsonValue | null): payload is JsonObject {
  return Boolean(payload) && typeof payload === "object" && !Array.isArray(payload);
}

function getStringValue(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" && value.length > 0 ? value : null;
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
