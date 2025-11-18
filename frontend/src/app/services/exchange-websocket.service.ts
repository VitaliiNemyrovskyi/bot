import { Injectable } from '@angular/core';
import * as pako from 'pako';

export interface WebSocketData {
  price: number;
  fundingRate?: number;
  nextFundingTime?: number;
  fundingInterval?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeWebSocketService {
  private connections = new Map<string, WebSocket>();
  private pingIntervals = new Map<string, any>();
  private kucoinToken: string | null = null;
  private kucoinEndpoint: string | null = null;

  constructor() { }

  /**
   * Connect to exchange WebSocket
   */
  connect(
    exchange: string,
    symbol: string,
    onUpdate: (data: WebSocketData) => void,
    onError?: (error: any) => void
  ): () => void {
    const key = `${exchange}-${symbol}`;

    // If already connected, return disconnect function
    if (this.connections.has(key)) {
      return () => this.disconnect(key);
    }

    let ws: WebSocket | null = null;
    let wsUrl = '';
    let subscribeMessage: any = null;

    switch (exchange) {
      case 'BYBIT':
        wsUrl = 'wss://stream.bybit.com/v5/public/linear';
        subscribeMessage = {
          op: 'subscribe',
          args: [`tickers.${symbol}`]
        };
        break;

      case 'BINANCE':
        wsUrl = `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@markPrice@1s`;
        subscribeMessage = null;
        break;

      case 'BINGX':
        const bingxSymbol = this.normalizeSymbolForBingX(symbol);
        wsUrl = 'wss://open-api-swap.bingx.com/swap-market';
        subscribeMessage = {
          id: Date.now().toString(),
          reqType: 'sub',
          dataType: `${bingxSymbol}@ticker`
        };
        break;

      case 'MEXC':
        const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT').replace(/USDC$/, '_USDC');
        wsUrl = 'wss://contract.mexc.com/edge';
        subscribeMessage = {
          method: 'sub.ticker',
          param: {
            symbol: mexcSymbol
          }
        };
        break;

      case 'OKX':
        wsUrl = 'wss://ws.okx.com:8443/ws/v5/public';
        subscribeMessage = {
          op: 'subscribe',
          args: [{
            channel: 'tickers',
            instId: symbol
          }]
        };
        break;

      case 'BITGET':
        wsUrl = 'wss://ws.bitget.com/v2/ws/public';
        subscribeMessage = {
          op: 'subscribe',
          args: [{
            instType: 'USDT-FUTURES',
            channel: 'ticker',
            instId: symbol
          }]
        };
        break;

      case 'GATEIO':
        const gateioSymbol = symbol.includes('_') ? symbol : symbol.replace('USDT', '_USDT');
        wsUrl = 'wss://fx-ws.gateio.ws/v4/ws/usdt';
        subscribeMessage = {
          time: Math.floor(Date.now() / 1000),
          channel: 'futures.tickers',
          event: 'subscribe',
          payload: [gateioSymbol]
        };
        break;

      case 'KUCOIN':
        // KuCoin requires token - handle asynchronously
        this.connectKuCoin(key, symbol, onUpdate, onError);
        return () => this.disconnect(key);

      default:
        console.warn(`[WebSocket] Unsupported exchange: ${exchange}`);
        return () => {};
    }

    // Create WebSocket connection
    ws = new WebSocket(wsUrl);
    this.connections.set(key, ws);

    ws.onopen = () => {
      console.log(`[WebSocket] ${exchange} connected for ${symbol}`);
      if (ws && subscribeMessage) {
        ws.send(JSON.stringify(subscribeMessage));
      }

      // Setup ping for exchanges that require it
      if (exchange === 'MEXC') {
        const pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'ping' }));
          }
        }, 15000);
        this.pingIntervals.set(key, pingInterval);
      } else if (exchange === 'BITGET') {
        const pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
        this.pingIntervals.set(key, pingInterval);
      } else if (exchange === 'GATEIO') {
        const pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              time: Math.floor(Date.now() / 1000),
              channel: 'futures.ping'
            }));
          }
        }, 10000);
        this.pingIntervals.set(key, pingInterval);
      }
    };

    ws.onmessage = async (event) => {
      try {
        let messageData: string;

        // Handle Blob data (BingX sends gzip-compressed Blob)
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          try {
            const decompressed = pako.inflate(uint8Array, { to: 'string' });
            messageData = decompressed;
          } catch {
            // If decompression fails, try as plain text
            messageData = new TextDecoder().decode(uint8Array);
          }
        } else {
          messageData = event.data;
        }

        const data = JSON.parse(messageData);

        // Parse based on exchange format
        const parsed = this.parseMessage(exchange, data);
        if (parsed) {
          onUpdate(parsed);
        }
      } catch (error) {
        console.error(`[WebSocket] ${exchange} parse error:`, error);
        if (onError) onError(error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WebSocket] ${exchange} error:`, error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log(`[WebSocket] ${exchange} closed for ${symbol}`);
      this.disconnect(key);
    };

    // Return disconnect function
    return () => this.disconnect(key);
  }

  /**
   * Parse WebSocket message based on exchange
   */
  private parseMessage(exchange: string, data: any): WebSocketData | null {
    try {
      switch (exchange) {
        case 'BYBIT':
          if (data.topic && data.topic.startsWith('tickers.') && data.data) {
            const ticker = data.data;
            return {
              price: parseFloat(ticker.lastPrice || ticker.markPrice || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined,
              nextFundingTime: ticker.nextFundingTime ? parseInt(ticker.nextFundingTime) : undefined
            };
          }
          break;

        case 'BINANCE':
          if (data.e === 'markPriceUpdate') {
            return {
              price: parseFloat(data.p || '0'),
              fundingRate: data.r ? parseFloat(data.r) : undefined,
              nextFundingTime: data.T ? parseInt(data.T) : undefined
            };
          }
          break;

        case 'BINGX':
          if (data.dataType && data.dataType.includes('@ticker') && data.data) {
            const ticker = data.data;
            return {
              price: parseFloat(ticker.lastPrice || ticker.c || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined
            };
          }
          break;

        case 'MEXC':
          if (data.channel === 'push.ticker' && data.data) {
            const ticker = data.data;
            return {
              price: parseFloat(ticker.lastPrice || ticker.last || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined
            };
          }
          break;

        case 'OKX':
          if (data.arg && data.arg.channel === 'tickers' && data.data && data.data.length > 0) {
            const ticker = data.data[0];
            return {
              price: parseFloat(ticker.last || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined,
              nextFundingTime: ticker.nextFundingTime ? parseInt(ticker.nextFundingTime) : undefined
            };
          }
          break;

        case 'BITGET':
          if (data.action === 'snapshot' && data.arg && data.arg.channel === 'ticker' && data.data && data.data.length > 0) {
            const ticker = data.data[0];
            return {
              price: parseFloat(ticker.last || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined
            };
          }
          break;

        case 'GATEIO':
          if (data.channel === 'futures.tickers' && data.event === 'update' && data.result && data.result.length > 0) {
            const ticker = data.result[0];
            return {
              price: parseFloat(ticker.last || '0'),
              fundingRate: ticker.funding_rate ? parseFloat(ticker.funding_rate) : undefined,
              nextFundingTime: ticker.funding_next_apply ? parseInt(ticker.funding_next_apply) * 1000 : undefined
            };
          }
          break;

        case 'KUCOIN':
          if (data.type === 'message' && data.topic && data.topic.startsWith('/contractMarket/ticker:') && data.data) {
            const ticker = data.data;
            return {
              price: parseFloat(ticker.price || '0'),
              fundingRate: ticker.fundingRate ? parseFloat(ticker.fundingRate) : undefined,
              nextFundingTime: ticker.nextFundingTime ? parseInt(ticker.nextFundingTime) : undefined
            };
          }
          break;
      }
    } catch (error) {
      console.error(`[WebSocket] Parse error for ${exchange}:`, error);
    }

    return null;
  }

  /**
   * Disconnect WebSocket
   */
  private disconnect(key: string): void {
    const ws = this.connections.get(key);
    if (ws) {
      ws.close();
      this.connections.delete(key);
    }

    const interval = this.pingIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(key);
    }
  }

  /**
   * Disconnect all WebSockets
   */
  disconnectAll(): void {
    for (const key of this.connections.keys()) {
      this.disconnect(key);
    }
  }

  /**
   * Normalize symbol for BingX (e.g., BTCUSDT -> BTC-USDT)
   */
  private normalizeSymbolForBingX(symbol: string): string {
    let cleanSymbol = symbol.replace(/:.*$/, '').replace(/\//g, '');

    if (cleanSymbol.includes('-')) {
      return cleanSymbol;
    }

    if (cleanSymbol.endsWith('USDT')) {
      const base = cleanSymbol.slice(0, -4);
      return `${base}-USDT`;
    }

    if (cleanSymbol.endsWith('USDC')) {
      const base = cleanSymbol.slice(0, -4);
      return `${base}-USDC`;
    }

    return cleanSymbol;
  }

  /**
   * Get KuCoin WebSocket token
   */
  private async getKuCoinToken(): Promise<{ token: string; endpoint: string }> {
    const response = await fetch('https://api-futures.kucoin.com/api/v1/bullet-public', {
      method: 'POST',
    });

    const data = await response.json();

    if (data.code !== '200000' || !data.data) {
      throw new Error('Failed to get KuCoin WebSocket token');
    }

    const server = data.data.instanceServers[0];

    return {
      token: data.data.token,
      endpoint: server.endpoint
    };
  }

  /**
   * Connect to KuCoin WebSocket (requires token)
   */
  private async connectKuCoin(
    key: string,
    symbol: string,
    onUpdate: (data: WebSocketData) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      // Get token if we don't have one
      if (!this.kucoinToken || !this.kucoinEndpoint) {
        const tokenData = await this.getKuCoinToken();
        this.kucoinToken = tokenData.token;
        this.kucoinEndpoint = tokenData.endpoint;
      }

      // Convert symbol to KuCoin format (BTCUSDT -> XBTUSDTM)
      const kucoinSymbol = this.convertToKuCoinSymbol(symbol);

      const wsUrl = `${this.kucoinEndpoint}?token=${this.kucoinToken}&connectId=${Date.now()}`;
      const ws = new WebSocket(wsUrl);
      this.connections.set(key, ws);

      ws.onopen = () => {
        console.log(`[WebSocket] KuCoin connected for ${symbol}`);

        // Subscribe to ticker
        const subscribeMessage = {
          id: Date.now(),
          type: 'subscribe',
          topic: `/contractMarket/ticker:${kucoinSymbol}`,
          privateChannel: false,
          response: true
        };

        ws.send(JSON.stringify(subscribeMessage));

        // Setup ping (KuCoin requires ping every 20s)
        const pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              id: Date.now(),
              type: 'ping'
            }));
          }
        }, 20000);
        this.pingIntervals.set(key, pingInterval);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const parsed = this.parseMessage('KUCOIN', data);
          if (parsed) {
            onUpdate(parsed);
          }
        } catch (error) {
          console.error(`[WebSocket] KuCoin parse error:`, error);
          if (onError) onError(error);
        }
      };

      ws.onerror = (error) => {
        console.error(`[WebSocket] KuCoin error:`, error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log(`[WebSocket] KuCoin closed for ${symbol}`);
        this.disconnect(key);
      };

    } catch (error) {
      console.error('[WebSocket] Failed to connect to KuCoin:', error);
      if (onError) onError(error);
    }
  }

  /**
   * Convert symbol to KuCoin format
   * Examples: BTC/USDT -> XBTUSDTM, BTCUSDT -> XBTUSDTM, ETH/USDT -> ETHUSDTM
   */
  private convertToKuCoinSymbol(symbol: string): string {
    // Remove slash if present
    symbol = symbol.replace('/', '');

    // Extract base currency
    const base = symbol.replace('USDT', '');

    // KuCoin uses XBT for Bitcoin
    const kucoinBase = base === 'BTC' ? 'XBT' : base;

    // KuCoin perpetuals end with M
    return `${kucoinBase}USDTM`;
  }
}
