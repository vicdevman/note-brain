"use client";

import React, { useMemo, useRef, useState } from "react";
import type { BlockType, Note, NoteBlock } from "../../app/components/notesTypes";
import {
  getPlainTextFromHtml,
  markdownToBlocks,
  uid,
} from "../../app/components/notesUtils";
import Image from "next/image";
import Editor from "./editor";

export default function NoteEditor(props: {
  note: Note;
  onChangeTitle: (title: string) => void;
  onChangeBlock: (blockId: string, patch: Partial<NoteBlock>) => void;
  onInsertBlockAfter: (afterId: string, block: NoteBlock) => void;
  onRemoveBlock: (blockId: string) => void;
  onReplaceBlocks: (blocks: NoteBlock[]) => void;
}) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [linkPreview, setLinkPreview] = useState<{ url: string; title: string } | null>(null);

  function focusBlock(id: string) {
    const el = blockRefs.current.get(id);
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function exec(cmd: "bold") {
    document.execCommand(cmd);
  }

  function detectAndShowLinkPreview(text: string) {
    const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9]{1,6}\b(?:[-a-zA-Z0-9@:%_\+~#?&=]*)*)/g;
    const urls = text.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const firstUrl = urls[0];
      try {
        const url = new URL(firstUrl);
        setLinkPreview({
          url: firstUrl,
          title: url.hostname || firstUrl
        });
      } catch (e) {
        setLinkPreview({
          url: firstUrl,
          title: firstUrl
        });
      }
    } else {
      setLinkPreview(null);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (text) {
      detectAndShowLinkPreview(text);
    }
  }

  return (
     <div>
      {linkPreview && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-[var(--nb-sidebar-bg)] border border-[var(--nb-border-strong)] rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[var(--nb-primary)] flex items-center justify-center">
              <span className="text-black text-xs font-bold">🔗</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--nb-border)] truncate">
                {linkPreview.title}
              </div>
              <div className="text-xs text-[var(--nb-text-muted)] truncate">
                {linkPreview.url}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLinkPreview(null)}
              className="text-xs px-3 py-2 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface-muted)] text-[var(--nb-text)] hover:bg-[var(--nb-surface)]/50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(linkPreview.url);
                alert('Link copied to clipboard!');
              }}
              className="text-xs px-3 py-2 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-primary)] text-black hover:bg-[var(--nb-surface)]/50"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
      <Editor noteId={props.note.id} initialContent={props.note.blocks || []} />
    </div>
   );
}

