/**
 * Active Price Arbitrage Positions Component
 *
 * Displays and manages active price arbitrage positions across exchanges.
 * Features:
 * - Real-time position monitoring
 * - Unrealized P&L calculations
 * - Position close functionality
 * - Status filtering
 * - Responsive table layout
 */

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PriceArbitrageService } from '../../../services/price-arbitrage.service';
import { TranslationService } from '../../../services/translation.service';
import {
  PriceArbitragePositionDTO,
  PriceArbitrageStatus,
  calculateHoldingTime,
  formatPnlDisplay
} from '../../../models/price-arbitrage.model';

import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent } from '../../ui/dialog/dialog.component';

@Component({
  selector: 'app-active-positions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent
  ],
  templateUrl: './active-positions.component.html',
  styleUrl: './active-positions.component.scss'
})
export class ActivePositionsComponent implements OnInit, OnDestroy {
  private priceArbitrageService = inject(PriceArbitrageService);
  private translationService = inject(TranslationService);

  // State signals
  positions = signal<PriceArbitragePositionDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedStatus = signal<'ALL' | PriceArbitrageStatus>('ACTIVE');

  // Close confirmation dialog
  showCloseDialog = signal<boolean>(false);
  positionToClose = signal<PriceArbitragePositionDTO | null>(null);
  isClosing = signal<boolean>(false);

  // Auto-refresh subscription
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5000; // 5 seconds

  // Computed properties
  filteredPositions = computed(() => {
    const status = this.selectedStatus();
    const allPositions = this.positions();

    if (status === 'ALL') {
      return allPositions;
    }

    return allPositions.filter(p => p.status === status);
  });

  activeCount = computed(() =>
    this.positions().filter(p => p.status === PriceArbitrageStatus.ACTIVE).length
  );

  completedCount = computed(() =>
    this.positions().filter(p => p.status === PriceArbitrageStatus.COMPLETED).length
  );

  errorCount = computed(() =>
    this.positions().filter(p => p.status === PriceArbitrageStatus.ERROR).length
  );

  ngOnInit(): void {
    this.loadPositions();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Load positions from API
   */
  loadPositions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const status = this.selectedStatus() === 'ALL' ? undefined : this.selectedStatus();

    this.priceArbitrageService.getPositions(status as PriceArbitrageStatus | undefined)
      .subscribe({
        next: (positions) => {
          this.positions.set(positions);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading positions:', err);
          this.error.set(err.message || 'Failed to load positions');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Start auto-refresh interval
   */
  private startAutoRefresh(): void {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(
        switchMap(() => {
          const status = this.selectedStatus() === 'ALL' ? undefined : this.selectedStatus();
          return this.priceArbitrageService.getPositions(status as PriceArbitrageStatus | undefined);
        })
      )
      .subscribe({
        next: (positions) => {
          this.positions.set(positions);
        },
        error: (err) => {
          console.error('Error refreshing positions:', err);
        }
      });
  }

  /**
   * Stop auto-refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Change status filter
   */
  changeStatusFilter(status: 'ALL' | PriceArbitrageStatus): void {
    this.selectedStatus.set(status);
    this.loadPositions();
  }

  /**
   * Open close confirmation dialog
   */
  openCloseDialog(position: PriceArbitragePositionDTO): void {
    this.positionToClose.set(position);
    this.showCloseDialog.set(true);
  }

  /**
   * Cancel close dialog
   */
  cancelClose(): void {
    this.showCloseDialog.set(false);
    this.positionToClose.set(null);
  }

  /**
   * Confirm and close position
   */
  confirmClose(): void {
    const position = this.positionToClose();
    if (!position) return;

    this.isClosing.set(true);

    this.priceArbitrageService.closePosition(position.id)
      .subscribe({
        next: (result) => {
          console.log('Position closed successfully:', result);

          // Update the position in the list
          const updatedPositions = this.positions().map(p =>
            p.id === position.id ? result.position : p
          );
          this.positions.set(updatedPositions);

          // Close dialog
          this.showCloseDialog.set(false);
          this.positionToClose.set(null);
          this.isClosing.set(false);

          // Show success notification (you can implement toast notifications)
          alert(`Position closed successfully! Total P&L: $${result.totalPnl.toFixed(2)}`);
        },
        error: (err) => {
          console.error('Error closing position:', err);
          this.isClosing.set(false);
          alert(`Failed to close position: ${err.message}`);
        }
      });
  }

  /**
   * Calculate unrealized P&L for display
   */
  getUnrealizedPnl(position: PriceArbitragePositionDTO): number {
    return this.priceArbitrageService.calculateUnrealizedPnl(position);
  }

  /**
   * Get P&L display with color coding
   */
  getPnlDisplay(position: PriceArbitragePositionDTO) {
    const pnl = this.getUnrealizedPnl(position);
    return formatPnlDisplay(pnl);
  }

  /**
   * Get holding time display
   */
  getHoldingTimeDisplay(position: PriceArbitragePositionDTO): string {
    if (!position.openedAt) return 'N/A';
    return calculateHoldingTime(position.openedAt).formatted;
  }

  /**
   * Get current spread display
   */
  getCurrentSpreadDisplay(position: PriceArbitragePositionDTO): string {
    if (position.currentSpreadPercent !== undefined) {
      return `${position.currentSpreadPercent.toFixed(4)}%`;
    }
    return 'N/A';
  }

  /**
   * Get entry spread display
   */
  getEntrySpreadDisplay(position: PriceArbitragePositionDTO): string {
    return `${position.entrySpreadPercent.toFixed(4)}%`;
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: PriceArbitrageStatus): string {
    switch (status) {
      case PriceArbitrageStatus.ACTIVE:
        return 'status-active';
      case PriceArbitrageStatus.COMPLETED:
        return 'status-completed';
      case PriceArbitrageStatus.ERROR:
        return 'status-error';
      case PriceArbitrageStatus.PENDING:
        return 'status-pending';
      case PriceArbitrageStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Format P&L for display
   */
  formatPnl(pnl: number | undefined): string {
    if (pnl === undefined || pnl === null) return 'N/A';
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  }
}
