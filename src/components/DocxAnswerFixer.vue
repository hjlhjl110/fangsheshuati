<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-[92%] max-w-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">DOCX答案修复</h2>
        <button @click="$emit('close')" class="px-2 py-1 rounded hover:bg-gray-100">关闭</button>
      </div>
      <div class="space-y-3">
        <input type="file" accept=".docx" @change="onFile" />
        <div class="text-sm text-gray-600">已提取答案：{{ Object.keys(answerMap).length }} 条；可更新：{{ canUpdate }}</div>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="previewList = !previewList">{{ previewList ? '隐藏' : '预览' }}</button>
          <button class="btn-primary" :disabled="canUpdate===0" @click="applyFix">执行修复</button>
        </div>
        <div v-if="previewList" class="max-h-64 overflow-auto border rounded p-2 text-xs text-gray-700">
          <div v-for="(ans, key) in answerMap" :key="key">{{ ans }} - {{ key.slice(0,80) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import { ref, computed } from 'vue'
import type { Question } from '@/types'

const props = defineProps<{ questions: Question[] }>()
const emit = defineEmits(['close','fixed'])
const answerMap = ref<Record<string, string>>({})
const previewList = ref(false)

const canUpdate = computed(() => {
  const m = answerMap.value
  return props.questions.reduce((cnt, q) => {
    const key = normalize(q.question)
    if (m[key] && (!q.answer || q.answer.trim().length === 0)) cnt++
    return cnt
  }, 0)
})

function normalize(text: string) {
  return String(text || '')
    .replace(/（[A-D]）/g, '')
    .replace(/[\s\u3000]/g, '')
    .replace(/[，,。！？：；、…]/g, '')
    .replace(/^\d+、?/, '')
    .trim()
}

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const buf = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buf)
  const xml = await zip.file('word/document.xml')!.async('text')
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const ps = Array.from(doc.getElementsByTagName('w:p'))
  const texts: string[] = ps.map(p => Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent || '').join(''))
  const map: Record<string, string> = {}
  for (const line of texts) {
    const m = line.match(/（([A-D])）/)
    if (m) {
      const ans = m[1]
      const stem = normalize(line)
      if (stem.length > 0) map[stem] = ans
    }
  }
  answerMap.value = map
}

function applyFix() {
  const m = answerMap.value
  const updates = [] as { qid: number; answer: string }[]
  for (const q of props.questions) {
    const key = normalize(q.question)
    const ans = m[key]
    if (ans && (!q.answer || q.answer.trim().length === 0)) {
      updates.push({ qid: q.id, answer: ans })
    }
  }
  emit('fixed', updates)
  emit('close')
}
</script>

<style scoped>
.btn-primary { @apply px-3 py-2 rounded bg-blue-600 text-white text-sm; }
.btn-secondary { @apply px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm; }
</style>