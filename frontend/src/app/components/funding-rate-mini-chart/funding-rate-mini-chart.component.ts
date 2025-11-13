import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { ThemeService } from '../../services/theme.service';
import { ExchangeWebSocketService, WebSocketData } from '../../services/exchange-websocket.service';

interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Mini Funding Rate Chart Component
 * Lightweight chart for displaying funding rate history in Farm page
 */
@Component({
  selector: 'app-funding-rate-mini-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mini-chart-container">
      <div class="chart-header">
        <h4>{{ symbol }}</h4>
        <span class="exchange-badge">{{ exchange }}</span>
      </div>
      <div #chartContainer class="chart-wrapper"></div>
      <div class="chart-footer">
        <button
          *ngFor="let period of periods"
          [class.active]="selectedPeriod() === period"
          (click)="switchPeriod(period)">
          {{ period === 60 ? '1h' : period === 240 ? '4h' : '24h' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mini-chart-container {
      background: var(--card-bg, #1e2433);
      border-radius: 8px;
      padding: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .chart-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .exchange-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .chart-wrapper {
      flex: 1;
      min-height: 300px;
    }

    .chart-footer {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      justify-content: center;
    }

    .chart-footer button {
      padding: 4px 12px;
      border: 1px solid var(--border-color, #374151);
      background: transparent;
      color: var(--text-secondary, #9ca3af);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .chart-footer button:hover {
      background: var(--hover-bg, #374151);
    }

    .chart-footer button.active {
      background: var(--primary-color, #3b82f6);
      color: white;
      border-color: var(--primary-color, #3b82f6);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundingRateMiniChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  @Input({ required: true }) symbol!: string;
  @Input({ required: true }) exchange!: string;

  selectedPeriod = signal<60 | 240 | 1440>(60); // 1h, 4h, 24h (in minutes)
  periods: (60 | 240 | 1440)[] = [60, 240, 1440];

  private chart: IChartApi | null = null;
  private candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
  private isDestroyed = false;
  private wsDisconnect: (() => void) | null = null;
  private currentCandle: CandlestickData | null = null;

  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private wsService = inject(ExchangeWebSocketService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    console.log(`[FundingRateMiniChart] Init for ${this.symbol} on ${this.exchange}`);
  }

  ngAfterViewInit(): void {
    // Initialize chart and load data
    setTimeout(() => {
      if (!this.isDestroyed) {
        console.log(`[FundingRateMiniChart] AfterViewInit - initializing chart for ${this.symbol} on ${this.exchange}`);
        this.initializeChart();
        this.loadData();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    console.log(`[FundingRateMiniChart] Destroying component for ${this.symbol} on ${this.exchange}`);
    this.isDestroyed = true;

    // Disconnect WebSocket
    if (this.wsDisconnect) {
      this.wsDisconnect();
      this.wsDisconnect = null;
    }

    // Remove chart
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  switchPeriod(period: 60 | 240 | 1440): void {
    if (this.selectedPeriod() === period) return;
    this.selectedPeriod.set(period);
    this.loadData();
  }

  private initializeChart(): void {
    if (!this.chartContainer || this.isDestroyed) {
      console.warn(`[FundingRateMiniChart] Cannot initialize chart - chartContainer: ${!!this.chartContainer}, isDestroyed: ${this.isDestroyed}`);
      return;
    }

    const container = this.chartContainer.nativeElement as HTMLElement;
    console.log(`[FundingRateMiniChart] Initializing chart in container:`, container, `width: ${container.clientWidth}, height: ${container.clientHeight}`);

    const theme = this.themeService.currentTheme();
    const colors = this.getChartColors(theme);

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 10,
        minBarSpacing: 0.5,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        visible: true,
      },
      localization: {
        locale: 'uk-UA',
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${day}.${month} ${hours}:${minutes}`;
        },
        priceFormatter: (price: number) => price.toFixed(2) + ' $',
      },
    });

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (this.chart && entries.length > 0) {
        const { width } = entries[0].contentRect;
        this.chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);
  }

  /**
   * Get chart colors based on current theme
   */
  private getChartColors(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      return {
        background: '#1e1e1e',
        textColor: '#f9fafb',
        gridColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      };
    } else {
      return {
        background: '#ffffff',
        textColor: '#111827',
        gridColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#e5e7eb',
      };
    }
  }

  /**
   * Connect to WebSocket for real-time funding rate updates
   */
  private connectWebSocket(): void {
    if (this.isDestroyed || !this.candlestickSeries) return;

    // Convert symbol format: "BTC/USDT" -> "BTCUSDT" for WebSocket
    const normalizedSymbol = this.symbol.replace(/\//g, '');

    console.log(`[FundingRateMiniChart] Connecting WebSocket for ${this.symbol} (normalized: ${normalizedSymbol}) on ${this.exchange}`);

    this.wsDisconnect = this.wsService.connect(
      this.exchange,
      normalizedSymbol,
      (data: WebSocketData) => {
        if (this.isDestroyed || !this.candlestickSeries) return;

        // Update current 1-minute candle with new price
        if (data.price) {
          const now = Date.now();
          const currentMinute = Math.floor(now / 60000) * 60; // Round to minute
          const timestamp = currentMinute as Time;

          if (!this.currentCandle || this.currentCandle.time !== timestamp) {
            // New candle
            this.currentCandle = {
              time: timestamp,
              open: data.price,
              high: data.price,
              low: data.price,
              close: data.price
            };
          } else {
            // Update existing candle
            this.currentCandle.high = Math.max(this.currentCandle.high, data.price);
            this.currentCandle.low = Math.min(this.currentCandle.low, data.price);
            this.currentCandle.close = data.price;
          }

          console.log(`[FundingRateMiniChart] WebSocket candle update:`, this.currentCandle);
          this.candlestickSeries.update(this.currentCandle);
        }
      },
      (error) => {
        console.error(`[FundingRateMiniChart] WebSocket error for ${this.exchange}:`, error);
      }
    );
  }

  private async loadData(): Promise<void> {
    if (this.isDestroyed || !this.candlestickSeries) {
      console.log(`[FundingRateMiniChart] Cannot load data - destroyed: ${this.isDestroyed}, candlestickSeries: ${!!this.candlestickSeries}`);
      return;
    }

    try {
      const periodMinutes = this.selectedPeriod();

      // Convert symbol format: "BTC/USDT" -> "BTCUSDT" for API
      const normalizedSymbol = this.symbol.replace(/\//g, '');

      console.log(`[FundingRateMiniChart] Loading 1m candles for ${this.symbol} (normalized: ${normalizedSymbol}) on ${this.exchange}, period: ${periodMinutes} minutes`);

      // Calculate limit: number of 1-minute candles
      const limit = periodMinutes;

      const url = `/api/arbitrage/candles?symbol=${normalizedSymbol}&exchange=${this.exchange}&interval=1m&limit=${limit}`;
      console.log(`[FundingRateMiniChart] Request URL: ${url}`);

      const response = await this.http.get<{ success: boolean; data: CandleData[] }>(url).toPromise();

      console.log(`[FundingRateMiniChart] Response:`, response);

      if (!response?.success || !response?.data || response.data.length === 0) {
        console.warn('[FundingRateMiniChart] No data received');
        return;
      }

      const candles = response.data;
      console.log(`[FundingRateMiniChart] Received ${candles.length} candles`);
      console.log(`[FundingRateMiniChart] Raw data sample:`, candles.slice(0, 3));

      // Convert to candlestick chart format
      const chartData: CandlestickData[] = candles.map((candle: CandleData) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      }));

      console.log(`[FundingRateMiniChart] Chart data (first 3):`, chartData.slice(0, 3));
      console.log(`[FundingRateMiniChart] Checking for NaN timestamps:`, chartData.filter(d => isNaN(d.time as number)).length);

      this.candlestickSeries.setData(chartData);
      this.chart?.timeScale().fitContent();

      console.log(`[FundingRateMiniChart] ✅ Data loaded successfully, chart updated`);

      // Manually trigger change detection for OnPush strategy
      this.cdr.detectChanges();

      // Connect WebSocket for real-time updates after loading historical data
      this.connectWebSocket();
    } catch (error) {
      console.error('[FundingRateMiniChart] Error loading data:', error);
    }
  }
}
