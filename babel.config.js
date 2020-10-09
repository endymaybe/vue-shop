/**
 * 项目发布阶段需要用到的babel插件
 */
const productPlugins = []
if (process.env.NODE_ENV === 'production') {
  productPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 区分开发和发布使用到的插件数组
    ...productPlugins,
    // 支持vue-router懒加载
    '@babel/plugin-syntax-dynamic-import'
  ]
}
