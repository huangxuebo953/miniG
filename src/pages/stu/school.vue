<template>
  <view class="selector-page">
    <view class="search-box">
      <fui-input 
        radius="40rpx" 
        placeholder="输入学校搜索" 
        v-model="searchText" 
        :padding="['20rpx', '32rpx']"
        @input="onSearch"
      >
        <template v-slot:left>
          <icon type="search" size="14" style="margin-right: 10rpx;"></icon>
        </template>
      </fui-input>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <fui-list v-if="filteredList.length > 0">
        <fui-list-cell 
          v-for="(item, index) in filteredList" 
          :key="index" 
          arrow 
          @click="navTo('/pages/stu/bind?sid=' + item.value + '&scname=' + item.label)"
        >
          <view class="student-item">
            <fui-avatar 
              :text="item.label ? item.label[0] : '校'" 
              background="#F0EBFF" 
              color="#6831FF" 
              size="small">
            </fui-avatar>
            <view class="student-info">
              <text class="title">{{ item.label }}</text>
            </view>
            <fui-tag v-if="item.isBound" text="已绑定" type="purple" scale="0.8"></fui-tag>
          </view>
        </fui-list-cell>
      </fui-list>
      
      <view v-else class="empty-state">
        <text>{{ loading ? '加载中...' : '未找到相关学校' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      allSchools: [],    // 强烈建议保留一份原始副本，否则搜索功能会“越搜越少”
      filteredList: [], 
      loading: false
    }
  },
  onLoad() {
    this.fetchSchoolList();
  },
  methods: {
    async fetchSchoolList() {
      if (this.loading) return;
      this.loading = true;
      try {
        const res = await uni.$post('miniProgram/student/manager/school');

        if (res && res.code === 200) {
          // 这里的 selected1 是你接口返回的字段名
          const data = res.selected1 || [];
          this.allSchools = data; 
          this.filteredList = data;
        } else {
          this.allSchools = [];
          this.filteredList = [];
        }
      } catch (e) {
        console.error('获取学校列表失败:', e);
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },

    onSearch(e) {
      // 兼容小程序和 H5 的取值
      const val = (typeof e === 'string' ? e : (e.detail ? e.detail.value : e)) || '';
      const key = val.trim();
      this.searchText = key;
      
      if (!key) {
        this.filteredList = this.allSchools; // 恢复全量
        return;
      }

      // 基于原始副本 allSchools 进行过滤，确保搜索逻辑正确
      this.filteredList = this.allSchools.filter(item => 
        item.label && item.label.includes(key)
      );
    },

    navTo(url) {
      if (!url) return;
      uni.navigateTo({
        url,
        fail: () => { uni.switchTab({ url }); }
      });
    }
  },
  onPullDownRefresh() {
    this.fetchSchoolList();
  }
}
</script>
/* 加上 style 标签，并确保支持 scss */
<style lang="scss" scoped>
.selector-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9ff;
}

.search-box {
  padding: 20rpx 30rpx;
  background-color: #fff;
  /* 增加阴影，让搜索框有悬浮感，排版更高级 */
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05); 
  z-index: 10;
}

.list-scroll {
  flex: 1;
  /* 确保超出部分滚动 */
  overflow-y: scroll; 
}

.student-item {
  display: flex;
  flex-direction: row; // 强制横向排列
  align-items: center; // 垂直方向居中对齐
  padding: 20rpx 0;    // 增加上下间距，防止显得拥挤
  width: 100%;
  
  /* 头像固定宽度，防止被挤压 */
  .fui-avatar {
    flex-shrink: 0; 
  }

  .student-info {
    flex: 1;           // 核心：撑开中间区域，把标签和箭头挤到最右边
    margin-left: 24rpx;
    display: flex;
    flex-direction: column; // 文字上下排列
    justify-content: center;
    overflow: hidden;  // 防止文字过长撑开布局
    
    .name {
      font-size: 30rpx;
      font-weight: 500;
      line-height: 1.4;
      color: #333;
      /* 如果名字太长显示省略号 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .class {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx; 
    }
  }

  /* 标签靠右对齐 */
  .fui-tag {
    flex-shrink: 0;
    margin-right: 10rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;
  
  text {
    margin-top: 20rpx;
  }
}
</style>
