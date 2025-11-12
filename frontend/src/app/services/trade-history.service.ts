import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { buildApiUrl, buildUrlWithQuery } from '../config/app.config';
import {
  TradeHistoryRecord,
  TradeHistoryResponse,
  TradeHistoryQueryParams,
  TradeStatistics
} from '../models/trade-history.model';

/**
 * Trade History Service
 *
 * Manages trade history data retrieval, caching, and state management for the application.
 * This service provides:
 * - Fetching trade history from backend API
 * - Query parameter support for filtering and pagination
 * - Reactive state management with Angular signals
 * - Comprehensive error handling
 * - Trade statistics calculation
 * - Caching of fetched data
 *
 * @example
 * ```typescript
 * constructor(private tradeHistoryService: TradeHistoryService) {
 *   // Fetch trades for a specific symbol
 *   this.tradeHistoryService.getTradeHistory({ symbol: 'BTCUSDT', limit: 50 })
 *     .subscribe(response => {
 *       console.log('Trades:', response.data);
 *     });
 *
 *   // Access cached trades via signal
 *   const trades = this.tradeHistoryService.trades();
 *
 *   // Check loading state
 *   const isLoading = this.tradeHistoryService.isLoading();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TradeHistoryService {
  // ============================================================================
  // SIGNALS - Reactive State Management
  // ============================================================================

  private readonly _trades = signal<TradeHistoryRecord[]>([]);
  public readonly trades = this._trades.asReadonly();

  private readonly _loading = signal<boolean>(false);
  public readonly isLoading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  public readonly error = this._error.asReadonly();

  private readonly _totalCount = signal<number>(0);
  public readonly totalCount = this._totalCount.asReadonly();

  // ============================================================================
  // BEHAVIOR SUBJECTS - Observable State (for compatibility)
  // ============================================================================

  private tradesSubject = new BehaviorSubject<TradeHistoryRecord[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public readonly trades$ = this.tradesSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  // ============================================================================
  // COMPUTED SIGNALS - Derived State
  // ============================================================================

  /**
   * Indicates whether any trade history data has been loaded
   */
  public readonly hasTrades = computed(() => this.trades().length > 0);

  /**
   * Filtered trades by status
   */
  public readonly openTrades = computed(() =>
    this.trades().filter(trade => trade.status === 'OPEN')
  );

  public readonly closedTrades = computed(() =>
    this.trades().filter(trade => trade.status === 'CLOSED')
  );

  /**
   * Calculate trade statistics from loaded trades
   */
  public readonly statistics = computed(() =>
    this.calculateStatistics(this.trades())
  );

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(private http: HttpClient) {}

  // ============================================================================
  // PUBLIC METHODS - API Operations
  // ============================================================================

  /**
   * Fetch trade history from the backend API
   *
   * This method fetches trade history based on the provided query parameters.
   * The authentication token is automatically added by the auth interceptor.
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Observable<TradeHistoryResponse> - API response with trade records
   *
   * @example
   * ```typescript
   * // Fetch all trades for BTC on Bybit
   * service.getTradeHistory({
   *   symbol: 'BTCUSDT',
   *   exchange: 'bybit',
   *   limit: 100
   * }).subscribe(response => {
   *   console.log('Fetched trades:', response.data.length);
   * });
   * ```
   */
  getTradeHistory(params?: TradeHistoryQueryParams): Observable<TradeHistoryResponse> {
    // Set loading state
    this._loading.set(true);
    this._error.set(null);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Build API URL
    const baseUrl = buildApiUrl('/arbitrage/trade-history');
    const url = params ? this.buildUrlWithParams(baseUrl, params) : baseUrl;

    return this.http.get<TradeHistoryResponse>(url).pipe(
      tap(response => {
        console.log('[TradeHistoryService] Fetched trades:', response.count);

        // Update state with fetched data
        this._trades.set(response.data);
        this._totalCount.set(response.count);
        this.tradesSubject.next(response.data);
      }),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this._error.set(errorMessage);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._loading.set(false);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Fetch trade history for a specific symbol and exchange
   *
   * Convenience method for the most common use case.
   *
   * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
   * @param exchange - Exchange name (e.g., 'bybit', 'bingx')
   * @param limit - Maximum number of records to fetch (default: 100)
   * @returns Observable<TradeHistoryResponse>
   */
  getTradeHistoryBySymbol(
    symbol: string,
    exchange: string,
    limit = 100
  ): Observable<TradeHistoryResponse> {
    return this.getTradeHistory({ symbol, exchange, limit });
  }

  /**
   * Fetch trade history by exchange only
   *
   * @param exchange - Exchange name
   * @param limit - Maximum number of records to fetch
   * @returns Observable<TradeHistoryResponse>
   */
  getTradeHistoryByExchange(
    exchange: string,
    limit?: number
  ): Observable<TradeHistoryResponse> {
    return this.getTradeHistory({ exchange, limit });
  }

  /**
   * Fetch closed trades only
   *
   * @param limit - Maximum number of records to fetch
   * @returns Observable<TradeHistoryResponse>
   */
  getClosedTrades(limit?: number): Observable<TradeHistoryResponse> {
    return this.getTradeHistory({ status: 'CLOSED', limit });
  }

  /**
   * Fetch open trades only
   *
   * @param limit - Maximum number of records to fetch
   * @returns Observable<TradeHistoryResponse>
   */
  getOpenTrades(limit?: number): Observable<TradeHistoryResponse> {
    return this.getTradeHistory({ status: 'OPEN', limit });
  }

  /**
   * Fetch trades within a date range
   *
   * @param startDate - Start date (ISO 8601 string)
   * @param endDate - End date (ISO 8601 string)
   * @param limit - Maximum number of records to fetch
   * @returns Observable<TradeHistoryResponse>
   */
  getTradeHistoryByDateRange(
    startDate: string,
    endDate: string,
    limit?: number
  ): Observable<TradeHistoryResponse> {
    return this.getTradeHistory({ startDate, endDate, limit });
  }

  // ============================================================================
  // PUBLIC METHODS - Utility Functions
  // ============================================================================

  /**
   * Refresh the currently loaded trade history
   *
   * Re-fetches trade history using the last query parameters.
   */
  refreshTradeHistory(): Observable<TradeHistoryResponse> {
    // For now, just fetch all trades
    // In a production app, you might want to store the last query params
    return this.getTradeHistory();
  }

  /**
   * Clear all cached trade history data
   */
  clearTradeHistory(): void {
    this._trades.set([]);
    this._totalCount.set(0);
    this._error.set(null);
    this.tradesSubject.next([]);
    this.errorSubject.next(null);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
    this.errorSubject.next(null);
  }

  /**
   * Get current error message (if any)
   */
  getCurrentError(): string | null {
    return this._error();
  }

  /**
   * Check if service is currently loading data
   */
  isCurrentlyLoading(): boolean {
    return this._loading();
  }

  /**
   * Get count of loaded trades
   */
  getTradeCount(): number {
    return this.trades().length;
  }

  // ============================================================================
  // STATISTICS CALCULATION
  // ============================================================================

  /**
   * Calculate comprehensive statistics from a set of trades
   *
   * @param trades - Array of trade history records
   * @returns TradeStatistics - Aggregated statistics
   */
  calculateStatistics(trades: TradeHistoryRecord[]): TradeStatistics {
    if (trades.length === 0) {
      return this.getEmptyStatistics();
    }

    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const profitableTrades = closedTrades.filter(t => t.realizedPnl > 0);
    const losingTrades = closedTrades.filter(t => t.realizedPnl < 0);

    const totalPnl = closedTrades.reduce((sum, t) => sum + t.realizedPnl, 0);
    const totalFunding = trades.reduce((sum, t) => sum + t.fundingEarned, 0);
    const totalFees = trades.reduce((sum, t) => {
      return sum + (t.entryFee || 0) + (t.exitFee || 0);
    }, 0);

    const largestWin = profitableTrades.length > 0
      ? Math.max(...profitableTrades.map(t => t.realizedPnl))
      : 0;

    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map(t => t.realizedPnl))
      : 0;

    const avgPnl = closedTrades.length > 0
      ? totalPnl / closedTrades.length
      : 0;

    const avgRoi = trades.length > 0
      ? trades.reduce((sum, t) => sum + (t.roi || 0), 0) / trades.length
      : 0;

    return {
      totalTrades: trades.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0
        ? (profitableTrades.length / closedTrades.length) * 100
        : 0,
      totalPnl,
      totalFunding,
      averagePnl: avgPnl,
      largestWin,
      largestLoss,
      totalFees,
      netProfit: totalPnl - totalFees,
      averageRoi: avgRoi
    };
  }

  /**
   * Calculate statistics for a specific symbol
   */
  getStatisticsBySymbol(symbol: string): TradeStatistics {
    const symbolTrades = this.trades().filter(t => t.symbol === symbol);
    return this.calculateStatistics(symbolTrades);
  }

  /**
   * Calculate statistics for a specific exchange
   */
  getStatisticsByExchange(exchange: string): TradeStatistics {
    const exchangeTrades = this.trades().filter(t => t.exchange === exchange);
    return this.calculateStatistics(exchangeTrades);
  }

  /**
   * Format duration in seconds to human-readable string
   *
   * @param seconds - Duration in seconds
   * @returns Formatted duration string (e.g., "2h 15m", "45m 30s")
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Format PnL with proper color coding indicator
   *
   * @param pnl - Profit/Loss value (can be null for open positions)
   * @returns Object with formatted value and color
   */
  formatPnl(pnl: number | null): { value: string; color: string; isPositive: boolean } {
    // Handle null/undefined values (for open positions without realized PnL)
    if (pnl === null || pnl === undefined) {
      return {
        value: '0.00',
        color: 'gray',
        isPositive: true
      };
    }

    const isPositive = pnl >= 0;
    const formatted = isPositive ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);

    return {
      value: formatted,
      color: isPositive ? 'green' : 'red',
      isPositive
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Internal Helpers
  // ============================================================================

  /**
   * Build URL with query parameters
   */
  private buildUrlWithParams(baseUrl: string, params: TradeHistoryQueryParams): string {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params.symbol) queryParams['symbol'] = params.symbol;
    if (params.exchange) queryParams['exchange'] = params.exchange;
    if (params.limit) queryParams['limit'] = params.limit;
    if (params.offset) queryParams['offset'] = params.offset;
    if (params.status) queryParams['status'] = params.status;
    if (params.startDate) queryParams['startDate'] = params.startDate;
    if (params.endDate) queryParams['endDate'] = params.endDate;
    if (params.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params.sortOrder) queryParams['sortOrder'] = params.sortOrder;

    return buildUrlWithQuery(baseUrl, queryParams);
  }

  /**
   * Get empty statistics object
   */
  private getEmptyStatistics(): TradeStatistics {
    return {
      totalTrades: 0,
      profitableTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      totalFunding: 0,
      averagePnl: 0,
      largestWin: 0,
      largestLoss: 0,
      totalFees: 0,
      netProfit: 0,
      averageRoi: 0
    };
  }

  /**
   * Centralized error handling
   *
   * Transforms HTTP errors into user-friendly error messages
   * and logs detailed error information for debugging.
   *
   * @param error - HTTP error response
   * @returns User-friendly error message
   */
  private handleError(error: HttpErrorResponse): string {
    console.error('[TradeHistoryService] Error:', error);

    // Check for error message in response body
    if (error.error?.error?.message) {
      return error.error.error.message;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    // Handle specific HTTP status codes
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.status === 401) {
      return 'Unauthorized. Please log in again.';
    }

    if (error.status === 403) {
      return 'Access forbidden. You do not have permission to view trade history.';
    }

    if (error.status === 404) {
      return 'Trade history endpoint not found. Please contact support.';
    }

    if (error.status === 422) {
      return 'Invalid query parameters. Please check your filters.';
    }

    if (error.status === 429) {
      return 'Too many requests. Please try again later.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    // Default error message
    return error.message || 'An unexpected error occurred while fetching trade history.';
  }
}
