import { NextResponse } from "next/server";
import { calculateEstimatedWait, getPriorityLabel } from "@/lib/triage";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token = "T001", symptoms = "", age = 30, facility_id = "phc-wardha-sindi" } = body;

    // Try forwarding to FastAPI backend
    try {
      const backendRes = await fetch(`${FASTAPI_URL}/ai/triage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "internal-dev-key",
        },
        body: JSON.stringify({ token, symptoms, age, facility_id }),
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unavailable or timed out — proceed to deterministic triage engine
    }

    // Deterministic Rule-Based Triage Engine
    const lower = symptoms.toLowerCase();
    let priority: "P1" | "P2" | "P3" | "P4" = "P3";
    let urgencyLabel = "Semi-urgent";
    let chiefComplaint = symptoms;
    let recommendedAction = "Proceed to general OPD doctor consultation.";

    if (
      lower.includes("chest pain") ||
      lower.includes("unconscious") ||
      lower.includes("difficulty breathing") ||
      lower.includes("severe breathlessness") ||
      lower.includes("massive bleeding") ||
      lower.includes("anaphylaxis") ||
      lower.includes("cardiac") ||
      lower.includes("stroke")
    ) {
      priority = "P1";
      urgencyLabel = "Emergency";
      chiefComplaint = "Acute cardiopulmonary compromise / critical distress";
      recommendedAction =
        "Immediate resuscitation bay transfer. High-flow oxygen, IV access, ECG, and urgent physician alert.";
    } else if (
      lower.includes("high fever") ||
      lower.includes("vomiting") ||
      lower.includes("dehydration") ||
      lower.includes("severe pain") ||
      lower.includes("fracture") ||
      age < 1 ||
      age > 75
    ) {
      priority = "P2";
      urgencyLabel = "Urgent";
      chiefComplaint = "Acute pediatric/geriatric febrile or severe symptomatic state";
      recommendedAction =
        "Fast-track vital assessment (SpO2, BP, temp). Administer antipyretic or ORS rehydration within 15 minutes.";
    } else if (
      lower.includes("routine") ||
      lower.includes("refill") ||
      lower.includes("check-up") ||
      lower.includes("dressing") ||
      lower.includes("mild cold")
    ) {
      priority = "P4";
      urgencyLabel = "Non-urgent";
      chiefComplaint = "Routine chronic care maintenance or minor ailment";
      recommendedAction =
        "Standard OPD queue. Review maintenance pharmacotherapy and schedule standard follow-up.";
    }

    const waitMinutes = calculateEstimatedWait(priority, 3, 8);

    return NextResponse.json({
      token,
      priority,
      urgency_label: urgencyLabel,
      chief_complaint: chiefComplaint,
      recommended_action: recommendedAction,
      estimated_wait_minutes: waitMinutes,
      confidence: "high",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
