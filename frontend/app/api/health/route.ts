import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "smart-health-nextjs",
    timestamp: new Date().toISOString(),
  });
}
