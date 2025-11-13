/**
 * MyAssetsPage
 * 내 자산 페이지 - 업비트 계정 잔고 조회
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Navigation } from '../organisms/Navigation';
import { AccountBalanceDark } from '../organisms/AccountBalance';
import { Footer } from '../organisms/Footer';

const MyAssetsPage: React.FC = () => {
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
            <Title>내 자산</Title>
            <Subtitle>업비트 계정 잔고 및 수익률 조회</Subtitle>
          </Header>

          <ContentWrapper>
            <AccountBalanceDark />
          </ContentWrapper>

          <InfoBox
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <InfoTitle>사용 안내</InfoTitle>
            <InfoList>
              <InfoItem>
                <strong>실시간 조회:</strong> 보유 중인 암호화폐(BTC, LUNC, SOL)의 현재 평가액과 수익률을 확인할 수 있습니다.
              </InfoItem>
              <InfoItem>
                <strong>자동 업데이트:</strong> 잔고 정보는 30초마다 자동으로 갱신됩니다.
              </InfoItem>
              <InfoItem>
                <strong>API 키 설정:</strong> .env 파일에 업비트 ACCESS_KEY와 SECRET_KEY를 설정해야 합니다.
              </InfoItem>
              <InfoItem>
                <strong>보안 주의:</strong> API 키는 절대 공개 저장소에 업로드하지 마세요.
              </InfoItem>
            </InfoList>
          </InfoBox>

          <FooterText
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Data from Upbit API · Updated every 30 seconds
          </FooterText>
        </Container>
      </Section>
      <Footer />
    </PageContainer>
  );
};

export default MyAssetsPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
`;

const Section = styled.section`
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 4rem 2rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
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
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentWrapper = styled.div`
  margin-bottom: 2rem;
`;

const InfoBox = styled.div`
  background: rgba(26, 33, 66, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  font-size: 0.9375rem;
  color: #94a3b8;
  line-height: 1.8;
  margin-bottom: 0.5rem;
  padding-left: 1.25rem;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  strong {
    font-weight: 600;
    color: #f8fafc;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 1.5rem 0 0;
  text-align: center;
  font-family: 'SF Mono', 'Fira Code', monospace;
`;
