import { Injectable, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getEndpointUrl, buildUrlWithQuery } from '../config/app.config';
import { ExchangeEnvironmentService } from './exchange-environment.service';

/**
 * BingX Account Information Interface
 */
export interface BingXAccountInfo {
  balance: {
    userId: string;
    asset: string;
    balance: string;
    equity: string;
    unrealizedProfit: string;
    realisedProfit: string;
    availableMargin: string;
    usedMargin: string;
    freezedMargin: string;
  };
}

/**
 * BingX Wallet Balance Information
 */
export interface BingXWalletBalance {
  asset: string;
  balance: {
    asset: string;
    balance: string;
    equity: string;
    unrealizedProfit: string;
    realisedProfit: string;
    availableMargin: string;
    usedMargin: string;
    freezedMargin: string;
  };
}

/**
 * BingX Position Information
 */
export interface BingXPosition {
  symbol: string;
  positionId: string;
  positionSide: 'LONG' | 'SHORT';
  isolated: boolean;
  positionAmt: string;
  availableAmt: string;
  unrealizedProfit: string;
  realisedProfit: string;
  initialMargin: string;
  markPrice: string;
  entryPrice: string;
  leverage: string;
  isolatedWallet: string;
}

/**
 * BingX Ticker Information
 */
export interface BingXTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  lastQty: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  openTime: number;
  closeTime: number;
}

/**
 * Complete BingX User Information Response
 */
export interface BingXUserInfo {
  success: boolean;
  timestamp: string;
  testnet: boolean;
  data: {
    accountInfo: BingXAccountInfo | { error: string };
    walletBalance: BingXWalletBalance | { error: string };
    positions: BingXPosition[];
    positionsCount: number;
    marketReference: BingXTicker | null;
  };
}

/**
 * BingX User Service
 *
 * Handles all BingX user-related operations including:
 * - Fetching user account information
 * - Managing account balance data
 * - Retrieving positions
 */
@Injectable({
  providedIn: 'root'
})
export class BingXUserService {
  private userInfoSubject = new BehaviorSubject<BingXUserInfo | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public readonly userInfo$ = this.userInfoSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private environmentService: ExchangeEnvironmentService
  ) {
    // React to environment changes - clear cached data when environment switches
    effect(() => {
      const env = this.environmentService.currentEnvironment();
      console.log('[BingXUserService] Environment changed to:', env);
      this.clearUserInfo();
    }, { allowSignalWrites: true });
  }

  /**
   * Get comprehensive BingX user information using stored API keys
   * This method uses the active BingX credentials from the backend
   * @returns Observable<BingXUserInfo>
   */
  getUserInfo(): Observable<BingXUserInfo> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const url = getEndpointUrl('bingx', 'userInfo');

    return this.http.get<BingXUserInfo>(url).pipe(
      tap(info => {
        this.userInfoSubject.next(info);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Refresh user information using stored API keys
   */
  refreshUserInfo(): Observable<BingXUserInfo> {
    return this.getUserInfo();
  }

  /**
   * Get current user info from cache (if available)
   */
  getCurrentUserInfo(): BingXUserInfo | null {
    return this.userInfoSubject.value;
  }

  /**
   * Clear cached user info
   */
  clearUserInfo(): void {
    this.userInfoSubject.next(null);
    this.errorSubject.next(null);
  }

  /**
   * Check if user info is currently loading
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get current error (if any)
   */
  getCurrentError(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Calculate total portfolio value in USD
   */
  calculateTotalValue(userInfo: BingXUserInfo): number {
    if (!userInfo.success || !userInfo.data.accountInfo) {
      return 0;
    }

    const accountInfo = userInfo.data.accountInfo;
    if ('error' in accountInfo) {
      return 0;
    }

    return parseFloat(accountInfo.balance.equity || '0');
  }

  /**
   * Get active (non-zero) positions
   */
  getActivePositions(userInfo: BingXUserInfo): BingXPosition[] {
    if (!userInfo.success || !userInfo.data.positions) {
      return [];
    }

    return userInfo.data.positions.filter(
      position => parseFloat(position.positionAmt) > 0
    );
  }

  /**
   * Calculate total unrealized PnL from positions
   */
  calculateUnrealizedPnl(userInfo: BingXUserInfo): number {
    const activePositions = this.getActivePositions(userInfo);
    return activePositions.reduce(
      (total, position) => total + parseFloat(position.unrealizedProfit || '0'),
      0
    );
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(): Observable<any> {
    const baseUrl = getEndpointUrl('bingx', 'walletBalance');
    const env = this.environmentService.currentEnvironment();
    const params: Record<string, string> = {
      environment: env
    };
    const url = buildUrlWithQuery(baseUrl, params);

    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching wallet balance:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tickers
   */
  getTickers(symbol?: string): Observable<any> {
    const baseUrl = getEndpointUrl('bingx', 'tickers');
    const env = this.environmentService.currentEnvironment();
    const params: Record<string, string> = {
      environment: env
    };
    if (symbol) {
      params['symbol'] = symbol;
    }
    const url = buildUrlWithQuery(baseUrl, params);

    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching tickers:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: HttpErrorResponse): string {
    console.error('BingX User Service Error:', error);

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.status === 401) {
      return 'Invalid API credentials. Please check your BingX API key and secret.';
    }

    if (error.status === 403) {
      return 'Access forbidden. Please check your API key permissions.';
    }

    if (error.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }
}
