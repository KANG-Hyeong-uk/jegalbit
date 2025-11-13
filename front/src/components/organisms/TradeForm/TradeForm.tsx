/**
 * TradeForm Organism
 * 매매 일지 입력/수정 폼 컴포넌트 (간소화 버전)
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CreateTradeDTO, Trade } from '../../../types/trade';

interface TradeFormProps {
  initialData?: Trade;
  onSubmit: (data: CreateTradeDTO) => Promise<void>;
  onCancel?: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateTradeDTO>({
    symbol: initialData?.symbol || '',
    type: initialData?.type || 'BUY',
    investmentAmount: initialData?.investmentAmount || 0,
    returnRate: initialData?.returnRate || 0,
    tradeDate: initialData?.tradeDate || new Date().toISOString().slice(0, 16),
    memo: initialData?.memo || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTradeDTO, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'returnRate' || name === 'investmentAmount' ? parseFloat(value) || 0 : value,
    }));

    // 에러 제거
    if (errors[name as keyof CreateTradeDTO]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTradeDTO, string>> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = '종목명을 입력해주세요';
    }

    if (!formData.tradeDate) {
      newErrors.tradeDate = '날짜/시간을 입력해주세요';
    }

    if (!formData.investmentAmount || formData.investmentAmount <= 0) {
      newErrors.investmentAmount = '투자 금액을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // datetime-local 형식을 ISO 8601로 변환
        const submitData = {
          ...formData,
          tradeDate: new Date(formData.tradeDate).toISOString(),
        };
        await onSubmit(submitData);
        // 성공 시 폼 초기화
        if (!initialData) {
          setFormData({
            symbol: '',
            type: 'BUY',
            investmentAmount: 0,
            returnRate: 0,
            tradeDate: new Date().toISOString().slice(0, 16),
            memo: '',
          });
        }
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <FormContainer
      as={motion.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <FormTitle>{initialData ? '매매 일지 수정' : '새 매매 기록'}</FormTitle>

      <FormGrid>
        <FormGroup>
          <Label htmlFor="tradeDate">
            날짜 / 시간 <Required>*</Required>
          </Label>
          <Input
            id="tradeDate"
            name="tradeDate"
            type="datetime-local"
            value={formData.tradeDate}
            onChange={handleChange}
            $hasError={!!errors.tradeDate}
          />
          {errors.tradeDate && <ErrorText>{errors.tradeDate}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="symbol">
            종목명 <Required>*</Required>
          </Label>
          <Input
            id="symbol"
            name="symbol"
            type="text"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="예: BTC, ETH, XRP"
            $hasError={!!errors.symbol}
          />
          {errors.symbol && <ErrorText>{errors.symbol}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="type">
            매수 / 매도 <Required>*</Required>
          </Label>
          <Select id="type" name="type" value={formData.type} onChange={handleChange}>
            <option value="BUY">매수</option>
            <option value="SELL">매도</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="investmentAmount">
            투자 금액 <Required>*</Required>
          </Label>
          <Input
            id="investmentAmount"
            name="investmentAmount"
            type="number"
            step="0.01"
            value={formData.investmentAmount}
            onChange={handleChange}
            placeholder="0"
            $hasError={!!errors.investmentAmount}
          />
          {errors.investmentAmount && <ErrorText>{errors.investmentAmount}</ErrorText>}
          <HintText>투자한 금액을 입력하세요</HintText>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="returnRate">
            수익률 (%) <Required>*</Required>
          </Label>
          <Input
            id="returnRate"
            name="returnRate"
            type="number"
            step="0.01"
            value={formData.returnRate}
            onChange={handleChange}
            placeholder="0"
          />
          <HintText>투자 금액 대비 수익률 (양수: 이익, 음수: 손실)</HintText>
        </FormGroup>
      </FormGrid>

      <FormGroup>
        <Label htmlFor="memo">매매 근거</Label>
        <TextArea
          id="memo"
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          placeholder="매매 근거를 입력하세요..."
          rows={4}
        />
      </FormGroup>

      <ButtonGroup>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
            취소
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : initialData ? '수정하기' : '등록하기'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

export default TradeForm;

// Styled Components
const FormContainer = styled.form`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
`;

const Required = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${(props) => (props.$hasError ? '#EF4444' : '#E5E7EB')};
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background: #ffffff;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? '#EF4444' : '#627EEA')};
    box-shadow: 0 0 0 3px
      ${(props) => (props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 126, 234, 0.1)')};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #627eea;
    box-shadow: 0 0 0 3px rgba(99, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background: #ffffff;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #627eea;
    box-shadow: 0 0 0 3px rgba(99, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HintText = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(Button)`
  background: #627eea;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #5168d4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(98, 126, 234, 0.3);
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: #627eea;
  border: 1px solid #627eea;

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }
`;
