<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">批量添加题目</h2>
        <button @click="$emit('close')" class="px-2 py-1 rounded hover:bg-gray-100">关闭</button>
      </div>
      <div class="space-y-3">
        <div class="flex gap-2">
          <button :class="tab==='json' ? 'btn-primary' : 'btn-secondary'" @click="tab='json'">粘贴JSON</button>
          <button :class="tab==='csv' ? 'btn-primary' : 'btn-secondary'" @click="tab='csv'">上传CSV</button>
        </div>
        <div v-if="tab==='json'" class="space-y-2">
          <textarea v-model="jsonText" class="w-full h-48 border rounded p-2" placeholder='[ { "question": "...", "options": ["A ...","B ...","C ...","D ..."], "answer": "A", "explanation": "...", "hasImage": false, "imagePath": "" } ]'></textarea>
        </div>
        <div v-else class="space-y-2">
          <input type="file" accept=".csv,.txt" @change="onFile" />
          <div class="text-xs text-gray-500">CSV列：question,optionA,optionB,optionC,optionD,answer,explanation,hasImage,imagePath</div>
        </div>
        <div class="text-sm text-gray-600">预览：{{ previewCount }} 条</div>
        <div class="flex justify-end gap-2">
          <button @click="onParse" class="btn-secondary">解析</button>
          <button @click="onAdd" class="btn-primary" :disabled="items.length===0">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Question } from '@/types'

const emit = defineEmits(['close','added'])
const tab = ref<'json'|'csv'>('json')
const jsonText = ref('')
const items = ref<Question[]>([])
const previewCount = ref(0)

function parseJSON(text: string): Question[] {
  let arr: any[] = []
  try { arr = JSON.parse(text) } catch { arr = [] }
  if (!Array.isArray(arr)) return []
  return arr.map((r: any) => ({
    id: Number(r.id) || 0,
    question: String(r.question || ''),
    options: Array.isArray(r.options) ? r.options : [],
    answer: String(r.answer || ''),
    explanation: String(r.explanation || ''),
    hasImage: !!r.hasImage,
    imagePath: String(r.imagePath || '')
  }))
}

function parseCSV(csv: string): Question[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map(h => h.trim())
  const idx = (name: string) => header.indexOf(name)
  const res: Question[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const q = String(cols[idx('question')] || '')
    const a = String(cols[idx('optionA')] || '')
    const b = String(cols[idx('optionB')] || '')
    const c = String(cols[idx('optionC')] || '')
    const d = String(cols[idx('optionD')] || '')
    const ans = String(cols[idx('answer')] || '')
    const exp = String(cols[idx('explanation')] || '')
    const img = String(cols[idx('imagePath')] || '')
    const hi = String(cols[idx('hasImage')] || '').toLowerCase()
    const options = [] as string[]
    if (a) options.push('A ' + a)
    if (b) options.push('B ' + b)
    if (c) options.push('C ' + c)
    if (d) options.push('D ' + d)
    res.push({
      id: 0,
      question: q,
      options,
      answer: ans,
      explanation: exp,
      hasImage: hi === 'true' || (!!img && img.length > 0),
      imagePath: img || ''
    })
  }
  return res
}

function onParse() {
  if (tab.value === 'json') {
    items.value = parseJSON(jsonText.value)
  } else {
    items.value = items.value
  }
  previewCount.value = items.value.length
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    items.value = parseCSV(text)
    previewCount.value = items.value.length
  }
  reader.readAsText(file)
}

async function onAdd() {
  emit('added', items.value)
  emit('close')
}
</script>

<style scoped>
.btn-primary { @apply px-3 py-2 rounded bg-blue-600 text-white text-sm; }
.btn-secondary { @apply px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm; }
</style>