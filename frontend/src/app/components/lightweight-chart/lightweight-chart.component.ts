import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createChart, CandlestickData, ColorType, CandlestickSeries, ISeriesApi, IChartApi, Time, UTCTimestamp } from 'lightweight-charts';
import { ThemeService } from '../../services/theme.service';
import { BybitService } from '../../services/bybit.service';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import { SelectComponent, SelectOption } from '../ui/select/select.component';
import { DropdownComponent, DropdownOption } from '../ui/dropdown/dropdown.component';
import { ButtonComponent } from '../ui/button/button.component';

/**
 * Grid trading bot configuration for chart visualization
 */
export interface GridConfig {
  symbol: string;
  upperBound: number;
  lowerBound: number;
  gridCount: number;
  gridSpacing: number;
  strategyType: string;
}

/**
 * Chart data format for initial data input
 */
export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Lightweight Chart Component - Real-time candlestick chart visualization
 *
 * This component provides a professional-grade candlestick chart using the lightweight-charts
 * library (v5). It displays real-time cryptocurrency market data with:
 * - Real-time candlestick updates via WebSocket
 * - Historical data loading via REST API
 * - Grid line visualization for trading strategies
 * - Theme switching (light/dark mode)
 * - Automatic reconnection and fallback handling
 *
 * The component follows the pattern:
 * 1. Fetch initial historical data (REST API)
 * 2. Subscribe to real-time updates (WebSocket)
 * 3. On first emission: setData() to load all candles
 * 4. On subsequent emissions: update() to modify last candle only
 *
 * @example
 * ```html
 * <app-lightweight-chart
 *   [symbol]="'BTCUSDT'"
 *   [chartHeight]="600"
 *   [gridConfig]="gridConfig"
 *   (symbolChange)="onSymbolChange($event)">
 * </app-lightweight-chart>
 * ```
 *
 * @see {@link BybitService} for data source
 * @see WEBSOCKET_DATA_FLOW.md for complete data flow documentation
 */
@Component({
  selector: 'app-lightweight-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent, DropdownComponent, ButtonComponent],
  templateUrl: './lightweight-chart.component.html',
  styleUrl: './lightweight-chart.component.scss'
})
export class LightweightChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // Core chart inputs
  @Input() symbol: string = 'BTCUSDT';
  @Input() initialData: ChartData[] = [];
  @Input() gridConfig?: GridConfig;
  @Input() chartHeight: number = 600;

  // Trading dashboard integration inputs
  @Input() showCredentialSelector: boolean = false;
  @Input() showSymbolSelector: boolean = false;
  @Input() showMarketTypeSelector: boolean = false;
  @Input() showEnvironmentBadge: boolean = false;
  @Input() credentialOptions: DropdownOption[] = [];
  @Input() symbolOptions: DropdownOption[] = [];
  @Input() isLoadingSymbols: boolean = false;
  @Input() environment: 'TESTNET' | 'MAINNET' = 'TESTNET';

  // Outputs
  @Output() symbolChange = new EventEmitter<string>();
  @Output() credentialChange = new EventEmitter<string>();
  @Output() marketTypeChange = new EventEmitter<string>();

  // Internal state for selectors
  selectedCredentialId: string = '';
  selectedMarketType: string = 'spot';

  // Market type options
  marketTypeOptions: DropdownOption[] = [
    { value: 'spot', label: 'Spot' },
    { value: 'linear', label: 'Futures (USDT)' },
    { value: 'inverse', label: 'Futures (Inverse)' }
  ];

  private chart: IChartApi | null = null;
  private candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
  private gridLines: any[] = [];
  private dataSubscription?: Subscription;

  // Component state
  loading = false;
  error: string | null = null;
  currentSymbol = this.symbol;

  // WebSocket connection status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  connectionStatusText = 'Disconnected';

  // Chart configuration
  showVolume = false;
  showGrid = true;
  chartType: 'candlestick' | 'line' = 'candlestick';

  // Theme integration
  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor(
    private themeService: ThemeService,
    private bybitService: BybitService,
    private translationService: TranslationService
  ) {
    // React to theme changes
    effect(() => {
      const isDark = this.isDark();
      if (this.chart) {
        this.updateChartTheme(isDark);
      }
    });

    // Subscribe to WebSocket connection status
    this.bybitService.getWebSocketConnectionState().subscribe(status => {
      this.connectionStatus = status;
      switch (status) {
        case 'disconnected':
          this.connectionStatusText = this.translate('chart.disconnected');
          break;
        case 'connecting':
          this.connectionStatusText = this.translate('chart.connecting');
          break;
        case 'connected':
          this.connectionStatusText = this.translate('chart.live');
          break;
      }
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.currentSymbol = this.symbol;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    // Unsubscribe from WebSocket data
    if (this.symbol) {
      const symbol = this.getSymbolForApi();
      this.bybitService.unsubscribeFromRealtimeKline(symbol, '1');
    }

    // Clean up chart
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  private initializeChart(): void {
    console.log('=== CHART INITIALIZATION START ===');
    console.log('Chart container:', this.chartContainer?.nativeElement);

    if (!this.chartContainer?.nativeElement) {
      this.error = this.translate('chart.containerNotFound');
      console.error('Chart container not found!');
      return;
    }

    try {
      this.loading = true;
      this.error = null;
      console.log('Loading state set to true, starting chart creation...');

      const isDark = this.isDark();
      const container = this.chartContainer.nativeElement;

      // Ensure container has dimensions
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        container.style.width = '100%';
        container.style.height = this.chartHeight + 'px';
      }

      this.chart = createChart(container, {
        width: container.clientWidth || 800,
        height: this.chartHeight,
        // this.translateService.currentLanguage(),
        // hide_side_toolbar: false,
        // hide_top_toolbar: false,
        // hide_legend: false,
        layout: {
          background: {
            type: ColorType.Solid,
            color: isDark ? '#1e1e1e' : '#ffffff',
          },
          textColor: isDark ? '#d1d4dc' : '#191919',
        },
        grid: {
          vertLines: {
            color: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 0.5)',
          },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 1)',
        },
        timeScale: {
          borderColor: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 1)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add candlestick series using lightweight-charts v5 API
      try {
        console.log('Creating candlestick series...');

        // In v5, use addSeries() with CandlestickSeries type
        this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        console.log('Candlestick series created successfully:', this.candlestickSeries);

        // Load real market data from Bybit
        this.loadMarketData();
      } catch (seriesError) {
        console.error('Failed to add candlestick series:', seriesError);
        this.error = this.translate('chart.failedToCreateSeries') + ': ' + (seriesError as Error).message;
        return;
      }

      // Add grid lines if grid config is provided
      if (this.gridConfig && this.showGrid) {
        this.addGridLines();
      }

      // Handle resize
      this.setupResizeHandler();

      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.error = this.translate('chart.failedToInitialize') + ': ' + (error as Error).message;
      console.error('Chart initialization error:', error);
    }
  }

  private updateChartTheme(isDark: boolean): void {
    if (!this.chart) return;

    this.chart.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? '#1e1e1e' : '#ffffff',
        },
        textColor: isDark ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 0.5)',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 1)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(197, 203, 206, 1)',
      },
    });
  }

  private loadMarketData(): void {
    if (!this.candlestickSeries) {
      console.error('No series available to load data');
      return;
    }

    // Show loading state
    this.loading = true;
    this.error = null;

    // Get the symbol for the API call
    const symbol = this.getSymbolForApi();
    console.log(`Loading real-time market data for symbol: ${symbol}`);

    // Clean up existing subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    // Track if this is the first data load
    let isFirstLoad = true;

    // Subscribe to real-time Bybit data (REST + WebSocket)
    console.log('[CHART] Subscribing to real-time kline data...');
    this.dataSubscription = this.bybitService.getRealTimeKlineData(symbol, '1').subscribe({
      next: (data) => {
        try {
          console.log(`[CHART] Received ${data.length} data points from Bybit (real-time)`);
          console.log('[CHART] First load:', isFirstLoad);
          console.log('[CHART] Last 3 candles:', data.slice(-3));

          // Validate data before setting
          if (!data || data.length === 0) {
            throw new Error('No data received from Bybit');
          }

          // Convert data to proper Time format for lightweight-charts
          const formattedData: CandlestickData<Time>[] = data.map(item => ({
            time: (typeof item.time === 'number' ? item.time : parseInt(item.time)) as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));

          console.log('[CHART] Formatted data, last candle:', formattedData[formattedData.length - 1]);

          if (this.candlestickSeries) {
            if (isFirstLoad) {
              // First load: set all data
              console.log('[CHART] Setting initial chart data with', formattedData.length, 'candles');
              this.candlestickSeries.setData(formattedData);
              isFirstLoad = false;

              // Auto-fit the chart to show all data
              if (this.chart) {
                this.chart.timeScale().fitContent();
              }

              console.log('[CHART] Initial data loaded successfully, waiting for updates...');
            } else {
              // Subsequent updates: update the last candle
              const lastCandle = formattedData[formattedData.length - 1];
              console.log('[CHART] *** UPDATING CHART WITH NEW CANDLE ***:', {
                time: new Date((lastCandle.time as number) * 1000).toISOString(),
                open: lastCandle.open,
                high: lastCandle.high,
                low: lastCandle.low,
                close: lastCandle.close
              });

              this.candlestickSeries.update(lastCandle);
              console.log('[CHART] *** CHART UPDATE COMPLETED ***');
            }
          } else {
            console.error('[CHART] No candlestick series available!');
          }

          // Hide loading state
          this.loading = false;
        } catch (error) {
          console.error('[CHART] Error processing real-time market data:', error);
          this.error = this.translate('chart.failedToProcess') + ': ' + (error as Error).message;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('[CHART] Error loading real-time market data from Bybit:', error);
        this.error = this.translate('chart.failedToLoadData');
        this.loading = false;

        // Fallback to REST API only
        this.loadFallbackData(symbol);
      }
    });

    console.log('[CHART] Subscription created successfully');
  }

  /**
   * Fallback method to load data using REST API only
   */
  private loadFallbackData(symbol: string): void {
    console.log('Loading fallback data using REST API only...');

    this.dataSubscription = this.bybitService.getKlineData(symbol).subscribe({
      next: (data) => {
        try {
          console.log(`Received ${data.length} fallback data points`);

          if (!data || data.length === 0) {
            throw new Error('No fallback data received');
          }

          // Convert data to proper Time format for lightweight-charts
          const formattedData: CandlestickData<Time>[] = data.map(item => ({
            time: (typeof item.time === 'number' ? item.time : parseInt(item.time)) as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));

          if (this.candlestickSeries) {
            this.candlestickSeries.setData(formattedData);
          }

          if (this.chart) {
            this.chart.timeScale().fitContent();
          }

          this.loading = false;
          this.error = this.translate('chart.usingFallback');
        } catch (error) {
          console.error('Error processing fallback data:', error);
          this.error = this.translate('chart.failedToLoadAny') + ': ' + (error as Error).message;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading fallback data:', error);
        this.error = this.translate('chart.failedAllSources');
        this.loading = false;
      }
    });
  }

  /**
   * Convert component symbol format to Bybit API format
   */
  private getSymbolForApi(): string {
    if (!this.symbol) {
      return 'BTCUSDT';
    }

    // Remove slash if present (BTC/USDT -> BTCUSDT)
    const apiSymbol = this.symbol.replace('/', '');

    // Ensure it ends with USDT for spot trading
    if (!apiSymbol.endsWith('USDT')) {
      return apiSymbol + 'USDT';
    }

    return apiSymbol;
  }

  private loadData(data: ChartData[]): void {
    if (!this.candlestickSeries) return;

    const formattedData: CandlestickData<Time>[] = data.map(item => ({
      time: (typeof item.time === 'number' ? item.time : parseInt(item.time)) as UTCTimestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    this.candlestickSeries.setData(formattedData);
  }

  private addGridLines(): void {
    if (!this.chart || !this.gridConfig) return;

    try {
      // Clear existing grid lines
      this.gridLines.forEach(line => {
        try {
          this.candlestickSeries?.removePriceLine(line);
        } catch (e) {
          console.warn('Failed to remove grid line:', e);
        }
      });
      this.gridLines = [];

      const { upperBound, lowerBound, gridCount } = this.gridConfig;
      const priceStep = (upperBound - lowerBound) / (gridCount - 1);

      for (let i = 0; i < gridCount; i++) {
        const price = lowerBound + (i * priceStep);

        try {
          // Use price lines instead of line series for grid
          const priceLine = this.candlestickSeries?.createPriceLine({
            price: price,
            color: this.isDark() ? 'rgba(255, 82, 82, 0.3)' : 'rgba(255, 82, 82, 0.5)',
            lineWidth: 1,
            lineStyle: 2, // Dashed line
            axisLabelVisible: false,
            title: `Grid ${i + 1}`,
          });

          if (priceLine) {
            this.gridLines.push(priceLine);
          }
        } catch (lineError) {
          console.warn('Failed to add grid line:', lineError);
        }
      }
    } catch (error) {
      console.error('Error adding grid lines:', error);
    }
  }

  private setupResizeHandler(): void {
    const resizeObserver = new ResizeObserver(entries => {
      if (this.chart && entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        this.chart.applyOptions({ width, height: this.chartHeight });
      }
    });

    if (this.chartContainer?.nativeElement) {
      resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  // Public methods
  updateSymbol(): void {
    if (this.currentSymbol && this.currentSymbol.trim()) {
      // Unsubscribe from old symbol
      if (this.symbol) {
        const oldSymbol = this.getSymbolForApi();
        this.bybitService.unsubscribeFromRealtimeKline(oldSymbol, '1');
      }

      // Update symbol and reload data
      this.symbol = this.currentSymbol.trim();
      this.symbolChange.emit(this.symbol);
      this.loadMarketData(); // Load real-time market data from Bybit
    }
  }

  /**
   * Handle symbol selection from dropdown
   */
  onSymbolSelect(symbol: string): void {
    console.log('Symbol selected from dropdown:', symbol);
    this.currentSymbol = symbol;
    this.updateSymbol();
  }

  /**
   * Handle credential change from dropdown
   */
  onCredentialChange(credentialId: string): void {
    console.log('Credential changed in chart:', credentialId);
    this.selectedCredentialId = credentialId;
    this.credentialChange.emit(credentialId);
  }

  /**
   * Handle market type change from dropdown
   */
  onMarketTypeChange(marketType: string): void {
    console.log('Market type changed:', marketType);
    this.selectedMarketType = marketType;
    this.marketTypeChange.emit(marketType);
  }

  toggleGrid(): void {
    this.showGrid = !this.showGrid;
    if (this.showGrid && this.gridConfig) {
      this.addGridLines();
    } else {
      this.gridLines.forEach(line => {
        try {
          this.candlestickSeries?.removePriceLine(line);
        } catch (e) {
          console.warn('Failed to remove grid line:', e);
        }
      });
      this.gridLines = [];
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  updateGridConfig(config: GridConfig): void {
    this.gridConfig = config;
    if (this.showGrid) {
      this.addGridLines();
    }
  }

  retry(): void {
    this.error = null;
    this.initializeChart();
  }
}
