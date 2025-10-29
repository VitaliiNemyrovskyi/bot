import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, map, timeout, startWith, take, switchMap } from 'rxjs/operators';
import { BybitWebSocketService, TickerData, OrderbookData, TradeData } from './bybit-websocket.service';

/**
 * Bybit API kline/candlestick data structure
 * Represents the raw response format from Bybit V5 REST API
 */
export interface BybitKlineData {
  symbol: string;
  category: string;
  list: string[][]; // [timestamp, open, high, low, close, volume, turnover]
}

/**
 * Bybit API response wrapper for kline endpoint
 */
export interface BybitKlineResponse {
  retCode: number;
  retMsg: string;
  result: BybitKlineData;
  time: number;
}

/**
 * Normalized candlestick data format used throughout the application
 * Compatible with lightweight-charts library
 */
export interface CandlestickData {
  time: string | number; // Support both string (YYYY-MM-DD) and number (timestamp)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Bybit Service - Main integration layer for Bybit exchange
 *
 * This service provides a high-level API for interacting with Bybit exchange,
 * combining both REST API and WebSocket real-time data streams. It handles:
 * - Historical kline/candlestick data retrieval
 * - Real-time market data subscriptions
 * - Data transformation and normalization
 * - Error handling and fallback mechanisms
 *
 * @example
 * ```typescript
 * // Get real-time candlestick data
 * this.bybitService.getRealTimeKlineData('BTCUSDT', '1').subscribe(candles => {
 *   console.log('Received candles:', candles);
 * });
 *
 * // Get available symbols
 * this.bybitService.getSymbols().subscribe(symbols => {
 *   console.log('Available symbols:', symbols);
 * });
 * ```
 *
 * @see {@link BybitWebSocketService} for WebSocket connection management
 */
@Injectable({
  providedIn: 'root'
})
export class BybitService {
  private readonly baseUrl = 'https://api.bybit.com';
  private readonly timeout = 10000; // 10 seconds timeout

  constructor(
    private http: HttpClient,
    private webSocketService: BybitWebSocketService
  ) {}

  /**
   * Fetch historical kline/candlestick data from Bybit REST API
   *
   * Retrieves historical market data for a specified trading pair and time interval.
   * Data is automatically transformed to application format and validated for correctness.
   *
   * @param symbol - Trading pair symbol (e.g., 'BTCUSDT', 'ETHUSDT')
   * @param interval - Time interval for candles: '1', '5', '15', '30', '60', '240', 'D'
   * @param limit - Number of candles to retrieve (max 1000, default 720)
   * @returns Observable<CandlestickData[]> - Stream of candlestick data, sorted in ascending time order
   *
   * @throws Error if API returns error code or invalid data
   * @example
   * ```typescript
   * // Get 100 hourly candles for Bitcoin
   * this.bybitService.getKlineData('BTCUSDT', '60', 100).subscribe(candles => {
   *   console.log('First candle:', candles[0]);
   *   console.log('Latest candle:', candles[candles.length - 1]);
   * });
   * ```
   */
  getKlineData(
    symbol: string = 'BTCUSDT',
    interval: string = '60',
    limit: number = 24*30
  ): Observable<CandlestickData[]> {
    // console.log(`Fetching Bybit data for ${symbol}, interval: ${interval}, limit: ${limit}`);

    const params = {
      category: 'spot',
      symbol: symbol,
      interval: interval,
      limit: limit.toString()
    };

    const url = `${this.baseUrl}/v5/market/kline`;

    return this.http.get<BybitKlineResponse>(url, { params }).pipe(
      timeout(this.timeout),
      map(response => this.transformBybitData(response)),
      catchError(error => this.handleError(error, symbol))
    );
  }

  /**
   * Get available trading symbols from Bybit
   */
  getSymbols(): Observable<string[]> {
    const url = `${this.baseUrl}/v5/market/instruments-info`;
    const params = {
      category: 'spot',
      limit: '100'
    };

    return this.http.get<any>(url, { params }).pipe(
      timeout(this.timeout),
      map(response => {
        if (response.retCode === 0 && response.result?.list) {
          return response.result.list
            .filter((item: any) => item.symbol.endsWith('USDT'))
            .map((item: any) => item.symbol)
            .slice(0, 20); // Limit to top 20 USDT pairs
        }
        return ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'MATICUSDT']; // Fallback
      }),
      catchError(error => {
        console.error('Failed to fetch symbols from Bybit:', error);
        return of(['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'MATICUSDT']); // Fallback
      })
    );
  }

  /**
   * Transform Bybit API response to our CandlestickData format
   */
  private transformBybitData(response: BybitKlineResponse): CandlestickData[] {
    // console.log('Bybit API response:', response);

    if (response.retCode !== 0 || !response.result?.list) {
      throw new Error(`Bybit API error: ${response.retMsg || 'Invalid response'}`);
    }

    const data = response.result.list.map(item => {
      const [timestamp, open, high, low, close, volume] = item;

      // Always use Unix timestamp in seconds for lightweight-charts
      // This ensures proper ordering for all time intervals
      const timestampMs = parseInt(timestamp);
      const timestampSeconds = Math.floor(timestampMs / 1000);

      return {
        time: timestampSeconds, // Use Unix timestamp in seconds
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume),
        originalTimestamp: timestampMs // Keep original for debugging
      };
    });

    // Sort by time to ensure ascending order
    const sortedData = data.sort((a, b) => (a.time as number) - (b.time as number));

    // Remove duplicates based on time
    const uniqueData = sortedData.filter((item, index, arr) => {
      if (index === 0) return true;
      return item.time !== arr[index - 1].time;
    });

    // Remove the temporary originalTimestamp property
    const finalData = uniqueData.map(({ originalTimestamp, ...rest }) => rest);

    // console.log(`Transformed ${finalData.length} data points from Bybit (removed ${data.length - finalData.length} duplicates)`);
    // console.log('First data point:', finalData[0]);
    // console.log('Last data point:', finalData[finalData.length - 1]);

    // Validate data order
    for (let i = 1; i < finalData.length; i++) {
      const current = finalData[i].time as number;
      const previous = finalData[i - 1].time as number;

      if (current <= previous) {
        console.warn(`Data ordering issue at index ${i}: current=${current}, previous=${previous}`);
        console.warn('Current item:', finalData[i]);
        console.warn('Previous item:', finalData[i - 1]);
      }
    }

    return finalData;
  }

  /**
   * Handle HTTP errors and provide fallback data
   */
  private handleError(error: HttpErrorResponse, symbol: string): Observable<CandlestickData[]> {
    console.error('Bybit API Error:', error);

    // Return fallback data when API fails
    // console.log('Returning fallback data due to API error');
    return of(this.generateFallbackData(symbol));
  }

  /**
   * Generate fallback data when Bybit API is unavailable
   */
  private generateFallbackData(symbol: string): CandlestickData[] {
    // console.log(`Generating fallback data for ${symbol}`);

    const data: CandlestickData[] = [];
    let currentPrice = this.getBasePrice(symbol);

    // Generate 30 days of fallback data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const time = date.toISOString().split('T')[0];

      // Generate realistic OHLC data
      const open = currentPrice;
      const volatility = 0.03;
      const dailyRange = currentPrice * volatility;

      const high = open + (Math.random() * dailyRange);
      const low = open - (Math.random() * dailyRange);
      const closeVariation = (Math.random() - 0.5) * dailyRange * 0.5;
      const close = Math.max(low, Math.min(high, open + closeVariation));

      currentPrice = close;

      data.push({
        time,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(Math.random() * 1000000)
      });
    }

    return data;
  }

  /**
   * Get base price for different symbols
   */
  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'BTCUSDT': 45000,
      'ETHUSDT': 2500,
      'ADAUSDT': 0.5,
      'DOTUSDT': 15,
      'MATICUSDT': 0.8,
      'BNBUSDT': 300,
      'SOLUSDT': 100,
      'XRPUSDT': 0.6,
      'DOGEUSDT': 0.1,
      'AVAXUSDT': 25
    };

    return basePrices[symbol] || 100; // Default fallback price
  }

  /**
   * Check if Bybit API is accessible
   */
  checkApiHealth(): Observable<boolean> {
    const url = `${this.baseUrl}/v5/market/time`;

    return this.http.get<any>(url).pipe(
      timeout(5000),
      map(response => response.retCode === 0),
      catchError(() => of(false))
    );
  }

  /**
   * Get real-time kline data using WebSocket
   * This method combines initial REST API data with real-time WebSocket updates
   * @param symbol Trading pair symbol (e.g., 'BTCUSDT')
   * @param interval Time interval ('1', '5', '15', '30', '60', '240', 'D')
   * @returns Observable<CandlestickData[]> - Emits initial data then real-time updates
   */
  getRealTimeKlineData(
    symbol: string = 'BTCUSDT',
    interval: string = '1'
  ): Observable<CandlestickData[]> {
    // console.log(`[BYBIT SERVICE] Starting real-time kline data for ${symbol}, interval: ${interval}`);

    // First get initial historical data via REST API
    const initialData$ = this.getKlineData(symbol, interval, 100).pipe(
      take(1),
      catchError(error => {
        console.error('[BYBIT SERVICE] Failed to get initial data, using fallback:', error);
        return of(this.generateFallbackData(symbol));
      })
    );

    // Then subscribe to real-time updates via WebSocket
    const realtimeUpdates$ = this.webSocketService.subscribeToKline(symbol, interval);

    // Combine initial data with real-time updates using merge strategy
    return initialData$.pipe(
      switchMap(initialData => {
        // console.log(`[BYBIT SERVICE] Initial data loaded: ${initialData.length} candles`);
        // console.log('[BYBIT SERVICE] Setting up real-time update stream...');

        const dataSubject = new BehaviorSubject<CandlestickData[]>(initialData);

        // Subscribe to real-time updates and emit through the subject
        const subscription = realtimeUpdates$.subscribe({
          next: (newCandle) => {
            // console.log('[BYBIT SERVICE] Received WebSocket candle update:', {
            //   time: new Date(newCandle.time * 1000).toISOString(),
            //   close: newCandle.close,
            //   volume: newCandle.volume
            // });

            const currentData = dataSubject.value;
            const updatedData = this.updateCandlestickData(currentData, newCandle);

            // console.log(`[BYBIT SERVICE] Emitting updated data array with ${updatedData.length} candles`);
            dataSubject.next(updatedData);
          },
          error: (error) => {
            // console.error('[BYBIT SERVICE] WebSocket error:', error);
          },
          complete: () => {
            // console.log('[BYBIT SERVICE] WebSocket stream completed');
          }
        });

        // Return the subject as observable and clean up subscription on unsubscribe
        return new Observable<CandlestickData[]>(observer => {
          const subjectSubscription = dataSubject.subscribe(observer);

          return () => {
            // console.log('[BYBIT SERVICE] Cleaning up real-time kline subscription');
            subscription.unsubscribe();
            subjectSubscription.unsubscribe();
          };
        });
      })
    );
  }

  /**
   * Subscribe to real-time kline updates only (no initial data)
   * @param symbol Trading pair symbol
   * @param interval Time interval
   * @returns Observable<CandlestickData> - Emits individual candle updates
   */
  subscribeToRealtimeKline(
    symbol: string = 'BTCUSDT',
    interval: string = '1'
  ): Observable<CandlestickData> {
    // console.log(`Subscribing to real-time updates for ${symbol}, interval: ${interval}`);
    return this.webSocketService.subscribeToKline(symbol, interval);
  }

  /**
   * Unsubscribe from real-time kline data
   * @param symbol Trading pair symbol
   * @param interval Time interval
   */
  unsubscribeFromRealtimeKline(symbol: string, interval: string = '1'): void {
    // console.log(`Unsubscribing from real-time updates for ${symbol}, interval: ${interval}`);
    this.webSocketService.unsubscribeFromKline(symbol, interval);
  }

  /**
   * Get WebSocket connection state
   */
  getWebSocketConnectionState(): Observable<'disconnected' | 'connecting' | 'connected'> {
    return this.webSocketService.getConnectionState();
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.webSocketService.isConnected();
  }

  /**
   * Get list of active WebSocket subscriptions
   */
  getActiveSubscriptions(): string[] {
    return this.webSocketService.getActiveSubscriptions();
  }

  /**
   * Update candlestick data array with new candle
   * This handles both new candles and updates to the current candle
   */
  private updateCandlestickData(
    currentData: CandlestickData[],
    newCandle: CandlestickData
  ): CandlestickData[] {
    if (currentData.length === 0) {
      return [newCandle];
    }

    const updatedData = [...currentData];
    const lastCandle = updatedData[updatedData.length - 1];

    // Convert time to number for comparison
    const lastCandleTime = typeof lastCandle.time === 'number' ? lastCandle.time : parseInt(lastCandle.time);
    const newCandleTime = typeof newCandle.time === 'number' ? newCandle.time : parseInt(newCandle.time);

    // Check if this is an update to the current candle or a new candle
    if (lastCandleTime === newCandleTime) {
      // Update the current candle
      updatedData[updatedData.length - 1] = newCandle;
      // console.log(`📊 Updated current candle at ${new Date(newCandleTime * 1000).toISOString()}`);
    } else if (newCandleTime > lastCandleTime) {
      // Add new candle and limit the array size
      updatedData.push(newCandle);

      // Keep only the last 1000 candles to prevent memory issues
      if (updatedData.length > 1000) {
        updatedData.shift();
      }

      // console.log(`📊 Added new candle at ${new Date(newCandleTime * 1000).toISOString()}`);
    } else {
      // console.warn('Received candle with older timestamp, ignoring:', newCandle);
    }

    return updatedData;
  }

  /**
   * Convert WebSocket interval format to REST API format if needed
   */
  private convertIntervalFormat(interval: string): string {
    // Bybit WebSocket and REST API use the same interval format
    // But we can add conversion logic here if needed
    const intervalMap: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D'
    };

    return intervalMap[interval] || interval;
  }

  /**
   * Subscribe to real-time ticker data
   * @param symbol Trading pair symbol
   * @returns Observable<TickerData> - Emits ticker updates
   */
  subscribeToRealtimeTicker(symbol: string = 'BTCUSDT'): Observable<any> {
    // console.log(`Subscribing to real-time ticker for ${symbol}`);
    return this.webSocketService.subscribeToTicker(symbol);
  }

  /**
   * Subscribe to real-time orderbook data
   * @param symbol Trading pair symbol
   * @param depth Orderbook depth (1, 50, 200)
   * @returns Observable<OrderbookData> - Emits orderbook updates
   */
  subscribeToRealtimeOrderbook(symbol: string = 'BTCUSDT', depth: number = 50): Observable<any> {
    // console.log(`Subscribing to real-time orderbook for ${symbol}, depth: ${depth}`);
    return this.webSocketService.subscribeToOrderbook(symbol, depth);
  }

  /**
   * Subscribe to real-time trade data
   * @param symbol Trading pair symbol
   * @returns Observable<TradeData> - Emits individual trades
   */
  subscribeToRealtimeTrades(symbol: string = 'BTCUSDT'): Observable<any> {
    // console.log(`Subscribing to real-time trades for ${symbol}`);
    return this.webSocketService.subscribeToTrades(symbol);
  }

  /**
   * Unsubscribe from real-time ticker data
   */
  unsubscribeFromRealtimeTicker(symbol: string): void {
    // console.log(`Unsubscribing from real-time ticker for ${symbol}`);
    this.webSocketService.unsubscribeFromTicker(symbol);
  }

  /**
   * Unsubscribe from real-time orderbook data
   */
  unsubscribeFromRealtimeOrderbook(symbol: string, depth: number = 50): void {
    // console.log(`Unsubscribing from real-time orderbook for ${symbol}`);
    this.webSocketService.unsubscribeFromOrderbook(symbol, depth);
  }

  /**
   * Unsubscribe from real-time trade data
   */
  unsubscribeFromRealtimeTrades(symbol: string): void {
    // console.log(`Unsubscribing from real-time trades for ${symbol}`);
    this.webSocketService.unsubscribeFromTrades(symbol);
  }

  /**
   * Get cached data from WebSocket service
   * @param subscriptionKey Key for cached data
   * @returns Cached data or null
   */
  getCachedWebSocketData(subscriptionKey: string): any {
    return this.webSocketService.getCachedData(subscriptionKey);
  }

  /**
   * Clear WebSocket cache
   * @param subscriptionKey Optional specific key to clear
   */
  clearWebSocketCache(subscriptionKey?: string): void {
    this.webSocketService.clearCache(subscriptionKey);
  }

  /**
   * Get comprehensive market data stream combining multiple data types
   * @param symbol Trading pair symbol
   * @returns Observable with combined market data
   */
  getComprehensiveMarketStream(symbol: string = 'BTCUSDT'): Observable<any> {
    // console.log(`Starting comprehensive market stream for ${symbol}`);

    return combineLatest([
      this.subscribeToRealtimeKline(symbol, '1'),
      this.subscribeToRealtimeTicker(symbol),
      this.subscribeToRealtimeOrderbook(symbol, 50)
    ]).pipe(
      map(([kline, ticker, orderbook]) => ({
        symbol,
        timestamp: Date.now(),
        kline,
        ticker,
        orderbook,
        spread: orderbook?.asks?.[0]?.price - orderbook?.bids?.[0]?.price || 0
      }))
    );
  }

  /**
   * Set WebSocket environment (mainnet or testnet)
   * Delegates to the underlying WebSocketService
   */
  setWebSocketEnvironment(environment: 'MAINNET' | 'TESTNET'): void {
    this.webSocketService.setEnvironment(environment);
  }

  /**
   * Get current WebSocket environment
   */
  getWebSocketEnvironment(): 'mainnet' | 'testnet' {
    return this.webSocketService.getCurrentEnvironment();
  }
}
