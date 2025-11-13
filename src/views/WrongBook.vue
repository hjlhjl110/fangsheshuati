<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <button 
            @click="goBack" 
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <h1 class="text-lg font-semibold text-gray-900">错题本</h1>
          
          <button 
            @click="showFilter = !showFilter" 
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707L12 15.414V21l-4-4v-1.586a1 1 0 01.293-.707L3 6.586V4z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div v-if="showFilter" class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex space-x-2">
        <button
          @click="setFilter('all')"
          :class="['px-3 py-1 text-sm rounded-full transition-colors', filterType === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600']"
        >
          全部 ({{ wrongQuestions.length }})
        </button>
        <button
          @click="setFilter('frequent')"
          :class="['px-3 py-1 text-sm rounded-full transition-colors', filterType === 'frequent' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600']"
        >
          常错题 ({{ frequentWrongQuestions.length }})
        </button>
        <button
          @click="setFilter('recent')"
          :class="['px-3 py-1 text-sm rounded-full transition-colors', filterType === 'recent' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600']"
        >
          最近 ({{ recentWrongQuestions.length }})
        </button>
      </div>
    </div>

    <!-- 错题列表 -->
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <div v-if="filteredQuestions.length === 0" class="text-center py-12">
        <div class="text-gray-500 mb-2">暂无错题</div>
        <div class="text-sm text-gray-400">答错的题目会自动添加到错题本</div>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="item in filteredQuestions"
          :key="item.question.id"
          class="card p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                错题 {{ item.wrongCount }} 次
              </span>
              <span class="text-sm text-gray-500">
                {{ formatTime(item.lastWrongTime) }}
              </span>
            </div>
            <button
              @click="removeFromWrongBook(item.question.id)"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="mb-3">
            <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {{ item.question.question }}
            </h3>
            <div v-if="item.question.hasImage" class="mb-2">
              <img
                :src="item.question.imagePath.replace('public/', '/')"
                :alt="`错题${item.question.id}图片`"
                class="w-full h-32 object-cover rounded-lg border border-gray-200"
                @error="handleImageError"
              />
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="reviewQuestion(item.question)"
              class="flex-1 btn-primary text-sm"
            >
              重新练习
            </button>
            <button
              @click="showQuestionDetail(item.question)"
              class="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 批量操作 -->
      <div v-if="wrongQuestions.length > 0" class="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex space-x-3">
          <button
            @click="startWrongQuestionPractice"
            class="flex-1 btn-primary"
          >
            开始错题练习
          </button>
          <button
            @click="clearWrongBook"
            class="flex-1 btn-secondary"
          >
            清空错题本
          </button>
        </div>
      </div>
    </div>

    <!-- 题目详情弹窗 -->
    <div v-if="showDetail" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">题目详情</h3>
            <button
              @click="showDetail = false"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="detailQuestion" class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">题目</h4>
              <p class="text-sm text-gray-700">{{ detailQuestion.question }}</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">选项</h4>
              <div class="space-y-2">
                <div
                  v-for="(option, index) in detailQuestion.options"
                  :key="index"
                  :class="['p-2 rounded-lg text-sm', option.charAt(0) === detailQuestion.answer ? 'bg-success-50 text-success-800 border border-success-200' : 'bg-gray-50 text-gray-700']"
                >
                  <div class="flex items-center space-x-2">
                    <span class="font-medium">{{ option.charAt(0) }}、</span>
                    <div class="flex-1">
                      <span v-if="getOptionText(option)">{{ getOptionText(option) }}</span>
                      <div v-if="getOptionImages(option).length > 0" class="mt-1 space-y-1">
                        <img 
                          v-for="(imagePath, index) in getOptionImages(option)"
                          :key="imagePath"
                          :src="imagePath"
                          :alt="`选项${option.charAt(0)}图片${index + 1}`"
                          class="max-w-full h-16 object-contain rounded border border-gray-200"
                          @error="handleImageError"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="detailQuestion.explanation">
              <h4 class="text-sm font-medium text-gray-900 mb-2">解析</h4>
              <p class="text-sm text-gray-700">{{ detailQuestion.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import type { Question } from '@/types'

const router = useRouter()
const questionStore = useQuestionStore()

const showFilter = ref(false)
const filterType = ref<'all' | 'frequent' | 'recent'>('all')
const showDetail = ref(false)
const detailQuestion = ref<Question | null>(null)

const wrongQuestions = computed(() => {
  return Array.from(questionStore.wrongQuestions.values())
})

const frequentWrongQuestions = computed(() => {
  return wrongQuestions.value.filter(item => item.wrongCount >= 3)
})

const recentWrongQuestions = computed(() => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return wrongQuestions.value.filter(item => item.lastWrongTime >= oneWeekAgo)
})

const filteredQuestions = computed(() => {
  switch (filterType.value) {
    case 'frequent':
      return frequentWrongQuestions.value
    case 'recent':
      return recentWrongQuestions.value
    default:
      return wrongQuestions.value
  }
})

const setFilter = (type: 'all' | 'frequent' | 'recent') => {
  filterType.value = type
  showFilter.value = false
}

const removeFromWrongBook = (questionId: number) => {
  questionStore.removeFromWrongQuestions(questionId)
}

const reviewQuestion = (question: Question) => {
  const index = questionStore.questions.findIndex(q => q.id === question.id)
  if (index !== -1) {
    questionStore.goToQuestion(index)
    router.push('/question')
  }
}

const showQuestionDetail = (question: Question) => {
  detailQuestion.value = question
  showDetail.value = true
}

const startWrongQuestionPractice = () => {
  if (wrongQuestions.value.length === 0) return
  
  const wrongQuestionIds = wrongQuestions.value.map(item => item.question.id)
  const firstWrongQuestionIndex = questionStore.questions.findIndex(q => q.id === wrongQuestionIds[0])
  
  if (firstWrongQuestionIndex !== -1) {
    questionStore.goToQuestion(firstWrongQuestionIndex)
    questionStore.startNewSession()
    router.push('/question')
  }
}

const clearWrongBook = () => {
  if (confirm('确定要清空错题本吗？此操作不可恢复。')) {
    wrongQuestions.value.forEach(item => {
      questionStore.removeFromWrongQuestions(item.question.id)
    })
  }
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} 分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`
  } else {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))} 天前`
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const getOptionText = (option: string): string => {
  // 移除前缀（A、B、C、D、）并清理空格
  const textPart = option.substring(2).trim()
  
  // 如果包含图片路径，则只返回文本部分
  if (textPart.includes('/images/xray/')) {
    return ''
  }
  
  return textPart
}

const getOptionImages = (option: string): string[] => {
  // 检查是否包含图片路径，返回所有匹配的图片路径
  const matches = option.match(/\/images\/xray\/[^\s]+/g)
  return matches || []
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (questionStore.questions.length === 0) {
    questionStore.loadQuestions()
  }
})
</script>