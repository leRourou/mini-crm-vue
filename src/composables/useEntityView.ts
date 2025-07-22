import { computed, onMounted, ref } from "vue";
import { extractNumericId } from "../utils/idUtils";

/**
 * Generic entity view composable following DRY and SOLID principles
 * Single Responsibility: Manages entity view state and operations
 * Open/Closed: Extensible through store configuration
 * Interface Segregation: Focused interface for view operations
 * Dependency Inversion: Depends on store abstractions
 */

export interface EntityViewConfig<T> {
  store: any;
  headers: Array<{ title: string; value: string }>;
  entityName: string;
}

export function useEntityView<
  T extends { id?: number | string; "@id"?: string },
>(config: EntityViewConfig<T>) {
  const { store, headers, entityName } = config;

  const selectedItem = ref<T | null>(null);
  const editViewKey = ref(0);
  const basePageRef = ref<any>(null);

  const items = computed(() => store.items);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);
  const currentPage = computed(() => store.currentPage);
  const itemsPerPage = computed(() => store.itemsPerPage);

  /**
   * Fetch items from the store
   */
  const fetchItems = () => {
    store.fetchItems(store.currentPage, store.itemsPerPage);
  };

  /**
   * Handle row click to select an item and fetch fresh data
   */
  const rowClickHandler = async (item: T) => {
    // Extract the appropriate ID for fetching using utility function
    const fetchId = extractNumericId(item.id || item["@id"]);

    if (fetchId && store.fetchItem) {
      const freshItem = await store.fetchItem(fetchId);
      selectedItem.value = freshItem || item;
    } else {
      selectedItem.value = item;
    }
  };

  /**
   * Handle pagination changes (page and/or items per page)
   */
  const handlePaginationChange = (
    options: { page: number; itemsPerPage: number },
  ) => {
    // Only fetch if the page or items per page actually changed
    if (
      options.page !== store.currentPage ||
      options.itemsPerPage !== store.itemsPerPage
    ) {
      store.fetchItems(options.page, options.itemsPerPage);
    }
  };

  /**
   * Handle new entity creation
   */
  const handleNewEntity = () => {
    // Don't change selectedItem - just open the create dialog
    // This prevents unnecessary re-rendering of EditView
    if (basePageRef.value && basePageRef.value.editViewRef) {
      basePageRef.value.editViewRef.openCreateDialog();
    }
  };

  /**
   * Handle entity update/creation/deletion
   */
  const handleEntityUpdated = (updatedEntity: T | null) => {
    if (updatedEntity === null) {
      selectedItem.value = null;
      editViewKey.value++;
      fetchItems(); // Only refetch when entity is deleted
    } else {
      // For updates and creations, use the response data to update the display
      selectedItem.value = updatedEntity;
      editViewKey.value++;
      // No need to refetch - the store already has the updated/created data
    }
  };

  /**
   * Initialize the view
   */
  const initialize = () => {
    fetchItems();
  };

  onMounted(() => {
    initialize();
  });

  return {
    selectedItem,
    editViewKey,
    basePageRef,

    items,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,

    headers,
    entityName,

    fetchItems,
    rowClickHandler,
    handlePaginationChange,
    handleNewEntity,
    handleEntityUpdated,
    initialize,
  };
}
