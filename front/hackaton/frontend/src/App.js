import React, { useState, useEffect } from 'react';
import './App.css';
import BacktestForm from './components/BacktestForm';
import ResultsDisplay from './components/ResultsDisplay';
import ChartDisplay from './components/ChartDisplay';
import axios from 'axios';

// API 기본 URL - 프록시 사용 시 상대 경로 사용
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:5001/api' 
  : '/api';

function App() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 마켓 목록 가져오기
    const fetchMarkets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/markets`, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('마켓 목록 응답:', response.data);
        if (response.data && response.data.markets) {
          setMarkets(response.data.markets);
        } else {
          // API 호출 실패 시 기본 마켓 목록 사용
          setMarkets([
            { code: 'KRW-BTC', name: '비트코인 (BTC)' },
            { code: 'KRW-ETH', name: '이더리움 (ETH)' },
            { code: 'KRW-XRP', name: '리플 (XRP)' }
          ]);
        }
      } catch (err) {
        console.error('마켓 목록 로드 실패:', err);
        // API 호출 실패 시 기본 마켓 목록 사용
        setMarkets([
          { code: 'KRW-BTC', name: '비트코인 (BTC)' },
          { code: 'KRW-ETH', name: '이더리움 (ETH)' },
          { code: 'KRW-XRP', name: '리플 (XRP)' },
          { code: 'KRW-ADA', name: '에이다 (ADA)' },
          { code: 'KRW-DOT', name: '폴카닷 (DOT)' },
          { code: 'KRW-LINK', name: '체인링크 (LINK)' },
          { code: 'KRW-LTC', name: '라이트코인 (LTC)' },
          { code: 'KRW-BCH', name: '비트코인 캐시 (BCH)' }
        ]);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('서버에 연결할 수 없습니다. Flask 서버가 실행 중인지 확인하세요.');
        }
      }
    };
    
    fetchMarkets();
  }, []);

  const handleBacktest = async (formData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('백테스팅 요청 전송:', formData);
      const response = await axios.post(`${API_BASE_URL}/backtest`, formData, {
        timeout: 300000, // 5분 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('백테스팅 응답 받음:', response.data);
      if (response.data.success) {
        setResults(response.data);
      } else {
        setError(response.data.error || '백테스팅 실행 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('백테스팅 에러:', err);
      if (err.code === 'ECONNABORTED') {
        setError('요청 시간이 초과되었습니다. 서버가 응답하지 않습니다.');
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('서버에 연결할 수 없습니다. Flask 서버가 실행 중인지 확인하세요. (http://localhost:5000)');
      } else {
        setError(err.response?.data?.error || err.message || '백테스팅 실행 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>암호화폐 포트폴리오 시뮬레이터</h1>
        <p>LSTM 기반 백테스팅 및 최적 매매 타이밍 분석</p>
      </header>

      <main className="app-main">
        <BacktestForm 
          markets={markets} 
          onBacktest={handleBacktest} 
          loading={loading}
        />

        {error && (
          <div className="error-message">
            <h3>오류 발생</h3>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <>
            <ResultsDisplay results={results} />
            <ChartDisplay results={results} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
