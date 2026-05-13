"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

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
  // 1. Look at the first block
  const firstBlock = blocks[0];
  let title = "Untitled";

  if (firstBlock) {
    // This extracts text regardless of whether it's a heading, paragraph, or list item
    const blockText = firstBlock.content
      .map((item: any) => item.text)
      .join("")
      .trim();
    
    title = blockText || "Untitled";
  }

  // 2. Save to DB
  await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, content: blocks }),
  });
}, 1000);

  // Only render on client to avoid hydration issues
  if (!isClient) {
    return null;
  }

  // Renders the editor instance using a React component.
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
