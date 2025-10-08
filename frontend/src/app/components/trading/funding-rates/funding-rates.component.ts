import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { DropdownComponent, DropdownOption } from '../../ui/dropdown/dropdown.component';
import { getEndpointUrl } from '../../../config/app.config';

/**
 * Ticker data interface (Linear/Inverse)
 */
export interface TickerData {
  symbol: string;
  lastPrice: string;
  indexPrice: string;
  markPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  prevPrice1h: string;
  openInterest: string;
  openInterestValue: string;
  turnover24h: string;
  volume24h: string;
  fundingRate: string;
  nextFundingTime: string;
  predictedDeliveryPrice: string;
  basisRate: string;
  deliveryFeeRate: string;
  deliveryTime: string;
  ask1Size: string;
  bid1Price: string;
  ask1Price: string;
  bid1Size: string;
}

export interface ExchangeCredential {
  id: string;
  exchange: string;
  environment: string;
  label?: string;
  isActive: boolean;
}

export interface FundingSubscription {
  subscriptionId: string;
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  positionType: 'long' | 'short';
  quantity: number;
  status: string;
  countdown?: number; // Seconds remaining
}

export interface CompletedDeal {
  subscriptionId: string;
  symbol: string;
  fundingRate: number;
  positionType: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  hedgeEntryPrice: number;
  fundingEarned: number;
  realizedPnl: number;
  executedAt: string;
  createdAt: string;
}

export interface SubscriptionSettings {
  defaultQuantity: number;           // Default number of coins to trade
  leverage: number;                   // Trading leverage (1-100x)
  autoCancelThreshold: number | null; // Auto-cancel if funding rate falls below this (null = disabled)
  enableAutoCancel: boolean;          // Enable/disable auto-cancel feature
  executionDelay: number;             // Seconds before funding time to execute (default: 5)
  arbitrageSpreadThreshold: number | null; // Minimum spread threshold for arbitrage opportunities (in %)
}

/**
 * Enhanced Funding Rates Component
 *
 * Displays real-time funding rates with advanced filtering and exchange selection.
 * Features:
 * - Multi-exchange credential selection
 * - Filter by funding rate (min/max)
 * - Filter by next funding time
 * - Auto-refresh every 30 seconds
 * - Sortable columns
 * - Annualized rate calculation
 */
@Component({
  selector: 'app-funding-rates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    DropdownComponent
  ],
  templateUrl: './funding-rates.component.html',
  styleUrl: './funding-rates.component.scss'
})
export class FundingRatesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  // Expose utilities to template
  Array = Array;
  parseFloat = parseFloat;

  // State
  tickers = signal<TickerData[]>([]);
  credentials = signal<ExchangeCredential[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingCredentials = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedCredentialId = signal<string | null>(null);
  hedgeCredentialId = signal<string | null>(null); // For arbitrage subscriptions
  autoRefreshEnabled = signal<boolean>(true);

  // Balance and position information for subscription dialog
  primaryBalance = signal<number | null>(null);
  hedgeBalance = signal<number | null>(null);
  isLoadingBalances = signal<boolean>(false);

  // Filter state
  searchQuery = signal<string>('');
  positionType = signal<'all' | 'long' | 'short'>('all');
  minAbsFundingRate = signal<number | null>(null);
  maxNextFundingHours = signal<number | null>(null);

  // Subscription state
  subscriptions = signal<Map<string, FundingSubscription>>(new Map());
  completedDeals = signal<CompletedDeal[]>([]);
  notifications = signal<string[]>([]);
  showSubscriptionDialog = signal<boolean>(false);
  selectedTicker = signal<TickerData | null>(null);
  positionSizeUsdt = signal<number>(100); // Changed from subscriptionQuantity to USDT-based
  isSubscribing = signal<boolean>(false);
  editingSubscription = signal<FundingSubscription | null>(null);
  startingSubscriptionId = signal<string | null>(null); // Track which subscription is being started

  // Row expansion state
  expandedRows = signal<Set<string>>(new Set());

  // Arbitrage state
  arbitrageOpportunities = signal<any[]>([]);
  isLoadingArbitrage = signal<boolean>(false);
  arbitrageError = signal<string | null>(null);
  showArbitrageSection = signal<boolean>(true);
  arbitrageFiltersCollapsed = signal<boolean>(false);
  minSpreadThreshold = signal<number | null>(null); // Minimum spread threshold in percentage

  // Subscription settings
  subscriptionSettings = signal<SubscriptionSettings>({
    defaultQuantity: 0.01,
    leverage: 1,
    autoCancelThreshold: 0.003,
    enableAutoCancel: true,
    executionDelay: 5, // Default: execute 5 seconds before funding
    arbitrageSpreadThreshold: null // Default: no minimum spread threshold
  });
  showSettingsDialog = signal<boolean>(false);

  // Multi-sort state
  sortColumns = signal<Array<{ column: string; direction: 'asc' | 'desc' }>>([
    { column: 'fundingRate', direction: 'desc' }
  ]);

  // UI state
  isFiltersCollapsed = signal<boolean>(false);

  // Computed
  credentialOptions = computed(() => {
    // Only show active credentials
    return this.credentials()
      .filter(cred => cred.isActive)
      .map(cred => ({
        value: cred.id,
        label: cred.label || `${cred.exchange} (${cred.environment})`,
        disabled: false
      }));
  });

  selectedCredential = computed(() => {
    const id = this.selectedCredentialId();
    return this.credentials().find(c => c.id === id);
  });

  hedgeCredential = computed(() => {
    const id = this.hedgeCredentialId();
    return id ? this.credentials().find(c => c.id === id) : null;
  });

  filteredTickers = computed(() => {
    let filtered = [...this.tickers()];

    // Filter out pairs with no funding rate
    filtered = filtered.filter(t => {
      const fundingRate = parseFloat(t.fundingRate);
      return !isNaN(fundingRate) && t.fundingRate !== '' && t.fundingRate !== null && t.fundingRate !== undefined;
    });

    // Filter out pairs with no price movement (0% change in 24h)
    filtered = filtered.filter(t => {
      const priceChange = parseFloat(t.price24hPcnt);
      return !isNaN(priceChange) && priceChange !== 0;
    });

    // Filter by search query (symbol name)
    const search = this.searchQuery().trim().toUpperCase();
    if (search) {
      filtered = filtered.filter(t => t.symbol.toUpperCase().includes(search));
    }

    // Filter by position type (long/short)
    const posType = this.positionType();
    if (posType === 'long') {
      // Long positions: filter for NEGATIVE funding rates (you receive funding)
      filtered = filtered.filter(t => parseFloat(t.fundingRate) < 0);
    } else if (posType === 'short') {
      // Short positions: filter for POSITIVE funding rates (you receive funding)
      filtered = filtered.filter(t => parseFloat(t.fundingRate) > 0);
    }

    // Filter by minimum absolute funding rate
    const minAbsRate = this.minAbsFundingRate();
    if (minAbsRate !== null) {
      filtered = filtered.filter(t => Math.abs(parseFloat(t.fundingRate) * 100) >= minAbsRate);
    }

    // Filter by next funding time
    const maxHours = this.maxNextFundingHours();
    if (maxHours !== null) {
      const now = Date.now();
      const maxTime = now + (maxHours * 60 * 60 * 1000);
      filtered = filtered.filter(t => {
        const fundingTime = parseInt(t.nextFundingTime);
        return fundingTime <= maxTime;
      });
    }

    return filtered;
  });

  sortedTickers = computed(() => {
    const tickers = [...this.filteredTickers()];
    const sortCols = this.sortColumns();

    if (sortCols.length === 0) {
      return tickers;
    }

    return tickers.sort((a, b) => {
      // Apply each sort column in order
      for (const { column, direction } of sortCols) {
        let aVal: any = a[column as keyof TickerData];
        let bVal: any = b[column as keyof TickerData];

        // Parse numbers for numeric columns
        if (column !== 'symbol') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }

        // Compare values
        let comparison = 0;
        if (aVal > bVal) {
          comparison = 1;
        } else if (aVal < bVal) {
          comparison = -1;
        }

        // If values are different, apply direction and return
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }

        // If values are equal, continue to next sort column
      }

      return 0; // All sort columns equal
    });
  });

  /**
   * Check if a ticker meets the auto-subscribe threshold
   */
  meetsAutoSubscribeThreshold = computed(() => {
    const settings = this.subscriptionSettings();
    const tickers = this.sortedTickers();
    const threshold = settings.autoCancelThreshold;

    if (threshold === null || threshold === undefined) {
      return new Set<string>();
    }

    const eligibleSymbols = new Set<string>();

    tickers.forEach(ticker => {
      const fundingRate = parseFloat(ticker.fundingRate);
      const absFundingRate = Math.abs(fundingRate);

      // Symbol meets threshold if absolute funding rate is >= threshold
      if (absFundingRate >= Math.abs(threshold)) {
        eligibleSymbols.add(ticker.symbol);
      }
    });

    return eligibleSymbols;
  });

  /**
   * Filtered arbitrage opportunities based on spread threshold
   */
  filteredArbitrageOpportunities = computed(() => {
    let opportunities = [...this.arbitrageOpportunities()];

    const minSpread = this.minSpreadThreshold();
    if (minSpread !== null && minSpread > 0) {
      opportunities = opportunities.filter(opp => {
        const spreadPercent = parseFloat(opp.spread) * 100;
        return spreadPercent >= minSpread;
      });
    }

    return opportunities;
  });

  /**
   * Set of symbols with active subscriptions for efficient lookup
   */
  subscribedSymbols = computed(() => {
    const subs = Array.from(this.subscriptions().values());
    const symbols = new Set(subs.map(sub => sub.symbol));
    console.log('[subscribedSymbols] Computed signal updated. Active symbols:', Array.from(symbols));
    return symbols;
  });

  /**
   * Position calculation computed signal - automatically recalculates when dependencies change
   */
  positionCalculation = computed(() => {
    const ticker = this.selectedTicker();
    const positionSizeUsdt = this.positionSizeUsdt();
    const leverage = this.subscriptionSettings().leverage;

    if (!ticker || !positionSizeUsdt || positionSizeUsdt <= 0) {
      return null;
    }

    // Use last price or mark price as estimate
    const estimatedPrice = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;

    if (estimatedPrice === 0) {
      return null;
    }

    // positionSizeUsdt is the margin (your own money)
    // With leverage, actual position value = margin * leverage
    const margin = positionSizeUsdt;
    const positionValue = margin * leverage;

    // Calculate quantity from position value: quantity = positionValue / price
    const quantity = positionValue / estimatedPrice;

    // Estimate trading fee (typical taker fee: 0.055% for Bybit, 0.05% for BingX)
    // For both entry and exit, fee = position value * 0.00055 * 2
    const estimatedFee = positionValue * 0.00055 * 2; // Entry + Exit

    return {
      symbol: ticker.symbol,
      quantity,
      estimatedPrice,
      positionValue,
      requiredMargin: margin,
      estimatedFee,
      leverage
    };
  });

  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.loadSettings();
    this.loadCredentials();
    this.loadSubscriptions();
    this.loadArbitrageOpportunities(); // Load cross-exchange arbitrage data
    this.startAutoCancelChecker();
    this.syncSettingsToFilters();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.autoCancelInterval) {
      clearInterval(this.autoCancelInterval);
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  loadCredentials(): void {
    this.isLoadingCredentials.set(true);
    const token = this.authService.authState().token;
    if (!token) {
      this.error.set('Authentication required');
      this.isLoadingCredentials.set(false);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:3000/api/exchange-credentials', { headers })
      .subscribe({
        next: (response) => {
          console.log('Credentials response:', response);

          if (response.success && response.data) {
            // API returns { credentials: [], totalCount: number }
            const credentialsArray = response.data.credentials || [];
            console.log('Credentials array:', credentialsArray);

            // Filter for Bybit and BingX credentials (supported exchanges)
            // AND only active credentials
            const supportedCreds = credentialsArray.filter((c: ExchangeCredential) =>
              (c.exchange === 'BYBIT' || c.exchange === 'BINGX') && c.isActive === true
            );
            this.credentials.set(supportedCreds);

            console.log('Active credentials:', supportedCreds);

            // Auto-select first credential (all are active now)
            const defaultCred = supportedCreds[0];
            if (defaultCred) {
              this.selectedCredentialId.set(defaultCred.id);
              this.loadTickers();
              this.setupAutoRefresh();
            } else {
              console.warn('No active Bybit or BingX credentials found');
            }
          }
          this.isLoadingCredentials.set(false);
        },
        error: (err) => {
          console.error('Failed to load credentials:', err);
          this.error.set('Failed to load exchange credentials');
          this.isLoadingCredentials.set(false);
        }
      });
  }

  onCredentialChange(credentialId: string): void {
    this.selectedCredentialId.set(credentialId);
    this.loadTickers();
  }

  setupAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    if (this.autoRefreshEnabled()) {
      // Refresh every 3 minutes (180 seconds)
      this.refreshSubscription = interval(180000)
        .pipe(
          startWith(0),
          switchMap(() => this.loadTickersAsync())
        )
        .subscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled.update(v => !v);
    this.setupAutoRefresh();
  }

  loadTickers(): void {
    this.loadTickersAsync().subscribe();
  }

  private loadTickersAsync() {
    const credential = this.selectedCredential();
    if (!credential) {
      return of(null);
    }

    // Prevent concurrent loading - skip if already loading
    if (this.isLoading()) {
      console.log('[FundingRates] Skipping refresh - already loading');
      return of(null);
    }

    this.isLoading.set(true);
    this.error.set(null);

    const token = this.authService.authState().token;
    if (!token) {
      this.error.set('Authentication required');
      this.isLoading.set(false);
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const exchange = credential.exchange;
    const credentialId = credential.id;

    // Determine API endpoint based on exchange
    // Pass credentialId to use the specific selected credential
    let apiUrl = '';
    if (exchange === 'BYBIT') {
      apiUrl = `http://localhost:3000/api/bybit/tickers?category=linear&credentialId=${credentialId}`;
    } else if (exchange === 'BINGX') {
      apiUrl = `http://localhost:3000/api/bingx/tickers?credentialId=${credentialId}`;
    } else {
      this.error.set(`Unsupported exchange: ${exchange}`);
      this.isLoading.set(false);
      return of(null);
    }

    return this.http.get<any>(apiUrl, { headers }).pipe(
      switchMap(async (response) => {
        try {
          if (response.success) {
            // Map BingX ticker format to match Bybit format if needed
            let tickers = exchange === 'BINGX'
              ? this.mapBingXTickers(response.data)
              : response.data;

            // For BingX, fetch funding rates separately and merge
            if (exchange === 'BINGX') {
              console.log('[BingX] Starting to merge funding rates...');
              tickers = await this.mergeBingXFundingRates(tickers, headers, credentialId);
              console.log('[BingX] Funding rates merged, updating table...');
            }

            this.tickers.set(tickers);
            this.isLoading.set(false);
            console.log(`[FundingRates] Updated ${tickers.length} tickers`);
          } else {
            this.error.set(response.message || 'Failed to load tickers');
            this.isLoading.set(false);
          }
          return response;
        } catch (error: any) {
          console.error('[FundingRates] Error in loadTickersAsync:', error);
          this.error.set(error.message || 'Failed to load data');
          this.isLoading.set(false);
          return null;
        }
      })
    );
  }

  /**
   * Fetch BingX funding rates and merge with ticker data
   */
  private async mergeBingXFundingRates(tickers: TickerData[], headers: HttpHeaders, credentialId: string): Promise<TickerData[]> {
    try {
      console.log('[BingX] Fetching funding rates for', tickers.length, 'symbols...');
      const fundingUrl = `${getEndpointUrl('bingx', 'fundingRates')}?credentialId=${credentialId}`;
      const fundingResponse = await this.http.get<any>(
        fundingUrl,
        { headers }
      ).toPromise();

      console.log('[BingX] Funding rates response:', fundingResponse);

      if (fundingResponse?.success && fundingResponse?.data) {
        console.log('[BingX] Received', fundingResponse.data.length, 'funding rates');
        const fundingMap = new Map<string, any>();
        fundingResponse.data.forEach((fr: any) => {
          fundingMap.set(fr.symbol, fr);
        });

        // Merge funding rates into tickers
        const mergedTickers = tickers.map(ticker => {
          const funding = fundingMap.get(ticker.symbol);
          if (funding) {
            return {
              ...ticker,
              fundingRate: funding.fundingRate || '0',
              nextFundingTime: funding.fundingTime ? funding.fundingTime.toString() : '0'
            };
          }
          return ticker;
        });

        console.log('[BingX] Merged funding rates into', mergedTickers.length, 'tickers');
        return mergedTickers;
      } else {
        console.warn('[BingX] Invalid funding rates response:', fundingResponse);
      }
    } catch (error) {
      console.error('[BingX] Failed to fetch funding rates:', error);
    }

    console.log('[BingX] Returning original tickers without funding rates');
    return tickers;
  }

  /**
   * Map BingX ticker format to Bybit ticker format for consistent display
   */
  private mapBingXTickers(bingxTickers: any[]): TickerData[] {
    return bingxTickers.map(ticker => ({
      symbol: ticker.symbol,
      lastPrice: ticker.lastPrice || '0',
      indexPrice: ticker.lastPrice || '0', // BingX doesn't have indexPrice, use lastPrice
      markPrice: ticker.lastPrice || '0',
      prevPrice24h: ticker.openPrice || '0',
      price24hPcnt: ticker.priceChangePercent ? (parseFloat(ticker.priceChangePercent) / 100).toString() : '0',
      highPrice24h: ticker.highPrice || '0',
      lowPrice24h: ticker.lowPrice || '0',
      prevPrice1h: ticker.openPrice || '0', // BingX doesn't have 1h price
      openInterest: '0', // BingX doesn't provide this in ticker
      openInterestValue: '0',
      turnover24h: ticker.quoteVolume || '0',
      volume24h: ticker.volume || '0',
      fundingRate: '0', // BingX doesn't include funding rate in tickers - need separate call
      nextFundingTime: '0',
      predictedDeliveryPrice: '0',
      basisRate: '0',
      deliveryFeeRate: '0',
      deliveryTime: '0',
      ask1Size: '0',
      bid1Price: '0',
      ask1Price: '0',
      bid1Size: '0'
    }));
  }

  /**
   * Load arbitrage opportunities from all exchanges
   */
  loadArbitrageOpportunities(): void {
    const token = this.authService.authState().token;
    if (!token) {
      this.arbitrageError.set('Authentication required');
      return;
    }

    this.isLoadingArbitrage.set(true);
    this.arbitrageError.set(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const arbitrageUrl = getEndpointUrl('arbitrage', 'fundingRates');

    this.http.get<any>(arbitrageUrl, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.arbitrageOpportunities.set(response.data || []);
          console.log(`[Arbitrage] Loaded ${response.data?.length || 0} opportunities`);
          console.log('[Arbitrage] Opportunity symbols:', response.data?.map((o: any) => o.symbol));
          console.log('[Arbitrage] First opportunity sample:', response.data?.[0]);
        } else {
          this.arbitrageError.set(response.message || 'Failed to load arbitrage data');
        }
        this.isLoadingArbitrage.set(false);
      },
      error: (error) => {
        console.error('[Arbitrage] Error loading opportunities:', error);
        this.arbitrageError.set(error.message || 'Failed to load arbitrage data');
        this.isLoadingArbitrage.set(false);
      }
    });
  }

  toggleArbitrageSection(): void {
    this.showArbitrageSection.update(v => !v);
  }

  toggleArbitrageFilters(): void {
    this.arbitrageFiltersCollapsed.update(v => !v);
  }

  clearArbitrageFilters(): void {
    this.minSpreadThreshold.set(null);
  }

  /**
   * Sort by column with multi-sort support
   * - Click: Single column sort (replaces all)
   * - Shift+Click: Add column to multi-sort
   * - Click same column: Toggle direction
   */
  sortBy(column: string, event?: MouseEvent): void {
    const currentSorts = this.sortColumns();
    const existingIndex = currentSorts.findIndex(s => s.column === column);

    if (event?.shiftKey) {
      // Shift+Click: Add to multi-sort or toggle existing
      if (existingIndex >= 0) {
        // Toggle direction of existing sort
        const updated = [...currentSorts];
        updated[existingIndex] = {
          column,
          direction: updated[existingIndex].direction === 'asc' ? 'desc' : 'asc'
        };
        this.sortColumns.set(updated);
      } else {
        // Add new sort column
        this.sortColumns.set([...currentSorts, { column, direction: 'desc' }]);
      }
    } else {
      // Regular click: Single column sort
      if (existingIndex === 0 && currentSorts.length === 1) {
        // Same column, toggle direction
        this.sortColumns.set([{
          column,
          direction: currentSorts[0].direction === 'asc' ? 'desc' : 'asc'
        }]);
      } else {
        // New column, default to descending
        this.sortColumns.set([{ column, direction: 'desc' }]);
      }
    }
  }

  /**
   * Get sort info for a column (for display)
   */
  getSortInfo(column: string): { index: number; direction: 'asc' | 'desc' } | null {
    const sorts = this.sortColumns();
    const index = sorts.findIndex(s => s.column === column);
    if (index === -1) return null;
    return { index, direction: sorts[index].direction };
  }

  /**
   * Clear all sorting
   */
  clearSort(): void {
    this.sortColumns.set([{ column: 'fundingRate', direction: 'desc' }]);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.positionType.set('all');
    this.minAbsFundingRate.set(null);
    this.maxNextFundingHours.set(null);
  }

  toggleFiltersCollapsed(): void {
    this.isFiltersCollapsed.update(v => !v);
  }

  formatPrice(price: string): string {
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }

  formatFundingRate(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '-';
    const percentage = (num * 100).toFixed(4);
    return `${percentage}%`;
  }

  formatAnnualizedRate(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '-';
    // Bybit charges funding every 8 hours (3 times per day)
    const annualized = num * 3 * 365 * 100;
    return `${annualized.toFixed(2)}%`;
  }

  formatPercent(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    const percentage = (num * 100).toFixed(2);
    return `${num >= 0 ? '+' : ''}${percentage}%`;
  }

  formatNextFundingTime(timestamp: string): string {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return '-';

    const date = new Date(ts);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  formatVolume(volume: string): string {
    const num = parseFloat(volume);
    if (isNaN(num)) return '-';

    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  }

  getFundingRateClass(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '';

    if (num > 0) return 'funding-positive';
    if (num < 0) return 'funding-negative';
    return 'funding-neutral';
  }

  getPercentClass(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    if (num > 0) return 'percent-positive';
    if (num < 0) return 'percent-negative';
    return '';
  }

  /**
   * Check if a ticker meets the auto-subscribe threshold
   */
  tickerMeetsThreshold(symbol: string): boolean {
    return this.meetsAutoSubscribeThreshold().has(symbol);
  }

  /**
   * Get the recommended position type based on funding rate
   * Long if funding is negative (you receive funding)
   * Short if funding is positive (you receive funding)
   */
  getRecommendedPositionType(ticker: TickerData): 'long' | 'short' {
    const fundingRate = parseFloat(ticker.fundingRate);
    return fundingRate < 0 ? 'long' : 'short';
  }

  /**
   * Start subscription execution immediately (manual trigger)
   */
  async startSubscriptionNow(subscriptionId: string): Promise<void> {
    // Prevent duplicate executions
    if (this.startingSubscriptionId() === subscriptionId) {
      console.log('Already starting this subscription, ignoring duplicate request');
      return;
    }

    try {
      this.startingSubscriptionId.set(subscriptionId);

      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        this.startingSubscriptionId.set(null);
        return;
      }

      const response = await fetch(`/api/funding-arbitrage/execute/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Subscription execution started!', 'success');
        this.loadSubscriptions();
      } else {
        this.showNotification(`Failed to start: ${result.message || result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Start subscription error:', error);
      this.showNotification('Failed to start subscription execution', 'error');
    } finally {
      this.startingSubscriptionId.set(null);
    }
  }

  /**
   * Open subscription dialog for funding rate
   */
  openSubscriptionDialog(ticker: TickerData, event: Event): void {
    event.stopPropagation();
    this.selectedTicker.set(ticker);
    this.showSubscriptionDialog.set(true);
    this.positionSizeUsdt.set(100); // Default position size in USDT
  }

  /**
   * Close subscription dialog
   */
  closeSubscriptionDialog(): void {
    this.showSubscriptionDialog.set(false);
    this.selectedTicker.set(null);
    this.editingSubscription.set(null);
    this.isSubscribing.set(false);
    this.hedgeCredentialId.set(null); // Clear hedge credential
  }

  /**
   * Toggle row expansion for inline subscription form
   */
  toggleRowExpansion(symbol: string): void {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(symbol)) {
      expanded.delete(symbol);
    } else {
      expanded.add(symbol);
      // Pre-fill quantity if there's an existing subscription
      const subscription = this.getActiveSubscription(symbol);
      if (subscription) {
        // Convert quantity back to USDT based on current price (approximate)
        const ticker = this.filteredTickers().find(t => t.symbol === symbol);
        if (ticker) {
          const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
          this.positionSizeUsdt.set(subscription.quantity * price);
        }
        this.editingSubscription.set(subscription);
      }
    }
    this.expandedRows.set(expanded);
  }

  /**
   * Check if row is expanded
   */
  isRowExpanded(symbol: string): boolean {
    return this.expandedRows().has(symbol);
  }

  /**
   * Get active subscription for a symbol
   */
  getActiveSubscription(symbol: string): FundingSubscription | undefined {
    // Find subscription by symbol (subscriptions Map is keyed by subscriptionId)
    const subs = Array.from(this.subscriptions().values());
    return subs.find(sub => sub.symbol === symbol);
  }

  /**
   * Subscribe from inline form or action button
   */
  subscribeFromInlineForm(ticker: TickerData): void {
    this.selectedTicker.set(ticker);
    // Use default quantity or the one set in expanded form
    if (!this.isRowExpanded(ticker.symbol)) {
      this.positionSizeUsdt.set(100); // Default position size in USDT
    }
    this.subscribeFundingRate();
  }

  /**
   * Check if subscription can be started now
   */
  canStartNow(subscription: FundingSubscription): boolean {
    // Can start now if waiting and more than 1 minute until funding
    return subscription.countdown !== undefined && subscription.countdown > 60;
  }

  /**
   * Cancel a subscription (wrapper for unsubscribe)
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.unsubscribe(subscriptionId, false);
  }

  /**
   * Load settings from localStorage
   */
  loadSettings(): void {
    const saved = localStorage.getItem('fundingSubscriptionSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved) as SubscriptionSettings;
        this.subscriptionSettings.set(settings);
        this.positionSizeUsdt.set(100); // Default position size in USDT
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(): void {
    const settings = this.subscriptionSettings();
    localStorage.setItem('fundingSubscriptionSettings', JSON.stringify(settings));
    // Position size is now in USDT, not affected by settings.defaultQuantity
    this.syncSettingsToFilters();
    this.showSettingsDialog.set(false);
    this.showNotification('Settings saved successfully', 'success');
  }

  /**
   * Sync settings to filters (threshold becomes min funding rate filter)
   */
  syncSettingsToFilters(): void {
    const settings = this.subscriptionSettings();
    if (settings.autoCancelThreshold !== null && settings.autoCancelThreshold !== undefined) {
      // Convert from decimal (0.003) to percentage (0.3%) for the filter
      const thresholdPercent = Math.abs(settings.autoCancelThreshold) * 100;
      this.minAbsFundingRate.set(thresholdPercent);
    }
  }

  /**
   * Open settings dialog
   */
  openSettingsDialog(): void {
    this.showSettingsDialog.set(true);
  }

  /**
   * Close settings dialog
   */
  closeSettingsDialog(): void {
    this.showSettingsDialog.set(false);
    this.loadSettings(); // Reload to reset any unsaved changes
  }

  /**
   * Start auto-cancel checker (runs every 30 seconds)
   */
  private autoCancelInterval?: any;

  startAutoCancelChecker(): void {
    this.autoCancelInterval = setInterval(() => {
      this.checkAutoCancelConditions();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check if any subscriptions should be auto-cancelled based on funding rate threshold
   */
  checkAutoCancelConditions(): void {
    const settings = this.subscriptionSettings();
    if (!settings.enableAutoCancel || settings.autoCancelThreshold === null) {
      return; // Auto-cancel is disabled
    }

    const subscriptionsMap = this.subscriptions();
    const tickers = this.tickers();

    subscriptionsMap.forEach((subscription, subscriptionId) => {
      // Find current ticker data for this subscription
      const ticker = tickers.find(t => t.symbol === subscription.symbol);
      if (!ticker) return;

      const currentFundingRate = parseFloat(ticker.fundingRate);
      const absFundingRate = Math.abs(currentFundingRate);

      // Check if funding rate fell below threshold
      if (absFundingRate < Math.abs(settings.autoCancelThreshold!)) {
        console.log(`Auto-cancelling ${subscription.symbol}: funding rate ${currentFundingRate} below threshold ${settings.autoCancelThreshold}`);
        this.unsubscribe(subscriptionId, false); // Cancel with notification
        this.showNotification(
          `Auto-cancelled ${subscription.symbol}: funding rate ${(currentFundingRate * 100).toFixed(4)}% below threshold`,
          'info'
        );
      }
    });
  }

  /**
   * Edit an existing subscription
   */
  editSubscription(subscription: FundingSubscription): void {
    console.log('[DEBUG] editSubscription called with:', subscription);

    // Find the ticker data for this subscription
    const ticker = this.tickers().find(t => t.symbol === subscription.symbol);
    if (!ticker) {
      console.error('[ERROR] Cannot edit: ticker data not found for symbol:', subscription.symbol);
      this.showNotification('[ERROR] Cannot edit: ticker data not found', 'error');
      return;
    }

    console.log('[DEBUG] Found ticker:', ticker);

    this.editingSubscription.set(subscription);
    this.selectedTicker.set(ticker);
    // Convert quantity to USDT (approximate based on current price)
    const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
    const estimatedMargin = subscription.quantity * price / this.subscriptionSettings().leverage;
    console.log('[DEBUG] Setting position size USDT to:', estimatedMargin, 'based on quantity:', subscription.quantity, 'price:', price, 'leverage:', this.subscriptionSettings().leverage);
    this.positionSizeUsdt.set(estimatedMargin);

    // Open the subscription dialog for editing
    console.log('[DEBUG] Opening subscription dialog');
    this.showSubscriptionDialog.set(true);
  }

  /**
   * Save edited subscription
   * Note: Backend doesn't support PATCH/PUT, so we need to cancel and recreate
   */
  saveEditedSubscription(): void {
    const editingSub = this.editingSubscription();
    if (!editingSub) {
      return;
    }

    const positionCalc = this.positionCalculation();
    if (!positionCalc) {
      this.showNotification('Unable to calculate position. Please check your input.', 'error');
      return;
    }
    const newQuantity = positionCalc.quantity;
    if (newQuantity === editingSub.quantity) {
      this.showNotification('[INFO] No changes to save', 'info');
      this.cancelEdit();
      return;
    }

    // Since backend doesn't have PUT endpoint, we need to cancel and recreate
    const token = this.authService.authState().token;
    if (!token) {
      this.showNotification('[ERROR] Not authenticated', 'error');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Step 1: Cancel existing subscription
    this.http.delete<any>(
      `http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${editingSub.subscriptionId}`,
      { headers }
    ).subscribe({
      next: (deleteResponse) => {
        if (deleteResponse.success) {
          // Step 2: Create new subscription with updated quantity
          const credential = this.selectedCredential();
          if (!credential) {
            this.showNotification('[ERROR] No exchange credential selected', 'error');
            return;
          }

          const subscribeData = {
            symbol: editingSub.symbol,
            fundingRate: editingSub.fundingRate,
            nextFundingTime: editingSub.nextFundingTime,
            positionType: editingSub.positionType,
            quantity: newQuantity,
            primaryCredentialId: credential.id,
            hedgeExchange: 'MOCK',
            leverage: this.subscriptionSettings().leverage
          };

          this.http.post<any>(
            'http://localhost:3000/api/funding-arbitrage/subscribe',
            subscribeData,
            { headers }
          ).subscribe({
            next: (createResponse) => {
              if (createResponse.success) {
                this.showNotification('[SUCCESS] Subscription updated successfully', 'success');
                this.editingSubscription.set(null);
                this.loadSubscriptions();
              } else {
                this.showNotification(`[ERROR] ${createResponse.message || 'Failed to recreate subscription'}`, 'error');
              }
            },
            error: (error) => {
              console.error('Recreate subscription error:', error);
              this.showNotification(`[ERROR] ${error.error?.message || 'Failed to recreate subscription'}`, 'error');
            }
          });
        } else {
          this.showNotification(`[ERROR] ${deleteResponse.message || 'Failed to cancel old subscription'}`, 'error');
        }
      },
      error: (error) => {
        console.error('Cancel subscription error:', error);
        this.showNotification(`[ERROR] ${error.error?.message || 'Failed to cancel old subscription'}`, 'error');
      }
    });
  }

  /**
   * Cancel editing subscription
   */
  cancelEdit(): void {
    this.editingSubscription.set(null);
    this.positionSizeUsdt.set(100); // Reset to default USDT amount
  }

  /**
   * Load existing subscriptions from the server
   */
  loadSubscriptions(): void {
    const token = this.authService.authState().token;
    if (!token) {
      console.log('No auth token, skipping subscription load');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:3000/api/funding-arbitrage/subscribe', { headers })
      .subscribe({
        next: (response) => {
          console.log('Loaded subscriptions:', response);
          if (response.success && response.data) {
            const subsMap = new Map<string, FundingSubscription>();
            const completedDealsList: CompletedDeal[] = [];

            response.data.forEach((sub: any) => {
              // Check if subscription is completed
              if (sub.status === 'COMPLETED' && sub.entryPrice) {
                completedDealsList.push({
                  subscriptionId: sub.subscriptionId,
                  symbol: sub.symbol,
                  fundingRate: sub.fundingRate,
                  positionType: sub.positionType,
                  quantity: sub.quantity,
                  entryPrice: sub.entryPrice,
                  hedgeEntryPrice: sub.hedgeEntryPrice,
                  fundingEarned: sub.fundingEarned,
                  realizedPnl: sub.realizedPnl,
                  executedAt: sub.executedAt,
                  createdAt: sub.createdAt,
                });
              } else if (sub.status !== 'COMPLETED') {
                // Only add non-completed subscriptions to active list
                subsMap.set(sub.subscriptionId, sub);
              }
            });

            console.log('[loadSubscriptions] Active subscriptions map:', subsMap);
            console.log('[loadSubscriptions] Active subscription symbols:', Array.from(subsMap.values()).map(s => s.symbol));
            console.log('[loadSubscriptions] Completed deals:', completedDealsList.length);

            this.subscriptions.set(subsMap);
            this.completedDeals.set(completedDealsList);
          }
        },
        error: (err) => {
          console.error('Failed to load subscriptions:', err);
        }
      });
  }

  /**
   * Subscribe to funding rate arbitrage
   */
  async subscribeFundingRate(): Promise<void> {
    const ticker = this.selectedTicker();
    const credential = this.selectedCredential();
    const editingSub = this.editingSubscription();

    if (!ticker || !credential) return;

    this.isSubscribing.set(true);

    try {
      // If editing, cancel the old subscription first
      if (editingSub) {
        await this.unsubscribe(editingSub.subscriptionId, true); // true = silent mode
      }
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      // Determine position type based on funding rate
      const fundingRate = parseFloat(ticker.fundingRate);
      const positionType = fundingRate < 0 ? 'long' : 'short';

      // Calculate quantity from position size in USDT
      const positionCalc = this.positionCalculation();
      if (!positionCalc) {
        this.showNotification('Unable to calculate position details. Please check your input.', 'error');
        return;
      }

      // Get hedge credential if available, otherwise use MOCK
      const hedgeCred = this.hedgeCredential();
      const body: any = {
        symbol: ticker.symbol,
        fundingRate: fundingRate,
        nextFundingTime: parseInt(ticker.nextFundingTime),
        positionType: positionType,
        quantity: positionCalc.quantity, // Use calculated quantity from USDT amount
        primaryCredentialId: credential.id,
        hedgeExchange: hedgeCred ? hedgeCred.exchange : 'MOCK',
        executionDelay: this.subscriptionSettings().executionDelay
      };

      // Add hedge credential ID if available
      if (hedgeCred) {
        body.hedgeCredentialId = hedgeCred.id;
      }

      console.log('Creating funding subscription:', body);

      const response = await this.http.post<any>(
        'http://localhost:3000/api/funding-arbitrage/subscribe',
        body,
        { headers }
      ).toPromise();

      if (response.success) {
        const subscription: FundingSubscription = {
          subscriptionId: response.data.subscriptionId,
          symbol: response.data.symbol,
          fundingRate: response.data.fundingRate,
          nextFundingTime: response.data.nextFundingTime,
          positionType: response.data.positionType,
          quantity: response.data.quantity,
          status: response.data.status
        };

        const subs = this.subscriptions();
        subs.set(subscription.subscriptionId, subscription);
        this.subscriptions.set(new Map(subs));

        const message = editingSub
          ? `✅ Updated subscription for ${ticker.symbol}`
          : `✅ Subscribed to ${ticker.symbol} funding arbitrage`;

        this.showNotification(message, 'success');

        this.closeSubscriptionDialog();
        this.startCountdownMonitoring(subscription);
      }
    } catch (error: any) {
      console.error('Error subscribing to funding rate:', error);
      this.showNotification(
        `Failed to subscribe: ${error.error?.message || error.message}`,
        'error'
      );
    } finally {
      this.isSubscribing.set(false);
    }
  }

  /**
   * Start countdown monitoring for a subscription
   */
  private startCountdownMonitoring(subscription: FundingSubscription): void {
    const updateCountdown = () => {
      const now = Date.now();
      const timeRemaining = subscription.nextFundingTime - now;
      const secondsRemaining = Math.floor(timeRemaining / 1000);

      if (secondsRemaining <= 0) {
        return;
      }

      // Update countdown
      const subs = this.subscriptions();
      const sub = subs.get(subscription.subscriptionId);
      if (sub) {
        sub.countdown = secondsRemaining;
        this.subscriptions.set(new Map(subs));
        // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      }

      // Notify at key moments
      if (secondsRemaining === 10) {
        this.showNotification(`⏰ 10 seconds until funding for ${subscription.symbol}`, 'info');
      } else if (secondsRemaining === 5) {
        this.showNotification(`🚀 Opening positions for ${subscription.symbol}...`, 'info');
      }

      // Schedule next update
      setTimeout(updateCountdown, 1000);
    };

    // Start the countdown
    updateCountdown();
  }

  /**
   * Unsubscribe from funding arbitrage
   */
  async unsubscribe(subscriptionId: string, silent: boolean = false): Promise<void> {
    try {
      const token = this.authService.authState().token;
      if (!token) return;

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await this.http.delete<any>(
        `http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${subscriptionId}`,
        { headers }
      ).toPromise();

      // Remove from local state
      const subs = this.subscriptions();
      subs.delete(subscriptionId);
      this.subscriptions.set(new Map(subs));

      if (!silent) {
        this.showNotification('Subscription canceled', 'info');
      }
    } catch (error: any) {
      console.error('Error unsubscribing:', error);

      // Check if subscription was already removed (404 or "not found" error)
      const isNotFound = error.status === 404 ||
                         error.error?.message?.includes('not found') ||
                         error.error?.error?.includes('not found');

      if (isNotFound) {
        // Subscription already gone from backend, just remove from frontend
        const subs = this.subscriptions();
        subs.delete(subscriptionId);
        this.subscriptions.set(new Map(subs));

        if (!silent) {
          this.showNotification('Subscription already removed', 'info');
        }
      } else {
        // Real error
        if (!silent) {
          this.showNotification('Failed to cancel subscription', 'error');
        }
      }
    }
  }

  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notifications = this.notifications();
    notifications.push(`[${type.toUpperCase()}] ${message}`);
    this.notifications.set([...notifications]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const notifs = this.notifications();
      const index = notifs.indexOf(`[${type.toUpperCase()}] ${message}`);
      if (index > -1) {
        notifs.splice(index, 1);
        this.notifications.set([...notifs]);
      }
    }, 5000);
  }

  /**
   * Calculate countdown from funding time
   */
  calculateCountdown(nextFundingTime: number): number {
    const now = Date.now();
    const timeRemaining = nextFundingTime - now;
    return Math.max(0, Math.floor(timeRemaining / 1000));
  }

  /**
   * Format countdown time
   */
  formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Executing...';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Check if a symbol has an active subscription
   */
  hasActiveSubscription(symbol: string): boolean {
    const hasSubscription = this.subscribedSymbols().has(symbol);

    // Debug logging
    if (hasSubscription) {
      console.log('[hasActiveSubscription] Symbol has subscription:', symbol);
    }

    return hasSubscription;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString();
  }

  /**
   * Subscribe to arbitrage opportunity
   * Opens the subscription dialog for the best long position exchange
   */
  subscribeToArbitrage(opportunity: any): void {
    console.log('[subscribeToArbitrage] Called with opportunity:', opportunity);

    // Find the ticker for the best long exchange (lowest funding rate)
    const bestLongExchange = opportunity.bestLong.exchange;
    const bestLongCredentialId = opportunity.bestLong.credentialId;
    console.log('[subscribeToArbitrage] Best long:', { bestLongExchange, bestLongCredentialId });

    // Find the matching credential
    const credential = this.credentials().find(c => c.id === bestLongCredentialId);
    console.log('[subscribeToArbitrage] Found credential:', credential);
    console.log('[subscribeToArbitrage] All credentials:', this.credentials());

    if (!credential) {
      console.error('[subscribeToArbitrage] Credential not found for ID:', bestLongCredentialId);
      this.showNotification('Exchange credential not found for ' + bestLongExchange, 'error');
      return;
    }

    // Switch to the best long exchange's credential
    this.selectedCredentialId.set(bestLongCredentialId);
    console.log('[subscribeToArbitrage] Switched to credential:', bestLongCredentialId);

    // Set the hedge exchange credential (best short)
    const bestShortCredentialId = opportunity.bestShort.credentialId;
    this.hedgeCredentialId.set(bestShortCredentialId);
    console.log('[subscribeToArbitrage] Set hedge credential:', bestShortCredentialId);

    // Find the ticker data from the exchanges array
    const exchangeData = opportunity.exchanges.find(
      (ex: any) => ex.exchange === bestLongExchange && ex.credentialId === bestLongCredentialId
    );
    console.log('[subscribeToArbitrage] Found exchange data:', exchangeData);
    console.log('[subscribeToArbitrage] All exchanges:', opportunity.exchanges);

    if (!exchangeData) {
      console.error('[subscribeToArbitrage] Exchange data not found');
      this.showNotification('Ticker data not found for ' + opportunity.symbol, 'error');
      return;
    }

    // Try to find the actual ticker from loaded tickers (after switching credential)
    // We need to load tickers for this credential first
    this.loadTickers();

    // Wait a moment for tickers to load, then find the ticker
    setTimeout(() => {
      let ticker = this.tickers().find(t => t.symbol === opportunity.symbol);

      if (!ticker) {
        console.warn('[subscribeToArbitrage] Ticker not found in loaded tickers, creating from exchange data');
        // Fallback: Create a ticker object from exchange data with better price handling
        ticker = {
          symbol: opportunity.symbol,
          fundingRate: opportunity.bestLong.fundingRate,
          nextFundingTime: exchangeData.nextFundingTime?.toString() || '0',
          lastPrice: (exchangeData.lastPrice || exchangeData.price || '0').toString(),
          indexPrice: (exchangeData.indexPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
          markPrice: (exchangeData.markPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
          prevPrice24h: '0',
          price24hPcnt: '0',
          highPrice24h: '0',
          lowPrice24h: '0',
          prevPrice1h: '0',
          openInterest: exchangeData.openInterest?.toString() || '0',
          openInterestValue: '0',
          turnover24h: '0',
          volume24h: exchangeData.volume24h?.toString() || '0',
          predictedDeliveryPrice: '0',
          basisRate: '0',
          deliveryFeeRate: '0',
          deliveryTime: '0',
          ask1Size: '0',
          bid1Price: '0',
          ask1Price: '0',
          bid1Size: '0'
        };
      }

      // Update the ticker's funding rate from arbitrage data
      ticker = {
        ...ticker,
        fundingRate: opportunity.bestLong.fundingRate,
        nextFundingTime: exchangeData.nextFundingTime?.toString() || ticker.nextFundingTime
      };

      console.log('[subscribeToArbitrage] Using ticker:', ticker);
      this.selectedTicker.set(ticker);
      this.positionSizeUsdt.set(100); // Default position size in USDT
      this.showSubscriptionDialog.set(true);
      this.fetchBalancesAndCalculatePosition(ticker.symbol);

      // Show notification about the arbitrage opportunity
      const spreadPercent = (parseFloat(opportunity.spread) * 100).toFixed(4);
      const notificationMsg = `Subscribing to ${opportunity.symbol} arbitrage: ${spreadPercent}% spread between ${bestLongExchange} and ${opportunity.bestShort.exchange}`;
      console.log('[subscribeToArbitrage] Showing notification:', notificationMsg);
      this.showNotification(notificationMsg, 'info');

      console.log('[subscribeToArbitrage] Completed successfully');
    }, 500); // Give tickers time to load
  }

  /**
   * Fetch balances for primary and hedge exchanges and calculate position details
   */
  async fetchBalancesAndCalculatePosition(symbol: string): Promise<void> {
    const primaryCred = this.selectedCredential();
    const hedgeCred = this.hedgeCredential();
    const ticker = this.selectedTicker();

    if (!primaryCred || !ticker) {
      console.error('[fetchBalances] Missing primary credential or ticker');
      return;
    }

    this.isLoadingBalances.set(true);

    try {
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Fetch primary balance
      let primaryBalanceUrl: string;

      // Use correct endpoint based on exchange
      if (primaryCred.exchange === 'BYBIT') {
        primaryBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
      } else if (primaryCred.exchange === 'BINGX') {
        primaryBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
      } else {
        console.warn('[fetchBalances] Unsupported primary exchange:', primaryCred.exchange);
        this.primaryBalance.set(null);
        return;
      }

      const primaryBalanceResponse = await this.http.get<any>(primaryBalanceUrl, { headers }).toPromise();

      console.log('[fetchBalances] Primary balance response:', JSON.stringify(primaryBalanceResponse, null, 2));

      if (primaryBalanceResponse?.success && primaryBalanceResponse.data) {
        let balance = 0;

        // Extract balance based on exchange type
        if (primaryCred.exchange === 'BYBIT') {
          console.log('[fetchBalances] Bybit data structure:', primaryBalanceResponse.data);
          // Bybit returns: data.list[0].totalAvailableBalance
          const list = primaryBalanceResponse.data.list;
          if (list && list.length > 0) {
            balance = parseFloat(list[0].totalAvailableBalance || '0');
            console.log('[fetchBalances] Bybit balance from list[0]:', balance);
          } else {
            console.warn('[fetchBalances] Bybit list is empty or undefined:', list);
          }
        } else if (primaryCred.exchange === 'BINGX') {
          // BingX response: data.balance.availableMargin or data.balance.balance
          console.log('[fetchBalances] BingX FULL response:', primaryBalanceResponse);
          console.log('[fetchBalances] BingX data:', primaryBalanceResponse.data);
          console.log('[fetchBalances] BingX data.balance:', primaryBalanceResponse.data?.balance);

          const bingxBalance = primaryBalanceResponse.data?.balance;
          if (bingxBalance) {
            console.log('[fetchBalances] BingX balance object keys:', Object.keys(bingxBalance));
            console.log('[fetchBalances] BingX balance.availableMargin:', bingxBalance.availableMargin);
            console.log('[fetchBalances] BingX balance.balance:', bingxBalance.balance);
            balance = parseFloat(bingxBalance.availableMargin || bingxBalance.balance || '0');
          } else {
            console.error('[fetchBalances] BingX balance object is null/undefined');
          }
          console.log('[fetchBalances] Final extracted balance:', balance);
        }

        this.primaryBalance.set(balance);
        console.log('[fetchBalances] Primary balance set to:', balance, 'for', primaryCred.exchange);
      }

      // Fetch hedge balance if available
      if (hedgeCred) {
        let hedgeBalanceUrl: string;

        // Use correct endpoint based on exchange
        if (hedgeCred.exchange === 'BYBIT') {
          hedgeBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
        } else if (hedgeCred.exchange === 'BINGX') {
          hedgeBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
        } else {
          console.warn('[fetchBalances] Unsupported hedge exchange:', hedgeCred.exchange);
          this.hedgeBalance.set(null);
          return;
        }

        const hedgeBalanceResponse = await this.http.get<any>(hedgeBalanceUrl, { headers }).toPromise();

        console.log('[fetchBalances] Hedge balance response:', JSON.stringify(hedgeBalanceResponse, null, 2));

        if (hedgeBalanceResponse?.success && hedgeBalanceResponse.data) {
          let balance = 0;

          // Extract balance based on exchange type
          if (hedgeCred.exchange === 'BYBIT') {
            // Bybit returns: data.list[0].totalAvailableBalance
            const list = hedgeBalanceResponse.data.list;
            if (list && list.length > 0) {
              balance = parseFloat(list[0].totalAvailableBalance || '0');
              console.log('[fetchBalances] Hedge Bybit balance from list[0]:', balance);
            } else {
              console.warn('[fetchBalances] Hedge Bybit list is empty or undefined:', list);
            }
          } else if (hedgeCred.exchange === 'BINGX') {
            // BingX response: data.balance.availableMargin or data.balance.balance
            console.log('[fetchBalances] Hedge BingX data structure:', hedgeBalanceResponse.data);
            const bingxBalance = hedgeBalanceResponse.data.balance;
            console.log('[fetchBalances] Hedge BingX balance object:', bingxBalance);
            balance = parseFloat(bingxBalance?.availableMargin || bingxBalance?.balance || '0');
            console.log('[fetchBalances] Hedge extracted balance:', balance);
          }

          this.hedgeBalance.set(balance);
          console.log('[fetchBalances] Hedge balance set to:', balance, 'for', hedgeCred.exchange);
        }
      } else {
        // Mock exchange - unlimited balance
        this.hedgeBalance.set(999999);
      }

      // Position calculation is now automatic via computed signal

    } catch (error: any) {
      console.error('[fetchBalances] Error fetching balances:', error);
      this.primaryBalance.set(null);
      this.hedgeBalance.set(null);
    } finally {
      this.isLoadingBalances.set(false);
    }
  }

  /**
   * Opens the trading pair's futures page on the exchange platform
   */
  openTradingPair(symbol: string): void {
    const credential = this.selectedCredential();
    if (!credential) return;

    const exchange = credential.exchange;
    const environment = credential.environment;

    let url = '';

    switch (exchange) {
      case 'BYBIT':
        if (environment === 'TESTNET') {
          // Bybit Testnet futures trading page
          url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
        } else {
          // Bybit Mainnet futures trading page
          url = `https://www.bybit.com/trade/usdt/${symbol}`;
        }
        break;

      case 'BINANCE':
        if (environment === 'TESTNET') {
          // Binance Testnet futures
          url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
        } else {
          // Binance Mainnet futures
          url = `https://www.binance.com/en/futures/${symbol}`;
        }
        break;

      case 'OKX':
        // OKX doesn't have separate testnet URLs for trading
        url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
        break;

      case 'KRAKEN':
        // Kraken futures
        url = `https://futures.kraken.com/trade/${symbol}`;
        break;

      case 'COINBASE':
        // Coinbase doesn't have futures trading in the same way
        url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
        break;

      case 'BINGX':
        if (environment === 'TESTNET') {
          // BingX Testnet perpetual trading page
          url = `https://testnet-futures.bingx.com/en/perpetual/${symbol}`;
        } else {
          // BingX Mainnet perpetual trading page
          url = `https://bingx.com/en/perpetual/${symbol}`;
        }
        break;

      default:
        console.warn('Unknown exchange:', exchange);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Opens the trading pair's futures page on a specific exchange platform
   * Used by arbitrage table where exchange is passed explicitly
   */
  openTradingPairForExchange(symbol: string, exchange: string, environment: string, originalSymbol?: string): void {
    let url = '';

    // Use originalSymbol for exchanges that need specific formatting (e.g., BingX uses hyphens)
    const displaySymbol = originalSymbol || symbol;

    switch (exchange) {
      case 'BYBIT':
        if (environment === 'TESTNET') {
          url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
        } else {
          url = `https://www.bybit.com/trade/usdt/${symbol}`;
        }
        break;

      case 'BINANCE':
        if (environment === 'TESTNET') {
          url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
        } else {
          url = `https://www.binance.com/en/futures/${symbol}`;
        }
        break;

      case 'OKX':
        url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
        break;

      case 'KRAKEN':
        url = `https://futures.kraken.com/trade/${symbol}`;
        break;

      case 'COINBASE':
        url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
        break;

      case 'BINGX':
        // BingX uses hyphens in their URLs (e.g., DOOD-USDT instead of DOODUSDT)
        if (environment === 'TESTNET') {
          url = `https://testnet-futures.bingx.com/en/perpetual/${displaySymbol}`;
        } else {
          url = `https://bingx.com/en/perpetual/${displaySymbol}`;
        }
        break;

      default:
        console.warn('Unknown exchange:', exchange);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
