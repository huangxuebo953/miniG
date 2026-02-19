<template>
  <view class="container">
    <view class="header-bg"></view>
    
    <view class="content">
      <view class="page-title">
        <text class="main">学生管理</text>
        <text class="sub">已关联 {{ studentList.length }} 位学生</text>
      </view>

      <view class="list-wrap">
        <fui-swipeaction-group>
          <fui-swipe-action 
            v-for="(item, index) in studentList" 
            :key="item.id || index" 
            :buttons="buttons" 
            @click="handleAction($event, item)"
          >
            <view class="student-card">
              <view class="stu-main">
                <view class="avatar">
                  <text>{{ item.name ? item.name.substring(0, 1) : '学' }}</text>
                </view>
                <view class="info">
                  <view class="name-row">
                    <text class="name">{{ item.name }}</text>
                  </view>
                  <text class="school">{{ item.school && item.school.wxname ? item.school.wxname : '未关联学校' }}</text>
                  <text class="id">学号：{{ item.studentid || '-' }}</text>
                </view>
              </view>
              
              <view class="delete-btn" @tap.stop="handleAction(null, item)">
                解除绑定
              </view>
            </view>
          </fui-swipe-action>
        </fui-swipeaction-group>
      </view>

      <view v-if="studentList.length === 0" class="empty-state">
        <text>暂无关联学生</text>
      </view>

      <view class="add-box">
        <fui-button 
          text="+ 绑定新学生" 
          background="linear-gradient(to right, #6831FF, #8C62FF)" 
          radius="100rpx"
          @click="goAdd">
        </fui-button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      studentList: [],
      buttons: [{
        text: '解除绑定',
        background: '#FF2E2E',
        color: '#fff',
        size: 28
      }]
    }
  },
  onShow() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const res = await uni.$post('miniProgram/student/manager/list');
        if (res && res.code === 200) {
          this.studentList = res.student || [];
          if(!res.student.length){
            uni.navigateTo({ url: '/pages/index/index' });
          }
        }
      } catch (e) {
        console.error("加载数据失败", e);
      }
    },

    // 统一删除（解绑）逻辑
    async handleAction(e, item) {
      uni.showModal({
        title: '提示',
        content: `确定要解除与 [${item.name}] 的关联吗？`,
        confirmColor: '#FF2E2E', // 确认按钮设为红色警告色
        success: async (res) => {
          if (res.confirm) {
            const user = uni.getStorageSync('user');
            uni.showLoading({ title: '处理中...' });
            
            try {
              const delRes = await uni.$post('miniProgram/student/manager/unbind', { 
                stuid: item.id, 
                uid:user.id
              });
              
              if (delRes.code === 200) {
                uni.showToast({ title: '已成功解绑', icon: 'none',
    duration: 3000 });
                // 解绑成功后，如果缓存里还存着这个学生，清理掉
                const cur = uni.getStorageSync('currentStudent');
                if (cur && cur.id === item.id) {
                  uni.removeStorageSync('currentStudent');
                }
                this.loadData();
              } else {
                uni.showToast({ title: delRes.msg || '操作失败!',    icon: 'none',
    duration: 3000 });
              }
            } catch (err) {
              uni.showToast({ title: '网络请求失败', icon: 'none' });
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    },

    goAdd() {
      uni.navigateTo({ url: '/pages/stu/school' });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F6F7FB;
}

.header-bg {
  height: 240rpx;
  background: linear-gradient(180deg, rgba(104, 49, 255, 0.12) 0%, rgba(246, 247, 251, 0) 100%);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  padding: 60rpx 32rpx;
}

.page-title {
  margin-bottom: 48rpx;
  .main {
    font-size: 52rpx;
    font-weight: bold;
    color: #1A1A1A;
    display: block;
  }
  .sub {
    font-size: 26rpx;
    color: #999;
    margin-top: 12rpx;
    display: block;
  }
}

.list-wrap {
  width: 100%;
}

.student-card {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;

  .stu-main {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .avatar {
      width: 100rpx;
      height: 100rpx;
      background: #F0F0FF;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44rpx;
      color: #6831FF;
      font-weight: bold;
    }

    .info {
      margin-left: 28rpx;
      flex: 1;
      min-width: 0;
      
      .name {
        font-size: 36rpx;
        font-weight: bold;
        color: #2D2D2D;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .school {
        font-size: 26rpx;
        color: #666;
        margin-top: 8rpx;
        display: block;
      }

      .id {
        font-size: 24rpx;
        color: #B2B2B2;
        margin-top: 4rpx;
        display: block;
      }
    }
  }

  /* 删除按钮样式 */
  .delete-btn {
    flex-shrink: 0;
    font-size: 24rpx;
    color: #FF2E2E;
    padding: 12rpx 28rpx;
    border: 2rpx solid #FF2E2E;
    border-radius: 100rpx;
    margin-left: 20rpx;
    
    &:active {
      background: rgba(255, 46, 46, 0.05);
      opacity: 0.7;
    }
  }
}

.add-box {
  margin-top: 80rpx;
  padding-bottom: 60rpx;
  &::before {
    content: "想要管理更多孩子？";
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: #B2B2B2;
    margin-bottom: 30rpx;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #B2B2B2;
  font-size: 28rpx;
}
</style>
