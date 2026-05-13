export type NoteId = string;

export type BlockType = "paragraph" | "ordered" | "bullet";

export type NoteBlock = {
  id: string;
  type: BlockType;
  order?: number;
  html: string;
};

export type Note = {
  id: NoteId;
  _id?: string;
  title: string;
  blocks: NoteBlock[];
  createdAt: number;
  updatedAt: number;
};

export type NoteMenuState = { noteId: NoteId; open: boolean } | null;

export type TitleEditState = { noteId: NoteId; value: string } | null;
