

import type { Contact } from './Contact'

export enum OpportunityStatus {
  PROSPECT = 'prospect',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
}

export interface Opportunity {
  id: number | string;
  '@id'?: string;
  contact: Contact | null;
  title: string;
  description: string;
  status: OpportunityStatus;
  amount: string;
  closeDate: string; 
  createdAt?: string;
  updatedAt?: string;
}
