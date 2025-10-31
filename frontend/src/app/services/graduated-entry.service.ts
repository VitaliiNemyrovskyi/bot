/**
 * Graduated Entry Arbitrage Service
 *
 * Service for managing graduated entry arbitrage positions.
 * Handles:
 * - Fetching graduated entry positions
 * - Starting new graduated entry positions
 * - Monitoring active positions
 * - Real-time profit calculations
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface GraduatedEntryPosition {
  positionId: string;
  symbol: string;
  primary: {
    exchange: string;
    side: 'LONG' | 'SHORT';
    leverage: number;
    quantity: number;
    filledQuantity: number;
    orderIds: string[];
    status: string;
    errorMessage?: string;
    lastFundingPaid: number;
    totalFundingEarned: number;
    tradingFees: number;
    entryPrice?: number;
    currentPrice?: number;
    unrealizedPnl: number;
    liquidationPrice?: number;
    proximityRatio?: number;
    inDanger?: boolean;
    stopLoss?: number;
    takeProfit?: number;
  };
  hedge: {
    exchange: string;
    side: 'LONG' | 'SHORT';
    leverage: number;
    quantity: number;
    filledQuantity: number;
    orderIds: string[];
    status: string;
    errorMessage?: string;
    lastFundingPaid: number;
    totalFundingEarned: number;
    tradingFees: number;
    entryPrice?: number;
    currentPrice?: number;
    unrealizedPnl: number;
    liquidationPrice?: number;
    proximityRatio?: number;
    inDanger?: boolean;
    stopLoss?: number;
    takeProfit?: number;
  };
  graduatedEntry: {
    parts: number;
    delayMs: number;
    currentPart: number;
  };
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  entrySpreadProfit: number;
  totalUnrealizedPnl: number;
  grossProfit: number;
  netProfit: number;
  lastFundingUpdate?: Date;
  fundingUpdateCount: number;
  monitoring: {
    enabled: boolean;
    status?: string;
    lastCheck?: Date;
  };
}

export interface GraduatedEntryPositionsResponse {
  success: boolean;
  data: GraduatedEntryPosition[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraduatedEntryService {
  private http = inject(HttpClient);
  private readonly API_BASE = '/api/arbitrage/graduated-entry';

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
   * Get all graduated entry positions for the authenticated user
   * @param showAll If true, include completed positions
   * @returns Observable of graduated entry positions
   */
  getPositions(showAll = false): Observable<GraduatedEntryPosition[]> {
    const url = showAll ? `${this.API_BASE}?showAll=true` : this.API_BASE;

    return this.http.get<GraduatedEntryPositionsResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch graduated entry positions');
      }),
      catchError((error: Error) => {
        console.error('Error fetching graduated entry positions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get active graduated entry positions only
   * Filters out completed positions
   * @returns Observable of active positions
   */
  getActivePositions(): Observable<GraduatedEntryPosition[]> {
    return this.getPositions(false);
  }

  /**
   * Calculate real-time profit metrics using current WebSocket prices
   * @param position The position to calculate for
   * @param primaryCurrentPrice Current price on primary exchange from WebSocket
   * @param hedgeCurrentPrice Current price on hedge exchange from WebSocket
   * @returns Updated position with real-time profit calculations
   */
  calculateRealtimeProfit(
    position: GraduatedEntryPosition,
    primaryCurrentPrice?: number,
    hedgeCurrentPrice?: number
  ): {
    primaryUnrealizedPnl: number;
    hedgeUnrealizedPnl: number;
    totalUnrealizedPnl: number;
    grossProfit: number;
    netProfit: number;
  } {
    // Use WebSocket prices if available, otherwise use position's current prices
    const primaryPrice = primaryCurrentPrice || position.primary.currentPrice || position.primary.entryPrice || 0;
    const hedgePrice = hedgeCurrentPrice || position.hedge.currentPrice || position.hedge.entryPrice || 0;

    const primaryEntryPrice = position.primary.entryPrice || 0;
    const primaryQuantity = position.primary.filledQuantity || 0;

    const hedgeEntryPrice = position.hedge.entryPrice || 0;
    const hedgeQuantity = position.hedge.filledQuantity || 0;

    // Calculate unrealized PnL for each side
    // PRIMARY side: (currentPrice - entryPrice) * quantity for LONG, opposite for SHORT
    const primaryUnrealizedPnl = position.primary.side === 'LONG'
      ? (primaryPrice - primaryEntryPrice) * primaryQuantity
      : (primaryEntryPrice - primaryPrice) * primaryQuantity;

    // HEDGE side: (currentPrice - entryPrice) * quantity for LONG, opposite for SHORT
    const hedgeUnrealizedPnl = position.hedge.side === 'LONG'
      ? (hedgePrice - hedgeEntryPrice) * hedgeQuantity
      : (hedgeEntryPrice - hedgePrice) * hedgeQuantity;

    // Total unrealized PnL
    const totalUnrealizedPnl = primaryUnrealizedPnl + hedgeUnrealizedPnl;

    // Calculate entry spread profit
    const primaryNotional = primaryEntryPrice * primaryQuantity;
    const hedgeNotional = hedgeEntryPrice * hedgeQuantity;
    const entrySpreadProfit = position.primary.side === 'LONG'
      ? hedgeNotional - primaryNotional
      : primaryNotional - hedgeNotional;

    // Funding profits
    const totalFunding = position.primary.totalFundingEarned + position.hedge.totalFundingEarned;

    // Total fees
    const totalFees = position.primary.tradingFees + position.hedge.tradingFees;

    // Real-time Gross Profit = Entry Spread + Funding + Unrealized PnL
    const grossProfit = entrySpreadProfit + totalFunding + totalUnrealizedPnl;

    // Real-time Net Profit = Gross Profit - Fees
    const netProfit = grossProfit - totalFees;

    return {
      primaryUnrealizedPnl,
      hedgeUnrealizedPnl,
      totalUnrealizedPnl,
      grossProfit,
      netProfit
    };
  }

  /**
   * Format profit/loss for display
   * @param value The P&L value
   * @returns Formatted string with sign and color class
   */
  formatPnl(value: number): { text: string; colorClass: string } {
    const sign = value >= 0 ? '+' : '';
    const colorClass = value >= 0 ? 'text-success' : 'text-danger';
    return {
      text: `${sign}$${value.toFixed(2)}`,
      colorClass
    };
  }

  /**
   * Get position status display class
   * @param status Position status
   * @returns CSS class for status badge
   */
  getStatusClass(status: string): string {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'error':
        return 'status-error';
      case 'initializing':
      case 'executing':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'liquidated':
        return 'status-liquidated';
      default:
        return 'status-unknown';
    }
  }
}
