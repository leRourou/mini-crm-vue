<template>
  <EntityForm :form="form" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'
import type { Note } from '../types/Note'
import { useEntityForm } from '../composables/useEntityForm'
import { useNoteFormConfig } from '../composables/useFormConfigs'
import { useNoteStore } from '../stores/notes'
import EntityForm from './EntityForm.vue'

const props = defineProps<{
  note: Note | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-note': [note: Note | null]
  'create-note': [note: Note]
  'delete-note': [note: Note]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const noteStore = useNoteStore()
const config = useNoteFormConfig()

const form = useEntityForm<Note>({
  config,
  store: noteStore as unknown as {
    createItem: (item: Partial<Note> | Omit<Note, 'id'>) => Promise<Note | undefined>
    updateItem: (item: Note) => Promise<Note | undefined>
    deleteItem: (id: string | number) => Promise<void>
  },
  onSave: async (note: Note, isCreate: boolean) => {
    if (isCreate) {
      emit('create-note', note)
      return await noteStore.createItem(note)
    } else {
      emit('update-note', note)
      return await noteStore.updateItem(note)
    }
  },
  onDelete: async (note: Note) => {
    emit('delete-note', note)
    await noteStore.deleteItem(note.id!)
  },
  onCreate: (_entity: Partial<Note>) => ({
    name: '',
    content: '',
    contact: null
  }),
  onEdit: (note: Note) => ({
    ...note
  })
})

// Watch for prop changes to update form entity
watch(() => props.note, (newNote) => {
  if (newNote && !form.isOpen.value) {
    form.entity.value = newNote
  }
}, { immediate: true })

// Expose methods for parent components
const openCreateDialog = () => form.openCreate()
const openEditDialog = (note?: Note) => {
  if (note) {
    form.openEdit(note)
  } else if (props.note) {
    form.openEdit(props.note)
  }
}

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>