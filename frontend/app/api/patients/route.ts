import { NextResponse } from "next/server";
import { PATIENTS } from "@/data/seed";
import { tokenFromNumber, calculateEstimatedWait } from "@/lib/triage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facility_id");

  if (facilityId) {
    const list = PATIENTS.filter((p) => p.facilityId === facilityId);
    return NextResponse.json(list);
  }

  return NextResponse.json(PATIENTS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = tokenFromNumber(Math.floor(Math.random() * 900) + 100);
    const newPatient = {
      id: `p-${Date.now()}`,
      token,
      name: body.name || "Anonymous",
      age: body.age || 30,
      gender: body.gender || "Other",
      symptoms: body.symptoms || "",
      arrivalTime: new Date().toISOString(),
      facilityId: body.facilityId || "phc-wardha-sindi",
      status: "waiting",
      priority: body.priority || "P3",
      urgencyLabel: body.urgencyLabel || "Semi-urgent",
      chiefComplaint: body.chiefComplaint || body.symptoms,
      recommendedAction: body.recommendedAction || "Awaiting doctor consultation",
      estimatedWaitMinutes: calculateEstimatedWait(body.priority || "P3", 3),
    };

    return NextResponse.json(newPatient, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
