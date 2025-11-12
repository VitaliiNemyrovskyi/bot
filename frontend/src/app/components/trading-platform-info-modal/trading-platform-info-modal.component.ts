import { Component, OnInit, OnDestroy, signal, computed, input, output, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import {
  BybitUserService,
  BybitUserInfo,
  BybitCoinBalance,
  BybitPosition,
  BybitOrder
} from '../../services/bybit-user.service';
import {
  BingXUserService,
  BingXUserInfo,
  BingXPosition
} from '../../services/bingx-user.service';
import {
  ExchangeCredential,
  ExchangeType,
  getExchangeName,
  getExchangeLogo,
  EXCHANGE_METADATA
} from '../../models/exchange-credentials.model';
import { TranslationService } from '../../services/translation.service';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

/**
 * Trading Platform Info Modal Component
 *
 * Displays comprehensive trading platform information in a modal dialog.
 * Supports multiple exchanges (Bybit, Binance, etc.) with testnet/mainnet environments.
 *
 * Features:
 * - Account overview with wallet balance and equity
 * - Coin balances breakdown
 * - Active positions with PnL
 * - Active orders and order history
 * - Loading and error states
 * - Responsive design
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 */
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-trading-platform-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    ButtonComponent
  ],
  templateUrl: './trading-platform-info-modal.component.html',
  styleUrl: './trading-platform-info-modal.component.scss'
})
export class TradingPlatformInfoModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Input: Exchange credential to display information for
  credential = input.required<ExchangeCredential>();

  // Output: Event emitted when modal should be closed
  closeModal = output<void>();

  // Component state signals
  userInfo = signal<BybitUserInfo | BingXUserInfo | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  activeTab = signal<string>('overview');

  protected translationService = inject(TranslationService);

  // Tab configuration
  tabs: Tab[] = [
    { id: 'overview', label: 'modal.accountOverview', icon: '📊' },
    { id: 'balances', label: 'modal.balances', icon: '💰' },
    { id: 'positions', label: 'modal.positions', icon: '📈' },
    { id: 'orders', label: 'modal.activeOrders', icon: '📋' }
  ];

  // Computed values
  readonly exchangeName = computed(() => getExchangeName(this.credential().exchange));
  readonly exchangeLogo = computed(() => getExchangeLogo(this.credential().exchange));
  readonly exchangeColor = computed(() => EXCHANGE_METADATA[this.credential().exchange]?.color);

  readonly totalEquity = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return '0.00';

    const accountInfo = info.data.accountInfo;
    if ('error' in accountInfo) return '0.00';

    // Check if it's Bybit or BingX
    if ('totalEquity' in accountInfo) {
      // Bybit
      return accountInfo.totalEquity || '0.00';
    } else if ('balance' in accountInfo) {
      // BingX
      return accountInfo.balance.equity || '0.00';
    }

    return '0.00';
  });

  readonly availableBalance = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return '0.00';

    const accountInfo = info.data.accountInfo;
    if ('error' in accountInfo) return '0.00';

    // Check if it's Bybit or BingX
    if ('totalAvailableBalance' in accountInfo) {
      // Bybit
      return accountInfo.totalAvailableBalance || '0.00';
    } else if ('balance' in accountInfo) {
      // BingX
      return accountInfo.balance.availableMargin || '0.00';
    }

    return '0.00';
  });

  readonly walletBalance = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return '0.00';

    const accountInfo = info.data.accountInfo;
    if ('error' in accountInfo) return '0.00';

    // Check if it's Bybit or BingX
    if ('totalWalletBalance' in accountInfo) {
      // Bybit
      return accountInfo.totalWalletBalance || '0.00';
    } else if ('balance' in accountInfo) {
      // BingX
      return accountInfo.balance.balance || '0.00';
    }

    return '0.00';
  });

  readonly unrealizedPnl = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return 0;

    const cred = this.credential();
    if (cred.exchange === ExchangeType.BYBIT) {
      return this.bybitUserService.calculateUnrealizedPnl(info as BybitUserInfo);
    } else if (cred.exchange === ExchangeType.BINGX) {
      return this.bingxUserService.calculateUnrealizedPnl(info as BingXUserInfo);
    }

    return 0;
  });

  readonly nonZeroBalances = computed(() => {
    const info = this.userInfo();
    if (!info) return [];

    const cred = this.credential();
    if (cred.exchange === ExchangeType.BYBIT) {
      return this.bybitUserService.getNonZeroBalances(info as BybitUserInfo);
    }

    // BingX doesn't have coin balances in the same way, return empty
    return [];
  });

  readonly activePositions = computed(() => {
    const info = this.userInfo();
    if (!info) return [];

    const cred = this.credential();
    if (cred.exchange === ExchangeType.BYBIT) {
      return this.bybitUserService.getActivePositions(info as BybitUserInfo);
    } else if (cred.exchange === ExchangeType.BINGX) {
      return this.bingxUserService.getActivePositions(info as BingXUserInfo);
    }

    return [];
  });

  readonly activeOrders = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return [];

    // Bybit has activeOrders, BingX doesn't currently fetch orders
    const data = info.data as any;
    return data.activeOrders || [];
  });

  readonly hasError = computed(() => {
    const info = this.userInfo();
    if (!info) return false;

    const accountInfo = info.data.accountInfo;
    return 'error' in accountInfo;
  });

  readonly accountInfo = computed(() => {
    const info = this.userInfo();
    if (!info || !info.success) return null;

    const accInfo = info.data.accountInfo;
    if ('error' in accInfo) return null;

    return accInfo;
  });

  constructor(
    private bybitUserService: BybitUserService,
    private bingxUserService: BingXUserService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    // Load user info when modal opens
    this.loadUserInfo();

    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.close();
    }
  };

  /**
   * Load user information from exchange
   * Supports Bybit and BingX exchanges
   */
  loadUserInfo(): void {
    const cred = this.credential();

    this.loading.set(true);
    this.error.set(null);

    if (cred.exchange === ExchangeType.BYBIT) {
      // Subscribe to Bybit service observables
      this.bybitUserService.userInfo$
        .pipe(takeUntil(this.destroy$))
        .subscribe(info => this.userInfo.set(info));

      this.bybitUserService.error$
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => this.error.set(error));

      // Fetch Bybit user info
      this.bybitUserService.getUserInfo().subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Failed to load Bybit user info:', err);
        }
      });
    } else if (cred.exchange === ExchangeType.BINGX) {
      // Subscribe to BingX service observables
      this.bingxUserService.userInfo$
        .pipe(takeUntil(this.destroy$))
        .subscribe(info => this.userInfo.set(info));

      this.bingxUserService.error$
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => this.error.set(error));

      // Fetch BingX user info (uses active credentials from backend)
      this.bingxUserService.getUserInfo().subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Failed to load BingX user info:', err);
        }
      });
    } else {
      this.error.set(`Exchange ${cred.exchange} is not yet supported`);
      this.loading.set(false);
    }
  }

  /**
   * Refresh user information
   */
  refreshUserInfo(): void {
    this.loadUserInfo();
  }

  /**
   * Change active tab
   */
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  /**
   * Close modal
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Handle overlay click (close modal)
   */
  handleOverlayClick(): void {
    this.close();
  }

  /**
   * Stop event propagation (prevent closing when clicking modal content)
   */
  handleContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Parse float helper for templates
   */
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  /**
   * Format large numbers with proper units (K, M, B)
   */
  formatNumber(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    const absNum = Math.abs(num);

    if (absNum >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    } else if (absNum >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (absNum >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else {
      return num.toFixed(2);
    }
  }

  /**
   * Format currency with proper decimals
   */
  formatCurrency(value: string | number, decimals = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0.00';

    return num.toFixed(decimals);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0.00%';

    return (num * 100).toFixed(2) + '%';
  }

  /**
   * Get position PnL color class
   */
  getPnlColorClass(pnl: string | number): string {
    const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;

    if (isNaN(num) || num === 0) return 'text-muted';
    return num > 0 ? 'text-success' : 'text-danger';
  }

  /**
   * Get order status badge class
   */
  getOrderStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'Filled': 'badge-success',
      'PartiallyFilled': 'badge-info',
      'Cancelled': 'badge-secondary',
      'Rejected': 'badge-danger',
      'New': 'badge-primary',
      'PendingCancel': 'badge-warning'
    };

    return statusClasses[status] || 'badge-secondary';
  }

  /**
   * Get side badge class (Buy/Sell)
   */
  getSideClass(side: string): string {
    return side === 'Buy' ? 'badge-success' : 'badge-danger';
  }

  /**
   * Calculate position profit percentage
   */
  calculatePositionProfitPct(position: BybitPosition | BingXPosition): number {
    // Bybit position
    if ('side' in position && 'entryPrice' in position && 'markPrice' in position) {
      const entryPrice = parseFloat(position.entryPrice);
      const markPrice = parseFloat(position.markPrice);

      if (isNaN(entryPrice) || isNaN(markPrice) || entryPrice === 0) {
        return 0;
      }

      const pct = ((markPrice - entryPrice) / entryPrice) * 100;
      return position.side === 'Buy' ? pct : -pct;
    }

    // BingX position
    if ('positionSide' in position && 'entryPrice' in position && 'markPrice' in position) {
      const entryPrice = parseFloat(position.entryPrice);
      const markPrice = parseFloat(position.markPrice);

      if (isNaN(entryPrice) || isNaN(markPrice) || entryPrice === 0) {
        return 0;
      }

      const pct = ((markPrice - entryPrice) / entryPrice) * 100;
      return position.positionSide === 'LONG' ? pct : -pct;
    }

    return 0;
  }

  /**
   * Get position side for display (handles both Bybit and BingX)
   */
  getPositionSide(position: BybitPosition | BingXPosition): string {
    if ('side' in position) {
      return position.side; // Bybit: 'Buy' or 'Sell'
    }
    if ('positionSide' in position) {
      return position.positionSide; // BingX: 'LONG' or 'SHORT'
    }
    return '';
  }

  /**
   * Get position size for display (handles both Bybit and BingX)
   */
  getPositionSize(position: BybitPosition | BingXPosition): string {
    if ('size' in position) {
      return position.size; // Bybit
    }
    if ('positionAmt' in position) {
      return position.positionAmt; // BingX
    }
    return '0';
  }

  /**
   * Get position unrealized PnL (handles both Bybit and BingX)
   */
  getPositionUnrealizedPnl(position: BybitPosition | BingXPosition): string {
    if ('unrealisedPnl' in position) {
      return position.unrealisedPnl; // Bybit
    }
    if ('unrealizedProfit' in position) {
      return position.unrealizedProfit; // BingX
    }
    return '0';
  }

  /**
   * Get account field value (handles both Bybit and BingX)
   */
  getAccountField(field: string): string {
    const info = this.accountInfo();
    if (!info) return '0.00';

    // Bybit fields
    if (field === 'totalEquity' && 'totalEquity' in info) {
      return info.totalEquity || '0.00';
    }
    if (field === 'totalWalletBalance' && 'totalWalletBalance' in info) {
      return info.totalWalletBalance || '0.00';
    }
    if (field === 'totalAvailableBalance' && 'totalAvailableBalance' in info) {
      return info.totalAvailableBalance || '0.00';
    }
    if (field === 'totalMarginBalance' && 'totalMarginBalance' in info) {
      return info.totalMarginBalance || '0.00';
    }
    if (field === 'totalInitialMargin' && 'totalInitialMargin' in info) {
      return info.totalInitialMargin || '0.00';
    }
    if (field === 'totalPerpUPL' && 'totalPerpUPL' in info) {
      return info.totalPerpUPL || '0.00';
    }

    // BingX fields
    if ('balance' in info) {
      const balance = info.balance;
      if (field === 'totalEquity') return balance.equity || '0.00';
      if (field === 'totalWalletBalance') return balance.balance || '0.00';
      if (field === 'totalAvailableBalance') return balance.availableMargin || '0.00';
      if (field === 'totalMarginBalance') return balance.usedMargin || '0.00';
      if (field === 'totalInitialMargin') return balance.usedMargin || '0.00';
      if (field === 'totalPerpUPL') return balance.unrealizedProfit || '0.00';
    }

    return '0.00';
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Retry loading after error
   */
  retryLoad(): void {
    this.clearError();
    this.loadUserInfo();
  }
}
