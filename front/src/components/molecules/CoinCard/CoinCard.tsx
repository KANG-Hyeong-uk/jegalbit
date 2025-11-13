/**
 * CoinCard Molecule
 * 개별 코인 카드 컴포넌트
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CoinData } from '../../../types/crypto';

interface CoinCardProps {
  coin: CoinData;
  onClick: () => void;
  className?: string;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onClick, className }) => {
  const isPositive = coin.priceChangePercentage24h >= 0;

  return (
    <CardContainer
      as={motion.div}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
      layoutId={`card-${coin.id}`}
    >
      <CardHeader>
        <CoinLogo>{coin.logo}</CoinLogo>
        <CoinInfo>
          <CoinName>{coin.name}</CoinName>
          <CoinSymbol>{coin.symbol}</CoinSymbol>
        </CoinInfo>
      </CardHeader>

      <PriceSection>
        <CurrentPrice>
          ₩{coin.currentPrice.toLocaleString('ko-KR', {
            minimumFractionDigits: coin.currentPrice < 1 ? 2 : 0,
            maximumFractionDigits: coin.currentPrice < 1 ? 2 : 0,
          })}
        </CurrentPrice>
        <PriceChange $isPositive={isPositive}>
          <ChangeIcon>{isPositive ? '↑' : '↓'}</ChangeIcon>
          {Math.abs(coin.priceChangePercentage24h).toLocaleString('ko-KR')}%
        </PriceChange>
      </PriceSection>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={coin.chartData}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContainer>
  );
};

export default CoinCard;

// Styled Components
const CardContainer = styled.div`
  background: rgba(26, 33, 66, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(59, 130, 246, 0.3), 0 0 80px rgba(16, 185, 129, 0.15);
    border-color: rgba(59, 130, 246, 0.3);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CoinLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
    opacity: 0.3;
    filter: blur(8px);
    z-index: -1;
  }

  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
`;

const CoinInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CoinName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const CoinSymbol = styled.p`
  font-size: 0.9375rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CurrentPrice = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.01em;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const PriceChange = styled.span<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 1.0625rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: ${(props) => (props.$isPositive ? '#10b981' : '#ef4444')};
  text-shadow: ${(props) =>
    props.$isPositive
      ? '0 0 12px rgba(16, 185, 129, 0.5)'
      : '0 0 12px rgba(239, 68, 68, 0.5)'};

  @media (max-width: 640px) {
    font-size: 0.9375rem;
  }
`;

const ChangeIcon = styled.span`
  font-size: 0.875rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 60px;
  margin-top: auto;
`;
