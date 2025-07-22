<template>
  <GlassCard class="detail-edit-view pa-6 h-100 d-flex flex-column">
    
    <div class="detail-header d-flex align-center ga-4 mb-6 pb-5 border-b-thin border-primary border-opacity-10">
      <v-avatar :size="avatarSize" :color="avatarColor">
        <v-icon :size="iconSize" color="white">{{ icon }}</v-icon>
      </v-avatar>
      <div class="flex-1-1">
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">{{ title }}</h2>
        <div class="d-flex align-center flex-wrap ga-3">
          <v-chip size="small" :color="chipColor" variant="tonal">
            <v-icon start size="12">{{ chipIcon }}</v-icon>
            {{ chipLabel }}
          </v-chip>
          <v-chip v-if="dateLabel" size="small" color="status-new" variant="tonal">
            <v-icon start size="12">mdi-calendar</v-icon>
            {{ dateLabel }}
          </v-chip>
        </div>
      </div>
    </div>

    
    <div v-if="$slots.actions" class="quick-actions d-flex flex-wrap ga-2 mb-6">
      <slot name="actions" />
    </div>

    
    <div class="detail-sections d-flex flex-column ga-6 flex-1-1">
      <slot />
    </div>

    
    <div v-if="$slots.additionalActions" class="additional-actions mt-6 pt-5 border-t-thin border-primary border-opacity-10">
      <slot name="additionalActions" />
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from './GlassCard.vue'

interface Props {
  title: string
  icon: string
  avatarColor: string
  chipColor: string
  chipIcon: string
  chipLabel: string
  dateLabel?: string
  avatarSize?: number
  iconSize?: number
}

withDefaults(defineProps<Props>(), {
  avatarSize: 64,
  iconSize: 32
})
</script>