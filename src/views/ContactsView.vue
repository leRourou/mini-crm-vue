
<template>
  <BasePage title="Contacts" icon="mdi-account-group" :selectedItem="selectedContact" entityType="Contact" :key="editViewKey" @entity-updated="handleEntityUpdated" ref="basePageRef">
    <template #table>
      <DataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        title="My Contacts"
        newButtonText="Contact"
        :newButtonHandler="handleNewContact"
        :reloadButtonHandler="fetchContacts"
        :selectedItem="selectedContact"
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
import type { Contact } from '../types/Contact'
import { useContactStore } from '../stores/contacts'
import { useEntityView } from '../composables/useEntityView'

const contactStore = useContactStore()

const headers = [
  { title: 'First Name', value: 'firstname' },
  { title: 'Last Name', value: 'lastname' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Company', value: 'company.name' },
]


const {
  selectedItem: selectedContact,
  editViewKey,
  basePageRef,
  items,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  rowClickHandler,
  handlePaginationChange,
  handleNewEntity: handleNewContact,
  handleEntityUpdated,
  fetchItems: fetchContacts
} = useEntityView<Contact>({
  store: contactStore,
  headers,
  entityName: 'Contact'
})
</script>
