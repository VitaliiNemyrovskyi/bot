import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PriceArbitrageService } from '../../services/price-arbitrage.service';
import { TranslationService } from '../../services/translation.service';
import {
  PriceArbitragePositionDTO,
  PriceArbitrageStatus,
  calculateHoldingTime,
  formatPnlDisplay
} from '../../models/price-arbitrage.model';

import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../components/ui/card/card.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogContentComponent, DialogFooterComponent } from '../../components/ui/dialog/dialog.component';

@Component({
  selector: 'app-active-arbitrage-positions',
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
  templateUrl: './active-arbitrage-positions.component.html',
  styleUrl: './active-arbitrage-positions.component.scss'
})
export class ActiveArbitragePositionsComponent implements OnInit, OnDestroy {
  private priceArbitrageService = inject(PriceArbitrageService);
  private translationService = inject(TranslationService);

  positions = signal<PriceArbitragePositionDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedStatus = signal<'ALL' | PriceArbitrageStatus>(PriceArbitrageStatus.ACTIVE);

  showCloseDialog = signal<boolean>(false);
  positionToClose = signal<PriceArbitragePositionDTO | null>(null);
  isClosing = signal<boolean>(false);

  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5000;

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

  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  changeStatusFilter(status: 'ALL' | PriceArbitrageStatus): void {
    this.selectedStatus.set(status);
    this.loadPositions();
  }

  openCloseDialog(position: PriceArbitragePositionDTO): void {
    this.positionToClose.set(position);
    this.showCloseDialog.set(true);
  }

  cancelClose(): void {
    this.showCloseDialog.set(false);
    this.positionToClose.set(null);
  }

  confirmClose(): void {
    const position = this.positionToClose();
    if (!position) return;

    this.isClosing.set(true);

    this.priceArbitrageService.closePosition(position.id)
      .subscribe({
        next: (result) => {
          console.log('Position closed successfully:', result);

          const updatedPositions = this.positions().map(p =>
            p.id === position.id ? result.position : p
          );
          this.positions.set(updatedPositions);

          this.showCloseDialog.set(false);
          this.positionToClose.set(null);
          this.isClosing.set(false);

          alert(`${this.translate('arbitrage.positions.close.success')} Total P&L: $${result.totalPnl.toFixed(2)}`);
        },
        error: (err) => {
          console.error('Error closing position:', err);
          this.isClosing.set(false);
          alert(`${this.translate('arbitrage.positions.close.error')}: ${err.message}`);
        }
      });
  }

  getUnrealizedPnl(position: PriceArbitragePositionDTO): number {
    return this.priceArbitrageService.calculateUnrealizedPnl(position);
  }

  getPnlDisplay(position: PriceArbitragePositionDTO) {
    const pnl = this.getUnrealizedPnl(position);
    return formatPnlDisplay(pnl);
  }

  getHoldingTimeDisplay(position: PriceArbitragePositionDTO): string {
    if (!position.openedAt) return this.translate('arbitrage.positions.na');
    return calculateHoldingTime(position.openedAt).formatted;
  }

  getCurrentSpreadDisplay(position: PriceArbitragePositionDTO): string {
    if (position.currentSpreadPercent !== undefined) {
      return `${position.currentSpreadPercent.toFixed(4)}%`;
    }
    return this.translate('arbitrage.positions.na');
  }

  getEntrySpreadDisplay(position: PriceArbitragePositionDTO): string {
    return `${position.entrySpreadPercent.toFixed(4)}%`;
  }

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

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatPnl(pnl: number | undefined): string {
    if (pnl === undefined || pnl === null) return this.translate('arbitrage.positions.na');
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  }

  getFilterEnumValue(status: string): PriceArbitrageStatus {
    return status as PriceArbitrageStatus;
  }
}