import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  // Store the PouchDB ID here so they match across environments
  pouchId: { type: String, required: true, unique: true }, 
  title: { type: String, default: "Untitled" },
  content: { type: Array, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Store the latest revision hash to manage sync conflicts
  lastRev: { type: String }, 
  share: {
    token: { type: String, index: true },
    permission: { type: String, enum: ["view", "edit"], default: "view" },
    enabled: { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  updatedAt: { type: Date, default: Date.now },
});

export const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
