// Core facility types for Smart Health system

export type FacilityType = "PHC" | "CHC";
export type District = "Wardha" | "Yavatmal";

export interface BedCounts {
  icu: number;
  general: number;
  oxygen: number;
}

export interface FacilityLocation {
  lat: number;
  lng: number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: District;
  location: FacilityLocation;
  beds: BedCounts;
  address: string;
  phone: string;
  inCharge: string; // Medical Officer name
}
