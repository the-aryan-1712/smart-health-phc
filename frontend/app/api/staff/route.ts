import { NextResponse } from "next/server";
import { STAFF } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facility_id");

  if (facilityId) {
    const list = STAFF.filter((s) => s.facilityId === facilityId);
    return NextResponse.json(list);
  }

  return NextResponse.json(STAFF);
}
