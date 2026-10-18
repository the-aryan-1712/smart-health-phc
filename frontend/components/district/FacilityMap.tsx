"use client";

import React, { useState } from "react";
import { MapPin, Building2, Bed, Package, Users, ShieldAlert, Navigation } from "lucide-react";
import type { FacilityDistrictMetric } from "@/store/facilityStore";

interface FacilityMapProps {
  metrics: FacilityDistrictMetric[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string | null) => void;
}

export function FacilityMap({
  metrics,
  selectedFacilityId,
  onSelectFacility,
}: FacilityMapProps) {
  const [hoveredFacility, setHoveredFacility] = useState<FacilityDistrictMetric | null>(null);

  // Geographic bounds for Wardha & Yavatmal districts
  // Lat: 19.8 to 21.1 (Height: 1.3 deg)
  // Lng: 77.4 to 79.1 (Width: 1.7 deg)
  const minLat = 19.8;
  const maxLat = 21.1;
  const minLng = 77.4;
  const maxLng = 79.1;

  const projectToSVG = (lat: number, lng: number) => {
    // Invert lat for SVG Y axis (higher lat = lower Y)
    const x = ((lng - minLng) / (maxLng - minLng)) * 800 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 400 + 40;
    return { x, y };
  };

  const activeMetric = metrics.find((m) => m.facility.id === selectedFacilityId) || hoveredFacility;

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Top Map Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs text-slate-200 flex items-center gap-2 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span className="font-semibold text-white">Vidarbha Health Corridor</span>
          <span className="text-slate-400 font-mono text-[11px]">(Wardha & Yavatmal)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span>Optimal</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-1.5" aria-hidden="true" />
          <span>Strain</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ml-1.5" aria-hidden="true" />
          <span>Critical Alert</span>
        </div>
      </div>

      {/* Interactive Map SVG Canvas */}
      <div className="w-full h-[460px] relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 flex items-center justify-center">
        <svg
          viewBox="0 0 900 500"
          className="w-full h-full object-cover select-none"
          role="img"
          aria-label="District Health Facility Geospatial Heatmap"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* Pulsing glow filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* District Boundary Outlines (Stylized) */}
          <path
            d="M 120,80 Q 250,50 480,90 T 780,120 Q 820,280 720,400 T 380,440 Q 180,420 120,320 Z"
            fill="rgba(16, 185, 129, 0.02)"
            stroke="rgba(52, 211, 153, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* District Labels */}
          <text x="520" y="80" fill="rgba(255,255,255,0.2)" fontSize="20" fontWeight="bold" letterSpacing="4">
            WARDHA DISTRICT
          </text>
          <text x="240" y="380" fill="rgba(255,255,255,0.2)" fontSize="20" fontWeight="bold" letterSpacing="4">
            YAVATMAL DISTRICT
          </text>

          {/* Connecting Logistics / Referral Arteries */}
          <path
            d="M 460,195 L 340,120 L 520,250 L 590,180 L 320,310 L 170,390 L 630,350"
            fill="none"
            stroke="rgba(52, 211, 153, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Facility Location Nodes */}
          {metrics.map((metric) => {
            const { x, y } = projectToSVG(metric.facility.location.lat, metric.facility.location.lng);
            const isSelected = selectedFacilityId === metric.facility.id;
            const isCritical = metric.overallStatus === "critical";
            const isWarning = metric.overallStatus === "low";

            const pinColor = isCritical
              ? "#f43f5e" // rose-500
              : isWarning
              ? "#fbbf24" // amber-400
              : "#34d399"; // emerald-400

            return (
              <g
                key={metric.facility.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectFacility(isSelected ? null : metric.facility.id)}
                onMouseEnter={() => setHoveredFacility(metric)}
                onMouseLeave={() => setHoveredFacility(null)}
              >
                {/* Ping animation on critical pins */}
                {isCritical && (
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 16 : 12}
                  fill={isCritical ? "rgba(244,63,94,0.25)" : "rgba(52,211,153,0.2)"}
                  stroke={pinColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Core dot */}
                <circle cx={x} cy={y} r="5" fill={pinColor} />

                {/* Facility Label */}
                <text
                  x={x}
                  y={y + 24}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {metric.facility.name}
                </text>
                <text
                  x={x}
                  y={y + 36}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {metric.facility.type} • {metric.facility.district}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected / Hovered Quick Info Overlay Card */}
        {activeMetric && (
          <div className="absolute bottom-4 right-4 z-20 w-80 p-4 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-2xl text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {activeMetric.facility.district} District • {activeMetric.facility.type}
                </span>
                <h4 className="text-sm font-bold text-white">
                  {activeMetric.facility.name}
                </h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeMetric.overallStatus === "critical"
                    ? "bg-rose-950 text-rose-300 border border-rose-500/50"
                    : activeMetric.overallStatus === "low"
                    ? "bg-amber-950 text-amber-300 border border-amber-500/50"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                }`}
              >
                {activeMetric.overallStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block">Bed Occupancy:</span>
                <strong className="text-white font-mono">
                  {Math.round(activeMetric.bedOccupancyRate * 100)}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Stock Health:</span>
                <strong className="text-white font-mono">
                  {Math.round(activeMetric.stockHealthRate * 100)}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Attendance:</span>
                <strong className="text-white font-mono">
                  {Math.round(activeMetric.attendanceRate * 100)}%
                </strong>
              </div>
            </div>

            {activeMetric.criticalMedicines > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-medium">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{activeMetric.criticalMedicines} medicines facing imminent stockout</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
