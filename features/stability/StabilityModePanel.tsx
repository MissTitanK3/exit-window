// Stability mode surface that explains why waiting is correct and watches stability focuses.
"use client";

import { useMemo, useState } from "react";
import { useStabilityStore } from "@/state";
import { selectStabilityWarnings } from "@/state/stabilityStore";
import type { StabilityFocus } from "@/domain/types";

const StatusBadge = ({ status }: { status: StabilityFocus["status"] }) => {
  const colors = {
    stable: "bg-emerald-100 text-emerald-800",
    watch: "bg-amber-100 text-amber-800",
    degrading: "bg-rose-100 text-rose-800",
  }[status];
  const label = {
    stable: "Stable",
    watch: "Watch",
    degrading: "Degrading",
  }[status];
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors}`}>{label}</span>;
};

export const StabilityModePanel = () => {
  const [label, setLabel] = useState("");
  const [mustRemainStable, setMustRemainStable] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<StabilityFocus["status"]>("stable");

  const active = useStabilityStore((state) => state.active);
  const statement = useStabilityStore((state) => state.statement);
  const focuses = useStabilityStore((state) => state.focuses);
  const setActive = useStabilityStore((state) => state.setActive);
  const setStatement = useStabilityStore((state) => state.setStatement);
  const addFocus = useStabilityStore((state) => state.addFocus);
  const updateFocus = useStabilityStore((state) => state.updateFocus);
  const removeFocus = useStabilityStore((state) => state.removeFocus);
  const reset = useStabilityStore((state) => state.reset);

  const warnings = useMemo(() => selectStabilityWarnings({ active, statement, focuses }), [active, statement, focuses]);

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addFocus({ label, mustRemainStable, note, status });
    setLabel("");
    setMustRemainStable("");
    setNote("");
    setStatus("stable");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Stability mode</p>
            <h3 className="text-lg font-semibold text-slate-900">Hold steady while exit is blocked</h3>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-800"}`}
          >
            {active ? "Stability active" : "Inactive"}
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">Message</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            rows={2}
            placeholder="Waiting is correct. Keep cash, housing, and care steady."
          />
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleAdd}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Focus name</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              placeholder="Cash runway"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StabilityFocus["status"])}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="stable">Stable</option>
              <option value="watch">Watch</option>
              <option value="degrading">Degrading</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">What must remain stable</label>
            <textarea
              value={mustRemainStable}
              onChange={(e) => setMustRemainStable(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={2}
              placeholder="Example: Keep 3 months of rent untouched."
              required
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={2}
              placeholder="Any context for future you."
            />
          </div>
          <div className="flex items-center justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs font-semibold text-slate-700 underline underline-offset-2"
            >
              Reset stability
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add focus
            </button>
          </div>
        </form>

        {warnings.length > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-800">Warnings</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-rose-900">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {focuses.length === 0 ? (
            <p className="text-sm text-slate-700">No stability focuses yet. Add the areas that must not slip while waiting.</p>
          ) : (
            focuses.map((focus) => (
              <div key={focus.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{focus.label}</p>
                    <p className="text-sm text-slate-700 leading-5">{focus.mustRemainStable}</p>
                    {focus.note && <p className="text-xs text-slate-600">{focus.note}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={focus.status} />
                    <select
                      value={focus.status}
                      onChange={(e) => updateFocus(focus.id, { status: e.target.value as StabilityFocus["status"] })}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="stable">Stable</option>
                      <option value="watch">Watch</option>
                      <option value="degrading">Degrading</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFocus(focus.id)}
                      className="text-xs font-semibold text-slate-700 underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
