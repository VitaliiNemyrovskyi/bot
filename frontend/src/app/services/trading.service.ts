import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { getEndpointUrl } from '../config/app.config';

export interface TradingPlatform {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  apiKeyLast4?: string;
  connectedAt?: Date;
  lastSync?: Date;
}

export interface ApiKeyRequest {
  platformId: string;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
}

export interface BalanceData {
  totalBalance: number;
  availableBalance: number;
  tradingBalance: number;
  pendingOrders: number;
  balanceChange: number;
  platforms: PlatformBalance[];
}

export interface PlatformBalance {
  platformId: string;
  platformName: string;
  balance: number;
  currency: string;
  lastSync: Date;
}

export interface TradeOrder {
  id: string;
  platformId: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: Date;
  filledAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TradingService {
  private isLoadingBalance = signal<boolean>(false);
  private isConnectingPlatform = signal<boolean>(false);

  readonly isLoadingBalance$ = this.isLoadingBalance.asReadonly();
  readonly isConnectingPlatform$ = this.isConnectingPlatform.asReadonly();

  constructor(private http: HttpClient) {}


  // Get available trading platforms
  getPlatforms(): Observable<TradingPlatform[]> {
    return this.http.get<TradingPlatform[]>(
      getEndpointUrl('trading', 'platforms')
    ).pipe(
      catchError(error => {
        console.error('Error fetching trading platforms:', error);
        return throwError(() => error);
      })
    );
  }

  // Connect trading platform with API key
  connectPlatform(apiKeyData: ApiKeyRequest): Observable<TradingPlatform> {
    this.isConnectingPlatform.set(true);

    return this.http.post<TradingPlatform>(
      getEndpointUrl('trading', 'apiKeys'),
      apiKeyData
    ).pipe(
      tap(() => this.isConnectingPlatform.set(false)),
      catchError(error => {
        this.isConnectingPlatform.set(false);
        console.error('Error connecting platform:', error);
        return throwError(() => error);
      })
    );
  }

  // Remove API key / disconnect platform
  disconnectPlatform(platformId: string): Observable<void> {
    return this.http.delete<void>(
      `${getEndpointUrl('trading', 'apiKeys')}/${platformId}`
    ).pipe(
      catchError(error => {
        console.error('Error disconnecting platform:', error);
        return throwError(() => error);
      })
    );
  }

  // Test API key connection
  testConnection(platformId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${getEndpointUrl('trading', 'apiKeys')}/${platformId}/test`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error testing connection:', error);
        return throwError(() => error);
      })
    );
  }

  // Get balance data from all connected platforms
  getBalance(): Observable<BalanceData> {
    this.isLoadingBalance.set(true);

    return this.http.get<BalanceData>(
      getEndpointUrl('trading', 'balance')
    ).pipe(
      tap(() => this.isLoadingBalance.set(false)),
      catchError(error => {
        this.isLoadingBalance.set(false);
        console.error('Error fetching balance:', error);
        return throwError(() => error);
      })
    );
  }

  // Refresh balance data
  refreshBalance(): Observable<BalanceData> {
    return this.http.post<BalanceData>(
      `${getEndpointUrl('trading', 'balance')}/refresh`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error refreshing balance:', error);
        return throwError(() => error);
      })
    );
  }

  // Get trading orders
  getOrders(platformId?: string): Observable<TradeOrder[]> {
    const params = platformId ? `?platformId=${platformId}` : '';

    return this.http.get<TradeOrder[]>(
      `${getEndpointUrl('trading', 'orders')}${params}`
    ).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        return throwError(() => error);
      })
    );
  }

  // Update API key
  updateApiKey(platformId: string, apiKeyData: Partial<ApiKeyRequest>): Observable<TradingPlatform> {
    return this.http.put<TradingPlatform>(
      `${getEndpointUrl('trading', 'apiKeys')}/${platformId}`,
      apiKeyData
    ).pipe(
      catchError(error => {
        console.error('Error updating API key:', error);
        return throwError(() => error);
      })
    );
  }
}