import { describe, it, expect, beforeEach } from 'vitest'
import { useQuestionStore } from '@/stores/question'
import { createPinia, setActivePinia } from 'pinia'

describe('Question Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useQuestionStore()
    
    expect(store.questions).toEqual([])
    expect(store.currentQuestionIndex).toBe(0)
    expect(store.answers).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.totalQuestions).toBe(0)
    expect(store.progress).toBe(0)
    expect(store.correctCount).toBe(0)
    expect(store.wrongCount).toBe(0)
    expect(store.accuracy).toBe(0)
  })

  it('should start new session', () => {
    const store = useQuestionStore()
    
    store.startNewSession()
    
    expect(store.currentSession).toBeTruthy()
    expect(store.currentSession?.startTime).toBeGreaterThan(0)
    expect(store.currentSession?.totalQuestions).toBe(0)
    expect(store.currentSession?.correctAnswers).toBe(0)
    expect(store.currentSession?.wrongAnswers).toBe(0)
    expect(store.currentSession?.answers).toEqual([])
  })

  it('should answer question correctly', () => {
    const store = useQuestionStore()
    
    // 模拟题目数据
    store.questions = [
      {
        id: 1,
        question: '测试题目',
        options: ['A、选项1', 'B、选项2', 'C、选项3', 'D、选项4'],
        answer: 'A',
        explanation: '',
        hasImage: false,
        imagePath: ''
      }
    ]
    
    store.startNewSession()
    
    const result = store.answerQuestion('A')
    
    expect(result).toBe(true)
    expect(store.answers).toHaveLength(1)
    expect(store.answers[0].questionId).toBe(1)
    expect(store.answers[0].selectedAnswer).toBe('A')
    expect(store.answers[0].isCorrect).toBe(true)
    expect(store.correctCount).toBe(1)
    expect(store.wrongCount).toBe(0)
  })

  it('should answer question incorrectly', () => {
    const store = useQuestionStore()
    
    // 模拟题目数据
    store.questions = [
      {
        id: 1,
        question: '测试题目',
        options: ['A、选项1', 'B、选项2', 'C、选项3', 'D、选项4'],
        answer: 'A',
        explanation: '',
        hasImage: false,
        imagePath: ''
      }
    ]
    
    store.startNewSession()
    
    const result = store.answerQuestion('B')
    
    expect(result).toBe(false)
    expect(store.answers).toHaveLength(1)
    expect(store.answers[0].questionId).toBe(1)
    expect(store.answers[0].selectedAnswer).toBe('B')
    expect(store.answers[0].isCorrect).toBe(false)
    expect(store.correctCount).toBe(0)
    expect(store.wrongCount).toBe(1)
  })

  it('should navigate between questions', () => {
    const store = useQuestionStore()
    
    // 模拟多个题目
    store.questions = [
      { id: 1, question: '题目1', options: ['A、选项1'], answer: 'A', explanation: '', hasImage: false, imagePath: '' },
      { id: 2, question: '题目2', options: ['A、选项1'], answer: 'A', explanation: '', hasImage: false, imagePath: '' },
      { id: 3, question: '题目3', options: ['A、选项1'], answer: 'A', explanation: '', hasImage: false, imagePath: '' }
    ]
    
    expect(store.currentQuestionIndex).toBe(0)
    expect(store.currentQuestion?.id).toBe(1)
    
    // 下一题
    const nextResult = store.nextQuestion()
    expect(nextResult).toBe(true)
    expect(store.currentQuestionIndex).toBe(1)
    expect(store.currentQuestion?.id).toBe(2)
    
    // 上一题
    const prevResult = store.previousQuestion()
    expect(prevResult).toBe(true)
    expect(store.currentQuestionIndex).toBe(0)
    expect(store.currentQuestion?.id).toBe(1)
    
    // 跳转到指定题目
    store.goToQuestion(2)
    expect(store.currentQuestionIndex).toBe(2)
    expect(store.currentQuestion?.id).toBe(3)
  })

  it('should add question to wrong book', () => {
    const store = useQuestionStore()
    
    const question = {
      id: 1,
      question: '测试题目',
      options: ['A、选项1', 'B、选项2', 'C、选项3', 'D、选项4'],
      answer: 'A',
      explanation: '',
      hasImage: false,
      imagePath: ''
    }
    
    store.addToWrongQuestions(question)
    
    expect(store.wrongQuestions.has(1)).toBe(true)
    const wrongQuestion = store.wrongQuestions.get(1)
    expect(wrongQuestion?.wrongCount).toBe(1)
    expect(wrongQuestion?.question).toEqual(question)
  })

  it('should update wrong count for existing wrong question', () => {
    const store = useQuestionStore()
    
    const question = {
      id: 1,
      question: '测试题目',
      options: ['A、选项1', 'B、选项2', 'C、选项3', 'D、选项4'],
      answer: 'A',
      explanation: '',
      hasImage: false,
      imagePath: ''
    }
    
    store.addToWrongQuestions(question)
    store.addToWrongQuestions(question) // 再次添加
    
    const wrongQuestion = store.wrongQuestions.get(1)
    expect(wrongQuestion?.wrongCount).toBe(2)
  })
})