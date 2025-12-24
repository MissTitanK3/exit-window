"use client";

import { ActionCard, badgeTone, DrawerKey } from "./drawers";


export const ActionCardSection = ({ label, accentClass, children }: { label: string; accentClass: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${accentClass}`}>{label}</p>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  </div>
);

export const ActionCardButton = ({ card, onOpen }: { card: ActionCard; onOpen: (key: DrawerKey) => void }) => (
  <button
    type="button"
    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    onClick={() => onOpen(card.key)}
  >
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{card.title}</p>
        <p className="text-lg font-semibold text-slate-900">{card.status}</p>
      </div>
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeTone[card.severity]}`}>
        {card.severity === "ok" ? "Clear" : card.severity === "warn" ? "Review" : "Blocker"}
      </span>
    </div>
    <p className="mt-2 text-sm text-slate-700 leading-6">{card.detail}</p>
  </button>
);
