import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  label = "Loading healthcare data...",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-3 p-6 text-slate-400 ${className}`}
    >
      <Loader2
        className={`animate-spin text-emerald-400 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{label}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
