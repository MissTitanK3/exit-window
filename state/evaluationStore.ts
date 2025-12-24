// Stores the latest evaluation output with persistence.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { EvaluationResult } from '../domain/types';
import { evaluateConstraints } from '../domain/evaluation';
import { useConstraintsStore } from './constraintsStore';

const STORE_VERSION = 1;

export type EvaluationState = {
  lastResult?: EvaluationResult;
  evaluate: () => void;
  clear: () => void;
};

type EvaluationPersistedState = Pick<EvaluationState, 'lastResult'>;

const creator: StateCreator<EvaluationState> = (set) => ({
  lastResult: undefined,
  evaluate: () => {
    const constraints = useConstraintsStore.getState().constraints;
    const result = evaluateConstraints(constraints);
    set({ lastResult: result });
  },
  clear: () => set({ lastResult: undefined }),
});

const storage = createJSONStorage<EvaluationPersistedState>(() => localStorage);

export const useEvaluationStore = create<EvaluationState>()(
  persist<EvaluationState, [], [], EvaluationPersistedState>(creator, {
    name: makeStorageKey('evaluation'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { lastResult: undefined } as EvaluationPersistedState;
      return persistedState as EvaluationPersistedState;
    },
    partialize: (state) => ({ lastResult: state.lastResult }),
  }),
);
