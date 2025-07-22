import type { Company } from "../types/Company";
import { createEntityStore } from "../core/base";

export const useCompanyStore = createEntityStore<Company>(
  "companies", 
  "/companies"
);
