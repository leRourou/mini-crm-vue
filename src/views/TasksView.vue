<template>
  <BasePage title="Tasks" icon="mdi-checkbox-marked-circle" :selectedItem="selectedTask" entityType="Task" :key="editViewKey" @entity-updated="handleEntityUpdated" ref="basePageRef">
    <template #table>
      <DataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        title="My Tasks"
        newButtonText="Task"
        :newButtonHandler="handleNewTask"
        :reloadButtonHandler="fetchTasks"
        :selectedItem="selectedTask"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :itemsPerPage="itemsPerPage"
        @row-clicked="rowClickHandler"
        @update:options="handlePaginationChange"
      >
      </DataTable>
    </template>
  </BasePage>
</template>

<script lang="ts" setup>
import DataTable from '../components/DataTable.vue'
import BasePage from '../components/BasePage.vue'
import type { Task } from '../types/Task'
import { useTaskStore } from '../stores/tasks'
import { useEntityView } from '../composables/useEntityView'

const taskStore = useTaskStore()

const headers = [
  { title: 'Description', value: 'description' },
  { title: 'Contact', value: 'contact.firstname' },
  { title: 'Status', value: 'status' },
  { title: 'Due Date', value: 'dueDate' },
]


const {
  selectedItem: selectedTask,
  editViewKey,
  basePageRef,
  items,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  rowClickHandler,
  handlePaginationChange,
  handleNewEntity: handleNewTask,
  handleEntityUpdated,
  fetchItems: fetchTasks
} = useEntityView<Task>({
  store: taskStore,
  headers,
  entityName: 'Task'
})
</script>