// Cash runway intake with explicit unknown handling.
"use client";

import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const runwayOptions = [
  { value: "secure", label: "3+ months available" },
  { value: "tight", label: "Under 3 months" },
  { value: "unknown", label: "Unknown" },
] as const;

export const CashRunwaySection = () => {
  const cashRunway = useConstraintsStore((state) => state.constraints.cashRunway);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const handleStatus = (status: Constraints["cashRunway"]["status"]) => update({ cashRunway: { ...cashRunway, status } });

  const handleMonths = (value: string) => {
    const parsed = value ? Number(value) : undefined;
    update({ cashRunway: { ...cashRunway, months: Number.isFinite(parsed) ? parsed : undefined } });
  };

  const handleNote = (note: string) => update({ cashRunway: { ...cashRunway, note } });

  return (
    <ConstraintCard
      title="Cash runway"
      description="Runway affects how long relocation prep can continue. Unknown values are allowed; no estimates are inferred."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {runwayOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${cashRunway.status === option.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                }`}
              onClick={() => handleStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-slate-800">Months of runway (optional)</label>
          <input
            type="number"
            min={0}
            value={cashRunway.months ?? ""}
            onChange={(e) => handleMonths(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="Enter number of months if known"
          />
          <p className="text-xs text-slate-600">Leave blank if unknown; the evaluation will treat it as unknown.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-800">Notes</label>
          <textarea
            value={cashRunway.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., savings, burn rate assumptions, upcoming expenses."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
