<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-[92%] max-w-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">AI测试</h2>
        <button @click="$emit('close')" class="px-2 py-1 rounded hover:bg-gray-100">关闭</button>
      </div>
      <div class="space-y-3">
        <textarea v-model="questionText" class="w-full h-24 border rounded p-2" placeholder="题干"></textarea>
        <textarea v-model="optionsText" class="w-full h-24 border rounded p-2" placeholder="每行一个选项，如：\nA 选项1\nB 选项2\nC 选项3\nD 选项4"></textarea>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 rounded bg-gray-200" @click="fillCurrent">使用当前题目</button>
          <button class="px-3 py-2 rounded bg-indigo-600 text-white" @click="run">调用AI</button>
        </div>
        <div v-if="result" class="border rounded p-3 text-sm space-y-1">
          <div><span class="font-medium">答案：</span>{{ result.answer }}</div>
          <div><span class="font-medium">解析：</span>{{ result.explanation }}</div>
          <div class="text-gray-500 whitespace-pre-wrap">{{ result.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { analyzeQuestion } from '@/lib/ai'
import type { Question } from '@/types'

const props = defineProps<{ current?: Question | null }>()
const emit = defineEmits(['close'])
const questionText = ref('')
const optionsText = ref('')
const result = ref<{ answer: string; explanation: string; content: string } | null>(null)

function toQuestion(): Question {
  const opts = optionsText.value.split(/\r?\n/).filter(Boolean)
  return {
    id: 0,
    question: questionText.value,
    options: opts,
    answer: '',
    explanation: '',
    hasImage: false,
    imagePath: ''
  }
}

async function run() {
  const q = toQuestion()
  result.value = await analyzeQuestion(q)
}

function fillCurrent() {
  if (!props.current) return
  questionText.value = props.current.question
  optionsText.value = props.current.options.join('\n')
}
</script>