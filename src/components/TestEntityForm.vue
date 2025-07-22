<template>
  <div class="test-container">
    <h2>Entity Form Relationship Test</h2>
    
    <v-btn @click="testCompanyForm" color="primary" class="ma-2">
      Test Company Form (No Relationships)
    </v-btn>
    
    <v-btn @click="testContactForm" color="success" class="ma-2">
      Test Contact Form (Company Relationship)
    </v-btn>
    
    <v-btn @click="testTaskForm" color="warning" class="ma-2">
      Test Task Form (Contact Relationship)
    </v-btn>
    
    <!-- Company Form -->
    <CompanyForm
      ref="companyFormRef"
      :company="null"
      @create-company="onCompanyCreate"
    />
    
    <!-- Contact Form -->
    <ContactForm
      ref="contactFormRef"
      :contact="null"
      @create-contact="onContactCreate"
    />
    
    <!-- Task Form -->
    <TaskForm
      ref="taskFormRef"
      :task="null"
      @create-task="onTaskCreate"
    />
    
    <div class="debug-info mt-4">
      <h3>Debug Information:</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CompanyForm from './CompanyForm.vue'
import ContactForm from './ContactForm.vue'
import TaskForm from './TaskForm.vue'
import { useCompanyStore } from '../stores/companies'
import { useContactStore } from '../stores/contacts'

const companyFormRef = ref()
const contactFormRef = ref()
const taskFormRef = ref()

const debugInfo = ref<Record<string, unknown>>({})

const companyStore = useCompanyStore()
const contactStore = useContactStore()

const testCompanyForm = async () => {
  debugInfo.value = { action: 'Opening Company Form (no relationships)' }
  companyFormRef.value?.openCreateDialog()
}

const testContactForm = async () => {
  debugInfo.value = { 
    action: 'Opening Contact Form (company relationship)',
    companiesLoaded: companyStore.items.length,
    companiesLoading: companyStore.loading
  }
  contactFormRef.value?.openCreateDialog()
}

const testTaskForm = async () => {
  debugInfo.value = { 
    action: 'Opening Task Form (contact relationship)',
    contactsLoaded: contactStore.items.length,
    contactsLoading: contactStore.loading
  }
  taskFormRef.value?.openCreateDialog()
}

const onCompanyCreate = (company: unknown) => {
  debugInfo.value = { ...debugInfo.value, createdCompany: company }
}

const onContactCreate = (contact: unknown) => {
  debugInfo.value = { ...debugInfo.value, createdContact: contact }
}

const onTaskCreate = (task: unknown) => {
  debugInfo.value = { ...debugInfo.value, createdTask: task }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
}

.debug-info {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>