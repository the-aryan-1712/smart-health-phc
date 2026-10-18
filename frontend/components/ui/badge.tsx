import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        secondary:
          "border-transparent bg-slate-800 text-slate-300 border-slate-700",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/40",
        outline: "text-slate-300 border-slate-700",
        critical:
          "border-rose-500/50 bg-rose-950/60 text-rose-300 font-bold animate-pulse",
        low:
          "border-amber-500/50 bg-amber-950/60 text-amber-300 font-medium",
        ok:
          "border-emerald-500/40 bg-emerald-950/50 text-emerald-300",
        p1:
          "border-red-500/60 bg-red-950/80 text-red-200 font-extrabold uppercase tracking-wide",
        p2:
          "border-orange-500/60 bg-orange-950/80 text-orange-200 font-bold uppercase tracking-wide",
        p3:
          "border-amber-500/50 bg-amber-950/70 text-amber-200 font-medium uppercase tracking-wide",
        p4:
          "border-emerald-500/40 bg-emerald-950/60 text-emerald-200 font-medium uppercase tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
