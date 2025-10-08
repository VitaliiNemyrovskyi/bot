import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

export interface TickerData {
  type: 'ticker' | 'connected' | 'error';
  symbol: string;
  price?: number;
  volume?: number;
  change24h?: number;
  bid?: number;
  ask?: number;
  high24h?: number;
  low24h?: number;
  timestamp: number;
  message?: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService implements OnDestroy {
  private eventSources = new Map<string, EventSource>();
  private destroy$ = new Subject<void>();

  // Subject for all ticker updates
  private tickerSubject = new BehaviorSubject<TickerData | null>(null);
  public ticker$ = this.tickerSubject.asObservable().pipe(
    filter(data => data !== null)
  ) as Observable<TickerData>;

  // Subject for price updates only
  private priceSubject = new BehaviorSubject<PriceUpdate | null>(null);
  public price$ = this.priceSubject.asObservable().pipe(
    filter(data => data !== null)
  ) as Observable<PriceUpdate>;

  // Connection status
  private connectionStatusSubject = new BehaviorSubject<{ [symbol: string]: boolean }>({});
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private baseUrl = '/api/trading';

  constructor() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeAllConnections();
  }

  // Subscribe to real-time data for a symbol
  subscribeToSymbol(symbol: string): Observable<TickerData> {
    const normalizedSymbol = symbol.toUpperCase();

    // Close existing connection if any
    this.unsubscribeFromSymbol(normalizedSymbol);

    // Create new EventSource connection
    const eventSource = new EventSource(`${this.baseUrl}/stream?symbol=${normalizedSymbol}`);
    this.eventSources.set(normalizedSymbol, eventSource);

    // Update connection status
    this.updateConnectionStatus(normalizedSymbol, false);

    return new Observable<TickerData>(observer => {
      eventSource.onopen = () => {
        console.log(`Connected to real-time stream for ${normalizedSymbol}`);
        this.updateConnectionStatus(normalizedSymbol, true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: TickerData = JSON.parse(event.data);

          // Emit to main ticker subject
          this.tickerSubject.next(data);

          // Emit to specific symbol observer
          observer.next(data);

          // If it's ticker data, also emit to price subject
          if (data.type === 'ticker' && data.price !== undefined) {
            const priceUpdate: PriceUpdate = {
              symbol: data.symbol,
              price: data.price,
              change: 0, // Calculate based on previous price if needed
              changePercent: data.change24h || 0,
              volume: data.volume || 0,
              timestamp: data.timestamp
            };
            this.priceSubject.next(priceUpdate);
          }

        } catch (error) {
          console.error('Error parsing stream data:', error);
          observer.error(error);
        }
      };

      eventSource.onerror = (error) => {
        console.error(`Stream error for ${normalizedSymbol}:`, error);
        this.updateConnectionStatus(normalizedSymbol, false);

        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.eventSources.has(normalizedSymbol)) {
            console.log(`Attempting to reconnect to ${normalizedSymbol}`);
            this.subscribeToSymbol(normalizedSymbol);
          }
        }, 5000);

        observer.error(error);
      };

      // Cleanup function
      return () => {
        this.unsubscribeFromSymbol(normalizedSymbol);
      };
    }).pipe(
      takeUntil(this.destroy$)
    );
  }

  // Unsubscribe from a specific symbol
  unsubscribeFromSymbol(symbol: string): void {
    const normalizedSymbol = symbol.toUpperCase();
    const eventSource = this.eventSources.get(normalizedSymbol);

    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(normalizedSymbol);
      this.updateConnectionStatus(normalizedSymbol, false);
      console.log(`Unsubscribed from ${normalizedSymbol}`);
    }
  }

  // Get real-time price for a specific symbol
  getSymbolPrice$(symbol: string): Observable<PriceUpdate> {
    return this.price$.pipe(
      filter(update => update.symbol === symbol.toUpperCase())
    );
  }

  // Get connection status for a symbol
  isConnected(symbol: string): boolean {
    const status = this.connectionStatusSubject.value;
    return status[symbol.toUpperCase()] || false;
  }

  // Get all connected symbols
  getConnectedSymbols(): string[] {
    const status = this.connectionStatusSubject.value;
    return Object.keys(status).filter(symbol => status[symbol]);
  }

  // Subscribe to multiple symbols
  subscribeToMultipleSymbols(symbols: string[]): Observable<TickerData> {
    symbols.forEach(symbol => {
      this.subscribeToSymbol(symbol);
    });

    return this.ticker$;
  }

  // Close all connections
  closeAllConnections(): void {
    this.eventSources.forEach((eventSource, symbol) => {
      eventSource.close();
      console.log(`Closed connection for ${symbol}`);
    });
    this.eventSources.clear();
    this.connectionStatusSubject.next({});
  }

  // Get current price from cache (last received price)
  getCurrentPrice(symbol: string): number | null {
    const currentTicker = this.tickerSubject.value;
    if (currentTicker && currentTicker.symbol === symbol.toUpperCase() && currentTicker.price) {
      return currentTicker.price;
    }
    return null;
  }

  // Get market summary for connected symbols
  getMarketSummary(): Observable<{ [symbol: string]: PriceUpdate }> {
    return this.price$.pipe(
      map(update => {
        // This is a simplified implementation
        // In a real app, you'd maintain a map of all symbols
        return { [update.symbol]: update };
      })
    );
  }

  // Helper method to format price change
  formatPriceChange(change: number, changePercent: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }

  // Helper method to get price change color class
  getPriceChangeClass(change: number): string {
    if (change > 0) return 'price-up';
    if (change < 0) return 'price-down';
    return 'price-neutral';
  }

  private updateConnectionStatus(symbol: string, connected: boolean): void {
    const currentStatus = this.connectionStatusSubject.value;
    const newStatus = { ...currentStatus, [symbol]: connected };
    this.connectionStatusSubject.next(newStatus);
  }
}