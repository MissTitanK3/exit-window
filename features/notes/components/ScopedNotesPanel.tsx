"use client";

import { useMemo, useState } from "react";
import type { ScopedNoteContext } from "@/domain/types";
import { useNotesStore } from "@/state";

const contextLabels: Record<ScopedNoteContext, string> = {
  constraint: "Constraint",
  snapshot: "Snapshot",
  blocker: "Blocker",
};

export const ScopedNotesPanel = () => {
  const [context, setContext] = useState<ScopedNoteContext>("constraint");
  const [contextId, setContextId] = useState("");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | ScopedNoteContext>("all");

  const notes = useNotesStore((state) => state.notes);
  const addNote = useNotesStore((state) => state.addNote);
  const removeNote = useNotesStore((state) => state.removeNote);

  const filtered = useMemo(() => {
    if (filter === "all") return notes;
    return notes.filter((note) => note.context === filter);
  }, [filter, notes]);

  const canSave = text.trim().length > 0 && contextId.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-900">Add a quick note</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm text-slate-700 font-semibold">
            Context
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={context}
              onChange={(e) => setContext(e.target.value as ScopedNoteContext)}
            >
              {Object.keys(contextLabels).map((key) => (
                <option key={key} value={key}>
                  {contextLabels[key as ScopedNoteContext]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-slate-700 font-semibold">
            ID or label
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="ex: lease-1"
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700 font-semibold sm:col-span-1">
            Filter
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | ScopedNoteContext)}
            >
              <option value="all">All</option>
              {Object.keys(contextLabels).map((key) => (
                <option key={key} value={key}>
                  {contextLabels[key as ScopedNoteContext]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="space-y-1 text-sm text-slate-700 font-semibold">
          Note
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to remember?"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              addNote({ context, contextId: contextId.trim(), text });
              setText("");
            }}
          >
            Save note
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">Notes</p>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((note) => (
              <li key={note.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {contextLabels[note.context]} • {note.contextId}
                  </span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{note.text}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => removeNote(note.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
