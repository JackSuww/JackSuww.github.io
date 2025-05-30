import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";
import { plugins } from './configs/plugins/';
import {rootComponentsGlobal } from './components';


export default defineUserConfig({


  define: {
    // 启用生产环境构建下激活不匹配的详细警告
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
  },
  base: "/",
  lang: "zh-CN",
  title: "JackSu",

  // 输出目录配置
  dest: "src/.vuepress/dist",


  // 添加缓存控制头信息
  head: [
    [
      "meta",
      {
        "http-equiv": "Cache-Control",
        content: "no-cache, no-store, must-revalidate",
      },
    ],
    ["meta", { "http-equiv": "Pragma", content: "no-cache" }],
    ["meta", { "http-equiv": "Expires", content: "0" }],
  ],

  // 使用 Vite 打包器替代 Webpack
  bundler: viteBundler({
    viteOptions: {
      build: {
        rollupOptions: {
          output: {
            // 使用内容哈希命名文件
            entryFileNames: "assets/js/[name].[hash].js",
            chunkFileNames: "assets/js/[name].[hash].js",
            assetFileNames: "assets/[ext]/[name].[hash].[ext]",
          },
        },
      },
    },
    vuePluginOptions: {

      
    },
  }),

  theme,
  plugins,
//   enhance({ app, router, siteData }) {
//     // 注册elementPlus
//     // app.use(ElementPlus)
//     // 注册自定义全局组件
//     installComponent(app);
// },
// rootComponents: rootComponentsGlobal, // 注册全局组件，放在根节点
});
