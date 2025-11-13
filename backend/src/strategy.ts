// RSI 계산 함수
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  // 첫 번째 평균 계산
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // RSI 계산
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// 이동평균 계산
export function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// 간단한 매매 전략
export class TradingStrategy {
  private rsiPeriod = 14;
  private rsiBuy = 30;  // RSI 30 이하면 매수
  private rsiSell = 70; // RSI 70 이상이면 매도

  // 매수 신호 판단
  shouldBuy(candles: any[]): boolean {
    const prices = candles.map(c => c.trade_price).reverse();
    const rsi = calculateRSI(prices, this.rsiPeriod);

    console.log(`📊 RSI: ${rsi.toFixed(2)}`);

    if (rsi < this.rsiBuy) {
      console.log(`🔵 매수 신호! (RSI: ${rsi.toFixed(2)} < ${this.rsiBuy})`);
      return true;
    }
    return false;
  }

  // 매도 신호 판단
  shouldSell(candles: any[]): boolean {
    const prices = candles.map(c => c.trade_price).reverse();
    const rsi = calculateRSI(prices, this.rsiPeriod);

    console.log(`📊 RSI: ${rsi.toFixed(2)}`);

    if (rsi > this.rsiSell) {
      console.log(`🔴 매도 신호! (RSI: ${rsi.toFixed(2)} > ${this.rsiSell})`);
      return true;
    }
    return false;
  }
}
