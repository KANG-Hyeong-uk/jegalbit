/**
 * ChartPage
 * 차트 보기 전용 페이지
 */

import React from 'react';
import styled from 'styled-components';
import { Navigation } from '../organisms/Navigation';
import { CandlestickChart } from '../organisms/CandlestickChart';
import { Footer } from '../organisms/Footer';

const ChartPage: React.FC = () => {
  return (
    <PageContainer>
      <Navigation />
      <CandlestickChart />
      <Footer />
    </PageContainer>
  );
};

export default ChartPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
`;
