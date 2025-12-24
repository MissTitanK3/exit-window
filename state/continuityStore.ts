// Lightweight status flags for silent-failure continuity checks.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { ContinuityKey, ContinuityStatus } from '../domain/types';

const STORE_VERSION = 1;

export type ContinuityState = {
  checks: Record<ContinuityKey, ContinuityStatus>;
  setStatus: (key: ContinuityKey, status: ContinuityStatus) => void;
  reset: () => void;
};

type ContinuityPersistedState = Pick<ContinuityState, 'checks'>;

const initialChecks: Record<ContinuityKey, ContinuityStatus> = {
  comms: 'open',
  access: 'open',
  identityInference: 'open',
  cutoffs: 'open',
  addressShadow: 'open',
  jurisdiction: 'open',
  mail: 'open',
  devices: 'open',
  cognitive: 'open',
  supportTested: 'open',
  docsAccess: 'open',
  expectations: 'open',
};

const creator: StateCreator<ContinuityState> = (set) => ({
  checks: initialChecks,
  setStatus: (key, status) => set((state) => ({ checks: { ...state.checks, [key]: status } })),
  reset: () => set({ checks: initialChecks }),
});

const storage = createJSONStorage<ContinuityPersistedState>(() => localStorage);

export const useContinuityStore = create<ContinuityState>()(
  persist<ContinuityState, [], [], ContinuityPersistedState>(creator, {
    name: makeStorageKey('continuity'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { checks: initialChecks } as ContinuityState;
      const data = persistedState as Partial<ContinuityState>;
      return { checks: { ...initialChecks, ...(data.checks ?? {}) } } as ContinuityState;
    },
    partialize: (state) => ({ checks: state.checks }),
  }),
);
