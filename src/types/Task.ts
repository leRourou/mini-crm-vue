
import type { Contact } from './Contact'

export enum TaskStatus {
  PENDING = 'pending',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: number | string;
  '@id'?: string;
  contact: Contact | null;
  description: string;
  dueDate: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}
