import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import EntityForm from '../../components/EntityForm.vue'
import type { EntityFormConfig } from '../../composables/useEntityForm'

// Mock the form composable
const mockForm = {
  isOpen: { value: false },
  isEditMode: { value: false },
  isCreateMode: { value: true },
  isDeleteDialogOpen: { value: false },
  entity: { value: null },
  formData: { value: {} },
  errors: {},
  loading: { value: false },
  formTitle: { value: 'Create Test Entity' },
  entityTitle: { value: 'New Test Entity' },
  openCreate: vi.fn(),
  openEdit: vi.fn(),
  close: vi.fn(),
  save: vi.fn(),
  deleteEntity: vi.fn(),
  validate: vi.fn(),
  config: {
    entityName: 'Test Entity',
    entityIcon: 'mdi-test',
    entityColor: 'primary',
    sections: [
      {
        title: 'Basic Information',
        icon: 'mdi-information',
        color: 'primary',
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
          }
        ]
      }
    ]
  } as EntityFormConfig<any>
}

const vuetify = createVuetify()

describe('EntityForm', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('should render entity display when not in create mode', () => {
    const form = {
      ...mockForm,
      entity: { value: { id: 1, name: 'Test Entity' } },
      isCreateMode: { value: false }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.entity-header').exists()).toBe(true)
    expect(wrapper.find('.entity-actions').exists()).toBe(true)
    expect(wrapper.find('.entity-details').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Entity')
  })

  it('should not render entity display in create mode', () => {
    const form = {
      ...mockForm,
      isCreateMode: { value: true }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.entity-header').exists()).toBe(false)
    expect(wrapper.find('.entity-actions').exists()).toBe(false)
    expect(wrapper.find('.entity-details').exists()).toBe(false)
  })

  it('should show edit dialog when form is open', async () => {
    const form = {
      ...mockForm,
      isOpen: { value: true }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.entity-form-card').exists()).toBe(true)
    expect(wrapper.find('.form-card-title').text()).toContain('Create Test Entity')
  })

  it('should show delete dialog when delete dialog is open', async () => {
    const form = {
      ...mockForm,
      isDeleteDialogOpen: { value: true },
      entity: { value: { id: 1, name: 'Test Entity' } }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.delete-confirmation-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Delete Test Entity')
  })

  it('should render form fields correctly', async () => {
    const form = {
      ...mockForm,
      isOpen: { value: true },
      formData: { value: { name: 'Test', email: 'test@example.com' } }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    // Check that form sections are rendered
    expect(wrapper.find('.form-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('Basic Information')
    
    // Check that form fields are present
    const textFields = wrapper.findAllComponents({ name: 'VTextField' })
    expect(textFields.length).toBeGreaterThan(0)
  })

  it('should call form methods when buttons are clicked', async () => {
    const form = {
      ...mockForm,
      isOpen: { value: true },
      save: vi.fn(),
      close: vi.fn()
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    // Test save button
    const saveButton = wrapper.find('.save-btn')
    await saveButton.trigger('click')
    expect(form.save).toHaveBeenCalled()

    // Test cancel button
    const cancelButton = wrapper.find('.cancel-btn')
    await cancelButton.trigger('click')
    expect(form.close).toHaveBeenCalled()
  })

  it('should call delete method when delete is confirmed', async () => {
    const form = {
      ...mockForm,
      isDeleteDialogOpen: { value: true },
      entity: { value: { id: 1, name: 'Test Entity' } },
      deleteEntity: vi.fn()
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    const deleteButton = wrapper.find('.delete-btn')
    await deleteButton.trigger('click')
    expect(form.deleteEntity).toHaveBeenCalled()
  })

  it('should show loading state on buttons when loading', async () => {
    const form = {
      ...mockForm,
      isOpen: { value: true },
      loading: { value: true }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    const saveButton = wrapper.findComponent({ name: 'VBtn' })
    expect(saveButton.attributes()).toHaveProperty('loading')
  })

  it('should display validation errors', async () => {
    const form = {
      ...mockForm,
      isOpen: { value: true },
      errors: { name: 'Name is required', email: 'Invalid email format' }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.v-alert').exists()).toBe(true)
    expect(wrapper.text()).toContain('Please fix the following errors')
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Invalid email format')
  })

  it('should handle field visibility correctly', () => {
    const configWithConditionalField = {
      ...mockForm.config,
      sections: [
        {
          title: 'Test Section',
          icon: 'mdi-test',
          fields: [
            {
              key: 'visible',
              type: 'text',
              label: 'Visible Field',
              visible: true
            },
            {
              key: 'hidden',
              type: 'text',
              label: 'Hidden Field',
              visible: false
            },
            {
              key: 'conditional',
              type: 'text',
              label: 'Conditional Field',
              visible: () => true
            }
          ]
        }
      ]
    }

    const form = {
      ...mockForm,
      isOpen: { value: true },
      config: configWithConditionalField
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    // Check that only visible fields are shown
    expect(wrapper.html()).toContain('Visible Field')
    expect(wrapper.html()).not.toContain('Hidden Field')
    expect(wrapper.html()).toContain('Conditional Field')
  })

  it('should handle different field types correctly', () => {
    const configWithDifferentFields = {
      ...mockForm.config,
      sections: [
        {
          title: 'Mixed Fields',
          icon: 'mdi-test',
          fields: [
            {
              key: 'text',
              type: 'text',
              label: 'Text Field'
            },
            {
              key: 'textarea',
              type: 'textarea',
              label: 'Textarea Field',
              rows: 3
            },
            {
              key: 'select',
              type: 'select',
              label: 'Select Field',
              options: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' }
              ]
            }
          ]
        }
      ]
    }

    const form = {
      ...mockForm,
      isOpen: { value: true },
      config: configWithDifferentFields
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    // Check that different field components are rendered
    expect(wrapper.findComponent({ name: 'VTextField' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VTextarea' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VSelect' }).exists()).toBe(true)
  })

  it('should display entity information correctly', () => {
    const entity = {
      id: 1,
      name: 'Test Entity',
      email: 'test@example.com'
    }

    const form = {
      ...mockForm,
      entity: { value: entity },
      isCreateMode: { value: false }
    }

    const wrapper = mount(EntityForm, {
      props: { form },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.info-value').text()).toContain('Test Entity')
  })
})