<template>
  <div class="edit-contact-modal">
    <div class="display-contact">
      <!-- Contact Display Section -->
      <div class="contact-header">
        <div class="contact-avatar">
          <v-avatar size="64" color="primary">
            <v-icon size="32" color="white">mdi-account</v-icon>
          </v-avatar>
        </div>
        <div class="contact-info">
          <h2 class="contact-name">{{ getContactTitle() }}</h2>
          <div class="contact-meta">
            <v-chip size="small" color="status-new" variant="tonal">
              <v-icon start size="12">mdi-account</v-icon>
              Contact
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="contact-actions">
        <div class="actions-header">
          <v-icon size="16" color="primary">mdi-cog</v-icon>
          <span class="actions-title">Actions</span>
        </div>
        <div class="actions-buttons">
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-pencil-outline"
            @click="$emit('edit-contact')"
            class="action-btn"
          >
            Edit
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            prepend-icon="mdi-delete-outline"
            @click="$emit('delete-contact')"
            class="action-btn"
          >
            Delete
          </v-btn>
        </div>
      </div>

      <!-- Contact Details Display -->
      <div class="contact-details">
        <div class="info-section">
          <div class="section-header">
            <v-icon color="primary" size="20">mdi-account</v-icon>
            <span class="section-title">Personal Information</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">First Name</div>
              <div class="info-value">{{ contact?.firstname || 'N/A' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Last Name</div>
              <div class="info-value">{{ contact?.lastname || 'N/A' }}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="section-header">
            <v-icon color="success" size="20">mdi-email</v-icon>
            <span class="section-title">Contact Information</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">Email</div>
              <div class="info-value">{{ contact?.email || 'N/A' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone</div>
              <div class="info-value">{{ contact?.phone || 'N/A' }}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="section-header">
            <v-icon color="info" size="20">mdi-office-building</v-icon>
            <span class="section-title">Company Information</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">Company</div>
              <div class="info-value">
                <div class="company-display">
                  <v-icon icon="mdi-office-building" size="16" class="me-2" color="info"></v-icon>
                  {{ getCompanyName(contact?.company) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Contact } from '../types/Contact'

interface Props {
  contact?: Contact | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-contact': []
  'delete-contact': []
}>()

/**
 * Get contact display title following SOLID principles
 * Single Responsibility: Format contact name for display
 */
const getContactTitle = (): string => {
  if (!props.contact) return 'No Contact Selected'
  
  const { firstname, lastname } = props.contact
  if (firstname && lastname) {
    return `${firstname} ${lastname}`
  }
  if (firstname) return firstname
  if (lastname) return lastname
  return 'Unnamed Contact'
}

/**
 * Get company name with fallback following DRY principles
 */
const getCompanyName = (company: any): string => {
  if (!company) return 'No Company'
  if (typeof company === 'string') return company
  return company.name || 'Unknown Company'
}
</script>

<style scoped>
/* Use the same styling as other edit modals with contact-specific colors */
.edit-contact-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.display-contact {
  height: 100%;
  overflow-y: auto;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.contact-avatar {
  position: relative;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.contact-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-actions {
  margin-bottom: 16px;
}

.actions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.actions-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.actions-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.info-section {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  flex: 1;
}

.company-display {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .contact-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-value {
    text-align: left;
  }
  
  .company-display {
    justify-content: flex-start;
  }
}
</style>
