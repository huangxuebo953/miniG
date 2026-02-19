<template>
	<view class="consume-page">
		<view class="balance-card">
			<view class="decor-circle-1"></view>
			<view class="decor-circle-2"></view>
			<view class="card-content">
				<view class="stu-header">
					<view class="avatar-box">
						<text>{{ '学' }}</text>
					</view>
					<view class="stu-text">
						<view class="name-line">
							<text class="name">{{ studentInfo.name }}</text>
							<text class="school-tag">{{ studentInfo.school.wxname || '未关联学校' }}</text>
						</view>
						<text class="stu-id">STUDENT ID: {{ studentInfo.studentid || '000000' }}</text>
					</view>
				</view>
				<view class="balance-main">
					<text class="label">账户可用余额 (CNY)</text>
					<view class="price-row">
						<text class="symbol">¥</text>
						<text class="integer">{{ balance.toFixed(2) }}</text>
					</view>
				</view>
				<view class="card-footer">
					<text class="card-type">SMART CAMPUS CARD</text>
					<view class="gold-chip"><view class="chip-line"></view><view class="chip-line"></view></view>
				</view>
			</view>
		</view>

		<view class="history-section">
			<view class="filter-container">
				<view class="section-title">
					<text>账单明细</text>
					<view class="count-badge">共 {{ recordList.length }} 笔</view>
				</view>
				
				<view class="date-range-picker">
					<view class="picker-group">
						<picker mode="date" :value="startDate" @change="onDateChange($event, 'start')">
							<view class="date-picker-item">
								<text class="picker-label">起始日期</text>
								<text class="picker-value">{{ formatChineseDate(startDate) }}</text>
							</view>
						</picker>
						
						<view class="picker-divider">至</view>
						
						<picker mode="date" :value="endDate" @change="onDateChange($event, 'end')">
							<view class="date-picker-item">
								<text class="picker-label">截止日期</text>
								<text class="picker-value">{{ formatChineseDate(endDate) }}</text>
							</view>
						</picker>
					</view>
					
					<view class="search-btn" @tap="fetchData">
						<fui-icon name="search" :size="32" color="#fff"></fui-icon>
					</view>
				</view>
			</view>

			<scroll-view scroll-y class="list-scroll">
				<view class="record-card" v-for="(log, index) in recordList" :key="index">
					<view class="record-left">
						<view class="icon-circle" :class="log.operate">
							<fui-icon :name="log.operate == '1' ? 'plussign' : 'minussign'" 
								:color="log.operate == '1' ? '#FF6B00' : '#1A1A1A'" :size="50"></fui-icon>
						</view>
						<view class="record-info">
					   
							<text class="reason">{{ log.kind }}</text>
							 <text class="date">{{ log.counterparty}}</text>
              <text class="date">{{ log.dealtime }}</text>
						
            </view>
					</view>
					<view class="record-right" :class="log.type">
						<text class="symbol">{{ log.operate === '1' ? '+' : '-' }}</text>
						<text class="val">{{ log.money }}</text>
					</view>
				</view>
				<view v-if="recordList.length === 0" class="empty-box">
					<fui-icon name="order" :size="80" color="#ddd"></fui-icon>
					<text>该时段暂无记录</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			balance: 0.00,
			studentInfo: { name: '', studentid: '', school: { wxname: '' } },
			recordList: [],
			startDate: '',
			endDate: ''
		}
	},
	onLoad() {
		this.initDates();
		
		this.fetchData();
	},
	methods: {
		// 日期中文格式化工具
		formatChineseDate(dateStr) {
			if (!dateStr) return '';
			const parts = dateStr.split('-');
			return `${parts[0]}年${parts[1]}月${parts[2]}日`;
		},

		initDates() {
			const now = new Date();
			const y = now.getFullYear();
			const m = (now.getMonth() + 1).toString().padStart(2, '0');
			const d = now.getDate().toString().padStart(2, '0');
			this.startDate = `${y}-${m}-01`;
			this.endDate = `${y}-${m}-${d}`;
		},
		
		onDateChange(e, type) {
			if (type === 'start') this.startDate = e.detail.value;
			else this.endDate = e.detail.value;
			this.fetchData();
		},

		async fetchData() {
			const cur = uni.getStorageSync('currentStudent');
			if (!cur) return;
			this.studentInfo = cur;
			uni.showLoading({ title: '加载中' });
			try {
				const res = await uni.$post('miniProgram/student/consumer', { 
					stuid: cur.id,
					start: this.startDate,
					end: this.endDate
				});
				if (res && res.code === 200) {
					this.balance = res.balance || 0;
					this.recordList = res.list || [];
				}
			} catch (e) {
				console.error(e);
			} finally {
				uni.hideLoading();
			}
		},

	}
}
</script>

<style lang="scss" scoped>
/* 基础背景 (保持一致) */
.consume-page { min-height: 100vh; background-color: #F6F8FF; padding: 40rpx 32rpx; }

/* 1. 卡片样式 (保持之前花哨的设计) */
.balance-card {
	position: relative; height: 420rpx;
	background: linear-gradient(135deg, #2D1B6B 0%, #6831FF 100%);
	border-radius: 50rpx; overflow: hidden;
	box-shadow: 0 30rpx 60rpx rgba(104, 49, 255, 0.25);
	.decor-circle-1 { position: absolute; width: 380rpx; height: 380rpx; background: rgba(255, 255, 255, 0.08); border-radius: 50%; top: -120rpx; right: -100rpx; }
	.decor-circle-2 { position: absolute; width: 240rpx; height: 240rpx; background: linear-gradient(to bottom, rgba(255,255,255,0.12), transparent); border-radius: 50%; bottom: -60rpx; left: 60rpx; }
	.card-content { position: relative; z-index: 5; padding: 48rpx; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
}
.stu-header {
	display: flex; align-items: center;
	.avatar-box { width: 80rpx; height: 80rpx; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; color: #fff; font-weight: bold; border: 1rpx solid rgba(255, 255, 255, 0.2); }
	.stu-text { margin-left: 20rpx; .name-line { display: flex; align-items: center; .name { font-size: 34rpx; font-weight: bold; color: #fff; } .school-tag { font-size: 18rpx; background: #00D08E; color: #fff; padding: 2rpx 12rpx; border-radius: 40rpx; margin-left: 12rpx; } } .stu-id { font-size: 18rpx; color: rgba(255, 255, 255, 0.5); margin-top: 4rpx; } }
}
.balance-main { .label { font-size: 24rpx; color: rgba(255, 255, 255, 0.7); } .price-row { display: flex; align-items: baseline; color: #fff; margin-top: 6rpx; .symbol { font-size: 40rpx; font-weight: bold; margin-right: 8rpx; } .integer { font-size: 80rpx; font-weight: bold; } } }
.card-footer { display: flex; justify-content: space-between; align-items: center; .card-type { font-size: 18rpx; color: rgba(255, 255, 255, 0.4); letter-spacing: 4rpx; } .gold-chip { width: 50rpx; height: 38rpx; background: linear-gradient(135deg, #FFE57E, #FFB800); border-radius: 6rpx; padding: 4rpx; box-sizing: border-box; .chip-line { height: 2rpx; background: rgba(0,0,0,0.1); margin-top: 6rpx; } } }

/* 2. 核心修复：查询条样式 */
.date-range-picker {
	display: flex; 
	align-items: center; 
	justify-content: space-between; /* 确保子元素两端分布 */
	background: #fff; 
	padding: 16rpx 24rpx; 
	border-radius: 30rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);

	.picker-group {
		flex: 1; /* 撑开中间空间，把搜索按钮挤到最右边 */
		display: flex;
		align-items: center;
		
		.date-picker-item {
			display: flex;
			flex-direction: column;
			.picker-label { font-size: 20rpx; color: #B2B2B2; margin-bottom: 2rpx; }
			.picker-value { font-size: 24rpx; color: #333; font-weight: 500; }
		}

		.picker-divider {
			font-size: 22rpx;
			color: #D1D1D1;
			margin: 0 20rpx;
			padding-top: 20rpx;
		}
	}

	.search-btn {
		width: 76rpx; 
		height: 76rpx;
		background: #6831FF; 
		border-radius: 22rpx;
		display: flex; 
		align-items: center; 
		justify-content: center;
		flex-shrink: 0; /* 防止按钮被压缩 */
		box-shadow: 0 8rpx 16rpx rgba(104, 49, 255, 0.2);
		
		&:active { transform: scale(0.9); opacity: 0.9; }
	}
}

/* 列表样式 (保持一致) */
.filter-container { margin-top: 50rpx; margin-bottom: 30rpx; .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; padding: 0 8rpx; font-size: 34rpx; font-weight: bold; color: #1A1A1A; .count-badge { font-size: 22rpx; font-weight: normal; color: #6831FF; background: rgba(104, 49, 255, 0.08); padding: 4rpx 16rpx; border-radius: 100rpx; } } }
.list-scroll { height: calc(100vh - 650rpx); }
.record-card { background: #fff; padding: 30rpx; border-radius: 32rpx; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; .record-left { display: flex; align-items: center; .icon-circle { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.plus { background: rgba(255, 107, 0, 0.1); } &.minus { background: rgba(0, 0, 0, 0.04); } } .record-info { margin-left: 24rpx; .reason { font-size: 30rpx; font-weight: 500; color: #333; display: block; } .date { font-size: 24rpx; color: #B2B2B2; margin-top: 4rpx; display: block; } } } .record-right { text-align: right; font-size: 34rpx; font-weight: bold; &.plus { color: #FF6B00; } &.minus { color: #1A1A1A; } } }
.empty-box { padding-top: 80rpx; display: flex; flex-direction: column; align-items: center; color: #B2B2B2; font-size: 26rpx; text { margin-top: 16rpx; } }
</style>
