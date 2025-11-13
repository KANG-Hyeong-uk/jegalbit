/**
 * AccountBalance Organism
 * 업비트 계정 잔고 조회 컴포넌트
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

const AccountBalance: React.FC = () => {
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
        const ALLOWED_CURRENCIES = ['BTC', 'LUNC', 'SOL'];
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
          {/* 총 자산 */}
          <TotalSection>
            <TotalLabel>총 보유 자산 (KRW)</TotalLabel>
            <TotalValue>{formatPrice(totalBalance)}원</TotalValue>
            <ProfitRateSection>
              <ProfitRateLabel>총 수익률</ProfitRateLabel>
              <ProfitRateValue isProfit={totalProfitRate >= 0}>
                {totalProfitRate >= 0 ? '+' : ''}{totalProfitRate.toFixed(2)}%
              </ProfitRateValue>
            </ProfitRateSection>
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
              {accounts.map((account) => (
                <AccountCard
                  key={account.currency}
                  as={motion.div}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrencyInfo>
                    <CurrencyIcon>
                      {account.currency === 'KRW'
                        ? '₩'
                        : account.currency === 'BTC'
                        ? '₿'
                        : account.currency === 'ETH'
                        ? 'Ξ'
                        : account.currency.substring(0, 2)}
                    </CurrencyIcon>
                    <CurrencyDetails>
                      <CurrencyName>
                        {account.currency === 'KRW' ? '원화' : account.currency}
                      </CurrencyName>
                      <CurrencyBalance>
                        {parseFloat(account.balance).toFixed(
                          account.currency === 'KRW' ? 0 : 8
                        )}{' '}
                        {account.currency}
                      </CurrencyBalance>
                    </CurrencyDetails>
                  </CurrencyInfo>

                  <ValueInfo>
                    {account.currency !== 'KRW' && account.currentPrice && (
                      <CurrentPrice>
                        현재가: {formatPrice(account.currentPrice)}원
                      </CurrentPrice>
                    )}
                    <TotalWorth>
                      평가액: {formatPrice(account.totalValue || 0)}원
                    </TotalWorth>
                    {parseFloat(account.avg_buy_price) > 0 && (
                      <AvgPrice>
                        평균 매수가: {formatPrice(parseFloat(account.avg_buy_price))}원
                      </AvgPrice>
                    )}
                  </ValueInfo>
                </AccountCard>
              ))}
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

export default AccountBalance;

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #627eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #5168d4;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  padding: 20px;
  color: #991b1b;
  font-size: 15px;
  line-height: 1.6;
`;

const ErrorHint = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #dc2626;
`;

const TotalSection = styled.div`
  background: linear-gradient(135deg, #627eea 0%, #5168d4 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const TotalLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const TotalValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ProfitRateSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProfitRateLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const ProfitRateValue = styled.div<{ isProfit: boolean }>`
  font-size: 24px;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: ${(props) => (props.isProfit ? '#10b981' : '#ef4444')};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #6b7280;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #6b7280;
`;

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AccountCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const CurrencyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CurrencyIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #627eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
`;

const CurrencyDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrencyName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const CurrencyBalance = styled.div`
  font-size: 14px;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #6b7280;
`;

const ValueInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const CurrentPrice = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const TotalWorth = styled.div`
  font-size: 18px;
  font-weight: 700;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  color: #111827;
`;

const AvgPrice = styled.div`
  font-size: 13px;
  color: #9ca3af;
`;

const UpdateTime = styled.div`
  margin-top: 16px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
`;
