import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';

interface FundingRateDataPoint {
  timestamp: number;      // Timestamp in milliseconds
  spread: number;         // Spread value as decimal (e.g., 0.0015)
}

interface FundingRateAPIResponse {
  timestamp: number;
  fundingRate: number;
}

/**
 * Funding Rate Spread Chart Component
 *
 * Isolated component that displays historical funding rate spread data
 * using TradingView Lightweight Charts. This component:
 * - Loads its own data independently
 * - Uses OnPush change detection for performance
 * - Supports theme changes
 * - Allows switching between 7-day and 30-day periods
 */
@Component({
  selector: 'app-funding-rate-spread-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funding-rate-spread-chart.component.html',
  styleUrl: './funding-rate-spread-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundingRateSpreadChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  /**
   * Trading pair symbol (e.g., "BTCUSDT")
   */
  @Input({ required: true }) symbol!: string;

  /**
   * Exchange for best long position
   */
  @Input({ required: true }) bestLongExchange!: string;

  /**
   * Exchange for best short position
   */
  @Input({ required: true }) bestShortExchange!: string;

  /**
   * Authentication token (optional - will use AuthService if not provided)
   */
  @Input() authToken?: string;

  // State signals
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedPeriod = signal<7 | 30>(7);

  // Chart instance
  private chart: IChartApi | null = null;
  private spreadSeries: ISeriesApi<'Line'> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private chartInitRetries = 0;
  private readonly MAX_CHART_INIT_RETRIES = 10;

  // Services
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  // Cleanup flag
  private isDestroyed = false;

  constructor() {
    // Watch for theme changes
    effect(() => {
      const theme = this.themeService.currentTheme();
      if (this.chart && !this.isDestroyed) {
        this.applyThemeToChart(theme);
      }
    });
  }

  ngOnInit(): void {
    console.log('[FundingRateSpreadChart] Initialized for symbol:', this.symbol);
  }

  ngAfterViewInit(): void {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initializeChart();
      this.loadHistoricalData();
    }, 100);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanup();
  }

  /**
   * Switch chart period (7 or 30 days)
   */
  switchPeriod(period: 7 | 30): void {
    if (this.selectedPeriod() === period) return;

    this.selectedPeriod.set(period);
    this.loadHistoricalData();
  }

  /**
   * Initialize TradingView Lightweight Chart
   */
  private initializeChart(): void {
    if (!this.chartContainer || this.isDestroyed) {
      console.error('[FundingRateSpreadChart] Chart container not available');
      return;
    }

    const chartElement = this.chartContainer.nativeElement;

    // Ensure container has dimensions
    if (chartElement.clientWidth === 0 || chartElement.clientHeight === 0) {
      this.chartInitRetries++;
      if (this.chartInitRetries >= this.MAX_CHART_INIT_RETRIES) {
        console.error('[FundingRateSpreadChart] Failed to initialize chart - no dimensions');
        chartElement.style.width = '100%';
        chartElement.style.height = '300px';
      } else {
        console.warn(`[FundingRateSpreadChart] Retrying chart init... (${this.chartInitRetries}/${this.MAX_CHART_INIT_RETRIES})`);
        setTimeout(() => this.initializeChart(), 200);
        return;
      }
    }

    const containerWidth = chartElement.clientWidth || 1000;
    console.log('[FundingRateSpreadChart] Initializing chart with width:', containerWidth);

    // Get current theme colors
    const theme = this.themeService.currentTheme();
    const colors = this.getChartColors(theme);

    // Create chart
    this.chart = createChart(chartElement, {
      width: containerWidth,
      height: 400,
      layout: {
        background: { color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: 1, // Normal
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
          return price.toFixed(4) + '%';
        },
      },
    });

    // Add spread line series
    this.spreadSeries = this.chart.addLineSeries({
      color: colors.lineColor,
      lineWidth: 2,
      title: 'Funding Spread',
    });

    // Setup resize observer
    this.setupResizeHandler();

    console.log('[FundingRateSpreadChart] Chart initialized successfully');
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
        lineColor: 'rgb(59, 130, 246)', // blue
      };
    } else {
      return {
        background: '#ffffff',
        textColor: '#1a1a1a',
        gridColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: '#e5e7eb',
        lineColor: 'rgb(59, 130, 246)', // blue
      };
    }
  }

  /**
   * Apply theme colors to chart
   */
  private applyThemeToChart(theme: 'light' | 'dark'): void {
    if (this.isDestroyed || !this.chart) return;

    const colors = this.getChartColors(theme);

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
    if (this.spreadSeries) {
      this.spreadSeries.applyOptions({
        color: colors.lineColor,
      });
    }
  }

  /**
   * Setup ResizeObserver for automatic chart resizing
   */
  private setupResizeHandler(): void {
    if (this.isDestroyed || !this.chart) return;

    this.resizeObserver = new ResizeObserver(entries => {
      if (this.isDestroyed || !this.chart) return;

      if (entries.length > 0) {
        const { width } = entries[0]!.contentRect;
        if (width > 0) {
          this.chart.applyOptions({ width });
        }
      }
    });

    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  /**
   * Load historical funding rate data from both exchanges and calculate spread
   */
  private async loadHistoricalData(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Use provided token or get from AuthService
      const token = this.authToken || this.authService.authState().token;
      if (!token) {
        console.warn('[FundingRateSpreadChart] No authentication token available, trying without auth');
      }

      const headers = token ? new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }) : new HttpHeaders();

      const period = this.selectedPeriod();

      console.log(`[FundingRateSpreadChart] Loading ${period}d historical data for ${this.symbol}...`);

      // Fetch data from both exchanges in parallel
      const [longResponse, shortResponse] = await Promise.all([
        this.http.get<{ success: boolean; data: FundingRateAPIResponse[] }>(
          `/api/arbitrage/funding-rates/history?symbol=${this.symbol}&exchange=${this.bestLongExchange}&days=${period}`,
          { headers }
        ).toPromise(),
        this.http.get<{ success: boolean; data: FundingRateAPIResponse[] }>(
          `/api/arbitrage/funding-rates/history?symbol=${this.symbol}&exchange=${this.bestShortExchange}&days=${period}`,
          { headers }
        ).toPromise()
      ]);

      if (!longResponse?.success || !longResponse?.data || !shortResponse?.success || !shortResponse?.data) {
        throw new Error('Invalid response format from API');
      }

      // Create maps for quick lookup by timestamp
      const longDataMap = new Map<number, number>();
      longResponse.data.forEach(point => {
        longDataMap.set(point.timestamp, point.fundingRate);
      });

      const shortDataMap = new Map<number, number>();
      shortResponse.data.forEach(point => {
        shortDataMap.set(point.timestamp, point.fundingRate);
      });

      // Calculate spread for matching timestamps
      const spreadData: FundingRateDataPoint[] = [];
      longDataMap.forEach((longRate, timestamp) => {
        const shortRate = shortDataMap.get(timestamp);
        if (shortRate !== undefined) {
          // Spread = Long funding rate - Short funding rate
          const spread = longRate - shortRate;
          spreadData.push({ timestamp, spread });
        }
      });

      if (spreadData.length > 0 && !this.isDestroyed && this.spreadSeries) {
        // Sort by timestamp
        spreadData.sort((a, b) => a.timestamp - b.timestamp);

        // Convert to LineData format with percentage values
        const chartData: LineData[] = spreadData.map(point => ({
          time: Math.floor(point.timestamp / 1000) as Time, // Convert ms to seconds
          value: point.spread * 100 // Convert decimal to percentage
        }));

        this.spreadSeries.setData(chartData);

        // Fit chart to show all data
        if (!this.isDestroyed && this.chart) {
          this.chart.timeScale().fitContent();
        }

        console.log(`[FundingRateSpreadChart] Loaded ${chartData.length} spread data points`);
      } else {
        console.warn('[FundingRateSpreadChart] No matching historical data available');
        this.error.set('No matching data available for the selected period');
      }

    } catch (error: any) {
      console.error('[FundingRateSpreadChart] Failed to load data:', error);
      this.error.set(error.message || 'Failed to load historical data');
    } finally {
      if (!this.isDestroyed) {
        this.isLoading.set(false);
      }
    }
  }

  /**
   * Cleanup chart and observers
   */
  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }

    this.spreadSeries = null;
  }
}
