"use client";

import { Chip } from "./Chip";
import { ActionCard, DrawerKey } from "./drawers";


export const ActionCardSection = ({ label, accentClass, children }: { label: string; accentClass: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${accentClass} dark:text-slate-400`}>{label}</p>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  </div>
);

export const ActionCardButton = ({ card, onOpen }: { card: ActionCard; onOpen: (key: DrawerKey) => void }) => (
  <button
    type="button"
    className="rounded-2xl border border-slate-200 bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:hover:border-slate-500 text-card-foreground"
    onClick={() => onOpen(card.key)}
  >
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{card.title}</p>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{card.status}</p>
      </div>
      <Chip
        tone={card.severity === "ok" ? "positive" : card.severity === "warn" ? "warn" : "danger"}
        variant="soft"
        size="xs"
      >
        {card.severity === "ok" ? "Clear" : card.severity === "warn" ? "Review" : "Blocker"}
      </Chip>
    </div>
    <p className="mt-2 text-sm text-slate-700 leading-6 dark:text-slate-300">{card.detail}</p>
  </button>
);
