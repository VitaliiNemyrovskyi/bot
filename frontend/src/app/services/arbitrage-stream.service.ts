import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Real-time price update from SSE stream
 */
export interface PriceUpdate {
  type: 'price_update';
  symbol: string;
  exchange: string;
  credentialId: string;
  price: number;
  spread: string;
  spreadPercent: string;
  timestamp: number;
}

/**
 * Connection status message
 */
export interface ConnectionMessage {
  type: 'connected';
  userId: string;
  symbols: string[];
  exchangeCount: number;
  timestamp: number;
}

/**
 * Error message from stream
 */
export interface ErrorMessage {
  type: 'error';
  exchange: string;
  symbol: string;
  message: string;
  timestamp: number;
}

/**
 * Any stream message type
 */
export type StreamMessage = PriceUpdate | ConnectionMessage | ErrorMessage;

/**
 * Stream configuration for subscribing to arbitrage opportunities
 */
export interface StreamSubscription {
  symbols: string[];
  exchanges: Array<{
    exchange: string;
    symbol: string;
    credentialId: string;
    apiKey?: string;
    apiSecret?: string;
    authToken?: string;
    environment: string;
  }>;
}

/**
 * ArbitrageStreamService
 *
 * Service for consuming real-time arbitrage price updates via Server-Sent Events (SSE).
 * Manages the connection lifecycle, handles reconnection, and distributes updates to subscribers.
 */
@Injectable({
  providedIn: 'root'
})
export class ArbitrageStreamService implements OnDestroy {
  private eventSource: EventSource | null = null;
  private reconnectTimer: any = null;
  private destroy$ = new Subject<void>();

  // Connection state
  private connectionState$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Stream data
  private priceUpdates$ = new Subject<PriceUpdate>();
  private errors$ = new Subject<ErrorMessage>();

  // Price cache for quick access
  private priceCache = new Map<string, { price: number; timestamp: number; change: 'up' | 'down' | 'neutral' }>();

  constructor() {
    console.log('[ArbitrageStream] Service initialized');
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get connection state observable
   */
  getConnectionState(): Observable<'disconnected' | 'connecting' | 'connected'> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get price updates observable
   */
  getPriceUpdates(): Observable<PriceUpdate> {
    return this.priceUpdates$.asObservable();
  }

  /**
   * Get errors observable
   */
  getErrors(): Observable<ErrorMessage> {
    return this.errors$.asObservable();
  }

  /**
   * Get cached price for a specific exchange-symbol pair
   */
  getCachedPrice(exchange: string, symbol: string): { price: number; timestamp: number; change: 'up' | 'down' | 'neutral' } | null {
    const key = `${exchange}:${symbol}`;
    return this.priceCache.get(key) || null;
  }

  /**
   * Subscribe to real-time price updates for arbitrage opportunities
   *
   * @param subscription - Configuration for symbols and exchanges to monitor
   * @param authToken - JWT authentication token
   */
  subscribe(subscription: StreamSubscription, authToken: string): void {
    // Disconnect existing connection if any
    if (this.eventSource) {
      console.log('[ArbitrageStream] Closing existing connection');
      this.disconnect();
    }

    console.log('[ArbitrageStream] Connecting to SSE stream');
    this.connectionState$.next('connecting');

    // Build query parameters
    const symbols = subscription.symbols.join(',');
    const exchanges = JSON.stringify(subscription.exchanges);

    // Construct SSE URL with auth token as query parameter
    // Note: EventSource doesn't support custom headers, so we pass token via URL
    const baseUrl = environment.apiUrl || '/api';
    const url = `${baseUrl}/arbitrage/funding-rates/stream?symbols=${encodeURIComponent(symbols)}&exchanges=${encodeURIComponent(exchanges)}&token=${encodeURIComponent(authToken)}`;

    console.log('[ArbitrageStream] Connecting to:', url);

    // Create EventSource connection
    this.eventSource = new EventSource(url);

    // Handle connection open
    this.eventSource.onopen = () => {
      console.log('[ArbitrageStream] ✅ Connected to SSE stream');
      this.connectionState$.next('connected');

      // Clear reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    // Handle incoming messages
    this.eventSource.onmessage = (event: MessageEvent) => {
      try {
        const message: StreamMessage = JSON.parse(event.data);

        if (message.type === 'connected') {
          console.log('[ArbitrageStream] Connection confirmed:', message);
        } else if (message.type === 'price_update') {
          this.handlePriceUpdate(message as PriceUpdate);
        } else if (message.type === 'error') {
          console.error('[ArbitrageStream] Stream error:', message);
          this.errors$.next(message as ErrorMessage);
        }
      } catch (error: any) {
        console.error('[ArbitrageStream] Error parsing SSE message:', error.message, event.data);
      }
    };

    // Handle errors
    this.eventSource.onerror = (error: Event) => {
      console.error('[ArbitrageStream] ❌ SSE connection error:', error);
      this.connectionState$.next('disconnected');

      // Close the connection
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // Attempt to reconnect after 5 seconds
      console.log('[ArbitrageStream] Attempting to reconnect in 5 seconds...');
      this.reconnectTimer = setTimeout(() => {
        console.log('[ArbitrageStream] Reconnecting...');
        this.subscribe(subscription, authToken);
      }, 5000);
    };
  }

  /**
   * Handle price update from stream
   */
  private handlePriceUpdate(update: PriceUpdate): void {
    const key = `${update.exchange}:${update.symbol}`;

    // Determine price change direction
    const cached = this.priceCache.get(key);
    let change: 'up' | 'down' | 'neutral' = 'neutral';

    if (cached) {
      if (update.price > cached.price) {
        change = 'up';
      } else if (update.price < cached.price) {
        change = 'down';
      }
    }

    // Update cache
    this.priceCache.set(key, {
      price: update.price,
      timestamp: update.timestamp,
      change,
    });

    // Emit update to subscribers
    this.priceUpdates$.next(update);

    console.log(`[ArbitrageStream] Price update: ${update.exchange} ${update.symbol} = $${update.price.toFixed(2)} (${change})`);
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    console.log('[ArbitrageStream] Disconnecting from SSE stream');

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close EventSource
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Update state
    this.connectionState$.next('disconnected');

    // Clear cache
    this.priceCache.clear();

    console.log('[ArbitrageStream] Disconnected');
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState$.value === 'connected';
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }
}
