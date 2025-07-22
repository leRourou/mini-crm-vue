import type { Ref, ComputedRef } from 'vue'

export interface BaseEntity {
  id: number | string
  '@id'?: string
  '@type'?: string
  createdAt?: string
  updatedAt?: string
}

export interface EntityStore<T extends BaseEntity> {
  // State
  items: ComputedRef<T[]>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  totalItems: ComputedRef<number>
  currentPage: ComputedRef<number>
  itemsPerPage: ComputedRef<number>

  // Actions
  fetchItems: (page?: number, itemsPerPage?: number) => Promise<void>
  fetchItem: (id: number | string) => Promise<T | undefined>
  createItem: (item: Omit<T, 'id'>) => Promise<T | undefined>
  updateItem: (item: T) => Promise<T | undefined>
  deleteItem: (id: number | string) => Promise<void>
  findItem: (id: number | string) => T | undefined
  clearError: () => void
  resetState: () => void
}

export interface FormFieldStore {
  fetchItems: () => Promise<void>
  items: { value: BaseEntity[] } | ComputedRef<BaseEntity[]>
  loading: { value: boolean } | ComputedRef<boolean>
}