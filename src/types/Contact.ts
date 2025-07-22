
import type { Company } from './Company';
export interface Contact {
  id: number | string;
  '@id'?: string;
  '@type'?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: Company | null;
  createdAt?: string;
  updatedAt?: string;
}
