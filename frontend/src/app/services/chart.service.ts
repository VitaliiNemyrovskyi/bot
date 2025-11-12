import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// TradingView-compatible interfaces based on official documentation

// TradingView LibrarySymbolInfo structure
export interface LibrarySymbolInfo {
  name: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  session: string;
  timezone: string;
  ticker?: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  intraday_multipliers: string[];
  data_status: string;
  currency_code?: string;
}

// Search result symbol structure
export interface SearchSymbolResultItem {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
}

// Basic symbol info for API responses
export interface ChartSymbol {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  currency_code?: string;
}

// TradingView DatafeedConfiguration structure
export interface DatafeedConfiguration {
  supported_resolutions: string[];
  supports_group_request?: boolean;
  supports_marks?: boolean;
  supports_search?: boolean;
  supports_timescale_marks?: boolean;
  supports_time?: boolean;
  exchanges?: Exchange[];
  symbols_types?: SymbolType[];
  currency_codes?: string[];
}

export interface Exchange {
  value: string;
  name: string;
  desc: string;
}

export interface SymbolType {
  name: string;
  value: string;
}

export interface ChartDataRequest {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
  firstDataRequest?: boolean;
}

// TradingView Bar structure
export interface Bar {
  time: number; // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// TradingView GetBarsResult structure
export interface GetBarsResult {
  bars: Bar[];
  meta: HistoryMetadata;
}

export interface HistoryMetadata {
  noData?: boolean;
  nextTime?: number;
}

// API response structure
export interface ChartDataResponse {
  s: string; // status: 'ok', 'no_data', 'error'
  t?: number[]; // time
  o?: number[]; // open
  h?: number[]; // high
  l?: number[]; // low
  c?: number[]; // close
  v?: number[]; // volume
  errmsg?: string;
  nextTime?: number;
}

export interface RealtimeData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private apiUrl = '/api/trading';
  private realtimeDataSubject = new BehaviorSubject<RealtimeData | null>(null);
  public realtimeData$ = this.realtimeDataSubject.asObservable();
  private subscriberMap = new Map<string, any>();
  private intervalMap = new Map<string, any>();

  constructor(private http: HttpClient) {}

  // Get TradingView datafeed configuration
  getDatafeedConfiguration(): Observable<DatafeedConfiguration> {
    return this.http.get<DatafeedConfiguration>(`${this.apiUrl}/config`).pipe(
      catchError(error => {
        console.error('Failed to get datafeed configuration:', error);
        // Return default configuration with proper typing
        const defaultConfig: DatafeedConfiguration = {
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
          supports_group_request: false,
          supports_marks: false,
          supports_search: true,
          supports_timescale_marks: false,
          supports_time: false,
          exchanges: [{
            value: 'BYBIT',
            name: 'Bybit',
            desc: 'Bybit Exchange'
          }],
          symbols_types: [{
            name: 'crypto',
            value: 'crypto'
          }],
          currency_codes: ['USDT', 'BTC', 'ETH']
        };
        return new Observable<DatafeedConfiguration>(subscriber => {
          subscriber.next(defaultConfig);
          subscriber.complete();
        });
      })
    );
  }

  // Get TradingView configuration (legacy method)
  getConfig(): Observable<DatafeedConfiguration> {
    return this.getDatafeedConfiguration();
  }

  // Get available symbols
  getSymbols(): Observable<ChartSymbol[]> {
    return this.http.get<ChartSymbol[]>(`${this.apiUrl}/symbols`);
  }

  // Get specific symbol info
  getSymbolInfo(symbol: string): Observable<ChartSymbol> {
    return this.http.get<ChartSymbol>(`${this.apiUrl}/symbols?symbol=${symbol}`);
  }

  // Search symbols (legacy method)
  searchSymbols(query: string): Observable<ChartSymbol[]> {
    return this.getSymbols().pipe(
      map(symbols => symbols.filter(symbol =>
        symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
        symbol.description.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  // Search symbols with TradingView filters
  searchSymbolsWithFilters(query: string, exchange?: string, symbolType?: string): Observable<SearchSymbolResultItem[]> {
    return this.getSymbols().pipe(
      map(symbols => {
        let filtered = symbols.filter(symbol =>
          symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
          symbol.description.toLowerCase().includes(query.toLowerCase())
        );

        if (exchange && exchange !== '') {
          filtered = filtered.filter(symbol => symbol.exchange === exchange);
        }

        if (symbolType && symbolType !== '') {
          filtered = filtered.filter(symbol => symbol.type === symbolType);
        }

        return filtered.map(symbol => ({
          symbol: symbol.symbol,
          full_name: symbol.full_name,
          description: symbol.description,
          exchange: symbol.exchange,
          type: symbol.type
        }));
      }),
      catchError(error => {
        console.error('Symbol search failed:', error);
        return new Observable<SearchSymbolResultItem[]>(subscriber => {
          subscriber.next([]);
          subscriber.complete();
        });
      })
    );
  }

  // Get chart data for TradingView
  getChartData(request: ChartDataRequest): Observable<ChartDataResponse> {
    const params = new URLSearchParams({
      symbol: request.symbol,
      resolution: request.resolution,
      from: request.from.toString(),
      to: request.to.toString()
    });

    if (request.firstDataRequest) {
      params.append('firstDataRequest', 'true');
    }

    return this.http.get<ChartDataResponse>(`${this.apiUrl}/chart?${params.toString()}`);
  }

  // Convert API response to TradingView bars format
  private convertToBars(response: ChartDataResponse): GetBarsResult {
    if (response.s === 'ok' && response.t && response.o && response.h && response.l && response.c) {
      const bars: Bar[] = response.t.map((time: number, index: number) => ({
        time: time * 1000, // Convert to milliseconds
        open: response.o![index],
        high: response.h![index],
        low: response.l![index],
        close: response.c![index],
        volume: response.v ? response.v[index] : 0
      }));

      return {
        bars,
        meta: {
          noData: false,
          nextTime: response.nextTime
        }
      };
    } else if (response.s === 'no_data') {
      return {
        bars: [],
        meta: {
          noData: true,
          nextTime: response.nextTime
        }
      };
    } else {
      throw new Error(response.errmsg || 'Failed to get chart data');
    }
  }

  private calculatePricescale(symbol: string): number {
    // Determine appropriate price scale based on symbol
    if (symbol.includes('USDT') || symbol.includes('USD')) {
      return 100; // 2 decimal places
    } else if (symbol.includes('BTC')) {
      return 100000000; // 8 decimal places
    }
    return 10000; // 4 decimal places default
  }

  // Resolve symbol to TradingView LibrarySymbolInfo format
  resolveSymbolInfo(symbolName: string): Observable<LibrarySymbolInfo> {
    return this.getSymbolInfo(symbolName).pipe(
      map(symbolInfo => {
        const pricescale = this.calculatePricescale(symbolInfo.symbol);
        return {
          name: symbolInfo.symbol,
          full_name: symbolInfo.full_name,
          description: symbolInfo.description,
          exchange: symbolInfo.exchange,
          type: symbolInfo.type,
          session: '24x7',
          timezone: 'UTC',
          ticker: symbolInfo.symbol,
          minmov: 1,
          pricescale: pricescale,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
          intraday_multipliers: ['1', '5', '15', '30', '60', '240'],
          data_status: 'streaming',
          currency_code: symbolInfo.currency_code
        };
      }),
      catchError(error => {
        console.error('Symbol resolve failed:', error);
        throw new Error(`Unknown symbol: ${symbolName}`);
      })
    );
  }

  // Get bars in TradingView format
  getChartBars(symbolInfo: LibrarySymbolInfo, resolution: string, from: number, to: number, firstDataRequest = false): Observable<GetBarsResult> {
    const request: ChartDataRequest = {
      symbol: symbolInfo.name,
      resolution: resolution,
      from: from,
      to: to,
      firstDataRequest: firstDataRequest
    };

    return this.getChartData(request).pipe(
      map(response => this.convertToBars(response)),
      catchError(error => {
        console.error('Chart data failed:', error);
        throw error;
      })
    );
  }

  // Create TradingView datafeed with enhanced error handling
  createDatafeed() {
    return {
      onReady: (callback: (config: DatafeedConfiguration) => void) => {
        this.getDatafeedConfiguration().subscribe({
          next: (config) => {
            console.log('Datafeed configuration loaded:', config);
            callback(config);
          },
          error: (error) => {
            console.error('Failed to get datafeed configuration:', error);
            // Fallback configuration
            callback({
              supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
              supports_group_request: false,
              supports_marks: false,
              supports_search: true,
              supports_timescale_marks: false,
              supports_time: false
            });
          }
        });
      },

      searchSymbols: (userInput: string, exchange: string, symbolType: string, onResult: (symbols: SearchSymbolResultItem[]) => void) => {
        this.searchSymbolsWithFilters(userInput, exchange, symbolType).subscribe({
          next: (symbols) => {
            console.log(`Search results for "${userInput}":`, symbols.length, 'symbols found');
            onResult(symbols);
          },
          error: (error) => {
            console.error('Symbol search failed:', error);
            onResult([]);
          }
        });
      },

      resolveSymbol: (symbolName: string, onResolve: (symbolInfo: LibrarySymbolInfo) => void, onError: (error: string) => void) => {
        console.log('Resolving symbol:', symbolName);
        this.resolveSymbolInfo(symbolName).subscribe({
          next: (symbolInfo) => {
            console.log('Symbol resolved:', symbolInfo);
            onResolve(symbolInfo);
          },
          error: (error) => {
            console.error('Symbol resolve failed:', error);
            onError(`Unknown symbol: ${symbolName}`);
          }
        });
      },

      getBars: (symbolInfo: LibrarySymbolInfo, resolution: string, periodParams: any, onResult: (bars: Bar[], meta: HistoryMetadata) => void, onError: (error: string) => void) => {
        console.log('Getting bars for:', symbolInfo.name, resolution, periodParams);
        this.getChartBars(symbolInfo, resolution, periodParams.from, periodParams.to, periodParams.firstDataRequest).subscribe({
          next: (result) => {
            console.log('Bars loaded:', result.bars.length, 'bars');
            onResult(result.bars, result.meta);
          },
          error: (error) => {
            console.error('Failed to get bars:', error);
            onError(error.message || 'Failed to fetch chart data');
          }
        });
      },

      subscribeBars: (symbolInfo: LibrarySymbolInfo, resolution: string, onRealtimeCallback: (bar: Bar) => void, listenerGUID: string, onResetCacheNeededCallback?: () => void) => {
        console.log('Subscribing to real-time data:', symbolInfo.name, listenerGUID);

        // Store subscriber info for cleanup
        this.subscriberMap.set(listenerGUID, {
          symbol: symbolInfo.name,
          resolution: resolution,
          callback: onRealtimeCallback
        });

        // Start polling for real-time data
        this.startRealtimeSubscription(symbolInfo.name, resolution, onRealtimeCallback, listenerGUID);
      },

      unsubscribeBars: (listenerGUID: string) => {
        console.log('Unsubscribing from real-time data:', listenerGUID);

        // Clean up interval if exists
        const intervalId = this.intervalMap.get(listenerGUID);
        if (intervalId) {
          clearInterval(intervalId);
          this.intervalMap.delete(listenerGUID);
        }

        // Remove subscriber info
        this.subscriberMap.delete(listenerGUID);
      }
    };
  }

  // Enhanced real-time subscription management
  private startRealtimeSubscription(symbol: string, resolution: string, callback: (bar: Bar) => void, listenerGUID: string) {
    // This is a simplified implementation using polling
    // In production, you would use WebSocket connections for real-time data

    const interval = setInterval(() => {
      // Fetch latest price data
      const request: ChartDataRequest = {
        symbol: symbol,
        resolution: resolution,
        from: Math.floor(Date.now() / 1000) - 300, // Last 5 minutes
        to: Math.floor(Date.now() / 1000),
        firstDataRequest: false
      };

      this.getChartData(request).subscribe({
        next: (response) => {
          if (response.s === 'ok' && response.t && response.t.length > 0) {
            const lastIndex = response.t.length - 1;
            const bar: Bar = {
              time: response.t[lastIndex] * 1000, // Convert to milliseconds
              open: response.o![lastIndex],
              high: response.h![lastIndex],
              low: response.l![lastIndex],
              close: response.c![lastIndex],
              volume: response.v ? response.v[lastIndex] : 0
            };

            // Only call callback if subscriber still exists
            if (this.subscriberMap.has(listenerGUID)) {
              callback(bar);
            }
          }
        },
        error: (error) => {
          console.error('Real-time data error for', symbol, ':', error);
        }
      });
    }, 5000); // Update every 5 seconds

    // Store interval ID for cleanup
    this.intervalMap.set(listenerGUID, interval);
  }

  // Cleanup all subscriptions (call on component destroy)
  cleanupAllSubscriptions() {
    this.intervalMap.forEach(intervalId => clearInterval(intervalId));
    this.intervalMap.clear();
    this.subscriberMap.clear();
  }

  // Get current market data
  getCurrentPrice(symbol: string): Observable<number> {
    return this.getChartData({
      symbol: symbol,
      resolution: '1',
      from: Math.floor(Date.now() / 1000) - 60,
      to: Math.floor(Date.now() / 1000)
    }).pipe(
      map(response => {
        if (response.s === 'ok' && response.c && response.c.length > 0) {
          return response.c[response.c.length - 1];
        }
        throw new Error('No price data available');
      }),
      catchError(error => {
        console.error('Failed to get current price:', error);
        throw error;
      })
    );
  }

  // Helper method to format price with appropriate decimal places
  formatPrice(price: number, symbol: string): string {
    // Default to 2 decimal places for USDT pairs, adjust as needed
    const decimals = symbol.includes('USDT') ? 2 : 8;
    return price.toFixed(decimals);
  }

  // Helper method to format volume
  formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(2) + 'B';
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + 'M';
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
  }
}