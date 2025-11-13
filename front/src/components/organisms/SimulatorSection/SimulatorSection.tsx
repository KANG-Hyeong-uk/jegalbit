/**
 * SimulatorSection Organism
 * 암호화폐 시뮬레이터 섹션 컴포넌트
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Market {
  code: string;
  name: string;
}

interface BacktestResult {
  success: boolean;
  market: string;
  data_period: {
    start: string;
    end: string;
    days: number;
  };
  metrics: {
    initial_capital: number;
    final_value: number;
    total_return: number;
    buy_hold_return: number;
    num_trades: number;
    win_rate: number;
    max_drawdown: number;
    sharpe_ratio: number;
    uptrend_probability: number;
  };
  chart_image: string;
  signals: {
    buy_count: number;
    sell_count: number;
  };
}

interface SimulatorSectionProps {
  className?: string;
}

const AVAILABLE_MARKETS: Market[] = [
  { code: 'KRW-BTC', name: '비트코인 (BTC)' },
  { code: 'KRW-ETH', name: '이더리움 (ETH)' },
  { code: 'KRW-XRP', name: '리플 (XRP)' },
  { code: 'KRW-ADA', name: '에이다 (ADA)' },
  { code: 'KRW-DOT', name: '폴카닷 (DOT)' },
  { code: 'KRW-LINK', name: '체인링크 (LINK)' },
  { code: 'KRW-LTC', name: '라이트코인 (LTC)' },
  { code: 'KRW-BCH', name: '비트코인 캐시 (BCH)' },
];

const SimulatorSection: React.FC<SimulatorSectionProps> = ({ className }) => {
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [days, setDays] = useState(500);
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [useApi, setUseApi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Nginx 프록시를 통한 API 호출
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market: selectedMarket,
          days: days,
          initial_capital: initialCapital,
          use_api: useApi,
        }),
      });

      if (!response.ok) {
        throw new Error('백테스팅 실행 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('ko-KR') + '원';
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <SectionContainer id="simulator" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <SectionTitle>암호화폐 백테스팅 시뮬레이터</SectionTitle>
        <SectionSubtitle>
          과거 데이터로 매매 전략의 성과를 시뮬레이션해보세요
        </SectionSubtitle>
      </motion.div>

      <ContentWrapper>
        {/* 설정 패널 */}
        <ControlPanel
          as={motion.div}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <PanelTitle>시뮬레이션 설정</PanelTitle>

          <FormGroup>
            <Label>암호화폐 선택</Label>
            <Select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              {AVAILABLE_MARKETS.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>시뮬레이션 기간 (일)</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min="30"
              max="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label>초기 자본 (원)</Label>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              min="1000000"
              step="1000000"
            />
            <HintText>{formatCurrency(initialCapital)}</HintText>
          </FormGroup>

          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={useApi}
                onChange={(e) => setUseApi(e.target.checked)}
                id="use-api"
              />
              <CheckboxLabel htmlFor="use-api">
                실시간 API 데이터 사용 (느릴 수 있음)
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>

          <RunButton
            as={motion.button}
            onClick={handleRunBacktest}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? '시뮬레이션 실행 중...' : '시뮬레이션 실행'}
          </RunButton>
        </ControlPanel>

        {/* 결과 패널 */}
        <ResultPanel
          as={motion.div}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isLoading && (
            <LoadingContainer>
              <Spinner />
              <LoadingText>백테스팅 실행 중...</LoadingText>
            </LoadingContainer>
          )}

          {error && (
            <ErrorContainer>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>{error}</ErrorText>
              <ErrorHint>
                백엔드 서버가 실행 중인지 확인해주세요. (포트: 5001)
              </ErrorHint>
            </ErrorContainer>
          )}

          {!isLoading && !error && !result && (
            <PlaceholderContainer>
              <PlaceholderIcon>📊</PlaceholderIcon>
              <PlaceholderText>
                시뮬레이션을 실행하여 결과를 확인하세요
              </PlaceholderText>
            </PlaceholderContainer>
          )}

          {result && !isLoading && !error && (
            <>
              <ResultTitle>시뮬레이션 결과</ResultTitle>

              {/* 기간 정보 */}
              <InfoCard>
                <InfoLabel>분석 기간</InfoLabel>
                <InfoValue>
                  {result.data_period.start} ~ {result.data_period.end}
                  <InfoSmall> ({result.data_period.days}일)</InfoSmall>
                </InfoValue>
              </InfoCard>

              {/* 수익률 카드 */}
              <MetricsGrid>
                <MetricCard $highlight>
                  <MetricLabel>총 수익률</MetricLabel>
                  <MetricValue $positive={result.metrics.total_return >= 0}>
                    {formatPercentage(result.metrics.total_return)}
                  </MetricValue>
                  <MetricSubtext>
                    {formatCurrency(result.metrics.initial_capital)} →{' '}
                    {formatCurrency(result.metrics.final_value)}
                  </MetricSubtext>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>Buy & Hold 수익률</MetricLabel>
                  <MetricValue $positive={result.metrics.buy_hold_return >= 0}>
                    {formatPercentage(result.metrics.buy_hold_return)}
                  </MetricValue>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>승률</MetricLabel>
                  <MetricValue $positive={result.metrics.win_rate >= 50}>
                    {result.metrics.win_rate.toFixed(2)}%
                  </MetricValue>
                  <MetricSubtext>{result.metrics.num_trades}회 거래</MetricSubtext>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>상승 확률</MetricLabel>
                  <MetricValue $positive={result.metrics.uptrend_probability >= 50}>
                    {result.metrics.uptrend_probability.toFixed(2)}%
                  </MetricValue>
                  <MetricSubtext>현재 시점 기준</MetricSubtext>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>최대 낙폭 (MDD)</MetricLabel>
                  <MetricValue $negative>
                    -{result.metrics.max_drawdown.toFixed(2)}%
                  </MetricValue>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>Sharpe Ratio</MetricLabel>
                  <MetricValue>{result.metrics.sharpe_ratio.toFixed(2)}</MetricValue>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>매수 신호</MetricLabel>
                  <MetricValue>{result.signals.buy_count}회</MetricValue>
                </MetricCard>

                <MetricCard>
                  <MetricLabel>매도 신호</MetricLabel>
                  <MetricValue>{result.signals.sell_count}회</MetricValue>
                </MetricCard>
              </MetricsGrid>

              {/* 차트 이미지 */}
              <ChartContainer>
                <ChartImage
                  src={`data:image/png;base64,${result.chart_image}`}
                  alt="백테스팅 차트"
                />
              </ChartContainer>
            </>
          )}
        </ResultPanel>
      </ContentWrapper>
    </SectionContainer>
  );
};

export default SimulatorSection;

// Styled Components
const SectionContainer = styled.section`
  padding: 4rem 2rem;
  background: #0a0a0a;
  min-height: 100vh;
  position: relative;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 0.875rem;
  text-align: center;
  color: #666;
  margin: 0.5rem 0 2rem 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ControlPanel = styled.div`
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #3a3a3a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 1024px) {
    position: static;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const PanelTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #888;
  margin-bottom: 0.5rem;
  white-space: nowrap;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  font-size: 1rem;
  color: #fff;
  background: #2a2a2a;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    border-color: #627eea;
    background: #2a2a2a;
  }

  &:disabled {
    background: #1a1a1a;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  font-size: 1rem;
  color: #fff;
  background: #2a2a2a;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #627eea;
    background: #2a2a2a;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const HintText = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin: 0.5rem 0 0 0;
  font-family: 'Courier New', monospace;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #888;
  cursor: pointer;
  user-select: none;
`;

const RunButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: #627eea;
  color: white;
  border: 1px solid #627eea;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #7c94ee;
    border-color: #7c94ee;
  }

  &:disabled {
    background: #3a3a3a;
    border-color: #3a3a3a;
    color: #666;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ResultPanel = styled.div`
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #3a3a3a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  min-height: 400px;

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #2a2a2a;
  border-top-color: #627eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const ErrorText = styled.p`
  font-size: 1.125rem;
  color: #ef4444;
  font-weight: 600;
  margin: 0;
`;

const ErrorHint = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const PlaceholderIcon = styled.div`
  font-size: 4rem;
`;

const PlaceholderText = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  font-weight: 500;
`;

const ResultTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
`;

const InfoCard = styled.div`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const InfoLabel = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
`;

const InfoValue = styled.p`
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #fff;
  margin: 0;
`;

const InfoSmall = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #888;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div<{ $highlight?: boolean }>`
  background: ${(props) =>
    props.$highlight ? '#2a2a3a' : '#2a2a2a'};
  padding: 1.25rem;
  border-radius: 8px;
  border: ${(props) =>
    props.$highlight ? '1px solid #627eea' : '1px solid #3a3a3a'};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) =>
      props.$highlight ? '#7c94ee' : '#4a4a4a'};
    transform: translateY(-2px);
  }
`;

const MetricLabel = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
`;

const MetricValue = styled.p<{
  $positive?: boolean;
  $negative?: boolean;
}>`
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: ${(props) =>
    props.$positive
      ? '#10b981'
      : props.$negative
      ? '#ef4444'
      : '#fff'};
  margin: 0;
`;

const MetricSubtext = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: #1a1a1a;
  padding: 1.5rem;
  border: 1px solid #3a3a3a;
`;

const ChartImage = styled.img`
  width: 100%;
  min-height: 500px;
  height: auto;
  display: block;
  border-radius: 8px;

  @media (max-width: 768px) {
    min-height: 400px;
  }

  @media (max-width: 480px) {
    min-height: 300px;
  }
`;
