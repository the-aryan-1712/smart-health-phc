// Bed and resource allocation types

export type BedType = "icu" | "general" | "oxygen";
export type BedStatus = "available" | "occupied" | "maintenance";

export interface Bed {
  id: string;
  facilityId: string;
  bedNumber: number;
  type: BedType;
  status: BedStatus;
  patientName?: string; // If occupied
  admittedAt?: string; // ISO 8601
  ward?: string;
}

export interface BedOccupancySummary {
  facilityId: string;
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  occupancyRate: number; // 0–1
  byType: Record<BedType, { total: number; occupied: number }>;
}
