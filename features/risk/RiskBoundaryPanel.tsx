// Risk boundary definitions written by the user and echoed back without interpretation.
"use client";

import { useState } from "react";
import { useRiskBoundaryStore } from "@/state";
import type { RiskBoundaryCategory } from "@/domain/types";

const categoryLabels: Record<RiskBoundaryCategory, string> = {
  abort: "Abort condition",
  "forced-move": "Forced move",
  reassess: "Reassess immediately",
};

export const RiskBoundaryPanel = () => {
  const [category, setCategory] = useState<RiskBoundaryCategory>("abort");
  const [description, setDescription] = useState("");

  const boundaries = useRiskBoundaryStore((state) => state.boundaries);
  const addBoundary = useRiskBoundaryStore((state) => state.addBoundary);
  const removeBoundary = useRiskBoundaryStore((state) => state.removeBoundary);
  const reset = useRiskBoundaryStore((state) => state.reset);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addBoundary(category, description);
    setDescription("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Risk boundaries</p>
          <h3 className="text-lg font-semibold text-slate-900">Conditions to stop, force, or reassess</h3>
          <p className="text-sm text-slate-700 leading-6">
            These statements come only from you. The system repeats them verbatim to avoid drift into unsafe territory.
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-[1fr_2fr]" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RiskBoundaryCategory)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Condition</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={2}
              placeholder="If lease termination costs exceed savings, abort."
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs font-semibold text-slate-700 underline underline-offset-2"
            >
              Reset boundaries
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add boundary
            </button>
          </div>
        </form>

        {boundaries.length === 0 ? (
          <p className="text-sm text-slate-700">No boundaries recorded. Add the conditions that should pause or force an exit.</p>
        ) : (
          <ul className="space-y-2">
            {boundaries.map((boundary) => (
              <li key={boundary.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{categoryLabels[boundary.category]}</p>
                    <p className="text-sm font-semibold text-slate-900">{boundary.description}</p>
                    <p className="text-xs text-slate-600">Added {new Date(boundary.addedAt).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBoundary(boundary.id)}
                    className="text-xs font-semibold text-slate-700 underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
