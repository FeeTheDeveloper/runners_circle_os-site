import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "runners-circle-marketing-os",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString()
  });
}
