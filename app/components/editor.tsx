"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import { localDB } from "../lib/pouchdb";

interface EditorProps {
  noteId: string;
  initialContent?: any[];
}

// Our <Editor> component we can reuse later
export default function Editor({ noteId, initialContent = [] }: EditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasContent, setHasContent] = useState(false);

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

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => {
        const blocks = editor.document;
        saveNote(blocks);
      }}
    />
  );
}
