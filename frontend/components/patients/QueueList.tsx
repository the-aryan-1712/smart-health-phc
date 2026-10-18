"use client";

import React, { useState } from "react";
import { Search, Users, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import type { Patient, QueueStatus, TriagePriority } from "@/types/patient";
import { TokenCard } from "./TokenCard";
import { Button } from "@/components/ui/button";

interface QueueListProps {
  patients: Patient[];
  onStatusChange: (patientId: string, status: QueueStatus) => void;
  onRetriage: (patient: Patient) => void;
  onAdmitNew: () => void;
}

export function QueueList({
  patients,
  onStatusChange,
  onRetriage,
  onAdmitNew,
}: QueueListProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TriagePriority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "in-consultation" | "completed">("all");

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toLowerCase().includes(search.toLowerCase()) ||
      p.symptoms.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || p.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const waitingCount = patients.filter((p) => p.status === "waiting").length;
  const emergencyCount = patients.filter(
    (p) => p.priority === "P1" && p.status === "waiting"
  ).length;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search token, patient name, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search patient queue"
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "P1", "P2", "P3", "P4"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              aria-pressed={priorityFilter === p}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                priorityFilter === p
                  ? p === "P1"
                    ? "bg-red-950 text-red-200 border border-red-500/50"
                    : p === "P2"
                    ? "bg-orange-950 text-orange-200 border border-orange-500/50"
                    : p === "P3"
                    ? "bg-amber-950 text-amber-200 border border-amber-500/50"
                    : p === "P4"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-500/50"
                    : "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800"
              }`}
            >
              {p === "all" ? "All Priorities" : p}
            </button>
          ))}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter by queue status"
            className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ml-1"
          >
            <option value="all">All Statuses</option>
            <option value="waiting">Waiting Only</option>
            <option value="in-consultation">In Clinic</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Emergency Alert Indicator if P1 waiting */}
      {emergencyCount > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center justify-between p-3 rounded-lg border border-red-500/50 bg-red-950/50 text-red-200 text-xs sm:text-sm animate-pulse"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
            <span className="font-bold">
              Immediate Attention: {emergencyCount} P1 Emergency patient waiting in queue!
            </span>
          </div>
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-red-900/60 font-bold">
            Zero Wait Target
          </span>
        </div>
      )}

      {/* Live Accessible Queue Container */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Patient Queue"
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <Users className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
            <h4 className="text-base font-semibold text-slate-300">Queue is clear</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No patients match current filters. Click below to register and triage a new walk-in patient.
            </p>
            <Button size="sm" onClick={onAdmitNew}>
              Admit New Patient
            </Button>
          </div>
        ) : (
          filtered.map((patient) => (
            <TokenCard
              key={patient.id}
              patient={patient}
              onStatusChange={onStatusChange}
              onRetriage={onRetriage}
            />
          ))
        )}
      </div>
    </div>
  );
}
