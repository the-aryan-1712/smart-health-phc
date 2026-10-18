import { NextResponse } from "next/server";
import { INVENTORY } from "@/data/seed";
import { enrichMedicine } from "@/lib/burnRate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facility_id");

  if (facilityId) {
    const inv = INVENTORY.find((i) => i.facilityId === facilityId);
    if (!inv) {
      return NextResponse.json({ detail: "Facility not found" }, { status: 404 });
    }
    const enriched = inv.medicines.map(enrichMedicine);
    return NextResponse.json({
      facilityId,
      lastUpdated: inv.lastUpdated,
      medicines: enriched,
    });
  }

  // All inventories enriched
  const all = INVENTORY.map((inv) => ({
    ...inv,
    medicines: inv.medicines.map(enrichMedicine),
  }));

  return NextResponse.json(all);
}
