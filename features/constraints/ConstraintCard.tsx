// Shared card wrapper for constraint inputs with explanation text.
"use client";

import type { ReactNode } from "react";

export const ConstraintCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm text-card-foreground dark:border-slate-700">
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Constraint</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-700 leading-6 dark:text-slate-300">{description}</p>
      </div>
      {children}
    </div>
  </section>
);
