// Stores constraint inputs with versioned persistence.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { Constraints } from '../domain/types';

const STORE_VERSION = 1;

const initialConstraints: Constraints = {
  housing: {
    status: 'unknown',
    leaseEndDate: undefined,
    noticeDays: undefined,
    moveOutNoticeSent: 'unknown',
    newPlaceSecured: 'unknown',
    utilitiesTransferPlanned: 'unknown',
    note: '',
  },
  income: {
    stability: 'unknown',
    employerNotified: 'unknown',
    finalPayKnown: 'unknown',
    benefitsAdjusted: 'unknown',
    backupIncomeReady: 'unknown',
    note: '',
  },
  cashRunway: {
    status: 'unknown',
    months: undefined,
    moveCostsCovered: 'unknown',
    emergencyBufferReady: 'unknown',
    note: '',
  },
  dependents: {
    coverage: 'unknown',
    careArranged: 'unknown',
    recordsTransferred: 'unknown',
    backupCareReady: 'unknown',
    note: '',
  },
  healthcare: {
    continuity: 'unknown',
    coverageActive: 'unknown',
    medsStocked: 'unknown',
    recordsReady: 'unknown',
    note: '',
  },
  legal: {
    blocker: 'unknown',
    idsValid: 'unknown',
    mailForwardingSet: 'unknown',
    insuranceProofReady: 'unknown',
    note: '',
  },
};

export type ConstraintsState = {
  constraints: Constraints;
  updateConstraints: (partial: Partial<Constraints>) => void;
  resetConstraints: () => void;
};

const creator: StateCreator<ConstraintsState> = (set, get) => ({
  constraints: initialConstraints,
  updateConstraints: (partial) => set({ constraints: { ...get().constraints, ...partial } }),
  resetConstraints: () => set({ constraints: initialConstraints }),
});

const storage = createJSONStorage<ConstraintsState>(() => localStorage);

export const useConstraintsStore = create<ConstraintsState>()(
  persist(creator, {
    name: makeStorageKey('constraints'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { constraints: initialConstraints } as ConstraintsState;
      const data = persistedState as Partial<ConstraintsState>;
      return { constraints: data.constraints ?? initialConstraints } as ConstraintsState;
    },
  }),
);
