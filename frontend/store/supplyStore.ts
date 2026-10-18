import { create } from "zustand";
import { INVENTORY } from "@/data/seed";
import type { FacilityInventory, MedicineWithMetrics } from "@/types/supply";
import { enrichMedicine } from "@/lib/burnRate";

interface SupplyState {
  selectedFacilityId: string;
  inventories: FacilityInventory[];
  searchQuery: string;
  selectedCategory: string;
  statusFilter: "all" | "critical" | "low" | "ok";

  setSelectedFacilityId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setStatusFilter: (status: "all" | "critical" | "low" | "ok") => void;

  reorderMedicine: (facilityId: string, medicineId: string, quantity: number) => void;
  getEnrichedMedicines: (facilityId: string) => MedicineWithMetrics[];
  getAllCriticalMedicines: () => { facilityId: string; medicine: MedicineWithMetrics }[];
}

export const useSupplyStore = create<SupplyState>((set, get) => ({
  selectedFacilityId: "phc-wardha-sindi",
  inventories: INVENTORY,
  searchQuery: "",
  selectedCategory: "all",
  statusFilter: "all",

  setSelectedFacilityId: (id: string) => set({ selectedFacilityId: id }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (cat: string) => set({ selectedCategory: cat }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  reorderMedicine: (facilityId: string, medicineId: string, quantity: number) => {
    set((state) => ({
      inventories: state.inventories.map((inv) => {
        if (inv.facilityId !== facilityId) return inv;
        return {
          ...inv,
          lastUpdated: new Date().toISOString(),
          medicines: inv.medicines.map((med) => {
            if (med.id !== medicineId) return med;
            const newStock = med.currentStock + quantity;
            return {
              ...med,
              currentStock: newStock,
              initialStock: newStock, // Reset initial baseline
              daysSinceRefill: 0,
              lastRefillDate: new Date().toISOString().split("T")[0],
            };
          }),
        };
      }),
    }));
  },

  getEnrichedMedicines: (facilityId: string) => {
    const inv = get().inventories.find((i) => i.facilityId === facilityId);
    if (!inv) return [];
    return inv.medicines.map(enrichMedicine);
  },

  getAllCriticalMedicines: () => {
    const list: { facilityId: string; medicine: MedicineWithMetrics }[] = [];
    get().inventories.forEach((inv) => {
      inv.medicines.forEach((med) => {
        const enriched = enrichMedicine(med);
        if (enriched.status === "critical") {
          list.push({ facilityId: inv.facilityId, medicine: enriched });
        }
      });
    });
    return list;
  },
}));
