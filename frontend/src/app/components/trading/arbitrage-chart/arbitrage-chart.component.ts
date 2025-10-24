import { Component, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { createChart, IChartApi, ISeriesApi, LineData, Time, LineSeries } from 'lightweight-charts';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { ExchangeCredentialsService } from '../../../services/exchange-credentials.service';
import { ExchangeType } from '../../../models/exchange-credentials.model';
import { SymbolInfoService, SymbolInfo } from '../../../services/symbol-info.service';
import { TradingSettingsService } from '../../../services/trading-settings.service';
import { getEndpointUrl, buildUrlWithQuery } from '../../../config/app.config';
import * as pako from 'pako';

interface ExchangeData {
  exchange: string;
  price: number;
  fundingRate: string;
  nextFundingTime: number;
  fundingInterval?: number; // Funding interval in milliseconds (e.g., 8h = 28800000ms)
  lastUpdate: Date;
}

interface ArbitragePosition {
  positionId: string;
  symbol: string;
  primary: {
    exchange: string;
    side: string;
    leverage: number;
    quantity: number;
    environment: string;
    // Funding data
    lastFundingPaid?: number;      // Last paid funding in USDT
    totalFundingEarned?: number;   // Total sum of all fundings in USDT
    tradingFees?: number;           // Trading fees on this exchange
    // Liquidation data
    liquidationPrice?: number;      // Liquidation price for this position
    proximityRatio?: number;        // Proximity to liquidation (0.0-1.0+)
    inDanger?: boolean;             // True if within 10% of liquidation
    entryPrice?: number;            // Entry price for this position
    currentPrice?: number;          // Current market price
  };
  hedge: {
    exchange: string;
    side: string;
    leverage: number;
    quantity: number;
    environment: string;
    // Funding data
    lastFundingPaid?: number;      // Last paid funding in USDT
    totalFundingEarned?: number;   // Total sum of all fundings in USDT
    tradingFees?: number;           // Trading fees on this exchange
    // Liquidation data
    liquidationPrice?: number;      // Liquidation price for this position
    proximityRatio?: number;        // Proximity to liquidation (0.0-1.0+)
    inDanger?: boolean;             // True if within 10% of liquidation
    entryPrice?: number;            // Entry price for this position
    currentPrice?: number;          // Current market price
  };
  graduatedEntry: {
    parts: number;
    delayMs: number;
  };
  startedAt: Date;
  status: string;
  // Financial metrics
  grossProfit?: number;            // Total funding earned (primary + hedge)
  netProfit?: number;              // Gross profit - fees
}

/**
 * Arbitrage Chart Component
 *
 * Displays comparative charts for arbitrage opportunities between two exchanges
 * with real-time WebSocket data
 */
@Component({
  selector: 'app-arbitrage-chart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent
  ],
  templateUrl: './arbitrage-chart.component.html',
  styleUrl: './arbitrage-chart.component.scss'
})
export class ArbitrageChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // Route parameters
  symbol = signal<string>('');
  primaryExchange = signal<string>('');
  hedgeExchange = signal<string>('');

  // Loading state
  loading = signal<boolean>(true);
  loadingHistoricalData = signal<boolean>(false);

  // Exchange data
  primaryData = signal<ExchangeData>({
    exchange: '',
    price: 0,
    fundingRate: '0.0000',
    nextFundingTime: 0,
    lastUpdate: new Date()
  });

  hedgeData = signal<ExchangeData>({
    exchange: '',
    price: 0,
    fundingRate: '0.0000',
    nextFundingTime: 0,
    lastUpdate: new Date()
  });

  // Spread calculation
  spread = signal<number>(0);
  spreadPercent = signal<string>('0.0000');
  fundingSpread = signal<number>(0); // Funding rate spread in percentage

  // Order forms
  primaryOrderForm!: FormGroup;
  hedgeOrderForm!: FormGroup;
  isSubmittingOrder = signal<boolean>(false);

  // Credentials validation
  hasPrimaryCredentials = signal<boolean>(false);
  hasHedgeCredentials = signal<boolean>(false);
  credentialsWarning = signal<string>('');

  // Exchange balances
  primaryBalance = signal<{totalBalance: string; availableBalance: string; loading: boolean}>({
    totalBalance: '0',
    availableBalance: '0',
    loading: false
  });
  hedgeBalance = signal<{totalBalance: string; availableBalance: string; loading: boolean}>({
    totalBalance: '0',
    availableBalance: '0',
    loading: false
  });

  // Active positions
  activePositions = signal<ArbitragePosition[]>([]);

  // Filtered positions - only show positions for current symbol
  filteredActivePositions = computed(() => {
    const currentSymbol = this.symbol();
    const allPositions = this.activePositions();

    // If no symbol selected, show all positions
    if (!currentSymbol) {
      return allPositions;
    }

    // Filter positions that match the current symbol
    const filtered = allPositions.filter(pos => pos.symbol === currentSymbol);
    console.log(`[ArbitrageChart] Filtering positions: ${allPositions.length} total, ${filtered.length} for ${currentSymbol}`);
    return filtered;
  });

  // Expanded rows state (set of position IDs)
  expandedRows = signal<Set<string>>(new Set());

  // Symbol info and validation
  primarySymbolInfo = signal<SymbolInfo | null>(null);
  hedgeSymbolInfo = signal<SymbolInfo | null>(null);
  primaryValidation = signal<{valid: boolean; error?: string; suggestion?: string}>({valid: true});
  hedgeValidation = signal<{valid: boolean; error?: string; suggestion?: string}>({valid: true});

  // Timeframe selection
  selectedTimeframe = signal<string>('1m');
  timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' }
  ];

  // Quantity unit selection (coin vs USDT)
  primaryQuantityUnit = signal<'coin' | 'usdt'>('usdt');
  hedgeQuantityUnit = signal<'coin' | 'usdt'>('usdt');
  primaryDropdownOpen = signal<boolean>(false);
  hedgeDropdownOpen = signal<boolean>(false);

  // Order parameters synchronization lock
  orderParamsLocked = signal<boolean>(true); // Default: locked (synchronized)

  // Chart
  private chart: IChartApi | null = null;
  private primarySeries: ISeriesApi<'Line'> | null = null;
  private hedgeSeries: ISeriesApi<'Line'> | null = null;
  private chartInitRetries = 0;
  private readonly MAX_CHART_INIT_RETRIES = 10;
  private resizeObserver: ResizeObserver | null = null;

  // Last candle tracking for timeframe synchronization
  private lastPrimaryCandle: { time: number; price: number } | null = null;
  private lastHedgeCandle: { time: number; price: number } | null = null;

  // WebSocket connections
  private primaryWs: WebSocket | null = null;
  private hedgeWs: WebSocket | null = null;
  private reconnectTimeout: any;

  // BingX funding rates storage
  private bingxFundingRates = new Map<string, { fundingRate: string; fundingTime: number }>();
  private fundingRateRefreshInterval: any;

  // Track previous funding times to calculate intervals
  private previousPrimaryFundingTime: number | null = null;
  private previousHedgeFundingTime: number | null = null;

  // MEXC ping intervals
  private mexcPingIntervals = new Map<string, any>();

  // Destroyed flag to prevent updates after component destruction
  private isDestroyed = false;

  // Flags to prevent circular synchronization
  private isSyncingQuantity = false;
  private isSyncingSide = false;
  private isSyncingLeverage = false;
  private isSyncingGraduatedParts = false;
  private isSyncingGraduatedDelay = false;

  // Flag to track if user has manually selected sides
  private hasManualSideSelection = false;

  // Services
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private credentialsService = inject(ExchangeCredentialsService);
  private symbolInfoService = inject(SymbolInfoService);
  private tradingSettings = inject(TradingSettingsService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Watch for theme changes and update chart colors
    effect(() => {
      const theme = this.themeService.currentTheme();
      console.log('[ArbitrageChart] Theme changed to:', theme);
      if (this.chart) {
        this.applyThemeToChart(theme);
      }
    });
  }

  ngOnInit(): void {
    // Get default values from global settings
    const defaultLeverage = this.tradingSettings.getLeverage();
    const defaultGraduatedParts = this.tradingSettings.getGraduatedParts();
    const defaultGraduatedDelayMs = this.tradingSettings.getGraduatedDelayMs();
    // Convert milliseconds to seconds for UI display
    const defaultGraduatedDelaySec = defaultGraduatedDelayMs / 1000;

    // Initialize order forms with graduated entry fields
    this.primaryOrderForm = new FormGroup({
      side: new FormControl('long', Validators.required),
      leverage: new FormControl(defaultLeverage, [Validators.required, Validators.min(1), Validators.max(125)]),
      quantity: new FormControl(0, [Validators.required, Validators.min(0.001)]),
      graduatedParts: new FormControl(defaultGraduatedParts, [Validators.required, Validators.min(1), Validators.max(20)]),
      graduatedDelayMs: new FormControl(defaultGraduatedDelaySec, [Validators.required, Validators.min(0.1), Validators.max(60)])
    });

    this.hedgeOrderForm = new FormGroup({
      side: new FormControl('short', Validators.required),
      leverage: new FormControl(defaultLeverage, [Validators.required, Validators.min(1), Validators.max(125)]),
      quantity: new FormControl(0, [Validators.required, Validators.min(0.001)]),
      graduatedParts: new FormControl(defaultGraduatedParts, [Validators.required, Validators.min(1), Validators.max(20)]),
      graduatedDelayMs: new FormControl(defaultGraduatedDelaySec, [Validators.required, Validators.min(0.1), Validators.max(60)])
    });

    // Get route parameters
    this.route.params.subscribe(params => {
      this.symbol.set(params['symbol'] || '');
      this.primaryExchange.set(params['primary'] || '');
      this.hedgeExchange.set(params['hedge'] || '');

      console.log('[ArbitrageChart] Loaded with params:', {
        symbol: this.symbol(),
        primary: this.primaryExchange(),
        hedge: this.hedgeExchange()
      });

      // Initialize exchange data
      this.primaryData.set({
        ...this.primaryData(),
        exchange: this.primaryExchange()
      });

      this.hedgeData.set({
        ...this.hedgeData(),
        exchange: this.hedgeExchange()
      });

      // Check credentials for both exchanges
      this.checkExchangeCredentials();

      // Load active positions
      this.loadActivePositions();

      // Load account balances
      this.loadBalances();

      // Fetch symbol info for both exchanges
      this.fetchSymbolInfo();

      // Set up form value watchers for real-time validation
      this.setupFormValidation();

      // Start loading
      setTimeout(() => {
        this.loading.set(false);
      }, 500);
    });

    // Add click listener to close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.quantity-unit-dropdown')) {
        this.primaryDropdownOpen.set(false);
        this.hedgeDropdownOpen.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    // Wait for loading to complete
    setTimeout(async () => {
      this.initializeChart();

      // Load historical data first
      await this.loadHistoricalData();

      // Then connect WebSockets for real-time updates
      this.connectWebSockets();
    }, 600);
  }

  ngOnDestroy(): void {
    // Set destroyed flag to prevent updates after cleanup
    this.isDestroyed = true;

    // Cleanup
    this.disconnectWebSockets();

    // Clear MEXC ping intervals (redundant with disconnectWebSockets, but safe)
    this.mexcPingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.mexcPingIntervals.clear();

    // Clear funding rate refresh interval
    if (this.fundingRateRefreshInterval) {
      clearInterval(this.fundingRateRefreshInterval);
      this.fundingRateRefreshInterval = null;
    }

    // Clear Gate.io API refresh interval
    if (this.gateioRefreshInterval) {
      clearInterval(this.gateioRefreshInterval);
      this.gateioRefreshInterval = undefined;
    }

    // Remove resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Remove chart last to ensure all updates are blocked
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }

    // Nullify series
    this.primarySeries = null;
    this.hedgeSeries = null;
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
   * Apply theme colors to chart
   */
  private applyThemeToChart(theme: 'light' | 'dark'): void {
    // Guard against updates after component destruction
    if (this.isDestroyed || !this.chart) {
      return;
    }

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

    console.log('[ArbitrageChart] Applied theme colors:', theme, colors);
  }

  /**
   * Initialize TradingView Lightweight Chart
   */
  private initializeChart(): void {
    if (!this.chartContainer) {
      console.error('[ArbitrageChart] Chart container not found');
      return;
    }

    const chartElement = this.chartContainer.nativeElement;

    // Ensure container has dimensions (similar to lightweight-chart component)
    if (chartElement.clientWidth === 0 || chartElement.clientHeight === 0) {
      this.chartInitRetries++;
      if (this.chartInitRetries >= this.MAX_CHART_INIT_RETRIES) {
        console.error('[ArbitrageChart] Failed to initialize chart after', this.MAX_CHART_INIT_RETRIES, 'retries');
        // Set explicit dimensions as fallback
        chartElement.style.width = '100%';
        chartElement.style.height = '500px';
      } else {
        console.warn(`[ArbitrageChart] Container has no dimensions, retrying in 200ms... (attempt ${this.chartInitRetries}/${this.MAX_CHART_INIT_RETRIES})`);
        setTimeout(() => this.initializeChart(), 200);
        return;
      }
    }

    const containerWidth = chartElement.clientWidth || 800;
    console.log('[ArbitrageChart] Initializing chart with width:', containerWidth);
    this.chartInitRetries = 0; // Reset retry counter on success

    // Get current theme colors
    const theme = this.themeService.currentTheme();
    const colors = this.getChartColors(theme);

    // Create chart
    this.chart = createChart(chartElement, {
      width: containerWidth,
      height: 500,
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
        secondsVisible: false, // Will be toggled based on timeframe
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
        locale: 'uk-UA', // Ukrainian locale for date/time formatting
        timeFormatter: (time: number) => {
          // Convert Unix timestamp (seconds) to JavaScript Date (milliseconds)
          const date = new Date(time * 1000);

          // Use local time zone
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');

          // Format based on timeframe
          const timeframe = this.selectedTimeframe();
          if (timeframe === '1m' || timeframe === '5m') {
            // Show hours:minutes:seconds for short timeframes
            return `${hours}:${minutes}:${seconds}`;
          } else if (timeframe === '15m' || timeframe === '1h') {
            // Show hours:minutes for medium timeframes
            return `${hours}:${minutes}`;
          } else {
            // For 4h and 1d, show date + time
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}.${month} ${hours}:${minutes}`;
          }
        },
        priceFormatter: (price: number) => {
          // Format price with 4 decimal places
          return price.toFixed(4);
        },
      },
    });

    // Add Primary Exchange series (blue line)
    this.primarySeries = this.chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: this.primaryExchange(),
    });

    // Add Hedge Exchange series (purple line)
    this.hedgeSeries = this.chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 2,
      title: this.hedgeExchange(),
    });

    // Handle window resize with ResizeObserver (better than window.addEventListener)
    this.setupResizeHandler();
  }

  /**
   * Setup ResizeObserver for automatic chart resizing
   */
  private setupResizeHandler(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      // Guard against updates after component destruction
      if (this.isDestroyed || !this.chart) {
        return;
      }

      if (entries.length > 0) {
        const { width } = entries[0].contentRect;
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
   * Connect to WebSocket for real-time price data
   */
  private async connectWebSockets(): Promise<void> {
    const symbol = this.symbol();
    const primaryExchange = this.primaryExchange().toUpperCase();
    const hedgeExchange = this.hedgeExchange().toUpperCase();

    console.log('[ArbitrageChart] Connecting WebSockets for', { symbol, primaryExchange, hedgeExchange });

    // If either exchange is BingX, fetch funding rates first
    if (primaryExchange === 'BINGX' || hedgeExchange === 'BINGX') {
      await this.fetchBingXFundingRates();

      // Set up periodic refresh for BingX funding rates (every 5 minutes)
      this.fundingRateRefreshInterval = setInterval(() => {
        if (!this.isDestroyed) {
          console.log('[ArbitrageChart] Refreshing BingX funding rates...');
          this.fetchBingXFundingRates();
        }
      }, 5 * 60 * 1000); // 5 minutes

      console.log('[ArbitrageChart] BingX funding rate refresh interval set (5 minutes)');
    }

    // Connect to Primary Exchange
    this.connectExchangeWebSocket(
      primaryExchange,
      symbol,
      (price: number, fundingRate?: string, nextFundingTime?: number) => {
        this.updatePrimaryData(price, fundingRate, nextFundingTime);
      }
    );

    // Connect to Hedge Exchange
    this.connectExchangeWebSocket(
      hedgeExchange,
      symbol,
      (price: number, fundingRate?: string, nextFundingTime?: number) => {
        this.updateHedgeData(price, fundingRate, nextFundingTime);
      }
    );
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
   * Connect to specific exchange WebSocket
   */
  private connectExchangeWebSocket(
    exchange: string,
    symbol: string,
    onUpdate: (price: number, fundingRate?: string, nextFundingTime?: number) => void
  ): void {
    let ws: WebSocket | null = null;

    // Determine WebSocket URL based on exchange
    let wsUrl = '';
    let subscribeMessage: any = null;

    switch (exchange) {
      case 'BYBIT':
        wsUrl = 'wss://stream.bybit.com/v5/public/linear';
        subscribeMessage = {
          op: 'subscribe',
          args: [`tickers.${symbol}`]
        };
        break;

      case 'BINGX':
        // Convert symbol to BingX format (e.g., BTCUSDT -> BTC-USDT)
        const bingxSymbol = this.normalizeSymbolForBingX(symbol);
        wsUrl = 'wss://open-api-swap.bingx.com/swap-market';
        subscribeMessage = {
          id: Date.now().toString(),
          reqType: 'sub',
          dataType: `${bingxSymbol}@ticker`
        };
        console.log(`[ArbitrageChart] BingX symbol normalized: ${symbol} -> ${bingxSymbol}`);
        break;

      case 'MEXC':
        // Convert symbol to MEXC format (e.g., BTCUSDT -> BTC_USDT)
        const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT').replace(/USDC$/, '_USDC');
        // Correct MEXC futures WebSocket URL
        wsUrl = 'wss://contract.mexc.com/edge';
        subscribeMessage = {
          method: 'sub.ticker',
          param: {
            symbol: mexcSymbol
          }
        };
        console.log(`[ArbitrageChart] MEXC symbol normalized: ${symbol} -> ${mexcSymbol}`);
        break;

      case 'OKX':
        wsUrl = 'wss://ws.okx.com:8443/ws/v5/public';
        subscribeMessage = {
          op: 'subscribe',
          args: [{
            channel: 'tickers',
            instId: symbol
          }]
        };
        break;

      case 'GATEIO':
        // Gate.io doesn't have public WebSocket for funding rates
        // Use REST API data from our backend instead
        this.connectGateIOViaAPI(symbol, onUpdate);
        return;

      default:
        console.warn(`[ArbitrageChart] Unsupported exchange: ${exchange}`);
        // Simulate data for unsupported exchanges
        this.simulateExchangeData(exchange, symbol, onUpdate);
        return;
    }

    // Create WebSocket connection
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`[ArbitrageChart] ${exchange} WebSocket connected`);
      if (ws && subscribeMessage) {
        console.log(`[ArbitrageChart] ${exchange} subscribing with:`, subscribeMessage);
        ws.send(JSON.stringify(subscribeMessage));
      }

      // For MEXC, start ping interval to keep connection alive
      // MEXC requires ping every 15-20 seconds or connection closes after 1 minute
      if (exchange === 'MEXC') {
        const pingInterval = setInterval(() => {
          if (!this.isDestroyed && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'ping' }));
            console.log(`[ArbitrageChart] MEXC Ping sent`);
          }
        }, 15000); // Send ping every 15 seconds

        this.mexcPingIntervals.set(exchange, pingInterval);
        console.log(`[ArbitrageChart] MEXC ping interval started (15s)`);
      }
    };

    ws.onmessage = async (event) => {
      try {
        let messageData: string;

        // Handle Blob data (BingX sends data as gzip-compressed Blob)
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          try {
            // Try to decompress with pako
            const decompressed = pako.inflate(uint8Array, { to: 'string' });
            messageData = decompressed;
          } catch (decompressError) {
            // If decompression fails, try as plain text
            console.warn(`[ArbitrageChart] ${exchange} decompression failed, trying as plain text:`, decompressError);
            messageData = await event.data.text();
          }
        } else {
          messageData = event.data;
        }

        // Handle BingX Ping/Pong
        if (exchange === 'BINGX' && messageData === 'Ping') {
          if (ws) {
            ws.send('Pong');
            console.log(`[ArbitrageChart] BingX Pong sent`);
          }
          return;
        }

        const data = JSON.parse(messageData);

        // Handle MEXC Pong response (server responds to our ping)
        if (exchange === 'MEXC' && data.channel === 'pong') {
          console.log(`[ArbitrageChart] MEXC Pong received:`, data.data);
          return;
        }

        // Debug logging for BingX
        if (exchange === 'BINGX') {
          console.log(`[ArbitrageChart] BingX WebSocket message:`, data);
        }

        this.handleExchangeMessage(exchange, data, onUpdate);
      } catch (error) {
        console.error(`[ArbitrageChart] ${exchange} message parse error:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[ArbitrageChart] ${exchange} WebSocket error:`, error);
    };

    ws.onclose = () => {
      console.log(`[ArbitrageChart] ${exchange} WebSocket closed`);
      // Only reconnect if component is not destroyed
      if (!this.isDestroyed) {
        this.reconnectTimeout = setTimeout(() => {
          if (!this.isDestroyed) {
            console.log(`[ArbitrageChart] Reconnecting ${exchange}...`);
            this.connectExchangeWebSocket(exchange, symbol, onUpdate);
          }
        }, 5000);
      }
    };

    // Store WebSocket reference
    if (exchange === this.primaryExchange().toUpperCase()) {
      this.primaryWs = ws;
    } else {
      this.hedgeWs = ws;
    }
  }

  /**
   * Handle exchange-specific message format
   */
  private handleExchangeMessage(
    exchange: string,
    data: any,
    onUpdate: (price: number, fundingRate?: string, nextFundingTime?: number) => void
  ): void {
    let price: number | null = null;
    let fundingRate: string | undefined;
    let nextFundingTime: number | undefined;

    switch (exchange) {
      case 'BYBIT':
        if (data.topic && data.topic.startsWith('tickers.') && data.data) {
          // Bybit sends two types of messages:
          // - "snapshot": full ticker data with all fields
          // - "delta": partial updates with only changed fields
          // We only process messages that have lastPrice (typically snapshots or deltas with price updates)

          if (!data.data.lastPrice) {
            // Delta messages without lastPrice are normal - just skip silently
            // Only log if it's a snapshot message without lastPrice (unusual)
            if (data.type === 'snapshot') {
              console.warn(`[ArbitrageChart] BYBIT snapshot missing lastPrice:`, data);
            }
            return;
          }

          price = parseFloat(data.data.lastPrice);
          fundingRate = data.data.fundingRate;

          // Validate price is a valid number
          if (isNaN(price) || price <= 0) {
            console.error(`[ArbitrageChart] BYBIT invalid price after parsing:`, {
              type: data.type,
              rawLastPrice: data.data.lastPrice,
              parsedPrice: price,
              fullData: data
            });
            return;
          }

          // Parse nextFundingTime - ensure it's a valid number
          if (data.data.nextFundingTime) {
            const parsedTime = typeof data.data.nextFundingTime === 'string'
              ? parseInt(data.data.nextFundingTime)
              : Number(data.data.nextFundingTime);

            if (!isNaN(parsedTime) && parsedTime > 0) {
              nextFundingTime = parsedTime;
            }
          }

          console.log(`[ArbitrageChart] BYBIT ticker parsed (${data.type || 'unknown'}):`, {
            rawLastPrice: data.data.lastPrice,
            parsedPrice: price,
            rawNextFundingTime: data.data.nextFundingTime,
            nextFundingTime: nextFundingTime,
            fundingRate: fundingRate
          });
        } else {
          console.warn(`[ArbitrageChart] BYBIT message format not recognized:`, data);
        }
        break;

      case 'BINGX':
        // BingX ticker format: { "dataType": "BTC-USDT@ticker", "data": { "c": "50000.5", "E": timestamp } }
        if (data.dataType && data.dataType.includes('@ticker') && data.data) {
          const tickerData = data.data;
          price = parseFloat(tickerData.c); // 'c' = close/last price

          // Debug logging
          console.log(`[ArbitrageChart] BingX price parsed:`, {
            rawC: tickerData.c,
            parsedPrice: price,
            isValid: !isNaN(price) && price > 0
          });

          // Get funding rate from stored map (BingX ticker doesn't include funding rates)
          const symbolForLookup = data.dataType.split('@')[0]; // Extract symbol from dataType
          const fundingData = this.getBingXFundingRate(symbolForLookup);
          fundingRate = fundingData.fundingRate;
          nextFundingTime = fundingData.nextFundingTime;

          console.log(`[ArbitrageChart] BingX funding data for ${symbolForLookup}:`, {
            fundingRate,
            nextFundingTime
          });
        } else {
          console.warn(`[ArbitrageChart] BingX message format not recognized:`, data);
        }
        break;

      case 'MEXC':
        // Debug logging for MEXC
        console.log(`[ArbitrageChart] MEXC WebSocket message:`, data);

        if (data.channel === 'push.ticker' && data.data) {
          // MEXC format: { channel: "push.ticker", data: { lastPrice, fundingRate, ... } }
          price = parseFloat(data.data.lastPrice);

          // Convert funding rate to string (MEXC returns numeric fundingRate)
          if (data.data.fundingRate !== undefined && data.data.fundingRate !== null) {
            fundingRate = data.data.fundingRate.toString();
          }

          // MEXC doesn't provide nextFundingTime in ticker, funding happens every 8 hours
          // Calculate next funding time (funding times: 00:00, 08:00, 16:00 UTC)
          const now = new Date();
          const currentHour = now.getUTCHours();
          let nextFundingHour: number;

          if (currentHour < 8) {
            nextFundingHour = 8;
          } else if (currentHour < 16) {
            nextFundingHour = 16;
          } else {
            nextFundingHour = 24; // Next day 00:00
          }

          const nextFunding = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            nextFundingHour % 24,
            0,
            0
          ));

          if (nextFundingHour === 24) {
            nextFunding.setUTCDate(nextFunding.getUTCDate() + 1);
          }

          nextFundingTime = nextFunding.getTime();

          console.log(`[ArbitrageChart] MEXC price parsed:`, {
            rawLastPrice: data.data.lastPrice,
            parsedPrice: price,
            rawFundingRate: data.data.fundingRate,
            fundingRate: fundingRate,
            nextFundingTime: nextFundingTime,
            nextFundingTimeFormatted: new Date(nextFundingTime).toISOString(),
            isValid: !isNaN(price) && price > 0
          });
        } else {
          console.warn(`[ArbitrageChart] MEXC message format not recognized:`, data);
        }
        break;

      case 'OKX':
        if (data.arg && data.arg.channel === 'tickers' && data.data && data.data[0]) {
          price = parseFloat(data.data[0].last);
          fundingRate = data.data[0].fundingRate;
          nextFundingTime = parseInt(data.data[0].nextFundingTime);
        }
        break;
    }

    if (price !== null && price > 0) {
      console.log(`[ArbitrageChart] ${exchange} calling onUpdate with:`, { price, fundingRate, nextFundingTime });
      onUpdate(price, fundingRate, nextFundingTime);
    } else {
      console.warn(`[ArbitrageChart] ${exchange} price invalid or zero:`, price);
    }
  }

  /**
   * Connect to Gate.io via our backend API (no direct WebSocket support)
   */
  private async connectGateIOViaAPI(
    symbol: string,
    onUpdate: (price: number, fundingRate?: string, nextFundingTime?: number) => void
  ): Promise<void> {
    const fetchGateIOData = async () => {
      try {
        const url = '/api/gateio/public-funding-rates';
        const response = await this.http.get<any>(url).toPromise();

        if (response && Array.isArray(response)) {
          // Find our symbol in the response
          const normalizedSymbol = symbol.replace('USDT', '_USDT').replace('USDC', '_USDC');
          const symbolData = response.find((item: any) => 
            item.name === normalizedSymbol || item.symbol === normalizedSymbol
          );

          if (symbolData) {
            const price = parseFloat(symbolData.last_price || symbolData.lastPrice || '0');
            const fundingRate = symbolData.funding_rate || symbolData.fundingRate;
            const nextFundingTime = (symbolData.funding_next_apply || symbolData.nextFundingTime) * 1000; // Convert to ms

            if (price > 0) {
              console.log(`[ArbitrageChart] Gate.io data updated:`, {
                symbol: normalizedSymbol,
                price,
                fundingRate,
                nextFundingTime
              });
              onUpdate(price, fundingRate, nextFundingTime);
            }
          } else {
            console.warn(`[ArbitrageChart] Gate.io symbol not found: ${normalizedSymbol}`);
          }
        }
      } catch (error) {
        console.error('[ArbitrageChart] Gate.io API error:', error);
      }
    };

    // Initial fetch
    await fetchGateIOData();

    // Refresh every 30 seconds (not real-time like WebSocket, but proper data)
    const interval = setInterval(() => {
      if (!this.isDestroyed) {
        fetchGateIOData();
      }
    }, 30000);

    // Store interval for cleanup
    if (!this.gateioRefreshInterval) {
      this.gateioRefreshInterval = interval;
    }
  }

  /**
   * Simulate data for testing or unsupported exchanges
   */
  private simulateExchangeData(
    exchange: string,
    symbol: string,
    onUpdate: (price: number, fundingRate?: string, nextFundingTime?: number) => void
  ): void {
    let basePrice = 50000 + Math.random() * 1000;

    setInterval(() => {
      // Random price fluctuation
      basePrice += (Math.random() - 0.5) * 100;
      const fundingRate = (Math.random() * 0.001 - 0.0005).toFixed(6);
      const nextFundingTime = Date.now() + 8 * 60 * 60 * 1000; // 8 hours from now

      onUpdate(basePrice, fundingRate, nextFundingTime);
    }, 2000); // Update every 2 seconds
  }

  /**
   * Fetch BingX funding rates via REST API
   * BingX doesn't include funding rates in ticker WebSocket, so we need a separate call
   */
  private async fetchBingXFundingRates(): Promise<void> {
    try {
      console.log('[ArbitrageChart] Fetching BingX funding rates...');
      const token = this.authService.authState().token;
      if (!token) {
        console.warn('[ArbitrageChart] No auth token available, cannot fetch BingX funding rates');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = getEndpointUrl('bingx', 'fundingRates');
      const response = await this.http.get<any>(url, { headers }).toPromise();

      if (response?.success && response?.data) {
        console.log(`[ArbitrageChart] Received ${response.data.length} BingX funding rates`);

        // Store funding rates in map for quick lookup
        this.bingxFundingRates.clear();
        response.data.forEach((item: any) => {
          this.bingxFundingRates.set(item.symbol, {
            fundingRate: item.fundingRate,
            fundingTime: item.fundingTime
          });
        });

        console.log(`[ArbitrageChart] Stored ${this.bingxFundingRates.size} BingX funding rates in map`);
      } else {
        console.warn('[ArbitrageChart] Invalid BingX funding rates response:', response);
      }
    } catch (error) {
      console.error('[ArbitrageChart] Failed to fetch BingX funding rates:', error);
    }
  }

  /**
   * Get BingX funding rate for a symbol
   */
  private getBingXFundingRate(symbol: string): { fundingRate?: string; nextFundingTime?: number } {
    const fundingData = this.bingxFundingRates.get(symbol);
    if (fundingData) {
      return {
        fundingRate: fundingData.fundingRate,
        nextFundingTime: fundingData.fundingTime
      };
    }
    return {};
  }

  /**
   * Load historical price data for chart initialization
   */
  private async loadHistoricalData(): Promise<void> {
    // Guard against updates after component destruction
    if (this.isDestroyed) {
      return;
    }

    try {
      this.loadingHistoricalData.set(true);
      console.log('[ArbitrageChart] Loading historical data...');

      const token = this.authService.authState().token;
      if (!token) {
        console.warn('[ArbitrageChart] No auth token available, skipping historical data');
        return;
      }

      const symbol = this.symbol();
      const primaryExchange = this.primaryExchange();
      const hedgeExchange = this.hedgeExchange();
      const interval = this.selectedTimeframe();

      // Calculate limit based on interval to get ~3 months of data
      const limitMap: { [key: string]: number } = {
        '1m': 4320,   // 3 days (too much for 3 months, API limits)
        '5m': 2160,   // 7.5 days
        '15m': 2016,  // 3 weeks
        '1h': 2160,   // 3 months
        '4h': 540,    // 3 months
        '1d': 90      // 3 months
      };

      const limit = limitMap[interval] || 1000;

      console.log(`[ArbitrageChart] Fetching ${limit} ${interval} candles for ${symbol}`);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = buildUrlWithQuery(
        getEndpointUrl('arbitrage', 'historicalPrices'),
        {
          symbol,
          primaryExchange,
          hedgeExchange,
          interval,
          limit
        }
      );

      const response = await this.http.get<any>(url, { headers }).toPromise();

      if (response?.success && response?.data) {
        const primaryHistory = response.data.primary || [];
        const hedgeHistory = response.data.hedge || [];

        console.log(`[ArbitrageChart] Loaded ${primaryHistory.length} primary and ${hedgeHistory.length} hedge data points`);

        // Convert to LineData format and set initial data (only if not destroyed)
        if (!this.isDestroyed && this.primarySeries && primaryHistory.length > 0) {
          const primaryData = primaryHistory.map((item: any) => ({
            time: item.time as Time,
            value: item.price
          }));
          this.primarySeries.setData(primaryData);
          console.log('[ArbitrageChart] Primary series data set');
        }

        if (!this.isDestroyed && this.hedgeSeries && hedgeHistory.length > 0) {
          const hedgeData = hedgeHistory.map((item: any) => ({
            time: item.time as Time,
            value: item.price
          }));
          this.hedgeSeries.setData(hedgeData);
          console.log('[ArbitrageChart] Hedge series data set');
        }

        // Fit chart to show all historical data
        if (!this.isDestroyed) {
          this.fitContent();
        }

      } else {
        console.warn('[ArbitrageChart] Invalid historical data response:', response);
      }

    } catch (error) {
      console.error('[ArbitrageChart] Failed to load historical data:', error);
    } finally {
      if (!this.isDestroyed) {
        this.loadingHistoricalData.set(false);
      }
    }
  }

  /**
   * Update primary exchange data
   */
  private updatePrimaryData(price: number, fundingRate?: string, nextFundingTime?: number): void {
    // Guard against updates after component destruction
    if (this.isDestroyed || !this.chart || !this.primarySeries) {
      return;
    }

    // Calculate funding interval if we have both previous and current nextFundingTime
    let fundingInterval = this.primaryData().fundingInterval;

    if (nextFundingTime && this.previousPrimaryFundingTime && nextFundingTime !== this.previousPrimaryFundingTime) {
      // New funding cycle detected - calculate interval
      const interval = nextFundingTime - this.previousPrimaryFundingTime;

      // Only update if interval is reasonable (between 1h and 24h)
      if (interval >= 3600000 && interval <= 86400000) {
        fundingInterval = interval;
        console.log(`[ArbitrageChart] Primary funding interval calculated: ${interval}ms (${interval / 3600000}h)`);
      }
    } else if (!fundingInterval && nextFundingTime) {
      // First time or no interval calculated yet - try to detect from funding time hour
      fundingInterval = this.detectFundingInterval(nextFundingTime);
    }

    // Update previous funding time tracker
    if (nextFundingTime) {
      this.previousPrimaryFundingTime = nextFundingTime;
    }

    const updatedData = {
      exchange: this.primaryExchange(),
      price,
      fundingRate: fundingRate || this.primaryData().fundingRate,
      nextFundingTime: nextFundingTime || this.primaryData().nextFundingTime,
      fundingInterval: fundingInterval,
      lastUpdate: new Date()
    };

    console.log('[ArbitrageChart] Updating primary data:', updatedData);

    this.primaryData.set(updatedData);

    // Get current timestamp in seconds and round to timeframe interval
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const roundedTime = this.roundTimeToInterval(currentTimestamp);

    // Check if this is a new candle period
    const isNewCandle = !this.lastPrimaryCandle || this.lastPrimaryCandle.time !== roundedTime;

    if (isNewCandle) {
      // New candle period - update chart
      if (this.primarySeries) {
        const time = roundedTime as Time;
        this.primarySeries.update({ time, value: price } as LineData);
        console.log(`[ArbitrageChart] Primary new candle: ${new Date(roundedTime * 1000).toISOString()}, price: ${price}`);
      }

      // Update last candle tracker
      this.lastPrimaryCandle = {
        time: roundedTime,
        price: price
      };
    } else {
      // Same candle period - update the current candle with latest price
      if (this.primarySeries) {
        const time = roundedTime as Time;
        this.primarySeries.update({ time, value: price } as LineData);
      }

      // Update tracker with latest price (guaranteed to exist since isNewCandle is false)
      if (this.lastPrimaryCandle) {
        this.lastPrimaryCandle.price = price;
      }
    }

    // Recalculate spread
    this.calculateSpread();
  }

  /**
   * Update hedge exchange data
   */
  private updateHedgeData(price: number, fundingRate?: string, nextFundingTime?: number): void {
    // Guard against updates after component destruction
    if (this.isDestroyed || !this.chart || !this.hedgeSeries) {
      return;
    }

    // Calculate funding interval if we have both previous and current nextFundingTime
    let fundingInterval = this.hedgeData().fundingInterval;

    if (nextFundingTime && this.previousHedgeFundingTime && nextFundingTime !== this.previousHedgeFundingTime) {
      // New funding cycle detected - calculate interval
      const interval = nextFundingTime - this.previousHedgeFundingTime;

      // Only update if interval is reasonable (between 1h and 24h)
      if (interval >= 3600000 && interval <= 86400000) {
        fundingInterval = interval;
        console.log(`[ArbitrageChart] Hedge funding interval calculated: ${interval}ms (${interval / 3600000}h)`);
      }
    } else if (!fundingInterval && nextFundingTime) {
      // First time or no interval calculated yet - try to detect from funding time hour
      fundingInterval = this.detectFundingInterval(nextFundingTime);
    }

    // Update previous funding time tracker
    if (nextFundingTime) {
      this.previousHedgeFundingTime = nextFundingTime;
    }

    const updatedData = {
      exchange: this.hedgeExchange(),
      price,
      fundingRate: fundingRate || this.hedgeData().fundingRate,
      nextFundingTime: nextFundingTime || this.hedgeData().nextFundingTime,
      fundingInterval: fundingInterval,
      lastUpdate: new Date()
    };

    console.log('[ArbitrageChart] Updating hedge data:', updatedData);

    this.hedgeData.set(updatedData);

    // Get current timestamp in seconds and round to timeframe interval
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const roundedTime = this.roundTimeToInterval(currentTimestamp);

    // Check if this is a new candle period
    const isNewCandle = !this.lastHedgeCandle || this.lastHedgeCandle.time !== roundedTime;

    if (isNewCandle) {
      // New candle period - update chart
      if (this.hedgeSeries) {
        const time = roundedTime as Time;
        this.hedgeSeries.update({ time, value: price } as LineData);
        console.log(`[ArbitrageChart] Hedge new candle: ${new Date(roundedTime * 1000).toISOString()}, price: ${price}`);
      }

      // Update last candle tracker
      this.lastHedgeCandle = {
        time: roundedTime,
        price: price
      };
    } else {
      // Same candle period - update the current candle with latest price
      if (this.hedgeSeries) {
        const time = roundedTime as Time;
        this.hedgeSeries.update({ time, value: price } as LineData);
      }

      // Update tracker with latest price (guaranteed to exist since isNewCandle is false)
      if (this.lastHedgeCandle) {
        this.lastHedgeCandle.price = price;
      }
    }

    // Recalculate spread
    this.calculateSpread();
  }

  /**
   * Calculate price spread
   */
  private calculateSpread(): void {
    const primary = this.primaryData().price;
    const hedge = this.hedgeData().price;

    if (primary > 0 && hedge > 0) {
      const spreadValue = Math.abs(primary - hedge);
      const spreadPct = ((spreadValue / primary) * 100).toFixed(4);

      this.spread.set(spreadValue);
      this.spreadPercent.set(spreadPct);
    }

    // Also calculate funding spread
    this.calculateFundingSpread();
  }

  /**
   * Calculate funding rate spread (difference between funding rates)
   * Also automatically set optimal sides based on funding rates
   */
  private calculateFundingSpread(): void {
    const primaryRateStr = this.primaryData().fundingRate;
    const hedgeRateStr = this.hedgeData().fundingRate;

    // Handle null/undefined values properly
    const primaryRate = (primaryRateStr && primaryRateStr !== 'null') ? parseFloat(primaryRateStr) : NaN;
    const hedgeRate = (hedgeRateStr && hedgeRateStr !== 'null') ? parseFloat(hedgeRateStr) : NaN;

    if (!isNaN(primaryRate) && !isNaN(hedgeRate)) {
      // Funding spread = primaryFundingRate - hedgeFundingRate
      // Note: Funding rates are already in decimal format (e.g., -0.009629 = -0.9629%)
      // So we don't multiply by 100 here - that's done in display formatting
      const spreadValue = primaryRate - hedgeRate;
      this.fundingSpread.set(spreadValue);

      // Automatically set optimal sides based on funding rates
      this.setOptimalSides(primaryRate, hedgeRate);
    } else {
      // If either rate is unavailable, set spread to 0 or NaN
      this.fundingSpread.set(NaN);
    }
  }

  /**
   * Automatically set optimal position sides based on funding rates
   * Higher funding rate -> Short (receive more or pay less)
   * Lower funding rate -> Long (receive more or pay less)
   * Only applies automatic selection if user hasn't manually chosen sides
   */
  private setOptimalSides(primaryRate: number, hedgeRate: number): void {
    // Don't override manual user selection
    if (this.hasManualSideSelection) {
      console.log('[ArbitrageChart] Skipping automatic side selection - user has manually selected sides');
      return;
    }

    // Prevent side synchronization during automatic setting
    this.isSyncingSide = true;

    if (primaryRate > hedgeRate) {
      // Primary has higher funding rate -> Primary = Short, Hedge = Long
      this.primaryOrderForm.patchValue({ side: 'short' }, { emitEvent: false });
      this.hedgeOrderForm.patchValue({ side: 'long' }, { emitEvent: false });
    } else {
      // Hedge has higher funding rate (or equal) -> Primary = Long, Hedge = Short
      this.primaryOrderForm.patchValue({ side: 'long' }, { emitEvent: false });
      this.hedgeOrderForm.patchValue({ side: 'short' }, { emitEvent: false });
    }

    this.isSyncingSide = false;

    console.log('[ArbitrageChart] Optimal sides set based on funding rates:', {
      primaryRate,
      hedgeRate,
      primarySide: this.primaryOrderForm.get('side')?.value,
      hedgeSide: this.hedgeOrderForm.get('side')?.value
    });
  }

  /**
   * Disconnect all WebSockets
   */
  private disconnectWebSockets(): void {
    if (this.primaryWs) {
      this.primaryWs.close();
      this.primaryWs = null;
    }

    if (this.hedgeWs) {
      this.hedgeWs.close();
      this.hedgeWs = null;
    }

    // Clear all MEXC ping intervals
    this.mexcPingIntervals.forEach((interval, exchange) => {
      clearInterval(interval);
      console.log(`[ArbitrageChart] ${exchange} ping interval cleared`);
    });
    this.mexcPingIntervals.clear();
  }

  /**
   * Parse float value
   */
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  /**
   * Format funding rate for display
   * Using the exact same logic as working arbitrage-funding page
   */
  formatFundingRate(rate: string): string {
    const rateNum = parseFloat(rate);
    return (rateNum * 100).toFixed(4) + '%';
  }

  /**
   * Get color class for funding rate
   * Negative (paying) = red, Positive (receiving) = green
   * Using the exact same logic as working arbitrage-funding page
   */
  getFundingRateColorClass(rate: string): string {
    const rateNum = parseFloat(rate);
    if (rateNum < 0) return 'text-red-600 dark:text-red-400';
    if (rateNum > 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Format funding spread for display
   */
  formatFundingSpread(): string {
    const spread = this.fundingSpread();
    if (isNaN(spread)) {
      return 'N/A';
    }
    const sign = spread > 0 ? '+' : '';
    // Convert decimal to percentage for display (e.g., 0.001 -> 0.1000%)
    const percentageValue = spread * 100;
    return `${sign}${percentageValue.toFixed(4)}%`;
  }

  /**
   * Format next funding time
   */
  formatNextFundingTime(timestamp: number): string {
    if (!timestamp || timestamp === 0) return 'N/A';

    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Calculate time remaining until next funding
   * Using the exact same logic as working arbitrage-funding page
   */
  getTimeRemaining(timestamp: number): string {
    if (!timestamp || timestamp === 0) return 'N/A';

    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Detect funding interval based on the nextFundingTime hour
   * Returns interval in milliseconds
   */
  private detectFundingInterval(nextFundingTime: number): number {
    const fundingDate = new Date(nextFundingTime);
    const hour = fundingDate.getUTCHours();

    // Check for common funding schedules:
    // 8h intervals: 00:00, 08:00, 16:00 UTC
    // 4h intervals: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC
    // 1h intervals: every hour

    if (hour % 8 === 0) {
      // Likely 8h interval
      return 8 * 60 * 60 * 1000; // 8 hours
    } else if (hour % 4 === 0) {
      // Likely 4h interval
      return 4 * 60 * 60 * 1000; // 4 hours
    } else {
      // Default to 8h (most common)
      return 8 * 60 * 60 * 1000;
    }
  }

  /**
   * Format funding information in compact format: rate / time / interval
   * Example: -0.6869% / 02:30 / 8h
   */
  formatFundingInfo(rate: string, nextFundingTime: number): string {
    if (!rate && (!nextFundingTime || nextFundingTime === 0)) return 'N/A';

    // Format funding rate
    let rateFormatted = 'N/A';
    if (rate && rate !== 'null' && rate !== 'undefined') {
      const numRate = parseFloat(rate);
      if (!isNaN(numRate)) {
        rateFormatted = (numRate * 100).toFixed(4) + '%';
      }
    }

    // Format time remaining as HH:MM
    let timeFormatted = 'N/A';
    let remaining = 0;
    if (nextFundingTime && nextFundingTime > 0) {
      const now = Date.now();
      remaining = nextFundingTime - now;

      if (remaining <= 0) {
        timeFormatted = '00:00';
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    // Calculate funding interval dynamically based on time until next funding
    // This logic is taken from arbitrage-funding.component.ts to ensure consistency
    let intervalFormatted = '8h'; // Default
    if (remaining > 0) {
      if (remaining <= 1 * 60 * 60 * 1000) {
        intervalFormatted = '1h';
      } else if (remaining <= 4 * 60 * 60 * 1000) {
        intervalFormatted = '4h';
      }
      // else keep default '8h'
    }

    return `${rateFormatted} / ${timeFormatted} / ${intervalFormatted}`;
  }

  /**
   * Change timeframe
   */
  async changeTimeframe(timeframe: string): Promise<void> {
    // Guard against updates after component destruction
    if (this.isDestroyed) {
      return;
    }

    console.log('[ArbitrageChart] Changing timeframe to:', timeframe);
    this.selectedTimeframe.set(timeframe);

    // Update timeScale options based on timeframe
    if (!this.isDestroyed && this.chart) {
      const showSeconds = timeframe === '1m' || timeframe === '5m';
      this.chart.applyOptions({
        timeScale: {
          secondsVisible: showSeconds,
          timeVisible: true,
        },
      });
      console.log(`[ArbitrageChart] TimeScale updated - seconds visible: ${showSeconds}`);
    }

    // Reset candle trackers
    this.lastPrimaryCandle = null;
    this.lastHedgeCandle = null;

    // Clear chart data
    if (!this.isDestroyed && this.primarySeries && this.hedgeSeries) {
      this.primarySeries.setData([]);
      this.hedgeSeries.setData([]);
    }

    // Load historical data for new timeframe
    if (!this.isDestroyed) {
      await this.loadHistoricalData();
    }
  }


  /**
   * Get interval in milliseconds for timeframe
   */
  private getIntervalMs(timeframe: string): number {
    const intervals: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };

    return intervals[timeframe] || 60 * 1000; // Default to 1 minute
  }

  /**
   * Get interval in seconds for timeframe
   */
  private getIntervalSeconds(timeframe: string): number {
    return this.getIntervalMs(timeframe) / 1000;
  }

  /**
   * Round timestamp to timeframe interval
   * This ensures that all data points within the same candle period have the same timestamp
   */
  private roundTimeToInterval(timestamp: number): number {
    const intervalSeconds = this.getIntervalSeconds(this.selectedTimeframe());
    return Math.floor(timestamp / intervalSeconds) * intervalSeconds;
  }



  /**
   * Fit chart content to visible area
   */
  fitContent(): void {
    // Guard against updates after component destruction
    if (this.isDestroyed || !this.chart) {
      return;
    }

    this.chart.timeScale().fitContent();
  }

  /**
   * Navigate back to funding rates page
   */
  goBack(): void {
    this.router.navigate(['/arbitrage/funding']);
  }

  /**
   * Start arbitrage position on both exchanges simultaneously
   */
  async startArbitragePosition(): Promise<void> {
    // Validate both forms
    if (this.primaryOrderForm.invalid || this.hedgeOrderForm.invalid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    // Check order quantity validation
    const primaryValidation = this.primaryValidation();
    const hedgeValidation = this.hedgeValidation();

    if (!primaryValidation.valid) {
      alert(`Primary order validation failed:\n${primaryValidation.error}\n\nSuggestion: ${primaryValidation.suggestion}`);
      return;
    }

    if (!hedgeValidation.valid) {
      alert(`Hedge order validation failed:\n${hedgeValidation.error}\n\nSuggestion: ${hedgeValidation.suggestion}`);
      return;
    }

    // Check credentials
    if (!this.hasPrimaryCredentials() || !this.hasHedgeCredentials()) {
      alert(this.credentialsWarning() || 'Please configure exchange credentials in Profile -> Trading Platforms');
      return;
    }

    // Get form values
    const primaryOrder = this.primaryOrderForm.value;
    const hedgeOrder = this.hedgeOrderForm.value;

    console.log('[ArbitrageChart] Starting arbitrage position:', {
      symbol: this.symbol(),
      primary: {
        exchange: this.primaryExchange(),
        side: primaryOrder.side,
        leverage: primaryOrder.leverage,
        quantity: primaryOrder.quantity
      },
      hedge: {
        exchange: this.hedgeExchange(),
        side: hedgeOrder.side,
        leverage: hedgeOrder.leverage,
        quantity: hedgeOrder.quantity
      }
    });

    // Set loading state
    this.isSubmittingOrder.set(true);

    try {
      // Call backend API endpoint to start graduated entry arbitrage
      const token = this.authService.authState().token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = getEndpointUrl('arbitrage', 'graduatedEntry');

      // Convert quantities to coin units if they're in USDT (backend expects coin quantities)
      let primaryQuantityInCoins = primaryOrder.quantity;
      const primaryUnit = this.primaryQuantityUnit();
      const primaryPrice = this.primaryData().price;
      const primarySymbolInfo = this.primarySymbolInfo();
      
      if (primaryUnit === 'usdt' && primaryPrice > 0 && primarySymbolInfo) {
        let convertedQuantity = primaryOrder.quantity / primaryPrice;
        
        // Apply step rounding (same logic as validation)
        let qtyPerPart = convertedQuantity / (primaryOrder.graduatedParts || 5);
        
        if (primarySymbolInfo.qtyStep >= 1) {
          qtyPerPart = Math.round(qtyPerPart);
        } else {
          const stepDecimals = Math.max(0, -Math.log10(primarySymbolInfo.qtyStep));
          qtyPerPart = Math.round(qtyPerPart * Math.pow(10, stepDecimals)) / Math.pow(10, stepDecimals);
        }
        
        primaryQuantityInCoins = qtyPerPart * (primaryOrder.graduatedParts || 5);
        console.log(`[ArbitrageChart] Primary: Converting ${primaryOrder.quantity} USDT to ${primaryQuantityInCoins} coins`);
      }

      let hedgeQuantityInCoins = hedgeOrder.quantity;
      const hedgeUnit = this.hedgeQuantityUnit();
      const hedgePrice = this.hedgeData().price;
      const hedgeSymbolInfo = this.hedgeSymbolInfo();
      
      if (hedgeUnit === 'usdt' && hedgePrice > 0 && hedgeSymbolInfo) {
        let convertedQuantity = hedgeOrder.quantity / hedgePrice;
        
        // Apply step rounding (same logic as validation)
        let qtyPerPart = convertedQuantity / (hedgeOrder.graduatedParts || 5);
        
        if (hedgeSymbolInfo.qtyStep >= 1) {
          qtyPerPart = Math.round(qtyPerPart);
        } else {
          const stepDecimals = Math.max(0, -Math.log10(hedgeSymbolInfo.qtyStep));
          qtyPerPart = Math.round(qtyPerPart * Math.pow(10, stepDecimals)) / Math.pow(10, stepDecimals);
        }
        
        hedgeQuantityInCoins = qtyPerPart * (hedgeOrder.graduatedParts || 5);
        console.log(`[ArbitrageChart] Hedge: Converting ${hedgeOrder.quantity} USDT to ${hedgeQuantityInCoins} coins`);
      }

      const requestBody = {
        symbol: this.symbol(),
        primaryExchange: this.primaryExchange(),
        primarySide: primaryOrder.side,
        primaryLeverage: primaryOrder.leverage,
        primaryQuantity: primaryQuantityInCoins,
        hedgeExchange: this.hedgeExchange(),
        hedgeSide: hedgeOrder.side,
        hedgeLeverage: hedgeOrder.leverage,
        hedgeQuantity: hedgeQuantityInCoins,
        graduatedEntryParts: primaryOrder.graduatedParts || 5,  // Use form value or default to 5
        graduatedEntryDelayMs: (primaryOrder.graduatedDelayMs || 2) * 1000  // Convert seconds to milliseconds (default 2s = 2000ms)
      };

      console.log('[ArbitrageChart] Sending request to graduated entry API:', requestBody);

      const response = await this.http.post<any>(url, requestBody, { headers }).toPromise();

      if (response?.success) {
        console.log('[ArbitrageChart] Graduated entry started:', response.data);

        // Add position to active positions list with real funding data from backend
        const primaryLastFunding = response.data.primary.lastFundingPaid || 0;
        const primaryTotalFunding = response.data.primary.totalFundingEarned || 0;
        const primaryFees = response.data.primary.tradingFees || 0;

        const hedgeLastFunding = response.data.hedge.lastFundingPaid || 0;
        const hedgeTotalFunding = response.data.hedge.totalFundingEarned || 0;
        const hedgeFees = response.data.hedge.tradingFees || 0;

        const grossProfit = response.data.grossProfit || 0;
        const netProfit = response.data.netProfit || 0;

        const newPosition: ArbitragePosition = {
          positionId: response.data.positionId,
          symbol: response.data.symbol,
          primary: {
            ...response.data.primary,
            lastFundingPaid: primaryLastFunding,
            totalFundingEarned: primaryTotalFunding,
            tradingFees: primaryFees
          },
          hedge: {
            ...response.data.hedge,
            lastFundingPaid: hedgeLastFunding,
            totalFundingEarned: hedgeTotalFunding,
            tradingFees: hedgeFees
          },
          graduatedEntry: response.data.graduatedEntry,
          startedAt: new Date(),
          status: 'active',
          grossProfit: grossProfit,
          netProfit: netProfit
        };

        const updatedPositions = [...this.activePositions(), newPosition];
        this.activePositions.set(updatedPositions);

        alert(`Arbitrage position started successfully!\nPosition ID: ${response.data.positionId}`);

        // Reset manual side selection flag to allow automatic selection for next position
        this.hasManualSideSelection = false;

        // Reset forms after successful submission using global settings
        const defaultLeverage = this.tradingSettings.getLeverage();
        const defaultGraduatedParts = this.tradingSettings.getGraduatedParts();
        const defaultGraduatedDelayMs = this.tradingSettings.getGraduatedDelayMs();
        // Convert milliseconds to seconds for UI display
        const defaultGraduatedDelaySec = defaultGraduatedDelayMs / 1000;

        this.primaryOrderForm.reset({
          side: 'long',
          leverage: defaultLeverage,
          quantity: 0,
          graduatedParts: defaultGraduatedParts,
          graduatedDelayMs: defaultGraduatedDelaySec
        });

        this.hedgeOrderForm.reset({
          side: 'short',
          leverage: defaultLeverage,
          quantity: 0,
          graduatedParts: defaultGraduatedParts,
          graduatedDelayMs: defaultGraduatedDelaySec
        });
      } else {
        throw new Error(response?.error || 'Unknown error from server');
      }

    } catch (error: any) {
      console.error('[ArbitrageChart] Failed to start arbitrage position:', error);
      const errorMessage = error.error?.error || error.message || 'Unknown error';
      alert(`Failed to start arbitrage position: ${errorMessage}`);
    } finally {
      this.isSubmittingOrder.set(false);
    }
  }

  /**
   * Check if active credentials exist for both exchanges
   */
  private checkExchangeCredentials(): void {
    // Fetch credentials if not already loaded
    if (!this.credentialsService.hasCredentials()) {
      this.credentialsService.fetchCredentials().subscribe({
        next: () => {
          this.validateCredentials();
        },
        error: (err) => {
          console.error('[ArbitrageChart] Failed to fetch credentials:', err);
          this.hasPrimaryCredentials.set(false);
          this.hasHedgeCredentials.set(false);
          this.credentialsWarning.set('Failed to fetch exchange credentials');
        }
      });
    } else {
      this.validateCredentials();
    }
  }

  /**
   * Validate that active credentials exist for both exchanges
   */
  private validateCredentials(): void {
    const primaryExchangeType = this.primaryExchange().toUpperCase() as ExchangeType;
    const hedgeExchangeType = this.hedgeExchange().toUpperCase() as ExchangeType;

    // Check primary exchange credentials
    const primaryCred = this.credentialsService.getActiveCredentialForExchange(primaryExchangeType);
    this.hasPrimaryCredentials.set(!!primaryCred);

    // Check hedge exchange credentials
    const hedgeCred = this.credentialsService.getActiveCredentialForExchange(hedgeExchangeType);
    this.hasHedgeCredentials.set(!!hedgeCred);

    // Build warning message
    const warnings: string[] = [];
    if (!primaryCred) {
      warnings.push(`No active credentials for ${this.primaryExchange()}`);
    }
    if (!hedgeCred) {
      warnings.push(`No active credentials for ${this.hedgeExchange()}`);
    }

    if (warnings.length > 0) {
      this.credentialsWarning.set(warnings.join('. ') + '. Please configure in Profile -> Trading Platforms.');
    } else {
      this.credentialsWarning.set('');

      // Load balances if credentials are valid
      if (this.hasPrimaryCredentials()) {
        this.loadExchangeBalance(this.primaryExchange(), 'primary');
      }
      if (this.hasHedgeCredentials()) {
        this.loadExchangeBalance(this.hedgeExchange(), 'hedge');
      }
    }

    console.log('[ArbitrageChart] Credentials validation:', {
      primary: {
        exchange: this.primaryExchange(),
        hasCredentials: this.hasPrimaryCredentials()
      },
      hedge: {
        exchange: this.hedgeExchange(),
        hasCredentials: this.hasHedgeCredentials()
      },
      warning: this.credentialsWarning()
    });
  }

  /**
   * Load active arbitrage positions from backend
   */
  private async loadActivePositions(): Promise<void> {
    try {
      console.log('[ArbitrageChart] Loading active positions...');

      const token = this.authService.authState().token;
      if (!token) {
        console.warn('[ArbitrageChart] No auth token available, skipping position loading');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Get all non-completed positions (INITIALIZING, EXECUTING, ACTIVE, ERROR, LIQUIDATED, CANCELLED)
      const url = getEndpointUrl('arbitrage', 'graduatedEntry');
      const response = await this.http.get<any>(url, { headers }).toPromise();

      if (response?.success && response?.data) {
        console.log(`[ArbitrageChart] Loaded ${response.data.length} positions (excluding completed)`);

        // Transform backend positions to match our interface
        const positions: ArbitragePosition[] = response.data.map((pos: any) => {
          // Use actual data from backend (currently zeros until tracking is implemented)
          const primaryLastFunding = pos.primary.lastFundingPaid || 0;
          const primaryTotalFunding = pos.primary.totalFundingEarned || 0;
          const primaryFees = pos.primary.tradingFees || 0;

          const hedgeLastFunding = pos.hedge.lastFundingPaid || 0;
          const hedgeTotalFunding = pos.hedge.totalFundingEarned || 0;
          const hedgeFees = pos.hedge.tradingFees || 0;

          const grossProfit = pos.grossProfit || 0;
          const netProfit = pos.netProfit || 0;

          return {
            positionId: pos.positionId,
            symbol: pos.symbol,
            primary: {
              exchange: pos.primary.exchange,
              side: pos.primary.side,
              leverage: pos.primary.leverage,
              quantity: pos.primary.quantity,
              environment: pos.primary.environment || 'MAINNET',
              lastFundingPaid: primaryLastFunding,
              totalFundingEarned: primaryTotalFunding,
              tradingFees: primaryFees,
              // Price and liquidation data
              entryPrice: pos.primary.entryPrice,
              currentPrice: pos.primary.currentPrice,
              liquidationPrice: pos.primary.liquidationPrice,
              proximityRatio: pos.primary.proximityRatio,
              inDanger: pos.primary.inDanger
            },
            hedge: {
              exchange: pos.hedge.exchange,
              side: pos.hedge.side,
              leverage: pos.hedge.leverage,
              quantity: pos.hedge.quantity,
              environment: pos.hedge.environment || 'MAINNET',
              lastFundingPaid: hedgeLastFunding,
              totalFundingEarned: hedgeTotalFunding,
              tradingFees: hedgeFees,
              // Price and liquidation data
              entryPrice: pos.hedge.entryPrice,
              currentPrice: pos.hedge.currentPrice,
              liquidationPrice: pos.hedge.liquidationPrice,
              proximityRatio: pos.hedge.proximityRatio,
              inDanger: pos.hedge.inDanger
            },
            graduatedEntry: {
              parts: pos.graduatedEntry.parts,
              delayMs: pos.graduatedEntry.delayMs
            },
            startedAt: new Date(pos.startedAt),
            status: pos.status,
            grossProfit,
            netProfit
          };
        });

        this.activePositions.set(positions);
        console.log('[ArbitrageChart] Active positions loaded successfully');
      }
    } catch (error: any) {
      console.error('[ArbitrageChart] Failed to load active positions:', error);
      // Don't show error to user - positions just won't be displayed
    }
  }

  /**
   * Load account balances for both exchanges
   */
  private async loadBalances(): Promise<void> {
    // Load primary exchange balance
    if (this.primaryExchange() && this.hasPrimaryCredentials()) {
      await this.loadExchangeBalance(this.primaryExchange(), 'primary');
    }

    // Load hedge exchange balance
    if (this.hedgeExchange() && this.hasHedgeCredentials()) {
      await this.loadExchangeBalance(this.hedgeExchange(), 'hedge');
    }
  }

  /**
   * Load balance for a specific exchange
   */
  private async loadExchangeBalance(exchange: string, type: 'primary' | 'hedge'): Promise<void> {
    const balanceSignal = type === 'primary' ? this.primaryBalance : this.hedgeBalance;

    try {
      // Set loading state
      balanceSignal.set({
        ...balanceSignal(),
        loading: true
      });

      const token = this.authService.authState().token;
      if (!token) {
        console.warn(`[ArbitrageChart] No auth token available for ${type} balance`);
        balanceSignal.set({
          totalBalance: '0',
          availableBalance: '0',
          loading: false
        });
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = `/api/exchange/balance?exchange=${exchange}`;
      const response = await this.http.get<any>(url, { headers }).toPromise();

      if (response?.success && response?.data) {
        balanceSignal.set({
          totalBalance: response.data.totalBalance,
          availableBalance: response.data.availableBalance,
          loading: false
        });
        console.log(`[ArbitrageChart] ${type} balance loaded:`, response.data);
      } else {
        throw new Error(response?.error || 'Failed to load balance');
      }
    } catch (error: any) {
      console.error(`[ArbitrageChart] Failed to load ${type} balance:`, error);
      balanceSignal.set({
        totalBalance: '0',
        availableBalance: '0',
        loading: false
      });
    }
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  /**
   * Get exchange URL for opening in new window
   */
  getExchangeUrl(exchange: string): string {
    const symbol = this.symbol();
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
        return `https://www.gate.com/uk/futures/USDT/${gateioSymbol}`;
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
  openExchange(exchange: string): void {
    const url = this.getExchangeUrl(exchange);
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Toggle row expansion
   */
  toggleRowExpansion(positionId: string): void {
    const currentExpanded = new Set(this.expandedRows());

    if (currentExpanded.has(positionId)) {
      currentExpanded.delete(positionId);
    } else {
      currentExpanded.add(positionId);
    }

    this.expandedRows.set(currentExpanded);
  }

  /**
   * Toggle primary quantity dropdown
   */
  togglePrimaryQuantityDropdown(): void {
    this.primaryDropdownOpen.set(!this.primaryDropdownOpen());
    if (this.primaryDropdownOpen()) {
      this.hedgeDropdownOpen.set(false);
    }
  }

  /**
   * Toggle hedge quantity dropdown
   */
  toggleHedgeQuantityDropdown(): void {
    this.hedgeDropdownOpen.set(!this.hedgeDropdownOpen());
    if (this.hedgeDropdownOpen()) {
      this.primaryDropdownOpen.set(false);
    }
  }

  /**
   * Toggle order parameters synchronization lock
   */
  toggleOrderParamsLock(): void {
    const newState = !this.orderParamsLocked();
    this.orderParamsLocked.set(newState);
    console.log('[ArbitrageChart] Order params lock toggled:', newState ? 'locked' : 'unlocked');

    // If locking, synchronize all values from primary to hedge
    if (newState) {
      this.synchronizeAllFieldsToHedge();
    }
  }

  /**
   * Synchronize all order parameter fields from primary to hedge
   */
  private synchronizeAllFieldsToHedge(): void {
    console.log('[ArbitrageChart] Synchronizing all fields from primary to hedge');

    // Prevent circular updates
    this.isSyncingSide = true;
    this.isSyncingLeverage = true;
    this.isSyncingQuantity = true;
    this.isSyncingGraduatedParts = true;
    this.isSyncingGraduatedDelay = true;

    try {
      // Sync side (opposite)
      const primarySide = this.primaryOrderForm.get('side')?.value;
      const oppositeSide = primarySide === 'long' ? 'short' : 'long';
      this.hedgeOrderForm.patchValue({ side: oppositeSide }, { emitEvent: false });

      // Sync leverage
      const leverage = this.primaryOrderForm.get('leverage')?.value;
      this.hedgeOrderForm.patchValue({ leverage }, { emitEvent: false });

      // Sync quantity (with unit conversion if needed)
      const primaryUnit = this.primaryQuantityUnit();
      const hedgeUnit = this.hedgeQuantityUnit();
      const quantity = this.primaryOrderForm.get('quantity')?.value;

      let hedgeQuantity = quantity;
      if (primaryUnit !== hedgeUnit) {
        hedgeQuantity = this.convertQuantity(quantity, primaryUnit, hedgeUnit, 'primary');
      }
      this.hedgeOrderForm.patchValue({ quantity: hedgeQuantity }, { emitEvent: false });

      // Sync graduated parts
      const graduatedParts = this.primaryOrderForm.get('graduatedParts')?.value;
      this.hedgeOrderForm.patchValue({ graduatedParts }, { emitEvent: false });

      // Sync graduated delay
      const graduatedDelayMs = this.primaryOrderForm.get('graduatedDelayMs')?.value;
      this.hedgeOrderForm.patchValue({ graduatedDelayMs }, { emitEvent: false });

      console.log('[ArbitrageChart] All fields synchronized successfully');
    } finally {
      // Re-enable syncing flags
      this.isSyncingSide = false;
      this.isSyncingLeverage = false;
      this.isSyncingQuantity = false;
      this.isSyncingGraduatedParts = false;
      this.isSyncingGraduatedDelay = false;
    }
  }

  /**
   * Set primary quantity unit and convert existing value
   * Also synchronizes unit and quantity to hedge form
   */
  setPrimaryQuantityUnit(unit: 'coin' | 'usdt'): void {
    const currentUnit = this.primaryQuantityUnit();
    if (currentUnit === unit) return;

    const currentQuantity = this.primaryOrderForm.get('quantity')?.value || 0;

    // Convert primary quantity to new unit
    let convertedPrimaryQuantity = currentQuantity;
    if (currentQuantity > 0) {
      convertedPrimaryQuantity = this.convertQuantity(currentQuantity, currentUnit, unit, 'primary');
      this.primaryOrderForm.patchValue({ quantity: convertedPrimaryQuantity }, { emitEvent: false });
    }

    // Update primary unit
    this.primaryQuantityUnit.set(unit);
    this.primaryDropdownOpen.set(false);

    // Synchronize unit to hedge
    this.hedgeQuantityUnit.set(unit);

    // Convert hedge quantity to new unit
    const hedgeQuantity = this.hedgeOrderForm.get('quantity')?.value || 0;
    if (hedgeQuantity > 0) {
      const convertedHedgeQuantity = this.convertQuantity(hedgeQuantity, currentUnit, unit, 'hedge');
      this.hedgeOrderForm.patchValue({ quantity: convertedHedgeQuantity }, { emitEvent: false });
    }

    // Validate both forms after unit change
    this.validatePrimaryOrder();
    this.validateHedgeOrder();
  }

  /**
   * Set hedge quantity unit and convert existing value
   * Also synchronizes unit and quantity to primary form
   */
  setHedgeQuantityUnit(unit: 'coin' | 'usdt'): void {
    const currentUnit = this.hedgeQuantityUnit();
    if (currentUnit === unit) return;

    const currentQuantity = this.hedgeOrderForm.get('quantity')?.value || 0;

    // Convert hedge quantity to new unit
    let convertedHedgeQuantity = currentQuantity;
    if (currentQuantity > 0) {
      convertedHedgeQuantity = this.convertQuantity(currentQuantity, currentUnit, unit, 'hedge');
      this.hedgeOrderForm.patchValue({ quantity: convertedHedgeQuantity }, { emitEvent: false });
    }

    // Update hedge unit
    this.hedgeQuantityUnit.set(unit);
    this.hedgeDropdownOpen.set(false);

    // Synchronize unit to primary
    this.primaryQuantityUnit.set(unit);

    // Convert primary quantity to new unit
    const primaryQuantity = this.primaryOrderForm.get('quantity')?.value || 0;
    if (primaryQuantity > 0) {
      const convertedPrimaryQuantity = this.convertQuantity(primaryQuantity, currentUnit, unit, 'primary');
      this.primaryOrderForm.patchValue({ quantity: convertedPrimaryQuantity }, { emitEvent: false });
    }

    // Validate both forms after unit change
    this.validatePrimaryOrder();
    this.validateHedgeOrder();
  }

  /**
   * Convert quantity between coin and USDT
   */
  private convertQuantity(
    quantity: number, 
    fromUnit: 'coin' | 'usdt', 
    toUnit: 'coin' | 'usdt', 
    exchange: 'primary' | 'hedge'
  ): number {
    if (fromUnit === toUnit) return quantity;

    const price = exchange === 'primary' 
      ? parseFloat(String(this.primaryData().price || '0'))
      : parseFloat(String(this.hedgeData().price || '0'));

    if (price <= 0) return quantity;

    let result: number;
    if (fromUnit === 'coin' && toUnit === 'usdt') {
      // Convert from coin to USDT
      result = quantity * price;
    } else {
      // Convert from USDT to coin
      result = quantity / price;
      
      // Round to match exchange step requirements when converting to coin
      const symbolInfo = exchange === 'primary' ? this.primarySymbolInfo() : this.hedgeSymbolInfo();
      if (symbolInfo) {
        if (symbolInfo.qtyStep >= 1) {
          // For exchanges requiring whole numbers (like FUSDT), round to nearest integer
          result = Math.round(result);
        } else {
          // For exchanges with decimal steps, round to step precision
          const stepDecimals = Math.max(0, -Math.log10(symbolInfo.qtyStep));
          result = Math.round(result * Math.pow(10, stepDecimals)) / Math.pow(10, stepDecimals);
        }
      }
    }

    return result;
  }

  /**
   * Get coin symbol from full symbol (e.g., NVDAXUSDT -> NVDAX)
   */
  getCoinSymbol(): string {
    const symbol = this.symbol();
    if (symbol.endsWith('USDT')) {
      return symbol.slice(0, -4);
    }
    if (symbol.endsWith('USDC')) {
      return symbol.slice(0, -4);
    }
    return symbol;
  }

  /**
   * Check if row is expanded
   */
  isRowExpanded(positionId: string): boolean {
    return this.expandedRows().has(positionId);
  }

  /**
   * Format currency value
   */
  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(4);
  }

  /**
   * Stop an active arbitrage position
   */
  async stopPosition(positionId: string): Promise<void> {
    const confirmed = confirm(`Are you sure you want to stop position ${positionId}?`);
    if (!confirmed) return;

    try {
      console.log('[ArbitrageChart] Stopping position:', positionId);

      // Call backend API to stop the position
      const token = this.authService.authState().token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = getEndpointUrl('arbitrage', 'graduatedEntryStop');

      const response = await this.http.post<any>(url, { positionId }, { headers }).toPromise();

      if (response?.success) {
        console.log('[ArbitrageChart] Position stopped successfully:', response.data);

        // Remove from local list
        const updatedPositions = this.activePositions().filter(p => p.positionId !== positionId);
        this.activePositions.set(updatedPositions);

        alert(`Position ${positionId} stopped successfully`);
      } else {
        throw new Error(response?.error || 'Unknown error from server');
      }
    } catch (error: any) {
      console.error('[ArbitrageChart] Failed to stop position:', error);
      const errorMessage = error.error?.error || error.message || 'Unknown error';
      alert(`Failed to stop position: ${errorMessage}`);
    }
  }

  /**
   * Synchronize TP/SL for an active position
   * Sets synchronized Take-Profit and Stop-Loss where Primary SL = Hedge TP and vice versa
   */
  async syncTpSl(positionId: string): Promise<void> {
    const confirmed = confirm(
      `Set synchronized TP/SL for position ${positionId}?\n\n` +
      `This will:\n` +
      `• Set Primary Stop-Loss = Hedge Take-Profit\n` +
      `• Set Hedge Stop-Loss = Primary Take-Profit\n` +
      `• Both positions will close simultaneously when either price is hit`
    );
    if (!confirmed) return;

    try {
      console.log('[ArbitrageChart] Synchronizing TP/SL for position:', positionId);

      // Call backend API to sync TP/SL
      const token = this.authService.authState().token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = getEndpointUrl('arbitrage', 'graduatedEntrySetTpSl');

      const response = await this.http.post<any>(url, { positionId }, { headers }).toPromise();

      if (response?.success) {
        console.log('[ArbitrageChart] TP/SL synchronized successfully:', response.data);
        alert(`Synchronized TP/SL set successfully for position ${positionId}\n\nCheck your exchange UI to verify the orders.`);
      } else {
        throw new Error(response?.error || 'Unknown error from server');
      }
    } catch (error: any) {
      console.error('[ArbitrageChart] Failed to sync TP/SL:', error);
      const errorMessage = error.error?.error || error.message || 'Unknown error';
      alert(`Failed to sync TP/SL: ${errorMessage}`);
    }
  }

  /**
   * Fetch symbol information for both exchanges
   */
  private fetchSymbolInfo(): void {
    const symbol = this.symbol();
    const primaryExchange = this.primaryExchange();
    const hedgeExchange = this.hedgeExchange();

    console.log('[ArbitrageChart] Fetching symbol info for both exchanges...');

    // Normalize symbol for primary exchange if needed
    const primarySymbol = primaryExchange.toUpperCase() === 'BINGX'
      ? this.normalizeSymbolForBingX(symbol)
      : symbol;

    // Normalize symbol for hedge exchange if needed
    const hedgeSymbol = hedgeExchange.toUpperCase() === 'BINGX'
      ? this.normalizeSymbolForBingX(symbol)
      : symbol;

    // Fetch primary exchange symbol info
    this.symbolInfoService.getSymbolInfo(primaryExchange, primarySymbol).subscribe(symbolInfo => {
      if (symbolInfo) {
        this.primarySymbolInfo.set(symbolInfo);
        console.log(`[ArbitrageChart] Primary symbol info (${primaryExchange}):`, symbolInfo);
        // Validate immediately if form has values
        this.validatePrimaryOrder();
      } else {
        console.warn(`[ArbitrageChart] No symbol info available for ${primaryExchange}:${primarySymbol}`);
      }
    });

    // Fetch hedge exchange symbol info
    this.symbolInfoService.getSymbolInfo(hedgeExchange, hedgeSymbol).subscribe(symbolInfo => {
      if (symbolInfo) {
        this.hedgeSymbolInfo.set(symbolInfo);
        console.log(`[ArbitrageChart] Hedge symbol info (${hedgeExchange}):`, symbolInfo);
        // Validate immediately if form has values
        this.validateHedgeOrder();
      } else {
        console.warn(`[ArbitrageChart] No symbol info available for ${hedgeExchange}:${hedgeSymbol}`);
      }
    });
  }

  /**
   * Set up form value watchers for real-time validation and field synchronization
   */
  private setupFormValidation(): void {
    // PRIMARY FORM WATCHERS

    // Watch primary quantity changes
    this.primaryOrderForm.get('quantity')?.valueChanges.subscribe((value) => {
      this.validatePrimaryOrder();

      // Sync to hedge if locked and not already syncing
      if (this.orderParamsLocked() && !this.isSyncingQuantity) {
        this.isSyncingQuantity = true;
        const primaryUnit = this.primaryQuantityUnit();
        const hedgeUnit = this.hedgeQuantityUnit();
        let hedgeValue = value;

        if (primaryUnit !== hedgeUnit) {
          hedgeValue = this.convertQuantity(value, primaryUnit, hedgeUnit, 'primary');
        }

        this.hedgeOrderForm.patchValue({ quantity: hedgeValue }, { emitEvent: false });
        this.validateHedgeOrder();
        this.isSyncingQuantity = false;
      }
    });

    // Watch primary side changes
    this.primaryOrderForm.get('side')?.valueChanges.subscribe((value: 'long' | 'short') => {
      if (this.orderParamsLocked() && !this.isSyncingSide) {
        this.hasManualSideSelection = true;
        this.isSyncingSide = true;
        const oppositeSide = value === 'long' ? 'short' : 'long';
        this.hedgeOrderForm.patchValue({ side: oppositeSide }, { emitEvent: false });
        this.isSyncingSide = false;
        console.log('[ArbitrageChart] Side synced from primary to hedge');
      }
    });

    // Watch primary leverage changes
    this.primaryOrderForm.get('leverage')?.valueChanges.subscribe((value) => {
      if (this.orderParamsLocked() && !this.isSyncingLeverage) {
        this.isSyncingLeverage = true;
        this.hedgeOrderForm.patchValue({ leverage: value }, { emitEvent: false });
        this.isSyncingLeverage = false;
        console.log('[ArbitrageChart] Leverage synced from primary to hedge');
      }
    });

    // Watch primary graduatedParts changes
    this.primaryOrderForm.get('graduatedParts')?.valueChanges.subscribe((value) => {
      this.validatePrimaryOrder();

      if (this.orderParamsLocked() && !this.isSyncingGraduatedParts) {
        this.isSyncingGraduatedParts = true;
        this.hedgeOrderForm.patchValue({ graduatedParts: value }, { emitEvent: false });
        this.validateHedgeOrder();
        this.isSyncingGraduatedParts = false;
        console.log('[ArbitrageChart] Graduated parts synced from primary to hedge');
      }
    });

    // Watch primary graduatedDelayMs changes
    this.primaryOrderForm.get('graduatedDelayMs')?.valueChanges.subscribe((value) => {
      if (this.orderParamsLocked() && !this.isSyncingGraduatedDelay) {
        this.isSyncingGraduatedDelay = true;
        this.hedgeOrderForm.patchValue({ graduatedDelayMs: value }, { emitEvent: false });
        this.isSyncingGraduatedDelay = false;
        console.log('[ArbitrageChart] Graduated delay synced from primary to hedge');
      }
    });

    // HEDGE FORM WATCHERS

    // Watch hedge quantity changes
    this.hedgeOrderForm.get('quantity')?.valueChanges.subscribe((value) => {
      this.validateHedgeOrder();

      // Sync to primary if locked and not already syncing
      if (this.orderParamsLocked() && !this.isSyncingQuantity) {
        this.isSyncingQuantity = true;
        const primaryUnit = this.primaryQuantityUnit();
        const hedgeUnit = this.hedgeQuantityUnit();
        let primaryValue = value;

        if (primaryUnit !== hedgeUnit) {
          primaryValue = this.convertQuantity(value, hedgeUnit, primaryUnit, 'hedge');
        }

        this.primaryOrderForm.patchValue({ quantity: primaryValue }, { emitEvent: false });
        this.validatePrimaryOrder();
        this.isSyncingQuantity = false;
      }
    });

    // Watch hedge side changes
    this.hedgeOrderForm.get('side')?.valueChanges.subscribe((value: 'long' | 'short') => {
      if (this.orderParamsLocked() && !this.isSyncingSide) {
        this.hasManualSideSelection = true;
        this.isSyncingSide = true;
        const oppositeSide = value === 'long' ? 'short' : 'long';
        this.primaryOrderForm.patchValue({ side: oppositeSide }, { emitEvent: false });
        this.isSyncingSide = false;
        console.log('[ArbitrageChart] Side synced from hedge to primary');
      }
    });

    // Watch hedge leverage changes
    this.hedgeOrderForm.get('leverage')?.valueChanges.subscribe((value) => {
      if (this.orderParamsLocked() && !this.isSyncingLeverage) {
        this.isSyncingLeverage = true;
        this.primaryOrderForm.patchValue({ leverage: value }, { emitEvent: false });
        this.isSyncingLeverage = false;
        console.log('[ArbitrageChart] Leverage synced from hedge to primary');
      }
    });

    // Watch hedge graduatedParts changes
    this.hedgeOrderForm.get('graduatedParts')?.valueChanges.subscribe((value) => {
      this.validateHedgeOrder();

      if (this.orderParamsLocked() && !this.isSyncingGraduatedParts) {
        this.isSyncingGraduatedParts = true;
        this.primaryOrderForm.patchValue({ graduatedParts: value }, { emitEvent: false });
        this.validatePrimaryOrder();
        this.isSyncingGraduatedParts = false;
        console.log('[ArbitrageChart] Graduated parts synced from hedge to primary');
      }
    });

    // Watch hedge graduatedDelayMs changes
    this.hedgeOrderForm.get('graduatedDelayMs')?.valueChanges.subscribe((value) => {
      if (this.orderParamsLocked() && !this.isSyncingGraduatedDelay) {
        this.isSyncingGraduatedDelay = true;
        this.primaryOrderForm.patchValue({ graduatedDelayMs: value }, { emitEvent: false });
        this.isSyncingGraduatedDelay = false;
        console.log('[ArbitrageChart] Graduated delay synced from hedge to primary');
      }
    });

    console.log('[ArbitrageChart] Form validation and synchronization watchers set up');
  }

  /**
   * Validate primary order quantity against symbol info
   */
  private validatePrimaryOrder(): void {
    const symbolInfo = this.primarySymbolInfo();
    if (!symbolInfo) {
      this.primaryValidation.set({ valid: true });
      return;
    }

    const quantity = this.primaryOrderForm.get('quantity')?.value || 0;
    const graduatedParts = this.primaryOrderForm.get('graduatedParts')?.value || 1;
    const unit = this.primaryQuantityUnit();
    const price = this.primaryData().price;

    // Convert quantity to coin if it's in USDT
    let actualQuantity = quantity;
    if (unit === 'usdt' && price > 0) {
      actualQuantity = quantity / price;
      
      // Calculate quantity per part and round each part to match exchange step requirements
      let qtyPerPart = actualQuantity / graduatedParts;
      
      if (symbolInfo.qtyStep >= 1) {
        // For exchanges requiring whole numbers (like FUSDT), round to nearest integer
        qtyPerPart = Math.round(qtyPerPart);
      } else {
        // For exchanges with decimal steps, round to step precision
        const stepDecimals = Math.max(0, -Math.log10(symbolInfo.qtyStep));
        qtyPerPart = Math.round(qtyPerPart * Math.pow(10, stepDecimals)) / Math.pow(10, stepDecimals);
      }
      
      // Recalculate total quantity based on rounded parts
      actualQuantity = qtyPerPart * graduatedParts;
      
      console.log(`[Debug] Converting primary: ${quantity} USDT ÷ ${price} = ${quantity / price} FUSDT, rounded per part: ${qtyPerPart} × ${graduatedParts} = ${actualQuantity} FUSDT`);
    }

    console.log(`[Debug] Primary validation: quantity=${actualQuantity}, parts=${graduatedParts}, unit=${unit}, price=${price}`);

    const validationResult = this.symbolInfoService.validateOrderQuantity(
      symbolInfo,
      actualQuantity,
      graduatedParts
    );

    this.primaryValidation.set(validationResult);

    if (!validationResult.valid) {
      console.warn(`[ArbitrageChart] Primary order validation failed:`, validationResult);
    }
  }

  /**
   * Validate hedge order quantity against symbol info
   */
  private validateHedgeOrder(): void {
    const symbolInfo = this.hedgeSymbolInfo();
    if (!symbolInfo) {
      this.hedgeValidation.set({ valid: true });
      return;
    }

    const quantity = this.hedgeOrderForm.get('quantity')?.value || 0;
    const graduatedParts = this.hedgeOrderForm.get('graduatedParts')?.value || 1;
    const unit = this.hedgeQuantityUnit();
    const price = this.hedgeData().price;

    // Convert quantity to coin if it's in USDT
    let actualQuantity = quantity;
    if (unit === 'usdt' && price > 0) {
      actualQuantity = quantity / price;
      
      // Calculate quantity per part and round each part to match exchange step requirements
      let qtyPerPart = actualQuantity / graduatedParts;
      
      if (symbolInfo.qtyStep >= 1) {
        // For exchanges requiring whole numbers (like FUSDT), round to nearest integer
        qtyPerPart = Math.round(qtyPerPart);
      } else {
        // For exchanges with decimal steps, round to step precision
        const stepDecimals = Math.max(0, -Math.log10(symbolInfo.qtyStep));
        qtyPerPart = Math.round(qtyPerPart * Math.pow(10, stepDecimals)) / Math.pow(10, stepDecimals);
      }
      
      // Recalculate total quantity based on rounded parts
      actualQuantity = qtyPerPart * graduatedParts;
      
      console.log(`[Debug] Converting hedge: ${quantity} USDT ÷ ${price} = ${quantity / price} FUSDT, rounded per part: ${qtyPerPart} × ${graduatedParts} = ${actualQuantity} FUSDT`);
    }

    console.log(`[Debug] Hedge validation: quantity=${actualQuantity}, parts=${graduatedParts}, unit=${unit}, price=${price}`);

    const validationResult = this.symbolInfoService.validateOrderQuantity(
      symbolInfo,
      actualQuantity,
      graduatedParts
    );

    this.hedgeValidation.set(validationResult);

    if (!validationResult.valid) {
      console.warn(`[ArbitrageChart] Hedge order validation failed:`, validationResult);
    }
  }


  // Gate.io API refresh interval
  private gateioRefreshInterval?: any;
}
