import { describe, it, expect } from "vitest";
import {
  isAbsenceAlert,
  calculateAttendanceSummary,
  formatShiftTime,
  getAttendanceColorClass,
} from "@/lib/attendance";
import type { RosterEntry } from "@/types/staff";

describe("attendance pure functions", () => {
  describe("isAbsenceAlert", () => {
    const shiftStart = "2026-10-18T08:00:00.000Z";

    it("returns false if staff is already checked in", () => {
      expect(isAbsenceAlert(shiftStart, true, 30, "2026-10-18T09:00:00.000Z")).toBe(false);
    });

    it("returns false if within grace period", () => {
      // 15 minutes after shift start (grace period 30 min)
      expect(isAbsenceAlert(shiftStart, false, 30, "2026-10-18T08:15:00.000Z")).toBe(false);
      // exactly before deadline
      expect(isAbsenceAlert(shiftStart, false, 30, "2026-10-18T08:29:59.000Z")).toBe(false);
    });

    it("returns true if grace period has elapsed and not checked in", () => {
      // exactly at deadline (8:30)
      expect(isAbsenceAlert(shiftStart, false, 30, "2026-10-18T08:30:00.000Z")).toBe(true);
      // after deadline (8:45)
      expect(isAbsenceAlert(shiftStart, false, 30, "2026-10-18T08:45:00.000Z")).toBe(true);
    });

    it("respects custom grace period", () => {
      // 10 minute grace period: 8:15 is after 8:10 deadline
      expect(isAbsenceAlert(shiftStart, false, 10, "2026-10-18T08:15:00.000Z")).toBe(true);
      // 45 minute grace period: 8:35 is before 8:45 deadline
      expect(isAbsenceAlert(shiftStart, false, 45, "2026-10-18T08:35:00.000Z")).toBe(false);
    });
  });

  describe("calculateAttendanceSummary", () => {
    it("handles empty roster gracefully", () => {
      const summary = calculateAttendanceSummary("phc-wardha-01", "2026-10-18", []);
      expect(summary.totalScheduled).toBe(0);
      expect(summary.present).toBe(0);
      expect(summary.attendanceRate).toBe(1);
    });

    it("accurately computes attendance counts and rate", () => {
      const mockEntries: RosterEntry[] = [
        {
          staffId: "s-1",
          date: "2026-10-18",
          shift: "morning",
          shiftStart: "08:00",
          shiftEnd: "16:00",
          expectedAt: "2026-10-18T08:00:00Z",
          status: "present",
        },
        {
          staffId: "s-2",
          date: "2026-10-18",
          shift: "morning",
          shiftStart: "08:00",
          shiftEnd: "16:00",
          expectedAt: "2026-10-18T08:00:00Z",
          status: "present",
        },
        {
          staffId: "s-3",
          date: "2026-10-18",
          shift: "morning",
          shiftStart: "08:00",
          shiftEnd: "16:00",
          expectedAt: "2026-10-18T08:00:00Z",
          status: "absent",
        },
        {
          staffId: "s-4",
          date: "2026-10-18",
          shift: "morning",
          shiftStart: "08:00",
          shiftEnd: "16:00",
          expectedAt: "2026-10-18T08:00:00Z",
          status: "late",
        },
      ];

      const summary = calculateAttendanceSummary("phc-wardha-01", "2026-10-18", mockEntries);
      expect(summary.totalScheduled).toBe(4);
      expect(summary.present).toBe(2);
      expect(summary.absent).toBe(1);
      expect(summary.late).toBe(1);
      expect(summary.onLeave).toBe(0);
      expect(summary.attendanceRate).toBe(0.5);
    });
  });

  describe("formatShiftTime", () => {
    it("formats 24h string to 12h AM/PM representation", () => {
      expect(formatShiftTime("08:00")).toBe("8:00 AM");
      expect(formatShiftTime("12:00")).toBe("12:00 PM");
      expect(formatShiftTime("14:30")).toBe("2:30 PM");
      expect(formatShiftTime("00:15")).toBe("12:15 AM");
    });
  });

  describe("getAttendanceColorClass", () => {
    it("returns correct color classes based on attendance rate threshold", () => {
      expect(getAttendanceColorClass(0.95)).toContain("emerald");
      expect(getAttendanceColorClass(0.90)).toContain("emerald");
      expect(getAttendanceColorClass(0.85)).toContain("amber");
      expect(getAttendanceColorClass(0.70)).toContain("amber");
      expect(getAttendanceColorClass(0.65)).toContain("red");
      expect(getAttendanceColorClass(0.40)).toContain("red");
    });
  });
});
