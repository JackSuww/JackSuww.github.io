---
title: 树洞
home: true
heroText: ""
comment: true
---

<style>
body {
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f9fbff;
  overflow-x: hidden;
}

/* 容器网格 */
.treehole-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  position: relative;
  z-index: 1;
}

@media (max-width: 992px) {
  .treehole-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .treehole-container {
    grid-template-columns: 1fr;
  }
}

/* 卡片基础样式 */
.treehole-card {
  background-color: #e6f2ff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  color: #2c3e50;
  font-weight: 400;
  letter-spacing: 0.5px;
  white-space: pre-line;
  z-index: 1;
  user-select: none;
}

.treehole-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  background-color: #f0f7ff;
  border-color: rgba(0, 0, 0, 0.15);
}

/* 文本样式 */
.treehole-text {
  font-size: 16px;
  line-height: 1.8;
  margin: 0;
  text-align: left;
}

/* 点击后的弹窗样式 */
.treehole-card:target {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 80vw !important;
  max-width: 600px !important;
  max-height: 80vh !important;
  overflow-y: auto;
  background-color: #d9eaff !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
  border-color: #3a7bd5 !important;
  padding: 30px !important;
  border-radius: 16px !important;
  z-index: 10000 !important;
  cursor: default;
}

/* 弹窗内文本放大 */
.treehole-card:target .treehole-text {
  font-size: 20px;
  line-height: 2;
}

/* 遮罩层 */
#overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

/* 当有target元素时，显示遮罩 */
.treehole-card:target ~ #overlay {
  display: block;
}

/* 移动端优化遮罩隐藏滚动 */
body:has(.treehole-card:target) {
  overflow: hidden;
}
</style>

<div class="treehole-container">
  <div class="treehole-card" id="card1" tabindex="0">
    <p class="treehole-text">天空灰得像哭过。</p> <!--《甜甜的》-->
  </div>
  <div class="treehole-card" id="card2" tabindex="0">
    <p class="treehole-text">似曾相识燕归来。</p>
  </div>
  <div class="treehole-card" id="card3" tabindex="0">
    <p class="treehole-text">除却巫山不是云。</p>
  </div>
  <div class="treehole-card" id="card4" tabindex="0">
    <p class="treehole-text">剪不断，理还乱，是离愁。</p>
  </div>
  <div class="treehole-card" id="card5" tabindex="0">
    <p class="treehole-text">故事的小黄花，从出生那年就飘着。</p> <!--《晴天》-->
  </div>
  <div class="treehole-card" id="card6" tabindex="0">
    <p class="treehole-text">江南无所有,聊赠一枝春</p> <!--《东风破》-->
  </div>
  <div class="treehole-card" id="card7" tabindex="0">
    <p class="treehole-text">为伊消得人憔悴</p>
  </div>
  <div class="treehole-card" id="card8" tabindex="0">
    <p class="treehole-text">十年生死两茫茫，不思量，自难忘。</p>
  </div>
  <div class="treehole-card" id="card9" tabindex="0">
    <p class="treehole-text">天长地久有时尽</p>
  </div>
  <div class="treehole-card" id="card10" tabindex="0">
    <p class="treehole-text">你说把爱渐渐放下会走更远，又何必去改变已错过的时间。</p> <!--《说好的幸福呢》-->
  </div>
  <div class="treehole-card" id="card11" tabindex="0">
    <p class="treehole-text">回忆是抓不到的月光，握紧就变黑暗。</p> <!--《蒲公英的约定》-->
  </div>
  <div class="treehole-card" id="card12" tabindex="0">
    <p class="treehole-text">鸿雁在云鱼在水，惆怅此情难寄。</p>
  </div>
  <div class="treehole-card" id="card13" tabindex="0">
    <p class="treehole-text">天青色等烟雨，而我在等你。</p> <!--《青花瓷》-->
  </div>
  <div class="treehole-card" id="card14" tabindex="0">
    <p class="treehole-text">独上高楼，望尽天涯路。</p>
  </div>
  <div class="treehole-card" id="card15" tabindex="0">
    <p class="treehole-text">多情却被无情恼。</p>
  </div>
  <div class="treehole-card" id="card16" tabindex="0">
    <p class="treehole-text">人面桃花相映红。</p>
  </div>
  <div class="treehole-card" id="card17" tabindex="0">
    <p class="treehole-text">惟将终夜长开眼，报答平生未展眉。</p>
  </div>
  <div class="treehole-card" id="card18" tabindex="0">
    <p class="treehole-text">此去经年，应是良辰好景虚设。</p>
  </div>
  <div class="treehole-card" id="card19" tabindex="0">
    <p class="treehole-text">梦里不知身是客，一晌贪欢。</p>
  </div>
  <div class="treehole-card" id="card20" tabindex="0">
    <p class="treehole-text">桃李春风一杯酒，江湖夜雨十年灯。</p>
  </div>
  <div class="treehole-card" id="card21" tabindex="0">
    <p class="treehole-text">人生若只如初见，何事秋风悲画扇。</p>
  </div>
  <div class="treehole-card" id="card22" tabindex="0">
    <p class="treehole-text">雨下整夜，我的爱溢出就像雨水。</p> <!--《借口》-->
  </div>
  <div class="treehole-card" id="card23" tabindex="0">
    <p class="treehole-text">还记得你说家是唯一的城堡。</p> <!--《稻香》-->
  </div>
  <div class="treehole-card" id="card24" tabindex="0">
    <p class="treehole-text">问君能有几多愁？恰似一江春水向东流。</p>
  </div>
</div>

<!-- 遮罩层，用于关闭弹窗 -->
<a href="#" id="overlay" title="关闭"></a>
