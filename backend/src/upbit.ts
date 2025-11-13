import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'https://api.upbit.com';

export class UpbitAPI {
  private accessKey: string;
  private secretKey: string;

  constructor(accessKey: string, secretKey: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  // JWT 토큰 생성
  private generateToken(queryString?: string): string {
    const payload: any = {
      access_key: this.accessKey,
      nonce: uuidv4(),
    };

    if (queryString) {
      const hash = crypto.createHash('sha512');
      hash.update(queryString);
      payload.query_hash = hash.digest('hex');
      payload.query_hash_alg = 'SHA512';
    }

    return jwt.sign(payload, this.secretKey);
  }

  // 현재가 조회
  async getCurrentPrice(market: string): Promise<number> {
    const response = await axios.get(`${BASE_URL}/v1/ticker`, {
      params: { markets: market }
    });
    return response.data[0].trade_price;
  }

  // 분봉 데이터 조회
  async getCandles(market: string, unit: number = 1, count: number = 200) {
    const response = await axios.get(`${BASE_URL}/v1/candles/minutes/${unit}`, {
      params: { market, count }
    });
    return response.data;
  }

  // 계정 잔고 조회
  async getBalance() {
    const token = this.generateToken();
    const response = await axios.get(`${BASE_URL}/v1/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // 매수 (시장가)
  async buy(market: string, amount: number) {
    const params = {
      market,
      side: 'bid',
      price: amount.toString(),
      ord_type: 'price'
    };

    const queryString = new URLSearchParams(params as any).toString();
    const token = this.generateToken(queryString);

    const response = await axios.post(`${BASE_URL}/v1/orders`, params, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 매수 완료: ${market}, 금액: ${amount}원`);
    return response.data;
  }

  // 매도 (시장가)
  async sell(market: string, volume: number) {
    const params = {
      market,
      side: 'ask',
      volume: volume.toString(),
      ord_type: 'market'
    };

    const queryString = new URLSearchParams(params as any).toString();
    const token = this.generateToken(queryString);

    const response = await axios.post(`${BASE_URL}/v1/orders`, params, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 매도 완료: ${market}, 수량: ${volume}`);
    return response.data;
  }

  // 보유 코인 수량 조회
  async getCoinBalance(currency: string): Promise<number> {
    const accounts = await this.getBalance();
    const account = accounts.find((acc: any) => acc.currency === currency);
    return account ? parseFloat(account.balance) : 0;
  }

  // KRW 잔고 조회
  async getKRWBalance(): Promise<number> {
    const accounts = await this.getBalance();
    const krw = accounts.find((acc: any) => acc.currency === 'KRW');
    return krw ? parseFloat(krw.balance) : 0;
  }
}
