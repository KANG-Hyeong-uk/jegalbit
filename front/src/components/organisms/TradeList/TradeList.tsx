/**
 * TradeList Organism
 * 매매 일지 리스트 컴포넌트
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '../../../types/trade';

interface TradeListProps {
  trades: Trade[];
  onEdit?: (trade: Trade) => void;
  onDelete?: (id: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = (id: string) => {
    onDelete?.(id);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (trades.length === 0) {
    return (
      <EmptyState
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <EmptyIcon>📝</EmptyIcon>
        <EmptyText>아직 매매 기록이 없습니다</EmptyText>
        <EmptySubText>새로운 매매 기록을 등록해보세요</EmptySubText>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>날짜 / 시간</Th>
            <Th>종목명</Th>
            <Th>매수/매도</Th>
            <Th>투자 금액</Th>
            <Th>수익률</Th>
            <Th>매매 근거</Th>
            <Th>작업</Th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <Tr
              key={trade.id}
              as={motion.tr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Td>{formatDate(trade.tradeDate)}</Td>
              <Td>
                <SymbolBadge>{trade.symbol}</SymbolBadge>
              </Td>
              <Td>
                <TypeBadge $type={trade.type}>
                  {trade.type === 'BUY' ? '매수' : '매도'}
                </TypeBadge>
              </Td>
              <Td>
                <InvestmentText>
                  {formatNumber(trade.investmentAmount || 0)}원
                </InvestmentText>
              </Td>
              <Td>
                <ReturnRateText $isPositive={(trade.returnRate || 0) >= 0}>
                  {(trade.returnRate || 0) >= 0 ? '+' : ''}{(trade.returnRate || 0).toFixed(2)}%
                </ReturnRateText>
              </Td>
              <Td>
                <MemoText>{trade.memo || '-'}</MemoText>
              </Td>
              <Td>
                <ActionButtons>
                  {onEdit && (
                    <EditButton onClick={() => onEdit(trade)}>수정</EditButton>
                  )}
                  {onDelete && (
                    <DeleteButton onClick={() => handleDeleteClick(trade.id)}>
                      삭제
                    </DeleteButton>
                  )}
                </ActionButtons>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <AnimatePresence>
        {deleteConfirm && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDeleteCancel}
          >
            <ModalCard
              as={motion.div}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <ModalTitle>정말 삭제하시겠습니까?</ModalTitle>
              <ModalText>이 작업은 되돌릴 수 없습니다.</ModalText>
              <ModalButtons>
                <ModalCancelButton onClick={handleDeleteCancel}>
                  취소
                </ModalCancelButton>
                <ModalDeleteButton onClick={() => handleDeleteConfirm(deleteConfirm)}>
                  삭제
                </ModalDeleteButton>
              </ModalButtons>
            </ModalCard>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default TradeList;

// Styled Components
const Container = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
`;

const Th = styled.th`
  background: #f9fafb;
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #111827;
`;

const SymbolBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
`;

const TypeBadge = styled.span<{ $type: 'BUY' | 'SELL' }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${(props) => (props.$type === 'BUY' ? '#D1FAE5' : '#FEE2E2')};
  color: ${(props) => (props.$type === 'BUY' ? '#065F46' : '#991B1B')};
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
`;

const InvestmentText = styled.span`
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-weight: 600;
  font-size: 15px;
  color: #111827;
`;

const ReturnRateText = styled.span<{ $isPositive: boolean }>`
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  color: ${(props) => (props.$isPositive ? '#10B981' : '#EF4444')};
`;

const MemoText = styled.span`
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
`;

const EditButton = styled(Button)`
  background: #627eea;
  color: #ffffff;

  &:hover {
    background: #5168d4;
    transform: translateY(-1px);
  }
`;

const DeleteButton = styled(Button)`
  background: #ef4444;
  color: #ffffff;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 80px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  opacity: 0.6;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const EmptySubText = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
`;

const ModalCancelButton = styled(ModalButton)`
  background: transparent;
  color: #627eea;
  border: 1px solid #627eea;

  &:hover {
    background: #f3f4f6;
  }
`;

const ModalDeleteButton = styled(ModalButton)`
  background: #ef4444;
  color: #ffffff;

  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;
