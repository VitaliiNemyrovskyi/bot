/**
 * Funding History Modal Component
 *
 * Modal dialog that displays comprehensive funding rate history with:
 * - Historical funding rate chart (7d/30d periods)
 * - Stability metrics and scores
 * - Predictions for next funding rates
 * - Comparison with other exchanges
 * - Market metrics (open interest, volume, market cap)
 */

import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { ThemeService } from '../../../services/theme.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';

interface FundingRatePoint {
  symbol: string;
  fundingRate: number;
  fundingRateTimestamp: Date;
  nextFundingTime: Date;
  markPrice?: number;
  indexPrice?: number;
  openInterest?: number;
  volume24h?: number;
}

interface StabilityMetrics {
  stabilityScore: number;
  volatility: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  signChangeFrequency: number;
  trendStrength: number;
  trendDirection: 'stable' | 'increasing' | 'decreasing';
}

interface FundingPrediction {
  next1: number;
  next2: number;
  next3: number;
  confidence: number;
  method: string;
}

interface ExchangeComparison {
  exchange: string;
  currentRate: number;
  avgRate7d: number;
  avgRate30d: number;
  stabilityScore: number;
}

interface FundingHistoryData {
  history: FundingRatePoint[];
  statistics: {
    avg: number;
    min: number;
    max: number;
    avgRate7d: number;
    avgRate30d: number;
  };
  stability: StabilityMetrics;
  prediction: FundingPrediction;
  comparison: ExchangeComparison[];
  marketMetrics: {
    openInterest: number | null;
    volume24h: number | null;
    markPrice: number | null;
  };
}

@Component({
  selector: 'app-funding-history-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent
  ],
  templateUrl: './funding-history-modal.component.html',
  styleUrls: ['./funding-history-modal.component.scss']
})
export class FundingHistoryModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // Injected services
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);

  // Input data (using new signal-based inputs)
  exchange = input.required<string>();
  symbol = input.required<string>();
  open = input.required<boolean>();

  // Output events
  closeModal = output<void>();

  // State
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedPeriod = signal<7 | 30>(7);
  fundingData = signal<FundingHistoryData | null>(null);

  // Chart instance
  private chart: IChartApi | null = null;
  private fundingSeries: ISeriesApi<'Line'> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isDestroyed = false;
  private chartInitialized = false;
  private currentTheme: 'light' | 'dark' = 'dark';

  // Computed values
  stabilityRating = computed(() => {
    const score = this.fundingData()?.stability.stabilityScore ?? 0;
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'low';
  });

  stabilityColor = computed(() => {
    const rating = this.stabilityRating();
    switch (rating) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'moderate': return '#f59e0b';
      default: return '#ef4444';
    }
  });

  volatilityRating = computed(() => {
    const volatility = this.fundingData()?.stability.volatility ?? 0;
    if (volatility < 0.0001) return 'excellent';
    if (volatility < 0.0003) return 'good';
    if (volatility < 0.0005) return 'moderate';
    return 'high';
  });

  predictionConfidence = computed(() => {
    const confidence = this.fundingData()?.prediction.confidence ?? 0;
    return Math.round(confidence * 100);
  });

  constructor() {
    // Effect to handle theme changes only
    effect(() => {
      const theme = this.themeService.currentTheme();

      // Only update if chart is initialized and theme changed
      if (this.chartInitialized && this.chart && theme !== this.currentTheme) {
        console.log(`[FundingHistoryModal] Theme changed from ${this.currentTheme} to ${theme}, updating chart`);
        this.currentTheme = theme;
        this.updateChartTheme(theme);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    console.log(`[FundingHistoryModal] Opening for ${this.exchange()}:${this.symbol()}`);
    this.loadHistoricalData();
  }

  ngAfterViewInit(): void {
    // Wait for data to load before initializing chart
    setTimeout(() => {
      if (this.fundingData() && !this.isLoading() && !this.chartInitialized) {
        this.initializeChart();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanup();
  }

  /**
   * Switch between 7d and 30d periods
   */
  switchPeriod(period: 7 | 30): void {
    if (this.selectedPeriod() === period) return;
    this.selectedPeriod.set(period);
    this.loadHistoricalData();
  }

  /**
   * Load historical funding rate data with metrics
   */
  async loadHistoricalData(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const period = this.selectedPeriod();
      const exchange = this.exchange();
      const symbol = this.symbol();

      console.log(`[FundingHistoryModal] Loading ${period}d data for ${exchange}:${symbol}`);

      const response = await this.http.get<{ success: boolean; data: FundingHistoryData }>(
        `/api/funding/history-metrics?exchange=${exchange}&symbol=${symbol}&days=${period}`
      ).toPromise();

      if (!response?.success || !response?.data) {
        throw new Error('Invalid response from API');
      }

      this.fundingData.set(response.data);

      console.log(`[FundingHistoryModal] Loaded data:
        - History: ${response.data.history.length} points
        - Stability: ${response.data.stability.stabilityScore}/100
        - Trend: ${response.data.stability.trendDirection}
        - Comparisons: ${response.data.comparison.length} exchanges
      `);

      // Initialize or update chart with new data
      setTimeout(() => {
        if (!this.chartInitialized) {
          console.log('[FundingHistoryModal] Initializing chart for first time');
          this.initializeChart();
        } else {
          console.log('[FundingHistoryModal] Updating existing chart with new data');
          this.updateChartData();
        }
      }, 100);

    } catch (error: any) {
      console.error('[FundingHistoryModal] Failed to load data:', error);
      this.errorMessage.set(error.message || 'Failed to load funding rate history');
    } finally {
      if (!this.isDestroyed) {
        this.isLoading.set(false);
      }
    }
  }

  /**
   * Initialize TradingView Lightweight Chart
   */
  private initializeChart(): void {
    if (this.chartInitialized) {
      console.log('[FundingHistoryModal] Chart already initialized, skipping');
      return;
    }

    if (!this.chartContainer || this.isDestroyed) {
      console.error('[FundingHistoryModal] Chart container not available');
      return;
    }

    const chartElement = this.chartContainer.nativeElement;
    const containerWidth = chartElement.clientWidth || 800;

    if (containerWidth === 0) {
      console.error('[FundingHistoryModal] Chart container has zero width, retrying in 200ms');
      setTimeout(() => this.initializeChart(), 200);
      return;
    }

    const theme = this.themeService.currentTheme();
    const colors = this.getChartColors(theme);
    this.currentTheme = theme;

    console.log(`[FundingHistoryModal] Initializing chart with theme: ${theme}, width: ${containerWidth}`);

    this.chart = createChart(chartElement, {
      width: containerWidth,
      height: 350,
      layout: {
        background: { color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        priceFormatter: (price: number) => {
          return (price * 100).toFixed(4) + '%';
        },
      },
    });

    this.fundingSeries = this.chart.addLineSeries( {
      color: colors.lineColor,
      lineWidth: 2,
      title: 'Funding Rate',
    });

    this.setupResizeHandler();
    this.updateChartData();
    this.chartInitialized = true;

    console.log('[FundingHistoryModal] Chart initialized successfully');
  }

  /**
   * Update chart with funding rate data
   */
  private updateChartData(): void {
    if (!this.fundingSeries || !this.fundingData() || this.isDestroyed) {
      console.warn('[FundingHistoryModal] Cannot update chart data - missing series or data');
      return;
    }

    const history = this.fundingData()!.history;
    if (history.length === 0) {
      console.warn('[FundingHistoryModal] No history data to display');
      return;
    }

    const chartData: LineData[] = history.map(point => ({
      time: Math.floor(new Date(point.fundingRateTimestamp).getTime() / 1000) as Time,
      value: point.fundingRate * 100 // Convert to percentage
    }));

    try {
      this.fundingSeries.setData(chartData);

      if (this.chart && !this.isDestroyed) {
        this.chart.timeScale().fitContent();
      }

      console.log(`[FundingHistoryModal] Chart updated with ${chartData.length} points`);
    } catch (error) {
      console.error('[FundingHistoryModal] Error updating chart data:', error);
    }
  }

  /**
   * Get chart colors based on theme
   */
  private getChartColors(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      return {
        background: '#1e1e1e',
        textColor: '#f9fafb',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        lineColor: 'rgb(59, 130, 246)',
      };
    } else {
      return {
        background: '#ffffff',
        textColor: '#1a1a1a',
        gridColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: '#e5e7eb',
        lineColor: 'rgb(59, 130, 246)',
      };
    }
  }

  /**
   * Update chart theme without destroying it
   */
  private updateChartTheme(theme: 'light' | 'dark'): void {
    if (!this.chart || !this.fundingSeries || this.isDestroyed) {
      console.warn('[FundingHistoryModal] Cannot update theme - chart not available');
      return;
    }

    const colors = this.getChartColors(theme);

    try {
      // Update chart colors
      this.chart.applyOptions({
        layout: {
          background: { color: colors.background },
          textColor: colors.textColor,
        },
        grid: {
          vertLines: { color: colors.gridColor },
          horzLines: { color: colors.gridColor },
        },
        rightPriceScale: {
          borderColor: colors.borderColor,
        },
        timeScale: {
          borderColor: colors.borderColor,
        },
      });

      // Update series color
      this.fundingSeries.applyOptions({
        color: colors.lineColor,
      });

      console.log(`[FundingHistoryModal] Chart theme updated to ${theme}`);
    } catch (error) {
      console.error('[FundingHistoryModal] Error updating chart theme:', error);
    }
  }

  /**
   * Setup ResizeObserver for automatic chart resizing
   */
  private setupResizeHandler(): void {
    if (this.isDestroyed || !this.chart) {
      console.warn('[FundingHistoryModal] Cannot setup resize handler - destroyed or no chart');
      return;
    }

    this.resizeObserver = new ResizeObserver(entries => {
      if (this.isDestroyed) {
        console.log('[FundingHistoryModal] ResizeObserver called but component is destroyed');
        return;
      }

      if (!this.chart) {
        console.log('[FundingHistoryModal] ResizeObserver called but chart is null');
        return;
      }

      if (entries.length > 0) {
        const { width } = entries[0]!.contentRect;
        console.log(`[FundingHistoryModal] ResizeObserver: width=${width}`);
        if (width > 0) {
          this.chart.applyOptions({ width });
        }
      }
    });

    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
      console.log('[FundingHistoryModal] ResizeObserver attached');
    }
  }

  /**
   * Format number as percentage
   */
  formatPercent(value: number): string {
    return (value * 100).toFixed(4) + '%';
  }

  /**
   * Format large numbers with abbreviations
   */
  formatLargeNumber(value: number | null): string {
    if (value === null) return 'N/A';
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(2) + 'K';
    return value.toFixed(2);
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.closeModal.emit();
  }

  /**
   * Handle overlay click
   */
  handleOverlayClick(): void {
    this.onClose();
  }

  /**
   * Handle content click (prevent closing)
   */
  handleContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Cleanup chart and observers
   */
  private cleanup(): void {
    console.log('[FundingHistoryModal] Cleaning up chart and observers');

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }

    this.fundingSeries = null;
    this.chartInitialized = false;
  }
}
