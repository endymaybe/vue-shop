module.exports = {
  chainWebpack: config => {
    /**
     * 发布模式
     */
    config.when(process.env.NODE_ENV === 'production', config => {
      // 制定发布环境的入口函数
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      // 通过externals加载外部CND资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 通过html插件配置发布模式显示不同的title (和index.html中加载的资源对应)
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    /**
     * 开发模式
     */
    config.when(process.env.NODE_ENV === 'development', config => {
      // 制定开发环境的入口函数
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      // 通过html插件配置开发模式显示不同的title (和index.html中加载的资源对应)
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
