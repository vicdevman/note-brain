"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Copy, Globe2, Loader2, Send, Share2, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { localDB } from "../lib/pouchdb";

interface EditorProps {
  noteId: string;
  noteTitle?: string;
  initialContent?: any[];
}

type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

// Our <Editor> component we can reuse later
export default function Editor({ noteId, noteTitle = "Untitled", initialContent = [] }: EditorProps) {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");
  const [shareUrl, setShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: initialContent.length > 0 ? initialContent : undefined,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saveNote = useDebouncedCallback(async (blocks) => {
    const firstBlock = blocks[0];
    let title = "Untitled";

    if (firstBlock) {
      title =
        firstBlock.content
          .map((item: any) => item.text)
          .join("")
          .trim() || "Untitled";
    }

    try {
      // 1. Get the current doc to get the latest _rev
      const existingDoc = await localDB
        .get(noteId)
        .catch(() => ({ _id: noteId }));

      // 2. Update local PouchDB (Instant & Offline)
      await localDB.put({
        ...existingDoc,
        title,
        content: blocks,
        updatedAt: Date.now(),
      });

      console.log("Saved to Local PouchDB");
    } catch (err) {
      console.error("Local save failed", err);
    }
  }, 500);

  // Only render on client to avoid hydration issues
  if (!isClient) {
    return null;
  }

  async function createShareLink() {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: sharePermission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create link");
      setShareUrl(data.url);
    } catch (error) {
      setShareUrl(error instanceof Error ? error.message : "Could not create link");
    } finally {
      setShareLoading(false);
    }
  }

  async function sendAiMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const query = aiInput.trim();
    if (!query || aiLoading) return;

    const nextMessages: AiMessage[] = [...aiMessages, { role: "user", content: query }];
    setAiMessages(nextMessages);
    setAiInput("");
    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch(`/api/notes/${noteId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          noteId,
          query,
          noteTitle,
          noteBlocks: editor.document,
          messages: nextMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI endpoint is not ready yet");
      setAiMessages((current) => [...current, { role: "assistant", content: data.response || data.message || "" }]);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Could not reach AI endpoint");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100dvh-5rem)]">
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-40 flex items-center gap-2 md:bottom-auto md:right-6 md:top-6 md:flex-col">
        <button
          type="button"
          onClick={() => setAiOpen((value) => !value)}
          className={`inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-xl backdrop-blur-md md:h-11 ${aiOpen ? "border-[var(--nb-primary)] bg-[var(--nb-primary)] text-black" : "border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)]/82 text-[var(--nb-border)]"}`}
        >
          <Sparkles className="h-4 w-4" />
          AI
        </button>
        <button
          type="button"
          onClick={() => setShareOpen((value) => !value)}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)]/82 px-4 text-sm font-semibold text-[var(--nb-border)] shadow-xl backdrop-blur-md md:h-11"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] p-3 shadow-2xl md:bottom-auto md:right-20 md:top-6"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--nb-border)]">
                <Globe2 className="h-4 w-4" />
                Public link
              </div>
              <button type="button" onClick={() => setShareOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--nb-text-muted)]" aria-label="Close share">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["view", "edit"] as const).map((permission) => (
                <button
                  key={permission}
                  type="button"
                  onClick={() => setSharePermission(permission)}
                  className={`h-10 rounded-md border text-sm font-medium ${sharePermission === permission ? "border-[var(--nb-primary)] bg-[var(--nb-primary)]/15 text-[var(--nb-border)]" : "border-[var(--nb-border-strong)] text-[var(--nb-text-muted)]"}`}
                >
                  Can {permission}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={createShareLink}
              disabled={shareLoading}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--nb-primary)] text-sm font-semibold text-black disabled:opacity-60"
            >
              {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              Create link
            </button>
            {shareUrl && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-2">
                <span className="min-w-0 flex-1 truncate text-xs text-[var(--nb-text-muted)]">{shareUrl}</span>
                <button type="button" onClick={() => navigator.clipboard?.writeText(shareUrl)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--nb-border)]" aria-label="Copy share link">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            )}
            <button type="button" onClick={() => setShareOpen(false)} className="mt-2 h-9 w-full rounded-md border border-[var(--nb-border-strong)] text-sm text-[var(--nb-text-muted)]">
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiOpen && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 mx-auto max-w-2xl rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] p-3 shadow-2xl md:bottom-6 md:right-24 md:left-auto md:w-[min(34rem,calc(100vw-8rem))]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--nb-border)]">
                <Bot className="h-4 w-4" />
                Brainstorm with this note
              </div>
              <button type="button" onClick={() => setAiOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--nb-text-muted)]" aria-label="Close AI mode">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {aiMessages.length === 0 ? (
                <div className="rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-3 text-sm text-[var(--nb-text-muted)]">
                  Ask for an outline, connections, missing points, or a sharper summary.
                </div>
              ) : (
                aiMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[86%] rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "bg-[var(--nb-primary)] text-black" : "bg-[var(--nb-note-bg)] text-[var(--nb-border)]"}`}>
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {aiError && <div className="text-sm text-red-400">{aiError}</div>}
            </div>

            <form onSubmit={sendAiMessage} className="mt-3 flex items-end gap-2 rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-2">
              <textarea
                ref={textareaRef}
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendAiMessage();
                  }
                }}
                placeholder="Brainstorm with this note..."
                rows={1}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[var(--nb-border)] outline-none placeholder:text-[var(--nb-text-muted)]"
              />
              <button type="submit" disabled={!aiInput.trim() || aiLoading} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--nb-primary)] text-black disabled:opacity-50" aria-label="Send message">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <BlockNoteView
        editor={editor}
        onChange={() => {
          const blocks = editor.document;
          saveNote(blocks);
        }}
      />
    </div>
  );
}
