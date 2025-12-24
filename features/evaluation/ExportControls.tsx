// User-triggered exports for summaries (plain text and print-friendly layout).
"use client";

import { useEvaluationStore } from "@/state";
import { useCallback, useMemo } from "react";

const buildPlainText = (text: {
  status: string;
  earliest: string;
  hard: string[];
  soft: string[];
  steps: string[];
  summary: string;
}) => {
  return [
    `Status: ${text.status}`,
    `Earliest window: ${text.earliest}`,
    text.hard.length ? `Hard blockers:\n- ${text.hard.join("\n- ")}` : "Hard blockers: none",
    text.soft.length ? `Soft blockers:\n- ${text.soft.join("\n- ")}` : "Soft blockers: none",
    `Summary: ${text.summary}`,
    text.steps.length ? `Step order:\n- ${text.steps.join("\n- ")}` : "Step order: none",
  ].join("\n\n");
};

export const ExportControls = () => {
  const result = useEvaluationStore((state) => state.lastResult);

  const plainText = useMemo(() => {
    if (!result) return "No evaluation available.";
    return buildPlainText({
      status: result.status,
      earliest: result.earliestWindow,
      hard: result.hardBlockers,
      soft: result.softBlockers,
      steps: result.orderedSteps,
      summary: result.summary,
    });
  }, [result]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exit-window-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  }, [plainText]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!result) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Export</p>
          <h3 className="text-lg font-semibold text-slate-900">User-initiated outputs</h3>
          <p className="text-sm text-slate-700">Exports are offline and only run when you click. No background sync or network use.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Export as plain text
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Print / PDF-ready view
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 whitespace-pre-wrap">
          {plainText}
        </div>
      </div>
    </section>
  );
};
