<template>
  <div class="base-page">
    
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon :color="iconColor" size="32">{{ icon }}</v-icon>
        </div>
      <div class="header-text">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-description">{{ getPageDescription() }}</p>
      </div>
    </div>
  </div>    
    <div class="content-layout">
      
      <div class="desktop-layout d-none d-lg-flex">
        
        <div class="detail-section-left">
          <div class="detail-panel">
            <Transition name="slide-left" mode="out-in">
              <EditView 
                ref="editViewRef"
                :selectedItem="selectedItem" 
                :entityType="entityType" 
                @entity-updated="handleEntityUpdated"
              />
            </Transition>
          </div>
        </div>
        
        
        <div class="table-section-right">
          <slot name="table"></slot>
        </div>
      </div>
      
      
      <div class="mobile-layout d-lg-none">
        
        <div class="table-section-mobile">
          <slot name="table"></slot>
        </div>
        
        
        <div class="detail-section-mobile">
          <div class="detail-panel">
            <Transition name="slide-up" mode="out-in">
              <EditView 
                ref="editViewRef"
                :selectedItem="selectedItem" 
                :entityType="entityType" 
                @entity-updated="handleEntityUpdated"
              />
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref } from 'vue'
import EditView from './EditView.vue'

const props = defineProps<{
  title: string,
  icon: string,
  selectedItem?: object | null,
  entityType: string
}>()

const emit = defineEmits<{
  'entity-updated': [entity: any]
}>()

const editViewRef = ref<InstanceType<typeof EditView> | null>(null)


const handleEntityUpdated = (entity: any) => {
  emit('entity-updated', entity)
}

const iconColor = computed(() => {
  const colorMap: Record<string, string> = {
    'Contacts': 'status-new',
    'Companies': 'status-progress',
    'Opportunities': 'status-won',
    'Notes': 'status-qualified',
    'Tasks': 'status-prospect',
  }
  return colorMap[props.title] || 'primary'
})

const getPageDescription = () => {
  const descriptions: Record<string, string> = {
    'Contacts': 'Manage your business contacts and relationships',
    'Companies': 'Keep track of company information and partnerships',
    'Opportunities': 'Monitor your sales pipeline and deals',
    'Notes': 'Important notes and communications',
    'Tasks': 'Track your to-do items and follow-ups',
  }
  return descriptions[props.title] || 'Manage your CRM data'
}


defineExpose({
  editViewRef
})
</script>

<style scoped>
.base-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}

.page-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.header-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-btn {
  text-transform: none;
  font-weight: 500;
}

.content-layout {
  width: 100%;
}

.desktop-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.detail-section-left {
  width: 400px;
  flex-shrink: 0;
}

.table-section-right {
  flex: 1;
  min-width: 0;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.table-section-mobile {
  width: 100%;
}

.detail-section-mobile {
  width: 100%;
}

.detail-panel {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

@media (max-width: 1280px) {
  .detail-section-left {
    width: 350px;
  }
}

@media (max-width: 1024px) {
  .detail-panel {
    position: static;
    max-height: none;
  }
}

@media (max-width: 960px) {
  .page-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-description {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .base-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-description {
    font-size: 12px;
  }
  
  .content-row {
    gap: 16px;
  }
}
</style>