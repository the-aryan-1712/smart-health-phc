"use client";

import React, { useState } from "react";
import { Search, Filter, PackageCheck, AlertCircle, ArrowUpDown } from "lucide-react";
import type { MedicineWithMetrics } from "@/types/supply";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { formatDTS } from "@/lib/burnRate";

interface InventoryTableProps {
  medicines: MedicineWithMetrics[];
  onReorder: (medicine: MedicineWithMetrics) => void;
}

export function InventoryTable({ medicines, onReorder }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "critical" | "low" | "ok">("all");
  const [sortField, setSortField] = useState<"name" | "stock" | "burnRate" | "dts">("dts");
  const [sortAsc, setSortAsc] = useState(true);

  const categories = [
    "all",
    ...Array.from(new Set(medicines.map((m) => m.category))),
  ];

  // Filtering
  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "stock") {
      comparison = a.currentStock - b.currentStock;
    } else if (sortField === "burnRate") {
      comparison = a.burnRate - b.burnRate;
    } else if (sortField === "dts") {
      const aVal = isFinite(a.daysToStockout) ? a.daysToStockout : 9999;
      const bVal = isFinite(b.daysToStockout) ? b.daysToStockout : 9999;
      comparison = aVal - bVal;
    }
    return sortAsc ? comparison : -comparison;
  });

  const toggleSort = (field: "name" | "stock" | "burnRate" | "dts") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search medicine or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search medicine inventory"
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(["all", "critical", "low", "ok"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                aria-pressed={statusFilter === st}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  statusFilter === st
                    ? st === "critical"
                      ? "bg-rose-950 text-rose-200 border border-rose-500/40"
                      : st === "low"
                      ? "bg-amber-950 text-amber-200 border border-amber-500/40"
                      : "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
          <h4 className="text-base font-semibold text-slate-300">No medicines found</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or filter pills above.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
                >
                  Medicine Name & Unit
                  <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("stock")}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
                >
                  Stock Level
                  <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("burnRate")}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
                >
                  Daily Burn Rate
                  <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("dts")}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-white"
                >
                  Days to Stockout
                  <ArrowUpDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((med) => {
              const maxStock = Math.max(med.initialStock, med.minimumThreshold * 2, med.currentStock);
              const progressVal = (med.currentStock / maxStock) * 100;
              const isCritical = med.status === "critical";

              return (
                <TableRow key={med.id} className={isCritical ? "bg-rose-950/20" : ""}>
                  <TableCell>
                    <div className="font-semibold text-white">{med.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      Pack unit: {med.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 uppercase">
                      {med.category}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-100">
                        {med.currentStock}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        min: {med.minimumThreshold}
                      </span>
                    </div>
                    <Progress
                      value={progressVal}
                      max={100}
                      label={`Stock level for ${med.name}: ${med.currentStock} ${med.unit}`}
                      indicatorClassName={
                        isCritical
                          ? "bg-rose-500"
                          : med.status === "low"
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-medium text-slate-200">
                      {med.burnRate.toFixed(1)}
                    </span>{" "}
                    <span className="text-xs text-slate-400">/ day</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono font-bold ${
                        isCritical
                          ? "text-rose-400"
                          : med.status === "low"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {formatDTS(med.daysToStockout)}
                    </span>{" "}
                    <span className="text-xs text-slate-400">days</span>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={med.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isCritical ? "destructive" : "secondary"}
                      onClick={() => onReorder(med)}
                      className="text-xs h-8"
                    >
                      <PackageCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      Reorder
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
