"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navigation, Loader2 } from "lucide-react";
import type { FacilityDistrictMetric } from "@/store/facilityStore";

interface FacilityMapProps {
  metrics: FacilityDistrictMetric[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string | null) => void;
}

// Dynamically load the Leaflet OpenStreetMap component with SSR disabled
const FacilityLeafletMap = dynamic(
  () => import("./FacilityLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" aria-hidden="true" />
        <span className="text-xs font-medium">Loading OpenStreetMap Health Corridor...</span>
      </div>
    ),
  }
);

export function FacilityMap(props: FacilityMapProps) {
  return <FacilityLeafletMap {...props} />;
}
