import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getEndpointUrl, buildUrlWithQuery } from '../config/app.config';

/**
 * Bybit Account Information Interface
 */
export interface BybitAccountInfo {
  totalEquity: string;
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  coin: BybitCoinBalance[];
}

/**
 * Individual coin balance in account
 */
export interface BybitCoinBalance {
  coin: string;
  equity: string;
  usdValue: string;
  walletBalance: string;
  availableToWithdraw: string;
  availableToBorrow: string;
  borrowAmount: string;
  accruedInterest: string;
  totalOrderIM: string;
  totalPositionIM: string;
  totalPositionMM: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
}

/**
 * Bybit Wallet Balance Information
 */
export interface BybitWalletBalance {
  accountType: string;
  accountIMRate: string;
  accountMMRate: string;
  totalEquity: string;
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  accountLTV: string;
  coin: BybitCoinBalance[];
}

/**
 * Bybit Position Information
 */
export interface BybitPosition {
  symbol: string;
  side: 'Buy' | 'Sell' | 'None';
  size: string;
  positionValue: string;
  entryPrice: string;
  markPrice: string;
  liqPrice: string;
  bustPrice: string;
  positionMM: string;
  positionIM: string;
  tpslMode: string;
  takeProfit: string;
  stopLoss: string;
  trailingStop: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  createdTime: string;
  updatedTime: string;
  leverage: string;
}

/**
 * Bybit Order Information
 */
export interface BybitOrder {
  orderId: string;
  orderLinkId: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: string;
  qty: string;
  price: string;
  orderStatus: string;
  timeInForce: string;
  createdTime: string;
  updatedTime: string;
  avgPrice: string;
  cumExecQty: string;
  cumExecValue: string;
  cumExecFee: string;
}

/**
 * Complete Bybit User Information Response
 */
export interface BybitUserInfo {
  success: boolean;
  timestamp: string;
  testnet: boolean;
  data: {
    accountInfo: BybitAccountInfo | { error: string };
    walletBalance: {
      list: BybitWalletBalance[];
    } | { error: string };
    positions: BybitPosition[];
    positionsCount: number;
    activeOrders: BybitOrder[];
    activeOrdersCount: number;
    orderHistory: BybitOrder[];
    marketReference: any;
  };
}

/**
 * API Credentials Test Request
 */
export interface BybitCredentialsTest {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
}

/**
 * API Credentials Test Response
 */
export interface BybitCredentialsTestResponse {
  success: boolean;
  message: string;
  testnet: boolean;
  accountPreview?: {
    totalEquity: string;
    totalWalletBalance: string;
    totalAvailableBalance: string;
  };
  timestamp: string;
}

/**
 * Stored API Keys Response
 */
export interface BybitStoredApiKeysResponse {
  success: boolean;
  data: {
    hasKeys: boolean;
    testnet: boolean;
    apiKeyPreview: string;
    createdAt?: string;
    updatedAt?: string;
  };
  timestamp: string;
}

/**
 * API Keys Save Request
 */
export interface BybitSaveApiKeysRequest {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

/**
 * API Keys Save Response
 */
export interface BybitSaveApiKeysResponse {
  success: boolean;
  message: string;
}

/**
 * Delete API Keys Response
 */
export interface BybitDeleteApiKeysResponse {
  success: boolean;
  message: string;
}

/**
 * Detailed Wallet Balance Response
 */
export interface BybitWalletBalanceResponse {
  success: boolean;
  data: {
    list: Array<{
      accountType: string;
      totalEquity: string;
      totalWalletBalance: string;
      totalAvailableBalance: string;
      totalMarginBalance?: string;
      coin: Array<{
        coin: string;
        equity: string;
        walletBalance: string;
        availableToWithdraw: string;
        locked: string;
        usdValue: string;
      }>;
    }>;
  };
  accountType: string;
  timestamp: string;
}

/**
 * Asset Information for a single coin
 */
export interface BybitAssetItem {
  coin: string;
  frozen: string;
  free: string;
  withdraw: string;
  [key: string]: any; // Allow for additional fields from API
}

/**
 * Asset Information for an account type
 */
export interface BybitAccountAssetInfo {
  status: string;
  assets: BybitAssetItem[];
}

/**
 * Complete Asset Information Response
 */
export interface BybitAssetInfoResponse {
  success: boolean;
  data: {
    spot?: BybitAccountAssetInfo;
    contract?: BybitAccountAssetInfo;
    unified?: BybitAccountAssetInfo;
    investment?: BybitAccountAssetInfo;
    option?: BybitAccountAssetInfo;
    fund?: BybitAccountAssetInfo;
    [key: string]: any; // Allow for dynamic account types
  };
  accountType?: string;
  coin?: string;
  testnet: boolean;
  timestamp: string;
}

/**
 * Single coin balance in All Coins Balance response
 */
export interface BybitCoinBalanceItem {
  coin: string;
  transferBalance: string;
  walletBalance: string;
  bonus: string;
}

/**
 * All Coins Balance Response
 * Used for querying all coins in a specific account type (especially FUND)
 */
export interface BybitAllCoinsBalanceResponse {
  success: boolean;
  data: {
    memberId: string;
    accountType: string;
    balance: BybitCoinBalanceItem[];
  };
  accountType: string;
  coin?: string;
  testnet: boolean;
  timestamp: string;
}

/**
 * Bybit User Service
 *
 * Handles all Bybit user-related operations including:
 * - Fetching user account information
 * - Testing API credentials
 * - Managing account balance data
 * - Retrieving positions and orders
 */
@Injectable({
  providedIn: 'root'
})
export class BybitUserService {
  private userInfoSubject = new BehaviorSubject<BybitUserInfo | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private storedKeysSubject = new BehaviorSubject<BybitStoredApiKeysResponse | null>(null);

  public readonly userInfo$ = this.userInfoSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();
  public readonly storedKeys$ = this.storedKeysSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {
    // Bybit User Service initialized
  }

  /**
   * Get comprehensive Bybit user information using stored API keys
   * This method now only works with stored credentials in the backend
   * @returns Observable<BybitUserInfo>
   */
  getUserInfo(): Observable<BybitUserInfo> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const url = getEndpointUrl('bybit', 'userInfo');

    return this.http.get<BybitUserInfo>(url).pipe(
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
  refreshUserInfo(): Observable<BybitUserInfo> {
    return this.getUserInfo();
  }

  /**
   * Get current user info from cache (if available)
   */
  getCurrentUserInfo(): BybitUserInfo | null {
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
  calculateTotalValue(userInfo: BybitUserInfo): number {
    if (!userInfo.success || !userInfo.data.accountInfo) {
      return 0;
    }

    const accountInfo = userInfo.data.accountInfo;
    if ('error' in accountInfo) {
      return 0;
    }

    return parseFloat(accountInfo.totalEquity || '0');
  }

  /**
   * Get all non-zero coin balances
   */
  getNonZeroBalances(userInfo: BybitUserInfo): BybitCoinBalance[] {
    if (!userInfo.success || !userInfo.data.walletBalance) {
      return [];
    }

    const walletBalance = userInfo.data.walletBalance;
    if ('error' in walletBalance || !walletBalance.list || walletBalance.list.length === 0) {
      return [];
    }

    const coins = walletBalance.list[0].coin || [];
    return coins.filter(coin => parseFloat(coin.walletBalance) > 0);
  }

  /**
   * Get active (non-zero) positions
   */
  getActivePositions(userInfo: BybitUserInfo): BybitPosition[] {
    if (!userInfo.success || !userInfo.data.positions) {
      return [];
    }

    return userInfo.data.positions.filter(
      position => parseFloat(position.size) > 0 && position.side !== 'None'
    );
  }

  /**
   * Calculate total unrealized PnL from positions
   */
  calculateUnrealizedPnl(userInfo: BybitUserInfo): number {
    const activePositions = this.getActivePositions(userInfo);
    return activePositions.reduce(
      (total, position) => total + parseFloat(position.unrealisedPnl || '0'),
      0
    );
  }

  /**
   * Save API keys to the database
   * This method now validates AND saves the keys in a single operation
   * The backend tests the credentials before storing them
   * @param apiKey - Bybit API key
   * @param apiSecret - Bybit API secret
   * @param testnet - Whether to use testnet
   * @returns Observable<BybitSaveApiKeysResponse>
   */
  saveApiKeys(apiKey: string, apiSecret: string, testnet: boolean): Observable<BybitSaveApiKeysResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const request: BybitSaveApiKeysRequest = {
      apiKey,
      apiSecret,
      testnet
    };

    return this.http.post<BybitSaveApiKeysResponse>(
      getEndpointUrl('bybit', 'apiKeys'),
      request
    ).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          // Update stored keys status
          this.storedKeysSubject.next({
            success: true,
            data: {
              hasKeys: true,
              testnet,
              apiKeyPreview: this.maskApiKey(apiKey)
            },
            timestamp: new Date().toISOString()
          });
        }
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
   * Get stored API keys information (without exposing actual keys)
   * @returns Observable<BybitStoredApiKeysResponse>
   */
  getStoredApiKeys(): Observable<BybitStoredApiKeysResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BybitStoredApiKeysResponse>(
      getEndpointUrl('bybit', 'storedApiKeys')
    ).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        this.storedKeysSubject.next(response);
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
   * Delete stored API keys from the database
   * @returns Observable<BybitDeleteApiKeysResponse>
   */
  deleteApiKeys(): Observable<BybitDeleteApiKeysResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<BybitDeleteApiKeysResponse>(
      getEndpointUrl('bybit', 'deleteApiKeys')
    ).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          // Clear stored keys status
          this.storedKeysSubject.next(null);
          // Clear user info as well
          this.userInfoSubject.next(null);
        }
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
   * Get current stored keys status
   */
  getStoredKeysStatus(): BybitStoredApiKeysResponse | null {
    return this.storedKeysSubject.value;
  }

  /**
   * Check if user has stored API keys
   */
  hasStoredKeys(): boolean {
    const storedKeys = this.storedKeysSubject.value;
    return storedKeys?.data?.hasKeys ?? false;
  }

  /**
   * Get detailed wallet balance from Bybit
   * @param accountType - Account type (UNIFIED or CONTRACT)
   * @param coin - Optional specific coin to query
   * @returns Observable<BybitWalletBalanceResponse>
   */
  getWalletBalance(accountType: 'UNIFIED' | 'CONTRACT' = 'UNIFIED', coin?: string): Observable<BybitWalletBalanceResponse> {
    const baseUrl = getEndpointUrl('bybit', 'walletBalance');
    const params: Record<string, string> = {
      accountType
    };
    if (coin) {
      params['coin'] = coin;
    }
    const url = buildUrlWithQuery(baseUrl, params);

    return this.http.get<BybitWalletBalanceResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching wallet balance:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get asset information from Bybit
   * Retrieves detailed asset information for different account types
   * @param accountType - Optional account type (SPOT, CONTRACT, UNIFIED, etc.)
   * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
   * @returns Observable<BybitAssetInfoResponse>
   */
  getAssetInfo(accountType?: string, coin?: string): Observable<BybitAssetInfoResponse> {
    const baseUrl = getEndpointUrl('bybit', 'assetInfo');
    const params: Record<string, string> = {};
    if (accountType) {
      params['accountType'] = accountType.toUpperCase();
    }
    if (coin) {
      params['coin'] = coin.toUpperCase();
    }
    const url = buildUrlWithQuery(baseUrl, params);

    return this.http.get<BybitAssetInfoResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching asset info:', error);
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get all coins balance from Bybit
   * Retrieves comprehensive balance information for all coins in a specific account type.
   * This endpoint can query the FUND (Funding wallet) where balances may be stored.
   *
   * @param accountType - Optional account type (UNIFIED, SPOT, CONTRACT, FUND, OPTION, etc.)
   *                      Default: FUND (Funding wallet)
   * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
   * @returns Observable<BybitAllCoinsBalanceResponse>
   */
  getAllCoinsBalance(accountType?: string, coin?: string): Observable<BybitAllCoinsBalanceResponse> {
    const baseUrl = getEndpointUrl('bybit', 'allCoinsBalance');
    const params: Record<string, string> = {};
    if (accountType) {
      params['accountType'] = accountType.toUpperCase();
    }
    if (coin) {
      params['coin'] = coin.toUpperCase();
    }
    const url = buildUrlWithQuery(baseUrl, params);

    return this.http.get<BybitAllCoinsBalanceResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching all coins balance:', error);
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Mask API key for display (show only last 4 characters)
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 4) {
      return '****';
    }
    return '****' + apiKey.slice(-4);
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: HttpErrorResponse): string {
    console.error('Bybit User Service Error:', error);

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.status === 401) {
      return 'Invalid API credentials. Please check your Bybit API key and secret.';
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
