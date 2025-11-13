#!/bin/bash

# 암호화폐 포트폴리오 시뮬레이터 통합 실행 스크립트

echo "============================================================"
echo "암호화폐 포트폴리오 시뮬레이터 시작"
echo "============================================================"
echo ""

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# 가상환경 확인
if [ ! -d "venv" ]; then
    echo "❌ 오류: venv 디렉토리를 찾을 수 없습니다."
    echo "가상환경을 먼저 생성하세요."
    exit 1
fi

# 포트 확인
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "⚠️  포트 5001이 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  포트 3000이 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 가상환경 활성화
echo "📦 가상환경 활성화 중..."
source venv/bin/activate

# Flask 서버 시작 (백그라운드)
echo "🚀 Flask 서버 시작 중 (포트 5001)..."
python app.py > flask_server.log 2>&1 &
FLASK_PID=$!
sleep 3

# Flask 서버 상태 확인
if ps -p $FLASK_PID > /dev/null; then
    echo "✅ Flask 서버가 시작되었습니다 (PID: $FLASK_PID)"
    echo "   API: http://localhost:5001/api"
else
    echo "❌ Flask 서버 시작 실패"
    cat flask_server.log
    exit 1
fi

# React 앱 시작
echo "⚛️  React 앱 시작 중 (포트 3000)..."
cd frontend

# npm 의존성 확인
if [ ! -d "node_modules" ]; then
    echo "📦 npm 패키지 설치 중..."
    npm install
fi

# React 앱 시작 (백그라운드)
npm start > ../react_app.log 2>&1 &
REACT_PID=$!
cd ..

sleep 5

# React 앱 상태 확인
if ps -p $REACT_PID > /dev/null; then
    echo "✅ React 앱이 시작되었습니다 (PID: $REACT_PID)"
    echo "   웹앱: http://localhost:3000"
else
    echo "❌ React 앱 시작 실패"
    cat react_app.log
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "============================================================"
echo "✅ 모든 서버가 실행 중입니다!"
echo "============================================================"
echo ""
echo "🌐 웹 애플리케이션: http://localhost:3000"
echo "🔌 API 서버: http://localhost:5001/api"
echo ""
echo "📝 로그 파일:"
echo "   - Flask: flask_server.log"
echo "   - React: react_app.log"
echo ""
echo "⏹️  서버를 종료하려면 Ctrl+C를 누르세요"
echo "============================================================"
echo ""

# 프로세스 종료 함수
cleanup() {
    echo ""
    echo "🛑 서버 종료 중..."
    kill $FLASK_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    # React의 자식 프로세스도 종료
    pkill -f "react-scripts" 2>/dev/null
    echo "✅ 서버가 종료되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup INT TERM

# 프로세스가 종료될 때까지 대기
wait

