"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useDebouncedCallback } from "use-debounce";
import Image from "next/image";

type SharedNoteEditorProps = {
  token: string;
  title: string;
  content: any[];
  permission: "view" | "edit";
};

export default function SharedNoteEditor({
  token,
  title,
  content,
  permission,
}: SharedNoteEditorProps) {
  const canEdit = permission === "edit";
  const editor = useCreateBlockNote({
    initialContent: content.length > 0 ? content : undefined,
  });

  const saveSharedNote = useDebouncedCallback(async (blocks) => {
    if (!canEdit) return;

    await fetch(`/api/share/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: blocks }),
    });
  }, 650);

  return (
    <main className="min-h-[100dvh] bg-[var(--nb-note-bg)] text-[var(--nb-text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/brane-brand-kit/new-logo-primary.png" alt="Brane" width={28} height={28} className="w-7 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-md font-semibold text-[var(--nb-border)]">Brane</div>
              {/* <div className="truncate text-xs text-[var(--nb-text-muted)]">{title}</div> */}
            </div>
          </div>
          <span className="rounded-full border border-[var(--nb-border-strong)] px-3 py-1 text-xs font-medium text-[var(--nb-text-muted)]">
            {canEdit ? "Can edit" : "View only"}
          </span>
        </div>
      </header>

      <section className="note-editor-shell mx-auto max-w-4xl px-3 py-5 md:px-6">
        <BlockNoteView
          editor={editor}
          editable={canEdit}
          onChange={() => {
            saveSharedNote(editor.document);
          }}
        />
      </section>
    </main>
  );
}
