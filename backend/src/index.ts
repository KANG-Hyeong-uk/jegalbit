import 'dotenv/config';
import { TradingBot } from './bot';

// 봇 설정
const MARKET = process.env.MARKET || 'KRW-BTC';
const TRADE_AMOUNT = parseInt(process.env.TRADE_AMOUNT || '5000');
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60000');

// 봇 생성 및 실행
const bot = new TradingBot(MARKET, TRADE_AMOUNT);

// Ctrl+C로 종료 시 처리
process.on('SIGINT', () => {
  bot.stop();
  process.exit(0);
});

// 봇 시작
bot.start(CHECK_INTERVAL);
