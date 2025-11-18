import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface FundingOpportunity {
  exchange: string;
  symbol: string;
  fundingRate: number;
  fundingRatePercent?: string;
  annualizedRate: number;
  nextFundingTime: Date;
  fundingInterval?: number;
  timeUntilFunding?: number;
  markPrice: number;
  volume24h: number;
  openInterest: number;
  isReady?: boolean;
  lastPrice?: number;
  estimatedProfit?: number;
  // Liquidity analysis fields
  liquidityScore?: number;
  bidSize?: number;
  askSize?: number;
  estimatedPriceDropPercent?: number;
  expectedNetReturnPercent?: number;
  riskLevel?: 'POOR' | 'MODERATE' | 'GOOD' | 'EXCELLENT';
  liquidityDescription?: string;
}

interface ApiResponse {
  success: boolean;
  data: FundingOpportunity[];
  count: number;
  timestamp: string;
}

interface FundingArbApiResponse {
  success: boolean;
  opportunities: any[];
  stats: any;
  timestamp: string;
}

export interface ShortStrategyConfig {
  enabled: boolean;
  paperTradingMode: boolean;
  entryOffsetMs: number;
  exitOffsetMs: number;
  maxPositionSizeUSDT: number;
  minFundingRate: number;
  stopLossPercent: number;
  allowedSymbols: string[];
  minLiquidity: number;
}

export interface ShortStrategyStatus {
  isRunning: boolean;
  activeTrades: any[];
  statistics: {
    totalTrades: number;
    profitableTrades: number;
    totalProfitUSDT: number;
    winRate: number;
    averageProfitPercent: number;
  } | null;
  config: ShortStrategyConfig;
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {

  constructor(private http: HttpClient) { }

  getFundingOpportunities(): Observable<FundingOpportunity[]> {
    const url = '/api/funding-rates/opportunities';
    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        if (response.success) {
          return response.data.map(item => ({
            ...item,
            nextFundingTime: new Date(item.nextFundingTime)
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching funding opportunities:', error);
        return of([]);
      })
    );
  }

  /**
   * Get funding arbitrage opportunities with liquidity analysis
   */
  getFundingArbOpportunities(readyOnly: boolean = false): Observable<FundingOpportunity[]> {
    const url = `/api/funding-arb/opportunities${readyOnly ? '?ready=true' : ''}`;
    return this.http.get<FundingArbApiResponse>(url).pipe(
      map(response => {
        if (response.success && response.opportunities) {
          return response.opportunities.map((item: any) => ({
            exchange: item.exchange,
            symbol: item.symbol,
            fundingRate: item.fundingRate,
            fundingRatePercent: item.fundingRatePercent,
            annualizedRate: Math.abs(item.fundingRate) * 100 * (365 * 24 / (item.fundingInterval || 8)),
            nextFundingTime: new Date(item.nextFundingTime),
            fundingInterval: item.fundingInterval,
            timeUntilFunding: item.timeUntilFunding,
            markPrice: item.lastPrice || 0,
            volume24h: 0, // Not available in this endpoint
            openInterest: 0, // Not available in this endpoint
            isReady: item.isReady,
            lastPrice: item.lastPrice,
            estimatedProfit: item.estimatedProfit,
            liquidityScore: item.liquidityScore,
            bidSize: item.bidSize,
            askSize: item.askSize,
            estimatedPriceDropPercent: item.estimatedPriceDropPercent,
            expectedNetReturnPercent: item.expectedNetReturnPercent,
            riskLevel: item.riskLevel,
            liquidityDescription: item.liquidityDescription,
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching funding arb opportunities:', error);
        return of([]);
      })
    );
  }

  /**
   * Get SHORT -500ms strategy status
   */
  getShortStrategyStatus(): Observable<ShortStrategyStatus | null> {
    return this.http.get<any>('/api/funding-short-strategy/status').pipe(
      map(response => {
        if (response.success) {
          return {
            isRunning: response.config?.enabled || false,
            activeTrades: response.activeTrades || [],
            statistics: response.statistics || null,
            config: response.config
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching short strategy status:', error);
        return of(null);
      })
    );
  }

  /**
   * Start SHORT -500ms strategy
   */
  startShortStrategy(config?: Partial<ShortStrategyConfig>): Observable<any> {
    return this.http.post('/api/funding-short-strategy/start', { config });
  }

  /**
   * Stop SHORT -500ms strategy
   */
  stopShortStrategy(): Observable<any> {
    return this.http.post('/api/funding-short-strategy/stop', {});
  }

  /**
   * Update SHORT -500ms strategy configuration
   */
  updateShortStrategyConfig(config: Partial<ShortStrategyConfig>): Observable<any> {
    return this.http.put('/api/funding-short-strategy/config', config);
  }
}
