"use client";

import React from "react";
import { AlertCircle, ShieldAlert, Sparkles, UserX } from "lucide-react";
import type { StaffMember } from "@/types/staff";
import { Button } from "@/components/ui/button";

interface AbsenceAlertBannerProps {
  absentStaff: StaffMember[];
  onDraftIncident: (member: StaffMember) => void;
}

export function AbsenceAlertBanner({
  absentStaff,
  onDraftIncident,
}: AbsenceAlertBannerProps) {
  if (absentStaff.length === 0) return null;

  const doctorsAbsent = absentStaff.filter((s) =>
    s.role.toLowerCase().includes("officer")
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/50 p-4 sm:p-5 shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-rose-200 text-sm sm:text-base">
                Unannounced Staff Absence Alert
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                {absentStaff.length} {absentStaff.length === 1 ? "Duty Vacant" : "Duties Vacant"}
              </span>
            </div>

            <p className="text-xs text-rose-300/80 mt-1">
              The 30-minute shift grace period has passed without check-in.
              {doctorsAbsent.length > 0 && (
                <strong className="text-rose-200 ml-1">
                  Warning: {doctorsAbsent.length} Medical Officer absent without leave.
                </strong>
              )}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {absentStaff.map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-rose-500/40 text-xs text-rose-200"
                >
                  <UserX className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                  <span className="font-semibold text-white">{member.name}</span>
                  <span className="text-rose-300 font-medium">({member.role})</span>
                  <button
                    type="button"
                    onClick={() => onDraftIncident(member)}
                    className="ml-1 text-emerald-400 hover:text-emerald-300 underline font-medium text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                  >
                    Draft Incident
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDraftIncident(absentStaff[0])}
          className="shrink-0 self-start sm:self-center"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          <span>AI Incident Report</span>
        </Button>
      </div>
    </div>
  );
}
