import { BaseExchangeConnector, OrderSide } from '../connectors/base-exchange.connector';

/**
 * Position Close Result
 */
export interface CloseResult {
  success: boolean;
  primaryClosed: boolean;
  hedgeClosed: boolean;
  primaryExitPrice: number;
  hedgeExitPrice: number;
  closeTime: number; // milliseconds
  strategy: string;
  primaryFeeType: 'maker' | 'taker';
  hedgeFeeType: 'maker' | 'taker';
  error?: string;
}

/**
 * Close Strategy Options
 */
export interface CloseOptions {
  primarySymbol: string;
  hedgeSymbol: string;
  primarySide: OrderSide;
  hedgeSide: OrderSide;
  primaryQuantity: number;
  hedgeQuantity: number;
  positionType: 'long' | 'short';
  maxWaitTime?: number; // Max time to wait for limit orders (default: 3000ms)
  aggressiveMargin?: number; // Price margin for aggressive limits (default: 0.0005 = 0.05%)
}

/**
 * Exchange Capabilities
 */
export interface ExchangeCapabilities {
  supportsWebSocketOrders: boolean;
  supportsWebSocketPositions: boolean;
  supportsWebSocketPrices: boolean;
  supportsLimitOrders: boolean;
  supportsReduceOnly: boolean;
  supportsPostOnly: boolean;
}

/**
 * Base Position Close Strategy
 */
export abstract class PositionCloseStrategy {
  abstract readonly name: string;
  abstract readonly avgCloseTime: number; // Expected average close time in ms

  constructor(
    protected primaryExchange: BaseExchangeConnector,
    protected hedgeExchange: BaseExchangeConnector
  ) {}

  /**
   * Close positions using this strategy
   */
  abstract closePositions(options: CloseOptions): Promise<CloseResult>;

  /**
   * Check if this strategy is supported by the exchanges
   */
  abstract isSupported(): boolean;

  /**
   * Get current price from exchange
   */
  protected async getCurrentPrice(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<number> {
    try {
      const position = await connector.getPosition(symbol);
      const price = parseFloat(position.markPrice || position.lastPrice || position.avgPrice || '0');

      if (price > 0) {
        return price;
      }

      throw new Error(`Invalid price for ${symbol}`);
    } catch (error: any) {
      throw new Error(`Failed to get price for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Calculate aggressive limit price for quick execution
   */
  protected calculateAggressivePrice(
    currentPrice: number,
    side: OrderSide,
    margin: number = 0.0005
  ): number {
    // For sells: price slightly below market (aggressive bid)
    // For buys: price slightly above market (aggressive ask)
    return side === 'Sell'
      ? currentPrice * (1 - margin)
      : currentPrice * (1 + margin);
  }

  /**
   * Force close position using multiple fallback methods
   *
   * IMPORTANT: This method NEVER uses regular placeMarketOrder without reduceOnly flag
   * to prevent accidentally opening new positions in the opposite direction!
   */
  protected async forceClosePosition(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    exchangeName: string
  ): Promise<any> {
    // STEP 0: Check if position actually exists and get actual position size
    console.log(`[Strategy] Checking actual position size for ${symbol} on ${exchangeName}...`);

    try {
      const position = await connector.getPosition(symbol);
      const actualSize = Math.abs(parseFloat(position.positionAmt || position.size || '0'));

      if (actualSize === 0) {
        console.log(`[Strategy] ✓ Position already closed (size = 0), skipping close orders`);
        return { success: true, message: 'Position already closed' };
      }

      console.log(`[Strategy] Actual position size: ${actualSize}, proceeding with close...`);

      // Use actual position size instead of requested quantity
      quantity = actualSize;
    } catch (posError: any) {
      console.warn(`[Strategy] Could not check position size: ${posError.message}, using requested quantity: ${quantity}`);
    }

    // STEP 1: Try reduce-only methods only (SAFE - will never open new positions)
    const safeMethods = [
      { name: 'reduce-only order', method: 'placeReduceOnlyOrder' },
      { name: 'close position API', method: 'closePosition' },
    ];

    let lastError: any = null;

    for (const { name, method } of safeMethods) {
      try {
        console.log(`[Strategy] Attempting ${name} on ${exchangeName}...`);
        const connectorWithMethod = connector as any;

        if (typeof connectorWithMethod[method] !== 'function') {
          console.log(`[Strategy] ${exchangeName} doesn't support ${name}, trying next method...`);
          continue;
        }

        let result;
        if (method === 'closePosition') {
          result = await connectorWithMethod[method](symbol);
        } else {
          result = await connectorWithMethod[method](symbol, side, quantity);
        }

        console.log(`[Strategy] ✓ ${exchangeName} closed successfully using ${name}`);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Strategy] ${name} failed: ${error.message}`);

        // If error is "position is zero", the position is already closed - SUCCESS!
        if (error.message.includes('position is zero') ||
            error.message.includes('position not found') ||
            error.message.includes('no position')) {
          console.log(`[Strategy] ✓ Position already closed (${error.message}), no action needed`);
          return { success: true, message: 'Position already closed', alreadyClosed: true };
        }
      }
    }

    // STEP 2: If all safe methods failed, throw error to prevent opening new positions
    // DO NOT fall back to regular placeMarketOrder - it could open a new position!
    const errorMsg =
      `Failed to close ${exchangeName} position for ${symbol} using safe methods (reduce-only/close API). ` +
      `Last error: ${lastError?.message || 'unknown'}. ` +
      `PLEASE MANUALLY CLOSE THIS POSITION ON THE EXCHANGE TO PREVENT FURTHER LOSSES! ` +
      `Do NOT attempt automated close - it could open a new position.`;

    console.error(`[Strategy] ⚠️ CRITICAL: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Strategy Factory
 */
export class PositionCloseStrategyFactory {
  /**
   * Get optimal strategy for the given exchanges
   */
  static getStrategy(
    primaryExchange: BaseExchangeConnector,
    hedgeExchange: BaseExchangeConnector
  ): PositionCloseStrategy {
    const primaryCaps = this.getExchangeCapabilities(primaryExchange);
    const hedgeCaps = this.getExchangeCapabilities(hedgeExchange);

    // Check if BOTH exchanges support Ultra-Fast WS
    if (primaryCaps.supportsWebSocketOrders && hedgeCaps.supportsWebSocketOrders) {
      console.log('[StrategyFactory] Selected: Ultra-Fast WebSocket strategy');
      const { UltraFastWebSocketStrategy } = require('./ultra-fast-ws-strategy');
      return new UltraFastWebSocketStrategy(primaryExchange, hedgeExchange);
    }

    // Otherwise use Hybrid strategy
    console.log('[StrategyFactory] Selected: Hybrid + WS Monitoring strategy');
    const { HybridWebSocketStrategy } = require('./hybrid-ws-strategy');
    return new HybridWebSocketStrategy(primaryExchange, hedgeExchange);
  }

  /**
   * Get capabilities for an exchange
   */
  static getExchangeCapabilities(exchange: BaseExchangeConnector): ExchangeCapabilities {
    const exchangeName = exchange.exchangeName.toUpperCase();

    // Bybit: Full WebSocket support
    if (exchangeName.includes('BYBIT')) {
      return {
        supportsWebSocketOrders: true,
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: true,
        supportsPostOnly: true,
      };
    }

    // BingX: Partial WS support
    if (exchangeName.includes('BINGX')) {
      return {
        supportsWebSocketOrders: false,
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: true,
        supportsPostOnly: false,
      };
    }

    // MEXC: Limited WS support
    if (exchangeName.includes('MEXC')) {
      return {
        supportsWebSocketOrders: false,
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: false,
        supportsPostOnly: false,
      };
    }

    // Default: minimal capabilities
    return {
      supportsWebSocketOrders: false,
      supportsWebSocketPositions: false,
      supportsWebSocketPrices: false,
      supportsLimitOrders: true,
      supportsReduceOnly: false,
      supportsPostOnly: false,
    };
  }
}
