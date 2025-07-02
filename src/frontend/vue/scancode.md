---
title: 基于 ZXing 封装的 二维码扫码识别组件
date: 2025-06-03
author: JackSu
categories: 
 - 前端
tags: 
 - Vue
---

使用 ZXing 封装的二维码识别组件。

对较小的标签二维码（如质保标签）,通过视频流和帧率调整提升了识别效率。

1. 页面布局样式，通过遮罩和扫描来实现实时动画。

~~~javascript
<template>
  <div class="page-scan" style="flex: 1; position: relative;">
    <!-- 扫码区域 -->
    <div class="QrCode" style="height: 100%;">
      <video ref="video" height="100%" id="video" autoplay object-fit="cover"></video>
    </div>
    <!-- 扫码样式 -->
    <div class="qr-scanner">
      <div class="box">
        <div class="line"></div>
        <div class="angle"></div>
        <button class="delete-button" @click="handleDelete">×</button>
      </div>
      <!-- 遮罩层 实现周围暗 中间亮的效果 -->
      <div class="mask1"></div>
      <div class="mask2"></div>
      <div class="mask3"></div>
      <div class="mask4"></div>
    </div>
  </div>
</template>
~~~
~~~CSS3
<style lang="scss" scoped>
.qr-scanner {
  position: absolute;
  /* 确保 qr-scanner 填充整个页面 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  /* 确保扫码框在最上层 */
}

.qr-scanner .box {
  width: 37.5vw;
  height: 37.5vw;
  max-height: 37.5vh;
  max-width: 37.5vh;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 2px solid #3f90fd;
  box-shadow: 0 0 10px rgba(63, 144, 253, 0.7);
}

.qr-scanner .line {
  height: calc(100% - 2px);
  width: 100%;
  background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #3f90fd 211%);
  border-bottom: 3px solid #3f90fd;
  transform: translateY(-100%);
  animation: radar-beam 2s infinite;
  animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
  animation-delay: 1.4s;
}

.qr-scanner .box:after,
.qr-scanner .box:before,
.qr-scanner .angle:after,
.qr-scanner .angle:before {
  content: "";
  display: block;
  position: absolute;
  width: 3vw;
  height: 3vw;
  border: 0.2rem solid transparent;
}

.qr-scanner .box:after,
.qr-scanner .box:before {
  top: 0;
  border-top-color: #3f90fd;
}

.qr-scanner .angle:after,
.qr-scanner .angle:before {
  bottom: 0;
  border-bottom-color: #3f90fd;
}

.qr-scanner .box:before,
.qr-scanner .angle:before {
  left: 0;
  border-left-color: #3f90fd;
}

.qr-scanner .box:after,
.qr-scanner .angle:after {
  right: 0;
  border-right-color: #3f90fd;
}

@keyframes radar-beam {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(0);
  }
}
.qr-scanner .delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
}

.qr-scanner .delete-button:hover {
  background-color: #ff7875;
}
.qr-scanner .mask1,
.qr-scanner .mask2,
.qr-scanner .mask3,
.qr-scanner .mask4 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.qr-scanner .mask1 {
  clip-path: inset(0 0 calc(50% + (37.5vw / 2)) 0);
}

.qr-scanner .mask2 {
  clip-path: inset(calc(50% - (37.5vw / 2)) calc(50% + (37.5vw / 2)) 0 0);
}

.qr-scanner .mask3 {
  clip-path: inset(calc(50% + (37.5vw / 2)) 0 0 calc(50% - (37.5vw / 2)));
}

.qr-scanner .mask4 {
  clip-path: inset(calc(50% - (37.5vw / 2)) 0 calc(50% - (37.5vw / 2)) calc(50% + (37.5vw / 2)));
}
</style>
~~~

2. 通过调节参数可以实现更高的识别率。
  扫码识别流程：
  1.获取到主摄像头videoInputDevices[0].deviceId;
  2.设置摄像头分辨率为1280x720，帧率为15fps。 
  3.使用 ZXing 的 BrowserMultiFormatReader 进行二维码解码。
  4.在解码成功后，提取二维码中的 product_code 参数，并显示在弹窗中。
  5.如果二维码不包含指定域名，则提示用户扫描的二维码不是目标二维码。
  6.在组件销毁时重置解码器，确保不会继续处理视频流。导致一直进入扫码帧的处理逻辑。

~~~javascript
<script>
import "webrtc-adapter";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

export default {
  name: "ScanCodePage",
  data() {
    return {
      codeReader: null,
    };
  },
  mounted() {
    const hints = new Map();
    // 设置解码器参数
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]); // 仅支持二维码
    hints.set(DecodeHintType.TRY_HARDER, true); 
    hints.set(DecodeHintType.CHARACTER_SET, "UTF-8"); 
    this.codeReader = new BrowserMultiFormatReader(hints);
    this.openScan();
  },
  beforeUnmount() {
    // 组件销毁时重置解码器
    this.codeReader && this.codeReader.reset();
  },
  methods: {
    async openScan() {
      try {
        // 获取摄像头设备
        const videoInputDevices = await this.codeReader.listVideoInputDevices();
        let firstDeviceId =
          videoInputDevices[1]?.deviceId || videoInputDevices[0].deviceId;
        const labelStr = JSON.stringify(videoInputDevices[0]?.label || "");
        if (videoInputDevices.length > 1 && labelStr.indexOf("back") > -1) {
          firstDeviceId = videoInputDevices[0].deviceId;
        }

        // 开启扫描
        this.codeReader.reset();
        this.decodeFromInputVideoFunc(firstDeviceId);
      } catch (err) {
        console.error("摄像头访问失败:", err);
        this.$toast?.fail?.(err);
      }
    },
    handleDelete() {
      // 执行删除或关闭操作
      console.log('删除按钮被点击');
      this.$emit('close');
    },
    decodeFromInputVideoFunc(firstDeviceId) {
      const constraints = {
        video: {
          deviceId: firstDeviceId,
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const video = this.$refs.video;
          video.srcObject = stream;

          this.codeReader.decodeFromInputVideoDeviceContinuously(
            firstDeviceId,
            "video",
            (result, err) => {
              if (result) {
                console.log(`扫描结果: ${result.text}`);
                let extractedResult = null;

                // 判断是否包含指定域名
                if (result.text.includes(" 你的域名 ")) {
                  // 使用正则表达式提取 product_code 参数
                  extractedResult = result.text.match(/[^/]+$/)[0];

                  // 显示弹窗并传递提取后的结果
                  this.$toast?.success?.({
                    message: `扫描结果: ${extractedResult}`, // 弹窗显示的内容
                    duration: 500, // 设置展示时间为 500 毫秒 (0.5 秒)
                  });
                } else {
                  // 弹窗提示不是目标域名的二维码
                  this.$toast?.fail?.({
                    message: "扫描的二维码不是目标二维码",
                    duration: 1000, // 设置弹窗显示时间为 1 秒
                  });
                }

                // 停止视频流并向父组件传递结果
                this.stopStream(stream);
                this.$emit("scanned", extractedResult);
                //这一步时必须手动摧毁掉解码器 不然一直会进入扫码帧的处理逻辑
                this.codeReader && this.codeReader.reset();
              }

              if (err && err.name !== "NotFoundException") {
                console.error(err);
              }
            }
          );
        })
        .catch((err) => {
          console.error("摄像头访问失败:", err);
        });
    },
    stopStream(stream) {
      stream.getTracks().forEach((track) => track.stop());
    },
  },
};
</script>
~~~
<br>
<br>
<br>
<br>
<br>