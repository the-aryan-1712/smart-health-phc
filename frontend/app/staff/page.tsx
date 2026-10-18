"use client";

import React, { useState } from "react";
import {
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { FACILITIES } from "@/data/seed";
import { useStaffStore } from "@/store/staffStore";
import { KPICard } from "@/components/shared/KPICard";
import { AttendanceRow } from "@/components/staff/AttendanceRow";
import { AbsenceAlertBanner } from "@/components/staff/AbsenceAlertBanner";
import { RosterCalendar } from "@/components/staff/RosterCalendar";
import { IncidentReportModal } from "@/components/staff/IncidentReportModal";
import type { StaffMember, IncidentReport } from "@/types/staff";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StaffRosterPage() {
  const {
    selectedFacilityId,
    setSelectedFacilityId,
    getFacilityStaff,
    getFacilityRoster,
    getFacilityAbsences,
    getAttendanceSummary,
    toggleCheckin,
    addIncidentReport,
    incidentReports,
  } = useStaffStore();

  const [activeStaffForIncident, setActiveStaffForIncident] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentFacility =
    FACILITIES.find((f) => f.id === selectedFacilityId) || FACILITIES[0];

  const staffMembers = getFacilityStaff(selectedFacilityId);
  const rosterEntries = getFacilityRoster(selectedFacilityId);
  const absences = getFacilityAbsences(selectedFacilityId);
  const summary = getAttendanceSummary(selectedFacilityId);

  const attendancePercent = Math.round(summary.attendanceRate * 100);

  const handleOpenIncident = (member: StaffMember) => {
    setActiveStaffForIncident(member);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            Doctor & Staff Duty Roster
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time biometric attendance, absence detection, and AI incident escalation.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" aria-hidden="true" />
          <label htmlFor="staff-facility-select" className="sr-only">
            Select Health Facility
          </label>
          <select
            id="staff-facility-select"
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
      </div>

      {/* Critical Absence Alert Banner */}
      <AbsenceAlertBanner
        absentStaff={absences}
        onDraftIncident={handleOpenIncident}
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Staff Scheduled"
          value={staffMembers.length}
          unit="Members"
          icon={<Users className="w-5 h-5" />}
          description={`Roster for ${currentFacility.name}`}
        />
        <KPICard
          label="Active On-Duty"
          value={staffMembers.filter((s) => s.isCheckedIn).length}
          unit="Punched In"
          status="ok"
          icon={<UserCheck className="w-5 h-5" />}
          description="Verified present in facility"
        />
        <KPICard
          label="Absence Alerts"
          value={absences.length}
          unit="Unexcused"
          status={absences.length > 0 ? "critical" : "ok"}
          icon={<UserX className="w-5 h-5" />}
          description=">30 min grace period expired"
        />
        <KPICard
          label="Attendance Rate"
          value={attendancePercent}
          unit="%"
          status={attendancePercent >= 80 ? "ok" : "low"}
          icon={<Clock className="w-5 h-5" />}
          description="Shift compliance today"
        />
      </div>

      {/* Roster & Attendance Tabs */}
      <Tabs defaultValue="roster">
        <TabsList aria-label="Staff Management Views">
          <TabsTrigger value="roster">Live Attendance Roster ({staffMembers.length})</TabsTrigger>
          <TabsTrigger value="shifts">Daily Shift Matrix</TabsTrigger>
          <TabsTrigger value="incidents">
            Filed Incident Reports ({incidentReports.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Attendance */}
        <TabsContent value="roster" className="space-y-3 pt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">Facility Personnel Check-In Status</h2>
            <span className="text-xs text-slate-400">
              Click &quot;Punched Present&quot; or &quot;Mark Check-Out&quot; to toggle attendance
            </span>
          </div>

          <div className="space-y-3">
            {staffMembers.map((member) => (
              <AttendanceRow
                key={member.id}
                member={member}
                onToggleCheckin={toggleCheckin}
                onDraftIncident={handleOpenIncident}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Shift Matrix */}
        <TabsContent value="shifts" className="space-y-3 pt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">Rotational Duty Schedule</h2>
            <span className="text-xs text-slate-400">
              Shift allocations for {new Date().toLocaleDateString()}
            </span>
          </div>
          <RosterCalendar roster={rosterEntries} staff={staffMembers} />
        </TabsContent>

        {/* Tab 3: Incidents Log */}
        <TabsContent value="incidents" className="space-y-3 pt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">Administrative Incident Audit Trail</h2>
            <span className="text-xs text-slate-400">
              Official records transmitted to District Health Office (DHO)
            </span>
          </div>

          {incidentReports.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
              <h4 className="text-base font-semibold text-slate-300">No incident reports filed</h4>
              <p className="text-xs text-slate-500">
                When staff absence alerts trigger, click &quot;Report Absence&quot; to draft an AI report.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidentReports.map((inc) => (
                <div
                  key={inc.incidentId}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">
                      {inc.incidentId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase ${
                        inc.severity === "high"
                          ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                          : "bg-amber-950 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {inc.severity} Severity
                    </span>
                  </div>
                  <p className="text-slate-300">{inc.summary}</p>
                  <div className="pt-2 border-t border-slate-800/60 text-emerald-300">
                    <strong>Action: </strong> {inc.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Incident Modal */}
      <IncidentReportModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        staffMember={activeStaffForIncident}
        facilityName={currentFacility.name}
        facilityId={selectedFacilityId}
        onReportSaved={addIncidentReport}
      />
    </div>
  );
}
