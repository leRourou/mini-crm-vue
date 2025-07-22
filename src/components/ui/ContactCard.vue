<template>
  <div class="contact-card">
    <v-avatar :size="32" :color="avatarColor" class="flex-shrink-0">
      <span class="contact-initials">{{ initials }}</span>
    </v-avatar>
    <div class="contact-info">
      <div class="contact-name">{{ name }}</div>
      <div class="contact-meta">{{ meta }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  meta: string
  initials: string
  avatarColor: string
}

defineProps<Props>()
</script>