import React from "react";
import { Bed, AlertTriangle } from "lucide-react";

interface OccupancyMeterProps {
  label: string;
  occupied: number;
  total: number;
  type?: "icu" | "general" | "oxygen" | "total";
  className?: string;
}

export function OccupancyMeter({
  label,
  occupied,
  total,
  type = "total",
  className = "",
}: OccupancyMeterProps) {
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const isCritical = percentage >= 85;
  const isWarning = percentage >= 70 && percentage < 85;

  const barColor = isCritical
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-emerald-500";

  return (
    <div className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bed className={`w-4 h-4 ${isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`} aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-white">
            {occupied}/{total}
          </span>
          <span className={`text-xs font-bold font-mono ${isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`}>
            ({percentage}%)
          </span>
        </div>
      </div>

      {/* Accessible Progress Meter */}
      <div
        role="meter"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} occupancy: ${occupied} of ${total} beds occupied (${percentage}%)`}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800"
      >
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span>{total - occupied} beds free</span>
        {isCritical && (
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            Critical Capacity
          </span>
        )}
      </div>
    </div>
  );
}
