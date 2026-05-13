import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled" },
  content: { type: Array, required: true }, // This stores the JSON blocks
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
});

export const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);