# Node.js 환경
FROM node:18-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 전체 복사
COPY . .

# 환경 변수 반영된 상태로 Vite 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]












