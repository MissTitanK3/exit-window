// Minimal localStorage wrapper chosen for simplicity and deterministic offline reads/writes.
export const storageKey = 'exit-window-store';
export const makeStorageKey = (suffix: string) => `exit-window-${suffix}`;

// Remove all Exit Window entries from localStorage (used by the quick wipe control).
export const clearExitWindowStorage = () => {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (key === storageKey || key.startsWith('exit-window-')) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};

export const storage = {
  get: <T>(key: string): T | undefined => {
    if (typeof window === 'undefined') return undefined;
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt JSON should not break the app; clear and return undefined.
      window.localStorage.removeItem(key);
      return undefined;
    }
  },
  set: <T>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota or storage failures to keep the UI responsive.
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};
