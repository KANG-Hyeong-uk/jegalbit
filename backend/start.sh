#!/bin/bash

# 암호화폐 백테스팅 API 서버 시작 스크립트

echo "=================================="
echo "암호화폐 백테스팅 API 서버 시작"
echo "=================================="

# 가상환경 확인
if [ -d "venv" ]; then
    echo "가상환경 활성화 중..."
    source venv/bin/activate
elif [ -d "env" ]; then
    echo "가상환경 활성화 중..."
    source env/bin/activate
fi

# 의존성 확인
if [ ! -f "venv/bin/python" ] && [ ! -f "env/bin/python" ]; then
    echo "경고: 가상환경이 없습니다. 의존성 설치가 필요할 수 있습니다."
    echo "다음 명령어로 설치하세요: pip install -r requirements.txt"
fi

# 서버 시작
echo "FastAPI 서버를 포트 5001에서 시작합니다..."
echo "API 문서: http://localhost:5001/docs"
echo "=================================="

python app_fastapi.py
