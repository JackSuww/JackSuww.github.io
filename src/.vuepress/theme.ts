import { hopeTheme } from "vuepress-theme-hope";

import { Navbar } from "./navbar/index.js";
import { Sidebar } from "./sidebar/index.js";


export default hopeTheme({
  hostname: "https://JackSu.love/",

  author: {
    name: "JackSu",
  },
  // 加密配置
  encrypt: {
    config: {
      // 这会加密整个 guide 目录，并且两个密码都是可用的
      // "/guide/": ["1234", "5678"],
      // 这只会加密 /config/page.html
      "/website/resume.html": "st",
      "/website/AprilDay.html": "st",
    },
  },

  license: "MIT",
  favicon: "./favicon.ico",
  navbar: Navbar,
  sidebar: Sidebar,
  // 是否开启热更新，只在开发中使用
  hotReload: true,
  shouldPrefetch: false,

  logo: "round.png",
  navbarTitle: "JackSu",

  breadcrumb: false,
  editLink: false,

  repo: "https://github.com/JackSuww/JackSuww.github.io.git",
  darkmode: "toggle",
  docsDir: "src",

  footer: "主题：VuePress Theme Hope",
  displayFooter: true,

  // 博客配置
  blog: {
    name: "JackSu15766496747",
    avatar: "avatar.png",
    description: '不过是些许风霜罢了',
    excerptLength: 0,
    excerpt: false,
    medias: {
      GitHub: "https://github.com/JackSuww/JackSuww.github.io",
    },
    timeline: "朝花夕拾",
    articlePerPage: 5,
  },

  // markdown 配置
  markdown: {
    alert: true,
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
  },

  plugins: {
    blog: {
      excerpt: true,
      excerptLength: 100,
    },
      
    // 评论配置
    comment: {
      provider: "Giscus",
      repo: "JackSuww/giscus",
      repoId: "R_kgDOOyc6Wg",
      category: "Announcements",
      categoryId: "DIC_kwDOOyc6Ws4CquRv",
      comment: false,
    },
    components: {
      components: ["Badge", "VPCard"],
      // rootComponents: {
      //   bingWallpaper: true,
      // },
    },

    icon: {
      prefix: "fa6-solid:",
    },
  },
});
