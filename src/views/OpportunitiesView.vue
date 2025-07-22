<template>
  <BasePage title="Opportunities" icon="mdi-currency-usd" :selectedItem="selectedOpportunity" entityType="Opportunity" :key="editViewKey" @entity-updated="handleEntityUpdated" ref="basePageRef">
    <template #table>
      <DataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        title="My Opportunities"
        newButtonText="Opportunity"
        :newButtonHandler="handleNewOpportunity"
        :reloadButtonHandler="fetchOpportunities"
        :selectedItem="selectedOpportunity"
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
import type { Opportunity } from '../types/Opportunity'
import { useOpportunityStore } from '../stores/opportunities'
import { useEntityView } from '../composables/useEntityView'

const opportunityStore = useOpportunityStore()

const headers = [
  { title: 'Title', value: 'title' },
  { title: 'Contact', value: 'contact.firstname' },
  { title: 'Status', value: 'status' },
  { title: 'Amount', value: 'amount' },
  { title: 'Close Date', value: 'closeDate' },
]


const {
  selectedItem: selectedOpportunity,
  editViewKey,
  basePageRef,
  items,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  rowClickHandler,
  handlePaginationChange,
  handleNewEntity: handleNewOpportunity,
  handleEntityUpdated,
  fetchItems: fetchOpportunities
} = useEntityView<Opportunity>({
  store: opportunityStore,
  headers,
  entityName: 'Opportunity'
})
</script>