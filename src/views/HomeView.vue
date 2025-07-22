<template>
  <div class="mx-auto" style="max-width: 1200px;">
    <v-sheet class="gradient-bg-subtle rounded-xl pa-16 mb-12 text-center">
      <div class="mx-auto" style="max-width: 600px;">
        <div class="d-flex align-center justify-center rounded-circle gradient-bg-medium mx-auto mb-6 elevation-4" style="width: 120px; height: 120px;">
          <v-icon size="64" color="primary">mdi-chart-line</v-icon>
        </div>
        <h1 class="text-h3 font-weight-black text-grey-darken-3 mb-4">Welcome to Mini CRM</h1>
        <p class="text-h6 text-grey-darken-1 mb-8">Manage your business relationships with style and efficiency</p>
        <div class="d-flex justify-center flex-wrap ga-4">
          <v-btn
            to="/contacts"
            color="primary"
            size="large"
            class="hover-lift text-none font-weight-medium"
            prepend-icon="mdi-account-group"
            elevation="4"
          >
            View Contacts
          </v-btn>
          <v-btn
            to="/opportunities"
            color="secondary"
            variant="tonal"
            size="large"
            class="hover-lift text-none font-weight-medium"
            prepend-icon="mdi-currency-usd"
            elevation="2"
          >
            Opportunities
          </v-btn>
        </div>
      </div>
    </v-sheet>

    <div class="d-flex flex-wrap ga-6 mb-16" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
      <v-alert 
        v-if="error" 
        type="error" 
        variant="tonal"
        style="grid-column: 1 / -1;"
        class="mb-4"
      >
        {{ error }}
        <template v-slot:append>
          <v-btn
            variant="text"
            size="small"
            @click="fetchStats"
            :loading="loading"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      
      <v-card 
        v-for="stat in stats" 
        :key="stat.title"
        class="glassmorphism-card hover-lift-subtle"
        elevation="0"
        :loading="loading"
      >
        <v-card-text class="d-flex align-center ga-4 pa-6">
          <div class="d-flex align-center justify-center rounded-lg gradient-bg-medium pa-4">
            <v-icon :color="stat.color" size="32">{{ stat.icon }}</v-icon>
          </div>
          <div>
            <div class="text-h4 font-weight-bold text-grey-darken-3">
              <template v-if="loading">
                <v-skeleton-loader type="text" width="60"></v-skeleton-loader>
              </template>
              <template v-else>
                {{ stat.value }}
              </template>
            </div>
            <div class="text-body-2 text-grey-darken-1 font-weight-medium mt-1">{{ stat.title }}</div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardService } from '../services/dashboard'

const loading = ref(false)
const error = ref<string | null>(null)

const stats = ref([
  { title: 'Total Contacts', value: '0', icon: 'mdi-account-group', color: 'status-new', key: 'contacts' },
  { title: 'Companies', value: '0', icon: 'mdi-domain', color: 'status-progress', key: 'companies' },
  { title: 'Opportunities', value: '0', icon: 'mdi-currency-usd', color: 'status-won', key: 'opportunities' },
  { title: 'Tasks', value: '0', icon: 'mdi-check-circle', color: 'status-prospect', key: 'tasks' },
  { title: 'Notes', value: '0', icon: 'mdi-note-multiple', color: 'status-qualified', key: 'notes' },
])


const fetchStats = async () => {
  try {
    loading.value = true
    error.value = null
    
    const dashboardStats = await dashboardService.getStats()
    
    
    stats.value.forEach(stat => {
      const count = dashboardStats[stat.key as keyof typeof dashboardStats]
      stat.value = count.toLocaleString()
    })

  } catch (err) {
    error.value = 'Failed to load dashboard statistics'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
</style>
