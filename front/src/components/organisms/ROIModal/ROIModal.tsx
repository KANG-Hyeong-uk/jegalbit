/**
 * ROIModal Organism
 * ROI 계산기 모달 컴포넌트 - 극적인 애니메이션 효과
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { CoinDetailData, TimeFrame } from '../../../types/crypto';

interface ROIModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinData: CoinDetailData | null;
  className?: string;
}

const ROIModal: React.FC<ROIModalProps> = ({ isOpen, onClose, coinData, className }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('24H');
  const [animatedStats, setAnimatedStats] = useState({
    currentValue: 0,
    totalInvestment: 0,
    averageROI: 0,
  });

  // 숫자 카운트업 애니메이션
  useEffect(() => {
    if (!isOpen || !coinData) return;

    const duration = 800;
    const steps = 30;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        currentValue: coinData.roiStats.currentValue * progress,
        totalInvestment: coinData.roiStats.totalInvestment * progress,
        averageROI: coinData.roiStats.averageROI * progress,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, coinData]);

  if (!coinData) return null;

  const timeframes: TimeFrame[] = ['1H', '24H', '7D', '1M', '1Y'];
  const chartData = coinData.detailedChartData[selectedTimeframe];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedTimeframe === '1H') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (selectedTimeframe === '24H') return date.toLocaleTimeString('en-US', { hour: '2-digit' });
    if (selectedTimeframe === '7D') return date.toLocaleDateString('en-US', { weekday: 'short' });
    if (selectedTimeframe === '1M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const isROIPositive = coinData.roiStats.averageROI >= 0;

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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={className}
            >
              <CloseButton onClick={onClose}>×</CloseButton>

              <ModalContent>
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Header>
                    <CoinLogo>{coinData.logo}</CoinLogo>
                    <HeaderInfo>
                      <CoinName>{coinData.name}</CoinName>
                      <CoinSymbol>{coinData.symbol}</CoinSymbol>
                    </HeaderInfo>
                  </Header>
                </motion.div>

                {/* Investment Summary */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SummaryGrid>
                    <SummaryCard>
                      <SummaryLabel>Total Investment</SummaryLabel>
                      <SummaryValue>
                        ${animatedStats.totalInvestment.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryLabel>Current Value</SummaryLabel>
                      <SummaryValue>
                        ${animatedStats.currentValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </SummaryValue>
                    </SummaryCard>
                    <SummaryCard $highlight $isPositive={isROIPositive}>
                      <SummaryLabel>Average ROI</SummaryLabel>
                      <SummaryValue>
                        {isROIPositive ? '+' : ''}
                        {animatedStats.averageROI.toFixed(2)}%
                      </SummaryValue>
                    </SummaryCard>
                  </SummaryGrid>
                </motion.div>

                {/* Chart Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <ChartSection>
                    <ChartHeader>
                      <ChartTitle>Price History</ChartTitle>
                      <TimeframeButtons>
                        {timeframes.map((tf) => (
                          <TimeframeButton
                            key={tf}
                            $active={selectedTimeframe === tf}
                            onClick={() => setSelectedTimeframe(tf)}
                          >
                            {tf}
                          </TimeframeButton>
                        ))}
                      </TimeframeButtons>
                    </ChartHeader>

                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#627eea" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#627eea" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatDate}
                            stroke="#6b7280"
                            style={{ fontSize: '12px', fontFamily: 'Courier New, monospace' }}
                          />
                          <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px', fontFamily: 'Courier New, monospace' }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                            labelFormatter={(label) => formatDate(label as number)}
                            formatter={(value: number) => [
                              `$${value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`,
                              'Price',
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#627eea"
                            strokeWidth={2}
                            dot={false}
                            fill="url(#colorPrice)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    {/* Volume Chart */}
                    <VolumeChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <Bar dataKey="volume" fill="#627eea" opacity={0.3} />
                        </BarChart>
                      </ResponsiveContainer>
                    </VolumeChartContainer>
                  </ChartSection>
                </motion.div>

                {/* Statistics Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <StatsGrid>
                    <StatCard>
                      <StatLabel>Max ROI</StatLabel>
                      <StatValue $isPositive>
                        +{coinData.roiStats.maxROI.percentage.toFixed(2)}%
                      </StatValue>
                      <StatDate>{coinData.roiStats.maxROI.date}</StatDate>
                      <StatAmount>
                        ${coinData.roiStats.maxROI.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </StatAmount>
                    </StatCard>

                    <StatCard>
                      <StatLabel>Min ROI</StatLabel>
                      <StatValue $isPositive={false}>
                        {coinData.roiStats.minROI.percentage.toFixed(2)}%
                      </StatValue>
                      <StatDate>{coinData.roiStats.minROI.date}</StatDate>
                      <StatAmount>
                        ${coinData.roiStats.minROI.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </StatAmount>
                    </StatCard>

                    <StatCard>
                      <StatLabel>Average ROI</StatLabel>
                      <StatValue $isPositive={isROIPositive}>
                        {isROIPositive ? '+' : ''}
                        {coinData.roiStats.averageROI.toFixed(2)}%
                      </StatValue>
                      <StatDescription>
                        Based on historical performance
                      </StatDescription>
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

export default ROIModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
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
`;

const ModalContainer = styled.div`
  width: 90vw;
  max-width: 900px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  pointer-events: auto;
  position: relative;

  @media (max-width: 768px) {
    width: 95vw;
    max-height: 95vh;
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

const CoinLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #627eea 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(98, 126, 234, 0.3);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CoinName = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const CoinSymbol = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{ $highlight?: boolean; $isPositive?: boolean }>`
  background: ${(props) =>
    props.$highlight
      ? props.$isPositive
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      : '#f9fafb'};
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.3s ease;
  color: ${(props) => (props.$highlight ? 'white' : 'inherit')};

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryLabel = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  opacity: 0.9;
  margin: 0;
`;

const SummaryValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: inherit;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const TimeframeButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TimeframeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => (props.$active ? '#627eea' : '#e5e7eb')};
  background: ${(props) => (props.$active ? '#627eea' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#6b7280')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#7c94ee' : '#f3f4f6')};
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const VolumeChartContainer = styled.div`
  width: 100%;
  height: 80px;
  background: #fafafa;
  border-radius: 8px;
  padding: 0.5rem;
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
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
`;

const StatValue = styled.p<{ $isPositive: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: ${(props) => (props.$isPositive ? '#10b981' : '#ef4444')};
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const StatDate = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

const StatAmount = styled.p`
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Courier New', monospace;
  color: #1a1a1a;
  margin: 0;
`;

const StatDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
`;
