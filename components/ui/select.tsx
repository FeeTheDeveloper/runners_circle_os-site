import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-400/50",
        className
      )}
      {...props}
    />
  );
}
