<template>
  <view class="wave-background-demo">
    <view class="header-content">
      <text class="main-title">波浪背景示例</text>
      <text class="sub-title">使用 SVG 和 CSS 实现的动态波浪</text>
    </view>

    <view class="wave-wrapper">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(69,123,157,0.3)" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(69,123,157,0.5)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#F4F8FA" />
        </g>
      </svg>
    </view>

    <view class="main-section">
      <text>这里是波浪下方的区域，</text>
      <text>颜色与波浪最前层相衔接。</text>
    </view>
  </view>
</template>

<style scoped>
.wave-background-demo {
  position: relative;
  min-height: 100vh;
  background-color: #F4F8FA; /* 与最前层波浪颜色一致，实现无缝衔接 */
  overflow: hidden; /* 防止波浪溢出 */
}

.header-content {
  position: relative;
  z-index: 10; /* 确保文字在波浪上方 */
  height: 400rpx; /* 头部区域高度 */
  background-color: #1d3557; /* 头部背景色，深蓝色 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding-top: var(--status-bar-height); /* 适配状态栏高度 */
}

.main-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.sub-title {
  font-size: 28rpx;
  opacity: 0.8;
}

.wave-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200rpx; /* 波浪区域的高度 */
  z-index: 5; /* 波浪在内容下方，在页面背景上方 */
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-wave 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
.parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
.parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }

@keyframes move-wave {
  0% { transform: translate3d(-90px,0,0); }
  100% { transform: translate3d(85px,0,0); }
}

.main-section {
  padding: 40rpx;
  font-size: 32rpx;
  color: #333;
  text-align: center;
}
</style>
