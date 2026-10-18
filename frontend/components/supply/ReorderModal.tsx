"use client";

import React, { useState } from "react";
import { Sparkles, PackagePlus, Check, AlertCircle } from "lucide-react";
import type { MedicineWithMetrics } from "@/types/supply";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { calculateReorderQuantity } from "@/lib/burnRate";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ReorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: MedicineWithMetrics | null;
  facilityId: string;
  onReorderSubmitted: (facilityId: string, medicineId: string, quantity: number) => void;
}

export function ReorderModal({
  open,
  onOpenChange,
  medicine,
  facilityId,
  onReorderSubmitted,
}: ReorderModalProps) {
  if (!medicine) return null;

  const defaultRecommended = calculateReorderQuantity(
    medicine.burnRate,
    7, // 7 days lead time
    30, // 30 days cover
    medicine.currentStock
  );

  const [quantity, setQuantity] = useState<number>(defaultRecommended || 50);
  const [priority, setPriority] = useState<"urgent" | "routine">(
    medicine.status === "critical" ? "urgent" : "routine"
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Trigger AI Stock Forecast
  const handleAIForecast = async () => {
    setIsAiLoading(true);
    setAiRationale(null);
    try {
      const res = await fetch("/api/ai/stock-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_name: medicine.name,
          current_stock: medicine.currentStock,
          burn_rate_per_day: medicine.burnRate,
          facility_id: facilityId,
          days_since_refill: medicine.daysSinceRefill,
          minimum_threshold: medicine.minimumThreshold,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order_quantity) {
          setQuantity(data.order_quantity);
        }
        if (data.recommendation) {
          setAiRationale(data.recommendation);
        }
      } else {
        // Fallback calculation rationale
        setAiRationale(
          `Automated statistical model recommends replenishing ${defaultRecommended} ${medicine.unit} to cover 37 operating days (7-day lead + 30-day buffer).`
        );
      }
    } catch {
      setAiRationale(
        `Calculated buffer: ${defaultRecommended} ${medicine.unit} based on current daily consumption (${medicine.burnRate.toFixed(1)}/day).`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    onReorderSubmitted(facilityId, medicine.id, quantity);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <PackagePlus className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <DialogTitle>Replenishment Order (PO)</DialogTitle>
            <DialogDescription>
              Restock {medicine.name} for facility inventory.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" aria-hidden="true" />
          </div>
          <h4 className="text-lg font-semibold text-white">Purchase Order Dispatched</h4>
          <p className="text-xs text-slate-400">
            Added {quantity} {medicine.unit} of {medicine.name} to facility stock.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Current On-Hand:</span>
              <span className="font-mono font-bold text-white">
                {medicine.currentStock} {medicine.unit}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Daily Burn Rate:</span>
              <span className="font-mono text-amber-300">
                {medicine.burnRate.toFixed(1)} {medicine.unit}/day
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Safety Threshold:</span>
              <span className="font-mono text-slate-400">
                {medicine.minimumThreshold} {medicine.unit}
              </span>
            </div>
          </div>

          {/* AI Recommendation Button */}
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Gemini AI Supply Forecasting
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIForecast}
                disabled={isAiLoading}
                className="h-7 text-xs border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300"
              >
                {isAiLoading ? "Analyzing..." : "Optimize with AI"}
              </Button>
            </div>
            {isAiLoading && <LoadingSpinner size="sm" label="Forecasting epidemic surge & consumption..." />}
            {aiRationale && !isAiLoading && (
              <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-2 rounded border border-emerald-500/20">
                {aiRationale}
              </p>
            )}
          </div>

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="reorder-quantity"
              className="block text-xs font-medium text-slate-300"
            >
              Order Quantity ({medicine.unit})
            </label>
            <input
              id="reorder-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              required
              className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Dispatch Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPriority("routine")}
                className={`py-2 px-3 text-xs rounded-md border text-center transition-colors ${
                  priority === "routine"
                    ? "bg-slate-800 border-emerald-500/60 text-white font-medium"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Routine Restock (3-5 Days)
              </button>
              <button
                type="button"
                onClick={() => setPriority("urgent")}
                className={`py-2 px-3 text-xs rounded-md border text-center transition-colors ${
                  priority === "urgent"
                    ? "bg-rose-950/60 border-rose-500/60 text-rose-200 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Emergency Dispatch (&lt;24 Hours)
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Confirm & Dispatch PO
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
