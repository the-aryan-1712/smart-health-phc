import { HeartPulse, Bell } from "lucide-react";

export function Header() {
  return (
    <div className="flex items-center justify-between h-full px-6">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "linear-gradient(135deg, hsl(168 85% 25%), hsl(168 75% 38%))" }}
          aria-hidden="true"
        >
          <HeartPulse size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white leading-tight">
            Smart Health
          </h1>
          <p className="text-xs text-[hsl(220_13%_50%)] leading-tight">
            AI-Driven PHC &amp; CHC Management
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <time
          dateTime={new Date().toISOString()}
          className="hidden md:block text-xs text-[hsl(220_13%_50%)]"
          aria-label="Current date and time"
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>

        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-[hsl(220_10%_20%)] transition-colors"
          aria-label="View notifications"
        >
          <Bell size={18} className="text-[hsl(220_13%_65%)]" aria-hidden="true" />
          {/* Unread indicator */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(0_84%_60%)]"
            aria-label="3 unread alerts"
            role="status"
          />
        </button>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(220_10%_18%)]"
          aria-label="Logged in as District Health Officer"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "hsl(168 75% 35%)" }}
            aria-hidden="true"
          >
            DH
          </div>
          <span className="hidden md:block text-sm font-medium text-[hsl(220_13%_80%)]">
            DHO Dashboard
          </span>
        </div>
      </div>
    </div>
  );
}
