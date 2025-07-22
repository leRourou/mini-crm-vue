<template>
  <EntityForm :form="form" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'
import type { Contact } from '../types/Contact'
import { useEntityForm } from '../composables/useEntityForm'
import { useContactFormConfig } from '../composables/useFormConfigs'
import { useContactStore } from '../stores/contacts'
import { useCompanyStore } from '../stores/companies'
import EntityForm from './EntityForm.vue'

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

const contactStore = useContactStore()
const companyStore = useCompanyStore()
const config = useContactFormConfig()

const form = useEntityForm<Contact>({
  config,
  store: contactStore as unknown as {
    createItem: (item: Partial<Contact> | Omit<Contact, 'id'>) => Promise<Contact | undefined>
    updateItem: (item: Contact) => Promise<Contact | undefined>
    deleteItem: (id: string | number) => Promise<void>
  },
  onSave: async (contact: Contact, isCreate: boolean) => {
    if (isCreate) {
      emit('create-contact', contact)
      return await contactStore.createItem(contact)
    } else {
      emit('update-contact', contact)
      return await contactStore.updateItem(contact)
    }
  },
  onDelete: async (contact: Contact) => {
    emit('delete-contact', contact)
    await contactStore.deleteItem(contact.id!)
  },
  onCreate: (_entity: Partial<Contact>) => ({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    company: null
  }),
  onEdit: (contact: Contact) => ({
    ...contact
  })
})

// Watch for prop changes to update form entity
watch(() => props.contact, (newContact) => {
  if (newContact && !form.isOpen.value) {
    form.entity.value = newContact
  }
}, { immediate: true })

// Expose methods for parent components
const openCreateDialog = async () => {
  await companyStore.fetchAllItems()
  form.openCreate()
}
const openEditDialog = async (contact?: Contact) => {
  await companyStore.fetchAllItems()
  if (contact) {
    form.openEdit(contact)
  } else if (props.contact) {
    form.openEdit(props.contact)
  }
}

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>