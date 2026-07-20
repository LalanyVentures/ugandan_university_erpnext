import { createRouter, createWebHistory } from 'vue-router'
import { usersStore } from '@/stores/user'
import { studentStore } from '@/stores/student'
import { sessionStore } from '@/stores/session'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/pages/Home.vue') },
  { path: '/:catchAll(.*)', redirect: '/' },
]

const router = createRouter({ history: createWebHistory('/student-portal'), routes })

router.beforeEach(async (to, from, next) => {
  const { isLoggedIn } = sessionStore()
  const { user } = usersStore()
  const { student } = studentStore()
  if (!isLoggedIn) {
    window.location.href = '/login'
    return next(false)
  }
  if (user.data.length === 0) await user.reload()
  if (student.data.length === 0) await student.reload()
  return next()
})

export default router
