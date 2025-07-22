<template>
  <EntityForm :form="form" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'
import type { Company } from '../types/Company'
import { useEntityForm } from '../composables/useEntityForm'
import { useCompanyFormConfig } from '../composables/useFormConfigs'
import { useCompanyStore } from '../stores/companies'
import EntityForm from './EntityForm.vue'

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

const companyStore = useCompanyStore()
const config = useCompanyFormConfig()

const form = useEntityForm<Company>({
  config,
  store: companyStore as unknown as {
    createItem: (item: Partial<Company> | Omit<Company, 'id'>) => Promise<Company | undefined>
    updateItem: (item: Company) => Promise<Company | undefined>
    deleteItem: (id: string | number) => Promise<void>
  },
  onSave: async (company: Company, isCreate: boolean) => {
    if (isCreate) {
      emit('create-company', company)
      return await companyStore.createItem(company)
    } else {
      emit('update-company', company)
      return await companyStore.updateItem(company)
    }
  },
  onDelete: async (company: Company) => {
    emit('delete-company', company)
    await companyStore.deleteItem(company.id!)
  },
  onCreate: (_entity: Partial<Company>) => ({
    name: '',
    description: '',
    phone: '',
    website: '',
    address: ''
  }),
  onEdit: (company: Company) => ({
    ...company
  })
})

// Watch for prop changes to update form entity
watch(() => props.company, (newCompany) => {
  if (newCompany && !form.isOpen.value) {
    form.entity.value = newCompany
  }
}, { immediate: true })

// Expose methods for parent components
const openCreateDialog = () => form.openCreate()
const openEditDialog = (company?: Company) => {
  if (company) {
    form.openEdit(company)
  } else if (props.company) {
    form.openEdit(props.company)
  }
}

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>