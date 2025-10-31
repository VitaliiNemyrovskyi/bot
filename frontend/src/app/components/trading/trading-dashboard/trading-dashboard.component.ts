import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, Subscription } from 'rxjs';

// UI Components
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { SelectComponent, SelectOption } from '../../ui/select/select.component';
import { DropdownOption } from '../../ui/dropdown/dropdown.component';
import { InputComponent } from '../../ui/input/input.component';
import { TableComponent, TableColumn } from '../../ui/table/table.component';
import { LightweightChartComponent } from '../../lightweight-chart/lightweight-chart.component';
import { OrderFormComponent } from '../order-form/order-form.component';

// Services
import { ManualTradingService } from '../../../services/manual-trading.service';
import { TranslationService } from '../../../services/translation.service';
import { ExchangeCredentialsService } from '../../../services/exchange-credentials.service';
import { BybitService } from '../../../services/bybit.service';

// Models
import {
  Exchange,
  OrderRequest,
  OrderSide,
  Position,
  Order,
  Balance,
  TradingSymbol
} from '../../../models/trading.model';
import { ExchangeCredential, getExchangeName } from '../../../models/exchange-credentials.model';

/**
 * Trading Dashboard Component
 *
 * Comprehensive manual trading interface for cryptocurrency exchanges.
 * Provides functionality for:
 * - Placing market and limit orders with advanced options
 * - Monitoring open positions with real-time PnL updates
 * - Viewing order history with filtering and pagination
 * - Tracking account balance and margin usage
 *
 * Features:
 * - Reactive forms with real-time validation
 * - Angular Signals for efficient state management
 * - Auto-refresh capability for real-time data
 * - Responsive design for all device sizes
 * - Comprehensive error handling and user feedback
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * @example
 * Usage in template:
 * ```html
 * <trading-dashboard></trading-dashboard>
 * ```
 */
@Component({
  selector: 'trading-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    SelectComponent,
    InputComponent,
    TableComponent,
    LightweightChartComponent,
    OrderFormComponent
  ],
  templateUrl: './trading-dashboard.component.html',
  styleUrls: ['./trading-dashboard.component.css']
})
export class TradingDashboardComponent implements OnInit, OnDestroy {
  // Injected services
  private _http = inject(HttpClient);
  private tradingService = inject(ManualTradingService);
  protected translationService = inject(TranslationService);
  private credentialsService = inject(ExchangeCredentialsService);
  private _bybitService = inject(BybitService);

  // Component lifecycle
  private destroy$ = new Subject<void>();
  private autoRefreshSubscription?: Subscription;

  // State signals
  private _selectedCredentialId = signal<string | null>(null);
  private _selectedSymbol = signal<TradingSymbol>('BTCUSDT');
  positions = signal<Position[]>([]);
  orders = signal<Order[]>([]);
  balance = signal<Balance | null>(null);
  autoRefreshEnabled = signal<boolean>(false);

  // Symbol options for dropdown
  symbolOptions = signal<DropdownOption[]>([]);
  isLoadingSymbols = signal<boolean>(false);

  // Getters and setters for ngModel binding
  get selectedCredentialId() { return this._selectedCredentialId(); }
  set selectedCredentialId(value: string | null) { this._selectedCredentialId.set(value); }

  get selectedSymbol() { return this._selectedSymbol(); }
  set selectedSymbol(value: TradingSymbol) { this._selectedSymbol.set(value); }

  // Credentials from service
  credentials = this.credentialsService.credentials;
  isLoadingCredentials = this.credentialsService.loading;

  // Computed signals
  totalUnrealizedPnl = computed(() => {
    return this.positions().reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  });

  hasOpenPositions = computed(() => this.positions().length > 0);
  hasPendingOrders = computed(() => this.orders().some(o => o.status === 'New'));

  // Computed signal for credential dropdown options
  credentialOptions = computed((): DropdownOption[] => {
    return this.credentials()
      .filter(cred => cred.isActive)
      .map(cred => ({
        value: cred.id,
        label: this.formatCredentialLabel(cred)
      }));
  });

  // Get selected credential object
  selectedCredential = computed(() => {
    const credId = this._selectedCredentialId();
    if (!credId) return null;
    return this.credentials().find(c => c.id === credId) ?? null;
  });

  // Get selected exchange from credential
  selectedExchange = computed(() => {
    const cred = this.selectedCredential();
    return cred ? cred.exchange.toLowerCase() as Exchange : null;
  });

  // Get chart symbol with exchange prefix (computed)
  private _chartSymbol = computed(() => {
    const cred = this.selectedCredential();
    const symbol = this._selectedSymbol();

    if (!cred || !symbol) return '';

    // Map exchange to TradingView exchange code
    const exchangeMap: Record<string, string> = {
      'BYBIT': 'BYBIT',
      'BINANCE': 'BINANCE',
      'OKX': 'OKX',
      'COINBASE': 'COINBASE'
    };

    const exchangeCode = exchangeMap[cred.exchange.toUpperCase()] || 'BYBIT';
    return `${exchangeCode}:${symbol}`;
  });

  // Regular property for chart binding (updated via effect)
  chartSymbol = '';

  // Loading and error states from service
  isPlacingOrder = this.tradingService.isPlacingOrder;
  isLoadingPositions = this.tradingService.isLoadingPositions;
  isLoadingOrders = this.tradingService.isLoadingOrders;
  isLoadingBalance = this.tradingService.isLoadingBalance;

  // Table columns
  positionsColumns: TableColumn[] = [
    { key: 'symbol', label: this.translate('trading.table.symbol'), sortable: true },
    { key: 'side', label: this.translate('trading.table.side'), sortable: true },
    { key: 'size', label: this.translate('trading.table.size'), sortable: true, type: 'number', align: 'right' },
    { key: 'entryPrice', label: this.translate('trading.table.entryPrice'), sortable: true, type: 'currency', align: 'right' },
    { key: 'markPrice', label: this.translate('trading.table.markPrice'), sortable: true, type: 'currency', align: 'right' },
    { key: 'unrealizedPnl', label: this.translate('trading.table.unrealizedPnl'), sortable: true, type: 'currency', align: 'right' },
    { key: 'leverage', label: this.translate('trading.table.leverage'), sortable: true, type: 'number', align: 'center' },
    { key: 'actions', label: this.translate('trading.table.actions'), sortable: false, align: 'center' }
  ];

  ordersColumns: TableColumn[] = [
    { key: 'symbol', label: this.translate('trading.table.symbol'), sortable: true },
    { key: 'type', label: this.translate('trading.table.type'), sortable: true },
    { key: 'side', label: this.translate('trading.table.side'), sortable: true },
    { key: 'quantity', label: this.translate('trading.table.quantity'), sortable: true, type: 'number', align: 'right' },
    { key: 'price', label: this.translate('trading.table.price'), sortable: true, type: 'currency', align: 'right' },
    { key: 'status', label: this.translate('trading.table.status'), sortable: true },
    { key: 'createdAt', label: this.translate('trading.table.time'), sortable: true, type: 'date' },
    { key: 'actions', label: this.translate('trading.table.actions'), sortable: false, align: 'center' }
  ];

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  constructor() {
    // No form initialization needed - using OrderFormComponent

    // Effect to sync computed chartSymbol to property for change detection
    effect(() => {
      const newSymbol = this._chartSymbol();
      if (newSymbol && newSymbol !== this.chartSymbol) {
        console.log('Chart symbol changed:', this.chartSymbol, '->', newSymbol);
        this.chartSymbol = newSymbol;
      }
    });
  }

  ngOnInit(): void {
    // Load credentials first
    this.credentialsService.fetchCredentials().subscribe({
      next: () => {
        // Auto-select first active credential if available
        const firstActive = this.credentialOptions()[0];
        if (firstActive) {
          this._selectedCredentialId.set(firstActive.value);
          this.loadTradingSymbols();
        }
        this.loadMockData();
      },
      error: (err) => console.error('Failed to load credentials:', err)
    });

    // Subscribe to cached data from service
    this.tradingService.positions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(positions => this.positions.set(positions));

    this.tradingService.orders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => this.orders.set(orders));

    this.tradingService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(balance => this.balance.set(balance));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }

  /**
   * Load all trading data (positions, orders, balance)
   */
  loadAllData(): void {
    const exchange = this.selectedExchange();
    if (!exchange) return;

    // For development, use mock data
    // In production, uncomment the following:
    // this.tradingService.getPositions(exchange).subscribe();
    // this.tradingService.getOrders(exchange).subscribe();
    // this.tradingService.getAccountBalance(exchange).subscribe();

    this.loadMockData();
  }

  /**
   * Load mock data for development/testing
   */
  private loadMockData(): void {
    this.positions.set(this.tradingService.getMockPositions());
    this.orders.set(this.tradingService.getMockOrders());
    this.balance.set(this.tradingService.getMockBalance());
  }

  /**
   * Handle order placed from OrderFormComponent
   */
  handleOrderPlaced(orderRequest: any): void {
    const credential = this.selectedCredential();

    if (!credential) {
      console.error('No credential selected');
      return;
    }

    // Add credential and exchange to order request
    const completeOrderRequest: OrderRequest = {
      ...orderRequest,
      exchange: credential.exchange.toLowerCase() as Exchange,
      credentialId: credential.id
    };

    this.tradingService.placeOrder(completeOrderRequest).subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.loadAllData();
        // TODO: Show success toast notification
      },
      error: (error) => {
        console.error('Failed to place order:', error);
        // TODO: Show error toast notification
      }
    });
  }

  /**
   * Close a position
   */
  closePosition(position: Position): void {
    if (confirm(this.translate('trading.confirmClosePosition'))) {
      this.tradingService.closePosition({
        exchange: position.exchange,
        symbol: position.symbol,
        side: position.side
      }).subscribe({
        next: () => {
          console.log('Position closed successfully');
          this.loadAllData();
          // TODO: Show success toast notification
        },
        error: (error) => {
          console.error('Failed to close position:', error);
          // TODO: Show error toast notification
        }
      });
    }
  }

  /**
   * Cancel an order
   */
  cancelOrder(order: Order): void {
    if (order.status !== 'New') {
      return;
    }

    if (confirm(this.translate('trading.confirmCancelOrder'))) {
      this.tradingService.cancelOrder({
        exchange: order.exchange,
        orderId: order.orderId,
        symbol: order.symbol
      }).subscribe({
        next: () => {
          console.log('Order cancelled successfully');
          this.loadAllData();
          // TODO: Show success toast notification
        },
        error: (error) => {
          console.error('Failed to cancel order:', error);
          // TODO: Show error toast notification
        }
      });
    }
  }

  /**
   * Refresh all data manually
   */
  refreshData(): void {
    this.loadAllData();
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    const enabled = !this.autoRefreshEnabled();
    this.autoRefreshEnabled.set(enabled);

    if (enabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  /**
   * Start auto-refresh
   */
  private startAutoRefresh(): void {
    const exchange = this.selectedExchange();
    if (!exchange) return;

    this.autoRefreshSubscription = this.tradingService
      .setupAutoRefresh(exchange, 10000) // Refresh every 10 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  /**
   * Stop auto-refresh
   */
  private stopAutoRefresh(): void {
    this.autoRefreshSubscription?.unsubscribe();
  }

  /**
   * Get CSS class for PnL value (green for profit, red for loss)
   */
  getPnlClass(pnl: number): string {
    return pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
  }

  /**
   * Get CSS class for order side (green for buy, red for sell)
   */
  getSideClass(side: OrderSide): string {
    return side === 'Buy' ? 'side-buy' : 'side-sell';
  }

  /**
   * Format PnL value with + or - sign
   */
  formatPnl(pnl: number): string {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  }

  /**
   * Format PnL percentage
   */
  formatPnlPercent(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return order.status === 'New';
  }

  /**
   * Translate a key using the translation service
   */
  protected translate(key: string): string {
    return this.translationService.translate(key);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  /**
   * Format currency value
   */
  formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  /**
   * Format credential label for dropdown
   */
  private formatCredentialLabel(credential: ExchangeCredential): string {
    const exchangeName = getExchangeName(credential.exchange);
    const label = credential.label ? ` - ${credential.label}` : '';
    return `${exchangeName}${label}`;
  }

  /**
   * Handle credential change from dropdown
   */
  onCredentialChange(credentialId: string): void {
    console.log('Credential changed to:', credentialId);
    this._selectedCredentialId.set(credentialId);

    const cred = this.selectedCredential();
    console.log('Selected credential:', cred);
    console.log('Chart symbol before load:', this.chartSymbol);

    this.loadTradingSymbols();
    this.loadAllData();

    // Log after a brief delay to see if computed updated
    setTimeout(() => {
      console.log('Chart symbol after change:', this.chartSymbol);
    }, 100);
  }

  /**
   * Handle symbol change from dropdown
   */
  onSymbolChange(symbol: TradingSymbol): void {
    this._selectedSymbol.set(symbol);
    // Chart will update automatically via binding
  }

  /**
   * Load trading symbols for selected exchange
   */
  private loadTradingSymbols(): void {
    const exchange = this.selectedExchange();
    if (!exchange) {
      this.symbolOptions.set([]);
      return;
    }

    this.isLoadingSymbols.set(true);

    this.tradingService.getSymbols(exchange).subscribe({
      next: (symbols) => {
        const options = symbols.map(s => ({
          value: s.symbol as TradingSymbol,
          label: s.symbol
        }));
        this.symbolOptions.set(options);
        this.isLoadingSymbols.set(false);

        // Auto-select BTCUSDT if available, otherwise first symbol
        const btcOption = options.find(opt => opt.value === 'BTCUSDT');
        if (btcOption) {
          this._selectedSymbol.set('BTCUSDT');
        } else if (options.length > 0) {
          this._selectedSymbol.set(options[0].value);
        }
      },
      error: (error) => {
        console.error('Failed to load trading symbols:', error);
        // Fallback to default popular trading pairs
        this.loadDefaultSymbols();
        this.isLoadingSymbols.set(false);
      }
    });
  }

  /**
   * Load default trading symbols as fallback
   */
  private loadDefaultSymbols(): void {
    const defaultSymbols: SelectOption[] = [
      { value: 'BTCUSDT', label: 'BTCUSDT' },
      { value: 'ETHUSDT', label: 'ETHUSDT' },
      { value: 'BNBUSDT', label: 'BNBUSDT' },
      { value: 'SOLUSDT', label: 'SOLUSDT' },
      { value: 'XRPUSDT', label: 'XRPUSDT' },
      { value: 'ADAUSDT', label: 'ADAUSDT' },
      { value: 'DOGEUSDT', label: 'DOGEUSDT' },
      { value: 'MATICUSDT', label: 'MATICUSDT' },
      { value: 'DOTUSDT', label: 'DOTUSDT' },
      { value: 'AVAXUSDT', label: 'AVAXUSDT' }
    ];

    this.symbolOptions.set(defaultSymbols);
    this._selectedSymbol.set('BTCUSDT');
  }
}
