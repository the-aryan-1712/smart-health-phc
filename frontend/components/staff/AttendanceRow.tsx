"use client";

import React from "react";
import { UserCheck, UserX, Phone, Clock, Shield } from "lucide-react";
import type { StaffMember } from "@/types/staff";
import { Button } from "@/components/ui/button";

interface AttendanceRowProps {
  member: StaffMember;
  onToggleCheckin: (staffId: string) => void;
  onDraftIncident?: (member: StaffMember) => void;
}

export function AttendanceRow({
  member,
  onToggleCheckin,
  onDraftIncident,
}: AttendanceRowProps) {
  const isCheckedIn = member.isCheckedIn;
  const isDoctor = member.role.toLowerCase().includes("officer");

  const formattedTime = member.checkinTime
    ? new Date(member.checkinTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
        isCheckedIn
          ? "bg-slate-900/60 border-slate-800"
          : "bg-rose-950/20 border-rose-500/30"
      }`}
    >
      {/* Staff Demographics */}
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl border ${
            isCheckedIn
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
          aria-hidden="true"
        >
          {isCheckedIn ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm sm:text-base">{member.name}</h4>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDoctor
                  ? "bg-purple-950/70 text-purple-300 border-purple-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {member.role}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="font-mono">ID: {member.employeeId}</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" aria-hidden="true" />
              {member.phone}
            </span>
            {isCheckedIn && formattedTime && (
              <span className="flex items-center gap-1 text-emerald-300 font-mono">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Punched In: {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {!isCheckedIn && onDraftIncident && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDraftIncident(member)}
            className="text-xs h-8 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-500/30"
          >
            <Shield className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Report Absence
          </Button>
        )}

        <Button
          size="sm"
          variant={isCheckedIn ? "outline" : "default"}
          onClick={() => onToggleCheckin(member.id)}
          className={`text-xs h-8 ${
            isCheckedIn
              ? "border-slate-700 text-slate-300 hover:text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {isCheckedIn ? "Mark Check-Out" : "Punched Present"}
        </Button>
      </div>
    </div>
  );
}
