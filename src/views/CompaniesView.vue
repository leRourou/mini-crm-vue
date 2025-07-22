
<template>
  <BasePage title="Companies" icon="mdi-domain" :selectedItem="selectedCompany" entityType="Company" :key="editViewKey" @entity-updated="handleEntityUpdated" ref="basePageRef">
    <template #table>
      <DataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        title="My Companies"
        newButtonText="Company"
        :newButtonHandler="handleNewCompany"
        :reloadButtonHandler="fetchCompanies"
        :selectedItem="selectedCompany"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :itemsPerPage="itemsPerPage"
        @row-clicked="rowClickHandler"
        @update:options="handlePaginationChange"
      >
      </DataTable>
    </template>

    <template #edit>
      <DisplayCompany
        v-if="selectedCompany"
        :company="selectedCompany"
        @edit="handleEdit"
        @delete="handleDelete"
      />
      
      <ModalCompany
        :company="editingCompany"
        v-model:isEditDialogOpen="isEditDialogOpen"
        v-model:isDeleteDialogOpen="isDeleteDialogOpen"
        @company-updated="handleCompanyUpdated"
        @company-deleted="handleCompanyDeleted"
      />
    </template>
  </BasePage>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import BasePage from '../components/BasePage.vue'
import DisplayCompany from '../components/DisplayCompany.vue'
import ModalCompany from '../components/ModalCompany.vue'
import type { Company } from '../types/Company'
import { useCompanyStore } from '../stores/companies'
import { useEntityView } from '../composables/useEntityView'

const companyStore = useCompanyStore()

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Website', value: 'website' },
  { title: 'Phone', value: 'phone' },
]

// Modal state
const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const editingCompany = ref<Company | null>(null)

const {
  selectedItem: selectedCompany,
  editViewKey,
  basePageRef,
  items,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  rowClickHandler,
  handlePaginationChange,
  handleNewEntity: handleNewCompany,
  handleEntityUpdated,
  fetchItems: fetchCompanies
} = useEntityView<Company>({
  store: companyStore,
  headers,
  entityName: 'Company'
})

// Modal handlers
const handleEdit = () => {
  editingCompany.value = selectedCompany.value
  isEditDialogOpen.value = true
}

const handleDelete = () => {
  editingCompany.value = selectedCompany.value
  isDeleteDialogOpen.value = true
}

const handleCompanyUpdated = (updatedCompany: Company) => {
  // Update the selected item if it's the same company
  if (selectedCompany.value?.id === updatedCompany.id) {
    handleEntityUpdated(updatedCompany)
  }
  // Refresh the list to show updates
  fetchCompanies()
}

const handleCompanyDeleted = (companyId: string | number) => {
  // Clear selection if the deleted company was selected
  if (selectedCompany.value?.id === companyId) {
    selectedCompany.value = null
  }
  // Refresh the list
  fetchCompanies()
}
</script>
