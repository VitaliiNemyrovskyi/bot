/**
 * Signal Monitor Service
 *
 * Monitors price and funding rate spreads for arbitrage opportunities
 * and triggers graduated entry when user-defined conditions are met.
 *
 * Features:
 * - Real-time monitoring of price/funding spreads
 * - Automatic graduated entry trigger on signal match
 * - Event-based notifications for frontend
 * - Signal logging and history
 */

import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import { websocketManager } from './websocket-manager.service';
import prisma from '@/lib/prisma';
import { calculateFundingSpread } from '@/lib/funding-spread.utils';
import { calculatePriceSpread } from '@/lib/price-spread.utils';

export interface SignalConfig {
  id: string;
  userId: string;
  symbol: string;
  primaryExchange: string;
  hedgeExchange: string;
  strategy: 'combined' | 'price_only';

  // Entry conditions
  minPriceSpreadPercent: number;
  minFundingSpreadPercent?: number; // Only for combined strategy

  // Position sides (for funding spread calculation)
  primarySide: 'long' | 'short';
  hedgeSide: 'long' | 'short';

  // Order parameters (for graduated entry)
  quantity: number;
  leverage: number;
  graduatedParts: number;
  graduatedDelayMs: number;

  // Metadata
  createdAt: Date;
  status: 'active' | 'triggered' | 'cancelled';
  triggeredAt?: Date;
}

export interface SignalTriggerEvent {
  signalId: string;
  symbol: string;
  primaryExchange: string;
  hedgeExchange: string;
  priceSpreadPercent: number;
  fundingSpreadPercent?: number;
  primaryPrice: number;
  hedgePrice: number;
  primaryFundingRate?: number;
  hedgeFundingRate?: number;
  timestamp: Date;
}

interface PriceData {
  exchange: string;
  symbol: string;
  price: number;
  fundingRate: number | null;
  fundingInterval: number | null; // Funding interval in hours (1, 4, 8)
  timestamp: number;
}

// Global shared event emitter for cross-instance communication
const globalForSignalEvents = globalThis as unknown as {
  signalMonitorEvents?: EventEmitter;
};

if (!globalForSignalEvents.signalMonitorEvents) {
  globalForSignalEvents.signalMonitorEvents = new EventEmitter();
  globalForSignalEvents.signalMonitorEvents.setMaxListeners(100); // Allow many SSE streams
}

// Global state for preventing re-initialization
const globalForSignalInit = globalThis as unknown as {
  signalMonitorInitialized?: boolean;
};

export class SignalMonitorService {
  // Use shared event emitter instead of extending EventEmitter
  private sharedEvents: EventEmitter = globalForSignalEvents.signalMonitorEvents!;
  private activeSignals: Map<string, SignalConfig> = new Map();
  private priceCache: Map<string, PriceData> = new Map(); // key: "EXCHANGE:SYMBOL"
  private unsubscribeFunctions: Map<string, () => void> = new Map();
  private fundingRateUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Prevent re-initialization using global flag (for HMR/multiple imports)
    if (globalForSignalInit.signalMonitorInitialized) {
      console.log('[SignalMonitor] Already initialized globally, skipping re-initialization');
      return;
    }

    console.log('[SignalMonitor] Service initialized');
    globalForSignalInit.signalMonitorInitialized = true;

    // Update funding rates from DB every 5 minutes
    this.fundingRateUpdateInterval = setInterval(() => {
      this.updateFundingRatesFromDB();
    }, 5 * 60 * 1000);

    // Restore active signals from database
    this.restoreSignalsFromDB().catch((error) => {
      console.error('[SignalMonitor] Failed to restore signals from DB:', error.message);
    });
  }

  // Public event emitter methods for SSE routes to use
  on(event: string, listener: (...args: any[]) => void): void {
    this.sharedEvents.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.sharedEvents.off(event, listener);
  }

  private emit(event: string, data: any): void {
    const listenerCount = this.sharedEvents.listenerCount(event);
    console.log(`[SignalMonitor] Emitting '${event}' to ${listenerCount} listener(s)`);
    this.sharedEvents.emit(event, data);
  }

  /**
   * Fetch funding rates from database and update price cache
   */
  private async updateFundingRatesFromDB(): Promise<void> {
    try {
      // Only update for active signals
      if (this.activeSignals.size === 0) return;

      const symbols = new Set<string>();
      const exchanges = new Set<string>();

      // Collect unique symbols and exchanges from active signals
      for (const signal of this.activeSignals.values()) {
        symbols.add(signal.symbol);
        exchanges.add(signal.primaryExchange);
        exchanges.add(signal.hedgeExchange);
      }

      // Fetch latest funding rates from DB
      const fundingRates = await prisma.publicFundingRate.findMany({
        where: {
          symbol: { in: Array.from(symbols).map(s => s.replace('USDT', '/USDT')) },
          exchange: { in: Array.from(exchanges) as any },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      });

      // Update price cache with funding rates
      for (const rate of fundingRates) {
        const symbol = rate.symbol.replace('/', ''); // "BTC/USDT" -> "BTCUSDT"
        const cacheKey = `${rate.exchange}:${symbol}`;

        const existingData = this.priceCache.get(cacheKey);
        if (existingData) {
          // Update funding rate and interval but keep existing price
          existingData.fundingRate = rate.fundingRate;
          existingData.fundingInterval = rate.fundingInterval;
          this.priceCache.set(cacheKey, existingData);
        } else {
          // Create new entry with funding rate only
          this.priceCache.set(cacheKey, {
            exchange: rate.exchange,
            symbol: symbol,
            price: 0, // Will be updated by WebSocket
            fundingRate: rate.fundingRate,
            fundingInterval: rate.fundingInterval,
            timestamp: Date.now(),
          });
        }
      }

      console.log(`[SignalMonitor] Updated funding rates for ${fundingRates.length} pairs from DB`);
    } catch (error: any) {
      console.error('[SignalMonitor] Error updating funding rates from DB:', error.message);
    }
  }

  /**
   * Restore active signals from database on service initialization
   */
  private async restoreSignalsFromDB(): Promise<void> {
    try {
      console.log('[SignalMonitor] Restoring active signals from database...');

      // Fetch all active signals from DB
      const activeSignalsFromDB = await prisma.activeSignal.findMany({
        where: {
          status: 'active',
        },
      });

      if (activeSignalsFromDB.length === 0) {
        console.log('[SignalMonitor] No active signals to restore');
        return;
      }

      console.log(`[SignalMonitor] Found ${activeSignalsFromDB.length} active signals to restore`);

      // Restore each signal
      for (const dbSignal of activeSignalsFromDB) {
        try {
          // Validate position sides exist (required for price spread calculation)
          if (!dbSignal.primarySide || !dbSignal.hedgeSide) {
            console.warn(`[SignalMonitor] Skipping signal ${dbSignal.id} - missing position sides (old signal)`);
            continue;
          }

          const signal: SignalConfig = {
            id: dbSignal.id,
            userId: dbSignal.userId,
            symbol: dbSignal.symbol,
            primaryExchange: dbSignal.primaryExchange,
            hedgeExchange: dbSignal.hedgeExchange,
            primarySide: dbSignal.primarySide as 'long' | 'short',
            hedgeSide: dbSignal.hedgeSide as 'long' | 'short',
            strategy: dbSignal.strategy as 'combined' | 'price_only',
            minPriceSpreadPercent: dbSignal.minPriceSpreadPercent,
            minFundingSpreadPercent: dbSignal.minFundingSpreadPercent || undefined,
            quantity: dbSignal.quantity,
            leverage: dbSignal.leverage,
            graduatedParts: dbSignal.graduatedParts,
            graduatedDelayMs: dbSignal.graduatedDelayMs,
            createdAt: dbSignal.createdAt,
            status: 'active',
          };

          // Add to active signals map
          this.activeSignals.set(signal.id, signal);

          // Subscribe to price streams for both exchanges
          await this.subscribeToExchange(signal.id, signal.primaryExchange, signal.symbol);
          await this.subscribeToExchange(signal.id, signal.hedgeExchange, signal.symbol);

          console.log(`[SignalMonitor] ✅ Restored signal ${signal.id} for ${signal.symbol}`);
        } catch (error: any) {
          console.error(`[SignalMonitor] Failed to restore signal ${dbSignal.id}:`, error.message);
        }
      }

      // Load funding rates immediately after restoration
      await this.updateFundingRatesFromDB();

      console.log(`[SignalMonitor] Successfully restored ${this.activeSignals.size} signals`);
    } catch (error: any) {
      console.error('[SignalMonitor] Error restoring signals from DB:', error.message);
    }
  }

  /**
   * Save signal to database
   */
  private async saveSignalToDB(signal: SignalConfig): Promise<void> {
    try {
      await prisma.activeSignal.create({
        data: {
          id: signal.id,
          userId: signal.userId,
          symbol: signal.symbol,
          primaryExchange: signal.primaryExchange,
          hedgeExchange: signal.hedgeExchange,
          primarySide: signal.primarySide, // Save position sides for price spread calculation
          hedgeSide: signal.hedgeSide,     // Save position sides for price spread calculation
          strategy: signal.strategy,
          minPriceSpreadPercent: signal.minPriceSpreadPercent,
          minFundingSpreadPercent: signal.minFundingSpreadPercent,
          quantity: signal.quantity,
          leverage: signal.leverage,
          graduatedParts: signal.graduatedParts,
          graduatedDelayMs: signal.graduatedDelayMs,
          status: signal.status,
          createdAt: signal.createdAt,
        },
      });

      console.log(`[SignalMonitor] Saved signal ${signal.id} to database`);
    } catch (error: any) {
      console.error(`[SignalMonitor] Failed to save signal ${signal.id} to DB:`, error.message);
    }
  }

  /**
   * Update signal status in database
   */
  private async updateSignalInDB(signalId: string, status: string, triggeredAt?: Date): Promise<void> {
    try {
      await prisma.activeSignal.update({
        where: { id: signalId },
        data: {
          status,
          triggeredAt,
        },
      });

      console.log(`[SignalMonitor] Updated signal ${signalId} in database (status: ${status})`);
    } catch (error: any) {
      console.error(`[SignalMonitor] Failed to update signal ${signalId} in DB:`, error.message);
    }
  }

  /**
   * Start monitoring a new signal
   */
  async startSignal(config: Omit<SignalConfig, 'id' | 'createdAt' | 'status'>): Promise<SignalConfig> {
    const signal: SignalConfig = {
      ...config,
      id: uuidv4(),
      createdAt: new Date(),
      status: 'active',
    };

    console.log(`[SignalMonitor] Starting signal ${signal.id} for ${signal.symbol}`);

    // Validate strategy-specific conditions
    if (signal.strategy === 'combined' && signal.minFundingSpreadPercent === undefined) {
      throw new Error('minFundingSpreadPercent is required for combined strategy');
    }

    // Store signal in memory
    this.activeSignals.set(signal.id, signal);

    // Save signal to database for persistence across restarts
    await this.saveSignalToDB(signal);

    // Subscribe to price streams for both exchanges
    await this.subscribeToExchange(signal.id, signal.primaryExchange, signal.symbol);
    await this.subscribeToExchange(signal.id, signal.hedgeExchange, signal.symbol);

    // Load funding rates from database immediately
    await this.updateFundingRatesFromDB();

    // Emit event for SSE subscribers
    this.emit('signal_started', {
      type: 'signal_started',
      signal,
      timestamp: new Date(),
    });

    // Log to database
    await this.logSignalEvent(signal.id, 'started', signal);

    return signal;
  }

  /**
   * Stop/cancel an active signal
   */
  async stopSignal(signalId: string, reason: 'cancelled' | 'triggered' = 'cancelled'): Promise<void> {
    const signal = this.activeSignals.get(signalId);
    if (!signal) {
      throw new Error(`Signal ${signalId} not found`);
    }

    console.log(`[SignalMonitor] Stopping signal ${signalId} - reason: ${reason}`);

    // Update status
    signal.status = reason === 'triggered' ? 'triggered' : 'cancelled';
    const triggeredAt = reason === 'triggered' ? new Date() : undefined;
    if (triggeredAt) {
      signal.triggeredAt = triggeredAt;
    }

    // Update signal status in database
    await this.updateSignalInDB(signalId, signal.status, triggeredAt);

    // Unsubscribe from price streams
    this.unsubscribeFromSignal(signalId);

    // Remove from active signals
    this.activeSignals.delete(signalId);

    // Emit event
    this.emit('signal_stopped', {
      type: 'signal_stopped',
      signalId,
      reason,
      timestamp: new Date(),
    });

    // Log to database
    await this.logSignalEvent(signalId, reason, signal);

    console.log(`[SignalMonitor] Signal ${signalId} stopped`);
  }

  /**
   * Get status of a specific signal
   */
  getSignalStatus(signalId: string): SignalConfig | null {
    return this.activeSignals.get(signalId) || null;
  }

  /**
   * Get all active signals for a user
   */
  getActiveSignals(userId: string): SignalConfig[] {
    return Array.from(this.activeSignals.values()).filter(
      (signal) => signal.userId === userId
    );
  }

  /**
   * Get all active signals
   */
  getAllActiveSignals(): SignalConfig[] {
    return Array.from(this.activeSignals.values());
  }

  /**
   * Subscribe to exchange price/funding updates
   */
  private async subscribeToExchange(
    signalId: string,
    exchange: string,
    symbol: string
  ): Promise<void> {
    console.log(`[SignalMonitor] 🔌 Subscribing to ${exchange}:${symbol} for signal ${signalId}`);

    const wsConfig = this.buildWebSocketConfig(exchange, symbol);

    const unsubscribe = await websocketManager.subscribe(
      exchange,
      symbol,
      wsConfig,
      (data: any) => {
        this.handlePriceUpdate(signalId, exchange, symbol, data);
      }
    );

    // Store unsubscribe function
    const key = `${signalId}:${exchange}:${symbol}`;
    this.unsubscribeFunctions.set(key, unsubscribe);

    console.log(`[SignalMonitor] ✅ Subscribed to ${exchange}:${symbol} for signal ${signalId}`);
  }

  /**
   * Unsubscribe from all streams for a signal
   */
  private unsubscribeFromSignal(signalId: string): void {
    const keysToRemove: string[] = [];

    for (const [key, unsubscribe] of this.unsubscribeFunctions.entries()) {
      if (key.startsWith(`${signalId}:`)) {
        try {
          unsubscribe();
          keysToRemove.push(key);
        } catch (error: any) {
          console.error(`[SignalMonitor] Error unsubscribing from ${key}:`, error.message);
        }
      }
    }

    // Clean up
    keysToRemove.forEach((key) => this.unsubscribeFunctions.delete(key));
  }

  /**
   * Build WebSocket configuration for exchange
   */
  private buildWebSocketConfig(exchange: string, symbol: string): any {
    if (exchange === 'BYBIT') {
      return {
        url: 'wss://stream.bybit.com/v5/public/linear',
        subscribeMessage: {
          op: 'subscribe',
          args: [`tickers.${symbol}`],
        },
        heartbeatInterval: 20000,
      };
    } else if (exchange === 'BINGX') {
      const bingxSymbol = symbol.replace(/USDT$/, '-USDT');
      return {
        url: 'wss://open-api-swap.bingx.com/swap-market',
        subscribeMessage: {
          id: Date.now().toString(),
          reqType: 'sub',
          dataType: `${bingxSymbol}@ticker`,
        },
        heartbeatInterval: 30000,
        compression: 'gzip',
      };
    } else if (exchange === 'MEXC') {
      const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT');
      return {
        url: 'wss://contract.mexc.com/edge',
        subscribeMessage: {
          method: 'sub.ticker',
          param: {
            symbol: mexcSymbol,
          },
        },
        heartbeatInterval: 15000,
      };
    } else if (exchange === 'GATEIO') {
      // GATEIO requires underscore format: BTC_USDT (not BTCUSDT)
      const base = symbol.slice(0, -4);
      const gateioSymbol = `${base}_USDT`;
      return {
        url: 'wss://fx-ws.gateio.ws/v4/ws/usdt',
        subscribeMessage: {
          time: Math.floor(Date.now() / 1000),
          channel: 'futures.tickers',
          event: 'subscribe',
          payload: [gateioSymbol],
        },
        heartbeatInterval: 30000,
      };
    } else if (exchange === 'OKX') {
      // OKX uses format: BTC-USDT-SWAP for perpetual swaps
      const okxSymbol = symbol.replace(/USDT$/, '-USDT-SWAP');
      return {
        url: 'wss://ws.okx.com:8443/ws/v5/public',
        subscribeMessage: {
          op: 'subscribe',
          args: [
            {
              channel: 'tickers',
              instId: okxSymbol,
            },
          ],
        },
        heartbeatInterval: 30000,
      };
    }

    throw new Error(`Unsupported exchange: ${exchange}`);
  }

  /**
   * Handle price/funding update from exchange
   */
  private handlePriceUpdate(
    signalId: string,
    exchange: string,
    symbol: string,
    data: any
  ): void {
    const signal = this.activeSignals.get(signalId);
    if (!signal) {
      return;
    }

    const cacheKey = `${exchange}:${symbol}`;
    const cachedData = this.priceCache.get(cacheKey);

    // Parse price and funding rate from exchange-specific format
    let price: number | null = null;
    let fundingRate: number | null | undefined = undefined; // undefined = not provided in ticker

    try {
      if (exchange === 'BYBIT') {
        if (data.topic && data.topic.startsWith('tickers.') && data.data) {
          const tickerData = Array.isArray(data.data) ? data.data[0] : data.data;

          // Handle both snapshot and delta messages
          if (tickerData.lastPrice) {
            // Snapshot message with full data
            price = parseFloat(tickerData.lastPrice);
            // Only set fundingRate if provided (don't default to 0)
            fundingRate = tickerData.fundingRate !== undefined && tickerData.fundingRate !== null
              ? parseFloat(tickerData.fundingRate)
              : undefined;
            console.log(`[SignalMonitor] ✅ Parsed BYBIT snapshot: price=${price}, funding=${fundingRate}`);
          } else {
            // Delta message - use cached price or calculate from bid/ask
            if (cachedData && cachedData.price > 0) {
              price = cachedData.price;
              fundingRate = undefined; // Don't update fundingRate on delta, preserve existing
              console.log(`[SignalMonitor] ✅ BYBIT delta - using cached price: ${price}`);
            } else if (tickerData.bid1Price && tickerData.ask1Price) {
              // Calculate mid-price from bid/ask
              price = (parseFloat(tickerData.bid1Price) + parseFloat(tickerData.ask1Price)) / 2;
              fundingRate = undefined; // Don't update fundingRate on delta, preserve existing
              console.log(`[SignalMonitor] ✅ BYBIT delta - calculated from bid/ask: ${price}`);
            }
          }
        }
      } else if (exchange === 'BINGX') {
        if (data.dataType && data.dataType.includes('@ticker') && data.data) {
          price = parseFloat(data.data.c || '0');
          // Only set fundingRate if provided (don't default to 0)
          fundingRate = data.data.r !== undefined && data.data.r !== null
            ? parseFloat(data.data.r)
            : undefined;
          console.log(`[SignalMonitor] ✅ Parsed BINGX data: price=${price}, funding=${fundingRate}`);
        }
      } else if (exchange === 'MEXC') {
        if (data.channel === 'push.ticker' && data.data) {
          price = parseFloat(data.data.lastPrice || '0');
          // Only set fundingRate if provided (don't default to 0)
          fundingRate = data.data.fundingRate !== undefined && data.data.fundingRate !== null
            ? parseFloat(data.data.fundingRate)
            : undefined;
          console.log(`[SignalMonitor] ✅ Parsed MEXC data: price=${price}, funding=${fundingRate}`);
        }
      } else if (exchange === 'GATEIO') {
        // Log ALL Gate.io messages for debugging
        console.log(`[SignalMonitor] 🔍 Gate.io RAW message:`, JSON.stringify(data));

        if (data.event === 'subscribe' && data.channel === 'futures.tickers') {
          // Subscription confirmation - this is expected, just log it
          console.log(`[SignalMonitor] ✅ Gate.io subscription confirmed for channel: ${data.channel}`);
        } else if (data.event === 'update' && data.channel === 'futures.tickers' && data.result) {
          const tickerData = Array.isArray(data.result) ? data.result[0] : data.result;
          price = parseFloat(tickerData.last || '0');
          // Gate.io ticker doesn't include funding interval, so we get funding from DB
          // (funding rate without interval is useless for hourly spread calculation)
          console.log(`[SignalMonitor] ✅ Parsed GATEIO data: price=${price}, ticker:`, tickerData);
        } else {
          console.log(`[SignalMonitor] ⚠️ GATEIO unexpected format:`, {
            event: data.event,
            channel: data.channel,
            hasResult: !!data.result,
            fullData: data
          });
        }
      } else if (exchange === 'OKX') {
        if (data.arg && data.arg.channel === 'tickers' && data.data) {
          const tickerData = Array.isArray(data.data) ? data.data[0] : data.data;
          price = parseFloat(tickerData.last || '0');
          // Only set fundingRate if provided (don't default to 0)
          fundingRate = tickerData.fundingRate !== undefined && tickerData.fundingRate !== null
            ? parseFloat(tickerData.fundingRate)
            : undefined;
          console.log(`[SignalMonitor] ✅ Parsed OKX data: price=${price}, funding=${fundingRate}`);
        }
      }

      if (price && price > 0) {
        // Update price cache
        // Note: fundingInterval will be updated from DB via updateFundingRatesFromDB()
        const existingCache = this.priceCache.get(cacheKey);
        const newFundingRate = fundingRate !== undefined ? fundingRate : (existingCache?.fundingRate || null);

        this.priceCache.set(cacheKey, {
          exchange,
          symbol,
          price,
          // Preserve existing funding rate if new one is not provided (e.g., Gate.io doesn't send it in ticker)
          fundingRate: newFundingRate,
          fundingInterval: existingCache?.fundingInterval || null, // Preserve existing interval
          timestamp: Date.now(),
        });

        // console.log(`[SignalMonitor] 💾 Cache updated for ${cacheKey}: price=${price}, fundingRate=${newFundingRate} (was: ${existingCache?.fundingRate}, new: ${fundingRate})`);

        // Check if conditions are met
        this.checkSignalConditions(signal);
      }
    } catch (error: any) {
      console.error(`[SignalMonitor] Error processing ${exchange}:${symbol} data:`, error.message);
    }
  }

  /**
   * Check if signal conditions are met
   */
  private checkSignalConditions(signal: SignalConfig): void {
    // Get cached prices for both exchanges
    const primaryKey = `${signal.primaryExchange}:${signal.symbol}`;
    const hedgeKey = `${signal.hedgeExchange}:${signal.symbol}`;

    const primaryData = this.priceCache.get(primaryKey);
    const hedgeData = this.priceCache.get(hedgeKey);

    console.log(`[SignalMonitor] 🔍 Checking conditions for ${signal.symbol}:`, {
      primary: primaryData ? `${primaryData.price}` : 'N/A',
      hedge: hedgeData ? `${hedgeData.price}` : 'N/A',
      hasPrimary: !!primaryData,
      hasHedge: !!hedgeData,
      primaryValid: primaryData ? primaryData.price > 0 : false,
      hedgeValid: hedgeData ? hedgeData.price > 0 : false
    });

    // Need both prices with valid values (price > 0)
    if (!primaryData || !hedgeData || primaryData.price <= 0 || hedgeData.price <= 0) {
      console.log(`[SignalMonitor] ⚠️ Skipping - prices not ready`);
      return; // Silently skip until both prices are valid
    }

    // Calculate price spread using centralized utility: SHORT - LONG
    const priceSpreadResult = calculatePriceSpread(
      primaryData.price,
      hedgeData.price,
      signal.primarySide,
      signal.hedgeSide
    );
    const priceSpread = priceSpreadResult.spreadUsdt;
    const priceSpreadPercent = priceSpreadResult.spreadPercent;

    // Check price spread condition (WITHOUT absolute value - must be positive)
    // Positive spread means short > long, which is favorable for arbitrage
    const priceConditionMet = priceSpreadPercent >= signal.minPriceSpreadPercent;

    // Check funding spread condition (if combined strategy)
    let fundingConditionMet = true;
    let fundingSpreadPercent: number | undefined = undefined;

    // Calculate funding spread if both rates are available
    if (signal.strategy === 'combined' && signal.minFundingSpreadPercent !== undefined) {
      // Only calculate if both funding rates are available
      if (primaryData.fundingRate !== null && hedgeData.fundingRate !== null) {
        // Get funding intervals (default to 8h if not available)
        const primaryInterval = primaryData.fundingInterval || 8;
        const hedgeInterval = hedgeData.fundingInterval || 8;

        // Funding rates from API are in decimal format (0.0001 = 0.01%)
        // Calculate hourly funding spread using utility function
        // Use position sides from signal config
        const hourlyFundingProfit = calculateFundingSpread(
          primaryData.fundingRate,
          hedgeData.fundingRate,
          primaryInterval,
          hedgeInterval,
          signal.primarySide,
          signal.hedgeSide
        );

        // Convert to percentage for comparison
        fundingSpreadPercent = hourlyFundingProfit * 100;
        fundingConditionMet = fundingSpreadPercent >= signal.minFundingSpreadPercent;

        console.log(`[SignalMonitor] Funding spread calculation:`, {
          primary: `${(primaryData.fundingRate * 100).toFixed(4)}% / ${primaryInterval}h = ${(primaryData.fundingRate / primaryInterval * 100).toFixed(4)}%/h (${signal.primarySide})`,
          hedge: `${(hedgeData.fundingRate * 100).toFixed(4)}% / ${hedgeInterval}h = ${(hedgeData.fundingRate / hedgeInterval * 100).toFixed(4)}%/h (${signal.hedgeSide})`,
          hourlyProfit: `${hourlyFundingProfit.toFixed(6)} (${fundingSpreadPercent.toFixed(4)}%)`,
          required: `${signal.minFundingSpreadPercent}%`,
          met: fundingConditionMet
        });
      } else {
        // Funding rates not yet available - don't meet combined strategy conditions
        fundingConditionMet = false;
      }
    }

    // ALWAYS emit price update event (even if funding rates not available)
    const priceUpdateData = {
      type: 'price_update',
      signalId: signal.id,
      symbol: signal.symbol,
      primaryExchange: signal.primaryExchange,
      hedgeExchange: signal.hedgeExchange,
      primaryPrice: primaryData.price,
      hedgePrice: hedgeData.price,
      priceSpreadPercent,
      priceSpreadUsdt: priceSpread, // Add USDT spread for display
      primaryFundingRate: primaryData.fundingRate,
      hedgeFundingRate: hedgeData.fundingRate,
      fundingSpreadPercent,
      priceConditionMet,
      fundingConditionMet,
      timestamp: new Date(),
    };

    // console.log(`[SignalMonitor] 📊 Price update data:`, {
    //   symbol: signal.symbol,
    //   fundingSpreadPercent,
    //   primaryFundingRate: primaryData.fundingRate,
    //   hedgeFundingRate: hedgeData.fundingRate,
    //   strategy: signal.strategy,
    // });

    this.emit('price_update', priceUpdateData);

    // Check if all conditions are met
    if (priceConditionMet && fundingConditionMet) {
      console.log(`[SignalMonitor] 🎯 Signal ${signal.id} conditions MET!`);
      console.log(`  Price Spread: ${priceSpreadPercent.toFixed(4)}% (short - long >= ${signal.minPriceSpreadPercent}%)`);
      if (fundingSpreadPercent !== undefined) {
        console.log(`  Funding Spread: ${fundingSpreadPercent.toFixed(4)}% >= ${signal.minFundingSpreadPercent}%`);
      }

      // Trigger signal
      this.triggerSignal(signal, {
        priceSpreadPercent,
        fundingSpreadPercent,
        primaryPrice: primaryData.price,
        hedgePrice: hedgeData.price,
        primaryFundingRate: primaryData.fundingRate || undefined,
        hedgeFundingRate: hedgeData.fundingRate || undefined,
      });
    }
  }

  /**
   * Trigger signal and initiate graduated entry
   */
  private async triggerSignal(
    signal: SignalConfig,
    triggerData: {
      priceSpreadPercent: number;
      fundingSpreadPercent?: number;
      primaryPrice: number;
      hedgePrice: number;
      primaryFundingRate?: number;
      hedgeFundingRate?: number;
    }
  ): Promise<void> {
    console.log(`[SignalMonitor] ✅ Triggering signal ${signal.id}`);

    const triggerEvent: SignalTriggerEvent = {
      signalId: signal.id,
      symbol: signal.symbol,
      primaryExchange: signal.primaryExchange,
      hedgeExchange: signal.hedgeExchange,
      priceSpreadPercent: triggerData.priceSpreadPercent,
      fundingSpreadPercent: triggerData.fundingSpreadPercent,
      primaryPrice: triggerData.primaryPrice,
      hedgePrice: triggerData.hedgePrice,
      primaryFundingRate: triggerData.primaryFundingRate,
      hedgeFundingRate: triggerData.hedgeFundingRate,
      timestamp: new Date(),
    };

    // Emit trigger event
    this.emit('signal_triggered', {
      type: 'signal_triggered',
      ...triggerEvent,
    });

    // Stop signal (status = triggered)
    await this.stopSignal(signal.id, 'triggered');

    // Note: Graduated entry will be initiated by the frontend
    // when it receives the 'signal_triggered' event via SSE
  }

  /**
   * Log signal event to database
   */
  private async logSignalEvent(
    signalId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    try {
      await prisma.signalLog.create({
        data: {
          signalId,
          eventType,
          data: JSON.stringify(data),
          createdAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error(`[SignalMonitor] Failed to log signal event:`, error.message);
    }
  }

  /**
   * Cleanup all signals and connections
   */
  cleanup(): void {
    console.log(`[SignalMonitor] Cleaning up ${this.activeSignals.size} active signals`);

    for (const signalId of Array.from(this.activeSignals.keys())) {
      this.unsubscribeFromSignal(signalId);
    }

    // Clear funding rate update interval
    if (this.fundingRateUpdateInterval) {
      clearInterval(this.fundingRateUpdateInterval);
      this.fundingRateUpdateInterval = null;
    }

    this.activeSignals.clear();
    this.priceCache.clear();
    this.unsubscribeFunctions.clear();
    this.sharedEvents.removeAllListeners();

    console.log('[SignalMonitor] Cleanup complete');
  }
}

// Export singleton instance with global persistence (prevents multiple instances during HMR)
const globalForSignalMonitor = globalThis as unknown as {
  signalMonitor: SignalMonitorService | undefined;
};

export const signalMonitor =
  globalForSignalMonitor.signalMonitor ?? new SignalMonitorService();

if (process.env.NODE_ENV !== 'production') {
  globalForSignalMonitor.signalMonitor = signalMonitor;
}
