// Pre-departure export pack producing plain text and printable HTML on-demand.
"use client";

import { useMemo } from "react";
import { useConstraintsStore, usePreDepartureStore, useRiskBoundaryStore, useSnapshotStore, useChangeLogStore, useStabilityStore } from "@/state";
import { selectLatestSnapshots } from "@/state/snapshotStore";
import { selectStabilityWarnings } from "@/state/stabilityStore";
import type { Constraints } from "@/domain/types";

const formatConstraints = (constraints: Constraints) => {
  return [
    `Housing: ${constraints.housing.status}${constraints.housing.leaseEndDate ? `, lease end ${constraints.housing.leaseEndDate}` : ""}${constraints.housing.noticeDays ? `, notice ${constraints.housing.noticeDays} days` : ""}${constraints.housing.note ? ` | ${constraints.housing.note}` : ""}`,
    `Income: ${constraints.income.stability}${constraints.income.note ? ` | ${constraints.income.note}` : ""}`,
    `Cash runway: ${constraints.cashRunway.status}${constraints.cashRunway.months !== undefined ? ` (${constraints.cashRunway.months} months)` : ""}${constraints.cashRunway.note ? ` | ${constraints.cashRunway.note}` : ""}`,
    `Dependents: ${constraints.dependents.coverage}${constraints.dependents.note ? ` | ${constraints.dependents.note}` : ""}`,
    `Healthcare: ${constraints.healthcare.continuity}${constraints.healthcare.note ? ` | ${constraints.healthcare.note}` : ""}`,
    `Legal: ${constraints.legal.blocker}${constraints.legal.note ? ` | ${constraints.legal.note}` : ""}`,
  ].join("\n- ");
};

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const PreDepartureExport = () => {
  const constraints = useConstraintsStore((state) => state.constraints);
  const preStatus = usePreDepartureStore((state) => state.status);
  const preBlockers = usePreDepartureStore((state) => state.topBlockers);
  const preCondition = usePreDepartureStore((state) => state.nextRequiredCondition);
  const preTimeConstraints = usePreDepartureStore((state) => state.timeConstraints);

  const boundaries = useRiskBoundaryStore((state) => state.boundaries);
  const snapshots = useSnapshotStore((state) => state.snapshots);
  const changes = useChangeLogStore((state) => state.changes);

  const stabilityActive = useStabilityStore((state) => state.active);
  const stabilityStatement = useStabilityStore((state) => state.statement);
  const stabilityFocuses = useStabilityStore((state) => state.focuses);

  const preDeparture = useMemo(
    () => ({
      status: preStatus,
      topBlockers: preBlockers,
      nextRequiredCondition: preCondition,
      timeConstraints: preTimeConstraints,
    }),
    [preStatus, preBlockers, preCondition, preTimeConstraints],
  );

  const stabilityFrame = useMemo(
    () => ({ active: stabilityActive, statement: stabilityStatement, focuses: stabilityFocuses }),
    [stabilityActive, stabilityStatement, stabilityFocuses],
  );

  const latestSnapshots = useMemo(() => selectLatestSnapshots(snapshots), [snapshots]);
  const stabilityWarnings = useMemo(() => selectStabilityWarnings(stabilityFrame), [stabilityFrame]);

  const plainText = useMemo(() => {
    const blockerText = preDeparture.topBlockers.length ? `- ${preDeparture.topBlockers.join("\n- ")}` : "(none recorded)";
    const timeText = preDeparture.timeConstraints.length
      ? preDeparture.timeConstraints
        .map((item) => `- ${item.label}${item.targetDate ? ` (${item.targetDate})` : ""}${item.note ? ` | ${item.note}` : ""}`)
        .join("\n")
      : "(none recorded)";
    const boundaryText = boundaries.length
      ? boundaries.map((b) => `- ${b.category}: ${b.description}`).join("\n")
      : "(none recorded)";
    const changeText = changes.length ? changes.map((c) => `- ${c.kind}: ${c.title} — ${c.description}`).join("\n") : "(none recorded)";
    const stabilityText = stabilityFrame.focuses.length
      ? stabilityFrame.focuses.map((f) => `- ${f.label} [${f.status}]: ${f.mustRemainStable}${f.note ? ` | ${f.note}` : ""}`).join("\n")
      : "(none recorded)";
    const snapshotText = latestSnapshots.length
      ? latestSnapshots
        .map(
          (s) =>
            `- ${s.label || "Snapshot"} @ ${s.createdAt}\n  Summary: ${s.summary}\n  Known blockers: ${s.knownBlockers.join(", ") || "none"}\n  Unknowns: ${s.unknowns.join(", ") || "none"}\n  Notes: ${s.notes || "(none)"}`,
        )
        .join("\n\n")
      : "(no snapshots)";

    return [
      "Pre-Departure Summary",
      `Status: ${preDeparture.status}`,
      `Next required condition: ${preDeparture.nextRequiredCondition || "(unspecified)"}`,
      `Top blockers:\n${blockerText}`,
      `Time-based constraints:\n${timeText}`,
      `Constraints:\n- ${formatConstraints(constraints)}`,
      `Change log (explicit only):\n${changeText}`,
      `Stability mode: ${stabilityFrame.active ? "active" : "inactive"}`,
      `Stability statement: ${stabilityFrame.statement}`,
      `Stability focuses:\n${stabilityText}`,
      `Stability warnings:\n${stabilityWarnings.length ? stabilityWarnings.map((w) => `- ${w}`).join("\n") : "(none)"}`,
      `Risk boundaries:\n${boundaryText}`,
      `Latest snapshots:\n${snapshotText}`,
    ].join("\n\n");
  }, [preDeparture, boundaries, changes, stabilityFrame, stabilityWarnings, latestSnapshots, constraints]);

  const printableHtml = useMemo(() => {
    const escaped = escapeHtml(plainText).replace(/\n/g, "<br/>");
    return `<!doctype html><html><head><meta charset="utf-8"><title>Pre-Departure Summary</title><style>body{font-family:ui-sans-serif,system-ui;max-width:720px;margin:32px auto;padding:0 16px;color:#0f172a;}h1{font-size:20px;margin-bottom:12px;}pre{white-space:pre-wrap;font-size:14px;line-height:1.6;background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-radius:12px;}</style></head><body><h1>Pre-Departure Summary</h1><pre>${escaped}</pre></body></html>`;
  }, [plainText]);

  const handleDownload = () => {
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pre-departure-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const blob = new Blob([printableHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Export pack</p>
          <h3 className="text-lg font-semibold text-slate-900">Pre-Departure Summary</h3>
          <p className="text-sm text-slate-700 leading-6">Runs only when you click. Outputs plain text and a print-friendly HTML view. No tracking, no watermarking.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export as text
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Open printable HTML
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 whitespace-pre-wrap">
          {plainText}
        </div>
      </div>
    </section>
  );
};
