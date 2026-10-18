"use client";

import React from "react";
import {
  Map,
  Building2,
  Bed,
  Package,
  Users,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useFacilityStore } from "@/store/facilityStore";
import { KPICard } from "@/components/shared/KPICard";
import { FacilityMap } from "@/components/district/FacilityMap";
import { MetricsComparisonTable } from "@/components/district/MetricsComparisonTable";
import { AIBriefingCard } from "@/components/district/AIBriefingCard";
import { AlertFeed } from "@/components/district/AlertFeed";

export default function DistrictCommandCenterPage() {
  const {
    selectedDistrict,
    setSelectedDistrict,
    selectedFacilityId,
    setSelectedFacilityId,
    getDistrictMetrics,
    getDistrictAlerts,
  } = useFacilityStore();

  const metrics = getDistrictMetrics();
  const alerts = getDistrictAlerts();

  // Aggregate stats
  const totalBeds = metrics.reduce((acc, m) => acc + m.totalBeds, 0);
  const occupiedBeds = metrics.reduce((acc, m) => acc + m.occupiedBeds, 0);
  const avgOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const avgStockHealth = Math.round(
    (metrics.reduce((acc, m) => acc + m.stockHealthRate, 0) / (metrics.length || 1)) * 100
  );

  const avgAttendance = Math.round(
    (metrics.reduce((acc, m) => acc + m.attendanceRate, 0) / (metrics.length || 1)) * 100
  );

  const totalCriticalStock = metrics.reduce((acc, m) => acc + m.criticalMedicines, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & District Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Map className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            District Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated intelligence across Wardha and Yavatmal Primary & Community Health Centres.
          </p>
        </div>

        {/* District Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" aria-hidden="true" />
          <label htmlFor="district-select" className="sr-only">
            Select District
          </label>
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value as any)}
            className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none pr-3 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">
              All Districts (Wardha + Yavatmal)
            </option>
            <option value="Wardha" className="bg-slate-900 text-white">
              Wardha District Only (4 Centres)
            </option>
            <option value="Yavatmal" className="bg-slate-900 text-white">
              Yavatmal District Only (4 Centres)
            </option>
          </select>
        </div>
      </div>

      {/* Aggregate District KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Health Centres"
          value={metrics.length}
          unit="Centres Monitored"
          icon={<Building2 className="w-5 h-5" />}
          description="6 PHCs + 2 CHCs"
        />
        <KPICard
          label="District Bed Occupancy"
          value={avgOccupancy}
          unit="%"
          status={avgOccupancy >= 80 ? "critical" : "ok"}
          icon={<Bed className="w-5 h-5" />}
          description={`${occupiedBeds} of ${totalBeds} beds utilized`}
        />
        <KPICard
          label="Supply Resilience Score"
          value={avgStockHealth}
          unit="%"
          status={totalCriticalStock > 0 ? "low" : "ok"}
          icon={<Package className="w-5 h-5" />}
          description={`${totalCriticalStock} critical stockout warnings`}
        />
        <KPICard
          label="Doctor & Staff Compliance"
          value={avgAttendance}
          unit="%"
          status={avgAttendance >= 80 ? "ok" : "low"}
          icon={<Users className="w-5 h-5" />}
          description="Shift punch-in compliance"
        />
      </div>

      {/* Gemini Morning SitRep Briefing */}
      <AIBriefingCard />

      {/* Geospatial Map */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Geospatial Facility Operations Heatmap</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Live GIS
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Click any pin to inspect real-time center telemetry
          </span>
        </div>
        <FacilityMap
          metrics={metrics}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={setSelectedFacilityId}
        />
      </div>

      {/* Comparison Table & Live Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white">Facility Benchmarking Matrix</h2>
          <MetricsComparisonTable
            metrics={metrics}
            onSelectFacility={setSelectedFacilityId}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">District Event Telemetry</h2>
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
