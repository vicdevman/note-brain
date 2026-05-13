"use client";
import type { Note } from "../../app/components/notesTypes";
import Editor from "./editor";

export default function NoteEditor(props: {
  note: Note;
}) {
  

  return (
     <div className="min-h-vh h-full">
      <Editor key={props.note.id} noteId={props.note.id} initialContent={props.note.blocks || []} />
    </div>
   );
}

