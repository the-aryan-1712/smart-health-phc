"use client";

import React, { useState } from "react";
import type { Bed, BedStatus } from "@/types/bed";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Wrench, UserCheck, AlertCircle } from "lucide-react";

interface BedStatusToggleProps {
  bed: Bed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (bedId: string, status: BedStatus, patientName?: string) => void;
}

export function BedStatusToggle({
  bed,
  open,
  onOpenChange,
  onStatusChange,
}: BedStatusToggleProps) {
  if (!bed) return null;

  const [selectedStatus, setSelectedStatus] = useState<BedStatus>(bed.status);
  const [patientName, setPatientName] = useState(bed.patientName || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusChange(
      bed.id,
      selectedStatus,
      selectedStatus === "occupied" ? patientName || "Admitted Patient" : undefined
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Update Bed {bed.bedNumber} ({bed.type.toUpperCase()})</DialogTitle>
        <DialogDescription>
          Adjust ward availability status or admit a patient.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Current Status Selection
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus("available")}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                selectedStatus === "available"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Available</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("occupied")}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                selectedStatus === "occupied"
                  ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4 text-rose-400" aria-hidden="true" />
              <span>Occupied</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("maintenance")}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                selectedStatus === "maintenance"
                  ? "bg-amber-950/80 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Maintenance</span>
            </button>
          </div>
        </div>

        {selectedStatus === "occupied" && (
          <div className="space-y-1.5">
            <label htmlFor="bed-patient-name" className="block text-xs font-medium text-slate-300">
              Admitted Patient Name / Token
            </label>
            <input
              id="bed-patient-name"
              type="text"
              placeholder="e.g. Rameshwar Shinde (T003)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Confirm Bed Status
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
