import { ref, onMounted } from 'vue'

export function useAnimation() {
  const animateElement = (element: HTMLElement, animation: string, duration: number = 300) => {
    return new Promise<void>((resolve) => {
      element.style.animation = `${animation} ${duration}ms ease-in-out`
      
      setTimeout(() => {
        element.style.animation = ''
        resolve()
      }, duration)
    })
  }
  
  const fadeIn = (element: HTMLElement, duration: number = 300) => {
    return animateElement(element, 'fadeIn', duration)
  }
  
  const slideInLeft = (element: HTMLElement, duration: number = 300) => {
    return animateElement(element, 'slideInLeft', duration)
  }
  
  const slideInRight = (element: HTMLElement, duration: number = 300) => {
    return animateElement(element, 'slideInRight', duration)
  }
  
  const bounceIn = (element: HTMLElement, duration: number = 500) => {
    return animateElement(element, 'bounceIn', duration)
  }
  
  const shake = (element: HTMLElement, duration: number = 400) => {
    return animateElement(element, 'shake', duration)
  }
  
  const pulse = (element: HTMLElement, duration: number = 1000) => {
    return animateElement(element, 'pulse', duration)
  }
  
  onMounted(() => {
    // 添加CSS动画样式
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.3s ease-in-out;
      }
      
      .animate-slide-in-right {
        animation: slideInRight 0.3s ease-in-out;
      }
      
      .animate-bounce-in {
        animation: bounceIn 0.5s ease-in-out;
      }
      
      .animate-shake {
        animation: shake 0.4s ease-in-out;
      }
      
      .animate-pulse {
        animation: pulse 1s ease-in-out;
      }
    `
    document.head.appendChild(style)
  })
  
  return {
    animateElement,
    fadeIn,
    slideInLeft,
    slideInRight,
    bounceIn,
    shake,
    pulse
  }
}