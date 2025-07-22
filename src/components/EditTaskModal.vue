<template>
  <div class="edit-task-modal">
    <!-- Task Display Section -->
    <div class="task-header">
      <div class="task-avatar">
        <v-avatar size="64" color="warning">
          <v-icon size="32" color="white">mdi-checkbox-marked-circle</v-icon>
        </v-avatar>
      </div>
      <div class="task-info">
        <h2 class="task-name">{{ getTaskTitle() }}</h2>
        <div class="task-meta">
          <v-chip size="small" color="status-progress" variant="tonal">
            <v-icon start size="12">mdi-checkbox-marked-circle</v-icon>
            Task
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="task-actions">
      <div class="actions-header">
        <v-icon size="16" color="primary">mdi-cog</v-icon>
        <span class="actions-title">Actions</span>
      </div>
      <div class="actions-buttons">
        <v-btn
          color="warning"
          variant="tonal"
          size="small"
          prepend-icon="mdi-pencil-outline"
          @click="openEditDialog"
          class="action-btn"
        >
          Edit
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          prepend-icon="mdi-delete-outline"
          @click="showDeleteDialog = true"
          class="action-btn"
        >
          Delete
        </v-btn>
      </div>
    </div>

    <!-- Task Details Display -->
    <div class="task-details">
      <div class="info-section">
        <div class="section-header">
          <v-icon color="warning" size="20">mdi-checkbox-marked-circle</v-icon>
          <span class="section-title">Task Details</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Description</div>
            <div class="info-value">{{ task?.description || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <v-icon color="info" size="20">mdi-calendar-clock</v-icon>
          <span class="section-title">Scheduling & Status</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Due Date</div>
            <div class="info-value">{{ formatDate(task?.dueDate) }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status</div>
            <div class="info-value">{{ getStatusLabel(task?.status) }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <v-icon color="primary" size="20">mdi-account</v-icon>
          <span class="section-title">Contact Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Contact</div>
            <div class="info-value">
              <div class="contact-display">
                <v-icon icon="mdi-account" size="16" class="me-2" color="primary"></v-icon>
                {{ getContactName(task?.contact) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="edit-task-card">
        <v-card-title class="edit-card-title">
          <div class="title-content">
            <v-icon color="warning" size="28" class="title-icon">mdi-checkbox-marked-circle</v-icon>
            <div>
              <h3 class="card-title">{{ isNewTask ? 'Create' : 'Edit' }} Task</h3>
              <p class="card-subtitle">{{ isNewTask ? 'Create new' : 'Update' }} task information</p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="edit-card-content">
          <v-form ref="editForm" @submit.prevent="saveTask">
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Task Details Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="warning" size="20">mdi-checkbox-marked-circle</v-icon>
                <span class="section-title">Task Details</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedTask.description"
                    label="Description"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    :rules="[rules.required]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Scheduling & Status Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="info" size="20">mdi-calendar-clock</v-icon>
                <span class="section-title">Scheduling & Status</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12" md="6" class="pe-md-2">
                  <v-text-field
                    v-model="editedTask.dueDate"
                    label="Due Date"
                    type="date"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    :rules="[rules.required]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12" md="6" class="ps-md-2">
                  <v-select
                    v-model="editedTask.status"
                    :items="statusOptions"
                    item-title="label"
                    item-value="value"
                    label="Status"
                    variant="outlined"
                    prepend-inner-icon="mdi-flag"
                    :rules="[rules.required]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="primary" size="20">mdi-account</v-icon>
                <span class="section-title">Contact Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-select
                    v-model="editedTask.contact"
                    :items="contactStore.items"
                    :item-title="getContactDisplayName"
                    return-object
                    label="Contact"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    :disabled="loading"
                    :loading="contactStore.loading"
                    density="compact"
                    class="form-field"
                    clearable
                  >
                  </v-select>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="edit-card-actions">
          <v-spacer />
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="closeEditDialog"
            :disabled="loading"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="warning" 
            variant="elevated" 
            @click="saveTask"
            :loading="loading"
            class="save-btn"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card class="delete-confirmation-card">
        <v-card-title class="delete-card-title">
          <div class="title-content">
            <v-icon color="error" size="28" class="title-icon">mdi-delete-alert</v-icon>
            <div>
              <h3 class="card-title">Delete Task</h3>
              <p class="card-subtitle">This action cannot be undone</p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="delete-card-content">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Are you sure you want to delete this task?
          </v-alert>
          
          <div class="entity-info">
            <strong>{{ getTaskTitle() }}</strong>
          </div>
        </v-card-text>
        
        <v-card-actions class="delete-card-actions">
          <v-spacer />
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="showDeleteDialog = false"
            :disabled="loading"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated" 
            @click="deleteTask"
            :loading="loading"
            class="delete-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast notifications -->
    <v-snackbar
      v-model="toast.state.show"
      :color="toast.state.type"
      :timeout="toast.state.timeout"
      location="top right"
      class="custom-toast"
    >
      <div class="toast-content">
        <v-icon v-if="toast.state.icon" :icon="toast.state.icon" class="me-2" />
        <span>{{ toast.state.message }}</span>
        <v-progress-circular
          v-if="toast.state.loading"
          indeterminate
          size="20"
          class="ms-2"
        />
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue'
import type { Task, TaskStatus } from '../types/Task'
import type { Contact } from '../types/Contact'
import { useToast } from '../composables/useToast'
import { useValidation } from '../composables/useValidation'
import { useContactStore } from '../stores/contacts'

const props = defineProps<{
  task: Task | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-task': [task: Task | null]
  'create-task': [task: Task]
  'delete-task': [task: Task]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editedTask = ref<Partial<Task>>({})
const isCreateMode = ref(false)

const toast = useToast()
const { rules } = useValidation()
const contactStore = useContactStore()

const loading = computed({
  get: () => props.loading || false,
  set: (value: boolean) => emit('update:loading', value)
})

const error = computed({
  get: () => props.error || null,
  set: (value: string | null) => emit('update:error', value)
})

const isNewTask = computed(() => {
  return isCreateMode.value || props.task?.id === 0 || !props.task?.id
})

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Done', value: 'done' },
  { label: 'Cancelled', value: 'cancelled' }
]


const getTaskTitle = (): string => {
  if (props.task?.description) {
    return props.task.description.length > 50 
      ? props.task.description.substring(0, 50) + '...'
      : props.task.description
  }
  return `Task #${props.task?.id || 'New'}`
}

const getStatusLabel = (status: TaskStatus | string | undefined): string => {
  if (!status) return 'N/A'
  const statusMap = {
    'pending': 'Pending',
    'done': 'Done', 
    'cancelled': 'Cancelled'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getContactDisplayName = (contact: Contact | null | undefined): string => {
  if (!contact) return 'No contact assigned'
  
  const firstName = contact.firstname?.trim() || ''
  const lastName = contact.lastname?.trim() || ''
  const fullName = `${firstName} ${lastName}`.trim()
  
  if (fullName) return fullName
  if (contact.email?.trim()) return contact.email.trim()
  return `Contact #${contact.id || 'Unknown'}`
}

const getContactName = getContactDisplayName

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}


const openEditDialog = async () => {
  isCreateMode.value = false
  await contactStore.fetchAllItems()
  
  // Find the matching contact in the store to ensure proper v-select binding
  let selectedContact = null

  if (props.task?.contact?.['@id']) {
    const contactId = props.task.contact['@id']
    selectedContact = contactStore.items.find(c => 
      c['@id'] === contactId || 
      c['@id'] === String(contactId) || 
      String(c.id) === String(contactId)
    ) || null
  }

  editedTask.value = { 
    ...props.task,
    contact: selectedContact
  }
  showEditDialog.value = true
}

const openCreateDialog = async () => {
  isCreateMode.value = true
  editedTask.value = {
    description: '',
    dueDate: '',
    status: 'pending',
    contact: null
  }
  await contactStore.fetchAllItems()
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editedTask.value = {}
  if (isCreateMode.value) {
    isCreateMode.value = false
  }
}

const convertTaskToApiFormat = (task: Partial<Task>, isCreate = false) => {
  const apiTask = { ...task }
  
  // Convert contact object to URI if needed
  if (apiTask.contact && typeof apiTask.contact === 'object') {
    const contact = apiTask.contact as Contact
    if (contact['@id']) {
      apiTask.contact = contact['@id'] as any
    } else if (contact.id) {
      apiTask.contact = `/api/contacts/${contact.id}` as any
    }
  }
  
  // Clean up fields for API - preserve ID for updates
  if (isCreate) {
    delete apiTask.id
    delete apiTask['@id']
  }
  delete apiTask['@type']
  delete apiTask.createdAt
  delete apiTask.updatedAt
  
  return apiTask
}

const saveTask = async () => {
  try {
    const actionText = isCreateMode.value ? 'Creating' : 'Updating'
    const successText = isCreateMode.value ? 'created' : 'updated'
    
    toast.loading(`${actionText} task...`)
    
    const taskToSave = convertTaskToApiFormat(editedTask.value, isCreateMode.value)
    
    if (isCreateMode.value) {
      emit('create-task', taskToSave as Task)
    } else {
      emit('update-task', taskToSave as Task)
    }
    
    toast.success(`Task ${successText} successfully!`)
    closeEditDialog()
  } catch (error) {
    const actionText = isCreateMode.value ? 'create' : 'update'
    toast.errorFromException(error, `Failed to ${actionText} task`)
  }
}

const deleteTask = async () => {
  try {
    toast.loading('Deleting task...')
    
    if (props.task) {
      emit('delete-task', props.task)
    }
    
    toast.success('Task deleted successfully!')
    showDeleteDialog.value = false
  } catch (error) {
    toast.errorFromException(error, 'Failed to delete task')
  }
}

watch(() => props.error, (newError) => {
  if (newError) {
    toast.error(newError)
  }
})

onMounted(() => {
  contactStore.fetchAllItems()
})

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>

<style scoped>
/* Copy the same styles as EditOpportunityModal but with warning colors for tasks */
.edit-task-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.task-avatar {
  position: relative;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-actions {
  margin-bottom: 16px;
}

.actions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.actions-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.actions-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.info-section {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  flex: 1;
}

.contact-display {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-weight: 500;
}

.edit-task-card {
  border-radius: 16px;
  overflow: hidden;
}

.edit-card-title {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 152, 0, 0.1);
  padding: 24px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12px;
  padding: 8px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.edit-card-content {
  padding: 24px;
  background: #fafafa;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.form-field {
  margin-bottom: 4px;
}

.edit-card-actions {
  background: white;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding: 16px 24px;
}

.cancel-btn {
  text-transform: none;
  font-weight: 500;
}

.save-btn {
  text-transform: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

.delete-confirmation-card {
  border-radius: 16px;
  overflow: hidden;
}

.delete-card-title {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%);
  border-bottom: 1px solid rgba(244, 67, 54, 0.1);
  padding: 24px;
}

.delete-card-content {
  padding: 24px;
}

.delete-card-actions {
  background: white;
  border-top: 1px solid rgba(244, 67, 54, 0.1);
  padding: 16px 24px;
}

.delete-btn {
  text-transform: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-btn:hover {
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

.entity-info {
  padding: 8px 0;
}

.toast-content {
  display: flex;
  align-items: center;
}

.custom-toast {
  z-index: 9999;
}

@media (max-width: 768px) {
  .edit-task-modal {
    padding: 20px;
  }
  
  .task-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .task-name {
    font-size: 20px;
  }
  
  .actions-buttons {
    justify-content: center;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>