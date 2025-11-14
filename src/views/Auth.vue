<template>
  <div class="p-4 max-w-sm mx-auto">
    <h1 class="text-xl font-bold mb-4">账户登录</h1>
    <form @submit.prevent="onSignIn" class="space-y-2">
      <input v-model="email" type="email" placeholder="邮箱" class="w-full border p-2 rounded" />
      <input v-model="password" type="password" placeholder="密码" class="w-full border p-2 rounded" />
      <button class="w-full bg-blue-600 text-white p-2 rounded">登录</button>
    </form>
    <div class="mt-4 text-sm flex gap-2">
      <button @click="onSignUp" class="underline">注册</button>
      <button @click="onReset" class="underline">重置密码</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
const email = ref('')
const password = ref('')
const auth = useAuthStore()
auth.init()
async function onSignIn() {
  await auth.signIn(email.value, password.value)
}
async function onSignUp() {
  await auth.signUp(email.value, password.value)
}
async function onReset() {
  await auth.resetPassword(email.value)
}
</script>

<style scoped>
</style>

