import type { Note, NoteBlock } from "./notesTypes";

export const STORAGE_KEY = "notebrain.notes.v1";

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now() {
  return Date.now();
}

export function getPlainTextFromHtml(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function inlineMarkdownToHtml(text: string) {
  const safe = escapeHtml(text);
  return safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function markdownToBlocks(md: string): NoteBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: NoteBlock[] = [];

  for (const lineRaw of lines) {
    const line = lineRaw.replace(/\t/g, "    ");
    if (line.trim() === "") {
      blocks.push({ id: uid(), type: "paragraph", html: "" });
      continue;
    }

    const ordered = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ordered) {
      const order = Number(ordered[1]);
      blocks.push({
        id: uid(),
        type: "ordered",
        order,
        html: inlineMarkdownToHtml(ordered[2]),
      });
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      blocks.push({
        id: uid(),
        type: "bullet",
        html: inlineMarkdownToHtml(bullet[1]),
      });
      continue;
    }

    blocks.push({ id: uid(), type: "paragraph", html: inlineMarkdownToHtml(line) });
  }

  return blocks.length ? blocks : [{ id: uid(), type: "paragraph", html: "" }];
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
