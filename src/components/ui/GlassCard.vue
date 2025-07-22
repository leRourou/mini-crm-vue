<template>
  <v-card
    class="glassmorphism-card"
    :elevation="0"
    :rounded="rounded"
    v-bind="$attrs"
  >
    <slot />
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  rounded?: string | number
}

withDefaults(defineProps<Props>(), {
  rounded: 'lg'
})
</script>