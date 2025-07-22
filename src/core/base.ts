import { defineStore } from "pinia";
import { useCrudStore, createRelationResolver } from "../composables/useCrudStore";

export function createEntityStore<T>(
  storeName: string,
  endpoint: string,
  relations: string[] = [],
  defaultItemsPerPage: number = 30
) {
  return defineStore(storeName, () => {
    const relationResolver = createRelationResolver<T>(relations);
    
    const crudStore = useCrudStore<T>({
      endpoint,
      defaultItemsPerPage,
      relationResolver
    });

    return {
      items: crudStore.items,
      loading: crudStore.loading,
      error: crudStore.error,
      totalItems: crudStore.totalItems,
      currentPage: crudStore.currentPage,
      itemsPerPage: crudStore.itemsPerPage,

      fetchItems: crudStore.fetchItems,
      fetchAllItems: crudStore.fetchAllItems,
      fetchItem: crudStore.fetchItem,
      createItem: crudStore.createItem,
      updateItem: crudStore.updateItem,
      deleteItem: crudStore.deleteItem,
      findItem: crudStore.findItem,
      clearError: crudStore.clearError,
      resetState: crudStore.resetState
    };
  });
}