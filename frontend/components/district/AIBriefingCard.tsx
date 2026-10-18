"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface BriefingData {
  title: string;
  generated_at: string;
  summary: string;
  key_concerns: string[];
  recommended_directives: string[];
}

export function AIBriefingCard() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/district-briefing", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error("Failed to load briefing", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  return (
    <Card className="border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg text-white">
                {briefing?.title || "District AI Morning Situation Report (SitRep)"}
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Gemini synthesis of 8 facilities across Wardha and Yavatmal
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchBriefing}
            disabled={isLoading}
            className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            {isLoading ? "Synthesizing..." : "Refresh SitRep"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs sm:text-sm">
        {isLoading && !briefing ? (
          <LoadingSpinner label="Gemini AI analyzing cross-facility stock, bed occupancy, and attendance telemetry..." />
        ) : briefing ? (
          <>
            <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {briefing.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Concerns */}
              <div className="space-y-2 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <h4 className="font-bold text-rose-200 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-rose-400" aria-hidden="true" />
                  Critical Bottlenecks & Hazards
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {briefing.key_concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Directives */}
              <div className="space-y-2 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Recommended DHO Administrative Orders
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {briefing.recommended_directives.map((directive, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{directive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
