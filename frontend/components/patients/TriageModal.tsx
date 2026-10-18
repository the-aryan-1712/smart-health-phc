"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  UserPlus,
  ShieldAlert,
  HeartPulse,
  Activity,
  AlertTriangle,
  Check,
} from "lucide-react";
import type { Patient, TriagePriority } from "@/types/patient";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getPriorityLabel } from "@/lib/triage";

interface TriageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  existingPatient?: Patient | null;
  onPatientSaved: (
    patientData: Pick<Patient, "name" | "age" | "gender" | "symptoms" | "facilityId"> & {
      priority: TriagePriority;
      urgencyLabel: string;
      chiefComplaint: string;
      recommendedAction: string;
    }
  ) => void;
}

export function TriageModal({
  open,
  onOpenChange,
  facilityId,
  existingPatient,
  onPatientSaved,
}: TriageModalProps) {
  const [name, setName] = useState(existingPatient?.name || "");
  const [age, setAge] = useState<number>(existingPatient?.age || 35);
  const [gender, setGender] = useState<"M" | "F" | "Other">(existingPatient?.gender || "F");
  const [symptoms, setSymptoms] = useState(existingPatient?.symptoms || "");

  // AI Triage State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    priority: TriagePriority;
    urgencyLabel: string;
    chiefComplaint: string;
    recommendedAction: string;
    estimatedWaitMinutes?: number;
  } | null>(null);

  // Sync state if editing
  useEffect(() => {
    if (existingPatient) {
      setName(existingPatient.name);
      setAge(existingPatient.age);
      setGender(existingPatient.gender);
      setSymptoms(existingPatient.symptoms);
      setTriageResult({
        priority: existingPatient.priority || "P3",
        urgencyLabel: existingPatient.urgencyLabel || "Semi-urgent",
        chiefComplaint: existingPatient.chiefComplaint || existingPatient.symptoms,
        recommendedAction: existingPatient.recommendedAction || "Awaiting doctor consultation.",
        estimatedWaitMinutes: existingPatient.estimatedWaitMinutes,
      });
    } else {
      setName("");
      setAge(30);
      setGender("F");
      setSymptoms("");
      setTriageResult(null);
    }
  }, [existingPatient, open]);

  // Run AI Triage
  const handleRunTriage = async () => {
    if (!symptoms.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: existingPatient?.token || "T-NEW",
          symptoms,
          age,
          facility_id: facilityId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTriageResult({
          priority: data.priority as TriagePriority,
          urgencyLabel: data.urgency_label || getPriorityLabel(data.priority),
          chiefComplaint: data.chief_complaint || symptoms,
          recommendedAction: data.recommended_action || "Standard OPD consultation.",
          estimatedWaitMinutes: data.estimated_wait_minutes,
        });
      } else {
        // Fallback rule-based triage
        const lower = symptoms.toLowerCase();
        let priority: TriagePriority = "P3";
        let urgency = "Semi-urgent";
        let protocol = "Routine doctor consultation.";

        if (
          lower.includes("chest pain") ||
          lower.includes("unconscious") ||
          lower.includes("difficulty breathing") ||
          lower.includes("choking") ||
          lower.includes("severe bleeding")
        ) {
          priority = "P1";
          urgency = "Emergency";
          protocol = "Immediate resuscitation & doctor notification. High-flow O2.";
        } else if (
          lower.includes("high fever") ||
          lower.includes("vomiting") ||
          lower.includes("severe pain") ||
          age < 1 ||
          age > 75
        ) {
          priority = "P2";
          urgency = "Urgent";
          protocol = "Fast-track assessment; check vitals and blood glucose.";
        } else if (lower.includes("routine") || lower.includes("refill") || lower.includes("check-up")) {
          priority = "P4";
          urgency = "Non-urgent";
          protocol = "Standard OPD queue.";
        }

        setTriageResult({
          priority,
          urgencyLabel: urgency,
          chiefComplaint: symptoms,
          recommendedAction: protocol,
        });
      }
    } catch {
      // Deterministic triage on network error
      setTriageResult({
        priority: "P3",
        urgencyLabel: "Semi-urgent",
        chiefComplaint: symptoms,
        recommendedAction: "Standard OPD queue assessment.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symptoms.trim()) return;

    const assigned = triageResult || {
      priority: "P3" as TriagePriority,
      urgencyLabel: "Semi-urgent",
      chiefComplaint: symptoms,
      recommendedAction: "Standard clinical evaluation.",
    };

    onPatientSaved({
      name,
      age: Number(age),
      gender,
      symptoms,
      facilityId,
      priority: assigned.priority,
      urgencyLabel: assigned.urgencyLabel,
      chiefComplaint: assigned.chiefComplaint,
      recommendedAction: assigned.recommendedAction,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <HeartPulse className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <DialogTitle>
              {existingPatient ? `Re-Triage ${existingPatient.token}` : "Patient Intake & AI Triage"}
            </DialogTitle>
            <DialogDescription>
              Assign clinical priority via Gemini Flash structured evaluation.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="patient-name" className="block text-xs font-medium text-slate-300">
              Patient Full Name *
            </label>
            <input
              id="patient-name"
              type="text"
              required
              placeholder="e.g. Rameshwar Shinde"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="patient-age" className="block text-xs font-medium text-slate-300">
              Age *
            </label>
            <input
              id="patient-age"
              type="number"
              min="0"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-300">Gender</label>
          <div className="flex gap-4 text-xs text-slate-300">
            {(["F", "M", "Other"] as const).map((g) => (
              <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="accent-emerald-500"
                />
                <span>{g === "F" ? "Female" : g === "M" ? "Male" : "Other"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Symptoms / Chief Complaint */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="patient-symptoms" className="block text-xs font-medium text-slate-300">
              Reported Symptoms & Clinical Vitals *
            </label>
            <button
              type="button"
              onClick={handleRunTriage}
              disabled={isAiLoading || !symptoms.trim()}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Evaluate with Gemini</span>
            </button>
          </div>
          <textarea
            id="patient-symptoms"
            rows={3}
            required
            placeholder="e.g. Sudden severe chest tightness radiating to jaw, profuse sweating, BP 160/100, SpO2 93%..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Clinical Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Quick preset:</span>
          {[
            { label: "Chest Pain / Dyspnea", text: "Severe crushing retrosternal chest pain, radiating to left arm, cold diaphoresis" },
            { label: "High Fever / Child", text: "8-month-old infant with high fever 39.8°C, rapid labored breathing, vomiting" },
            { label: "Routine Diabetes Check", text: "Routine type 2 diabetes follow-up, fasting glucose review, prescription renewal" },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setSymptoms(preset.text);
              }}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* AI Loading State */}
        {isAiLoading && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <LoadingSpinner label="Gemini AI evaluating severity against clinical protocols..." />
          </div>
        )}

        {/* Triage Decision Card */}
        {triageResult && !isAiLoading && (
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              triageResult.priority === "P1"
                ? "bg-red-950/40 border-red-500/50 text-red-200"
                : triageResult.priority === "P2"
                ? "bg-orange-950/40 border-orange-500/40 text-orange-200"
                : triageResult.priority === "P3"
                ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-xs uppercase tracking-wider font-bold">
                  Assigned Triage Tier:
                </span>
                <span className="font-extrabold text-sm uppercase">
                  {triageResult.priority} ({triageResult.urgencyLabel})
                </span>
              </div>

              {/* Allow Manual Staff Override */}
              <select
                value={triageResult.priority}
                onChange={(e) => {
                  const p = e.target.value as TriagePriority;
                  setTriageResult({
                    ...triageResult,
                    priority: p,
                    urgencyLabel: getPriorityLabel(p),
                  });
                }}
                aria-label="Clinical priority override"
                className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-0.5 text-white"
              >
                <option value="P1">P1 - Emergency</option>
                <option value="P2">P2 - Urgent</option>
                <option value="P3">P3 - Semi-urgent</option>
                <option value="P4">P4 - Non-urgent</option>
              </select>
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              <strong>Clinical Protocol: </strong>
              {triageResult.recommendedAction}
            </p>
          </div>
        )}

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            <UserPlus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            {existingPatient ? "Update Triage" : "Admit & Issue Token"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
