// Supply chain types

export type StockStatus = "ok" | "low" | "critical";

export interface Medicine {
  id: string;
  name: string;
  unit: string; // "tablets" | "vials" | "sachets" | "bottles" | "ampoules"
  category: "antibiotic" | "analgesic" | "antidiabetic" | "vaccine" | "ors" | "obstetric" | "other";
  currentStock: number;
  initialStock: number; // Stock at last refill
  minimumThreshold: number;
  daysSinceRefill: number;
  lastRefillDate: string; // ISO 8601
}

export interface MedicineWithMetrics extends Medicine {
  burnRate: number; // units/day
  daysToStockout: number; // Infinity if burn rate is 0
  status: StockStatus;
}

export interface StockPrediction {
  medicine: string;
  currentStock: number;
  burnRatePerDay: number;
  predictedDaysToStockout: number;
  status: StockStatus;
  confidence: "high" | "medium" | "low";
  recommendation: string;
  orderQuantity: number;
}

export interface ReorderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  priority: "urgent" | "routine";
}

export interface FacilityInventory {
  facilityId: string;
  medicines: Medicine[];
  lastUpdated: string;
}
