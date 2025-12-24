// Shows local persistence status and exposes reset/delete controls.
"use client";

import { useCallback } from "react";
import { Chip } from "@/features/common/Chip";
import { useAppStore, useAppStoreHydration } from "@/state";

export const LocalStatePanel = () => {
  const hydrated = useAppStoreHydration();
  const resetState = useAppStore((state) => state.resetState);
  const deleteState = useAppStore((state) => state.deleteState);
  const appVersion = useAppStore((state) => state.appVersion);
  const launchCount = useAppStore((state) => state.launchCount);

  const handleReset = useCallback(() => resetState(), [resetState]);
  const handleDelete = useCallback(() => deleteState(), [deleteState]);

  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Local State</p>
            <h2 className="text-lg font-semibold text-slate-900">Versioned persistence</h2>
            <p className="text-sm text-slate-700 leading-6">Loading local state…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Local State</p>
          <h2 className="text-lg font-semibold text-slate-900">Versioned persistence</h2>
          <p className="text-sm text-slate-700 leading-6">
            Stored in localStorage for deterministic offline reads. Buttons below operate only on your device.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-800">
          <Chip tone="neutral" variant="soft">Schema v{appVersion}</Chip>
          <Chip tone="neutral" variant="soft">Launches: {launchCount}</Chip>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
            onClick={handleReset}
          >
            Reset to defaults
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-100"
            onClick={handleDelete}
          >
            Delete stored data
          </button>
        </div>
      </div>
    </section>
  );
};
