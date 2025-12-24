// Healthcare continuity intake to identify blockers.
"use client";

import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const options = [
  { value: "secured", label: "Continuity secured" },
  { value: "at-risk", label: "Continuity at risk" },
  { value: "unknown", label: "Unknown" },
] as const;

export const HealthcareSection = () => {
  const healthcare = useConstraintsStore((state) => state.constraints.healthcare);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const handleStatus = (continuity: Constraints["healthcare"]["continuity"]) =>
    update({ healthcare: { ...healthcare, continuity } });

  const handleNote = (note: string) => update({ healthcare: { ...healthcare, note } });

  return (
    <ConstraintCard
      title="Healthcare continuity"
      description="Continuity of care is a potential hard blocker. Unknown is acceptable; nothing is inferred."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${healthcare.continuity === option.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                }`}
              onClick={() => handleStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-800">Notes</label>
          <textarea
            value={healthcare.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., medication continuity, insurance coverage timing."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
