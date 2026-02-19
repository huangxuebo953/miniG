// vite.config.js
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.yoozhi.cn', // 目标域名
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // 保持路径一致
      }
    }
  }
});
