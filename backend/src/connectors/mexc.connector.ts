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
    const normalizedSymbol = this.normalizeSymbol(symbol);
    console.log(`[MEXCConnector] Canceling order:`, { orderId, symbol, normalizedSymbol });

    if (!this.isInitialized) {
      throw new Error('MEXC connector not initialized');
    }

    try {
      const result = await this.mexcService.cancelOrder(normalizedSymbol, orderId);
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

      console.log('[MEXCConnector] Position retrieved:', position);
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
      console.log('[MEXCConnector] Positions retrieved:', positions.length);
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
