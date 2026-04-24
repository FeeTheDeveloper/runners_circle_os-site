import type { Prisma } from "@prisma/client";

type JsonObject = Record<string, Prisma.JsonValue>;

function isJsonObject(value: Prisma.JsonValue | null): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStringValue(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getJobResultDetails(result: Prisma.JsonValue | null) {
  if (!isJsonObject(result)) {
    return {
      summary: null,
      error: null,
      contentId: null,
      contentTitle: null,
      campaignId: null,
      campaignName: null,
      requestId: null,
      generatedAssetId: null,
      agentPromptId: null,
      promptTitle: null
    };
  }

  return {
    summary: typeof result.summary === "string" ? result.summary : null,
    error: typeof result.error === "string" ? result.error : null,
    contentId: getStringValue(result.contentId),
    contentTitle: getStringValue(result.contentTitle),
    campaignId: getStringValue(result.campaignId),
    campaignName: getStringValue(result.campaignName),
    requestId: getStringValue(result.requestId),
    generatedAssetId: getStringValue(result.generatedAssetId),
    agentPromptId: getStringValue(result.agentPromptId),
    promptTitle: getStringValue(result.promptTitle)
  };
}
