// Patient flow and triage types

export type TriagePriority = "P1" | "P2" | "P3" | "P4";
export type QueueStatus = "waiting" | "in-consultation" | "completed" | "referred";

export interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: "M" | "F" | "Other";
  symptoms: string;
  arrivalTime: string; // ISO 8601
  facilityId: string;
  status: QueueStatus;
  priority?: TriagePriority;
  urgencyLabel?: string;
  estimatedWaitMinutes?: number;
  chiefComplaint?: string;
  recommendedAction?: string;
}

export interface QueueSummary {
  facilityId: string;
  totalWaiting: number;
  byPriority: Record<TriagePriority, number>;
  averageWaitMinutes: number;
  lastUpdated: string;
}

export interface TriageResult {
  token: string;
  priority: TriagePriority;
  urgencyLabel: string;
  chiefComplaint: string;
  recommendedAction: string;
  estimatedWaitMinutes: number;
  confidence: "high" | "medium" | "low";
}
