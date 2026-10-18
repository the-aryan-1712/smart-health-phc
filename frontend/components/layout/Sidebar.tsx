"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bed,
  Box,
  LayoutDashboard,
  Map,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "District Overview", icon: LayoutDashboard },
  { href: "/supply", label: "Supply Chain", icon: Box },
  { href: "/patients", label: "Patient Flow", icon: Activity },
  { href: "/beds", label: "Bed Tracker", icon: Bed },
  { href: "/staff", label: "Staff Roster", icon: Users },
  { href: "/district", label: "Command Center", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-4">
      {/* Branding */}
      <div className="px-4 pb-4 mb-2 border-b border-[hsl(220_10%_22%)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(168_75%_42%)]">
          District Health
        </p>
        <p className="text-xs text-[hsl(220_13%_50%)] mt-0.5">
          Wardha · Yavatmal
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Module navigation">
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="nav-link"
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Live Indicator */}
      <div className="mt-auto px-4 pb-2">
        <div className="live-indicator" aria-label="System status: live">
          <span className="live-dot" aria-hidden="true" />
          <span>Live Data</span>
        </div>
        <p className="text-xs text-[hsl(220_13%_40%)] mt-1">
          Refreshes every 15s
        </p>
      </div>
    </div>
  );
}
