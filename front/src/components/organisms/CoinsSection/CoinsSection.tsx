/**
 * CoinsSection Organism
 * 코인 그리드 섹션 - 4개의 코인 카드를 2x2 그리드로 배치
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CoinCard } from '../../molecules/CoinCard';
import { HistoricalROIModal } from '../HistoricalROIModal';
import { MOCK_COINS, HISTORICAL_DATA } from '../../../utils/mockData';
import { CoinData, HistoricalInvestment } from '../../../types/crypto';
import { getTicker } from '../../../services/upbit';

interface CoinsSectionProps {
  className?: string;
}

// 코인 ID를 업비트 마켓 코드로 매핑
const COIN_MARKET_MAP: { [key: string]: string } = {
  bitcoin: 'KRW-BTC',
  ethereum: 'KRW-ETH',
  ripple: 'KRW-XRP',
  // luna는 업비트에서 거래 중단되었으므로 제외
};

const CoinsSection: React.FC<CoinsSectionProps> = ({ className }) => {
  const [coins, setCoins] = useState<CoinData[]>(MOCK_COINS);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [selectedHistoricalData, setSelectedHistoricalData] = useState<HistoricalInvestment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 실시간 가격 업데이트 (역사적 ROI 퍼센트는 유지)
  const updateCoinPrices = async () => {
    try {
      const markets = Object.values(COIN_MARKET_MAP);
      const tickers = await getTicker(markets);

      setCoins(prevCoins =>
        prevCoins.map(coin => {
          const market = COIN_MARKET_MAP[coin.id];
          if (!market) return coin;

          const ticker = tickers.find(t => t.market === market);
          if (!ticker) return coin;

          // 가격만 업데이트하고 역사적 ROI 퍼센트는 유지
          return {
            ...coin,
            currentPrice: ticker.trade_price,
          };
        })
      );
    } catch (err) {
      console.error('Failed to update coin prices:', err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    updateCoinPrices();
  }, []);

  // 10초마다 실시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      updateCoinPrices();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = (coin: CoinData) => {
    const historicalData = HISTORICAL_DATA[coin.id];
    setSelectedCoin(coin);
    setSelectedHistoricalData(historicalData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 모달 닫히는 애니메이션이 끝난 후 데이터 초기화
    setTimeout(() => {
      setSelectedCoin(null);
      setSelectedHistoricalData(null);
    }, 300);
  };

  return (
    <>
      <SectionContainer id="roi" className={className}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle>Past ROI</SectionTitle>
        </motion.div>

        <CoinsGrid>
          {coins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <CoinCard coin={coin} onClick={() => handleCoinClick(coin)} />
            </motion.div>
          ))}
        </CoinsGrid>
      </SectionContainer>

      <HistoricalROIModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coinData={selectedCoin}
        historicalData={selectedHistoricalData}
      />
    </>
  );
};

export default CoinsSection;

// Styled Components
const SectionContainer = styled.section`
  padding: 4rem 2rem;
  background: #0a0a0a;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0 0 2rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CoinsGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
