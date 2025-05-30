import { path } from 'vuepress/utils'
// import { searchPlugin } from './customize/docsearch'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
// import { pwaPlugin } from '@vuepress/plugin-pwa'
// import ribbonPlugin from './customize/ribbon/index'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const plugins: any = [
  // searchPlugin(),
  registerComponentsPlugin({
    componentsDir: path.resolve(__dirname, '../../', 'components'), // 自动注册全局组件
  }),
  // pwaPlugin({
  //   skipWaiting: true
  // }),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),
  // ribbonPlugin({})
]