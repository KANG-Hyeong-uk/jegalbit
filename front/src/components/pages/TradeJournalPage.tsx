/**
 * TradeJournalPage
 * 매매 일지 전용 페이지
 */

import React from 'react';
import styled from 'styled-components';
import { Navigation } from '../organisms/Navigation';
import TradeJournalSection from '../organisms/TradeJournalSection';
import { Footer } from '../organisms/Footer';

const TradeJournalPage: React.FC = () => {
  return (
    <PageContainer>
      <Navigation />
      <TradeJournalSection />
      <Footer />
    </PageContainer>
  );
};

export default TradeJournalPage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
`;
