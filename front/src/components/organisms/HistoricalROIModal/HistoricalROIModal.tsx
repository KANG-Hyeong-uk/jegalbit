/**
 * HistoricalROIModal Organism
 * 실제 역사적 투자 수익률 데이터를 보여주는 모달
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CoinData, HistoricalInvestment } from '../../../types/crypto';

interface HistoricalROIModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinData: CoinData | null;
  historicalData: HistoricalInvestment | null;
  className?: string;
}

const HistoricalROIModal: React.FC<HistoricalROIModalProps> = ({
  isOpen,
  onClose,
  coinData,
  historicalData,
  className,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedProfit, setAnimatedProfit] = useState(0);

  // 금액을 억/조 단위로 변환하는 함수
  const formatLargeAmount = (amount: number): string => {
    const trillion = 1_000_000_000_000;
    const billion = 100_000_000;

    if (amount >= trillion) {
      const trillionValue = Math.floor(amount / trillion);
      return `₩${amount.toLocaleString()}(약 ${trillionValue}조)`;
    } else if (amount >= billion) {
      const billionValue = Math.floor(amount / billion);
      return `₩${amount.toLocaleString()}(약 ${billionValue}억)`;
    } else {
      return `₩${amount.toLocaleString()}`;
    }
  };

  // 숫자 카운트업 애니메이션
  useEffect(() => {
    if (!isOpen || !historicalData) return;

    const duration = 1200;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // easeOutExpo 효과
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setAnimatedValue(historicalData.currentValue * easeProgress);
      setAnimatedProfit(historicalData.profitRate * easeProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, historicalData]);

  if (!coinData || !historicalData) return null;

  const isWarning = historicalData.isWarning;
  const isProfitable = historicalData.profitRate >= 0;

  // 최고 수익률 계산
  const maxROI = historicalData.yearlyROI.reduce(
    (max, item) => (item.roi > max.roi ? item : max),
    historicalData.yearlyROI[0]
  );

  // 평균 연간 수익률 계산
  const years = historicalData.yearlyROI.length;
  const avgAnnualROI = historicalData.profitRate / years;

  // 보유 기간 계산
  const holdingPeriod = 2025 - historicalData.baseYear;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <ModalWrapper
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModalContainer
              as={motion.div}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={className}
              $isWarning={isWarning}
            >
              <CloseButton onClick={onClose}>×</CloseButton>

              <ModalContent>
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Header>
                    <CoinLogo $isWarning={isWarning}>{coinData.logo}</CoinLogo>
                    <HeaderInfo>
                      <CoinName>{coinData.name}</CoinName>
                      <CoinSymbol>{coinData.symbol}</CoinSymbol>
                    </HeaderInfo>
                    {isWarning && <WarningBadge>⚠️ 위험 사례</WarningBadge>}
                  </Header>
                </motion.div>

                {/* Warning Message */}
                {isWarning && historicalData.warningMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <WarningMessage>{historicalData.warningMessage}</WarningMessage>
                  </motion.div>
                )}

                {/* Price Change Section */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <PriceChangeSection>
                    <PriceChangeLabel>가격 변화</PriceChangeLabel>
                    <PriceChangeContent>
                      <PriceInfo>
                        <YearLabel>{historicalData.baseYear}년</YearLabel>
                        <Price>₩{historicalData.basePriceKRW.toLocaleString()}</Price>
                      </PriceInfo>
                      <ArrowIcon $isProfitable={isProfitable}>→</ArrowIcon>
                      <PriceInfo>
                        <YearLabel>현재</YearLabel>
                        <Price>₩{historicalData.currentPriceKRW.toLocaleString()}</Price>
                      </PriceInfo>
                    </PriceChangeContent>
                  </PriceChangeSection>
                </motion.div>

                {/* Investment Simulation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <SimulationSection $isWarning={isWarning}>
                    <SimulationTitle>당시 1,000,000원 투자했다면 💰</SimulationTitle>
                    <CurrentValueContainer>
                      <CurrentValueLabel>지금은 약</CurrentValueLabel>
                      <CurrentValue $isProfitable={isProfitable} $isWarning={isWarning}>
                        {formatLargeAmount(Math.floor(animatedValue))}
                      </CurrentValue>
                      <ValueSubtext>
                        {isProfitable ? '(' : '('}
                        {isProfitable ? '+' : ''}
                        {animatedProfit.toLocaleString('ko-KR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: animatedProfit > 1000 ? 0 : 2
                        })}%
                        {isProfitable ? ' ↑)' : ' ↓)'}
                      </ValueSubtext>
                    </CurrentValueContainer>
                  </SimulationSection>
                </motion.div>

                {/* ROI Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <ChartSection>
                    <ChartTitle>연도별 수익률 변화</ChartTitle>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalData.yearlyROI}>
                          <defs>
                            <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={isWarning ? '#ef4444' : isProfitable ? '#10b981' : '#ef4444'}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={isWarning ? '#ef4444' : isProfitable ? '#10b981' : '#ef4444'}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="year"
                            stroke="#6b7280"
                            style={{ fontSize: '12px', fontFamily: 'system-ui' }}
                          />
                          <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px', fontFamily: 'Courier New, monospace' }}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M%`;
                              if (value >= 1000) return `${(value / 1000).toFixed(0)}K%`;
                              return `${value.toFixed(0)}%`;
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.98)',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                              padding: '12px 16px',
                            }}
                            labelFormatter={(label) => `${label}년`}
                            formatter={(value: number, name: string) => {
                              if (name === 'roi') {
                                return [`${value >= 0 ? '+' : ''}${value.toLocaleString()}%`, '수익률'];
                              }
                              return [value, name];
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="roi"
                            stroke={isWarning ? '#ef4444' : isProfitable ? '#10b981' : '#ef4444'}
                            strokeWidth={3}
                            fill="url(#colorROI)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartSection>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <StatsGrid>
                    <StatCard>
                      <StatIcon>📈</StatIcon>
                      <StatLabel>최고 수익률 시점</StatLabel>
                      <StatValue $isPositive={maxROI.roi >= 0}>
                        {maxROI.year}년
                      </StatValue>
                      <StatAmount>
                        {maxROI.roi >= 0 ? '+' : ''}
                        {maxROI.roi.toLocaleString('ko-KR')}%
                      </StatAmount>
                      <StatSubtext>
                        {formatLargeAmount(maxROI.value)}
                      </StatSubtext>
                    </StatCard>

                    <StatCard>
                      <StatIcon>📊</StatIcon>
                      <StatLabel>평균 연간 수익률</StatLabel>
                      <StatValue $isPositive={avgAnnualROI >= 0}>
                        {avgAnnualROI >= 0 ? '+' : ''}
                        {avgAnnualROI.toLocaleString('ko-KR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1
                        })}%
                      </StatValue>
                      <StatSubtext>연평균 기준</StatSubtext>
                    </StatCard>

                    <StatCard>
                      <StatIcon>⏱️</StatIcon>
                      <StatLabel>총 보유 기간</StatLabel>
                      <StatValue $isPositive={true}>{holdingPeriod}년</StatValue>
                      <StatSubtext>
                        {historicalData.baseYear}년 ~ 2025년
                      </StatSubtext>
                    </StatCard>
                  </StatsGrid>
                </motion.div>
              </ModalContent>
            </ModalContainer>
          </ModalWrapper>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoricalROIModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  padding: 1rem;
`;

const ModalContainer = styled.div<{ $isWarning?: boolean }>`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: ${props => props.$isWarning
    ? 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)'
    : '#ffffff'};
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  pointer-events: auto;
  position: relative;
  border: ${props => props.$isWarning ? '2px solid #fca5a5' : 'none'};

  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
    transform: rotate(90deg);
  }
`;

const ModalContent = styled.div`
  padding: 2.5rem;
  overflow-y: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
`;

const CoinLogo = styled.div<{ $isWarning?: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$isWarning
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #627eea 0%, #8b5cf6 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  box-shadow: ${props => props.$isWarning
    ? '0 4px 16px rgba(239, 68, 68, 0.4)'
    : '0 4px 16px rgba(98, 126, 234, 0.4)'};

  @media (max-width: 640px) {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const CoinName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.025em;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const CoinSymbol = styled.p`
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #9ca3af;
  margin: 0;
  letter-spacing: 0.01em;
`;

const WarningBadge = styled.div`
  padding: 0.4rem 0.875rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 20px;
  font-size: 0.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #dc2626;
  white-space: nowrap;
  letter-spacing: 0.01em;
`;

const WarningMessage = styled.div`
  padding: 1rem 1.5rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: #991b1b;
  letter-spacing: 0.01em;
`;

const PriceChangeSection = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PriceChangeLabel = styled.div`
  font-size: 0.6875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const PriceChangeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const YearLabel = styled.div`
  font-size: 0.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #9ca3af;
  letter-spacing: 0.01em;
`;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
  letter-spacing: -0.015em;
  font-variant-numeric: tabular-nums;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const ArrowIcon = styled.div<{ $isProfitable: boolean }>`
  font-size: 2rem;
  color: ${props => props.$isProfitable ? '#10b981' : '#ef4444'};
  font-weight: 700;

  @media (max-width: 640px) {
    transform: rotate(90deg);
    font-size: 1.5rem;
  }
`;

const SimulationSection = styled.div<{ $isWarning?: boolean }>`
  background: ${props => props.$isWarning
    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'};
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 2px solid ${props => props.$isWarning ? '#fca5a5' : '#86efac'};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const SimulationTitle = styled.div`
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #1a1a1a;
  text-align: center;
  letter-spacing: -0.015em;
`;

const CurrentValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const CurrentValueLabel = styled.div`
  font-size: 0.8125rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #9ca3af;
  letter-spacing: 0.005em;
`;

const CurrentValue = styled.div<{ $isProfitable: boolean; $isWarning?: boolean }>`
  font-size: 2rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.$isWarning ? '#dc2626' : props.$isProfitable ? '#059669' : '#dc2626'};
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const ValueSubtext = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #6b7280;
  letter-spacing: -0.015em;
  font-variant-numeric: tabular-nums;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.015em;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 250px;
  background: #fafafa;
  border-radius: 16px;
  padding: 1rem;

  @media (max-width: 768px) {
    height: 220px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #9ca3af;
  margin: 0;
  letter-spacing: 0.005em;
`;

const StatValue = styled.p<{ $isPositive: boolean }>`
  font-size: 1.125rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.$isPositive ? '#059669' : '#dc2626'};
  margin: 0;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const StatAmount = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
`;

const StatSubtext = styled.p`
  font-size: 0.6875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #9ca3af;
  margin: 0;
  letter-spacing: 0.005em;
`;
