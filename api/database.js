import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建数据库连接
const db = new Database(path.join(__dirname, 'questions.db'))

// 创建题目表
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT DEFAULT '',
    hasImage BOOLEAN DEFAULT 0,
    imagePath TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 创建学习记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS answer_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionId INTEGER NOT NULL,
    selectedAnswer TEXT NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES questions (id)
  )
`)

// 创建错题本表
db.exec(`
  CREATE TABLE IF NOT EXISTS wrong_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionId INTEGER NOT NULL,
    wrongCount INTEGER DEFAULT 1,
    lastWrongTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES questions (id),
    UNIQUE(questionId)
  )
`)

// 创建学习会话表
db.exec(`
  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME,
    totalQuestions INTEGER DEFAULT 0,
    correctAnswers INTEGER DEFAULT 0,
    wrongAnswers INTEGER DEFAULT 0
  )
`)

// 创建学习会话答案记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS session_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    questionId INTEGER NOT NULL,
    selectedAnswer TEXT NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES study_sessions (id),
    FOREIGN KEY (questionId) REFERENCES questions (id)
  )
`)

console.log('✅ 数据库表创建成功')

// 导出数据库实例
export default db