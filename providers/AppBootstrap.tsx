// Client-side bootstrap that enforces offline guarantees and records sessions.
"use client";

import { useEffect } from "react";
import { guardNetworkCalls } from "../features/trust/transparency";
import { useAppStore, useAppStoreHydration } from "../state";
import type { AppState } from "../state";

export const AppBootstrap = () => {
  const markSession = useAppStore((state: AppState) => state.markSession);
  const hydrated = useAppStoreHydration();

  useEffect(() => {
    if (!hydrated) return;
    // In development, aggressively unregister any previously installed service workers to avoid HMR loops.
    if (process.env.NODE_ENV !== "production" && typeof navigator !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => { });
    }

    guardNetworkCalls();
    markSession();
  }, [hydrated, markSession]);

  return null;
};
