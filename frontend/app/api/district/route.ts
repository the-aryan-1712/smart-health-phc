import { NextResponse } from "next/server";
import { FACILITIES, INVENTORY, BEDS, STAFF, PATIENTS } from "@/data/seed";
import { enrichMedicine } from "@/lib/burnRate";

export async function GET() {
  const summary = FACILITIES.map((f) => {
    const inv = INVENTORY.find((i) => i.facilityId === f.id);
    const criticalMedCount = (inv?.medicines || [])
      .map(enrichMedicine)
      .filter((m) => m.status === "critical").length;

    const facilityBeds = BEDS.filter((b) => b.facilityId === f.id);
    const occupied = facilityBeds.filter((b) => b.status === "occupied").length;

    const facilityStaff = STAFF.filter((s) => s.facilityId === f.id);
    const presentStaff = facilityStaff.filter((s) => s.isCheckedIn).length;

    const waitingPatients = PATIENTS.filter(
      (p) => p.facilityId === f.id && p.status === "waiting"
    ).length;

    return {
      facilityId: f.id,
      name: f.name,
      type: f.type,
      district: f.district,
      location: f.location,
      criticalMedicines: criticalMedCount,
      totalBeds: facilityBeds.length,
      occupiedBeds: occupied,
      occupancyRate: facilityBeds.length > 0 ? occupied / facilityBeds.length : 0,
      totalStaff: facilityStaff.length,
      presentStaff,
      attendanceRate: facilityStaff.length > 0 ? presentStaff / facilityStaff.length : 1,
      waitingPatients,
    };
  });

  return NextResponse.json(summary);
}
