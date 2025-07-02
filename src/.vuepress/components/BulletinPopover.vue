<template>
  <teleport to="body" v-if="isClient">
    <transition name="popover-fade">
      <div v-if="show" class="popover-content enhanced-popover">
        <button class="close-btn" @click="show = false" aria-label="关闭弹窗">&times;</button>
        <img src="/vx1.png" alt="加作者微信二维码" class="wechat-qr" />
        <div class="desc">
          <b>加作者微信🎉</b><br>
          扫码备注<b>【加群】</b>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const show = ref(false);
const isClient = ref(false);

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight > 0 && scrollTop > docHeight / 3) {
    show.value = true;
    window.removeEventListener("scroll", handleScroll);
  }
}

onMounted(() => {
  isClient.value = true;
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
.popover-content {
  position: fixed;
  top: 60px;
  right: 0;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  z-index: 10000;
  border-radius: 14px 0 0 14px;
  padding: 24px 22px 19px 22px;
  width: auto;
  min-width: 0;
  max-width: 264px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14.4px;
  border: 1px solid #e8e8e8;
  font-size: 1.2em;
  /* 去掉动画 */
  /* animation: popover-bounce-in 0.7s; */
}

.close-btn {
  position: absolute;
  top: 9.6px;
  right: 16.8px;
  background: none;
  border: none;
  font-size: 26.4px;
  color: #bbb;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #fa5252;
}

.wechat-qr {
  width: 180px;
  height: 204px;
  border-radius: 9.6px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  box-shadow: 0 2.4px 9.6px rgba(66,185,131,0.14);
  border: 1.8px solid #e8f5e9;
  transition: box-shadow 0.26s;
}
.wechat-qr:hover {
  box-shadow: 0 4.8px 24px 0 rgba(66,185,131,0.18);
}

.desc {
  font-size: 18px;
  color: #222;
  margin: 0;
  text-align: center;
  line-height: 2.04;
  word-break: break-word;
}
.desc b {
  color: #16a085;
  font-weight: 600;
}

@media (max-width: 600px) {
  .popover-content {
    right: 0;
    left: auto;
    top: 19.2px;
    padding: 14.4px 2.4px 12px 2.4px;
    max-width: 114vw;
    border-radius: 14.4px;
  }
  .wechat-qr {
    width: 108vw;
    max-width: 201.6px;
    height: auto;
  }
}

/* 淡入淡出，无缩放 */
.popover-fade-enter-active, .popover-fade-leave-active {
  transition: opacity 0.25s;
}
.popover-fade-enter-from, .popover-fade-leave-to {
  opacity: 0;
}
.popover-fade-enter-to, .popover-fade-leave-from {
  opacity: 1;
}
</style>