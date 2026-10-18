import React from "react";
import { Calendar, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import type { RosterEntry, StaffMember } from "@/types/staff";
import { formatShiftTime } from "@/lib/attendance";

interface RosterCalendarProps {
  roster: RosterEntry[];
  staff: StaffMember[];
}

export function RosterCalendar({ roster, staff }: RosterCalendarProps) {
  const staffMap = new Map(staff.map((s) => [s.id, s]));

  const shifts: { key: RosterEntry["shift"]; label: string; time: string }[] = [
    { key: "morning", label: "Morning Shift", time: "08:00 - 16:00" },
    { key: "afternoon", label: "Evening / Afternoon", time: "16:00 - 24:00" },
    { key: "night", label: "Night Shift", time: "00:00 - 08:00" },
    { key: "duty", label: "24h Emergency On-Call Duty", time: "Rotational" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map((sh) => {
          const shiftEntries = roster.filter((r) => r.shift === sh.key);

          return (
            <div
              key={sh.key}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3"
            >
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <h4 className="font-bold text-white text-sm">{sh.label}</h4>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                    {sh.time}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
                  {shiftEntries.length} on roster
                </span>
              </div>

              <div className="space-y-2">
                {shiftEntries.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No staff assigned for this slot
                  </p>
                ) : (
                  shiftEntries.map((entry) => {
                    const member = staffMap.get(entry.staffId);
                    if (!member) return null;
                    const isPresent = entry.status === "present";

                    return (
                      <div
                        key={entry.staffId}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isPresent
                            ? "bg-slate-950/70 border-emerald-500/30"
                            : "bg-rose-950/20 border-rose-500/30"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {member.role}
                          </div>
                        </div>

                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            isPresent
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          ) : (
                            <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          )}
                          {entry.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
