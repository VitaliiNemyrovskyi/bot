import * as crypto from 'crypto';

/**
 * KuCoin API Service
 *
 * Handles direct communication with KuCoin REST API
 * Implements proper authentication with KC-API-SIGN, KC-API-PASSPHRASE, etc.
 */

export interface KuCoinConfig {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  enableRateLimit?: boolean;
  userId?: string;
  credentialId?: string;
}

export class KuCoinService {
  private apiKey: string;
  private apiSecret: string;
  private passphrase: string;
  private baseUrl: string = 'https://api.kucoin.com';
  private userId?: string;
  private credentialId?: string;

  constructor(config: KuCoinConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.passphrase = config.passphrase;
    this.userId = config.userId;
    this.credentialId = config.credentialId;
  }

  /**
   * Generate authentication headers for KuCoin API
   * Supports both v1 (plaintext passphrase) and v2 (encrypted passphrase)
   */
  private generateAuthHeaders(
    method: string,
    endpoint: string,
    timestamp: number,
    body?: string,
    useV2: boolean = true
  ): Record<string, string> {
    const bodyStr = body || '';
    const strToSign = `${timestamp}${method.toUpperCase()}${endpoint}${bodyStr}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(strToSign)
      .digest('base64');

    // For API v2: encrypt passphrase with HMAC-SHA256
    // For API v1: use plaintext passphrase
    const passphraseValue = useV2
      ? crypto.createHmac('sha256', this.apiSecret).update(this.passphrase).digest('base64')
      : this.passphrase;

    const headers: Record<string, string> = {
      'KC-API-KEY': this.apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp.toString(),
      'KC-API-PASSPHRASE': passphraseValue,
      'Content-Type': 'application/json',
    };

    // Only add version header for v2
    if (useV2) {
      headers['KC-API-KEY-VERSION'] = '2';
    }

    return headers;
  }

  /**
   * Make authenticated request to KuCoin API
   * Automatically tries both v1 and v2 authentication if first attempt fails with passphrase error
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    body?: any,
    useV2: boolean = true
  ): Promise<any> {
    const timestamp = Date.now();
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = this.generateAuthHeaders(method, endpoint, timestamp, bodyStr, useV2);

    const url = `${this.baseUrl}${endpoint}`;

    console.log(`[KuCoin] ${method} ${url} (API v${useV2 ? '2' : '1'})`);

    try {
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        body: body ? bodyStr : undefined,
      });

      const data = await response.json();

      // KuCoin API returns { code: '200000', data: {...} } for success
      if (data.code !== '200000') {
        const errorMessage = data.msg || data.message || 'Unknown error';

        // If passphrase error and we tried v2, retry with v1
        if ((data.code === '400002' || errorMessage.includes('passphrase')) && useV2) {
          console.log(`[KuCoin] Passphrase error with v2, retrying with v1...`);
          return this.makeRequest(method, endpoint, body, false);
        }

        console.error(`[KuCoin] API error:`, {
          code: data.code,
          message: errorMessage,
          endpoint,
        });
        throw new Error(`KuCoin API error (${data.code}): ${errorMessage}`);
      }

      return data.data;
    } catch (error: any) {
      // If it's a network error and we haven't tried v1 yet, try v1
      if (error.message.includes('passphrase') && useV2) {
        console.log(`[KuCoin] Retrying with API v1...`);
        return this.makeRequest(method, endpoint, body, false);
      }

      console.error(`[KuCoin] Request failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get account information (spot account)
   */
  async getAccountInfo(): Promise<any> {
    return this.makeRequest('GET', '/api/v1/accounts');
  }

  /**
   * Get spot account balance
   */
  async getSpotBalance(): Promise<any> {
    const accounts = await this.makeRequest('GET', '/api/v1/accounts');

    // KuCoin returns array of accounts (main, trade, margin)
    // Filter for 'trade' type accounts (spot trading balance)
    const tradeAccounts = accounts.filter((acc: any) => acc.type === 'trade');

    const balance: any = {
      total: {},
      free: {},
      used: {},
    };

    tradeAccounts.forEach((acc: any) => {
      const currency = acc.currency;
      const available = parseFloat(acc.available || '0');
      const holds = parseFloat(acc.holds || '0');
      const total = available + holds;

      balance.free[currency] = available;
      balance.used[currency] = holds;
      balance.total[currency] = total;
    });

    return balance;
  }

  /**
   * Get ticker information for a symbol
   */
  async getTicker(symbol: string): Promise<any> {
    // KuCoin uses hyphen format: BTC-USDT
    const kucoinSymbol = symbol.replace('/', '-');
    return this.makeRequest('GET', `/api/v1/market/orderbook/level1?symbol=${kucoinSymbol}`);
  }

  /**
   * Place a spot order
   */
  async placeOrder(params: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    size?: string; // Quantity (for market buy, use 'funds')
    funds?: string; // Amount in quote currency (for market buy orders)
    price?: string; // Price (for limit orders)
    clientOid?: string; // Client order ID
  }): Promise<any> {
    // KuCoin uses hyphen format: BTC-USDT
    const kucoinSymbol = params.symbol.replace('/', '-');

    const orderBody: any = {
      clientOid: params.clientOid || crypto.randomUUID(),
      side: params.side,
      symbol: kucoinSymbol,
      type: params.type,
    };

    if (params.size) {
      orderBody.size = params.size;
    }

    if (params.funds) {
      orderBody.funds = params.funds;
    }

    if (params.price) {
      orderBody.price = params.price;
    }

    return this.makeRequest('POST', '/api/v1/orders', orderBody);
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<any> {
    return this.makeRequest('GET', `/api/v1/orders/${orderId}`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<any> {
    return this.makeRequest('DELETE', `/api/v1/orders/${orderId}`);
  }

  /**
   * Get symbol information
   */
  async getSymbolInfo(symbol: string): Promise<any> {
    const kucoinSymbol = symbol.replace('/', '-');
    const symbols = await this.makeRequest('GET', '/api/v1/symbols');
    return symbols.find((s: any) => s.symbol === kucoinSymbol);
  }
}
