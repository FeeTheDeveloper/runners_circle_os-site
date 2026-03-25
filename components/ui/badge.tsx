import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const variants: Record<BadgeVariant, string> = {
  neutral: "border-slate-700/80 bg-slate-900/80 text-slate-200",
  success: "border-emerald-500/30 bg-emerald-500/12 text-emerald-200",
  warning: "border-amber-500/30 bg-amber-500/12 text-amber-200",
  danger: "border-rose-500/30 bg-rose-500/12 text-rose-200",
  info: "border-sky-500/30 bg-sky-500/12 text-sky-200"
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
