/**
 * HeroSection Organism
 * 메인 히어로 섹션 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { getTicker } from '../../../services/upbit';
import { Ticker } from '../../../types/upbit';

interface HeroSectionProps {
  bitcoinPrice?: number;
  priceChange?: number;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  bitcoinPrice = 155120.00,
  priceChange = 0.01,
  className,
}) => {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [displayPrice, setDisplayPrice] = useState(bitcoinPrice);
  const [displayChange, setDisplayChange] = useState(priceChange);

  // 실시간 가격 로드
  const loadBitcoinPrice = async () => {
    try {
      const tickers = await getTicker(['KRW-BTC']);
      if (tickers.length > 0) {
        setTicker(tickers[0]);
        setDisplayPrice(tickers[0].trade_price);
        setDisplayChange(tickers[0].change_rate * 100);
      }
    } catch (err) {
      console.error('Failed to load bitcoin price:', err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadBitcoinPrice();
  }, []);

  // 10초마다 실시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      loadBitcoinPrice();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = displayChange >= 0;

  return (
    <HeroContainer id="home" className={className}>
      <ContentWrapper>
        <LeftContent>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <MainHeadline>
              The Future of
              <br />
              <Gradient>Digital Currency</Gradient>
            </MainHeadline>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PriceContainer>
              <PriceLabel>Bitcoin Price</PriceLabel>
              <Price>${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Price>
              <PriceChange $isPositive={isPositive}>
                <ChangeIcon>{isPositive ? '↑' : '↓'}</ChangeIcon>
                {Math.abs(displayChange).toFixed(2)}%
              </PriceChange>
            </PriceContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CTAButton
              as={motion.a}
              href="#roi"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Past ROI
            </CTAButton>
          </motion.div>
        </LeftContent>

        <RightContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <BitcoinIcon>
              <IconInner>₿</IconInner>
            </BitcoinIcon>
          </motion.div>
        </RightContent>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;

// Animations
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

// Styled Components
const HeroContainer = styled.section`
  min-height: 85vh;
  display: flex;
  align-items: center;
  padding: 2rem;
  background: #e9e9e9;

  @media (max-width: 768px) {
    min-height: auto;
    padding: 4rem 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const MainHeadline = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Gradient = styled.span`
  background: linear-gradient(135deg, #627eea 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PriceLabel = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
`;

const Price = styled.p`
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const PriceChange = styled.span<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: ${(props) => (props.$isPositive ? '#10b981' : '#ef4444')};
`;

const ChangeIcon = styled.span`
  font-size: 1rem;
`;

const CTAButton = styled.a`
  display: inline-block;
  background: #627eea;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(98, 126, 234, 0.3);
  cursor: pointer;

  &:hover {
    background: #7c94ee;
    box-shadow: 0 6px 20px rgba(98, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
`;

const RightContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const BitcoinIcon = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 6s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(98, 126, 234, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${rotate} 30s linear infinite;
  }

  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
  }

  @media (max-width: 480px) {
    width: 250px;
    height: 250px;
  }
`;

const IconInner = styled.div`
  font-size: 15rem;
  font-weight: 700;
  color: #627eea;
  text-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 12rem;
  }

  @media (max-width: 480px) {
    font-size: 10rem;
  }
`;
