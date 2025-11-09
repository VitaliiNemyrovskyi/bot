import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { PublicFundingRatesService } from './public-funding-rates.service';

/**
 * Funding Arbitrage Data Storage Service
 *
 * Handles loading, filtering, and storing funding arbitrage data.
 * This service provides in-memory caching to reduce backend requests
 * and persists user selection state across page refreshes.
 *
 * Key Features:
 * - In-memory data caching
 * - State persistence (symbol, exchanges) via localStorage
 * - Reactive state updates using RxJS BehaviorSubject
 * - Automatic state restoration on page refresh
 * - Filtering by symbol and exchanges
 *
 * Used by: app-arbitrage-chart component
 */

/**
 * Funding rate data for a specific exchange and symbol
 */
export interface FundingRateData {
  exchange: string;
  symbol: string;
  fundingRate: string;
  nextFundingTime: number;
  fundingInterval: string;
}

/**
 * Cached funding data storage
 */
interface CachedFundingData {
  data: FundingRateData[];
  timestamp: number;
  symbol: string;
  exchanges: string[];
}

/**
 * User selection state for arbitrage chart
 */
export interface ArbitrageSelectionState {
  symbol: string | null;
  primaryExchange: string | null;
  hedgeExchange: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FundingArbitrageDataStorageService {
  private fundingRatesService = inject(PublicFundingRatesService);

  // Local storage keys
  private readonly STORAGE_KEY_SELECTION = 'arbitrage_selection_state';
  private readonly CACHE_DURATION_MS = 30000; // 30 seconds cache

  // In-memory cache for funding data
  private cachedData: CachedFundingData | null = null;

  // BehaviorSubjects for reactive state management
  private selectionState$ = new BehaviorSubject<ArbitrageSelectionState>({
    symbol: null,
    primaryExchange: null,
    hedgeExchange: null
  });

  private fundingData$ = new BehaviorSubject<FundingRateData[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor() {
    // Restore selection state from localStorage on service initialization
    this.restoreSelectionState();
  }

  /**
   * Get current selection state as Observable
   */
  getSelectionState(): Observable<ArbitrageSelectionState> {
    return this.selectionState$.asObservable();
  }

  /**
   * Get current selection state value (synchronous)
   */
  getSelectionStateValue(): ArbitrageSelectionState {
    return this.selectionState$.value;
  }

  /**
   * Get funding data as Observable
   */
  getFundingData(): Observable<FundingRateData[]> {
    return this.fundingData$.asObservable();
  }

  /**
   * Get funding data value (synchronous)
   */
  getFundingDataValue(): FundingRateData[] {
    return this.fundingData$.value;
  }

  /**
   * Get loading state as Observable
   */
  getLoadingState(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  /**
   * Get error state as Observable
   */
  getErrorState(): Observable<string | null> {
    return this.error$.asObservable();
  }

  /**
   * Update selection state and persist to localStorage
   *
   * @param symbol - Trading symbol (e.g., 'BTCUSDT')
   * @param primaryExchange - Primary exchange for arbitrage (e.g., 'GATEIO')
   * @param hedgeExchange - Hedge exchange for arbitrage (e.g., 'BYBIT')
   */
  updateSelectionState(
    symbol: string | null,
    primaryExchange: string | null,
    hedgeExchange: string | null
  ): void {
    const newState: ArbitrageSelectionState = {
      symbol,
      primaryExchange,
      hedgeExchange
    };

    // Update BehaviorSubject
    this.selectionState$.next(newState);

    // Persist to localStorage
    this.persistSelectionState(newState);

    console.log('[FundingArbitrageDataStorage] Selection state updated:', newState);
  }

  /**
   * Load funding data for specified exchanges and symbol
   * Uses in-memory cache if available and not expired
   *
   * @param exchanges - Array of exchange names (e.g., ['GATEIO', 'BYBIT'])
   * @param symbol - Trading symbol (e.g., 'BTCUSDT')
   * @param forceRefresh - Force refresh from backend (bypass cache)
   * @returns Promise with funding rate data
   */
  async loadFundingData(
    exchanges: string[],
    symbol: string,
    forceRefresh = false
  ): Promise<FundingRateData[]> {
    try {
      // Check if cache is valid and matches request
      if (!forceRefresh && this.isCacheValid(exchanges, symbol)) {
        console.log('[FundingArbitrageDataStorage] Using cached data');
        const cachedData = this.cachedData!.data;
        this.fundingData$.next(cachedData);
        return cachedData;
      }

      // Set loading state
      this.loading$.next(true);
      this.error$.next(null);

      console.log(`[FundingArbitrageDataStorage] Fetching funding data for ${exchanges.join(', ')} - ${symbol}`);

      // Fetch from backend using PublicFundingRatesService
      const fundingRates = await firstValueFrom(
        this.fundingRatesService.getArbitrageFundingRates(exchanges, symbol)
      );

      console.log(`[FundingArbitrageDataStorage] Received ${fundingRates.length} funding rates`);

      // Cache the data
      this.cachedData = {
        data: fundingRates,
        timestamp: Date.now(),
        symbol,
        exchanges: [...exchanges].sort() // Sort for consistent comparison
      };

      // Update BehaviorSubject
      this.fundingData$.next(fundingRates);

      return fundingRates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load funding data';
      console.error('[FundingArbitrageDataStorage] Error loading funding data:', error);

      this.error$.next(errorMessage);
      return [];
    } finally {
      this.loading$.next(false);
    }
  }

  /**
   * Refresh funding data for current selection
   * Loads data for currently selected symbol and exchanges
   *
   * @param forceRefresh - Force refresh from backend (bypass cache)
   * @returns Promise with funding rate data
   */
  async refreshCurrentSelection(forceRefresh = false): Promise<FundingRateData[]> {
    const state = this.selectionState$.value;

    if (!state.symbol || !state.primaryExchange || !state.hedgeExchange) {
      console.warn('[FundingArbitrageDataStorage] Cannot refresh: incomplete selection state');
      return [];
    }

    const exchanges = [state.primaryExchange, state.hedgeExchange];
    return this.loadFundingData(exchanges, state.symbol, forceRefresh);
  }

  /**
   * Get funding data for specific exchange
   * Filters cached data by exchange name
   *
   * @param exchange - Exchange name (e.g., 'GATEIO')
   * @returns Funding rate data for specified exchange or null if not found
   */
  getFundingDataForExchange(exchange: string): FundingRateData | null {
    const data = this.fundingData$.value;
    const found = data.find(d => d.exchange.toUpperCase() === exchange.toUpperCase());
    return found || null;
  }

  /**
   * Clear all cached data and reset state
   */
  clearCache(): void {
    this.cachedData = null;
    this.fundingData$.next([]);
    this.error$.next(null);
    console.log('[FundingArbitrageDataStorage] Cache cleared');
  }

  /**
   * Clear selection state and localStorage
   */
  clearSelectionState(): void {
    this.selectionState$.next({
      symbol: null,
      primaryExchange: null,
      hedgeExchange: null
    });
    localStorage.removeItem(this.STORAGE_KEY_SELECTION);
    console.log('[FundingArbitrageDataStorage] Selection state cleared');
  }

  /**
   * Check if cached data is valid for given parameters
   *
   * @param exchanges - Exchange names to check
   * @param symbol - Symbol to check
   * @returns true if cache is valid and matches request
   */
  private isCacheValid(exchanges: string[], symbol: string): boolean {
    if (!this.cachedData) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - this.cachedData.timestamp;

    // Check cache expiration
    if (cacheAge > this.CACHE_DURATION_MS) {
      console.log(`[FundingArbitrageDataStorage] Cache expired (age: ${(cacheAge / 1000).toFixed(1)}s)`);
      return false;
    }

    // Check if symbol matches
    if (this.cachedData.symbol !== symbol) {
      return false;
    }

    // Check if exchanges match (order-independent)
    const cachedExchanges = this.cachedData.exchanges;
    const requestedExchanges = [...exchanges].sort();

    if (cachedExchanges.length !== requestedExchanges.length) {
      return false;
    }

    for (let i = 0; i < cachedExchanges.length; i++) {
      if (cachedExchanges[i] !== requestedExchanges[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Persist selection state to localStorage
   *
   * @param state - Selection state to persist
   */
  private persistSelectionState(state: ArbitrageSelectionState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY_SELECTION, serialized);
      console.log('[FundingArbitrageDataStorage] Selection state persisted to localStorage');
    } catch (error) {
      console.error('[FundingArbitrageDataStorage] Failed to persist selection state:', error);
    }
  }

  /**
   * Restore selection state from localStorage
   * Called during service initialization
   */
  private restoreSelectionState(): void {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY_SELECTION);

      if (!serialized) {
        console.log('[FundingArbitrageDataStorage] No saved selection state found');
        return;
      }

      const state = JSON.parse(serialized) as ArbitrageSelectionState;

      // Validate restored state
      if (state.symbol && state.primaryExchange && state.hedgeExchange) {
        this.selectionState$.next(state);
        console.log('[FundingArbitrageDataStorage] Selection state restored from localStorage:', state);

        // Optionally auto-load data for restored state
        // Uncomment to enable auto-load on page refresh:
        // this.refreshCurrentSelection();
      } else {
        console.warn('[FundingArbitrageDataStorage] Incomplete saved state, ignoring');
      }
    } catch (error) {
      console.error('[FundingArbitrageDataStorage] Failed to restore selection state:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    hasCachedData: boolean;
    cacheAge: number | null;
    cachedSymbol: string | null;
    cachedExchanges: string[] | null;
    dataCount: number;
  } {
    if (!this.cachedData) {
      return {
        hasCachedData: false,
        cacheAge: null,
        cachedSymbol: null,
        cachedExchanges: null,
        dataCount: 0
      };
    }

    const cacheAge = Date.now() - this.cachedData.timestamp;

    return {
      hasCachedData: true,
      cacheAge,
      cachedSymbol: this.cachedData.symbol,
      cachedExchanges: this.cachedData.exchanges,
      dataCount: this.cachedData.data.length
    };
  }
}
