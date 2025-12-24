// Tracks app mode (planning vs holding) with persistence.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { AppMode } from '../domain/types';

const STORE_VERSION = 1;

export type ModeState = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

type ModePersistedState = Pick<ModeState, 'mode'>;

const creator: StateCreator<ModeState> = (set) => ({
  mode: 'planning',
  setMode: (mode) => set({ mode }),
});

const storage = createJSONStorage<ModePersistedState>(() => localStorage);

export const useModeStore = create<ModeState>()(
  persist<ModeState, [], [], ModePersistedState>(creator, {
    name: makeStorageKey('mode'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { mode: 'planning' } as ModePersistedState;
      return persistedState as ModePersistedState;
    },
    partialize: (state) => ({ mode: state.mode }),
  }),
);
