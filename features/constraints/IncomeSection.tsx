// Income stability intake; allows unknown and avoids inference.
"use client";

import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const incomeOptions = [
  { value: "stable", label: "Stable / reliable" },
  { value: "unstable", label: "Unstable / at risk" },
  { value: "unknown", label: "Unknown" },
] as const;

export const IncomeSection = () => {
  const income = useConstraintsStore((state) => state.constraints.income);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const handleStatus = (stability: Constraints["income"]["stability"]) => {
    update({ income: { ...income, stability } });
  };

  const handleNote = (note: string) => update({ income: { ...income, note } });

  return (
    <ConstraintCard
      title="Income stability"
      description="Income stability influences whether relocation can proceed without disruption. Unknown is acceptable; this app will not guess."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {incomeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${income.stability === option.value
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
            value={income.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., contract renewal pending; bonus uncertain."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
