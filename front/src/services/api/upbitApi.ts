/**
 * 업비트 API 클라이언트
 */

import axios from 'axios';

const UPBIT_API_BASE_URL = 'https://api.upbit.com/v1';

export interface UpbitTicker {
  market: string; // 종목 구분 코드
  opening_price: number; // 시가
  high_price: number; // 고가
  low_price: number; // 저가
  trade_price: number; // 종가(현재가)
  change: 'EVEN' | 'RISE' | 'FALL'; // 전일 대비 (보합/상승/하락)
  trade_volume: number; // 가장 최근 거래량
  acc_trade_price_24h: number; // 24시간 누적 거래대금
  highest_52_week_price: number; // 52주 신고가
  lowest_52_week_price: number; // 52주 신저가
}

export interface UpbitCandle {
  market: string; // 종목 구분 코드
  candle_date_time_kst: string; // 캔들 기준 시각(KST)
  opening_price: number; // 시가
  high_price: number; // 고가
  low_price: number; // 저가
  trade_price: number; // 종가
  candle_acc_trade_volume: number; // 누적 거래량
}

const upbitApi = axios.create({
  baseURL: UPBIT_API_BASE_URL,
  timeout: 10000,
});

/**
 * 현재가 정보 조회
 * @param markets 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
 */
export const getTicker = async (markets: string[]): Promise<UpbitTicker[]> => {
  const response = await upbitApi.get<UpbitTicker[]>('/ticker', {
    params: {
      markets: markets.join(','),
    },
  });
  return response.data;
};

/**
 * 분(minute) 캔들 조회
 * @param market 마켓 코드 (예: 'KRW-BTC')
 * @param unit 분 단위 (1, 3, 5, 15, 10, 30, 60, 240)
 * @param count 캔들 개수 (최대 200)
 */
export const getMinuteCandles = async (
  market: string,
  unit: number = 1,
  count: number = 200
): Promise<UpbitCandle[]> => {
  const response = await upbitApi.get<UpbitCandle[]>(`/candles/minutes/${unit}`, {
    params: {
      market,
      count,
    },
  });
  return response.data.reverse(); // 시간 순서대로 정렬
};

/**
 * 일(day) 캔들 조회
 * @param market 마켓 코드 (예: 'KRW-BTC')
 * @param count 캔들 개수 (최대 200)
 */
export const getDayCandles = async (
  market: string,
  count: number = 200
): Promise<UpbitCandle[]> => {
  const response = await upbitApi.get<UpbitCandle[]>('/candles/days', {
    params: {
      market,
      count,
    },
  });
  return response.data.reverse(); // 시간 순서대로 정렬
};

/**
 * 주(week) 캔들 조회
 * @param market 마켓 코드 (예: 'KRW-BTC')
 * @param count 캔들 개수 (최대 200)
 */
export const getWeekCandles = async (
  market: string,
  count: number = 200
): Promise<UpbitCandle[]> => {
  const response = await upbitApi.get<UpbitCandle[]>('/candles/weeks', {
    params: {
      market,
      count,
    },
  });
  return response.data.reverse(); // 시간 순서대로 정렬
};

/**
 * 월(month) 캔들 조회
 * @param market 마켓 코드 (예: 'KRW-BTC')
 * @param count 캔들 개수 (최대 200)
 */
export const getMonthCandles = async (
  market: string,
  count: number = 200
): Promise<UpbitCandle[]> => {
  const response = await upbitApi.get<UpbitCandle[]>('/candles/months', {
    params: {
      market,
      count,
    },
  });
  return response.data.reverse(); // 시간 순서대로 정렬
};

export default upbitApi;
