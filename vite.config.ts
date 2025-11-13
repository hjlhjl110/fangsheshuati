import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// 自定义插件：处理questions.json文件保存
const questionsFilePlugin = () => ({
  name: 'questions-file-plugin',
  configureServer(server) {
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
            const filePath = path.resolve(__dirname, 'data', 'questions.json')
            
            // 格式化JSON并保存
            const jsonString = JSON.stringify(questionsData, null, 2)
            fs.writeFileSync(filePath, jsonString, 'utf8')
            
            console.log('✅ questions.json 文件已更新')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: true, 
              message: 'questions.json 文件已更新',
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