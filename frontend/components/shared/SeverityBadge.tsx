import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Severity = "ok" | "low" | "critical" | "warning";

interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
}

export function SeverityBadge({ severity, label, className }: SeverityBadgeProps) {
  if (severity === "critical") {
    return (
      <Badge variant="critical" className={className}>
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label || "Critical"}</span>
      </Badge>
    );
  }

  if (severity === "low" || severity === "warning") {
    return (
      <Badge variant="low" className={className}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label || (severity === "low" ? "Low Stock" : "Warning")}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="ok" className={className}>
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label || "Normal / OK"}</span>
    </Badge>
  );
}
