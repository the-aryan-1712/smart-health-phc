import { create } from "zustand";
import { PATIENTS } from "@/data/seed";
import type { Patient, QueueStatus, TriagePriority } from "@/types/patient";
import { tokenFromNumber, calculateEstimatedWait } from "@/lib/triage";

interface PatientState {
  selectedFacilityId: string;
  patients: Patient[];
  filterPriority: "all" | TriagePriority;
  searchQuery: string;

  setSelectedFacilityId: (id: string) => void;
  setFilterPriority: (priority: "all" | TriagePriority) => void;
  setSearchQuery: (query: string) => void;

  addPatient: (
    data: Pick<Patient, "name" | "age" | "gender" | "symptoms" | "facilityId"> & {
      priority?: TriagePriority;
      urgencyLabel?: string;
      chiefComplaint?: string;
      recommendedAction?: string;
    }
  ) => Patient;

  updatePatientTriage: (
    patientId: string,
    triage: {
      priority: TriagePriority;
      urgencyLabel: string;
      chiefComplaint?: string;
      recommendedAction?: string;
      estimatedWaitMinutes?: number;
    }
  ) => void;

  updatePatientStatus: (patientId: string, status: QueueStatus) => void;

  getFacilityQueue: (facilityId: string) => Patient[];
}

export const usePatientStore = create<PatientState>((set, get) => ({
  selectedFacilityId: "phc-wardha-sindi",
  patients: PATIENTS,
  filterPriority: "all",
  searchQuery: "",

  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addPatient: (data) => {
    const existingForFacility = get().patients.filter(
      (p) => p.facilityId === data.facilityId
    );
    const nextTokenNum = existingForFacility.length + 1;
    const token = tokenFromNumber(nextTokenNum);

    const waitingAhead = existingForFacility.filter(
      (p) => p.status === "waiting"
    ).length;

    const estimatedWait = data.priority
      ? calculateEstimatedWait(data.priority, waitingAhead)
      : calculateEstimatedWait("P3", waitingAhead);

    const newPatient: Patient = {
      id: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      token,
      name: data.name,
      age: data.age,
      gender: data.gender,
      symptoms: data.symptoms,
      arrivalTime: new Date().toISOString(),
      facilityId: data.facilityId,
      status: "waiting",
      priority: data.priority || "P3",
      urgencyLabel: data.urgencyLabel || "Semi-urgent",
      chiefComplaint: data.chiefComplaint || data.symptoms,
      recommendedAction: data.recommendedAction,
      estimatedWaitMinutes: estimatedWait,
    };

    set((state) => ({
      patients: [newPatient, ...state.patients],
    }));

    return newPatient;
  },

  updatePatientTriage: (patientId, triage) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;
        const waitingAhead = state.patients.filter(
          (other) => other.facilityId === p.facilityId && other.status === "waiting"
        ).length;
        const waitMins =
          triage.estimatedWaitMinutes !== undefined
            ? triage.estimatedWaitMinutes
            : calculateEstimatedWait(triage.priority, waitingAhead);

        return {
          ...p,
          priority: triage.priority,
          urgencyLabel: triage.urgencyLabel,
          chiefComplaint: triage.chiefComplaint || p.chiefComplaint,
          recommendedAction: triage.recommendedAction || p.recommendedAction,
          estimatedWaitMinutes: waitMins,
        };
      }),
    }));
  },

  updatePatientStatus: (patientId, status) => {
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patientId ? { ...p, status } : p
      ),
    }));
  },

  getFacilityQueue: (facilityId) => {
    const priorityWeight: Record<TriagePriority, number> = {
      P1: 0,
      P2: 1,
      P3: 2,
      P4: 3,
    };

    return get()
      .patients.filter((p) => p.facilityId === facilityId)
      .sort((a, b) => {
        // First sort by status: in-consultation first, then waiting, then completed
        if (a.status === "in-consultation" && b.status !== "in-consultation") return -1;
        if (b.status === "in-consultation" && a.status !== "in-consultation") return 1;

        // Then by priority
        const pA = a.priority ? priorityWeight[a.priority] : 2;
        const pB = b.priority ? priorityWeight[b.priority] : 2;
        if (pA !== pB) return pA - pB;

        // Then by arrival time (FIFO)
        return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
      });
  },
}));
