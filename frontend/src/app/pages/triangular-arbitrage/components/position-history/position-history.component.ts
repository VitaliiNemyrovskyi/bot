import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TriangularPosition, PositionFilter, PositionStatus } from '../../../../models/triangular-arbitrage.model';
import { TranslationService } from '../../../../services/translation.service';
import { TriangularArbitrageService } from '../../services/triangular-arbitrage.service';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent
} from '../../../../components/ui/dialog/dialog.component';
import { ExecutionProgressComponent } from '../execution-progress/execution-progress.component';

/**
 * Position History Component
 *
 * Displays a filterable table of triangular arbitrage positions with export functionality.
 */
@Component({
  selector: 'app-position-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ExecutionProgressComponent
  ],
  templateUrl: './position-history.component.html',
  styleUrls: ['./position-history.component.scss']
})
export class PositionHistoryComponent {
  @Input() positions: TriangularPosition[] = [];
  @Input() isLoading = false;

  @Output() filterChange = new EventEmitter<PositionFilter>();
  @Output() cancelPosition = new EventEmitter<string>();
  @Output() deletePosition = new EventEmitter<string>();

  // Filter state
  readonly statusFilter = signal<PositionStatus[]>([]);
  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);
  readonly showFilters = signal<boolean>(false);

  // Selected position for detail modal
  readonly selectedPosition = signal<TriangularPosition | null>(null);
  readonly showDetailModal = signal<boolean>(false);

  readonly availableStatuses: PositionStatus[] = ['pending', 'executing', 'completed', 'failed', 'cancelled'];

  constructor(
    private translationService: TranslationService,
    private arbitrageService: TriangularArbitrageService
  ) {}

  /**
   * Toggle status filter
   */
  toggleStatusFilter(status: PositionStatus): void {
    const current = this.statusFilter();
    const index = current.indexOf(status);

    if (index >= 0) {
      this.statusFilter.set(current.filter(s => s !== status));
    } else {
      this.statusFilter.set([...current, status]);
    }

    this.emitFilterChange();
  }

  /**
   * Check if status is filtered
   */
  isStatusFiltered(status: PositionStatus): boolean {
    return this.statusFilter().includes(status);
  }

  /**
   * Apply date filter
   */
  applyDateFilter(): void {
    this.emitFilterChange();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.statusFilter.set([]);
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.emitFilterChange();
  }

  /**
   * Emit filter change event
   */
  private emitFilterChange(): void {
    const filter: PositionFilter = {
      status: this.statusFilter().length > 0 ? this.statusFilter() : undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined
    };
    this.filterChange.emit(filter);
  }

  /**
   * Format triangle path
   */
  formatTriangle(position: TriangularPosition): string {
    const { assetA, assetB, assetC } = position.triangle;
    return `${assetA} → ${assetB} → ${assetC}`;
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: PositionStatus): string {
    return `status-badge status-${status}`;
  }

  /**
   * Get profit color class
   */
  getProfitClass(profit?: number): string {
    if (profit === undefined) return '';
    return profit > 0 ? 'profit-positive' : profit < 0 ? 'profit-negative' : '';
  }

  /**
   * Format date
   */
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Format execution time
   */
  formatExecutionTime(ms?: number): string {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Open position detail modal
   */
  openDetail(position: TriangularPosition): void {
    this.selectedPosition.set(position);
    this.showDetailModal.set(true);
  }

  /**
   * Close detail modal
   */
  closeDetail(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) {
        this.selectedPosition.set(null);
      }
    }, 300);
  }

  /**
   * Cancel position
   */
  onCancel(position: TriangularPosition): void {
    if (confirm(this.translate('triangularArbitrage.positions.confirmCancel'))) {
      this.cancelPosition.emit(position.id);
    }
  }

  /**
   * Delete position
   */
  onDelete(position: TriangularPosition): void {
    const confirmMessage = this.translate('triangularArbitrage.positions.confirmDelete')
      .replace('{id}', position.id.substring(0, 8))
      .replace('{triangle}', this.formatTriangle(position));

    if (confirm(confirmMessage)) {
      this.deletePosition.emit(position.id);
    }
  }

  /**
   * Export to CSV
   */
  exportToCSV(): void {
    const csv = this.arbitrageService.exportPositionsToCSV(this.positions);
    this.arbitrageService.downloadCSV(csv);
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
