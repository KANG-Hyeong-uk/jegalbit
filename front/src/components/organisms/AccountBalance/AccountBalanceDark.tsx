/**
 * AccountBalanceDark Organism
 * 차트 보기 화면용 다크 테마 계정 잔고 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getAccounts, getTicker, formatPrice } from '../../../services/upbit';
import { Account, Ticker } from '../../../types/upbit';

interface AccountWithPrice extends Account {
  currentPrice?: number;
  totalValue?: number;
}

const AccountBalanceDark: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalProfitRate, setTotalProfitRate] = useState(0);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. 계정 정보 가져오기
      const accountsData = await getAccounts();

      // 2. 각 코인의 현재가 조회 (BTC, LUNC, SOL만 표시 - KRW와 META 제외)
      const ALLOWED_CURRENCIES = ['BTC', 'LUNC', 'SOL'];
      const cryptoAccounts = accountsData.filter(
        (acc) =>
          acc.currency !== 'KRW' &&
          acc.currency !== 'META' &&
          parseFloat(acc.balance) > 0 &&
          ALLOWED_CURRENCIES.includes(acc.currency)
      );

      if (cryptoAccounts.length > 0) {
        const markets = cryptoAccounts.map((acc) => `KRW-${acc.currency}`);

        // Ticker 매핑 (에러가 발생해도 계속 진행)
        const tickerMap: Record<string, Ticker> = {};

        try {
          const tickers = await getTicker(markets);
          tickers.forEach((ticker) => {
            const currency = ticker.market.split('-')[1];
            tickerMap[currency] = ticker;
          });
        } catch (tickerError) {
          console.warn('일부 코인의 현재가 조회 실패. 개별 조회를 시도합니다.', tickerError);

          // 개별 코인별로 Ticker 조회 시도
          for (const acc of cryptoAccounts) {
            try {
              const tickers = await getTicker([`KRW-${acc.currency}`]);
              if (tickers.length > 0) {
                tickerMap[acc.currency] = tickers[0];
              }
            } catch (individualError) {
              console.warn(`${acc.currency} 현재가 조회 실패:`, individualError);
              // 실패한 코인은 스킵하고 계속 진행
            }
          }
        }

        // 계정 정보에 현재가 및 총 가치 추가 (허용된 통화만)
        const accountsWithPrice: AccountWithPrice[] = cryptoAccounts.map((acc) => {
          const ticker = tickerMap[acc.currency];
          if (ticker) {
            const currentPrice = ticker.trade_price;
            const totalValue = parseFloat(acc.balance) * currentPrice;
            return {
              ...acc,
              currentPrice,
              totalValue,
            };
          }

          // Ticker를 찾을 수 없는 경우 (상장폐지 등)
          console.warn(`${acc.currency}: Ticker 정보 없음 (상장폐지 또는 거래 중지)`);
          return {
            ...acc,
            currentPrice: 0,
            totalValue: 0
          };
        });

        setAccounts(accountsWithPrice);

        // 총 자산 계산
        const total = accountsWithPrice.reduce(
          (sum, acc) => sum + (acc.totalValue || 0),
          0
        );
        setTotalBalance(total);

        // 총 수익률 계산 (평균 매수가 기준)
        const totalInvestment = accountsWithPrice.reduce((sum, acc) => {
          if (acc.currency !== 'KRW' && parseFloat(acc.avg_buy_price) > 0) {
            return sum + parseFloat(acc.balance) * parseFloat(acc.avg_buy_price);
          }
          return sum;
        }, 0);

        const totalCurrentValue = accountsWithPrice.reduce((sum, acc) => {
          if (acc.currency !== 'KRW' && acc.totalValue) {
            return sum + acc.totalValue;
          }
          return sum;
        }, 0);

        if (totalInvestment > 0) {
          const profitRate = ((totalCurrentValue - totalInvestment) / totalInvestment) * 100;
          setTotalProfitRate(profitRate);
        } else {
          setTotalProfitRate(0);
        }
      } else {
        // 허용된 암호화폐가 없는 경우 (BTC, LUNC, SOL)
        setAccounts([]);
        setTotalBalance(0);
        setTotalProfitRate(0);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();

    // 30초마다 자동 갱신
    const interval = setInterval(loadAccounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>내 자산</Title>
        <RefreshButton onClick={loadAccounts} disabled={loading}>
          {loading ? '조회 중...' : '새로고침'}
        </RefreshButton>
      </Header>

      {error && (
        <ErrorMessage
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
          <ErrorHint>
            .env 파일에 업비트 API 키가 올바르게 설정되어 있는지 확인해주세요.
          </ErrorHint>
        </ErrorMessage>
      )}

      {!error && (
        <>
          {/* 총 자산 및 수익률 */}
          <TotalSection>
            <TotalRow>
              <TotalColumn>
                <TotalLabel>총 보유 자산</TotalLabel>
                <TotalValue>{formatPrice(totalBalance)} KRW</TotalValue>
              </TotalColumn>
              <Divider />
              <ProfitColumn>
                <ProfitLabel>총 수익률</ProfitLabel>
                <ProfitValue isProfit={totalProfitRate >= 0}>
                  {totalProfitRate >= 0 ? '+' : ''}{totalProfitRate.toFixed(2)}%
                </ProfitValue>
              </ProfitColumn>
            </TotalRow>
          </TotalSection>

          {/* 자산 목록 */}
          {loading && accounts.length === 0 && (
            <LoadingMessage>잔고 정보를 불러오는 중...</LoadingMessage>
          )}

          {!loading && accounts.length === 0 && (
            <EmptyMessage>보유 중인 자산이 없습니다.</EmptyMessage>
          )}

          {accounts.length > 0 && (
            <AccountList>
              {accounts.map((account) => {
                const investmentValue = parseFloat(account.balance) * parseFloat(account.avg_buy_price);
                const profitLoss = (account.totalValue || 0) - investmentValue;
                const profitRate = investmentValue > 0 ? (profitLoss / investmentValue) * 100 : 0;

                return (
                  <AccountCard
                    key={account.currency}
                    as={motion.div}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrencyHeader>
                      <CurrencyInfo>
                        <CurrencyIcon>
                          {account.currency === 'BTC'
                            ? '₿'
                            : account.currency === 'SOL'
                            ? '◎'
                            : account.currency.substring(0, 2)}
                        </CurrencyIcon>
                        <CurrencyDetails>
                          <CurrencyName>{account.currency}</CurrencyName>
                          <CurrencyBalance>
                            {parseFloat(account.balance).toFixed(8)}
                          </CurrencyBalance>
                        </CurrencyDetails>
                      </CurrencyInfo>
                      <ProfitBadge isProfit={profitRate >= 0}>
                        {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                      </ProfitBadge>
                    </CurrencyHeader>

                    <ValueGrid>
                      <ValueItem>
                        <ValueLabel>현재가</ValueLabel>
                        <ValueText>{formatPrice(account.currentPrice || 0)} KRW</ValueText>
                      </ValueItem>
                      <ValueItem>
                        <ValueLabel>평가액</ValueLabel>
                        <ValueText>{formatPrice(account.totalValue || 0)} KRW</ValueText>
                      </ValueItem>
                      <ValueItem>
                        <ValueLabel>평균 매수가</ValueLabel>
                        <ValueText>{formatPrice(parseFloat(account.avg_buy_price))} KRW</ValueText>
                      </ValueItem>
                      <ValueItem>
                        <ValueLabel>평가 손익</ValueLabel>
                        <ValueText isProfit={profitLoss >= 0}>
                          {profitLoss >= 0 ? '+' : ''}{formatPrice(profitLoss)} KRW
                        </ValueText>
                      </ValueItem>
                    </ValueGrid>
                  </AccountCard>
                );
              })}
            </AccountList>
          )}

          {/* 업데이트 시간 */}
          {accounts.length > 0 && (
            <UpdateTime>
              마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </UpdateTime>
          )}
        </>
      )}
    </Container>
  );
};

export default AccountBalanceDark;

// Styled Components (Dark Theme)
const Container = styled.div`
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
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const RefreshButton = styled.button`
  padding: 0.5rem 1rem;
  background: #627eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #7c94ee;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  line-height: 1.6;
`;

const ErrorHint = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #fca5a5;
`;

const TotalSection = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #252b3a 100%);
  border: 1px solid rgba(99, 126, 234, 0.2);
  border-left: 4px solid #627eea;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 128px;
    height: 128px;
    background: #627eea;
    opacity: 0.05;
    border-radius: 50%;
    filter: blur(60px);
  }
`;

const TotalRow = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TotalColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfitColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 60px;
  background: rgba(156, 163, 175, 0.2);

  @media (max-width: 640px) {
    width: 100%;
    height: 1px;
  }
`;

const TotalLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  margin-bottom: 0.5rem;
`;

const TotalValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ProfitLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  margin-bottom: 0.5rem;
`;

const ProfitValue = styled.div<{ isProfit: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: ${(props) => (props.isProfit ? '#10b981' : '#ef4444')};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '${(props) => (props.isProfit ? '▲' : '▼')}';
    font-size: 0.75rem;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  font-size: 1rem;
  color: #6b7280;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  font-size: 1rem;
  color: #6b7280;
`;

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AccountCard = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    background: #283142;
    border-color: #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const CurrencyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
`;

const CurrencyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CurrencyIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #627eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
`;

const CurrencyDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrencyName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 0.25rem;
`;

const CurrencyBalance = styled.div`
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #9ca3af;
`;

const ProfitBadge = styled.div<{ isProfit: boolean }>`
  padding: 0.375rem 0.75rem;
  background: ${(props) => (props.isProfit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')};
  color: ${(props) => (props.isProfit ? '#10b981' : '#ef4444')};
  border: 1px solid ${(props) => (props.isProfit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
`;

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ValueItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ValueLabel = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ValueText = styled.div<{ isProfit?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: ${(props) =>
    props.isProfit !== undefined
      ? props.isProfit
        ? '#10b981'
        : '#ef4444'
      : '#f3f4f6'
  };
`;

const UpdateTime = styled.div`
  margin-top: 1rem;
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
`;
