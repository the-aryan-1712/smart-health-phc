/**
 * Patient triage utility functions.
 * All pure functions — no side effects, no I/O. 100% unit-testable.
 */

import type { TriagePriority } from "@/types/patient";

const PRIORITY_LABELS: Record<TriagePriority, string> = {
  P1: "Emergency",
  P2: "Urgent",
  P3: "Semi-urgent",
  P4: "Non-urgent",
};

const PRIORITY_COLORS: Record<TriagePriority, string> = {
  P1: "text-red-700 bg-red-100 border-red-300",
  P2: "text-orange-700 bg-orange-100 border-orange-300",
  P3: "text-yellow-700 bg-yellow-100 border-yellow-300",
  P4: "text-green-700 bg-green-100 border-green-300",
};

/**
 * Estimate patient wait time based on triage priority and queue depth.
 *
 * - P1 (Emergency): Immediate, bypasses all queues (0 min)
 * - P2 (Urgent): Capped at max 3 patients ahead
 * - P3 (Semi-urgent): Standard queue position
 * - P4 (Non-urgent): Pushed 5 positions beyond current queue
 *
 * @param priority - Triage priority level
 * @param tokensAhead - Patients currently waiting ahead
 * @param avgServiceMinutes - Average consultation duration (default 8 min)
 */
export function calculateEstimatedWait(
  priority: TriagePriority,
  tokensAhead: number,
  avgServiceMinutes = 8
): number {
  if (priority === "P1") return 0;

  let effectiveAhead: number;
  if (priority === "P2") {
    effectiveAhead = Math.min(tokensAhead, 3);
  } else if (priority === "P3") {
    effectiveAhead = tokensAhead;
  } else {
    // P4 — goes to the back
    effectiveAhead = tokensAhead + 5;
  }

  return effectiveAhead * avgServiceMinutes;
}

/**
 * Get human-readable label for a triage priority.
 */
export function getPriorityLabel(priority: TriagePriority): string {
  return PRIORITY_LABELS[priority];
}

/**
 * Get Tailwind CSS color classes for a triage priority badge.
 */
export function getPriorityColorClasses(priority: TriagePriority): string {
  return PRIORITY_COLORS[priority];
}

/**
 * Sort patients by priority for display (P1 first, P4 last).
 */
export function sortByPriority(
  aOrPair: TriagePriority | [TriagePriority, TriagePriority],
  b?: TriagePriority
): number {
  const order: Record<TriagePriority, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };
  if (Array.isArray(aOrPair)) {
    return order[aOrPair[0]] - order[aOrPair[1]];
  }
  return order[aOrPair] - (b ? order[b] : 0);
}

/**
 * Generate a display token string from sequential number.
 * e.g. tokenFromNumber(42) → "T042"
 */
export function tokenFromNumber(n: number): string {
  return `T${String(n).padStart(3, "0")}`;
}
