// Legal or administrative blockers intake.
"use client";

import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const options = [
  { value: "present", label: "Blocker present" },
  { value: "clear", label: "No known blocker" },
  { value: "unknown", label: "Unknown" },
] as const;

export const LegalSection = () => {
  const legal = useConstraintsStore((state) => state.constraints.legal);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const handleStatus = (blocker: Constraints["legal"]["blocker"]) => update({ legal: { ...legal, blocker } });
  const handleNote = (note: string) => update({ legal: { ...legal, note } });

  return (
    <ConstraintCard
      title="Legal or administrative blockers"
      description="Any legal or administrative blocker will stop relocation until cleared. Unknown is allowed; no assumptions are made."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${legal.blocker === option.value
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
            value={legal.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., visa transfer steps, contracts, court dates."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
