import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Question from '@/views/Question.vue'
import WrongBook from '@/views/WrongBook.vue'
import Results from '@/views/Results.vue'
import Auth from '@/views/Auth.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    ,
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    }
  ]
})

export default router
