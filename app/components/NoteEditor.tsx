"use client";

import React, { useMemo, useRef } from "react";
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

  return (

     <div>
      <Editor />
    </div>
   );
}

function BlockLine(props: {
  block: NoteBlock;
  index: number;
  total: number;
  registerRef: (el: HTMLDivElement | null) => void;
  onChangeHtml: (html: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onConvert: (type: BlockType) => void;
}) {
  const marker = useMemo(() => {
    if (props.block.type === "ordered") return `${props.block.order ?? 1}.`;
    if (props.block.type === "bullet") return "•";
    return "";
  }, [props.block.order, props.block.type]);

  return (
    <div className="group flex items-start gap-3 py-2">
      <div className="w-8 shrink-0 text-right text-[var(--nb-text-muted)] text-sm leading-[22px] select-none">
        {marker}
      </div>

      <div className="min-w-0 flex-1">
        <div
          ref={props.registerRef}
          contentEditable
          suppressContentEditableWarning
          className="outline-none min-h-[22px]"
          onInput={(e) => {
            const html = (e.currentTarget as HTMLDivElement).innerHTML;
            props.onChangeHtml(html === "<br>" ? "" : html);
          }}
          onKeyDown={props.onKeyDown}
          onPaste={props.onPaste}
          dangerouslySetInnerHTML={{ __html: props.block.html }}
        />

        <div className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity pt-1 flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface-muted)]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => props.onConvert("paragraph")}
          >
            Text
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface-muted)]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => props.onConvert("ordered")}
          >
            1.
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface-muted)]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => props.onConvert("bullet")}
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}
