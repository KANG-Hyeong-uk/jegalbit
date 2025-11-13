/**
 * Upbit API Service Layer
 * 업비트 API 연동 서비스
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as jose from 'jose';
import {
  MinuteCandle,
  DayCandle,
  Ticker,
  Account,
  Market,
  CandleChartData,
} from '../../types/upbit';

const API_BASE_URL = import.meta.env.VITE_UPBIT_API_URL || 'https://api.upbit.com';
const ACCESS_KEY = import.meta.env.VITE_UPBIT_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_UPBIT_SECRET_KEY;

// 개발 환경에서는 프록시 사용, 프로덕션에서는 직접 호출
const USE_PROXY = import.meta.env.DEV;
const PROXY_BASE_URL = '/api/upbit';

// Public API 클라이언트 (인증 불필요)
const publicClient = axios.create({
  baseURL: USE_PROXY ? PROXY_BASE_URL : API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * JWT 토큰 생성 (Exchange API용)
 */
const generateJWT = async (payload: Record<string, any>): Promise<string> => {
  if (!SECRET_KEY) {
    throw new Error('UPBIT_SECRET_KEY is not configured');
  }

  const secret = new TextEncoder().encode(SECRET_KEY);
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);

  return jwt;
};

/**
 * 인증 헤더 생성
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error('API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  const payload = {
    access_key: ACCESS_KEY,
    nonce: uuidv4(),
  };

  const token = await generateJWT(payload);

  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };
};

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
 */
export const getAccounts = async (): Promise<Account[]> => {
  try {
    const headers = await getAuthHeaders();
    // 개발 환경에서는 프록시를 통해 호출
    const baseURL = USE_PROXY ? PROXY_BASE_URL : API_BASE_URL;
    const url = `${baseURL}/v1/accounts`;

    const response = await axios.get<Account[]>(url, {
      headers,
    });

    return response.data;
  } catch (error: any) {
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
