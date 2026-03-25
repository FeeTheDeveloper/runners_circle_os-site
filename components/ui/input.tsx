import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50",
        className
      )}
      {...props}
    />
  );
}
