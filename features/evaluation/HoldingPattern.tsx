// Minimal holding-pattern dashboard showing current status, blockers, and time constraints without nudging action.
"use client";

import { useMemo } from "react";
import { Chip, type ChipTone } from "@/features/common/Chip";
import { usePreDepartureStore } from "@/state";

const daysUntil = (target?: string) => {
  if (!target) return undefined;
  const now = new Date();
  const then = new Date(target);
  const diff = Math.ceil((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const HoldingPattern = () => {
  const status = usePreDepartureStore((state) => state.status);
  const topBlockers = usePreDepartureStore((state) => state.topBlockers);
  const nextRequiredCondition = usePreDepartureStore((state) => state.nextRequiredCondition);
  const timeConstraints = usePreDepartureStore((state) => state.timeConstraints);

  const badge = useMemo<{ label: string; tone: ChipTone }>(
    () => ({
      label: status === "not-yet" ? "Not yet" : "Window open",
      tone: status === "not-yet" ? "warn" : "positive",
    }),
    [status],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Holding pattern</p>
            <h3 className="text-lg font-semibold text-slate-900">Waiting is a valid state</h3>
            <p className="text-sm text-slate-700 leading-6">No automatic progression. Status is set only by you.</p>
          </div>
          <Chip tone={badge.tone} variant="soft" size="xs" uppercase>
            {badge.label}
          </Chip>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Top blockers</p>
          {topBlockers.length === 0 ? (
            <p className="text-sm text-slate-700">Nothing recorded. Add blockers in the change tracker or here.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-800">
              {topBlockers.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Next required condition</p>
          <p className="text-sm text-slate-800">{nextRequiredCondition || "Nothing specified."}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Time-based constraints</p>
          {timeConstraints.length === 0 ? (
            <p className="text-sm text-slate-700">No countdowns set. Add only if dates matter for safety.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-800">
              {timeConstraints.map((item) => {
                const days = daysUntil(item.targetDate);
                return (
                  <li key={item.id} className="rounded border border-slate-200 bg-white p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      {item.targetDate && (
                        <span className="text-xs text-slate-600">{new Date(item.targetDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {item.note && <p className="text-xs text-slate-700">{item.note}</p>}
                    {days !== undefined && (
                      <p className="text-xs text-slate-700">{days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days past`}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
