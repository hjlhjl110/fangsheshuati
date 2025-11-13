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
          
          <div class="flex-1 mx-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
              <div class="flex items-center space-x-2">
                <span class="font-medium">第 {{ currentQuestionIndex + 1 }} 题</span>
                <span v-if="hasEditedData" class="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800" title="正在使用编辑后的数据">
                  已编辑
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  已答: {{ questionStats.answered }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  正确: {{ questionStats.correct }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                  错误: {{ questionStats.wrong }}
                </span>
                <span>共 {{ totalQuestions }} 题</span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
          
          <button 
            @click="showMenu = !showMenu" 
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span v-if="questionStats.answered > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ questionStats.answered }}
            </span>
          </button>
          
          <button 
            @click="showEditor = true" 
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="编辑题目"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 题目内容 -->
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <div v-if="!currentQuestion" class="text-center py-12">
        <div class="text-gray-500">题目加载中...</div>
      </div>
      
      <div v-else class="space-y-6">
        <!-- 题干 -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 text-balance">
            {{ currentQuestion.question }}
          </h2>
          
          <!-- 图片 -->
          <div v-if="currentQuestion.hasImage" class="mb-4">
            <img 
              :src="currentQuestion.imagePath.replace('public/', '/')" 
              :alt="`题目${currentQuestionIndex + 1}图片`"
              class="max-w-full h-auto rounded-lg border border-gray-200"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- 选项 -->
        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(option.charAt(0))"
            :disabled="hasAnswered"
            :class="[
              'w-full p-4 text-left rounded-lg border-2 transition-all duration-200',
              hasAnswered 
                ? getOptionClass(option.charAt(0))
                : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            ]"
            class="touch-manipulation"
          >
            <div class="flex items-start space-x-3">
              <span 
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                :class="hasAnswered ? getOptionLabelClass(option.charAt(0)) : 'bg-gray-100 text-gray-600'"
              >
                {{ option.charAt(0) }}
              </span>
              <div class="flex-1">
                <span v-if="getOptionText(option)" class="text-gray-900">{{ getOptionText(option) }}</span>
                <div v-if="getOptionImages(option).length > 0" class="mt-2 space-y-2">
                  <img 
                    v-for="(imagePath, index) in getOptionImages(option)"
                    :key="imagePath"
                    :src="imagePath"
                    :alt="`选项${option.charAt(0)}图片${index + 1}`"
                    class="max-w-full h-24 object-contain rounded border border-gray-200"
                    @error="handleImageError"
                  />
                </div>
              </div>
              <span v-if="hasAnswered && option.charAt(0) === selectedAnswer" class="flex-shrink-0">
                <svg v-if="isCorrect" class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </span>
            </div>
          </button>
        </div>

        <!-- 答案解析 -->
        <div v-if="hasAnswered && currentQuestion.explanation" class="card p-4 bg-blue-50 border-blue-200">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900 mb-1">答案解析</p>
              <p class="text-sm text-blue-800">{{ currentQuestion.explanation }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-4">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一题
          </button>
          <button
            @click="nextQuestion"
            :disabled="!hasAnswered"
            class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLastQuestion ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 题目列表弹窗 -->
    <QuestionList
      v-if="showMenu"
      :questions="questions"
      :current-index="currentQuestionIndex"
      :answers="answers"
      :has-edited-data="hasEditedData"
      @close="showMenu = false"
      @jump-to-question="goToQuestion"
      @reset-data="resetToOriginal"
    />
    
    <!-- 题目编辑弹窗 -->
    <QuestionEditor
      v-if="showEditor && currentQuestion"
      :question="currentQuestion"
      :question-index="currentQuestionIndex"
      @close="showEditor = false"
      @save="handleQuestionUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import { useMobileOptimization } from '@/composables/useMobileOptimization'
import { useSwipeGesture } from '@/composables/useSwipeGesture'
import { useAnimation } from '@/composables/useAnimation'
import QuestionList from '@/components/QuestionList.vue'
import QuestionEditor from '@/components/QuestionEditor.vue'

const router = useRouter()
const questionStore = useQuestionStore()

// 移动端优化
const { isMobile } = useMobileOptimization()

// 动画效果
const { bounceIn, shake } = useAnimation()

// 滑动手势
useSwipeGesture({
  onSwipeLeft: () => {
    if (!hasAnswered.value && isMobile.value) {
      // 左滑可以显示菜单或下一题
      showMenu.value = true
    }
  },
  onSwipeRight: () => {
    if (isMobile.value) {
      previousQuestion()
    }
  }
})

const showMenu = ref(false)
const showEditor = ref(false)
const hasAnswered = ref(false)
const selectedAnswer = ref('')
const isCorrect = ref(false)

const currentQuestionIndex = computed(() => questionStore.currentQuestionIndex)
const totalQuestions = computed(() => questionStore.totalQuestions)
const currentQuestion = computed(() => questionStore.currentQuestion)
const progress = computed(() => questionStore.progress)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const questions = computed(() => questionStore.questions)
const answers = computed(() => questionStore.answers)

// 计算题目状态统计
const questionStats = computed(() => {
  const stats = {
    total: questions.value.length,
    answered: answers.value.length,
    correct: answers.value.filter(a => a.isCorrect).length,
    wrong: answers.value.filter(a => !a.isCorrect).length,
    unanswered: questions.value.length - answers.value.length
  }
  return stats
})

// 检查是否使用了编辑过的数据
const hasEditedData = computed(() => {
  return localStorage.getItem('questions') !== null
})

const selectAnswer = async (answer: string) => {
  if (hasAnswered.value) return
  
  selectedAnswer.value = answer
  const result = questionStore.answerQuestion(answer)
  isCorrect.value = result || false
  hasAnswered.value = true
  
  // 添加动画效果
  await nextTick()
  const optionButtons = document.querySelectorAll('button[class*="rounded-lg"]')
  optionButtons.forEach((button) => {
    const buttonText = button.textContent || ''
    if (buttonText.includes(answer)) {
      if (isCorrect.value) {
        bounceIn(button as HTMLElement)
      } else {
        shake(button as HTMLElement)
      }
    }
  })
}

const getOptionClass = (option: string) => {
  if (!hasAnswered.value) return 'bg-white border-gray-200'
  
  if (option === currentQuestion.value?.answer) {
    return 'bg-success-50 border-success-300 text-success-900'
  } else if (option === selectedAnswer.value && !isCorrect.value) {
    return 'bg-error-50 border-error-300 text-error-900'
  } else {
    return 'bg-gray-50 border-gray-200 text-gray-500'
  }
}

const getOptionLabelClass = (option: string) => {
  if (!hasAnswered.value) return 'bg-gray-100 text-gray-600'
  
  if (option === currentQuestion.value?.answer) {
    return 'bg-success-600 text-white'
  } else if (option === selectedAnswer.value && !isCorrect.value) {
    return 'bg-error-600 text-white'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    questionStore.endSession()
    router.push('/results')
  } else {
    questionStore.nextQuestion()
    resetAnswerState()
  }
}

const previousQuestion = () => {
  questionStore.previousQuestion()
  resetAnswerState()
}

const goToQuestion = (index: number) => {
  questionStore.goToQuestion(index)
  resetAnswerState()
  showMenu.value = false
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

const resetAnswerState = () => {
  hasAnswered.value = false
  selectedAnswer.value = ''
  isCorrect.value = false
}

const goBack = () => {
  router.push('/')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const handleQuestionUpdate = async (updatedQuestion: any) => {
  try {
    // 更新题目数据
    await questionStore.updateQuestion(currentQuestionIndex.value, updatedQuestion)
    showEditor.value = false
    
    // 显示成功提示（简单的alert，可以后续替换为更好的通知系统）
    alert('题目已更新！编辑的数据已保存到服务器文件。')
  } catch (error) {
    console.error('更新题目失败:', error)
    alert('更新失败：' + (error as Error).message)
  }
}

const resetToOriginal = async () => {
  if (confirm('确定要重置为原始题目数据吗？这将清除所有编辑的内容。')) {
    await questionStore.resetToOriginalQuestions()
    alert('已重置为原始题目数据！')
  }
}

onMounted(() => {
  if (!currentQuestion.value) {
    router.push('/')
  }
})
</script>