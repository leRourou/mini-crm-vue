import { computed, reactive } from "vue";
import api from "../services/api";
import {
  areIdsEqual,
  buildApiEndpoint,
  extractNumericId,
} from "../utils/idUtils";

export interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface CrudStoreOptions<T> {
  endpoint: string;
  defaultItemsPerPage?: number;
  relationResolver?: (item: T) => Promise<T>;
}

/**
 * Generic CRUD store composable following DRY and SOLID principles
 * Single Responsibility: Handles generic CRUD operations
 * Open/Closed: Extensible through options and relation resolver
 * Interface Segregation: Focused interface for CRUD operations
 * Dependency Inversion: Depends on abstractions (api service)
 */
export function useCrudStore<
  T extends { id?: number | string; "@id"?: string },
>(
  options: CrudStoreOptions<T>,
) {
  const { endpoint, defaultItemsPerPage = 30, relationResolver } = options;

  const state = reactive<CrudState<T>>({
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: defaultItemsPerPage,
  });

  const getters = {
    items: computed(() => state.items),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    totalItems: computed(() => state.totalItems),
    currentPage: computed(() => state.currentPage),
    itemsPerPage: computed(() => state.itemsPerPage),
  };

  const handleError = (error: unknown, operation: string) => {
    const errorMessage = error instanceof Error
      ? error.message
      : `${operation} failed`;
    state.error = errorMessage;
    console.error(`${operation} error:`, error);
  };

  const withLoading = async <R>(
    operation: () => Promise<R>,
  ): Promise<R | undefined> => {
    state.loading = true;
    state.error = null;
    try {
      return await operation();
    } catch (error) {
      throw error;
    } finally {
      state.loading = false;
    }
  };

  /**
   * Fetch items with pagination
   */
  const fetchItems = async (
    page: number = 1,
    itemsPerPage: number = state.itemsPerPage,
  ) => {
    return withLoading(async () => {
      const response = await api.get(
        `${endpoint}?page=${page}&itemsPerPage=${itemsPerPage}`,
      );
      let items = response.data.member;

      if (relationResolver) {
        items = await Promise.all(items.map(relationResolver));
      }

      state.items = items;
      state.totalItems = response.data.totalItems;
      state.currentPage = page;
      state.itemsPerPage = itemsPerPage;
    }).catch((error) => handleError(error, "Fetch items"));
  };

  /**
   * Fetch all items without pagination
   */
  const fetchAllItems = async () => {
    return withLoading(async () => {
      const response = await api.get(`${endpoint}?pagination=false`);
      let items = response.data.member;

      if (relationResolver) {
        items = await Promise.all(items.map(relationResolver));
      }

      state.items = items;
      state.totalItems = items.length;
    }).catch((error) => handleError(error, "Fetch all items"));
  };

  /**
   * Create a new item
   */
  const createItem = async (item: Omit<T, "id">) => {
    return withLoading(async () => {
      const response = await api.post(endpoint, item);
      let createdItem = response.data;

      // Apply relation resolver if configured
      if (relationResolver) {
        createdItem = await relationResolver(createdItem);
      }

      state.items.push(createdItem);
      return createdItem;
    }).catch((error) => handleError(error, "Create item"));
  };

  /**
   * Update an existing item
   */
  const updateItem = async (item: T) => {
    return withLoading(async () => {
      const numericId = extractNumericId(item["@id"] || item.id);

      if (!numericId) {
        throw new Error(
          `Cannot update item: no valid ID found for item ${
            JSON.stringify(item)
          }`,
        );
      }

      const updateEndpoint = buildApiEndpoint(endpoint, numericId);

      const response = await api.put(updateEndpoint, item);
      let updatedItem = response.data;

      // Apply relation resolver if configured
      if (relationResolver) {
        updatedItem = await relationResolver(updatedItem);
      }

      // Find and update item in local state with the response data
      const index = state.items.findIndex((i) =>
        areIdsEqual(i["@id"] || i.id, item["@id"] || item.id)
      );
      if (index !== -1) {
        state.items.splice(index, 1, updatedItem);
      }

      return updatedItem;
    }).catch((error) => handleError(error, "Update item"));
  };

  /**
   * Delete an item
   */
  const deleteItem = async (id: number | string) => {
    return withLoading(async () => {
      if (id === undefined || id === null) {
        throw new Error(`Cannot delete item: ID is undefined or null`);
      }

      const numericId = extractNumericId(id);
      if (!numericId) {
        throw new Error(`Cannot delete item: invalid ID format ${id}`);
      }

      const deleteEndpoint = buildApiEndpoint(endpoint, numericId);

      await api.delete(deleteEndpoint);

      // Remove from local state using ID comparison utility
      state.items = state.items.filter((i) =>
        !areIdsEqual(i["@id"] || i.id, id)
      );
    }).catch((error) => handleError(error, "Delete item"));
  };

  /**
   * Find item by id or @id in loaded items
   */
  const findItem = (id: number | string): T | undefined => {
    return state.items.find((item) =>
      areIdsEqual(item["@id"] || item.id, id)
    ) as T | undefined;
  };

  /**
   * Fetch individual item with full relationship data
   */
  const fetchItem = async (id: number | string): Promise<T | undefined> => {
    return withLoading(async () => {
      const numericId = extractNumericId(id);
      if (!numericId) {
        throw new Error(`Cannot fetch item: invalid ID format ${id}`);
      }

      const fetchEndpoint = buildApiEndpoint(endpoint, numericId);
      const response = await api.get(fetchEndpoint);
      let item = response.data;

      // Apply relation resolver to get full relationship data
      if (relationResolver) {
        item = await relationResolver(item);
      }

      return item;
    }).catch((error) => {
      handleError(error, "Fetch item");
      return undefined;
    });
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    state.error = null;
  };

  /**
   * Reset state to initial values
   */
  const resetState = () => {
    state.items = [];
    state.loading = false;
    state.error = null;
    state.totalItems = 0;
    state.currentPage = 1;
    state.itemsPerPage = defaultItemsPerPage;
  };

  return {
    ...getters,

    fetchItems,
    fetchAllItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    findItem,
    clearError,
    resetState,

    state,
  };
}

/**
 * Helper function to create relation resolvers for entities with related data
 */
export function createRelationResolver<T extends Record<string, unknown>>(
  relationKeys: string[],
): (item: T) => Promise<T> {
  return async (item: T): Promise<T> => {
    const resolvedItem = { ...item } as any;

    for (const key of relationKeys) {
      if (
        typeof item[key] === "string" && (item[key] as string).startsWith("/")
      ) {
        try {
          const response = await api.get(item[key] as string);
          resolvedItem[key] = response.data;
        } catch (error) {
          console.error(`Error resolving relation ${key}:`, error);
          resolvedItem[key] = null;
        }
      }
    }

    return resolvedItem as T;
  };
}
