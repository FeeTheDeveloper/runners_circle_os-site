import { NextRequest, NextResponse } from "next/server";

import { recordWebhookReceipt } from "@/lib/crm/client";

export async function POST(request: NextRequest) {
  const expectedSignature = process.env.CRM_WEBHOOK_SECRET;
  const providedSignature = request.headers.get("x-crm-signature");

  if (expectedSignature && providedSignature !== expectedSignature) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ ok: false, error: "JSON payload required." }, { status: 400 });
  }

  const receipt = await recordWebhookReceipt({
    event: typeof payload?.event === "string" ? payload.event : undefined,
    payload
  });

  return NextResponse.json({ ok: true, receipt }, { status: 202 });
}
