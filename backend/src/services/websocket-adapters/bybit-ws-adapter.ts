/**
 * Bybit WebSocket Adapter
 *
 * Handles WebSocket connections and price subscriptions for Bybit exchange.
 * Uses bybit-api SDK for WebSocket management.
 */

import { WebsocketClient } from 'bybit-api';
import { BaseWebSocketAdapter } from './base-ws-adapter';

export class BybitWebSocketAdapter extends BaseWebSocketAdapter {
  private wsClient: WebsocketClient | null = null;
  private subscribedSymbols = new Set<string>();

  constructor(
    private apiKey?: string,
    private apiSecret?: string,
    private market: 'linear' | 'spot' = 'linear'
  ) {
    super();
  }

  /**
   * Connect to Bybit WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.wsClient) {
      console.log('[BybitWSAdapter] Already connected');
      return;
    }

    try {
      // Create WebSocket client
      this.wsClient = new WebsocketClient({
        key: this.apiKey,
        secret: this.apiSecret,
        market: 'v5',
      });

      // Set up event handlers
      this.wsClient.on('update', (data: any) => {
        this.handlePriceUpdate(data);
      });

      this.wsClient.on('error', (error: any) => {
        console.error('[BybitWSAdapter] WebSocket error:', error);
        this.emit('error', error);
      });

      this.wsClient.on('reconnect', () => {
        console.log('[BybitWSAdapter] WebSocket reconnecting...');
        this.reconnectAttempts++;
      });

      this.wsClient.on('reconnected', () => {
        console.log('[BybitWSAdapter] WebSocket reconnected');
        this.reconnectAttempts = 0;
        this.resubscribeAll();
      });

      this.isConnected = true;
      console.log('[BybitWSAdapter] WebSocket connected');
    } catch (error) {
      console.error('[BybitWSAdapter] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Bybit WebSocket
   */
  async disconnect(): Promise<void> {
    if (this.wsClient) {
      try {
        this.wsClient.closeAll();
        console.log('[BybitWSAdapter] Closed WebSocket connections');
      } catch (error) {
        console.error('[BybitWSAdapter] Error closing connections:', error);
      }
    }

    this.subscribedSymbols.clear();
    this.subscribers.clear();
    this.isConnected = false;
    this.wsClient = null;
  }

  /**
   * Subscribe to price updates for a symbol
   */
  async subscribe(symbol: string): Promise<void> {
    if (!this.wsClient) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    try {
      // Use V5 subscription format: subscribeV5('tickers.{symbol}', 'linear')
      this.wsClient.subscribeV5([`tickers.${symbol}`], this.market);
      this.subscribedSymbols.add(symbol);
      console.log(`[BybitWSAdapter] Subscribed to ${symbol}`);
    } catch (error) {
      console.error(`[BybitWSAdapter] Error subscribing to ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from price updates for a symbol
   */
  async unsubscribe(symbol: string): Promise<void> {
    if (!this.wsClient) {
      return;
    }

    try {
      // Use V5 unsubscription format
      this.wsClient.unsubscribeV5([`tickers.${symbol}`], this.market);
      this.subscribedSymbols.delete(symbol);
      console.log(`[BybitWSAdapter] Unsubscribed from ${symbol}`);
    } catch (error) {
      console.error(
        `[BybitWSAdapter] Error unsubscribing from ${symbol}:`,
        error
      );
    }
  }

  /**
   * Check if WebSocket is healthy
   */
  isHealthy(): boolean {
    return this.isConnected && this.wsClient !== null;
  }

  /**
   * Handle price update from WebSocket
   */
  private handlePriceUpdate(data: any): void {
    try {
      // Bybit v5 ticker format
      if (data.topic?.includes('tickers')) {
        const tickerData = data.data;
        const symbol = tickerData.symbol;
        const price = parseFloat(tickerData.lastPrice);

        if (!symbol || !price) return;

        // Notify all subscribers
        this.notifySubscribers(symbol, price);
      }
    } catch (error) {
      console.error('[BybitWSAdapter] Error handling price update:', error);
    }
  }

  /**
   * Resubscribe to all symbols after reconnection
   */
  private resubscribeAll(): void {
    if (!this.wsClient) return;

    const symbols = Array.from(this.subscribedSymbols);
    console.log(`[BybitWSAdapter] Resubscribing to ${symbols.length} symbols`);

    for (const symbol of symbols) {
      try {
        // Use V5 subscription format
        this.wsClient.subscribeV5([`tickers.${symbol}`], this.market);
      } catch (error) {
        console.error(
          `[BybitWSAdapter] Error resubscribing to ${symbol}:`,
          error
        );
      }
    }
  }
}
