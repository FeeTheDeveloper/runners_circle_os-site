import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ingestPublicSubmission } from "@/lib/public-intake/ingestion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const result = await ingestPublicSubmission(request, "onboarding");

  return NextResponse.json(result.body, { status: result.status });
}
