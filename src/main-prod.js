import Vue from 'vue'
import App from './App.vue'
import router from './router'

import store from './store'
import axios from 'axios'

// 导入字体样式
import './assets/fonts/icomoon/style.css'
// 导入全局样式
import './assets/css/global.css'

// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器组件和样式
import VueQuillEditor from 'vue-quill-editor'
// 导入页面打开加载进度条
import NProgress from 'nprogress'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 在request中展示页面加载进度条
  NProgress.start()

  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  // 在request中展示页面加载进度条
  NProgress.done()

  return config
})

Vue.config.productionTip = false
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)
// 注册富文本编辑器为全局可用的组件
Vue.use(VueQuillEditor)

// 时间的全局过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
