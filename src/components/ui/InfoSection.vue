<template>
  <v-sheet class="glassmorphism-subtle pa-4">
    <div class="section-header">
      <v-icon :color="iconColor" size="20">{{ icon }}</v-icon>
      <span class="section-title">{{ title }}</span>
    </div>
    <div class="section-content">
      <slot />
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
interface Props {
  title: string
  icon: string
  iconColor: string
}

defineProps<Props>()
</script>