"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, Bell, Clock, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AlertItem {
  id: string;
  type: "supply" | "patient" | "bed" | "staff";
  severity: "critical" | "warning" | "info";
  facilityName: string;
  message: string;
  time: string;
}

interface AlertFeedProps {
  alerts: AlertItem[];
}

export function AlertFeed({ alerts }: AlertFeedProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.severity === filter;
  });

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <CardTitle className="text-base text-white">Live District Event Telemetry</CardTitle>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            {(["all", "critical", "warning"] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilter(sev)}
                className={`px-2 py-0.5 rounded font-semibold capitalize transition-colors ${
                  filter === sev
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        <div
          role="region"
          aria-live="polite"
          aria-label="District Live Alerts Feed"
          className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1"
        >
          {filtered.map((alert) => {
            const isCritical = alert.severity === "critical";

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                  isCritical
                    ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isCritical
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                  aria-hidden="true"
                >
                  {isCritical ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      {alert.facilityName}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
