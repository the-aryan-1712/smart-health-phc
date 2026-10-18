"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldAlert, Check, FileText, Send } from "lucide-react";
import type { StaffMember, IncidentReport } from "@/types/staff";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface IncidentReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember | null;
  facilityName: string;
  facilityId: string;
  onReportSaved: (report: IncidentReport) => void;
}

export function IncidentReportModal({
  open,
  onOpenChange,
  staffMember,
  facilityName,
  facilityId,
  onReportSaved,
}: IncidentReportModalProps) {
  if (!staffMember) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Generate Gemini Incident Report when modal opens
  useEffect(() => {
    if (!open || !staffMember) {
      setReport(null);
      setIsSaved(false);
      return;
    }

    const currentMember = staffMember;
    let isMounted = true;
    async function draftReport() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/ai/incident-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facility_id: facilityId,
            facility_name: facilityName,
            staff_name: currentMember.name,
            staff_role: currentMember.role,
            shift_start: "08:00 AM",
            incident_type: "unannounced_absence",
            additional_context: `Staff member employee ID ${currentMember.employeeId} has not checked in for their scheduled shift. 30-minute grace period expired.`,
          }),
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          setReport({
            incidentId: data.incident_id,
            facilityId: data.facility_id,
            staffName: data.staff_name,
            severity: data.severity,
            summary: data.summary,
            recommendedAction: data.recommended_action,
            escalateToDistrict: data.escalate_to_district,
            generatedAt: data.generated_at,
          });
        }
      } catch (err) {
        console.error("Failed to draft incident report", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    draftReport();

    return () => {
      isMounted = false;
    };
  }, [open, staffMember, facilityId, facilityName]);

  const handleSave = () => {
    if (report) {
      onReportSaved(report);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onOpenChange(false);
      }, 1200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <DialogTitle>Staff Attendance Incident Report</DialogTitle>
            <DialogDescription>
              Gemini-drafted official incident documentation for {staffMember.name}.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {isLoading ? (
        <div className="py-8">
          <LoadingSpinner label="Gemini AI drafting formal administrative report & assessing district impact..." />
        </div>
      ) : isSaved ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" aria-hidden="true" />
          </div>
          <h4 className="text-lg font-semibold text-white">Incident Report Filed</h4>
          <p className="text-xs text-slate-400">
            Recorded in district audit registry and transmitted to District Health Office (DHO).
          </p>
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Incident Reference: </span>
              <strong className="font-mono text-white">{report.incidentId}</strong>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[11px] ${
                report.severity === "high"
                  ? "bg-rose-950 text-rose-300 border border-rose-500/50"
                  : "bg-amber-950 text-amber-300 border border-amber-500/50"
              }`}
            >
              Severity: {report.severity}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Executive Administrative Summary
            </label>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {report.summary}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-emerald-300">
              Recommended Remediation & Clinical Action
            </label>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200/90 leading-relaxed">
              {report.recommendedAction}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <input
              type="checkbox"
              id="escalate-dho"
              checked={report.escalateToDistrict}
              onChange={(e) =>
                setReport({ ...report, escalateToDistrict: e.target.checked })
              }
              className="accent-emerald-500 w-4 h-4 rounded"
            />
            <label htmlFor="escalate-dho" className="cursor-pointer font-medium">
              Escalate directly to Chief Medical Officer (CMO / DHO Wardha) for urgent relief deployment
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-rose-600 hover:bg-rose-500 text-white">
              <Send className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              File & Transmit Report
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
