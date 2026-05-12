"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronsUpDown, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MiniPopup, { PopupAction } from "./MiniPopup";
import type { Note, NoteId, NoteMenuState, TitleEditState } from "./notesTypes";
import { getPlainTextFromHtml } from "./notesUtils";

type SidebarBaseProps = {
  notes: Note[];
  selectedId: NoteId | null;
  onSelect: (id: NoteId) => void;
  onCreate: () => void;
  menuState: NoteMenuState;
  setMenuState: React.Dispatch<React.SetStateAction<NoteMenuState>>;
  titleEdit: TitleEditState;
  setTitleEdit: React.Dispatch<React.SetStateAction<TitleEditState>>;
  onDelete: (id: NoteId) => void;
  onRename: (id: NoteId, title: string) => void;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMobileClose?: () => void;
};

export default function SidebarContents(props: SidebarBaseProps) {
  const sorted = useMemo(() => {
    return [...props.notes].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [props.notes]);

  return (
    <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-4rem)]" style={{ fontFamily: 'var(--nb-font-sidebar)' }}>
      {!props.sidebarCollapsed && (
        <>
          <div className="p-1.5 flex flex-col gap-2">
            <button
              type="button"
              onClick={props.onCreate}
              className="flex items-center cursor-pointer gap-2 hover:bg-[var(--nb-surface)]/50 p-1.5 rounded-sm w-full"
            >
              <span className="rounded-full w-6 h-6 p-1 flex items-center justify-center bg-[var(--nb-border-strong)] text-[var(--nb-border)]">
                <Plus className="h-6 w-6" />
              </span>
              <span className="text-md text-[var(--nb-border)]">New note</span>
            </button>

            <button
              type="button"
              className="flex items-center cursor-pointer gap-2 hover:bg-[var(--nb-surface)]/50 p-1.5 rounded-sm w-full"
            >
              <span className="rounded-full w-6 h-6 p-0.5 flex items-center justify-center text-[var(--nb-border)]">
                <Search className="h-6 w-6" />
              </span>
              <span className="text-md text-[var(--nb-border)]">Search</span>
            </button>
          </div>
          <div className="p-2 mt-3">
            <span className="text-sm px-1.5 text-[var(--nb-border)]/50">
              Recents
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2 pb-3 flex flex-col gap-1">
            {sorted.map((n) => (
              <NoteRow
                key={n.id}
                note={n}
                active={props.selectedId === n.id}
                onSelect={() => props.onSelect(n.id)}
                menuState={props.menuState}
                setMenuState={props.setMenuState}
                titleEdit={
                  props.titleEdit?.noteId === n.id ? props.titleEdit.value : null
                }
                setTitleEdit={props.setTitleEdit}
                onRename={props.onRename}
                onDelete={() => props.onDelete(n.id)}
              />
            ))}
          </div>
          <ProfileSection />
        </>
      )}
      
      {props.sidebarCollapsed && (
        <div className="flex-1 flex flex-col items-center py-4 gap-3">
          <button
            type="button"
            onClick={props.onCreate}
            className="inline-flex items-center justify-center rounded-md h-9 w-9 bg-[var(--nb-surface-muted)] text-[var(--nb-text)] hover:opacity-90 transition-opacity"
            aria-label="Create note"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md h-9 w-9 bg-[var(--nb-surface-muted)] text-[var(--nb-text)] hover:opacity-90 transition-opacity"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileSection() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileActions: PopupAction[] = [
    { label: "Settings", onClick: () => console.log("Settings clicked") },
    { label: "Logout", onClick: () => console.log("Logout clicked"), destructive: true },
  ];

  return (
    <div className="border-t border-[var(--nb-border-strong)] p-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center gap-3 w-full hover:bg-[var(--nb-surface)]/50 p-2 rounded-sm transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--nb-primary)] flex items-center justify-center text-black font-semibold text-sm">
            JD
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-left font-medium text-[var(--nb-border)] truncate">
              John Doe
            </div>
            <div className="text-xs text-left text-[var(--nb-text-muted)] truncate">
              john.doe@example.com
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-[var(--nb-text-muted)]" />
        </button>
        
        <MiniPopup
          open={profileMenuOpen}
          onClose={() => setProfileMenuOpen(false)}
          actions={profileActions}
          className="bottom-full mb-2"
        />
      </div>
    </div>
  );
}

function NoteRow(props: {
  note: Note;
  active: boolean;
  onSelect: () => void;
  menuState: NoteMenuState;
  setMenuState: React.Dispatch<React.SetStateAction<NoteMenuState>>;
  titleEdit: string | null;
  setTitleEdit: React.Dispatch<React.SetStateAction<TitleEditState>>;
  onRename: (id: NoteId, title: string) => void;
  onDelete: () => void;
}) {
  const menuOpen = props.menuState?.open === true && props.menuState.noteId === props.note.id;

  const menuActions: PopupAction[] = [
    { 
      label: "Rename", 
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => {
        props.setTitleEdit({ noteId: props.note.id, value: props.note.title });
      }
    },
    { 
      label: "Delete", 
      icon: <Trash2 className="h-4 w-4" />,
      onClick: props.onDelete,
      destructive: true
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={props.onSelect}
        className={`w-full cursor-pointer text-left rounded-md p-1.5 transition-colors border border-transparent ${
          props.active
            ? "bg-[var(--nb-surface)]/70"
            : "hover:bg-[var(--nb-surface)]/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {props.titleEdit !== null ? (
              <input
                value={props.titleEdit}
                onChange={(e) => props.setTitleEdit({ noteId: props.note.id, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (props.titleEdit) {
                      props.onRename(props.note.id, props.titleEdit);
                    }
                    props.setTitleEdit(null);
                    props.setMenuState(null);
                  }
                  if (e.key === "Escape") {
                    props.setTitleEdit(null);
                    props.setMenuState(null);
                  }
                }}
                className="w-full bg-transparent outline-none text-md text-[var(--nb-border)] font-medium truncate"
                autoFocus
              />
            ) : (
              <div className="text-md font-medium truncate text-[var(--nb-border)]">
                {props.note.title}
              </div>
            )}
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.setMenuState({ noteId: props.note.id, open: true });
              }}
              className=""
              aria-label="Open note menu"
            >
              <MoreVertical className="h-4 w-4 text-[var(--nb-border)] cursor-pointer" />
            </button>
          </div>
        </div>
      </button>

      <MiniPopup
        open={menuOpen}
        onClose={() => props.setMenuState(null)}
        actions={menuActions}
      />
    </div>
  );
}
