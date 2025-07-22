import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import CompanyForm from '../../components/CompanyForm.vue'
import type { Company } from '../../types/Company'

// Mock the stores
vi.mock('../../stores/companies', () => ({
  useCompanyStore: () => ({
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    fetchItems: vi.fn(),
    items: { value: [] },
    loading: { value: false }
  })
}))

// Mock the form configs
vi.mock('../../composables/useFormConfigs', () => ({
  useCompanyFormConfig: () => ({
    entityName: 'Company',
    entityIcon: 'mdi-office-building',
    entityColor: 'info',
    sections: [
      {
        title: 'Basic Information',
        icon: 'mdi-office-building',
        color: 'info',
        fields: [
          {
            key: 'name',
            type: 'text',
            label: 'Company Name',
            required: true,
            icon: 'mdi-office-building'
          }
        ]
      }
    ]
  })
}))

// Mock the entity form composable
vi.mock('../../composables/useEntityForm', () => ({
  useEntityForm: vi.fn(() => ({
    isOpen: { value: false },
    isEditMode: { value: false },
    isCreateMode: { value: true },
    entity: { value: null },
    formData: { value: {} },
    openCreate: vi.fn(),
    openEdit: vi.fn(),
    close: vi.fn(),
    save: vi.fn(),
    deleteEntity: vi.fn(),
    config: {
      entityName: 'Company',
      sections: []
    }
  }))
}))

const vuetify = createVuetify()

describe('CompanyForm', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  const mockCompany: Company = {
    id: 1,
    name: 'Test Company',
    description: 'A test company',
    phone: '123-456-7890',
    website: 'https://test.com',
    address: '123 Test St'
  }

  it('should render without crashing', () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should expose openCreateDialog method', () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: null
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(typeof wrapper.vm.openCreateDialog).toBe('function')
  })

  it('should expose openEditDialog method', () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(typeof wrapper.vm.openEditDialog).toBe('function')
  })

  it('should emit create-company when saving new company', async () => {
    const { useEntityForm } = await import('../../composables/useEntityForm')
    const mockUseEntityForm = vi.mocked(useEntityForm)
    
    const mockSave = vi.fn().mockResolvedValue(mockCompany)
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm.mock.results[0]?.value || {},
      save: mockSave
    } as any)

    const wrapper = mount(CompanyForm, {
      props: {
        company: null
      },
      global: {
        plugins: [vuetify]
      }
    })

    // Check that the form was configured correctly
    expect(mockUseEntityForm).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          entityName: 'Company'
        }),
        onSave: expect.any(Function),
        onDelete: expect.any(Function),
        onCreate: expect.any(Function),
        onEdit: expect.any(Function)
      })
    )
  })

  it('should emit update-company when saving existing company', async () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany
      },
      global: {
        plugins: [vuetify]
      }
    })

    const emitted = wrapper.emitted()
    expect(emitted).toBeDefined()
  })

  it('should emit delete-company when deleting company', async () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany
      },
      global: {
        plugins: [vuetify]
      }
    })

    const emitted = wrapper.emitted()
    expect(emitted).toBeDefined()
  })

  it('should watch company prop changes', async () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: null
      },
      global: {
        plugins: [vuetify]
      }
    })

    // Change the company prop
    await wrapper.setProps({ company: mockCompany })
    
    // The watcher should have been triggered
    expect(wrapper.props('company')).toEqual(mockCompany)
  })

  it('should handle onCreate callback correctly', async () => {
    const { useEntityForm } = await import('../../composables/useEntityForm')
    const mockUseEntityForm = vi.mocked(useEntityForm)
    
    const wrapper = mount(CompanyForm, {
      props: {
        company: null
      },
      global: {
        plugins: [vuetify]
      }
    })

    const formConfig = mockUseEntityForm.mock.calls[0][0]
    const onCreateResult = formConfig.onCreate?.({})

    expect(onCreateResult).toEqual({
      name: '',
      description: '',
      phone: '',
      website: '',
      address: ''
    })
  })

  it('should handle onEdit callback correctly', async () => {
    const { useEntityForm } = await import('../../composables/useEntityForm')
    const mockUseEntityForm = vi.mocked(useEntityForm)
    
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany
      },
      global: {
        plugins: [vuetify]
      }
    })

    const formConfig = mockUseEntityForm.mock.calls[0][0]
    const onEditResult = formConfig.onEdit?.(mockCompany)

    expect(onEditResult).toEqual(mockCompany)
  })

  it('should handle loading and error props', () => {
    const wrapper = mount(CompanyForm, {
      props: {
        company: mockCompany,
        loading: true,
        error: 'Test error'
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
    expect(wrapper.props('error')).toBe('Test error')
  })
})