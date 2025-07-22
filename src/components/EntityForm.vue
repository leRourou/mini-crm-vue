<template>
  <div class="entity-form">
    <!-- Entity Display Section -->
    <div v-if="!form.isCreateMode.value" class="entity-header">
      <div class="entity-avatar">
        <v-avatar size="64" :color="form.config.entityColor || 'primary'">
          <v-icon size="32" color="white">{{ form.config.entityIcon }}</v-icon>
        </v-avatar>
      </div>
      <div class="entity-info">
        <h2 class="entity-name">{{ form.entityTitle.value }}</h2>
        <div class="entity-meta">
          <v-chip size="small" :color="form.config.entityColor || 'primary'" variant="tonal">
            <v-icon start size="12">{{ form.config.entityIcon }}</v-icon>
            {{ form.config.entityName }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="!form.isCreateMode.value" class="entity-actions">
      <div class="actions-header">
        <v-icon size="16" :color="form.config.entityColor || 'primary'">mdi-cog</v-icon>
        <span class="actions-title">Actions</span>
      </div>
      <div class="actions-buttons">
        <v-btn
          :color="form.config.entityColor || 'primary'"
          variant="tonal"
          size="small"
          prepend-icon="mdi-pencil-outline"
          @click="form.isOpen.value = true"
          class="action-btn"
        >
          Edit
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          prepend-icon="mdi-delete-outline"
          @click="form.isDeleteDialogOpen.value = true"
          class="action-btn"
        >
          Delete
        </v-btn>
      </div>
    </div>

    <!-- Entity Details Display (when not editing) -->
    <div v-if="!form.isCreateMode.value" class="entity-details">
      <div
        v-for="section in form.config.sections"
        :key="section.title"
        class="info-section"
      >
        <div class="section-header">
          <v-icon :color="section.color || 'primary'" size="20">{{ section.icon }}</v-icon>
          <span class="section-title">{{ section.title }}</span>
        </div>
        <div class="section-content">
          <div
            v-for="field in section.fields"
            :key="String(field.key)"
            v-show="isFieldVisible(field)"
            class="info-row"
          >
            <div class="info-label">{{ field.label }}</div>
            <div class="info-value">
              <component
                :is="getDisplayComponent(field)"
                :field="field"
                :value="getFieldValue(field.key)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="form.isOpen.value" max-width="600px" persistent>
      <v-card class="entity-form-card">
        <v-card-title class="form-card-title">
          <div class="title-content">
            <v-icon :color="form.config.entityColor || 'primary'" size="28" class="title-icon">
              {{ form.config.entityIcon }}
            </v-icon>
            <div>
              <h3 class="card-title">{{ form.formTitle.value }}</h3>
              <p class="card-subtitle">
                {{ form.isCreateMode.value ? 'Create new' : 'Update' }} {{ form.config.entityName.toLowerCase() }} information
              </p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="form-card-content">
          <v-form @submit.prevent="form.save">
            <!-- Error Alert -->
            <v-alert
              v-if="Object.keys(form.errors).length > 0"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              Please fix the following errors:
              <ul>
                <li v-for="(error, field) in form.errors" :key="field">
                  {{ error }}
                </li>
              </ul>
            </v-alert>

            <!-- Form Sections -->
            <div
              v-for="section in form.config.sections"
              :key="section.title"
              class="form-section"
            >
              <div class="section-header">
                <v-icon :color="section.color || 'primary'" size="20">{{ section.icon }}</v-icon>
                <span class="section-title">{{ section.title }}</span>
              </div>
              
              <v-row no-gutters>
                <v-col
                  v-for="field in section.fields"
                  :key="String(field.key)"
                  v-show="isFieldVisible(field)"
                  :cols="getFieldCols(field)"
                  :class="getFieldClasses(field)"
                >
                  <component
                    :is="getFieldComponent(field)"
                    v-bind="getFieldProps(field)"
                    v-model="form.formData.value[field.key]"
                    :error-messages="form.errors[String(field.key)]"
                    class="form-field"
                  >
                    <!-- Custom selection display for relationship fields -->
                    <template v-if="field.relationship" #selection="{ item }">
                      {{ getRelationshipDisplayValue(field, item.value) }}
                    </template>
                  </component>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="form-card-actions">
          <v-spacer />
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="form.close"
            :disabled="form.loading.value"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            :color="form.config.entityColor || 'primary'" 
            variant="elevated" 
            @click="form.save"
            :loading="form.loading.value"
            class="save-btn"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="form.isDeleteDialogOpen.value" max-width="400px">
      <v-card class="delete-confirmation-card">
        <v-card-title class="delete-card-title">
          <div class="title-content">
            <v-icon color="error" size="28" class="title-icon">mdi-delete-alert</v-icon>
            <div>
              <h3 class="card-title">Delete {{ form.config.entityName }}</h3>
              <p class="card-subtitle">This action cannot be undone</p>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="delete-card-content">
          <v-alert type="warning" variant="tonal" class="mb-4">
            Are you sure you want to delete this {{ form.config.entityName.toLowerCase() }}?
          </v-alert>
          
          <div class="entity-info">
            <strong>{{ form.entityTitle.value }}</strong>
          </div>
        </v-card-text>
        
        <v-card-actions class="delete-card-actions">
          <v-spacer />
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="form.isDeleteDialogOpen.value = false"
            :disabled="form.loading.value"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated" 
            @click="form.deleteEntity"
            :loading="form.loading.value"
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

<script setup lang="ts" generic="T extends { id?: number | string; '@id'?: string }">
import type { EntityFormField } from '../composables/useEntityForm'

interface Props {
  form: ReturnType<typeof import('../composables/useEntityForm').useEntityForm<T>>
}

const props = defineProps<Props>()

// Field visibility
const isFieldVisible = (field: EntityFormField) => {
  if (typeof field.visible === 'function') {
    return field.visible()
  }
  return field.visible !== false
}

// Get field value for display
const getFieldValue = (key: keyof T) => {
  const entity = props.form.entity.value
  if (!entity) return 'N/A'
  
  const entityRecord = entity as Record<string, unknown>
  const value = entityRecord[String(key)]
  
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  
  if (typeof value === 'object' && value !== null) {
    const objectValue = value as Record<string, unknown>
    // Handle relationship objects
    if ('name' in objectValue && typeof objectValue.name === 'string') {
      return objectValue.name
    }
    if ('title' in objectValue && typeof objectValue.title === 'string') {
      return objectValue.title
    }
    if ('firstname' in objectValue && 'lastname' in objectValue) {
      const firstName = typeof objectValue.firstname === 'string' ? objectValue.firstname : ''
      const lastName = typeof objectValue.lastname === 'string' ? objectValue.lastname : ''
      return `${firstName} ${lastName}`.trim()
    }
  }
  
  return String(value)
}

// Get display component
const getDisplayComponent = (_field: EntityFormField) => {
  // For now, all fields display as divs
  // In the future, we could add specialized display components
  return 'div'
}

// Get form field component
const getFieldComponent = (field: EntityFormField) => {
  switch (field.type) {
    case 'textarea':
      return 'v-textarea'
    case 'select':
      return 'v-select'
    case 'number':
      return 'v-text-field'
    default:
      return 'v-text-field'
  }
}

// Get field properties
const getFieldProps = (field: EntityFormField) => {
  const fieldProps: Record<string, unknown> = {
    label: field.label,
    variant: 'outlined',
    density: 'compact',
    disabled: props.form.loading.value || (typeof field.disabled === 'function' ? field.disabled() : field.disabled),
    placeholder: field.placeholder,
    clearable: field.clearable
  }
  
  if (field.icon) {
    fieldProps['prepend-inner-icon'] = field.icon
  }
  
  if (field.type === 'textarea') {
    fieldProps.rows = field.rows || 3
  }
  
  if (field.type === 'select') {
    if (field.relationship) {
      // Get items from store (handle both reactive and computed refs)
      const storeItems = 'value' in field.relationship.store.items
        ? field.relationship.store.items.value
        : field.relationship.store.items
      fieldProps.items = Array.isArray(storeItems) ? storeItems : []
      
      // Handle display field
      if (typeof field.relationship.displayField === 'function') {
        fieldProps['item-title'] = field.relationship.displayField
      } else {
        fieldProps['item-title'] = field.relationship.displayField || 'name'
      }
      
      fieldProps['return-object'] = true
      
      // Get loading state (handle both reactive and computed refs)
      const storeLoading = 'value' in field.relationship.store.loading
        ? field.relationship.store.loading.value
        : field.relationship.store.loading
      fieldProps.loading = storeLoading || props.form.loading.value
      
    } else if (field.options) {
      fieldProps.items = typeof field.options === 'function' ? [] : field.options
      fieldProps['item-title'] = field.itemTitle || 'label'
      fieldProps['item-value'] = 'value'
    }
    
    if (field.multiple) {
      fieldProps.multiple = true
      fieldProps.chips = true
    }
  }
  
  return fieldProps
}

// Get field column span
const getFieldCols = (field: EntityFormField) => {
  // Default field spans
  switch (field.type) {
    case 'textarea':
      return 12
    case 'select':
      return field.multiple ? 12 : 6
    default:
      return 6
  }
}

// Get relationship display value for selection template
const getRelationshipDisplayValue = (field: EntityFormField, item: Record<string, unknown>) => {
  if (!field.relationship || !item) return ''
  
  if (typeof field.relationship.displayField === 'function') {
    return field.relationship.displayField(item)
  }
  
  const fieldName = field.relationship.displayField || 'name'
  return String(item[fieldName] || item.name || item.title || `#${item['@id'] || item.id}`)
}

// Get field CSS classes
const getFieldClasses = (_field: EntityFormField) => {
  return {
    'pe-md-2': true, // Right padding on medium screens and up
    'ps-md-2': true  // Left padding on medium screens and up
  }
}
</script>

<style scoped>
.entity-form {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.entity-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.entity-avatar {
  position: relative;
}

.entity-info {
  flex: 1;
}

.entity-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.entity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.entity-actions {
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

.entity-details {
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

.entity-form-card {
  border-radius: 16px;
  overflow: hidden;
}

.form-card-title {
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

.form-card-content {
  padding: 24px;
  background: #fafafa;
  max-height: 70vh;
  overflow-y: auto;
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

.form-card-actions {
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

@media (max-width: 768px) {
  .entity-form {
    padding: 20px;
  }
  
  .entity-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .entity-name {
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
  .entity-form {
    padding: 16px;
  }
  
  .entity-name {
    font-size: 18px;
  }
  
  .actions-buttons {
    flex-direction: column;
  }
  
  .section-content {
    gap: 8px;
  }
  
  .form-card-title {
    padding: 20px;
  }
  
  .form-card-content {
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