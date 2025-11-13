import React, { useState } from 'react';
import './BacktestForm.css';

function BacktestForm({ markets, onBacktest, loading }) {
  const [formData, setFormData] = useState({
    market: 'KRW-BTC',
    days: 500,
    initial_capital: 10000000,
    use_api: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBacktest(formData);
  };

  return (
    <div className="backtest-form-container">
      <h2>백테스팅 설정</h2>
      <form onSubmit={handleSubmit} className="backtest-form">
        <div className="form-group">
          <label htmlFor="market">암호화폐 선택:</label>
          <select
            id="market"
            name="market"
            value={formData.market}
            onChange={handleChange}
            required
          >
            {markets.length > 0 ? (
              markets.map(market => (
                <option key={market.code} value={market.code}>
                  {market.name}
                </option>
              ))
            ) : (
              <>
                <option value="KRW-BTC">비트코인 (BTC)</option>
                <option value="KRW-ETH">이더리움 (ETH)</option>
                <option value="KRW-XRP">리플 (XRP)</option>
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="days">분석 기간 (일):</label>
          <input
            type="number"
            id="days"
            name="days"
            value={formData.days}
            onChange={handleChange}
            min="100"
            max="1000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="initial_capital">초기 자본금 (원):</label>
          <input
            type="number"
            id="initial_capital"
            name="initial_capital"
            value={formData.initial_capital}
            onChange={handleChange}
            min="1000000"
            step="1000000"
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="use_api">
            <input
              type="checkbox"
              id="use_api"
              name="use_api"
              checked={formData.use_api}
              onChange={handleChange}
            />
            실제 API 데이터 사용 (체크 해제 시 샘플 데이터 사용)
          </label>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '백테스팅 실행 중...' : '백테스팅 실행'}
        </button>
      </form>
    </div>
  );
}

export default BacktestForm;

