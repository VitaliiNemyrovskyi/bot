import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FundingArbitrageService,
  FundingArbitrageRevenueResponse,
  FundingArbitrageDeal,
  RevenueBySymbol,
  RevenueByExchange
} from '../../../services/funding-arbitrage.service';
import { TranslationService } from '../../../services/translation.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';

/**
 * Funding Revenue Component
 *
 * Displays comprehensive revenue statistics for funding arbitrage deals:
 * - Summary metrics (total revenue, deals, win rate, etc.)
 * - Revenue breakdown by symbol
 * - Revenue breakdown by exchange
 * - Individual deal list
 * - Date range filtering
 */
@Component({
  selector: 'app-funding-revenue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent
  ],
  templateUrl: './funding-revenue.component.html',
  styleUrl: './funding-revenue.component.scss'
})
export class FundingRevenueComponent implements OnInit, OnDestroy {
  private fundingArbitrageService = inject(FundingArbitrageService);
  private translationService = inject(TranslationService);

  // Expose utilities to template
  Math = Math;

  // State signals
  revenueData = signal<FundingArbitrageRevenueResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filter signals
  startDate = signal<string>(this.getDefaultStartDate());
  endDate = signal<string>(this.getDefaultEndDate());
  selectedExchange = signal<string>('');
  selectedSymbol = signal<string>('');

  // UI state
  showFilters = signal<boolean>(true);
  expandedDealId = signal<string | null>(null);

  // Computed signals
  summary = computed(() => this.revenueData()?.data?.summary);
  bySymbol = computed(() => this.revenueData()?.data?.bySymbol || []);
  byExchange = computed(() => this.revenueData()?.data?.byExchange || []);
  deals = computed(() => this.revenueData()?.data?.deals || []);
  timeline = computed(() => this.revenueData()?.data?.timeline || []);

  // Computed metrics
  totalFees = computed(() => {
    const dealsData = this.deals();
    return dealsData.reduce(
      (sum, deal) => sum + deal.primaryTradingFees + deal.hedgeTradingFees,
      0
    );
  });

  netProfit = computed(() => {
    const summaryData = this.summary();
    const fees = this.totalFees();
    return summaryData ? summaryData.totalRevenue - fees : 0;
  });

  // Unique exchanges and symbols for filters
  availableExchanges = computed(() => {
    const exchanges = new Set<string>();
    this.byExchange().forEach(item => exchanges.add(item.exchange));
    return Array.from(exchanges).sort();
  });

  availableSymbols = computed(() => {
    const symbols = new Set<string>();
    this.bySymbol().forEach(item => symbols.add(item.symbol));
    return Array.from(symbols).sort();
  });

  private subscription?: Subscription;

  ngOnInit(): void {
    this.loadRevenue();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  /**
   * Load revenue data with current filters
   */
  loadRevenue(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const startDateValue = this.startDate() || undefined;
    const endDateValue = this.endDate() || undefined;
    const exchangeValue = this.selectedExchange() || undefined;
    const symbolValue = this.selectedSymbol() || undefined;

    this.subscription = this.fundingArbitrageService
      .getRevenue(startDateValue, endDateValue, exchangeValue, symbolValue)
      .subscribe({
        next: (response) => {
          this.revenueData.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load revenue data');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Refresh revenue data
   */
  refreshRevenue(): void {
    this.loadRevenue();
  }

  /**
   * Apply filters and reload data
   */
  applyFilters(): void {
    this.loadRevenue();
  }

  /**
   * Clear all filters and reload
   */
  clearFilters(): void {
    this.startDate.set(this.getDefaultStartDate());
    this.endDate.set(this.getDefaultEndDate());
    this.selectedExchange.set('');
    this.selectedSymbol.set('');
    this.loadRevenue();
  }

  /**
   * Toggle filters panel
   */
  toggleFilters(): void {
    this.showFilters.update(value => !value);
  }

  /**
   * Toggle deal expansion
   */
  toggleDealExpansion(dealId: string): void {
    const current = this.expandedDealId();
    this.expandedDealId.set(current === dealId ? null : dealId);
  }

  /**
   * Check if deal is expanded
   */
  isDealExpanded(dealId: string): boolean {
    return this.expandedDealId() === dealId;
  }

  /**
   * Format currency value
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  }

  /**
   * Format percentage value
   */
  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Format date
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format duration in seconds
   */
  formatDuration(seconds: number | null): string {
    if (seconds === null) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Get CSS class for positive/negative values
   */
  getValueClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Get default start date (30 days ago)
   */
  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default end date (today)
   */
  private getDefaultEndDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate win rate color class
   */
  getWinRateClass(winRate: number): string {
    if (winRate >= 70) return 'excellent';
    if (winRate >= 50) return 'good';
    if (winRate >= 30) return 'average';
    return 'poor';
  }

  /**
   * Format number with thousands separator
   */
  formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
}
