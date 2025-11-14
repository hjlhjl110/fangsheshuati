<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
    <!-- 移动端安全区域 -->
    <div class="safe-area-top safe-area-bottom">
      <div class="container mx-auto px-4 py-6 max-w-md min-h-screen flex flex-col">
        <!-- 应用标题区域 -->
        <header class="text-center mb-8 mt-4">
          <!-- 深色模式切换按钮 -->
          <div class="flex justify-end mb-4">
            <button
              @click="toggleTheme"
              class="btn-ghost p-2 rounded-full ripple-effect active-scale"
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
          </div>

          <!-- Logo和标题 -->
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-medical-lg mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-high-contrast mb-2">X射线诊断刷题</h1>
            <p class="text-medium-contrast text-sm">医用X射线诊断与介入放射学</p>
          </div>

          <!-- 今日激励语 -->
          <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-4 mb-6">
            <p class="text-sm font-medium">
              {{ getDailyMotivation() }}
            </p>
          </div>
        </header>

        <!-- 主要功能区域 -->
        <main class="flex-1 space-y-4">
          <!-- 开始刷题 - 主要操作 -->
          <button
            @click="startPractice"
            class="w-full card-interactive bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-l-4 border-primary-500 p-6 group"
          >
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-fast">
                <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-lg font-semibold text-high-contrast mb-1">开始刷题</h3>
                <p class="text-medium-contrast text-sm">{{ totalQuestions }} 道题目待挑战</p>
              </div>
              <div class="flex-shrink-0">
                <div class="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  开始
                </div>
              </div>
            </div>
          </button>

          <!-- 错题练习 -->
          <button
            @click="goToWrongBook"
            class="w-full card-interactive border-l-4 border-warning-500 p-6 group"
            :disabled="wrongBookCount === 0"
          >
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0 w-12 h-12 bg-warning-100 dark:bg-warning-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-fast">
                <svg class="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-lg font-semibold text-high-contrast mb-1">错题本</h3>
                <p class="text-medium-contrast text-sm">
                  {{ wrongBookCount > 0 ? `${wrongBookCount} 道错题待复习` : '暂无错题' }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <span v-if="wrongBookCount > 0" class="bg-warning-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {{ wrongBookCount }}
                </span>
                <span v-else class="text-low-contrast text-sm">
                  暂无
                </span>
              </div>
            </div>
          </button>

          <!-- 学习统计卡片 -->
          <div class="w-full card card-standard border-l-4 border-success-500">
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex-shrink-0 w-12 h-12 bg-success-100 dark:bg-success-900/50 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-lg font-semibold text-high-contrast">今日学习</h3>
                <p class="text-medium-contrast text-sm">学习进度追踪</p>
              </div>
            </div>

            <!-- 统计数据 -->
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ todayTotal }}</div>
                <div class="text-xs text-medium-contrast">总题数</div>
              </div>
              <div class="text-center p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <div class="text-xl font-bold text-success-600 dark:text-success-400">{{ todayCorrect }}</div>
                <div class="text-xs text-medium-contrast">正确</div>
              </div>
              <div class="text-center p-3 bg-error-50 dark:bg-error-900/20 rounded-lg">
                <div class="text-xl font-bold text-error-600 dark:text-error-400">{{ todayWrong }}</div>
                <div class="text-xs text-medium-contrast">错误</div>
              </div>
            </div>

            <!-- 正确率显示 -->
            <div v-if="todayTotal > 0" class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-medium-contrast">正确率</span>
                <span class="text-sm font-medium text-high-contrast">{{ Math.round((todayCorrect / todayTotal) * 100) }}%</span>
              </div>
              <div class="progress-bar h-2">
                <div
                  class="progress-fill bg-gradient-to-r from-success-400 to-success-500"
                  :style="{ width: `${(todayCorrect / todayTotal) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 快捷工具区域 -->
          <div class="grid grid-cols-2 gap-3">
            <button
              class="card-interactive p-4 text-center"
              title="批量添加题目"
              @click="showBulkAdd = true"
            >
              <svg class="w-6 h-6 text-secondary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <div class="text-sm font-medium text-high-contrast">批量添加</div>
            </button>

            <button
              class="card-interactive p-4 text-center"
              title="AI解析助手"
              @click="showAiTest = true"
            >
              <svg class="w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <div class="text-sm font-medium text-high-contrast">AI助手</div>
            </button>
          </div>
        </main>

        <!-- 底部提示信息 -->
        <footer class="mt-8 mb-4">
          <div class="card card-compact bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
            <div class="flex items-start space-x-3">
              <svg class="w-4 h-4 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="text-xs text-warning-800 dark:text-warning-200">
                <p class="font-medium mb-1">数据存储提醒</p>
                <p>数据保存在本地浏览器，清理缓存会丢失记录，建议定期备份重要数据。</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <BulkAddDialog
      v-if="showBulkAdd"
      @close="showBulkAdd = false"
      @added="handleBulkAdded"
    />

    <AiTestDialog
      v-if="showAiTest"
      @close="showAiTest = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import { useDarkMode } from '@/composables/useDarkMode'
import BulkAddDialog from '@/components/BulkAddDialog.vue'
import AiTestDialog from '@/components/AiTestDialog.vue'

const router = useRouter()
const questionStore = useQuestionStore()

// 深色模式支持
const { isDark, toggleTheme } = useDarkMode()

// 弹窗状态
const showBulkAdd = ref(false)
const showAiTest = ref(false)

// 计算属性
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

/**
 * 获取每日激励语
 * 根据时间和学习进度显示不同的激励内容
 */
const getDailyMotivation = () => {
  const hour = new Date().getHours()
  const motivations = []

  // 时间相关的激励语
  if (hour < 6) {
    motivations.push('深夜学习，值得敬佩！记得休息哦 🌙')
  } else if (hour < 9) {
    motivations.push('早安！利用清晨时光提升专业技能 ☀️')
  } else if (hour < 12) {
    motivations.push('上午学习效果好，继续保持！💪')
  } else if (hour < 14) {
    motivations.push('午休时间刷题，劳逸结合最棒 🍱')
  } else if (hour < 18) {
    motivations.push('下午时光，专注学习提升自己 📚')
  } else if (hour < 22) {
    motivations.push('晚间学习，为明天充电 🌟')
  } else {
    motivations.push('夜深了，注意劳逸结合 🌜')
  }

  // 进度相关的激励语
  if (todayTotal.value > 0) {
    const accuracy = todayTotal.value > 0 ? Math.round((todayCorrect.value / todayTotal.value) * 100) : 0

    if (accuracy >= 90) {
      motivations.push('今天正确率很高，继续保持！🎯')
    } else if (accuracy >= 70) {
      motivations.push('稳步提升，每一天都在进步！📈')
    } else {
      motivations.push('错题是进步的阶梯，加油！🚀')
    }

    if (todayTotal.value >= 50) {
      motivations.push('今日学习量充足，非常充实！🏆')
    }
  } else {
    motivations.push('开始今天的练习吧！每道题都是进步 💫')
  }

  // 随机选择一条激励语
  return motivations[Math.floor(Math.random() * motivations.length)]
}

/**
 * 开始练习
 */
const startPractice = async () => {
  await questionStore.loadQuestions()
  questionStore.startNewSession()
  router.push('/question')
}

/**
 * 跳转到错题本
 */
const goToWrongBook = () => {
  router.push('/wrong-book')
}

/**
 * 处理批量添加完成
 */
const handleBulkAdded = (list: any[]) => {
  if (list && list.length > 0) {
    // 添加成功的提示可以通过更优雅的方式显示
    console.log(`成功添加 ${list.length} 道题目`)
  }
  showBulkAdd.value = false
}

onMounted(async () => {
  // 初始化题库
  await questionStore.loadQuestions()

  // 添加页面可见性变化监听，优化移动端性能
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 页面重新可见时，可以刷新一些状态
      console.log('页面重新可见')
    }
  })

  // 监听页面焦点变化
  window.addEventListener('focus', () => {
    // 页面获得焦点时的处理
    console.log('页面获得焦点')
  })
})
</script>