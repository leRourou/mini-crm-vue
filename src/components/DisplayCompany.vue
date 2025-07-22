<template>
  <div class="edit-company-modal">
    <div class="display-company">
      <!-- Company Display Section -->
      <div class="company-header">
        <div class="company-avatar">
          <v-avatar size="64" color="info">
            <v-icon size="32" color="white">mdi-office-building</v-icon>
          </v-avatar>
        </div>
        <div class="company-info">
          <h2 class="company-name">{{ getCompanyTitle() }}</h2>
          <div class="company-meta">
            <v-chip size="small" color="status-progress" variant="tonal">
              <v-icon start size="12">mdi-office-building</v-icon>
              Company
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="company-actions">
        <div class="actions-header">
          <v-icon size="16" color="info">mdi-cog</v-icon>
          <span class="actions-title">Actions</span>
        </div>
        <div class="actions-buttons">
          <v-btn
            color="info"
            variant="tonal"
            size="small"
            prepend-icon="mdi-pencil-outline"
            @click="$emit('edit-company')"
            class="action-btn"
          >
            Edit
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            prepend-icon="mdi-delete-outline"
            @click="$emit('delete-company')"
            class="action-btn"
          >
            Delete
          </v-btn>
        </div>
      </div>

      <!-- Company Details Display -->
      <div class="company-details">
        <div class="info-section">
          <div class="section-header">
            <v-icon color="info" size="20">mdi-office-building</v-icon>
            <span class="section-title">Basic Information</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">Company Name</div>
              <div class="info-value">{{ company?.name || 'N/A' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Description</div>
              <div class="info-value">{{ company?.description || 'N/A' }}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="section-header">
            <v-icon color="success" size="20">mdi-contact-phone</v-icon>
            <span class="section-title">Contact Information</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">Phone</div>
              <div class="info-value">{{ company?.phone || 'N/A' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Website</div>
              <div class="info-value">{{ company?.website || 'N/A' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Address</div>
              <div class="info-value">{{ company?.address || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Company } from '../types/Company'

interface Props {
  company?: Company | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-company': []
  'delete-company': []
}>()

/**
 * Get company display title following SOLID principles
 * Single Responsibility: Format company name for display
 */
const getCompanyTitle = (): string => {
  if (!props.company) return 'No Company Selected'
  
  const { name } = props.company
  if (name) return name
  return 'Unnamed Company'
}
</script>

<style scoped>
.edit-company-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.display-company {
  height: 100%;
  overflow-y: auto;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.company-avatar {
  position: relative;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-actions {
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

.company-details {
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

@media (max-width: 768px) {
  .company-header {
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
}
</style>
