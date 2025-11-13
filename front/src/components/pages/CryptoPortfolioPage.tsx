/**
 * CryptoPortfolioPage
 * 암호화폐 포트폴리오 메인 페이지
 */

import React from 'react';
import styled from 'styled-components';
import { Navigation } from '../organisms/Navigation';
import { HeroSection } from '../organisms/HeroSection';
import { CoinsSection } from '../organisms/CoinsSection';
import { Footer } from '../organisms/Footer';

const CryptoPortfolioPage: React.FC = () => {
  return (
    <PageContainer>
      <Navigation />
      <HeroSection />
      <CoinsSection />
      <Footer />
    </PageContainer>
  );
};

export default CryptoPortfolioPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
`;
