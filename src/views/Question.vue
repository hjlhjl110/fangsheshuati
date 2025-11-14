<template>
  <div class="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
    <!-- 移动端优化顶部导航栏 -->
    <div class="sticky top-0 z-20 bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur">
      <div class="px-4 py-3">
        <!-- 主导航区 -->
        <div class="flex items-center justify-between mb-3">
          <!-- 返回按钮 - 单手操作优化 -->
          <button
            @click="goBack"
            class="btn-ghost p-2 rounded-mobile-lg active-scale"
            aria-label="返回"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <!-- 题目进度信息 -->
          <div class="flex-1 mx-2">
            <div class="text-center">
              <div class="text-sm font-medium text-high-contrast mb-1">
                第 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }} 题
                <span v-if="hasEditedData" class="status-warning ml-2">已编辑</span>
              </div>
              <!-- 紧凑型进度条 -->
              <div class="progress-bar h-1.5">
                <div
                  class="progress-fill bg-gradient-to-r from-primary-400 to-primary-500"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 右侧按钮组 -->
          <div class="flex items-center space-x-1">
            <!-- 题目列表按钮 -->
            <button
              @click="showMenu = !showMenu"
              class="btn-ghost p-2 rounded-mobile-lg active-scale relative"
              aria-label="题目列表"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span v-if="questionStats.answered > 0" class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {{ questionStats.answered }}
              </span>
            </button>

            <!-- 深色模式切换按钮 -->
            <button
              @click="toggleTheme"
              class="btn-ghost p-2 rounded-mobile-lg active-scale ripple-effect"
              :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
              aria-label="切换深色模式"
            >
              <svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
            <button
              @click="showEditor = true"
              class="btn-ghost p-2 rounded-mobile-lg active-scale"
              title="编辑题目"
              aria-label="编辑题目"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- 统计信息条 -->
        <div class="flex justify-center space-x-3 text-xs">
          <div class="status-info flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            已答: {{ questionStats.answered }}
          </div>
          <div class="status-success flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            正确: {{ questionStats.correct }}
          </div>
          <div class="status-error flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            错误: {{ questionStats.wrong }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 pt-4 pb-24">
      <!-- 加载状态 -->
      <div v-if="!currentQuestion" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
          <div class="text-medium-contrast">题目加载中...</div>
        </div>
      </div>

      <!-- 题目内容 -->
      <div v-else class="max-w-2xl mx-auto space-y-6">
        <!-- 题目卡片 -->
        <div class="card card-spacious shadow-lg">
          <!-- 题目标题 -->
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-semibold text-high-contrast text-balance flex-1 pr-2">
              {{ currentQuestion.question }}
            </h2>
            <!-- 快捷操作按钮 -->
            <div class="flex space-x-2 flex-shrink-0">
              <button
                @click="showEditor = true"
                class="btn-ghost p-2 rounded-lg text-xs"
                title="编辑题目"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="runAiAnalysis"
                :disabled="aiLoading"
                class="btn-ghost p-2 rounded-lg text-xs disabled:opacity-50"
                title="AI解析"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 题目图片 -->
          <div v-if="currentQuestion.hasImage" class="mb-4">
            <img
              :src="currentQuestion.imagePath.replace('public/', '/')"
              :alt="`题目${currentQuestionIndex + 1}图片`"
              class="w-full rounded-mobile-lg border border-gray-200 dark:border-gray-700 max-h-64 object-contain bg-gray-50 dark:bg-gray-800"
              @error="handleImageError"
              loading="lazy"
            />
          </div>
        </div>

        <!-- 选项列表 -->
        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(option.charAt(0))"
            :disabled="hasAnswered"
            :class="[
              'w-full p-4 text-left rounded-mobile-lg border-2 transition-all duration-200 min-h-touch text-base touch-manipulation active-scale',
              hasAnswered
                ? getOptionClass(option.charAt(0))
                : 'bg-white dark:bg-dark-bg-card border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            ]"
            :aria-label="`选项 ${option.charAt(0)}`"
          >
            <div class="flex items-start space-x-3">
              <!-- 选项标签 -->
              <span
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                :class="hasAnswered ? getOptionLabelClass(option.charAt(0)) : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
              >
                {{ option.charAt(0) }}
              </span>

              <!-- 选项内容 -->
              <div class="flex-1 min-w-0">
                <div v-if="getOptionText(option)" class="text-high-contrast selectable">
                  {{ getOptionText(option) }}
                </div>

                <!-- 选项图片 -->
                <div v-if="getOptionImages(option).length > 0" class="mt-3 space-y-2">
                  <img
                    v-for="(imagePath, index) in getOptionImages(option)"
                    :key="imagePath"
                    :src="imagePath"
                    :alt="`选项${option.charAt(0)}图片${index + 1}`"
                    class="w-full rounded-mobile border border-gray-200 dark:border-gray-700 max-h-32 object-contain bg-gray-50 dark:bg-gray-800"
                    @error="handleImageError"
                    loading="lazy"
                  />
                </div>
              </div>

              <!-- 答案状态图标 -->
              <span v-if="hasAnswered && option.charAt(0) === selectedAnswer" class="flex-shrink-0 mt-1">
                <svg v-if="isCorrect" class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg v-else class="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </span>
            </div>
          </button>
        </div>

        <!-- 答案解析区域 -->
        <div v-if="hasAnswered" class="card card-standard border-l-4" :class="isCorrect ? 'border-success-500 bg-success-50 dark:bg-success-900/10' : 'border-warning-500 bg-warning-50 dark:bg-warning-900/10'">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-2">
              <div class="p-1.5 rounded-full" :class="isCorrect ? 'bg-success-100 text-success-600 dark:bg-success-900/20' : 'bg-warning-100 text-warning-600 dark:bg-warning-900/20'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="font-semibold text-high-contrast">答案解析</h3>
            </div>
            <button
              @click="runAiAnalysis"
              :disabled="aiLoading"
              class="btn-primary text-xs py-1.5 px-3 rounded-lg disabled:opacity-50"
              title="AI深度解析"
            >
              {{ aiLoading ? 'AI解析中...' : 'AI深度解析' }}
            </button>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center space-x-2">
              <span class="font-medium text-medium-contrast">正确答案：</span>
              <span class="status-success font-bold">{{ currentQuestion.answer }}</span>
            </div>

            <div v-if="currentQuestion.explanation" class="border-t border-gray-200 dark:border-gray-700 pt-2">
              <p class="font-medium text-medium-contrast mb-1">解析：</p>
              <p class="text-medium-contrast selectable leading-relaxed">{{ currentQuestion.explanation }}</p>
            </div>

            <p v-else class="text-low-contrast italic">暂无详细解析，点击"AI深度解析"生成详细解析</p>
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="flex space-x-4 pt-4 safe-area-bottom">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="flex-1 btn-secondary active-scale disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            上一题
          </button>
          <button
            @click="nextQuestion"
            :disabled="!hasAnswered"
            class="flex-1 btn-primary active-scale disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLastQuestion ? '查看结果' : '下一题' }}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
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

    <!-- 答案修复弹窗 -->
    <DocxAnswerFixer
      v-if="showAnswerFixer"
      :questions="questions"
      @close="showAnswerFixer = false"
      @fixed="applyAnswerFixes"
    />

    <!-- AI确认弹窗 -->
    <ConfirmSheet
      v-if="showConfirm"
      title="覆盖为AI解析"
      :message="'答案：' + aiAnswer + '\n解析：' + aiExplanation"
      confirm-text="确定"
      cancel-text="取消"
      @confirm="applyAiOverride"
      @cancel="showConfirm = false"
    />

    <!-- 批量添加弹窗 -->
    <BulkAddDialog
      v-if="showBulkAdd"
      @close="showBulkAdd = false"
      @added="handleBulkAdded"
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
import { useDarkMode } from '@/composables/useDarkMode'
import QuestionList from '@/components/QuestionList.vue'
import QuestionEditor from '@/components/QuestionEditor.vue'
import BulkAddDialog from '@/components/BulkAddDialog.vue'
import DocxAnswerFixer from '@/components/DocxAnswerFixer.vue'
import { analyzeQuestion } from '@/lib/ai'
import ConfirmSheet from '@/components/ConfirmSheet.vue'

const router = useRouter()
const questionStore = useQuestionStore()

// 移动端优化和深色模式
const { isMobile } = useMobileOptimization()
const { isDark, toggleTheme } = useDarkMode()

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
const showBulkAdd = ref(false)
const showAnswerFixer = ref(false)
const aiLoading = ref(false)
const showConfirm = ref(false)
const aiAnswer = ref<string>('')
const aiExplanation = ref<string>('')
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
  if (!hasAnswered.value) return 'bg-white dark:bg-dark-bg-card border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
  
  if (option === currentQuestion.value?.answer) {
    return 'bg-success-50 dark:bg-success-900/30 border-success-300 dark:border-success-700 text-success-900 dark:text-success-200'
  } else if (option === selectedAnswer.value && !isCorrect.value) {
    return 'bg-error-50 dark:bg-error-900/30 border-error-300 dark:border-error-700 text-error-900 dark:text-error-200'
  } else {
    return 'bg-gray-50 dark:bg-dark-bg-card border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
  }
}

const getOptionLabelClass = (option: string) => {
  if (!hasAnswered.value) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  
  if (option === currentQuestion.value?.answer) {
    return 'bg-success-600 text-white'
  } else if (option === selectedAnswer.value && !isCorrect.value) {
    return 'bg-error-600 text-white'
  } else {
    return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
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

async function syncSupabase() {
  try {
    await questionStore.syncAllToSupabase()
    alert('同步到 Supabase 成功')
  } catch (e) {
    alert('同步失败：' + String(e))
  }
}

async function applyAnswerFixes(list: { qid: number; answer: string }[]) {
  try {
    await questionStore.updateAnswersBulk(list)
    alert('已修复答案：' + list.length + ' 条')
  } catch (e) {
    alert('修复失败：' + String(e))
  }
}

async function runAiAnalysis() {
  if (!currentQuestion.value) return
  aiLoading.value = true
  try {
    const res = await analyzeQuestion(currentQuestion.value)
    const qid = currentQuestion.value.id
    aiAnswer.value = res.answer
    aiExplanation.value = res.explanation

    // 读取远端现有值（若可用），否则使用本地值
    let remoteAnswer = currentQuestion.value.answer || ''
    let remoteExplanation = currentQuestion.value.explanation || ''
    try {
      const mod = await import('@/lib/supabase')
      const supabase = mod.supabase
      if (supabase) {
        const { data } = await supabase
          .from('questions')
          .select('answer,explanation')
          .eq('qid', qid)
          .limit(1)
        const row = Array.isArray(data) && data[0] ? data[0] : null
        if (row) {
          remoteAnswer = row.answer || ''
          remoteExplanation = row.explanation || ''
        }
      }
    } catch {}

    const needsAnswer = (!remoteAnswer || remoteAnswer.trim().length === 0) && !!res.answer
    const needsExplanation = (!remoteExplanation || remoteExplanation.trim().length === 0) && !!res.explanation

    if (needsAnswer || needsExplanation) {
      await questionStore.patchAnswerExplanation(qid, {
        ...(needsAnswer ? { answer: res.answer } : {}),
        ...(needsExplanation ? { explanation: res.explanation } : {})
      })
    } else {
      // 已有值且不允许覆盖，仅展示AI结果供参考
      showConfirm.value = false
    }
  } catch (e) {
    console.error('AI解析失败:', e)
    const msg = (e as any)?.message || (typeof e === 'string' ? e : JSON.stringify(e))
    alert('AI解析失败：' + msg)
  } finally {
    aiLoading.value = false
  }
}

async function applyAiOverride() {
  if (!currentQuestion.value) return
  await questionStore.updateAnswerAndExplanation(currentQuestion.value.id, aiAnswer.value, aiExplanation.value)
  showConfirm.value = false
}

async function handleBulkAdded(list: any[]) {
  try {
    await questionStore.addQuestions(list as any)
    alert('批量添加成功：' + list.length + ' 条')
  } catch (e) {
    alert('批量添加失败：' + String(e))
  }
}

onMounted(() => {
  if (!currentQuestion.value) {
    router.push('/')
  }
})
</script>
