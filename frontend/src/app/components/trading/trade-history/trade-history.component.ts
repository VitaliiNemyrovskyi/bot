import { Component, OnInit, OnDestroy, signal, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent } from '../../ui/dialog/dialog.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { SelectComponent } from '../../ui/select/select.component';
import { TradeHistoryService } from '../../../services/trade-history.service';
import { TradeHistoryRecord } from '../../../models/trade-history.model';

export interface TradeHistoryDialogData {
  symbol?: string;
  exchange?: string;
}

/**
 * Trade History Component
 *
 * Displays historical trading data with comprehensive statistics and filtering options.
 *
 * Features:
 * - Trade history table with sorting
 * - Real-time statistics (P&L, win rate, fees)
 * - Filter by symbol and exchange
 * - Responsive design
 * - Auto-refresh capability
 * - Uses reusable ui-dialog component for consistency
 */
@Component({
  selector: 'app-trade-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ButtonComponent,
    CardComponent,
    SelectComponent
  ],
  templateUrl: './trade-history.component.html',
  styleUrls: ['./trade-history.component.scss']
})
export class TradeHistoryComponent implements OnInit, OnDestroy {
  // Dialog state
  @Input() set open(value: boolean) {
    this._open.set(value);
  }
  get open() {
    return this._open();
  }
  private _open = signal<boolean>(false);

  @Input() initialSymbol: string = '';
  @Input() initialExchange: string = '';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  // Component state
  displayedColumns: string[] = [
    'symbol',
    'exchange',
    'positionType',
    'executedAt',
    'closedAt',
    'entryPrice',
    'exitPrice',
    'pnl',
    'funding',
    'status'
  ];

  // Filters
  selectedSymbol: string = '';
  selectedExchange: string = '';
  availableSymbols: string[] = [];
  availableExchanges: string[] = ['BYBIT', 'BINGX', 'MEXC', 'BINANCE', 'OKX'];

  // Auto-refresh
  private refreshInterval?: number;
  autoRefreshEnabled: boolean = false;

  constructor(public tradeHistoryService: TradeHistoryService) {}

  ngOnInit(): void {
    console.log('[TradeHistoryComponent] Initializing...');

    // Set initial filters from inputs if provided
    if (this.initialSymbol) {
      console.log('[TradeHistoryComponent] Opening with symbol:', this.initialSymbol);
      this.selectedSymbol = this.initialSymbol;
    }
    if (this.initialExchange) {
      console.log('[TradeHistoryComponent] Opening with exchange:', this.initialExchange);
      this.selectedExchange = this.initialExchange;
    }

    this.loadTradeHistory();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Load trade history from API
   */
  loadTradeHistory(): void {
    const params: any = {
      limit: 100
    };

    if (this.selectedSymbol) {
      params.symbol = this.selectedSymbol;
    }

    if (this.selectedExchange) {
      params.exchange = this.selectedExchange;
    }

    console.log('[TradeHistoryComponent] Loading trades with params:', params);

    this.tradeHistoryService.getTradeHistory(params).subscribe({
      next: (response) => {
        console.log(`[TradeHistoryComponent] Loaded ${response.count} trades`);
        this.updateAvailableFilters();
      },
      error: (error) => {
        console.error('[TradeHistoryComponent] Error loading trades:', error);
      }
    });
  }

  /**
   * Update available filter options based on loaded data
   */
  private updateAvailableFilters(): void {
    const trades = this.tradeHistoryService.trades();

    // Extract unique symbols
    const symbols = new Set<string>();
    trades.forEach(trade => symbols.add(trade.symbol));
    this.availableSymbols = Array.from(symbols).sort();
  }

  /**
   * Apply filters and reload data
   */
  applyFilters(): void {
    console.log('[TradeHistoryComponent] Applying filters:', {
      symbol: this.selectedSymbol,
      exchange: this.selectedExchange
    });
    this.loadTradeHistory();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedSymbol = '';
    this.selectedExchange = '';
    this.loadTradeHistory();
  }

  /**
   * Refresh trade history
   */
  refresh(): void {
    console.log('[TradeHistoryComponent] Refreshing trades...');
    this.loadTradeHistory();
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;

    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  /**
   * Start auto-refresh (every 30 seconds)
   */
  private startAutoRefresh(): void {
    this.stopAutoRefresh(); // Clear any existing interval

    this.refreshInterval = window.setInterval(() => {
      console.log('[TradeHistoryComponent] Auto-refreshing...');
      this.loadTradeHistory();
    }, 30000); // 30 seconds
  }

  /**
   * Stop auto-refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  /**
   * Format timestamp to readable date
   */
  formatDate(date: string | null): string {
    if (!date) return '-';

    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format price with 2 decimals
   */
  formatPrice(price: number | null): string {
    if (price === null || price === undefined) return '-';
    return price.toFixed(2);
  }

  /**
   * Format PnL with sign and color
   */
  formatPnl(pnl: number): { text: string; class: string } {
    const formatted = this.tradeHistoryService.formatPnl(pnl);
    return {
      text: `${formatted.value} USDT`,
      class: formatted.isPositive ? 'positive' : 'negative'
    };
  }

  /**
   * Get position type badge class
   */
  getPositionTypeClass(positionType: string | undefined): string {
    if (!positionType) return '';
    return positionType.toLowerCase() === 'long' ? 'long' : 'short';
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      case 'ERROR':
        return 'error';
      default:
        return 'active';
    }
  }

  /**
   * Calculate trade duration in human-readable format
   */
  getTradeAdvice(trade: TradeHistoryRecord): string {
    const pnl = trade.realizedPnl;
    const duration = trade.duration || 0;

    if (pnl > 10) {
      return '🎉 Great trade!';
    } else if (pnl > 0) {
      return '✅ Profitable';
    } else if (pnl < -10) {
      return '⚠️ Large loss';
    } else {
      return '❌ Loss';
    }
  }

  /**
   * Export trades to CSV
   */
  exportToCSV(): void {
    const trades = this.tradeHistoryService.trades();
    if (trades.length === 0) {
      console.warn('[TradeHistoryComponent] No trades to export');
      return;
    }

    // CSV headers
    const headers = [
      'Symbol',
      'Exchange',
      'Position Type',
      'Executed At',
      'Closed At',
      'Entry Price',
      'Exit Price',
      'Realized PnL',
      'Funding Earned',
      'Total Fees',
      'Net Profit',
      'Status'
    ];

    // CSV rows
    const rows = trades.map(trade => [
      trade.symbol,
      trade.exchange,
      trade.positionType,
      trade.executedAt || '',
      trade.closedAt || '',
      trade.entryPrice,
      trade.exitPrice || '',
      trade.realizedPnl,
      trade.fundingEarned,
      ((trade.entryFee || 0) + (trade.exitFee || 0)),
      (trade.realizedPnl - ((trade.entryFee || 0) + (trade.exitFee || 0))),
      trade.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `trade-history-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[TradeHistoryComponent] Exported trades to CSV');
  }

  /**
   * Handle dialog open/close state changes
   */
  onDialogOpenChange(isOpen: boolean): void {
    this._open.set(isOpen);
    this.openChange.emit(isOpen);
    if (!isOpen) {
      this.close.emit();
    }
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this._open.set(false);
    this.openChange.emit(false);
    this.close.emit();
  }
}
