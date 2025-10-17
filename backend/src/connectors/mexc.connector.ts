import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { MEXCService } from '@/lib/mexc';

/**
 * MEXC Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for MEXC exchange
 */
export class MEXCConnector extends BaseExchangeConnector {
  private mexcService: MEXCService;
  private apiKey: string;
  private apiSecret: string;
  private authToken?: string;
  private leverageCache: Map<string, number> = new Map(); // Cache leverage per symbol

  constructor(apiKey: string, apiSecret: string, authToken?: string) {
    super();
    this.exchangeName = 'MEXC';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.authToken = authToken;

    this.mexcService = new MEXCService({
      apiKey,
      apiSecret,
      authToken,
      enableRateLimit: true,
    });
  }

  /**
   * Initialize MEXC connection
   */
  async initialize(): Promise<void> {
    console.log(`[MEXCConnector] Initializing MEXC connector...`);

    try {
      // Test connection by fetching account info
      await this.mexcService.getAccountInfo();
      this.isInitialized = true;
      console.log('[MEXCConnector] MEXC connector initialized successfully');
    } catch (error: any) {
      console.error('[MEXCConnector] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize MEXC connector: ${error.message}`);
    }
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    // Get cached leverage for this symbol, default to 1 if not set
    const leverage = this.leverageCache.get(symbol) || 1;

    console.log(`[MEXCConnector] Placing market ${side} order:`, {
      symbol,
      quantity,
      leverage,
      leverageSource: this.leverageCache.has(symbol) ? 'cached' : 'default',
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // Convert BaseExchangeConnector OrderSide to MEXC side
      // MEXC sides: 1: open long, 2: close short, 3: open short, 4: close long
      const mexcSide = side === 'Buy' ? 1 : 3; // Buy = open long, Sell = open short

      const result = await this.mexcService.placeOrder({
        symbol,
        vol: quantity,
        leverage, // Use cached leverage from setLeverage() call
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 5, // Market order
        openType: 2, // Cross margin (default)
      });

      console.log('[MEXCConnector] Market order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error placing market order:', error.message);
      throw error;
    }
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    // Get cached leverage for this symbol, default to 1 if not set
    const leverage = this.leverageCache.get(symbol) || 1;

    console.log(`[MEXCConnector] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
      leverage,
      leverageSource: this.leverageCache.has(symbol) ? 'cached' : 'default',
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // Convert BaseExchangeConnector OrderSide to MEXC side
      const mexcSide = side === 'Buy' ? 1 : 3; // Buy = open long, Sell = open short

      const result = await this.mexcService.placeOrder({
        symbol,
        price,
        vol: quantity,
        leverage, // Use cached leverage from setLeverage() call
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 1, // Limit order
        openType: 2, // Cross margin (default)
      });

      console.log('[MEXCConnector] Limit order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error placing limit order:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[MEXCConnector] Canceling order:`, { orderId, symbol });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const result = await this.mexcService.cancelOrder(symbol, orderId);
      console.log('[MEXCConnector] Order canceled:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error canceling order:', error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const result = await this.mexcService.getBalance();
      console.log('[MEXCConnector] Balance retrieved');
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error getting balance:', error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol
   */
  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const positions = await this.mexcService.getPositions(symbol);
      const position = positions.find((p) => p.symbol === symbol);

      if (!position || parseFloat(position.holdVol) === 0) {
        return {
          symbol,
          positionType: 'None',
          holdVol: '0',
          holdAvgPrice: '0',
          unrealised: '0',
        };
      }

      console.log('[MEXCConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[MEXCConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // MEXC doesn't have a direct endpoint for single order status
      throw new Error('getOrderStatus not yet implemented for MEXC');
    } catch (error: any) {
      console.error('[MEXCConnector] Error getting order status:', error.message);
      throw error;
    }
  }

  /**
   * Close position
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[MEXCConnector] Closing position for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // First check if there's an open position
      const position = await this.getPosition(symbol);

      if (!position || position.positionType === 'None') {
        throw new Error(`No open position for ${symbol}`);
      }

      const result = await this.mexcService.closePosition(
        symbol,
        position.positionId,
        position.positionType
      );

      console.log('[MEXCConnector] Position closed:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error closing position:', error.message);
      throw error;
    }
  }

  /**
   * Place a reduce-only market order
   */
  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[MEXCConnector] Placing reduce-only market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // For MEXC, reduce-only orders are closing orders
      // side 2: close short, side 4: close long
      const mexcSide = side === 'Buy' ? 2 : 4;

      // Get position to get positionId
      const positions = await this.mexcService.getPositions(symbol);
      const position = positions.find((p) => p.symbol === symbol);

      if (!position) {
        throw new Error(`No position found for ${symbol}`);
      }

      const result = await this.mexcService.placeOrder({
        symbol,
        vol: quantity,
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 5, // Market order
        openType: position.openType,
        positionId: position.positionId,
      });

      console.log('[MEXCConnector] Reduce-only order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error placing reduce-only order:', error.message);
      throw error;
    }
  }

  /**
   * Set leverage for a trading symbol
   * IMPORTANT: Leverage must be set BEFORE opening positions
   *
   * @param symbol Trading pair symbol (e.g., "BTC_USDT")
   * @param leverage Leverage multiplier (typically 1-125x)
   * @param openType Margin type: 1: isolated, 2: cross (default: cross)
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    openType: 1 | 2 = 2
  ): Promise<any> {
    console.log(`[MEXCConnector] Setting leverage for ${symbol}:`, {
      leverage,
      openType,
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    // Validate leverage range
    if (leverage < 1 || leverage > 125) {
      throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
    }

    // ALWAYS cache the leverage value first, so it's available for subsequent orders
    // even if the API call fails
    this.leverageCache.set(symbol, leverage);
    console.log(`[MEXCConnector] ✓ Cached leverage ${leverage}x for ${symbol} (will be used in subsequent orders)`);

    try {
      const result = await this.mexcService.setLeverage(symbol, leverage, openType);
      console.log('[MEXCConnector] ✓ Leverage set successfully via API:', result);
      return result;
    } catch (error: any) {
      console.error('[MEXCConnector] Error setting leverage via API:', error.message);

      // Code 600 typically means leverage setting not allowed or already set
      // This is OK - we've cached the leverage and will use it in orders
      if (error.message.includes('600')) {
        console.log(
          `[MEXCConnector] ⚠️ MEXC API rejected leverage change (code 600), but cached value will be used in orders. ` +
          `This usually means leverage is locked or already set to a specific value.`
        );
        // Don't throw error - cached leverage will be used
        return { success: false, cached: true, leverage };
      }

      // Provide helpful error messages for common issues
      if (error.message.includes('position')) {
        throw new Error(
          `Failed to set leverage for ${symbol}: ${error.message}. ` +
          `Note: Leverage cannot be changed when there are open positions. ` +
          `Please close all positions for ${symbol} before changing leverage.`
        );
      }

      // For other errors, still throw but note that cached leverage will be used
      console.log(`[MEXCConnector] Leverage API call failed, but cached value ${leverage}x will be used in subsequent orders`);
      throw new Error(`Failed to set leverage via API for ${symbol}: ${error.message}. Cached value will be used instead.`);
    }
  }

  /**
   * Get current market price for a symbol (REST API)
   * Uses MEXC's ticker endpoint to get the last traded price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    console.log(`[MEXCConnector] Fetching market price for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // MEXC uses getTickers() which returns all tickers
      // We need to filter for our specific symbol
      const tickers = await this.mexcService.getTickers();
      const ticker = tickers.find((t) => t.symbol === symbol);

      if (!ticker) {
        throw new Error(`No ticker data found for ${symbol}`);
      }

      const lastPrice = ticker.lastPrice;

      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid price data for ${symbol}: ${ticker.lastPrice}`);
      }

      console.log(`[MEXCConnector] Current price for ${symbol}: $${lastPrice}`);
      return lastPrice;
    } catch (error: any) {
      console.error(`[MEXCConnector] Error fetching market price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   * Uses MEXC's WebSocket ticker stream
   *
   * MEXC WebSocket endpoint: wss://contract.mexc.com/ws
   * Subscribe format: { "method": "sub.ticker", "param": { "symbol": "BTC_USDT" } }
   * Response format: { "channel": "push.ticker", "data": { "lastPrice": 50000.5, "timestamp": 1234567890 } }
   *
   * @param symbol - Trading pair symbol (e.g., "BTC_USDT")
   * @param callback - Callback function called on each price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[MEXCConnector] Subscribing to price stream for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const { websocketManager } = await import('@/services/websocket-manager.service');

      // MEXC WebSocket configuration
      const wsUrl = 'wss://contract.mexc.com/ws';

      const config = {
        url: wsUrl,
        subscribeMessage: {
          method: 'sub.ticker',
          param: {
            symbol,
          },
        },
        heartbeatInterval: 20000, // 20 seconds
        reconnectDelay: 1000,
        maxReconnectDelay: 30000,
      };

      // Subscribe using WebSocket manager
      const unsubscribe = await websocketManager.subscribe(
        'mexc',
        symbol,
        config,
        (data: any) => {
          try {
            // MEXC WebSocket ticker format:
            // { "channel": "push.ticker", "data": { "lastPrice": 50000.5, "timestamp": 1234567890 }, "symbol": "BTC_USDT" }
            if (data.channel === 'push.ticker' && data.data && data.symbol === symbol) {
              const tickerData = data.data;
              const price = parseFloat(tickerData.lastPrice);
              const timestamp = tickerData.timestamp || Date.now();

              if (!isNaN(price) && price > 0) {
                callback(price, timestamp);
              } else {
                console.warn(`[MEXCConnector] Invalid price in WebSocket update for ${symbol}:`, tickerData.lastPrice);
              }
            }
          } catch (error: any) {
            console.error(`[MEXCConnector] Error processing WebSocket update for ${symbol}:`, error.message);
          }
        }
      );

      console.log(`[MEXCConnector] Successfully subscribed to price stream for ${symbol}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[MEXCConnector] Error subscribing to price stream for ${symbol}:`, error.message);
      throw error;
    }
  }
}
