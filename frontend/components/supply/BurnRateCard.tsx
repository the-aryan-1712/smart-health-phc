import React from "react";
import { Flame, Clock, TrendingDown, PackageCheck } from "lucide-react";
import type { MedicineWithMetrics } from "@/types/supply";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { formatDTS } from "@/lib/burnRate";

interface BurnRateCardProps {
  medicine: MedicineWithMetrics;
  onReorderClick?: (medicine: MedicineWithMetrics) => void;
}

export function BurnRateCard({ medicine, onReorderClick }: BurnRateCardProps) {
  const isCritical = medicine.status === "critical";
  const isLow = medicine.status === "low";

  return (
    <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700/80 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              {medicine.category}
            </span>
            <CardTitle className="text-base text-white">{medicine.name}</CardTitle>
          </div>
          <SeverityBadge severity={medicine.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Burn Rate</span>
            </div>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {medicine.burnRate.toFixed(1)}{" "}
              <span className="text-xs font-normal text-slate-400">/ day</span>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Days Left (DTS)</span>
            </div>
            <p
              className={`text-base font-bold font-mono mt-0.5 ${
                isCritical
                  ? "text-rose-400"
                  : isLow
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {formatDTS(medicine.daysToStockout)}{" "}
              <span className="text-xs font-normal text-slate-400">days</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            On hand:{" "}
            <strong className="text-slate-200">
              {medicine.currentStock} {medicine.unit}
            </strong>
          </span>
          <span>
            Threshold:{" "}
            <strong className="text-slate-300">
              {medicine.minimumThreshold} {medicine.unit}
            </strong>
          </span>
        </div>

        {onReorderClick && (
          <button
            type="button"
            onClick={() => onReorderClick(medicine)}
            className="w-full mt-2 py-1.5 px-3 rounded-md text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Generate Reorder</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
