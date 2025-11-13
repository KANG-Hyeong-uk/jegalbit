/**
 * CandlestickChart Organism
 * 업비트 API를 사용한 캔들스틱 차트 (Canvas 기반)
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getDayCandles, getMinuteCandles, UpbitCandle } from '../../../services/api/upbitApi';

interface CandlestickChartProps {
  className?: string;
}

type TimeframeType = '1분' | '5분' | '15분' | '1시간' | '1일';

const CandlestickChart: React.FC<CandlestickChartProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<UpbitCandle[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('KRW-BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('1일');
  const [isLoading, setIsLoading] = useState(false);

  const markets = [
    { code: 'KRW-BTC', name: 'Bitcoin' },
    { code: 'KRW-ETH', name: 'Ethereum' },
    { code: 'KRW-XRP', name: 'Ripple' },
    { code: 'KRW-DOGE', name: 'Dogecoin' },
  ];

  // 데이터 로드
  useEffect(() => {
    const fetchCandles = async () => {
      setIsLoading(true);
      try {
        let data: UpbitCandle[];

        switch (selectedTimeframe) {
          case '1분':
            data = await getMinuteCandles(selectedMarket, 1, 100);
            break;
          case '5분':
            data = await getMinuteCandles(selectedMarket, 5, 100);
            break;
          case '15분':
            data = await getMinuteCandles(selectedMarket, 15, 100);
            break;
          case '1시간':
            data = await getMinuteCandles(selectedMarket, 60, 100);
            break;
          case '1일':
          default:
            data = await getDayCandles(selectedMarket, 100);
            break;
        }

        setCandles(data);
      } catch (error) {
        console.error('Failed to fetch candles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandles();

    // 자동 갱신 (30초마다)
    const interval = setInterval(fetchCandles, 30000);
    return () => clearInterval(interval);
  }, [selectedMarket, selectedTimeframe]);

  // 캔버스 그리기
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 패딩 및 차트 영역
    const padding = { top: 40, right: 80, bottom: 60, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // 배경
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 데이터 범위 계산
    const prices = candles.flatMap((c) => [c.high_price, c.low_price]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const candleWidth = chartWidth / candles.length;
    const candleBodyWidth = candleWidth * 0.6;

    // 가격 => Y 좌표 변환
    const priceToY = (price: number) => {
      return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // 그리드 라인
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // 가격 레이블
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#888';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `₩${price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`,
        rect.width - padding.right + 75,
        y
      );
    }

    // 캔들스틱 그리기
    candles.forEach((candle, index) => {
      const x = padding.left + index * candleWidth + candleWidth / 2;
      const isRising = candle.trade_price >= candle.opening_price;
      const color = isRising ? '#10b981' : '#ef4444';

      const openY = priceToY(candle.opening_price);
      const closeY = priceToY(candle.trade_price);
      const highY = priceToY(candle.high_price);
      const lowY = priceToY(candle.low_price);

      // 심지 (고가-저가)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 캔들 몸통
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleBodyWidth / 2, bodyY, candleBodyWidth, Math.max(bodyHeight, 1));
    });

    // X축 시간 레이블 (10개만 표시)
    const labelInterval = Math.floor(candles.length / 10);
    ctx.fillStyle = '#888';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    candles.forEach((candle, index) => {
      if (index % labelInterval === 0) {
        const x = padding.left + index * candleWidth + candleWidth / 2;
        const date = new Date(candle.candle_date_time_kst);
        let label = '';

        if (selectedTimeframe === '1일') {
          label = `${date.getMonth() + 1}/${date.getDate()}`;
        } else {
          label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }

        ctx.fillText(label, x, rect.height - padding.bottom + 10);
      }
    });

    // 차트 제목
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `${markets.find((m) => m.code === selectedMarket)?.name} (${selectedMarket})`,
      padding.left,
      15
    );

    // 현재가 표시
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const isRising = lastCandle.trade_price >= lastCandle.opening_price;

      ctx.fillStyle = isRising ? '#10b981' : '#ef4444';
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText(
        `₩${lastCandle.trade_price.toLocaleString('ko-KR')}`,
        rect.width - padding.right - 10,
        15
      );
    }
  }, [candles, selectedMarket, selectedTimeframe]);

  return (
    <ChartSection id="charts" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <ChartContainer>
          <Header>
            <Title>실시간 암호화폐 차트</Title>
            <Controls>
              <ControlGroup>
                <Label>마켓:</Label>
                <ButtonGroup>
                  {markets.map((market) => (
                    <ControlButton
                      key={market.code}
                      $active={selectedMarket === market.code}
                      onClick={() => setSelectedMarket(market.code)}
                    >
                      {market.name}
                    </ControlButton>
                  ))}
                </ButtonGroup>
              </ControlGroup>

              <ControlGroup>
                <Label>시간:</Label>
                <ButtonGroup>
                  {(['1분', '5분', '15분', '1시간', '1일'] as TimeframeType[]).map((tf) => (
                    <ControlButton
                      key={tf}
                      $active={selectedTimeframe === tf}
                      onClick={() => setSelectedTimeframe(tf)}
                    >
                      {tf}
                    </ControlButton>
                  ))}
                </ButtonGroup>
              </ControlGroup>
            </Controls>
          </Header>

          <CanvasWrapper>
            {isLoading && <LoadingOverlay>Loading...</LoadingOverlay>}
            <Canvas ref={canvasRef} />
          </CanvasWrapper>

          <Footer>
            <FooterText>Data from Upbit API · Updated every 30 seconds</FooterText>
          </Footer>
        </ChartContainer>
      </motion.div>
    </ChartSection>
  );
};

export default CandlestickChart;

// Styled Components
const ChartSection = styled.section`
  padding: 4rem 2rem;
  background: #0a0a0a;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const ChartContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #888;
  white-space: nowrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? '#627eea' : '#2a2a2a')};
  color: ${(props) => (props.$active ? '#ffffff' : '#888')};
  border: 1px solid ${(props) => (props.$active ? '#627eea' : '#3a3a3a')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#7c94ee' : '#3a3a3a')};
    border-color: ${(props) => (props.$active ? '#7c94ee' : '#4a4a4a')};
  }

  @media (max-width: 640px) {
    flex: 1;
    min-width: 60px;
  }
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: 500px;
  }

  @media (max-width: 768px) {
    height: 400px;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 26, 26, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  z-index: 10;
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
`;
