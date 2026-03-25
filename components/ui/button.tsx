import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-xl border font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
    size === "lg" ? "h-12 px-5 text-sm" : "h-10 px-4 text-sm",
    variant === "primary" &&
      "border-sky-400/30 bg-sky-400/15 text-sky-100 hover:border-sky-300/50 hover:bg-sky-400/20",
    variant === "secondary" &&
      "border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-500 hover:bg-slate-900",
    variant === "ghost" &&
      "border-transparent bg-transparent text-slate-300 hover:bg-slate-900/80 hover:text-white",
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ variant, size, className })} type={type} {...props} />;
}
