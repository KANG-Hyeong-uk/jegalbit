/**
 * UpbitPage
 * 업비트 API 연동 - 비트코인 차트 & 계정 잔고 조회
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Navigation } from '../organisms/Navigation';
import { Footer } from '../organisms/Footer';
import BitcoinChart from '../organisms/BitcoinChart';
import AccountBalance from '../organisms/AccountBalance';

const UpbitPage: React.FC = () => {
  return (
    <PageContainer>
      <Navigation />

      <Section>
        <Container>
          <Header
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title>업비트 실시간 거래소</Title>
            <Subtitle>비트코인 차트 분석 및 계정 관리</Subtitle>
          </Header>

          {/* 계정 잔고 */}
          <AccountBalance />

          {/* 비트코인 차트 */}
          <ChartSection>
            <BitcoinChart />
          </ChartSection>

          {/* 안내 메시지 */}
          <InfoBox
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <InfoTitle>💡 사용 안내</InfoTitle>
            <InfoList>
              <InfoItem>
                <strong>차트 분석:</strong> 분봉(1/3/5/15/30/60분)과 일봉 데이터를 실시간으로
                조회할 수 있습니다.
              </InfoItem>
              <InfoItem>
                <strong>자동 업데이트:</strong> 차트는 10초마다, 잔고는 30초마다 자동으로
                갱신됩니다.
              </InfoItem>
              <InfoItem>
                <strong>API 키 설정:</strong> 잔고 조회를 위해서는 .env 파일에 업비트 API 키를
                설정해야 합니다.
              </InfoItem>
              <InfoItem>
                <strong>보안 주의:</strong> API 키는 절대 공개 저장소에 업로드하지 마세요.
              </InfoItem>
            </InfoList>
          </InfoBox>
        </Container>
      </Section>

      <Footer />
    </PageContainer>
  );
};

export default UpbitPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #e9e9e9;
`;

const Section = styled.section`
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 80px 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ChartSection = styled.div`
  margin-top: 40px;
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 16px;
  padding: 24px;
  margin-top: 40px;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 16px;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  font-size: 14px;
  color: #1e3a8a;
  line-height: 1.8;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: #3b82f6;
    font-weight: 700;
  }

  strong {
    font-weight: 600;
    color: #1e40af;
  }
`;
