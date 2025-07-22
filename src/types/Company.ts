
export interface Company {
  id: number | string;
  '@id'?: string;
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}
