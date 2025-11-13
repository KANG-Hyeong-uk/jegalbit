@echo off
REM 암호화폐 백테스팅 API 서버 시작 스크립트 (Windows)

echo ==================================
echo 암호화폐 백테스팅 API 서버 시작
echo ==================================

REM 가상환경 확인 및 활성화
if exist "venv\Scripts\activate.bat" (
    echo 가상환경 활성화 중...
    call venv\Scripts\activate.bat
) else if exist "env\Scripts\activate.bat" (
    echo 가상환경 활성화 중...
    call env\Scripts\activate.bat
) else (
    echo 경고: 가상환경이 없습니다. 의존성 설치가 필요할 수 있습니다.
    echo 다음 명령어로 설치하세요: pip install -r requirements.txt
)

REM 서버 시작
echo FastAPI 서버를 포트 5001에서 시작합니다...
echo API 문서: http://localhost:5001/docs
echo ==================================

python app_fastapi.py
pause
