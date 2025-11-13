/**
 * Trade Journal API Client
 * 백엔드 API와 통신하는 서비스 레이어
 */

import axios from 'axios';
import { Trade, CreateTradeDTO, UpdateTradeDTO, TradeFilter, TradeStatistics } from '../../types/trade';

const API_BASE_URL = 'http://localhost:5001/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 트레이드 생성
 */
export const createTrade = async (dto: CreateTradeDTO): Promise<Trade> => {
  // 프론트엔드 camelCase를 백엔드 snake_case로 변환
  const requestData = {
    symbol: dto.symbol,
    type: dto.type,
    investment_amount: dto.investmentAmount,
    return_rate: dto.returnRate,
    trade_date: dto.tradeDate,
    memo: dto.memo || '',
  };
  const response = await apiClient.post('/trades', requestData);
  const trade = response.data.data;

  // 백엔드 응답을 프론트엔드 형식으로 변환
  return {
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    investmentAmount: trade.investment_amount,
    returnRate: trade.return_rate,
    tradeDate: trade.trade_date,
    memo: trade.memo,
    createdAt: trade.created_at,
    updatedAt: trade.updated_at,
  };
};

/**
 * 모든 트레이드 조회
 */
export const getAllTrades = async (filter?: TradeFilter): Promise<Trade[]> => {
  const params = new URLSearchParams();

  if (filter?.symbol) params.append('symbol', filter.symbol);
  if (filter?.type) params.append('type', filter.type);
  if (filter?.startDate) params.append('start_date', filter.startDate);
  if (filter?.endDate) params.append('end_date', filter.endDate);

  const response = await apiClient.get('/trades', { params });

  // 백엔드 snake_case를 프론트엔드 camelCase로 변환
  return response.data.data.map((trade: any) => ({
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    investmentAmount: trade.investment_amount,
    returnRate: trade.return_rate,
    tradeDate: trade.trade_date,
    memo: trade.memo,
    createdAt: trade.created_at,
    updatedAt: trade.updated_at,
  }));
};

/**
 * ID로 트레이드 조회
 */
export const getTradeById = async (id: string): Promise<Trade> => {
  const response = await apiClient.get(`/trades/${id}`);
  const trade = response.data.data;

  // 백엔드 snake_case를 프론트엔드 camelCase로 변환
  return {
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    investmentAmount: trade.investment_amount,
    returnRate: trade.return_rate,
    tradeDate: trade.trade_date,
    memo: trade.memo,
    createdAt: trade.created_at,
    updatedAt: trade.updated_at,
  };
};

/**
 * 트레이드 수정
 */
export const updateTrade = async (id: string, dto: UpdateTradeDTO): Promise<Trade> => {
  // 프론트엔드 camelCase를 백엔드 snake_case로 변환
  const requestData: any = {};
  if (dto.symbol !== undefined) requestData.symbol = dto.symbol;
  if (dto.type !== undefined) requestData.type = dto.type;
  if (dto.investmentAmount !== undefined) requestData.investment_amount = dto.investmentAmount;
  if (dto.returnRate !== undefined) requestData.return_rate = dto.returnRate;
  if (dto.tradeDate !== undefined) requestData.trade_date = dto.tradeDate;
  if (dto.memo !== undefined) requestData.memo = dto.memo;

  const response = await apiClient.put(`/trades/${id}`, requestData);
  const trade = response.data.data;

  // 백엔드 응답을 프론트엔드 형식으로 변환
  return {
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    investmentAmount: trade.investment_amount,
    returnRate: trade.return_rate,
    tradeDate: trade.trade_date,
    memo: trade.memo,
    createdAt: trade.created_at,
    updatedAt: trade.updated_at,
  };
};

/**
 * 트레이드 삭제
 */
export const deleteTrade = async (id: string): Promise<void> => {
  await apiClient.delete(`/trades/${id}`);
};

/**
 * 통계 조회
 */
export const getStatistics = async (): Promise<TradeStatistics> => {
  const response = await apiClient.get('/trades/statistics/summary');
  const data = response.data.data;

  // 백엔드 응답을 프론트엔드 타입에 맞게 변환
  return {
    totalBuyCount: data.total_buy_count,
    totalSellCount: data.total_sell_count,
    averageBuyReturn: data.average_buy_return,
    averageSellReturn: data.average_sell_return,
    averageTotalReturn: data.average_total_return,
  };
};

/**
 * 모든 트레이드 삭제 (개발용)
 */
export const clearAllTrades = async (): Promise<void> => {
  await apiClient.delete('/trades/all/clear');
};
