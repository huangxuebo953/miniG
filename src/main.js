import { createSSRApp } from "vue";
import App from "./App.vue";
// 1. 导入你的请求函数（请确保路径正确）
import post from "./utils/request.js";

export function createApp() {
  const app = createSSRApp(App);

  // 2. 挂载到 uni 对象（全局通用，无需 import）
  // 这样你在任何页面都可以通过 uni.$post 调用
  uni.$post = post;

  // 3. 也可以挂载到 Vue 全局属性（页面内通过 proxy 访问，稍显麻烦）
  // app.config.globalProperties.$post = post;

  return {
    app,
  };
}
