"use client";

import React, { useState } from "react";
import {
  Bed as BedIcon,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRightLeft,
} from "lucide-react";
import { FACILITIES } from "@/data/seed";
import { useBedStore } from "@/store/bedStore";
import { OccupancyMeter } from "@/components/beds/OccupancyMeter";
import { BedGrid } from "@/components/beds/BedGrid";
import { BedStatusToggle } from "@/components/beds/BedStatusToggle";
import type { Bed } from "@/types/bed";
import { Button } from "@/components/ui/button";

export default function BedsPage() {
  const {
    selectedFacilityId,
    setSelectedFacilityId,
    beds,
    getOccupancySummary,
    toggleBedStatus,
    getAllFacilitiesOccupancy,
  } = useBedStore();

  const [activeBed, setActiveBed] = useState<Bed | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentFacility =
    FACILITIES.find((f) => f.id === selectedFacilityId) || FACILITIES[0];

  const facilityBeds = beds.filter((b) => b.facilityId === selectedFacilityId);
  const summary = getOccupancySummary(selectedFacilityId);
  const crossFacility = getAllFacilitiesOccupancy();

  const handleBedClick = (bed: Bed) => {
    setActiveBed(bed);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BedIcon className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            Bed & Resource Allocation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ward telemetry, ICU availability, and district-wide referral routing.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" aria-hidden="true" />
          <label htmlFor="bed-facility-select" className="sr-only">
            Select Health Facility
          </label>
          <select
            id="bed-facility-select"
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

      {/* Ward Occupancy Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OccupancyMeter
          label="Total Ward Occupancy"
          occupied={summary.occupied}
          total={summary.total}
          type="total"
        />
        <OccupancyMeter
          label="ICU Bed Utilization"
          occupied={summary.byType.icu.occupied}
          total={summary.byType.icu.total}
          type="icu"
        />
        <OccupancyMeter
          label="Oxygen Supported Beds"
          occupied={summary.byType.oxygen.occupied}
          total={summary.byType.oxygen.total}
          type="oxygen"
        />
        <OccupancyMeter
          label="General Ward Beds"
          occupied={summary.byType.general.occupied}
          total={summary.byType.general.total}
          type="general"
        />
      </div>

      {/* Interactive Ward Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Ward Bed Allocation Matrix</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {facilityBeds.length} Beds Total
            </span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any bed cell to adjust admission status or maintenance
          </span>
        </div>

        <BedGrid beds={facilityBeds} onBedClick={handleBedClick} />
      </div>

      {/* Cross-Facility Referral Availability Grid */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <h3 className="font-bold text-white text-base">
              Cross-Facility Referral Routing & Bed Availability
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            For patient transfers when local capacity is saturated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {FACILITIES.filter((f) => f.id !== selectedFacilityId).map((fac) => {
            const facSummary = useBedStore.getState().getOccupancySummary(fac.id);
            const freeICU = facSummary.byType.icu.total - facSummary.byType.icu.occupied;
            const freeOxygen = facSummary.byType.oxygen.total - facSummary.byType.oxygen.occupied;
            const freeTotal = facSummary.total - facSummary.occupied;

            return (
              <div
                key={fac.id}
                className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>{fac.name}</span>
                  <span className="text-slate-400 font-normal">{fac.type}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Vacant:</span>
                  <span className="font-mono font-bold text-emerald-400">{freeTotal} beds</span>
                </div>
                {fac.beds.icu > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>ICU Available:</span>
                    <span className={`font-mono font-bold ${freeICU > 0 ? "text-purple-300" : "text-rose-400"}`}>
                      {freeICU} free
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-300">
                  <span>Oxygen Beds:</span>
                  <span className="font-mono font-bold text-cyan-300">{freeOxygen} free</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className="w-full h-6 text-[11px] mt-1 border-slate-800 text-slate-300 hover:text-white"
                >
                  Switch to Facility
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bed Status Toggle Modal */}
      <BedStatusToggle
        bed={activeBed}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onStatusChange={toggleBedStatus}
      />
    </div>
  );
}
