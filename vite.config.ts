import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

// 自定义插件：处理questions.json文件保存
const questionsFilePlugin = () => ({
  name: 'questions-file-plugin',
  configureServer(server) {
    const dbPath = path.resolve(__dirname, 'data', 'questions.sqlite')
    server.middlewares.use('/api/save-questions', async (req, res, next) => {
      if (req.method !== 'POST') {
        return next()
      }

      try {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        
        req.on('end', async () => {
          try {
            const questionsData = JSON.parse(body)
            const SQL = await initSqlJs()
            let db
            if (fs.existsSync(dbPath)) {
              const buf = fs.readFileSync(dbPath)
              db = new SQL.Database(new Uint8Array(buf))
            } else {
              db = new SQL.Database()
              db.exec('CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, question TEXT NOT NULL, options TEXT NOT NULL, answer TEXT NOT NULL, explanation TEXT, hasImage INTEGER NOT NULL DEFAULT 0, imagePath TEXT)')
            }
            const stmt = db.prepare('INSERT OR REPLACE INTO questions (id, question, options, answer, explanation, hasImage, imagePath) VALUES (?, ?, ?, ?, ?, ?, ?)')
            for (const q of questionsData) {
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
            console.log('✅ questions.sqlite 已更新')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: true, 
              message: 'questions.sqlite 已更新',
              timestamp: new Date().toISOString()
            }))
          } catch (error) {
            console.error('保存文件失败:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: false, 
              error: '保存文件失败: ' + error.message 
            }))
          }
        })
      } catch (error) {
        console.error('处理请求失败:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ 
          success: false, 
          error: '处理请求失败: ' + error.message 
        }))
      }
    })

    server.middlewares.use('/api/questions', async (req, res, next) => {
      if (req.method !== 'GET') {
        return next()
      }
      try {
        const SQL = await initSqlJs()
        if (!fs.existsSync(dbPath)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify([]))
          return
        }
        const buf = fs.readFileSync(dbPath)
        const db = new SQL.Database(new Uint8Array(buf))
        const resSet = db.exec('SELECT id, question, options, answer, explanation, hasImage, imagePath FROM questions ORDER BY id ASC')
        let rows = []
        if (resSet.length > 0) {
          const values = resSet[0].values
          rows = values.map(v => ({
            id: v[0],
            question: v[1],
            options: JSON.parse(v[2] || '[]'),
            answer: v[3],
            explanation: v[4] || '',
            hasImage: !!v[5],
            imagePath: v[6] || ''
          }))
        }
        db.close()
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(rows))
      } catch (error) {
        console.error('读取数据库失败:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify([]))
      }
    })

    // 添加获取图片列表的API
    server.middlewares.use('/api/images', (req, res, next) => {
      if (req.method !== 'GET') {
        return next()
      }

      try {
        const imagesDir = path.resolve(__dirname, 'public', 'images', 'xray')
        const files = fs.readdirSync(imagesDir)
        const imageFiles = files
          .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
          .map(file => `/images/xray/${file}`)
        
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(imageFiles))
      } catch (error) {
        console.error('读取图片列表失败:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify([]))
      }
    })

    // 添加图片上传API
    server.middlewares.use('/api/upload-image', (req, res, next) => {
      if (req.method !== 'POST') {
        return next()
      }

      try {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        
        req.on('end', () => {
          try {
            // 简单的base64图片处理
            const { imageData, fileName } = JSON.parse(body)
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')
            
            const filePath = path.resolve(__dirname, 'public', 'images', 'xray', fileName)
            fs.writeFileSync(filePath, buffer)
            
            const imagePath = `/images/xray/${fileName}`
            
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: true, 
              imagePath: imagePath
            }))
          } catch (error) {
            console.error('上传图片失败:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: false, 
              error: '上传图片失败: ' + error.message 
            }))
          }
        })
      } catch (error) {
        console.error('处理上传请求失败:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ 
          success: false, 
          error: '处理上传请求失败: ' + error.message 
        }))
      }
    })
  }
})

export default defineConfig({
  plugins: [vue(), questionsFilePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
