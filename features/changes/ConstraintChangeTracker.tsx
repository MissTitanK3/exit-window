// Constraint change tracker showing explicit user-noted differences since the last review.
"use client";

import { useState, useMemo } from "react";
import { useChangeLogStore } from "@/state";
import { selectChangesSinceLastReview } from "@/state/changeLogStore";
import type { ConstraintChangeKind, Constraints } from "@/domain/types";

const kindLabels: Record<ConstraintChangeKind, string> = {
  "constraint-changed": "Constraint adjusted",
  "blocker-resolved": "Blocker resolved",
  "blocker-introduced": "New blocker introduced",
};

const constraintKeys: Array<keyof Constraints> = ["housing", "income", "cashRunway", "dependents", "healthcare", "legal"];

export const ConstraintChangeTracker = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ConstraintChangeKind>("constraint-changed");
  const [relatedConstraint, setRelatedConstraint] = useState<keyof Constraints | "">("");

  const changes = useChangeLogStore((state) => state.changes);
  const lastReviewedAt = useChangeLogStore((state) => state.lastReviewedAt);
  const addChange = useChangeLogStore((state) => state.addChange);
  const markReviewed = useChangeLogStore((state) => state.markReviewed);
  const reset = useChangeLogStore((state) => state.reset);

  const recentChanges = useMemo(() => selectChangesSinceLastReview({ changes, lastReviewedAt }), [changes, lastReviewedAt]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addChange({ title, description, kind, relatedConstraint: relatedConstraint || undefined });
    setTitle("");
    setDescription("");
    setRelatedConstraint("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Change tracking</p>
          <h3 className="text-lg font-semibold text-slate-900">What changed since the last check</h3>
          <p className="text-sm text-slate-700 leading-6">
            Record only explicit updates. No inference, no automatic diffs. Mark a review when you have read through the list.
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              placeholder="Example: Lease end date confirmed"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Kind</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ConstraintChangeKind)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {Object.entries(kindLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
              placeholder="Capture only what changed in plain language."
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Related constraint (optional)</label>
            <select
              value={relatedConstraint}
              onChange={(e) => setRelatedConstraint(e.target.value as keyof Constraints | "")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">Unspecified</option>
              {constraintKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => markReviewed()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Mark reviewed now
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add change
            </button>
          </div>
        </form>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-800">Since last review</p>
            {recentChanges.length === 0 ? (
              <p className="text-sm text-amber-900">No unreviewed changes.</p>
            ) : (
              <ul className="space-y-2 text-sm text-amber-900">
                {recentChanges.map((item) => (
                  <li key={item.id} className="rounded border border-amber-200 bg-white/60 p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{kindLabels[item.kind]}</span>
                      <span className="text-xs uppercase text-amber-700">{new Date(item.recordedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-amber-700">{item.description}</p>
                    {item.relatedConstraint && <p className="text-xs text-amber-700">Constraint: {item.relatedConstraint}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Full log</p>
              <button
                type="button"
                onClick={() => reset()}
                className="text-xs font-semibold text-slate-700 underline underline-offset-2"
              >
                Reset log
              </button>
            </div>
            {changes.length === 0 ? (
              <p className="text-sm text-slate-700">No entries yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-800">
                {changes.map((item) => (
                  <li key={item.id} className="rounded border border-slate-200 bg-white p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      <span className="text-xs uppercase text-slate-600">{new Date(item.recordedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600">{kindLabels[item.kind]}</p>
                    <p className="text-sm text-slate-800 leading-5">{item.description}</p>
                    {item.relatedConstraint && <p className="text-xs text-slate-600">Constraint: {item.relatedConstraint}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
