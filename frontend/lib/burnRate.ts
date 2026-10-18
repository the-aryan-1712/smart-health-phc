/**
 * Burn-rate calculation utilities for medicine stock management.
 * All functions are pure — no side effects, no I/O. 100% unit-testable.
 */

import type { Medicine, MedicineWithMetrics, StockStatus } from "@/types/supply";

/**
 * Calculate the daily consumption rate (burn rate) for a medicine.
 *
 * @param initialStock - Stock level at last refill
 * @param currentStock - Current stock level
 * @param daysSinceRefill - Days elapsed since last refill
 * @returns Units consumed per day. Returns 0 if daysSinceRefill is 0.
 */
export function calculateBurnRate(
  initialStock: number,
  currentStock: number,
  daysSinceRefill: number
): number {
  if (daysSinceRefill <= 0) return 0;
  const consumed = Math.max(0, initialStock - currentStock);
  return consumed / daysSinceRefill;
}

/**
 * Predict days remaining before medicine stock is depleted.
 *
 * @param currentStock - Current stock quantity
 * @param burnRate - Daily consumption rate (units/day)
 * @returns Days until stockout. Returns Infinity if burnRate <= 0.
 */
export function calculateDaysToStockout(
  currentStock: number,
  burnRate: number
): number {
  if (burnRate <= 0) return Infinity;
  return currentStock / burnRate;
}

/**
 * Classify stock health as "ok", "low", or "critical".
 */
export function getStockStatus(
  currentStock: number,
  minimumThreshold: number,
  daysToStockout: number
): StockStatus {
  if (currentStock <= 0 || daysToStockout <= 3) return "critical";
  if (currentStock <= minimumThreshold || daysToStockout <= 7) return "low";
  return "ok";
}

/**
 * Calculate recommended reorder quantity.
 *
 * @param burnRate - Daily consumption in units
 * @param leadTimeDays - Days until delivery (default 7)
 * @param coverDays - Target days of stock cover (default 30)
 * @param currentStock - Current on-hand quantity
 * @returns Integer reorder quantity (always >= 0)
 */
export function calculateReorderQuantity(
  burnRate: number,
  leadTimeDays = 7,
  coverDays = 30,
  currentStock = 0
): number {
  const required = burnRate * (leadTimeDays + coverDays);
  return Math.max(0, Math.round(required - currentStock));
}

/**
 * Enrich a Medicine object with computed metrics.
 */
export function enrichMedicine(medicine: Medicine): MedicineWithMetrics {
  const burnRate = calculateBurnRate(
    medicine.initialStock,
    medicine.currentStock,
    medicine.daysSinceRefill
  );
  const daysToStockout = calculateDaysToStockout(medicine.currentStock, burnRate);
  const status = getStockStatus(
    medicine.currentStock,
    medicine.minimumThreshold,
    daysToStockout
  );

  return { ...medicine, burnRate, daysToStockout, status };
}

/**
 * Format DTS value for display — caps at 999 for "infinite" cases.
 */
export function formatDTS(dts: number): string {
  if (!isFinite(dts) || dts > 999) return "999+";
  return Math.round(dts).toString();
}
