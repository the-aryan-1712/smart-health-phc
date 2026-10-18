import { NextResponse } from "next/server";
import { BEDS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facility_id");

  if (facilityId) {
    const facilityBeds = BEDS.filter((b) => b.facilityId === facilityId);
    return NextResponse.json(facilityBeds);
  }

  return NextResponse.json(BEDS);
}
