import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getEndpointUrl, buildUrlWithQuery } from '../config/app.config';

/**
 * Individual Deal Information
 */
export interface FundingArbitrageDeal {
  id: string;
  symbol: string;
  primaryExchange: string;
  hedgeExchange: string;
  fundingRate: number;
  positionType: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  hedgeEntryPrice: number;
  primaryExitPrice: number | null;
  hedgeExitPrice: number | null;
  fundingEarned: number;
  realizedPnl: number;
  primaryTradingFees: number;
  hedgeTradingFees: number;
  executedAt: string | null;
  closedAt: string | null;
  duration: number | null; // in seconds
}

/**
 * Best/Worst Deal Summary
 */
export interface DealSummary {
  symbol: string;
  revenue: number;
  date: string | null;
}

/**
 * Revenue Summary Statistics
 */
export interface RevenueSummary {
  totalDeals: number;
  totalRevenue: number;
  totalFundingEarned: number;
  totalTradingPnl: number;
  avgRevenuePerDeal: number;
  winRate: number;
  profitableDeals: number;
  losingDeals: number;
  bestDeal: DealSummary | null;
  worstDeal: DealSummary | null;
}

/**
 * Revenue By Symbol
 */
export interface RevenueBySymbol {
  symbol: string;
  deals: number;
  revenue: number;
  avgRevenue: number;
  fundingEarned: number;
}

/**
 * Revenue By Exchange
 */
export interface RevenueByExchange {
  exchange: string;
  deals: number;
  revenue: number;
  avgRevenue: number;
}

/**
 * Daily Revenue Timeline
 */
export interface RevenueTimeline {
  date: string; // YYYY-MM-DD
  deals: number;
  revenue: number;
  fundingEarned: number;
}

/**
 * Applied Filters
 */
export interface RevenueFilters {
  startDate: string;
  endDate: string;
  exchange: string | null;
  symbol: string | null;
}

/**
 * Complete Revenue Response
 */
export interface FundingArbitrageRevenueResponse {
  success: boolean;
  data: {
    summary: RevenueSummary;
    bySymbol: RevenueBySymbol[];
    byExchange: RevenueByExchange[];
    deals: FundingArbitrageDeal[];
    timeline: RevenueTimeline[];
  };
  filters: RevenueFilters;
  timestamp: string;
}

/**
 * Subscribe to Hedged Arbitrage Request Parameters
 */
export interface FundingArbitrageSubscribeRequest {
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  positionType: 'long' | 'short';
  quantity: number;
  primaryCredentialId: string;
  hedgeExchange: string;
  hedgeCredentialId: string;
  leverage: number;
  margin: number;
  mode: 'HEDGED';
}

/**
 * Subscribe Response
 */
export interface FundingArbitrageSubscribeResponse {
  success: boolean;
  data: {
    subscriptionId: string;
    symbol: string;
    fundingRate: number;
    nextFundingTime: number;
    positionType: string;
    quantity: number;
    leverage: number;
    margin: number;
    status: string;
    createdAt: string;
  };
  message: string;
  timestamp: string;
}

/**
 * Funding Arbitrage Service
 *
 * Handles all funding arbitrage revenue operations including:
 * - Fetching revenue statistics
 * - Filtering by date range, exchange, and symbol
 * - Managing revenue state with reactive BehaviorSubjects
 */
@Injectable({
  providedIn: 'root'
})
export class FundingArbitrageService {
  private revenueSubject = new BehaviorSubject<FundingArbitrageRevenueResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public readonly revenue$ = this.revenueSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive revenue statistics for funding arbitrage
   * @param startDate - Optional start date (ISO string)
   * @param endDate - Optional end date (ISO string)
   * @param exchange - Optional exchange filter
   * @param symbol - Optional symbol filter
   * @returns Observable<FundingArbitrageRevenueResponse>
   */
  getRevenue(
    startDate?: string,
    endDate?: string,
    exchange?: string,
    symbol?: string
  ): Observable<FundingArbitrageRevenueResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const baseUrl = getEndpointUrl('fundingArbitrage', 'revenue');
    const params: Record<string, string> = {};

    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    if (exchange) params['exchange'] = exchange;
    if (symbol) params['symbol'] = symbol;

    const url = Object.keys(params).length > 0 ? buildUrlWithQuery(baseUrl, params) : baseUrl;

    return this.http.get<FundingArbitrageRevenueResponse>(url).pipe(
      tap(response => {
        this.revenueSubject.next(response);
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
   * Refresh revenue data with current filters
   */
  refreshRevenue(): Observable<FundingArbitrageRevenueResponse> {
    const currentRevenue = this.revenueSubject.value;
    if (!currentRevenue) {
      return this.getRevenue();
    }

    const filters = currentRevenue.filters;
    return this.getRevenue(
      filters.startDate,
      filters.endDate,
      filters.exchange || undefined,
      filters.symbol || undefined
    );
  }

  /**
   * Subscribe to funding arbitrage (start hedged arbitrage position)
   * @param request - Subscription request parameters
   * @returns Observable<FundingArbitrageSubscribeResponse>
   */
  subscribe(request: FundingArbitrageSubscribeRequest): Observable<FundingArbitrageSubscribeResponse> {
    const url = getEndpointUrl('fundingArbitrage', 'subscribe');

    return this.http.post<FundingArbitrageSubscribeResponse>(url, request).pipe(
      catchError(error => {
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get current revenue data from cache (if available)
   */
  getCurrentRevenue(): FundingArbitrageRevenueResponse | null {
    return this.revenueSubject.value;
  }

  /**
   * Clear cached revenue data
   */
  clearRevenue(): void {
    this.revenueSubject.next(null);
    this.errorSubject.next(null);
  }

  /**
   * Check if revenue data is currently loading
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
   * Calculate total fees from deals
   */
  calculateTotalFees(deals: FundingArbitrageDeal[]): number {
    return deals.reduce(
      (total, deal) => total + deal.primaryTradingFees + deal.hedgeTradingFees,
      0
    );
  }

  /**
   * Calculate net profit (revenue - fees)
   */
  calculateNetProfit(totalRevenue: number, totalFees: number): number {
    return totalRevenue - totalFees;
  }

  /**
   * Format duration in seconds to human-readable string
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
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: HttpErrorResponse): string {
    console.error('Funding Arbitrage Service Error:', error);

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.status === 401) {
      return 'Unauthorized. Please log in again.';
    }

    if (error.status === 403) {
      return 'Access forbidden. You do not have permission to view this data.';
    }

    if (error.status === 400) {
      return error.error?.message || 'Invalid request parameters.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }
}
