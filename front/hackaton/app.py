from flask import Flask, jsonify, request
from flask_cors import CORS
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

app = Flask(__name__)
# CORS 설정 - 모든 origin 허용
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/backtest', methods=['POST'])
def run_backtest():
    """백테스팅 실행 API"""
    try:
        data = request.get_json()
        market = data.get('market', 'KRW-BTC')
        days = data.get('days', 500)
        initial_capital = data.get('initial_capital', 10000000)
        use_api = data.get('use_api', False)
        
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
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/markets', methods=['GET'])
def get_markets():
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
    return jsonify({'markets': markets})

if __name__ == '__main__':
    # macOS에서 포트 5000은 AirPlay가 사용하므로 5001 사용
    PORT = 5001
    print("=" * 60)
    print("Flask 서버 시작 중...")
    print(f"API 엔드포인트: http://localhost:{PORT}/api")
    print("=" * 60)
    app.run(debug=True, port=PORT, host='127.0.0.1')