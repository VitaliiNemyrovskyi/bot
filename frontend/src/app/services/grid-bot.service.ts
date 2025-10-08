import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GridBotResponse {
  success: boolean;
  botId?: string;
  status?: string;
  error?: string;
}

export interface BacktestRequest {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  gridConfig: {
    upperPrice: number;
    lowerPrice: number;
    gridLevels: number;
    orderSize: number;
    maxActiveOrders?: number;
    stopLoss?: number;
    takeProfit?: number;
  };
  filters: {
    entry: any[];
    exit: any[];
  };
  initialBalance: number;
}

export interface BacktestResponse {
  success: boolean;
  backtestId: string;
  results: any;
}

@Injectable({
  providedIn: 'root'
})
export class GridBotService {
  private apiUrl = `${environment.apiUrl}/trading`;

  constructor(private http: HttpClient) {}

  // Grid Bot Management
  createBot(config: any): Observable<GridBotResponse> {
    return this.http.post<GridBotResponse>(`${this.apiUrl}/grid-bot`, config);
  }

  getBots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/grid-bot`);
  }

  getBot(botId: string): Observable<any> {
    const params = new HttpParams().set('botId', botId);
    return this.http.get<any>(`${this.apiUrl}/grid-bot`, { params });
  }

  updateBot(botId: string, action: string, config?: any): Observable<any> {
    const payload = { botId, action, config };
    return this.http.put<any>(`${this.apiUrl}/grid-bot`, payload);
  }

  deleteBot(botId: string): Observable<any> {
    const params = new HttpParams().set('botId', botId);
    return this.http.delete<any>(`${this.apiUrl}/grid-bot`, { params });
  }

  // Backtesting
  runBacktest(request: BacktestRequest): Observable<BacktestResponse> {
    return this.http.post<BacktestResponse>(`${this.apiUrl}/backtest`, request);
  }

  getBacktests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/backtest`);
  }

  getBacktest(backtestId: string): Observable<any> {
    const params = new HttpParams().set('backtestId', backtestId);
    return this.http.get<any>(`${this.apiUrl}/backtest`, { params });
  }

  deleteBacktest(backtestId: string): Observable<any> {
    const params = new HttpParams().set('backtestId', backtestId);
    return this.http.delete<any>(`${this.apiUrl}/backtest`, { params });
  }

  // Market Data
  getMarketData(symbol: string, timeframe: string = '1h', limit: number = 100): Observable<any[]> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('timeframe', timeframe)
      .set('limit', limit.toString());

    return this.http.get<any[]>(`${this.apiUrl}/market-data`, { params });
  }

  getCurrentPrice(symbol: string): Observable<{ price: number }> {
    const params = new HttpParams().set('symbol', symbol);
    return this.http.get<{ price: number }>(`${this.apiUrl}/market-data/price`, { params });
  }

  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/symbols`);
  }

  // Performance Analytics
  getBotPerformance(botId: string, period: string = '24h'): Observable<any> {
    const params = new HttpParams()
      .set('botId', botId)
      .set('period', period);

    return this.http.get<any>(`${this.apiUrl}/performance`, { params });
  }

  getBotTrades(botId: string, limit: number = 100): Observable<any[]> {
    const params = new HttpParams()
      .set('botId', botId)
      .set('limit', limit.toString());

    return this.http.get<any[]>(`${this.apiUrl}/trades`, { params });
  }

  // Risk Management
  validateGridConfig(config: any): Observable<{ valid: boolean; warnings?: string[]; errors?: string[] }> {
    return this.http.post<any>(`${this.apiUrl}/validate-config`, config);
  }

  calculateGridMetrics(config: any): Observable<{
    totalInvestment: number;
    gridSpacing: number;
    potentialProfit: number;
    maxDrawdown: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/calculate-metrics`, config);
  }

  // Real-time Updates
  subscribeToBot(botId: string): Observable<any> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll use polling
    return this.http.get<any>(`${this.apiUrl}/bot-status/${botId}`);
  }

  // Portfolio Management
  getPortfolioSummary(): Observable<{
    totalValue: number;
    totalPnL: number;
    activeBots: number;
    totalTrades: number;
    avgWinRate: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/summary`);
  }

  getPortfolioPerformance(period: string = '30d'): Observable<any[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any[]>(`${this.apiUrl}/portfolio/performance`, { params });
  }

  // Alerts and Notifications
  getBotAlerts(botId?: string): Observable<any[]> {
    const params = botId ? new HttpParams().set('botId', botId) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/alerts`, { params });
  }

  markAlertAsRead(alertId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/alerts/${alertId}/read`, {});
  }

  // Export/Import
  exportBotConfig(botId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${botId}`, {
      responseType: 'blob'
    });
  }

  importBotConfig(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('config', file);

    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }

  // Advanced Analytics
  getCorrelationAnalysis(symbols: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/analytics/correlation`, { symbols });
  }

  getOptimalGridParameters(symbol: string, period: string = '30d'): Observable<{
    suggestedUpperPrice: number;
    suggestedLowerPrice: number;
    suggestedGridLevels: number;
    suggestedOrderSize: number;
    reasoning: string;
  }> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('period', period);

    return this.http.get<any>(`${this.apiUrl}/analytics/optimal-grid`, { params });
  }
}