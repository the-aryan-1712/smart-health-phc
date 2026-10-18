import type { Metadata } from "next";
import { FACILITIES, INVENTORY, BEDS, STAFF } from "@/data/seed";
import { enrichMedicine } from "@/lib/burnRate";
import { calculateAttendanceSummary } from "@/lib/attendance";
import { KPICard } from "@/components/shared/KPICard";
import { Activity, AlertTriangle, Bed, Package, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "District Overview",
  description: "Real-time district health metrics across all PHC and CHC facilities.",
};

// Force dynamic rendering so data refreshes on each request
export const dynamic = "force-dynamic";

export default function HomePage() {
  // ── Compute district-wide KPIs ──────────────────────────────────────────────
  const totalFacilities = FACILITIES.length;

  // Supply: count facilities with ≥1 critical medicine
  const facilitiesWithCriticalStock = INVENTORY.filter((inv) =>
    inv.medicines.some((m) => {
      const enriched = enrichMedicine(m);
      return enriched.status === "critical";
    })
  ).length;

  // Beds: aggregate occupancy
  const totalBeds = BEDS.length;
  const occupiedBeds = BEDS.filter((b) => b.status === "occupied").length;
  const occupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;

  // Staff: attendance rate (staff checked in / total staff today)
  const checkedIn = STAFF.filter((s) => s.isCheckedIn).length;
  const attendanceRate = STAFF.length > 0 ? checkedIn / STAFF.length : 1;

  // Active queue
  const totalWaiting = 12; // From seed; in production from patient store

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">District Health Overview</h1>
        <p className="text-sm text-[hsl(220_13%_55%)] mt-1">
          Wardha &amp; Yavatmal • {totalFacilities} facilities • Real-time monitoring
        </p>
      </div>

      {/* District KPI Strip */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Critical Stock Alerts"
            value={facilitiesWithCriticalStock}
            unit={`/ ${totalFacilities} facilities`}
            icon={<Package size={20} aria-hidden="true" />}
            status={facilitiesWithCriticalStock > 2 ? "critical" : facilitiesWithCriticalStock > 0 ? "low" : "ok"}
            href="/supply"
          />
          <KPICard
            label="Bed Occupancy"
            value={`${Math.round(occupancyRate * 100)}%`}
            unit={`${occupiedBeds} / ${totalBeds} beds`}
            icon={<Bed size={20} aria-hidden="true" />}
            status={occupancyRate > 0.85 ? "critical" : occupancyRate > 0.7 ? "low" : "ok"}
            href="/beds"
          />
          <KPICard
            label="Staff Attendance"
            value={`${Math.round(attendanceRate * 100)}%`}
            unit={`${checkedIn} / ${STAFF.length} checked in`}
            icon={<Users size={20} aria-hidden="true" />}
            status={attendanceRate < 0.7 ? "critical" : attendanceRate < 0.85 ? "low" : "ok"}
            href="/staff"
          />
          <KPICard
            label="Patients Waiting"
            value={totalWaiting}
            unit="across all queues"
            icon={<Activity size={20} aria-hidden="true" />}
            status="ok"
            href="/patients"
          />
        </div>
      </section>

      {/* Facility Status Grid */}
      <section aria-labelledby="facilities-heading">
        <h2
          id="facilities-heading"
          className="text-lg font-semibold text-white mb-4"
        >
          Facility Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {FACILITIES.map((facility) => {
            const inv = INVENTORY.find((i) => i.facilityId === facility.id);
            const hasCritical = inv?.medicines.some(
              (m) => enrichMedicine(m).status === "critical"
            );
            const facilityBeds = BEDS.filter((b) => b.facilityId === facility.id);
            const facilityOccupied = facilityBeds.filter((b) => b.status === "occupied").length;
            const facilityRate = facilityBeds.length > 0
              ? Math.round((facilityOccupied / facilityBeds.length) * 100)
              : 0;

            return (
              <Link
                key={facility.id}
                href={`/supply?facility=${facility.id}`}
                className="card block hover:no-underline group"
                aria-label={`${facility.name} — ${facility.type} — ${hasCritical ? "Critical stock alert" : "Stock OK"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[hsl(168_75%_55%)] transition-colors">
                      {facility.name}
                    </p>
                    <p className="text-xs text-[hsl(220_13%_50%)]">
                      {facility.type} · {facility.district}
                    </p>
                  </div>
                  <span
                    className={`badge ${hasCritical ? "badge-critical" : "badge-ok"}`}
                    aria-label={hasCritical ? "Critical supply alert" : "Supply OK"}
                  >
                    <span aria-hidden="true">{hasCritical ? "⚠" : "✓"}</span>
                    {hasCritical ? "Critical" : "OK"}
                  </span>
                </div>
                <div className="text-xs text-[hsl(220_13%_55%)]">
                  Beds: {facilityOccupied}/{facilityBeds.length} ({facilityRate}% occupied)
                </div>
                <div
                  className="meter-bar mt-2"
                  role="meter"
                  aria-valuenow={facilityRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${facility.name} bed occupancy: ${facilityRate}%`}
                >
                  <div
                    className={`meter-fill ${
                      facilityRate > 85 ? "meter-fill-critical"
                      : facilityRate > 70 ? "meter-fill-warning"
                      : "meter-fill-ok"
                    }`}
                    style={{ width: `${facilityRate}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/supply", label: "Review Stock Alerts", icon: Package, description: `${facilitiesWithCriticalStock} facilities need attention` },
            { href: "/patients", label: "New Patient Triage", icon: Activity, description: "AI-assisted urgency classification" },
            { href: "/beds", label: "Update Bed Status", icon: Bed, description: "Real-time occupancy tracker" },
            { href: "/district", label: "District Map", icon: AlertTriangle, description: "Cross-facility heatmap view" },
          ].map(({ href, label, icon: Icon, description }) => (
            <Link
              key={href}
              href={href}
              className="card flex flex-col gap-3 group hover:no-underline"
              aria-label={label}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(168 85% 20%)" }}
                aria-hidden="true"
              >
                <Icon size={20} className="text-[hsl(168_75%_55%)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-[hsl(168_75%_55%)] transition-colors">
                  {label}
                </p>
                <p className="text-xs text-[hsl(220_13%_50%)] mt-0.5">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
