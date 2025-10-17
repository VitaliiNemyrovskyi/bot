import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { PublicFundingRatesService } from '../../services/public-funding-rates.service';
import { FundingRateOpportunity } from '../../models/public-funding-rate.model';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../components/ui/card/card.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { IconComponent } from '../../components/ui/icon/icon.component';

/**
 * Arbitrage Funding Page
 *
 * Displays funding rate arbitrage opportunities fetched directly from exchange public APIs.
 * NO API KEYS REQUIRED - all data is public.
 *
 * Features:
 * - Real-time funding rates from multiple exchanges
 * - Automatic calculation of funding spreads
 * - Price spread analysis
 * - Sortable by funding spread, price spread, or symbol
 * - Auto-refresh every 30 seconds
 */
@Component({
  selector: 'app-arbitrage-funding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './arbitrage-funding.component.html',
  styleUrls: ['./arbitrage-funding.component.scss'],
})
export class ArbitrageFundingComponent implements OnInit, OnDestroy {
  // State
  opportunities = signal<FundingRateOpportunity[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  // Auto-refresh
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds

  // Filters
  searchQuery = signal<string>('');
  minFundingSpread = signal<number | null>(null);

  // Sorting
  sortColumn = signal<'fundingSpread' | 'priceSpread' | 'symbol' | 'estimatedAPR' | 'netAPR'>('fundingSpread');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // PHASE2: Expandable rows for detailed metrics
  expandedRowSymbol = signal<string | null>(null);
  loadingPhase2Metrics = signal<Set<string>>(new Set());
  phase2MetricsCache = signal<Map<string, FundingRateOpportunity>>(new Map());

  // Computed filtered & sorted opportunities
  filteredOpportunities = computed(() => {
    let filtered = [...this.opportunities()];

    // Filter by search query (symbol)
    const query = this.searchQuery().trim().toUpperCase();
    if (query) {
      filtered = filtered.filter(o => o.symbol.toUpperCase().includes(query));
    }

    // Filter by minimum funding spread
    const minSpread = this.minFundingSpread();
    if (minSpread !== null) {
      filtered = filtered.filter(o => Math.abs(o.maxFundingSpread * 100) >= minSpread);
    }

    // Sort
    const column = this.sortColumn();
    const direction = this.sortDirection();

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'fundingSpread':
          comparison = Math.abs(b.maxFundingSpread) - Math.abs(a.maxFundingSpread);
          break;
        case 'priceSpread':
          comparison = Math.abs(b.priceSpread) - Math.abs(a.priceSpread);
          break;
        case 'estimatedAPR':
          comparison = b.estimatedAPR - a.estimatedAPR;
          break;
        case 'netAPR':
          comparison = b.netAPR - a.netAPR;
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  constructor(private fundingRatesService: PublicFundingRatesService) {}

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Start auto-refresh timer
   * Fetches funding rates every 30 seconds
   */
  private startAutoRefresh(): void {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL_MS)
      .pipe(
        startWith(0), // Load immediately
        switchMap(() => this.fundingRatesService.getFundingRatesOpportunities())
      )
      .subscribe({
        next: (opportunities) => {
          this.opportunities.set(opportunities);
          this.error.set(null);
          this.isLoading.set(false);
          // Update lastUpdated after change detection to avoid NG0100
          setTimeout(() => this.lastUpdated.set(new Date()), 0);
        },
        error: (err) => {
          this.error.set('Failed to load funding rates: ' + err.message);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Stop auto-refresh timer
   */
  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  /**
   * Manually refresh funding rates
   */
  refresh(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.fundingRatesService.getFundingRatesOpportunities().subscribe({
      next: (opportunities) => {
        this.opportunities.set(opportunities);
        this.error.set(null);
        this.isLoading.set(false);
        // Update lastUpdated after change detection to avoid NG0100
        setTimeout(() => this.lastUpdated.set(new Date()), 0);
      },
      error: (err) => {
        this.error.set('Failed to load funding rates: ' + err.message);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Toggle sort column
   */
  toggleSort(column: 'fundingSpread' | 'priceSpread' | 'symbol' | 'estimatedAPR' | 'netAPR'): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Change column, default to desc
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery.set('');
    this.minFundingSpread.set(null);
  }

  /**
   * Format funding rate for display
   */
  formatFundingRate(rate: string): string {
    const rateNum = parseFloat(rate);
    return (rateNum * 100).toFixed(4) + '%';
  }

  /**
   * Get color class for funding spread
   */
  getFundingSpreadColorClass(spread: number): string {
    const absSpread = Math.abs(spread * 100);
    if (absSpread >= 0.1) return 'text-green-600 dark:text-green-400';
    if (absSpread >= 0.05) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Get color class for APR values
   */
  getAPRColorClass(apr: number): string {
    const aprPercent = apr * 100;
    if (aprPercent >= 50) return 'text-green-600 dark:text-green-400';
    if (aprPercent >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Get time since last update
   */
  getTimeSinceUpdate(): string {
    const lastUpdate = this.lastUpdated();
    if (!lastUpdate) return '—';

    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }

  /**
   * Get exchanges tooltip text
   */
  getExchangesTooltip(opp: FundingRateOpportunity): string {
    return opp.exchanges.map(ex =>
      `${ex.exchange}: ${this.formatFundingRate(ex.fundingRate)} | $${ex.lastPrice}`
    ).join('\n');
  }

  // ===== PHASE 2: Expandable Row Methods =====

  /**
   * Toggle expanded row for displaying Phase 2 metrics
   * PHASE2: Triggers loading of historical stability metrics
   */
  toggleExpandRow(symbol: string): void {
    const current = this.expandedRowSymbol();

    if (current === symbol) {
      this.expandedRowSymbol.set(null);
    } else {
      this.expandedRowSymbol.set(symbol);
      // Trigger Phase 2 load
      this.loadPhase2MetricsForSymbol(symbol);
    }
  }

  /**
   * Load Phase 2 historical stability metrics for a symbol
   * PHASE2: Fetches historical funding rates and calculates stability metrics
   */
  async loadPhase2MetricsForSymbol(symbol: string): Promise<void> {
    // Check cache
    if (this.phase2MetricsCache().has(symbol)) {
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
   * PHASE2: Used to show loading spinner in UI
   */
  isLoadingPhase2(symbol: string): boolean {
    return this.loadingPhase2Metrics().has(symbol);
  }

  /**
   * Get Phase 2 metrics from cache
   * PHASE2: Returns cached metrics or undefined if not loaded
   */
  getPhase2Metrics(symbol: string): FundingRateOpportunity | undefined {
    return this.phase2MetricsCache().get(symbol);
  }

  /**
   * Get icon name for stability trend
   * PHASE2: Maps trend to Material icon name
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return 'trending_up';
      case 'declining': return 'trending_down';
      default: return 'trending_flat';
    }
  }
}
