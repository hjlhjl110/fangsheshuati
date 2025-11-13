<template>
  <div class="question-editor-overlay" @click="$emit('close')">
    <div class="question-editor-container" :class="{ 'mobile-layout': isMobile }" @click.stop>
      <!-- Header -->
      <div class="editor-header">
        <h3 class="editor-title">编辑题目</h3>
        <div class="header-actions">
          <button @click="saveChanges" class="save-button">
            <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            保存
          </button>
          <button @click="$emit('close')" class="close-button">
            <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div class="editor-content">
        <div class="form-section">
          <label class="form-label">题目内容</label>
          <textarea 
            v-model="editedQuestion.question" 
            class="form-textarea form-textarea-large"
            rows="5"
            placeholder="请输入题目内容..."
          ></textarea>
        </div>

        <div class="form-section">
          <label class="form-label">选项 (每行一个选项，格式: A、选项内容)</label>
          <textarea 
            v-model="optionsText" 
            class="form-textarea form-textarea-large"
            rows="8"
            placeholder="A、选项一\nB、选项二\nC、选项三\nD、选项四"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">正确答案</label>
            <select v-model="editedQuestion.answer" class="form-select">
              <option value="">请选择答案</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="AB">AB</option>
              <option value="AC">AC</option>
              <option value="AD">AD</option>
              <option value="BC">BC</option>
              <option value="BD">BD</option>
              <option value="CD">CD</option>
              <option value="ABC">ABC</option>
              <option value="ABD">ABD</option>
              <option value="ACD">ACD</option>
              <option value="BCD">BCD</option>
              <option value="ABCD">ABCD</option>
              <option value="ABCDE">ABCDE</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">是否有图片</label>
            <div class="checkbox-group">
              <input 
                type="checkbox" 
                v-model="editedQuestion.hasImage" 
                class="form-checkbox"
                id="hasImage"
              >
              <label for="hasImage" class="checkbox-label">包含图片</label>
            </div>
          </div>
        </div>

        <!-- Image Management Section -->
        <div v-if="editedQuestion.hasImage" class="image-section">
          <div class="form-section">
            <label class="form-label">图片管理</label>
            
            <!-- Image Selection -->
            <div class="image-selection">
              <div class="image-tabs">
                <button 
                  @click="activeImageTab = 'existing'" 
                  class="tab-button"
                  :class="{ active: activeImageTab === 'existing' }"
                >
                  选择现有图片
                </button>
                <button 
                  @click="activeImageTab = 'upload'" 
                  class="tab-button"
                  :class="{ active: activeImageTab === 'upload' }"
                >
                  上传新图片
                </button>
              </div>

              <!-- Existing Images Tab -->
              <div v-if="activeImageTab === 'existing'" class="tab-content">
                <div class="image-grid" v-if="availableImages.length > 0">
                  <div 
                    v-for="image in availableImages" 
                    :key="image"
                    class="image-item"
                    :class="{ selected: editedQuestion.imagePath === image }"
                    @click="selectImage(image)"
                  >
                    <img :src="image" :alt="image" class="image-preview">
                    <div class="image-name">{{ getImageName(image) }}</div>
                  </div>
                </div>
                <div v-else class="no-images">
                  <p>暂无可用图片</p>
                </div>
              </div>

              <!-- Upload Tab -->
              <div v-if="activeImageTab === 'upload'" class="tab-content">
                <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*" 
                    @change="handleFileSelect"
                    class="file-input"
                  >
                  <div class="upload-content" @click="handleUploadClick">
                    <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="upload-text">点击或拖拽图片到此处上传</p>
                    <p class="upload-hint">支持 JPG、PNG、GIF 格式</p>
                  </div>
                </div>
                
                <div v-if="uploadingImage" class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <p class="progress-text">上传中... {{ uploadProgress }}%</p>
                </div>
              </div>
            </div>

            <!-- Selected Image Preview -->
            <div v-if="editedQuestion.imagePath" class="selected-image">
              <label class="form-label">已选图片</label>
              <div class="selected-image-preview">
                <img :src="editedQuestion.imagePath" :alt="editedQuestion.imagePath" class="selected-image-img">
                <button @click="clearImage" class="remove-image-button">
                  <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">图片路径</label>
            <input 
              v-model="editedQuestion.imagePath" 
              type="text" 
              class="form-input"
              placeholder="/images/xray/your-image.png"
            >
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">答案解析</label>
          <textarea 
            v-model="editedQuestion.explanation" 
            class="form-textarea"
            rows="3"
            placeholder="请输入答案解析（可选）..."
          ></textarea>
        </div>
      </div>

      <!-- Examples Section -->
      <div class="examples-section">
        <div class="examples-header" @click="showExamples = !showExamples">
          <h4 class="examples-title">编辑示例</h4>
          <svg 
            class="examples-toggle-icon" 
            :class="{ 'rotated': showExamples }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div v-show="showExamples" class="examples-content">
          <div class="example-item">
            <h5 class="example-subtitle">普通选择题</h5>
            <p class="example-text">题目：辐射防护的基本原则是？</p>
            <p class="example-text">选项：A、时间防护 B、距离防护 C、屏蔽防护 D、以上都是</p>
            <p class="example-text">答案：D</p>
          </div>
          <div class="example-item">
            <h5 class="example-subtitle">多选题</h5>
            <p class="example-text">题目：辐射监测包括哪些内容？</p>
            <p class="example-text">选项：A、个人剂量监测 B、工作场所监测 C、环境监测 D、物品监测</p>
            <p class="example-text">答案：ABC</p>
          </div>
          <div class="example-item">
            <h5 class="example-subtitle">图片题</h5>
            <p class="example-text">题目：下图中的辐射标志是？</p>
            <p class="example-text">选项：A、电离辐射标志 B、非电离辐射标志 C、放射性标志 D、危险标志</p>
            <p class="example-text">答案：A</p>
            <p class="example-text">图片：选择或上传相应的辐射标志图片</p>
          </div>
        </div>
      </div>
      
      <!-- Mobile Close Button -->
      <div v-if="isMobile" class="mobile-close-bar">
        <button @click="$emit('close')" class="mobile-close-button">
          关闭编辑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Question } from '@/types'

interface Props {
  question: Question
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [question: Question]
}>()

// 编辑的题目数据
const editedQuestion = ref<Question>({
  ...props.question
})

// 显示示例
const showExamples = ref(false)

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth <= 768)

// 选项文本（用于编辑）
const optionsText = ref('')

// 图片管理
const availableImages = ref<string[]>([])
const activeImageTab = ref<'existing' | 'upload'>('existing')
const uploadingImage = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement>()

// 初始化选项文本
const initializeOptionsText = () => {
  optionsText.value = editedQuestion.value.options.join('\n')
}

// 解析选项文本
const parseOptionsText = () => {
  const lines = optionsText.value.split('\n').filter(line => line.trim())
  editedQuestion.value.options = lines.map(line => line.trim())
}

// 获取可用图片列表
const loadAvailableImages = async () => {
  try {
    // 获取public/images/xray目录下的所有图片
    const response = await fetch('/api/images')
    if (response.ok) {
      availableImages.value = await response.json()
    }
  } catch (error) {
    console.error('加载图片列表失败:', error)
    // 如果API不可用，尝试一些默认图片
    availableImages.value = [
      '/images/xray/qimg_580510ab535347d5beb4af8f65a7a667.png',
      '/images/xray/qimg_fad2828e8d2249e4931fb1aea24ae573.png',
      '/images/xray/qimg_f4d1c626e657493580ba2e91fcb132cf.png'
    ]
  }
}

// 获取图片名称
const getImageName = (path: string) => {
  return path.split('/').pop() || path
}

// 选择图片
const selectImage = (imagePath: string) => {
  editedQuestion.value.imagePath = imagePath
}

// 清除图片
const clearImage = () => {
  editedQuestion.value.imagePath = ''
  editedQuestion.value.hasImage = false
}

// 处理上传点击
const handleUploadClick = () => {
  fileInput.value?.click()
}

// 文件选择处理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadImage(target.files[0])
  }
}

// 拖拽处理
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadImage(event.dataTransfer.files[0])
  }
}

// 上传图片
const uploadImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  uploadingImage.value = true
  uploadProgress.value = 0

  try {
    // 模拟上传进度
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(interval)
      }
    }, 100)

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    })

    clearInterval(interval)
    uploadProgress.value = 100

    if (response.ok) {
      const result = await response.json()
      editedQuestion.value.imagePath = result.imagePath
      availableImages.value.push(result.imagePath)
      
      setTimeout(() => {
        uploadingImage.value = false
        uploadProgress.value = 0
        activeImageTab.value = 'existing'
      }, 500)
    } else {
      throw new Error('上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    alert('图片上传失败，请重试')
    uploadingImage.value = false
    uploadProgress.value = 0
  }
}

// 保存修改
const saveChanges = async () => {
  parseOptionsText()
  try {
    // 显示保存中状态
    const saveButton = document.querySelector('.save-button') as HTMLButtonElement
    const originalText = saveButton.innerHTML
    saveButton.innerHTML = '<svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>保存中...'
    saveButton.disabled = true

    await emit('save', editedQuestion.value)
    
    // 显示保存成功提示
    alert('题目已保存！数据已成功保存到服务器文件。')
    emit('close')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败：' + (error as Error).message + '\n请检查网络连接或联系管理员。')
  } finally {
    // 恢复按钮状态
    const saveButton = document.querySelector('.save-button') as HTMLButtonElement
    saveButton.innerHTML = '<svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>保存'
    saveButton.disabled = false
  }
}

// 初始化
onMounted(() => {
  initializeOptionsText()
  loadAvailableImages()
})
</script>

<style scoped>
.question-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.question-editor-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
}

.editor-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover {
  background: #059669;
}

.close-button {
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e5e7eb;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-textarea-large {
  min-height: 120px;
  font-size: 1rem;
  line-height: 1.5;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

.image-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
}

.image-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tab-button:hover:not(.active) {
  background: #f3f4f6;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.image-item {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.image-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.image-item.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.image-preview {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.image-name {
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-all;
}

.no-images {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #6b7280;
}

.upload-text {
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.selected-image {
  margin-top: 1rem;
}

.selected-image-preview {
  position: relative;
  display: inline-block;
}

.selected-image-img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.remove-image-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-button:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.examples-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.examples-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.examples-header:hover .examples-title {
  color: #3b82f6;
}

.examples-toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.examples-toggle-icon.rotated {
  transform: rotate(180deg);
}

.examples-content {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.examples-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.example-item {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.example-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #0369a1;
  margin: 0 0 0.5rem 0;
}

.example-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0.25rem 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-editor-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .question-editor-container.mobile-layout {
    max-height: 85vh;
    margin: 0;
    border-radius: 16px 16px 0 0;
    width: 100%;
    max-width: none;
  }
  
  .editor-header {
    padding: 1rem;
    border-radius: 16px 16px 0 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .editor-content {
    padding: 1rem;
    max-height: calc(85vh - 80px);
    overflow-y: auto;
  }
  
  .form-section {
    margin-bottom: 1.25rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  
  .form-textarea-large {
    min-height: 100px;
    font-size: 1rem;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
    max-height: 200px;
  }
  
  .image-preview {
    height: 60px;
  }
  
  .example-item {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .examples-section {
    margin-top: 1rem;
    padding-top: 1rem;
  }
  
  .upload-area {
    padding: 1.5rem;
  }
  
  .upload-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .selected-image-img {
    max-width: 150px;
    max-height: 100px;
  }
  
  .mobile-close-bar {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
  }
  
  .mobile-close-button {
    width: 100%;
    max-width: 200px;
    padding: 0.75rem 1.5rem;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .mobile-close-button:hover {
    background: #4b5563;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .question-editor-container {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .editor-header {
    background: #111827;
    border-color: #374151;
  }
  
  .editor-title {
    color: #f9fafb;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-label {
    color: #d1d5db;
  }
  
  .image-section {
    background: #111827;
    border-color: #374151;
  }
  
  .examples-section {
    border-color: #374151;
  }
  
  .example-item {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .example-subtitle {
    color: #60a5fa;
  }
  
  .example-text {
    color: #d1d5db;
  }
  
  .mobile-close-bar {
    background: #1f2937;
    border-color: #374151;
  }
  
  .mobile-close-button {
    background: #4b5563;
  }
  
  .mobile-close-button:hover {
    background: #6b7280;
  }
}
</style>