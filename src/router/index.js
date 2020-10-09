import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "group-login" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "group-login" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "group-login" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "group-user" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "group-user" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "group-user" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "group-good" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "group-good" */ '../components/goods/Params.vue')
const List = () => import(/* webpackChunkName: "group-good" */ '../components/goods/List.vue')
const AddPage = () => import(/* webpackChunkName: "group-good" */ '../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "group-other" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "group-other" */ '../components/report/Report.vue')

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
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: AddPage },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
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
