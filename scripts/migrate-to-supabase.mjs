import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

async function readSqlite(dbPath) {
  const SQL = await initSqlJs()
  if (!fs.existsSync(dbPath)) return []
  const buf = fs.readFileSync(dbPath)
  const db = new SQL.Database(new Uint8Array(buf))
  const resSet = db.exec('SELECT id, question, options, answer, explanation, hasImage, imagePath FROM questions ORDER BY id ASC')
  let rows = []
  if (resSet.length > 0) {
    rows = resSet[0].values.map(v => ({
      id: v[0],
      question: v[1],
      options: JSON.parse(v[2] || '[]'),
      answer: v[3],
      explanation: v[4] || '',
      has_image: !!v[5],
      image_path: v[6] || ''
    }))
  }
  db.close()
  return rows
}

async function readJson(jsonPath) {
  if (!fs.existsSync(jsonPath)) return []
  const raw = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  return data.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options || [],
    answer: q.answer || '',
    explanation: q.explanation || '',
    has_image: q.hasImage ? true : false,
    image_path: q.imagePath || ''
  }))
}

async function upsertToSupabase(rows) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('缺少 SUPABASE_URL 或 SUPABASE_KEY 环境变量')
  }
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/questions`
  const batchSize = 500
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicate'
      },
      body: JSON.stringify(batch)
    })
    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`Supabase upsert 失败: ${resp.status} ${text}`)
    }
  }
}

async function main() {
  const projectRoot = process.cwd()
  const dbPath = path.resolve(projectRoot, 'data', 'questions.sqlite')
  const jsonPath = path.resolve(projectRoot, 'data', 'questions.json')
  let rows = []
  rows = await readSqlite(dbPath)
  if (rows.length === 0) rows = await readJson(jsonPath)
  if (rows.length === 0) {
    console.error('未找到可迁移的数据')
    process.exit(1)
  }
  await upsertToSupabase(rows)
  console.log('已迁移到 Supabase，条目数:', rows.length)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

