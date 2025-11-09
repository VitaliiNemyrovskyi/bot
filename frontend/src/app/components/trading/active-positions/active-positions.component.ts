import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../ui/icon/icon.component';
import { RelativeTimePipe } from '../../../pipes/relative-time.pipe';
import { TranslationService } from '../../../services/translation.service';

/**
 * Active Positions Component
 *
 * Displays active arbitrage positions with real-time P&L calculations
 */

export interface PositionSide {
  exchange: string;
  environment: string;
  side: 'LONG' | 'SHORT' | 'long' | 'short';
  leverage: number;
  quantity: number;
  filledQuantity?: number;
  entryPrice?: number;
  currentPrice?: number;
  tradingFees: number;
  lastFundingPaid: number;
  totalFundingEarned: number;
  liquidationPrice?: number;
  proximityRatio?: number;
  inDanger?: boolean;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedProfit?: number;
}

export interface ActivePosition {
  positionId: string;
  symbol: string;
  primary: PositionSide;
  hedge: PositionSide;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  grossProfit: number;
  netProfit: number;
  monitoring?: {
    enabled: boolean;
    status: string;
    lastCheck?: Date;
  };
  errorMessage?: string;
  fundingUpdateCount?: number;
  graduatedEntry: {
    parts: number;
    delayMs: number;
  };
}

@Component({
  selector: 'app-active-positions',
  standalone: true,
  imports: [CommonModule, IconComponent, RelativeTimePipe],
  templateUrl: './active-positions.component.html',
  styleUrls: ['./active-positions.component.scss']
})
export class ActivePositionsComponent implements OnChanges {
  @Input() positions: ActivePosition[] = [];
  @Input() set primaryPrice(value: number) {
    this.primaryPriceSignal.set(value);
  }
  @Input() set hedgePrice(value: number) {
    this.hedgePriceSignal.set(value);
  }

  @Output() syncTpSlClick = new EventEmitter<string>();
  @Output() toggleMonitoringClick = new EventEmitter<ActivePosition>();
  @Output() stopPositionClick = new EventEmitter<string>();

  private expandedRows = signal<Set<string>>(new Set());
  private primaryPriceSignal = signal<number>(0);
  private hedgePriceSignal = signal<number>(0);

  enhancedPositions = computed(() => {
    const primaryPrice = this.primaryPriceSignal();
    const hedgePrice = this.hedgePriceSignal();

    if (!this.positions || this.positions.length === 0) {
      return [];
    }

    try {
      const enhanced = this.positions.map((pos) => {
        try {
          return this.calculateRealTimePnL(pos, primaryPrice, hedgePrice);
        } catch (error) {
          console.error('[ActivePositions] Error calculating P&L:', error);
          return pos; // Return original position if calculation fails
        }
      });
      return enhanced;
    } catch (error) {
      console.error('[ActivePositions] Error in enhancedPositions computed:', error);
      return this.positions; // Return original positions if error
    }
  });

  constructor(private translationService: TranslationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['primaryPrice'] || changes['hedgePrice']) {
      this.enhancedPositions();
    }
  }

  private calculateRealTimePnL(position: ActivePosition, primaryPriceInput: number, hedgePriceInput: number): ActivePosition {
    const enhanced = { ...position };

    const primaryPrice = primaryPriceInput > 0 ? primaryPriceInput : (position.primary.currentPrice || position.primary.entryPrice || 0);
    const hedgePrice = hedgePriceInput > 0 ? hedgePriceInput : (position.hedge.currentPrice || position.hedge.entryPrice || 0);

    const primaryEntryPrice = position.primary.entryPrice || 0;
    const primaryQty = position.primary.filledQuantity || position.primary.quantity || 0;

    const hedgeEntryPrice = position.hedge.entryPrice || 0;
    const hedgeQty = position.hedge.filledQuantity || position.hedge.quantity || 0;

    // Calculate unrealized P&L WITHOUT leverage (leverage only affects margin, not absolute P&L)
    let primaryUnrealizedPnl = 0;
    if (primaryEntryPrice > 0 && primaryQty > 0) {
      const side = position.primary.side.toUpperCase();
      if (side === 'LONG') {
        // LONG: profit when price goes up
        primaryUnrealizedPnl = (primaryPrice - primaryEntryPrice) * primaryQty;
      } else {
        // SHORT: profit when price goes down
        primaryUnrealizedPnl = (primaryEntryPrice - primaryPrice) * primaryQty;
      }
    }

    let hedgeUnrealizedPnl = 0;
    if (hedgeEntryPrice > 0 && hedgeQty > 0) {
      const side = position.hedge.side.toUpperCase();
      if (side === 'LONG') {
        hedgeUnrealizedPnl = (hedgePrice - hedgeEntryPrice) * hedgeQty;
      } else {
        hedgeUnrealizedPnl = (hedgeEntryPrice - hedgePrice) * hedgeQty;
      }
    }

    enhanced.primary = { ...position.primary, unrealizedProfit: primaryUnrealizedPnl, currentPrice: primaryPrice };
    enhanced.hedge = { ...position.hedge, unrealizedProfit: hedgeUnrealizedPnl, currentPrice: hedgePrice };

    const totalFunding = (position.primary.totalFundingEarned || 0) + (position.hedge.totalFundingEarned || 0);
    const totalFees = (position.primary.tradingFees || 0) + (position.hedge.tradingFees || 0);

    // Entry spread profit: difference in entry prices between exchanges
    // For arbitrage: buy cheap (primary), sell expensive (hedge)
    // Entry profit = (hedge entry price - primary entry price) * quantity
    let entrySpreadProfit = 0;
    if (position.primary.side.toUpperCase() === 'LONG') {
      // Primary LONG (bought), Hedge SHORT (sold)
      entrySpreadProfit = (hedgeEntryPrice - primaryEntryPrice) * primaryQty;
    } else {
      // Primary SHORT (sold), Hedge LONG (bought)
      entrySpreadProfit = (primaryEntryPrice - hedgeEntryPrice) * primaryQty;
    }

    // Gross profit = entry spread + unrealized P&L from both positions + funding
    const grossProfit = entrySpreadProfit + primaryUnrealizedPnl + hedgeUnrealizedPnl + totalFunding;
    const netProfit = grossProfit - totalFees;

    enhanced.grossProfit = grossProfit;
    enhanced.netProfit = netProfit;

    return enhanced;
  }

  toggleRowExpansion(positionId: string): void {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(positionId)) {
      expanded.delete(positionId);
    } else {
      expanded.add(positionId);
    }
    this.expandedRows.set(expanded);
  }

  isRowExpanded(positionId: string): boolean {
    return this.expandedRows().has(positionId);
  }

  getStatusBadge(status: string): { label: string; class: string } {
    const upperStatus = status.toUpperCase();
    const map: Record<string, { label: string; class: string }> = {
      'ACTIVE': { label: 'Active', class: 'status-active' },
      'INITIALIZING': { label: 'Initializing', class: 'status-initializing' },
      'EXECUTING': { label: 'Executing', class: 'status-executing' },
      'COMPLETED': { label: 'Completed', class: 'status-completed' },
      'ERROR': { label: 'Error', class: 'status-error' },
      'LIQUIDATED': { label: 'Liquidated', class: 'status-liquidated' },
      'CANCELLED': { label: 'Cancelled', class: 'status-cancelled' },
    };
    return map[upperStatus] || { label: status, class: 'status-unknown' };
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '0.0000';
    return value.toFixed(4);
  }

  hasFundingData(position: ActivePosition): boolean {
    return (position.fundingUpdateCount || 0) > 0;
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }
}
