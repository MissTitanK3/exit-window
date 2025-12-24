// Scoped notes for human-only reflection tied to constraints, snapshots, or blockers.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { makeStorageKey } from '../persistence/storage';
import type { ScopedNote, ScopedNoteContext } from '../domain/types';

const STORE_VERSION = 1;

export type NotesState = {
  notes: ScopedNote[];
  addNote: (input: { context: ScopedNoteContext; contextId: string; text: string; createdAt?: string }) => void;
  removeNote: (id: string) => void;
  reset: () => void;
};

type NotesPersistedState = Pick<NotesState, 'notes'>;

const initialNotes: ScopedNote[] = [];

const creator: StateCreator<NotesState> = (set, get) => ({
  notes: initialNotes,
  addNote: (input) => {
    const text = input.text.trim();
    const contextId = input.contextId.trim();
    if (!text || !contextId) return;
    const note: ScopedNote = {
      id: input.createdAt ? `${input.createdAt}-${contextId}` : `${Date.now()}-${contextId}`,
      context: input.context,
      contextId,
      text,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    set({ notes: [note, ...get().notes] });
  },
  removeNote: (id) => set({ notes: get().notes.filter((note) => note.id !== id) }),
  reset: () => set({ notes: initialNotes }),
});

const storage = createJSONStorage<NotesPersistedState>(() => localStorage);

export const useNotesStore = create<NotesState>()(
  persist<NotesState, [], [], NotesPersistedState>(creator, {
    name: makeStorageKey('notes'),
    version: STORE_VERSION,
    storage,
    migrate: (persistedState: unknown, version) => {
      if (!persistedState || version !== STORE_VERSION) return { notes: initialNotes } as NotesPersistedState;
      const data = persistedState as Partial<NotesPersistedState>;
      return { notes: data.notes ?? initialNotes } as NotesPersistedState;
    },
    partialize: (state) => ({ notes: state.notes }),
  }),
);
