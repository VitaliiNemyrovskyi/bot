import { BaseExchangeConnector, OrderSide } from '../connectors/base-exchange.connector';
import { PositionCloseStrategy, CloseOptions, CloseResult } from './position-close-strategy';

/**
 * Hybrid WebSocket + REST Strategy
 *
 * Optimized for exchanges with partial WebSocket support (BingX, MEXC, etc.)
 *
 * Timeline:
 * - T+0ms: Get prices via REST API (150-200ms)
 * - T+200ms: Place aggressive limit orders via REST
 * - T+200-5000ms: Monitor fills via WebSocket (if available) or polling
 * - T+5000ms: Fallback to market if not filled
 *
 * Expected close time: 5-8 seconds
 * Fee structure: 70-80% maker, 20-30% taker (fallback)
 */
export class HybridWebSocketStrategy extends PositionCloseStrategy {
  readonly name = 'Hybrid WebSocket + REST';
  readonly avgCloseTime = 6000; // 6 seconds average

  private positionMonitors: Map<string, any> = new Map();

  /**
   * Check if strategy is supported
   */
  isSupported(): boolean {
    // This strategy works with all exchanges
    return true;
  }

  /**
   * Subscribe to position updates via WebSocket (if supported)
   */
  private async subscribeToPositionUpdates(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<boolean> {
    const exchangeName = connector.exchangeName.toUpperCase();

    try {
      if (exchangeName.includes('BYBIT')) {
        return await this.subscribeBybitPosition(connector, symbol);
      } else if (exchangeName.includes('BINGX')) {
        return await this.subscribeBingXPosition(connector, symbol);
      } else if (exchangeName.includes('MEXC')) {
        return await this.subscribeMEXCPosition(connector, symbol);
      }

      return false;
    } catch (error: any) {
      console.warn(`[Hybrid] Failed to subscribe to ${exchangeName} position updates: ${error.message}`);
      return false;
    }
  }

  /**
   * Subscribe to Bybit position updates
   */
  private async subscribeBybitPosition(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<boolean> {
    const bybit = connector as any;
    const wsClient = bybit.wsClient;

    if (!wsClient) {
      return false;
    }

    wsClient.subscribeV5('position', 'linear', (data: any) => {
      if (data.data && Array.isArray(data.data)) {
        for (const position of data.data) {
          if (position.symbol === symbol) {
            const size = Math.abs(parseFloat(position.size || '0'));
            const key = `${connector.exchangeName}_${symbol}`;

            this.positionMonitors.set(key, {
              symbol,
              size,
              timestamp: Date.now(),
              closed: size === 0,
            });
          }
        }
      }
    });

    return true;
  }

  /**
   * Subscribe to BingX position updates
   */
  private async subscribeBingXPosition(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<boolean> {
    // BingX has limited WS support - we'll use polling fallback
    return false;
  }

  /**
   * Subscribe to MEXC position updates
   */
  private async subscribeMEXCPosition(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<boolean> {
    // MEXC has WS for positions but limited - use polling fallback
    return false;
  }

  /**
   * Check if position is closed (via WS or polling)
   */
  private async checkPositionClosed(
    connector: BaseExchangeConnector,
    symbol: string,
    useWebSocket: boolean
  ): Promise<boolean> {
    const key = `${connector.exchangeName}_${symbol}`;

    // Try WebSocket data first (if available and recent)
    if (useWebSocket) {
      const wsData = this.positionMonitors.get(key);
      if (wsData && Date.now() - wsData.timestamp < 2000) {
        return wsData.closed;
      }
    }

    // Fallback to REST API polling
    try {
      const position = await connector.getPosition(symbol);
      const size = Math.abs(parseFloat(position.positionAmt || position.size || '0'));
      return size === 0;
    } catch (error: any) {
      console.warn(`[Hybrid] Error checking position: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for both positions to close with monitoring
   */
  private async waitForPositionsClose(
    primaryConnector: BaseExchangeConnector,
    hedgeConnector: BaseExchangeConnector,
    primarySymbol: string,
    hedgeSymbol: string,
    primaryHasWS: boolean,
    hedgeHasWS: boolean,
    timeout: number
  ): Promise<{ primaryClosed: boolean; hedgeClosed: boolean }> {
    const startTime = Date.now();
    const checkInterval = primaryHasWS || hedgeHasWS ? 500 : 1000; // Check every 0.5s if WS, 1s if polling

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const elapsed = Date.now() - startTime;

        // Check if timeout exceeded
        if (elapsed >= timeout) {
          clearInterval(interval);
          resolve({ primaryClosed: false, hedgeClosed: false });
          return;
        }

        // Check positions
        const [primaryClosed, hedgeClosed] = await Promise.all([
          this.checkPositionClosed(primaryConnector, primarySymbol, primaryHasWS),
          this.checkPositionClosed(hedgeConnector, hedgeSymbol, hedgeHasWS),
        ]);

        // If both closed, resolve immediately
        if (primaryClosed && hedgeClosed) {
          clearInterval(interval);
          console.log(`[Hybrid] Both positions closed in ${elapsed}ms`);
          resolve({ primaryClosed: true, hedgeClosed: true });
          return;
        }

        // Log progress
        if (elapsed % 2000 < checkInterval) {
          console.log(`[Hybrid] Monitoring: primary=${primaryClosed}, hedge=${hedgeClosed} (${elapsed}ms)`);
        }
      }, checkInterval);
    });
  }

  /**
   * Place aggressive limit order via REST
   */
  private async placeAggressiveLimitOrder(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    const exchangeName = connector.exchangeName.toUpperCase();

    try {
      // Try to place limit order with reduceOnly flag
      const connectorWithLimit = connector as any;

      if (typeof connectorWithLimit.placeLimitOrder === 'function') {
        return await connectorWithLimit.placeLimitOrder(
          symbol,
          side,
          quantity,
          price,
          { reduceOnly: true }
        );
      }

      // Fallback to market order if limit not supported
      return await connector.placeMarketOrder(symbol, side, quantity);

    } catch (error: any) {
      console.error(`[Hybrid] Failed to place limit order on ${exchangeName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  private async cancelOrder(
    connector: BaseExchangeConnector,
    orderId: string,
    symbol: string
  ): Promise<void> {
    try {
      const connectorWithCancel = connector as any;
      if (typeof connectorWithCancel.cancelOrder === 'function') {
        await connectorWithCancel.cancelOrder(orderId, symbol);
      }
    } catch (error: any) {
      console.warn(`[Hybrid] Failed to cancel order: ${error.message}`);
    }
  }

  /**
   * Close positions using Hybrid strategy
   */
  async closePositions(options: CloseOptions): Promise<CloseResult> {
    const startTime = Date.now();
    console.log('[Hybrid] Starting hybrid close strategy...');

    const {
      primarySymbol,
      hedgeSymbol,
      primarySide,
      hedgeSide,
      primaryQuantity,
      hedgeQuantity,
      maxWaitTime = 5000,
      aggressiveMargin = 0.0005,
    } = options;

    try {
      // STEP 1: Subscribe to position updates (if supported)
      const [primaryHasWS, hedgeHasWS] = await Promise.all([
        this.subscribeToPositionUpdates(this.primaryExchange, primarySymbol),
        this.subscribeToPositionUpdates(this.hedgeExchange, hedgeSymbol),
      ]);

      console.log(`[Hybrid] WebSocket monitoring: primary=${primaryHasWS}, hedge=${hedgeHasWS}`);

      // STEP 2: Get current prices via REST
      const [primaryPrice, hedgePrice] = await Promise.all([
        this.getCurrentPrice(this.primaryExchange, primarySymbol),
        this.getCurrentPrice(this.hedgeExchange, hedgeSymbol),
      ]);

      console.log(`[Hybrid] Prices fetched: ${Date.now() - startTime}ms`, {
        primary: primaryPrice,
        hedge: hedgePrice,
      });

      // STEP 3: Calculate aggressive limit prices
      const primaryLimitPrice = this.calculateAggressivePrice(primaryPrice, primarySide, aggressiveMargin);
      const hedgeLimitPrice = this.calculateAggressivePrice(hedgePrice, hedgeSide, aggressiveMargin);

      console.log('[Hybrid] Placing aggressive limit orders...');

      // STEP 4: Place limit orders via REST
      const [primaryOrder, hedgeOrder] = await Promise.all([
        this.placeAggressiveLimitOrder(
          this.primaryExchange,
          primarySymbol,
          primarySide,
          primaryQuantity,
          primaryLimitPrice
        ),
        this.placeAggressiveLimitOrder(
          this.hedgeExchange,
          hedgeSymbol,
          hedgeSide,
          hedgeQuantity,
          hedgeLimitPrice
        ),
      ]);

      console.log(`[Hybrid] Limit orders placed: ${Date.now() - startTime}ms`);

      // STEP 5: Monitor positions via WS or polling
      const { primaryClosed, hedgeClosed } = await this.waitForPositionsClose(
        this.primaryExchange,
        this.hedgeExchange,
        primarySymbol,
        hedgeSymbol,
        primaryHasWS,
        hedgeHasWS,
        maxWaitTime
      );

      // STEP 6: Handle unfilled orders
      if (!primaryClosed || !hedgeClosed) {
        console.warn(`[Hybrid] Limit orders timeout at ${Date.now() - startTime}ms, using market fallback`);

        // Cancel unfilled limit orders
        await Promise.allSettled([
          !primaryClosed ? this.cancelOrder(this.primaryExchange, primaryOrder.orderId, primarySymbol) : null,
          !hedgeClosed ? this.cancelOrder(this.hedgeExchange, hedgeOrder.orderId, hedgeSymbol) : null,
        ]);

        // Force close with market orders
        await Promise.all([
          !primaryClosed ? this.forceClosePosition(
            this.primaryExchange,
            primarySymbol,
            primarySide,
            primaryQuantity,
            this.primaryExchange.exchangeName
          ) : null,
          !hedgeClosed ? this.forceClosePosition(
            this.hedgeExchange,
            hedgeSymbol,
            hedgeSide,
            hedgeQuantity,
            this.hedgeExchange.exchangeName
          ) : null,
        ]);
      }

      const closeTime = Date.now() - startTime;
      console.log(`[Hybrid] ✓ COMPLETE in ${closeTime}ms`);

      return {
        success: true,
        primaryClosed: true,
        hedgeClosed: true,
        primaryExitPrice: primaryClosed ? primaryLimitPrice : primaryPrice,
        hedgeExitPrice: hedgeClosed ? hedgeLimitPrice : hedgePrice,
        closeTime,
        strategy: this.name,
        primaryFeeType: primaryClosed ? 'maker' : 'taker',
        hedgeFeeType: hedgeClosed ? 'maker' : 'taker',
      };

    } catch (error: any) {
      console.error(`[Hybrid] Error: ${error.message}`);

      // Emergency fallback
      console.log('[Hybrid] Emergency market close fallback...');

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
          primaryExitPrice: 0,
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
}
