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
  const progress = computed(() => totalQuestions.value === 0 ? 0 : (currentQuestionIndex.value / totalQuestions.value) * 100)
  const correctCount = computed(() => answers.value.filter(a => a.isCorrect).length)
  const wrongCount = computed(() => answers.value.filter(a => !a.isCorrect).length)
  const accuracy = computed(() => {
    if (answers.value.length === 0) return 0
    return (correctCount.value / answers.value.length) * 100
  })
  function normalizeToUIAnswer(ans: string): string {
    const t = String(ans || '')
    const letters = Array.from(t.match(/[A-E]/gi) || []).map(s => s.toUpperCase())
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const ch of letters) { if (!seen.has(ch)) { seen.add(ch); ordered.push(ch) } }
    return ordered.join('')
  }
  function normalizeToDBAnswer(ans: string): string {
    const ui = normalizeToUIAnswer(ans)
    if (!ui) return ''
    if (ui.length === 1) return ui
    return ui.split('').join('，')
  }
  function inferTypeByAnswer(ans: string): string {
    const raw = String(ans || '')
    const letters = Array.from(raw.match(/[A-E]/gi) || []).map(s => s.toUpperCase())
    const uniq = Array.from(new Set(letters))
    return uniq.length > 1 ? 'multiple' : 'single'
  }
  function finalTypeOfQuestion(q: Question): string {
    return inferTypeByAnswer(q.answer)
  }
  
  // 获取题目数据
  async function loadQuestions() {
    isLoading.value = true
    try {
      let loaded = false
      // 优先使用 Supabase
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('questions')
          .select('*')
          .order('qid', { ascending: true })
        if (!error && Array.isArray(data) && data.length > 0) {
          questions.value = data.map((r: any) => ({
            id: typeof r.qid === 'number' ? r.qid : r.id,
            question: r.question,
            options: Array.isArray(r.options) ? r.options : JSON.parse(r.options || '[]'),
            answer: normalizeToUIAnswer(r.answer),
            explanation: r.explanation || '',
            hasImage: !!r.hasImage || !!r.has_image,
            imagePath: r.image_path || r.imagePath || '',
            type: r.type || r.question_type || r.Question_type || ''
          }))
          loaded = true
        }
      }
      // 其次使用本地虚拟API(SQLite)
      if (!loaded) {
        try {
          const resp = await fetch('/api/questions')
          if (resp.ok) {
            const data = await resp.json()
            if (Array.isArray(data) && data.length > 0) {
              questions.value = data
              loaded = true
              if (supabaseClient) {
                try {
                  const payload = data.map((q: any) => ({
                    qid: q.id,
                    question: q.question,
                    options: q.options,
                    answer: normalizeToDBAnswer(q.answer),
                    explanation: q.explanation || '',
                    has_image: q.hasImage ? true : false,
                    image_path: q.imagePath || '',
                    Question_type: inferTypeByAnswer(q.answer)
                  }))
                  {
                    const { error: e1 } = await supabaseClient.from('questions').upsert(payload, { onConflict: 'qid' })
                    if (e1) {
                      const msg = String((e1 as any).message || '')
                      if (msg.includes("'Question_type' column")) {
                        const payloadSnake = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, question_type: Question_type }))
                        const { error: e2 } = await supabaseClient.from('questions').upsert(payloadSnake, { onConflict: 'qid' })
                        if (e2) throw e2
                      } else if (msg.includes("'question_type' column")) {
                        const payloadType = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, type: Question_type }))
                        const { error: e2 } = await supabaseClient.from('questions').upsert(payloadType, { onConflict: 'qid' })
                        if (e2) throw e2
                      } else if (msg.includes("'type' column")) {
                        const payloadNoType = payload.map(({ Question_type, type, question_type, ...rest }: any) => rest)
                        const { error: e2 } = await supabaseClient.from('questions').upsert(payloadNoType, { onConflict: 'qid' })
                        if (e2) throw e2
                      } else {
                        throw e1
                      }
                    }
                  }
                } catch {}
              }
            }
          }
        } catch {}
      }
      if (!loaded) {
        const savedQuestions = loadQuestionsFromStorage()
        if (savedQuestions && savedQuestions.length > 0) {
          questions.value = savedQuestions
        } else {
          const response = await fetch('/data/questions.json')
          const data = await response.json()
          questions.value = data
        }
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
      const ft = finalTypeOfQuestion(updatedQuestion)
      questions.value[index] = { ...updatedQuestion, answer: normalizeToUIAnswer(updatedQuestion.answer), type: ft }
      // 保存到localStorage
      saveQuestionsToStorage()
      
      // 保存到 Supabase 或本地虚拟API
      if (supabaseClient) {
        const payload = questions.value.map(q => ({
          qid: q.id,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation || '',
          Question_type: finalTypeOfQuestion(q)
        }))
        {
          const { error } = await supabaseClient
            .from('questions')
            .upsert(payload.map(p => ({ ...p, answer: normalizeToDBAnswer(p.answer) })), { onConflict: 'qid' })
          if (error) {
            const msg = String((error as any).message || '')
            if (msg.includes("'Question_type' column")) {
              const payloadSnake = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, question_type: Question_type }))
              const { error: e2 } = await supabaseClient.from('questions').upsert(payloadSnake, { onConflict: 'qid' })
              if (e2) throw e2
            } else if (msg.includes("'question_type' column")) {
              const payloadType = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, type: Question_type }))
              const { error: e2 } = await supabaseClient.from('questions').upsert(payloadType, { onConflict: 'qid' })
              if (e2) throw e2
            } else if (msg.includes("'type' column")) {
              const payloadNoType = payload.map(({ Question_type, type, question_type, ...rest }: any) => rest)
              const { error: e2 } = await supabaseClient.from('questions').upsert(payloadNoType, { onConflict: 'qid' })
              if (e2) throw e2
            } else {
              console.error('保存到 Supabase 失败:', error)
              throw error
            }
          }
        }
        return { success: true, message: '已保存到 Supabase' }
      } else {
        try {
          const response = await fetch('/api/save-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questions.value),
          })
          if (!response.ok) throw new Error('保存到服务器失败')
          const result = await response.json()
          console.log('服务器保存结果:', result.message)
          return result
        } catch (error) {
          console.error('保存到服务器失败:', error)
          throw error
        }
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
      const resp = await fetch('/api/questions')
      if (resp.ok) {
        const data = await resp.json()
        questions.value = data
      } else {
        const response = await fetch('/data/questions.json')
        const data = await response.json()
        questions.value = data
      }
      // 清除本地存储的题目数据
      localStorage.removeItem('questions')
      console.log('已重置为原始题目数据')
    } catch (error) {
      console.error('重置题目数据失败:', error)
      throw error
    }
  }

  async function addQuestions(newItems: Question[]) {
    const maxId = questions.value.reduce((m, q) => Math.max(m, q.id), 0)
    let nextId = maxId + 1
    const normalized = newItems.map(it => ({
      id: it.id && it.id > 0 ? it.id : nextId++,
      question: it.question || '',
      options: Array.isArray(it.options) ? it.options : [],
      answer: normalizeToUIAnswer(it.answer || ''),
      explanation: it.explanation || '',
      hasImage: !!it.hasImage,
      imagePath: it.imagePath || '',
      type: inferTypeByAnswer(it.answer || '')
    }))
    questions.value = [...questions.value, ...normalized]
    saveQuestionsToStorage()
    if (supabaseClient) {
      const payload = normalized.map(q => ({
        qid: q.id,
        question: q.question,
        options: q.options,
        answer: normalizeToDBAnswer(q.answer),
        explanation: q.explanation || '',
        Question_type: finalTypeOfQuestion(q)
      }))
      {
        const { error } = await supabaseClient
          .from('questions')
          .upsert(payload, { onConflict: 'qid' })
        if (error) {
          const msg = String((error as any).message || '')
          if (msg.includes("'Question_type' column")) {
            const payloadSnake = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, question_type: Question_type }))
            const { error: e2 } = await supabaseClient.from('questions').upsert(payloadSnake, { onConflict: 'qid' })
            if (e2) throw e2
          } else if (msg.includes("'question_type' column")) {
            const payloadType = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, type: Question_type }))
            const { error: e2 } = await supabaseClient.from('questions').upsert(payloadType, { onConflict: 'qid' })
            if (e2) throw e2
          } else if (msg.includes("'type' column")) {
            const payloadNoType = payload.map((item: any) => { const { Question_type, type, question_type, ...rest } = item; return rest })
            const { error: e2 } = await supabaseClient.from('questions').upsert(payloadNoType, { onConflict: 'qid' })
            if (e2) throw e2
          } else {
            throw error
          }
        }
      }
    } else {
      const response = await fetch('/api/save-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions.value),
      })
      if (!response.ok) throw new Error('保存到服务器失败')
    }
  }

  async function updateAnswersBulk(updates: { qid: number; answer: string }[]) {
    if (updates.length === 0) return
    const byId = new Map(updates.map(u => [u.qid, normalizeToUIAnswer(u.answer)]))
    questions.value = questions.value.map(q => byId.has(q.id) ? { ...q, answer: byId.get(q.id)! } : q)
    saveQuestionsToStorage()
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('questions')
        .upsert(updates.map(u => ({ ...u, answer: normalizeToDBAnswer(u.answer) })), { onConflict: 'qid' })
      if (error) throw error
    } else {
      const response = await fetch('/api/save-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questions.value)
      })
      if (!response.ok) throw new Error('保存到服务器失败')
    }
  }

  async function updateAnswerAndExplanation(qid: number, answer: string, explanation: string) {
    const idx = questions.value.findIndex(q => q.id === qid)
    if (idx >= 0) {
      const ft = inferTypeByAnswer(answer)
      const ansUI = normalizeToUIAnswer(answer)
      questions.value[idx] = { ...questions.value[idx], answer: ansUI, explanation, type: ft }
      saveQuestionsToStorage()
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('questions')
        .update({ answer: normalizeToDBAnswer(answer), explanation })
        .eq('qid', qid)
        .select('qid')
      if (error) throw error
      if (!data || data.length === 0) {
        const full = questions.value.find(q => q.id === qid)
        if (full) {
          const payload = {
            qid: full.id,
            question: full.question,
            options: full.options,
            answer: normalizeToDBAnswer(answer),
            explanation,
            Question_type: finalTypeOfQuestion(full)
          }
          {
            const { error: e2 } = await supabaseClient.from('questions').upsert([payload], { onConflict: 'qid' })
            if (e2) {
              const msg = String((e2 as any).message || '')
              if (msg.includes("'Question_type' column")) {
                const { Question_type, ...rest } = payload as any
                const payloadSnake = { ...rest, question_type: Question_type }
                const { error: e3 } = await supabaseClient.from('questions').upsert([payloadSnake], { onConflict: 'qid' })
                if (e3) throw e3
              } else if (msg.includes("'question_type' column")) {
                const { Question_type, ...rest } = payload as any
                const payloadType = { ...rest, type: Question_type }
                const { error: e3 } = await supabaseClient.from('questions').upsert([payloadType], { onConflict: 'qid' })
                if (e3) throw e3
              } else if (msg.includes("'type' column")) {
                const { Question_type, type, question_type, ...rest } = payload as any
                const { error: e3 } = await supabaseClient.from('questions').upsert([rest], { onConflict: 'qid' })
                if (e3) throw e3
              } else {
                throw e2
              }
            }
          }
        }
      }
    } else {
      const response = await fetch('/api/save-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questions.value)
      })
      if (!response.ok) throw new Error('保存到服务器失败')
    }
  }

  async function patchAnswerExplanation(qid: number, fields: { answer?: string; explanation?: string }) {
    const idx = questions.value.findIndex(q => q.id === qid)
    if (idx >= 0) {
      const current = questions.value[idx]
      const nextAnswer = typeof fields.answer === 'string' ? fields.answer : current.answer
      const ft = inferTypeByAnswer(nextAnswer)
      const ansUI = typeof fields.answer === 'string' ? normalizeToUIAnswer(fields.answer) : current.answer
      questions.value[idx] = { ...current, ...fields, answer: ansUI, type: ft }
      saveQuestionsToStorage()
    }
    if (supabaseClient) {
      const updates: any = {}
      if (typeof fields.answer === 'string') updates.answer = fields.answer
      if (typeof fields.explanation === 'string') updates.explanation = fields.explanation
      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabaseClient
          .from('questions')
          .update({ ...updates, ...(typeof fields.answer === 'string' ? { answer: normalizeToDBAnswer(fields.answer) } : {}) })
          .eq('qid', qid)
          .select('qid')
        if (error) throw error
        if (!data || data.length === 0) {
          const full = questions.value.find(q => q.id === qid)
          if (full) {
            const payload = {
              qid: full.id,
              question: full.question,
              options: full.options,
              answer: typeof fields.answer === 'string' ? normalizeToDBAnswer(fields.answer) : normalizeToDBAnswer(full.answer),
              explanation: typeof fields.explanation === 'string' ? fields.explanation : full.explanation,
              Question_type: finalTypeOfQuestion(full)
            }
            {
              const { error: e2 } = await supabaseClient.from('questions').upsert([payload], { onConflict: 'qid' })
              if (e2) {
                const msg = String((e2 as any).message || '')
                if (msg.includes("'Question_type' column")) {
                  const { Question_type, ...rest } = payload as any
                  const payloadSnake = { ...rest, question_type: Question_type }
                  const { error: e3 } = await supabaseClient.from('questions').upsert([payloadSnake], { onConflict: 'qid' })
                  if (e3) throw e3
                } else if (msg.includes("'question_type' column")) {
                  const { Question_type, ...rest } = payload as any
                  const payloadType = { ...rest, type: Question_type }
                  const { error: e3 } = await supabaseClient.from('questions').upsert([payloadType], { onConflict: 'qid' })
                  if (e3) throw e3
                } else if (msg.includes("'type' column")) {
                  const { Question_type, type, question_type, ...rest } = payload as any
                  const { error: e3 } = await supabaseClient.from('questions').upsert([rest], { onConflict: 'qid' })
                  if (e3) throw e3
                } else {
                  throw e2
                }
              }
            }
          }
        }
      }
    } else {
      const response = await fetch('/api/save-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questions.value)
      })
      if (!response.ok) throw new Error('保存到服务器失败')
    }
  }

  async function syncAllToSupabase() {
    if (!supabaseClient) throw new Error('Supabase 未配置')
    const payload = questions.value.map(q => ({
      qid: q.id,
      question: q.question,
      options: q.options,
      answer: normalizeToDBAnswer(q.answer),
      explanation: q.explanation || '',
      Question_type: finalTypeOfQuestion(q)
    }))
    {
      const { error } = await supabaseClient
        .from('questions')
        .upsert(payload, { onConflict: 'qid' })
      if (error) {
        const msg = String((error as any).message || '')
        if (msg.includes("'Question_type' column")) {
          const payloadSnake = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, question_type: Question_type }))
          const { error: e2 } = await supabaseClient.from('questions').upsert(payloadSnake, { onConflict: 'qid' })
          if (e2) throw e2
        } else if (msg.includes("'question_type' column")) {
          const payloadType = payload.map(({ Question_type, ...rest }: any) => ({ ...rest, type: Question_type }))
          const { error: e2 } = await supabaseClient.from('questions').upsert(payloadType, { onConflict: 'qid' })
          if (e2) throw e2
        } else if (msg.includes("'type' column")) {
          const payloadNoType = payload.map((item: any) => { const { Question_type, type, question_type, ...rest } = item; return rest })
          const { error: e2 } = await supabaseClient.from('questions').upsert(payloadNoType, { onConflict: 'qid' })
          if (e2) throw e2
        } else {
          throw error
        }
      }
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
    resetToOriginalQuestions,
    addQuestions,
    updateAnswersBulk,
    updateAnswerAndExplanation,
    patchAnswerExplanation,
    syncAllToSupabase
  }
})
  let supabaseClient: any
  import('../lib/supabase')
    .then(mod => { supabaseClient = mod.supabase })
    .catch(() => {})
