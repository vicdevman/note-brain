"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeft, Plus } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import SidebarContents from "./Sidebar";
import NoteEditor from "./NoteEditor";
import type {
  Note,
  NoteBlock,
  NoteId,
  NoteMenuState,
  TitleEditState,
} from "./notesTypes";
import {
  clampTitle,
  loadNotes,
  newNote,
  now,
  saveNotes,
  uid,
} from "./notesUtils";

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<NoteId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [menuState, setMenuState] = useState<NoteMenuState>(null);
  const [titleEdit, setTitleEdit] = useState<TitleEditState>(null);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  useEffect(() => {
    const loaded = loadNotes();
    if (loaded.length) {
      setNotes(loaded);
      setSelectedId(loaded[0].id);
      return;
    }

    const first = newNote();
    setNotes([first]);
    setSelectedId(first.id);
  }, []);

  useEffect(() => {
    if (!notes.length) return;
    saveNotes(notes);
  }, [notes]);

  function createNote() {
    const n = newNote();
    setNotes((prev) => [n, ...prev]);
    setSelectedId(n.id);
    setMobileSidebarOpen(false);
    setMenuState(null);
    setTitleEdit(null);
  }

  function deleteNote(noteId: NoteId) {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== noteId);
      return next.length ? next : [newNote()];
    });

    setSelectedId((prev) => {
      if (prev !== noteId) return prev;
      const remaining = notes.filter((n) => n.id !== noteId);
      return (remaining[0]?.id ?? null) || null;
    });

    setMenuState(null);
    setTitleEdit(null);
  }

  function updateNote(noteId: NoteId, patch: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, ...patch, updatedAt: now() } : n,
      ),
    );
  }

  function updateBlock(
    noteId: NoteId,
    blockId: string,
    patch: Partial<NoteBlock>,
  ) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          updatedAt: now(),
          blocks: n.blocks.map((b) =>
            b.id === blockId ? { ...b, ...patch } : b,
          ),
        };
      }),
    );
  }

  function insertBlockAfter(
    noteId: NoteId,
    afterBlockId: string,
    block: NoteBlock,
  ) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const idx = n.blocks.findIndex((b) => b.id === afterBlockId);
        if (idx === -1) return n;
        const nextBlocks = [
          ...n.blocks.slice(0, idx + 1),
          block,
          ...n.blocks.slice(idx + 1),
        ];
        return { ...n, updatedAt: now(), blocks: nextBlocks };
      }),
    );
  }

  function removeBlock(noteId: NoteId, blockId: string) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const nextBlocks = n.blocks.filter((b) => b.id !== blockId);
        return {
          ...n,
          updatedAt: now(),
          blocks: nextBlocks.length
            ? nextBlocks
            : [{ id: uid(), type: "paragraph", html: "" }],
        };
      }),
    );
  }

  return (
    <div className="flex flex-1 min-h-[100dvh] bg-[var(--nb-note-bg)]">
      {/* Mobile floating buttons */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-40 flex justify-between">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--nb-sidebar-bg)] border border-[var(--nb-border-strong)] shadow-lg"
          aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-5 w-5 text-[var(--nb-text)]" />
        </button>
        <button
          type="button"
          onClick={createNote}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--nb-primary)] text-black shadow-lg"
          aria-label="Create note"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-[84vw] max-w-[360px] border-r border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >

<div className="flex items-center gap-3 min-w-0 mt-3 mb-3 ml-3">
              <Image
                src="/note-brain-brand-kit/new-logo-primary.png"
                alt="Note Brain"
                width={500}
                height={500}  
                className="w-6 cursor-pointer"
              />

              <div className="min-w-0">
                <div className="text-xl font-medium truncate">Note Brain</div>
              </div>
            </div>

              <SidebarContents
                notes={notes}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setMobileSidebarOpen(false);
                }}
                onCreate={createNote}
                menuState={menuState}
                setMenuState={setMenuState}
                titleEdit={titleEdit}
                setTitleEdit={setTitleEdit}
                onDelete={deleteNote}
                onRename={(id, title) =>
                  updateNote(id, { title: clampTitle(title) })
                }
                sidebarCollapsed={false}
                isMobile={true}
                onMobileClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] transition-[width] duration-300 ease-out fixed left-0 top-0 h-screen ${sidebarCollapsed ? "w-[68px]" : "w-[280px]"}  `}
      >
        <div className="flex justify-between px-3 h-16 ">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src="/note-brain-brand-kit/new-logo-primary.png"
                alt="Note Brain"
                width={500}
                height={500}  
                className="w-6 cursor-pointer"
              />

              <div className="min-w-0">
                <div className="text-xl font-medium truncate">Note Brain</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="inline-flex cursor-pointer items-center justify-center rounded-md h-9 w-9 hover:bg-[var(--nb-surface)]/50 text-nb-text-muted hover:opacity-90 transition-opacity"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {!sidebarCollapsed ? (
          <SidebarContents
            notes={notes}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onCreate={createNote}
            menuState={menuState}
            setMenuState={setMenuState}
            titleEdit={titleEdit}
            setTitleEdit={setTitleEdit}
            onDelete={deleteNote}
            onRename={(id, title) =>
              updateNote(id, { title: clampTitle(title) })
            }
            sidebarCollapsed={sidebarCollapsed}
          />
        ) : (
          <SidebarContents
            notes={[]}
            selectedId={null}
            onSelect={() => {}}
            onCreate={createNote}
            menuState={null}
            setMenuState={setMenuState}
            titleEdit={null}
            setTitleEdit={setTitleEdit}
            onDelete={() => {}}
            onRename={() => {}}
            sidebarCollapsed={sidebarCollapsed}
          />
        )}
      </aside>

      {/* Editor column */}
      <main className={`flex-1 min-w-0 bg-[var(--nb-note-bg)] transition-[margin-left] duration-300 ease-out ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[288px]"}`}>
        <div className="h-14 md:h-0" />
        <div className="w-full px-4 md:px-8 py-8">
          {!selected ? (
            <div className="text-sm text-[var(--nb-text-muted)]">
              Select a note
            </div>
          ) : (
            <NoteEditor
              note={selected}
              onChangeTitle={(title) =>
                updateNote(selected.id, { title: title })
              }
              onChangeBlock={(blockId, patch) =>
                updateBlock(selected.id, blockId, patch)
              }
              onInsertBlockAfter={(afterId, block) =>
                insertBlockAfter(selected.id, afterId, block)
              }
              onRemoveBlock={(blockId) => removeBlock(selected.id, blockId)}
              onReplaceBlocks={(blocks) => updateNote(selected.id, { blocks })}
            />
          )}
        </div>
      </main>
    </div>
  );
}
