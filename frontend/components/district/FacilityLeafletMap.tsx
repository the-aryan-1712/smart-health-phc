"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Layers, ShieldAlert } from "lucide-react";
import type { FacilityDistrictMetric } from "@/store/facilityStore";

interface FacilityLeafletMapProps {
  metrics: FacilityDistrictMetric[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string | null) => void;
}

export default function FacilityLeafletMap({
  metrics,
  selectedFacilityId,
  onSelectFacility,
}: FacilityLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<"dark" | "osm">("dark");
  const [hoveredFacility, setHoveredFacility] = useState<FacilityDistrictMetric | null>(null);

  const activeMetric = metrics.find((m) => m.facility.id === selectedFacilityId) || hoveredFacility;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Vidarbha corridor (Wardha / Yavatmal region)
    const map = L.map(mapContainerRef.current, {
      center: [20.65, 78.45],
      zoom: 9,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Add zoom control in top right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapStyle === "dark") {
      // CartoDB Dark Matter tile layer powered by OpenStreetMap contributors
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      // Standard OpenStreetMap street tiles
      tileLayerRef.current = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [mapStyle]);

  // Update Markers & Logistics Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (metrics.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Draw connecting referral arteries
    const routeCoords: [number, number][] = metrics.map((m) => [
      m.facility.location.lat,
      m.facility.location.lng,
    ]);

    if (routeCoords.length > 1) {
      polylineRef.current = L.polyline(routeCoords, {
        color: "#34d399",
        weight: 2,
        opacity: 0.4,
        dashArray: "6, 8",
      }).addTo(map);
    }

    // Add marker for each health facility
    metrics.forEach((metric) => {
      const { lat, lng } = metric.facility.location;
      bounds.extend([lat, lng]);

      const isSelected = selectedFacilityId === metric.facility.id;
      const isCritical = metric.overallStatus === "critical";
      const isWarning = metric.overallStatus === "low";

      const badgeColor = isCritical
        ? "bg-rose-500 border-rose-300 shadow-rose-500/50"
        : isWarning
        ? "bg-amber-400 border-amber-200 shadow-amber-400/50"
        : "bg-emerald-500 border-emerald-300 shadow-emerald-500/50";

      const pingAnimation = isCritical
        ? `<div class="absolute -inset-1 rounded-full bg-rose-500 animate-ping opacity-75"></div>`
        : "";

      const html = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -50%);">
          ${pingAnimation}
          <div class="relative w-8 h-8 rounded-full border-2 ${badgeColor} shadow-lg flex items-center justify-center text-slate-950 font-extrabold text-[11px] transition-transform group-hover:scale-125 ${
        isSelected ? "ring-4 ring-cyan-400 scale-125" : ""
      }">
            ${metric.facility.type === "CHC" ? "CHC" : "PHC"}
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700/80 text-[10px] font-semibold text-white whitespace-nowrap shadow-md pointer-events-none">
            ${metric.facility.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: "custom-facility-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content with detailed health stats
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; min-width: 200px; padding: 4px;">
          <div style="font-weight: 700; color: #f8fafc; font-size: 13px;">${metric.facility.name}</div>
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">
            ${metric.facility.type} • ${metric.facility.district} District
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px 0; border-top: 1px solid #334155; border-bottom: 1px solid #334155; margin-bottom: 8px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Beds:</span>
              <strong style="color: #38bdf8;">${Math.round(metric.bedOccupancyRate * 100)}% Occ.</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Stock Health:</span>
              <strong style="color: ${metric.criticalMedicines > 0 ? "#f43f5e" : "#34d399"};">${Math.round(metric.stockHealthRate * 100)}%</strong>
            </div>
          </div>
          <div style="font-size: 11px; color: #cbd5e1;">Staff Attendance: <strong>${Math.round(metric.attendanceRate * 100)}%</strong></div>
          ${
            metric.criticalMedicines > 0
              ? `<div style="margin-top: 6px; color: #f43f5e; font-weight: 600; font-size: 11px;">⚠️ ${metric.criticalMedicines} Critical Stockout Alert!</div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "facility-custom-popup",
        closeButton: true,
      });

      marker.on("click", () => {
        onSelectFacility(metric.facility.id);
      });

      marker.on("mouseover", () => {
        setHoveredFacility(metric);
      });

      marker.on("mouseout", () => {
        setHoveredFacility(null);
      });

      markersRef.current[metric.facility.id] = marker;
    });

    // Auto-fit bounds if we have metrics
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  }, [metrics, selectedFacilityId, onSelectFacility]);

  // Pan to selected facility if changed externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedFacilityId) return;

    const selected = metrics.find((m) => m.facility.id === selectedFacilityId);
    if (selected) {
      map.flyTo([selected.facility.location.lat, selected.facility.location.lng], 12, {
        duration: 1.2,
      });
      const marker = markersRef.current[selectedFacilityId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedFacilityId, metrics]);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 z-[500] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs text-slate-200 flex items-center gap-2 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span className="font-semibold text-white">Vidarbha Health Corridor</span>
          <span className="text-slate-400 font-mono text-[11px]">(OpenStreetMap)</span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span>Optimal</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-1.5" aria-hidden="true" />
          <span>Strain</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ml-1.5" aria-hidden="true" />
          <span>Critical Alert</span>
        </div>

        {/* Style Switcher (Dark Matter / OSM Street) */}
        <button
          onClick={() => setMapStyle((s) => (s === "dark" ? "osm" : "dark"))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 flex items-center gap-1.5 shadow-md transition-colors"
          title="Toggle Map Style"
          type="button"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span className="font-medium">
            {mapStyle === "dark" ? "Dark Map" : "Standard OSM"}
          </span>
        </button>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[480px] bg-slate-950 z-0"
        aria-label="Interactive OpenStreetMap Corridor"
      />

      {/* Selected / Hovered Quick Info Card Overlay */}
      {activeMetric && (
        <div className="absolute bottom-6 right-4 z-[500] w-80 p-4 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-2xl text-xs space-y-2.5 animate-in fade-in duration-150 pointer-events-auto">
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
  );
}
