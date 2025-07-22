<template>
  <div class="login-form">
    <v-card class="login-card" elevation="8">
      <v-card-title class="login-title">
        <div class="login-icon">
          <v-icon size="48" color="primary">mdi-account-circle</v-icon>
        </div>
        <h2>Welcome Back</h2>
        <p class="login-subtitle">Sign in to your Mini CRM account</p>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          
          <v-alert
            v-if="authStore.error"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            data-testid="error-message"
          >
            {{ authStore.error }}
          </v-alert>
          
          
          <v-text-field
            v-model="credentials.email"
            :rules="emailRules"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            class="mb-2"
            data-testid="email-field"
            @input="authStore.clearError"
            :disabled="authStore.isLoading"
          ></v-text-field>
          
          
          <v-text-field
            v-model="credentials.password"
            :rules="passwordRules"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            class="mb-4"
            data-testid="password-field"
            @input="authStore.clearError"
            :disabled="authStore.isLoading"
          >
            <template v-slot:append-inner>
              <v-icon
                :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click="showPassword = !showPassword"
                data-testid="password-toggle"
              ></v-icon>
            </template>
          </v-text-field>
          
          
          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading || !isFormValid"
            data-testid="login-button"
            class="login-button"
          >
            <span v-if="authStore.isLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types/Auth'

const router = useRouter()
const authStore = useAuthStore()


const credentials = ref<LoginCredentials>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const form = ref()


const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]


const isFormValid = computed(() => {
  return credentials.value.email && 
         credentials.value.password &&
         /.+@.+\..+/.test(credentials.value.email) &&
         credentials.value.password.length >= 6
})


const handleLogin = async () => {
  const { valid } = await form.value.validate()
  
  if (valid && isFormValid.value) {
    await authStore.login(credentials.value)
  }
}


watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      router.push({ name: 'home' })
    }
  }
)
</script>

<style scoped>
.login-form {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.login-title {
  text-align: center;
  padding: 32px 24px 24px 24px;
  flex-direction: column;
}

.login-icon {
  margin-bottom: 16px;
}

.login-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-button {
  margin-top: 8px;
  text-transform: none;
  font-weight: 600;
  height: 48px;
}
</style>
