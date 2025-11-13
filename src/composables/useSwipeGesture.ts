import { ref, onMounted, onUnmounted } from 'vue'

export function useSwipeGesture(callbacks: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}) {
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  
  const minSwipeDistance = 50
  
  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.value = event.touches[0].clientX
    touchStartY.value = event.touches[0].clientY
  }
  
  const handleTouchEnd = (event: TouchEvent) => {
    touchEndX.value = event.changedTouches[0].clientX
    touchEndY.value = event.changedTouches[0].clientY
    
    handleSwipe()
  }
  
  const handleSwipe = () => {
    const deltaX = touchEndX.value - touchStartX.value
    const deltaY = touchEndY.value - touchStartY.value
    
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    // 确保是水平滑动而不是垂直滑动
    if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
      if (deltaX > 0) {
        callbacks.onSwipeRight?.()
      } else {
        callbacks.onSwipeLeft?.()
      }
    }
    
    // 垂直滑动
    if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
      if (deltaY > 0) {
        callbacks.onSwipeDown?.()
      } else {
        callbacks.onSwipeUp?.()
      }
    }
  }
  
  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  })
  
  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)
  })
  
  return {
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY
  }
}