/**
 * Upbit API Service Layer
 * 업비트 API 연동 서비스
 */

import axios from 'axios';
import {
  MinuteCandle,
  DayCandle,
  Ticker,
  Account,
  Market,
  CandleChartData,
} from '../../types/upbit';

// Public API는 Nginx 프록시를 통해 호출 (CORS 우회)
const publicClient = axios.create({
  baseURL: '/upbit-api',
  headers: {
    'Accept': 'application/json',
  },
});

// ===== Quotation API (Public) =====

/**
 * 마켓 목록 조회
 */
export const getMarkets = async (): Promise<Market[]> => {
  const response = await publicClient.get<Market[]>('/v1/market/all');
  return response.data;
};

/**
 * 분봉 캔들 조회
 * @param market 마켓 코드 (예: KRW-BTC)
 * @param unit 분 단위 (1, 3, 5, 10, 15, 30, 60, 240)
 * @param count 조회할 캔들 개수 (최대 200)
 */
export const getMinuteCandles = async (
  market: string,
  unit: number = 1,
  count: number = 200
): Promise<MinuteCandle[]> => {
  const response = await publicClient.get<MinuteCandle[]>(
    `/v1/candles/minutes/${unit}`,
    {
      params: { market, count },
    }
  );
  return response.data;
};

/**
 * 일봉 캔들 조회
 * @param market 마켓 코드 (예: KRW-BTC)
 * @param count 조회할 캔들 개수 (최대 200)
 * @param convertingPriceUnit 종가 환산 통화 (KRW)
 */
export const getDayCandles = async (
  market: string,
  count: number = 200,
  convertingPriceUnit?: string
): Promise<DayCandle[]> => {
  const response = await publicClient.get<DayCandle[]>('/v1/candles/days', {
    params: {
      market,
      count,
      convertingPriceUnit,
    },
  });
  return response.data;
};

/**
 * 현재가 정보 조회
 * @param markets 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
 */
export const getTicker = async (markets: string[]): Promise<Ticker[]> => {
  const marketsParam = markets.join(',');

  try {
    const response = await publicClient.get<Ticker[]>('/v1/ticker', {
      params: {
        markets: marketsParam,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// ===== Exchange API (Private - 인증 필요) =====

/**
 * 계정 잔고 조회
 * 백엔드 프록시를 통해 안전하게 호출
 */
export const getAccounts = async (): Promise<Account[]> => {
  try {
    // 백엔드 프록시를 통해 호출 (보안)
    const url = '/api/upbit/accounts';

    console.log('[Upbit API] 요청 URL:', url);
    console.log('[Upbit API] 백엔드 프록시를 통한 안전한 호출');

    const response = await axios.get<Account[]>(url);

    console.log('[Upbit API] 응답 성공:', response.status);
    console.log('[Upbit API] 계정 수:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Upbit API] 오류 발생:', error.response?.status, error.response?.data);
    console.error('[Upbit API] 전체 오류:', error);
    throw new Error('계정 정보를 불러오는데 실패했습니다. API 키를 확인해주세요.');
  }
};

// ===== 데이터 변환 유틸리티 =====

/**
 * 분봉 데이터를 차트 데이터로 변환
 */
export const convertMinuteCandleToChartData = (
  candles: MinuteCandle[]
): CandleChartData[] => {
  return candles.map((candle) => ({
    time: candle.candle_date_time_kst,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
    volume: candle.candle_acc_trade_volume,
  }));
};

/**
 * 일봉 데이터를 차트 데이터로 변환
 */
export const convertDayCandleToChartData = (
  candles: DayCandle[]
): CandleChartData[] => {
  return candles.map((candle) => ({
    time: candle.candle_date_time_kst,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
    volume: candle.candle_acc_trade_volume,
  }));
};

/**
 * 가격 포맷팅 (천 단위 쉼표)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(price));
};

/**
 * 변화율 포맷팅
 */
export const formatChangeRate = (rate: number): string => {
  return `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(2)}%`;
};
