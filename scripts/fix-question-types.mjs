import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'
import { createClient } from '@supabase/supabase-js'

function loadEnv(projectRoot) {
  const envPath = path.resolve(projectRoot, '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) process.env[m[1]] = m[2]
    }
  }
}

function normalize(s) {
  return String(s || '')
    .replace(/[\s\u3000]/g, '')
    .replace(/[，,。！？：；、…“”‘’]/g, '')
    .replace(/^\d+、?/, '')
    .trim()
}

function detectTypeAround(docText, stem) {
  const idx = docText.indexOf(stem)
  if (idx === -1) return null
  const start = Math.max(0, idx - 120)
  const end = Math.min(docText.length, idx + stem.length + 120)
  const window = docText.slice(start, end)
  if (/多选|多项|可选择多项|至少选择|选出(两|三|多)项/.test(window)) return 'multiple'
  if (/单选|仅选择一项|请选择一项/.test(window)) return 'single'
  // 语义型判断
  if (/哪些|以下哪些|下列哪些/.test(window)) return 'multiple'
  if (/哪项|以下哪项|下列哪项/.test(window)) return 'single'
  return null
}

async function readDocx(docxPath) {
  const buf = fs.readFileSync(docxPath)
  const zip = await JSZip.loadAsync(buf)
  const xml = await zip.file('word/document.xml').async('text')
  // 简化处理：提取所有 w:t 文本拼接
  const texts = Array.from(xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)).map(m => m[1])
  const full = texts.join('')
  const fullNorm = normalize(full)
  return { fullText: full, fullNorm: fullNorm }
}

async function main() {
  const projectRoot = process.cwd()
  loadEnv(projectRoot)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('缺少 Supabase 配置 (URL/KEY)')
    process.exit(1)
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const docxPath = path.resolve(projectRoot, '医用X射线诊断与介入放射学.docx')
  if (!fs.existsSync(docxPath)) {
    console.error('DOCX 未找到:', docxPath)
    process.exit(1)
  }
  const { fullNorm } = await readDocx(docxPath)

  const { data: rows, error } = await supabase
    .from('questions')
    .select('*')
    .order('qid', { ascending: true })
  if (error) {
    console.error('读取 Supabase 失败:', error)
    process.exit(1)
  }

  let updated = 0, skipped = 0, failed = 0
  for (const r of rows || []) {
    const stemNorm = normalize(r.question)
    const typ = detectTypeAround(fullNorm, stemNorm)
    if (!typ) { skipped++; continue }
    const keys = Object.keys(r || {})
    const typeCol = keys.find(k => ['type','questiontype','question_type','question type','Question type','Question_type'].includes(k.toLowerCase().replace(/[\s_]/g,'')))
    const existing = typeCol ? (r[typeCol] || '') : ''
    if (!existing || String(existing).trim().length === 0) {
      let updates = {}
      if (typeCol) updates[typeCol] = typ
      else updates['type'] = typ
      const { data: d1, error: e1 } = await supabase.from('questions').update(updates).eq('qid', r.qid).select('qid')
      if (e1) {
        // 回退：完整 upsert payload
        const payload = { qid: r.qid, question: r.question, options: r.options || [], answer: r.answer || '', explanation: r.explanation || '' }
        if (typeCol) payload[typeCol] = typ; else payload['type'] = typ
        const { error: e2 } = await supabase.from('questions').upsert([payload], { onConflict: 'qid' })
        if (e2) { failed++; console.error('更新失败 qid=', r.qid, e2.message || e2) } else updated++
      } else {
        updated++
      }
    } else {
      skipped++
    }
  }
  console.log('类型修复完成: 更新', updated, '条；跳过', skipped, '条；失败', failed, '条')
}

main().catch(e => { console.error(e); process.exit(1) })