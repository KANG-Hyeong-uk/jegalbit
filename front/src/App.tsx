/**
 * 메인 App 컴포넌트
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CryptoPortfolioPage, ChartPage, SimulatorPage, TradeJournalPage, MyAssetsPage } from './components/pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CryptoPortfolioPage />} />
        <Route path="/charts" element={<ChartPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/trade-journal" element={<TradeJournalPage />} />
        <Route path="/my-assets" element={<MyAssetsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
