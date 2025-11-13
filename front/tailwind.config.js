/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 디자인 토큰에서 정의된 색상 (Figma에서 가져올 예정)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 추가 색상은 Figma 분석 후 업데이트
      },
      spacing: {
        // 8px 기반 스페이싱 시스템
      },
      fontFamily: {
        // 폰트 설정 (Figma에서 가져올 예정)
      },
    },
  },
  plugins: [],
}
