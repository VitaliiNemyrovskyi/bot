import { Component, OnInit, OnDestroy, inject, signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// MatDialog removed - using ui-dialog component directly
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { ArbitrageStreamService, PriceUpdate } from '../../../services/arbitrage-stream.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { DropdownComponent, DropdownOption } from '../../ui/dropdown/dropdown.component';
import { TradeHistoryComponent, TradeHistoryDialogData } from '../trade-history/trade-history.component';
import { getEndpointUrl } from '../../../config/app.config';

/**
 * Ticker data interface (Linear/Inverse)
 */
export interface TickerData {
  symbol: string;
  lastPrice: string;
  indexPrice: string;
  markPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  prevPrice1h: string;
  openInterest: string;
  openInterestValue: string;
  turnover24h: string;
  volume24h: string;
  fundingRate: string;
  nextFundingTime: string;
  predictedDeliveryPrice: string;
  basisRate: string;
  deliveryFeeRate: string;
  deliveryTime: string;
  ask1Size: string;
  bid1Price: string;
  ask1Price: string;
  bid1Size: string;
}

export interface ExchangeCredential {
  id: string;
  exchange: string;
  environment: string;
  label?: string;
  isActive: boolean;
}

export interface FundingSubscription {
  subscriptionId: string;
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  positionType: 'long' | 'short';
  quantity: number;
  status: string;
  countdown?: number; // Seconds remaining
  primaryExchange?: string; // Exchange where position is opened
  primaryCredentialId?: string; // Credential used for primary exchange
  hedgeExchange?: string; // Exchange for hedge position
  hedgeCredentialId?: string; // Credential for hedge exchange
  leverage?: number; // Leverage multiplier for this subscription
  margin?: number; // Margin amount in USDT (the actual capital invested by user)
}

export interface CompletedDeal {
  subscriptionId: string;
  symbol: string;
  fundingRate: number;
  positionType: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  hedgeEntryPrice: number;
  fundingEarned: number;
  realizedPnl: number;
  executedAt: string;
  createdAt: string;
}

export interface TradeHistoryRecord {
  id: string;
  symbol: string;
  executedAt: string;
  closedAt: string;
  positionSizeUsdt: number;
  fundingEarned: number;
  realizedPnl: number;
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  quantity: number;
  status: string;
}

export interface SubscriptionSettings {
  defaultQuantity: number;           // Default number of coins to trade
  leverage: number;                   // Trading leverage (1-100x)
  autoCancelThreshold: number | null; // Auto-cancel if funding rate falls below this (null = disabled)
  enableAutoCancel: boolean;          // Enable/disable auto-cancel feature
  executionDelay: number;             // Seconds before funding time to execute (default: 5)
  arbitrageSpreadThreshold: number | null; // Minimum spread threshold for arbitrage opportunities (in %)
}

export interface ExchangeData {
  exchange: string;
  credentialId: string;
  environment: string;
  fundingRate: string;
  nextFundingTime: number;
  originalSymbol?: string;
  lastPrice: string;
}

export interface FundingRateArbitrageOpportunity {
  symbol: string;
  exchanges: ExchangeData[];
  spread: string; // Price spread as decimal (e.g., "0.0004")
  spreadPercent: string; // Price spread as percentage (e.g., "0.04")
  priceSpreadUsdt: string; // Absolute price difference in USDT (e.g., "25.50")
  bestLong: {
    exchange: string;
    credentialId: string;
    fundingRate: string;
    environment: string;
  };
  bestShort: {
    exchange: string;
    credentialId: string;
    fundingRate: string;
    environment: string;
  };
  arbitrageOpportunity: boolean;
  marketCap?: number; // Market capitalization in USD from CoinGecko
}

/**
 * Enhanced Funding Rates Component
 *
 * Displays real-time funding rates with advanced filtering and exchange selection.
 * Features:
 * - Multi-exchange credential selection
 * - Filter by funding rate (min/max)
 * - Filter by next funding time
 * - Auto-refresh every 30 seconds
 * - Sortable columns
 * - Annualized rate calculation
 */
@Component({
  selector: 'app-funding-rates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    DropdownComponent,
    TradeHistoryComponent
  ],
  templateUrl: './funding-rates.component.html',
  styleUrl: './funding-rates.component.scss'
})
export class FundingRatesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private arbitrageStreamService = inject(ArbitrageStreamService);
  private cdr = inject(ChangeDetectorRef);

  // Trade History Dialog State
  showTradeHistoryDialog = signal<boolean>(false);
  tradeHistorySymbol = signal<string | undefined>(undefined);
  tradeHistoryExchange = signal<string | undefined>(undefined);

  // Expose utilities to template
  readonly Array = Array;
  readonly parseFloat = parseFloat;
  readonly Math = Math;

  // State
  tickers = signal<TickerData[]>([]);
  credentials = signal<ExchangeCredential[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingCredentials = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedCredentialId = signal<string | null>(null);
  hedgeCredentialId = signal<string | null>(null); // For arbitrage subscriptions
  autoRefreshEnabled = signal<boolean>(true);

  // Balance and position information for subscription dialog
  primaryBalance = signal<number | null>(null);
  hedgeBalance = signal<number | null>(null);
  isLoadingBalances = signal<boolean>(false);

  // Filter state
  searchQuery = signal<string>('');
  positionType = signal<'all' | 'long' | 'short'>('all');
  minAbsFundingRate = signal<number | null>(null);
  maxNextFundingHours = signal<number | null>(null);

  // Subscription state
  subscriptions = signal<Map<string, FundingSubscription>>(new Map());
  completedDeals = signal<CompletedDeal[]>([]);
  notifications = signal<string[]>([]);
  showSubscriptionDialog = signal<boolean>(false);
  selectedTicker = signal<TickerData | null>(null);
  positionSizeUsdt = signal<number>(100); // Changed from subscriptionQuantity to USDT-based
  dialogLeverage = signal<number>(3); // Dialog-specific leverage (separate from global settings)
  dialogTakeProfitPercent = signal<number>(90); // Take profit percentage (90% of expected funding)
  dialogStopLossPercent = signal<number>(20); // Stop loss percentage (20% of expected funding)
  isSubscribing = signal<boolean>(false);
  editingSubscription = signal<FundingSubscription | null>(null);
  startingSubscriptionId = signal<string | null>(null); // Track which subscription is being started

  // HEDGED mode dialog state
  showHedgedDialog = signal<boolean>(false);
  selectedHedgedOpportunity = signal<any>(null);
  hedgedPrimaryLeverage = signal<number>(3);
  hedgedPrimaryMargin = signal<number>(100);
  hedgedHedgeLeverage = signal<number>(3);
  hedgedHedgeMargin = signal<number>(100);
  isStartingHedged = signal<boolean>(false);

  // Row expansion state
  expandedRows = signal<Set<string>>(new Set());

  // Arbitrage state
  arbitrageOpportunities = signal<FundingRateArbitrageOpportunity[]>([]);
  isLoadingArbitrage = signal<boolean>(false);
  arbitrageError = signal<string | null>(null);
  showArbitrageSection = signal<boolean>(true);
  arbitrageFiltersCollapsed = signal<boolean>(false);
  arbitrageSearchQuery = signal<string>(''); // Symbol search filter for arbitrage table
  minSpreadThreshold = signal<number | null>(null); // Minimum spread threshold in percentage
  showOnlySubscribedArbitrage = signal<boolean>(false); // Filter to show only subscribed pairs
  maxNextFundingHoursArbitrage = signal<number | null>(null); // Maximum hours until next funding (filter)
  minMarketCapFilter = signal<number | null>(null); // Minimum market cap filter in millions USD (HEDGED mode only)
  arbitrageMode = signal<'HEDGED' | 'NON_HEDGED'>('HEDGED'); // Mode toggle: HEDGED (long-term, 2 positions) or NON_HEDGED (short-term, 1 position)

  // Real-time streaming state
  realtimePrices = signal<Map<string, { price: number; change: 'up' | 'down' | 'neutral'; timestamp: number }>>(new Map());
  isStreamConnected = signal<boolean>(false);
  enableRealtimeStreaming = signal<boolean>(false); // Feature flag for real-time streaming
  priceUpdateSubscription: Subscription | null = null;

  // Subscription settings
  subscriptionSettings = signal<SubscriptionSettings>({
    defaultQuantity: 0.01,
    leverage: 3,
    autoCancelThreshold: 0.003,
    enableAutoCancel: true,
    executionDelay: 5, // Default: execute 5 seconds before funding
    arbitrageSpreadThreshold: null // Default: no minimum spread threshold
  });
  showSettingsDialog = signal<boolean>(false);

  // Multi-sort state
  sortColumns = signal<Array<{ column: string; direction: 'asc' | 'desc' }>>([
    { column: 'fundingRate', direction: 'desc' }
  ]);

  // Arbitrage table multi-sort state
  // Initial sort matches initial mode (HEDGED = spread, NON_HEDGED = funding)
  arbitrageSortColumns = signal<Array<{ column: string; direction: 'asc' | 'desc' }>>([
    { column: 'spread', direction: 'desc' }  // Default HEDGED mode
  ]);

  // UI state
  isFiltersCollapsed = signal<boolean>(false);

  // Computed
  credentialOptions = computed(() => {
    // Only show active credentials
    return this.credentials()
      .filter(cred => cred.isActive)
      .map(cred => ({
        value: cred.id,
        label: cred.label || `${cred.exchange} (${cred.environment})`,
        disabled: false
      }));
  });

  selectedCredential = computed(() => {
    const id = this.selectedCredentialId();
    return this.credentials().find(c => c.id === id);
  });

  hedgeCredential = computed(() => {
    const id = this.hedgeCredentialId();
    return id ? this.credentials().find(c => c.id === id) : null;
  });

  filteredTickers = computed(() => {
    let filtered = [...this.tickers()];

    // Filter out pairs with no funding rate
    filtered = filtered.filter(t => {
      const fundingRate = parseFloat(t.fundingRate);
      return !isNaN(fundingRate) && t.fundingRate !== '' && t.fundingRate !== null && t.fundingRate !== undefined;
    });

    // Note: We do NOT filter out pairs with 0% price movement
    // because they can still have excellent funding rates for arbitrage

    // Filter by search query (symbol name)
    const search = this.searchQuery().trim().toUpperCase();
    if (search) {
      filtered = filtered.filter(t => t.symbol.toUpperCase().includes(search));
    }

    // Filter by position type (long/short)
    const posType = this.positionType();
    if (posType === 'long') {
      // Long positions: filter for NEGATIVE funding rates (you receive funding)
      filtered = filtered.filter(t => parseFloat(t.fundingRate) < 0);
    } else if (posType === 'short') {
      // Short positions: filter for POSITIVE funding rates (you receive funding)
      filtered = filtered.filter(t => parseFloat(t.fundingRate) > 0);
    }

    // Filter by minimum absolute funding rate
    const minAbsRate = this.minAbsFundingRate();
    if (minAbsRate !== null) {
      filtered = filtered.filter(t => Math.abs(parseFloat(t.fundingRate) * 100) >= minAbsRate);
    }

    // Filter by next funding time
    const maxHours = this.maxNextFundingHours();
    if (maxHours !== null) {
      const now = Date.now();
      const maxTime = now + (maxHours * 60 * 60 * 1000);
      filtered = filtered.filter(t => {
        const fundingTime = parseInt(t.nextFundingTime);
        return fundingTime <= maxTime;
      });
    }

    return filtered;
  });

  sortedTickers = computed(() => {
    const tickers = [...this.filteredTickers()];
    const sortCols = this.sortColumns();

    if (sortCols.length === 0) {
      return tickers;
    }

    return tickers.sort((a, b) => {
      // Apply each sort column in order
      for (const { column, direction } of sortCols) {
        let aVal: any = a[column as keyof TickerData];
        let bVal: any = b[column as keyof TickerData];

        // Parse numbers for numeric columns
        if (column !== 'symbol') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }

        // Compare values
        let comparison = 0;
        if (aVal > bVal) {
          comparison = 1;
        } else if (aVal < bVal) {
          comparison = -1;
        }

        // If values are different, apply direction and return
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }

        // If values are equal, continue to next sort column
      }

      return 0; // All sort columns equal
    });
  });

  /**
   * Check if a ticker meets the auto-subscribe threshold
   */
  meetsAutoSubscribeThreshold = computed(() => {
    const settings = this.subscriptionSettings();
    const tickers = this.sortedTickers();
    const threshold = settings.autoCancelThreshold;

    if (threshold === null || threshold === undefined) {
      return new Set<string>();
    }

    const eligibleSymbols = new Set<string>();

    tickers.forEach(ticker => {
      const fundingRate = parseFloat(ticker.fundingRate);
      const absFundingRate = Math.abs(fundingRate);

      // Symbol meets threshold if absolute funding rate is >= threshold
      if (absFundingRate >= Math.abs(threshold)) {
        eligibleSymbols.add(ticker.symbol);
      }
    });

    return eligibleSymbols;
  });

  /**
   * Filtered arbitrage opportunities based on symbol search, spread threshold, subscription status, and next funding time
   */
  filteredArbitrageOpportunities = computed(() => {
    let opportunities = [...this.arbitrageOpportunities()];

    // Filter by symbol search query
    const search = this.arbitrageSearchQuery().trim().toUpperCase();
    if (search) {
      opportunities = opportunities.filter(opp =>
        opp.symbol.toUpperCase().includes(search)
      );
    }

    // Filter by minimum spread threshold
    const minSpread = this.minSpreadThreshold();
    if (minSpread !== null && minSpread > 0) {
      opportunities = opportunities.filter(opp => {
        const spreadPercent = parseFloat(opp.spread) * 100;
        return spreadPercent >= minSpread;
      });
    }

    // Filter by subscription status (show only subscribed pairs)
    if (this.showOnlySubscribedArbitrage()) {
      opportunities = opportunities.filter(opp =>
        this.hasArbitrageSubscription(opp.symbol)
      );
    }

    // Filter by next funding time
    const maxHours = this.maxNextFundingHoursArbitrage();
    if (maxHours !== null && maxHours > 0) {
      const now = Date.now();
      const maxTime = now + (maxHours * 60 * 60 * 1000);
      opportunities = opportunities.filter(opp => {
        // Check if any exchange in this opportunity has next funding time within the threshold
        return opp.exchanges.some((exchange: any) => {
          const fundingTime = parseInt(exchange.nextFundingTime?.toString() || '0');
          return fundingTime > 0 && fundingTime <= maxTime;
        });
      });
    }

    return opportunities;
  });

  /**
   * Sorted arbitrage opportunities based on current sort columns
   */
  sortedArbitrageOpportunities = computed(() => {
    const opportunities = [...this.filteredArbitrageOpportunities()];
    const sortCols = this.arbitrageSortColumns();

    if (sortCols.length === 0) {
      return opportunities;
    }

    return opportunities.sort((a, b) => {
      // Apply each sort column in order
      for (const { column, direction } of sortCols) {
        let aVal: any;
        let bVal: any;

        // Extract values based on column
        switch (column) {
          case 'symbol':
            aVal = a.symbol;
            bVal = b.symbol;
            break;
          case 'primaryExchange':
            // Sort by primary exchange name (HEDGED mode)
            aVal = a.bestLong?.exchange || '';
            bVal = b.bestLong?.exchange || '';
            break;
          case 'hedgeExchange':
            // Sort by hedge exchange name (HEDGED mode)
            aVal = a.bestShort?.exchange || '';
            bVal = b.bestShort?.exchange || '';
            break;
          case 'spread':
            // Sort by price spread (HEDGED mode)
            aVal = parseFloat(a.spread || '0');
            bVal = parseFloat(b.spread || '0');
            break;
          case 'funding':
            // For NON_HEDGED mode: find maximum funding rate by absolute value,
            // but use the actual signed value for sorting (descending)
            // For HEDGED mode: use bestLong funding rate
            const mode = this.arbitrageMode();

            if (mode === 'NON_HEDGED') {
              // Find exchange with maximum absolute funding rate
              const aLongRate = parseFloat(a.bestLong?.fundingRate || '0');
              const aShortRate = parseFloat(a.bestShort?.fundingRate || '0');
              const bLongRate = parseFloat(b.bestLong?.fundingRate || '0');
              const bShortRate = parseFloat(b.bestShort?.fundingRate || '0');

              // Use the rate with higher absolute value, keeping the sign
              aVal = Math.abs(aLongRate) >= Math.abs(aShortRate) ? aLongRate : aShortRate;
              bVal = Math.abs(bLongRate) >= Math.abs(bShortRate) ? bLongRate : bShortRate;
            } else {
              // HEDGED mode: use bestLong funding rate
              aVal = parseFloat(a.bestLong?.fundingRate || '0');
              bVal = parseFloat(b.bestLong?.fundingRate || '0');
            }
            break;
          case 'nextFunding':
            // Get the next funding time from the exchange with highest absolute funding rate
            // This matches the display logic in NON_HEDGED mode
            const aAbsLong = Math.abs(parseFloat(a.bestLong?.fundingRate || '0'));
            const aAbsShort = Math.abs(parseFloat(a.bestShort?.fundingRate || '0'));
            const bAbsLong = Math.abs(parseFloat(b.bestLong?.fundingRate || '0'));
            const bAbsShort = Math.abs(parseFloat(b.bestShort?.fundingRate || '0'));

            // Determine which exchange to use for each opportunity (matches UI display logic)
            const useALong = aAbsLong >= aAbsShort;
            const useBLong = bAbsLong >= bAbsShort;

            const aExchange = a.exchanges?.find((ex: any) =>
              ex.exchange === (useALong ? a.bestLong?.exchange : a.bestShort?.exchange) &&
              ex.credentialId === (useALong ? a.bestLong?.credentialId : a.bestShort?.credentialId)
            );
            const bExchange = b.exchanges?.find((ex: any) =>
              ex.exchange === (useBLong ? b.bestLong?.exchange : b.bestShort?.exchange) &&
              ex.credentialId === (useBLong ? b.bestLong?.credentialId : b.bestShort?.credentialId)
            );
            aVal = parseInt(aExchange?.nextFundingTime?.toString() || '0');
            bVal = parseInt(bExchange?.nextFundingTime?.toString() || '0');
            break;
          case 'position':
            // Sort by position type (LONG or SHORT based on funding rate)
            const aFunding = parseFloat(a.bestLong?.fundingRate || '0');
            const bFunding = parseFloat(b.bestLong?.fundingRate || '0');
            aVal = aFunding < 0 ? 'LONG' : 'SHORT';
            bVal = bFunding < 0 ? 'LONG' : 'SHORT';
            break;
          default:
            continue;
        }

        // Compare values
        let comparison = 0;
        if (column === 'symbol' || column === 'position' || column === 'primaryExchange' || column === 'hedgeExchange') {
          // String comparison
          if (aVal > bVal) comparison = 1;
          else if (aVal < bVal) comparison = -1;
        } else {
          // Numeric comparison
          const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal) || 0;
          const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal) || 0;
          if (aNum > bNum) comparison = 1;
          else if (aNum < bNum) comparison = -1;
        }

        // If values are different, apply direction and return
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }

        // If values are equal, continue to next sort column
      }

      return 0; // All sort columns equal
    });
  });

  /**
   * Set of symbols with active subscriptions for efficient lookup
   */
  subscribedSymbols = computed(() => {
    const subs = Array.from(this.subscriptions().values());
    const symbols = new Set(subs.map(sub => sub.symbol));
    console.log('[subscribedSymbols] Computed signal updated. Active symbols:', Array.from(symbols));
    return symbols;
  });

  /**
   * Map of symbol to subscription for quick lookup in arbitrage table
   */
  symbolToSubscription = computed(() => {
    const subs = Array.from(this.subscriptions().values());
    const map = new Map<string, FundingSubscription>();
    subs.forEach(sub => {
      // Normalize symbol format (remove hyphens for comparison)
      const normalizedSymbol = sub.symbol.replace(/-/g, '');
      map.set(normalizedSymbol, sub);
    });
    console.log('[symbolToSubscription] Map keys:', Array.from(map.keys()));
    return map;
  });

  /**
   * Position validation error - tracks why position calculation might fail
   */
  positionValidationError = computed(() => {
    const ticker = this.selectedTicker();
    const positionSizeUsdt = this.positionSizeUsdt();

    if (!ticker) {
      return 'No symbol selected';
    }

    if (!positionSizeUsdt || positionSizeUsdt <= 0) {
      return 'Invalid position size';
    }

    // Check if price data is available
    const lastPrice = parseFloat(ticker.lastPrice) || 0;
    const markPrice = parseFloat(ticker.markPrice) || 0;

    if (lastPrice === 0 && markPrice === 0) {
      return `No price data available for ${ticker.symbol}. This symbol may not be actively traded or may be delisted.`;
    }

    return null;
  });

  /**
   * Position calculation computed signal - automatically recalculates when dependencies change
   * Uses dialogLeverage for dialog-specific leverage (separate from global settings)
   */
  positionCalculation = computed(() => {
    const ticker = this.selectedTicker();
    const positionSizeUsdt = this.positionSizeUsdt();
    const leverage = this.dialogLeverage(); // Use dialog-specific leverage

    console.log('[positionCalculation] Computing with:', {
      ticker: ticker?.symbol,
      positionSizeUsdt,
      leverage,
      tickerLastPrice: ticker?.lastPrice,
      tickerMarkPrice: ticker?.markPrice
    });

    if (!ticker || !positionSizeUsdt || positionSizeUsdt <= 0) {
      console.log('[positionCalculation] Returning null - missing dependencies');
      return null;
    }

    // Use last price or mark price as estimate
    const estimatedPrice = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;

    if (estimatedPrice === 0) {
      console.log('[positionCalculation] Returning null - price is 0');
      return null;
    }

    // positionSizeUsdt is the margin (your own money)
    // With leverage, actual position value = margin * leverage
    const margin = positionSizeUsdt;
    const positionValue = margin * leverage;

    // Calculate quantity from position value: quantity = positionValue / price
    const quantity = positionValue / estimatedPrice;

    // Estimate trading fee (typical taker fee: 0.055% for Bybit, 0.05% for BingX)
    // For both entry and exit, fee = position value * 0.00055 * 2
    const estimatedFee = positionValue * 0.00055 * 2; // Entry + Exit

    const result = {
      symbol: ticker.symbol,
      quantity,
      estimatedPrice,
      positionValue,
      requiredMargin: margin,
      estimatedFee,
      leverage
    };

    console.log('[positionCalculation] Returning:', result);
    return result;
  });

  /**
   * Profit calculation computed signal - calculates expected funding earnings
   * Accounts for HEDGED vs NON_HEDGED modes
   */
  profitCalculation = computed(() => {
    const ticker = this.selectedTicker();
    const positionCalc = this.positionCalculation();
    const mode = this.arbitrageMode();

    if (!ticker || !positionCalc) {
      return null;
    }

    const fundingRate = parseFloat(ticker.fundingRate);
    const positionValue = positionCalc.positionValue;

    // Calculate funding payment for primary position
    const primaryFunding = positionValue * Math.abs(fundingRate);

    // Estimate fees (entry + exit)
    const estimatedFees = positionCalc.estimatedFee;

    if (mode === 'HEDGED') {
      // In hedged mode, assume hedge exchange has near-zero or opposite funding
      // For now, we'll estimate hedge funding as 50% of primary (conservative)
      const hedgeFunding = primaryFunding * 0.5;
      const grossProfit = primaryFunding + hedgeFunding;
      const netProfit = grossProfit - estimatedFees;

      return {
        primaryFunding,
        hedgeFunding,
        grossProfit,
        estimatedFees,
        netProfit,
        profitPercent: (netProfit / (positionCalc.requiredMargin * 2)) * 100, // Total margin for both positions
        mode: 'HEDGED'
      };
    } else {
      // NON_HEDGED mode: single position
      const grossProfit = primaryFunding;
      const netProfit = grossProfit - estimatedFees;

      return {
        primaryFunding,
        hedgeFunding: 0,
        grossProfit,
        estimatedFees,
        netProfit,
        profitPercent: (netProfit / positionCalc.requiredMargin) * 100,
        mode: 'NON_HEDGED'
      };
    }
  });

  private refreshSubscription?: Subscription;

  constructor() {
    // Add effect to track mode changes
    effect(() => {
      const mode = this.arbitrageMode();
      console.log('[Mode Toggle] Mode changed to:', mode);

      // When switching to NON_HEDGED mode, clear hedge credential
      if (mode === 'NON_HEDGED') {
        console.log('[Mode Toggle] Clearing hedge credential for NON_HEDGED mode');
        this.hedgeCredentialId.set(null);
      }

      // Update sorting based on mode
      // HEDGED mode: Sort by spread (descending)
      // NON_HEDGED mode: Sort by funding rate (descending, by absolute value)
      if (mode === 'HEDGED') {
        console.log('[Mode Toggle] Setting sort to spread (descending) for HEDGED mode');
        this.arbitrageSortColumns.set([{ column: 'spread', direction: 'desc' }]);
      } else {
        console.log('[Mode Toggle] Setting sort to funding (descending) for NON_HEDGED mode');
        this.arbitrageSortColumns.set([{ column: 'funding', direction: 'desc' }]);
      }

      // Restart streaming with new top 3 opportunities based on new sorting (if enabled)
      if (this.enableRealtimeStreaming()) {
        console.log('[Mode Toggle] Restarting real-time streaming with new mode');
        this.startRealtimeStreaming();
      }
    }, { allowSignalWrites: true }); // Allow signal writes inside effect

    // Add effect to handle feature flag changes
    effect(() => {
      const enabled = this.enableRealtimeStreaming();
      console.log('[RealtimeStreaming] Feature flag changed to:', enabled);

      if (enabled) {
        console.log('[RealtimeStreaming] Starting real-time streaming');
        this.startRealtimeStreaming();
      } else {
        console.log('[RealtimeStreaming] Stopping real-time streaming');
        this.stopRealtimeStreaming();
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Set arbitrage mode with explicit logging for debugging
   */
  setArbitrageMode(mode: 'HEDGED' | 'NON_HEDGED'): void {
    console.log('[setArbitrageMode] Button clicked! Current mode:', this.arbitrageMode(), '-> New mode:', mode);
    this.arbitrageMode.set(mode);
    console.log('[setArbitrageMode] Mode updated to:', this.arbitrageMode());
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadCredentials();
    this.loadSubscriptions();
    this.loadArbitrageOpportunities(); // Load cross-exchange arbitrage data
    this.startAutoCancelChecker();
    this.syncSettingsToFilters();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.autoCancelInterval) {
      clearInterval(this.autoCancelInterval);
    }
    // Disconnect from real-time streaming
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
    }
    this.arbitrageStreamService.disconnect();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  loadCredentials(): void {
    this.isLoadingCredentials.set(true);
    const token = this.authService.authState().token;
    if (!token) {
      this.error.set('Authentication required');
      this.isLoadingCredentials.set(false);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:3000/api/exchange-credentials', { headers })
      .subscribe({
        next: (response) => {
          console.log('Credentials response:', response);

          if (response.success && response.data) {
            // API returns { credentials: [], totalCount: number }
            const credentialsArray = response.data.credentials || [];
            console.log('Credentials array:', credentialsArray);

            // Filter for active credentials only (all exchanges supported)
            const activeCredentials = credentialsArray.filter((c: ExchangeCredential) =>
              c.isActive === true
            );
            this.credentials.set(activeCredentials);

            console.log('Active credentials:', activeCredentials);

            // Auto-select first credential (all are active now)
            const defaultCred = activeCredentials[0];
            if (defaultCred) {
              this.selectedCredentialId.set(defaultCred.id);
              this.loadTickers();
              this.setupAutoRefresh();
            } else {
              console.warn('No active credentials found');
            }
          }
          this.isLoadingCredentials.set(false);
        },
        error: (err) => {
          console.error('Failed to load credentials:', err);
          this.error.set('Failed to load exchange credentials');
          this.isLoadingCredentials.set(false);
        }
      });
  }

  onCredentialChange(credentialId: string): void {
    this.selectedCredentialId.set(credentialId);
    this.loadTickers();
  }

  setupAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    if (this.autoRefreshEnabled()) {
      // Refresh every 3 minutes (180 seconds)
      this.refreshSubscription = interval(180000)
        .pipe(
          startWith(0),
          switchMap(() => this.loadTickersAsync())
        )
        .subscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled.update(v => !v);
    this.setupAutoRefresh();
  }

  loadTickers(): void {
    this.loadTickersAsync().subscribe();
  }

  private loadTickersAsync() {
    const credential = this.selectedCredential();
    if (!credential) {
      return of(null);
    }

    // Prevent concurrent loading - skip if already loading
    if (this.isLoading()) {
      console.log('[FundingRates] Skipping refresh - already loading');
      return of(null);
    }

    this.isLoading.set(true);
    this.error.set(null);

    const token = this.authService.authState().token;
    if (!token) {
      this.error.set('Authentication required');
      this.isLoading.set(false);
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const exchange = credential.exchange;
    const credentialId = credential.id;

    // Determine API endpoint based on exchange
    // Pass credentialId to use the specific selected credential
    let apiUrl = '';
    if (exchange === 'BYBIT') {
      apiUrl = `http://localhost:3000/api/bybit/tickers?category=linear&credentialId=${credentialId}`;
    } else if (exchange === 'BINGX') {
      apiUrl = `http://localhost:3000/api/bingx/tickers?credentialId=${credentialId}`;
    } else {
      this.error.set(`Unsupported exchange: ${exchange}`);
      this.isLoading.set(false);
      return of(null);
    }

    return this.http.get<any>(apiUrl, { headers }).pipe(
      switchMap(async (response) => {
        try {
          if (response.success) {
            // Map BingX ticker format to match Bybit format if needed
            let tickers = exchange === 'BINGX'
              ? this.mapBingXTickers(response.data)
              : response.data;

            // For BingX, fetch funding rates separately and merge
            if (exchange === 'BINGX') {
              console.log('[BingX] Starting to merge funding rates...');
              tickers = await this.mergeBingXFundingRates(tickers, headers, credentialId);
              console.log('[BingX] Funding rates merged, updating table...');
            }

            this.tickers.set(tickers);
            this.isLoading.set(false);
            console.log(`[FundingRates] Updated ${tickers.length} tickers`);
          } else {
            this.error.set(response.message || 'Failed to load tickers');
            this.isLoading.set(false);
          }
          return response;
        } catch (error: any) {
          console.error('[FundingRates] Error in loadTickersAsync:', error);
          this.error.set(error.message || 'Failed to load data');
          this.isLoading.set(false);
          return null;
        }
      })
    );
  }

  /**
   * Fetch BingX funding rates and merge with ticker data
   */
  private async mergeBingXFundingRates(tickers: TickerData[], headers: HttpHeaders, credentialId: string): Promise<TickerData[]> {
    try {
      console.log('[BingX] Fetching funding rates for', tickers.length, 'symbols...');
      const fundingUrl = `${getEndpointUrl('bingx', 'fundingRates')}?credentialId=${credentialId}`;
      const fundingResponse = await this.http.get<any>(
        fundingUrl,
        { headers }
      ).toPromise();

      console.log('[BingX] Funding rates response:', fundingResponse);

      if (fundingResponse?.success && fundingResponse?.data) {
        console.log('[BingX] Received', fundingResponse.data.length, 'funding rates');
        const fundingMap = new Map<string, any>();
        fundingResponse.data.forEach((fr: any) => {
          fundingMap.set(fr.symbol, fr);
        });

        // Merge funding rates into tickers
        const mergedTickers = tickers.map(ticker => {
          const funding = fundingMap.get(ticker.symbol);
          if (funding) {
            return {
              ...ticker,
              fundingRate: funding.fundingRate || '0',
              nextFundingTime: funding.fundingTime ? funding.fundingTime.toString() : '0'
            };
          }
          return ticker;
        });

        console.log('[BingX] Merged funding rates into', mergedTickers.length, 'tickers');
        return mergedTickers;
      } else {
        console.warn('[BingX] Invalid funding rates response:', fundingResponse);
      }
    } catch (error) {
      console.error('[BingX] Failed to fetch funding rates:', error);
    }

    console.log('[BingX] Returning original tickers without funding rates');
    return tickers;
  }

  /**
   * Map BingX ticker format to Bybit ticker format for consistent display
   */
  private mapBingXTickers(bingxTickers: any[]): TickerData[] {
    return bingxTickers.map(ticker => ({
      symbol: ticker.symbol,
      lastPrice: ticker.lastPrice || '0',
      indexPrice: ticker.lastPrice || '0', // BingX doesn't have indexPrice, use lastPrice
      markPrice: ticker.lastPrice || '0',
      prevPrice24h: ticker.openPrice || '0',
      price24hPcnt: ticker.priceChangePercent ? (parseFloat(ticker.priceChangePercent) / 100).toString() : '0',
      highPrice24h: ticker.highPrice || '0',
      lowPrice24h: ticker.lowPrice || '0',
      prevPrice1h: ticker.openPrice || '0', // BingX doesn't have 1h price
      openInterest: '0', // BingX doesn't provide this in ticker
      openInterestValue: '0',
      turnover24h: ticker.quoteVolume || '0',
      volume24h: ticker.volume || '0',
      fundingRate: '0', // BingX doesn't include funding rate in tickers - need separate call
      nextFundingTime: '0',
      predictedDeliveryPrice: '0',
      basisRate: '0',
      deliveryFeeRate: '0',
      deliveryTime: '0',
      ask1Size: '0',
      bid1Price: '0',
      ask1Price: '0',
      bid1Size: '0'
    }));
  }

  /**
   * Load arbitrage opportunities from all exchanges
   */
  loadArbitrageOpportunities(): void {
    const token = this.authService.authState().token;
    if (!token) {
      this.arbitrageError.set('Authentication required');
      return;
    }

    this.isLoadingArbitrage.set(true);
    this.arbitrageError.set(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const arbitrageUrl = getEndpointUrl('arbitrage', 'fundingRates');

    this.http.get<any>(arbitrageUrl, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.arbitrageOpportunities.set(response.data || []);
          console.log(`[Arbitrage] Loaded ${response.data?.length || 0} opportunities`);
          console.log('[Arbitrage] Opportunity symbols:', response.data?.map((o: any) => o.symbol));
          console.log('[Arbitrage] First opportunity sample:', response.data?.[0]);

          // 🔍 DETAILED VERIFICATION: Check bestLong/bestShort mapping for first 3 opportunities
          console.log('='.repeat(80));
          console.log('🔍 HEDGED ARBITRAGE VERIFICATION - Primary vs Hedge Exchange');
          console.log('='.repeat(80));

          response.data?.slice(0, 3).forEach((opp: any, idx: number) => {
            console.log(`\n[${idx + 1}] Symbol: ${opp.symbol}`);
            console.log('-'.repeat(60));

            // Find the actual exchange data for bestLong and bestShort
            const bestLongExchange = opp.exchanges.find((ex: any) =>
              ex.exchange === opp.bestLong.exchange && ex.credentialId === opp.bestLong.credentialId
            );
            const bestShortExchange = opp.exchanges.find((ex: any) =>
              ex.exchange === opp.bestShort.exchange && ex.credentialId === opp.bestShort.credentialId
            );

            console.log(`Primary Exchange (bestLong):`);
            console.log(`  Exchange: ${opp.bestLong.exchange}`);
            console.log(`  Price: $${bestLongExchange?.lastPrice || 'N/A'}`);
            console.log(`  Funding: ${(parseFloat(bestLongExchange?.fundingRate || '0') * 100).toFixed(4)}%`);
            console.log(`  → This is where we LONG (BUY)`);

            console.log(`\nHedge Exchange (bestShort):`);
            console.log(`  Exchange: ${opp.bestShort.exchange}`);
            console.log(`  Price: $${bestShortExchange?.lastPrice || 'N/A'}`);
            console.log(`  Funding: ${(parseFloat(bestShortExchange?.fundingRate || '0') * 100).toFixed(4)}%`);
            console.log(`  → This is where we SHORT (SELL)`);

            console.log(`\nSpread: ${opp.spreadPercent}% ($${opp.priceSpreadUsdt})`);

            // Verify correctness
            const primaryPrice = parseFloat(bestLongExchange?.lastPrice || '0');
            const hedgePrice = parseFloat(bestShortExchange?.lastPrice || '0');

            if (primaryPrice > 0 && hedgePrice > 0) {
              if (primaryPrice < hedgePrice) {
                console.log(`✅ CORRECT: Primary ($${primaryPrice}) < Hedge ($${hedgePrice})`);
                console.log(`   → We BUY LOW and SELL HIGH = PROFIT`);
              } else {
                console.log(`❌ ERROR: Primary ($${primaryPrice}) >= Hedge ($${hedgePrice})`);
                console.log(`   → This would mean BUY HIGH and SELL LOW = LOSS!`);
              }
            }
          });

          console.log('\n' + '='.repeat(80));

          // Real-time streaming is now controlled by the enableRealtimeStreaming feature flag
          // via effect in constructor - no need to start it here
        } else {
          this.arbitrageError.set(response.message || 'Failed to load arbitrage data');
        }
        this.isLoadingArbitrage.set(false);
      },
      error: (error) => {
        console.error('[Arbitrage] Error loading opportunities:', error);
        this.arbitrageError.set(error.message || 'Failed to load arbitrage data');
        this.isLoadingArbitrage.set(false);
      }
    });
  }

  toggleArbitrageSection(): void {
    this.showArbitrageSection.update(v => !v);
  }

  toggleArbitrageFilters(): void {
    this.arbitrageFiltersCollapsed.update(v => !v);
  }

  clearArbitrageFilters(): void {
    this.arbitrageSearchQuery.set('');
    this.minSpreadThreshold.set(null);
    this.showOnlySubscribedArbitrage.set(false);
    this.maxNextFundingHoursArbitrage.set(null);
  }

  /**
   * Start real-time price streaming for top arbitrage opportunities
   *
   * Algorithm:
   * - HEDGED mode: Selects top 3 opportunities by maximum spread (descending)
   * - NON_HEDGED mode: Selects top 3 opportunities by maximum absolute funding rate (descending, considering sign)
   */
  startRealtimeStreaming(): void {
    // Check if feature is enabled
    if (!this.enableRealtimeStreaming()) {
      console.log('[RealtimeStream] Feature is disabled, skipping streaming');
      return;
    }

    const token = this.authService.authState().token;
    if (!token) {
      console.warn('[RealtimeStream] Cannot start streaming: no auth token');
      return;
    }

    const mode = this.arbitrageMode();

    // Get top 3 opportunities based on current mode
    // Sorting is already handled by sortedArbitrageOpportunities() computed signal
    const opportunities = this.sortedArbitrageOpportunities();
    if (opportunities.length === 0) {
      console.log('[RealtimeStream] No opportunities to stream');
      return;
    }

    // Select ONLY top 3 (not top 3 + bottom 3)
    const selectedOpportunities = opportunities.slice(0, Math.min(3, opportunities.length));

    console.log(`[RealtimeStream] Mode: ${mode}, Streaming top ${selectedOpportunities.length} opportunities`);

    // Build subscription configuration
    const symbols = new Set<string>();
    const exchangeConfigs: any[] = [];

    selectedOpportunities.forEach(opp => {
      symbols.add(opp.symbol);

      // Add all exchanges for this symbol
      opp.exchanges.forEach(ex => {
        // Find credential details
        const credential = this.credentials().find(c => c.id === ex.credentialId);
        if (credential) {
          exchangeConfigs.push({
            exchange: ex.exchange,
            symbol: opp.symbol,
            credentialId: ex.credentialId,
            environment: ex.environment,
          });
        }
      });
    });

    console.log(`[RealtimeStream] Starting stream for ${symbols.size} symbols across ${exchangeConfigs.length} exchanges`);

    // Subscribe to price updates
    this.arbitrageStreamService.subscribe(
      {
        symbols: Array.from(symbols),
        exchanges: exchangeConfigs,
      },
      token
    );

    // Listen to price updates
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
    }

    this.priceUpdateSubscription = this.arbitrageStreamService.getPriceUpdates().subscribe({
      next: (update: PriceUpdate) => {
        this.handlePriceUpdate(update);
      },
      error: (error) => {
        console.error('[RealtimeStream] Error receiving price updates:', error);
      }
    });

    // Track connection state
    this.arbitrageStreamService.getConnectionState().subscribe((state) => {
      this.isStreamConnected.set(state === 'connected');
      console.log('[RealtimeStream] Connection state:', state);
    });
  }

  /**
   * Handle real-time price update from SSE stream
   */
  handlePriceUpdate(update: PriceUpdate): void {
    const key = `${update.exchange}:${update.symbol}`;

    // Get previous price for change detection
    const currentPrices = this.realtimePrices();
    const previousEntry = currentPrices.get(key);

    // Determine price change direction
    let change: 'up' | 'down' | 'neutral' = 'neutral';
    if (previousEntry) {
      if (update.price > previousEntry.price) {
        change = 'up';
      } else if (update.price < previousEntry.price) {
        change = 'down';
      }
    }

    // Update prices map
    const updatedPrices = new Map(currentPrices);
    updatedPrices.set(key, {
      price: update.price,
      change,
      timestamp: update.timestamp,
    });
    this.realtimePrices.set(updatedPrices);

    // Trigger change detection
    this.cdr.markForCheck();

    console.log(`[RealtimeStream] Price update: ${update.exchange} ${update.symbol} = $${update.price.toFixed(2)} (${change})`);
  }

  /**
   * Get real-time price for a specific exchange-symbol pair
   */
  getRealtimePrice(exchange: string, symbol: string): { price: number; change: 'up' | 'down' | 'neutral' } | null {
    const key = `${exchange}:${symbol}`;
    const entry = this.realtimePrices().get(key);
    return entry ? { price: entry.price, change: entry.change } : null;
  }

  /**
   * Stop real-time price streaming
   */
  stopRealtimeStreaming(): void {
    console.log('[RealtimeStream] Stopping real-time streaming');

    // Unsubscribe from price updates
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
      this.priceUpdateSubscription = null;
    }

    // Disconnect from SSE stream
    this.arbitrageStreamService.disconnect();

    // Clear cached prices
    this.realtimePrices.set(new Map());
    this.isStreamConnected.set(false);

    console.log('[RealtimeStream] Streaming stopped');
  }

  /**
   * Cancel all active subscriptions
   * Always fetches fresh subscription data from server and deletes all of them
   */
  async cancelAllSubscriptions(): Promise<void> {
    try {
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Step 1: Fetch all subscriptions from server (to ensure we have the complete list)
      const response = await this.http.get<any>(
        'http://localhost:3000/api/funding-arbitrage/subscribe',
        { headers }
      ).toPromise();

      if (!response?.success || !response?.data) {
        this.showNotification('Failed to fetch subscriptions from server', 'error');
        return;
      }

      // Filter only active subscriptions (not completed)
      const serverSubscriptions = response.data.filter((sub: any) => sub.status !== 'COMPLETED');

      if (serverSubscriptions.length === 0) {
        this.showNotification('No active subscriptions found on server', 'info');
        // Still clear local state
        this.subscriptions.set(new Map());
        return;
      }

      // Step 2: Show confirmation dialog with server count
      const confirmed = confirm(
        `Are you sure you want to cancel ALL ${serverSubscriptions.length} active subscriptions?\n\n` +
        `This will delete all subscriptions from the database.\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }

      // Step 3: Delete all subscriptions in parallel
      console.log('[cancelAllSubscriptions] Deleting', serverSubscriptions.length, 'subscriptions');
      const cancelPromises = serverSubscriptions.map((sub: any) =>
        this.http.delete<any>(
          `http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${sub.subscriptionId}`,
          { headers }
        ).toPromise()
      );

      await Promise.all(cancelPromises);

      // Step 4: Clear local state
      this.subscriptions.set(new Map());

      this.showNotification(`Successfully cancelled all ${serverSubscriptions.length} subscriptions`, 'success');

      // Reload subscriptions to verify they're gone
      this.loadSubscriptions();
    } catch (error: any) {
      console.error('Error cancelling all subscriptions:', error);
      this.showNotification('Failed to cancel some subscriptions. Please try again.', 'error');

      // Reload subscriptions to get current state
      this.loadSubscriptions();
    }
  }

  /**
   * Sort by column with multi-sort support
   * - Click: Single column sort (replaces all)
   * - Shift+Click: Add column to multi-sort
   * - Click same column: Toggle direction
   */
  sortBy(column: string, event?: MouseEvent): void {
    const currentSorts = this.sortColumns();
    const existingIndex = currentSorts.findIndex(s => s.column === column);

    if (event?.shiftKey) {
      // Shift+Click: Add to multi-sort or toggle existing
      if (existingIndex >= 0) {
        // Toggle direction of existing sort
        const updated = [...currentSorts];
        updated[existingIndex] = {
          column,
          direction: updated[existingIndex].direction === 'asc' ? 'desc' : 'asc'
        };
        this.sortColumns.set(updated);
      } else {
        // Add new sort column
        this.sortColumns.set([...currentSorts, { column, direction: 'desc' }]);
      }
    } else {
      // Regular click: Single column sort
      if (existingIndex === 0 && currentSorts.length === 1) {
        // Same column, toggle direction
        this.sortColumns.set([{
          column,
          direction: currentSorts[0].direction === 'asc' ? 'desc' : 'asc'
        }]);
      } else {
        // New column, default to descending
        this.sortColumns.set([{ column, direction: 'desc' }]);
      }
    }
  }

  /**
   * Get sort info for a column (for display)
   */
  getSortInfo(column: string): { index: number; direction: 'asc' | 'desc' } | null {
    const sorts = this.sortColumns();
    const index = sorts.findIndex(s => s.column === column);
    if (index === -1) return null;
    return { index, direction: sorts[index].direction };
  }

  /**
   * Clear all sorting
   */
  clearSort(): void {
    this.sortColumns.set([{ column: 'fundingRate', direction: 'desc' }]);
  }

  /**
   * Sort arbitrage table by column with multi-sort support
   * - Click: Single column sort (replaces all)
   * - Shift+Click: Add column to multi-sort
   * - Click same column: Toggle direction
   */
  sortArbitrageBy(column: string, event?: MouseEvent): void {
    const currentSorts = this.arbitrageSortColumns();
    const existingIndex = currentSorts.findIndex(s => s.column === column);

    if (event?.shiftKey) {
      // Shift+Click: Add to multi-sort or toggle existing
      if (existingIndex >= 0) {
        // Toggle direction of existing sort
        const updated = [...currentSorts];
        updated[existingIndex] = {
          column,
          direction: updated[existingIndex].direction === 'asc' ? 'desc' : 'asc'
        };
        this.arbitrageSortColumns.set(updated);
      } else {
        // Add new sort column
        this.arbitrageSortColumns.set([...currentSorts, { column, direction: 'desc' }]);
      }
    } else {
      // Regular click: Single column sort
      if (existingIndex === 0 && currentSorts.length === 1) {
        // Same column, toggle direction
        this.arbitrageSortColumns.set([{
          column,
          direction: currentSorts[0].direction === 'asc' ? 'desc' : 'asc'
        }]);
      } else {
        // New column, default to descending
        this.arbitrageSortColumns.set([{ column, direction: 'desc' }]);
      }
    }
  }

  /**
   * Get sort info for arbitrage table column (for display)
   */
  getArbitrageSortInfo(column: string): { index: number; direction: 'asc' | 'desc' } | null {
    const sorts = this.arbitrageSortColumns();
    const index = sorts.findIndex(s => s.column === column);
    if (index === -1) return null;
    return { index, direction: sorts[index].direction };
  }

  /**
   * Clear arbitrage table sorting - resets to mode-specific default
   */
  clearArbitrageSort(): void {
    const mode = this.arbitrageMode();
    const defaultColumn = mode === 'HEDGED' ? 'spread' : 'funding';
    console.log(`[clearArbitrageSort] Resetting sort to ${defaultColumn} for ${mode} mode`);
    this.arbitrageSortColumns.set([{ column: defaultColumn, direction: 'desc' }]);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.positionType.set('all');
    this.minAbsFundingRate.set(null);
    this.maxNextFundingHours.set(null);
  }

  toggleFiltersCollapsed(): void {
    this.isFiltersCollapsed.update(v => !v);
  }

  formatPrice(price: string): string {
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }

  formatFundingRate(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '-';
    const percentage = (num * 100).toFixed(4);
    return `${percentage}%`;
  }

  formatAnnualizedRate(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '-';
    // Bybit charges funding every 8 hours (3 times per day)
    const annualized = num * 3 * 365 * 100;
    return `${annualized.toFixed(2)}%`;
  }

  formatPercent(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    const percentage = (num * 100).toFixed(2);
    return `${num >= 0 ? '+' : ''}${percentage}%`;
  }

  formatNextFundingTime(timestamp: string): string {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return '-';

    const date = new Date(ts);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  formatVolume(volume: string): string {
    const num = parseFloat(volume);
    if (isNaN(num)) return '-';

    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  }

  getFundingRateClass(rate: string): string {
    const num = parseFloat(rate);
    if (isNaN(num)) return '';

    if (num > 0) return 'funding-positive';
    if (num < 0) return 'funding-negative';
    return 'funding-neutral';
  }

  getPercentClass(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    if (num > 0) return 'percent-positive';
    if (num < 0) return 'percent-negative';
    return '';
  }

  /**
   * Check if a ticker meets the auto-subscribe threshold
   */
  tickerMeetsThreshold(symbol: string): boolean {
    return this.meetsAutoSubscribeThreshold().has(symbol);
  }

  /**
   * Get the recommended position type based on funding rate
   * Long if funding is negative (you receive funding)
   * Short if funding is positive (you receive funding)
   */
  getRecommendedPositionType(ticker: TickerData): 'long' | 'short' {
    const fundingRate = parseFloat(ticker.fundingRate);
    return fundingRate < 0 ? 'long' : 'short';
  }

  /**
   * Start subscription execution immediately (manual trigger)
   */
  async startSubscriptionNow(subscriptionId: string): Promise<void> {
    // Prevent duplicate executions
    if (this.startingSubscriptionId() === subscriptionId) {
      console.log('Already starting this subscription, ignoring duplicate request');
      return;
    }

    try {
      this.startingSubscriptionId.set(subscriptionId);

      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        this.startingSubscriptionId.set(null);
        return;
      }

      const response = await fetch(`/api/funding-arbitrage/execute/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Subscription execution started!', 'success');
        this.loadSubscriptions();
      } else {
        this.showNotification(`Failed to start: ${result.message || result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Start subscription error:', error);
      this.showNotification('Failed to start subscription execution', 'error');
    } finally {
      this.startingSubscriptionId.set(null);
    }
  }

  /**
   * Open subscription dialog for funding rate
   */
  openSubscriptionDialog(ticker: TickerData, event: Event): void {
    event.stopPropagation();
    this.selectedTicker.set(ticker);
    this.dialogLeverage.set(this.subscriptionSettings().leverage); // Initialize with global setting
    this.showSubscriptionDialog.set(true);
    this.positionSizeUsdt.set(100); // Default position size in USDT
  }

  /**
   * Close subscription dialog
   */
  closeSubscriptionDialog(): void {
    this.showSubscriptionDialog.set(false);
    this.selectedTicker.set(null);
    this.editingSubscription.set(null);
    this.isSubscribing.set(false);
    this.hedgeCredentialId.set(null); // Clear hedge credential
    this.dialogLeverage.set(this.subscriptionSettings().leverage); // Reset to global setting
  }

  /**
   * Toggle row expansion for inline subscription form
   */
  toggleRowExpansion(symbol: string): void {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(symbol)) {
      expanded.delete(symbol);
    } else {
      expanded.add(symbol);
      // Pre-fill quantity if there's an existing subscription
      const subscription = this.getActiveSubscription(symbol);
      if (subscription) {
        // Convert quantity back to USDT based on current price (approximate)
        const ticker = this.filteredTickers().find(t => t.symbol === symbol);
        if (ticker) {
          const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
          this.positionSizeUsdt.set(subscription.quantity * price);
        }
        this.editingSubscription.set(subscription);
      }
    }
    this.expandedRows.set(expanded);
  }

  /**
   * Check if row is expanded
   */
  isRowExpanded(symbol: string): boolean {
    return this.expandedRows().has(symbol);
  }

  /**
   * Get active subscription for a symbol
   */
  getActiveSubscription(symbol: string): FundingSubscription | undefined {
    // Find subscription by symbol (subscriptions Map is keyed by subscriptionId)
    const subs = Array.from(this.subscriptions().values());
    return subs.find(sub => sub.symbol === symbol);
  }

  /**
   * Subscribe from inline form or action button
   */
  subscribeFromInlineForm(ticker: TickerData): void {
    this.selectedTicker.set(ticker);
    // Use default quantity or the one set in expanded form
    if (!this.isRowExpanded(ticker.symbol)) {
      this.positionSizeUsdt.set(100); // Default position size in USDT
    }
    this.subscribeFundingRate();
  }

  /**
   * Check if subscription can be started now
   */
  canStartNow(subscription: FundingSubscription): boolean {
    // Can start now if waiting and more than 1 minute until funding
    return subscription.countdown !== undefined && subscription.countdown > 60;
  }

  /**
   * Cancel a subscription (wrapper for unsubscribe)
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.unsubscribe(subscriptionId, false);
  }

  /**
   * Load settings from localStorage
   */
  loadSettings(): void {
    const saved = localStorage.getItem('fundingSubscriptionSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved) as SubscriptionSettings;
        this.subscriptionSettings.set(settings);
        this.positionSizeUsdt.set(100); // Default position size in USDT
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(): void {
    const settings = this.subscriptionSettings();
    localStorage.setItem('fundingSubscriptionSettings', JSON.stringify(settings));
    // Position size is now in USDT, not affected by settings.defaultQuantity
    this.syncSettingsToFilters();
    this.showSettingsDialog.set(false);
    this.showNotification('Settings saved successfully', 'success');
  }

  /**
   * Sync settings to filters (threshold becomes min funding rate filter AND min spread filter)
   */
  syncSettingsToFilters(): void {
    const settings = this.subscriptionSettings();
    if (settings.autoCancelThreshold !== null && settings.autoCancelThreshold !== undefined) {
      // Convert from decimal (0.003) to percentage (0.3%) for the filter
      const thresholdPercent = Math.abs(settings.autoCancelThreshold) * 100;
      this.minAbsFundingRate.set(thresholdPercent);
      // Also sync to arbitrage min spread filter
      this.minSpreadThreshold.set(thresholdPercent);
    }
  }

  /**
   * Open settings dialog
   */
  openSettingsDialog(): void {
    this.showSettingsDialog.set(true);
  }

  /**
   * Close settings dialog
   */
  closeSettingsDialog(): void {
    this.showSettingsDialog.set(false);
    this.loadSettings(); // Reload to reset any unsaved changes
  }

  /**
   * Open trade history dialog
   * @param symbol - Optional symbol filter (e.g., 'BTCUSDT')
   * @param exchange - Optional exchange filter (e.g., 'BYBIT')
   */
  openTradeHistoryDialog(symbol?: string, exchange?: string): void {
    console.log('[FundingRates] Opening trade history dialog', { symbol, exchange });

    // Set dialog parameters
    this.tradeHistorySymbol.set(symbol);
    this.tradeHistoryExchange.set(exchange);

    // Open dialog
    this.showTradeHistoryDialog.set(true);
  }

  /**
   * Start auto-cancel checker (runs every 30 seconds)
   */
  private autoCancelInterval?: any;

  startAutoCancelChecker(): void {
    this.autoCancelInterval = setInterval(() => {
      this.checkAutoCancelConditions();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check if any subscriptions should be auto-cancelled based on funding rate threshold
   * Only cancels if BOTH conditions are met:
   * 1. Funding rate is below threshold
   * 2. Less than 30 seconds remaining before execution
   */
  checkAutoCancelConditions(): void {
    const settings = this.subscriptionSettings();
    if (!settings.enableAutoCancel || settings.autoCancelThreshold === null) {
      return; // Auto-cancel is disabled
    }

    const subscriptionsMap = this.subscriptions();
    const tickers = this.tickers();
    const now = Date.now();

    subscriptionsMap.forEach((subscription, subscriptionId) => {
      // Find current ticker data for this subscription
      const ticker = tickers.find(t => t.symbol === subscription.symbol);
      if (!ticker) return;

      const currentFundingRate = parseFloat(ticker.fundingRate);
      const absFundingRate = Math.abs(currentFundingRate);

      // Calculate time remaining until execution
      const timeRemaining = subscription.nextFundingTime - now;
      const secondsRemaining = Math.floor(timeRemaining / 1000);

      // Only cancel if funding rate is below threshold AND less than 30 seconds remaining
      const isFundingBelowThreshold = absFundingRate < Math.abs(settings.autoCancelThreshold!);
      const isCloseToExecution = secondsRemaining < 30 && secondsRemaining > 0;

      if (isFundingBelowThreshold && isCloseToExecution) {
        console.log(`Auto-cancelling ${subscription.symbol}: funding rate ${currentFundingRate} below threshold ${settings.autoCancelThreshold} with ${secondsRemaining}s remaining`);
        this.unsubscribe(subscriptionId, false); // Cancel with notification
        this.showNotification(
          `Auto-cancelled ${subscription.symbol}: funding rate ${(currentFundingRate * 100).toFixed(4)}% below threshold (${secondsRemaining}s remaining)`,
          'info'
        );
      }
    });
  }

  /**
   * Edit an existing subscription
   */
  async editSubscription(subscription: FundingSubscription): Promise<void> {
    console.log('[DEBUG] editSubscription called with:', subscription);

    // If subscription has primary credential, switch to it to load correct ticker data
    if (subscription.primaryCredentialId) {
      const currentCredId = this.selectedCredentialId();
      if (currentCredId !== subscription.primaryCredentialId) {
        console.log('[DEBUG] Switching credential from', currentCredId, 'to', subscription.primaryCredentialId);
        this.selectedCredentialId.set(subscription.primaryCredentialId);
        // Load tickers for this credential
        await this.loadTickersAsync().toPromise();
      }
    }

    // Find the ticker data for this subscription
    let ticker = this.tickers().find(t => t.symbol === subscription.symbol);

    if (!ticker) {
      // Try with normalized symbol (remove/add hyphens)
      const normalizedSymbol = subscription.symbol.includes('-')
        ? subscription.symbol.replace(/-/g, '')
        : subscription.symbol.replace('USDT', '-USDT');
      ticker = this.tickers().find(t => t.symbol === normalizedSymbol);
    }

    if (!ticker) {
      console.error('[ERROR] Cannot edit: ticker data not found for symbol:', subscription.symbol);
      console.log('[DEBUG] Available tickers:', this.tickers().map(t => t.symbol));
      this.showNotification(`[ERROR] Cannot find ticker data for ${subscription.symbol}. Please ensure the exchange is accessible.`, 'error');
      return;
    }

    console.log('[DEBUG] Found ticker:', ticker);

    this.editingSubscription.set(subscription);
    this.selectedTicker.set(ticker);

    // Set hedge credential if available
    if (subscription.hedgeCredentialId) {
      this.hedgeCredentialId.set(subscription.hedgeCredentialId);
    }

    // Use subscription's leverage if available, otherwise fall back to global setting
    const leverage = subscription.leverage || this.subscriptionSettings().leverage;

    // Use saved margin if available, otherwise recalculate from quantity
    const savedMargin = subscription.margin;
    if (savedMargin && savedMargin > 0) {
      console.log('[Edit] Loaded saved margin:', savedMargin);
      this.positionSizeUsdt.set(savedMargin);
    } else {
      // Fallback: recalculate from quantity (existing logic)
      const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
      const estimatedMargin = subscription.quantity * price / leverage;
      console.log('[Edit] Recalculated margin from quantity:', estimatedMargin, 'based on quantity:', subscription.quantity, 'price:', price, 'leverage:', leverage);
      this.positionSizeUsdt.set(estimatedMargin);
    }

    // Set leverage for dialog (use subscription's leverage, not global)
    this.dialogLeverage.set(leverage);
    console.log('[DEBUG] Set dialogLeverage to:', leverage, '(from subscription)');

    // Open the subscription dialog for editing
    console.log('[DEBUG] Opening subscription dialog');
    this.showSubscriptionDialog.set(true);

    // Fetch balances for both primary and hedge exchanges
    this.fetchBalancesAndCalculatePosition(ticker.symbol);
  }

  /**
   * Save edited subscription
   * Note: Backend doesn't support PATCH/PUT, so we need to cancel and recreate
   */
  saveEditedSubscription(): void {
    const editingSub = this.editingSubscription();
    if (!editingSub) {
      return;
    }

    const positionCalc = this.positionCalculation();
    if (!positionCalc) {
      this.showNotification('Unable to calculate position. Please check your input.', 'error');
      return;
    }
    const newQuantity = positionCalc.quantity;
    if (newQuantity === editingSub.quantity) {
      this.showNotification('[INFO] No changes to save', 'info');
      this.cancelEdit();
      return;
    }

    // Since backend doesn't have PUT endpoint, we need to cancel and recreate
    const token = this.authService.authState().token;
    if (!token) {
      this.showNotification('[ERROR] Not authenticated', 'error');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Step 1: Cancel existing subscription
    this.http.delete<any>(
      `http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${editingSub.subscriptionId}`,
      { headers }
    ).subscribe({
      next: (deleteResponse) => {
        if (deleteResponse.success) {
          // Step 2: Create new subscription with updated quantity
          const credential = this.selectedCredential();
          if (!credential) {
            this.showNotification('[ERROR] No exchange credential selected', 'error');
            return;
          }

          // Get hedge credential - REQUIRED
          const hedgeCred = this.hedgeCredential();
          if (!hedgeCred) {
            this.showNotification('[ERROR] Hedge credential is required. Please select a hedge exchange.', 'error');
            return;
          }

          const subscribeData = {
            symbol: editingSub.symbol,
            fundingRate: editingSub.fundingRate,
            nextFundingTime: editingSub.nextFundingTime,
            positionType: editingSub.positionType,
            quantity: newQuantity,
            primaryCredentialId: credential.id,
            hedgeExchange: hedgeCred.exchange,
            hedgeCredentialId: hedgeCred.id,
            leverage: this.subscriptionSettings().leverage
          };

          this.http.post<any>(
            'http://localhost:3000/api/funding-arbitrage/subscribe',
            subscribeData,
            { headers }
          ).subscribe({
            next: (createResponse) => {
              if (createResponse.success) {
                this.showNotification('[SUCCESS] Subscription updated successfully', 'success');
                this.editingSubscription.set(null);
                this.loadSubscriptions();
              } else {
                this.showNotification(`[ERROR] ${createResponse.message || 'Failed to recreate subscription'}`, 'error');
              }
            },
            error: (error) => {
              console.error('Recreate subscription error:', error);
              this.showNotification(`[ERROR] ${error.error?.message || 'Failed to recreate subscription'}`, 'error');
            }
          });
        } else {
          this.showNotification(`[ERROR] ${deleteResponse.message || 'Failed to cancel old subscription'}`, 'error');
        }
      },
      error: (error) => {
        console.error('Cancel subscription error:', error);
        this.showNotification(`[ERROR] ${error.error?.message || 'Failed to cancel old subscription'}`, 'error');
      }
    });
  }

  /**
   * Cancel editing subscription
   */
  cancelEdit(): void {
    this.editingSubscription.set(null);
    this.positionSizeUsdt.set(100); // Reset to default USDT amount
  }

  /**
   * Load existing subscriptions from the server
   */
  loadSubscriptions(): void {
    const token = this.authService.authState().token;
    if (!token) {
      console.log('No auth token, skipping subscription load');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:3000/api/funding-arbitrage/subscribe', { headers })
      .subscribe({
        next: (response) => {
          console.log('Loaded subscriptions:', response);
          if (response.success && response.data) {
            const subsMap = new Map<string, FundingSubscription>();
            const completedDealsList: CompletedDeal[] = [];

            response.data.forEach((sub: any) => {
              // Basic validation - symbol must be a non-empty string ending with USDT
              const isValidSymbol = sub.symbol &&
                                   typeof sub.symbol === 'string' &&
                                   sub.symbol.length > 0 &&
                                   (sub.symbol.endsWith('USDT') || sub.symbol.endsWith('-USDT'));

              if (!isValidSymbol) {
                console.warn(`[loadSubscriptions] Skipping subscription with invalid symbol: ${sub.symbol} (ID: ${sub.subscriptionId})`);
                return; // Skip this subscription
              }

              // Check if subscription is completed
              if (sub.status === 'COMPLETED' && sub.entryPrice) {
                completedDealsList.push({
                  subscriptionId: sub.subscriptionId,
                  symbol: sub.symbol,
                  fundingRate: sub.fundingRate,
                  positionType: sub.positionType,
                  quantity: sub.quantity,
                  entryPrice: sub.entryPrice,
                  hedgeEntryPrice: sub.hedgeEntryPrice,
                  fundingEarned: sub.fundingEarned,
                  realizedPnl: sub.realizedPnl,
                  executedAt: sub.executedAt,
                  createdAt: sub.createdAt,
                });
              } else if (sub.status !== 'COMPLETED') {
                // Only add non-completed subscriptions to active list
                subsMap.set(sub.subscriptionId, sub);
              }
            });

            console.log('[loadSubscriptions] Active subscriptions map:', subsMap);
            console.log('[loadSubscriptions] Active subscription symbols:', Array.from(subsMap.values()).map(s => s.symbol));
            console.log('[loadSubscriptions] Completed deals:', completedDealsList.length);

            this.subscriptions.set(subsMap);
            this.completedDeals.set(completedDealsList);
          }
        },
        error: (err) => {
          console.error('Failed to load subscriptions:', err);
        }
      });
  }

  /**
   * Subscribe to funding rate arbitrage
   */
  async subscribeFundingRate(): Promise<void> {
    const ticker = this.selectedTicker();
    const credential = this.selectedCredential();
    const editingSub = this.editingSubscription();

    if (!ticker || !credential) return;

    this.isSubscribing.set(true);

    try {
      // If editing, cancel the old subscription first
      if (editingSub) {
        await this.unsubscribe(editingSub.subscriptionId, true); // true = silent mode
      }
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      // Determine position type based on funding rate
      const fundingRate = parseFloat(ticker.fundingRate);
      const positionType = fundingRate < 0 ? 'long' : 'short';

      // Debug: Log ticker price data
      console.log(`[Subscribe ${ticker.symbol}] Price data - lastPrice: ${ticker.lastPrice}, markPrice: ${ticker.markPrice}`);

      // Calculate quantity from position size in USDT
      const positionCalc = this.positionCalculation();
      if (!positionCalc) {
        const errorMessage = this.positionValidationError() || 'Unable to calculate position details. Please check your input.';
        console.log(`[Subscribe ${ticker.symbol}] Validation error: ${errorMessage}`);
        this.showNotification(errorMessage, 'error');
        return;
      }

      // Get hedge credential - only REQUIRED for HEDGED mode
      const hedgeCred = this.hedgeCredential();
      const mode = this.arbitrageMode();

      if (mode === 'HEDGED' && !hedgeCred) {
        this.showNotification('Hedge credential is required for HEDGED mode. Please select a hedge exchange or switch to NON_HEDGED mode.', 'error');
        return;
      }

      const currentMargin = this.positionSizeUsdt();

      const body: any = {
        symbol: ticker.symbol,
        fundingRate: fundingRate,
        nextFundingTime: parseInt(ticker.nextFundingTime),
        positionType: positionType,
        quantity: positionCalc.quantity, // Use calculated quantity from USDT amount
        primaryCredentialId: credential.id,
        executionDelay: this.subscriptionSettings().executionDelay,
        leverage: this.dialogLeverage(), // Use dialog-specific leverage
        margin: currentMargin, // Current margin/position size in USDT
        mode: mode // Add mode to request body
      };

      // Only add hedge credentials if in HEDGED mode
      if (mode === 'HEDGED' && hedgeCred) {
        body.hedgeExchange = hedgeCred.exchange;
        body.hedgeCredentialId = hedgeCred.id;
      }

      console.log('[Subscribe] Saving margin:', currentMargin);
      console.log('Creating funding subscription:', body);

      const response = await this.http.post<any>(
        'http://localhost:3000/api/funding-arbitrage/subscribe',
        body,
        { headers }
      ).toPromise();

      if (response.success) {
        const subscription: FundingSubscription = {
          subscriptionId: response.data.subscriptionId,
          symbol: response.data.symbol,
          fundingRate: response.data.fundingRate,
          nextFundingTime: response.data.nextFundingTime,
          positionType: response.data.positionType,
          quantity: response.data.quantity,
          status: response.data.status
        };

        const subs = this.subscriptions();
        subs.set(subscription.subscriptionId, subscription);
        this.subscriptions.set(new Map(subs));

        const message = editingSub
          ? `✅ Updated subscription for ${ticker.symbol}`
          : `✅ Subscribed to ${ticker.symbol} funding arbitrage`;

        this.showNotification(message, 'success');

        this.closeSubscriptionDialog();
        this.startCountdownMonitoring(subscription);
      }
    } catch (error: any) {
      console.error('Error subscribing to funding rate:', error);
      this.showNotification(
        `Failed to subscribe: ${error.error?.message || error.message}`,
        'error'
      );
    } finally {
      this.isSubscribing.set(false);
    }
  }

  /**
   * Start countdown monitoring for a subscription
   */
  private startCountdownMonitoring(subscription: FundingSubscription): void {
    const updateCountdown = () => {
      const now = Date.now();
      const timeRemaining = subscription.nextFundingTime - now;
      const secondsRemaining = Math.floor(timeRemaining / 1000);

      if (secondsRemaining <= 0) {
        return;
      }

      // Update countdown
      const subs = this.subscriptions();
      const sub = subs.get(subscription.subscriptionId);
      if (sub) {
        sub.countdown = secondsRemaining;
        this.subscriptions.set(new Map(subs));
        // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      }

      // Notify at key moments
      if (secondsRemaining === 10) {
        this.showNotification(`⏰ 10 seconds until funding for ${subscription.symbol}`, 'info');
      } else if (secondsRemaining === 5) {
        this.showNotification(`🚀 Opening positions for ${subscription.symbol}...`, 'info');
      }

      // Schedule next update
      setTimeout(updateCountdown, 1000);
    };

    // Start the countdown
    updateCountdown();
  }

  /**
   * Unsubscribe from funding arbitrage
   */
  async unsubscribe(subscriptionId: string, silent: boolean = false): Promise<void> {
    try {
      const token = this.authService.authState().token;
      if (!token) return;

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await this.http.delete<any>(
        `http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${subscriptionId}`,
        { headers }
      ).toPromise();

      // Remove from local state
      const subs = this.subscriptions();
      subs.delete(subscriptionId);
      this.subscriptions.set(new Map(subs));

      if (!silent) {
        this.showNotification('Subscription canceled', 'info');
      }
    } catch (error: any) {
      console.error('Error unsubscribing:', error);

      // Check if subscription was already removed (404 or "not found" error)
      const isNotFound = error.status === 404 ||
                         error.error?.message?.includes('not found') ||
                         error.error?.error?.includes('not found');

      if (isNotFound) {
        // Subscription already gone from backend, just remove from frontend
        const subs = this.subscriptions();
        subs.delete(subscriptionId);
        this.subscriptions.set(new Map(subs));

        if (!silent) {
          this.showNotification('Subscription already removed', 'info');
        }
      } else {
        // Real error
        if (!silent) {
          this.showNotification('Failed to cancel subscription', 'error');
        }
      }
    }
  }

  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notifications = this.notifications();
    notifications.push(`[${type.toUpperCase()}] ${message}`);
    this.notifications.set([...notifications]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const notifs = this.notifications();
      const index = notifs.indexOf(`[${type.toUpperCase()}] ${message}`);
      if (index > -1) {
        notifs.splice(index, 1);
        this.notifications.set([...notifs]);
      }
    }, 5000);
  }

  /**
   * Calculate countdown from funding time
   */
  calculateCountdown(nextFundingTime: number): number {
    const now = Date.now();
    const timeRemaining = nextFundingTime - now;
    return Math.max(0, Math.floor(timeRemaining / 1000));
  }

  /**
   * Format countdown time
   */
  formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Executing...';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Check if a symbol has an active subscription
   */
  hasActiveSubscription(symbol: string): boolean {
    const hasSubscription = this.subscribedSymbols().has(symbol);

    // Debug logging
    if (hasSubscription) {
      console.log('[hasActiveSubscription] Symbol has subscription:', symbol);
    }

    return hasSubscription;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString();
  }

  /**
   * Get subscription for an arbitrage opportunity by symbol
   */
  getArbitrageSubscription(symbol: string): FundingSubscription | undefined {
    // Normalize symbol (remove hyphens)
    const normalizedSymbol = symbol.replace(/-/g, '');
    return this.symbolToSubscription().get(normalizedSymbol);
  }

  /**
   * Check if arbitrage opportunity has an active subscription
   */
  hasArbitrageSubscription(symbol: string): boolean {
    return this.getArbitrageSubscription(symbol) !== undefined;
  }

  /**
   * Start arbitrage subscription execution (for already subscribed symbols)
   */
  async startArbitrageSubscription(opportunity: any): Promise<void> {
    const subscription = this.getArbitrageSubscription(opportunity.symbol);
    if (!subscription) {
      this.showNotification('No active subscription found for this symbol', 'error');
      return;
    }

    await this.startSubscriptionNow(subscription.subscriptionId);
  }

  /**
   * Edit arbitrage subscription (for already subscribed symbols)
   */
  async editArbitrageSubscription(opportunity: any): Promise<void> {
    const subscription = this.getArbitrageSubscription(opportunity.symbol);
    if (!subscription) {
      this.showNotification('No active subscription found for this symbol', 'error');
      return;
    }

    console.log('[editArbitrageSubscription] === DEBUGGING MARGIN CALCULATION ===');
    console.log('[editArbitrageSubscription] Opportunity data:', opportunity);
    console.log('[editArbitrageSubscription] Subscription data:', subscription);

    // Set hedge credential if available
    if (subscription.hedgeCredentialId) {
      this.hedgeCredentialId.set(subscription.hedgeCredentialId);
      console.log('[editArbitrageSubscription] Set hedge credential:', subscription.hedgeCredentialId);
    }

    // Switch to primary credential if needed and load tickers to get current price
    if (subscription.primaryCredentialId) {
      const currentCredId = this.selectedCredentialId();
      if (currentCredId !== subscription.primaryCredentialId) {
        console.log('[editArbitrageSubscription] Switching credential from', currentCredId, 'to', subscription.primaryCredentialId);
        this.selectedCredentialId.set(subscription.primaryCredentialId);
        // Load tickers for this credential to get current price
        await this.loadTickersAsync().toPromise();
      }
    }

    // Find the actual ticker data from loaded tickers (has current price)
    let ticker = this.tickers().find(t => t.symbol === subscription.symbol);

    if (!ticker) {
      // Try with normalized symbol (BingX uses hyphens, Bybit doesn't)
      const normalizedSymbol = subscription.symbol.includes('-')
        ? subscription.symbol.replace(/-/g, '')
        : subscription.symbol.replace('USDT', '-USDT');
      ticker = this.tickers().find(t => t.symbol === normalizedSymbol);
    }

    if (!ticker) {
      console.error('[editArbitrageSubscription] ERROR: Cannot find ticker data for symbol:', subscription.symbol);
      console.log('[editArbitrageSubscription] Available tickers:', this.tickers().map(t => t.symbol));
      this.showNotification(`Cannot find current price for ${subscription.symbol}. Please try again.`, 'error');
      return;
    }

    console.log('[editArbitrageSubscription] Found ticker with price:', {
      symbol: ticker.symbol,
      lastPrice: ticker.lastPrice,
      markPrice: ticker.markPrice
    });

    this.editingSubscription.set(subscription);
    this.selectedTicker.set(ticker);

    // Use subscription's leverage if available, otherwise fall back to global setting
    const leverage = subscription.leverage || this.subscriptionSettings().leverage;

    // Use saved margin if available, otherwise recalculate from quantity
    const savedMargin = subscription.margin;
    if (savedMargin && savedMargin > 0) {
      console.log('[editArbitrageSubscription] Loaded saved margin:', savedMargin);
      this.positionSizeUsdt.set(savedMargin);
    } else {
      // Fallback: recalculate from quantity and current price
      const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
      const estimatedMargin = subscription.quantity * price / leverage;

      console.log('[editArbitrageSubscription] Recalculated margin from quantity:', estimatedMargin);
      console.log('[editArbitrageSubscription] Margin calculation:', {
        quantity: subscription.quantity,
        price: price,
        subscriptionLeverage: subscription.leverage,
        globalLeverage: this.subscriptionSettings().leverage,
        usedLeverage: leverage,
        calculation: `${subscription.quantity} * ${price} / ${leverage}`,
        estimatedMargin: estimatedMargin
      });

      this.positionSizeUsdt.set(estimatedMargin);
    }

    // Set leverage from subscription (use subscription's leverage, not global)
    this.dialogLeverage.set(leverage);
    console.log('[editArbitrageSubscription] Set dialogLeverage to:', leverage, '(from subscription)');

    // Open the subscription dialog for editing
    this.showSubscriptionDialog.set(true);

    // Fetch balances for both exchanges
    console.log('[editArbitrageSubscription] Calling fetchBalancesAndCalculatePosition...');
    this.fetchBalancesAndCalculatePosition(ticker.symbol);
  }

  /**
   * Cancel arbitrage subscription (for already subscribed symbols)
   */
  async cancelArbitrageSubscription(opportunity: any): Promise<void> {
    const subscription = this.getArbitrageSubscription(opportunity.symbol);
    if (!subscription) {
      this.showNotification('No active subscription found for this symbol', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to cancel the subscription for ${opportunity.symbol}?\n\n` +
      `Position: ${subscription.positionType.toUpperCase()}\n` +
      `Quantity: ${subscription.quantity}\n` +
      `Funding Rate: ${(subscription.fundingRate * 100).toFixed(4)}%`
    );

    if (!confirmed) {
      return;
    }

    await this.cancelSubscription(subscription.subscriptionId);
  }

  /**
   * Subscribe to arbitrage opportunity
   * Opens the subscription dialog for the best long position exchange
   */
  subscribeToArbitrage(opportunity: any): void {
    console.log('[subscribeToArbitrage] Called with opportunity:', opportunity);
    console.log('[subscribeToArbitrage] Mode:', this.arbitrageMode());

    const mode = this.arbitrageMode();

    // For NON_HEDGED mode: Choose the exchange with highest absolute funding rate
    // For HEDGED mode: Use bestLong as primary
    let primaryExchange: string;
    let primaryCredentialId: string;
    let primaryFundingRate: string;

    if (mode === 'NON_HEDGED') {
      // Compare absolute funding rates and choose the higher one
      const absLongRate = this.getAbsoluteFundingRate(opportunity.bestLong.fundingRate);
      const absShortRate = this.getAbsoluteFundingRate(opportunity.bestShort.fundingRate);

      if (absLongRate >= absShortRate) {
        primaryExchange = opportunity.bestLong.exchange;
        primaryCredentialId = opportunity.bestLong.credentialId;
        primaryFundingRate = opportunity.bestLong.fundingRate;
        console.log('[subscribeToArbitrage] NON_HEDGED: Using bestLong (higher abs rate):', { primaryExchange, absLongRate });
      } else {
        primaryExchange = opportunity.bestShort.exchange;
        primaryCredentialId = opportunity.bestShort.credentialId;
        primaryFundingRate = opportunity.bestShort.fundingRate;
        console.log('[subscribeToArbitrage] NON_HEDGED: Using bestShort (higher abs rate):', { primaryExchange, absShortRate });
      }
    } else {
      // HEDGED mode: Use bestLong as primary
      primaryExchange = opportunity.bestLong.exchange;
      primaryCredentialId = opportunity.bestLong.credentialId;
      primaryFundingRate = opportunity.bestLong.fundingRate;
      console.log('[subscribeToArbitrage] HEDGED: Using bestLong:', { primaryExchange });
    }

    // Find the matching credential
    const credential = this.credentials().find(c => c.id === primaryCredentialId);
    console.log('[subscribeToArbitrage] Found credential:', credential);
    console.log('[subscribeToArbitrage] All credentials:', this.credentials());

    if (!credential) {
      console.error('[subscribeToArbitrage] Credential not found for ID:', primaryCredentialId);
      this.showNotification('Exchange credential not found for ' + primaryExchange, 'error');
      return;
    }

    // Switch to the primary exchange's credential
    this.selectedCredentialId.set(primaryCredentialId);
    console.log('[subscribeToArbitrage] Switched to credential:', primaryCredentialId);

    // Set the hedge exchange credential (only for HEDGED mode)
    if (mode === 'HEDGED') {
      const bestShortCredentialId = opportunity.bestShort.credentialId;
      this.hedgeCredentialId.set(bestShortCredentialId);
      console.log('[subscribeToArbitrage] HEDGED: Set hedge credential:', bestShortCredentialId);
    } else {
      // For NON_HEDGED mode, clear hedge credential
      this.hedgeCredentialId.set(null);
      console.log('[subscribeToArbitrage] NON_HEDGED: Cleared hedge credential');
    }

    // Find the ticker data from the exchanges array
    const exchangeData = opportunity.exchanges.find(
      (ex: any) => ex.exchange === primaryExchange && ex.credentialId === primaryCredentialId
    );
    console.log('[subscribeToArbitrage] Found exchange data:', exchangeData);
    console.log('[subscribeToArbitrage] All exchanges:', opportunity.exchanges);

    if (!exchangeData) {
      console.error('[subscribeToArbitrage] Exchange data not found');
      this.showNotification('Ticker data not found for ' + opportunity.symbol, 'error');
      return;
    }

    // Try to find the actual ticker from loaded tickers (after switching credential)
    // We need to load tickers for this credential first
    this.loadTickers();

    // Wait a moment for tickers to load, then find the ticker
    setTimeout(() => {
      let ticker = this.tickers().find(t => t.symbol === opportunity.symbol);

      if (!ticker) {
        console.warn('[subscribeToArbitrage] Ticker not found in loaded tickers, creating from exchange data');
        // Fallback: Create a ticker object from exchange data with better price handling
        ticker = {
          symbol: opportunity.symbol,
          fundingRate: primaryFundingRate,
          nextFundingTime: exchangeData.nextFundingTime?.toString() || '0',
          lastPrice: (exchangeData.lastPrice || exchangeData.price || '0').toString(),
          indexPrice: (exchangeData.indexPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
          markPrice: (exchangeData.markPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
          prevPrice24h: '0',
          price24hPcnt: '0',
          highPrice24h: '0',
          lowPrice24h: '0',
          prevPrice1h: '0',
          openInterest: exchangeData.openInterest?.toString() || '0',
          openInterestValue: '0',
          turnover24h: '0',
          volume24h: exchangeData.volume24h?.toString() || '0',
          predictedDeliveryPrice: '0',
          basisRate: '0',
          deliveryFeeRate: '0',
          deliveryTime: '0',
          ask1Size: '0',
          bid1Price: '0',
          ask1Price: '0',
          bid1Size: '0'
        };
      }

      // Update the ticker's funding rate from arbitrage data
      ticker = {
        ...ticker,
        fundingRate: primaryFundingRate,
        nextFundingTime: exchangeData.nextFundingTime?.toString() || ticker.nextFundingTime
      };

      console.log('[subscribeToArbitrage] Using ticker:', ticker);
      this.selectedTicker.set(ticker);
      this.positionSizeUsdt.set(100); // Default position size in USDT
      this.dialogLeverage.set(this.subscriptionSettings().leverage); // Initialize with global setting
      this.showSubscriptionDialog.set(true);
      this.fetchBalancesAndCalculatePosition(ticker.symbol);

      // Show notification about the arbitrage opportunity
      let notificationMsg: string;
      if (mode === 'HEDGED') {
        const spreadPercent = (parseFloat(opportunity.spread) * 100).toFixed(4);
        notificationMsg = `Subscribing to ${opportunity.symbol} HEDGED arbitrage: ${spreadPercent}% spread between ${primaryExchange} and ${opportunity.bestShort.exchange}`;
      } else {
        const fundingPercent = (parseFloat(primaryFundingRate) * 100).toFixed(4);
        const positionType = parseFloat(primaryFundingRate) < 0 ? 'LONG' : 'SHORT';
        notificationMsg = `Subscribing to ${opportunity.symbol} NON_HEDGED: ${positionType} position on ${primaryExchange} (${fundingPercent}% funding rate)`;
      }
      console.log('[subscribeToArbitrage] Showing notification:', notificationMsg);
      this.showNotification(notificationMsg, 'info');

      console.log('[subscribeToArbitrage] Completed successfully');
    }, 500); // Give tickers time to load
  }

  /**
   * Fetch balances for primary and hedge exchanges and calculate position details
   */
  async fetchBalancesAndCalculatePosition(symbol: string): Promise<void> {
    const primaryCred = this.selectedCredential();
    const hedgeCred = this.hedgeCredential();
    const ticker = this.selectedTicker();

    if (!primaryCred || !ticker) {
      console.error('[fetchBalances] Missing primary credential or ticker');
      return;
    }

    this.isLoadingBalances.set(true);

    try {
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('Authentication required', 'error');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Fetch primary balance
      let primaryBalanceUrl: string;

      // Use correct endpoint based on exchange
      if (primaryCred.exchange === 'BYBIT') {
        primaryBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
      } else if (primaryCred.exchange === 'BINGX') {
        primaryBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
      } else {
        console.warn('[fetchBalances] Unsupported primary exchange:', primaryCred.exchange);
        this.primaryBalance.set(null);
        return;
      }

      const primaryBalanceResponse = await this.http.get<any>(primaryBalanceUrl, { headers }).toPromise();

      console.log('[fetchBalances] Primary balance response:', JSON.stringify(primaryBalanceResponse, null, 2));

      if (primaryBalanceResponse?.success && primaryBalanceResponse.data) {
        let balance = 0;

        // Extract balance based on exchange type
        if (primaryCred.exchange === 'BYBIT') {
          console.log('[fetchBalances] Bybit data structure:', primaryBalanceResponse.data);
          // Bybit returns: data.list[0].totalAvailableBalance
          const list = primaryBalanceResponse.data.list;
          if (list && list.length > 0) {
            balance = parseFloat(list[0].totalAvailableBalance || '0');
            console.log('[fetchBalances] Bybit balance from list[0]:', balance);
          } else {
            console.warn('[fetchBalances] Bybit list is empty or undefined:', list);
          }
        } else if (primaryCred.exchange === 'BINGX') {
          // BingX response: data.balance.availableMargin or data.balance.balance
          console.log('[fetchBalances] BingX FULL response:', primaryBalanceResponse);
          console.log('[fetchBalances] BingX data:', primaryBalanceResponse.data);
          console.log('[fetchBalances] BingX data.balance:', primaryBalanceResponse.data?.balance);

          const bingxBalance = primaryBalanceResponse.data?.balance;
          if (bingxBalance) {
            console.log('[fetchBalances] BingX balance object keys:', Object.keys(bingxBalance));
            console.log('[fetchBalances] BingX balance.availableMargin:', bingxBalance.availableMargin);
            console.log('[fetchBalances] BingX balance.balance:', bingxBalance.balance);
            balance = parseFloat(bingxBalance.availableMargin || bingxBalance.balance || '0');
          } else {
            console.error('[fetchBalances] BingX balance object is null/undefined');
          }
          console.log('[fetchBalances] Final extracted balance:', balance);
        }

        this.primaryBalance.set(balance);
        console.log('[fetchBalances] Primary balance set to:', balance, 'for', primaryCred.exchange);
        this.cdr.detectChanges(); // Trigger change detection to update computed signals in UI
        console.log('[fetchBalances] Change detection triggered after primary balance update');
      }

      // Fetch hedge balance if available
      if (hedgeCred) {
        let hedgeBalanceUrl: string;

        // Use correct endpoint based on exchange
        if (hedgeCred.exchange === 'BYBIT') {
          hedgeBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
        } else if (hedgeCred.exchange === 'BINGX') {
          hedgeBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
        } else {
          console.warn('[fetchBalances] Unsupported hedge exchange:', hedgeCred.exchange);
          this.hedgeBalance.set(null);
          return;
        }

        const hedgeBalanceResponse = await this.http.get<any>(hedgeBalanceUrl, { headers }).toPromise();

        console.log('[fetchBalances] Hedge balance response:', JSON.stringify(hedgeBalanceResponse, null, 2));

        if (hedgeBalanceResponse?.success && hedgeBalanceResponse.data) {
          let balance = 0;

          // Extract balance based on exchange type
          if (hedgeCred.exchange === 'BYBIT') {
            // Bybit returns: data.list[0].totalAvailableBalance
            const list = hedgeBalanceResponse.data.list;
            if (list && list.length > 0) {
              balance = parseFloat(list[0].totalAvailableBalance || '0');
              console.log('[fetchBalances] Hedge Bybit balance from list[0]:', balance);
            } else {
              console.warn('[fetchBalances] Hedge Bybit list is empty or undefined:', list);
            }
          } else if (hedgeCred.exchange === 'BINGX') {
            // BingX response: data.balance.availableMargin or data.balance.balance
            console.log('[fetchBalances] Hedge BingX data structure:', hedgeBalanceResponse.data);
            const bingxBalance = hedgeBalanceResponse.data.balance;
            console.log('[fetchBalances] Hedge BingX balance object:', bingxBalance);
            balance = parseFloat(bingxBalance?.availableMargin || bingxBalance?.balance || '0');
            console.log('[fetchBalances] Hedge extracted balance:', balance);
          }

          this.hedgeBalance.set(balance);
          console.log('[fetchBalances] Hedge balance set to:', balance, 'for', hedgeCred.exchange);
          this.cdr.detectChanges(); // Trigger change detection to update computed signals in UI
          console.log('[fetchBalances] Change detection triggered after hedge balance update');
        }
      } else {
        // No hedge credential selected
        this.hedgeBalance.set(null);
      }

      // Position calculation is now automatic via computed signal

    } catch (error: any) {
      console.error('[fetchBalances] Error fetching balances:', error);
      this.primaryBalance.set(null);
      this.hedgeBalance.set(null);
    } finally {
      this.isLoadingBalances.set(false);
      this.cdr.detectChanges(); // Trigger final change detection after loading completes
      console.log('[fetchBalances] Final change detection triggered after loading completion');
    }
  }

  /**
   * Opens the trading pair's futures page on the exchange platform
   */
  openTradingPair(symbol: string): void {
    const credential = this.selectedCredential();
    if (!credential) return;

    const exchange = credential.exchange;
    const environment = credential.environment;

    let url = '';

    switch (exchange) {
      case 'BYBIT':
        if (environment === 'TESTNET') {
          // Bybit Testnet futures trading page
          url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
        } else {
          // Bybit Mainnet futures trading page
          url = `https://www.bybit.com/trade/usdt/${symbol}`;
        }
        break;

      case 'BINANCE':
        if (environment === 'TESTNET') {
          // Binance Testnet futures
          url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
        } else {
          // Binance Mainnet futures
          url = `https://www.binance.com/en/futures/${symbol}`;
        }
        break;

      case 'OKX':
        // OKX doesn't have separate testnet URLs for trading
        url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
        break;

      case 'KRAKEN':
        // Kraken futures
        url = `https://futures.kraken.com/trade/${symbol}`;
        break;

      case 'COINBASE':
        // Coinbase doesn't have futures trading in the same way
        url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
        break;

      case 'BINGX':
        if (environment === 'TESTNET') {
          // BingX Testnet perpetual trading page
          url = `https://testnet-futures.bingx.com/en/perpetual/${symbol}`;
        } else {
          // BingX Mainnet perpetual trading page
          url = `https://bingx.com/en/perpetual/${symbol}`;
        }
        break;

      default:
        console.warn('Unknown exchange:', exchange);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get absolute value of a funding rate (helper for templates)
   */
  getAbsoluteFundingRate(fundingRate: string | number): number {
    return Math.abs(parseFloat(fundingRate?.toString() || '0'));
  }

  /**
   * Opens the trading pair's futures page on a specific exchange platform
   * Used by arbitrage table where exchange is passed explicitly
   */
  openTradingPairForExchange(symbol: string, exchange: string, environment: string, originalSymbol?: string): void {
    let url = '';

    // Use originalSymbol for exchanges that need specific formatting (e.g., BingX uses hyphens)
    const displaySymbol = originalSymbol || symbol;

    switch (exchange) {
      case 'BYBIT':
        if (environment === 'TESTNET') {
          url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
        } else {
          url = `https://www.bybit.com/trade/usdt/${symbol}`;
        }
        break;

      case 'BINANCE':
        if (environment === 'TESTNET') {
          url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
        } else {
          url = `https://www.binance.com/en/futures/${symbol}`;
        }
        break;

      case 'OKX':
        url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
        break;

      case 'KRAKEN':
        url = `https://futures.kraken.com/trade/${symbol}`;
        break;

      case 'COINBASE':
        url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
        break;

      case 'BINGX':
        // BingX uses hyphens in their URLs (e.g., DOOD-USDT instead of DOODUSDT)
        if (environment === 'TESTNET') {
          url = `https://testnet-futures.bingx.com/en/perpetual/${displaySymbol}`;
        } else {
          url = `https://bingx.com/en/perpetual/${displaySymbol}`;
        }
        break;

      case 'MEXC':
        // MEXC uses underscore format in URLs (e.g., BTC_USDT)
        const mexcSymbol = displaySymbol.includes('_') ? displaySymbol : symbol.replace(/^(.+)(USDT|USDC|USD)$/, '$1_$2');
        url = `https://www.mexc.com/futures/${mexcSymbol}?type=linear_swap`;
        break;

      default:
        console.warn('Unknown exchange:', exchange);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get market cap for a symbol
   */
  getMarketCap(symbol: string): number {
    // TODO: Implement market cap fetching
    return 0;
  }

  /**
   * Format market cap value for display
   */
  formatMarketCap(value: number): string {
    if (value === 0) return '';

    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }

  /**
   * Start hedged arbitrage - opens a modal to configure leverage and margin for both exchanges
   */
  startHedgedArbitrage(opportunity: any): void {
    console.log('Starting hedged arbitrage for:', opportunity);

    // Store the selected opportunity
    this.selectedHedgedOpportunity.set(opportunity);

    // Initialize leverage and margin with default values
    const defaultLeverage = this.subscriptionSettings().leverage || 3;
    this.hedgedPrimaryLeverage.set(defaultLeverage);
    this.hedgedHedgeLeverage.set(defaultLeverage);
    this.hedgedPrimaryMargin.set(100);
    this.hedgedHedgeMargin.set(100);

    // Show the HEDGED mode dialog
    this.showHedgedDialog.set(true);
  }

  /**
   * Close the HEDGED mode dialog
   */
  closeHedgedDialog(): void {
    this.showHedgedDialog.set(false);
    this.selectedHedgedOpportunity.set(null);
  }

  /**
   * Execute hedged arbitrage - opens positions on both exchanges simultaneously
   */
  async executeHedgedArbitrage(): Promise<void> {
    const opportunity = this.selectedHedgedOpportunity();
    if (!opportunity) {
      this.showNotification('No opportunity selected', 'error');
      return;
    }

    // Validate inputs
    if (this.hedgedPrimaryMargin() <= 0 || this.hedgedHedgeMargin() <= 0) {
      this.showNotification('Margin must be greater than 0', 'error');
      return;
    }

    if (this.hedgedPrimaryLeverage() < 1 || this.hedgedHedgeLeverage() < 1) {
      this.showNotification('Leverage must be at least 1', 'error');
      return;
    }

    this.isStartingHedged.set(true);

    try {
      // TODO: Implement API call to open positions on both exchanges
      // PRIMARY = HIGH price exchange (bestShort) - where we SHORT
      // HEDGE = LOW price exchange (bestLong) - where we LONG
      console.log('Executing hedged arbitrage:', {
        symbol: opportunity.symbol,
        primaryExchange: opportunity.bestShort.exchange,
        primaryCredentialId: opportunity.bestShort.credentialId,
        primaryLeverage: this.hedgedPrimaryLeverage(),
        primaryMargin: this.hedgedPrimaryMargin(),
        hedgeExchange: opportunity.bestLong.exchange,
        hedgeCredentialId: opportunity.bestLong.credentialId,
        hedgeLeverage: this.hedgedHedgeLeverage(),
        hedgeMargin: this.hedgedHedgeMargin(),
      });

      // For now, just show success notification
      this.showNotification(`Hedged arbitrage for ${opportunity.symbol} started successfully!`, 'success');

      // Close the dialog
      this.closeHedgedDialog();
    } catch (error) {
      console.error('Error executing hedged arbitrage:', error);
      this.showNotification(`Failed to execute hedged arbitrage: ${error}`, 'error');
    } finally {
      this.isStartingHedged.set(false);
    }
  }


  /**
   * Formats duration between two timestamps
   */
  formatDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = end - start;

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes % 60}m`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  /**
   * Formats datetime for display
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  /**
   * Returns CSS class based on P&L value
   */
  getPnlColorClass(pnl: number): string {
    if (pnl > 0) return 'positive';
    if (pnl < 0) return 'negative';
    return 'neutral';
  }
}
