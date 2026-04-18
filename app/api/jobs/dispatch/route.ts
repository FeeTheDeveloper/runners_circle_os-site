import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";
import { dispatchQueuedJobs } from "@/lib/jobs/dispatcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, error: string) {
  return NextResponse.json(
    {
      ok: false,
      dispatched: 0,
      error
    },
    { status }
  );
}

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse(401, "Authentication required.");
  }

  if (!["ADMIN", "OPERATOR"].includes(user.role)) {
    return errorResponse(403, "You are not authorized to trigger job dispatch.");
  }

  if (!isDatabaseConfigured()) {
    return errorResponse(503, "DATABASE_URL is not configured for job dispatch.");
  }

  try {
    const dispatched = await dispatchQueuedJobs();

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    revalidatePath("/content");

    return NextResponse.json({
      ok: true,
      dispatched
    });
  } catch (error) {
    return errorResponse(
      500,
      error instanceof Error ? error.message : "Job dispatch failed."
    );
  }
}
