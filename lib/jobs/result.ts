import type { Prisma } from "@prisma/client";

type JsonObject = Record<string, Prisma.JsonValue>;

function isJsonObject(value: Prisma.JsonValue | null): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getJobResultDetails(result: Prisma.JsonValue | null) {
  if (!isJsonObject(result)) {
    return {
      summary: null,
      error: null
    };
  }

  return {
    summary: typeof result.summary === "string" ? result.summary : null,
    error: typeof result.error === "string" ? result.error : null
  };
}
