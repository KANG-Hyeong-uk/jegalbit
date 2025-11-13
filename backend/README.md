# Backend - 암호화폐 백테스팅 API

FastAPI 기반의 암호화폐 백테스팅 시뮬레이터 백엔드 서버입니다.

## 기능

- LSTM 기반 암호화폐 가격 예측
- RSI, MACD, 볼린저 밴드 등 기술적 지표 분석
- 백테스팅 시뮬레이션
- 최적 매매 타이밍 분석
- 상승 확률 계산

## 설치

```bash
pip install -r requirements.txt
```

## 실행

```bash
python app_fastapi.py
```

또는

```bash
uvicorn app_fastapi:app --host 127.0.0.1 --port 5001
```

## API 엔드포인트

### 헬스 체크
- `GET /api/health`

### 백테스팅 실행
- `POST /api/backtest`
- Request Body:
  ```json
  {
    "market": "KRW-BTC",
    "days": 500,
    "initial_capital": 10000000,
    "use_api": false
  }
  ```

### 마켓 목록
- `GET /api/markets`

### 매매 일지 CRUD
- `POST /api/trades` - 매매 기록 생성
- `GET /api/trades` - 모든 매매 기록 조회 (필터링 옵션)
- `GET /api/trades/{trade_id}` - 특정 매매 기록 조회
- `PUT /api/trades/{trade_id}` - 매매 기록 수정
- `DELETE /api/trades/{trade_id}` - 매매 기록 삭제
- `GET /api/trades/statistics/summary` - 통계 조회

## API 문서

서버 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:5001/docs
- ReDoc: http://localhost:5001/redoc

## 지원 암호화폐

- 비트코인 (BTC)
- 이더리움 (ETH)
- 리플 (XRP)
- 에이다 (ADA)
- 폴카닷 (DOT)
- 체인링크 (LINK)
- 라이트코인 (LTC)
- 비트코인 캐시 (BCH)

## 기술 스택

- FastAPI
- TensorFlow/Keras (LSTM)
- Pandas, NumPy
- Matplotlib
- scikit-learn

---

# 자동 매매 봇 (Node.js/TypeScript)

업비트 API를 사용한 간단한 자동 매매 봇입니다.

## 기능

- **자동 매수/매도**: RSI 지표 기반 자동 매매
- **RSI 전략**:
  - RSI < 30: 매수 신호
  - RSI > 70: 매도 신호
- **실시간 모니터링**: 설정한 간격으로 시장 체크

## 설치

```bash
cd backend
npm install
```

## 설정

1. `.env` 파일 생성:
```bash
cp .env.example .env
```

2. `.env` 파일 수정:
```env
UPBIT_OPEN_API_ACCESS_KEY=your_access_key
UPBIT_OPEN_API_SECRET_KEY=your_secret_key
MARKET=KRW-BTC
TRADE_AMOUNT=5000
CHECK_INTERVAL=60000
```

## 실행

```bash
npm start
```

## 주의사항

⚠️ **실제 거래 시 주의**
- 소액으로 테스트 후 사용하세요
- RSI는 단순 참고 지표이며, 손실 가능성이 있습니다
- 본인 책임 하에 사용하세요

## 구조

```
src/
├── upbit.ts      # 업비트 API 클래스
├── strategy.ts   # 매매 전략 (RSI)
├── bot.ts        # 자동 매매 봇
└── index.ts      # 실행 파일
```
