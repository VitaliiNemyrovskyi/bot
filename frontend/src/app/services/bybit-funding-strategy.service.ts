/**
 * Bybit Funding Strategy Service
 *
 * Service for managing Bybit funding strategies (both regular and precise timing)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getEndpointUrl } from '../config/app.config';
import {
  StartFundingStrategyRequest,
  StartFundingStrategyResponse,
  StartPreciseTimingStrategyRequest,
  StartPreciseTimingStrategyResponse,
  GetActiveStrategiesResponse,
  StopStrategyResponse,
  ActiveStrategy,
} from '../models/bybit-funding-strategy.model';

@Injectable({
  providedIn: 'root',
})
export class BybitFundingStrategyService {
  private http = inject(HttpClient);
  private baseUrl = '/api/bybit-funding-strategy';

  /**
   * Get HTTP headers with authentication token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  /**
   * Start Regular Funding Strategy (opens 5s BEFORE funding time)
   *
   * @param params Strategy configuration
   * @returns Observable of start response
   */
  startRegularStrategy(
    params: StartFundingStrategyRequest
  ): Observable<StartFundingStrategyResponse['data']> {
    const url = `${this.baseUrl}/start`;

    return this.http
      .post<StartFundingStrategyResponse>(url, params, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Failed to start regular funding strategy');
        }),
        catchError((error) => {
          console.error('Error starting regular funding strategy:', error);
          const errorMessage =
            error.error?.error || error.message || 'Failed to start regular funding strategy';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Start Precise Timing Strategy (opens 20ms AFTER funding time)
   *
   * @param params Strategy configuration
   * @returns Observable of start response
   */
  startPreciseTimingStrategy(
    params: StartPreciseTimingStrategyRequest
  ): Observable<StartPreciseTimingStrategyResponse['data']> {
    const url = `${this.baseUrl}/start-precise-timing`;

    return this.http
      .post<StartPreciseTimingStrategyResponse>(url, params, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Failed to start precise timing strategy');
        }),
        catchError((error) => {
          console.error('Error starting precise timing strategy:', error);
          const errorMessage =
            error.error?.error || error.message || 'Failed to start precise timing strategy';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Get all active funding strategies
   *
   * @returns Observable of active strategies
   */
  getActiveStrategies(): Observable<ActiveStrategy[]> {
    const url = this.baseUrl;

    return this.http
      .get<GetActiveStrategiesResponse>(url, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error('Failed to fetch active strategies');
        }),
        catchError((error) => {
          console.error('Error fetching active strategies:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Stop a specific strategy
   *
   * @param strategyId Strategy ID to stop
   * @returns Observable of stop response
   */
  stopStrategy(strategyId: string): Observable<void> {
    const url = `${this.baseUrl}/${strategyId}`;

    return this.http
      .delete<StopStrategyResponse>(url, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.success) {
            return;
          }
          throw new Error(response.error || 'Failed to stop strategy');
        }),
        catchError((error) => {
          console.error('Error stopping strategy:', error);
          const errorMessage = error.error?.error || error.message || 'Failed to stop strategy';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Format funding rate for display
   *
   * @param rate Funding rate as decimal (e.g., 0.0001)
   * @param decimals Number of decimal places
   * @returns Formatted rate string (e.g., "0.01%")
   */
  formatFundingRate(rate: number, decimals: number = 4): string {
    return `${(rate * 100).toFixed(decimals)}%`;
  }

  /**
   * Calculate expected funding payment
   *
   * @param margin Margin in USDT
   * @param leverage Leverage multiplier
   * @param fundingRate Funding rate as decimal
   * @returns Expected funding payment in USDT
   */
  calculateExpectedFunding(margin: number, leverage: number, fundingRate: number): number {
    return margin * leverage * Math.abs(fundingRate);
  }

  /**
   * Calculate take profit amount in USDT
   *
   * @param expectedFunding Expected funding payment
   * @param takeProfitPercent TP percentage (e.g., 90)
   * @returns Take profit amount in USDT
   */
  calculateTakeProfit(expectedFunding: number, takeProfitPercent: number): number {
    return expectedFunding * (takeProfitPercent / 100);
  }

  /**
   * Calculate stop loss amount in USDT
   *
   * @param expectedFunding Expected funding payment
   * @param stopLossPercent SL percentage (e.g., 50)
   * @returns Stop loss amount in USDT
   */
  calculateStopLoss(expectedFunding: number, stopLossPercent: number): number {
    return expectedFunding * (stopLossPercent / 100);
  }

  /**
   * Format time remaining until funding
   *
   * @param secondsRemaining Seconds remaining
   * @returns Formatted time string (e.g., "5m 30s")
   */
  formatTimeRemaining(secondsRemaining: number): string {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Check if funding rate is favorable for trading
   *
   * @param fundingRate Funding rate as decimal
   * @param minThreshold Minimum absolute threshold (default: 0.01%)
   * @returns True if rate meets threshold
   */
  isFundingRateFavorable(fundingRate: number, minThreshold: number = 0.0001): boolean {
    return Math.abs(fundingRate) >= minThreshold;
  }
}
