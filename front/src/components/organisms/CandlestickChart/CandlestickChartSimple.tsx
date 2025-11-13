/**
 * CandlestickChart Organism (Simplified)
 * 업비트 API - 필수 필드만 사용한 캔들스틱 차트
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getDayCandles, getMinuteCandles, getTicker, UpbitCandle, UpbitTicker } from '../../../services/api/upbitApi';

interface CandlestickChartProps {
  className?: string;
}

type TimeframeType = '1분' | '5분' | '15분' | '1시간' | '1일';

const CandlestickChart: React.FC<CandlestickChartProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<UpbitCandle[]>([]);
  const [ticker, setTicker] = useState<UpbitTicker | null>(null);
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 현재가 정보
        const tickerData = await getTicker([selectedMarket]);
        if (tickerData.length > 0) {
          setTicker(tickerData[0]);
        }

        // 캔들 데이터
        let candleData: UpbitCandle[];
        switch (selectedTimeframe) {
          case '1분':
            candleData = await getMinuteCandles(selectedMarket, 1, 100);
            break;
          case '5분':
            candleData = await getMinuteCandles(selectedMarket, 5, 100);
            break;
          case '15분':
            candleData = await getMinuteCandles(selectedMarket, 15, 100);
            break;
          case '1시간':
            candleData = await getMinuteCandles(selectedMarket, 60, 100);
            break;
          case '1일':
          default:
            candleData = await getDayCandles(selectedMarket, 100);
            break;
        }

        setCandles(candleData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 자동 갱신 (30초마다)
    const interval = setInterval(fetchData, 30000);
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
    const padding = { top: 80, right: 100, bottom: 80, left: 80 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // 배경
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 데이터 범위 계산 (시가, 고가, 저가, 종가)
    const prices = candles.flatMap((c) => [c.opening_price, c.high_price, c.low_price, c.trade_price]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const candleWidth = chartWidth / candles.length;
    const candleBodyWidth = Math.max(candleWidth * 0.6, 2);

    // 가격 => Y 좌표 변환
    const priceToY = (price: number) => {
      return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // 그리드 라인 및 가격 레이블
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // 가격 레이블 (Y축 우측)
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#888';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `₩${price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`,
        padding.left + chartWidth + 10,
        y
      );
    }

    // 캔들스틱 그리기
    candles.forEach((candle, index) => {
      const x = padding.left + index * candleWidth + candleWidth / 2;

      // 상승/하락 판단 (종가 vs 시가)
      const isRising = candle.trade_price >= candle.opening_price;
      const color = isRising ? '#10b981' : '#ef4444';

      const openY = priceToY(candle.opening_price);
      const closeY = priceToY(candle.trade_price);
      const highY = priceToY(candle.high_price);
      const lowY = priceToY(candle.low_price);

      // 심지 (고가-저가)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 캔들 몸통 (시가-종가)
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleBodyWidth / 2, bodyY, candleBodyWidth, Math.max(bodyHeight, 1));
    });

    // X축 시간 레이블
    const labelInterval = Math.max(Math.floor(candles.length / 8), 1);
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

        ctx.fillText(label, x, padding.top + chartHeight + 10);
      }
    });

    // 차트 타이틀
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const marketName = markets.find((m) => m.code === selectedMarket)?.name || '';
    ctx.fillText(`${marketName} 캔들스틱 차트`, padding.left, 20);

    // 현재가 및 통계 정보 (우측 상단)
    if (ticker) {
      const changeColor = ticker.change === 'RISE' ? '#10b981' : ticker.change === 'FALL' ? '#ef4444' : '#888';

      ctx.font = 'bold 18px Courier New';
      ctx.textAlign = 'right';
      ctx.fillStyle = changeColor;
      ctx.fillText(
        `현재가: ₩${ticker.trade_price.toLocaleString('ko-KR')}`,
        rect.width - padding.right,
        20
      );

      // 추가 정보
      ctx.font = '12px Courier New';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`시가: ₩${ticker.opening_price.toLocaleString('ko-KR')}`, rect.width - padding.right, 45);
      ctx.fillText(`고가: ₩${ticker.high_price.toLocaleString('ko-KR')}`, rect.width - padding.right, 62);
      ctx.fillText(`저가: ₩${ticker.low_price.toLocaleString('ko-KR')}`, rect.width - padding.right, 79);

      ctx.fillStyle = '#888';
      ctx.fillText(
        `24h 거래대금: ₩${(ticker.acc_trade_price_24h / 1000000).toFixed(0)}M`,
        rect.width - padding.right,
        96
      );
      ctx.fillText(
        `52주 최고: ₩${ticker.highest_52_week_price.toLocaleString('ko-KR')}`,
        rect.width - padding.right,
        113
      );
      ctx.fillText(
        `52주 최저: ₩${ticker.lowest_52_week_price.toLocaleString('ko-KR')}`,
        rect.width - padding.right,
        130
      );
    }

    // 거래량 표시 (하단)
    const maxVolume = Math.max(...candles.map((c) => c.candle_acc_trade_volume));
    const volumeHeight = 60;
    const volumeStartY = padding.top + chartHeight + 40;

    candles.forEach((candle, index) => {
      const x = padding.left + index * candleWidth + candleWidth / 2;
      const isRising = candle.trade_price >= candle.opening_price;
      const color = isRising ? '#10b98140' : '#ef444440';

      const volHeight = (candle.candle_acc_trade_volume / maxVolume) * volumeHeight;

      ctx.fillStyle = color;
      ctx.fillRect(
        x - candleBodyWidth / 2,
        volumeStartY + volumeHeight - volHeight,
        candleBodyWidth,
        volHeight
      );
    });

    // 거래량 레이블
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('거래량', padding.left, volumeStartY - 5);

  }, [candles, ticker, selectedMarket, selectedTimeframe]);

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
            <TitleSection>
              <Title>실시간 암호화폐 차트</Title>
              <Subtitle>업비트 API 기반 실시간 데이터</Subtitle>
            </TitleSection>
            <Controls>
              <ControlGroup>
                <Label>마켓</Label>
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
                <Label>시간대</Label>
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
            {isLoading && <LoadingOverlay>데이터 로딩 중...</LoadingOverlay>}
            <Canvas ref={canvasRef} />
          </CanvasWrapper>

          <Footer>
            <InfoGrid>
              {ticker && (
                <>
                  <InfoItem>
                    <InfoLabel>종목</InfoLabel>
                    <InfoValue>{ticker.market}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>전일대비</InfoLabel>
                    <InfoValue $color={ticker.change === 'RISE' ? '#10b981' : ticker.change === 'FALL' ? '#ef4444' : '#888'}>
                      {ticker.change === 'RISE' ? '상승' : ticker.change === 'FALL' ? '하락' : '보합'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>최근 거래량</InfoLabel>
                    <InfoValue>{ticker.trade_volume.toFixed(4)}</InfoValue>
                  </InfoItem>
                </>
              )}
            </InfoGrid>
            <FooterText>Data from Upbit API · 30초마다 자동 갱신</FooterText>
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
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ $active: boolean }>`
  padding: 0.625rem 1.25rem;
  background: ${(props) => (props.$active ? '#627eea' : '#2a2a2a')};
  color: ${(props) => (props.$active ? '#ffffff' : '#888')};
  border: 1px solid ${(props) => (props.$active ? '#627eea' : '#3a3a3a')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#7c94ee' : '#3a3a3a')};
    border-color: ${(props) => (props.$active ? '#7c94ee' : '#4a4a4a')};
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    flex: 1;
    min-width: 70px;
  }
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 700px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a2a;

  @media (max-width: 1024px) {
    height: 600px;
  }

  @media (max-width: 768px) {
    height: 500px;
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
  background: rgba(26, 26, 26, 0.9);
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #0a0a0a;
  border-radius: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.span<{ $color?: string }>`
  font-size: 1rem;
  color: ${(props) => props.$color || '#fff'};
  font-weight: 600;
  font-family: 'Courier New', monospace;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  text-align: center;
`;
