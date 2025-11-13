import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取原始JSON数据
const questionsPath = path.join(__dirname, '..', 'data', 'questions.json')

console.log('开始数据迁移...')

try {
  // 读取JSON文件
  const rawData = fs.readFileSync(questionsPath, 'utf8')
  const questions = JSON.parse(rawData)
  
  console.log(`找到 ${questions.length} 道题目`)
  
  // 开始事务
  const transaction = db.transaction(() => {
    // 清空现有数据
    db.exec('DELETE FROM questions')
    db.exec('DELETE FROM sqlite_sequence WHERE name="questions"')
    
    // 准备插入语句
    const insertStmt = db.prepare(`
      INSERT INTO questions (id, question, options, answer, explanation, hasImage, imagePath)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    // 插入数据
    for (const question of questions) {
      const optionsJson = JSON.stringify(question.options)
      insertStmt.run(
        question.id,
        question.question,
        optionsJson,
        question.answer,
        question.explanation || '',
        question.hasImage ? 1 : 0,
        question.imagePath || ''
      )
    }
    
    console.log('✅ 题目数据迁移完成')
  })
  
  transaction()
  
  // 验证数据
  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get()
  console.log(`✅ 数据库中现在有 ${count.count} 道题目`)
  
  // 显示前几条数据作为验证
  const sample = db.prepare('SELECT * FROM questions LIMIT 3').all()
  console.log('示例数据:', sample)
  
} catch (error) {
  console.error('迁移失败:', error)
  process.exit(1)
} finally {
  db.close()
  console.log('✅ 数据库连接已关闭')
}