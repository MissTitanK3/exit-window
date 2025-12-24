// Displays the latest evaluation output.
"use client";

import { Chip } from "@/features/common/Chip";
import { useEvaluationStore, useModeStore } from "@/state";


export const EvaluationSummary = () => {
  const result = useEvaluationStore((state) => state.lastResult);
  const mode = useModeStore((state) => state.mode);

  if (!result) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm text-card-foreground dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evaluation summary</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">No evaluation yet. Fill constraints and run “Evaluate constraints”.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm text-card-foreground dark:border-slate-700">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Status</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{result.status === "ready" ? "Exit window possible" : "Not yet"}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">Mode: {mode}</p>
          </div>
          <Chip tone={result.status === "ready" ? "positive" : "warn"} variant="soft">
            {result.status === "ready" ? "Ready after soft blockers" : "Blocked"}
          </Chip>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Earliest window</p>
          <p className="text-sm text-slate-800 dark:text-slate-200">{result.earliestWindow}</p>
        </div>

        {result.hardBlockers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Hard blockers</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
              {result.hardBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {result.softBlockers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Soft blockers</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
              {result.softBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Summary</p>
          <p className="text-sm text-slate-800 dark:text-slate-200">{result.summary}</p>
        </div>
      </div>
    </section>
  );
};
