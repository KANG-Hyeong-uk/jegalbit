import 'dotenv/config';
import { UpbitAPI } from './upbit';
import { TradingStrategy } from './strategy';

export class TradingBot {
  private upbit: UpbitAPI;
  private strategy: TradingStrategy;
  private market: string;
  private tradeAmount: number;
  private isRunning: boolean = false;

  constructor(market: string = 'KRW-BTC', tradeAmount: number = 5000) {
    const accessKey = process.env.UPBIT_OPEN_API_ACCESS_KEY!;
    const secretKey = process.env.UPBIT_OPEN_API_SECRET_KEY!;

    this.upbit = new UpbitAPI(accessKey, secretKey);
    this.strategy = new TradingStrategy();
    this.market = market;
    this.tradeAmount = tradeAmount;
  }

  // 봇 시작
  async start(interval: number = 60000) {
    console.log('🤖 자동 매매 봇 시작');
    console.log(`📈 마켓: ${this.market}`);
    console.log(`💰 거래 금액: ${this.tradeAmount}원`);
    console.log(`⏱️  체크 간격: ${interval / 1000}초\n`);

    this.isRunning = true;

    while (this.isRunning) {
      try {
        await this.checkAndTrade();
        await this.sleep(interval);
      } catch (error) {
        console.error('❌ 오류 발생:', error);
        await this.sleep(interval);
      }
    }
  }

  // 매매 체크 및 실행
  private async checkAndTrade() {
    const now = new Date().toLocaleString('ko-KR');
    console.log(`\n⏰ [${now}] 시장 체크 중...`);

    // 현재가 조회
    const currentPrice = await this.upbit.getCurrentPrice(this.market);
    console.log(`💵 현재가: ${currentPrice.toLocaleString()}원`);

    // 캔들 데이터 조회 (최근 200개)
    const candles = await this.upbit.getCandles(this.market, 5, 200);

    // 잔고 조회
    const krwBalance = await this.upbit.getKRWBalance();
    const currency = this.market.split('-')[1]; // BTC, ETH 등
    const coinBalance = await this.upbit.getCoinBalance(currency);

    console.log(`💰 KRW 잔고: ${krwBalance.toLocaleString()}원`);
    console.log(`🪙 ${currency} 보유량: ${coinBalance}`);

    // 매수 신호 체크
    if (this.strategy.shouldBuy(candles)) {
      if (krwBalance >= this.tradeAmount) {
        await this.upbit.buy(this.market, this.tradeAmount);
      } else {
        console.log('⚠️  잔고 부족으로 매수 불가');
      }
    }
    // 매도 신호 체크
    else if (this.strategy.shouldSell(candles)) {
      if (coinBalance > 0) {
        await this.upbit.sell(this.market, coinBalance);
      } else {
        console.log('⚠️  보유 코인 없음');
      }
    } else {
      console.log('⏸️  대기 중 (신호 없음)');
    }
  }

  // 봇 중지
  stop() {
    console.log('\n🛑 봇 중지');
    this.isRunning = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
