"use client";

import React from "react";
import {
  User,
  AlertCircle,
  Activity,
  CheckCircle,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { Patient, QueueStatus } from "@/types/patient";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaitTimeBadge } from "./WaitTimeBadge";
import { getPriorityLabel } from "@/lib/triage";

interface TokenCardProps {
  patient: Patient;
  onStatusChange: (patientId: string, status: QueueStatus) => void;
  onRetriage?: (patient: Patient) => void;
}

export function TokenCard({
  patient,
  onStatusChange,
  onRetriage,
}: TokenCardProps) {
  const priority = patient.priority || "P3";
  const isEmergency = priority === "P1";
  const isUrgent = priority === "P2";
  const isInConsultation = patient.status === "in-consultation";
  const isCompleted = patient.status === "completed";

  const arrivalDate = new Date(patient.arrivalTime);
  const formattedArrival = arrivalDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className={`border transition-all duration-200 ${
        isEmergency
          ? "border-red-500/60 bg-gradient-to-br from-red-950/40 via-slate-900/80 to-slate-900/60"
          : isUrgent
          ? "border-orange-500/40 bg-slate-900/70"
          : isInConsultation
          ? "border-emerald-500/50 bg-emerald-950/20"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
      }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Token Number & Name */}
          <div className="flex items-center gap-3">
            <span
              className={`font-mono font-black text-lg px-2.5 py-1 rounded-lg border ${
                isEmergency
                  ? "bg-red-500/30 text-red-200 border-red-500/50"
                  : isUrgent
                  ? "bg-orange-500/20 text-orange-200 border-orange-500/40"
                  : "bg-slate-800 text-emerald-400 border-slate-700"
              }`}
            >
              {patient.token}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base leading-tight">
                  {patient.name}
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {patient.age}y • {patient.gender}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Arrived: {formattedArrival}
              </span>
            </div>
          </div>

          {/* Triage Priority Badge & Wait Time */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <Badge
              variant={
                priority === "P1"
                  ? "p1"
                  : priority === "P2"
                  ? "p2"
                  : priority === "P3"
                  ? "p3"
                  : "p4"
              }
            >
              {isEmergency && <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{priority}: {getPriorityLabel(priority)}</span>
            </Badge>

            {!isCompleted && patient.estimatedWaitMinutes !== undefined && (
              <WaitTimeBadge minutes={patient.estimatedWaitMinutes} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Symptoms / Chief Complaint */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
          <span className="font-semibold text-slate-200">Symptoms: </span>
          <span>{patient.symptoms}</span>
          {patient.recommendedAction && (
            <div className="mt-1 pt-1 border-t border-slate-800/60 text-emerald-300">
              <span className="font-semibold text-emerald-400">Clinical Protocol: </span>
              {patient.recommendedAction}
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                isInConsultation
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isCompleted
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-800 text-amber-300"
              }`}
            >
              {patient.status.replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRetriage && !isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetriage(patient)}
                className="text-xs h-7 px-2 text-slate-400 hover:text-white"
              >
                Re-Triage
              </Button>
            )}

            {patient.status === "waiting" && (
              <Button
                size="sm"
                onClick={() => onStatusChange(patient.id, "in-consultation")}
                className="text-xs h-7 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Stethoscope className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Call into Clinic
              </Button>
            )}

            {patient.status === "in-consultation" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onStatusChange(patient.id, "completed")}
                className="text-xs h-7 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" aria-hidden="true" />
                Discharge / Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
