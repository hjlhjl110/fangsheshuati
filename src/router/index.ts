import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Question from '@/views/Question.vue'
import WrongBook from '@/views/WrongBook.vue'
import Results from '@/views/Results.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/question',
      name: 'question',
      component: Question
    },
    {
      path: '/wrong-book',
      name: 'wrong-book',
      component: WrongBook
    },
    {
      path: '/results',
      name: 'results',
      component: Results
    }
  ]
})

export default router