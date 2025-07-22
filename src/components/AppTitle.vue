<template>
  <h1 class="d-flex align-center">
    <v-icon class="mr-1">{{ icon }}</v-icon>
    {{ title }}
  </h1>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  title: string,
  icon: string
}>()
</script>