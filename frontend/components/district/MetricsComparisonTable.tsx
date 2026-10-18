"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Building2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import type { FacilityDistrictMetric } from "@/store/facilityStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SeverityBadge } from "@/components/shared/SeverityBadge";

interface MetricsComparisonTableProps {
  metrics: FacilityDistrictMetric[];
  onSelectFacility?: (facilityId: string) => void;
}

export function MetricsComparisonTable({
  metrics,
  onSelectFacility,
}: MetricsComparisonTableProps) {
  const [sortField, setSortField] = useState<
    "name" | "occupancy" | "stock" | "attendance" | "patients"
  >("occupancy");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...metrics].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.facility.name.localeCompare(b.facility.name);
    } else if (sortField === "occupancy") {
      comparison = a.bedOccupancyRate - b.bedOccupancyRate;
    } else if (sortField === "stock") {
      comparison = a.stockHealthRate - b.stockHealthRate;
    } else if (sortField === "attendance") {
      comparison = a.attendanceRate - b.attendanceRate;
    } else if (sortField === "patients") {
      comparison = a.waitingPatients - b.waitingPatients;
    }
    return sortAsc ? comparison : -comparison;
  });

  const toggleSort = (
    field: "name" | "occupancy" | "stock" | "attendance" | "patients"
  ) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for rates
    }
  };

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
              >
                Facility & District
                <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("occupancy")}
                className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
              >
                Bed Occupancy
                <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("stock")}
                className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
              >
                Stock Health
                <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("attendance")}
                className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
              >
                Staff Attendance
                <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("patients")}
                className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
              >
                OPD Queue
                <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </TableHead>
            <TableHead>Overall Health</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item) => {
            const occPercent = Math.round(item.bedOccupancyRate * 100);
            const stockPercent = Math.round(item.stockHealthRate * 100);
            const attPercent = Math.round(item.attendanceRate * 100);

            return (
              <TableRow key={item.facility.id}>
                {/* Facility Name */}
                <TableCell>
                  <div className="font-semibold text-white">
                    {item.facility.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.facility.type} • {item.facility.district} District
                  </div>
                </TableCell>

                {/* Bed Occupancy */}
                <TableCell className="min-w-[140px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-white">
                      {item.occupiedBeds}/{item.totalBeds} beds
                    </span>
                    <span className="font-mono text-slate-400">{occPercent}%</span>
                  </div>
                  <Progress
                    value={occPercent}
                    label={`${item.facility.name} bed occupancy: ${occPercent}%`}
                    indicatorClassName={
                      occPercent >= 85
                        ? "bg-rose-500"
                        : occPercent >= 70
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }
                  />
                </TableCell>

                {/* Stock Health */}
                <TableCell className="min-w-[140px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-white">
                      {stockPercent}% healthy
                    </span>
                    {item.criticalMedicines > 0 && (
                      <span className="text-rose-400 font-bold text-[11px]">
                        {item.criticalMedicines} crit
                      </span>
                    )}
                  </div>
                  <Progress
                    value={stockPercent}
                    label={`${item.facility.name} stock health: ${stockPercent}%`}
                    indicatorClassName={
                      stockPercent < 70
                        ? "bg-rose-500"
                        : stockPercent < 90
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }
                  />
                </TableCell>

                {/* Staff Attendance */}
                <TableCell>
                  <span className="font-mono font-bold text-slate-100">
                    {attPercent}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">on shift</span>
                </TableCell>

                {/* Patient Queue */}
                <TableCell>
                  <div className="font-mono font-bold text-slate-100">
                    {item.waitingPatients} waiting
                  </div>
                  {item.p1EmergencyPatients > 0 && (
                    <span className="text-[11px] font-bold text-rose-400">
                      {item.p1EmergencyPatients} P1 Urgent
                    </span>
                  )}
                </TableCell>

                {/* Severity Status */}
                <TableCell>
                  <SeverityBadge severity={item.overallStatus} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/supply`}
                      className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      Supply
                    </Link>
                    <Link
                      href={`/beds`}
                      className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      Beds
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
