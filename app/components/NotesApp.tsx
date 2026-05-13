"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeft, Plus, Cloud } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { SessionProvider } from "next-auth/react";
import SidebarContents from "./Sidebar";
import NoteEditor from "./NoteEditor";
import type {
  Note,
  NoteId,
  NoteMenuState,
  TitleEditState,
} from "./notesTypes";
import { clampTitle, fetchNotes, updateNoteAPI, deleteNoteAPI } from "./notesUtils";
import { useParams, useRouter } from "next/navigation";
import { localDB, formatDoc } from "../lib/pouchdb";

const SyncStatus = ({ status }: { status: 'loading' | 'synced' | 'pending' }) => {
  const statusConfig = {
    loading: { text: 'Saving...', color: 'text-blue-500', iconColor: 'text-blue-500' },
    synced: { text: 'Synced', color: 'text-green-500', iconColor: 'text-green-500' },
    pending: { text: 'Pending', color: 'text-orange-500', iconColor: 'text-orange-500' },
  };
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-1.5">
      <Cloud className={`h-4 w-4 ${config.iconColor}`} />
      <span className={`text-xs ${config.color}`}>{config.text}</span>
    </div>
  );
};

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'loading' | 'synced' | 'pending'>>({});
  const params = useParams();
  const router = useRouter();

  const routeId = (params as any)?.id ?? null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [menuState, setMenuState] = useState<NoteMenuState>(null);
  const [titleEdit, setTitleEdit] = useState<TitleEditState>(null);

  const selected = useMemo(
    () => notes.find((n) => n.id === routeId) ?? null,
    [notes, routeId],
  );


useEffect(() => {
  let mounted = true;
  const remotePulls = new Set<string>();

  // 1. Instant Load from Local PouchDB
  const loadLocalData = async () => {
    const result = await localDB.allDocs({ include_docs: true, descending: true });
    if (mounted) {
      const localNotes = result.rows.map(row => formatDoc(row.doc));
      setNotes(localNotes);
    }
  };
  loadLocalData();

  // 2. The Sync Listener (Handles outgoing changes)
  const changes = localDB.changes({
    since: 'now',
    live: true,
    include_docs: true
  }).on('change', async (change) => {
    if (!mounted) return;

    if (change.deleted) {
      setNotes(prev => prev.filter(note => note.id !== change.id));
      setSyncStatus(prev => {
        const next = { ...prev };
        delete next[change.id];
        return next;
      });

      try {
        await deleteNoteAPI(change.id);
      } catch (e) {
        console.warn("Delete sync to cloud failed, will retry later", e);
      }
      return;
    }

    if (!change.doc) return;
    
    // Update the UI state immediately for local changes
    const updatedNote = formatDoc(change.doc);
    setNotes(prev => {
      const exists = prev.find(n => n.id === updatedNote.id);
      if (exists) return prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      return [updatedNote, ...prev];
    });

    if (remotePulls.has(updatedNote.id)) {
      remotePulls.delete(updatedNote.id);
      setSyncStatus(prev => ({ ...prev, [updatedNote.id]: 'synced' }));
      return;
    }

    // Push to MongoDB (Background Task)
    setSyncStatus(prev => ({ ...prev, [updatedNote.id]: 'loading' }));
    try {
      const doc = change.doc as any;
      await updateNoteAPI(doc._id, {
        title: doc.title,
        blocks: doc.content
      });
      setSyncStatus(prev => ({ ...prev, [updatedNote.id]: 'synced' }));
    } catch (e) {
      console.warn("Sync to cloud failed, will retry later", e);
      setSyncStatus(prev => ({ ...prev, [updatedNote.id]: 'pending' }));
    }
  });

  // 3. Initial Pull (Handles incoming changes from other devices)
  fetchNotes().then(remoteNotes => {
    if (!mounted) return;
    remoteNotes.forEach(async (note) => {
      const local = await localDB.get(note.id).catch(() => null) as any;
      if (!local || note.updatedAt > (local.updatedAt || 0)) {
        remotePulls.add(note.id);
        await localDB.put({
          _id: note.id,
          _rev: local?._rev, // Important to prevent PouchDB conflicts
          ...note,
          content: note.blocks
        });
      }
    });
  });

  return () => { 
    mounted = false; 
    changes.cancel();
  };
}, []);

  // notes are persisted server-side; local save is no-op

  async function createNote() {
  const newId = `note_${Math.random().toString(36).slice(2, 11)}`; // or use uuid pkg
  const newNoteDoc = {
    _id: newId,
    title: "Untitled",
    content: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await localDB.put(newNoteDoc); 
  // The Sync Engine (useEffect above) will automatically detect this 
  // and try to send it to MongoDB in the background.

  router.push(`/app/${newId}`, { scroll: false });
}

  async function deleteNote(noteId: NoteId) {
    try {
      const existingDoc = await localDB.get(noteId);
      await localDB.remove(existingDoc);
      setMenuState(null);
      setTitleEdit(null);
      if (routeId === noteId) {
        router.push(`/app`, { scroll: false });
      }
    } catch (e) {
      console.error("Local delete failed", e);
    }
  }

  async function updateNote(noteId: NoteId, patch: Partial<Note>) {
    try {
      const existingDoc = await localDB.get(noteId).catch(() => ({ _id: noteId }));
      const nextDoc: any = {
        ...(existingDoc as any),
        updatedAt: Date.now(),
      };

      if (patch.title !== undefined) {
        nextDoc.title = patch.title;
      }

      if (patch.blocks !== undefined) {
        nextDoc.content = patch.blocks;
      }

      await localDB.put(nextDoc);
    } catch (e) {
      console.error("Local update failed", e);
    }
  }


  return (
    <SessionProvider>
      <div className="flex flex-1 min-h-[100dvh] bg-[var(--nb-note-bg)]">
      {/* Mobile floating buttons */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-40 flex justify-between items-center">
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
                src="/brane-brand-kit/new-logo-primary.png"
                alt="Note Brain"
                width={500}
                height={500}  
                className="w-6 cursor-pointer"
              />

              <div className="min-w-0">
                <div className="text-xl font-medium truncate">Brainote</div>
              </div>
            </div>

              <SidebarContents
                notes={notes}
                selectedId={routeId}
                onSelect={(id) => {
                  router.push(`/app/${id}`, { scroll: false });
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
                src="/brane-brand-kit/new-logo-primary.png"
                alt="Note Brain"
                width={500}
                height={500}  
                className="w-6 cursor-pointer"
              />

              <div className="min-w-0">
                <div className="text-xl font-medium truncate">Brane</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!sidebarCollapsed && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-md bg-[var(--nb-sidebar-bg)] border border-[var(--nb-border-strong)]">
                <SyncStatus status={syncStatus[routeId] || 'synced'} />
              </div>
            )}
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
            selectedId={routeId}
            onSelect={(id) => router.push(`/app/${id}`, { scroll: false })}
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
      <main className={`flex-1 min-w-0 bg-[var(--nb-note-bg)] transition-[margin-left] min-h-vh h-full duration-300 ease-out ${sidebarCollapsed ? "md:ml-[58px]" : "md:ml-[260px]"}`}>
        <div className="h-14 md:h-0" />
        <div className="w-full px-3 md:px-8 py-8">
          {!selected ? (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
              <div className="max-w-xl w-full border border-[var(--nb-border-strong)] rounded-lg p-8 bg-[var(--nb-surface-muted)] text-center">
                <h3 className="text-lg font-semibold text-[var(--nb-border)] mb-2">No note selected</h3>
                <p className="text-sm text-[var(--nb-text-muted)] mb-4">Select a note from the sidebar or create a new one.</p>
                <div className="flex justify-center">
                  <button onClick={createNote} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--nb-primary)] text-black">Create note</button>
                </div>
              </div>
            </div>
          ) : (
            <NoteEditor
              note={selected}
            />
          )}
        </div>
      </main>
    </div>
    </SessionProvider>
  );
}
