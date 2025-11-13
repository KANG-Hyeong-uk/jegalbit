/**
 * 목업 데이터 생성 유틸리티
 */

import { CoinData, ChartDataPoint, TimeFrame, CoinDetailData, ROIStats, HistoricalInvestment, YearlyROI } from '../types/crypto';

// 차트 데이터 생성 함수
const generateChartData = (
  basePrice: number,
  points: number,
  volatility: number = 0.05
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = Date.now();
  let currentPrice = basePrice;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    currentPrice += change;

    data.push({
      timestamp: now - (points - i) * 3600000, // 1시간 간격
      price: Math.max(currentPrice, basePrice * 0.5), // 최소 50% 가격 유지
      volume: Math.random() * 1000000000,
    });
  }

  return data;
};

// ROI 통계 생성
const generateROIStats = (coinName: string): ROIStats => {
  const totalInvestment = Math.random() * 50000 + 10000;
  const currentValue = totalInvestment * (0.8 + Math.random() * 1.5);

  return {
    maxROI: {
      date: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0],
      amount: currentValue * 1.3,
      percentage: 130 + Math.random() * 100,
    },
    minROI: {
      date: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0],
      amount: totalInvestment * 0.6,
      percentage: -40 - Math.random() * 20,
    },
    averageROI: ((currentValue - totalInvestment) / totalInvestment) * 100,
    totalInvestment,
    currentValue,
  };
};

// 코인 목업 데이터 (2025년 11월 기준 실제 가격 반영)
export const MOCK_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    currentPrice: 155_120_000, // KRW
    priceChange24h: 3_102_400,
    priceChangePercentage24h: 3_102_300, // 2012년 기준 역사적 수익률
    logo: '₿',
    chartData: generateChartData(155_120_000, 24),
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    currentPrice: 5_230_000, // KRW
    priceChange24h: -104_600,
    priceChangePercentage24h: 58_011, // 2017년 기준 역사적 수익률
    logo: 'Ξ',
    chartData: generateChartData(5_230_000, 24),
  },
  {
    id: 'ripple',
    name: 'Ripple',
    symbol: 'XRP',
    currentPrice: 3_675, // KRW
    priceChange24h: 183.75,
    priceChangePercentage24h: 52_400, // 2013년 기준 역사적 수익률
    logo: 'XRP',
    chartData: generateChartData(3_675, 24),
  },
  {
    id: 'luna',
    name: 'Luna',
    symbol: 'LUNA',
    currentPrice: 0.03, // KRW (폭락 후 가격)
    priceChange24h: -0.001,
    priceChangePercentage24h: -100, // 100% 하락
    logo: 'LUNA',
    chartData: generateChartData(0.03, 24),
  },
];

// 상세 데이터 생성 함수
export const generateDetailedCoinData = (coin: CoinData): CoinDetailData => {
  return {
    ...coin,
    roiStats: generateROIStats(coin.name),
    detailedChartData: {
      '1H': generateChartData(coin.currentPrice, 60),
      '24H': generateChartData(coin.currentPrice, 24),
      '7D': generateChartData(coin.currentPrice, 168),
      '1M': generateChartData(coin.currentPrice, 720),
      '1Y': generateChartData(coin.currentPrice, 8760),
    },
  };
};

// 실시간 가격 업데이트 시뮬레이션
export const updateCoinPrice = (coin: CoinData): CoinData => {
  const change = (Math.random() - 0.5) * 0.02 * coin.currentPrice;
  const newPrice = coin.currentPrice + change;
  const priceChange24h = change;
  const priceChangePercentage24h = (change / coin.currentPrice) * 100;

  return {
    ...coin,
    currentPrice: newPrice,
    priceChange24h,
    priceChangePercentage24h,
  };
};

/**
 * 실제 역사적 투자 데이터 (2025년 11월 기준)
 */
export const HISTORICAL_DATA: { [key: string]: HistoricalInvestment } = {
  bitcoin: {
    baseYear: 2012,
    basePriceKRW: 5000,
    currentPriceKRW: 155_120_000,
    investmentAmount: 1_000_000,
    currentValue: 31_024_000_000,
    profitRate: 3_102_300,
    yearlyROI: [
      { year: 2012, roi: 0, value: 1_000_000 },
      { year: 2013, roi: 5500, value: 56_000_000 },
      { year: 2014, roi: 3200, value: 33_000_000 },
      { year: 2015, roi: 2800, value: 29_000_000 },
      { year: 2016, roi: 5100, value: 52_000_000 },
      { year: 2017, roi: 24500, value: 246_000_000 },
      { year: 2018, roi: 10200, value: 103_000_000 },
      { year: 2019, roi: 8900, value: 90_000_000 },
      { year: 2020, roi: 18300, value: 184_000_000 },
      { year: 2021, roi: 62400, value: 625_000_000 },
      { year: 2022, roi: 21100, value: 212_000_000 },
      { year: 2023, roi: 39500, value: 396_000_000 },
      { year: 2024, roi: 95800, value: 959_000_000 },
      { year: 2025, roi: 3_102_300, value: 31_024_000_000 },
    ],
    isWarning: false,
  },
  ethereum: {
    baseYear: 2017,
    basePriceKRW: 9000,
    currentPriceKRW: 5_230_000,
    investmentAmount: 1_000_000,
    currentValue: 581_111_111,
    profitRate: 58_011,
    yearlyROI: [
      { year: 2017, roi: 0, value: 1_000_000 },
      { year: 2018, roi: 650, value: 7_500_000 },
      { year: 2019, roi: 280, value: 3_800_000 },
      { year: 2020, roi: 890, value: 9_900_000 },
      { year: 2021, roi: 5420, value: 55_200_000 },
      { year: 2022, roi: 2180, value: 22_800_000 },
      { year: 2023, roi: 3560, value: 36_600_000 },
      { year: 2024, roi: 18900, value: 190_000_000 },
      { year: 2025, roi: 58_011, value: 581_111_111 },
    ],
    isWarning: false,
  },
  ripple: {
    baseYear: 2013,
    basePriceKRW: 7,
    currentPriceKRW: 3675,
    investmentAmount: 1_000_000,
    currentValue: 525_000_000,
    profitRate: 52_400,
    yearlyROI: [
      { year: 2013, roi: 0, value: 1_000_000 },
      { year: 2014, roi: 120, value: 2_200_000 },
      { year: 2015, roi: 80, value: 1_800_000 },
      { year: 2016, roi: 150, value: 2_500_000 },
      { year: 2017, roi: 28500, value: 286_000_000 },
      { year: 2018, roi: 15200, value: 153_000_000 },
      { year: 2019, roi: 8900, value: 90_000_000 },
      { year: 2020, roi: 5600, value: 57_000_000 },
      { year: 2021, roi: 42800, value: 429_000_000 },
      { year: 2022, roi: 9300, value: 94_000_000 },
      { year: 2023, roi: 12800, value: 129_000_000 },
      { year: 2024, roi: 23500, value: 236_000_000 },
      { year: 2025, roi: 52_400, value: 525_000_000 },
    ],
    isWarning: false,
  },
  luna: {
    baseYear: 2021,
    basePriceKRW: 50_000,
    currentPriceKRW: 0.03,
    investmentAmount: 1_000_000,
    currentValue: 0.6,
    profitRate: -99.9999,
    yearlyROI: [
      { year: 2021, roi: 0, value: 1_000_000 },
      { year: 2022, roi: 6200, value: 63_000_000 }, // 2022년 4월 최고점
      { year: 2022.4, roi: -99.9999, value: 0.6 }, // 2022년 5월 폭락
      { year: 2023, roi: -99.9999, value: 0.6 },
      { year: 2024, roi: -99.9999, value: 0.6 },
      { year: 2025, roi: -99.9999, value: 0.6 },
    ],
    isWarning: true,
    warningMessage: '⚠️ 투자 위험 사례: 2022년 5월 테라-루나 생태계 붕괴로 인해 거의 전액 손실이 발생했습니다.',
  },
};
