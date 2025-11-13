/**
 * TradeStatisticsCard Molecule
 * 매매 일지 통계 카드 컴포넌트
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TradeStatistics } from '../../../types/trade';

interface TradeStatisticsCardProps {
  statistics: TradeStatistics;
}

const TradeStatisticsCard: React.FC<TradeStatisticsCardProps> = ({ statistics }) => {
  const formatPercent = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00%';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MainCard>
        <MainLabel>평균 총 수익률</MainLabel>
        <MainValue $isPositive={(statistics.averageTotalReturn || 0) >= 0}>
          {formatPercent(statistics.averageTotalReturn || 0)}
        </MainValue>
      </MainCard>

      <StatsGrid>
        <StatCard>
          <StatLabel>총 매수 횟수</StatLabel>
          <StatValue>{statistics.totalBuyCount || 0}회</StatValue>
        </StatCard>

        <StatCard>
          <StatLabel>총 매도 횟수</StatLabel>
          <StatValue>{statistics.totalSellCount || 0}회</StatValue>
        </StatCard>
      </StatsGrid>
    </Container>
  );
};

export default TradeStatisticsCard;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MainCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #627eea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const MainLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainValue = styled.div<{ $isPositive: boolean }>`
  font-size: 48px;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: ${(props) => (props.$isPositive ? '#10B981' : '#EF4444')};

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #111827;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;
