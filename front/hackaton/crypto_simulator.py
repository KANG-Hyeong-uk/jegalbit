# ===========================================================================================
# 암호화폐 포트폴리오 시뮬레이터 - LSTM 기반 백테스팅 및 최적 매매 타이밍 분석
# ===========================================================================================

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # 백엔드에서 사용하기 위해
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import requests
import json
from datetime import datetime, timedelta
import warnings
import base64
import io
warnings.filterwarnings('ignore')

# TensorFlow 및 Keras import (선택적)
# Python 3.14에서는 TensorFlow가 아직 지원되지 않으므로 선택적 의존성으로 처리
TENSORFLOW_AVAILABLE = False
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    TENSORFLOW_AVAILABLE = True
except ImportError:
    # TensorFlow가 없어도 백테스팅은 정상 작동 (LSTM 기능만 사용 불가)
    pass
except Exception:
    # 기타 오류도 무시 (Python 버전 호환성 문제 등)
    pass

# 한글 폰트 설정
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

# ===========================================================================================
# 1. Bithumb API 데이터 수집 함수
# ===========================================================================================

def get_bithumb_candles(market='KRW-BTC', count=200, to=None):
    """
    Bithumb API를 사용하여 캔들 데이터 수집
    Args:
        market: 마켓 코드 (예: 'KRW-BTC', 'KRW-ETH')
        count: 조회할 캔들 개수 (최대 200)
        to: 마지막 캔들 시각 (YYYY-MM-DDTHH:MM:SS 형식)
    Returns:
        DataFrame: OHLCV 데이터
    """
    url = "https://api.bithumb.com/v1/candles/days"
    headers = {"accept": "application/json"}
    params = {
        "market": market,
        "count": count,
        "convertingPriceUnit": "KRW"
    }
    if to:
        params["to"] = to
    
    try:
        response = requests.get(url, headers=headers, params=params)
        data = json.loads(response.text)
        if isinstance(data, list):
            df = pd.DataFrame(data)
            df['candle_date_time_kst'] = pd.to_datetime(df['candle_date_time_kst'])
            df = df.sort_values('candle_date_time_kst').reset_index(drop=True)
            df = df.rename(columns={
                'candle_date_time_kst': 'Date',
                'opening_price': 'Open',
                'high_price': 'High',
                'low_price': 'Low',
                'trade_price': 'Close',
                'candle_acc_trade_volume': 'Volume'
            })
            df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            df = df.set_index('Date')
            return df
        else:
            print(f"데이터 수집 실패: {data}")
            return None
    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")
        return None

def collect_historical_data(market='KRW-BTC', days=1000):
    """
    여러 번의 API 호출로 긴 기간의 데이터 수집
    Args:
        market: 마켓 코드
        days: 수집할 일수
    Returns:
        DataFrame: 전체 OHLCV 데이터
    """
    print(f"=== {market} 데이터 수집 시작 ===")
    all_data = []
    current_to = None
    remaining = days
    
    while remaining > 0:
        count = min(200, remaining)
        df = get_bithumb_candles(market, count, current_to)
        if df is None or len(df) == 0:
            break
        all_data.append(df)
        remaining -= len(df)
        # 다음 요청을 위한 마지막 시각 설정
        current_to = df.index[0].strftime('%Y-%m-%dT%H:%M:%S')
        print(f"수집 완료: {len(df)}개 ({remaining}일 남음)")
    
    if all_data:
        result = pd.concat(all_data).sort_index()
        result = result[~result.index.duplicated(keep='first')]
        print(f"\n총 {len(result)}일치 데이터 수집 완료!")
        return result
    else:
        print("데이터 수집 실패")
        return None

# ===========================================================================================
# 2. 기술적 지표 계산 함수
# ===========================================================================================

def calculate_rsi(data, period=14):
    """RSI (Relative Strength Index) 계산"""
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(data, fast=12, slow=26, signal=9):
    """MACD (Moving Average Convergence Divergence) 계산"""
    exp1 = data['Close'].ewm(span=fast, adjust=False).mean()
    exp2 = data['Close'].ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    return macd, signal_line, histogram

def calculate_bollinger_bands(data, period=20, std_dev=2):
    """볼린저 밴드 계산"""
    sma = data['Close'].rolling(window=period).mean()
    std = data['Close'].rolling(window=period).std()
    upper_band = sma + (std * std_dev)
    lower_band = sma - (std * std_dev)
    return upper_band, sma, lower_band

def add_technical_indicators(data):
    """데이터프레임에 기술적 지표 추가"""
    df = data.copy()
    # RSI
    df['RSI'] = calculate_rsi(df)
    # MACD
    df['MACD'], df['MACD_Signal'], df['MACD_Hist'] = calculate_macd(df)
    # 볼린저 밴드
    df['BB_Upper'], df['BB_Middle'], df['BB_Lower'] = calculate_bollinger_bands(df)
    # 이동평균선
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
    df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
    # 거래량 이동평균
    df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
    return df

# ===========================================================================================
# 3. 최적 매매 타이밍 분석 함수
# ===========================================================================================

def find_optimal_buy_sell_signals(data):
    """
    RSI, MACD를 기반으로 최적 매수/매도 신호 탐지
    매수 신호:
    - RSI < 30 (과매도) 그리고 MACD 골든 크로스
    - 볼린저 밴드 하단 돌파 후 반등
    매도 신호:
    - RSI > 70 (과매수) 그리고 MACD 데드 크로스
    - 볼린저 밴드 상단 도달
    """
    df = data.copy()
    # 매수 신호
    df['Buy_Signal'] = 0
    buy_condition = (
        ((df['RSI'] < 30) & (df['MACD'] > df['MACD_Signal']) & (df['MACD'].shift(1) <= df['MACD_Signal'].shift(1))) |
        ((df['Close'] < df['BB_Lower']) & (df['Close'].shift(1) >= df['BB_Lower'].shift(1)))
    )
    df.loc[buy_condition, 'Buy_Signal'] = 1
    
    # 매도 신호
    df['Sell_Signal'] = 0
    sell_condition = (
        ((df['RSI'] > 70) & (df['MACD'] < df['MACD_Signal']) & (df['MACD'].shift(1) >= df['MACD_Signal'].shift(1))) |
        (df['Close'] > df['BB_Upper'])
    )
    df.loc[sell_condition, 'Sell_Signal'] = 1

    return df

def calculate_uptrend_probability(data):
    """
    기술적 지표를 기반으로 상승 확률을 계산

    Returns:
        float: 상승 확률 (0-100%)
    """
    if len(data) == 0:
        return 50.0  # 기본값

    # 가장 최근 데이터
    latest = data.iloc[-1]

    # 각 지표별 점수 계산 (0-100점)
    scores = []

    # 1. RSI 기반 점수 (30점)
    if pd.notna(latest['RSI']):
        if latest['RSI'] < 30:  # 과매도 - 반등 가능성 높음
            rsi_score = 80
        elif latest['RSI'] < 40:
            rsi_score = 70
        elif latest['RSI'] < 50:
            rsi_score = 55
        elif latest['RSI'] < 60:
            rsi_score = 50
        elif latest['RSI'] < 70:
            rsi_score = 45
        else:  # 과매수 - 하락 가능성
            rsi_score = 30
        scores.append(rsi_score * 0.3)

    # 2. MACD 기반 점수 (25점)
    if pd.notna(latest['MACD']) and pd.notna(latest['MACD_Signal']):
        if latest['MACD'] > latest['MACD_Signal']:  # 골든 크로스
            macd_score = 75
            # MACD 히스토그램이 증가 중이면 추가 점수
            if len(data) >= 2 and pd.notna(data.iloc[-2]['MACD_Hist']):
                if latest['MACD_Hist'] > data.iloc[-2]['MACD_Hist']:
                    macd_score = 85
        else:  # 데드 크로스
            macd_score = 35
            if len(data) >= 2 and pd.notna(data.iloc[-2]['MACD_Hist']):
                if latest['MACD_Hist'] < data.iloc[-2]['MACD_Hist']:
                    macd_score = 25
        scores.append(macd_score * 0.25)

    # 3. 이동평균선 기반 점수 (20점)
    if pd.notna(latest['SMA_20']) and pd.notna(latest['SMA_50']):
        if latest['Close'] > latest['SMA_20'] and latest['Close'] > latest['SMA_50']:
            # 가격이 두 이동평균선 위에 있음 (강세)
            if latest['SMA_20'] > latest['SMA_50']:  # 골든 크로스 상태
                ma_score = 85
            else:
                ma_score = 65
        elif latest['Close'] > latest['SMA_20']:
            ma_score = 60
        elif latest['Close'] > latest['SMA_50']:
            ma_score = 45
        else:
            # 가격이 두 이동평균선 아래 (약세)
            ma_score = 30
        scores.append(ma_score * 0.2)

    # 4. 볼린저 밴드 기반 점수 (15점)
    if pd.notna(latest['BB_Upper']) and pd.notna(latest['BB_Lower']) and pd.notna(latest['BB_Middle']):
        bb_position = (latest['Close'] - latest['BB_Lower']) / (latest['BB_Upper'] - latest['BB_Lower'])
        if bb_position < 0.2:  # 하단 부근 - 반등 가능성
            bb_score = 75
        elif bb_position < 0.4:
            bb_score = 65
        elif bb_position < 0.6:
            bb_score = 50
        elif bb_position < 0.8:
            bb_score = 40
        else:  # 상단 부근 - 하락 가능성
            bb_score = 30
        scores.append(bb_score * 0.15)

    # 5. 최근 추세 기반 점수 (10점)
    if len(data) >= 5:
        recent_prices = data['Close'].tail(5)
        price_changes = recent_prices.pct_change().dropna()
        positive_days = (price_changes > 0).sum()

        if positive_days >= 4:
            trend_score = 75
        elif positive_days >= 3:
            trend_score = 60
        elif positive_days >= 2:
            trend_score = 50
        else:
            trend_score = 35
        scores.append(trend_score * 0.1)

    # 전체 점수 합산
    if len(scores) > 0:
        total_probability = sum(scores)
    else:
        total_probability = 50.0  # 기본값

    # 0-100 범위로 제한
    total_probability = max(0, min(100, total_probability))

    return round(total_probability, 2)

# ===========================================================================================
# 4. LSTM 모델 구축 및 학습
# ===========================================================================================

def prepare_lstm_data(data, time_step=60, feature_columns=None):
    """LSTM 학습용 데이터 준비"""
    if feature_columns is None:
        feature_columns = ['Close']
    # 데이터 정규화
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data[feature_columns].values)
    
    X, y = [], []
    for i in range(len(scaled_data) - time_step - 1):
        X.append(scaled_data[i:(i + time_step), :])
        y.append(scaled_data[i + time_step, 0])  # Close 가격 예측
    
    X = np.array(X)
    y = np.array(y)
    return X, y, scaler

def build_lstm_model(input_shape):
    """LSTM 모델 구축"""
    if not TENSORFLOW_AVAILABLE:
        raise ImportError("TensorFlow가 설치되지 않았습니다. LSTM 모델을 사용할 수 없습니다.")
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(units=25))
    model.add(Dense(units=1))
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
    return model

# ===========================================================================================
# 5. 백테스팅 시뮬레이터
# ===========================================================================================

class CryptoBacktester:
    def __init__(self, initial_capital=1000000):
        """
        암호화폐 백테스팅 클래스
        Args:
            initial_capital: 초기 자본금 (원)
        """
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.holdings = 0  # 보유 코인 수량
        self.trades = []  # 거래 기록
    
    def buy(self, date, price, amount_ratio=1.0):
        """매수 실행"""
        amount_to_invest = self.capital * amount_ratio
        coins_to_buy = amount_to_invest / price
        self.holdings += coins_to_buy
        self.capital -= amount_to_invest
        self.trades.append({
            'Date': date,
            'Type': 'BUY',
            'Price': price,
            'Amount': coins_to_buy,
            'Capital': self.capital,
            'Holdings': self.holdings,
            'Total_Value': self.capital + (self.holdings * price)
        })
    
    def sell(self, date, price, amount_ratio=1.0):
        """매도 실행"""
        coins_to_sell = self.holdings * amount_ratio
        revenue = coins_to_sell * price
        self.holdings -= coins_to_sell
        self.capital += revenue
        self.trades.append({
            'Date': date,
            'Type': 'SELL',
            'Price': price,
            'Amount': coins_to_sell,
            'Capital': self.capital,
            'Holdings': self.holdings,
            'Total_Value': self.capital + (self.holdings * price)
        })
    
    def run_backtest(self, data):
        """백테스팅 실행"""
        position = None  # 'long' or None
        for idx in range(len(data)):
            row = data.iloc[idx]
            date = data.index[idx]
            price = row['Close']
            
            # 매수 신호
            if row['Buy_Signal'] == 1 and position is None:
                self.buy(date, price, amount_ratio=1.0)
                position = 'long'
            
            # 매도 신호
            elif row['Sell_Signal'] == 1 and position == 'long':
                self.sell(date, price, amount_ratio=1.0)
                position = None
        
        # 마지막에 포지션이 있으면 청산
        if position == 'long':
            last_date = data.index[-1]
            last_price = data.iloc[-1]['Close']
            self.sell(last_date, last_price, amount_ratio=1.0)
        
        return pd.DataFrame(self.trades)
    
    def calculate_performance_metrics(self, data):
        """성과 지표 계산"""
        if len(self.trades) == 0:
            return {}
        
        trades_df = pd.DataFrame(self.trades)
        # 최종 자산 가치
        final_value = trades_df.iloc[-1]['Total_Value']
        # 총 수익률
        total_return = ((final_value - self.initial_capital) / self.initial_capital) * 100
        # 거래 횟수
        num_trades = len(trades_df)
        # Buy & Hold 수익률
        buy_hold_return = ((data.iloc[-1]['Close'] - data.iloc[0]['Close']) / data.iloc[0]['Close']) * 100
        
        # 승률 계산
        buy_trades = trades_df[trades_df['Type'] == 'BUY']
        sell_trades = trades_df[trades_df['Type'] == 'SELL']
        wins = 0
        losses = 0
        for i in range(min(len(buy_trades), len(sell_trades))):
            if sell_trades.iloc[i]['Price'] > buy_trades.iloc[i]['Price']:
                wins += 1
            else:
                losses += 1
        win_rate = (wins / (wins + losses) * 100) if (wins + losses) > 0 else 0
        
        # MDD (Maximum Drawdown) 계산
        portfolio_values = trades_df['Total_Value'].values
        peak = portfolio_values[0]
        max_dd = 0
        for value in portfolio_values:
            if value > peak:
                peak = value
            dd = (peak - value) / peak * 100
            if dd > max_dd:
                max_dd = dd
        
        # Sharpe Ratio 계산 (간소화 버전)
        returns = trades_df['Total_Value'].pct_change().dropna()
        if len(returns) > 0:
            sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() != 0 else 0
        else:
            sharpe_ratio = 0

        # 상승 확률 계산
        uptrend_probability = calculate_uptrend_probability(data)

        metrics = {
            '초기 자본': self.initial_capital,
            '최종 자산': final_value,
            '총 수익률': total_return,
            'Buy & Hold 수익률': buy_hold_return,
            '거래 횟수': num_trades,
            '승률': win_rate,
            '최대 낙폭(MDD)': max_dd,
            'Sharpe Ratio': sharpe_ratio,
            '상승 확률': uptrend_probability
        }
        return metrics

# ===========================================================================================
# 6. 시각화 함수
# ===========================================================================================

def create_chart_image(data, trades_df=None):
    """차트를 이미지로 생성하고 base64로 인코딩"""
    fig, axes = plt.subplots(3, 1, figsize=(15, 10))
    
    # 가격 차트
    axes[0].plot(data.index, data['Close'], label='Close Price', linewidth=1)
    axes[0].plot(data.index, data['SMA_20'], label='SMA 20', alpha=0.7)
    axes[0].plot(data.index, data['SMA_50'], label='SMA 50', alpha=0.7)
    
    # 매수/매도 신호 표시
    buy_signals = data[data['Buy_Signal'] == 1]
    sell_signals = data[data['Sell_Signal'] == 1]
    axes[0].scatter(buy_signals.index, buy_signals['Close'], color='green', marker='^', s=100, label='Buy Signal', zorder=5)
    axes[0].scatter(sell_signals.index, sell_signals['Close'], color='red', marker='v', s=100, label='Sell Signal', zorder=5)
    axes[0].set_title('Price Chart with Trading Signals', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Date')
    axes[0].set_ylabel('Price (KRW)')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # RSI
    axes[1].plot(data.index, data['RSI'], label='RSI', color='purple')
    axes[1].axhline(y=70, color='r', linestyle='--', label='Overbought (70)')
    axes[1].axhline(y=30, color='g', linestyle='--', label='Oversold (30)')
    axes[1].set_title('RSI (Relative Strength Index)', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Date')
    axes[1].set_ylabel('RSI')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    # MACD
    axes[2].plot(data.index, data['MACD'], label='MACD', color='blue')
    axes[2].plot(data.index, data['MACD_Signal'], label='Signal Line', color='red')
    axes[2].bar(data.index, data['MACD_Hist'], label='Histogram', alpha=0.3)
    axes[2].set_title('MACD', fontsize=14, fontweight='bold')
    axes[2].set_xlabel('Date')
    axes[2].set_ylabel('MACD')
    axes[2].legend()
    axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # 이미지를 base64로 인코딩
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
    plt.close()
    
    return img_base64

def generate_sample_data(days=500):
    """샘플 데이터 생성 (API 호출 실패 시 사용)"""
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    np.random.seed(42)
    close_prices = 50000000 + np.cumsum(np.random.randn(days) * 500000)
    data = pd.DataFrame({
        'Open': close_prices * (1 + np.random.randn(days) * 0.01),
        'High': close_prices * (1 + abs(np.random.randn(days)) * 0.02),
        'Low': close_prices * (1 - abs(np.random.randn(days)) * 0.02),
        'Close': close_prices,
        'Volume': np.random.randint(100, 1000, days)
    }, index=dates)
    return data

