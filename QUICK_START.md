# 🚀 EC2 빠른 배포 가이드 (MobaXterm 사용)

## 1️⃣ EC2 접속
```bash
# MobaXterm에서 SSH 세션 생성
# Host: 43.202.232.2
# Username: ubuntu
# Port: 22
```

## 2️⃣ Docker 설치 (원라이너)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo usermod -aG docker $USER && newgrp docker && sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
```

## 3️⃣ 프로젝트 파일 업로드
**MobaXterm SFTP 사용:**
1. 왼쪽 패널에서 홈 디렉토리 확인
2. `crypto-portfolio` 폴더 생성
3. 로컬의 모든 프로젝트 파일을 드래그 앤 드롭

**또는 터미널에서:**
```bash
mkdir -p ~/crypto-portfolio
cd ~/crypto-portfolio
# 여기서 파일 업로드
```

## 4️⃣ SSL 인증서 발급 (Let's Encrypt)
```bash
cd ~/crypto-portfolio

# 필요한 디렉토리 생성
mkdir -p certbot/conf certbot/www

# HTTP만 활성화된 임시 Nginx 설정 생성
cat > nginx/nginx-temp.conf << 'EOF'
user nginx;
worker_processes auto;
pid /var/run/nginx.pid;

events { worker_connections 1024; }

http {
    server {
        listen 80;
        server_name jegalbit.kro.kr;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# docker-compose.yml 임시 수정: nginx 볼륨 부분을 다음으로 변경
# - ./nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro

# Nginx와 Certbot만 실행
docker-compose up -d nginx certbot

# SSL 인증서 발급 (이메일 주소 변경 필수!)
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email \
  -d jegalbit.kro.kr

# 인증서 확인
ls -la certbot/conf/live/jegalbit.kro.kr/

# 임시 설정 제거 및 원래 설정 복구
# docker-compose.yml을 원래대로 되돌림
# - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

# 모든 서비스 재시작
docker-compose down
```

## 5️⃣ 전체 서비스 실행
```bash
cd ~/crypto-portfolio

# 모든 서비스 빌드 및 시작
docker-compose up -d --build

# 실행 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

## 6️⃣ 접속 확인
```bash
# 헬스체크
curl http://localhost:5001/api/health

# HTTPS 접속
curl https://jegalbit.kro.kr

# 브라우저에서 접속
# https://jegalbit.kro.kr
```

---

## 🔧 자주 사용하는 명령어

```bash
# 서비스 재시작
docker-compose restart

# 로그 보기
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# 서비스 중지
docker-compose down

# 서비스 시작
docker-compose up -d

# 특정 서비스만 재빌드
docker-compose up -d --build backend
```

---

## ❗ 문제 해결

### SSL 인증서 발급 실패
```bash
# DNS 설정 확인
nslookup jegalbit.kro.kr

# 80 포트 확인
sudo netstat -tulpn | grep :80

# Certbot 로그 확인
docker-compose logs certbot
```

### 백엔드 연결 안됨
```bash
# 백엔드 로그 확인
docker-compose logs backend

# 백엔드 재시작
docker-compose restart backend
```

### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a

# 디스크 확인
df -h
```

---

## 📋 체크리스트
- [ ] EC2 보안 그룹: 80, 443 포트 오픈
- [ ] 도메인 DNS: jegalbit.kro.kr → 43.202.232.2
- [ ] Docker 설치 완료
- [ ] 프로젝트 파일 업로드 완료
- [ ] SSL 인증서 발급 완료
- [ ] 서비스 실행 완료
- [ ] https://jegalbit.kro.kr 접속 확인

**더 자세한 내용은 DEPLOYMENT.md를 참고하세요!**
