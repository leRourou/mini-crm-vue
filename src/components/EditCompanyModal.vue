<template>
  <div class="edit-company-modal">
    <!-- Company Display Section -->
    <div class="company-header">
      <div class="company-avatar">
        <v-avatar size="64" color="info">
          <v-icon size="32" color="white">mdi-office-building</v-icon>
        </v-avatar>
      </div>
      <div class="company-info">
        <h2 class="company-name">{{ getCompanyTitle() }}</h2>
        <div class="company-meta">
          <v-chip size="small" color="status-progress" variant="tonal">
            <v-icon start size="12">mdi-office-building</v-icon>
            Company
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="company-actions">
      <div class="actions-header">
        <v-icon size="16" color="info">mdi-cog</v-icon>
        <span class="actions-title">Actions</span>
      </div>
      <div class="actions-buttons">
        <v-btn
          color="info"
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

    <!-- Company Details Display -->
    <div class="company-details">
      <div class="info-section">
        <div class="section-header">
          <v-icon color="info" size="20">mdi-office-building</v-icon>
          <span class="section-title">Basic Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Company Name</div>
            <div class="info-value">{{ company?.name || 'N/A' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Description</div>
            <div class="info-value">{{ company?.description || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <v-icon color="success" size="20">mdi-contact-phone</v-icon>
          <span class="section-title">Contact Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Phone</div>
            <div class="info-value">{{ company?.phone || 'N/A' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Website</div>
            <div class="info-value">{{ company?.website || 'N/A' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Address</div>
            <div class="info-value">{{ company?.address || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="edit-company-card">
        <v-card-title class="edit-card-title">
          <div class="title-content">
            <v-icon color="info" size="28" class="title-icon">mdi-office-building</v-icon>
            <div>
              <h3 class="card-title">{{ isNewCompany ? 'Create' : 'Edit' }} Company</h3>
              <p class="card-subtitle">{{ isNewCompany ? 'Create new' : 'Update' }} company information</p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="edit-card-content">
          <v-form ref="editForm" @submit.prevent="saveCompany">
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

            <!-- Basic Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="info" size="20">mdi-office-building</v-icon>
                <span class="section-title">Basic Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedCompany.name"
                    label="Company Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-office-building"
                    :rules="[rules.required]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedCompany.description"
                    label="Description"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="success" size="20">mdi-contact-phone</v-icon>
                <span class="section-title">Contact Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12" md="6" class="pe-md-2">
                  <v-text-field
                    v-model="editedCompany.phone"
                    label="Phone Number"
                    type="tel"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12" md="6" class="ps-md-2">
                  <v-text-field
                    v-model="editedCompany.website"
                    label="Website"
                    variant="outlined"
                    prepend-inner-icon="mdi-web"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedCompany.address"
                    label="Address"
                    variant="outlined"
                    prepend-inner-icon="mdi-map-marker"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
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
            color="info" 
            variant="elevated" 
            @click="saveCompany"
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
              <h3 class="card-title">Delete Company</h3>
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
            Are you sure you want to delete this company?
          </v-alert>
          
          <div class="entity-info">
            <strong>{{ getCompanyTitle() }}</strong>
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
            @click="deleteCompany"
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
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import type { Company } from '../types/Company'
import { useToast } from '../composables/useToast'
import { useValidation } from '../composables/useValidation'

const props = defineProps<{
  company: Company | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-company': [company: Company | null]
  'create-company': [company: Company]
  'delete-company': [company: Company]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editedCompany = ref<Partial<Company>>({})
const isCreateMode = ref(false)

const toast = useToast()
const { rules } = useValidation()

const loading = computed({
  get: () => props.loading || false,
  set: (value: boolean) => emit('update:loading', value)
})

const error = computed({
  get: () => props.error || null,
  set: (value: string | null) => emit('update:error', value)
})

const isNewCompany = computed(() => {
  return isCreateMode.value || props.company?.id === 0 || !props.company?.id
})

const getCompanyTitle = (): string => {
  if (props.company?.name) {
    return props.company.name
  }
  return `Company #${props.company?.id || 'New'}`
}

const openEditDialog = async () => {
  isCreateMode.value = false
  editedCompany.value = { 
    ...props.company
  }
  showEditDialog.value = true
}

const openCreateDialog = async () => {
  isCreateMode.value = true
  editedCompany.value = {
    name: '',
    description: '',
    website: '',
    address: '',
    phone: ''
  }
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editedCompany.value = {}
  if (isCreateMode.value) {
    isCreateMode.value = false
  }
}

const convertCompanyToApiFormat = (company: Partial<Company>) => {
  const apiCompany = { ...company }
  
  // Clean up fields for API
  delete apiCompany['@id']
  delete (apiCompany as any)['@type']
  delete apiCompany.createdAt
  delete apiCompany.updatedAt
  
  return apiCompany
}

const saveCompany = async () => {
  try {
    const actionText = isCreateMode.value ? 'Creating' : 'Updating'
    const successText = isCreateMode.value ? 'created' : 'updated'
    
    toast.loading(`${actionText} company...`)
    
    const companyToSave = convertCompanyToApiFormat(editedCompany.value)
    
    if (isCreateMode.value) {
      delete companyToSave.id
      emit('create-company', companyToSave as Company)
    } else {
      emit('update-company', companyToSave as Company)
    }
    
    toast.success(`Company ${successText} successfully!`)
    closeEditDialog()
  } catch (error) {
    const actionText = isCreateMode.value ? 'create' : 'update'
    toast.errorFromException(error, `Failed to ${actionText} company`)
  }
}

const deleteCompany = async () => {
  try {
    toast.loading('Deleting company...')
    
    if (props.company) {
      emit('delete-company', props.company)
    }
    
    toast.success('Company deleted successfully!')
    showDeleteDialog.value = false
  } catch (error) {
    toast.errorFromException(error, 'Failed to delete company')
  }
}

watch(() => props.error, (newError) => {
  if (newError) {
    toast.error(newError)
  }
})

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>

<style scoped>
/* Use the same styling as other edit modals with company-specific colors */
.edit-company-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.company-avatar {
  position: relative;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-actions {
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

.company-details {
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

.edit-company-card {
  border-radius: 16px;
  overflow: hidden;
}

.edit-card-title {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%);
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
  padding: 24px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  background: rgba(33, 150, 243, 0.1);
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
  border: 1px solid rgba(33, 150, 243, 0.1);
}

.form-field {
  margin-bottom: 4px;
}

.edit-card-actions {
  background: white;
  border-top: 1px solid rgba(33, 150, 243, 0.1);
  padding: 16px 24px;
}

.cancel-btn {
  text-transform: none;
  font-weight: 500;
}

.save-btn {
  text-transform: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
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
  .edit-company-modal {
    padding: 20px;
  }
  
  .company-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .company-name {
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

@media (max-width: 480px) {
  .edit-company-modal {
    padding: 16px;
  }
  
  .company-name {
    font-size: 18px;
  }
  
  .actions-buttons {
    flex-direction: column;
  }
  
  .section-content {
    gap: 8px;
  }
  
  .edit-card-title {
    padding: 20px;
  }
  
  .edit-card-content {
    padding: 20px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .title-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>