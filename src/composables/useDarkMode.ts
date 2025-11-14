/**
 * 深色模式管理
 * 支持系统主题检测和用户偏好存储
 */
import { ref, computed, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

// 响应式主题状态
const theme = ref<Theme>('system')

// 获取系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 计算实际应用的主题
const actualTheme = computed<'light' | 'dark'>(() => {
  if (theme.value === 'system') {
    return getSystemTheme()
  }
  return theme.value
})

// 应用主题到DOM
const applyTheme = (newTheme: 'light' | 'dark') => {
  const root = document.documentElement

  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // 更新meta标签以支持移动端浏览器
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff')
  }

  // 更新iOS状态栏样式
  const metaThemeColor = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', newTheme === 'dark' ? 'black-translucent' : 'default')
  }
}

// 初始化主题
export const useDarkMode = () => {
  // 从localStorage读取用户偏好
  const loadTheme = () => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      theme.value = stored
    }
  }

  // 保存主题偏好
  const saveTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('theme', newTheme)
  }

  // 切换主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    saveTheme(newTheme)
    applyTheme(actualTheme.value)
  }

  // 切换到下一个主题
  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme.value)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme.value === 'system') {
        applyTheme(actualTheme.value)
      }
    }

    // 现代浏览器使用 addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // 兼容旧版浏览器
    else {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }

  // 组件挂载时初始化
  onMounted(() => {
    loadTheme()
    applyTheme(actualTheme.value)

    // 监听系统主题变化
    const unwatch = watchSystemTheme()

    // 监听主题状态变化
    const stopWatcher = watch(actualTheme, (newTheme) => {
      applyTheme(newTheme)
    })

    // 清理函数
    return () => {
      unwatch?.()
      stopWatcher()
    }
  })

  return {
    theme: computed(() => theme.value),
    actualTheme,
    isDark: computed(() => actualTheme.value === 'dark'),
    isLight: computed(() => actualTheme.value === 'light'),
    isSystem: computed(() => theme.value === 'system'),
    setTheme,
    toggleTheme,
  }
}

// 全局主题变量（用于非Vue组件）
export const globalTheme = {
  current: 'system' as Theme,

  init() {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      this.current = stored
    }

    this.apply()
    this.watchSystem()
  },

  set(newTheme: Theme) {
    this.current = newTheme
    localStorage.setItem('theme', newTheme)
    this.apply()
  },

  toggle() {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(this.current)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    this.set(nextTheme)
  },

  apply() {
    const actual = this.current === 'system' ? getSystemTheme() : this.current
    applyTheme(actual)
  },

  watchSystem() {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (this.current === 'system') {
        this.apply()
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }
  }
}

// 自动初始化（用于SSG环境）
if (typeof window !== 'undefined') {
  globalTheme.init()
}