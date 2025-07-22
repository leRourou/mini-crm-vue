<template>
  <EntityForm :form="form" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'
import type { Task } from '../types/Task'
import { useEntityForm } from '../composables/useEntityForm'
import { useTaskFormConfig } from '../composables/useFormConfigs'
import { useTaskStore } from '../stores/tasks'
import EntityForm from './EntityForm.vue'

const props = defineProps<{
  task: Task | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update-task': [task: Task | null]
  'create-task': [task: Task]
  'delete-task': [task: Task]
  'update:loading': [loading: boolean]
  'update:error': [error: string | null]
}>()

const taskStore = useTaskStore()
const config = useTaskFormConfig()

const form = useEntityForm<Task>({
  config,
  store: taskStore as unknown as {
    createItem: (item: Partial<Task> | Omit<Task, 'id'>) => Promise<Task | undefined>
    updateItem: (item: Task) => Promise<Task | undefined>
    deleteItem: (id: string | number) => Promise<void>
  },
  onSave: async (task: Task, isCreate: boolean) => {
    if (isCreate) {
      emit('create-task', task)
      return await taskStore.createItem(task)
    } else {
      emit('update-task', task)
      return await taskStore.updateItem(task)
    }
  },
  onDelete: async (task: Task) => {
    emit('delete-task', task)
    await taskStore.deleteItem(task.id!)
  },
  onCreate: (_entity: Partial<Task>) => ({
    description: '',
    dueDate: '',
    status: 'pending' as const,
    contact: null
  }),
  onEdit: (task: Task) => ({
    ...task
  })
})

// Watch for prop changes to update form entity
watch(() => props.task, (newTask) => {
  if (newTask && !form.isOpen.value) {
    form.entity.value = newTask
  }
}, { immediate: true })

// Expose methods for parent components
const openCreateDialog = () => form.openCreate()
const openEditDialog = (task?: Task) => {
  if (task) {
    form.openEdit(task)
  } else if (props.task) {
    form.openEdit(props.task)
  }
}

defineExpose({
  openCreateDialog,
  openEditDialog
})
</script>