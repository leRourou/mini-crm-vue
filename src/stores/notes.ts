import type { Note } from "../types/Note";
import { createEntityStore } from "../core/base";

export const useNoteStore = createEntityStore<Note>(
  "notes", 
  "/notes", 
  ["contact"]
);