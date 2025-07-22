<template>
  <EntityForm :form="form" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'
import type { Opportunity } from '../types/Opportunity'
import { useEntityForm } from '../composables/useEntityForm'
import { useOpportunityFormConfig } from '../composables/useFormConfigs'
import { useOpportunityStore } from '../stores/opportunities'
import EntityForm from './EntityForm.vue'

const props = defineProps<{
  opportunity: Opportunity | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-opportunity': [opportunity: Opportunity | null]
  'create-opportunity': [opportunity: Opportunity]
  'delete-opportunity': [opportunity: Opportunity]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const opportunityStore = useOpportunityStore()
const config = useOpportunityFormConfig()

const form = useEntityForm<Opportunity>({
  config,
  store: opportunityStore as unknown as {
    createItem: (item: Partial<Opportunity> | Omit<Opportunity, 'id'>) => Promise<Opportunity | undefined>
    updateItem: (item: Opportunity) => Promise<Opportunity | undefined>
    deleteItem: (id: string | number) => Promise<void>
  },
  onSave: async (opportunity: Opportunity, isCreate: boolean) => {
    if (isCreate) {
      emit('create-opportunity', opportunity)
      return await opportunityStore.createItem(opportunity)
    } else {
      emit('update-opportunity', opportunity)
      return await opportunityStore.updateItem(opportunity)
    }
  },
  onDelete: async (opportunity: Opportunity) => {
    emit('delete-opportunity', opportunity)
    await opportunityStore.deleteItem(opportunity.id!)
  },
  onCreate: (_entity: Partial<Opportunity>) => ({
    title: '',
    description: '',
    amount: '',
    status: 'prospect' as const,
    closeDate: '',
    contact: null
  }),
  onEdit: (opportunity: Opportunity) => ({
    ...opportunity
  })
})

// Watch for prop changes to update form entity
watch(() => props.opportunity, (newOpportunity) => {
  if (newOpportunity && !form.isOpen.value) {
    form.entity.value = newOpportunity
  }
}, { immediate: true })

// Expose methods for parent components
const openCreateDialog = () => form.openCreate()
const openEditDialog = (opportunity?: Opportunity) => {
  if (opportunity) {
    form.openEdit(opportunity)
  } else if (props.opportunity) {
    form.openEdit(props.opportunity)
  }
}

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>