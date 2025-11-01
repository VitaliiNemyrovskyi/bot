import { Component, OnInit, OnDestroy, ViewEncapsulation, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { PublicFundingRatesService } from '../../services/public-funding-rates.service';
import { FundingRateOpportunity } from '../../models/public-funding-rate.model';
import { IconComponent } from '../../components/ui/icon/icon.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent } from '../../components/ui/dialog/dialog.component';
import { FundingSpreadDetailsComponent } from '../../components/trading/funding-spread-details/funding-spread-details.component';
import { DropdownComponent, DropdownOption } from '../../components/ui/dropdown/dropdown.component';
import { InputComponent } from '../../components/ui/input/input.component';
import { SliderComponent } from '../../components/ui/slider/slider.component';

/**
 * Unified opportunity type that supports all strategies
 */
type UnifiedOpportunity = FundingRateOpportunity & {
  // Additional fields beyond FundingRateOpportunity
  maxFundingSpread?: number;
  maxFundingSpreadPercent?: string;
  priceSpread?: number;
  priceSpreadPercent?: string;
  priceSpreadUsdt?: string;
  combinedScore?: number;
  volatility24h?: number;
  volatility24hFormatted?: string;
  // NEW FIELDS FOR SPOT+FUTURES STRATEGY DISPLAY
  bestFundingExchange?: {
    exchange: string;
    fundingRate: number;
    nextFundingTime: number;
    currentPrice: number;
  };
  bestShortExchange?: {
    exchange: string;
    fundingRate: number;
    nextFundingTime: number;
    currentPrice: number;
  };
};

/**
 * Price Arbitrage Opportunities Component
 *
 * Displays price arbitrage opportunities with support for multiple strategies:
 * - Cross-Exchange Arbitrage (combined price spread + funding rates)
 * - Graduated Entry (Spot + Futures on same exchange)
 * Features:
 * - Real-time price and funding rate data
 * - Combined score calculation (price + funding)
 * - Strategy type filtering (Combined / Price Only / Spot + Futures / Graduated Entry)
 * - Sortable columns
 * - Auto-refresh every 30 seconds
 */
@Component({
  selector: 'app-price-arbitrage-opportunities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IconComponent,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    FundingSpreadDetailsComponent,
    DropdownComponent,
    InputComponent,
    SliderComponent,
  ],
  templateUrl: './price-arbitrage-opportunities.component.html',
  styleUrls: ['./price-arbitrage-opportunities.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PriceArbitrageOpportunitiesComponent implements OnInit, OnDestroy {
  private fundingRatesService = inject(PublicFundingRatesService);
  private router = inject(Router);

  // State
  opportunities = signal<UnifiedOpportunity[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  // Stats from API
  stats = signal<{
    totalOpportunities: number;
    combinedStrategy: number;
    priceOnly: number;
    fundingDataAvailable: boolean;
  } | null>(null);

  // Auto-refresh
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds

  // LocalStorage keys
  private readonly SELECTED_EXCHANGES_KEY = 'priceArbitrage_selectedExchanges';

  // Available exchanges
  availableExchanges = ['BINGX', 'BYBIT', 'BINANCE', 'MEXC', 'GATEIO', 'BITGET'];

  // Strategy type dropdown options
  strategyTypeOptions: DropdownOption[] = [
    { value: 'combined', label: 'Combined' },
    { value: 'price_only', label: 'Price Only' },
    { value: 'spot_futures', label: 'Spot + Futures' },
    { value: 'funding_farm', label: 'Funding Farm (Δ-Neutral)' },
  ];

  // Filters
  searchQuery = signal<string>('');
  minCombinedScore = signal<number | null>(null);
  minFundingRate = signal<number | null>(null);
  minPriceSpread = signal<number | null>(null);
  strategyTypeFilter = signal<'combined' | 'price_only' | 'funding_only' | 'spot_futures' | 'funding_farm'>('combined');
  selectedExchanges = signal<string[]>([]);

  // Sorting
  sortColumn = signal<'symbol' | 'spreadPercent' | 'fundingDifferential' | 'combinedScore' | 'expectedDailyReturn' | 'estimatedMonthlyROI' | 'volatility'>('combinedScore');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Price Only strategy filters
  filterByMaxFunding = signal<boolean>(false);
  maxFundingValue = signal<number>(0.01); // Default: 1%

  // Format slider value as percentage
  formatSliderValue = (value: number): string => {
    return this.formatPercent(value * 100, 3);
  };

  /**
   * Helper function to get strategy-specific metric value
   * Returns the appropriate metric based on the selected strategy filter
   */
  private getStrategyMetric(
    opportunity: FundingRateOpportunity,
    metric: 'combinedScore' | 'expectedDailyReturn' | 'estimatedMonthlyROI',
    strategyFilter: string
  ): number {
    // Try to get from strategyMetrics first
    if (opportunity.strategyMetrics) {
      let strategyData: { combinedScore: number; expectedDailyReturn: number; estimatedMonthlyROI: number; } | undefined;
      switch (strategyFilter) {
        case 'combined':
          strategyData = opportunity.strategyMetrics.combined;
          break;
        case 'price_only':
          strategyData = opportunity.strategyMetrics.priceOnly;
          break;
        case 'funding_only':
          strategyData = opportunity.strategyMetrics.fundingOnly;
          break;
      }

      if (strategyData && strategyData[metric] !== undefined) {
        return strategyData[metric];
      }
    }

    // Fallback to legacy fields
    const legacyValue = opportunity[metric];
    if (legacyValue !== undefined) {
      return legacyValue;
    }

    // Ultimate fallback
    return (opportunity.priceSpread || 0) * 100;
  }

  // Current time for time-since-update display
  private currentTime = signal<number>(Date.now());
  private timeUpdateInterval?: any;
  private _debugLogged = false;

  // Modal for detailed spread stability metrics
  showDetailsModal = signal<boolean>(false);
  selectedOpportunity = signal<FundingRateOpportunity | null>(null);
  loadingPhase2Metrics = signal<Set<string>>(new Set());
  phase2MetricsCache = signal<Map<string, FundingRateOpportunity>>(new Map());

  // User-selected exchange pairs for each symbol (overrides backend defaults)
  // Map<symbol, { longExchange: string, shortExchange: string }>
  selectedExchangePairs = signal<Map<string, { longExchange: string; shortExchange: string }>>(new Map());

  // Computed time since update
  timeSinceUpdate = computed(() => {
    const lastUpdate = this.lastUpdated();
    if (!lastUpdate) return '—';

    const now = this.currentTime();
    const seconds = Math.floor((now - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  });

  // Check if funding farm filter is active
  isFundingFarmMode = computed(() => {
    return this.strategyTypeFilter() === 'funding_farm';
  });

  // Check if spot+futures filter is active
  isSpotFuturesMode = computed(() => {
    return this.strategyTypeFilter() === 'spot_futures';
  });

  // Computed filtered & sorted opportunities
  filteredOpportunities = computed(() => {
    let filtered = [...this.opportunities()];

    // Filter by search query (symbol)
    const query = this.searchQuery().trim().toUpperCase();
    if (query) {
      filtered = filtered.filter(o => o.symbol.toUpperCase().includes(query));
    }

    // Filter by strategy type
    const strategyFilter = this.strategyTypeFilter();
    if (strategyFilter === 'spot_futures') {
      // For spot+futures, already filtered by loadOpportunities()
      // Keep all opportunities as they're already spot+futures type
    } else if (strategyFilter === 'funding_farm') {
      // For funding farm, show all opportunities with positive funding differential
      // (we'll compensate price difference with delta-neutral hedging)
      filtered = filtered.filter(o => o.maxFundingSpread && o.maxFundingSpread > 0);
    } else {
      // Filter by strategy: check if opportunity has applicable strategy metrics
      // Each opportunity can have multiple strategies calculated
      filtered = filtered.filter(o => {
        if (!o.strategyMetrics) {
          // Fallback to legacy strategyType if strategyMetrics not available
          return o.strategyType === strategyFilter;
        }

        // Check if opportunity has the selected strategy metrics
        switch (strategyFilter) {
          case 'combined':
            return !!o.strategyMetrics.combined;
          case 'price_only':
            return !!o.strategyMetrics.priceOnly;
          case 'funding_only':
            return !!o.strategyMetrics.fundingOnly;
          default:
            return true;
        }
      });
    }

    // Filter by selected exchanges (case-insensitive comparison)
    const exchanges = this.selectedExchanges();
    if (exchanges.length > 0 && strategyFilter !== 'spot_futures') {
      const exchangesUpper = exchanges.map(e => e.toUpperCase());
      filtered = filtered.filter(o => {
        // Type guard: check if this is a FundingRateOpportunity with bestShort/bestLong
        if ('bestShort' in o && 'bestLong' in o && o.bestShort && o.bestLong) {
          return exchangesUpper.includes(o.bestShort.exchange.toUpperCase()) &&
                 exchangesUpper.includes(o.bestLong.exchange.toUpperCase());
        }
        return false;
      });
    } else if (exchanges.length > 0 && strategyFilter === 'spot_futures') {
      // For spot+futures, filter by futures exchange (bestShort)
      const exchangesUpper = exchanges.map(e => e.toUpperCase());
      filtered = filtered.filter(o => {
        // Type guard: check if this is a spot+futures opportunity with bestShort
        if ('bestShort' in o && o.bestShort && typeof o.bestShort.exchange === 'string') {
          return exchangesUpper.includes(o.bestShort.exchange.toUpperCase());
        }
        return false;
      });
    }

    // Filter by minimum combined score
    const minScore = this.minCombinedScore();
    if (minScore !== null) {
      filtered = filtered.filter(o => {
        const score = this.getStrategyMetric(o, 'combinedScore', strategyFilter);
        return score >= minScore;
      });
    }

    // Filter by minimum funding rate (by absolute value)
    const minFunding = this.minFundingRate();
    if (minFunding !== null) {
      filtered = filtered.filter(o => {
        const fundingRate = o.maxFundingSpread ? o.maxFundingSpread * 100 : 0;
        return Math.abs(fundingRate) >= minFunding;
      });
    }

    // Filter by minimum price spread
    const minSpread = this.minPriceSpread();
    if (minSpread !== null) {
      filtered = filtered.filter(o => {
        const priceSpread = (o.priceSpread || 0) * 100;
        return priceSpread >= minSpread;
      });
    }

    // Filter by maximum funding rate (for Price Only strategy)
    // Only apply if Price Only strategy is selected AND filter is enabled
    if (strategyFilter === 'price_only' && this.filterByMaxFunding()) {
      const maxFunding = this.maxFundingValue();
      filtered = filtered.filter(o => {
        const fundingRate = Math.abs(o.maxFundingSpread || 0);
        return fundingRate <= maxFunding;
      });
    }

    // Sort
    const column = this.sortColumn();
    const direction = this.sortDirection();

    // Special handling for 'price_only' strategy: compound sorting
    if (strategyFilter === 'price_only') {
      filtered.sort((a, b) => {
        // Primary: Sort by price spread (largest first - descending)
        const aPriceSpread = (a.priceSpread || 0) * 100;
        const bPriceSpread = (b.priceSpread || 0) * 100;

        if (Math.abs(aPriceSpread - bPriceSpread) > 0.001) {
          return bPriceSpread - aPriceSpread; // Descending (largest first)
        }

        // Secondary: Sort by funding rates (minimal first - ascending by absolute value)
        const aFunding = Math.abs(a.maxFundingSpread || 0) * 100;
        const bFunding = Math.abs(b.maxFundingSpread || 0) * 100;
        return aFunding - bFunding; // Ascending (minimal first)
      });
    } else {
      // Existing sorting logic for other strategies
      filtered.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (column) {
          case 'symbol':
            return direction === 'asc'
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol);

          case 'spreadPercent':
            aValue = (a.priceSpread || 0) * 100;
            bValue = (b.priceSpread || 0) * 100;
            break;

          case 'fundingDifferential':
            aValue = (a.maxFundingSpread ?? 0) * 100;
            bValue = (b.maxFundingSpread ?? 0) * 100;
            break;

          case 'combinedScore':
            aValue = this.getStrategyMetric(a, 'combinedScore', strategyFilter);
            bValue = this.getStrategyMetric(b, 'combinedScore', strategyFilter);
            break;

          case 'expectedDailyReturn':
            aValue = this.getStrategyMetric(a, 'expectedDailyReturn', strategyFilter);
            bValue = this.getStrategyMetric(b, 'expectedDailyReturn', strategyFilter);
            break;

          case 'estimatedMonthlyROI':
            aValue = this.getStrategyMetric(a, 'estimatedMonthlyROI', strategyFilter);
            bValue = this.getStrategyMetric(b, 'estimatedMonthlyROI', strategyFilter);
            break;

          case 'volatility':
            aValue = a.volatility24h ?? 0;
            bValue = b.volatility24h ?? 0;
            break;

          default:
            aValue = 0;
            bValue = 0;
        }

        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  });

  ngOnInit(): void {
    // Load saved exchange filters from localStorage
    this.loadSavedExchangeFilters();

    // Start time update interval
    this.timeUpdateInterval = setInterval(() => {
      const now = Date.now();
      this.currentTime.set(now);
      // DEBUG: Log every 10 seconds to check if time is correct
      if (now % 10000 < 1000) {
        console.error('[DEBUG currentTime]', {
          now,
          nowUTC: new Date(now).toISOString(),
          nowLocal: new Date(now).toString()
        });
      }
    }, 1000);

    // Initial load
    this.loadOpportunities();

    // Setup auto-refresh
    this.refreshSubscription = interval(this.REFRESH_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.loadOpportunities();
          return [];
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  /**
   * Load arbitrage opportunities from public APIs (with combined strategy metrics)
   */
  loadOpportunities(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const strategyFilter = this.strategyTypeFilter();

    if (strategyFilter === 'spot_futures') {
      // Load spot + futures opportunities (filter for positive funding only)
      this.fundingRatesService.getFundingRatesOpportunities().subscribe({
        next: (allOpportunities: FundingRateOpportunity[]) => {
          // Filter: only show coins with positive funding rate on at least one exchange
          const spotFuturesOpportunities = allOpportunities
            .map((opp: FundingRateOpportunity) => {
              // Find exchange with highest positive funding rate
              const positiveFundingExchanges = opp.exchanges.filter((ex: any) => {
                const rate = parseFloat(ex.fundingRate);
                return rate > 0;
              });

              if (positiveFundingExchanges.length === 0) {
                return null; // Skip coins without positive funding
              }

              // Sort by funding rate (highest first)
              const bestFutures = positiveFundingExchanges.sort((a: any, b: any) =>
                parseFloat(b.fundingRate) - parseFloat(a.fundingRate)
              )[0];

              return {
                ...opp,
                strategyType: 'spot_futures' as const,
                bestShort: bestFutures, // Best exchange for SHORT (highest funding)
                // TODO: Add bestLong for SPOT (lowest price) when spot prices available
              };
            })
            .filter(opp => opp !== null) as UnifiedOpportunity[];

          this.opportunities.set(spotFuturesOpportunities);
          this.error.set(null);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: (err: any) => {
          this.error.set('Failed to load spot+futures opportunities: ' + err.message);
          this.isLoading.set(false);
        },
      });
    } else {
      // Load cross-exchange opportunities (existing behavior)
      this.fundingRatesService.getFundingRatesOpportunities().subscribe({
        next: (opportunities: FundingRateOpportunity[]) => {
          this.opportunities.set(opportunities as UnifiedOpportunity[]);
          this.error.set(null);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: (err: any) => {
          this.error.set('Failed to load opportunities: ' + err.message);
          this.isLoading.set(false);
        },
      });
    }
  }

  /**
   * Set sorting column
   */
  setSortColumn(column: 'symbol' | 'spreadPercent' | 'fundingDifferential' | 'combinedScore' | 'expectedDailyReturn' | 'estimatedMonthlyROI' | 'volatility'): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  /**
   * Format percentage for display
   */
  formatPercent(value: number | undefined, decimals = 2): string {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format funding rate for display (convert from decimal to %)
   * Now shows NORMALIZED rate (per 8h) for fair comparison
   */
  formatFundingRate(rate: string | undefined): string {
    if (rate === undefined || rate === null) return '—';
    const rateNum = parseFloat(rate);
    return (rateNum * 100).toFixed(4) + '%';
  }

  /**
   * Format NORMALIZED funding rate from ExchangeFundingRate object
   * Shows the normalized rate (per 8h) for fair comparison across exchanges
   */
  formatNormalizedFundingRate(exchange: any): string {
    if (!exchange) return '—';

    // Use normalized rate if available, otherwise fall back to original
    const rate = exchange.fundingRateNormalized !== undefined
      ? exchange.fundingRateNormalized
      : parseFloat(exchange.fundingRate);

    return (rate * 100).toFixed(4) + '%';
  }

  /**
   * Get strategy type badge class
   */
  getStrategyBadgeClass(strategyType: string): string {
    switch (strategyType) {
      case 'combined':
        return 'badge-combined';
      case 'price_only':
        return 'badge-price-only';
      case 'funding_only':
        return 'badge-funding-only';
      default:
        return 'badge-default';
    }
  }

  /**
   * Get strategy type display text
   */
  getStrategyTypeText(strategyType: string): string {
    switch (strategyType) {
      case 'combined':
        return 'Combined';
      case 'price_only':
        return 'Price Only';
      case 'funding_only':
        return 'Funding Only';
      case 'spot_futures':
        return 'Spot+Futures';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get time to funding for graduated entry opportunity
   */
  getSpotFuturesTimeToFunding(nextFundingTime: Date | number): string {
    const now = this.currentTime();
    // Handle both Date objects and timestamps
    const fundingTime = typeof nextFundingTime === 'number'
      ? nextFundingTime
      : (typeof nextFundingTime === 'string' ? new Date(nextFundingTime).getTime() : nextFundingTime.getTime());
    const diff = fundingTime - now;

    // DEBUG
    if (!this._debugLogged) {
      this._debugLogged = true;
      console.error('[DEBUG getSpotFuturesTimeToFunding]', {
        nextFundingTime,
        nextFundingTimeType: typeof nextFundingTime,
        fundingTime,
        fundingTimeUTC: new Date(fundingTime).toISOString(),
        now,
        nowUTC: new Date(now).toISOString(),
        diff,
        diffMinutes: Math.floor(diff / (1000 * 60))
      });
    }

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format time to funding with interval for graduated entry
   */
  formatSpotFuturesFundingTime(nextFundingTime: Date | number, fundingInterval: number): string {
    const timeToFunding = this.getSpotFuturesTimeToFunding(nextFundingTime);
    return `${timeToFunding} / ${fundingInterval}h`;
  }

  /**
   * Type guard: check if opportunity has spot_futures strategy
   */
  isSpotFuturesStrategy(opp: UnifiedOpportunity): boolean {
    return opp.strategyType === 'spot_futures';
  }

  /**
   * Cast to FundingRateOpportunity for template use
   */
  asFundingRateOpportunity(opp: UnifiedOpportunity): FundingRateOpportunity {
    return opp;
  }

  /**
   * Cast to UnifiedOpportunity with spot_futures strategy for template use
   */
  asSpotFuturesOpportunity(opp: UnifiedOpportunity): UnifiedOpportunity | null {
    return this.isSpotFuturesStrategy(opp) ? opp : null;
  }

  /**
   * Parse funding rate string to number for display
   */
  parseFundingRateToNumber(rate: string | undefined): number {
    if (!rate) return 0;
    return parseFloat(rate) * 100; // Convert decimal to percentage
  }

  /**
   * Convert timestamp to Date and format funding time with interval
   */
  formatFundingTimeFromTimestamp(timestamp: number, intervalStr: string | undefined): string {
    const intervalNum = intervalStr ? parseInt(intervalStr) : 8; // Default to 8h
    return this.formatSpotFuturesFundingTime(timestamp, intervalNum);
  }

  /**
   * Refresh opportunities manually
   */
  refresh(): void {
    this.loadOpportunities();
  }

  /**
   * Handle strategy type change
   */
  onStrategyTypeChange(value: 'combined' | 'price_only' | 'spot_futures' | 'funding_farm'): void {
    this.strategyTypeFilter.set(value);
    this.loadOpportunities();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery.set('');
    this.minCombinedScore.set(null);
    this.minFundingRate.set(null);
    this.minPriceSpread.set(null);
    this.strategyTypeFilter.set('combined');
    this.selectedExchanges.set([...this.availableExchanges]); // Select all exchanges
    this.filterByMaxFunding.set(false); // Clear Price Only filters
    this.maxFundingValue.set(0.01); // Reset to default 1%
    this.saveExchangeFilters(); // Save cleared state to localStorage
  }

  /**
   * Load saved exchange filters from localStorage
   */
  private loadSavedExchangeFilters(): void {
    try {
      const saved = localStorage.getItem(this.SELECTED_EXCHANGES_KEY);
      if (saved) {
        const exchanges = JSON.parse(saved) as string[];
        // Validate that saved exchanges are still in availableExchanges
        const validExchanges = exchanges.filter(ex => this.availableExchanges.includes(ex));
        this.selectedExchanges.set(validExchanges);
      } else {
        // Default: select all exchanges on first load
        this.selectedExchanges.set([...this.availableExchanges]);
      }
    } catch (error) {
      console.error('Failed to load saved exchange filters:', error);
      // On error, default to all exchanges
      this.selectedExchanges.set([...this.availableExchanges]);
    }
  }

  /**
   * Save exchange filters to localStorage
   */
  private saveExchangeFilters(): void {
    try {
      localStorage.setItem(this.SELECTED_EXCHANGES_KEY, JSON.stringify(this.selectedExchanges()));
    } catch (error) {
      console.error('Failed to save exchange filters:', error);
    }
  }

  /**
   * Toggle exchange selection
   */
  toggleExchange(exchange: string): void {
    const current = this.selectedExchanges();
    if (current.includes(exchange)) {
      this.selectedExchanges.set(current.filter(e => e !== exchange));
    } else {
      this.selectedExchanges.set([...current, exchange]);
    }
    this.saveExchangeFilters();
  }

  /**
   * Check if exchange is selected
   */
  isExchangeSelected(exchange: string): boolean {
    return this.selectedExchanges().includes(exchange);
  }

  /**
   * Select all exchanges
   */
  selectAllExchanges(): void {
    this.selectedExchanges.set([...this.availableExchanges]);
    this.saveExchangeFilters();
  }

  /**
   * Deselect all exchanges
   */
  deselectAllExchanges(): void {
    this.selectedExchanges.set([]);
    this.saveExchangeFilters();
  }

  /**
   * Get funding spread color class
   */
  getFundingSpreadColorClass(spread: number | undefined): string {
    if (!spread) return 'text-gray-600';
    if (spread >= 0.001) return 'text-green-600';
    if (spread >= 0.0005) return 'text-yellow-600';
    return 'text-gray-600';
  }

  /**
   * Get funding rate color class
   */
  getFundingRateColorClass(rate: string | undefined): string {
    if (!rate) return '';
    const numRate = parseFloat(rate);
    if (numRate > 0) return 'positive';
    if (numRate < 0) return 'negative';
    return '';
  }

  /**
   * Get spot price for an opportunity
   */
  getSpotPrice(opp: UnifiedOpportunity): number | null {
    if (!opp.bestLong || !opp.bestLong.lastPrice) {
      return null;
    }

    if (this.isSpotFuturesStrategy(opp)) {
      // For spot_futures strategy: return bestLong price (lowest spot price)
      // TODO: Implement actual spot prices when available
      return parseFloat(opp.bestLong.lastPrice);
    } else if (!this.isSpotFuturesStrategy(opp)) {
      // For cross-exchange, the lower price is considered "spot"
      return parseFloat(opp.bestLong.lastPrice);
    }
    return null;
  }

  /**
   * Get futures price for an opportunity
   */
  getFuturesPrice(opp: UnifiedOpportunity): number | null {
    if (!opp.bestShort || !opp.bestShort.lastPrice) {
      return null;
    }

    if (this.isSpotFuturesStrategy(opp)) {
      // For spot_futures strategy: return bestShort price (futures with highest funding)
      return parseFloat(opp.bestShort.lastPrice);
    } else if (!this.isSpotFuturesStrategy(opp)) {
      // For cross-exchange, the higher price is considered "futures"
      return parseFloat(opp.bestShort.lastPrice);
    }
    return null;
  }

  /**
   * Get price spread with direction indicator
   * Returns object with spread value, percentage, and indicator
   */
  getPriceSpreadInfo(opp: UnifiedOpportunity): {
    spread: number;
    spreadPercent: number;
    spreadUsdt: number;
    isFavorable: boolean;
    indicator: string;
    colorClass: string;
  } {
    const spotPrice = this.getSpotPrice(opp);
    const futuresPrice = this.getFuturesPrice(opp);

    if (!spotPrice || !futuresPrice) {
      return {
        spread: 0,
        spreadPercent: 0,
        spreadUsdt: 0,
        isFavorable: false,
        indicator: '⚪',
        colorClass: 'neutral'
      };
    }

    const spreadUsdt = futuresPrice - spotPrice;
    const spreadPercent = (spreadUsdt / spotPrice) * 100;

    // Price spread between Best Long (buy) and Best Short (sell) exchanges
    // spotPrice = bestLong.lastPrice (where we BUY - lower price)
    // futuresPrice = bestShort.lastPrice (where we SELL - higher price)
    //
    // FAVORABLE: futuresPrice > spotPrice (selling HIGH, buying LOW = profit)
    // UNFAVORABLE: spotPrice > futuresPrice (would be buying HIGH, selling LOW = loss)
    //
    // Larger POSITIVE spread = more profit opportunity
    const isFavorable = futuresPrice > spotPrice; // SELL price > BUY price is favorable

    return {
      spread: opp.priceSpread || 0,
      spreadPercent,
      spreadUsdt,
      isFavorable,
      indicator: isFavorable ? '🟢' : '🔴',
      colorClass: isFavorable ? 'favorable' : 'unfavorable'
    };
  }

  /**
   * Format price for display
   */
  formatPrice(price: number | null): string {
    if (price === null || price === undefined) return '—';

    // For very large prices (> 1000), show 2 decimals
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // For medium prices (10-1000), show 2-4 decimals
    if (price >= 10) {
      return `$${price.toFixed(2)}`;
    }

    // For small prices (< 10), show up to 6 decimals
    return `$${price.toFixed(6)}`;
  }

  /**
   * Get exchange label for spot/futures display
   */
  getExchangeLabel(opp: UnifiedOpportunity, type: 'spot' | 'futures'): string {
    if (this.isSpotFuturesStrategy(opp)) {
      // For spot_futures: bestShort has the futures exchange (highest funding)
      // TODO: bestLong should have the spot exchange (lowest price) when implemented
      return type === 'futures'
        ? (opp.bestShort?.exchange || '—')
        : (opp.bestLong?.exchange || '—');
    } else if (!this.isSpotFuturesStrategy(opp)) {
      return type === 'spot' ? opp.bestLong.exchange : opp.bestShort.exchange;
    }
    return '—';
  }

  /**
   * Calculate delta-neutral hedge ratio for funding farm strategy
   * Returns the ratio of long position size to short position size
   */
  calculateHedgeRatio(opportunity: UnifiedOpportunity): number {
    // Type guard: only calculate for FundingRateOpportunity
    if ('bestLong' in opportunity && 'bestShort' in opportunity && opportunity.bestLong && opportunity.bestShort) {
      const longPrice = parseFloat(opportunity.bestLong.lastPrice);
      const shortPrice = parseFloat(opportunity.bestShort.lastPrice);

      if (longPrice === 0 || shortPrice === 0) return 1;

      // To be delta-neutral: Long value = Short value
      // If Short price is higher, we need MORE long contracts
      return shortPrice / longPrice;
    }
    return 1;
  }

  /**
   * Format hedge ratio for display
   */
  formatHedgeRatio(opportunity: UnifiedOpportunity): string {
    const ratio = this.calculateHedgeRatio(opportunity);
    return ratio.toFixed(4);
  }

  /**
   * Calculate time to funding for a specific exchange
   * Uses currentTime signal to avoid NG0100
   */
  getTimeToFunding(exchange: { nextFundingTime: number }): string {
    const now = this.currentTime();
    const diff = exchange.nextFundingTime - now;

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format time to funding with interval like "2h 15m / 8h"
   * Uses fundingInterval from exchange if available, otherwise estimates it
   * Uses currentTime signal to avoid NG0100
   */
  formatTimeToFundingWithInterval(exchange: { nextFundingTime: number; fundingInterval?: string }): string {
    const timeToFunding = this.getTimeToFunding(exchange);

    // Use provided funding interval if available
    if (exchange.fundingInterval) {
      return `${timeToFunding} / ${exchange.fundingInterval}`;
    }

    // Fallback: estimate interval based on time until next funding
    const now = this.currentTime();
    const timeUntilFunding = exchange.nextFundingTime - now;

    let interval = '8h'; // Default
    if (timeUntilFunding > 0) {
      if (timeUntilFunding <= 60 * 60 * 1000) {
        interval = '1h';
      } else if (timeUntilFunding <= 4 * 60 * 60 * 1000) {
        interval = '4h';
      }
    }

    return `${timeToFunding} / ${interval}`;
  }

  /**
   * Start arbitrage position - navigate to arbitrage chart page
   */
  startPosition(opportunity: UnifiedOpportunity): void {
    console.log('[PriceArbitrageOpportunities] Starting position for:', opportunity.symbol);

    // Determine strategy type based on current filter
    const strategy = this.strategyTypeFilter();

    if (strategy === 'spot_futures') {
      // For spot_futures strategy (spot + futures)
      // Navigate with spot_futures strategy parameter
      const graduatedOpp = opportunity as UnifiedOpportunity & { strategyType: 'spot_futures' };
      // Use bestShort exchange (highest funding rate) for futures
      const futuresExchange = graduatedOpp.bestShort?.exchange || '';
      const spotExchange = graduatedOpp.bestLong?.exchange || futuresExchange; // TODO: use actual spot exchange
      this.router.navigate([
        '/arbitrage/chart',
        graduatedOpp.symbol,
        spotExchange,
        futuresExchange,
        'spot_futures' // Use spot_futures strategy for graduated entry
      ]);
    } else {
      // For cross-exchange arbitrage
      // Use effective exchanges (respects user's dropdown selection)
      const longExchange = this.getEffectiveLongExchange(opportunity);
      const shortExchange = this.getEffectiveShortExchange(opportunity);

      // Navigate to arbitrage chart with symbol, exchanges, and strategy
      // Format: /arbitrage/chart/:symbol/:longExchange/:shortExchange/:strategy
      this.router.navigate([
        '/arbitrage/chart',
        opportunity.symbol,
        longExchange.exchange,
        shortExchange.exchange,
        strategy
      ]);

      console.log(`[PriceArbitrageOpportunities] Navigating with: ${longExchange.exchange} (LONG) / ${shortExchange.exchange} (SHORT)`);
    }
  }

  /**
   * Open details modal for displaying spread stability metrics
   * Triggers loading of historical stability metrics
   */
  openDetailsModal(opp: UnifiedOpportunity): void {
    // Only open modal for cross-exchange opportunities
    if ('bestShort' in opp && 'bestLong' in opp) {
      this.selectedOpportunity.set(opp as FundingRateOpportunity);
      this.showDetailsModal.set(true);
      // Trigger Phase 2 load
      this.loadPhase2MetricsForSymbol(opp.symbol);
    }
  }

  /**
   * Close details modal
   */
  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    // Don't clear selectedOpportunity immediately to avoid flicker during close animation
    setTimeout(() => {
      if (!this.showDetailsModal()) {
        this.selectedOpportunity.set(null);
      }
    }, 300);
  }

  /**
   * Load Phase 2 historical stability metrics for a symbol
   * Fetches historical funding rates and calculates stability metrics
   */
  async loadPhase2MetricsForSymbol(symbol: string): Promise<void> {
    // Check cache
    if (this.phase2MetricsCache().has(symbol)) {
      // Data already loaded
      return;
    }

    // Find opportunity
    const opp = this.filteredOpportunities().find(o => o.symbol === symbol);
    if (!opp) return;

    // Only load for FundingRateOpportunity (not SpotFutures)
    if (this.isSpotFuturesStrategy(opp)) return;

    // Set loading
    const loading = new Set(this.loadingPhase2Metrics());
    loading.add(symbol);
    this.loadingPhase2Metrics.set(loading);

    try {
      // Load metrics via service
      const updated = await this.fundingRatesService.loadPhase2Metrics(opp);

      // Update cache
      const cache = new Map(this.phase2MetricsCache());
      cache.set(symbol, updated);
      this.phase2MetricsCache.set(cache);
    } catch (error) {
      console.error('[Phase 2] Load failed:', error);
    } finally {
      // Clear loading
      const loading = new Set(this.loadingPhase2Metrics());
      loading.delete(symbol);
      this.loadingPhase2Metrics.set(loading);
    }
  }

  /**
   * Check if Phase 2 metrics are currently loading for a symbol
   * Used to show loading spinner in UI
   */
  isLoadingPhase2(symbol: string): boolean {
    return this.loadingPhase2Metrics().has(symbol);
  }

  /**
   * Get Phase 2 metrics from cache
   * Returns cached metrics or undefined if not loaded
   */
  getPhase2Metrics(symbol: string): FundingRateOpportunity | undefined {
    return this.phase2MetricsCache().get(symbol);
  }

  /**
   * Map FundingRateOpportunity to format expected by FundingSpreadDetailsComponent
   */
  mapToDetailsOpportunity(opp: FundingRateOpportunity): any {
    // Get Phase 2 metrics if available
    const metrics = this.phase2MetricsCache().get(opp.symbol);
    const spreadHistory7d = metrics?.spreadHistory7d;
    const spreadHistory30d = metrics?.spreadHistory30d;

    return {
      symbol: opp.symbol,
      spread: opp.maxFundingSpread,
      spreadPercentage: Math.abs((opp.maxFundingSpread || 0) * 100),
      bestLongExchange: opp.bestLong.exchange,
      bestShortExchange: opp.bestShort.exchange,
      longFundingRate: parseFloat(opp.bestLong.fundingRate || '0'),
      shortFundingRate: parseFloat(opp.bestShort.fundingRate || '0'),
      currentPrice: parseFloat(opp.bestLong.lastPrice),
      volume24h: opp.volume24h,
      metrics: {
        historicalStability: spreadHistory7d?.stabilityScore ? spreadHistory7d.stabilityScore / 100 : 0.5,
        avgSpread7d: spreadHistory7d?.average || 0,
        avgSpread30d: spreadHistory30d?.average || 0,
        spreadVolatility: spreadHistory7d?.standardDeviation || 0,
        trendDirection: metrics?.spreadStabilityTrend === 'improving' ? 'increasing' :
                       metrics?.spreadStabilityTrend === 'declining' ? 'decreasing' : 'stable'
      }
    };
  }

  /**
   * Format funding rate as percentage
   */
  formatFundingRatePercent(rate: number | undefined): string {
    if (rate === undefined || rate === null) return '—';
    return `${(rate * 100).toFixed(4)}%`;
  }

  /**
   * Get funding rate color class
   */
  getFundingRateColorClassFromNumber(rate: number | undefined): string {
    if (rate === undefined || rate === null) return '';
    if (rate > 0) return 'positive';
    if (rate < 0) return 'negative';
    return '';
  }

  /**
   * Format time to next funding with interval
   */
  formatTimeToNextFunding(nextFundingTime: number | undefined): string {
    if (!nextFundingTime) return '—';

    const now = this.currentTime();
    const diff = nextFundingTime - now;

    // DEBUG: Log first call to see values
    if (!this._debugLogged) {
      this._debugLogged = true;
      console.error('[DEBUG formatTimeToNextFunding]', {
        nextFundingTime,
        nextFundingTimeType: typeof nextFundingTime,
        nextFundingTimeUTC: new Date(nextFundingTime).toISOString(),
        now,
        nowUTC: new Date(now).toISOString(),
        diff,
        diffMinutes: Math.floor(diff / (1000 * 60))
      });
    }

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate interval dynamically based on time until next funding
    let interval = '8h'; // Default
    if (diff > 0) {
      if (diff <= 1 * 60 * 60 * 1000) {
        interval = '1h';
      } else if (diff <= 4 * 60 * 60 * 1000) {
        interval = '4h';
      }
    }

    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    return `${timeStr} / ${interval}`;
  }

  /**
   * Get effective long exchange for a symbol (user selection or backend default)
   */
  getEffectiveLongExchange(opp: UnifiedOpportunity): any {
    const fundingOpp = this.asFundingRateOpportunity(opp);
    if (!fundingOpp) return null;

    const selectedPair = this.selectedExchangePairs().get(opp.symbol);
    if (selectedPair) {
      // Find the selected exchange in exchanges array
      return fundingOpp.exchanges.find(e => e.exchange === selectedPair.longExchange) || fundingOpp.bestLong;
    }
    return fundingOpp.bestLong;
  }

  /**
   * Get effective short exchange for a symbol (user selection or backend default)
   */
  getEffectiveShortExchange(opp: UnifiedOpportunity): any {
    const fundingOpp = this.asFundingRateOpportunity(opp);
    if (!fundingOpp) return null;

    const selectedPair = this.selectedExchangePairs().get(opp.symbol);
    if (selectedPair) {
      // Find the selected exchange in exchanges array
      return fundingOpp.exchanges.find(e => e.exchange === selectedPair.shortExchange) || fundingOpp.bestShort;
    }
    return fundingOpp.bestShort;
  }

  /**
   * Get available exchanges for long position (sorted by normalized funding rate - lowest first)
   */
  getAvailableExchangesForLong(opp: UnifiedOpportunity): any[] {
    const fundingOpp = this.asFundingRateOpportunity(opp);
    if (!fundingOpp || !fundingOpp.exchanges) return [];

    // Sort by normalized rate (lowest first) - best for LONG position
    return [...fundingOpp.exchanges].sort((a, b) => {
      const rateA = a.fundingRateNormalized !== undefined ? a.fundingRateNormalized : parseFloat(a.fundingRate);
      const rateB = b.fundingRateNormalized !== undefined ? b.fundingRateNormalized : parseFloat(b.fundingRate);
      return rateA - rateB;
    });
  }

  /**
   * Get available exchanges for short position (sorted by normalized funding rate - highest first)
   */
  getAvailableExchangesForShort(opp: UnifiedOpportunity): any[] {
    const fundingOpp = this.asFundingRateOpportunity(opp);
    if (!fundingOpp || !fundingOpp.exchanges) return [];

    // Sort by normalized rate (highest first) - best for SHORT position
    return [...fundingOpp.exchanges].sort((a, b) => {
      const rateA = a.fundingRateNormalized !== undefined ? a.fundingRateNormalized : parseFloat(a.fundingRate);
      const rateB = b.fundingRateNormalized !== undefined ? b.fundingRateNormalized : parseFloat(b.fundingRate);
      return rateB - rateA;
    });
  }

  /**
   * Get dropdown options for long exchanges
   */
  getLongExchangeOptions(opp: UnifiedOpportunity): DropdownOption[] {
    const exchanges = this.getAvailableExchangesForLong(opp);
    return exchanges.map(ex => ({
      value: ex.exchange,
      label: `<span class="exchange">${ex.exchange}</span> (${this.formatFundingRate(ex.fundingRate)} | ${ex.fundingInterval || '8h'})`
    }));
  }

  /**
   * Get dropdown options for short exchanges
   */
  getShortExchangeOptions(opp: UnifiedOpportunity): DropdownOption[] {
    const exchanges = this.getAvailableExchangesForShort(opp);
    return exchanges.map(ex => ({
      value: ex.exchange,
      label: `<span class="exchange">${ex.exchange}</span> (${this.formatFundingRate(ex.fundingRate)} | ${ex.fundingInterval || '8h'})`
    }));
  }

  /**
   * Handle exchange selection change
   */
  onExchangeChange(symbol: string, type: 'long' | 'short', newExchange: string): void {
    const currentPairs = this.selectedExchangePairs();
    const currentPair = currentPairs.get(symbol);

    const newPair = {
      longExchange: type === 'long' ? newExchange : (currentPair?.longExchange || ''),
      shortExchange: type === 'short' ? newExchange : (currentPair?.shortExchange || '')
    };

    // Update the map
    const updatedPairs = new Map(currentPairs);
    updatedPairs.set(symbol, newPair);
    this.selectedExchangePairs.set(updatedPairs);

    console.log(`[ExchangeSelection] ${symbol}: ${type} changed to ${newExchange}`, newPair);
  }

  /**
   * Get recalculated metrics for custom exchange pair
   * Returns formatted metrics for display
   */
  getRecalculatedMetrics(opp: UnifiedOpportunity): {
    fundingSpread: string;
    fundingSpreadPercent: string;
    estimatedAPR: string;
    netAPR: string;
    combinedScore: number;
    dailyReturn: number;
    monthlyROI: number;
  } | null {
    const longExchange = this.getEffectiveLongExchange(opp);
    const shortExchange = this.getEffectiveShortExchange(opp);

    if (!longExchange || !shortExchange) return null;

    // Calculate funding spread using normalized rates
    const longRate = longExchange.fundingRateNormalized !== undefined
      ? longExchange.fundingRateNormalized
      : parseFloat(longExchange.fundingRate);

    const shortRate = shortExchange.fundingRateNormalized !== undefined
      ? shortExchange.fundingRateNormalized
      : parseFloat(shortExchange.fundingRate);

    const fundingSpread = shortRate - longRate;
    const fundingSpreadPercent = (fundingSpread * 100).toFixed(4);

    // Estimated APR (gross)
    const fundingPeriodsPerYear = 3 * 365; // 8h intervals (normalized)
    const estimatedAPR = fundingSpread * fundingPeriodsPerYear;
    const estimatedAPRFormatted = (estimatedAPR * 100).toFixed(2) + '%';

    // Total Fees
    const totalFees = this.calculateTotalFees(longExchange.exchange, shortExchange.exchange);

    // Net APR
    const annualFees = totalFees * 3 * 365;
    const netAPR = estimatedAPR - annualFees;
    const netAPRFormatted = (netAPR * 100).toFixed(2) + '%';

    // Combined Score (price spread + funding spread for 7 days)
    const priceSpread = opp.priceSpread || 0;
    const fundingFor7Days = fundingSpread * 3 * 7; // 3 funding periods per day * 7 days
    const combinedScore = (priceSpread + fundingFor7Days) * 100;

    // Daily Return (funding * 3 periods per day)
    const dailyReturn = fundingSpread * 3 * 100;

    // Monthly ROI (price spread + funding for 30 days)
    const fundingFor30Days = fundingSpread * 3 * 30;
    const monthlyROI = (priceSpread + fundingFor30Days) * 100;

    return {
      fundingSpread: fundingSpread.toFixed(6),
      fundingSpreadPercent: fundingSpreadPercent + '%',
      estimatedAPR: estimatedAPRFormatted,
      netAPR: netAPRFormatted,
      combinedScore,
      dailyReturn,
      monthlyROI
    };
  }

  /**
   * Calculate total trading fees for arbitrage (4 trades total)
   */
  private calculateTotalFees(longExchange: string, shortExchange: string): number {
    const EXCHANGE_FEES: Record<string, number> = {
      'BYBIT': 0.055,
      'BINANCE': 0.04,
      'BINGX': 0.045,
      'MEXC': 0.02,
      'GATEIO': 0.05,
      'BITGET': 0.04,
      'OKX': 0.05,
    };

    const longFee = EXCHANGE_FEES[longExchange] || 0.055;
    const shortFee = EXCHANGE_FEES[shortExchange] || 0.055;

    // 4 trades: open long, open short, close long, close short
    return (longFee + shortFee) * 2 / 100; // Convert from percentage to decimal
  }
}
