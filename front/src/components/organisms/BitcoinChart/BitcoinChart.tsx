/**
 * BitcoinChart Organism
 * 비트코인 실시간 차트 컴포넌트 (분봉 & 일봉)
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getMinuteCandles,
  getDayCandles,
  getTicker,
  convertMinuteCandleToChartData,
  convertDayCandleToChartData,
  formatPrice,
  formatChangeRate,
} from '../../../services/upbit';
import { CandleChartData, Ticker } from '../../../types/upbit';

type CandleType = 'minute' | 'day';
type MinuteUnit = 1 | 3 | 5 | 10 | 15 | 30 | 60 | 240;

const BitcoinChart: React.FC = () => {
  const [candleType, setCandleType] = useState<CandleType>('minute');
  const [minuteUnit, setMinuteUnit] = useState<MinuteUnit>(1);
  const [chartData, setChartData] = useState<CandleChartData[]>([]);
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const market = 'KRW-BTC';

  // 차트 데이터 로드
  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (candleType === 'minute') {
        const candles = await getMinuteCandles(market, minuteUnit, 100);
        const data = convertMinuteCandleToChartData(candles);
        setChartData(data.reverse());
      } else {
        const candles = await getDayCandles(market, 100);
        const data = convertDayCandleToChartData(candles);
        setChartData(data.reverse());
      }
    } catch (err: any) {
      setError(err.message || '차트 데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 현재가 정보 로드
  const loadTicker = async () => {
    try {
      const tickers = await getTicker([market]);
      if (tickers.length > 0) {
        setTicker(tickers[0]);
      }
    } catch (err) {
      console.error('Failed to load ticker:', err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadChartData();
    loadTicker();
  }, [candleType, minuteUnit]);

  // 실시간 업데이트 (10초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      loadChartData();
      loadTicker();
    }, 10000);

    return () => clearInterval(interval);
  }, [candleType, minuteUnit]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <TooltipLabel>{data.time}</TooltipLabel>
          <TooltipItem>
            <span>시가:</span> <strong>{formatPrice(data.open)}원</strong>
          </TooltipItem>
          <TooltipItem>
            <span>고가:</span> <strong>{formatPrice(data.high)}원</strong>
          </TooltipItem>
          <TooltipItem>
            <span>저가:</span> <strong>{formatPrice(data.low)}원</strong>
          </TooltipItem>
          <TooltipItem>
            <span>종가:</span> <strong>{formatPrice(data.close)}원</strong>
          </TooltipItem>
          <TooltipItem>
            <span>거래량:</span> <strong>{data.volume.toFixed(4)} BTC</strong>
          </TooltipItem>
        </TooltipContainer>
      );
    }
    return null;
  };

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 - 현재가 정보 */}
      {ticker && (
        <Header>
          <PriceInfo>
            <CoinName>비트코인 (BTC)</CoinName>
            <CurrentPrice>{formatPrice(ticker.trade_price)}원</CurrentPrice>
            <PriceChange $isPositive={ticker.change === 'RISE'}>
              {ticker.change === 'RISE' ? '▲' : ticker.change === 'FALL' ? '▼' : '-'}{' '}
              {formatPrice(Math.abs(ticker.change_price))}원 (
              {formatChangeRate(ticker.change_rate)})
            </PriceChange>
          </PriceInfo>

          <Stats>
            <StatItem>
              <StatLabel>고가</StatLabel>
              <StatValue>{formatPrice(ticker.high_price)}원</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>저가</StatLabel>
              <StatValue>{formatPrice(ticker.low_price)}원</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>거래량(24h)</StatLabel>
              <StatValue>{ticker.acc_trade_volume_24h.toFixed(2)} BTC</StatValue>
            </StatItem>
          </Stats>
        </Header>
      )}

      {/* 컨트롤 버튼 */}
      <Controls>
        <ButtonGroup>
          <ControlButton
            $active={candleType === 'minute'}
            onClick={() => setCandleType('minute')}
          >
            분봉
          </ControlButton>
          <ControlButton
            $active={candleType === 'day'}
            onClick={() => setCandleType('day')}
          >
            일봉
          </ControlButton>
        </ButtonGroup>

        {candleType === 'minute' && (
          <MinuteUnitSelector>
            {([1, 3, 5, 15, 30, 60] as MinuteUnit[]).map((unit) => (
              <UnitButton
                key={unit}
                $active={minuteUnit === unit}
                onClick={() => setMinuteUnit(unit)}
              >
                {unit}분
              </UnitButton>
            ))}
          </MinuteUnitSelector>
        )}
      </Controls>

      {/* 차트 */}
      <ChartContainer>
        {loading && <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (candleType === 'day') {
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }
                  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                domain={['dataMin - 1000000', 'dataMax + 1000000']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#627eea"
                strokeWidth={2}
                dot={false}
                name="종가"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!loading && !error && chartData.length === 0 && (
          <EmptyMessage>차트 데이터가 없습니다.</EmptyMessage>
        )}
      </ChartContainer>

      {/* 마지막 업데이트 시간 */}
      {ticker && (
        <UpdateInfo>
          마지막 업데이트: {new Date(ticker.timestamp).toLocaleTimeString('ko-KR')}
        </UpdateInfo>
      )}
    </Container>
  );
};

export default BitcoinChart;

// Styled Components
const Container = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const PriceInfo = styled.div`
  margin-bottom: 24px;
`;

const CoinName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const CurrentPrice = styled.div`
  font-size: 36px;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #111827;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const PriceChange = styled.div<{ $isPositive: boolean }>`
  font-size: 18px;
  font-weight: 600;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: ${(props) => (props.$isPositive ? '#10B981' : '#EF4444')};

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
`;

const StatValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #111827;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${(props) => (props.$active ? '#627eea' : '#f3f4f6')};
  color: ${(props) => (props.$active ? '#ffffff' : '#6b7280')};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#5168d4' : '#e5e7eb')};
  }
`;

const MinuteUnitSelector = styled.div`
  display: flex;
  gap: 6px;
`;

const UnitButton = styled.button<{ $active: boolean }>`
  padding: 8px 14px;
  background: ${(props) => (props.$active ? '#627eea' : 'transparent')};
  color: ${(props) => (props.$active ? '#ffffff' : '#6b7280')};
  border: 1px solid ${(props) => (props.$active ? '#627eea' : '#e5e7eb')};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#5168d4' : '#f3f4f6')};
  }
`;

const ChartContainer = styled.div`
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingMessage = styled.div`
  font-size: 16px;
  color: #6b7280;
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #ef4444;
  text-align: center;
  padding: 20px;
  background: #fee2e2;
  border-radius: 8px;
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  color: #6b7280;
  text-align: center;
`;

const UpdateInfo = styled.div`
  margin-top: 16px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
`;

const TooltipContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const TooltipItem = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  gap: 12px;

  strong {
    font-weight: 600;
    color: #111827;
  }
`;
