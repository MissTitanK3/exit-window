// User-authored risk boundaries to guard against unsafe moves.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { RiskBoundary, RiskBoundaryCategory } from '../domain/types';

const STORE_VERSION = 1;

export type RiskBoundaryState = {
  boundaries: RiskBoundary[];
  addBoundary: (category: RiskBoundaryCategory, description: string) => void;
  removeBoundary: (id: string) => void;
  reset: () => void;
};

type RiskBoundaryPersistedState = Pick<RiskBoundaryState, 'boundaries'>;

const initialBoundaries: RiskBoundary[] = [];

const creator: StateCreator<RiskBoundaryState> = (set, get) => ({
  boundaries: initialBoundaries,
  addBoundary: (category, description) => {
    const trimmed = description.trim();
    if (!trimmed) return;
    const entry: RiskBoundary = {
      id: `${Date.now()}-${category}`,
      category,
      description: trimmed,
      addedAt: new Date().toISOString(),
    };
    set({ boundaries: [...get().boundaries, entry] });
  },
  removeBoundary: (id) => set({ boundaries: get().boundaries.filter((b) => b.id !== id) }),
  reset: () => set({ boundaries: initialBoundaries }),
});

const storage = createJSONStorage<RiskBoundaryPersistedState>(() => localStorage);

export const useRiskBoundaryStore = create<RiskBoundaryState>()(
  persist<RiskBoundaryState, [], [], RiskBoundaryPersistedState>(creator, {
    name: makeStorageKey('risk-boundaries'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION)
        return { boundaries: initialBoundaries } as RiskBoundaryPersistedState;
      const data = persistedState as Partial<RiskBoundaryPersistedState>;
      return { boundaries: data.boundaries ?? initialBoundaries } as RiskBoundaryPersistedState;
    },
    partialize: (state) => ({ boundaries: state.boundaries }),
  }),
);
