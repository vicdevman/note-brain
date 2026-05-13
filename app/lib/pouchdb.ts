import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Note } from '../components/notesTypes';

PouchDB.plugin(PouchDBFind);

// This is your local persistent storage (IndexedDB)
export const localDB = new PouchDB('brane_notes');

// Helper to format Pouch docs to your Note type
export const formatDoc = (doc: any): Note => {
  return {
    id: doc._id,
    title: doc.title ?? "Untitled",
    // PouchDB stores our blocks in a field called 'content' to match your Mongo schema
    blocks: Array.isArray(doc.content) ? doc.content : [],
    createdAt: doc.createdAt || Date.now(),
    updatedAt: doc.updatedAt || Date.now(),
  };
};