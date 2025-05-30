<template>
  <teleport to="body" v-if="isClient">
    <transition name="popover-fade-slide-bounce">
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
  if (docHeight > 0 && scrollTop > docHeight / 4) {
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
  padding: 20px 18px 16px 18px;
  width: auto;
  min-width: 0;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px solid #e8e8e8;
  animation: popover-bounce-in 0.7s;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 14px;
  background: none;
  border: none;
  font-size: 22px;
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
  width: 150px;
  height: 170px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(66,185,131,0.14);
  border: 1.5px solid #e8f5e9;
  transition: box-shadow 0.26s;
}
.wechat-qr:hover {
  box-shadow: 0 4px 20px 0 rgba(66,185,131,0.18);
}

.desc {
  font-size: 15px;
  color: #222;
  margin: 0;
  text-align: center;
  line-height: 1.7;
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
    top: 16px;
    padding: 12px 2px 10px 2px;
    max-width: 95vw;
    border-radius: 12px;
  }
  .wechat-qr {
    width: 90vw;
    max-width: 168px;
    height: auto;
  }
}

/* 新增弹出动效，结合淡入和弹跳 */
@keyframes popover-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(.8);
  }
  60% {
    opacity: 1;
    transform: translateY(10px) scale(1.05);
  }
  80% {
    opacity: 1;
    transform: translateY(-4px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 新的弹窗动画：结合淡入、滑动和弹跳 */
.popover-fade-slide-bounce-enter-active,
.popover-fade-slide-bounce-leave-active {
  transition:
    opacity 0.45s cubic-bezier(.55,0,.1,1),
    transform 0.45s cubic-bezier(.55,0,.1,1);
}
.popover-fade-slide-bounce-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(.82);
}
.popover-fade-slide-bounce-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.popover-fade-slide-bounce-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.popover-fade-slide-bounce-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(.96);
}
</style>