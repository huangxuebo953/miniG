const post = async (url, data = {}) => {
  let baseUrl = 'https://www.yoozhi.cn/api/';
  const openid = uni.getStorageSync('openid') || '';
  const token = uni.getStorageSync('token') || ''; // 读取本地存储的 auth token

  uni.showLoading({ title: '加载中...', mask: true });

  try {
    const response = await uni.request({
      url: baseUrl + url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // 标准 JWT 格式
        //'token': token // 备选：如果后端习惯直接读 token 字段
      },
      data: {
        ...data,
        openid: data.openid || openid
      }
    });
    console.log('request.js/openid', openid)
    uni.hideLoading();

    const res = Array.isArray(response) ? response[1] : response;

    // --- 统一处理状态码 ---
    if (res && res.statusCode === 200) {
      const result = res.data;

      // 业务逻辑成功
      if (result.status === 'success' || result.code === 200) {
        return result;
      }

      // 特殊处理：登录失效/未授权 (假设后端返回 401 或 code 为 401)
      if (result.code === 401) {
        uni.showToast({ title: '登录已过期', icon: 'none' });
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/login' }); // 跳转到登录页
        }, 1500);
        return null;
      }

      // 其他业务错误
      uni.showToast({
        title: result.message || 'Request.js异常报文',
        icon: 'error',
        duration: 5000
      });
      return result;

    } else if (res && res.statusCode === 401) {
      // HTTP 状态码层面的未授权处理
      uni.removeStorageSync('token');
      uni.showToast({ title: '请先登录', icon: 'none' });
      uni.reLaunch({ url: '/pages/login/login' });
      return null;
    } else {
      uni.showToast({ title: `服务器错误(${res.statusCode})`, icon: 'none' });
      return null;
    }
  } catch (e) {
    uni.hideLoading();
    console.error('Request Error:', e);
    uni.showToast({ title: '网络连接异常', icon: 'none' });
    return null;
  }
};

export default post;
