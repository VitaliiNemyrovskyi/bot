/**
 * Price Arbitrage Service
 *
 * Service for managing price arbitrage positions across exchanges.
 * Handles:
 * - Fetching arbitrage opportunities
 * - Starting new arbitrage positions
 * - Monitoring active positions
 * - Closing positions
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getEndpointUrl } from '../config/app.config';
import {
  PriceArbitrageOpportunity,
  PriceArbitrageOpportunitiesResponse,
  PriceArbitragePositionDTO,
  PriceArbitragePositionResponse,
  PriceArbitragePositionListResponse,
  StartPriceArbitrageParams,
  ClosePositionResponse,
  PriceArbitrageStatus,
  isPriceArbitrageError,
  FundingRateData,
  FundingRatesResponse
} from '../models/price-arbitrage.model';

@Injectable({
  providedIn: 'root'
})
export class PriceArbitrageService {
  private http = inject(HttpClient);

  /**
   * Get HTTP headers with authentication token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Fetch price arbitrage opportunities across all exchanges
   * @returns Observable of arbitrage opportunities
   */
  getOpportunities(): Observable<PriceArbitrageOpportunity[]> {
    const url = getEndpointUrl('arbitrage', 'opportunities');

    return this.http.get<PriceArbitrageOpportunitiesResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data; // data is already the array
        }
        throw new Error('Failed to fetch opportunities');
      }),
      catchError(error => {
        console.error('Error fetching arbitrage opportunities:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * HYBRID APPROACH: Fetch ONLY price opportunities (fast, without funding rates)
   * @returns Observable of price-only arbitrage opportunities
   */
  getPricesOnly(): Observable<PriceArbitrageOpportunity[]> {
    const url = getEndpointUrl('arbitrage', 'opportunities') + '?skipFunding=true';

    return this.http.get<PriceArbitrageOpportunitiesResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch price opportunities');
      }),
      catchError(error => {
        console.error('Error fetching price opportunities:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * HYBRID APPROACH: Fetch funding rates from all exchanges (with caching)
   * @returns Observable of funding rates
   */
  getFundingRates(): Observable<FundingRateData[]> {
    const url = '/api/funding-rates'; // Direct top-level endpoint with caching

    return this.http.get<FundingRatesResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log(`[PriceArbitrageService] Fetched ${response.data.length} funding rates (cached: ${response.cached})`);
          return response.data;
        }
        throw new Error('Failed to fetch funding rates');
      }),
      catchError(error => {
        console.error('Error fetching funding rates:', error);
        // Return empty array on error - we can still show price-only opportunities
        return throwError(() => error);
      })
    );
  }

  /**
   * HYBRID APPROACH: Combine price opportunities with funding rates
   * @param priceOpps Price-only opportunities
   * @param fundingRates Funding rates from all exchanges
   * @returns Combined opportunities with funding rate metrics
   */
  combinePricesWithFunding(
    priceOpps: PriceArbitrageOpportunity[],
    fundingRates: FundingRateData[]
  ): PriceArbitrageOpportunity[] {
    // Create funding rate map: Map<exchange:symbol, fundingRate>
    const fundingMap = new Map<string, number>();
    fundingRates.forEach(fr => {
      const key = `${fr.exchange}:${fr.symbol}`;
      fundingMap.set(key, fr.fundingRate);
    });

    // Enrich opportunities with funding data
    return priceOpps.map(opp => {
      const primaryKey = `${opp.primaryExchange.name}:${opp.symbol}`;
      const hedgeKey = `${opp.hedgeExchange.name}:${opp.symbol}`;

      const primaryFundingRate = fundingMap.get(primaryKey);
      const hedgeFundingRate = fundingMap.get(hedgeKey);

      // If no funding data available, return as-is (price_only strategy)
      if (primaryFundingRate === undefined || hedgeFundingRate === undefined) {
        return {
          ...opp,
          strategyType: 'price_only' as const
        };
      }

      // Calculate combined metrics
      // PRIMARY (SHORT) = we RECEIVE funding if positive
      // HEDGE (LONG) = we PAY funding if positive
      const fundingDifferential = primaryFundingRate - hedgeFundingRate;

      // Expected daily return = price spread + funding × 3 periods per day
      const dailyFundingReturn = fundingDifferential * 3;
      const expectedDailyReturn = opp.spreadPercent + dailyFundingReturn;

      // Estimated monthly ROI
      const estimatedMonthlyROI = opp.spreadPercent + (dailyFundingReturn * 30);

      // Combined score = spread + funding for 7 days
      const combinedScore = opp.spreadPercent + (dailyFundingReturn * 7);

      return {
        ...opp,
        primaryFundingRate,
        hedgeFundingRate,
        fundingDifferential,
        combinedScore,
        expectedDailyReturn,
        estimatedMonthlyROI,
        strategyType: 'combined' as const
      };
    });
  }

  /**
   * Start a new price arbitrage position
   * @param params Configuration for the arbitrage position
   * @returns Observable of the created position
   */
  startArbitrage(params: StartPriceArbitrageParams): Observable<PriceArbitragePositionDTO> {
    const url = getEndpointUrl('arbitrage', 'startPosition');

    return this.http.post<PriceArbitragePositionResponse>(url, params, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to start arbitrage');
      }),
      catchError(error => {
        console.error('Error starting arbitrage:', error);
        const errorMessage = error.error?.error?.message || error.message || 'Failed to start arbitrage';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get list of arbitrage positions with optional status filter
   * @param status Optional status filter (ACTIVE, COMPLETED, ERROR, etc.)
   * @returns Observable of position list
   */
  getPositions(status?: PriceArbitrageStatus): Observable<PriceArbitragePositionDTO[]> {
    let url = getEndpointUrl('arbitrage', 'positions');

    if (status) {
      url += `?status=${status}`;
    }

    return this.http.get<PriceArbitragePositionListResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data; // data is already the array
        }
        throw new Error('Failed to fetch positions');
      }),
      catchError(error => {
        console.error('Error fetching positions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific arbitrage position by ID
   * @param id Position ID
   * @returns Observable of the position
   */
  getPosition(id: string): Observable<PriceArbitragePositionDTO> {
    const url = getEndpointUrl('arbitrage', `positions/${id}`);

    return this.http.get<PriceArbitragePositionResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch position');
      }),
      catchError(error => {
        console.error('Error fetching position:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Close an active arbitrage position
   * @param id Position ID
   * @returns Observable of the close operation result
   */
  closePosition(id: string): Observable<{
    position: PriceArbitragePositionDTO;
    totalPnl: number;
    primaryPnl: number;
    hedgePnl: number;
  }> {
    const url = getEndpointUrl('arbitrage', `positions/${id}/close`);

    return this.http.post<ClosePositionResponse>(url, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to close position');
      }),
      catchError(error => {
        console.error('Error closing position:', error);
        const errorMessage = error.error?.error?.message || error.message || 'Failed to close position';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get active positions only
   * Convenience method that filters for ACTIVE status
   * @returns Observable of active positions
   */
  getActivePositions(): Observable<PriceArbitragePositionDTO[]> {
    return this.getPositions(PriceArbitrageStatus.ACTIVE);
  }

  /**
   * Get completed positions only
   * Convenience method that filters for COMPLETED status
   * @returns Observable of completed positions
   */
  getCompletedPositions(): Observable<PriceArbitragePositionDTO[]> {
    return this.getPositions(PriceArbitrageStatus.COMPLETED);
  }

  /**
   * Get positions with errors
   * Convenience method that filters for ERROR status
   * @returns Observable of error positions
   */
  getErrorPositions(): Observable<PriceArbitragePositionDTO[]> {
    return this.getPositions(PriceArbitrageStatus.ERROR);
  }

  /**
   * Calculate unrealized P&L for an active position
   * @param position The position to calculate P&L for
   * @returns The unrealized P&L value
   */
  calculateUnrealizedPnl(position: PriceArbitragePositionDTO): number {
    if (position.status !== PriceArbitrageStatus.ACTIVE) {
      return position.totalPnl || 0;
    }

    if (!position.currentPrimaryPrice || !position.currentHedgePrice) {
      return 0;
    }

    // Calculate P&L for SHORT position on primary exchange
    const primaryQuantity = (position.primaryMargin * position.primaryLeverage) / position.entryPrimaryPrice;
    const primaryPnl = primaryQuantity * (position.entryPrimaryPrice - position.currentPrimaryPrice);

    // Calculate P&L for LONG position on hedge exchange
    const hedgeQuantity = (position.hedgeMargin * position.hedgeLeverage) / position.entryHedgePrice;
    const hedgePnl = hedgeQuantity * (position.currentHedgePrice - position.entryHedgePrice);

    // Total unrealized P&L
    const totalPnl = primaryPnl + hedgePnl - position.primaryFees - position.hedgeFees;

    return totalPnl;
  }

  /**
   * Format spread percentage for display
   * @param spread Spread as decimal (e.g., 0.015)
   * @param decimals Number of decimal places
   * @returns Formatted spread string (e.g., "1.50%")
   */
  formatSpread(spread: number, decimals: number = 2): string {
    return `${(spread * 100).toFixed(decimals)}%`;
  }

  /**
   * Check if opportunity meets minimum spread threshold
   * @param opportunity The opportunity to check
   * @param minSpread Minimum spread threshold as decimal (e.g., 0.01 for 1%)
   * @returns True if opportunity meets threshold
   */
  meetsSpreadThreshold(opportunity: PriceArbitrageOpportunity, minSpread: number): boolean {
    return opportunity.spread >= minSpread;
  }
}
