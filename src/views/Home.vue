<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <!-- 应用标题 -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">X射线诊断刷题</h1>
        <p class="text-gray-600">医用X射线诊断与介入放射学</p>
      </div>

      <!-- 功能卡片 -->
      <div class="space-y-4">
        <!-- 开始刷题 -->
        <button 
          @click="startPractice" 
          class="w-full p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-semibold text-gray-900">开始刷题</h3>
              <p class="text-sm text-gray-600">共 {{ totalQuestions }} 道题目</p>
            </div>
            <div class="ml-auto">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- 错题本 -->
        <button 
          @click="goToWrongBook" 
          class="w-full p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0 w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-semibold text-gray-900">错题本</h3>
              <p class="text-sm text-gray-600">{{ wrongBookCount }} 道错题</p>
            </div>
            <div class="ml-auto">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                {{ wrongBookCount }}
              </span>
            </div>
          </div>
        </button>

        <!-- 学习统计 -->
        <div class="p-6 bg-white rounded-xl shadow-lg">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex-shrink-0 w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-semibold text-gray-900">学习统计</h3>
              <p class="text-sm text-gray-600">今日学习情况</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-primary-600">{{ todayTotal }}</div>
              <div class="text-xs text-gray-600">总题数</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-success-600">{{ todayCorrect }}</div>
              <div class="text-xs text-gray-600">正确</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-error-600">{{ todayWrong }}</div>
              <div class="text-xs text-gray-600">错误</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div class="text-sm text-yellow-800">
            <p class="font-medium mb-1">数据存储说明</p>
            <p>您的答题记录和错题本将保存在本地浏览器中。清理浏览器缓存可能会导致数据丢失，建议定期备份重要数据。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'

const router = useRouter()
const questionStore = useQuestionStore()

const totalQuestions = computed(() => questionStore.totalQuestions)
const wrongBookCount = computed(() => questionStore.wrongQuestions.size)

const todayTotal = computed(() => {
  const today = new Date().toDateString()
  const history = JSON.parse(localStorage.getItem('studyHistory') || '[]')
  return history.filter((session: any) => 
    new Date(session.startTime).toDateString() === today
  ).reduce((sum: number, session: any) => sum + session.totalQuestions, 0)
})

const todayCorrect = computed(() => {
  const today = new Date().toDateString()
  const history = JSON.parse(localStorage.getItem('studyHistory') || '[]')
  return history.filter((session: any) => 
    new Date(session.startTime).toDateString() === today
  ).reduce((sum: number, session: any) => sum + session.correctAnswers, 0)
})

const todayWrong = computed(() => {
  const today = new Date().toDateString()
  const history = JSON.parse(localStorage.getItem('studyHistory') || '[]')
  return history.filter((session: any) => 
    new Date(session.startTime).toDateString() === today
  ).reduce((sum: number, session: any) => sum + session.wrongAnswers, 0)
})

const startPractice = async () => {
  await questionStore.loadQuestions()
  questionStore.startNewSession()
  router.push('/question')
}

const goToWrongBook = () => {
  router.push('/wrong-book')
}

onMounted(async () => {
  await questionStore.loadQuestions()
})
</script>