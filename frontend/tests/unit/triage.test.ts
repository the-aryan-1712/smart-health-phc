import { describe, it, expect } from "vitest";
import {
  calculateEstimatedWait,
  getPriorityLabel,
  getPriorityColorClasses,
  sortByPriority,
  tokenFromNumber,
} from "@/lib/triage";

describe("triage pure functions", () => {
  describe("calculateEstimatedWait", () => {
    it("returns 0 for P1 (emergency) regardless of queue depth", () => {
      expect(calculateEstimatedWait("P1", 0)).toBe(0);
      expect(calculateEstimatedWait("P1", 10)).toBe(0);
      expect(calculateEstimatedWait("P1", 25, 10)).toBe(0);
    });

    it("caps effective tokens ahead at 3 for P2 (urgent)", () => {
      // 1 ahead * 8 min = 8
      expect(calculateEstimatedWait("P2", 1, 8)).toBe(8);
      // 2 ahead * 8 min = 16
      expect(calculateEstimatedWait("P2", 2, 8)).toBe(16);
      // 5 ahead capped at 3 * 8 = 24
      expect(calculateEstimatedWait("P2", 5, 8)).toBe(24);
      // 20 ahead capped at 3 * 10 = 30
      expect(calculateEstimatedWait("P2", 20, 10)).toBe(30);
    });

    it("uses standard queue depth for P3 (semi-urgent)", () => {
      expect(calculateEstimatedWait("P3", 0, 8)).toBe(0);
      expect(calculateEstimatedWait("P3", 4, 8)).toBe(32);
      expect(calculateEstimatedWait("P3", 5, 10)).toBe(50);
    });

    it("adds 5 positions penalty for P4 (non-urgent)", () => {
      // 0 + 5 = 5 * 8 = 40
      expect(calculateEstimatedWait("P4", 0, 8)).toBe(40);
      // 3 + 5 = 8 * 8 = 64
      expect(calculateEstimatedWait("P4", 3, 8)).toBe(64);
    });
  });

  describe("getPriorityLabel", () => {
    it("returns correct clinical triage labels", () => {
      expect(getPriorityLabel("P1")).toBe("Emergency");
      expect(getPriorityLabel("P2")).toBe("Urgent");
      expect(getPriorityLabel("P3")).toBe("Semi-urgent");
      expect(getPriorityLabel("P4")).toBe("Non-urgent");
    });
  });

  describe("getPriorityColorClasses", () => {
    it("returns accessible CSS classes for each priority", () => {
      expect(getPriorityColorClasses("P1")).toContain("text-red-700");
      expect(getPriorityColorClasses("P2")).toContain("text-orange-700");
      expect(getPriorityColorClasses("P3")).toContain("text-yellow-700");
      expect(getPriorityColorClasses("P4")).toContain("text-green-700");
    });
  });

  describe("sortByPriority", () => {
    it("correctly orders priorities P1 < P2 < P3 < P4", () => {
      expect(sortByPriority(["P1", "P2"])).toBeLessThan(0);
      expect(sortByPriority(["P2", "P1"])).toBeGreaterThan(0);
      expect(sortByPriority(["P2", "P2"])).toBe(0);
      expect(sortByPriority(["P3", "P4"])).toBeLessThan(0);
      expect(sortByPriority("P1", "P3")).toBeLessThan(0);
    });
  });

  describe("tokenFromNumber", () => {
    it("formats sequential number with leading zeros and T prefix", () => {
      expect(tokenFromNumber(1)).toBe("T001");
      expect(tokenFromNumber(42)).toBe("T042");
      expect(tokenFromNumber(100)).toBe("T100");
    });
  });
});
