<script setup lang="ts">
import { Settings } from 'lucide-vue-next';
</script>

<template>
  <div class="max-w-[1440px] mx-auto px-6 py-6 animate-fade-in">
    <h1 class="text-headline-xl text-content-primary mb-2">Settings</h1>
    <p class="text-body-lg text-content-secondary mb-8">
      Application preferences and account configuration.
    </p>

    <div class="panel flex flex-col items-center justify-center py-24">
      <div class="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
        <Settings class="w-8 h-8 text-content-muted" />
      </div>
      <h2 class="text-headline-md text-content-primary mb-2">Settings</h2>
      <p class="text-body-md text-content-secondary text-center max-w-md">
        Unit preferences, default styles, account settings, and export configurations will be available here.
      </p>
    </div>
  </div>
</template>
