"use client";

import type { ReactNode } from "react";

export type ChipTone = "positive" | "warn" | "danger" | "neutral";
export type ChipVariant = "soft" | "solid";
export type ChipSize = "sm" | "xs";

const toneClasses: Record<ChipVariant, Record<ChipTone, string>> = {
  soft: {
    positive: "border border-emerald-400 bg-emerald-100 text-primary dark:border-emerald-700 dark:bg-emerald-900/30",
    warn: "border border-amber-400 bg-amber-100 text-primary dark:border-amber-700 dark:bg-amber-900/25",
    danger: "border border-rose-400 bg-rose-100 text-primary dark:border-rose-700 dark:bg-rose-900/25",
    neutral: "border border-slate-400 bg-slate-200 text-primary dark:border-slate-600 dark:bg-slate-800",
  },
  solid: {
    positive: "border border-emerald-700 bg-emerald-700 text-primary dark:border-emerald-400 dark:bg-emerald-400",
    warn: "border border-amber-600 bg-amber-500 text-primary dark:border-amber-400 dark:bg-amber-400",
    danger: "border border-rose-700 bg-rose-700 text-primary dark:border-rose-400 dark:bg-rose-400",
    neutral: "border border-slate-800 bg-slate-900 text-primary dark:border-slate-200 dark:bg-slate-100",
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
