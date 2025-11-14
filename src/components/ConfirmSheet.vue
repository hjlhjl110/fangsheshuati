<template>
  <div class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('cancel')"></div>
    <div class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-xl p-4 space-y-3">
      <div class="text-base font-semibold">{{ title }}</div>
      <div class="text-sm text-gray-600">{{ message }}</div>
      <div class="flex gap-3">
        <button class="flex-1 px-4 py-2 rounded bg-gray-200" @click="$emit('cancel')">{{ cancelText || '取消' }}</button>
        <button class="flex-1 px-4 py-2 rounded bg-blue-600 text-white" @click="$emit('confirm')">{{ confirmText || '确定' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; message: string; confirmText?: string; cancelText?: string }>()
defineEmits(['confirm','cancel'])
</script>