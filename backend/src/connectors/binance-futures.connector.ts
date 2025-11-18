import { BaseExchangeConnector, OrderSide } from './base-exchange.connector';
import ccxt from 'ccxt';

/**
 * Binance Futures Connector
 * 
 * Specialized connector for Binance USDⓈ-M Futures (perpetual contracts)
 * Used for funding rate arbitrage and futures trading
 */
export class BinanceFuturesConnector extends BaseExchangeConnector {
  private client: ccxt.binance;
  public exchangeName = 'BINANCE';

  constructor(
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string
  ) {
    super();
    
    // Initialize Binance futures client via CCXT
    this.client = new ccxt.binance({
      apiKey,
      secret: apiSecret,
      enableRateLimit: true,
      options: {
        defaultType: 'future',  // Use USDⓈ-M Futures
        adjustForTimeDifference: true,
      },
    });

    if (testnet) {
      // Binance futures testnet
      this.client.setSandboxMode(true);
    }

    console.log(`[BinanceFutures] Connector initialized (testnet: ${testnet})`);
  }

  async initialize(): Promise<void> {
    try {
      // Load markets to cache symbol information
      await this.client.loadMarkets();
      // console.log('[BinanceFutures] Markets loaded successfully');
    } catch (error: any) {
      console.error('[BinanceFutures] Failed to load markets:', error.message);
      throw error;
    }
  }

  async getBalance(): Promise<any> {
    try {
      const balance = await this.client.fetchBalance();
      return balance;
    } catch (error: any) {
      console.error('[BinanceFutures] Error fetching balance:', error.message);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.client.fetchTicker(symbol);
      return ticker.last || ticker.close || 0;
    } catch (error: any) {
      console.error(`[BinanceFutures] Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }

  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    reduceOnly: boolean = false
  ): Promise<any> {
    try {
      const orderSide = side === 'Buy' ? 'buy' : 'sell';
      
      const params: any = {};
      if (reduceOnly) {
        params.reduceOnly = true;
      }

      const order = await this.client.createOrder(
        symbol,
        'market',
        orderSide,
        quantity,
        undefined,
        params
      );

      console.log(`[BinanceFutures] Market order placed:`, {
        symbol,
        side: orderSide,
        quantity,
        orderId: order.id,
      });

      return order;
    } catch (error: any) {
      console.error(`[BinanceFutures] Error placing market order:`, error.message);
      throw error;
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      await this.client.setLeverage(leverage, symbol);
      console.log(`[BinanceFutures] Leverage set to ${leverage}x for ${symbol}`);
    } catch (error: any) {
      console.error(`[BinanceFutures] Error setting leverage:`, error.message);
      throw error;
    }
  }

  async getPositions(symbol?: string): Promise<any[]> {
    try {
      const positions = await this.client.fetchPositions(symbol ? [symbol] : undefined);
      return positions.filter((p: any) => parseFloat(p.contracts) !== 0);
    } catch (error: any) {
      console.error('[BinanceFutures] Error fetching positions:', error.message);
      throw error;
    }
  }

  async getFundingRate(symbol: string): Promise<{ rate: number; nextFundingTime: number }> {
    try {
      const fundingRate = await this.client.fetchFundingRate(symbol);
      
      return {
        rate: fundingRate.fundingRate || 0,
        nextFundingTime: fundingRate.fundingTimestamp || Date.now() + 8 * 60 * 60 * 1000,
      };
    } catch (error: any) {
      console.error(`[BinanceFutures] Error fetching funding rate for ${symbol}:`, error.message);
      throw error;
    }
  }

  async closePosition(symbol: string, positionSize?: number): Promise<any> {
    try {
      const positions = await this.getPositions(symbol);
      
      if (positions.length === 0) {
        console.log(`[BinanceFutures] No position found for ${symbol}`);
        return null;
      }

      const position = positions[0];
      const size = positionSize || Math.abs(parseFloat(position.contracts));
      const side = position.side === 'long' ? 'sell' : 'buy';

      return await this.placeMarketOrder(symbol, side === 'sell' ? 'Sell' : 'Buy', size, true);
    } catch (error: any) {
      console.error(`[BinanceFutures] Error closing position:`, error.message);
      throw error;
    }
  }
}
