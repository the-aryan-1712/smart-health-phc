import { NextResponse } from "next/server";
import { FACILITIES, INVENTORY, BEDS, STAFF } from "@/data/seed";
import { enrichMedicine } from "@/lib/burnRate";

const FASTAPI_URL = process.env.FASTAPI_INTERNAL_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST() {
  try {
    // Tally current district metrics
    let totalCritMedicines = 0;
    let totalOccBeds = 0;
    let totalBeds = 0;
    let totalIcuOcc = 0;
    let totalIcu = 0;
    let absentDoctors = 0;

    INVENTORY.forEach((inv) => {
      inv.medicines.forEach((m) => {
        if (enrichMedicine(m).status === "critical") totalCritMedicines++;
      });
    });

    BEDS.forEach((b) => {
      totalBeds++;
      if (b.status === "occupied") totalOccBeds++;
      if (b.type === "icu") {
        totalIcu++;
        if (b.status === "occupied") totalIcuOcc++;
      }
    });

    STAFF.forEach((s) => {
      if (!s.isCheckedIn && s.role.toLowerCase().includes("officer")) absentDoctors++;
    });

    // Fallback briefing text synthesized with actual seed telemetry
    const defaultBriefing = {
      title: "District Health Operational Briefing — Wardha & Yavatmal",
      generated_at: new Date().toISOString(),
      summary: `Late monsoon diarrheal and febrile illness patterns continue to exert sustained pressure on primary facilities. A total of ${totalCritMedicines} medicine line items across Wardha and Yavatmal are currently at or below critical stock cover (≤3 days buffer), with ORS sachets and maternal oxytocin requiring prioritized re-routing from Central Medical Stores.`,
      key_concerns: [
        `ICU Capacity Constrained: CHC Wardha Central ICU is operating at ${Math.round((totalIcuOcc / (totalIcu || 1)) * 100)}% capacity (${totalIcuOcc}/${totalIcu} beds occupied). Secondary ventilator transfers from rural PHCs must be coordinated with CHC Yavatmal Urban.`,
        `Staffing Vulnerability: ${absentDoctors} Medical Officer duties are unfulfilled without prior leave sanction, affecting primary outpatient diagnostic throughput at rural PHCs.`,
        `Supply Chain Velocity: Accelerated consumption of antipyretics and broad-spectrum antibiotics requires emergency dispatch authorizations for PHC Sindi and PHC Ner.`,
      ],
      recommended_directives: [
        "Issue immediate bulk redistribution order of 500 ORS sachets and 40 vials of Amoxicillin from Wardha Central warehouse to peripheral PHCs.",
        "Deploy mobile AYUSH Medical Officer from Hinganghat reserve to cover PHC Ner morning clinic.",
        "Maintain CHC Yavatmal Urban ICU Ward on stand-by alert for cross-district tertiary transfers.",
      ],
    };

    return NextResponse.json(defaultBriefing);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
