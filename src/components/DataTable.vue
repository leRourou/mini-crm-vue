<template>
  <v-card class="glassmorphism-card" elevation="0">
    <v-card-title class="gradient-bg-subtle border-b-thin border-primary border-opacity-10 pa-6">
      <div class="d-flex justify-space-between align-center w-100">
        <div class="d-flex align-center">
          <v-icon :color="headerIcon.color" size="28" class="mr-3">{{ headerIcon.icon }}</v-icon>
          <span class="text-h6 font-weight-medium">{{ title }}</span>
        </div>
        <div class="d-flex align-center ga-3">
          <v-btn
            color="primary"
            variant="elevated"
            class="hover-lift"
            @click="newButtonHandler"
            prepend-icon="mdi-plus"
          >
            New {{ newButtonText }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            icon="mdi-refresh"
            class="hover-lift-subtle"
            @click="reloadButtonHandler"
          />
        </div>
      </div>
    </v-card-title>
    
    <v-data-table-server
      :headers="headers"
      :items="items"
      :loading="loading"
      class="bg-transparent"
      :items-length="totalItems || 0"
      :items-per-page="itemsPerPage || 30"
      :page="currentPage || 1"
      :footer-props="{
        showFirstLastPage: true,
        showCurrentPage: true,
        itemsPerPageOptions: [10, 25, 50, 100],
        itemsPerPageText: `Items per page:`
      }"
      @update:options="handleOptionsUpdate"
      hover
    >
      <template v-slot:loading>
        <v-skeleton-loader type="table-tbody"></v-skeleton-loader>
      </template>
      
      <template v-for="header in headers" :key="header.value" v-slot:[`item.${header.value}`]="{ item }">
        <CellRenderer 
          :value="getNestedValue(item, header.value)"
          :column="header.value"
        />
      </template>
      
      <template v-slot:item="{ item }">
        <tr 
          :class="['table-row', { 'table-row-selected': isRowSelected(item) }]" 
          @click="rowClickHandler(item)"
        >
          <td v-for="header in headers" :key="header.value" class="table-cell">
            <CellRenderer 
              :value="getNestedValue(item, header.value)"
              :column="header.value"
            />
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script lang="ts" setup generic="T extends object">
import { computed } from 'vue'
import CellRenderer from './ui/CellRenderer.vue'

interface Header {
  title: string
  value: string
  sortable?: boolean
}

const props = defineProps<{
  headers: Header[]
  items: T[]
  loading: boolean
  title: string
  newButtonText: string
  newButtonHandler?: () => void
  reloadButtonHandler: () => void
  selectedItem?: T | null
  totalItems?: number
  currentPage?: number
  itemsPerPage?: number
}>()

const emits = defineEmits<{
  'row-clicked': [item: T]
  newButton: []
  updateOptions: [options: { page: number; itemsPerPage: number }]
  'page-changed': [page: number]
  'items-per-page-changed': [itemsPerPage: number]
}>()

const headerIcon = computed(() => ({
  icon: 'mdi-table',
  color: 'primary'
}))

const rowClickHandler = (item: T) => {
  emits('row-clicked', item)
}

const isRowSelected = (item: T): boolean => {
  if (!props.selectedItem) return false
  return JSON.stringify(item) === JSON.stringify(props.selectedItem)
}

const handleOptionsUpdate = (options: { page: number; itemsPerPage: number }) => {
  // Only emit one event with all the pagination info
  emits('updateOptions', options)
}

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current, part) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, obj as Record<string, unknown>);
}
</script>