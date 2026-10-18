"use client";

import React from "react";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { MedicineWithMetrics } from "@/types/supply";
import { Button } from "@/components/ui/button";

interface StockAlertBannerProps {
  criticalItems: MedicineWithMetrics[];
  onReorderClick?: (item: MedicineWithMetrics) => void;
}

export function StockAlertBanner({
  criticalItems,
  onReorderClick,
}: StockAlertBannerProps) {
  if (criticalItems.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/40 p-4 sm:p-5 shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-rose-200 text-sm sm:text-base">
                Critical Stock Depletion Alert
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                {criticalItems.length} {criticalItems.length === 1 ? "Item" : "Items"}
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-1">
              Immediate supply intervention required: The following essential medicines have &le; 3 days of stock remaining:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {criticalItems.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-rose-500/30 text-xs text-rose-200"
                >
                  <span className="font-medium text-white">{item.name}</span>
                  <span className="text-rose-400 font-mono">
                    ({item.currentStock} {item.unit} left • ~{Math.round(item.daysToStockout)}d)
                  </span>
                  {onReorderClick && (
                    <button
                      type="button"
                      onClick={() => onReorderClick(item)}
                      className="ml-1 text-emerald-400 hover:text-emerald-300 hover:underline font-medium text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                    >
                      Restock
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {onReorderClick && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReorderClick(criticalItems[0])}
            className="shrink-0 self-start sm:self-center"
          >
            <span>Emergency PO</span>
            <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
