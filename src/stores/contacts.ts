import type { Contact } from "../types/Contact";
import { createEntityStore } from "../core/base";

export const useContactStore = createEntityStore<Contact>(
  "contacts", 
  "/contacts", 
  ["company"], 
  30
);
