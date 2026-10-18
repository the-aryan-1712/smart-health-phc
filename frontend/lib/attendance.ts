/**
 * Staff attendance and absence detection utilities.
 * All pure functions — no side effects. 100% unit-testable.
 */

import type { AttendanceSummary, RosterEntry } from "@/types/staff";

/**
 * Determine if a staff member should be flagged as absent.
 *
 * A staff member is flagged if:
 * - They are scheduled for a shift today
 * - The shift start time + 30-minute grace period has passed
 * - They have not checked in
 *
 * @param shiftStartISO - Expected shift start (ISO 8601)
 * @param isCheckedIn - Whether the staff member has checked in
 * @param graceMinutes - Grace period after shift start (default 30)
 * @param nowISO - Current time (default: now). Pass explicitly for testing.
 * @returns true if the absence should trigger an alert
 */
export function isAbsenceAlert(
  shiftStartISO: string,
  isCheckedIn: boolean,
  graceMinutes = 30,
  nowISO?: string
): boolean {
  if (isCheckedIn) return false;
  const now = nowISO ? new Date(nowISO) : new Date();
  const shiftStart = new Date(shiftStartISO);
  const deadline = new Date(shiftStart.getTime() + graceMinutes * 60 * 1000);
  return now >= deadline;
}

/**
 * Calculate attendance rate from a list of roster entries.
 *
 * @param entries - Today's roster entries for a facility
 * @returns Attendance summary with counts and rate (0–1)
 */
export function calculateAttendanceSummary(
  facilityId: string,
  date: string,
  entries: RosterEntry[]
): AttendanceSummary {
  const total = entries.length;
  const present = entries.filter((e) => e.status === "present").length;
  const absent = entries.filter((e) => e.status === "absent").length;
  const late = entries.filter((e) => e.status === "late").length;
  const onLeave = entries.filter((e) => e.status === "on-leave").length;

  return {
    facilityId,
    date,
    totalScheduled: total,
    present,
    absent,
    late,
    onLeave,
    attendanceRate: total > 0 ? present / total : 1,
  };
}

/**
 * Format a shift time string for display.
 * e.g. "08:00" → "8:00 AM"
 */
export function formatShiftTime(hhmm: string): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Get severity color classes for attendance rate display.
 */
export function getAttendanceColorClass(rate: number): string {
  if (rate >= 0.9) return "text-emerald-700 bg-emerald-50";
  if (rate >= 0.7) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}
