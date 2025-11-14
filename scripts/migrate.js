import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

function backupJson(jsonPath) {
  const dir = path.dirname(jsonPath)
  const base = path.basename(jsonPath, '.json')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(dir, `${base}.backup-${stamp}.json`)
  fs.copyFileSync(jsonPath, backupPath)
  return backupPath
}

async function migrate(jsonPath, dbPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.exec('CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, question TEXT NOT NULL, options TEXT NOT NULL, answer TEXT NOT NULL, explanation TEXT, hasImage INTEGER NOT NULL DEFAULT 0, imagePath TEXT)')
  const stmt = db.prepare('INSERT INTO questions (id, question, options, answer, explanation, hasImage, imagePath) VALUES (?, ?, ?, ?, ?, ?, ?)')
  for (const q of data) {
    stmt.run([
      q.id,
      q.question,
      JSON.stringify(q.options || []),
      q.answer || '',
      q.explanation || '',
      q.hasImage ? 1 : 0,
      q.imagePath || ''
    ])
  }
  stmt.free()
  const binary = Buffer.from(db.export())
  fs.writeFileSync(dbPath, binary)
  db.close()
  return data.length
}

async function main() {
  const projectRoot = process.cwd()
  const jsonPath = path.resolve(projectRoot, 'data', 'questions.json')
  const dbPath = path.resolve(projectRoot, 'data', 'questions.sqlite')
  if (!fs.existsSync(jsonPath)) {
    console.error('questions.json 未找到:', jsonPath)
    process.exit(1)
  }
  const backupPath = backupJson(jsonPath)
  const count = await migrate(jsonPath, dbPath)
  console.log('备份文件:', backupPath)
  console.log('SQLite 数据库:', dbPath)
  console.log('迁移题目数量:', count)
}

main()
