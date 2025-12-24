// Constraint change log capturing explicit user-noted shifts and blockers.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { ConstraintChangeEntry, ConstraintChangeKind } from '../domain/types';

const STORE_VERSION = 1;

export type ChangeLogState = {
  changes: ConstraintChangeEntry[];
  lastReviewedAt?: string;
  addChange: (entry: {
    title: string;
    description: string;
    kind: ConstraintChangeKind;
    relatedConstraint?: ConstraintChangeEntry['relatedConstraint'];
    recordedAt?: string;
  }) => void;
  markReviewed: (timestamp?: string) => void;
  reset: () => void;
};

type ChangeLogPersistedState = Pick<ChangeLogState, 'changes' | 'lastReviewedAt'>;

const initialState: ChangeLogPersistedState = {
  changes: [],
  lastReviewedAt: undefined,
};

const creator: StateCreator<ChangeLogState> = (set, get) => ({
  ...initialState,
  addChange: (entry) => {
    const title = entry.title.trim();
    const description = entry.description.trim();
    if (!title || !description) return;
    const change: ConstraintChangeEntry = {
      id: entry.recordedAt ? `${entry.recordedAt}-${title}` : `${Date.now()}-${title}`,
      title,
      description,
      kind: entry.kind,
      relatedConstraint: entry.relatedConstraint,
      recordedAt: entry.recordedAt ?? new Date().toISOString(),
    };
    set({ changes: [change, ...get().changes] });
  },
  markReviewed: (timestamp) => set({ lastReviewedAt: timestamp ?? new Date().toISOString() }),
  reset: () => set({ ...initialState }),
});

const storage = createJSONStorage<ChangeLogPersistedState>(() => localStorage);

export const useChangeLogStore = create<ChangeLogState>()(
  persist<ChangeLogState, [], [], ChangeLogPersistedState>(creator, {
    name: makeStorageKey('change-log'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { ...initialState } as ChangeLogPersistedState;
      const data = persistedState as Partial<ChangeLogPersistedState>;
      return { changes: data.changes ?? [], lastReviewedAt: data.lastReviewedAt } as ChangeLogPersistedState;
    },
    partialize: (state) => ({ changes: state.changes, lastReviewedAt: state.lastReviewedAt }),
  }),
);

export const selectChangesSinceLastReview = (state: ChangeLogPersistedState): ConstraintChangeEntry[] => {
  if (!state.lastReviewedAt) return state.changes;
  return state.changes.filter((change) => change.recordedAt > state.lastReviewedAt!);
};
