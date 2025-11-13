#!/bin/bash

# Flask 서버 시작 스크립트

echo "============================================================"
echo "암호화폐 포트폴리오 시뮬레이터 - Flask 서버 시작"
echo "============================================================"
echo ""

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# 가상환경 활성화
if [ -d "venv" ]; then
    echo "가상환경 활성화 중..."
    source venv/bin/activate
else
    echo "경고: venv 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# Flask 서버 실행
echo "Flask 서버 시작 중..."
echo "API 엔드포인트: http://localhost:5001/api"
echo ""
echo "참고: macOS에서 포트 5000은 AirPlay가 사용하므로 5001을 사용합니다."
echo ""
echo "서버를 종료하려면 Ctrl+C를 누르세요"
echo "============================================================"
echo ""

python app.py

