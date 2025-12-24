// Visual indicator that the app is offline-first and blocks network calls.
"use client";

import { useEffect, useState } from "react";
import { getNetworkTrustReport } from "../trust/transparency";

export const OfflineIndicator = () => {
  const [online, setOnline] = useState<boolean | null>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : null,
  );
  const report = getNetworkTrustReport();

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="h-3 w-3 rounded-full" aria-hidden style={{ backgroundColor: online === false ? '#10b981' : '#f59e0b' }} />
      <div className="flex flex-col text-sm text-slate-800">
        <span className="font-semibold">Offline-first</span>
        <span>External network calls are blocked. Policy: {report.policy}. Attempts blocked: {report.fetchAttempts}.</span>
      </div>
    </div>
  );
};
