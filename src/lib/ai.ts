import type { Question } from '@/types'

const AI_ENDPOINT = (import.meta.env.VITE_AI_ENDPOINT as string | undefined) || '/api/ai'

export async function analyzeQuestion(q: Question): Promise<{ answer: string; explanation: string; content: string }> {
  const resp = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) })
  if (!resp.ok) {
    const t = await resp.text()
    try {
      const j = JSON.parse(t)
      throw new Error('AI 接口调用失败: ' + (j.error || t))
    } catch {
      throw new Error('AI 接口调用失败: ' + t)
    }
  }
  const data = await resp.json()
  return { answer: data.answer, explanation: data.explanation, content: data.content }
}