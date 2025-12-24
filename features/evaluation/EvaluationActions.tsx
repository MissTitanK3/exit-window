// Controls to run evaluations and manage stored inputs/results.
"use client";

import { useConstraintsStore, useEvaluationStore, useModeStore } from "@/state";
import { useCallback } from "react";

export const EvaluationActions = () => {
  const evaluate = useEvaluationStore((state) => state.evaluate);
  const clearEvaluation = useEvaluationStore((state) => state.clear);
  const resetConstraints = useConstraintsStore((state) => state.resetConstraints);
  const setMode = useModeStore((state) => state.setMode);

  const handleEvaluate = useCallback(() => {
    evaluate();
    const result = useEvaluationStore.getState().lastResult;
    if (result?.status === "not-yet") setMode("holding");
    if (result?.status === "ready") setMode("planning");
  }, [evaluate, setMode]);

  const handleReset = useCallback(() => {
    resetConstraints();
    clearEvaluation();
    setMode("planning");
  }, [resetConstraints, clearEvaluation, setMode]);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleEvaluate}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Evaluate constraints
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
      >
        Clear inputs and results
      </button>
    </div>
  );
};
