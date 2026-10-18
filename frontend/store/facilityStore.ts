import { create } from "zustand";
import { FACILITIES, INVENTORY, BEDS, STAFF, PATIENTS } from "@/data/seed";
import type { Facility } from "@/types/facility";
import { enrichMedicine } from "@/lib/burnRate";
import { calculateAttendanceSummary } from "@/lib/attendance";

export interface FacilityDistrictMetric {
  facility: Facility;
  totalMedicines: number;
  criticalMedicines: number;
  stockHealthRate: number; // 0–1
  totalBeds: number;
  occupiedBeds: number;
  icuBedsTotal: number;
  icuBedsOccupied: number;
  bedOccupancyRate: number; // 0–1
  attendanceRate: number; // 0–1
  waitingPatients: number;
  p1EmergencyPatients: number;
  overallStatus: "ok" | "low" | "critical";
}

interface FacilityState {
  selectedDistrict: "all" | "Wardha" | "Yavatmal";
  selectedFacilityId: string | null;
  searchQuery: string;

  setSelectedDistrict: (district: "all" | "Wardha" | "Yavatmal") => void;
  setSelectedFacilityId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  getDistrictMetrics: () => FacilityDistrictMetric[];
  getDistrictAlerts: () => {
    id: string;
    type: "supply" | "patient" | "bed" | "staff";
    severity: "critical" | "warning" | "info";
    facilityName: string;
    message: string;
    time: string;
  }[];
}

export const useFacilityStore = create<FacilityState>((set, get) => ({
  selectedDistrict: "all",
  selectedFacilityId: null,
  searchQuery: "",

  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getDistrictMetrics: () => {
    const { selectedDistrict, searchQuery } = get();

    return FACILITIES.filter((f) => {
      const matchDistrict = selectedDistrict === "all" || f.district === selectedDistrict;
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDistrict && matchSearch;
    }).map((facility) => {
      // 1. Supply
      const inv = INVENTORY.find((i) => i.facilityId === facility.id);
      const medicines = inv?.medicines || [];
      const enriched = medicines.map(enrichMedicine);
      const critical = enriched.filter((m) => m.status === "critical").length;
      const stockHealthRate =
        medicines.length > 0 ? (medicines.length - critical) / medicines.length : 1;

      // 2. Beds
      const facilityBeds = BEDS.filter((b) => b.facilityId === facility.id);
      const totalBeds = facilityBeds.length;
      const occupiedBeds = facilityBeds.filter((b) => b.status === "occupied").length;
      const icuBeds = facilityBeds.filter((b) => b.type === "icu");
      const icuOccupied = icuBeds.filter((b) => b.status === "occupied").length;
      const bedOccupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;

      // 3. Staff
      const facilityStaff = STAFF.filter((s) => s.facilityId === facility.id);
      const checkedIn = facilityStaff.filter((s) => s.isCheckedIn).length;
      const attendanceRate =
        facilityStaff.length > 0 ? checkedIn / facilityStaff.length : 1;

      // 4. Patients
      const facilityPatients = PATIENTS.filter((p) => p.facilityId === facility.id);
      const waiting = facilityPatients.filter((p) => p.status === "waiting").length;
      const p1 = facilityPatients.filter(
        (p) => p.status === "waiting" && p.priority === "P1"
      ).length;

      // Overall status
      let overallStatus: "ok" | "low" | "critical" = "ok";
      if (critical > 0 || p1 > 0 || (icuBeds.length > 0 && icuOccupied === icuBeds.length)) {
        overallStatus = "critical";
      } else if (stockHealthRate < 0.8 || bedOccupancyRate > 0.8 || attendanceRate < 0.8) {
        overallStatus = "low";
      }

      return {
        facility,
        totalMedicines: medicines.length,
        criticalMedicines: critical,
        stockHealthRate,
        totalBeds,
        occupiedBeds,
        icuBedsTotal: icuBeds.length,
        icuBedsOccupied: icuOccupied,
        bedOccupancyRate,
        attendanceRate,
        waitingPatients: waiting,
        p1EmergencyPatients: p1,
        overallStatus,
      };
    });
  },

  getDistrictAlerts: () => {
    const alerts: {
      id: string;
      type: "supply" | "patient" | "bed" | "staff";
      severity: "critical" | "warning" | "info";
      facilityName: string;
      message: string;
      time: string;
    }[] = [
      {
        id: "alt-1",
        type: "supply",
        severity: "critical",
        facilityName: "PHC Sindi",
        message: "ORS Sachets and Oxytocin stock below safety minimum (<2 days left).",
        time: "10 mins ago",
      },
      {
        id: "alt-2",
        type: "patient",
        severity: "critical",
        facilityName: "CHC Wardha Central",
        message: "P1 Emergency Cardiac Patient admitted (T001 Dilip Meshram).",
        time: "18 mins ago",
      },
      {
        id: "alt-3",
        type: "staff",
        severity: "warning",
        facilityName: "PHC Ner",
        message: "Medical Officer Dr. Vandana Waghmare absent past shift start.",
        time: "32 mins ago",
      },
      {
        id: "alt-4",
        type: "bed",
        severity: "critical",
        facilityName: "CHC Wardha Central",
        message: "ICU Ward operating at 83% capacity (5 of 6 beds occupied).",
        time: "45 mins ago",
      },
      {
        id: "alt-5",
        type: "supply",
        severity: "warning",
        facilityName: "PHC Arvi",
        message: "Insulin Human supply reaching 3 vials threshold.",
        time: "1 hour ago",
      },
    ];

    return alerts;
  },
}));
