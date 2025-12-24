// Guards against external network calls and reports current policy state.
'use client';

type TrustReport = {
  policy: 'block-external';
  fetchAttempts: number;
  lastChecked: string;
  message: string;
};

type GuardedWindow = typeof window & {
  __exitWindowFetchGuarded?: boolean;
};

const state = { fetchAttempts: 0 };

export const guardNetworkCalls = () => {
  if (typeof window === 'undefined') return;
  const w = window as GuardedWindow;
  if (w.__exitWindowFetchGuarded) return;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
    const isExternal = /^https?:\/\//.test(url) && !url.startsWith(window.location.origin);
    if (isExternal) {
      state.fetchAttempts += 1;
      throw new Error('External network calls are blocked to keep Exit Window offline.');
    }
    return originalFetch(input, init);
  };

  w.__exitWindowFetchGuarded = true;
};

export const getNetworkTrustReport = (): TrustReport => ({
  policy: 'block-external',
  fetchAttempts: state.fetchAttempts,
  lastChecked: new Date().toISOString(),
  message: 'Exit Window blocks external network calls; only local resources are allowed.',
});
