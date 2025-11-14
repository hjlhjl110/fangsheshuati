import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE_URL = process.env.HUNYUAN_BASE_URL as string | undefined
const API_KEY = process.env.HUNYUAN_API_KEY as string | undefined
const MODEL = (process.env.HUNYUAN_MODEL as string | undefined) || 'hunyuan-lite'

function buildPrompt(q: any): string {
  const qt = q?.type as (string | undefined)
  const lines = [
    '请按以下格式输出两行：',
    '答案：,（根据题型给出答案，单选只能是一个答案，多选使用中文顿号“、”分隔）',
    '解析：……',
    qt ? `题型：${qt === 'multiple' ? '多选' : '单选'}` : undefined,
    `题目：${q?.question ?? ''}`,
    '选项：',
    ...((Array.isArray(q?.options) ? q.options : []) as string[]).map(o => '- ' + o)
  ]
  return lines.filter(Boolean).join('\n')
}

function parseAnswer(text: string): { answer: string; explanation: string } {
  const t = String(text || '')
  const mLabel = t.match(/答案[:：]\s*(?:为|是)?\s*([A-E](?:[、,，\s]*[A-E])*)/i)
  const mJiexiHead = t.match(/解析[:：]\s*([A-E](?:[、,，\s]*[A-E])*)/i)
  const mBracket = t.match(/[（(]([A-E](?:[、,，\s]*[A-E])*)[）)]/)
  const raw = (mLabel?.[1] || mJiexiHead?.[1] || mBracket?.[1] || '').toUpperCase()
  const letters = Array.from(raw.match(/[A-E]/g) || [])
  const uniq = Array.from(new Set(letters))
  const answer = uniq.length > 1 ? uniq.join('、') : (uniq[0] || '')
  const idxs = Array.from(t.matchAll(/解析[:：]/g))
  let explanation = ''
  if (idxs.length > 0) {
    const last = idxs[idxs.length - 1]
    explanation = t.slice((last.index || 0) + last[0].length).trim()
  } else {
    const cut = t.replace(/^[\s\S]*?(答案[:：][^\n]*)/i, '').trim()
    explanation = cut || t.trim()
  }
  return { answer, explanation }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!BASE_URL || !API_KEY) {
      res.status(500).json({ error: 'AI 接口未配置' })
      return
    }
    const q = req.body?.question
    const prompt = buildPrompt(q)
    const url = BASE_URL.replace(/\/$/, '') + '/chat/completions'
    const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], enable_enhancement: true }
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(body) })
    if (!resp.ok) {
      const t = await resp.text()
      res.status(resp.status).json({ error: t })
      return
    }
    const data = await resp.json()
    const content: string = data?.choices?.[0]?.message?.content || ''
    const parsed = parseAnswer(content)
    res.status(200).json({ answer: parsed.answer, explanation: parsed.explanation, content })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
}