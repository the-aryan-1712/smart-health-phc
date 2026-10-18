import { describe, it, expect } from "vitest";
import {
  calculateBurnRate,
  calculateDaysToStockout,
  getStockStatus,
  calculateReorderQuantity,
  enrichMedicine,
  formatDTS,
} from "@/lib/burnRate";
import type { Medicine } from "@/types/supply";

describe("burnRate pure functions", () => {
  describe("calculateBurnRate", () => {
    it("returns 0 if daysSinceRefill <= 0", () => {
      expect(calculateBurnRate(100, 50, 0)).toBe(0);
      expect(calculateBurnRate(100, 50, -5)).toBe(0);
    });

    it("calculates correct consumption per day", () => {
      expect(calculateBurnRate(100, 50, 5)).toBe(10);
      expect(calculateBurnRate(200, 50, 10)).toBe(15);
    });

    it("handles currentStock higher than initialStock gracefully (returns 0)", () => {
      expect(calculateBurnRate(50, 100, 5)).toBe(0);
    });
  });

  describe("calculateDaysToStockout", () => {
    it("returns Infinity if burnRate <= 0", () => {
      expect(calculateDaysToStockout(100, 0)).toBe(Infinity);
      expect(calculateDaysToStockout(100, -2)).toBe(Infinity);
    });

    it("returns correct days remaining", () => {
      expect(calculateDaysToStockout(100, 10)).toBe(10);
      expect(calculateDaysToStockout(45, 15)).toBe(3);
    });
  });

  describe("getStockStatus", () => {
    it("returns critical when currentStock is 0 or daysToStockout <= 3", () => {
      expect(getStockStatus(0, 50, 10)).toBe("critical");
      expect(getStockStatus(20, 10, 2)).toBe("critical");
      expect(getStockStatus(15, 10, 3)).toBe("critical");
    });

    it("returns low when stock <= threshold or daysToStockout <= 7", () => {
      expect(getStockStatus(10, 20, 15)).toBe("low");
      expect(getStockStatus(30, 20, 5)).toBe("low");
      expect(getStockStatus(30, 20, 7)).toBe("low");
    });

    it("returns ok when stock is sufficient and daysToStockout > 7", () => {
      expect(getStockStatus(100, 20, 12)).toBe("ok");
      expect(getStockStatus(50, 20, 8)).toBe("ok");
    });
  });

  describe("calculateReorderQuantity", () => {
    it("calculates standard replenishment", () => {
      // burnRate=10, leadTime=7, cover=30 => 10 * 37 = 370. currentStock=70 => 300
      expect(calculateReorderQuantity(10, 7, 30, 70)).toBe(300);
    });

    it("uses default lead time and cover days", () => {
      // burnRate=5, leadTime=7, cover=30 => 5 * 37 = 185. currentStock=0 => 185
      expect(calculateReorderQuantity(5)).toBe(185);
    });

    it("returns 0 if currentStock exceeds required stock", () => {
      expect(calculateReorderQuantity(5, 7, 30, 500)).toBe(0);
    });
  });

  describe("enrichMedicine", () => {
    it("adds calculated metrics and status to medicine object", () => {
      const mockMedicine: Medicine = {
        id: "med-001",
        name: "Paracetamol 500mg",
        category: "analgesic",
        currentStock: 30,
        initialStock: 150,
        daysSinceRefill: 10,
        unit: "tablets",
        minimumThreshold: 50,
        lastRefillDate: "2026-10-18",
      };

      const enriched = enrichMedicine(mockMedicine);
      // burnRate = (150 - 30) / 10 = 12
      // daysToStockout = 30 / 12 = 2.5
      // status = critical (daysToStockout <= 3)
      expect(enriched.burnRate).toBe(12);
      expect(enriched.daysToStockout).toBe(2.5);
      expect(enriched.status).toBe("critical");
      expect(enriched.name).toBe("Paracetamol 500mg");
    });
  });

  describe("formatDTS", () => {
    it("formats infinite and large DTS to 999+", () => {
      expect(formatDTS(Infinity)).toBe("999+");
      expect(formatDTS(1200)).toBe("999+");
    });

    it("formats standard numbers by rounding", () => {
      expect(formatDTS(4.2)).toBe("4");
      expect(formatDTS(8.7)).toBe("9");
    });
  });
});
