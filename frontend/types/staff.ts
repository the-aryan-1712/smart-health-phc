// Staff roster and attendance types

export type StaffRole = "Medical Officer" | "Nurse" | "ANM" | "Pharmacist" | "Lab Technician" | "ASHA Worker" | "Administrative Staff";
export type ShiftType = "morning" | "afternoon" | "night" | "duty";
export type AttendanceStatus = "present" | "absent" | "on-leave" | "late";
export type IncidentType = "unannounced_absence" | "late_arrival" | "early_departure" | "duty_swap";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  facilityId: string;
  employeeId: string;
  phone: string;
  isCheckedIn: boolean;
  checkinTime?: string; // ISO 8601
  checkoutTime?: string;
}

export interface RosterEntry {
  staffId: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  shiftStart: string; // HH:MM
  shiftEnd: string;
  expectedAt: string; // ISO 8601
  status: AttendanceStatus;
  notes?: string;
}

export interface IncidentReport {
  incidentId: string;
  facilityId: string;
  staffName: string;
  severity: "low" | "medium" | "high";
  summary: string;
  recommendedAction: string;
  escalateToDistrict: boolean;
  generatedAt: string;
}

export interface AttendanceSummary {
  facilityId: string;
  date: string;
  totalScheduled: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: number; // 0–1
}
