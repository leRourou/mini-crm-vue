<template>
  <div>
    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="edit-contact-card">
        <v-card-title class="edit-card-title">
          <div class="title-content">
            <v-icon color="primary" size="28" class="title-icon">mdi-account</v-icon>
            <div>
              <h3 class="card-title">{{ isCreateMode ? 'Create' : 'Edit' }} Contact</h3>
              <p class="card-subtitle">{{ isCreateMode ? 'Create new' : 'Update' }} contact information</p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="edit-card-content">
          <v-form ref="editForm" @submit.prevent="saveContact">
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="clearError"
            >
              {{ error }}
            </v-alert>

            <!-- Personal Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="primary" size="20">mdi-account</v-icon>
                <span class="section-title">Personal Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12" md="6" class="pe-md-2">
                  <v-text-field
                    v-model="editedContact.firstname"
                    label="First Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12" md="6" class="ps-md-2">
                  <v-text-field
                    v-model="editedContact.lastname"
                    label="Last Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
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
                <v-icon color="success" size="20">mdi-email</v-icon>
                <span class="section-title">Contact Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedContact.email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.email]"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedContact.phone"
                    label="Phone Number"
                    type="tel"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    :disabled="loading"
                    density="compact"
                    class="form-field"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Company Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon color="info" size="20">mdi-office-building</v-icon>
                <span class="section-title">Company Information</span>
              </div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-select
                    v-model="editedContact.company"
                    :items="companyStore.items"
                    :item-title="getCompanyDisplayName"
                    return-object
                    label="Company"
                    variant="outlined"
                    prepend-inner-icon="mdi-office-building"
                    :disabled="loading"
                    :loading="companyStore.loading"
                    density="compact"
                    class="form-field"
                    clearable
                  >
                    <template #selection="{ item }">
                      {{ getCompanyDisplayName(item.raw) }}
                    </template>
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
            @click="closeDialog"
            :disabled="loading"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            variant="elevated" 
            @click="saveContact"
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
              <h3 class="card-title">Delete Contact</h3>
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
            Are you sure you want to delete this contact?
          </v-alert>
          
          <div class="entity-info">
            <strong>{{ getContactTitle() }}</strong>
          </div>
        </v-card-text>
        
        <v-card-actions class="delete-card-actions">
          <v-spacer />
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="closeDeleteDialog"
            :disabled="loading"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated" 
            @click="deleteContact"
            :loading="loading"
            class="delete-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import type { Contact } from '../types/Contact'
import type { Company } from '../types/Company'
import { useCompanyStore } from '../stores/companies'
import { useValidation } from '../composables/useValidation'
import { useToast } from '../composables/useToast'

interface Props {
  contact?: Contact | null
  loading?: boolean
  error?: string | null
  modelValue?: boolean
  isCreateMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  modelValue: false,
  isCreateMode: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'create-contact': [contact: Contact]
  'update-contact': [contact: Contact]
  'delete-contact': [contact: Contact]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

// Internal state
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editedContact = ref<Partial<Contact>>({})
const editForm = ref<any>(null)

// Composables
const toast = useToast()
const { rules } = useValidation()
const companyStore = useCompanyStore()

// Computed properties
const loading = computed({
  get: () => props.loading || false,
  set: (value: boolean) => emit('update:loading', value)
})

const error = computed({
  get: () => props.error || null,
  set: (value: string | null) => emit('update:error', value)
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  showEditDialog.value = newValue
}, { immediate: true })

watch(() => showEditDialog.value, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.contact, (newContact) => {
  if (newContact) {
    editedContact.value = { ...newContact }
  } else {
    resetForm()
  }
}, { immediate: true })

/**
 * Dialog control methods following SOLID principles
 * Single Responsibility: Handle dialog state
 */
const openEditDialog = async () => {
  await companyStore.fetchAllItems()
  if (props.contact) {
    editedContact.value = { ...props.contact }
  } else {
    resetForm()
  }
  showEditDialog.value = true
}

const closeDialog = () => {
  showEditDialog.value = false
  resetForm()
}

const openDeleteDialog = () => {
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
}

/**
 * Form management following DRY principles
 */
const resetForm = () => {
  editedContact.value = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    company: null
  }
  if (editForm.value) {
    editForm.value.resetValidation()
  }
}

const clearError = () => {
  error.value = null
}

/**
 * Business logic methods following SOLID principles
 */
const getContactTitle = (): string => {
  if (!props.contact) return 'Unknown Contact'
  
  const { firstname, lastname, email } = props.contact
  if (firstname && lastname) {
    return `${firstname} ${lastname}`
  }
  if (firstname) return firstname
  if (lastname) return lastname
  if (email) return email
  return `Contact #${props.contact.id || 'New'}`
}

const getCompanyDisplayName = (company: Company | null | undefined): string => {
  if (!company) return 'No company assigned'
  return company.name?.trim() || `Company #${company.id || 'Unknown'}`
}

/**
 * Convert contact data for API submission
 * Following DRY principles - centralized data transformation
 */
const convertContactToApiFormat = (contact: Partial<Contact>, isCreate: boolean = false) => {
  const apiContact: any = { ...contact }
  
  // Handle company relationship
  if (contact.company && typeof contact.company === 'object') {
    apiContact.company = contact.company['@id'] || `/api/companies/${contact.company.id}`
  }
  
  // Clean up fields for API
  if (isCreate) {
    delete apiContact.id
    delete apiContact['@id']
    delete apiContact['@type']
  }
  
  delete apiContact.createdAt
  delete apiContact.updatedAt
  
  return apiContact
}

/**
 * Save contact handler following SOLID principles
 * Single Responsibility: Handle contact saving
 */
const saveContact = async () => {
  try {
    const actionText = props.isCreateMode ? 'Creating' : 'Updating'
    const successText = props.isCreateMode ? 'created' : 'updated'
    
    toast.loading(`${actionText} contact...`)
    
    const contactToSave = convertContactToApiFormat(editedContact.value, props.isCreateMode)
    
    if (props.isCreateMode) {
      emit('create-contact', contactToSave as Contact)
    } else {
      emit('update-contact', contactToSave as Contact)
    }
    
    toast.success(`Contact ${successText} successfully!`)
    closeDialog()
  } catch (error) {
    const actionText = props.isCreateMode ? 'create' : 'update'
    toast.errorFromException(error, `Failed to ${actionText} contact`)
  }
}

/**
 * Delete contact handler following SOLID principles
 * Single Responsibility: Handle contact deletion
 */
const deleteContact = async () => {
  try {
    toast.loading('Deleting contact...')
    
    if (props.contact) {
      emit('delete-contact', props.contact)
    }
    
    toast.success('Contact deleted successfully!')
    closeDeleteDialog()
  } catch (error) {
    toast.errorFromException(error, 'Failed to delete contact')
  }
}

// Watch for errors and display them
watch(() => props.error, (newError) => {
  if (newError) {
    toast.error(newError)
  }
})

// Pre-load companies on mount for better UX
onMounted(() => {
  companyStore.fetchAllItems()
})

// Expose methods for parent component access
defineExpose({
  openEditDialog,
  openDeleteDialog,
  closeDialog,
  closeDeleteDialog
})
</script>

<style scoped>
.edit-contact-card {
  border-radius: 16px;
  overflow: hidden;
}

.edit-card-title {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.title-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  background: rgba(25, 118, 210, 0.1);
  padding: 0.5rem;
  border-radius: 12px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

.card-subtitle {
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.edit-card-content {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.87);
}

.form-field {
  margin-bottom: 1rem;
}

.edit-card-actions {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  text-transform: none;
}

.save-btn {
  text-transform: none;
  font-weight: 600;
}

.delete-confirmation-card {
  border-radius: 16px;
  overflow: hidden;
}

.delete-card-title {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.delete-card-content {
  padding: 1.5rem;
}

.entity-info {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  text-align: center;
}

.delete-card-actions {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.delete-btn {
  text-transform: none;
  font-weight: 600;
}

@media (max-width: 768px) {
  .edit-card-content,
  .delete-card-content {
    padding: 1rem;
  }
  
  .title-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>
