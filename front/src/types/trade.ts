/**
 * 매매 일지 도메인 모델
 *
 * 클린 아키텍처 원칙에 따라 도메인 엔티티를 정의합니다.
 */

/**
 * 매매 타입
 */
export type TradeType = 'BUY' | 'SELL';

/**
 * 매매 일지 엔티티
 */
export interface Trade {
  /**
   * 고유 식별자 (UUID)
   */
  id: string;

  /**
   * 암호화폐 심볼 (예: BTC, ETH, XRP)
   */
  symbol: string;

  /**
   * 매매 타입 (매수/매도)
   */
  type: TradeType;

  /**
   * 투자 금액
   */
  investmentAmount: number;

  /**
   * 수익률 (%)
   */
  returnRate: number;

  /**
   * 매매 일시 (ISO 8601 형식)
   */
  tradeDate: string;

  /**
   * 매매 근거 (메모)
   */
  memo?: string;

  /**
   * 생성 일시
   */
  createdAt: string;

  /**
   * 수정 일시
   */
  updatedAt: string;
}

/**
 * 매매 일지 생성 DTO
 */
export interface CreateTradeDTO {
  symbol: string;
  type: TradeType;
  investmentAmount: number;
  returnRate: number;
  tradeDate: string;
  memo?: string;
}

/**
 * 매매 일지 수정 DTO
 */
export interface UpdateTradeDTO {
  symbol?: string;
  type?: TradeType;
  investmentAmount?: number;
  returnRate?: number;
  tradeDate?: string;
  memo?: string;
}

/**
 * 매매 일지 통계
 */
export interface TradeStatistics {
  /**
   * 총 매수 횟수
   */
  totalBuyCount: number;

  /**
   * 총 매도 횟수
   */
  totalSellCount: number;

  /**
   * 평균 매수 수익률 (%)
   */
  averageBuyReturn: number;

  /**
   * 평균 매도 수익률 (%)
   */
  averageSellReturn: number;

  /**
   * 평균 총 수익률 (%)
   */
  averageTotalReturn: number;
}

/**
 * 매매 일지 필터
 */
export interface TradeFilter {
  symbol?: string;
  type?: TradeType;
  startDate?: string;
  endDate?: string;
}
