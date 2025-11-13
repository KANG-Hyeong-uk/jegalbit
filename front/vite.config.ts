import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/components/organisms'),
      '@templates': path.resolve(__dirname, './src/components/templates'),
      '@pages': path.resolve(__dirname, './src/components/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    allowedHosts: ['jegalbit.kro.kr'], // 도메인 허용
    host: '0.0.0.0',       // 도커 컨테이너 외부 접근 허용
    port: 5173,            // 기본 포트 명시
    strictPort: true,      // 포트 충돌 시 자동 변경 방지
    hmr: {
      protocol: 'ws',      // WebSocket 프로토콜
      host: 'jegalbit.kro.kr',  // 도메인으로 HMR 연결
      clientPort: 80,      // Nginx 포트
    },
    // API 프록시 설정 (개발 모드에서 사용)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      },
      '/upbit-api': {
        target: 'https://api.upbit.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/upbit-api/, ''),
      },
    },
    watch: {
      // 불필요한 파일 감시 제외
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.env*',
      ],
      // 파일 감시 간격 조정 (너무 민감하지 않게)
      usePolling: false,
    },
  },
})
