<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <!-- 结果卡片 -->
      <div class="card p-6 text-center mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-4">
          <svg class="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-2">练习完成！</h2>
        <p class="text-gray-600 mb-6">恭喜您完成了本次练习</p>
        
        <!-- 统计信息 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-primary-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary-600">{{ correctCount }}</div>
            <div class="text-sm text-gray-600">正确</div>
          </div>
          <div class="bg-error-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-error-600">{{ wrongCount }}</div>
            <div class="text-sm text-gray-600">错误</div>
          </div>
        </div>
        
        <!-- 正确率 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">正确率</span>
            <span class="text-sm font-medium text-gray-900">{{ accuracy }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-primary-500 to-success-500 h-3 rounded-full transition-all duration-500"
              :style="{ width: accuracy + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- 用时 -->
        <div class="text-sm text-gray-600 mb-6">
          用时：{{ formatDuration(duration) }}
        </div>
      </div>

      <!-- 错题统计 -->
      <div v-if="wrongCount > 0" class="card p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">错题统计</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">新增错题</span>
            <span class="text-sm font-medium text-gray-900">{{ newWrongQuestions }} 道</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">错题本总数</span>
            <span class="text-sm font-medium text-gray-900">{{ totalWrongQuestions }} 道</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="space-y-3">
        <button
          @click="goHome"
          class="w-full btn-secondary"
        >
          返回首页
        </button>
        
        <button
          v-if="wrongCount > 0"
          @click="goToWrongBook"
          class="w-full btn-primary"
        >
          查看错题本
        </button>
        
        <button
          @click="startNewPractice"
          class="w-full btn-primary"
        >
          再次练习
        </button>
      </div>

      <!-- 学习建议 -->
      <div v-if="accuracy < 60" class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div class="text-sm text-yellow-800">
            <p class="font-medium mb-1">学习建议</p>
            <p>您的正确率较低，建议多复习错题，加强基础知识的学习。</p>
          </div>
        </div>
      </div>
      
      <div v-else-if="accuracy >= 90" class="mt-6 p-4 bg-success-50 rounded-lg border border-success-200">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-success-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="text-sm text-success-800">
            <p class="font-medium mb-1">表现优秀！</p>
            <p>您的正确率很高，继续保持，可以尝试更有挑战性的题目。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'

const router = useRouter()
const questionStore = useQuestionStore()

const correctCount = computed(() => questionStore.correctCount)
const wrongCount = computed(() => questionStore.wrongCount)
const accuracy = computed(() => Math.round(questionStore.accuracy))
const totalQuestions = computed(() => questionStore.totalQuestions)

const newWrongQuestions = ref(0)
const totalWrongQuestions = computed(() => questionStore.wrongQuestions.size)
const duration = ref(0)

onMounted(() => {
  // 计算练习时长
  if (questionStore.currentSession) {
    const startTime = questionStore.currentSession.startTime
    const endTime = questionStore.currentSession.endTime || Date.now()
    duration.value = endTime - startTime
    
    // 计算新增错题数
    const sessionWrongAnswers = questionStore.currentSession.answers.filter(a => !a.isCorrect)
    newWrongQuestions.value = sessionWrongAnswers.length
  }
})

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}分${seconds}秒`
}

const goHome = () => {
  router.push('/')
}

const goToWrongBook = () => {
  router.push('/wrong-book')
}

const startNewPractice = async () => {
  await questionStore.loadQuestions()
  questionStore.startNewSession()
  router.push('/question')
}
</script>