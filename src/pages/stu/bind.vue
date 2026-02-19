<template>
  <view class="container">
    <view class="header-wave">
      <view class="wave-bg"></view>
      <view class="content-box">
        <view class="school-info">
          <fui-icon name="home-fill" color="#fff" :size="48"></fui-icon>
          <text class="school-name">{{ formData.scname || '身份验证' }}</text>
        </view>
        <text class="sub-title">请输入登记信息完成绑定</text>
      </view>
    </view>

    <view class="form-card">
      <view class="card-header">学生信息录入</view>
      
      <view class="input-group">
        <text class="label">学生姓名</text>
        <fui-input background="#F5F6FA" :padding="['32rpx', '40rpx']" size="32" radius="24rpx" :border-bottom="false" placeholder="请输入姓名" v-model="formData.name" />
      </view>

      <view class="input-group">
        <text class="label">学号 / 证件号</text>
        <fui-input background="#F5F6FA" :padding="['32rpx', '40rpx']" size="32" radius="24rpx" :border-bottom="false" placeholder="请输入学号" v-model="formData.stuNum" />
      </view>

      <view class="input-group">
        <text class="label">手机号码</text>
        <fui-input background="#F5F6FA" :padding="['32rpx', '40rpx']" size="32" radius="24rpx" 
          :border-bottom="false" type="number" placeholder="预留手机号" 
          v-model="formData.mobile" />
      </view>

      <view class="btn-box">
        <fui-button 
          text="下一步：绑定学生" 
          background="linear-gradient(to right, #6831FF, #8C62FF)" 
          radius="100rpx" height="110rpx" size="34" bold shadow
          @click="handleStepOne">
        </fui-button>
        <text class="help-tip">信息不一致？请联系班主任</text>
      </view>
    </view>

    <fui-bottom-popup :show="showPopup">
      <view class="popup-wrapper">
        <view class="popup-header">
          <text>请输入验证码</text>
        </view>
        <view class="popup-body">
          <text class="p-tip">验证码已发送至 {{ maskMobile }}</text>
          <fui-input 
            background="#F5F6FA" 
            radius="16rpx" 
            placeholder="6位验证码" 
            type="number" 
            v-model="formData.code" />
          <view class="p-confirm">
            <fui-button text="立即验证" background="#6831FF" radius="100rpx" @click="finalSubmit"></fui-button>
          </view>
        </view>
      </view>
    </fui-bottom-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      verificationCode:'xxF8D1F943xx',
      showPopup: false,
      formData: {
        scname: '', sid: '', name: '',
        stuNum: '', mobile: '', code: ''
      }
    }
  },
  computed: {
    maskMobile() {
    // 增加判断：只有 mobile 有值且是字符串时才执行 replace
    if (!this.formData.mobile || typeof this.formData.mobile !== 'string') {
      return '';
    }
    return this.formData.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  },
  onLoad(options) {
    if (options.scname) this.formData.scname = options.scname;
    if (options.sid) this.formData.sid = options.sid;
  },
  methods: {
    async handleStepOne() {
      const { name, stuNum, mobile, sid } = this.formData;
      if (!name || !stuNum || !mobile) {
        return uni.showToast({ title: '请填写完整', icon: 'none' });
      }

      //uni.showLoading({ title: '正在校验...', mask: true });
      // 这里的接口名请确认是 checkCode 还是 sendCode
      const res = await uni.$post('miniProgram/checkCode', { name, stuNum, mobile, sid });
      //uni.hideLoading();

      if (res && res.code === 200) {
        this.verificationCode = res.verificationCode
        this.showPopup = true;
      } else {
        uni.showToast({ title: res?.message || '验证失败', icon: 'error', duration: 5000 });
      }
    },
    async finalSubmit() {
      if (!this.formData.code) return uni.showToast({ title: '请输入验证码', icon: 'error' });
      if (this.formData.code != this.verificationCode) return uni.showToast({title:'错误的验证码, 验证失败',icon:'error'}); 
      console.log(this.formData.code, this.verificationCode)
      uni.showLoading({ title: '绑定中...', mask: true });

      //this.formData.openid =  uni.getStorageSync('openid')
      const res = await uni.$post('miniProgram/bindStu', this.formData);
      uni.hideLoading();

      if (res && res.code === 200) {
        this.showPopup = false;
        uni.showToast({ title: '绑定成功', icon: 'success', duration: 3500, mask: true });
        setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 2500);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 核心布局修复 */
.container {
  min-height: 100vh;
  background-color: #F0F2FF;
  display: block; /* 强制块级布局，防止 flex 干扰 */
}

.header-wave {
  position: relative;
  height: 480rpx;
  background: linear-gradient(135deg, #6831FF 0%, #4B24B3 100%);
  overflow: hidden;
  
  .wave-bg {
    position: absolute;
    bottom: -150rpx;
    left: -10%;
    width: 120%;
    height: 400rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 45%;
    transform: rotate(-5deg);
  }

  .content-box {
    position: relative;
    z-index: 5;
    padding: 120rpx 50rpx 0;
    
    .school-info {
      display: flex;
      align-items: center;
      .school-name {
        font-size: 44rpx;
        font-weight: bold;
        color: #fff;
        margin-left: 15rpx;
      }
    }
    .sub-title {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 15rpx;
      display: block;
    }
  }
}

.form-card {
  position: relative;
  z-index: 10;
  margin: -80rpx 30rpx 40rpx; /* 利用负 margin 压住背景 */
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.05);

  .card-header {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 45rpx;
    text-align: center;
  }

  .input-group {
    margin-bottom: 30rpx;
    .label {
      font-size: 26rpx;
      color: #888;
      margin-bottom: 15rpx;
      display: block;
      padding-left: 10rpx;
    }
  }
}

/* 弹窗专用样式 - 确保不影响外部 */
.popup-wrapper {
  background: #fff;
  padding: 40rpx;
  border-radius: 32rpx 32rpx 0 0;
  .popup-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40rpx;
    font-size: 32rpx;
    font-weight: bold;
  }
  .popup-body {
    .p-tip { font-size: 24rpx; color: #999; margin-bottom: 20rpx; display: block; }
    .p-confirm { margin: 40rpx 0; }
  }
}

.btn-box {
  margin-top: 50rpx;
  .help-tip {
    font-size: 24rpx;
    color: #AAA;
    margin-top: 30rpx;
    display: block;
    text-align: center;
  }
}
</style>
