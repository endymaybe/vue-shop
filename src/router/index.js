import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcomme from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcomme },
        { path: '/users', component: Users }
      ]
    }
  ]
})

// mount router beforeEach
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()

  // get sessionStorage token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')

  return next()
})

export default router
