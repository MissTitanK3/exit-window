// Dependents intake to confirm support coverage.
"use client";
import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const options = [
  { value: "supported", label: "Support plan confirmed" },
  { value: "unsupported", label: "No support plan yet" },
  { value: "unknown", label: "Unknown" },
] as const;

export const DependentsSection = () => {
  const dependents = useConstraintsStore((state) => state.constraints.dependents);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const handleStatus = (coverage: Constraints["dependents"]["coverage"]) =>
    update({ dependents: { ...dependents, coverage } });

  const handleNote = (note: string) => update({ dependents: { ...dependents, note } });

  return (
    <ConstraintCard
      title="Dependents"
      description="Dependents need confirmed support before relocation. Unknown is acceptable; we will not infer readiness."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${dependents.coverage === option.value
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
            value={dependents.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., caregiver availability, school timing."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
