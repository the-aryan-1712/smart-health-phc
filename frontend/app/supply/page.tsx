"use client";

import React, { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Package,
  Building2,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { FACILITIES } from "@/data/seed";
import { useSupplyStore } from "@/store/supplyStore";
import { KPICard } from "@/components/shared/KPICard";
import { StockAlertBanner } from "@/components/supply/StockAlertBanner";
import { BurnRateCard } from "@/components/supply/BurnRateCard";
import { InventoryTable } from "@/components/supply/InventoryTable";
import { ReorderModal } from "@/components/supply/ReorderModal";
import type { MedicineWithMetrics } from "@/types/supply";
import { Button } from "@/components/ui/button";

export default function SupplyChainPage() {
  const {
    selectedFacilityId,
    setSelectedFacilityId,
    getEnrichedMedicines,
    reorderMedicine,
  } = useSupplyStore();

  const [activeReorderItem, setActiveReorderItem] = useState<MedicineWithMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentFacility =
    FACILITIES.find((f) => f.id === selectedFacilityId) || FACILITIES[0];

  const enrichedMedicines = getEnrichedMedicines(selectedFacilityId);

  // Metrics
  const criticalItems = enrichedMedicines.filter((m) => m.status === "critical");
  const lowItems = enrichedMedicines.filter((m) => m.status === "low");
  const okItems = enrichedMedicines.filter((m) => m.status === "ok");

  const handleOpenReorder = (item: MedicineWithMetrics) => {
    setActiveReorderItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            Supply Chain & Medicine Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated consumption telemetry, burn-rate velocity, and predictive replenishment.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" aria-hidden="true" />
          <label htmlFor="facility-select" className="sr-only">
            Select Health Facility
          </label>
          <select
            id="facility-select"
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none pr-3 cursor-pointer"
          >
            {FACILITIES.map((fac) => (
              <option key={fac.id} value={fac.id} className="bg-slate-900 text-white">
                {fac.name} ({fac.type} • {fac.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      <StockAlertBanner
        criticalItems={criticalItems}
        onReorderClick={handleOpenReorder}
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Medicines Tracked"
          value={enrichedMedicines.length}
          unit="SKUs"
          icon={<Package className="w-5 h-5" />}
          description={`Catalog for ${currentFacility.name}`}
        />
        <KPICard
          label="Critical Stockouts"
          value={criticalItems.length}
          unit="SKUs"
          status={criticalItems.length > 0 ? "critical" : "ok"}
          icon={<AlertTriangle className="w-5 h-5" />}
          description="Stock &le; 3 days of cover"
        />
        <KPICard
          label="Low Stock Warning"
          value={lowItems.length}
          unit="SKUs"
          status={lowItems.length > 0 ? "low" : "ok"}
          icon={<AlertTriangle className="w-5 h-5" />}
          description="Stock &le; 7 days of cover"
        />
        <KPICard
          label="Healthy Buffer Stock"
          value={okItems.length}
          unit="SKUs"
          status="ok"
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="Sufficient inventory buffer"
        />
      </div>

      {/* High-Velocity Burn-Rate Highlights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>High-Velocity Consumption Telemetry</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Live Burn Rate
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedMedicines.slice(0, 3).map((med) => (
            <BurnRateCard
              key={med.id}
              medicine={med}
              onReorderClick={handleOpenReorder}
            />
          ))}
        </div>
      </div>

      {/* Full Medicine Inventory Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Comprehensive Facility Catalog</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenReorder(enrichedMedicines[0])}
            className="text-xs border-slate-700 text-slate-300 hover:text-white"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" aria-hidden="true" />
            Create Purchase Order
          </Button>
        </div>
        <InventoryTable
          medicines={enrichedMedicines}
          onReorder={handleOpenReorder}
        />
      </div>

      {/* Reorder Modal Dialog */}
      <ReorderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        medicine={activeReorderItem}
        facilityId={selectedFacilityId}
        onReorderSubmitted={reorderMedicine}
      />
    </div>
  );
}
