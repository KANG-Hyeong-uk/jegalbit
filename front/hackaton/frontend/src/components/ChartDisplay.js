import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import './ChartDisplay.css';

function ChartDisplay({ results }) {
  const [activeTab, setActiveTab] = useState('price');

  const { price_data, trades } = results;

  // 차트 데이터 준비 (변동세 계산 포함)
  const chartData = useMemo(() => {
    return price_data.map((item, index) => {
      const prevClose = index > 0 ? price_data[index - 1].close : item.close;
      const change = item.close - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      
      return {
        date: item.date,
        close: item.close,
        prevClose: prevClose,
        change: change,
        changePercent: changePercent,
        isUp: change >= 0,
        sma20: item.sma20,
        sma50: item.sma50,
        rsi: item.rsi,
        macd: item.macd,
        macdSignal: item.macd_signal,
        buySignal: item.buy_signal === 1 ? item.close : null,
        sellSignal: item.sell_signal === 1 ? item.close : null
      };
    });
  }, [price_data]);

  // 매수/매도 신호 데이터
  const buySignals = chartData.filter(d => d.buySignal !== null);
  const sellSignals = chartData.filter(d => d.sellSignal !== null);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(value);
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">{label}</div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label">종가:</span>
              <span className="tooltip-value">{formatCurrency(data.close)}</span>
            </div>
            {data.change !== undefined && (
              <div className="tooltip-item">
                <span className="tooltip-label">변동:</span>
                <span className={`tooltip-value ${data.isUp ? 'positive' : 'negative'}`}>
                  {data.isUp ? '+' : ''}{formatCurrency(data.change)} ({data.isUp ? '+' : ''}{data.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
            {data.sma20 && (
              <div className="tooltip-item">
                <span className="tooltip-label">SMA 20:</span>
                <span className="tooltip-value">{formatCurrency(data.sma20)}</span>
              </div>
            )}
            {data.sma50 && (
              <div className="tooltip-item">
                <span className="tooltip-label">SMA 50:</span>
                <span className="tooltip-value">{formatCurrency(data.sma50)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-display-container">
      <h2>차트 분석</h2>
      
      <div className="chart-tabs">
        <button
          className={activeTab === 'price' ? 'active' : ''}
          onClick={() => setActiveTab('price')}
        >
          가격 차트
        </button>
        <button
          className={activeTab === 'rsi' ? 'active' : ''}
          onClick={() => setActiveTab('rsi')}
        >
          RSI
        </button>
        <button
          className={activeTab === 'macd' ? 'active' : ''}
          onClick={() => setActiveTab('macd')}
        >
          MACD
        </button>
      </div>

      <div className="chart-wrapper">
        {activeTab === 'price' && (
          <ResponsiveContainer width="100%" height={600}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <defs>
                <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* 가격 영역 (그라데이션) */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="close"
                fill="url(#colorPrice)"
                stroke="none"
                name="가격 영역"
                isAnimationActive={true}
              />
              
              {/* 종가 라인 */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                strokeWidth={3}
                name="종가"
                dot={false}
                activeDot={{ r: 6, fill: '#2563eb' }}
                isAnimationActive={true}
              />
              
              {/* SMA 20 */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="sma20" 
                stroke="#10b981" 
                strokeWidth={2}
                name="SMA 20"
                dot={false}
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              
              {/* SMA 50 */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="sma50" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="SMA 50"
                dot={false}
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              
              {/* 매수 신호 */}
              {buySignals.map((signal, index) => (
                <ReferenceLine
                  key={`buy-${index}`}
                  yAxisId="left"
                  x={signal.date}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: "매수", position: "top", fill: "#22c55e", fontSize: 10 }}
                />
              ))}
              
              {/* 매도 신호 */}
              {sellSignals.map((signal, index) => (
                <ReferenceLine
                  key={`sell-${index}`}
                  yAxisId="left"
                  x={signal.date}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: "매도", position: "bottom", fill: "#ef4444", fontSize: 10 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'rsi' && (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip labelStyle={{ color: '#333' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rsi" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="RSI"
                dot={false}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="과매수 (70)" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" label="과매도 (30)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'macd' && (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelStyle={{ color: '#333' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="macd" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="MACD"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="macdSignal" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Signal Line"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {results.chart_image && (
        <div className="server-chart">
          <h3>서버 생성 차트</h3>
          <img 
            src={`data:image/png;base64,${results.chart_image}`} 
            alt="Backtest Chart"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}

      {trades && trades.length > 0 && (
        <div className="trades-table">
          <h3>거래 내역</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>유형</th>
                  <th>가격</th>
                  <th>수량</th>
                  <th>총 자산 가치</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={index} className={trade.type === 'BUY' ? 'buy-row' : 'sell-row'}>
                    <td>{trade.date}</td>
                    <td>
                      <span className={`trade-type ${trade.type.toLowerCase()}`}>
                        {trade.type === 'BUY' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td>{formatCurrency(trade.price)}</td>
                    <td>{trade.amount.toFixed(8)}</td>
                    <td>{formatCurrency(trade.total_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartDisplay;

