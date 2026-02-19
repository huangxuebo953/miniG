<template>
	<view class="container">
		<view class="header-bg">
			<view class="header-content">
				<view class="loc-bar">
					<view class="icon-circle">
						<fui-icon name="qa" color="#fff" :size="30"></fui-icon>
					</view>
					<text class="loc-text">反馈投诉</text>
				</view>
			</view>
			<view class="bg-circle"></view>
		</view>

		<view class="user-card">
			<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image class="avatar" :src="userInfo.avatarUrl || defaultAvatar" mode="aspectFill"></image>
				<view class="camera-icon">
					<fui-icon name="camera" color="#fff" :size="20"></fui-icon>
				</view>
			</button>

			<view class="info">
				<view class="text-group">
					<text class="greeting">欢迎回来,</text>
					<text class="user-name">{{ studentInfo.name }} 家长</text>
				</view>
				<view class="switch-btn" @tap="showStudentEnum = true">
					<text>切换学生</text>
					<fui-icon name="exchange" :size="28" color="#6831FF"></fui-icon>
				</view>
			</view>
		</view>

		<view class="menu-box">
			<view class="menu-grid">
				<view class="menu-item" v-for="(item,index) in menus" :key="index" @tap="navTo(item.path)">
					<view class="icon-wrap">
						<image :src="item.icon" class="menu-icon" mode="widthFix" />
					</view>
					<text class="menu-text">{{item.item}}</text>
				</view>
			</view>
		</view>

		<fui-bottom-popup :show="showBindPopup" :maskClosable="false" radius="48">
			<view class="popup-content">
				<view class="warning-ring">
					<fui-icon name="warning-fill" color="#6831FF" :size="80"></fui-icon>
				</view>
				<text class="popup-title">身份未绑定</text>
				<view class="popup-body">
					<text class="desc">为了保障您的正常使用，使用前请先绑定学生信息。</text>
				</view>
				<view class="popup-footer">
					<fui-button text="立即去绑定" background="linear-gradient(to right, #6831FF, #8E61FF)" radius="100rpx"
						@click="navTo('/pages/stu/school')">
					</fui-button>
				</view>
			</view>
		</fui-bottom-popup>

		<fui-bottom-popup :show="showStudentEnum" @close="showStudentEnum = false" radius="48">
			<view class="student-popup">
				<view class="popup-header">
					<view class="header-left">
						<text class="popup-title">选择关联学生</text>
					</view>
					<view class="manage-entry" @tap="navTo('/pages/stu/bindManager')">
						<text>管理</text>
						<fui-icon name="setup" :size="36" color="#6831FF"></fui-icon>
					</view>
				</view>

				<scroll-view scroll-y class="student-list">
					<view class="student-item" v-for="(item, index) in studentList" :key="index" @tap="selectStudent(item)">
						<view class="stu-info-left">
							<view class="stu-avatar-circle">
								<text>{{ item.name ? item.name.substring(0, 1) : '学' }}</text>
							</view>
							<view class="stu-detail">
								<text class="stu-name">{{ item.name }}</text>
								<text class="stu-num">学号：{{ item.studentid }}</text>
								<text class="stu-num" v-if="item.school">{{ item.school.wxname }}</text>
							</view>
						</view>
						<fui-icon name="arrowright" :size="32" color="#ccc"></fui-icon>
					</view>
				</scroll-view>
			</view>
		</fui-bottom-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menus: [
					{ item: '消费记录', icon: '/static/images/common/record.png', path: '/pages/stu/consumer' },
					{ item: '绑定学生', icon: '/static/images/common/class2.png', path: '/pages/stu/school' },
					{ item: '消息通知', icon: '/static/images/common/notify.png', path: '/pages/stu/test' }
				],
				defaultAvatar: '/static/images/common/ava.png',
				openid: uni.getStorageSync('openid') || '',
				userInfo: {
					avatarUrl: '',
					nickName: ''
				},
				studentInfo: {
					name: '未登录'
				},
				isLoading: false,
				showBindPopup: false,
				studentList: [],
				showStudentEnum: false,
			}
		},
		methods: {
			// --- 原有核心逻辑：头像选择 ---
			onChooseAvatar(e) {
				this.userInfo.avatarUrl = e.detail.avatarUrl;
				// 这里可以调用 uploadFile 上传到服务器
			},

			// --- 原有核心逻辑：初始化登录 ---
			async initLogin() {
				if (this.isLoading) return;
				this.isLoading = true;
				uni.showLoading({ title: '安全登录中...', mask: true });

				try {
					const loginRes = await uni.login({ provider: 'weixin' });
					const code = loginRes.code || (loginRes[1] && loginRes[1].code);
					if (code) {
						await this.fetchStudentData(code);
					} else {
						throw new Error("Code获取失败");
					}
				} catch (e) {
					console.error("登录失败:", e);
					uni.showToast({ title: '登录同步失败', icon: 'none' });
				} finally {
					this.isLoading = false;
					uni.hideLoading();
				}
			},

			// --- 原有核心逻辑：获取后端学生数据 ---
			fetchStudentData(code) {
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
									this.Unlogin(data);
								} else {
									this.successLogin(data);
								}
								resolve(data);
							} else {
								reject('Error');
							}
						},
						fail: (err) => reject(err)
					});
				});
			},

			// --- 原有核心逻辑：多学生切换 ---
			selectStudent(student) {
				this.showStudentEnum = false;
				this.confirmEntry(student);
			},

			confirmEntry(student) {
				uni.setStorageSync('currentStudent', student);
				this.studentInfo = student;
				uni.showToast({ title: `当前：${student.name}`, icon: 'success' });
			},

			successLogin(data) {
        uni.setStorageSync('openid',data.openid) 
				uni.setStorageSync('token', data.token);
				uni.setStorageSync('user', data.user);
        console.log("登录成功! openid",uni.getStorageSync('openid'))
				this.studentList = data.student;
				if (data.student.length > 1) {
					this.showStudentEnum = true;
				} else {
					this.confirmEntry(data.student[0]);
				}
			},

			Unlogin(data) {
				if (data.openid) {
					this.openid = data.openid;
					uni.setStorageSync('openid', data.openid);
				}
				this.showBindPopup = true;
			},

			// --- 模拟测试逻辑 ---
			testfetchStudentData() {
				return new Promise((resolve, reject) => {
					uni.request({
						url: 'https://www.yoozhi.cn/api/miniProgram/testlogin',
						method: 'POST',
						success: (res) => {
							if (res.statusCode === 200) {
								const data = res.data;
								if (!data.student || (Array.isArray(data.student) && data.student.length === 0)) {
									this.Unlogin(data);
								} else {
									this.successLogin(data);
								}
								resolve(data);
							}
						}
					});
				});
			},

			navTo(path) {
				if (!path) return;
				uni.navigateTo({
					url: path,
					fail: () => { uni.switchTab({ url: path }); }
				});
			}
		},
		onLoad() {
			// #ifdef H5
			this.testfetchStudentData();
			// #endif

			// #ifdef MP-WEIXIN
			this.initLogin();
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
	$theme-purple: #6831FF;
	$soft-purple: #F4F0FF;

	.container {
		min-height: 100vh;
		background-color: #F8F9FF;
	}

	/* 顶部背景装饰 */
	.header-bg {
		background: linear-gradient(180deg, $theme-purple 0%, #8E61FF 100%);
		height: 440rpx;
		border-bottom-left-radius: 80rpx;
		border-bottom-right-radius: 80rpx;
		position: relative;
		overflow: hidden;

		.header-content {
			position: relative;
			z-index: 2;
			padding: 100rpx 40rpx 0;
		}

		.loc-bar {
			display: flex;
			align-items: center;
			background: rgba(255, 255, 255, 0.15);
			padding: 10rpx 24rpx;
			border-radius: 100rpx;
			backdrop-filter: blur(10px);
			width: fit-content;

			.loc-text { color: #fff; margin-left: 10rpx; font-size: 26rpx; font-weight: 500; }
		}

		.bg-circle {
			position: absolute;
			width: 350rpx; height: 350rpx;
			background: rgba(255, 255, 255, 0.06);
			border-radius: 50%;
			top: -50rpx; right: -50rpx;
		}
	}

	/* 用户卡片 */
	.user-card {
		background: #fff;
		margin: -120rpx 32rpx 0;
		padding: 40rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 20rpx 40rpx rgba(104, 49, 255, 0.08);
		position: relative;
		z-index: 10;

		.avatar-wrapper {
			padding: 0; width: 130rpx !important; height: 130rpx !important;
			border-radius: 50%; position: relative;
			background: #f0f0f0; border: 6rpx solid #F0EBFF;
			&::after { border: none; }
			.avatar { width: 100%; height: 100%; border-radius: 50%; }
			.camera-icon {
				position: absolute; right: 0; bottom: 0;
				width: 40rpx; height: 40rpx; background: $theme-purple;
				border-radius: 50%; border: 4rpx solid #fff;
				display: flex; align-items: center; justify-content: center;
			}
		}

		.info {
			flex: 1; margin-left: 30rpx;
			display: flex; justify-content: space-between; align-items: center;
			.text-group {
				.greeting { font-size: 22rpx; color: #999; display: block; margin-bottom: 4rpx; }
				.user-name { font-size: 34rpx; font-weight: bold; color: #333; }
			}
			.switch-btn {
				background: $soft-purple; padding: 12rpx 20rpx; border-radius: 100rpx;
				display: flex; align-items: center;
				text { font-size: 22rpx; color: $theme-purple; font-weight: bold; margin-right: 6rpx; }
			}
		}
	}

	/* 功能菜单菜单盒子 */
	.menu-box {
		background: #fff; margin: 40rpx 32rpx;
		border-radius: 40rpx; padding: 40rpx 10rpx;
		box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.01);
		.menu-grid { display: flex; flex-wrap: wrap; }
		.menu-item {
			width: 33.33%; display: flex; flex-direction: column; align-items: center;
			margin-bottom: 10rpx;
			.icon-wrap {
				width: 100rpx; height: 100rpx; background: #F8F9FF;
				border-radius: 32rpx; display: flex; align-items: center; justify-content: center;
				margin-bottom: 16rpx;
				.menu-icon { width: 60rpx; height: 60rpx; }
			}
			text { font-size: 26rpx; color: #444; font-weight: 500; }
			&:active { opacity: 0.7; transform: scale(0.95); }
		}
	}

	/* 弹窗通用样式 */
	.popup-content {
		background: #fff; padding: 60rpx 40rpx; text-align: center;
		.warning-ring {
			width: 160rpx; height: 160rpx; background: $soft-purple;
			border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
			margin-bottom: 30rpx;
		}
		.popup-title { font-size: 40rpx; font-weight: bold; color: #333; }
		.popup-body { margin: 24rpx 0 60rpx; .desc { font-size: 28rpx; color: #666; } }
	}

	.student-popup {
		padding: 40rpx 32rpx;
		.popup-header {
			display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx;
			.popup-title { font-size: 36rpx; font-weight: bold; color: #333; }
			.manage-entry {
				display: flex; align-items: center; background: $soft-purple;
				padding: 8rpx 20rpx; border-radius: 100rpx;
				text { font-size: 24rpx; color: $theme-purple; font-weight: bold; margin-right: 6rpx; }
			}
		}
		.student-list { max-height: 60vh; }
		.student-item {
			display: flex; justify-content: space-between; align-items: center;
			padding: 32rpx; background: #F9F9FF; border-radius: 30rpx;
			margin-bottom: 20rpx; border: 2rpx solid #F0F2FF;
			.stu-info-left {
				display: flex; align-items: center;
				.stu-avatar-circle {
					width: 90rpx; height: 90rpx; background: $theme-purple;
					border-radius: 24rpx; display: flex; align-items: center; justify-content: center;
					color: #fff; font-size: 36rpx; font-weight: bold;
				}
				.stu-detail {
					margin-left: 24rpx; display: flex; flex-direction: column;
					.stu-name { font-size: 32rpx; font-weight: bold; color: #333; }
					.stu-num { font-size: 22rpx; color: #999; margin-top: 4rpx; }
				}
			}
		}
	}
</style>
