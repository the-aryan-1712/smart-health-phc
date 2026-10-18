/**
 * Realistic seed data for 8 PHC/CHC facilities across Wardha and Yavatmal
 * districts of Maharashtra, India.
 *
 * Data represents a snapshot from October 2026 (late monsoon season),
 * a period of elevated malaria, dengue, and diarrheal disease burden.
 */

import type { Facility } from "@/types/facility";
import type { FacilityInventory } from "@/types/supply";
import type { Patient } from "@/types/patient";
import type { Bed } from "@/types/bed";
import type { StaffMember, RosterEntry } from "@/types/staff";

// ─── Facilities ───────────────────────────────────────────────────────────────

export const FACILITIES: Facility[] = [
  {
    id: "phc-wardha-sindi",
    name: "PHC Sindi",
    type: "PHC",
    district: "Wardha",
    location: { lat: 20.7002, lng: 78.6293 },
    beds: { icu: 0, general: 12, oxygen: 4 },
    address: "Sindi village, Wardha Taluka, Wardha - 442001",
    phone: "07152-234501",
    inCharge: "Dr. Priya Deshmukh",
  },
  {
    id: "phc-wardha-arvi",
    name: "PHC Arvi",
    type: "PHC",
    district: "Wardha",
    location: { lat: 20.9935, lng: 78.2306 },
    beds: { icu: 0, general: 10, oxygen: 3 },
    address: "Arvi Taluka HQ, Wardha - 442201",
    phone: "07157-222301",
    inCharge: "Dr. Suresh Kale",
  },
  {
    id: "phc-wardha-hinganghat",
    name: "PHC Hinganghat",
    type: "PHC",
    district: "Wardha",
    location: { lat: 20.5519, lng: 78.8368 },
    beds: { icu: 0, general: 15, oxygen: 6 },
    address: "Hinganghat Taluka, Wardha - 442301",
    phone: "07153-252201",
    inCharge: "Dr. Anita Gaikwad",
  },
  {
    id: "chc-wardha-central",
    name: "CHC Wardha Central",
    type: "CHC",
    district: "Wardha",
    location: { lat: 20.7453, lng: 78.6022 },
    beds: { icu: 6, general: 40, oxygen: 15 },
    address: "Civil Hospital Road, Wardha - 442001",
    phone: "07152-243801",
    inCharge: "Dr. Ramesh Bhoyar",
  },
  {
    id: "phc-yavatmal-ner",
    name: "PHC Ner",
    type: "PHC",
    district: "Yavatmal",
    location: { lat: 20.1806, lng: 78.12 },
    beds: { icu: 0, general: 12, oxygen: 4 },
    address: "Ner Taluka, Yavatmal - 445302",
    phone: "07232-265401",
    inCharge: "Dr. Vandana Waghmare",
  },
  {
    id: "phc-yavatmal-pusad",
    name: "PHC Pusad",
    type: "PHC",
    district: "Yavatmal",
    location: { lat: 19.9098, lng: 77.5762 },
    beds: { icu: 0, general: 10, oxygen: 5 },
    address: "Pusad Town, Yavatmal - 445204",
    phone: "07234-252601",
    inCharge: "Dr. Mahesh Rathod",
  },
  {
    id: "phc-yavatmal-wani",
    name: "PHC Wani",
    type: "PHC",
    district: "Yavatmal",
    location: { lat: 20.0527, lng: 78.9541 },
    beds: { icu: 0, general: 14, oxygen: 5 },
    address: "Wani Taluka, Yavatmal - 445304",
    phone: "07238-241201",
    inCharge: "Dr. Kavita Jadhav",
  },
  {
    id: "chc-yavatmal-urban",
    name: "CHC Yavatmal Urban",
    type: "CHC",
    district: "Yavatmal",
    location: { lat: 20.3893, lng: 78.132 },
    beds: { icu: 8, general: 50, oxygen: 20 },
    address: "Yavatmal Urban Health Centre, Yavatmal - 445001",
    phone: "07232-241801",
    inCharge: "Dr. Nitin Kulkarni",
  },
];

// ─── Medicine Inventory ────────────────────────────────────────────────────────

export const INVENTORY: FacilityInventory[] = [
  {
    facilityId: "phc-wardha-sindi",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m1", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 48, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
      { id: "m2", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 320, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
      { id: "m3", name: "Amoxicillin 250mg", unit: "capsules", category: "antibiotic", currentStock: 60, initialStock: 400, minimumThreshold: 100, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
      { id: "m4", name: "Metformin 500mg", unit: "tablets", category: "antidiabetic", currentStock: 450, initialStock: 600, minimumThreshold: 100, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
      { id: "m5", name: "Oxytocin 10IU", unit: "ampoules", category: "obstetric", currentStock: 8, initialStock: 30, minimumThreshold: 10, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
      { id: "m6", name: "Artemether 80mg", unit: "tablets", category: "other", currentStock: 12, initialStock: 100, minimumThreshold: 30, daysSinceRefill: 22, lastRefillDate: "2026-09-26" },
    ],
  },
  {
    facilityId: "phc-wardha-arvi",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m7", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 120, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 15, lastRefillDate: "2026-10-03" },
      { id: "m8", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 600, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 15, lastRefillDate: "2026-10-03" },
      { id: "m9", name: "Amoxicillin 250mg", unit: "capsules", category: "antibiotic", currentStock: 200, initialStock: 400, minimumThreshold: 100, daysSinceRefill: 15, lastRefillDate: "2026-10-03" },
      { id: "m10", name: "Insulin Human 40IU/ml", unit: "vials", category: "antidiabetic", currentStock: 3, initialStock: 20, minimumThreshold: 5, daysSinceRefill: 15, lastRefillDate: "2026-10-03" },
    ],
  },
  {
    facilityId: "chc-wardha-central",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m11", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 400, initialStock: 800, minimumThreshold: 200, daysSinceRefill: 10, lastRefillDate: "2026-10-08" },
      { id: "m12", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 2000, initialStock: 3000, minimumThreshold: 500, daysSinceRefill: 10, lastRefillDate: "2026-10-08" },
      { id: "m13", name: "Ceftriaxone 1g", unit: "vials", category: "antibiotic", currentStock: 45, initialStock: 100, minimumThreshold: 20, daysSinceRefill: 10, lastRefillDate: "2026-10-08" },
      { id: "m14", name: "Insulin Human 40IU/ml", unit: "vials", category: "antidiabetic", currentStock: 25, initialStock: 60, minimumThreshold: 15, daysSinceRefill: 10, lastRefillDate: "2026-10-08" },
      { id: "m15", name: "Oxytocin 10IU", unit: "ampoules", category: "obstetric", currentStock: 40, initialStock: 80, minimumThreshold: 20, daysSinceRefill: 10, lastRefillDate: "2026-10-08" },
    ],
  },
  {
    facilityId: "phc-yavatmal-ner",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m16", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 20, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 30, lastRefillDate: "2026-09-18" },
      { id: "m17", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 80, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 30, lastRefillDate: "2026-09-18" },
      { id: "m18", name: "Artemether 80mg", unit: "tablets", category: "other", currentStock: 5, initialStock: 80, minimumThreshold: 20, daysSinceRefill: 30, lastRefillDate: "2026-09-18" },
    ],
  },
  // Remaining 4 facilities with reasonable stock levels
  {
    facilityId: "phc-wardha-hinganghat",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m19", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 150, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 8, lastRefillDate: "2026-10-10" },
      { id: "m20", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 700, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 8, lastRefillDate: "2026-10-10" },
      { id: "m21", name: "Amoxicillin 250mg", unit: "capsules", category: "antibiotic", currentStock: 280, initialStock: 400, minimumThreshold: 100, daysSinceRefill: 8, lastRefillDate: "2026-10-10" },
    ],
  },
  {
    facilityId: "phc-yavatmal-pusad",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m22", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 90, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 18, lastRefillDate: "2026-09-30" },
      { id: "m23", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 400, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 18, lastRefillDate: "2026-09-30" },
      { id: "m24", name: "Metformin 500mg", unit: "tablets", category: "antidiabetic", currentStock: 300, initialStock: 600, minimumThreshold: 100, daysSinceRefill: 18, lastRefillDate: "2026-09-30" },
    ],
  },
  {
    facilityId: "phc-yavatmal-wani",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m25", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 70, initialStock: 200, minimumThreshold: 50, daysSinceRefill: 20, lastRefillDate: "2026-09-28" },
      { id: "m26", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 500, initialStock: 1000, minimumThreshold: 200, daysSinceRefill: 20, lastRefillDate: "2026-09-28" },
      { id: "m27", name: "Artemether 80mg", unit: "tablets", category: "other", currentStock: 40, initialStock: 80, minimumThreshold: 20, daysSinceRefill: 20, lastRefillDate: "2026-09-28" },
    ],
  },
  {
    facilityId: "chc-yavatmal-urban",
    lastUpdated: new Date().toISOString(),
    medicines: [
      { id: "m28", name: "ORS Sachets", unit: "sachets", category: "ors", currentStock: 600, initialStock: 1000, minimumThreshold: 250, daysSinceRefill: 7, lastRefillDate: "2026-10-11" },
      { id: "m29", name: "Paracetamol 500mg", unit: "tablets", category: "analgesic", currentStock: 2500, initialStock: 4000, minimumThreshold: 800, daysSinceRefill: 7, lastRefillDate: "2026-10-11" },
      { id: "m30", name: "Ceftriaxone 1g", unit: "vials", category: "antibiotic", currentStock: 80, initialStock: 150, minimumThreshold: 30, daysSinceRefill: 7, lastRefillDate: "2026-10-11" },
      { id: "m31", name: "Insulin Human 40IU/ml", unit: "vials", category: "antidiabetic", currentStock: 40, initialStock: 80, minimumThreshold: 20, daysSinceRefill: 7, lastRefillDate: "2026-10-11" },
    ],
  },
];

// ─── Staff Members ─────────────────────────────────────────────────────────────

export const STAFF: StaffMember[] = [
  { id: "s1", name: "Dr. Priya Deshmukh", role: "Medical Officer", facilityId: "phc-wardha-sindi", employeeId: "WRD-001", phone: "9876543210", isCheckedIn: true, checkinTime: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "s2", name: "Nurse Rekha Shinde", role: "Nurse", facilityId: "phc-wardha-sindi", employeeId: "WRD-002", phone: "9876543211", isCheckedIn: true, checkinTime: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "s3", name: "ANM Sunita Borde", role: "ANM", facilityId: "phc-wardha-sindi", employeeId: "WRD-003", phone: "9876543212", isCheckedIn: false },
  { id: "s4", name: "Dr. Suresh Kale", role: "Medical Officer", facilityId: "phc-wardha-arvi", employeeId: "WRD-011", phone: "9876543220", isCheckedIn: true, checkinTime: new Date(Date.now() - 1.5 * 3600000).toISOString() },
  { id: "s5", name: "Pharmacist Ganesh More", role: "Pharmacist", facilityId: "phc-wardha-arvi", employeeId: "WRD-012", phone: "9876543221", isCheckedIn: false },
  { id: "s6", name: "Dr. Ramesh Bhoyar", role: "Medical Officer", facilityId: "chc-wardha-central", employeeId: "WRD-021", phone: "9876543230", isCheckedIn: true, checkinTime: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "s7", name: "Dr. Meena Thakre", role: "Medical Officer", facilityId: "chc-wardha-central", employeeId: "WRD-022", phone: "9876543231", isCheckedIn: true, checkinTime: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "s8", name: "Nurse Pooja Wankhede", role: "Nurse", facilityId: "chc-wardha-central", employeeId: "WRD-023", phone: "9876543232", isCheckedIn: true, checkinTime: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "s9", name: "Dr. Vandana Waghmare", role: "Medical Officer", facilityId: "phc-yavatmal-ner", employeeId: "YVT-001", phone: "9876543240", isCheckedIn: false },
  { id: "s10", name: "ANM Lalita Patil", role: "ANM", facilityId: "phc-yavatmal-ner", employeeId: "YVT-002", phone: "9876543241", isCheckedIn: true, checkinTime: new Date(Date.now() - 2 * 3600000).toISOString() },
];

// ─── Patients (Sample Queue Data) ─────────────────────────────────────────────

export const PATIENTS: Patient[] = [
  { id: "p1", token: "T001", name: "Ramabai Tayade", age: 65, gender: "F", symptoms: "High fever, chills, body ache for 3 days", arrivalTime: new Date(Date.now() - 45 * 60000).toISOString(), facilityId: "phc-wardha-sindi", status: "waiting" },
  { id: "p2", token: "T002", name: "Manoj Ingle", age: 34, gender: "M", symptoms: "Severe abdominal pain, vomiting", arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(), facilityId: "phc-wardha-sindi", status: "waiting" },
  { id: "p3", token: "T003", name: "Baby Sunita (6 months)", age: 0, gender: "F", symptoms: "High fever 40°C, difficulty breathing", arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(), facilityId: "phc-wardha-sindi", status: "waiting" },
  { id: "p4", token: "T004", name: "Vishnu Nandanwar", age: 52, gender: "M", symptoms: "Routine diabetes check-up, prescription refill", arrivalTime: new Date(Date.now() - 10 * 60000).toISOString(), facilityId: "phc-wardha-sindi", status: "waiting" },
  { id: "p5", token: "T005", name: "Geeta Raut", age: 28, gender: "F", symptoms: "9 months pregnant, regular check-up", arrivalTime: new Date(Date.now() - 5 * 60000).toISOString(), facilityId: "phc-wardha-sindi", status: "waiting" },
  { id: "p6", token: "T001", name: "Dilip Meshram", age: 44, gender: "M", symptoms: "Chest pain, left arm numbness since 20 mins", arrivalTime: new Date(Date.now() - 8 * 60000).toISOString(), facilityId: "chc-wardha-central", status: "in-consultation", priority: "P1", urgencyLabel: "Emergency", estimatedWaitMinutes: 0 },
  { id: "p7", token: "T002", name: "Suman Alone", age: 19, gender: "F", symptoms: "Persistent diarrhea for 2 days, mild dehydration", arrivalTime: new Date(Date.now() - 60 * 60000).toISOString(), facilityId: "chc-wardha-central", status: "waiting", priority: "P3" },
];

// ─── Beds ──────────────────────────────────────────────────────────────────────

export const BEDS: Bed[] = [
  // PHC Sindi — 12 general, 4 oxygen
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `phc-wardha-sindi-gen-${i + 1}`,
    facilityId: "phc-wardha-sindi",
    bedNumber: i + 1,
    type: "general" as const,
    status: (i < 7 ? "occupied" : "available") as "occupied" | "available",
    patientName: i < 7 ? `Patient ${i + 1}` : undefined,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `phc-wardha-sindi-oxy-${i + 1}`,
    facilityId: "phc-wardha-sindi",
    bedNumber: i + 1,
    type: "oxygen" as const,
    status: (i < 3 ? "occupied" : "available") as "occupied" | "available",
  })),
  // CHC Wardha Central — 6 ICU, 40 general, 15 oxygen
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `chc-wardha-central-icu-${i + 1}`,
    facilityId: "chc-wardha-central",
    bedNumber: i + 1,
    type: "icu" as const,
    status: (i < 5 ? "occupied" : "available") as "occupied" | "available",
    patientName: i < 5 ? `ICU Patient ${i + 1}` : undefined,
  })),
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `chc-wardha-central-gen-${i + 1}`,
    facilityId: "chc-wardha-central",
    bedNumber: i + 1,
    type: "general" as const,
    status: (i < 28 ? "occupied" : i === 35 ? "maintenance" : "available") as BedStatus,
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `chc-wardha-central-oxy-${i + 1}`,
    facilityId: "chc-wardha-central",
    bedNumber: i + 1,
    type: "oxygen" as const,
    status: (i < 10 ? "occupied" : "available") as "occupied" | "available",
  })),
];

// Helper to get facility by ID
export function getFacilityById(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}

// Helper to get inventory by facility ID
export function getInventoryByFacility(facilityId: string): FacilityInventory | undefined {
  return INVENTORY.find((inv) => inv.facilityId === facilityId);
}

// Helper to get beds by facility ID
export function getBedsByFacility(facilityId: string): Bed[] {
  return BEDS.filter((b) => b.facilityId === facilityId);
}

// Helper to get staff by facility ID
export function getStaffByFacility(facilityId: string): StaffMember[] {
  return STAFF.filter((s) => s.facilityId === facilityId);
}

// Helper to get patients by facility ID
export function getPatientsByFacility(facilityId: string): Patient[] {
  return PATIENTS.filter((p) => p.facilityId === facilityId);
}

type BedStatus = "available" | "occupied" | "maintenance";
