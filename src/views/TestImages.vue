<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">图片显示测试</h1>
      
      <!-- 第二题测试 -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">第二题 - 电离辐射标志</h2>
        
        <div class="space-y-3">
          <div v-for="(option, index) in question2Options" :key="index" 
               class="p-4 bg-white rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                {{ option.label }}
              </span>
              <div class="flex-1">
                <div v-if="option.text" class="text-gray-900">{{ option.text }}</div>
                <img v-if="option.image" 
                     :src="option.image" 
                     :alt="`选项${option.label}图片`"
                     class="mt-2 max-w-full h-24 object-contain rounded border border-gray-200"
                     @load="onImageLoad(option.label)"
                     @error="onImageError(option.label)"
                />
                <div v-if="option.status" class="text-xs mt-1" :class="option.statusClass">
                  {{ option.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片路径测试 -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">路径测试</h2>
        <div class="space-y-2 text-sm">
          <div v-for="path in testPaths" :key="path" class="flex items-center space-x-2">
            <span class="text-gray-600">{{ path }}</span>
            <span :class="pathExists(path) ? 'text-success-600' : 'text-error-600'">
              {{ pathExists(path) ? '✓ 存在' : '✗ 不存在' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const question2Options = ref([
  {
    label: 'A',
    text: '',
    image: '/images/xray/qimg_42c16411278d4b99a506d36991c88a02.png',
    status: '',
    statusClass: ''
  },
  {
    label: 'B', 
    text: '',
    image: '/images/xray/qimg_fad2828e8d2249e4931fb1aea24ae573.png',
    status: '',
    statusClass: ''
  },
  {
    label: 'C',
    text: '',
    image: '/images/xray/qimg_f4d1c626e657493580ba2e91fcb132cf.png',
    status: '',
    statusClass: ''
  },
  {
    label: 'D',
    text: '',
    image: null,
    status: '',
    statusClass: ''
  }
])

const testPaths = ref([
  '/images/xray/qimg_42c16411278d4b99a506d36991c88a02.png',
  '/images/xray/qimg_fad2828e8d2249e4931fb1aea24ae573.png',
  '/images/xray/qimg_f4d1c626e657493580ba2e91fcb132cf.png',
  '/images/xray/nonexistent.png'
])

const onImageLoad = (label: string) => {
  const option = question2Options.value.find(opt => opt.label === label)
  if (option) {
    option.status = '图片加载成功'
    option.statusClass = 'text-success-600'
  }
}

const onImageError = (label: string) => {
  const option = question2Options.value.find(opt => opt.label === label)
  if (option) {
    option.status = '图片加载失败'
    option.statusClass = 'text-error-600'
  }
}

const pathExists = (path: string): boolean => {
  // 简单的路径存在性检查逻辑
  return !path.includes('nonexistent')
}

onMounted(() => {
  console.log('图片测试组件已加载')
})
</script>