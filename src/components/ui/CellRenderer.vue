<template>
  <div :class="cellClass">
    <template v-if="cellType === 'status'">
      <v-chip
        :color="getStatusColor(value)"
        variant="tonal"
        size="small"
        class="status-chip"
      >
        <v-icon start size="12">{{ getStatusIcon(value) }}</v-icon>
        {{ formatStatus(value) }}
      </v-chip>
    </template>
    
    <template v-else-if="cellType === 'amount'">
      <div class="amount-value">${{ Number(value || 0).toLocaleString() }}</div>
    </template>
    
    <template v-else-if="cellType === 'date'">
      <div class="date-value">{{ formatDate(value) }}</div>
    </template>
    
    <template v-else-if="cellType === 'email'">
      <a :href="`mailto:${value}`" class="email-link">{{ value }}</a>
    </template>
    
    <template v-else-if="cellType === 'phone'">
      <a :href="`tel:${value}`" class="phone-link">{{ value }}</a>
    </template>
    
    <template v-else>
      <div class="text-cell">{{ value }}</div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  value: any
  column: string
}>()

const cellType = computed(() => {
  if (props.column === 'status') return 'status'
  if (props.column === 'amount') return 'amount'
  if (props.column.includes('Date')) return 'date'
  if (props.column.includes('email')) return 'email'
  if (props.column.includes('phone')) return 'phone'
  return 'text'
})

const cellClass = computed(() => `${cellType.value}-cell`)

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'OPEN': 'success',
    'IN_PROGRESS': 'warning',
    'CLOSED_WON': 'primary',
    'CLOSED_LOST': 'error',
    'TODO': 'info',
    'COMPLETED': 'success'
  }
  return statusMap[status] || 'default'
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    'OPEN': 'mdi-circle-outline',
    'IN_PROGRESS': 'mdi-clock-outline',
    'CLOSED_WON': 'mdi-check-circle',
    'CLOSED_LOST': 'mdi-close-circle',
    'TODO': 'mdi-circle-outline',
    'COMPLETED': 'mdi-check-circle'
  }
  return iconMap[status] || 'mdi-circle-outline'
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}
</script>