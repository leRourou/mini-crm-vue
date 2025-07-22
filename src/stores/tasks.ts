import type { Task } from "../types/Task";
import { createEntityStore } from "../core/base";

export const useTaskStore = createEntityStore<Task>(
  "tasks", 
  "/tasks", 
  ["contact"]
);