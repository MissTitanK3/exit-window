// Surfaces the trust report so users can verify the offline-only policy.
"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/state";
import { getNetworkTrustReport } from "../trust/transparency";

type TrustReport = ReturnType<typeof getNetworkTrustReport>;

const initialReport: TrustReport = {
  policy: "block-external",
  fetchAttempts: 0,
  lastChecked: "Pending…",
  message: "Exit Window blocks external network calls; only local resources are allowed.",
};

export const TrustPanel = () => {
  const [report, setReport] = useState<TrustReport>(initialReport);
  const launchCount = useAppStore((state) => state.launchCount);
  const lastLaunchedAt = useAppStore((state) => state.lastLaunchedAt);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReport(getNetworkTrustReport()));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-600">Trust & Transparency</p>
          <h2 className="text-lg font-semibold text-slate-900">Network policy</h2>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-800 md:grid-cols-2">
          <div className="rounded-lg bg-white p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">Policy</dt>
            <dd className="font-semibold">{report.policy}</dd>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">Blocked fetch attempts</dt>
            <dd className="font-semibold">{report.fetchAttempts}</dd>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">Last checked</dt>
            <dd className="font-semibold">{report.lastChecked}</dd>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">Local sessions</dt>
            <dd className="font-semibold">
              {launchCount} {launchCount === 1 ? "session" : "sessions"}
              {lastLaunchedAt ? `, latest at ${lastLaunchedAt}` : ""}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-slate-700 leading-6">{report.message}</p>
      </div>
    </section>
  );
};
