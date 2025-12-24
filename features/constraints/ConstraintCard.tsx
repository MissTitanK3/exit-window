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
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Constraint</p>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-700 leading-6">{description}</p>
      </div>
      {children}
    </div>
  </section>
);
