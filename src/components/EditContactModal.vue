<template>
  <div class="edit-contact-modal">
    <!-- Contact Display Section -->
    <div class="contact-header">
      <div class="contact-avatar">
        <v-avatar size="64" color="primary">
          <v-icon size="32" color="white">mdi-account</v-icon>
        </v-avatar>
      </div>
      <div class="contact-info">
        <h2 class="contact-name">{{ getContactTitle() }}</h2>
        <div class="contact-meta">
          <v-chip size="small" color="status-new" variant="tonal">
            <v-icon start size="12">mdi-account</v-icon>
            Contact
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="contact-actions">
      <div class="actions-header">
        <v-icon size="16" color="primary">mdi-cog</v-icon>
        <span class="actions-title">Actions</span>
      </div>
      <div class="actions-buttons">
        <v-btn
          color="primary"
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

    <!-- Contact Details Display -->
    <div class="contact-details">
      <div class="info-section">
        <div class="section-header">
          <v-icon color="primary" size="20">mdi-account</v-icon>
          <span class="section-title">Personal Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">First Name</div>
            <div class="info-value">{{ contact?.firstname || 'N/A' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Last Name</div>
            <div class="info-value">{{ contact?.lastname || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <v-icon color="success" size="20">mdi-email</v-icon>
          <span class="section-title">Contact Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Email</div>
            <div class="info-value">{{ contact?.email || 'N/A' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone</div>
            <div class="info-value">{{ contact?.phone || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <v-icon color="info" size="20">mdi-office-building</v-icon>
          <span class="section-title">Company Information</span>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-label">Company</div>
            <div class="info-value">
              <div class="company-display">
                <v-icon icon="mdi-office-building" size="16" class="me-2" color="info"></v-icon>
                {{ getCompanyName(contact?.company) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="edit-contact-card">
        <v-card-title class="edit-card-title">
          <div class="title-content">
            <v-icon color="primary" size="28" class="title-icon">mdi-account</v-icon>
            <div>
              <h3 class="card-title">{{ isNewContact ? 'Create' : 'Edit' }} Contact</h3>
              <p class="card-subtitle">{{ isNewContact ? 'Create new' : 'Update' }} contact information</p>
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
              @click:close="error = null"
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
                    :item-title="(item) => getCompanyDisplayName(item)"
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
                      {{item.title}}
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
            @click="closeEditDialog"
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
            @click="showDeleteDialog = false"
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
import type { Contact } from '../types/Contact'
import type { Company } from '../types/Company'
import { useToast } from '../composables/useToast'
import { useValidation } from '../composables/useValidation'
import { useCompanyStore } from '../stores/companies'

const props = defineProps<{
  contact: Contact | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-contact': [contact: Contact | null]
  'create-contact': [contact: Contact]
  'delete-contact': [contact: Contact]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editedContact = ref<Partial<Contact>>({})
const isCreateMode = ref(false)

const toast = useToast()
const { rules } = useValidation()
const companyStore = useCompanyStore()

const loading = computed({
  get: () => props.loading || false,
  set: (value: boolean) => emit('update:loading', value)
})

const error = computed({
  get: () => props.error || null,
  set: (value: string | null) => emit('update:error', value)
})

const isNewContact = computed(() => {
  return isCreateMode.value || props.contact?.id === 0 || !props.contact?.id
})

const getContactTitle = (): string => {
  if (props.contact?.firstname || props.contact?.lastname) {
    const firstName = props.contact.firstname || ''
    const lastName = props.contact.lastname || ''
    return `${firstName} ${lastName}`.trim()
  }
  if (props.contact?.email) {
    return props.contact.email
  }
  return `Contact #${props.contact?.id || 'New'}`
}

const getCompanyName = (company: Company | null | undefined): string => {
  return company?.name || 'No company assigned'
}

const getCompanyDisplayName = (company: Company | null | undefined): string => {
  if (!company) return 'No company assigned'
  return company.name?.trim() || `Company #${company.id || 'Unknown'}`
}

const openEditDialog = async () => {
  isCreateMode.value = false
  await companyStore.fetchAllItems()
  
  // Use fresh contact data which already has resolved relationships
  editedContact.value = { 
    ...props.contact
  }
  showEditDialog.value = true
}

const openCreateDialog = async () => {
  isCreateMode.value = true
  editedContact.value = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    company: null
  }
  await companyStore.fetchAllItems()
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editedContact.value = {}
  if (isCreateMode.value) {
    isCreateMode.value = false
  }
}

const convertContactToApiFormat = (contact: Partial<Contact>, isCreate = false) => {
  const apiContact = { ...contact }
  
  // Convert company object to URI if needed
  if (apiContact.company && typeof apiContact.company === 'object') {
    const company = apiContact.company as Company
    if (company['@id']) {
      apiContact.company = company['@id'] as any
    } else if (company.id) {
      apiContact.company = `/api/companies/${company.id}` as any
    }
  }
  
  // Clean up fields for API - preserve ID for updates
  if (isCreate) {
    delete apiContact.id
    delete apiContact['@id']
  }
  delete (apiContact as any)['@type']
  delete apiContact.createdAt
  delete apiContact.updatedAt
  
  return apiContact
}

const saveContact = async () => {
  try {
    const actionText = isCreateMode.value ? 'Creating' : 'Updating'
    const successText = isCreateMode.value ? 'created' : 'updated'
    
    toast.loading(`${actionText} contact...`)
    
    const contactToSave = convertContactToApiFormat(editedContact.value, isCreateMode.value)
    
    if (isCreateMode.value) {
      emit('create-contact', contactToSave as Contact)
    } else {
      emit('update-contact', contactToSave as Contact)
    }
    
    toast.success(`Contact ${successText} successfully!`)
    closeEditDialog()
  } catch (error) {
    const actionText = isCreateMode.value ? 'create' : 'update'
    toast.errorFromException(error, `Failed to ${actionText} contact`)
  }
}

const deleteContact = async () => {
  try {
    toast.loading('Deleting contact...')
    
    if (props.contact) {
      emit('delete-contact', props.contact)
    }
    
    toast.success('Contact deleted successfully!')
    showDeleteDialog.value = false
  } catch (error) {
    toast.errorFromException(error, 'Failed to delete contact')
  }
}

watch(() => props.error, (newError) => {
  if (newError) {
    toast.error(newError)
  }
})

onMounted(() => {
  // Pre-load companies for better UX
  companyStore.fetchAllItems()
})

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>

<style scoped>
/* Use the same styling as other edit modals with contact-specific colors */
.edit-contact-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.contact-avatar {
  position: relative;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.contact-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-actions {
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

.contact-details {
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

.company-display {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-weight: 500;
}

.edit-contact-card {
  border-radius: 16px;
  overflow: hidden;
}

.edit-card-title {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 24px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  background: rgba(102, 126, 234, 0.1);
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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
  .edit-contact-modal {
    padding: 20px;
  }
  
  .contact-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .contact-name {
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
  .edit-contact-modal {
    padding: 16px;
  }
  
  .contact-name {
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