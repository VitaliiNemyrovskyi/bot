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

/**
 * Price Arbitrage Opportunities Component
 *
 * Displays price arbitrage opportunities with combined strategy metrics (price spread + funding rates).
 * Features:
 * - Real-time price and funding rate data
 * - Combined score calculation (price + funding)
 * - Strategy type filtering (Combined / Price Only / Spot + Futures)
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
  ],
  templateUrl: './price-arbitrage-opportunities.component.html',
  styleUrls: ['./price-arbitrage-opportunities.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PriceArbitrageOpportunitiesComponent implements OnInit, OnDestroy {
  private fundingRatesService = inject(PublicFundingRatesService);
  private router = inject(Router);

  // State
  opportunities = signal<FundingRateOpportunity[]>([]);
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

  // Filters
  searchQuery = signal<string>('');
  minCombinedScore = signal<number | null>(null);
  strategyTypeFilter = signal<'combined' | 'price_only' | 'spot_futures' | 'funding_farm'>('combined');
  selectedExchanges = signal<string[]>([]);

  // Sorting
  sortColumn = signal<'symbol' | 'spreadPercent' | 'fundingDifferential' | 'combinedScore' | 'expectedDailyReturn' | 'estimatedMonthlyROI' | 'volatility'>('combinedScore');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Current time for time-since-update display
  private currentTime = signal<number>(Date.now());
  private timeUpdateInterval?: any;

  // Modal for detailed spread stability metrics
  showDetailsModal = signal<boolean>(false);
  selectedOpportunity = signal<FundingRateOpportunity | null>(null);
  loadingPhase2Metrics = signal<Set<string>>(new Set());
  phase2MetricsCache = signal<Map<string, FundingRateOpportunity>>(new Map());

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

  // Check if spot-futures filter is active
  isSpotFuturesMode = computed(() => {
    return this.strategyTypeFilter() === 'spot_futures';
  });

  // Check if funding farm filter is active
  isFundingFarmMode = computed(() => {
    return this.strategyTypeFilter() === 'funding_farm';
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
      // For spot-futures, show opportunities where recommendedStrategy is 'spot-futures'
      filtered = filtered.filter(o => o.recommendedStrategy === 'spot-futures');
    } else if (strategyFilter === 'funding_farm') {
      // For funding farm, show all opportunities with positive funding differential
      // (we'll compensate price difference with delta-neutral hedging)
      filtered = filtered.filter(o => o.maxFundingSpread && o.maxFundingSpread > 0);
    } else {
      filtered = filtered.filter(o => o.strategyType === strategyFilter);
    }

    // Filter by selected exchanges (case-insensitive comparison)
    const exchanges = this.selectedExchanges();
    if (exchanges.length > 0) {
      const exchangesUpper = exchanges.map(e => e.toUpperCase());
      filtered = filtered.filter(o =>
        exchangesUpper.includes(o.bestShort.exchange.toUpperCase()) &&
        exchangesUpper.includes(o.bestLong.exchange.toUpperCase())
      );
    }

    // Filter by minimum combined score
    const minScore = this.minCombinedScore();
    if (minScore !== null) {
      filtered = filtered.filter(o => {
        const score = o.combinedScore !== undefined ? o.combinedScore : (o.priceSpread * 100);
        return score >= minScore;
      });
    }

    // Sort
    const column = this.sortColumn();
    const direction = this.sortDirection();

    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (column) {
        case 'symbol':
          return direction === 'asc'
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);

        case 'spreadPercent':
          aValue = a.priceSpread * 100;
          bValue = b.priceSpread * 100;
          break;

        case 'fundingDifferential':
          aValue = (a.maxFundingSpread ?? 0) * 100;
          bValue = (b.maxFundingSpread ?? 0) * 100;
          break;

        case 'combinedScore':
          aValue = a.combinedScore ?? (a.priceSpread * 100);
          bValue = b.combinedScore ?? (b.priceSpread * 100);
          break;

        case 'expectedDailyReturn':
          aValue = a.expectedDailyReturn ?? (a.priceSpread * 100);
          bValue = b.expectedDailyReturn ?? (b.priceSpread * 100);
          break;

        case 'estimatedMonthlyROI':
          aValue = a.estimatedMonthlyROI ?? (a.priceSpread * 100);
          bValue = b.estimatedMonthlyROI ?? (b.priceSpread * 100);
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

    return filtered;
  });

  ngOnInit(): void {
    // Load saved exchange filters from localStorage
    this.loadSavedExchangeFilters();

    // Start time update interval
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime.set(Date.now());
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
   * Uses PublicFundingRatesService which fetches data directly from exchange public APIs
   */
  loadOpportunities(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.fundingRatesService.getFundingRatesOpportunities().subscribe({
      next: (opportunities) => {
        this.opportunities.set(opportunities);
        this.error.set(null);
        this.isLoading.set(false);
        this.lastUpdated.set(new Date());
      },
      error: (err) => {
        this.error.set('Failed to load opportunities: ' + err.message);
        this.isLoading.set(false);
      },
    });
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
  formatPercent(value: number | undefined, decimals: number = 2): string {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format funding rate for display (convert from decimal to %)
   */
  formatFundingRate(rate: string | undefined): string {
    if (rate === undefined || rate === null) return '—';
    const rateNum = parseFloat(rate);
    return (rateNum * 100).toFixed(4) + '%';
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
      default:
        return 'Unknown';
    }
  }

  /**
   * Refresh opportunities manually
   */
  refresh(): void {
    this.loadOpportunities();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery.set('');
    this.minCombinedScore.set(null);
    this.strategyTypeFilter.set('combined');
    this.selectedExchanges.set([...this.availableExchanges]); // Select all exchanges
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
   * Calculate delta-neutral hedge ratio for funding farm strategy
   * Returns the ratio of long position size to short position size
   */
  calculateHedgeRatio(opportunity: FundingRateOpportunity): number {
    const longPrice = parseFloat(opportunity.bestLong.lastPrice);
    const shortPrice = parseFloat(opportunity.bestShort.lastPrice);

    if (longPrice === 0 || shortPrice === 0) return 1;

    // To be delta-neutral: Long value = Short value
    // If Short price is higher, we need MORE long contracts
    return shortPrice / longPrice;
  }

  /**
   * Format hedge ratio for display
   */
  formatHedgeRatio(opportunity: FundingRateOpportunity): string {
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
   * Dynamically calculates the funding interval based on time until next funding
   * Uses currentTime signal to avoid NG0100
   */
  formatTimeToFundingWithInterval(exchange: { nextFundingTime: number; fundingInterval?: string }): string {
    const timeToFunding = this.getTimeToFunding(exchange);

    // Calculate interval dynamically based on time until next funding
    const now = this.currentTime();
    const timeUntilFunding = exchange.nextFundingTime - now;

    let interval = '8h'; // Default
    if (timeUntilFunding > 0) {
      if (timeUntilFunding <= 1 * 60 * 60 * 1000) {
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
  startPosition(opportunity: FundingRateOpportunity): void {
    console.log('[PriceArbitrageOpportunities] Starting position for:', opportunity.symbol);

    // Determine strategy type based on current filter
    const strategy = this.strategyTypeFilter();

    // Navigate to arbitrage chart with symbol, exchanges, and strategy
    // Format: /arbitrage/chart/:symbol/:longExchange/:shortExchange/:strategy
    this.router.navigate([
      '/arbitrage/chart',
      opportunity.symbol,
      opportunity.bestLong.exchange,
      opportunity.bestShort.exchange,
      strategy
    ]);
  }

  /**
   * Open details modal for displaying spread stability metrics
   * Triggers loading of historical stability metrics
   */
  openDetailsModal(opp: FundingRateOpportunity): void {
    this.selectedOpportunity.set(opp);
    this.showDetailsModal.set(true);
    // Trigger Phase 2 load
    this.loadPhase2MetricsForSymbol(opp.symbol);
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
}
