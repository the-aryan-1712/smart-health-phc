import React from "react";
import { Clock } from "lucide-react";

interface WaitTimeBadgeProps {
  minutes: number;
  className?: string;
}

export function WaitTimeBadge({ minutes, className = "" }: WaitTimeBadgeProps) {
  let colorClass = "bg-emerald-950/70 text-emerald-300 border-emerald-500/40";
  let label = `${minutes} min wait`;

  if (minutes === 0) {
    colorClass = "bg-red-950/90 text-red-300 border-red-500/50 font-bold animate-pulse";
    label = "Immediate (0m)";
  } else if (minutes > 45) {
    colorClass = "bg-rose-950/60 text-rose-300 border-rose-500/40";
    label = `~${minutes} min wait (high)`;
  } else if (minutes > 20) {
    colorClass = "bg-amber-950/60 text-amber-300 border-amber-500/40";
    label = `~${minutes} min wait`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${colorClass} ${className}`}
      aria-label={`Estimated wait time: ${label}`}
    >
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
