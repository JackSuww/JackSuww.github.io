import { navbar } from "vuepress-theme-hope";

export const Navbar = navbar([
  "/",
  "/frontend/",
  "/backend/",
  "/llm/",
  {
    text: "网站相关",
    icon: "circle-info",
    children: [
      {
        text: "更新历史",
        icon: "clock-rotate-left",
        link: "/timeline/",
      },
      {
        text: "树洞",
        icon: "heart",
        link: "/website/treehole",
      },
    ],
  },
]);
