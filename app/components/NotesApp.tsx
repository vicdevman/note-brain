"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Cloud, Command, Edit3, FileText, LogOut, Mail, Menu, PanelLeft, Plus, Search, Trash2, UserRound, Wifi, WifiOff, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import SidebarContents from "./Sidebar";
import NoteEditor from "./NoteEditor";
import type {
  Note,
  NoteId,
  NoteMenuState,
  TitleEditState,
} from "./notesTypes";
import { clampTitle, fetchNotes, updateNoteAPI, deleteNoteAPI } from "./notesUtils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { localDB, formatDoc } from "../lib/pouchdb";
import GlassSurface from "./GlassSurface";

type SyncState = "loading" | "synced" | "pending" | "offline";

const SyncStatus = ({ status, compact = false }: { status: SyncState; compact?: boolean }) => {
  const statusConfig = {
    loading: { text: 'Saving...', color: 'text-blue-500', iconColor: 'text-blue-500' },
    synced: { text: 'Synced', color: 'text-green-500', iconColor: 'text-green-500' },
    pending: { text: 'Pending', color: 'text-orange-500', iconColor: 'text-orange-500' },
    offline: { text: 'Offline', color: 'text-[var(--nb-text-muted)]', iconColor: 'text-[var(--nb-text-muted)]' },
  };
  const config = statusConfig[status];
  const Icon = status === "offline" ? WifiOff : status === "synced" ? CheckCircle2 : Cloud;
  return (
    <div className={`flex items-center gap-1.5 ${compact ? "rounded-full border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)]/90 px-3 py-2 shadow-lg" : ""}`}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <span className={`text-xs ${config.color}`} style={{ fontFamily: 'var(--nb-font-sidebar)' }}>{config.text}</span>
    </div>
  );
};

const DELETE_QUEUE_KEY = "brane_pending_deletes";

function readDeleteQueue(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(DELETE_QUEUE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeDeleteQueue(queue: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DELETE_QUEUE_KEY, JSON.stringify(Array.from(new Set(queue))));
}

function queueDelete(noteId: string) {
  writeDeleteQueue([...readDeleteQueue(), noteId]);
}

function MobileMenuDrawer({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onSearch,
  onClose,
}: {
  notes: Note[];
  selectedId: NoteId | null;
  onSelect: (id: NoteId) => void;
  onCreate: () => void;
  onDelete: (id: NoteId) => void;
  onSearch: () => void;
  onClose: () => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<NoteId | null>(null);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes]);

  const actions = [
    {
      label: "New note",
      sublabel: "Start writing",
      icon: <Plus className="h-6 w-6" />,
      onClick: () => {
        onCreate();
        onClose();
      },
    },
    {
      label: "Profile",
      sublabel: "View account",
      icon: <UserRound className="h-6 w-6" />,
      href: "/app/profile",
    },
    {
      label: "Search",
      sublabel: "Find notes",
      icon: <Search className="h-6 w-6" />,
      onClick: () => {
        onClose();
        onSearch();
      },
    },
    {
      label: "Sign out",
      sublabel: "Leave Brane",
      icon: <LogOut className="h-6 w-6" />,
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <motion.aside
      className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-hidden rounded-t-[28px] border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] shadow-2xl"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.85 }}
      style={{ fontFamily: 'var(--nb-font-sidebar)' }}
    >
      <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[var(--nb-border)]/30" />
      <div className="max-h-[calc(88dvh-14px)] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+18px)]">
        <div className="mt-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/brane-brand-kit/new-logo-primary.png" alt="Brane" width={32} height={32} className="w-7 shrink-0" />
            <div className="truncate text-xl font-semibold text-[var(--nb-border)]">Brane</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nb-border-strong)] text-[var(--nb-border)]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="mt-7">
          {/* <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--nb-border)]/60">Actions</h2>
          </div> */}
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => {
              const content = (
                <div className="flex gap-2 items-center">
                  <span className="inline-flex h-8 w-8 p-2 items-center justify-center rounded-full bg-[var(--nb-border-strong)] text-[var(--nb-border)]">
                    {action.icon}
                  </span>
                  <span className="text-base font-semibold text-[var(--nb-border)]">{action.label}</span>
                  {/* <span className="mt-1 block text-left text-xs text-[var(--nb-text-muted)]">{action.sublabel}</span> */}
                </div>
              );

              if ("href" in action) {
                return (
                  <Link
                    key={action.label}
                    href={action.href ?? "/app"}
                    onClick={onClose}
                    className="rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-surface)]/25 p-4 active:scale-[0.98]"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="p-4 rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-surface)]/25 active:scale-[0.98]"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--nb-border)]/60">Notes</h2>
            <span className="text-xs text-[var(--nb-text-muted)]">{sortedNotes.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`rounded-xl border p-3 text-left active:scale-[0.98] flex flex-col justify-between ${
                  selectedId === note.id
                    ? "border-[var(--nb-primary)] bg-[var(--nb-primary)]/10"
                    : "border-[var(--nb-border-strong)] bg-[var(--nb-surface)]/25"
                }`}
              >
                <button type="button" onClick={() => onSelect(note.id)} className="text-left">
                  <span className="line-clamp-2 text-base font-semibold leading-snug text-[var(--nb-border)]">{note.title}</span>
                  <span className="mt-4 block text-xs text-[var(--nb-text-muted)]">
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDeleteId === note.id) {
                      onDelete(note.id);
                      setConfirmDeleteId(null);
                      onClose();
                    } else {
                      setConfirmDeleteId(note.id);
                    }
                  }}
                  className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--nb-border-strong)] text-xs font-medium text-red-400"
                  aria-label={`Delete ${note.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDeleteId === note.id ? "Confirm" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.aside>
  );
}

function MobileProfileButton({ onOpen }: { onOpen: () => void }) {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--nb-primary)] text-sm font-semibold text-black shadow-lg"
      aria-label="Open profile"
    >
      {session?.user?.image ? (
        <img src={session.user.image} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </button>
  );
}

function MobileProfileDrawer({ noteCount, onClose }: { noteCount: number; onClose: () => void }) {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const email = session?.user?.email || "No email";
  const image = session?.user?.image || "";

  return (
    <motion.aside
      className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-[28px] border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] shadow-2xl"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.85 }}
      style={{ fontFamily: "var(--nb-font-sidebar)" }}
    >
      <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[var(--nb-border)]/30" />
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-4">
        <div className="flex items-center justify-between">
          <Link href="/app" onClick={onClose} className="flex min-w-0 items-center gap-3">
            <Image src="/brane-brand-kit/new-logo-primary.png" alt="Brane" width={32} height={32} className="w-7 shrink-0" />
            <span className="truncate text-xl font-semibold text-[var(--nb-border)]">Brane</span>
          </Link>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nb-border-strong)] text-[var(--nb-border)]" aria-label="Close profile">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--nb-primary)] text-xl font-semibold text-black">
            {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-2xl font-semibold text-[var(--nb-border)]">{name}</div>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[var(--nb-text-muted)]">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-surface)]/25 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--nb-text-muted)]">Notes</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--nb-border)]">{noteCount}</div>
          </div>
          <div className="rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-surface)]/25 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--nb-text-muted)]">Sync</div>
            <div className="mt-1 text-base font-semibold text-[var(--nb-border)]">Offline ready</div>
          </div>
        </div>

        <div className="mt-6 grid gap-2">
          <Link href="/app/profile" onClick={onClose} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--nb-primary)] text-sm font-semibold text-black">
            <UserRound className="h-4 w-4" />
            View profile
          </Link>
          <Link href="/app/profile/edit" onClick={onClose} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--nb-border-strong)] text-sm font-semibold text-[var(--nb-border)]">
            <Edit3 className="h-4 w-4" />
            Edit profile
          </Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--nb-border-strong)] text-sm font-semibold text-red-400">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function noteToSearchText(note: Note) {
  const blockText = (note.blocks || [])
    .map((block: any) => {
      if (Array.isArray(block?.content)) {
        return block.content.map((item: any) => item?.text || "").join(" ");
      }
      return block?.html || "";
    })
    .join(" ");

  return `${note.title} ${blockText}`.toLowerCase();
}

function GlobalSearch({
  open,
  notes,
  selectedId,
  onClose,
  onSelect,
  onCreate,
}: {
  open: boolean;
  notes: Note[];
  selectedId: NoteId | null;
  onClose: () => void;
  onSelect: (id: NoteId) => void;
  onCreate: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!needle) return sorted.slice(0, 6);
    return sorted.filter((note) => noteToSearchText(note).includes(needle)).slice(0, 8);
  }, [notes, query]);

  const actions = [
    {
      label: "Create note",
      detail: "Start a fresh thought",
      icon: <Plus className="h-4 w-4" />,
      onClick: onCreate,
    },
    {
      label: "Profile",
      detail: "Account and identity",
      icon: <UserRound className="h-4 w-4" />,
      onClick: () => router.push("/app/profile"),
    },
    {
      label: "Edit profile",
      detail: "Name and photo",
      icon: <Edit3 className="h-4 w-4" />,
      onClick: () => router.push("/app/profile/edit"),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-black/55 px-3 py-[calc(env(safe-area-inset-top)+18px)] md:px-6 md:py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close search" onClick={onClose} />
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="relative mx-auto flex max-h-[82dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] shadow-2xl"
            style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--nb-border-strong)] px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-[var(--nb-primary)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder="Search notes, actions, profile..."
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-[var(--nb-border)] outline-none placeholder:text-[var(--nb-text-muted)]"
              />
              <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nb-text-muted)]" aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--nb-text-muted)]">Quick actions</span>
                <span className="hidden items-center gap-1 text-xs text-[var(--nb-text-muted)] md:flex">
                  <Command className="h-3.5 w-3.5" /> K
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)]/55 p-3 text-left hover:border-[var(--nb-primary)]/70"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nb-primary)]/15 text-[var(--nb-primary)]">{action.icon}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--nb-border)]">{action.label}</span>
                      <span className="block truncate text-xs text-[var(--nb-text-muted)]">{action.detail}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-2 mt-5 flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--nb-text-muted)]">Notes</span>
                <span className="text-xs text-[var(--nb-text-muted)]">{results.length}</span>
              </div>
              <div className="grid gap-2">
                {results.length ? (
                  results.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => {
                        onSelect(note.id);
                        onClose();
                      }}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left ${selectedId === note.id ? "border-[var(--nb-primary)] bg-[var(--nb-primary)]/10" : "border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)]/45 hover:border-[var(--nb-primary)]/60"}`}
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--nb-border-strong)] text-[var(--nb-border)]">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[var(--nb-border)]">{note.title}</span>
                        <span className="block truncate text-xs text-[var(--nb-text-muted)]">
                          Updated {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--nb-text-muted)]" />
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)]/45 p-5 text-center text-sm text-[var(--nb-text-muted)]">
                    Nothing matched. Create a note and keep the thread moving.
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function NotesApp({ children }: { children?: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'loading' | 'synced' | 'pending'>>({});
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const routeId = (params as any)?.id ?? null;
  const showRouteContent = pathname.startsWith("/app/profile");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [menuState, setMenuState] = useState<NoteMenuState>(null);
  const [titleEdit, setTitleEdit] = useState<TitleEditState>(null);

  const selected = useMemo(
    () => notes.find((n) => n.id === routeId) ?? null,
    [notes, routeId],
  );

  const globalSyncStatus: SyncState = useMemo(() => {
    if (!isOnline) return "offline";
    const statuses = Object.values(syncStatus);
    if (statuses.includes("loading")) return "loading";
    if (statuses.includes("pending")) return "pending";
    return "synced";
  }, [isOnline, syncStatus]);

  useEffect(() => {
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);


useEffect(() => {
  let mounted = true;
  const remotePulls = new Set<string>();

  const flushDeleteQueue = async () => {
    const queue = readDeleteQueue();
    if (!queue.length) return;

    const remaining: string[] = [];
    for (const id of queue) {
      setSyncStatus(prev => ({ ...prev, [id]: 'loading' }));
      try {
        await deleteNoteAPI(id);
        setSyncStatus(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch {
        remaining.push(id);
        setSyncStatus(prev => ({ ...prev, [id]: 'pending' }));
      }
    }
    writeDeleteQueue(remaining);
  };

  const flushLocalNotes = async () => {
    const result = await localDB.allDocs({ include_docs: true });
    for (const row of result.rows) {
      if (!row.doc || row.id.startsWith("_design/")) continue;
      const doc = row.doc as any;
      setSyncStatus(prev => ({ ...prev, [doc._id]: 'loading' }));
      try {
        await updateNoteAPI(doc._id, {
          title: doc.title,
          blocks: doc.content
        });
        setSyncStatus(prev => ({ ...prev, [doc._id]: 'synced' }));
      } catch {
        setSyncStatus(prev => ({ ...prev, [doc._id]: 'pending' }));
      }
    }
    await flushDeleteQueue();
  };

  const handleOnlineSync = () => {
    if (!mounted) return;
    void flushLocalNotes();
  };

  window.addEventListener("online", handleOnlineSync);

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
        writeDeleteQueue(readDeleteQueue().filter((id) => id !== change.id));
      } catch (e) {
        console.warn("Delete sync to cloud failed, will retry later", e);
        queueDelete(change.id);
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

  if (typeof navigator === "undefined" || navigator.onLine) {
    void flushDeleteQueue();
  }

  return () => { 
    mounted = false; 
    changes.cancel();
    window.removeEventListener("online", handleOnlineSync);
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
      queueDelete(noteId);
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
        <GlassSurface
          width={48}
          height={48}
          borderRadius={999}
          backgroundOpacity={0.22}
          saturation={1.6}
          className="shrink-0 bg-[var(--nb-primary)]/20"
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full text-[var(--nb-text)]"
            aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-5 w-5" />
          </button>
        </GlassSurface>

        <SyncStatus status={globalSyncStatus} compact />
     
        <MobileProfileButton onOpen={() => setMobileProfileOpen(true)} />
      </div>

      
      {/* Mobile Drawer */}
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
            <MobileMenuDrawer
                notes={notes}
                selectedId={routeId}
                onCreate={createNote}
                onDelete={deleteNote}
                onSearch={() => setSearchOpen(true)}
                onSelect={(id) => {
                  router.push(`/app/${id}`, { scroll: false });
                  setMobileSidebarOpen(false);
                }}
                onClose={() => setMobileSidebarOpen(false)}
              />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileProfileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileProfileOpen(false)} />
            <MobileProfileDrawer noteCount={notes.length} onClose={() => setMobileProfileOpen(false)} />
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
              <div className="inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-md bg-[var(--nb-sidebar-bg)] border border-[var(--nb-border-strong)]" >
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
            onSearch={() => setSearchOpen(true)}
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
            onSearch={() => setSearchOpen(true)}
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
        <div className="w-full px-2 md:px-8 py-4 md:py-8">
          {showRouteContent ? (
            children
          ) : !selected ? (
            <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-2" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
              <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--nb-border-strong)] bg-[linear-gradient(135deg,rgba(216,122,91,0.13),rgba(31,31,30,0.95)_42%,rgba(12,12,12,0.7))] p-5 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--nb-border-strong)] bg-black/20 px-3 py-1 text-xs font-medium text-[var(--nb-text-muted)]">
                      <Wifi className="h-3.5 w-3.5 text-[var(--nb-primary)]" />
                      Local notes stay ready offline
                    </div>
                    <h3 className="text-3xl font-semibold leading-tight text-[var(--nb-border)] md:text-5xl">Pick up a thought, or start the next one.</h3>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--nb-text-muted)] md:text-base">
                      Search across your notes, jump into recent work, or create a blank page. Brane will keep it local first and sync when the network is kind.
                    </p>
                  </div>
                  <div className="grid min-w-[13rem] gap-2">
                    <button onClick={createNote} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--nb-primary)] px-4 text-sm font-semibold text-black">
                      <Plus className="h-4 w-4" />
                      New note
                    </button>
                    <button onClick={() => setSearchOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--nb-border-strong)] bg-black/10 px-4 text-sm font-semibold text-[var(--nb-border)]">
                      <Search className="h-4 w-4" />
                      Search Brane
                    </button>
                  </div>
                </div>
                <div className="mt-7 grid gap-2 md:grid-cols-3">
                  {notes.slice(0, 3).map((note) => (
                    <button key={note.id} type="button" onClick={() => router.push(`/app/${note.id}`, { scroll: false })} className="rounded-xl border border-[var(--nb-border-strong)] bg-black/10 p-3 text-left hover:border-[var(--nb-primary)]/60">
                      <div className="truncate text-sm font-semibold text-[var(--nb-border)]">{note.title}</div>
                      <div className="mt-2 text-xs text-[var(--nb-text-muted)]">Recent note</div>
                    </button>
                  ))}
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
      <GlobalSearch
        open={searchOpen}
        notes={notes}
        selectedId={routeId}
        onClose={() => setSearchOpen(false)}
        onCreate={createNote}
        onSelect={(id) => router.push(`/app/${id}`, { scroll: false })}
      />
    </div>
    </SessionProvider>
  );
}
