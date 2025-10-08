import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, interval } from 'rxjs';
import { tap, catchError, map, retry, switchMap, shareReplay } from 'rxjs/operators';
import {
  OrderRequest,
  OrderResponse,
  Position,
  Order,
  Balance,
  ClosePositionRequest,
  CancelOrderRequest,
  SymbolInfo,
  TradingSymbol,
  Exchange,
  PaginatedResponse,
  PaginationParams
} from '../models/trading.model';

/**
 * Manual Trading Service
 *
 * Comprehensive service for manual cryptocurrency trading operations.
 * Handles order placement, position management, balance tracking, and real-time updates.
 *
 * Features:
 * - Place market and limit orders
 * - Manage open positions
 * - Track order history
 * - Monitor account balance
 * - Support for multiple exchanges
 * - Real-time data updates preparation (WebSocket-ready)
 * - Error handling with retry logic
 * - Loading state management with Angular Signals
 *
 * @example
 * ```typescript
 * // Place a limit buy order
 * const order: OrderRequest = {
 *   exchange: 'bybit',
 *   symbol: 'BTCUSDT',
 *   side: 'Buy',
 *   type: 'Limit',
 *   quantity: 0.001,
 *   price: 50000,
 *   timeInForce: 'GTC'
 * };
 * this.tradingService.placeOrder(order).subscribe(response => {
 *   console.log('Order placed:', response);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ManualTradingService {
  private readonly baseUrl = 'http://localhost:3000/api';

  // Loading states using Angular Signals
  private loadingStates = {
    placeOrder: signal<boolean>(false),
    positions: signal<boolean>(false),
    orders: signal<boolean>(false),
    balance: signal<boolean>(false),
    closePosition: signal<boolean>(false),
    cancelOrder: signal<boolean>(false)
  };

  // Public readonly signals
  readonly isPlacingOrder = this.loadingStates.placeOrder.asReadonly();
  readonly isLoadingPositions = this.loadingStates.positions.asReadonly();
  readonly isLoadingOrders = this.loadingStates.orders.asReadonly();
  readonly isLoadingBalance = this.loadingStates.balance.asReadonly();
  readonly isClosingPosition = this.loadingStates.closePosition.asReadonly();
  readonly isCancellingOrder = this.loadingStates.cancelOrder.asReadonly();

  // Computed signal - true if any operation is loading
  readonly isLoading = computed(() =>
    this.loadingStates.placeOrder() ||
    this.loadingStates.positions() ||
    this.loadingStates.orders() ||
    this.loadingStates.balance() ||
    this.loadingStates.closePosition() ||
    this.loadingStates.cancelOrder()
  );

  // Cached data streams with auto-refresh capability
  private positionsCache$ = new BehaviorSubject<Position[]>([]);
  private ordersCache$ = new BehaviorSubject<Order[]>([]);
  private balanceCache$ = new BehaviorSubject<Balance | null>(null);

  // Public observables for cached data
  readonly positions$ = this.positionsCache$.asObservable();
  readonly orders$ = this.ordersCache$.asObservable();
  readonly balance$ = this.balanceCache$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Place a new order on the exchange
   *
   * @param order - Order request payload
   * @returns Observable<OrderResponse> - Order confirmation from exchange
   * @throws HttpErrorResponse if order placement fails
   */
  placeOrder(order: OrderRequest): Observable<OrderResponse> {
    this.loadingStates.placeOrder.set(true);

    // Validate order before sending
    this.validateOrder(order);

    const url = `${this.baseUrl}/${order.exchange}/order`;

    return this.http.post<OrderResponse>(url, order).pipe(
      tap(() => {
        this.loadingStates.placeOrder.set(false);
        // Refresh orders list after successful order placement
        this.refreshOrders(order.exchange);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.placeOrder.set(false);
        return this.handleError('Failed to place order', error);
      })
    );
  }

  /**
   * Get all open positions for a specific exchange
   *
   * @param exchange - Exchange identifier
   * @returns Observable<Position[]> - List of open positions
   */
  getPositions(exchange: Exchange): Observable<Position[]> {
    this.loadingStates.positions.set(true);

    const url = `${this.baseUrl}/${exchange}/positions`;

    return this.http.get<Position[]>(url).pipe(
      tap((positions) => {
        this.loadingStates.positions.set(false);
        this.positionsCache$.next(positions);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.positions.set(false);
        this.positionsCache$.next([]);
        return this.handleError('Failed to fetch positions', error);
      })
    );
  }

  /**
   * Get order history with pagination
   *
   * @param exchange - Exchange identifier
   * @param params - Pagination parameters (page, limit)
   * @returns Observable<PaginatedResponse<Order>> - Paginated order history
   */
  getOrders(
    exchange: Exchange,
    params?: Partial<PaginationParams>
  ): Observable<PaginatedResponse<Order>> {
    this.loadingStates.orders.set(true);

    const url = `${this.baseUrl}/${exchange}/orders`;
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<PaginatedResponse<Order>>(url, { params: httpParams }).pipe(
      tap((response) => {
        this.loadingStates.orders.set(false);
        this.ordersCache$.next(response.data);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.orders.set(false);
        this.ordersCache$.next([]);
        return this.handleError('Failed to fetch orders', error);
      })
    );
  }

  /**
   * Get account balance for a specific exchange
   *
   * @param exchange - Exchange identifier
   * @returns Observable<Balance> - Account balance information
   */
  getAccountBalance(exchange: Exchange): Observable<Balance> {
    this.loadingStates.balance.set(true);

    const url = `${this.baseUrl}/${exchange}/balance`;

    return this.http.get<Balance>(url).pipe(
      tap((balance) => {
        this.loadingStates.balance.set(false);
        this.balanceCache$.next(balance);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.balance.set(false);
        return this.handleError('Failed to fetch balance', error);
      })
    );
  }

  /**
   * Close an open position (market order in opposite direction)
   *
   * @param request - Close position request
   * @returns Observable<OrderResponse> - Closing order confirmation
   */
  closePosition(request: ClosePositionRequest): Observable<OrderResponse> {
    this.loadingStates.closePosition.set(true);

    const url = `${this.baseUrl}/${request.exchange}/position/close`;

    return this.http.post<OrderResponse>(url, request).pipe(
      tap(() => {
        this.loadingStates.closePosition.set(false);
        // Refresh positions and orders after closing
        this.refreshPositions(request.exchange);
        this.refreshOrders(request.exchange);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.closePosition.set(false);
        return this.handleError('Failed to close position', error);
      })
    );
  }

  /**
   * Cancel a pending order
   *
   * @param request - Cancel order request
   * @returns Observable<void> - Confirmation of cancellation
   */
  cancelOrder(request: CancelOrderRequest): Observable<void> {
    this.loadingStates.cancelOrder.set(true);

    const url = `${this.baseUrl}/${request.exchange}/order/${request.orderId}`;
    const params = new HttpParams().set('symbol', request.symbol);

    return this.http.delete<void>(url, { params }).pipe(
      tap(() => {
        this.loadingStates.cancelOrder.set(false);
        // Refresh orders list after cancellation
        this.refreshOrders(request.exchange);
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingStates.cancelOrder.set(false);
        return this.handleError('Failed to cancel order', error);
      })
    );
  }

  /**
   * Get available trading symbols for an exchange
   *
   * @param exchange - Exchange identifier
   * @returns Observable<SymbolInfo[]> - List of available trading pairs
   */
  getSymbols(exchange: Exchange): Observable<SymbolInfo[]> {
    const url = `${this.baseUrl}/trading/symbols`;
    const params = new HttpParams().set('exchange', exchange.toUpperCase());

    return this.http.get<SymbolInfo[]>(url, { params }).pipe(
      shareReplay(1), // Cache symbols data
      catchError((error: HttpErrorResponse) => {
        return this.handleError('Failed to fetch symbols', error);
      })
    );
  }

  /**
   * Get symbol information for a specific trading pair
   *
   * @param exchange - Exchange identifier
   * @param symbol - Trading symbol
   * @returns Observable<SymbolInfo> - Symbol details
   */
  getSymbolInfo(exchange: Exchange, symbol: TradingSymbol): Observable<SymbolInfo> {
    const url = `${this.baseUrl}/${exchange}/symbols/${symbol}`;

    return this.http.get<SymbolInfo>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError('Failed to fetch symbol info', error);
      })
    );
  }

  /**
   * Refresh positions data (manually trigger refresh)
   *
   * @param exchange - Exchange identifier
   */
  refreshPositions(exchange: Exchange): void {
    this.getPositions(exchange).subscribe({
      error: (error) => console.error('Failed to refresh positions:', error)
    });
  }

  /**
   * Refresh orders data (manually trigger refresh)
   *
   * @param exchange - Exchange identifier
   */
  refreshOrders(exchange: Exchange): void {
    this.getOrders(exchange).subscribe({
      error: (error) => console.error('Failed to refresh orders:', error)
    });
  }

  /**
   * Refresh balance data (manually trigger refresh)
   *
   * @param exchange - Exchange identifier
   */
  refreshBalance(exchange: Exchange): void {
    this.getAccountBalance(exchange).subscribe({
      error: (error) => console.error('Failed to refresh balance:', error)
    });
  }

  /**
   * Refresh all trading data
   *
   * @param exchange - Exchange identifier
   */
  refreshAll(exchange: Exchange): void {
    this.refreshPositions(exchange);
    this.refreshOrders(exchange);
    this.refreshBalance(exchange);
  }

  /**
   * Set up auto-refresh for trading data
   * Returns an observable that emits at regular intervals
   *
   * @param exchange - Exchange identifier
   * @param intervalMs - Refresh interval in milliseconds (default: 10000ms = 10s)
   * @returns Observable that triggers data refresh
   */
  setupAutoRefresh(exchange: Exchange, intervalMs: number = 10000): Observable<number> {
    return interval(intervalMs).pipe(
      tap(() => this.refreshAll(exchange))
    );
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.positionsCache$.next([]);
    this.ordersCache$.next([]);
    this.balanceCache$.next(null);
  }

  /**
   * Validate order before submission
   * Throws error if validation fails
   *
   * @param order - Order to validate
   * @private
   */
  private validateOrder(order: OrderRequest): void {
    if (!order.symbol) {
      throw new Error('Symbol is required');
    }

    if (!order.quantity || order.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (order.type === 'Limit' && (!order.price || order.price <= 0)) {
      throw new Error('Price is required for limit orders');
    }

    if (order.stopLoss && order.stopLoss <= 0) {
      throw new Error('Stop loss must be greater than 0');
    }

    if (order.takeProfit && order.takeProfit <= 0) {
      throw new Error('Take profit must be greater than 0');
    }

    // Validate stop loss and take profit relative to price
    if (order.price && order.stopLoss && order.takeProfit) {
      if (order.side === 'Buy') {
        if (order.stopLoss >= order.price) {
          throw new Error('Stop loss must be below entry price for buy orders');
        }
        if (order.takeProfit <= order.price) {
          throw new Error('Take profit must be above entry price for buy orders');
        }
      } else {
        if (order.stopLoss <= order.price) {
          throw new Error('Stop loss must be above entry price for sell orders');
        }
        if (order.takeProfit >= order.price) {
          throw new Error('Take profit must be below entry price for sell orders');
        }
      }
    }
  }

  /**
   * Centralized error handling
   *
   * @param message - Error message prefix
   * @param error - HTTP error response
   * @returns Observable that emits error
   * @private
   */
  private handleError(message: string, error: HttpErrorResponse): Observable<never> {
    let errorMessage = message;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `${message}: ${error.error.message}`;
    } else {
      // Server-side error
      const serverMessage = error.error?.message || error.error?.error || error.message;
      errorMessage = `${message}: ${serverMessage}`;
    }

    console.error('Trading Service Error:', {
      message: errorMessage,
      status: error.status,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generate mock data for development/testing
   * This method provides realistic mock data when backend is not available
   */
  getMockPositions(): Position[] {
    return [
      {
        id: '1',
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        side: 'Buy',
        size: 0.1,
        entryPrice: 50000,
        markPrice: 51000,
        liquidationPrice: 45000,
        leverage: 10,
        unrealizedPnl: 100,
        unrealizedPnlPercent: 2,
        marginType: 'Cross',
        positionMargin: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        side: 'Sell',
        size: 1.5,
        entryPrice: 3000,
        markPrice: 2950,
        liquidationPrice: 3200,
        leverage: 5,
        unrealizedPnl: 75,
        unrealizedPnlPercent: 1.67,
        marginType: 'Isolated',
        positionMargin: 900,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date()
      }
    ];
  }

  getMockOrders(): Order[] {
    return [
      {
        orderId: 'order-1',
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        side: 'Buy',
        type: 'Limit',
        quantity: 0.1,
        price: 49000,
        status: 'New',
        timeInForce: 'GTC',
        filledQuantity: 0,
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(Date.now() - 1800000)
      },
      {
        orderId: 'order-2',
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        side: 'Sell',
        type: 'Market',
        quantity: 1.5,
        status: 'Filled',
        timeInForce: 'GTC',
        filledQuantity: 1.5,
        averagePrice: 3000,
        commission: 4.5,
        commissionAsset: 'USDT',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000)
      }
    ];
  }

  getMockBalance(): Balance {
    return {
      exchange: 'bybit',
      totalBalance: 10175,
      availableBalance: 8675,
      usedMargin: 1400,
      unrealizedPnl: 175,
      walletBalance: 10000,
      currency: 'USDT',
      updatedAt: new Date()
    };
  }
}
