import { BaseExchangeConnector, OrderSide } from '../connectors/base-exchange.connector';
import { PositionCloseStrategy, CloseOptions, CloseResult } from './position-close-strategy';

/**
 * Ultra-Fast WebSocket Strategy
 *
 * Optimized for exchanges with full WebSocket support (Bybit)
 *
 * Timeline:
 * - T+0ms: Get prices from WS streams (instant, already cached)
 * - T+50ms: Place limit orders via WebSocket
 * - T+2000ms: Orders filled (monitored via WS)
 * - T+3000ms: Fallback to market if not filled
 *
 * Expected close time: 2-4 seconds
 * Fee structure: 80-90% maker, 10-20% taker (fallback)
 */
export class UltraFastWebSocketStrategy extends PositionCloseStrategy {
  readonly name = 'Ultra-Fast WebSocket';
  readonly avgCloseTime = 3000; // 3 seconds average

  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private wsInitialized = false;

  /**
   * Check if strategy is supported
   */
  isSupported(): boolean {
    const primaryHasWS = (this.primaryExchange as any).wsClient !== undefined;
    const hedgeHasWS = (this.hedgeExchange as any).wsClient !== undefined;

    return primaryHasWS && hedgeHasWS;
  }

  /**
   * Initialize WebSocket price streams
   */
  private async initializeWebSocketStreams(symbols: string[]): Promise<void> {
    if (this.wsInitialized) {
      return;
    }

    console.log('[UltraFast] Initializing WebSocket price streams...');
    const startTime = Date.now();

    try {
      // Start price streams for both symbols
      await Promise.all([
        this.startPriceStream(this.primaryExchange, symbols[0]),
        this.startPriceStream(this.hedgeExchange, symbols[1]),
      ]);

      this.wsInitialized = true;
      console.log(`[UltraFast] ✓ WS streams initialized in ${Date.now() - startTime}ms`);
    } catch (error: any) {
      console.error(`[UltraFast] Failed to initialize WS streams: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start price stream for a symbol
   */
  private async startPriceStream(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<void> {
    const exchangeName = connector.exchangeName.toUpperCase();

    if (exchangeName.includes('BYBIT')) {
      await this.startBybitPriceStream(connector, symbol);
    } else {
      console.warn(`[UltraFast] Price stream not supported for ${exchangeName}`);
    }
  }

  /**
   * Start Bybit price stream
   */
  private async startBybitPriceStream(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<void> {
    const bybit = connector as any;
    const wsClient = bybit.wsClient;

    if (!wsClient) {
      throw new Error('Bybit WebSocket client not available');
    }

    // Subscribe to ticker updates
    wsClient.subscribeV5('tickers.linear', symbol, (data: any) => {
      if (data.topic === `tickers.linear.${symbol}`) {
        const price = parseFloat(data.data.lastPrice);
        this.priceCache.set(symbol, {
          price,
          timestamp: Date.now(),
        });
      }
    });

    // Initial price fetch
    const position = await connector.getPosition(symbol);
    const initialPrice = parseFloat(position.markPrice || position.lastPrice || '0');

    if (initialPrice > 0) {
      this.priceCache.set(symbol, {
        price: initialPrice,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get price from WebSocket stream (instant, no API call)
   */
  private async getPriceFromStream(symbol: string): Promise<number> {
    const cached = this.priceCache.get(symbol);

    // Use cached price if recent (< 2 seconds old)
    if (cached && Date.now() - cached.timestamp < 2000) {
      return cached.price;
    }

    // Wait for next WS update (with timeout)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for price update for ${symbol}`));
      }, 3000);

      const checkInterval = setInterval(() => {
        const latest = this.priceCache.get(symbol);
        if (latest && Date.now() - latest.timestamp < 1000) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve(latest.price);
        }
      }, 100);
    });
  }

  /**
   * Place order via WebSocket
   */
  private async placeOrderViaWS(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    const exchangeName = connector.exchangeName.toUpperCase();

    if (exchangeName.includes('BYBIT')) {
      return this.placeBybitOrderViaWS(connector, symbol, side, quantity, price);
    }

    throw new Error(`WS orders not supported for ${exchangeName}`);
  }

  /**
   * Place Bybit order via WebSocket
   */
  private async placeBybitOrderViaWS(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    const bybit = connector as any;
    const wsClient = bybit.wsClient;

    if (!wsClient || !wsClient.submitOrder) {
      console.warn('[UltraFast] Bybit WS order submission not available, using REST');
      // Fallback to REST API
      const connectorWithLimit = connector as any;
      if (typeof connectorWithLimit.placeLimitOrder === 'function') {
        return connectorWithLimit.placeLimitOrder(symbol, side, quantity, price, { reduceOnly: true });
      }
      // If placeLimitOrder not available, throw error
      throw new Error('Neither WebSocket nor REST API limit orders are available');
    }

    // Submit order via WebSocket
    return wsClient.submitOrder({
      category: 'linear',
      symbol,
      side: side === 'Buy' ? 'Buy' : 'Sell',
      orderType: 'Limit',
      qty: quantity.toString(),
      price: price.toFixed(2),
      reduceOnly: true,
      timeInForce: 'PostOnly', // Maker-only
    });
  }

  /**
   * Monitor order execution via WebSocket
   */
  private async waitForOrderFill(
    connector: BaseExchangeConnector,
    orderId: string,
    timeout: number = 3000
  ): Promise<boolean> {
    const bybit = connector as any;
    const wsClient = bybit.wsClient;

    if (!wsClient) {
      return false;
    }

    return new Promise((resolve) => {
      const timeoutHandle = setTimeout(() => {
        wsClient.unsubscribe(`order`);
        resolve(false);
      }, timeout);

      wsClient.subscribeV5('order', (data: any) => {
        if (data.data && data.data.some((order: any) =>
          order.orderId === orderId && order.orderStatus === 'Filled'
        )) {
          clearTimeout(timeoutHandle);
          wsClient.unsubscribe(`order`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Close positions using Ultra-Fast WebSocket strategy
   */
  async closePositions(options: CloseOptions): Promise<CloseResult> {
    const startTime = Date.now();
    console.log('[UltraFast] Starting ultra-fast close...');

    const {
      primarySymbol,
      hedgeSymbol,
      primarySide,
      hedgeSide,
      primaryQuantity,
      hedgeQuantity,
      maxWaitTime = 3000,
      aggressiveMargin = 0.0005,
    } = options;

    try {
      // STEP 1: Initialize WS streams if needed
      await this.initializeWebSocketStreams([primarySymbol, hedgeSymbol]);

      // STEP 2: Get prices from WS streams (instant!)
      const [primaryPrice, hedgePrice] = await Promise.all([
        this.getPriceFromStream(primarySymbol),
        this.getPriceFromStream(hedgeSymbol),
      ]);

      console.log(`[UltraFast] Prices from WS: ${Date.now() - startTime}ms`, {
        primary: primaryPrice,
        hedge: hedgePrice,
      });

      // STEP 3: Calculate aggressive limit prices
      const primaryLimitPrice = this.calculateAggressivePrice(primaryPrice, primarySide, aggressiveMargin);
      const hedgeLimitPrice = this.calculateAggressivePrice(hedgePrice, hedgeSide, aggressiveMargin);

      console.log('[UltraFast] Placing limit orders via WebSocket...');

      // STEP 4: Place orders via WebSocket (fastest)
      const [primaryOrder, hedgeOrder] = await Promise.all([
        this.placeOrderViaWS(this.primaryExchange, primarySymbol, primarySide, primaryQuantity, primaryLimitPrice),
        this.placeOrderViaWS(this.hedgeExchange, hedgeSymbol, hedgeSide, hedgeQuantity, hedgeLimitPrice),
      ]);

      console.log(`[UltraFast] Orders placed: ${Date.now() - startTime}ms`);

      // STEP 5: Monitor fills via WebSocket
      const [primaryFilled, hedgeFilled] = await Promise.all([
        this.waitForOrderFill(this.primaryExchange, primaryOrder.orderId, maxWaitTime),
        this.waitForOrderFill(this.hedgeExchange, hedgeOrder.orderId, maxWaitTime),
      ]);

      // STEP 6: Handle unfilled orders with market fallback
      if (!primaryFilled || !hedgeFilled) {
        console.warn(`[UltraFast] Limit orders timeout at ${Date.now() - startTime}ms, using market fallback`);

        // Cancel unfilled limit orders
        await Promise.allSettled([
          !primaryFilled ? this.cancelOrder(this.primaryExchange, primaryOrder.orderId) : null,
          !hedgeFilled ? this.cancelOrder(this.hedgeExchange, hedgeOrder.orderId) : null,
        ]);

        // Close with market orders
        await Promise.all([
          !primaryFilled ? this.forceClosePosition(
            this.primaryExchange,
            primarySymbol,
            primarySide,
            primaryQuantity,
            this.primaryExchange.exchangeName
          ) : null,
          !hedgeFilled ? this.forceClosePosition(
            this.hedgeExchange,
            hedgeSymbol,
            hedgeSide,
            hedgeQuantity,
            this.hedgeExchange.exchangeName
          ) : null,
        ]);
      }

      const closeTime = Date.now() - startTime;
      console.log(`[UltraFast] ✓ COMPLETE in ${closeTime}ms`);

      return {
        success: true,
        primaryClosed: true,
        hedgeClosed: true,
        primaryExitPrice: primaryFilled ? primaryLimitPrice : primaryPrice,
        hedgeExitPrice: hedgeFilled ? hedgeLimitPrice : hedgePrice,
        closeTime,
        strategy: this.name,
        primaryFeeType: primaryFilled ? 'maker' : 'taker',
        hedgeFeeType: hedgeFilled ? 'maker' : 'taker',
      };

    } catch (error: any) {
      console.error(`[UltraFast] Error: ${error.message}`);

      // Emergency fallback: force close with market orders
      console.log('[UltraFast] Emergency market close fallback...');

      try {
        await Promise.all([
          this.forceClosePosition(
            this.primaryExchange,
            primarySymbol,
            primarySide,
            primaryQuantity,
            this.primaryExchange.exchangeName
          ),
          this.forceClosePosition(
            this.hedgeExchange,
            hedgeSymbol,
            hedgeSide,
            hedgeQuantity,
            this.hedgeExchange.exchangeName
          ),
        ]);

        return {
          success: true,
          primaryClosed: true,
          hedgeClosed: true,
          primaryExitPrice: 0, // Will be fetched separately
          hedgeExitPrice: 0,
          closeTime: Date.now() - startTime,
          strategy: `${this.name} (emergency fallback)`,
          primaryFeeType: 'taker',
          hedgeFeeType: 'taker',
          error: error.message,
        };
      } catch (fallbackError: any) {
        return {
          success: false,
          primaryClosed: false,
          hedgeClosed: false,
          primaryExitPrice: 0,
          hedgeExitPrice: 0,
          closeTime: Date.now() - startTime,
          strategy: this.name,
          primaryFeeType: 'taker',
          hedgeFeeType: 'taker',
          error: `Strategy failed: ${error.message}. Fallback failed: ${fallbackError.message}`,
        };
      }
    }
  }

  /**
   * Cancel order
   */
  private async cancelOrder(connector: BaseExchangeConnector, orderId: string): Promise<void> {
    try {
      const connectorWithCancel = connector as any;
      if (typeof connectorWithCancel.cancelOrder === 'function') {
        await connectorWithCancel.cancelOrder(orderId);
      }
    } catch (error: any) {
      console.warn(`[UltraFast] Failed to cancel order ${orderId}: ${error.message}`);
    }
  }
}
