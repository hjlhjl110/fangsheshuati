export interface Question {
  id: number
  question: string
  options: string[]
  answer: string
  explanation: string
  hasImage: boolean
  imagePath: string
}

export interface AnswerRecord {
  questionId: number
  selectedAnswer: string
  isCorrect: boolean
  timestamp: number
}

export interface WrongQuestion {
  question: Question
  wrongCount: number
  lastWrongTime: number
}

export interface StudySession {
  id: string
  startTime: number
  endTime?: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  answers: AnswerRecord[]
}