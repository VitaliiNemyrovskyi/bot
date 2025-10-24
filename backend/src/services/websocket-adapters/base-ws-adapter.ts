/**
 * Base WebSocket Adapter Interface
 *
 * Abstract interface for exchange-specific WebSocket implementations.
 * Each exchange adapter handles the specifics of connecting to and
 * processing messages from that exchange's WebSocket API.
 */

import { EventEmitter } from 'events';

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export type PriceCallback = (price: number) => void;

/**
 * Abstract base class for exchange WebSocket adapters
 */
export abstract class BaseWebSocketAdapter extends EventEmitter {
  protected isConnected = false;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected subscribers = new Map<string, Set<PriceCallback>>();

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract subscribe(symbol: string): Promise<void>;
  abstract unsubscribe(symbol: string): Promise<void>;
  abstract isHealthy(): boolean;

  /**
   * Register a callback for price updates
   */
  addSubscriber(symbol: string, callback: PriceCallback): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);
  }

  /**
   * Remove a callback for price updates
   */
  removeSubscriber(symbol: string, callback: PriceCallback): void {
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscribers.delete(symbol);
      }
    }
  }

  /**
   * Notify all subscribers of a price update
   */
  protected notifySubscribers(symbol: string, price: number): void {
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.forEach((callback) => {
        try {
          callback(price);
        } catch (error) {
          console.error(
            `[WSAdapter] Error in price callback for ${symbol}:`,
            error
          );
        }
      });
    }

    // Emit global price update event
    this.emit('priceUpdate', {
      symbol,
      price,
      timestamp: Date.now(),
    } as PriceUpdate);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    subscriberCount: number;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriberCount: this.subscribers.size,
    };
  }
}
