import { Component, OnInit, OnDestroy, ViewEncapsulation, signal, computed, effect, inject } from '@angular/core';import { IconComponent } from '../../components/ui/icon/icon.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { PublicFundingRatesService } from '../../services/public-funding-rates.service';
import { FundingRateOpportunity, SpreadStabilityMetrics } from '../../models/public-funding-rate.model';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../components/ui/card/card.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent } from '../../components/ui/dialog/dialog.component';
import { TradingSettingsService, TradingSettings } from '../../services/trading-settings.service';
import { ThemeService } from '../../services/theme.service';
import { FundingRateSpreadChartComponent } from '../../components/trading/funding-rate-spread-chart/funding-rate-spread-chart.component';
import { FundingSpreadDetailsComponent } from '../../components/trading/funding-spread-details/funding-spread-details.component';

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
    IconComponent,CommonModule, FormsModule, RouterModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent, FundingRateSpreadChartComponent, FundingSpreadDetailsComponent],
  templateUrl: './arbitrage-funding.component.html',
  styleUrls: ['./arbitrage-funding.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ArbitrageFundingComponent implements OnInit, OnDestroy {
  // State
  opportunities = signal<FundingRateOpportunity[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  // Current time signal - updates every second to calculate time differences
  private currentTime = signal<number>(Date.now());

  // Auto-refresh
  private refreshSubscription?: Subscription;
  private timeUpdateInterval?: any;
  private readonly REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds

  // Filters
  searchQuery = signal<string>('');
  minFundingSpread = signal<number | null>(null);

  // Computed list of unique exchanges from all opportunities
  availableExchanges = computed(() => {
    const exchanges = new Set<string>();
    this.opportunities().forEach(opp => {
      opp.exchanges.forEach(ex => exchanges.add(ex.exchange));
    });
    return Array.from(exchanges).sort();
  });

  // Selected exchanges filter
  selectedExchanges = signal<Set<string>>(new Set());

  // Sorting
  sortColumn = signal<'fundingSpread' | 'priceSpread' | 'symbol' | 'estimatedAPR' | 'netAPR'>('fundingSpread');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // PHASE2: Modal for detailed metrics
  showDetailsModal = signal<boolean>(false);
  selectedOpportunity = signal<FundingRateOpportunity | null>(null);
  loadingPhase2Metrics = signal<Set<string>>(new Set());
  phase2MetricsCache = signal<Map<string, FundingRateOpportunity>>(new Map());

  // Settings Dialog
  showSettingsDialog = signal<boolean>(false);
  // Writable settings for the dialog (cloned from service)
  private _subscriptionSettings = signal<TradingSettings>({
    defaultQuantity: 0.01,
    leverage: 3,
    autoCancelThreshold: 0.003,
    enableAutoCancel: true,
    executionDelay: 5,
    arbitrageSpreadThreshold: null
  });

  // Computed time since update - uses currentTime signal to avoid NG0100
  timeSinceUpdate = computed(() => {
    const lastUpdate = this.lastUpdated();
    if (!lastUpdate) return '—';

    const now = this.currentTime();
    const seconds = Math.floor((now - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  });

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

    // Filter by selected exchanges
    // Show opportunities where BOTH bestLong AND bestShort exchanges are selected
    // This ensures we only show arbitrage pairs between the selected exchanges
    const selected = this.selectedExchanges();
    if (selected.size > 0) {
      filtered = filtered.filter(opp =>
        selected.has(opp.bestLong.exchange) && selected.has(opp.bestShort.exchange)
      );
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

  private themeService = inject(ThemeService);

  constructor(
    private fundingRatesService: PublicFundingRatesService,
    private tradingSettingsService: TradingSettingsService
  ) {
    // Constructor simplified - chart rendering now handled by child component

    // Auto-select all exchanges when they become available
    effect(() => {
      const exchanges = this.availableExchanges();
      if (exchanges.length > 0 && this.selectedExchanges().size === 0) {
        this.selectAllExchanges();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.startAutoRefresh();
    this.startTimeUpdates();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    this.stopTimeUpdates();
  }

  /**
   * Start updating currentTime every second
   * This allows time-based displays to update without causing NG0100
   */
  private startTimeUpdates(): void {
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000); // Update every second
  }

  /**
   * Stop time update interval
   */
  private stopTimeUpdates(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = undefined;
    }
  }

  /**
   * Start auto-refresh timer
   * Fetches funding rates every 30 seconds
   */
  private startAutoRefresh(): void {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL_MS)
      .pipe(
        startWith(0), // Load immediately
        switchMap(() => this.fundingRatesService.getFundingRatesOpportunities(this.selectedExchanges()))
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

    this.fundingRatesService.getFundingRatesOpportunities(this.selectedExchanges()).subscribe({
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
    this.selectAllExchanges();
  }

  /**
   * Toggle exchange selection
   */
  toggleExchange(exchange: string): void {
    const selected = new Set(this.selectedExchanges());
    if (selected.has(exchange)) {
      selected.delete(exchange);
    } else {
      selected.add(exchange);
    }
    this.selectedExchanges.set(selected);
    // Trigger immediate refresh with new exchange selection
    this.refresh();
  }

  /**
   * Select all exchanges
   */
  selectAllExchanges(): void {
    this.selectedExchanges.set(new Set(this.availableExchanges()));
    // Trigger immediate refresh with new exchange selection
    this.refresh();
  }

  /**
   * Deselect all exchanges
   */
  deselectAllExchanges(): void {
    this.selectedExchanges.set(new Set());
    // Trigger immediate refresh with new exchange selection
    this.refresh();
  }

  /**
   * Check if exchange is selected
   * Returns a function to be used in templates that properly tracks signal changes
   */
  isExchangeSelected = (exchange: string): boolean => {
    return this.selectedExchanges().has(exchange);
  };

  /**
   * Format funding rate for display
   */
  formatFundingRate(rate: string): string {
    const rateNum = parseFloat(rate);
    return (rateNum * 100).toFixed(4) + '%';
  }

  /**
   * Get color class for funding rate
   * Negative (paying) = red, Positive (receiving) = green
   */
  getFundingRateColorClass(rate: string): string {
    const rateNum = parseFloat(rate);
    if (rateNum < 0) return 'text-red-600 dark:text-red-400';
    if (rateNum > 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
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
   * Get exchanges tooltip text
   */
  getExchangesTooltip(opp: FundingRateOpportunity): string {
    return opp.exchanges.map(ex =>
      `${ex.exchange}: ${this.formatFundingRate(ex.fundingRate)} | $${ex.lastPrice}`
    ).join('\n');
  }

  // ===== PHASE 2: Details Modal Methods =====

  /**
   * Open details modal for displaying Phase 2 metrics
   * PHASE2: Triggers loading of historical stability metrics
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
   * PHASE2: Fetches historical funding rates and calculates stability metrics
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

  // ===== Settings Dialog Methods =====

  /**
   * Get subscription settings (writable for ngModel binding)
   */
  subscriptionSettings() {
    return this._subscriptionSettings();
  }

  /**
   * Open settings dialog
   */
  openSettingsDialog(): void {
    // Clone current settings from service
    const currentSettings = this.tradingSettingsService.getSettings()();
    this._subscriptionSettings.set({ ...currentSettings });
    this.showSettingsDialog.set(true);
  }

  /**
   * Close settings dialog
   */
  closeSettingsDialog(): void {
    this.showSettingsDialog.set(false);
  }

  /**
   * Save settings to service
   */
  saveSettings(): void {
    // Save the modified settings to the service
    this.tradingSettingsService.updateSettings(this._subscriptionSettings());
    this.closeSettingsDialog();
  }

  /**
   * Translation stub method
   * Returns the key as-is for now
   */
  translate(key: string): string {
    return key;
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
   * Uses the actual funding interval from the exchange API
   * Uses currentTime signal to avoid NG0100
   */
  formatTimeToFundingWithInterval(exchange: { nextFundingTime: number; fundingInterval?: string }): string {
    const timeToFunding = this.getTimeToFunding(exchange);

    // Use the actual funding interval from the API - no defaults!
    // Backend returns '-' when interval is not available
    const interval = exchange.fundingInterval || '-';

    return `${timeToFunding} / ${interval}`;
  }

  /**
   * Get color class for volatility
   * Higher volatility = higher risk
   */
  getVolatilityColorClass(volatility?: number): string {
    if (!volatility) return 'text-gray-600 dark:text-gray-400';

    const volatilityPercent = volatility * 100;

    if (volatilityPercent < 2) {
      // Low volatility = low risk (green)
      return 'text-green-600 dark:text-green-400';
    } else if (volatilityPercent < 5) {
      // Medium volatility = medium risk (yellow)
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      // High volatility = high risk (red)
      return 'text-red-600 dark:text-red-400';
    }
  }

  /**
   * Get tooltip for volatility explaining the risk level
   */
  getVolatilityTooltip(volatility?: number): string {
    if (!volatility) return 'Volatility data not available';

    const volatilityPercent = volatility * 100;

    if (volatilityPercent < 2) {
      return 'Low volatility (< 2%) - Low risk, stable price movement';
    } else if (volatilityPercent < 5) {
      return 'Medium volatility (2-5%) - Moderate risk, normal price fluctuations';
    } else {
      return 'High volatility (> 5%) - High risk, significant price swings';
    }
  }

  /**
   * Convert symbol to BingX format (e.g., BTCUSDT -> BTC-USDT)
   * Also handles CCXT perpetual contract format (e.g., BTC/USDT:USDT -> BTC-USDT)
   */
  private normalizeSymbolForBingX(symbol: string): string {
    // First, remove CCXT perpetual contract suffix (e.g., :USDT)
    let cleanSymbol = symbol.replace(/:.*$/, '');

    // Remove slashes (CCXT format BTC/USDT -> BTCUSDT)
    cleanSymbol = cleanSymbol.replace(/\//g, '');

    // If already has hyphen, return as-is
    if (cleanSymbol.includes('-')) {
      return cleanSymbol;
    }

    // BingX perpetual futures use USDT or USDC as quote currency
    if (cleanSymbol.endsWith('USDT')) {
      const base = cleanSymbol.slice(0, -4);
      return `${base}-USDT`;
    }

    if (cleanSymbol.endsWith('USDC')) {
      const base = cleanSymbol.slice(0, -4);
      return `${base}-USDC`;
    }

    return cleanSymbol;
  }

  /**
   * Get exchange URL for opening in new window
   */
  getExchangeUrl(exchange: string, symbol: string): string {
    const exchangeUpper = exchange.toUpperCase();

    switch (exchangeUpper) {
      case 'BYBIT':
        return `https://www.bybit.com/trade/usdt/${symbol}`;
      case 'BINGX':
        const bingxSymbol = this.normalizeSymbolForBingX(symbol);
        return `https://bingx.com/en/perpetual/${bingxSymbol}`;
      case 'MEXC':
        const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT').replace(/USDC$/, '_USDC');
        return `https://www.mexc.com/exchange/${mexcSymbol}`;
      case 'GATEIO':
        const gateioSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT').replace(/USDC$/, '_USDC');
        return `https://www.gate.io/trade/${gateioSymbol}`;
      case 'BITGET':
        return `https://www.bitget.com/futures/usdt/${symbol}`;
      case 'OKX':
        return `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
      default:
        return '#';
    }
  }

  /**
   * Open exchange page in new window
   */
  openExchange(exchange: string, symbol: string): void {
    const url = this.getExchangeUrl(exchange, symbol);
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
      spreadPercentage: Math.abs(opp.maxFundingSpread * 100),
      bestLongExchange: opp.bestLong.exchange,
      bestShortExchange: opp.bestShort.exchange,
      longFundingRate: parseFloat(opp.bestLong.fundingRate),
      shortFundingRate: parseFloat(opp.bestShort.fundingRate),
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
