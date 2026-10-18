"use client";

import React, { useState } from "react";
import {
  Users,
  ShieldAlert,
  Clock,
  UserCheck,
  Building2,
  UserPlus,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { FACILITIES } from "@/data/seed";
import { usePatientStore } from "@/store/patientStore";
import { KPICard } from "@/components/shared/KPICard";
import { QueueList } from "@/components/patients/QueueList";
import { TriageModal } from "@/components/patients/TriageModal";
import type { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";

export default function PatientsTriagePage() {
  const {
    selectedFacilityId,
    setSelectedFacilityId,
    getFacilityQueue,
    addPatient,
    updatePatientTriage,
    updatePatientStatus,
  } = usePatientStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retriagePatient, setRetriagePatient] = useState<Patient | null>(null);

  const currentFacility =
    FACILITIES.find((f) => f.id === selectedFacilityId) || FACILITIES[0];

  const queue = getFacilityQueue(selectedFacilityId);

  // Computed metrics
  const waitingPatients = queue.filter((p) => p.status === "waiting");
  const inConsultation = queue.filter((p) => p.status === "in-consultation");
  const p1Emergencies = waitingPatients.filter((p) => p.priority === "P1");
  const p2Urgent = waitingPatients.filter((p) => p.priority === "P2");

  const totalWaitMinutes = waitingPatients.reduce(
    (acc, p) => acc + (p.estimatedWaitMinutes || 0),
    0
  );
  const avgWait =
    waitingPatients.length > 0
      ? Math.round(totalWaitMinutes / waitingPatients.length)
      : 0;

  const handleOpenAdmit = () => {
    setRetriagePatient(null);
    setIsModalOpen(true);
  };

  const handleOpenRetriage = (patient: Patient) => {
    setRetriagePatient(patient);
    setIsModalOpen(true);
  };

  const handleSavePatient = (data: any) => {
    if (retriagePatient) {
      updatePatientTriage(retriagePatient.id, {
        priority: data.priority,
        urgencyLabel: data.urgencyLabel,
        chiefComplaint: data.chiefComplaint,
        recommendedAction: data.recommendedAction,
      });
    } else {
      addPatient(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <HeartPulse className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            Patient Flow & AI Triage Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time outpatient queuing, emergency fast-tracking, and Gemini-assisted triage.
          </p>
        </div>

        {/* Action & Facility Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <Building2 className="w-4 h-4 text-slate-400 ml-2" aria-hidden="true" />
            <label htmlFor="patient-facility-select" className="sr-only">
              Select Health Facility
            </label>
            <select
              id="patient-facility-select"
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none pr-3 cursor-pointer"
            >
              {FACILITIES.map((fac) => (
                <option key={fac.id} value={fac.id} className="bg-slate-900 text-white">
                  {fac.name} ({fac.type})
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleOpenAdmit} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50">
            <UserPlus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Admit Patient
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Waiting Outpatients"
          value={waitingPatients.length}
          unit="Patients"
          icon={<Users className="w-5 h-5" />}
          description={`OPD queue for ${currentFacility.name}`}
        />
        <KPICard
          label="P1 Emergency Alerts"
          value={p1Emergencies.length}
          unit="Cases"
          status={p1Emergencies.length > 0 ? "critical" : "ok"}
          icon={<ShieldAlert className="w-5 h-5" />}
          description="Immediate doctor intervention"
        />
        <KPICard
          label="Average Wait Time"
          value={avgWait}
          unit="mins"
          status={avgWait > 30 ? "low" : "ok"}
          icon={<Clock className="w-5 h-5" />}
          description="Estimated till physician consult"
        />
        <KPICard
          label="Active Consultations"
          value={inConsultation.length}
          unit="In Clinic"
          status="ok"
          icon={<Stethoscope className="w-5 h-5" />}
          description="Doctors actively attending"
        />
      </div>

      {/* Patient Queue List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Prioritized Patient Tokens</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Live Queue
            </span>
          </h2>
        </div>

        <QueueList
          patients={queue}
          onStatusChange={updatePatientStatus}
          onRetriage={handleOpenRetriage}
          onAdmitNew={handleOpenAdmit}
        />
      </div>

      {/* Triage Modal Dialog */}
      <TriageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        facilityId={selectedFacilityId}
        existingPatient={retriagePatient}
        onPatientSaved={handleSavePatient}
      />
    </div>
  );
}
