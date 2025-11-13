/**
 * SimulatorPage
 * 암호화폐 백테스팅 시뮬레이터 페이지
 */

import React from 'react';
import styled from 'styled-components';
import { Navigation } from '../organisms/Navigation';
import { SimulatorSection } from '../organisms/SimulatorSection';
import { Footer } from '../organisms/Footer';

const SimulatorPage: React.FC = () => {
  return (
    <PageContainer>
      <Navigation />
      <SimulatorSection />
      <Footer />
    </PageContainer>
  );
};

export default SimulatorPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
`;
