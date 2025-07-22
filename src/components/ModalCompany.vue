<template>
  <!-- Edit Company Dialog -->
  <v-dialog v-model="isEditDialogOpen" max-width="600px">
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
              <v-col cols="12">
                <v-text-field
                  v-model="editedCompany.phone"
                  label="Phone"
                  variant="outlined"
                  prepend-inner-icon="mdi-phone"
                  :rules="[rules.phone]"
                  :disabled="loading"
                  density="compact"
                  class="form-field"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedCompany.website"
                  label="Website"
                  variant="outlined"
                  prepend-inner-icon="mdi-web"
                  :rules="[rules.url]"
                  :disabled="loading"
                  density="compact"
                  class="form-field"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedCompany.address"
                  label="Address"
                  variant="outlined"
                  prepend-inner-icon="mdi-map-marker"
                  :disabled="loading"
                  density="compact"
                  class="form-field"
                  rows="2"
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="edit-card-actions">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeEditDialog"
          :disabled="loading"
          class="action-btn-cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="saveCompany"
          :loading="loading"
          :disabled="!isFormValid"
          class="action-btn-save"
        >
          {{ isNewCompany ? 'Create' : 'Save Changes' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="isDeleteDialogOpen" max-width="500px">
    <v-card class="delete-company-card">
      <v-card-title class="delete-card-title">
        <div class="title-content">
          <v-icon color="error" size="28" class="title-icon">mdi-delete-outline</v-icon>
          <div>
            <h3 class="card-title">Delete Company</h3>
            <p class="card-subtitle">This action cannot be undone</p>
          </div>
        </div>
      </v-card-title>
      
      <v-card-text class="delete-card-content">
        <v-alert type="warning" variant="tonal" class="mb-4">
          <div class="alert-content">
            <strong>Warning:</strong> You are about to delete the company "{{ company?.name }}".
            This will also affect all related contacts, opportunities, tasks, and notes.
          </div>
        </v-alert>
        
        <p class="delete-confirmation-text">
          Are you sure you want to permanently delete this company and all its associated data?
        </p>
      </v-card-text>

      <v-card-actions class="delete-card-actions">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDeleteDialog"
          :disabled="loading"
          class="action-btn-cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="confirmDelete"
          :loading="loading"
          class="action-btn-delete"
        >
          Delete Company
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Company } from '@/types/Company'
import { useCompanyStore } from '@/stores/companies'
import { useToast } from '@/composables/useToast'

// Props
interface Props {
  company: Company | null
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:isEditDialogOpen', value: boolean): void
  (e: 'update:isDeleteDialogOpen', value: boolean): void
  (e: 'company-updated', company: Company): void
  (e: 'company-deleted', companyId: string | number): void
}

const emit = defineEmits<Emits>()

// Store and composables
const companyStore = useCompanyStore()
const toast = useToast()

// Reactive data
const editForm = ref()
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties for dialog state
const isEditDialogOpen = computed({
  get: () => props.isEditDialogOpen,
  set: (value) => emit('update:isEditDialogOpen', value)
})

const isDeleteDialogOpen = computed({
  get: () => props.isDeleteDialogOpen,
  set: (value) => emit('update:isDeleteDialogOpen', value)
})

// Form data
const editedCompany = ref<Partial<Company>>({
  name: '',
  description: '',
  phone: '',
  website: '',
  address: ''
})

// Computed properties
const isNewCompany = computed(() => !props.company?.id)

const isFormValid = computed(() => {
  return editedCompany.value.name && editedCompany.value.name.trim().length > 0
})

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required',
  phone: (value: string) => {
    if (!value) return true
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value) || 'Please enter a valid phone number'
  },
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL (including http:// or https://)'
    }
  }
}

// Watch for company changes to update form
watch(() => props.company, (newCompany) => {
  if (newCompany) {
    editedCompany.value = {
      name: newCompany.name || '',
      description: newCompany.description || '',
      phone: newCompany.phone || '',
      website: newCompany.website || '',
      address: newCompany.address || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for edit dialog opening to reset error
watch(() => props.isEditDialogOpen, (isOpen) => {
  if (isOpen) {
    error.value = null
  }
})

// Methods
const resetForm = () => {
  editedCompany.value = {
    name: '',
    description: '',
    phone: '',
    website: '',
    address: ''
  }
  error.value = null
}

const closeEditDialog = () => {
  emit('update:isEditDialogOpen', false)
  resetForm()
}

const closeDeleteDialog = () => {
  emit('update:isDeleteDialogOpen', false)
}

const saveCompany = async () => {
  if (!editForm.value) return

  const { valid } = await editForm.value.validate()
  if (!valid) return

  loading.value = true
  error.value = null

  try {
    let savedCompany: Company

    if (isNewCompany.value) {
      // Create new company
      savedCompany = await companyStore.createItem(editedCompany.value)
      toast.success('Company created successfully')
    } else {
      // Update existing company
      const companyToUpdate = {
        ...editedCompany.value,
        id: props.company!.id,
        '@id': props.company!['@id']
      }
      savedCompany = await companyStore.updateItem(companyToUpdate)
      toast.success('Company updated successfully')
    }

    emit('company-updated', savedCompany)
    closeEditDialog()
  } catch (err: any) {
    error.value = err.message || 'An error occurred while saving the company'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const confirmDelete = async () => {
  if (!props.company?.id) return

  loading.value = true

  try {
    await companyStore.deleteItem(props.company.id)
    toast.success('Company deleted successfully')
    emit('company-deleted', props.company.id)
    closeDeleteDialog()
  } catch (err: any) {
    const errorMessage = err.message || 'An error occurred while deleting the company'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Card Styling */
.edit-company-card,
.delete-company-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.edit-card-title,
.delete-card-title {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 24px !important;
}

.delete-card-title {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.card-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

/* Content Styling */
.edit-card-content,
.delete-card-content {
  padding: 24px !important;
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.section-title {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.9rem;
}

:deep(.form-field) {
  margin-bottom: 16px;
}

:deep(.form-field:last-child) {
  margin-bottom: 0;
}

/* Alert Styling */
.alert-content {
  line-height: 1.5;
}

.delete-confirmation-text {
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* Actions Styling */
.edit-card-actions,
.delete-card-actions {
  padding: 16px 24px 24px !important;
  background: rgba(0, 0, 0, 0.02);
}

.action-btn-cancel {
  margin-right: 12px;
}

.action-btn-save,
.action-btn-delete {
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .edit-card-title,
  .delete-card-title {
    padding: 16px !important;
  }
  
  .edit-card-content,
  .delete-card-content {
    padding: 16px !important;
  }
  
  .edit-card-actions,
  .delete-card-actions {
    padding: 12px 16px 16px !important;
  }
  
  .title-content {
    gap: 12px;
  }
}
</style>
