import "server-only";

import { Prisma } from "@prisma/client";

export type DataSource = "database" | "unavailable";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function normalizeDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A record with one of those unique values already exists.";
    }

    if (error.code === "P2003") {
      return "A related record could not be found for that operation.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}

export async function runReadQuery<T>({
  query,
  fallback
}: {
  query: () => Promise<T>;
  fallback: () => T | Promise<T>;
}): Promise<{ data: T; source: DataSource }> {
  if (!isDatabaseConfigured()) {
    return {
      data: await fallback(),
      source: "unavailable"
    };
  }

  try {
    return {
      data: await query(),
      source: "database"
    };
  } catch {
    return {
      data: await fallback(),
      source: "unavailable"
    };
  }
}
