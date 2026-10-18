"use client";

import React, { useState } from "react";
import { Bed as BedIcon, Filter, AlertCircle, Wrench, CheckCircle2, User } from "lucide-react";
import type { Bed, BedStatus, BedType } from "@/types/bed";
import { Badge } from "@/components/ui/badge";

interface BedGridProps {
  beds: Bed[];
  onBedClick: (bed: Bed) => void;
}

export function BedGrid({ beds, onBedClick }: BedGridProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | BedType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BedStatus>("all");

  const filtered = beds.filter((b) => {
    const matchesType = typeFilter === "all" || b.type === typeFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Bed Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Type:</span>
          {(["all", "icu", "general", "oxygen"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              aria-pressed={typeFilter === t}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors uppercase ${
                typeFilter === t
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800"
              }`}
            >
              {t === "all" ? "All Wards" : t}
            </button>
          ))}
        </div>

        {/* Bed Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
          {(["all", "available", "occupied", "maintenance"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors capitalize ${
                statusFilter === s
                  ? s === "available"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-500/50"
                    : s === "occupied"
                    ? "bg-rose-950 text-rose-200 border border-rose-500/50"
                    : s === "maintenance"
                    ? "bg-amber-950 text-amber-200 border border-amber-500/50"
                    : "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Bed Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
          <h4 className="text-base font-semibold text-slate-300">No beds found</h4>
          <p className="text-xs text-slate-500">
            No beds matched the selected ward or status filter.
          </p>
        </div>
      ) : (
        <div
          role="grid"
          aria-label="Ward Bed Availability Matrix"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {filtered.map((bed) => {
            const isAvailable = bed.status === "available";
            const isOccupied = bed.status === "occupied";
            const isMaintenance = bed.status === "maintenance";

            const cellLabel = `Bed ${bed.bedNumber}, ${bed.type.toUpperCase()} Ward, Status: ${bed.status}${
              bed.patientName ? `, Admitted to: ${bed.patientName}` : ""
            }. Press enter to change status.`;

            return (
              <button
                key={bed.id}
                role="gridcell"
                type="button"
                aria-label={cellLabel}
                onClick={() => onBedClick(bed)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isAvailable
                    ? "bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400"
                    : isOccupied
                    ? "bg-rose-950/30 border-rose-500/40 hover:border-rose-400"
                    : "bg-amber-950/30 border-amber-500/40 hover:border-amber-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs uppercase font-extrabold px-1.5 py-0.5 rounded ${
                        bed.type === "icu"
                          ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-mono"
                          : bed.type === "oxygen"
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {bed.type}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable
                          ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                          : isOccupied
                          ? "bg-rose-400 shadow-[0_0_8px_#f87171]"
                          : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="font-mono text-xl font-black text-white">
                    #{bed.bedNumber}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                    {isAvailable && (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Available
                      </span>
                    )}
                    {isOccupied && (
                      <span className="text-rose-300 flex items-center gap-1 truncate">
                        <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{bed.patientName || "Occupied"}</span>
                      </span>
                    )}
                    {isMaintenance && (
                      <span className="text-amber-300 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                        Maintenance
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
