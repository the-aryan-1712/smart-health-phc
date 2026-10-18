import { create } from "zustand";
import { BEDS } from "@/data/seed";
import type { Bed, BedOccupancySummary, BedStatus, BedType } from "@/types/bed";

interface BedState {
  selectedFacilityId: string;
  beds: Bed[];
  filterType: "all" | BedType;
  filterStatus: "all" | BedStatus;

  setSelectedFacilityId: (id: string) => void;
  setFilterType: (type: "all" | BedType) => void;
  setFilterStatus: (status: "all" | BedStatus) => void;

  toggleBedStatus: (bedId: string, newStatus: BedStatus, patientName?: string) => void;
  getFacilityBeds: (facilityId: string) => Bed[];
  getOccupancySummary: (facilityId: string) => BedOccupancySummary;
  getAllFacilitiesOccupancy: () => { facilityId: string; total: number; occupied: number; rate: number }[];
}

export const useBedStore = create<BedState>((set, get) => ({
  selectedFacilityId: "chc-wardha-central",
  beds: BEDS,
  filterType: "all",
  filterStatus: "all",

  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  toggleBedStatus: (bedId, newStatus, patientName) => {
    set((state) => ({
      beds: state.beds.map((b) => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          status: newStatus,
          patientName: newStatus === "occupied" ? patientName || "Admitted Patient" : undefined,
          admittedAt: newStatus === "occupied" ? new Date().toISOString() : undefined,
        };
      }),
    }));
  },

  getFacilityBeds: (facilityId) => {
    return get().beds.filter((b) => b.facilityId === facilityId);
  },

  getOccupancySummary: (facilityId) => {
    const facilityBeds = get().beds.filter((b) => b.facilityId === facilityId);
    const total = facilityBeds.length;
    const occupied = facilityBeds.filter((b) => b.status === "occupied").length;
    const available = facilityBeds.filter((b) => b.status === "available").length;
    const maintenance = facilityBeds.filter((b) => b.status === "maintenance").length;

    const byType: Record<BedType, { total: number; occupied: number }> = {
      icu: { total: 0, occupied: 0 },
      general: { total: 0, occupied: 0 },
      oxygen: { total: 0, occupied: 0 },
    };

    facilityBeds.forEach((b) => {
      byType[b.type].total += 1;
      if (b.status === "occupied") {
        byType[b.type].occupied += 1;
      }
    });

    return {
      facilityId,
      total,
      occupied,
      available,
      maintenance,
      occupancyRate: total > 0 ? occupied / total : 0,
      byType,
    };
  },

  getAllFacilitiesOccupancy: () => {
    const facilityIds = Array.from(new Set(get().beds.map((b) => b.facilityId)));
    return facilityIds.map((fId) => {
      const summary = get().getOccupancySummary(fId);
      return {
        facilityId: fId,
        total: summary.total,
        occupied: summary.occupied,
        rate: summary.occupancyRate,
      };
    });
  },
}));
