from dotenv import load_dotenv

# .env 파일 로드 (가장 먼저 실행!)
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import pandas as pd
import numpy as np
from crypto_simulator import (
    collect_historical_data,
    generate_sample_data,
    add_technical_indicators,
    find_optimal_buy_sell_signals,
    CryptoBacktester,
    create_chart_image
)
import trade_journal_db as db
import upbit_proxy

app = FastAPI(title="Crypto Backtest API", version="1.0.0")

# CORS 설정 - 모든 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request 모델
class BacktestRequest(BaseModel):
    market: str = 'KRW-BTC'
    days: int = 500
    initial_capital: float = 10000000
    use_api: bool = False

# 매매 일지 Request 모델
class TradeCreateRequest(BaseModel):
    symbol: str
    type: str  # 'BUY' or 'SELL'
    investment_amount: float
    return_rate: float
    trade_date: str
    memo: Optional[str] = ''

class TradeUpdateRequest(BaseModel):
    symbol: Optional[str] = None
    type: Optional[str] = None
    investment_amount: Optional[float] = None
    return_rate: Optional[float] = None
    trade_date: Optional[str] = None
    memo: Optional[str] = None

class TradeFilterRequest(BaseModel):
    symbol: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@app.get('/api/health')
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "ok", "message": "API is running"}

@app.post('/api/backtest')
async def run_backtest(request: BacktestRequest):
    """백테스팅 실행 API"""
    try:
        market = request.market
        days = request.days
        initial_capital = request.initial_capital
        use_api = request.use_api

        # 데이터 수집
        if use_api:
            print(f"API를 사용하여 {market} 데이터 수집 중...")
            df = collect_historical_data(market, days)
            if df is None or len(df) == 0:
                print("API 데이터 수집 실패, 샘플 데이터 사용")
                df = generate_sample_data(days)
        else:
            print("샘플 데이터 생성 중...")
            df = generate_sample_data(days)

        # 기술적 지표 추가
        df = add_technical_indicators(df)

        # 매매 신호 생성
        df = find_optimal_buy_sell_signals(df)
        df = df.dropna()

        # 백테스팅 실행
        backtester = CryptoBacktester(initial_capital=initial_capital)
        trades_df = backtester.run_backtest(df)

        # 성과 지표 계산
        metrics = backtester.calculate_performance_metrics(df)

        # 차트 이미지 생성
        chart_image = create_chart_image(df, trades_df)

        # 데이터를 JSON으로 변환
        price_data = []
        for idx, row in df.iterrows():
            price_data.append({
                'date': idx.strftime('%Y-%m-%d'),
                'close': float(row['Close']),
                'sma20': float(row['SMA_20']) if pd.notna(row['SMA_20']) else None,
                'sma50': float(row['SMA_50']) if pd.notna(row['SMA_50']) else None,
                'rsi': float(row['RSI']) if pd.notna(row['RSI']) and row['RSI'] != np.inf else None,
                'macd': float(row['MACD']) if pd.notna(row['MACD']) else None,
                'macd_signal': float(row['MACD_Signal']) if pd.notna(row['MACD_Signal']) else None,
                'buy_signal': int(row['Buy_Signal']),
                'sell_signal': int(row['Sell_Signal'])
            })

        trades_data = []
        if len(trades_df) > 0:
            for _, trade in trades_df.iterrows():
                trades_data.append({
                    'date': trade['Date'].strftime('%Y-%m-%d') if isinstance(trade['Date'], pd.Timestamp) else str(trade['Date']),
                    'type': trade['Type'],
                    'price': float(trade['Price']),
                    'amount': float(trade['Amount']),
                    'total_value': float(trade['Total_Value'])
                })

        result = {
            'success': True,
            'market': market,
            'data_period': {
                'start': df.index[0].strftime('%Y-%m-%d'),
                'end': df.index[-1].strftime('%Y-%m-%d'),
                'days': len(df)
            },
            'metrics': {
                'initial_capital': metrics.get('초기 자본', 0),
                'final_value': metrics.get('최종 자산', 0),
                'total_return': round(metrics.get('총 수익률', 0), 2),
                'buy_hold_return': round(metrics.get('Buy & Hold 수익률', 0), 2),
                'num_trades': metrics.get('거래 횟수', 0),
                'win_rate': round(metrics.get('승률', 0), 2),
                'max_drawdown': round(metrics.get('최대 낙폭(MDD)', 0), 2),
                'sharpe_ratio': round(metrics.get('Sharpe Ratio', 0), 2),
                'uptrend_probability': round(metrics.get('상승 확률', 50.0), 2)
            },
            'price_data': price_data,
            'trades': trades_data,
            'chart_image': chart_image,
            'signals': {
                'buy_count': int(df['Buy_Signal'].sum()),
                'sell_count': int(df['Sell_Signal'].sum())
            }
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/markets')
async def get_markets():
    """사용 가능한 마켓 목록 반환"""
    markets = [
        {'code': 'KRW-BTC', 'name': '비트코인 (BTC)'},
        {'code': 'KRW-ETH', 'name': '이더리움 (ETH)'},
        {'code': 'KRW-XRP', 'name': '리플 (XRP)'},
        {'code': 'KRW-ADA', 'name': '에이다 (ADA)'},
        {'code': 'KRW-DOT', 'name': '폴카닷 (DOT)'},
        {'code': 'KRW-LINK', 'name': '체인링크 (LINK)'},
        {'code': 'KRW-LTC', 'name': '라이트코인 (LTC)'},
        {'code': 'KRW-BCH', 'name': '비트코인 캐시 (BCH)'}
    ]
    return {'markets': markets}

# ===== 업비트 API 프록시 =====

@app.get('/api/upbit/accounts')
async def get_upbit_accounts():
    """업비트 계정 잔고 조회 (프록시)"""
    try:
        accounts = upbit_proxy.call_upbit_api('/v1/accounts')
        return accounts
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f'API 키 설정 오류: {str(e)}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'업비트 API 호출 실패: {str(e)}')

# ===== 매매 일지 CRUD API =====

@app.post('/api/trades')
async def create_trade(request: TradeCreateRequest):
    """매매 일지 생성"""
    try:
        data = request.dict()
        # 타입 검증
        if data['type'] not in ['BUY', 'SELL']:
            raise HTTPException(status_code=400, detail="type must be 'BUY' or 'SELL'")

        trade = db.create_trade(data)
        return {'success': True, 'data': trade}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/trades')
async def get_all_trades(
    symbol: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """모든 매매 일지 조회 (필터링 옵션)"""
    try:
        filters = {}
        if symbol:
            filters['symbol'] = symbol
        if type:
            filters['type'] = type
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date

        trades = db.get_all_trades(filters if filters else None)
        return {'success': True, 'data': trades, 'count': len(trades)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/trades/{trade_id}')
async def get_trade(trade_id: str):
    """특정 매매 일지 조회"""
    try:
        trade = db.get_trade_by_id(trade_id)
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        return {'success': True, 'data': trade}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/trades/{trade_id}')
async def update_trade(trade_id: str, request: TradeUpdateRequest):
    """매매 일지 수정"""
    try:
        data = {k: v for k, v in request.dict().items() if v is not None}

        # 타입 검증
        if 'type' in data and data['type'] not in ['BUY', 'SELL']:
            raise HTTPException(status_code=400, detail="type must be 'BUY' or 'SELL'")

        trade = db.update_trade(trade_id, data)
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        return {'success': True, 'data': trade}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/api/trades/{trade_id}')
async def delete_trade(trade_id: str):
    """매매 일지 삭제"""
    try:
        deleted = db.delete_trade(trade_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Trade not found")
        return {'success': True, 'message': 'Trade deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/trades/statistics/summary')
async def get_statistics():
    """매매 일지 통계 조회"""
    try:
        stats = db.get_statistics()
        return {'success': True, 'data': stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/api/trades/all/clear')
async def clear_all_trades():
    """모든 매매 일지 삭제 (개발용)"""
    try:
        db.clear_all_trades()
        return {'success': True, 'message': 'All trades cleared'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    PORT = 5001
    print("=" * 60)
    print("FastAPI 서버 시작 중...")
    print(f"API 엔드포인트: http://localhost:{PORT}/api")
    print(f"API 문서: http://localhost:{PORT}/docs")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=PORT)
