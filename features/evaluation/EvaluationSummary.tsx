// Displays the latest evaluation output.
"use client";

import { useEvaluationStore, useModeStore } from "@/state";


export const EvaluationSummary = () => {
  const result = useEvaluationStore((state) => state.lastResult);
  const mode = useModeStore((state) => state.mode);

  if (!result) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Evaluation summary</h3>
        <p className="text-sm text-slate-700">No evaluation yet. Fill constraints and run “Evaluate constraints”.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Status</p>
            <h3 className="text-lg font-semibold text-slate-900">{result.status === "ready" ? "Exit window possible" : "Not yet"}</h3>
            <p className="text-sm text-slate-700">Mode: {mode}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-semibold ${result.status === "ready" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {result.status === "ready" ? "Ready after soft blockers" : "Blocked"}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Earliest window</p>
          <p className="text-sm text-slate-800">{result.earliestWindow}</p>
        </div>

        {result.hardBlockers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Hard blockers</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
              {result.hardBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {result.softBlockers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Soft blockers</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
              {result.softBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Summary</p>
          <p className="text-sm text-slate-800">{result.summary}</p>
        </div>
      </div>
    </section>
  );
};
