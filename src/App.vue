<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}

const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', color: 'primary' },
  { title: 'Contacts', icon: 'mdi-account-group', to: '/contacts', color: 'status-new' },
  { title: 'Companies', icon: 'mdi-domain', to: '/companies', color: 'status-progress' },
  { title: 'Opportunities', icon: 'mdi-currency-usd', to: '/opportunities', color: 'status-won' },
  { title: 'Notes', icon: 'mdi-note-multiple', to: '/notes', color: 'status-qualified' },
  { title: 'Tasks', icon: 'mdi-check-circle', to: '/tasks', color: 'status-prospect' },
]

</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      temporary
      class="gradient-bg-subtle"
      width="280"
    >
      <v-sheet class="pa-6 border-b-thin border-primary border-opacity-10">
        <div class="d-flex align-center ga-3">
          <v-icon size="32" color="primary">mdi-chart-line</v-icon>
          <span class="brand-gradient-text text-h6 font-weight-bold">Mini CRM</span>
        </div>
      </v-sheet>
      
      <v-list nav class="pa-4">
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          class="hover-lift-subtle mb-2"
          rounded="xl"
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon :color="item.color" size="24">{{ item.icon }}</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      elevation="0"
      class="glassmorphism-surface border-b-thin border-primary border-opacity-10 px-4"
      height="72"
    >
      <div class="d-flex align-center">
        <v-app-bar-nav-icon
          v-if="authStore.isAuthenticated"
          @click="drawer = !drawer"
          class="d-md-none mr-2"
        />
        
        <div class="d-flex align-center ga-3 pa-2 rounded-lg">
          <div class="d-flex align-center justify-center rounded-lg pa-2 gradient-bg-medium">
            <v-icon color="primary" size="28">mdi-chart-line</v-icon>
          </div>
          <span class="brand-gradient-text text-h6 font-weight-bold">Mini CRM</span>
        </div>
      </div>
      
      <v-spacer />
      
      <div v-if="authStore.isAuthenticated" class="d-none d-md-flex align-center">
        <template v-for="item in navigationItems" :key="item.title">
          <v-btn
            :to="item.to"
            variant="text"
            class="hover-lift-subtle mx-1"
            :class="{ 'gradient-bg-strong text-brand-primary': route.path === item.to }"
            rounded="lg"
          >
            <template v-slot:prepend>
              <v-icon :color="item.color" size="20">{{ item.icon }}</v-icon>
            </template>
            {{ item.title }}
          </v-btn>
        </template>
      </div>
      
      <div v-if="authStore.isAuthenticated">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              class="ml-4"
              size="large"
            >
              <v-avatar color="primary" size="36">
                <span class="avatar-text">{{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      
      <div v-else>
        <v-btn
          :to="{ name: 'login' }"
          variant="elevated"
          color="primary"
          class="ml-4 login-btn"
          :prepend-icon="$vuetify.display.mdAndUp ? 'mdi-login' : undefined"
          :icon="$vuetify.display.smAndDown ? 'mdi-login' : undefined"
          rounded="lg"
        >
          <span v-if="$vuetify.display.mdAndUp">Login</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main class="gradient-bg-subtle">
      <div class="pa-6 mx-auto" style="max-width: 1400px;">
        <RouterView />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.login-btn {
  text-transform: none;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 960px) {
  .pa-6 {
    padding: 16px !important;
  }
}

@media (max-width: 600px) {
  .pa-6 {
    padding: 12px !important;
  }
}
</style>
