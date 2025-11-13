import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import db from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

// 文件上传配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'), false)
    }
  }
})

// API路由

// 获取所有题目
app.get('/api/questions', (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT id, question, options, answer, explanation, hasImage, imagePath, createdAt, updatedAt
      FROM questions
      ORDER BY id
    `).all()
    
    // 解析JSON字符串
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      hasImage: Boolean(q.hasImage)
    }))
    
    res.json(formattedQuestions)
  } catch (error) {
    console.error('获取题目失败:', error)
    res.status(500).json({ error: '获取题目失败' })
  }
})

// 获取单个题目
app.get('/api/questions/:id', (req, res) => {
  try {
    const { id } = req.params
    const question = db.prepare(`
      SELECT id, question, options, answer, explanation, hasImage, imagePath, createdAt, updatedAt
      FROM questions
      WHERE id = ?
    `).get(id)
    
    if (!question) {
      return res.status(404).json({ error: '题目不存在' })
    }
    
    res.json({
      ...question,
      options: JSON.parse(question.options),
      hasImage: Boolean(question.hasImage)
    })
  } catch (error) {
    console.error('获取题目失败:', error)
    res.status(500).json({ error: '获取题目失败' })
  }
})

// 更新题目
app.put('/api/questions/:id', (req, res) => {
  try {
    const { id } = req.params
    const { question, options, answer, explanation, hasImage, imagePath } = req.body
    
    // 验证必填字段
    if (!question || !options || !answer) {
      return res.status(400).json({ error: '缺少必填字段' })
    }
    
    const optionsJson = JSON.stringify(options)
    const hasImageInt = hasImage ? 1 : 0
    
    const result = db.prepare(`
      UPDATE questions 
      SET question = ?, options = ?, answer = ?, explanation = ?, hasImage = ?, imagePath = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(question, optionsJson, answer, explanation || '', hasImageInt, imagePath || '', id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '题目不存在' })
    }
    
    res.json({ success: true, message: '题目更新成功' })
  } catch (error) {
    console.error('更新题目失败:', error)
    res.status(500).json({ error: '更新题目失败' })
  }
})

// 添加新题目
app.post('/api/questions', (req, res) => {
  try {
    const { question, options, answer, explanation, hasImage, imagePath } = req.body
    
    // 验证必填字段
    if (!question || !options || !answer) {
      return res.status(400).json({ error: '缺少必填字段' })
    }
    
    const optionsJson = JSON.stringify(options)
    const hasImageInt = hasImage ? 1 : 0
    
    const result = db.prepare(`
      INSERT INTO questions (question, options, answer, explanation, hasImage, imagePath)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(question, optionsJson, answer, explanation || '', hasImageInt, imagePath || '')
    
    res.json({ 
      success: true, 
      message: '题目添加成功',
      id: result.lastInsertRowid
    })
  } catch (error) {
    console.error('添加题目失败:', error)
    res.status(500).json({ error: '添加题目失败' })
  }
})

// 获取可用图片列表
app.get('/api/images', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '..', 'public', 'images', 'xray')
    
    if (!fs.existsSync(imagesDir)) {
      return res.json([])
    }
    
    const files = fs.readdirSync(imagesDir)
    const imageFiles = files
      .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .map(file => `/images/xray/${file}`)
    
    res.json(imageFiles)
  } catch (error) {
    console.error('获取图片列表失败:', error)
    res.status(500).json({ error: '获取图片列表失败' })
  }
})

// 上传图片
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' })
    }
    
    const { originalname, buffer, mimetype } = req.file
    const fileName = `${Date.now()}-${originalname}`
    const filePath = path.join(__dirname, '..', 'public', 'images', 'xray', fileName)
    
    // 确保目录存在
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, buffer)
    
    const imagePath = `/images/xray/${fileName}`
    
    res.json({
      success: true,
      imagePath: imagePath,
      message: '图片上传成功'
    })
  } catch (error) {
    console.error('上传图片失败:', error)
    res.status(500).json({ error: '上传图片失败' })
  }
})

// 获取学习统计
app.get('/api/statistics', (req, res) => {
  try {
    const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get()
    const answeredQuestions = db.prepare('SELECT COUNT(DISTINCT questionId) as count FROM answer_records').get()
    const correctAnswers = db.prepare('SELECT COUNT(*) as count FROM answer_records WHERE isCorrect = 1').get()
    const wrongAnswers = db.prepare('SELECT COUNT(*) as count FROM answer_records WHERE isCorrect = 0').get()
    
    res.json({
      totalQuestions: totalQuestions.count,
      answeredQuestions: answeredQuestions.count,
      correctAnswers: correctAnswers.count,
      wrongAnswers: wrongAnswers.count,
      accuracy: answeredQuestions.count > 0 ? Math.round((correctAnswers.count / (correctAnswers.count + wrongAnswers.count)) * 100) : 0
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    res.status(500).json({ error: '获取统计失败' })
  }
})

// 记录答题
app.post('/api/answer', (req, res) => {
  try {
    const { questionId, selectedAnswer, isCorrect } = req.body
    
    if (!questionId || !selectedAnswer || isCorrect === undefined) {
      return res.status(400).json({ error: '缺少必填字段' })
    }
    
    // 记录答题
    db.prepare(`
      INSERT INTO answer_records (questionId, selectedAnswer, isCorrect)
      VALUES (?, ?, ?)
    `).run(questionId, selectedAnswer, isCorrect ? 1 : 0)
    
    // 如果答错，更新错题本
    if (!isCorrect) {
      const existing = db.prepare('SELECT * FROM wrong_questions WHERE questionId = ?').get(questionId)
      
      if (existing) {
        db.prepare(`
          UPDATE wrong_questions 
          SET wrongCount = wrongCount + 1, lastWrongTime = CURRENT_TIMESTAMP
          WHERE questionId = ?
        `).run(questionId)
      } else {
        db.prepare(`
          INSERT INTO wrong_questions (questionId, wrongCount, lastWrongTime)
          VALUES (?, 1, CURRENT_TIMESTAMP)
        `).run(questionId)
      }
    }
    
    res.json({ success: true, message: '答题记录已保存' })
  } catch (error) {
    console.error('记录答题失败:', error)
    res.status(500).json({ error: '记录答题失败' })
  }
})

// 获取错题本
app.get('/api/wrong-questions', (req, res) => {
  try {
    const wrongQuestions = db.prepare(`
      SELECT q.id, q.question, q.options, q.answer, q.explanation, q.hasImage, q.imagePath,
             wq.wrongCount, wq.lastWrongTime
      FROM wrong_questions wq
      JOIN questions q ON wq.questionId = q.id
      ORDER BY wq.lastWrongTime DESC
    `).all()
    
    const formatted = wrongQuestions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      hasImage: Boolean(q.hasImage)
    }))
    
    res.json(formatted)
  } catch (error) {
    console.error('获取错题本失败:', error)
    res.status(500).json({ error: '获取错题本失败' })
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`📊 API文档: http://localhost:${PORT}/api/*`)
})

export default app