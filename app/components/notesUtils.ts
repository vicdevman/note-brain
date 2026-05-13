import type { Note, NoteBlock } from "./notesTypes";

export const STORAGE_KEY = "notebrain.notes.v1";

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now() {
  return Date.now();
}

export function newNote(): Note {
  const id = uid();
  const ts = now();
  return {
    id,
    title: "Untitled",
    blocks: [{ id: uid(), type: "paragraph", html: "" }],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function clampTitle(title: string) {
  const t = title.trim();
  return t.length ? t : "Untitled";
}
