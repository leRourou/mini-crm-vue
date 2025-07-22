import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useEntityForm } from '../../composables/useEntityForm'
import type { EntityFormConfig } from '../../composables/useEntityForm'

// Mock the toast and validation composables
vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    errorFromException: vi.fn(),
    loading: vi.fn()
  })
}))

vi.mock('../../composables/useValidation', () => ({
  useValidation: () => ({
    rules: {
      required: vi.fn((value: any) => value ? true : 'Field is required'),
      email: vi.fn((value: string) => !value || /@/.test(value) || 'Invalid email')
    },
    validateForm: vi.fn((data: any, schema: any) => ({ 
      isValid: true, 
      errors: {} 
    }))
  })
}))

interface TestEntity {
  id?: number | string
  '@id'?: string
  name: string
  email?: string
  description?: string
}

const mockStore = {
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  fetchItems: vi.fn()
}

const testConfig: EntityFormConfig<TestEntity> = {
  entityName: 'Test Entity',
  entityIcon: 'mdi-test',
  entityColor: 'primary',
  sections: [
    {
      title: 'Basic Information',
      icon: 'mdi-information',
      fields: [
        {
          key: 'name',
          type: 'text',
          label: 'Name',
          required: true,
          icon: 'mdi-account'
        },
        {
          key: 'email',
          type: 'email',
          label: 'Email',
          icon: 'mdi-email'
        },
        {
          key: 'description',
          type: 'textarea',
          label: 'Description',
          rows: 3
        }
      ]
    }
  ]
}

describe('useEntityForm', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      expect(form.isOpen.value).toBe(false)
      expect(form.isEditMode.value).toBe(false)
      expect(form.isCreateMode.value).toBe(true)
      expect(form.isDeleteDialogOpen.value).toBe(false)
      expect(form.entity.value).toBeNull()
      expect(form.formData.value).toEqual({})
      expect(form.loading.value).toBe(false)
    })

    it('should generate correct form title', () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      expect(form.formTitle.value).toBe('Create Test Entity')

      form.isEditMode.value = true
      expect(form.formTitle.value).toBe('Edit Test Entity')
    })

    it('should generate entity title correctly', () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      expect(form.entityTitle.value).toBe('New Test Entity')

      form.entity.value = { id: 1, name: 'Test Name' }
      expect(form.entityTitle.value).toBe('Test Name')

      form.entity.value = { id: 1, name: 'A'.repeat(60) }
      expect(form.entityTitle.value).toBe('A'.repeat(50) + '...')
    })
  })

  describe('form operations', () => {
    it('should open create mode correctly', async () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openCreate()

      expect(form.isOpen.value).toBe(true)
      expect(form.isCreateMode.value).toBe(true)
      expect(form.isEditMode.value).toBe(false)
      expect(form.entity.value).toBeNull()
      expect(form.formData.value).toEqual({
        name: '',
        email: '',
        description: ''
      })
    })

    it('should open edit mode correctly', async () => {
      const testEntity: TestEntity = {
        id: 1,
        name: 'Test Entity',
        email: 'test@example.com',
        description: 'Test description'
      }

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openEdit(testEntity)

      expect(form.isOpen.value).toBe(true)
      expect(form.isCreateMode.value).toBe(false)
      expect(form.isEditMode.value).toBe(true)
      expect(form.entity.value).toEqual(testEntity)
      expect(form.formData.value).toEqual(testEntity)
    })

    it('should close form and reset state', () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      form.isOpen.value = true
      form.formData.value = { name: 'test' }
      form.entity.value = { id: 1, name: 'test' }

      form.close()

      expect(form.isOpen.value).toBe(false)
      expect(form.formData.value).toEqual({})
      expect(form.entity.value).toBeNull()
    })
  })

  describe('save operations', () => {
    it('should save new entity successfully', async () => {
      const mockCreatedEntity = { id: 1, name: 'Test Entity', email: 'test@example.com' }
      mockStore.createItem.mockResolvedValueOnce(mockCreatedEntity)

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openCreate()
      form.formData.value = { name: 'Test Entity', email: 'test@example.com' }

      const result = await form.save()

      expect(result).toBe(true)
      expect(mockStore.createItem).toHaveBeenCalledWith({
        name: 'Test Entity',
        email: 'test@example.com',
        description: ''
      })
      expect(form.isOpen.value).toBe(false)
    })

    it('should update existing entity successfully', async () => {
      const existingEntity: TestEntity = { id: 1, name: 'Old Name', email: 'old@example.com' }
      const mockUpdatedEntity = { id: 1, name: 'Updated Name', email: 'updated@example.com' }
      mockStore.updateItem.mockResolvedValueOnce(mockUpdatedEntity)

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openEdit(existingEntity)
      form.formData.value.name = 'Updated Name'
      form.formData.value.email = 'updated@example.com'

      const result = await form.save()

      expect(result).toBe(true)
      expect(mockStore.updateItem).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated Name',
        email: 'updated@example.com',
        description: ''
      })
      expect(form.isOpen.value).toBe(false)
    })

    it('should handle save errors', async () => {
      mockStore.createItem.mockRejectedValueOnce(new Error('Save failed'))

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openCreate()
      form.formData.value = { name: 'Test Entity' }

      const result = await form.save()

      expect(result).toBe(false)
      expect(form.isOpen.value).toBe(true) // Should remain open on error
    })

    it('should handle validation errors', async () => {
      const { useValidation } = await import('../../composables/useValidation')
      const mockValidation = useValidation()
      
      // Mock validation failure
      ;(mockValidation.validateForm as Mock).mockReturnValueOnce({
        isValid: false,
        errors: { name: 'Name is required' }
      })

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openCreate()
      form.formData.value = { name: '' }

      const result = await form.save()

      expect(result).toBe(false)
      expect(mockStore.createItem).not.toHaveBeenCalled()
    })
  })

  describe('delete operations', () => {
    it('should delete entity successfully', async () => {
      const entityToDelete: TestEntity = { id: 1, name: 'Test Entity' }
      mockStore.deleteItem.mockResolvedValueOnce(undefined)

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      form.entity.value = entityToDelete

      const result = await form.deleteEntity()

      expect(result).toBe(true)
      expect(mockStore.deleteItem).toHaveBeenCalledWith(1)
      expect(form.isDeleteDialogOpen.value).toBe(false)
      expect(form.isOpen.value).toBe(false)
    })

    it('should handle delete errors', async () => {
      const entityToDelete: TestEntity = { id: 1, name: 'Test Entity' }
      mockStore.deleteItem.mockRejectedValueOnce(new Error('Delete failed'))

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      form.entity.value = entityToDelete

      const result = await form.deleteEntity()

      expect(result).toBe(false)
    })

    it('should not delete when no entity is set', async () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      const result = await form.deleteEntity()

      expect(result).toBe(false)
      expect(mockStore.deleteItem).not.toHaveBeenCalled()
    })
  })

  describe('API format conversion', () => {
    it('should convert relationship objects to API format', async () => {
      const mockRelationshipStore = {
        ...mockStore,
        items: { value: [{ id: 1, name: 'Related Entity' }] },
        loading: { value: false },
        endpoint: 'related'
      }

      const configWithRelationship: EntityFormConfig<TestEntity & { related?: any }> = {
        ...testConfig,
        sections: [
          ...testConfig.sections,
          {
            title: 'Relationships',
            icon: 'mdi-link',
            fields: [
              {
                key: 'related',
                type: 'select',
                label: 'Related Entity',
                relationship: {
                  store: mockRelationshipStore,
                  displayField: 'name'
                }
              }
            ]
          }
        ]
      }

      const form = useEntityForm({
        config: configWithRelationship,
        store: mockStore
      })

      await form.openCreate()
      form.formData.value = {
        name: 'Test',
        related: { id: 1, name: 'Related Entity' }
      }

      await form.save()

      expect(mockStore.createItem).toHaveBeenCalledWith({
        name: 'Test',
        email: '',
        description: '',
        related: '/api/related/1'
      })
    })

    it('should clean up API fields for create operations', async () => {
      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore
      })

      await form.openCreate()
      form.formData.value = {
        id: 999, // Should be removed
        '@id': '/api/test/999', // Should be removed
        '@type': 'TestEntity', // Should be removed
        name: 'Test Entity',
        createdAt: '2023-01-01', // Should be removed
        updatedAt: '2023-01-01' // Should be removed
      } as any

      await form.save()

      expect(mockStore.createItem).toHaveBeenCalledWith({
        name: 'Test Entity',
        email: '',
        description: ''
      })
    })
  })

  describe('custom callbacks', () => {
    it('should call custom onCreate callback', async () => {
      const onCreate = vi.fn(() => ({ name: 'Default Name' }))

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore,
        onCreate
      })

      await form.openCreate()

      expect(onCreate).toHaveBeenCalledWith({})
      expect(form.formData.value.name).toBe('Default Name')
    })

    it('should call custom onEdit callback', async () => {
      const onEdit = vi.fn((entity) => ({ ...entity, modified: true }))
      const testEntity: TestEntity = { id: 1, name: 'Test' }

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore,
        onEdit
      })

      await form.openEdit(testEntity)

      expect(onEdit).toHaveBeenCalledWith(testEntity)
      expect((form.formData.value as any).modified).toBe(true)
    })

    it('should call beforeSave callback', async () => {
      const beforeSave = vi.fn((data) => ({ ...data, processed: true }))

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore,
        beforeSave
      })

      await form.openCreate()
      form.formData.value = { name: 'Test' }
      await form.save()

      expect(beforeSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test' }),
        true
      )
      expect(mockStore.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ processed: true })
      )
    })

    it('should call afterSave callback', async () => {
      const afterSave = vi.fn()
      const mockEntity = { id: 1, name: 'Test' }
      mockStore.createItem.mockResolvedValueOnce(mockEntity)

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore,
        afterSave
      })

      await form.openCreate()
      form.formData.value = { name: 'Test' }
      await form.save()

      expect(afterSave).toHaveBeenCalledWith(mockEntity, true)
    })

    it('should call validateBeforeSave and prevent save on validation failure', async () => {
      const validateBeforeSave = vi.fn(() => 'Custom validation error')

      const form = useEntityForm<TestEntity>({
        config: testConfig,
        store: mockStore,
        validateBeforeSave
      })

      await form.openCreate()
      form.formData.value = { name: 'Test' }

      const result = await form.save()

      expect(result).toBe(false)
      expect(validateBeforeSave).toHaveBeenCalled()
      expect(mockStore.createItem).not.toHaveBeenCalled()
    })
  })
})