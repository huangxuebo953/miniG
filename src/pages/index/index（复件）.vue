<template>
  <view class="container">
    <view class="header-bg">
      <view class="loc-bar">
        <fui-icon name="qa" color="#fff" :size="32"></fui-icon>
        <text class="loc-text">投诉</text>
      </view>
    </view>

    <view class="user-card">
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="userInfo.avatarUrl || defaultAvatar"></image>
      </button>

      <view class="info">
        <text class="user-name">欢迎,{{ studentInfo.name }}家长</text>
        <fui-button 
          text="切换用户" 
          background="#6831FF" 
          width="160rpx" 
          height="60rpx" 
          :size="24" 
          radius="100rpx" 
          @click="this.showStudentEnum = true">
        </fui-button>
      </view>
    </view>

    <view class="menu-container">
      <fui-grid :square="false">
        <fui-grid-item v-for="(item,index) in menus" :key="index" @click="navTo(item.path)">
          <view class="fui-grid__cell fui-padding">
            <image :src="item.icon" class="fui-icon" mode="widthFix" />
            <text>{{item.item}}</text>
          </view>
        </fui-grid-item>
      </fui-grid>
    </view>
<fui-bottom-popup :show="showBindPopup" :maskClosable="false">
  <view class="popup-content">
    <view class="popup-header">
      <fui-icon name="warning-fill" color="#6831FF" :size="64"></fui-icon>
      <text class="title">身份未绑定</text>
    </view>
    
    <view class="popup-body">
      <text class="desc">为了保障您的正常使用，使用前请先绑定学生信息。</text>
    </view>
    
    <view class="popup-footer">
      <fui-button 
        text="立即去绑定" 
        background="#6831FF" 
        radius="100rpx" 
        @click="navTo('/pages/stu/school')">
      </fui-button>
    </view>
  </view>
</fui-bottom-popup>

<fui-bottom-popup :show="showStudentEnum">
  <view class="student-popup">
    <view class="popup-header">
      <text class="popup-title">请选择学生</text>
  <view class="manage-entry" @tap="navTo('/pages/stu/bindManager')">
    <text>管理</text>
    <fui-icon name="setup" :size="40" color="#6831FF"></fui-icon>
  </view>
    </view>

    <view class="student-list">
      <view 
        class="student-item" 
        v-for="(item, index) in studentList" 
        :key="index" 
        @tap="selectStudent(item)"
      >
        <view class="stu-info">
          <fui-icon name="my-fill" :size="48" color="#6831FF"></fui-icon>
          <view class="stu-detail">
            <text class="stu-name">{{ item.name }}</text>
            <text class="stu-num">学号：{{ item.studentid }}</text>
            <text class="stu-num" v-if="item.school">{{ item.school.wxname }}</text>
          </view>
        </view>
        <fui-icon name="arrowright" :size="32" color="#ccc"></fui-icon>
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
      menus: [
        { item: '消费记录', icon: '/static/images/common/record.png', path: '/pages/stu/record' },
        { item: '绑定学生', icon: '/static/images/common/class2.png', path: '/pages/stu/school' },
        { item: '测试页', icon: '/static/images/common/notify.png', path: '/pages/stu/test' }
      ],
      defaultAvatar: '/static/images/common/avatar.png',
      openid: uni.getStorageSync('openid') || '',
      // 必须初始化 userInfo
      userInfo: {
        avatarUrl: '',
        nickName: ''
      },
      studentInfo: {
        name:'unlogin'
      },
      isLoading: false,
      showBindPopup: false,
      studentList:[],
      showStudentEnum:false,
    }
  },
  computed: {
    shortOpenid() {
      return this.openid ? this.openid.slice(0, 8) + '...' : ''
    }
  },
  methods: {
    
    async initLogin() {
      console.log("自动登录")
    if (this.isLoading) return;
    this.isLoading = true;
    uni.showLoading({ title: '加载中...', mask: true });

    try {
        // 1. 修改这里：去掉解构赋值 [err, loginRes]
        // 直接等待结果，这种写法在所有 uni-app 版本中都更稳
        const loginRes = await uni.login({ provider: 'weixin' });
        
        console.log("微信登录结果:", loginRes);

        // 注意：有些版本返回在 loginRes.code，有些在 loginRes[1].code
        // 我们用一种最保险的拿法：
        const code = loginRes.code || (loginRes[1] && loginRes[1].code);

        if (code) {
            // 2. 发送 code 到后端换取数据
            const res = await this.fetchStudentData(code);
        } else {
            throw new Error("未能获取到登录Code");
        }
    } catch (e) {
        console.error("登录逻辑出错:", e);
        uni.showToast({ title: '登录失败', icon: 'none' });

    } finally {
        this.isLoading = false;
        uni.hideLoading();
    }
},
    fetchStudentData(code) {
      console.log("my code!!",code)
      return new Promise((resolve, reject) => {
        uni.request({
          url: 'https://www.yoozhi.cn/api/miniProgram/login',
          method: 'POST',
          header: { 'content-type': 'application/json' },
          data: { code: code },
          success: (res) => {
          if (res.statusCode === 200) {
          const data = res.data;
          if (!data.student || (Array.isArray(data.student) && data.student.length === 0)) {
            // 情况 1: 未绑定学生
            this.Unlogin(data);
          } else {
            // 情况 2: 已绑定学生（单人或多人）
            this.successLogin(data);
          }
          resolve(data);
        } else {
          uni.showToast({ title: '服务器响应异常', icon: 'error' });
          reject('请求失败');
        }
          },
          fail: (err) => reject(err)
        });
      });
    },

  selectStudent(student) {
    this.showStudentEnum = false;
    this.confirmEntry(student);
  },

  // 最终进入系统的逻辑
  confirmEntry(student) {
    uni.setStorageSync('currentStudent', student);
    uni.showToast({ title: `当前学生：${student.name}`, icon: 'people' });
    this.studentInfo = student
    console.log('this.studentInfo',this.studentInfo)
    this.showStudentEnum = false
    console.log("srorage info", uni.getStorageSync('currentStudent'), uni.getStorageSync('token'))  
  },

testfetchStudentData() {
  console.log("开始模拟登录...");
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://www.yoozhi.cn/api/miniProgram/testlogin',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data;
          if (!data.student || (Array.isArray(data.student) && data.student.length === 0)) {
            // 情况 1: 未绑定学生
            this.Unlogin(data);
          } else {
            // 情况 2: 已绑定学生（单人或多人）
            this.successLogin(data);
          }
          resolve(data);
        } else {
          uni.showToast({ title: '服务器响应异常', icon: 'none' });
          reject('请求失败');
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    });
  });
},
/**
 * 成功获取到学生信息的逻辑
 */
successLogin(data) {
  console.log("登录逻辑：检测到已绑定学生", data.student);
  uni.setStorageSync('token', data.token);
  uni.setStorageSync('user', data.user);    
  // 1. 保存学生列表供页面展示或后续使用
  this.studentList = data.student;

  // 2. 判断人数
  if (data.student.length > 1) {
    console.log("存在多名学生，弹出选择框");
    this.showStudentEnum = true;
  } else {
    console.log("只有一名学生，自动进入");
    // 直接进入第一个学生的信息页/首页
    this.confirmEntry(data.student[0]);
  }
},
/**
 * 未绑定学生或登录受限的逻辑
 */
Unlogin(data) {
  console.log("登录逻辑：没有绑定学生", data);
  
  // 1. 保存 openid 备用（绑定时需要）
  if (data.openid) {
    this.openid = data.openid;
    uni.setStorageSync('openid', data.openid);
  }

  // 2. UI 反馈
  uni.showToast({ 
    title: '请先完成学生身份绑定', 
    icon: 'error',
    duration: 5000
  });

  // 3. 弹出绑定框或跳转到绑定页面
  this.showBindPopup = true;
  // 如果是跳转页面：uni.navigateTo({ url: '/pages/stu/bind' });
},
    onChooseAvatar(e) {
      this.userInfo.avatarUrl = e.detail.avatarUrl;
      // 建议此处将头像上传到服务器
    },
    navTo(item) {
      if (!item) return;
      uni.navigateTo({
        url: item,
        fail: () => { uni.switchTab({ url: item }); }
      });
    }
  },
  onLoad() {
  // #ifdef H5
  // 只有在浏览器/H5环境下预览时，才执行模拟数据
  console.log('当前环境：H5 - 执行模拟数据');
  this.testfetchStudentData();
  // #endif

  // #ifdef MP-WEIXIN
  // 只有在微信小程序环境下，才执行正式登录和初始化
  console.log('当前环境：微信小程序 - 执行正式登录');
  this.initLogin();
  // #endif
}
}
</script>
<style lang="scss" scoped>
$theme-purple: #6831FF;

.container {
  min-height: 100vh;
  background-color: #f8f9ff; // 浅紫色底，看起来更高级
}

/* 顶部背景 */
.header-bg {
  background: linear-gradient(180deg, $theme-purple 0%, #A58BFF 100%);
  height: 420rpx;
  border-bottom-left-radius: 80rpx;
  border-bottom-right-radius: 80rpx;
  padding: 120rpx 40rpx 0;
  
  .loc-bar {
    display: flex;
    align-items: center;
    .loc-text { color: #fff; margin-left: 10rpx; font-size: 28rpx; }
  }
}

/* 用户卡片 */
.user-card {
  background: #fff;
  margin: -100rpx 30rpx 0;
  padding: 40rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 15rpx 30rpx rgba(104, 49, 255, 0.08);
  position: relative;
  z-index: 10;
  
  .info {
    flex: 1;
    margin-left: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .user-name { 
      font-size: 32rpx; 
      font-weight: bold; 
      color: #333;
    }
    
    .user-id {
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 微信头像选择器重置 */
.avatar-wrapper {
  padding: 0;
  width: 120rpx !important;
  height: 120rpx !important;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin: 0;
  border: none;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after { border: none; } // 关键：去掉原生按钮边框
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

/* 九宫格区域 */
.menu-container {
  background: #fff;
  margin: 30rpx;
  border-radius: 32rpx;
  padding: 20rpx 0;
  
  .fui-grid__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 30rpx 0;
    
    .fui-icon {
      width: 80rpx; // 稍微调小一点，更显精致
      height: 80rpx;
      margin-bottom: 16rpx;
    }
    
    text {
      font-size: 26rpx;
      color: #444;
    }
  }
}

/* 全局覆盖：去掉 grid 的边框线 */
:deep(.fui-grid__item-border) {
  border: none !important;
}

.popup-content {
  background-color: #fff;
  padding: 60rpx 40rpx;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  text-align: center;

  .popup-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      margin-top: 20rpx;
      color: #333;
    }
  }

  .popup-body {
    margin-bottom: 60rpx;
    .desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .popup-footer {
    padding: 0 20rpx;
  }
}

.student-popup {
  background-color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 32rpx 32rpx 0 0;

  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 40rpx;
    text-align: center;
  }

  .student-list {
    max-height: 60vh;
    overflow-y: auto;
  }

  .student-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background: #F8F9FF;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    border: 1px solid #E5E9FF;

    &:active {
      background: #EDF0FF;
    }
.student-popup {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 32rpx 32rpx 0 0;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    height: 60rpx;
    position: relative;

    .header-placeholder {
      width: 100rpx; // 宽度与 manage-btn 保持一致，实现标题绝对居中
    }

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .manage-btn {
      display: flex;
      align-items: center;
      width: 100rpx;
      justify-content: flex-end;
      
      text {
        font-size: 26rpx;
        color: #6831FF;
        margin-right: 4rpx;
      }
    }
  }

  .student-list {
    max-height: 70vh; // 增加最大高度，防止学生多了滑不动
    overflow-y: auto;
  }
  
  // 原有的 student-item 样式保持不变...
}
    .stu-info {
      display: flex;
      align-items: center;
      
      .stu-detail {
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;

        .stu-name {
          font-size: 32rpx;
          color: #333;
          font-weight: bold;
        }
        .stu-num {
          font-size: 24rpx;
          color: #999;
          margin-top: 4rpx;
        }
      }
    }
  }
}
/* 样式部分 */
.popup-header {
  position: relative;
  display: flex;
  justify-content: center; /* 标题居中 */
  align-items: center;
  padding: 20rpx 0 40rpx;

  .popup-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }

  .manage-entry {
    position: absolute; /* 绝对定位到右侧 */
    right: 10rpx;
    top: 20rpx;
    display: flex;
    align-items: center;
    
    text {
      font-size: 28rpx;
      color: #6831FF;
      margin-right: 6rpx;
    }
  }
}
</style>

