"use client";

import type { ReactNode } from "react";

export type ChipTone = "positive" | "warn" | "danger" | "neutral";
export type ChipVariant = "soft" | "solid";
export type ChipSize = "sm" | "xs";

const toneClasses: Record<ChipVariant, Record<ChipTone, string>> = {
  soft: {
    positive: "border border-emerald-200 bg-emerald-50 text-primary dark:border-emerald-700 dark:bg-emerald-900/30",
    warn: "border border-amber-200 bg-amber-50 text-primary dark:border-amber-700 dark:bg-amber-900/25",
    danger: "border border-rose-200 bg-rose-50 text-primary dark:border-rose-700 dark:bg-rose-900/25",
    neutral: "border border-slate-300 bg-slate-100 text-primary dark:border-slate-700 dark:bg-slate-800",
  },
  solid: {
    positive: "border border-emerald-700 bg-emerald-700 text-primary dark:border-emerald-300 dark:bg-emerald-300",
    warn: "border border-amber-600 bg-amber-600 text-primary dark:border-amber-300 dark:bg-amber-300",
    danger: "border border-rose-700 bg-rose-700 text-primary dark:border-rose-300 dark:bg-rose-300",
    neutral: "border border-slate-900 bg-slate-950 text-primary dark:border-slate-200 dark:bg-slate-100",
  },
};

const sizeClasses: Record<ChipSize, string> = {
  sm: "px-3 py-1 text-xs",
  xs: "px-2.5 py-0.5 text-[11px]",
};

export function Chip({
  tone,
  variant = "soft",
  size = "sm",
  uppercase = false,
  className,
  children,
}: {
  tone: ChipTone;
  variant?: ChipVariant;
  size?: ChipSize;
  uppercase?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = [
    "inline-flex items-center rounded-full",
    toneClasses[variant][tone],
    sizeClasses[size],
    uppercase ? "uppercase tracking-[0.08em]" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
