import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  entryFilters: IndicatorFilter[];
  exitFilters: IndicatorFilter[];
  riskManagement?: RiskManagementRules;
  isPublic: boolean;
  timesUsed: number;
  averageReturn?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IndicatorFilter {
  id: string;
  indicator: 'RSI' | 'MACD' | 'SMA' | 'EMA' | 'BB' | 'Stochastic' | 'ADX' | 'Volume';
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: number;
  period?: number;
  action: 'entry' | 'exit';
  bandType?: 'upper' | 'lower' | 'middle';
  enabled: boolean;
}

export interface RiskManagementRules {
  maxPositionSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  maxDailyLoss?: number;
  maxConcurrentTrades?: number;
  riskPerTrade?: number;
}

export interface StrategyBacktest {
  id: string;
  strategyId: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  results: {
    totalPnL: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    totalTrades: number;
  };
  createdAt: Date;
}

export interface StrategyPerformance {
  strategyId: string;
  symbol: string;
  period: string;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  calmarRatio: number;
  trades: number;
  avgTradeReturn: number;
  bestTrade: number;
  worstTrade: number;
}

@Injectable({
  providedIn: 'root'
})
export class StrategyService {
  private apiUrl = `${environment.apiUrl}/trading/strategies`;

  constructor(private http: HttpClient) {}

  // Strategy CRUD Operations
  createStrategy(strategy: Partial<Strategy>): Observable<{ success: boolean; strategy: Strategy }> {
    return this.http.post<any>(this.apiUrl, strategy);
  }

  getStrategies(includePublic: boolean = false): Observable<Strategy[]> {
    const params = new HttpParams().set('includePublic', includePublic.toString());
    return this.http.get<Strategy[]>(this.apiUrl, { params });
  }

  getStrategy(id: string): Observable<Strategy> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Strategy>(this.apiUrl, { params });
  }

  updateStrategy(strategy: Strategy): Observable<{ success: boolean; strategy: Strategy }> {
    return this.http.put<any>(this.apiUrl, strategy);
  }

  deleteStrategy(id: string): Observable<{ success: boolean }> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<any>(this.apiUrl, { params });
  }

  // Strategy Templates
  getStrategyTemplates(): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${this.apiUrl}/templates`);
  }

  createStrategyFromTemplate(templateId: string, customizations: Partial<Strategy>): Observable<Strategy> {
    return this.http.post<Strategy>(`${this.apiUrl}/from-template`, {
      templateId,
      customizations
    });
  }

  // Strategy Validation
  validateStrategy(strategy: Partial<Strategy>): Observable<{
    valid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/validate`, strategy);
  }

  // Backtesting
  backtestStrategy(request: {
    strategyId: string;
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    initialBalance: number;
    gridConfig?: any;
  }): Observable<StrategyBacktest> {
    return this.http.post<StrategyBacktest>(`${this.apiUrl}/backtest`, request);
  }

  getStrategyBacktests(strategyId: string): Observable<StrategyBacktest[]> {
    const params = new HttpParams().set('strategyId', strategyId);
    return this.http.get<StrategyBacktest[]>(`${this.apiUrl}/backtests`, { params });
  }

  // Performance Analytics
  getStrategyPerformance(strategyId: string, period: string = '30d'): Observable<StrategyPerformance> {
    const params = new HttpParams()
      .set('strategyId', strategyId)
      .set('period', period);

    return this.http.get<StrategyPerformance>(`${this.apiUrl}/performance`, { params });
  }

  compareStrategies(strategyIds: string[], metrics: string[] = ['totalReturn', 'winRate', 'maxDrawdown']): Observable<{
    comparison: any[];
    summary: any;
  }> {
    return this.http.post<any>(`${this.apiUrl}/compare`, {
      strategyIds,
      metrics
    });
  }

  // Market Scanning
  scanMarket(strategyId: string, symbols: string[]): Observable<{
    matches: Array<{
      symbol: string;
      score: number;
      signals: any[];
      lastPrice: number;
      recommendation: 'BUY' | 'SELL' | 'HOLD';
    }>;
  }> {
    return this.http.post<any>(`${this.apiUrl}/scan`, {
      strategyId,
      symbols
    });
  }

  // Indicator Utilities
  getAvailableIndicators(): Observable<Array<{
    name: string;
    displayName: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      default: any;
      min?: number;
      max?: number;
      options?: string[];
    }>;
  }>> {
    return this.http.get<any[]>(`${this.apiUrl}/indicators`);
  }

  calculateIndicator(params: {
    indicator: string;
    symbol: string;
    timeframe: string;
    period?: number;
    parameters?: any;
  }): Observable<{
    values: number[];
    timestamps: string[];
    current: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/calculate-indicator`, params);
  }

  // Strategy Optimization
  optimizeStrategy(params: {
    baseStrategyId: string;
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    optimizationTarget: 'profit' | 'winRate' | 'sharpeRatio' | 'profitFactor';
    parameters: Array<{
      name: string;
      min: number;
      max: number;
      step: number;
    }>;
  }): Observable<{
    optimizationId: string;
    status: 'running' | 'completed' | 'failed';
    progress?: number;
    bestParameters?: any;
    bestResult?: any;
  }> {
    return this.http.post<any>(`${this.apiUrl}/optimize`, params);
  }

  getOptimizationStatus(optimizationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/optimization/${optimizationId}`);
  }

  // Strategy Sharing
  shareStrategy(strategyId: string): Observable<{ shareUrl: string; shareCode: string }> {
    return this.http.post<any>(`${this.apiUrl}/${strategyId}/share`, {});
  }

  importSharedStrategy(shareCode: string): Observable<Strategy> {
    return this.http.post<Strategy>(`${this.apiUrl}/import-shared`, { shareCode });
  }

  // Community Features
  getPopularStrategies(limit: number = 10): Observable<Strategy[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Strategy[]>(`${this.apiUrl}/popular`, { params });
  }

  rateStrategy(strategyId: string, rating: number, review?: string): Observable<{ success: boolean }> {
    return this.http.post<any>(`${this.apiUrl}/${strategyId}/rate`, {
      rating,
      review
    });
  }

  getStrategyRatings(strategyId: string): Observable<{
    averageRating: number;
    totalRatings: number;
    reviews: Array<{
      rating: number;
      review: string;
      user: string;
      createdAt: Date;
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${strategyId}/ratings`);
  }

  // AI-Powered Features
  generateStrategyIdeas(params: {
    symbol: string;
    marketCondition: 'trending' | 'sideways' | 'volatile';
    riskTolerance: 'low' | 'medium' | 'high';
    timeframe: string;
  }): Observable<{
    suggestions: Array<{
      name: string;
      description: string;
      entryConditions: string[];
      exitConditions: string[];
      expectedWinRate: number;
      expectedReturn: number;
      riskLevel: string;
    }>;
  }> {
    return this.http.post<any>(`${this.apiUrl}/ai/generate-ideas`, params);
  }

  improveStrategy(strategyId: string, feedback: string): Observable<{
    suggestions: Array<{
      type: 'add_filter' | 'modify_filter' | 'add_risk_rule' | 'adjust_parameters';
      description: string;
      implementation: any;
      expectedImprovement: string;
    }>;
  }> {
    return this.http.post<any>(`${this.apiUrl}/${strategyId}/ai/improve`, {
      feedback
    });
  }

  // Export/Import
  exportStrategy(strategyId: string, format: 'json' | 'yaml' | 'pine'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/${strategyId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  importStrategy(file: File, format: 'json' | 'yaml' | 'pine'): Observable<Strategy> {
    const formData = new FormData();
    formData.append('strategy', file);
    formData.append('format', format);

    return this.http.post<Strategy>(`${this.apiUrl}/import`, formData);
  }
}