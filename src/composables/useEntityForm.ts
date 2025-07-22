import { ref, computed, reactive, watch, type ComputedRef } from 'vue'
import { useToast } from './useToast'
import { useValidation } from './useValidation'
import type { ValidationRule } from './useValidation'
import type { BaseEntity } from '../types/Store'

export interface EntityFormField<T = Record<string, unknown>> {
  key: keyof T
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'date' | 'select' | 'number'
  label: string
  rules?: ValidationRule[]
  required?: boolean
  placeholder?: string
  icon?: string
  options?: Array<{ label: string; value: unknown }> | (() => Promise<Array<{ label: string; value: unknown }>>)
  itemTitle?: string | ((item: Record<string, unknown>) => string)
  returnObject?: boolean
  multiple?: boolean
  clearable?: boolean
  rows?: number
  disabled?: boolean | (() => boolean)
  visible?: boolean | (() => boolean)
  relationship?: {
    store: {
      fetchItems: () => Promise<void>
      items: { value: Record<string, unknown>[] }
      loading: { value: boolean }
    }
    displayField: string | ((item: Record<string, unknown>) => string)
    valueField?: string
  }
}

export interface EntityFormSection<T> {
  title: string
  icon: string
  color?: string
  fields: EntityFormField<T>[]
}

export interface EntityFormConfig<T> {
  sections: EntityFormSection<T>[]
  entityName: string
  entityIcon: string
  entityColor?: string
}

export interface UseEntityFormOptions<T> {
  config: EntityFormConfig<T>
  store: {
    createItem: (item: Partial<T> | Omit<T, 'id'>) => Promise<T | undefined>
    updateItem: (item: T) => Promise<T | undefined>
    deleteItem: (id: string | number) => Promise<void>
  }
  onSave?: (entity: T, isCreate: boolean) => Promise<T>
  onDelete?: (entity: T) => Promise<void>
  onCreate?: (entity: Partial<T>) => Partial<T>
  onEdit?: (entity: T) => Partial<T>
  beforeSave?: (entity: Partial<T>, isCreate: boolean) => Partial<T>
  afterSave?: (entity: T, isCreate: boolean) => void
  validateBeforeSave?: (entity: Partial<T>) => string | null
}

export function useEntityForm<T extends { id?: number | string; '@id'?: string }>(
  options: UseEntityFormOptions<T>
) {
  const {
    config,
    store,
    onSave,
    onDelete,
    onCreate,
    onEdit,
    beforeSave,
    afterSave,
    validateBeforeSave
  } = options

  const toast = useToast()
  const { rules, validateForm } = useValidation()

  // Form state
  const isOpen = ref(false)
  const isEditMode = ref(false)
  const isDeleteDialogOpen = ref(false)
  const entity = ref<T | null>(null)
  const formData = ref<Partial<T>>({})
  const errors = reactive<Record<string, string>>({})
  const loading = ref(false)

  // Computed properties
  const isCreateMode = computed(() => !isEditMode.value)
  const formTitle = computed(() => 
    `${isCreateMode.value ? 'Create' : 'Edit'} ${config.entityName}`
  )
  
  const entityTitle = computed(() => {
    if (!entity.value) return `New ${config.entityName}`
    
    // Try common display patterns
    const commonFields = ['name', 'title', 'description', 'firstname', 'lastname', 'email'] as const
    const entityRecord = entity.value as Record<string, unknown>
    
    for (const field of commonFields) {
      const value = entityRecord[field]
      if (value && typeof value === 'string' && value.trim()) {
        return value.length > 50 ? value.substring(0, 50) + '...' : value
      }
    }
    
    // Handle compound names (firstname + lastname)
    const firstName = entityRecord.firstname
    const lastName = entityRecord.lastname
    if ((firstName && typeof firstName === 'string') || (lastName && typeof lastName === 'string')) {
      const first = (typeof firstName === 'string' ? firstName : '').trim()
      const last = (typeof lastName === 'string' ? lastName : '').trim()
      const fullName = `${first} ${last}`.trim()
      if (fullName) return fullName
    }
    
    return `${config.entityName} #${entity.value.id || 'New'}`
  })

  // Load related data for relationship fields
  const loadRelationships = async () => {
    loading.value = true
    const relationshipPromises: Promise<void>[] = []
    
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (field.relationship?.store) {
          const promise = field.relationship.store.fetchAllItems().catch((error) => {
            console.warn(`Failed to load relationship data for ${String(field.key)}:`, error)
          })
          relationshipPromises.push(promise)
        }
      }
    }
    
    // Wait for all relationship data to load
    await Promise.all(relationshipPromises)
    loading.value = false
  }

  // Resolve relationships for editing - match entities from loaded store data
  const resolveRelationshipsForEditing = async (data: Partial<T>): Promise<Partial<T>> => {
    const resolvedData = { ...data }
    const resolvedDataRecord = resolvedData as Record<string, unknown>
    
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (field.relationship?.store) {
          const fieldKey = String(field.key)
          const relationshipValue = resolvedDataRecord[fieldKey]
          
          if (relationshipValue && typeof relationshipValue === 'object' && relationshipValue !== null) {
            const relationObject = relationshipValue as Record<string, unknown>
            const relationId = relationObject.id || relationObject['@id']
            
            if (relationId) {
              // Try to find the matching entity in the loaded store data
              const storeItems = 'value' in field.relationship.store.items 
                ? field.relationship.store.items.value 
                : (field.relationship.store.items as ComputedRef<BaseEntity[]>).value
                
              const matchingEntity = storeItems.find(item => {
                const itemId = item['@id'] || item.id;
                if (typeof relationId === 'string' && relationId.includes('/api/')) {
                  return itemId === relationId || 
                         String(itemId).split('/').pop() === relationId.split('/').pop();
                } else {
                  return String(itemId) === String(relationId);
                }
              })
              
              if (matchingEntity) {
                resolvedDataRecord[fieldKey] = matchingEntity
              }
            }
          }
        }
      }
    }
    
    return resolvedData
  }

  // Initialize form data
  const initializeForm = (data?: Partial<T>) => {
    const initialData = data || {}
    
    // Set default values for all fields
    for (const section of config.sections) {
      for (const field of section.fields) {
        const key = String(field.key)
        const initialDataRecord = initialData as Record<string, unknown>
        if (!(key in initialDataRecord)) {
          switch (field.type) {
            case 'select':
              initialDataRecord[key] = field.multiple ? [] : null
              break
            case 'number':
              initialDataRecord[key] = 0
              break
            default:
              initialDataRecord[key] = ''
              break
          }
        }
      }
    }
    
    formData.value = initialData
  }

  // Validate form
  const validate = (): boolean => {
    const schema: Record<string, ValidationRule[]> = {}
    
    for (const section of config.sections) {
      for (const field of section.fields) {
        const fieldRules: ValidationRule[] = []
        
        if (field.required) {
          fieldRules.push(rules.required)
        }
        
        if (field.rules) {
          fieldRules.push(...field.rules)
        }
        
        if (fieldRules.length > 0) {
          schema[String(field.key)] = fieldRules
        }
      }
    }
    
    const validation = validateForm(formData.value, schema)
    
    // Clear previous errors
    Object.keys(errors).forEach(key => delete errors[key])
    
    // Set new errors
    Object.entries(validation.errors).forEach(([key, error]) => {
      errors[key] = error
    })
    
    return validation.isValid
  }

  // Convert to API format
  const convertToApiFormat = (data: Partial<T>, isCreate: boolean = false): Partial<T> => {
    const apiData = { ...data }
    const apiDataRecord = apiData as Record<string, unknown>
    
    // Handle relationships
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (field.relationship) {
          const key = String(field.key)
          const value = apiDataRecord[key]
          
          if (value && typeof value === 'object' && value !== null) {
            const relationObject = value as Record<string, unknown>
            if (relationObject['@id']) {
              apiDataRecord[key] = relationObject['@id']
            } else if (relationObject.id) {
              // We'll assume the endpoint can be derived from the store
              // In a real implementation, you might want to add endpoint info to the store interface
              apiDataRecord[key] = `/api/items/${relationObject.id}`
            }
          }
        }
      }
    }
    
    // Clean up API fields
    if (isCreate) {
      delete apiDataRecord.id
      delete apiDataRecord['@id']
    }
    delete apiDataRecord['@type']
    delete apiDataRecord.createdAt
    delete apiDataRecord.updatedAt
    
    return apiData
  }

  // Open for creation
  const openCreate = async () => {
    await loadRelationships()
    entity.value = null
    isEditMode.value = false
    
    const initialData = onCreate ? onCreate({}) : {}
    initializeForm(initialData)
    
    isOpen.value = true
  }

  // Open for editing
  const openEdit = async (entityToEdit: T) => {
    await loadRelationships()
    entity.value = entityToEdit
    isEditMode.value = true
    
    // Process edit data and ensure relationships are properly resolved
    let editData = onEdit ? onEdit(entityToEdit) : { ...entityToEdit }
    editData = await resolveRelationshipsForEditing(editData)
    initializeForm(editData)
    
    isOpen.value = true
  }

  // Close form
  const close = () => {
    isOpen.value = false
    formData.value = {}
    Object.keys(errors).forEach(key => delete errors[key])
    entity.value = null
  }

  // Save entity
  const save = async (): Promise<boolean> => {
    try {
      loading.value = true
      
      // Validate form
      if (!validate()) {
        toast.error('Please fix the form errors')
        return false
      }
      
      // Custom validation
      if (validateBeforeSave) {
        const validationError = validateBeforeSave(formData.value)
        if (validationError) {
          toast.error(validationError)
          return false
        }
      }
      
      // Process data before save
      let processedData = beforeSave ? beforeSave(formData.value, isCreateMode.value) : formData.value
      processedData = convertToApiFormat(processedData, isCreateMode.value)
      
      // Save entity
      let savedEntity: T | undefined
      if (onSave) {
        savedEntity = await onSave(processedData as T, isCreateMode.value)
      } else {
        if (isCreateMode.value) {
          savedEntity = await store.createItem(processedData)
        } else {
          savedEntity = await store.updateItem({ ...processedData, id: entity.value!.id } as T)
        }
      }
      
      if (!savedEntity) {
        throw new Error('Failed to save entity')
      }
      
      toast.success(`${config.entityName} ${isCreateMode.value ? 'created' : 'updated'} successfully!`)
      
      // After save callback
      if (afterSave) {
        afterSave(savedEntity, isCreateMode.value)
      }
      
      close()
      return true
      
    } catch (error) {
      console.error(`Error saving ${config.entityName}:`, error)
      const action = isCreateMode.value ? 'create' : 'update'
      toast.errorFromException(error, `Failed to ${action} ${config.entityName}`)
      return false
    } finally {
      loading.value = false
    }
  }

  // Delete entity
  const deleteEntity = async (): Promise<boolean> => {
    if (!entity.value) return false
    
    try {
      loading.value = true
      
      if (onDelete) {
        await onDelete(entity.value)
      } else {
        await store.deleteItem(entity.value.id)
      }
      
      toast.success(`${config.entityName} deleted successfully!`)
      isDeleteDialogOpen.value = false
      close()
      return true
      
    } catch (error) {
      console.error(`Error deleting ${config.entityName}:`, error)
      toast.errorFromException(error, `Failed to delete ${config.entityName}`)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    isOpen,
    isEditMode,
    isCreateMode,
    isDeleteDialogOpen,
    entity,
    formData,
    errors,
    loading,
    
    // Computed
    formTitle,
    entityTitle,
    
    // Methods
    openCreate,
    openEdit,
    close,
    save,
    deleteEntity,
    validate,
    
    // Config
    config
  }
}