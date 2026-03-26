import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getDatabaseStatus() {
  if (!isDatabaseConfigured()) {
    return {
      configured: false,
      status: "missing" as const
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      configured: true,
      status: "reachable" as const
    };
  } catch {
    return {
      configured: true,
      status: "unreachable" as const
    };
  }
}

export async function GET() {
  const database = await getDatabaseStatus();

  return NextResponse.json({
    status: database.status === "unreachable" ? "degraded" : "ok",
    service: "runners-circle-marketing-os",
    environment: process.env.NODE_ENV ?? "development",
    vercelEnv: process.env.VERCEL_ENV ?? "local",
    database,
    timestamp: new Date().toISOString()
  });
}
