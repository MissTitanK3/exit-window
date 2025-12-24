// Pre-departure readiness frame: holding status, blockers, required conditions, and time constraints with resettable persistence.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { PreDepartureFrame, PreDepartureStatus, TimeConstraint } from '../domain/types';

const STORE_VERSION = 1;

export type PreDepartureState = PreDepartureFrame & {
  setStatus: (status: PreDepartureStatus) => void;
  addTopBlocker: (blocker: string) => void;
  removeTopBlocker: (index: number) => void;
  setNextRequiredCondition: (condition: string) => void;
  addTimeConstraint: (constraint: Omit<TimeConstraint, 'id'> & { id?: string }) => void;
  updateTimeConstraint: (id: string, patch: Partial<TimeConstraint>) => void;
  removeTimeConstraint: (id: string) => void;
  markChangesReviewed: (timestamp?: string) => void;
  reset: () => void;
};

const initialFrame: PreDepartureFrame = {
  status: 'not-yet',
  topBlockers: [],
  nextRequiredCondition: '',
  timeConstraints: [],
  lastReviewedChangeAt: undefined,
};

const creator: StateCreator<PreDepartureState> = (set, get) => ({
  ...initialFrame,
  setStatus: (status) => set({ status }),
  addTopBlocker: (blocker) => {
    const trimmed = blocker.trim();
    if (!trimmed) return;
    set({ topBlockers: [...get().topBlockers, trimmed] });
  },
  removeTopBlocker: (index) => set({ topBlockers: get().topBlockers.filter((_, i) => i !== index) }),
  setNextRequiredCondition: (condition) => set({ nextRequiredCondition: condition }),
  addTimeConstraint: (constraint) => {
    const id = constraint.id ?? `${Date.now()}`;
    const label = constraint.label.trim();
    if (!label) return;
    const clean: TimeConstraint = { id, label, targetDate: constraint.targetDate, note: constraint.note };
    set({ timeConstraints: [...get().timeConstraints, clean] });
  },
  updateTimeConstraint: (id, patch) =>
    set({ timeConstraints: get().timeConstraints.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) }),
  removeTimeConstraint: (id) => set({ timeConstraints: get().timeConstraints.filter((entry) => entry.id !== id) }),
  markChangesReviewed: (timestamp) => set({ lastReviewedChangeAt: timestamp ?? new Date().toISOString() }),
  reset: () => set({ ...initialFrame }),
});

const storage = createJSONStorage<PreDepartureState>(() => localStorage);

export const usePreDepartureStore = create<PreDepartureState>()(
  persist(creator, {
    name: makeStorageKey('pre-departure'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { ...initialFrame } as PreDepartureState;
      const data = persistedState as Partial<PreDepartureState>;
      return { ...initialFrame, ...data } as PreDepartureState;
    },
    partialize: (state) =>
      ({
        status: state.status,
        topBlockers: state.topBlockers,
        nextRequiredCondition: state.nextRequiredCondition,
        timeConstraints: state.timeConstraints,
        lastReviewedChangeAt: state.lastReviewedChangeAt,
      } as PreDepartureState),
  }),
);
