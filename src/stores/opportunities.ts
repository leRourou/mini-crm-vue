import type { Opportunity } from "../types/Opportunity";
import { createEntityStore } from "../core/base";

export const useOpportunityStore = createEntityStore<Opportunity>(
  "opportunities", 
  "/opportunities", 
  ["contact"]
);