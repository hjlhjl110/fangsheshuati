import { ref, onMounted, onUnmounted } from 'vue'

export function useMobileOptimization() {
  const isMobile = ref(false)
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)
  
  const checkMobile = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    isMobile.value = window.innerWidth < 768
  }
  
  const preventZoom = () => {
    // 防止双击缩放
    let lastTouchEnd = 0
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
    
    // 防止手势缩放
    document.addEventListener('gesturestart', (e) => e.preventDefault())
    document.addEventListener('gesturechange', (e) => e.preventDefault())
    document.addEventListener('gestureend', (e) => e.preventDefault())
  }
  
  const optimizeTouch = () => {
    // 优化触摸反馈
    document.addEventListener('touchstart', () => {}, { passive: true })
    
    // 防止iOS橡皮筋效果
    document.body.addEventListener('touchmove', (e) => {
      if (e.target === document.body) {
        e.preventDefault()
      }
    }, { passive: false })
  }
  
  const setupViewport = () => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    }
  }
  
  onMounted(() => {
    checkMobile()
    preventZoom()
    optimizeTouch()
    setupViewport()
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
    window.removeEventListener('orientationchange', checkMobile)
  })
  
  return {
    isMobile,
    screenWidth,
    screenHeight
  }
}