<template>
  <div 
    class="question-list-overlay" 
    @click="$emit('close')"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="question-list-container" @click.stop>
      <!-- Header -->
      <div class="question-list-header">
        <h3 class="header-title">题目列表</h3>
        <button @click="$emit('close')" class="close-button">
          <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-label">已答</span>
          <span class="stat-value answered">{{ answeredCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正确</span>
          <span class="stat-value correct">{{ correctCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">错误</span>
          <span class="stat-value wrong">{{ wrongCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">未答</span>
          <span class="stat-value unanswered">{{ unansweredCount }}</span>
        </div>
      </div>

      <!-- Question Grid -->
      <div class="question-grid-container">
        <div class="question-grid">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-item"
            :class="{
              'current': index === currentIndex,
              'answered': isAnswered(index),
              'correct': isCorrect(index),
              'wrong': isWrong(index)
            }"
            @click="selectQuestion(index)"
          >
            <span class="question-number">{{ index + 1 }}</span>
            <div class="question-status">
              <div v-if="isAnswered(index)" class="status-icon">
                <svg v-if="isCorrect(index)" class="status-icon-svg correct-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="isWrong(index)" class="status-icon-svg wrong-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div v-else class="status-icon empty"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="quick-navigation">
        <button @click="goToFirst" class="nav-button">
          <span>第一题</span>
        </button>
        <button @click="goToLast" class="nav-button">
          <span>最后一题</span>
        </button>
      </div>

      <!-- Data Management -->
      <div class="data-management">
        <button @click="handleReset" class="reset-button">
          <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          重置原始数据
        </button>
        <div class="data-info">
          <span v-if="hasEditedData" class="edited-indicator">正在使用编辑后的数据</span>
          <span v-else class="original-indicator">正在使用原始数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Question, AnswerRecord } from '@/types'

interface Props {
  questions: Question[]
  currentIndex: number
  answers: AnswerRecord[]
  hasEditedData?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  jumpToQuestion: [index: number]
  resetData: []
}>()

// 触摸手势处理
const touchStartX = ref(0)
const touchStartY = ref(0)

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

const handleTouchMove = (event: TouchEvent) => {
  // Prevent default scrolling when swiping inside the modal
  if (Math.abs(event.touches[0].clientX - touchStartX.value) > 50) {
    event.preventDefault()
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  const touchEndX = event.changedTouches[0].clientX
  const touchEndY = event.changedTouches[0].clientY
  
  const deltaX = touchEndX - touchStartX.value
  const deltaY = touchEndY - touchStartY.value
  
  // 向右滑动关闭（移动端友好）
  if (deltaX > 50 && Math.abs(deltaY) < 100) {
    emit('close')
  }
}

// 计算统计数据
const answeredCount = computed(() => props.answers.length)
const correctCount = computed(() => props.answers.filter(a => a.isCorrect).length)
const wrongCount = computed(() => props.answers.filter(a => !a.isCorrect).length)
const unansweredCount = computed(() => props.questions.length - answeredCount.value)

// 判断题目状态
const isAnswered = (index: number) => {
  return props.answers.some(a => a.questionId === props.questions[index].id)
}

const isCorrect = (index: number) => {
  const answer = props.answers.find(a => a.questionId === props.questions[index].id)
  return answer?.isCorrect || false
}

const isWrong = (index: number) => {
  const answer = props.answers.find(a => a.questionId === props.questions[index].id)
  return answer ? !answer.isCorrect : false
}

// 选择题目
const selectQuestion = (index: number) => {
  emit('jumpToQuestion', index)
  emit('close')
}

// 快速导航
const goToFirst = () => {
  emit('jumpToQuestion', 0)
  emit('close')
}

const goToLast = () => {
  emit('jumpToQuestion', props.questions.length - 1)
  emit('close')
}

const handleReset = () => {
  emit('resetData')
  emit('close')
}
</script>

<style scoped>
.question-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.question-list-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.question-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.close-button {
  padding: 0.5rem;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-value.answered {
  color: #3b82f6;
}

.stat-value.correct {
  color: #10b981;
}

.stat-value.wrong {
  color: #ef4444;
}

.stat-value.unanswered {
  color: #6b7280;
}

.question-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
}

.question-item {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: white;
}

.question-item:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.question-item.current {
  border-color: #3b82f6;
  background: #eff6ff;
}

.question-item.answered {
  border-color: #d1d5db;
}

.question-item.correct {
  border-color: #10b981;
  background: #f0fdf4;
}

.question-item.wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.question-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.question-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon-svg {
  width: 1rem;
  height: 1rem;
}

.status-icon-svg.correct-icon {
  color: #10b981;
}

.status-icon-svg.wrong-icon {
  color: #ef4444;
}

.status-icon.empty {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.quick-navigation {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.nav-button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-button:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.data-management {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.reset-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: white;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.reset-button:hover {
  background: #ef4444;
  color: white;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.data-info {
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.edited-indicator {
  color: #f59e0b;
  font-weight: 500;
}

.original-indicator {
  color: #10b981;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .question-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .question-list-container {
    max-height: 90vh;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .question-list-container {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .question-list-header {
    border-color: #374151;
  }
  
  .close-button {
    color: #9ca3af;
  }
  
  .close-button:hover {
    background: #374151;
    color: #f3f4f6;
  }
  
  .stats-container {
    border-color: #374151;
  }
  
  .question-item {
    background: #374151;
    border-color: #4b5563;
  }
  
  .question-item:hover {
    border-color: #3b82f6;
  }
  
  .question-item.current {
    background: #1e40af;
    border-color: #3b82f6;
  }
  
  .question-number {
    color: #f9fafb;
  }
  
  .nav-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .nav-button:hover {
    background: #4b5563;
    border-color: #3b82f6;
  }
  
  .data-management {
    background: #111827;
    border-color: #374151;
  }
  
  .reset-button {
    background: #374151;
    border-color: #ef4444;
    color: #ef4444;
  }
  
  .reset-button:hover {
    background: #ef4444;
    color: white;
  }
  
  .data-info {
    color: #9ca3af;
  }
  
  .edited-indicator {
    color: #fbbf24;
  }
  
  .original-indicator {
    color: #34d399;
  }
}
</style>