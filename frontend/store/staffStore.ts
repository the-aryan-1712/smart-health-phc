import { create } from "zustand";
import { STAFF } from "@/data/seed";
import type { StaffMember, RosterEntry, IncidentReport, AttendanceSummary, AttendanceStatus } from "@/types/staff";
import { isAbsenceAlert, calculateAttendanceSummary } from "@/lib/attendance";

interface StaffState {
  selectedFacilityId: string;
  staff: StaffMember[];
  roster: RosterEntry[];
  incidentReports: IncidentReport[];

  setSelectedFacilityId: (id: string) => void;
  toggleCheckin: (staffId: string) => void;
  addIncidentReport: (report: IncidentReport) => void;

  getFacilityStaff: (facilityId: string) => StaffMember[];
  getFacilityRoster: (facilityId: string) => RosterEntry[];
  getFacilityAbsences: (facilityId: string) => StaffMember[];
  getAttendanceSummary: (facilityId: string) => AttendanceSummary;
}

// Generate realistic roster entries for today
const today = new Date().toISOString().split("T")[0];
const initialRoster: RosterEntry[] = STAFF.map((s, idx) => ({
  staffId: s.id,
  date: today,
  shift: idx % 3 === 0 ? "duty" : idx % 2 === 0 ? "morning" : "afternoon",
  shiftStart: "08:00",
  shiftEnd: "16:00",
  expectedAt: `${today}T08:00:00Z`,
  status: s.isCheckedIn ? "present" : "absent",
}));

export const useStaffStore = create<StaffState>((set, get) => ({
  selectedFacilityId: "phc-wardha-sindi",
  staff: STAFF,
  roster: initialRoster,
  incidentReports: [],

  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),

  toggleCheckin: (staffId) => {
    set((state) => {
      const updatedStaff = state.staff.map((s) => {
        if (s.id !== staffId) return s;
        const willCheckIn = !s.isCheckedIn;
        return {
          ...s,
          isCheckedIn: willCheckIn,
          checkinTime: willCheckIn ? new Date().toISOString() : undefined,
          checkoutTime: !willCheckIn ? new Date().toISOString() : undefined,
        };
      });

      const updatedRoster = state.roster.map((r) => {
        if (r.staffId !== staffId) return r;
        const staffObj = updatedStaff.find((s) => s.id === staffId);
        return {
          ...r,
          status: (staffObj?.isCheckedIn ? "present" : "absent") as AttendanceStatus,
        };
      });

      return { staff: updatedStaff, roster: updatedRoster };
    });
  },

  addIncidentReport: (report) => {
    set((state) => ({
      incidentReports: [report, ...state.incidentReports],
    }));
  },

  getFacilityStaff: (facilityId) => {
    return get().staff.filter((s) => s.facilityId === facilityId);
  },

  getFacilityRoster: (facilityId) => {
    const staffIds = new Set(
      get()
        .staff.filter((s) => s.facilityId === facilityId)
        .map((s) => s.id)
    );
    return get().roster.filter((r) => staffIds.has(r.staffId));
  },

  getFacilityAbsences: (facilityId) => {
    const facilityStaff = get().getFacilityStaff(facilityId);
    const nowISO = new Date().toISOString();
    return facilityStaff.filter((s) => {
      // Expected shift start at 8:00 AM today
      const shiftStartISO = `${today}T08:00:00Z`;
      return isAbsenceAlert(shiftStartISO, s.isCheckedIn, 30, nowISO);
    });
  },

  getAttendanceSummary: (facilityId) => {
    const facilityRoster = get().getFacilityRoster(facilityId);
    return calculateAttendanceSummary(facilityId, today, facilityRoster);
  },
}));
