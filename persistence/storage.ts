// Minimal localStorage wrapper chosen for simplicity and deterministic offline reads/writes.
export const storageKey = 'exit-window-store';
export const makeStorageKey = (suffix: string) => `exit-window-${suffix}`;

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
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};
