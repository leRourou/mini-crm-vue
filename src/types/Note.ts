
import type { Contact } from './Contact'

export interface Note {
  id: number | string;
  '@id'?: string;
  contact: Contact | null;
  name: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
