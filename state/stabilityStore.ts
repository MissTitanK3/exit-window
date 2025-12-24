// Stability mode store capturing what must stay steady while exit is blocked.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { StabilityFocus, StabilityStateFrame } from '../domain/types';

const STORE_VERSION = 1;

export type StabilityState = StabilityStateFrame & {
  setActive: (active: boolean) => void;
  setStatement: (text: string) => void;
  addFocus: (focus: Omit<StabilityFocus, 'id'> & { id?: string }) => void;
  updateFocus: (id: string, patch: Partial<StabilityFocus>) => void;
  removeFocus: (id: string) => void;
  reset: () => void;
};

type StabilityPersistedState = Pick<StabilityState, 'active' | 'statement' | 'focuses'>;

const initialFrame: StabilityStateFrame = {
  active: false,
  statement: 'Waiting is correct right now. Keep the essentials steady.',
  focuses: [],
};

const creator: StateCreator<StabilityState> = (set, get) => ({
  ...initialFrame,
  setActive: (active) => set({ active }),
  setStatement: (text) => set({ statement: text }),
  addFocus: (focus) => {
    const label = focus.label.trim();
    const mustRemainStable = focus.mustRemainStable.trim();
    if (!label || !mustRemainStable) return;
    const entry: StabilityFocus = {
      id: focus.id ?? `${Date.now()}`,
      label,
      mustRemainStable,
      status: focus.status ?? 'stable',
      note: focus.note,
      flaggedAt: focus.flaggedAt,
    };
    set({ focuses: [...get().focuses, entry] });
  },
  updateFocus: (id, patch) =>
    set({
      focuses: get().focuses.map((f) =>
        f.id === id
          ? { ...f, ...patch, flaggedAt: patch.status === 'degrading' ? new Date().toISOString() : f.flaggedAt }
          : f,
      ),
    }),
  removeFocus: (id) => set({ focuses: get().focuses.filter((f) => f.id !== id) }),
  reset: () => set({ ...initialFrame }),
});

const storage = createJSONStorage<StabilityPersistedState>(() => localStorage);

export const useStabilityStore = create<StabilityState>()(
  persist<StabilityState, [], [], StabilityPersistedState>(creator, {
    name: makeStorageKey('stability'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { ...initialFrame } as StabilityPersistedState;
      const data = persistedState as Partial<StabilityPersistedState>;
      return {
        active: data.active ?? initialFrame.active,
        statement: data.statement ?? initialFrame.statement,
        focuses: data.focuses ?? initialFrame.focuses,
      } as StabilityPersistedState;
    },
    partialize: (state) => ({ active: state.active, statement: state.statement, focuses: state.focuses }),
  }),
);

export const selectStabilityWarnings = (frame: StabilityStateFrame): string[] =>
  frame.focuses
    .filter((focus) => focus.status === 'degrading')
    .map((focus) => `Stability is degrading for ${focus.label}${focus.note ? `: ${focus.note}` : ''}.`);
