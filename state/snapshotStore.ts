// Readiness snapshot log with immutable entries and deterministic persistence.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { Snapshot } from '../domain/types';

const STORE_VERSION = 1;

export type SnapshotState = {
  snapshots: Snapshot[];
  addSnapshot: (input: Omit<Snapshot, 'id' | 'createdAt'> & { createdAt?: string }) => void;
  resetSnapshots: () => void;
};

type SnapshotPersistedState = Pick<SnapshotState, 'snapshots'>;
const initialSnapshots: Snapshot[] = [];

const creator: StateCreator<SnapshotState> = (set, get) => ({
  snapshots: initialSnapshots,
  addSnapshot: (input) => {
    const label = input.label?.trim();
    const summary = input.summary.trim();
    if (!summary) return;
    const entry: Snapshot = {
      id: input.createdAt ? `${input.createdAt}-${summary}` : `${Date.now()}-${summary}`,
      createdAt: input.createdAt ?? new Date().toISOString(),
      summary,
      knownBlockers: input.knownBlockers.map((b) => b.trim()).filter(Boolean),
      unknowns: input.unknowns.map((b) => b.trim()).filter(Boolean),
      notes: input.notes,
      label,
    };
    set({ snapshots: [entry, ...get().snapshots] });
  },
  resetSnapshots: () => set({ snapshots: initialSnapshots }),
});

const storage = createJSONStorage<SnapshotPersistedState>(() => localStorage);

export const useSnapshotStore = create<SnapshotState>()(
  persist<SnapshotState, [], [], SnapshotPersistedState>(creator, {
    name: makeStorageKey('snapshots'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION)
        return { snapshots: initialSnapshots } as SnapshotPersistedState;
      const data = persistedState as Partial<SnapshotPersistedState>;
      return { snapshots: data.snapshots ?? initialSnapshots } as SnapshotPersistedState;
    },
    partialize: (state) => ({ snapshots: state.snapshots }),
  }),
);

export const selectLatestSnapshots = (snapshots: Snapshot[]): Snapshot[] =>
  [...snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2);
