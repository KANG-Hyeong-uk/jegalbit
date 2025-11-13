/**
 * TradeJournalSection Organism
 * 매매 일지 메인 섹션 - 모든 기능 통합
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TradeForm from '../TradeForm';
import TradeList from '../TradeList';
import TradeStatisticsCard from '../../molecules/TradeStatisticsCard';
import {
  getAllTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  getStatistics,
} from '../../../services/tradeJournal';
import { Trade, CreateTradeDTO, TradeStatistics } from '../../../types/trade';

const TradeJournalSection: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [statistics, setStatistics] = useState<TradeStatistics>({
    totalBuyCount: 0,
    totalSellCount: 0,
    averageBuyReturn: 0,
    averageSellReturn: 0,
    averageTotalReturn: 0,
  });
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tradesData, statsData] = await Promise.all([
        getAllTrades(),
        getStatistics(),
      ]);
      setTrades(tradesData);
      setStatistics(statsData);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 성공 메시지 자동 제거
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 생성/수정 핸들러
  const handleSubmit = async (data: CreateTradeDTO) => {
    try {
      console.log('Submitting data:', data);
      if (editingTrade) {
        await updateTrade(editingTrade.id, data);
        setSuccessMessage('매매 기록이 수정되었습니다.');
        setEditingTrade(null);
      } else {
        await createTrade(data);
        setSuccessMessage('매매 기록이 등록되었습니다.');
      }
      await loadData();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      console.error('Full error:', err);

      // 에러 메시지 처리
      let errorMessage = '작업 중 오류가 발생했습니다.';

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // detail이 배열인 경우 (FastAPI 유효성 검사 에러)
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) =>
            `${e.loc?.join(' > ') || 'field'}: ${e.msg}`
          ).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      }

      setError(errorMessage);
    }
  };

  // 삭제 핸들러
  const handleDelete = async (id: string) => {
    try {
      await deleteTrade(id);
      setSuccessMessage('매매 기록이 삭제되었습니다.');
      await loadData();
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  // 수정 핸들러
  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setIsFormOpen(true);
    // 스크롤을 폼으로 이동
    setTimeout(() => {
      const formElement = document.getElementById('trade-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingTrade(null);
  };

  // 토글 버튼 핸들러
  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
    if (isFormOpen) {
      setEditingTrade(null); // 폼을 닫을 때 편집 모드 해제
    }
  };

  return (
    <Section id="journal">
      <Container>
        <Header
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title>매매 일지</Title>
          <Subtitle>체계적인 매매 기록으로 더 나은 투자 전략을 세워보세요</Subtitle>
        </Header>

        {/* 에러/성공 메시지 */}
        {error && (
          <Alert
            $type="error"
            as={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            $type="success"
            as={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMessage}
          </Alert>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <LoadingContainer>
            <Spinner />
            <LoadingText>데이터를 불러오는 중...</LoadingText>
          </LoadingContainer>
        )}

        {/* 메인 콘텐츠 */}
        {!loading && (
          <>
            {/* 통계 카드 */}
            <StatisticsWrapper>
              <TradeStatisticsCard statistics={statistics} />
            </StatisticsWrapper>

            {/* 토글 버튼 */}
            <ToggleButtonContainer>
              <ToggleButton
                onClick={toggleForm}
                aria-expanded={isFormOpen}
                aria-controls="trade-form"
                $isOpen={isFormOpen}
              >
                <IconWrapper $isOpen={isFormOpen}>
                  {isFormOpen ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 5L5 15M5 5L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 5V15M5 10H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </IconWrapper>
                {isFormOpen ? '닫기' : '+ 매매 일지 작성하기'}
              </ToggleButton>
            </ToggleButtonContainer>

            {/* 폼 (애니메이션 토글) */}
            <FormContainer
              id="trade-form"
              aria-hidden={!isFormOpen}
              initial={false}
              animate={{
                height: isFormOpen ? 'auto' : 0,
                opacity: isFormOpen ? 1 : 0,
                marginBottom: isFormOpen ? 32 : 0,
              }}
              transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: 'easeInOut' },
                marginBottom: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <FormWrapper>
                <TradeForm
                  initialData={editingTrade || undefined}
                  onSubmit={handleSubmit}
                  onCancel={editingTrade ? handleCancelEdit : undefined}
                />
              </FormWrapper>
            </FormContainer>

            {/* 리스트 */}
            <ListWrapper>
              <TradeList trades={trades} onEdit={handleEdit} onDelete={handleDelete} />
            </ListWrapper>
          </>
        )}
      </Container>
    </Section>
  );
};

export default TradeJournalSection;

// Styled Components
const Section = styled.section`
  width: 100%;
  min-height: 100vh;
  padding: 80px 0;
  background: #0a0a0a;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
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
  color: #666;
  margin: 0.5rem 0 0 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Alert = styled.div<{ $type: 'error' | 'success' }>`
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
  text-align: center;
  background: ${(props) =>
    props.$type === 'error' ? '#2a1a1a' : '#1a2a1a'};
  color: ${(props) => (props.$type === 'error' ? '#ef4444' : '#10b981')};
  border: 1px solid ${(props) =>
    props.$type === 'error' ? '#3a1a1a' : '#1a3a1a'};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
  margin-top: 16px;
  font-size: 1.125rem;
  color: #6b7280;
  font-weight: 500;
`;

const StatisticsWrapper = styled.div`
  margin-bottom: 40px;
`;

const ToggleButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ToggleButton = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$isOpen ? '#627eea' : '#2a2a2a')};
  color: ${(props) => (props.$isOpen ? '#ffffff' : '#888')};
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${(props) => (props.$isOpen ? '#627eea' : '#3a3a3a')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$isOpen ? '#7c94ee' : '#3a3a3a')};
    border-color: ${(props) => (props.$isOpen ? '#7c94ee' : '#4a4a4a')};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const IconWrapper = styled.span<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease-in-out;
  transform: ${(props) => (props.$isOpen ? 'rotate(0deg)' : 'rotate(0deg)')};

  svg {
    width: 100%;
    height: 100%;
  }
`;

const FormContainer = styled(motion.div)`
  overflow: hidden;
`;

const FormWrapper = styled.div`
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  & > form {
    background: transparent;
    box-shadow: none;
    padding: 0;
  }
`;

const ListWrapper = styled.div``;
