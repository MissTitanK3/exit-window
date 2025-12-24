// Global app state with versioned persistence and explicit reset/delete controls.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { storageKey } from '../persistence/storage';

const STORE_VERSION = 1;

// Serializable slice that is persisted.
type AppData = {
  appVersion: string;
  launchCount: number;
  lastLaunchedAt?: string;
};

// Actions stay in memory and are not persisted.
type AppActions = {
  markSession: () => void;
  resetState: () => void;
  deleteState: () => void;
};

export type AppState = AppData & AppActions;

const initialData: AppData = {
  appVersion: '0.1.0',
  launchCount: 0,
  lastLaunchedAt: undefined,
};

// Persist only the serializable data using localStorage.
const jsonStorage = createJSONStorage<AppState>(() => localStorage);

const creator: StateCreator<AppState> = (
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void,
  get: () => AppState,
) => ({
  ...initialData,
  markSession: () => {
    const now = new Date().toISOString();
    set({
      launchCount: get().launchCount + 1,
      lastLaunchedAt: now,
    });
  },
  resetState: () => set({ ...initialData }),
  deleteState: () => {
    set({ ...initialData });
    if (typeof window !== 'undefined') {
      jsonStorage?.removeItem(storageKey);
    }
  },
});

export const useAppStore = create<AppState>()(
  persist<AppState>(creator, {
    name: storageKey,
    version: STORE_VERSION,
    storage: jsonStorage,
    migrate: (persistedState: unknown, version: number) => {
      if (!persistedState || version !== STORE_VERSION) return { ...initialData } as AppState;
      return { ...initialData, ...(persistedState as Partial<AppState>) } as AppState;
    },
    partialize: (state) =>
      ({
        appVersion: state.appVersion,
        launchCount: state.launchCount,
        lastLaunchedAt: state.lastLaunchedAt,
      } as AppState),
    skipHydration: true,
  }),
);
