import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriangularOpportunity, ScannerStatus } from '../../../../models/triangular-arbitrage.model';
import { TranslationService } from '../../../../services/translation.service';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent
} from '../../../../components/ui/dialog/dialog.component';
import { TriangleVisualizerComponent } from '../triangle-visualizer/triangle-visualizer.component';

/**
 * Opportunity List Component
 *
 * Displays real-time triangular arbitrage opportunities in a sortable table.
 * Features:
 * - Auto-refresh display
 * - Sort by profit, slippage, or time
 * - Execute opportunities
 * - Visual indicators for profitability
 */
@Component({
  selector: 'app-opportunity-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    TriangleVisualizerComponent
  ],
  templateUrl: './opportunity-list.component.html',
  styleUrls: ['./opportunity-list.component.scss']
})
export class OpportunityListComponent {
  @Input() set opportunities(value: TriangularOpportunity[]) {
    console.log('[OpportunityList] Received opportunities:', value.length);
    this._opportunities = value;

    // Log deduplication stats
    const deduplicated = this.deduplicateOpportunities(value);
    console.log('[OpportunityList] After deduplication:', {
      original: value.length,
      deduplicated: deduplicated.length,
      removed: value.length - deduplicated.length
    });
  }
  get opportunities(): TriangularOpportunity[] {
    return this._opportunities;
  }
  private _opportunities: TriangularOpportunity[] = [];

  @Input() set isLoading(value: boolean) {
    console.log('[OpportunityList] isLoading changed to:', value);
    this._isLoading = value;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  private _isLoading: boolean = false;

  @Input() set scannerStatus(value: ScannerStatus) {
    console.log('[OpportunityList] scannerStatus changed to:', value);
    this._scannerStatus = value;
  }
  get scannerStatus(): ScannerStatus {
    return this._scannerStatus;
  }
  private _scannerStatus: ScannerStatus = 'stopped';

  @Output() executeOpportunity = new EventEmitter<TriangularOpportunity>();

  // Sort configuration
  readonly sortColumn = signal<'profitPercentage' | 'profitAmount' | 'realisticProfitPercentage' | 'detectedAt'>('profitPercentage');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Filter configuration
  readonly showProblematicTokens = signal<boolean>(true);

  // Problematic tokens with high minimum order sizes
  // These tokens often cause "order size too small" errors with small positions (50-100 USDT)
  private readonly PROBLEMATIC_TOKENS = [
    'FLOKI',  // min: 1.0+
    'SAGA',   // min: 1.0+
    'WLFI',   // min: 0.01
    'BTRST',  // min: 0.001
    'OMG',    // min: 0.001
    'SHIB',   // min: varies, often high
    'PEPE',   // min: varies, often high
    'BONK',   // min: varies, often high
  ];

  // Selected opportunity for detail modal
  readonly selectedOpportunity = signal<TriangularOpportunity | null>(null);
  readonly showDetailModal = signal<boolean>(false);

  // Current time for relative timestamps
  private currentTime = signal<number>(Date.now());
  private timeUpdateInterval?: any;

  constructor(private translationService: TranslationService) {
    // Update current time every second for relative timestamps
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  /**
   * Check if opportunity contains problematic tokens
   */
  hasProblematicToken(opp: TriangularOpportunity): boolean {
    const { assetA, assetB, assetC } = opp.triangle;
    const assets = [assetA, assetB, assetC];
    return assets.some(asset => this.PROBLEMATIC_TOKENS.includes(asset));
  }

  /**
   * Toggle problematic tokens filter
   */
  toggleProblematicFilter(): void {
    this.showProblematicTokens.set(!this.showProblematicTokens());
  }

  /**
   * Get unique triangle key for deduplication
   */
  private getTriangleKey(opp: TriangularOpportunity): string {
    const { assetA, assetB, assetC, direction } = opp.triangle;
    return `${opp.exchange}:${assetA}-${assetB}-${assetC}:${direction}`;
  }

  /**
   * Deduplicate opportunities - keep only latest version of each triangle
   */
  private deduplicateOpportunities(opportunities: TriangularOpportunity[]): TriangularOpportunity[] {
    const latestByTriangle = new Map<string, TriangularOpportunity>();

    for (const opp of opportunities) {
      const key = this.getTriangleKey(opp);
      const existing = latestByTriangle.get(key);

      // Keep the one with latest detection time
      if (!existing || opp.detectedAt > existing.detectedAt) {
        latestByTriangle.set(key, opp);
      }
    }

    return Array.from(latestByTriangle.values());
  }

  /**
   * Get filtered opportunities (by problematic tokens and profit)
   */
  get filteredOpportunities(): TriangularOpportunity[] {
    // First deduplicate
    const deduplicated = this.deduplicateOpportunities(this.opportunities);

    // Filter out opportunities with negative profit
    const positiveProfit = deduplicated.filter(opp => {
      const profit = opp.realisticProfitPercentage ?? opp.profitPercentage;
      return profit > 0;
    });

    // Then filter by problematic tokens if needed
    if (this.showProblematicTokens()) {
      return positiveProfit;
    }
    return positiveProfit.filter(opp => !this.hasProblematicToken(opp));
  }

  /**
   * Sorted opportunities (after filtering)
   */
  get sortedOpportunities(): TriangularOpportunity[] {
    const sorted = [...this.filteredOpportunities];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'profitPercentage':
          comparison = b.profitPercentage - a.profitPercentage;
          break;
        case 'profitAmount':
          comparison = b.profitAmount - a.profitAmount;
          break;
        case 'realisticProfitPercentage':
          const aRealistic = a.realisticProfitPercentage ?? -Infinity;
          const bRealistic = b.realisticProfitPercentage ?? -Infinity;
          comparison = bRealistic - aRealistic;
          break;
        case 'detectedAt':
          comparison = b.detectedAt - a.detectedAt;
          break;
      }

      return direction === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Toggle sort column
   */
  toggleSort(column: 'profitPercentage' | 'profitAmount' | 'realisticProfitPercentage' | 'detectedAt'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  /**
   * Get sort icon for column
   */
  getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  /**
   * Format triangle path
   */
  formatTriangle(opp: TriangularOpportunity): string {
    const { assetA, assetB, assetC } = opp.triangle;
    return `${assetA} → ${assetB} → ${assetC}`;
  }

  /**
   * Get direction icon
   */
  getDirectionIcon(opp: TriangularOpportunity): string {
    return opp.triangle.direction === 'forward' ? '→' : '←';
  }

  /**
   * Get profit color class
   */
  getProfitColorClass(profit: number): string {
    if (profit >= 0.5) return 'profit-excellent';
    if (profit >= 0.2) return 'profit-good';
    if (profit >= 0.1) return 'profit-moderate';
    return 'profit-low';
  }

  /**
   * Calculate execution cost (theoretical - realistic profit)
   */
  getExecutionCost(opp: TriangularOpportunity): number {
    if (opp.realisticProfitPercentage === undefined) {
      return 0;
    }
    return opp.profitPercentage - opp.realisticProfitPercentage;
  }

  /**
   * Get relative time string
   */
  getRelativeTime(timestamp: number): string {
    const now = this.currentTime();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  /**
   * Check if opportunity is fresh (< 10 seconds)
   */
  isFresh(opp: TriangularOpportunity): boolean {
    const now = this.currentTime();
    const diff = now - opp.detectedAt;
    return diff < 10000; // 10 seconds
  }

  /**
   * Open opportunity detail modal
   */
  openDetail(opp: TriangularOpportunity): void {
    this.selectedOpportunity.set(opp);
    this.showDetailModal.set(true);
  }

  /**
   * Close detail modal
   */
  closeDetail(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) {
        this.selectedOpportunity.set(null);
      }
    }, 300);
  }

  /**
   * Execute opportunity
   */
  onExecute(opp: TriangularOpportunity): void {
    console.log('[OpportunityList] Execute button clicked:', {
      id: opp.id,
      exchange: opp.exchange,
      isExecutable: opp.isExecutable,
      profitPercentage: opp.profitPercentage,
      triangle: opp.triangle
    });
    this.executeOpportunity.emit(opp);
  }

  /**
   * Execute from modal
   */
  executeFromModal(): void {
    const opp = this.selectedOpportunity();
    if (opp) {
      this.onExecute(opp);
      this.closeDetail();
    }
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
