// Housing & lease timing intake with unknown-friendly inputs.
"use client";

import { useMemo } from "react";
import { useConstraintsStore } from "@/state";
import { Constraints } from "@/domain/types";
import { ConstraintCard } from "./ConstraintCard";

const housingStatusOptions = [
  { value: "aligned", label: "Aligned or month-to-month" },
  { value: "notice-required", label: "Notice required before exit" },
  { value: "locked-in", label: "Locked in beyond desired window" },
  { value: "unknown", label: "Unknown" },
] as const;

export const HousingSection = () => {
  const housing = useConstraintsStore((state) => state.constraints.housing);
  const update = useConstraintsStore((state) => state.updateConstraints);

  const noticeValue = housing.noticeDays ?? "";
  const leaseDateValue = useMemo(() => housing.leaseEndDate ?? "", [housing.leaseEndDate]);

  const handleStatus = (status: Constraints["housing"]["status"]) => {
    update({ housing: { ...housing, status } });
  };

  const handleLeaseDate = (value: string) => {
    update({ housing: { ...housing, leaseEndDate: value || undefined } });
  };

  const handleNoticeDays = (value: string) => {
    const parsed = value ? Number(value) : undefined;
    update({ housing: { ...housing, noticeDays: Number.isFinite(parsed) ? parsed : undefined } });
  };

  const handleNote = (value: string) => update({ housing: { ...housing, note: value } });

  return (
    <ConstraintCard
      title="Housing & lease timing"
      description="We need to know if housing obligations block departure. Unknown is allowed; the app will not infer missing dates."
    >
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-900">Lease status</label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {housingStatusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${housing.status === option.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                }`}
              onClick={() => handleStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-800">Lease end (optional)</label>
            <input
              type="date"
              value={leaseDateValue}
              onChange={(e) => handleLeaseDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-600">If unknown, leave blank. This will only be used to anchor the earliest exit window.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-800">Notice period (days, optional)</label>
            <input
              type="number"
              min={0}
              value={noticeValue}
              onChange={(e) => handleNoticeDays(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-600">If unknown, leave blank. No inference will be made.</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-800">Notes (why this matters)</label>
          <textarea
            value={housing.note ?? ""}
            onChange={(e) => handleNote(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="E.g., lease renews automatically unless notice sent by a date."
          />
        </div>
      </div>
    </ConstraintCard>
  );
};
