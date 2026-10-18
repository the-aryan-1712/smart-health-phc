import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status?: "ok" | "low" | "critical";
  href?: string;
  trend?: "up" | "down" | "stable";
  description?: string;
}

export function KPICard({ label, value, unit, icon, status = "ok", href, trend, description }: KPICardProps) {
  const statusClass = {
    ok: "text-[hsl(142_71%_45%)]",
    low: "text-[hsl(38_92%_50%)]",
    critical: "text-[hsl(0_84%_60%)]",
  }[status];

  const content = (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: "hsl(220 10% 20%)" }}
          aria-hidden="true"
        >
          <span className={statusClass}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend === "up" ? "text-[hsl(142_71%_45%)]" : "text-[hsl(0_84%_60%)]"}`}
                aria-label={`Trend: ${trend}`}>
            {trend === "up" ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${statusClass}`} aria-label={`${label}: ${value}`}>
        {value}
      </p>
      <p className="text-xs font-medium text-[hsl(220_13%_65%)] mt-0.5">{label}</p>
      {unit && (
        <p className="text-xs text-[hsl(220_13%_45%)] mt-1">{unit}</p>
      )}
      {description && (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{description}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:no-underline" aria-label={`${label}: ${value}. Click to view details.`}>
        {content}
      </Link>
    );
  }

  return content;
}
