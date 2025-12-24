// Pre-departure status editor for setting blockers, required conditions, and countdown constraints.
"use client";

import { useState } from "react";
import { usePreDepartureStore } from "@/state";
import type { PreDepartureStatus } from "@/domain/types";

export const PreDepartureStatusPanel = () => {
  const status = usePreDepartureStore((state) => state.status);
  const topBlockers = usePreDepartureStore((state) => state.topBlockers);
  const nextRequiredCondition = usePreDepartureStore((state) => state.nextRequiredCondition);
  const timeConstraints = usePreDepartureStore((state) => state.timeConstraints);

  const setStatus = usePreDepartureStore((state) => state.setStatus);
  const addTopBlocker = usePreDepartureStore((state) => state.addTopBlocker);
  const removeTopBlocker = usePreDepartureStore((state) => state.removeTopBlocker);
  const setNextRequiredCondition = usePreDepartureStore((state) => state.setNextRequiredCondition);
  const addTimeConstraint = usePreDepartureStore((state) => state.addTimeConstraint);
  const updateTimeConstraint = usePreDepartureStore((state) => state.updateTimeConstraint);
  const removeTimeConstraint = usePreDepartureStore((state) => state.removeTimeConstraint);
  const reset = usePreDepartureStore((state) => state.reset);

  const [blockerInput, setBlockerInput] = useState("");
  const [conditionInput, setConditionInput] = useState(nextRequiredCondition || "");
  const [timeLabel, setTimeLabel] = useState("");
  const [timeDate, setTimeDate] = useState("");
  const [timeNote, setTimeNote] = useState("");

  const handleAddBlocker = () => {
    addTopBlocker(blockerInput);
    setBlockerInput("");
  };

  const handleAddTimeConstraint = () => {
    addTimeConstraint({ label: timeLabel, targetDate: timeDate || undefined, note: timeNote || undefined });
    setTimeLabel("");
    setTimeDate("");
    setTimeNote("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Pre-departure frame</p>
          <h3 className="text-lg font-semibold text-slate-900">Define the current state</h3>
          <p className="text-sm text-slate-700 leading-6">Waiting is acceptable. Set status, blockers, and any conditions that must be true before moving.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PreDepartureStatus)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="not-yet">Not yet</option>
              <option value="window-open">Window open</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Next required condition</label>
            <input
              value={conditionInput}
              onChange={(e) => {
                setConditionInput(e.target.value);
                setNextRequiredCondition(e.target.value);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              placeholder="Example: Lease notice served and accepted"
            />
            <p className="text-xs text-slate-600">Saved immediately as you type.</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Top blockers</label>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                value={blockerInput}
                onChange={(e) => setBlockerInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                placeholder="Add a blocker"
              />
              <button
                type="button"
                onClick={handleAddBlocker}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            {topBlockers.length === 0 ? (
              <p className="text-sm text-slate-700">No blockers listed.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {topBlockers.map((blocker, index) => (
                  <li key={`${blocker}-${index}`} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                    <span>{blocker}</span>
                    <button
                      type="button"
                      onClick={() => removeTopBlocker(index)}
                      className="text-xs font-semibold text-slate-700 underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Time-based constraints</label>
            <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
              <input
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                placeholder="Lease end, medical coverage, etc."
              />
              <input
                type="date"
                value={timeDate}
                onChange={(e) => setTimeDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              <input
                value={timeNote}
                onChange={(e) => setTimeNote(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                placeholder="Note"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddTimeConstraint}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add constraint
              </button>
            </div>
            {timeConstraints.length === 0 ? (
              <p className="text-sm text-slate-700">No time constraints added.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {timeConstraints.map((constraint) => (
                  <li key={constraint.id} className="flex flex-col gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{constraint.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={constraint.targetDate ?? ""}
                          onChange={(e) => updateTimeConstraint(constraint.id, { targetDate: e.target.value })}
                          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeConstraint(constraint.id)}
                          className="text-xs font-semibold text-slate-700 underline underline-offset-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {constraint.note && <p className="text-xs text-slate-700">{constraint.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => reset()}
            className="text-xs font-semibold text-slate-700 underline underline-offset-2"
          >
            Reset pre-departure frame
          </button>
        </div>
      </div>
    </section>
  );
};
