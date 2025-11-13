/**
 * 암호화폐 관련 타입 정의
 */

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  logo: string;
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface ROIStats {
  maxROI: {
    date: string;
    amount: number;
    percentage: number;
  };
  minROI: {
    date: string;
    amount: number;
    percentage: number;
  };
  averageROI: number;
  totalInvestment: number;
  currentValue: number;
}

export type TimeFrame = '1H' | '24H' | '7D' | '1M' | '1Y';

export interface CoinDetailData extends CoinData {
  roiStats: ROIStats;
  detailedChartData: {
    [key in TimeFrame]: ChartDataPoint[];
  };
}

/**
 * 실제 역사적 투자 수익률 데이터
 */
export interface HistoricalInvestment {
  baseYear: number;
  basePriceKRW: number;
  currentPriceKRW: number;
  investmentAmount: number; // 초기 투자금 (원)
  currentValue: number; // 현재 가치 (원)
  profitRate: number; // 수익률 (%)
  yearlyROI: YearlyROI[]; // 연도별 수익률
  isWarning?: boolean; // 경고 표시 (LUNA 같은 폭락 사례)
  warningMessage?: string;
}

export interface YearlyROI {
  year: number;
  roi: number; // 수익률 (%)
  value: number; // 그 시점의 가치 (원)
}

export interface CoinHistoricalData extends CoinData {
  historical: HistoricalInvestment;
}
