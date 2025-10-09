import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { BingXService } from '@/lib/bingx';

/**
 * BingX Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for BingX exchange
 *
 * PERFORMANCE OPTIMIZATION:
 * - Supports persistent time sync caching when userId and credentialId are provided
 * - Eliminates 1-2s initialization delay in serverless environments
 */
export class BingXConnector extends BaseExchangeConnector {
  private bingxService: BingXService;
  private apiKey: string;
  private apiSecret: string;
  private testnet: boolean;
  private userId?: string;
  private credentialId?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true,
    userId?: string,
    credentialId?: string
  ) {
    super();
    this.exchangeName = testnet ? 'BINGX_TESTNET' : 'BINGX';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testnet = testnet;
    this.userId = userId;
    this.credentialId = credentialId;

    this.bingxService = new BingXService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Initialize BingX connection
   */
  async initialize(): Promise<void> {
    console.log(`[BingXConnector] Initializing BingX connector (testnet: ${this.testnet})...`);

    try {
      // Synchronize time with BingX server - CRITICAL for authentication
      console.log('[BingXConnector] Synchronizing time with BingX server...');
      try {
        await this.bingxService.syncTime();

        // Log time sync status
        const syncStatus = this.bingxService.getTimeSyncStatus();
        console.log('[BingXConnector] Time sync status:', syncStatus);

        // Verify time sync was successful
        if (syncStatus.lastSyncTime === 0) {
          throw new Error('Time synchronization failed - no sync time recorded');
        }
      } catch (syncError: any) {
        console.error('[BingXConnector] Time sync failed:', syncError.message);
        throw new Error(`Failed to sync time with BingX server: ${syncError.message}. Authenticated API calls will fail without proper time synchronization.`);
      }

      // Start periodic time sync after successful initial sync
      this.bingxService.startPeriodicSync();

      // Test connection by fetching account info
      console.log('[BingXConnector] Testing authenticated connection...');
      await this.bingxService.getAccountInfo();

      this.isInitialized = true;
      console.log('[BingXConnector] BingX connector initialized successfully');
    } catch (error: any) {
      console.error('[BingXConnector] Failed to initialize:', error.message);

      // Provide more helpful error message for timestamp issues
      if (error.message.includes('timestamp') || error.message.includes('time')) {
        throw new Error(`Failed to initialize BingX connector: ${error.message}. Please ensure your system time is synchronized and you have network connectivity to BingX servers.`);
      }

      throw new Error(`Failed to initialize BingX connector: ${error.message}`);
    }
  }

  /**
   * Place a market order
   *
   * BingX Position Mode Behavior (ALWAYS requires positionSide):
   * - One-Way Mode: positionSide MUST be "BOTH"
   * - Hedge Mode: positionSide MUST be "LONG" or "SHORT" (based on BUY/SELL)
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[BingXConnector] Placing market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Get trading rules for quantity adjustment
      const adjustedQuantity = await this.adjustQuantityForSymbol(symbol, quantity);

      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      // Check account position mode
      const isHedgeMode = await this.bingxService.getPositionMode();

      // Determine positionSide based on mode
      let positionSide: string;
      if (isHedgeMode) {
        // Hedge Mode: Use LONG for BUY, SHORT for SELL
        positionSide = bingxSide === 'BUY' ? 'LONG' : 'SHORT';
      } else {
        // One-Way Mode: MUST use BOTH
        positionSide = 'BOTH';
      }

      const orderParams: any = {
        symbol,
        side: bingxSide,
        type: 'MARKET',
        quantity: adjustedQuantity,
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing ${bingxSide} order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      console.log('[BingXConnector] Market order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing market order:', error.message);
      throw error;
    }
  }

  /**
   * Adjust quantity to match BingX contract specifications
   * BingX requires:
   * - Quantity must match quantityPrecision (decimal places)
   * - Quantity must be a multiple of size (step size)
   * - Quantity must be >= tradeMinQuantity
   */
  private async adjustQuantityForSymbol(symbol: string, quantity: number): Promise<number> {
    try {
      // Fetch contract specifications
      const contracts = await this.bingxService.getContracts();
      const contract = contracts.find((c: any) => c.symbol === symbol);

      if (!contract) {
        console.warn(`[BingXConnector] No contract found for ${symbol}, using quantity as-is`);
        return quantity;
      }

      const precision = contract.quantityPrecision || 0;
      const stepSize = parseFloat(contract.size || '1');
      const minQuantity = parseFloat(contract.tradeMinQuantity || '0');

      console.log(`[BingXConnector] Trading rules for ${symbol}:`, {
        precision,
        stepSize,
        minQuantity,
        requestedQty: quantity,
      });

      // Round to correct precision
      const factor = Math.pow(10, precision);
      let adjusted = Math.floor((quantity / stepSize)) * stepSize;
      adjusted = Math.round(adjusted * factor) / factor;

      // Ensure minimum quantity
      if (adjusted < minQuantity) {
        console.warn(`[BingXConnector] Quantity ${adjusted} below minimum ${minQuantity}, using minimum`);
        adjusted = minQuantity;
      }

      if (adjusted !== quantity) {
        console.log(`[BingXConnector] Adjusted quantity from ${quantity} to ${adjusted} (precision: ${precision}, step: ${stepSize})`);
      }

      return adjusted;
    } catch (error: any) {
      console.error(`[BingXConnector] Error adjusting quantity:`, error.message);
      return quantity; // Fallback to original
    }
  }

  /**
   * Place a limit order
   *
   * BingX Position Mode Behavior (ALWAYS requires positionSide):
   * - One-Way Mode: positionSide MUST be "BOTH"
   * - Hedge Mode: positionSide MUST be "LONG" or "SHORT" (based on BUY/SELL)
   */
  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    console.log(`[BingXConnector] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      // Check account position mode
      const isHedgeMode = await this.bingxService.getPositionMode();

      // Determine positionSide based on mode
      let positionSide: string;
      if (isHedgeMode) {
        // Hedge Mode: Use LONG for BUY, SHORT for SELL
        positionSide = bingxSide === 'BUY' ? 'LONG' : 'SHORT';
      } else {
        // One-Way Mode: MUST use BOTH
        positionSide = 'BOTH';
      }

      const orderParams: any = {
        symbol,
        side: bingxSide,
        type: 'LIMIT',
        quantity,
        price,
        timeInForce: 'GTC',
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing ${bingxSide} limit order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      console.log('[BingXConnector] Limit order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing limit order:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[BingXConnector] Canceling order:`, { orderId, symbol });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      const result = await this.bingxService.cancelOrder(symbol, orderId);
      console.log('[BingXConnector] Order canceled:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error canceling order:', error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      const result = await this.bingxService.getWalletBalance();
      console.log('[BingXConnector] Balance retrieved');
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error getting balance:', error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol
   */
  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      const positions = await this.bingxService.getPositions(symbol);
      const position = positions.find((p) => p.symbol === symbol);

      if (!position || parseFloat(position.positionAmt) === 0) {
        return {
          symbol,
          positionSide: 'None',
          positionAmt: '0',
          avgPrice: '0',
          unrealizedProfit: '0',
        };
      }

      console.log('[BingXConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[BingXConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // BingX doesn't have a direct endpoint for single order status
      // We need to implement this based on their API
      throw new Error('getOrderStatus not yet implemented for BingX');
    } catch (error: any) {
      console.error('[BingXConnector] Error getting order status:', error.message);
      throw error;
    }
  }

  /**
   * Close position
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[BingXConnector] Closing position for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // First check if there's an open position
      const position = await this.getPosition(symbol);

      if (!position || position.positionSide === 'None') {
        throw new Error(`No open position for ${symbol}`);
      }

      // Determine position side from the current position
      const positionSide = position.positionSide as 'LONG' | 'SHORT';
      const result = await this.bingxService.closePosition(symbol, positionSide);

      console.log('[BingXConnector] Position closed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error closing position:', error.message);
      throw error;
    }
  }

  /**
   * Place a reduce-only market order
   *
   * BingX Position Mode Behavior (ALWAYS requires positionSide):
   * - One-Way Mode: positionSide MUST be "BOTH"
   * - Hedge Mode: positionSide MUST be "LONG" or "SHORT" (based on BUY/SELL)
   */
  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[BingXConnector] Placing reduce-only market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      // Check account position mode
      const isHedgeMode = await this.bingxService.getPositionMode();

      // Determine positionSide based on mode
      let positionSide: string;
      if (isHedgeMode) {
        // Hedge Mode: Use LONG for BUY, SHORT for SELL
        positionSide = bingxSide === 'BUY' ? 'LONG' : 'SHORT';
      } else {
        // One-Way Mode: MUST use BOTH
        positionSide = 'BOTH';
      }

      const orderParams: any = {
        symbol,
        side: bingxSide,
        type: 'MARKET',
        quantity,
        reduceOnly: true,
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Closing position with ${bingxSide} reduceOnly order (positionSide=${positionSide})`);

      const result = await this.bingxService.placeOrder(orderParams);

      console.log('[BingXConnector] Reduce-only order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing reduce-only order:', error.message);
      throw error;
    }
  }

  /**
   * Set leverage for a trading symbol
   * IMPORTANT: Leverage must be set BEFORE opening positions
   *
   * @param symbol Trading pair symbol (e.g., "BTC-USDT")
   * @param leverage Leverage multiplier (typically 1-100x)
   * @param side Position side: "LONG", "SHORT", or "BOTH" (default: "BOTH" for one-way mode)
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
  ): Promise<any> {
    console.log(`[BingXConnector] Setting leverage for ${symbol}:`, {
      leverage,
      side,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Validate leverage range
      if (leverage < 1 || leverage > 125) {
        throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
      }

      const result = await this.bingxService.setLeverage(symbol, leverage, side);
      console.log('[BingXConnector] Leverage set successfully:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error setting leverage:', error.message);

      // Provide helpful error messages for common issues
      if (error.message.includes('position')) {
        throw new Error(
          `Failed to set leverage for ${symbol}: ${error.message}. ` +
          `Note: Leverage cannot be changed when there are open positions. ` +
          `Please close all positions for ${symbol} before changing leverage.`
        );
      }

      throw new Error(`Failed to set leverage for ${symbol}: ${error.message}`);
    }
  }
}
