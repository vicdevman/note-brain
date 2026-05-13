import type { Note, NoteBlock } from "./notesTypes";

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now() {
  return Date.now();
}

export function clampTitle(title: string) {
  const t = title.trim();
  return t.length ? t : "Untitled";
}

function normalize(note: any): Note {
  return {
    id: note.pouchId ?? note._id?.toString() ?? note.id,
    title: note.title ?? "Untitled",
    blocks: Array.isArray(note.content) ? note.content : note.blocks ?? [],
    createdAt: note.createdAt ? new Date(note.createdAt).getTime() : Date.now(),
    updatedAt: note.updatedAt ? new Date(note.updatedAt).getTime() : Date.now(),
  };
}

export async function fetchNotes(): Promise<Note[]> {
  try {
    const res = await fetch(`/api/notes`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalize);
  } catch (e) {
    console.error("fetchNotes error", e);
    return [];
  }
}

export async function createNoteAPI(): Promise<Note | null> {
  try {
    const res = await fetch(`/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: [] }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalize(data);
  } catch (e) {
    console.error("createNoteAPI error", e);
    return null;
  }
}

export async function updateNoteAPI(id: string, patch: Partial<Note>) {
  try {
    const body: any = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.blocks !== undefined) body.content = patch.blocks;
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update");
    const data = await res.json();
    return normalize(data);
  } catch (e) {
    console.error("updateNoteAPI error", e);
    throw e;
  }
}

export async function deleteNoteAPI(id: string) {
  try {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    return true;
  } catch (e) {
    console.error("deleteNoteAPI error", e);
    return false;
  }
}
