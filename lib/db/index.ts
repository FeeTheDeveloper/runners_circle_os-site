import "server-only";

export { prisma } from "@/lib/db/prisma";
export { isDatabaseConfigured, normalizeDatabaseError, runReadQuery } from "@/lib/db/runtime";
export type { DataSource } from "@/lib/db/runtime";

export { prisma as db } from "@/lib/db/prisma";
