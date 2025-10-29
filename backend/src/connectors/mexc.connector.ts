import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { MEXCService } from '@/lib/mexc';
import { ContractSpecification } from '@/lib/contract-calculator';

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
  private contractSizeCache: Map<string, number> = new Map(); // Cache contract size per symbol

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
   * Normalize symbol format for MEXC
   * MEXC uses underscore format: BTC_USDT, NMR_USDT
   */
  private normalizeSymbol(symbol: string): string {
    // If symbol already has underscore, return as-is
    if (symbol.includes('_')) {
      return symbol;
    }

    // Convert BTCUSDT -> BTC_USDT, NMRUSDT -> NMR_USDT
    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      return `${base}_USDT`;
    }

    if (symbol.endsWith('USDC')) {
      const base = symbol.slice(0, -4);
      return `${base}_USDC`;
    }

    return symbol;
  }

  /**
   * Get contract size for a symbol (with caching)
   * MEXC contracts have a contractSize that needs to be used for quantity conversion
   * For example, P_USDT has contractSize: 10, meaning 1 contract = 10 P_USDT
   */
  private async getContractSize(symbol: string): Promise<number> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // Check cache first
    if (this.contractSizeCache.has(normalizedSymbol)) {
      return this.contractSizeCache.get(normalizedSymbol)!;
    }

    try {
      // Fetch contract details from MEXC API
      const contractDetails = await this.mexcService.getContractDetails(normalizedSymbol);
      const contractSize = contractDetails.contractSize || 1;

      console.log(`[MEXCConnector] Contract size for ${normalizedSymbol}: ${contractSize}`);

      // Cache for future use
      this.contractSizeCache.set(normalizedSymbol, contractSize);
      this.contractSizeCache.set(symbol, contractSize);

      return contractSize;
    } catch (error: any) {
      console.error(`[MEXCConnector] Failed to get contract size for ${normalizedSymbol}:`, error.message);
      // Default to 1 if we can't fetch contract details
      return 1;
    }
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
      // console.log('[MEXCConnector] MEXC connector initialized successfully');
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
    // Normalize symbol to MEXC format (BTCUSDT -> BTC_USDT)
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // Get contract size for this symbol (e.g., P_USDT has contractSize: 10)
    const contractSize = await this.getContractSize(symbol);

    // Convert quantity to number of contracts
    // For example: 110 P_USDT / 10 = 11 contracts
    const contracts = quantity / contractSize;

    // Get cached leverage for this symbol, default to 1 if not set
    const leverage = this.leverageCache.get(normalizedSymbol) || this.leverageCache.get(symbol) || 1;

    console.log(`[MEXCConnector] Placing market ${side} order:`, {
      symbol,
      normalizedSymbol,
      quantity,
      contractSize,
      contracts,
      leverage,
      leverageSource: this.leverageCache.has(normalizedSymbol) ? 'cached' : 'default',
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // Convert BaseExchangeConnector OrderSide to MEXC side
      // MEXC sides: 1: open long, 2: close short, 3: open short, 4: close long
      const mexcSide = side === 'Buy' ? 1 : 3; // Buy = open long, Sell = open short

      const result = await this.mexcService.placeOrder({
        symbol: normalizedSymbol,
        vol: contracts, // Use number of contracts (quantity / contractSize)
        leverage, // Use cached leverage from setLeverage() call
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 5, // Market order
        openType: 2, // Cross margin (default)
      });

      // console.log('[MEXCConnector] Market order placed:', result);
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
    // Normalize symbol to MEXC format
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // Get contract size for this symbol (e.g., P_USDT has contractSize: 10)
    const contractSize = await this.getContractSize(symbol);

    // Convert quantity to number of contracts
    // For example: 110 P_USDT / 10 = 11 contracts
    const contracts = quantity / contractSize;

    // Get cached leverage for this symbol, default to 1 if not set
    const leverage = this.leverageCache.get(normalizedSymbol) || this.leverageCache.get(symbol) || 1;

    console.log(`[MEXCConnector] Placing limit ${side} order:`, {
      symbol,
      normalizedSymbol,
      quantity,
      contractSize,
      contracts,
      price,
      leverage,
      leverageSource: this.leverageCache.has(normalizedSymbol) ? 'cached' : 'default',
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // Convert BaseExchangeConnector OrderSide to MEXC side
      const mexcSide = side === 'Buy' ? 1 : 3; // Buy = open long, Sell = open short

      const result = await this.mexcService.placeOrder({
        symbol: normalizedSymbol,
        price,
        vol: contracts, // Use number of contracts (quantity / contractSize)
        leverage, // Use cached leverage from setLeverage() call
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 1, // Limit order
        openType: 2, // Cross margin (default)
      });

      // console.log('[MEXCConnector] Limit order placed:', result);
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
    const normalizedSymbol = this.normalizeSymbol(symbol);
    console.log(`[MEXCConnector] Canceling order:`, { orderId, symbol, normalizedSymbol });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const result = await this.mexcService.cancelOrder(normalizedSymbol, orderId);
      // console.log('[MEXCConnector] Order canceled:', result);
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
      // console.log('[MEXCConnector] Balance retrieved');
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
    const normalizedSymbol = this.normalizeSymbol(symbol);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const positions = await this.mexcService.getPositions(normalizedSymbol);
      const position = positions.find((p) => p.symbol === normalizedSymbol);

      if (!position || parseFloat(position.holdVol) === 0) {
        return {
          symbol: normalizedSymbol,
          positionType: 'None',
          holdVol: '0',
          holdAvgPrice: '0',
          unrealised: '0',
        };
      }

      // console.log('[MEXCConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[MEXCConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get all positions or positions for a specific symbol
   * Returns an array of positions (compatible with graduated-entry-arbitrage service)
   */
  async getPositions(symbol?: string): Promise<any[]> {
    const normalizedSymbol = symbol ? this.normalizeSymbol(symbol) : undefined;

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const positions = await this.mexcService.getPositions(normalizedSymbol);
      // console.log('[MEXCConnector] Positions retrieved:', positions.length);
      return positions;
    } catch (error: any) {
      console.error('[MEXCConnector] Error getting positions:', error.message);
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
    const normalizedSymbol = this.normalizeSymbol(symbol);
    console.log(`[MEXCConnector] Closing position for ${symbol} (${normalizedSymbol})`);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // First check if there's an open position (getPosition already normalizes)
      const position = await this.getPosition(symbol);

      if (!position || position.positionType === 'None') {
        throw new Error(`No open position for ${normalizedSymbol}`);
      }

      const result = await this.mexcService.closePosition(
        normalizedSymbol,
        position.positionId,
        position.positionType
      );

      // console.log('[MEXCConnector] Position closed:', result);
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
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // Get contract size for this symbol (e.g., P_USDT has contractSize: 10)
    const contractSize = await this.getContractSize(symbol);

    // Convert quantity to number of contracts
    // For example: 110 P_USDT / 10 = 11 contracts
    const contracts = quantity / contractSize;

    console.log(`[MEXCConnector] Placing reduce-only market ${side} order:`, {
      symbol,
      normalizedSymbol,
      quantity,
      contractSize,
      contracts,
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // For MEXC, reduce-only orders are closing orders
      // side 2: close short, side 4: close long
      const mexcSide = side === 'Buy' ? 2 : 4;

      // Get position to get positionId
      const positions = await this.mexcService.getPositions(normalizedSymbol);
      const position = positions.find((p) => p.symbol === normalizedSymbol);

      if (!position) {
        throw new Error(`No position found for ${normalizedSymbol}`);
      }

      const result = await this.mexcService.placeOrder({
        symbol: normalizedSymbol,
        vol: contracts, // Use number of contracts (quantity / contractSize)
        side: mexcSide as 1 | 2 | 3 | 4,
        type: 5, // Market order
        openType: position.openType,
        positionId: position.positionId,
      });

      // console.log('[MEXCConnector] Reduce-only order placed:', result);
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
    // Normalize symbol to MEXC format
    const normalizedSymbol = this.normalizeSymbol(symbol);

    console.log(`[MEXCConnector] Setting leverage for ${symbol}:`, {
      normalizedSymbol,
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
    // Cache for both normalized and original symbol formats
    this.leverageCache.set(normalizedSymbol, leverage);
    this.leverageCache.set(symbol, leverage);
    console.log(`[MEXCConnector] ✓ Cached leverage ${leverage}x for ${normalizedSymbol} (will be used in subsequent orders)`);

    try {
      const result = await this.mexcService.setLeverage(normalizedSymbol, leverage, openType);
      // console.log('[MEXCConnector] ✓ Leverage set successfully via API:', result);
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
    const normalizedSymbol = this.normalizeSymbol(symbol);
    console.log(`[MEXCConnector] Fetching market price for ${symbol} (${normalizedSymbol})`);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      // MEXC uses getTickers() which returns all tickers
      // We need to filter for our specific symbol
      const tickers = await this.mexcService.getTickers();
      const ticker = tickers.find((t) => t.symbol === normalizedSymbol);

      if (!ticker) {
        throw new Error(`No ticker data found for ${normalizedSymbol}`);
      }

      const lastPrice = ticker.lastPrice;

      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid price data for ${normalizedSymbol}: ${ticker.lastPrice}`);
      }

      console.log(`[MEXCConnector] Current price for ${normalizedSymbol}: $${lastPrice}`);
      return lastPrice;
    } catch (error: any) {
      console.error(`[MEXCConnector] Error fetching market price for ${normalizedSymbol}:`, error.message);
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
    const normalizedSymbol = this.normalizeSymbol(symbol);
    console.log(`[MEXCConnector] Subscribing to price stream for ${symbol} (${normalizedSymbol})`);

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
            symbol: normalizedSymbol,
          },
        },
        heartbeatInterval: 20000, // 20 seconds
        reconnectDelay: 1000,
        maxReconnectDelay: 30000,
      };

      // Subscribe using WebSocket manager
      const unsubscribe = await websocketManager.subscribe(
        'mexc',
        normalizedSymbol,
        config,
        (data: any) => {
          try {
            // MEXC WebSocket ticker format:
            // { "channel": "push.ticker", "data": { "lastPrice": 50000.5, "timestamp": 1234567890 }, "symbol": "BTC_USDT" }
            if (data.channel === 'push.ticker' && data.data && data.symbol === normalizedSymbol) {
              const tickerData = data.data;
              const price = parseFloat(tickerData.lastPrice);
              const timestamp = tickerData.timestamp || Date.now();

              if (!isNaN(price) && price > 0) {
                callback(price, timestamp);
              } else {
                console.warn(`[MEXCConnector] Invalid price in WebSocket update for ${normalizedSymbol}:`, tickerData.lastPrice);
              }
            }
          } catch (error: any) {
            console.error(`[MEXCConnector] Error processing WebSocket update for ${normalizedSymbol}:`, error.message);
          }
        }
      );

      console.log(`[MEXCConnector] Successfully subscribed to price stream for ${normalizedSymbol}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[MEXCConnector] Error subscribing to price stream for ${normalizedSymbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Set take-profit and stop-loss for an existing position
   * MEXC doesn't have a direct setTradingStop API, so we implement it using plan orders (conditional orders)
   *
   * @param symbol - Trading pair symbol
   * @param side - Position side (Buy for long, Sell for short)
   * @param takeProfit - Take profit price (optional)
   * @param stopLoss - Stop loss price (optional)
   * @returns Order IDs or confirmation
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
    const normalizedSymbol = this.normalizeSymbol(params.symbol);

    console.log(`[MEXCConnector] Setting trading stop for ${normalizedSymbol}:`, {
      side: params.side,
      takeProfit: params.takeProfit,
      stopLoss: params.stopLoss,
    });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    // Validate at least one parameter is provided
    if (!params.takeProfit && !params.stopLoss) {
      throw new Error('At least one of takeProfit or stopLoss must be provided');
    }

    try {
      // Get current position to determine size
      const position = await this.getPosition(params.symbol);

      // MEXC position uses 'holdVol' field (string), not 'vol'
      const holdVol = parseFloat(position.holdVol || '0');

      if (!position || holdVol === 0) {
        throw new Error(
          `No open position found for ${normalizedSymbol}. ` +
          `Please open a position first before setting take-profit or stop-loss.`
        );
      }

      // Determine position direction from positionType (1 = long, 2 = short)
      const isLongPosition = position.positionType === 1;
      const positionVol = Math.abs(holdVol);

      console.log(`[MEXCConnector] Current position for ${normalizedSymbol}:`, {
        positionId: position.positionId,
        holdVol,
        positionVol,
        positionType: position.positionType,
        isLong: isLongPosition,
        leverage: position.leverage,
      });

      // Get contract size for quantity conversion
      const contractSize = await this.getContractSize(params.symbol);

      // Convert position volume to contracts (MEXC uses contract quantities, not base currency)
      // For example: 200 (base units) / 10 (contract size) = 20 contracts
      const contracts = positionVol / contractSize;

      console.log(`[MEXCConnector] Quantity conversion for ${normalizedSymbol}:`, {
        positionVol,
        contractSize,
        contracts,
      });

      // Check minimum notional value requirement (MEXC requires ~$5 USDT minimum for conditional orders)
      // Use position's average price as current price approximation
      const currentPrice = parseFloat(position.holdAvgPrice || '0');

      if (currentPrice === 0) {
        throw new Error(`Cannot determine current price for ${normalizedSymbol}. Position data may be incomplete.`);
      }

      const notionalValue = positionVol * currentPrice;
      const MIN_NOTIONAL_VALUE = 5; // MEXC minimum order value in USDT

      console.log(`[MEXCConnector] Notional value check for ${normalizedSymbol}:`, {
        currentPrice,
        positionVol,
        notionalValue: notionalValue.toFixed(2),
        minRequired: MIN_NOTIONAL_VALUE,
        meetsMinimum: notionalValue >= MIN_NOTIONAL_VALUE,
      });

      if (notionalValue < MIN_NOTIONAL_VALUE) {
        const errorMessage =
          `Position notional value ($${notionalValue.toFixed(2)}) is below MEXC's minimum requirement ($${MIN_NOTIONAL_VALUE}) for TP/SL orders. ` +
          `MEXC does not support setting stop-loss or take-profit on positions with value below $${MIN_NOTIONAL_VALUE}. ` +
          `To set TP/SL, please increase your position size to at least $${MIN_NOTIONAL_VALUE} (${Math.ceil(MIN_NOTIONAL_VALUE / currentPrice)} units).`;

        console.warn(`[MEXCConnector] ${errorMessage}`);
        throw new Error(errorMessage);
      }

      let takeProfitOrderId: string | undefined;
      let stopLossOrderId: string | undefined;

      // Place Take-Profit order if provided
      // MEXC API field semantics:
      // - takeProfitPrice: Triggers when price RISES to this level
      // - stopLossPrice: Triggers when price FALLS to this level
      //
      // For LONG: TP when price goes UP (use takeProfitPrice)
      // For SHORT: TP when price goes DOWN (use stopLossPrice)
      if (params.takeProfit) {
        console.log(`[MEXCConnector] Placing take-profit order at $${params.takeProfit}`);

        const tpSide = isLongPosition ? 4 : 3; // 4 = close long, 3 = close short

        try {
          const tpOrderPayload = {
            symbol: normalizedSymbol,
            vol: contracts, // Use converted contract quantity
            side: tpSide,
            type: 5, // 5 = market order
            openType: 2, // 2 = cross margin
            positionId: position.positionId, // Required for closing position
            takeProfitPrice: isLongPosition ? params.takeProfit : undefined, // LONG: TP when price rises
            stopLossPrice: !isLongPosition ? params.takeProfit : undefined, // SHORT: TP when price falls
          };

          console.log(`[MEXCConnector] Placing TP order with payload:`, tpOrderPayload);

          const tpOrder = await this.mexcService.placeOrder(tpOrderPayload);

          takeProfitOrderId = tpOrder.orderId || tpOrder.data?.orderId || `TP-${Date.now()}`;
          console.log(`[MEXCConnector] Take-profit order placed: ${takeProfitOrderId}`);
        } catch (tpError: any) {
          console.error(`[MEXCConnector] Failed to place take-profit order:`, tpError.message);
          throw new Error(`Failed to place take-profit order: ${tpError.message}`);
        }
      }

      // Place Stop-Loss order if provided
      // For LONG: SL when price goes DOWN (use stopLossPrice)
      // For SHORT: SL when price goes UP (use takeProfitPrice)
      if (params.stopLoss) {
        console.log(`[MEXCConnector] Placing stop-loss order at $${params.stopLoss}`);

        const slSide = isLongPosition ? 4 : 3; // 4 = close long, 3 = close short

        try {
          const slOrder = await this.mexcService.placeOrder({
            symbol: normalizedSymbol,
            vol: contracts, // Use converted contract quantity
            side: slSide,
            type: 5, // 5 = market order
            openType: 2, // 2 = cross margin
            positionId: position.positionId, // Required for closing position
            stopLossPrice: isLongPosition ? params.stopLoss : undefined, // LONG: SL when price falls
            takeProfitPrice: !isLongPosition ? params.stopLoss : undefined, // SHORT: SL when price rises
          });

          stopLossOrderId = slOrder.orderId || slOrder.data?.orderId || `SL-${Date.now()}`;
          console.log(`[MEXCConnector] Stop-loss order placed: ${stopLossOrderId}`);
        } catch (slError: any) {
          console.error(`[MEXCConnector] Failed to place stop-loss order:`, slError.message);
          throw new Error(`Failed to place stop-loss order: ${slError.message}`);
        }
      }

      // console.log('[MEXCConnector] Trading stop set successfully:', {
      //   symbol: normalizedSymbol,
      //   positionSide: isLongPosition ? 'LONG' : 'SHORT',
      //   takeProfitOrderId,
      //   stopLossOrderId,
      // });

      return {
        success: true,
        takeProfitOrderId,
        stopLossOrderId,
        message: 'Trading stop set successfully',
      };
    } catch (error: any) {
      console.error('[MEXCConnector] Error setting trading stop:', error.message);
      throw new Error(`Failed to set trading stop: ${error.message}`);
    }
  }

  /**
   * Get contract specification for quantity calculations
   * MEXC uses contract sizes (e.g., 10 for many contracts)
   */
  async getContractSpecification(symbol: string): Promise<ContractSpecification> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const contractDetails = await this.mexcService.getContractDetails(normalizedSymbol);
      const contractSize = contractDetails.contractSize || 1;
      const minVol = contractDetails.minVol || 1;
      const maxVol = contractDetails.maxVol || 1000000;

      return {
        exchange: 'MEXC',
        symbol: normalizedSymbol,
        multiplier: contractSize, // MEXC contractSize (e.g., 10 for NMR_USDT)
        minOrderSize: minVol,
        maxOrderSize: maxVol,
      };
    } catch (error: any) {
      console.error(`[MEXCConnector] Error getting contract specification for ${normalizedSymbol}:`, error.message);
      throw error;
    }
  }
}
