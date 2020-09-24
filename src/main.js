import Vue from 'vue'
import App from './App.vue'
import router from './router'

import store from './store'
import axios from 'axios'

import './plugins/element.js'
import './assets/fonts/icomoon/style.css'
import './assets/css/global.css'

axios.defaults.baseURL = 'http://192.168.5.132:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.config.productionTip = false
Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
