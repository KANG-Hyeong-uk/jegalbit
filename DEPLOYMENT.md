# EC2 프로덕션 배포 가이드

## 📋 목차
- [사전 준비사항](#사전-준비사항)
- [EC2 서버 초기 설정](#ec2-서버-초기-설정)
- [Docker 및 Docker Compose 설치](#docker-및-docker-compose-설치)
- [프로젝트 배포](#프로젝트-배포)
- [SSL 인증서 설정](#ssl-인증서-설정)
- [서비스 실행 및 관리](#서비스-실행-및-관리)
- [트러블슈팅](#트러블슈팅)

---

## 🔧 사전 준비사항

### 환경 정보
- **도메인**: jegalbit.kro.kr
- **EC2 IP**: 43.202.232.2
- **OS**: Ubuntu 20.04 이상 권장
- **포트**: 80 (HTTP), 443 (HTTPS), 5001 (Backend)

### EC2 보안 그룹 설정
AWS 콘솔에서 다음 포트를 허용해야 합니다:
- **22**: SSH
- **80**: HTTP
- **443**: HTTPS
- **5001**: Backend API (선택사항 - Nginx 프록시 사용 시 불필요)

---

## 🖥️ EC2 서버 초기 설정

### 1. SSH 접속 (MobaXterm)
```bash
# MobaXterm에서 새 세션 생성
# Host: 43.202.232.2
# Username: ubuntu (또는 ec2-user)
# Port: 22
# Private key: .pem 파일 선택
```

### 2. 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. 기본 패키지 설치
```bash
sudo apt install -y curl wget git vim htop
```

---

## 🐳 Docker 및 Docker Compose 설치

### 1. Docker 설치
```bash
# Docker 공식 GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker 서비스 시작 및 자동 실행 설정
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 명령 사용)
sudo usermod -aG docker $USER

# 변경사항 적용 (재로그인 필요)
newgrp docker
```

### 2. Docker Compose 설치
```bash
# Docker Compose 최신 버전 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 실행 권한 부여
sudo chmod +x /usr/local/bin/docker-compose

# 설치 확인
docker --version
docker-compose --version
```

---

## 📦 프로젝트 배포

### 1. 프로젝트 디렉토리 생성
```bash
cd ~
mkdir -p crypto-portfolio
cd crypto-portfolio
```

### 2. 프로젝트 파일 업로드

**방법 1: Git Clone (권장)**
```bash
# Git 저장소가 있는 경우
git clone <your-repository-url> .
```

**방법 2: MobaXterm SFTP로 파일 전송**
1. MobaXterm 왼쪽 패널에서 SFTP 브라우저 사용
2. 로컬의 모든 프로젝트 파일을 `~/crypto-portfolio/` 디렉토리로 드래그 앤 드롭

**필수 파일 목록**:
```
crypto-portfolio/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── app_fastapi.py
│   ├── crypto_simulator.py
│   ├── requirements.txt
│   └── ... (기타 백엔드 파일)
├── front/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── ... (기타 프론트엔드 파일)
└── nginx/
    └── nginx.conf
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cat > .env << EOF
DOMAIN=jegalbit.kro.kr
BACKEND_PORT=5001
FRONTEND_PORT=5173
CERTBOT_EMAIL=your-email@example.com
DB_PATH=./backend/trade_journal.db
EOF
```

### 4. 필요한 디렉토리 생성
```bash
# SSL 인증서 및 certbot 디렉토리 생성
mkdir -p certbot/conf certbot/www nginx/ssl
```

---

## 🔐 SSL 인증서 설정

### 방법 1: Let's Encrypt 자동 발급 (권장)

#### 1단계: 임시 Nginx 설정으로 HTTP만 활성화
```bash
# nginx/nginx.conf를 임시로 수정하여 HTTPS 부분 주석 처리
# 또는 간단한 HTTP 전용 설정 생성

cat > nginx/nginx-http-only.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name jegalbit.kro.kr;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# docker-compose.yml에서 nginx 볼륨을 임시 설정 파일로 변경
# nginx/nginx-http-only.conf:/etc/nginx/nginx.conf:ro
```

#### 2단계: 인증서 발급
```bash
# Docker Compose로 서비스 시작 (HTTP만)
docker-compose up -d nginx certbot

# Let's Encrypt 인증서 발급
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d jegalbit.kro.kr

# 인증서 발급 확인
sudo ls -la certbot/conf/live/jegalbit.kro.kr/
```

#### 3단계: HTTPS 활성화
```bash
# docker-compose.yml의 nginx 볼륨을 원래 설정으로 복구
# nginx/nginx.conf:/etc/nginx/nginx.conf:ro

# 모든 서비스 재시작
docker-compose down
docker-compose up -d
```

### 방법 2: 수동 인증서 설정
이미 인증서가 있는 경우:
```bash
# 인증서 파일을 nginx/ssl/ 디렉토리에 복사
cp /path/to/your/fullchain.pem nginx/ssl/
cp /path/to/your/privkey.pem nginx/ssl/

# nginx.conf에서 경로 수정
# ssl_certificate /etc/nginx/ssl/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

---

## 🚀 서비스 실행 및 관리

### 1. 서비스 빌드 및 시작
```bash
# 모든 컨테이너 빌드 및 백그라운드 실행
docker-compose up -d --build

# 실행 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 보기
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### 2. 서비스 상태 확인
```bash
# 헬스체크
curl http://localhost:5001/api/health

# HTTPS 접속 테스트
curl https://jegalbit.kro.kr

# 컨테이너 상태 확인
docker ps
```

### 3. 서비스 관리 명령어
```bash
# 서비스 중지
docker-compose stop

# 서비스 시작
docker-compose start

# 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart backend

# 모든 컨테이너 중지 및 삭제
docker-compose down

# 볼륨까지 삭제 (주의: 데이터 손실)
docker-compose down -v

# 이미지 다시 빌드
docker-compose build --no-cache

# 컨테이너 접속 (디버깅용)
docker-compose exec backend bash
docker-compose exec frontend sh
```

### 4. 로그 관리
```bash
# 실시간 로그 모니터링
docker-compose logs -f --tail=100

# 로그 파일 크기 제한 설정 (docker-compose.yml에 추가)
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"

# 로그 정리
docker system prune -a
```

### 5. 업데이트 배포
```bash
# 코드 변경 후
git pull  # Git 사용 시

# 서비스 재빌드 및 재시작
docker-compose down
docker-compose up -d --build

# 무중단 배포 (개선 버전)
docker-compose up -d --build --no-deps backend
docker-compose up -d --build --no-deps frontend
```

---

## 🔍 트러블슈팅

### 1. 포트 충돌 문제
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5001

# 프로세스 종료
sudo kill -9 <PID>
```

### 2. 도커 네트워크 문제
```bash
# 네트워크 재생성
docker-compose down
docker network prune
docker-compose up -d
```

### 3. SSL 인증서 문제
```bash
# 인증서 경로 확인
docker-compose exec nginx ls -la /etc/letsencrypt/live/jegalbit.kro.kr/

# Nginx 설정 테스트
docker-compose exec nginx nginx -t

# Certbot 로그 확인
docker-compose logs certbot
```

### 4. 백엔드 연결 오류
```bash
# 백엔드 컨테이너 로그 확인
docker-compose logs backend

# 백엔드 컨테이너 내부 접속
docker-compose exec backend bash

# Python 의존성 재설치
docker-compose exec backend pip install -r requirements.txt

# 백엔드만 재시작
docker-compose restart backend
```

### 5. 프론트엔드 빌드 실패
```bash
# 프론트엔드 컨테이너 로그 확인
docker-compose logs frontend

# 로컬에서 빌드 테스트
cd front
npm install
npm run build

# Node 메모리 부족 시
docker-compose build --build-arg NODE_OPTIONS="--max-old-space-size=4096" frontend
```

### 6. 디스크 공간 부족
```bash
# 디스크 사용량 확인
df -h

# Docker 리소스 정리
docker system prune -a --volumes

# 사용하지 않는 이미지 삭제
docker image prune -a
```

### 7. 데이터베이스 파일 권한 문제
```bash
# 백엔드 데이터 디렉토리 권한 설정
sudo chmod 755 backend/
sudo chown -R $USER:$USER backend/

# SQLite DB 파일 권한
chmod 664 backend/trade_journal.db
```

---

## 🔄 자동 재시작 설정

### Systemd 서비스 생성 (부팅 시 자동 시작)
```bash
# systemd 서비스 파일 생성
sudo cat > /etc/systemd/system/crypto-portfolio.service << 'EOF'
[Unit]
Description=Crypto Portfolio Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/crypto-portfolio
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable crypto-portfolio.service
sudo systemctl start crypto-portfolio.service

# 서비스 상태 확인
sudo systemctl status crypto-portfolio.service
```

---

## 📊 모니터링

### 1. 리소스 사용량 확인
```bash
# 컨테이너 리소스 사용량
docker stats

# 시스템 리소스
htop
```

### 2. 로그 모니터링 스크립트
```bash
# 편리한 로그 확인 스크립트 생성
cat > ~/monitor-logs.sh << 'EOF'
#!/bin/bash
cd ~/crypto-portfolio
echo "=== Backend Logs ==="
docker-compose logs --tail=50 backend
echo ""
echo "=== Frontend Logs ==="
docker-compose logs --tail=50 frontend
echo ""
echo "=== Nginx Logs ==="
docker-compose logs --tail=50 nginx
EOF

chmod +x ~/monitor-logs.sh

# 실행
~/monitor-logs.sh
```

---

## 🎯 빠른 참조 명령어

```bash
# 전체 서비스 시작
docker-compose up -d

# 전체 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 서비스 재시작
docker-compose restart

# 상태 확인
docker-compose ps

# 헬스체크
curl https://jegalbit.kro.kr/api/health

# SSL 인증서 갱신
docker-compose run --rm certbot renew
```

---

## ✅ 배포 체크리스트

- [ ] EC2 보안 그룹 설정 완료 (80, 443, 22 포트)
- [ ] 도메인 DNS 설정 완료 (jegalbit.kro.kr → 43.202.232.2)
- [ ] Docker 및 Docker Compose 설치 완료
- [ ] 프로젝트 파일 업로드 완료
- [ ] .env 파일 설정 완료
- [ ] SSL 인증서 발급 완료
- [ ] docker-compose up -d 실행 완료
- [ ] https://jegalbit.kro.kr 접속 확인
- [ ] API 엔드포인트 테스트 완료
- [ ] 자동 재시작 서비스 설정 완료

---

## 📞 추가 지원

문제가 발생하면 다음을 확인하세요:
1. 모든 컨테이너가 정상 실행 중인지: `docker-compose ps`
2. 로그에 에러가 없는지: `docker-compose logs`
3. 포트가 정상적으로 열려있는지: `sudo netstat -tulpn | grep LISTEN`
4. 방화벽 설정: `sudo ufw status`

성공적인 배포를 기원합니다! 🚀
