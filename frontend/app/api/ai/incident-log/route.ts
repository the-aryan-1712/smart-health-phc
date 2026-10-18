import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_INTERNAL_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      facility_id = "phc-wardha-sindi",
      facility_name = "PHC Sindi",
      staff_name = "Healthcare Worker",
      staff_role = "Staff",
      shift_start = "08:00",
      incident_type = "unannounced_absence",
      additional_context = "",
    } = body;

    // Try forwarding to FastAPI backend
    try {
      const backendRes = await fetch(`${FASTAPI_URL}/ai/incident-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "internal-dev-key",
        },
        body: JSON.stringify({
          facility_id,
          facility_name,
          staff_name,
          staff_role,
          shift_start,
          incident_type,
          additional_context,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unavailable or timed out — deterministic fallback
    }

    const isDoctor = staff_role.toLowerCase().includes("officer") || staff_role.toLowerCase().includes("doctor");
    const severity: "high" | "medium" | "low" = isDoctor ? "high" : "medium";
    const escalate = isDoctor || incident_type === "unannounced_absence";

    return NextResponse.json({
      incident_id: `INC-${facility_id.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      facility_id,
      staff_name,
      severity,
      summary: `Unannounced absence recorded for ${staff_role} ${staff_name} at ${facility_name}. Shift was scheduled for ${shift_start} with no prior leave application or attendance punch after 30-minute grace period.`,
      recommended_action: isDoctor
        ? "Urgent: Deploy on-call relief Medical Officer from District Reserve Pool immediately to prevent complete OPD shutdown. Issue official explanation notice within 24 hours."
        : "Reassign ward duties to senior staff nurse on shift. Mark unexcused absence in district HR portal pending formal medical certificate.",
      escalate_to_district: escalate,
      generated_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
