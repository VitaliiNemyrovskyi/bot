/**
 * Market Data Manager Service (Universal Multi-Exchange)
 *
 * Centralized WebSocket price data management for triangular arbitrage.
 * Supports multiple exchanges: Bybit, BingX Spot, Gate.io, etc.
 * Each exchange has its own manager instance with exchange-specific WebSocket adapter.
 */

import { EventEmitter } from 'events';
import { BaseWebSocketAdapter, PriceCallback, PriceUpdate } from './websocket-adapters/base-ws-adapter';
import { BybitWebSocketAdapter } from './websocket-adapters/bybit-ws-adapter';
import { BingXSpotWebSocketAdapter } from './websocket-adapters/bingx-spot-ws-adapter';
import { GateIOWebSocketAdapter } from './websocket-adapters/gateio-ws-adapter';
import { BinanceSpotWebSocketAdapter } from './websocket-adapters/binance-spot-ws-adapter';

/**
 * Supported exchanges
 */
export type SupportedExchange = 'BYBIT' | 'BINGX' | 'GATE' | 'GATEIO' | 'BINANCE' | 'MEXC';

/**
 * Market Data Manager
 * Manages WebSocket connections and price subscriptions per exchange
 */
export class MarketDataManager extends EventEmitter {
  // Changed from singleton to multi-instance: Map<exchange, manager>
  private static instances = new Map<SupportedExchange, MarketDataManager>();

  private wsAdapter: BaseWebSocketAdapter;
  private priceCache = new Map<string, number>();
  private subscribers = new Map<string, Set<PriceCallback>>();
  private isInitialized = false;
  private exchange: SupportedExchange;

  private constructor(exchange: SupportedExchange, wsAdapter: BaseWebSocketAdapter) {
    super();
    this.exchange = exchange;
    this.wsAdapter = wsAdapter;

    // Listen to price updates from adapter
    this.wsAdapter.on('priceUpdate', (update: PriceUpdate) => {
      this.handlePriceUpdate(update);
    });

    // Listen to errors from adapter
    this.wsAdapter.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

  /**
   * Get or create manager instance for specific exchange
   */
  static getInstance(exchange: SupportedExchange): MarketDataManager {
    const normalizedExchange = exchange.toUpperCase() as SupportedExchange;

    if (!MarketDataManager.instances.has(normalizedExchange)) {
      // Create exchange-specific WebSocket adapter
      const adapter = MarketDataManager.createAdapter(normalizedExchange);
      const manager = new MarketDataManager(normalizedExchange, adapter);
      MarketDataManager.instances.set(normalizedExchange, manager);

      console.log(`[MarketData] Created new manager instance for ${normalizedExchange}`);
    }

    return MarketDataManager.instances.get(normalizedExchange)!;
  }

  /**
   * Create exchange-specific WebSocket adapter
   */
  private static createAdapter(exchange: SupportedExchange): BaseWebSocketAdapter {
    switch (exchange) {
      case 'BYBIT':
        // Bybit linear futures
        return new BybitWebSocketAdapter(undefined, undefined, 'linear');

      case 'BINGX':
        // BingX spot trading
        return new BingXSpotWebSocketAdapter();

      case 'GATE':
      case 'GATEIO':
        // Gate.io spot trading
        return new GateIOWebSocketAdapter();

      case 'BINANCE':
        // Binance spot trading
        return new BinanceSpotWebSocketAdapter();

      case 'MEXC':
        // TODO: Implement adapter for MEXC
        throw new Error(`Exchange ${exchange} WebSocket adapter not implemented yet. Please use CCXT REST API for now.`);

      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  }

  /**
   * Initialize WebSocket connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.wsAdapter.isHealthy()) {
      console.log(`[MarketData:${this.exchange}] Already initialized`);
      return;
    }

    try {
      // Connect WebSocket adapter
      await this.wsAdapter.connect();

      this.isInitialized = true;
      console.log(`[MarketData:${this.exchange}] Initialized WebSocket connection`);
    } catch (error) {
      console.error(`[MarketData:${this.exchange}] Failed to initialize:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to price updates for a specific symbol
   */
  subscribe(symbol: string, callback: PriceCallback): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());

      // Subscribe via WebSocket adapter
      if (this.wsAdapter) {
        this.wsAdapter.subscribe(symbol).catch((error) => {
          console.error(`[MarketData:${this.exchange}] Error subscribing to ${symbol}:`, error);
        });

        // Add callback to adapter
        this.wsAdapter.addSubscriber(symbol, callback);
      }
    } else {
      // Symbol already subscribed, just add callback
      this.wsAdapter?.addSubscriber(symbol, callback);
    }

    this.subscribers.get(symbol)!.add(callback);
    console.log(`[MarketData:${this.exchange}] Subscribed to ${symbol} (total subscribers: ${this.subscribers.get(symbol)!.size})`);
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribe(symbol: string, callback: PriceCallback): void {
    const subs = this.subscribers.get(symbol);
    if (!subs) return;

    subs.delete(callback);

    // Remove callback from adapter
    this.wsAdapter?.removeSubscriber(symbol, callback);

    // If no more subscribers for this symbol, unsubscribe from WebSocket
    if (subs.size === 0) {
      this.subscribers.delete(symbol);

      if (this.wsAdapter) {
        this.wsAdapter.unsubscribe(symbol).catch((error) => {
          console.error(
            `[MarketData:${this.exchange}] Error unsubscribing from ${symbol}:`,
            error
          );
        });
      }

      console.log(`[MarketData:${this.exchange}] Unsubscribed from ${symbol}`);
    }
  }

  /**
   * Handle price update from WebSocket adapter
   */
  private handlePriceUpdate(update: PriceUpdate): void {
    const { symbol, price, timestamp } = update;

    // Update cache
    this.priceCache.set(symbol, price);

    // Notify all local subscribers
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.forEach((callback) => {
        try {
          callback(price);
        } catch (error) {
          console.error(
            `[MarketData:${this.exchange}] Error in price callback for ${symbol}:`,
            error
          );
        }
      });
    }

    // Emit global price update event
    this.emit('priceUpdate', update);
  }

  /**
   * Get cached price (instant, no API call)
   */
  getPrice(symbol: string): number | null {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Get multiple prices at once
   */
  getPrices(symbols: string[]): Map<string, number> {
    const prices = new Map<string, number>();

    for (const symbol of symbols) {
      const price = this.priceCache.get(symbol);
      if (price) {
        prices.set(symbol, price);
      }
    }

    return prices;
  }

  /**
   * Check if all symbols have cached prices
   */
  hasPrices(symbols: string[]): boolean {
    return symbols.every((symbol) => this.priceCache.has(symbol));
  }

  /**
   * Get number of subscribed symbols
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get manager status
   */
  getStatus(): {
    exchange: string;
    isInitialized: boolean;
    isHealthy: boolean;
    subscribedSymbols: number;
    cachedPrices: number;
    adapterStatus: any;
  } {
    return {
      exchange: this.exchange,
      isInitialized: this.isInitialized,
      isHealthy: this.wsAdapter?.isHealthy() || false,
      subscribedSymbols: this.subscribers.size,
      cachedPrices: this.priceCache.size,
      adapterStatus: this.wsAdapter?.getConnectionStatus(),
    };
  }

  /**
   * Cleanup and close connections
   */
  async cleanup(): Promise<void> {
    if (this.wsAdapter) {
      try {
        await this.wsAdapter.disconnect();
        console.log(`[MarketData:${this.exchange}] Closed WebSocket connections`);
      } catch (error) {
        console.error(`[MarketData:${this.exchange}] Error closing connections:`, error);
      }
    }

    this.subscribers.clear();
    this.priceCache.clear();
    this.isInitialized = false;
  }

  /**
   * Remove instance for specific exchange (for cleanup)
   */
  static async removeInstance(exchange: SupportedExchange): Promise<void> {
    const normalizedExchange = exchange.toUpperCase() as SupportedExchange;
    const instance = MarketDataManager.instances.get(normalizedExchange);

    if (instance) {
      await instance.cleanup();
      MarketDataManager.instances.delete(normalizedExchange);
      console.log(`[MarketData] Removed instance for ${normalizedExchange}`);
    }
  }

  /**
   * Get all active instances (for debugging)
   */
  static getAllInstances(): Map<SupportedExchange, MarketDataManager> {
    return new Map(MarketDataManager.instances);
  }
}

// Legacy export for backwards compatibility (defaults to BYBIT)
// DEPRECATED: Use MarketDataManager.getInstance(exchange) instead
export const marketDataManager = MarketDataManager.getInstance('BYBIT');
