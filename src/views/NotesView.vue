<template>
  <BasePage title="Notes" icon="mdi-note-multiple" :selectedItem="selectedNote" entityType="Note" :key="editViewKey" @entity-updated="handleEntityUpdated" ref="basePageRef">
    <template #table>
      <DataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        title="My Notes"
        newButtonText="Note"
        :newButtonHandler="handleNewNote"
        :reloadButtonHandler="fetchNotes"
        :selectedItem="selectedNote"
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
import type { Note } from '../types/Note'
import { useNoteStore } from '../stores/notes'
import { useEntityView } from '../composables/useEntityView'

const noteStore = useNoteStore()

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Content', value: 'content' },
  { title: 'Contact', value: 'contact.firstname' },
]


const {
  selectedItem: selectedNote,
  editViewKey,
  basePageRef,
  items,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  rowClickHandler,
  handlePaginationChange,
  handleNewEntity: handleNewNote,
  handleEntityUpdated,
  fetchItems: fetchNotes
} = useEntityView<Note>({
  store: noteStore,
  headers,
  entityName: 'Note'
})
</script>