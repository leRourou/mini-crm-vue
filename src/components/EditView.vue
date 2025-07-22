<template>
  <div class="edit-view-container">
    <Transition name="fade" mode="out-in">
      <div v-if="selectedItem || isCreateMode" class="selected-item-container">
        <!-- Entity-specific modals -->
        <EditOpportunityModal
          v-if="entityType === 'Opportunity'"
          ref="editComponentRef"
          :opportunity="isCreateMode ? createModeItem : selectedItem"
          :loading="currentStore?.loading"
          :error="currentStore?.error"
          @update-opportunity="handleUpdateEntity"
          @create-opportunity="handleCreateEntity"
          @delete-opportunity="handleDeleteEntity"
          @update:loading="updateLoading"
          @update:error="updateError"
        />
        <EditTaskModal
          v-else-if="entityType === 'Task'"
          ref="editComponentRef"
          :task="isCreateMode ? createModeItem : selectedItem"
          :loading="currentStore?.loading"
          :error="currentStore?.error"
          @update-task="handleUpdateEntity"
          @create-task="handleCreateEntity"
          @delete-task="handleDeleteEntity"
          @update:loading="updateLoading"
          @update:error="updateError"
        />
        <EditNoteModal
          v-else-if="entityType === 'Note'"
          ref="editComponentRef"
          :note="isCreateMode ? createModeItem : selectedItem"
          :loading="currentStore?.loading"
          :error="currentStore?.error"
          @update-note="handleUpdateEntity"
          @create-note="handleCreateEntity"
          @delete-note="handleDeleteEntity"
          @update:loading="updateLoading"
          @update:error="updateError"
        />
        <div v-else-if="entityType === 'Contact'">
          <DisplayContact
            :contact="isCreateMode ? createModeItem : selectedItem"
            @edit-contact="openEditModal"
            @delete-contact="openDeleteModal"
          />
          <ModalContact
            ref="modalContactRef"
            :contact="isCreateMode ? createModeItem : selectedItem"
            :loading="currentStore?.loading"
            :error="currentStore?.error"
            :is-create-mode="isCreateMode"
            @update-contact="handleUpdateEntity"
            @create-contact="handleCreateEntity"
            @delete-contact="handleDeleteEntity"
            @update:loading="updateLoading"
            @update:error="updateError"
          />
        </div>
        <EditCompanyModal
          v-else-if="entityType === 'Company'"
          ref="editComponentRef"
          :company="isCreateMode ? createModeItem : selectedItem"
          :loading="currentStore?.loading"
          :error="currentStore?.error"
          @update-company="handleUpdateEntity"
          @create-company="handleCreateEntity"
          @delete-company="handleDeleteEntity"
          @update:loading="updateLoading"
          @update:error="updateError"
        />
      </div>
      <v-card v-else class="empty-state-card" elevation="0">
        <v-card-text class="empty-state-content">
          <div class="empty-state-icon">
            <v-icon size="48" color="primary">mdi-cursor-default-click</v-icon>
          </div>
          <div class="empty-state-title">Select an item to view details</div>
          <div class="empty-state-subtitle">Click on any row in the table to see detailed information</div>
        </v-card-text>
      </v-card>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref, type Component, nextTick, watch } from 'vue'
import EditOpportunityModal from './EditOpportunityModal.vue'
import EditTaskModal from './EditTaskModal.vue'
import EditNoteModal from './EditNoteModal.vue'
import EditContactModal from './EditContactModal.vue'
import EditCompanyModal from './EditCompanyModal.vue'
import DisplayContact from './DisplayContact.vue'
import ModalContact from './ModalContact.vue'
import { useContactStore } from '../stores/contacts'
import { useCompanyStore } from '../stores/companies'
import { useOpportunityStore } from '../stores/opportunities'
import { useTaskStore } from '../stores/tasks'
import { useNoteStore } from '../stores/notes'
import { extractNumericId } from '../utils/idUtils'

const props = defineProps<{
  selectedItem?: any,
  entityType: string
}>()

const emit = defineEmits<{
  'entity-updated': [entity: any]
}>()

const editComponentRef = ref<any>(null)
const modalContactRef = ref<any>(null)
const isCreateMode = ref(false)
const createModeItem = ref<any>({ id: 0 })


const contactStore = useContactStore()
const companyStore = useCompanyStore()
const opportunityStore = useOpportunityStore()
const taskStore = useTaskStore()
const noteStore = useNoteStore()


const storeMap = {
  Contact: contactStore,
  Company: companyStore,
  Opportunity: opportunityStore,
  Task: taskStore,
  Note: noteStore
}

const currentStore = computed(() => {
  return storeMap[props.entityType as keyof typeof storeMap] || contactStore
})

// Function to fetch relationship data for each entity type
const fetchRelationshipData = async (entityType: string) => {
  try {
    switch (entityType) {
      case 'Contact':
        // Contacts have relationship with Companies
        await companyStore.fetchAllItems()
        break
      case 'Task':
        // Tasks have relationship with Contacts
        await contactStore.fetchAllItems()
        break
      case 'Note':
        // Notes have relationship with Contacts
        await contactStore.fetchAllItems()
        break
      case 'Opportunity':
        // Opportunities have relationship with Contacts
        await contactStore.fetchAllItems()
        break
      case 'Company':
        // Companies don't have relationships in this context
        break
    }
  } catch (error) {
    console.warn(`Failed to fetch relationship data for ${entityType}:`, error)
  }
}

// Watch for changes in selectedItem or entityType to fetch relationship data
watch(
  () => [props.selectedItem, props.entityType],
  ([newSelectedItem, newEntityType]) => {
    if (newSelectedItem && typeof newEntityType === 'string') {
      // Fetch relationship data when a new item is selected
      fetchRelationshipData(newEntityType)
    }
  },
  { immediate: true }
)

// Also watch just entityType changes
watch(
  () => props.entityType,
  (newEntityType) => {
    if (newEntityType) {
      fetchRelationshipData(newEntityType)
    }
  },
  { immediate: true }
)

const handleUpdateEntity = async (entity: any) => {
  try {
    if (entity === null) {
      emit('entity-updated', null)
      return
    }

    const store = currentStore.value
    const updatedEntity = await store.updateItem(entity)
    
    // Emit the response from the PUT request instead of refetching
    emit('entity-updated', updatedEntity)
  } catch (error) {
    // Error already handled by the stores and components
  }
}

const handleCreateEntity = async (entity: any) => {
  try {
    const store = currentStore.value
    
    // Clean the entity for creation
    const entityData = { ...entity }
    delete entityData.id
    delete entityData['@id']
    delete entityData['@type']
    delete entityData.createdAt
    delete entityData.updatedAt

    const createdEntity = await store.createItem(entityData)
    
    // Reset create mode and clean up
    isCreateMode.value = false
    createModeItem.value = { id: 0 }
    
    // Emit the response from the POST request
    emit('entity-updated', createdEntity)
  } catch (error) {
    // Error already handled by the stores and components
  }
}

const handleDeleteEntity = async (entity: any) => {
  try {
    
    // Validate that entity exists
    if (!entity) {
      return
    }
    
    // Extract numeric ID for deletion using utility function
    const numericId = extractNumericId(entity['@id'] || entity.id)
    
    if (!numericId) {
      console.error('Cannot delete entity: no valid numeric ID found', entity)
      return
    }
    
    const store = currentStore.value
    await store.deleteItem(numericId)
    await store.fetchItems() 
    emit('entity-updated', null)
  } catch (error) {
    // Error already handled by the stores and components
  }
}

const updateLoading = (loading: boolean) => {
  
}

const updateError = (error: string | null) => {
  
}

/**
 * Modal control methods for new architecture
 * Following SOLID principles - Single Responsibility
 */
const openEditModal = () => {
  if (modalContactRef.value) {
    modalContactRef.value.openEditDialog()
  }
}

const openDeleteModal = () => {
  if (modalContactRef.value) {
    modalContactRef.value.openDeleteDialog()
  }
}

const openCreateDialog = () => {
  isCreateMode.value = true
  // Reset create mode item to ensure clean state
  createModeItem.value = { id: 0 }
  
  nextTick(() => {
    if (editComponentRef.value) {
      editComponentRef.value.openCreateDialog()
    } else if (modalContactRef.value) {
      modalContactRef.value.openEditDialog()
    }
  })
}

const openEditDialog = () => {
  nextTick(() => {
    if (editComponentRef.value) {
      editComponentRef.value.openEditDialog()
    } else if (modalContactRef.value) {
      modalContactRef.value.openEditDialog()
    }
  })
}

defineExpose({
  openCreateDialog,
  openEditDialog
})

</script>

<style scoped>
.edit-view-container {
  height: 100%;
}

.selected-item-container {
  height: 100%;
  overflow-y: auto;
}

.empty-state-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-content {
  text-align: center;
  padding: 40px 20px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  transition: all 0.3s ease;
}

.empty-state-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-state-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .empty-state-card {
    min-height: 300px;
  }
  
  .empty-state-content {
    padding: 30px 16px;
  }
  
  .empty-state-icon {
    width: 64px;
    height: 64px;
  }
  
  .empty-state-title {
    font-size: 16px;
  }
  
  .empty-state-subtitle {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .empty-state-card {
    min-height: 250px;
  }
  
  .empty-state-content {
    padding: 20px 12px;
  }
  
  .empty-state-features {
    flex-direction: column;
    gap: 8px;
  }
  
  .feature-item {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>