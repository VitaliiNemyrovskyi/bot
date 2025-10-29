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
  private userId?: string;
  private credentialId?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string
  ) {
    super();
    this.exchangeName = 'BINGX';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.userId = userId;
    this.credentialId = credentialId;

    this.bingxService = new BingXService({
      apiKey,
      apiSecret,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Convert normalized symbol format to BingX format
   * BingX requires hyphenated format (e.g., "BTC-USDT" instead of "BTCUSDT")
   * @param symbol Symbol in normalized format (e.g., "BTCUSDT", "CDLUSDT")
   * @returns Symbol in BingX format (e.g., "BTC-USDT", "CDL-USDT")
   */
  private normalizeSymbolForBingX(symbol: string): string {
    // If already has hyphen, return as-is
    if (symbol.includes('-')) {
      return symbol;
    }

    // BingX perpetual futures use USDT or USDC as quote currency
    // Insert hyphen before the quote currency
    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4); // Remove 'USDT'
      return `${base}-USDT`;
    }

    if (symbol.endsWith('USDC')) {
      const base = symbol.slice(0, -4); // Remove 'USDC'
      return `${base}-USDC`;
    }

    // If no known quote currency, return as-is and let API handle error
    console.warn(`[BingXConnector] Symbol ${symbol} does not end with USDT or USDC, cannot normalize`);
    return symbol;
  }

  /**
   * Initialize BingX connection
   *
   * Includes automatic retry logic for timestamp synchronization issues
   */
  async initialize(): Promise<void> {
    console.log(`[BingXConnector] Initializing BingX connector...`);

    try {
      // Synchronize time with BingX server - CRITICAL for authentication
      // console.log('[BingXConnector] Synchronizing time with BingX server...');
      try {
        await this.bingxService.syncTime();

        // Log time sync status
        const syncStatus = this.bingxService.getTimeSyncStatus();
        // console.log('[BingXConnector] Time sync status:', syncStatus);

        // Verify time sync was successful
        if (syncStatus.lastSyncTime === 0) {
          throw new Error('Time synchronization failed - no sync time recorded');
        }

        // Warn if offset is large (but not fatal at this point)
        if (Math.abs(syncStatus.offset) > 1500) {
          console.warn(`[BingXConnector] ⚠️ Large time offset detected: ${syncStatus.offset}ms. This may cause issues.`);
        }
      } catch (syncError: any) {
        console.error('[BingXConnector] Time sync failed:', syncError.message);
        throw new Error(`Failed to sync time with BingX server: ${syncError.message}. Authenticated API calls will fail without proper time synchronization.`);
      }

      // Start periodic time sync after successful initial sync
      this.bingxService.startPeriodicSync();

      // Test connection by fetching account info (with retry on timestamp errors)
      // console.log('[BingXConnector] Testing authenticated connection...');
      let retryCount = 0;
      const MAX_RETRIES = 1;

      while (retryCount <= MAX_RETRIES) {
        try {
          await this.bingxService.getAccountInfo();
          break; // Success!
        } catch (testError: any) {
          // Check if this is a timestamp-related error
          const isTimestampError =
            testError.message.includes('timestamp') ||
            testError.message.includes('time') ||
            testError.message.includes('invalid');

          if (isTimestampError && retryCount < MAX_RETRIES) {
            console.warn(`[BingXConnector] Timestamp error detected, forcing time re-sync (retry ${retryCount + 1}/${MAX_RETRIES})...`);

            // Force a fresh time sync (bypass cache)
            await this.bingxService.syncTime(true);

            retryCount++;
            continue;
          }

          // Not a timestamp error or out of retries
          throw testError;
        }
      }

      this.isInitialized = true;
      // console.log('[BingXConnector] BingX connector initialized successfully');
    } catch (error: any) {
      console.error('[BingXConnector] Failed to initialize:', error.message);

      // Provide more helpful error message for timestamp issues
      if (error.message.includes('timestamp') || error.message.includes('time')) {
        const syncStatus = this.bingxService.getTimeSyncStatus();
        throw new Error(
          `Failed to initialize BingX connector: ${error.message}. ` +
          `Time offset: ${syncStatus.offset}ms, Last sync: ${new Date(syncStatus.lastSyncTime).toISOString()}. ` +
          `Please ensure your system time is synchronized and you have network connectivity to BingX servers.`
        );
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
      // Convert symbol to BingX format (e.g., CDLUSDT -> CDL-USDT)
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      // Get trading rules for quantity adjustment
      const adjustedQuantity = await this.adjustQuantityForSymbol(bingxSymbol, quantity);

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
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'MARKET',
        quantity: adjustedQuantity,
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing ${bingxSide} order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] Market order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing market order:', error.message);
      throw error;
    }
  }

  /**
   * Place a market order with Take Profit and Stop Loss in ATOMIC request
   *
   * CRITICAL: Uses current market price with slippage buffer to calculate TP/SL
   * This prevents issues where SL ends up on wrong side due to price movement.
   *
   * Slippage buffer logic:
   * - LONG: Assumes entry slightly HIGHER than current (adds 0.1% buffer to entry)
   *   - SL calculation uses buffered entry: (currentPrice * 1.001) * (1 - slPercent/100)
   * - SHORT: Assumes entry slightly LOWER than current (subtracts 0.1% buffer)
   *   - SL calculation uses buffered entry: (currentPrice * 0.999) * (1 + slPercent/100)
   *
   * TP/SL Calculation Logic (with slippage buffer):
   * - Long (Buy): TP = currentPrice * (1 + tpPercent/100), SL = (currentPrice * 1.001) * (1 - slPercent/100)
   * - Short (Sell): TP = currentPrice * (1 - tpPercent/100), SL = (currentPrice * 0.999) * (1 + slPercent/100)
   *
   * @param symbol Trading pair symbol (e.g., "BTCUSDT")
   * @param side Order side ('Buy' for long, 'Sell' for short)
   * @param quantity Position size
   * @param takeProfitPercent Take profit percentage (e.g., 2 = 2% profit) (optional)
   * @param stopLossPercent Stop loss percentage (e.g., 1 = 1% loss) (optional)
   * @param workingType Price type for TP/SL: "MARK_PRICE" or "CONTRACT_PRICE" (default: "MARK_PRICE")
   * @returns Order result with TP/SL
   */
  async placeMarketOrderWithTPSL(
    symbol: string,
    side: OrderSide,
    quantity: number,
    takeProfitPercent?: number,
    stopLossPercent?: number,
    workingType: 'MARK_PRICE' | 'CONTRACT_PRICE' = 'MARK_PRICE'
  ): Promise<any> {
    console.log(`[BingXConnector] Placing ATOMIC market ${side} order with TP/SL:`, {
      symbol,
      quantity,
      takeProfitPercent,
      stopLossPercent,
      workingType,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format (e.g., CDLUSDT -> CDL-USDT)
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      // Get current market price
      const currentPrice = await this.getMarketPrice(symbol);
      console.log(`[BingXConnector] Current market price: ${currentPrice}`);

      // Calculate TP/SL prices with slippage buffer
      let takeProfitPrice: number | undefined;
      let stopLossPrice: number | undefined;

      // Slippage buffer: 0.1% to account for execution price difference
      const SLIPPAGE_BUFFER = 0.001; // 0.1%

      if (takeProfitPercent !== undefined && takeProfitPercent > 0) {
        if (side === 'Buy') {
          // Long: TP above current price (price increases)
          takeProfitPrice = currentPrice * (1 + takeProfitPercent / 100);
        } else {
          // Short: TP below current price (price decreases)
          takeProfitPrice = currentPrice * (1 - takeProfitPercent / 100);
        }
        console.log(`[BingXConnector] Calculated TP price: ${takeProfitPrice} (${takeProfitPercent}%)`);
      }

      if (stopLossPercent !== undefined && stopLossPercent > 0) {
        if (side === 'Buy') {
          // Long: Assume entry slightly HIGHER due to slippage, then calculate SL below
          const bufferedEntry = currentPrice * (1 + SLIPPAGE_BUFFER);
          stopLossPrice = bufferedEntry * (1 - stopLossPercent / 100);
          console.log(`[BingXConnector] LONG SL calculation: currentPrice=${currentPrice}, bufferedEntry=${bufferedEntry}, stopLoss=${stopLossPrice} (${stopLossPercent}%)`);
        } else {
          // Short: Assume entry slightly LOWER due to slippage, then calculate SL above
          const bufferedEntry = currentPrice * (1 - SLIPPAGE_BUFFER);
          stopLossPrice = bufferedEntry * (1 + stopLossPercent / 100);
          console.log(`[BingXConnector] SHORT SL calculation: currentPrice=${currentPrice}, bufferedEntry=${bufferedEntry}, stopLoss=${stopLossPrice} (${stopLossPercent}%)`);
        }
      }

      // Get trading rules for quantity adjustment
      const adjustedQuantity = await this.adjustQuantityForSymbol(bingxSymbol, quantity);

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

      // Build ATOMIC order with TP/SL
      const orderParams: any = {
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'MARKET',
        quantity: adjustedQuantity,
        positionSide,
      };

      // Add Take Profit if specified (simple numeric format)
      if (takeProfitPrice !== undefined && takeProfitPrice > 0) {
        const takeProfit = {
          price: takeProfitPrice,
          stopPrice: takeProfitPrice, // Required by BingX API
          type: 'TAKE_PROFIT_MARKET',
          workingType: 'MARK_PRICE',
        }
        orderParams.takeProfit = JSON.stringify(takeProfit);

        orderParams.takeProfitTriggerBy = workingType === 'MARK_PRICE' ? 'MarkPrice' : 'LastPrice';
        console.log(`[BingXConnector] ✓ Take Profit configured (ATOMIC): price=${takeProfitPrice}`);
      }

      // Add Stop Loss if specified (simple numeric format)
      if (stopLossPrice !== undefined && stopLossPrice > 0) {
        const stopLoss = {
          price: stopLossPrice,
          stopPrice: stopLossPrice, // Required by BingX API
          type: 'STOP_MARKET',
          workingType: ''
        };
        orderParams.stopLoss = JSON.stringify(stopLoss);

        console.log(`[BingXConnector] ✓ Stop Loss configured (ATOMIC): price=${stopLossPrice}`);
      }

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing ATOMIC order with TP/SL`);
      console.log(`[BingXConnector] Full order params:`, JSON.stringify(orderParams, null, 2));

      // Place ATOMIC order with TP/SL
      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] ✓ ATOMIC market order with TP/SL placed successfully');
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing ATOMIC market order with TP/SL:', error.message);
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
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

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
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'LIMIT',
        quantity,
        price,
        timeInForce: 'GTC',
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing ${bingxSide} limit order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] Limit order placed:', result);
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
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);

      const result = await this.bingxService.cancelOrder(bingxSymbol, orderId);
      // console.log('[BingXConnector] Order canceled:', result);
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
      // console.log('[BingXConnector] Balance retrieved');
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
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);

      const positions = await this.bingxService.getPositions(bingxSymbol);
      const position = positions.find((p) => p.symbol === bingxSymbol);

      if (!position || parseFloat(position.positionAmt) === 0) {
        return {
          symbol: bingxSymbol,
          positionSide: 'None',
          positionAmt: '0',
          avgPrice: '0',
          unrealizedProfit: '0',
        };
      }

      // console.log('[BingXConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[BingXConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get all positions or positions for a specific symbol
   */
  async getPositions(symbol?: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      let querySymbol = symbol;
      if (symbol) {
        // Convert symbol to BingX format
        querySymbol = this.normalizeSymbolForBingX(symbol);
      }

      const positions = await this.bingxService.getPositions(querySymbol);
      // console.log('[BingXConnector] Positions retrieved:', positions.length);
      return positions;
    } catch (error: any) {
      console.error('[BingXConnector] Error getting positions:', error.message);
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
   * Close position using native BingX API with closePosition=true
   *
   * Uses BingX's native closePosition parameter which works correctly
   * with isolated margin and all position modes.
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[BingXConnector] ========================================`);
    console.log(`[BingXConnector] CLOSING POSITION for ${symbol} using NATIVE API`);
    console.log(`[BingXConnector] ========================================`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      // Get current position to determine side
      const positions = await this.bingxService.getPositions(bingxSymbol);
      const position = positions.find((p) => p.symbol === bingxSymbol && parseFloat(p.positionAmt || '0') !== 0);

      if (!position) {
        console.log(`[BingXConnector] No open position found for ${bingxSymbol}`);
        return { success: true, message: 'No position to close' };
      }

      // Determine position side from BingX position data
      // BingX uses positionSide: 'LONG' or 'SHORT'
      const positionSide = position.positionSide as 'LONG' | 'SHORT';
      console.log(`[BingXConnector] Found ${positionSide} position with size ${position.positionAmt}`);

      // Use native BingX closePosition method with closePosition=true parameter
      const result = await this.bingxService.closePosition(bingxSymbol, positionSide);

      console.log(`[BingXConnector] ✓ Position closed successfully via NATIVE API:`, result);
      console.log(`[BingXConnector] ========================================`);

      return result;
    } catch (error: any) {
      console.error(`[BingXConnector] ✗ Error closing position via NATIVE API:`, error.message);
      console.error(`[BingXConnector] ========================================`);
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
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

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
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'MARKET',
        quantity,
        reduceOnly: true,
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Closing position with ${bingxSide} reduceOnly order (positionSide=${positionSide})`);

      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] Reduce-only order placed:', result);
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

      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      const result = await this.bingxService.setLeverage(bingxSymbol, leverage, side);
      // console.log('[BingXConnector] Leverage set successfully:', result);

      // Verify leverage was actually applied by querying position
      try {
        const positions = await this.bingxService.getPositions(bingxSymbol);
        if (positions && positions.length > 0) {
          const position = positions[0];
          const actualLeverage = position.leverage || result.leverage;

          console.log(`[BingXConnector] Leverage verification for ${bingxSymbol}:`, {
            requested: leverage,
            actual: actualLeverage,
            verified: actualLeverage === leverage || actualLeverage === leverage.toString()
          });

          if (actualLeverage && (actualLeverage === leverage || actualLeverage === leverage.toString())) {
            console.log(`[BingXConnector] ✓ Leverage verified: ${actualLeverage}x`);
          } else {
            console.warn(`[BingXConnector] ⚠️  Leverage mismatch: requested ${leverage}x, but actual is ${actualLeverage}x`);
          }
        }
      } catch (verifyError: any) {
        console.warn(`[BingXConnector] Could not verify leverage (non-fatal):`, verifyError.message);
      }

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

  /**
   * Place Take Profit conditional order (closes position when price reaches TP)
   *
   * @param symbol Trading pair symbol (e.g., "BTC-USDT")
   * @param stopPrice Trigger price for take profit
   * @param side Original position side ('Buy' for long, 'Sell' for short)
   * @returns Order result
   */
  async placeTakeProfitOrder(
    symbol: string,
    stopPrice: number,
    side: OrderSide
  ): Promise<any> {
    console.log(`[BingXConnector] Placing Take Profit order:`, {
      symbol,
      stopPrice,
      originalSide: side,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      // Opposite side to close the position
      // If we have a BUY position (long), we SELL to close
      // If we have a SELL position (short), we BUY to close
      const bingxSide = side === 'Buy' ? 'SELL' : 'BUY';

      // Check account position mode
      const isHedgeMode = await this.bingxService.getPositionMode();

      // Determine positionSide based on mode
      let positionSide: string;
      if (isHedgeMode) {
        // Hedge Mode: Use original position side (LONG for Buy, SHORT for Sell)
        positionSide = side === 'Buy' ? 'LONG' : 'SHORT';
      } else {
        // One-Way Mode: MUST use BOTH
        positionSide = 'BOTH';
      }

      const orderParams: any = {
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'TAKE_PROFIT_MARKET',
        stopPrice,
        closePosition: true, // Close entire position when triggered
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing TP order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] Take Profit order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing Take Profit order:', error.message);
      throw error;
    }
  }

  /**
   * Place Stop Loss conditional order (closes position when price reaches SL)
   *
   * @param symbol Trading pair symbol (e.g., "BTC-USDT")
   * @param stopPrice Trigger price for stop loss
   * @param side Original position side ('Buy' for long, 'Sell' for short)
   * @returns Order result
   */
  async placeStopLossOrder(
    symbol: string,
    stopPrice: number,
    side: OrderSide
  ): Promise<any> {
    console.log(`[BingXConnector] Placing Stop Loss order:`, {
      symbol,
      stopPrice,
      originalSide: side,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized: ${symbol} -> ${bingxSymbol}`);

      // Opposite side to close the position
      // If we have a BUY position (long), we SELL to close
      // If we have a SELL position (short), we BUY to close
      const bingxSide = side === 'Buy' ? 'SELL' : 'BUY';

      // Check account position mode
      const isHedgeMode = await this.bingxService.getPositionMode();

      // Determine positionSide based on mode
      let positionSide: string;
      if (isHedgeMode) {
        // Hedge Mode: Use original position side (LONG for Buy, SHORT for Sell)
        positionSide = side === 'Buy' ? 'LONG' : 'SHORT';
      } else {
        // One-Way Mode: MUST use BOTH
        positionSide = 'BOTH';
      }

      const orderParams: any = {
        symbol: bingxSymbol,
        side: bingxSide,
        type: 'STOP_MARKET',
        stopPrice,
        closePosition: true, // Close entire position when triggered
        positionSide,
      };

      console.log(`[BingXConnector] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Placing SL order with positionSide=${positionSide}`);

      const result = await this.bingxService.placeOrder(orderParams);

      // console.log('[BingXConnector] Stop Loss order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BingXConnector] Error placing Stop Loss order:', error.message);
      throw error;
    }
  }

  /**
   * Set take-profit and stop-loss for an existing position
   * BingX doesn't have a unified setTradingStop endpoint like Bybit
   * Instead, we place separate conditional orders (TAKE_PROFIT_MARKET and STOP_MARKET)
   */
  async setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<{
    success: boolean;
    takeProfitOrderId?: string;
    stopLossOrderId?: string;
    message?: string;
  }> {
    console.log(`[BingXConnector] Setting TP/SL for ${params.symbol}:`, {
      side: params.side,
      takeProfit: params.takeProfit,
      stopLoss: params.stopLoss,
    });

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    // Validate at least one is provided
    if (!params.takeProfit && !params.stopLoss) {
      throw new Error('At least one of takeProfit or stopLoss must be provided');
    }

    const results: {
      success: boolean;
      takeProfitOrderId?: string;
      stopLossOrderId?: string;
      message?: string;
    } = {
      success: true,
    };

    try {
      // Place Take Profit order if specified
      if (params.takeProfit) {
        try {
          console.log(`[BingXConnector] Placing Take Profit order at ${params.takeProfit}...`);
          const tpResult = await this.placeTakeProfitOrder(
            params.symbol,
            params.takeProfit,
            params.side
          );
          results.takeProfitOrderId = tpResult.order?.orderId || tpResult.orderId;
          console.log(`[BingXConnector] ✓ Take Profit order placed: ${results.takeProfitOrderId}`);
        } catch (tpError: any) {
          console.error(`[BingXConnector] ✗ Failed to place Take Profit order:`, tpError.message);
          results.success = false;
          results.message = `Take Profit error: ${tpError.message}`;
          throw tpError;
        }
      }

      // Place Stop Loss order if specified
      if (params.stopLoss) {
        try {
          console.log(`[BingXConnector] Placing Stop Loss order at ${params.stopLoss}...`);
          const slResult = await this.placeStopLossOrder(
            params.symbol,
            params.stopLoss,
            params.side
          );
          results.stopLossOrderId = slResult.order?.orderId || slResult.orderId;
          console.log(`[BingXConnector] ✓ Stop Loss order placed: ${results.stopLossOrderId}`);
        } catch (slError: any) {
          console.error(`[BingXConnector] ✗ Failed to place Stop Loss order:`, slError.message);
          results.success = false;
          results.message = results.message
            ? `${results.message}; Stop Loss error: ${slError.message}`
            : `Stop Loss error: ${slError.message}`;
          throw slError;
        }
      }

      console.log(`[BingXConnector] ✓ Trading stop set successfully for ${params.symbol}`);
      return results;
    } catch (error: any) {
      console.error(`[BingXConnector] Error setting trading stop:`, error.message);
      throw error;
    }
  }

  /**
   * Get current market price for a symbol (REST API)
   * Uses BingX's ticker endpoint to get the last traded price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    console.log(`[BingXConnector] Fetching market price for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);

      // BingX uses getTickers() which returns all tickers
      // We need to filter for our specific symbol
      const tickers = await this.bingxService.getTickers();
      const ticker = tickers.find((t) => t.symbol === bingxSymbol);

      if (!ticker) {
        throw new Error(`No ticker data found for ${bingxSymbol}`);
      }

      const lastPrice = parseFloat(ticker.lastPrice);

      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid price data for ${bingxSymbol}: ${ticker.lastPrice}`);
      }

      console.log(`[BingXConnector] Current price for ${bingxSymbol}: $${lastPrice}`);
      return lastPrice;
    } catch (error: any) {
      console.error(`[BingXConnector] Error fetching market price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   * Uses BingX's WebSocket ticker stream
   *
   * BingX WebSocket endpoint: wss://open-api-swap.bingx.com/swap-market
   * Subscribe format: { "id": "unique-id", "dataType": "SYMBOL@ticker" }
   * Response format: { "dataType": "SYMBOL@ticker", "data": { "c": "lastPrice", "E": timestamp } }
   *
   * @param symbol - Trading pair symbol (e.g., "BTC-USDT")
   * @param callback - Callback function called on each price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[BingXConnector] Subscribing to price stream for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized for WebSocket: ${symbol} -> ${bingxSymbol}`);

      const { websocketManager } = await import('@/services/websocket-manager.service');

      // BingX WebSocket configuration
      const wsUrl = 'wss://open-api-swap.bingx.com/swap-market';
      const dataType = `${bingxSymbol}@ticker`;

      const config = {
        url: wsUrl,
        subscribeMessage: {
          id: `${Date.now()}`,
          dataType,
        },
        heartbeatInterval: 20000, // 20 seconds
        reconnectDelay: 1000,
        maxReconnectDelay: 30000,
      };

      // Subscribe using WebSocket manager
      const unsubscribe = await websocketManager.subscribe(
        'bingx',
        bingxSymbol,
        config,
        (data: any) => {
          try {
            // BingX WebSocket ticker format:
            // { "dataType": "BTC-USDT@ticker", "data": { "c": "50000.5", "E": 1234567890 } }
            if (data.dataType && data.dataType.includes('@ticker') && data.data) {
              const tickerData = data.data;
              const price = parseFloat(tickerData.c); // 'c' = close/last price
              const timestamp = tickerData.E || Date.now();

              if (!isNaN(price) && price > 0) {
                callback(price, timestamp);
              } else {
                console.warn(`[BingXConnector] Invalid price in WebSocket update for ${bingxSymbol}:`, tickerData.c);
              }
            }
          } catch (error: any) {
            console.error(`[BingXConnector] Error processing WebSocket update for ${bingxSymbol}:`, error.message);
          }
        }
      );

      console.log(`[BingXConnector] Successfully subscribed to price stream for ${bingxSymbol}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[BingXConnector] Error subscribing to price stream for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time mark price updates via WebSocket
   * Mark price is used for liquidation calculations and is more stable than last trade price
   *
   * This method uses BingXService's native WebSocket support for mark price subscriptions
   *
   * @param symbol - Trading pair symbol (e.g., "BTC-USDT")
   * @param callback - Callback function called on each mark price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToMarkPriceStream(
    symbol: string,
    callback: (price: number) => void
  ): Promise<() => void> {
    console.log(`[BingXConnector] Subscribing to mark price stream for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.normalizeSymbolForBingX(symbol);
      console.log(`[BingXConnector] Symbol normalized for WebSocket: ${symbol} -> ${bingxSymbol}`);

      // Use BingXService's native WebSocket support for mark price
      const unsubscribe = this.bingxService.subscribeToMarkPrice(bingxSymbol, (price: number) => {
        callback(price);
      });

      console.log(`[BingXConnector] Successfully subscribed to mark price stream for ${bingxSymbol}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[BingXConnector] Error subscribing to mark price stream for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time position updates via WebSocket
   * Receives updates including unrealizedProfit and realisedProfit
   *
   * This method uses BingXService's user data stream to receive position updates
   *
   * Position update data format:
   * {
   *   eventType: 'ACCOUNT_UPDATE',
   *   eventTime: 1672364262474,
   *   positions: [{
   *     symbol: 'BTC-USDT',
   *     positionAmt: '0.5',
   *     entryPrice: '50000.5',
   *     unrealizedProfit: '125.5',
   *     marginType: 'cross',
   *     positionSide: 'LONG',
   *     leverage: '10',
   *     updateTime: 1672364262474
   *   }],
   *   rawData: { ... }
   * }
   *
   * @param callback - Callback function called on each position update
   * @returns Promise<void>
   */
  async subscribeToPositions(callback: (data: any) => void): Promise<void> {
    console.log(`[BingXConnector] Subscribing to position updates...`);

    if (!this.isInitialized) {
      throw new Error('BingX connector not initialized');
    }

    try {
      // Use BingXService's native WebSocket support for position updates
      await this.bingxService.subscribeToPositions((positionUpdate: any) => {
        // Normalize position data for consistency with other exchanges
        const normalizedUpdate = {
          eventType: positionUpdate.eventType,
          eventTime: positionUpdate.eventTime,
          positions: positionUpdate.positions.map((pos: any) => ({
            symbol: pos.symbol,
            positionAmt: pos.positionAmt,
            entryPrice: pos.entryPrice,
            unrealizedProfit: pos.unrealizedProfit,
            realizedProfit: pos.realisedProfit, // Note: BingX uses 'realisedProfit' in API
            marginType: pos.marginType,
            positionSide: pos.positionSide,
            leverage: pos.leverage,
            updateTime: pos.updateTime
          })),
          rawData: positionUpdate.rawData
        };

        callback(normalizedUpdate);
      });

      console.log(`[BingXConnector] Successfully subscribed to position updates`);
    } catch (error: any) {
      console.error(`[BingXConnector] Error subscribing to position updates:`, error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe from all user data stream subscriptions
   * Closes the WebSocket connection and stops all position update callbacks
   */
  unsubscribeFromUserDataStream(): void {
    console.log(`[BingXConnector] Unsubscribing from user data stream...`);

    try {
      this.bingxService.unsubscribeUserDataStream();
      console.log(`[BingXConnector] Successfully unsubscribed from user data stream`);
    } catch (error: any) {
      console.error(`[BingXConnector] Error unsubscribing from user data stream:`, error.message);
      throw error;
    }
  }
}
