import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question, AnswerRecord, WrongQuestion, StudySession } from '@/types'

export const useQuestionStore = defineStore('question', () => {
  // 题目数据
  const questions = ref<Question[]>([])
  const currentQuestionIndex = ref(0)
  const answers = ref<AnswerRecord[]>([])
  const isLoading = ref(false)
  
  // 错题本
  const wrongQuestions = ref<Map<number, WrongQuestion>>(new Map())
  
  // 当前学习会话
  const currentSession = ref<StudySession | null>(null)
  
  // 计算属性
  const totalQuestions = computed(() => questions.value.length)
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const progress = computed(() => (currentQuestionIndex.value / totalQuestions.value) * 100)
  const correctCount = computed(() => answers.value.filter(a => a.isCorrect).length)
  const wrongCount = computed(() => answers.value.filter(a => !a.isCorrect).length)
  const accuracy = computed(() => {
    if (answers.value.length === 0) return 0
    return (correctCount.value / answers.value.length) * 100
  })
  
  // 获取题目数据
  async function loadQuestions() {
    isLoading.value = true
    try {
      // 首先检查localStorage是否有编辑过的题目数据
      const savedQuestions = loadQuestionsFromStorage()
      if (savedQuestions && savedQuestions.length > 0) {
        questions.value = savedQuestions
        console.log('使用本地保存的编辑数据')
      } else {
        // 如果没有本地数据，加载原始JSON文件
        const response = await fetch('/data/questions.json')
        const data = await response.json()
        questions.value = data
        console.log('使用原始题目数据')
      }
      
      // 从localStorage加载错题本
      loadWrongQuestions()
    } catch (error) {
      console.error('加载题目数据失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 开始新学习会话
  function startNewSession() {
    currentSession.value = {
      id: Date.now().toString(),
      startTime: Date.now(),
      totalQuestions: questions.value.length,
      correctAnswers: 0,
      wrongAnswers: 0,
      answers: []
    }
    currentQuestionIndex.value = 0
    answers.value = []
  }
  
  // 回答问题
  function answerQuestion(selectedAnswer: string) {
    if (!currentQuestion.value) return
    
    const isCorrect = selectedAnswer === currentQuestion.value.answer
    const record: AnswerRecord = {
      questionId: currentQuestion.value.id,
      selectedAnswer,
      isCorrect,
      timestamp: Date.now()
    }
    
    answers.value.push(record)
    
    if (currentSession.value) {
      currentSession.value.answers.push(record)
      if (isCorrect) {
        currentSession.value.correctAnswers++
      } else {
        currentSession.value.wrongAnswers++
      }
    }
    
    // 如果答错，添加到错题本
    if (!isCorrect) {
      addToWrongQuestions(currentQuestion.value)
    }
    
    return isCorrect
  }
  
  // 下一题
  function nextQuestion() {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }
  
  // 上一题
  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }
  
  // 跳转到指定题目
  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
    }
  }
  
  // 添加到错题本
  function addToWrongQuestions(question: Question) {
    const existing = wrongQuestions.value.get(question.id)
    if (existing) {
      existing.wrongCount++
      existing.lastWrongTime = Date.now()
    } else {
      wrongQuestions.value.set(question.id, {
        question,
        wrongCount: 1,
        lastWrongTime: Date.now()
      })
    }
    saveWrongQuestions()
  }
  
  // 从错题本移除
  function removeFromWrongQuestions(questionId: number) {
    wrongQuestions.value.delete(questionId)
    saveWrongQuestions()
  }
  
  // 保存错题本到localStorage
  function saveWrongQuestions() {
    try {
      const data = Array.from(wrongQuestions.value.entries()).map(([id, item]) => ({
        id,
        ...item
      }))
      localStorage.setItem('wrongQuestions', JSON.stringify(data))
    } catch (error) {
      console.error('保存错题本失败:', error)
    }
  }
  
  // 从localStorage加载错题本
  function loadWrongQuestions() {
    try {
      const saved = localStorage.getItem('wrongQuestions')
      if (saved) {
        const data = JSON.parse(saved)
        wrongQuestions.value = new Map(data.map((item: any) => [item.id, item]))
      }
    } catch (error) {
      console.error('加载错题本失败:', error)
    }
  }
  
  // 结束学习会话
  function endSession() {
    if (currentSession.value) {
      currentSession.value.endTime = Date.now()
      saveSessionToHistory()
      currentSession.value = null
    }
  }
  
  // 更新题目
  async function updateQuestion(index: number, updatedQuestion: Question) {
    if (index >= 0 && index < questions.value.length) {
      questions.value[index] = { ...updatedQuestion }
      // 保存到localStorage
      saveQuestionsToStorage()
      
      // 保存到服务器的questions.json文件
      try {
        const response = await fetch('/api/save-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questions.value),
        })
        
        if (!response.ok) {
          throw new Error('保存到服务器失败')
        }
        
        const result = await response.json()
        console.log('服务器保存结果:', result.message)
        return result
      } catch (error) {
        console.error('保存到服务器失败:', error)
        throw error
      }
    }
  }
  
  // 保存题目到localStorage
  function saveQuestionsToStorage() {
    try {
      localStorage.setItem('questions', JSON.stringify(questions.value))
    } catch (error) {
      console.error('保存题目数据失败:', error)
    }
  }
  
  // 从localStorage加载题目数据
  function loadQuestionsFromStorage() {
    try {
      const saved = localStorage.getItem('questions')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('从localStorage加载题目数据失败:', error)
    }
    return null
  }
  
  // 重置为原始题目数据
  async function resetToOriginalQuestions() {
    try {
      const response = await fetch('/data/questions.json')
      const data = await response.json()
      questions.value = data
      // 清除本地存储的题目数据
      localStorage.removeItem('questions')
      console.log('已重置为原始题目数据')
    } catch (error) {
      console.error('重置题目数据失败:', error)
      throw error
    }
  }
  
  // 保存会话历史
  function saveSessionToHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('studyHistory') || '[]')
      if (currentSession.value) {
        history.push(currentSession.value)
        localStorage.setItem('studyHistory', JSON.stringify(history))
      }
    } catch (error) {
      console.error('保存学习历史失败:', error)
    }
  }
  
  return {
    // 状态
    questions,
    currentQuestionIndex,
    answers,
    isLoading,
    wrongQuestions,
    currentSession,
    
    // 计算属性
    totalQuestions,
    currentQuestion,
    progress,
    correctCount,
    wrongCount,
    accuracy,
    
    // 方法
    loadQuestions,
    startNewSession,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    addToWrongQuestions,
    removeFromWrongQuestions,
    endSession,
    updateQuestion,
    resetToOriginalQuestions
  }
})