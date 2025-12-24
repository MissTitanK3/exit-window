// Readiness snapshot workspace for capturing immutable states and comparing history.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSnapshotStore } from "@/state";
import { selectLatestSnapshots } from "@/state/snapshotStore";
import type { Snapshot } from "@/domain/types";

const toList = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

const SnapshotCard = ({ snapshot }: { snapshot: Snapshot }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Snapshot</p>
        <h4 className="text-sm font-semibold text-slate-900">{snapshot.label || "Untitled"}</h4>
      </div>
      <span className="text-xs text-slate-600">{new Date(snapshot.createdAt).toLocaleString()}</span>
    </div>
    <p className="mt-2 text-sm text-slate-800 leading-6">{snapshot.summary}</p>
    {snapshot.knownBlockers.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Known blockers</p>
        <ul className="list-disc pl-4 text-sm text-slate-800">
          {snapshot.knownBlockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    {snapshot.unknowns.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Unknowns</p>
        <ul className="list-disc pl-4 text-sm text-slate-800">
          {snapshot.unknowns.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    {snapshot.notes && (
      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Notes</p>
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-6">{snapshot.notes}</p>
      </div>
    )}
  </div>
);

export const ReadinessSnapshots = () => {
  const snapshots = useSnapshotStore((state) => state.snapshots);
  const addSnapshot = useSnapshotStore((state) => state.addSnapshot);
  const resetSnapshots = useSnapshotStore((state) => state.resetSnapshots);

  const [label, setLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [knownBlockers, setKnownBlockers] = useState("");
  const [unknowns, setUnknowns] = useState("");
  const [notes, setNotes] = useState("");
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  const latestTwo = useMemo(() => selectLatestSnapshots(snapshots), [snapshots]);

  useEffect(() => {
    if (latestTwo[0] && !compareA) setCompareA(latestTwo[0].id);
    if (latestTwo[1] && !compareB) setCompareB(latestTwo[1].id);
  }, [latestTwo, compareA, compareB]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addSnapshot({
      label: label || undefined,
      summary,
      knownBlockers: toList(knownBlockers),
      unknowns: toList(unknowns),
      notes,
    });
    setLabel("");
    setSummary("");
    setKnownBlockers("");
    setUnknowns("");
    setNotes("");
  };

  const snapshotOptions = snapshots.map((s) => ({ value: s.id, label: s.label || s.summary.slice(0, 24) || s.id }));
  const firstSnapshot = snapshots.find((s) => s.id === compareA);
  const secondSnapshot = snapshots.find((s) => s.id === compareB);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Readiness snapshots</p>
          <h3 className="text-lg font-semibold text-slate-900">Capture state without pressure</h3>
          <p className="text-sm text-slate-700 leading-6">
            Snapshots are immutable once saved. They preserve the context of waiting, blockers, unknowns, and any notes you want to keep for your future self.
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              placeholder="Example: Mid-winter check"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Constraint summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
              placeholder="Describe the current constraints in your own words."
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Known blockers (one per line)</label>
            <textarea
              value={knownBlockers}
              onChange={(e) => setKnownBlockers(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
              placeholder="Lease clause, visa hold, health paperwork"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Unknowns (one per line)</label>
            <textarea
              value={unknowns}
              onChange={(e) => setUnknowns(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
              placeholder="Still waiting on..."
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Notes for yourself</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
              placeholder="Context for your future self. Not analyzed or scored."
            />
          </div>
          <div className="flex items-center justify-between md:col-span-2">
            <button
              type="button"
              onClick={() => resetSnapshots()}
              className="text-xs font-semibold text-slate-700 underline underline-offset-2"
            >
              Reset snapshots
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save snapshot
            </button>
          </div>
        </form>

        {snapshots.length === 0 ? (
          <p className="text-sm text-slate-700">No snapshots yet. Add one to preserve the current state.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {snapshots.map((snapshot) => (
              <SnapshotCard key={snapshot.id} snapshot={snapshot} />
            ))}
          </div>
        )}

        {snapshots.length >= 2 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Compare snapshots</p>
                <p className="text-sm text-slate-700">Select two snapshots to view side by side. No automatic diffing.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                >
                  {snapshotOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                >
                  {snapshotOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {firstSnapshot && <SnapshotCard snapshot={firstSnapshot} />}
                {secondSnapshot && <SnapshotCard snapshot={secondSnapshot} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
