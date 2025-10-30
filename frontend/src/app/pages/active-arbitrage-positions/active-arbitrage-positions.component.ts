import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PriceArbitrageService } from '../../services/price-arbitrage.service';
import { GraduatedEntryService, GraduatedEntryPosition } from '../../services/graduated-entry.service';
import { RealtimeService, PriceUpdate } from '../../services/realtime.service';
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

// Unified position interface combining both Price Arbitrage and Graduated Entry
interface UnifiedArbitragePosition {
  id: string;
  type: 'price' | 'graduated';
  symbol: string;
  primaryExchange: string;
  hedgeExchange: string;
  primaryLeverage: number;
  hedgeLeverage: number;
  primaryMargin: number;
  hedgeMargin: number;
  primarySide: string;
  hedgeSide: string;
  status: string;
  entryPrimaryPrice: number;
  entryHedgePrice: number;
  currentPrimaryPrice?: number;
  currentHedgePrice?: number;
  entrySpreadPercent: number;
  currentSpreadPercent?: number;
  grossProfit: number;
  netProfit: number;
  totalFundingEarned: number;
  totalFees: number;
  unrealizedPnl: number;
  openedAt?: Date;
  // Original position data
  original: PriceArbitragePositionDTO | GraduatedEntryPosition;
}

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
  private graduatedEntryService = inject(GraduatedEntryService);
  private realtimeService = inject(RealtimeService);
  private translationService = inject(TranslationService);

  positions = signal<UnifiedArbitragePosition[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedStatus = signal<'ALL' | PriceArbitrageStatus>(PriceArbitrageStatus.ACTIVE);

  showCloseDialog = signal<boolean>(false);
  positionToClose = signal<UnifiedArbitragePosition | null>(null);
  isClosing = signal<boolean>(false);

  // Real-time price cache: Map<exchange:symbol, price>
  private priceCache = signal<Map<string, number>>(new Map());

  // Positions with real-time calculated profits
  positionsWithRealtimeProfit = computed(() => {
    const positions = this.positions();
    const prices = this.priceCache();

    return positions.map(pos => {
      // Get real-time prices from cache
      const primaryKey = `${pos.primaryExchange}:${pos.symbol}`;
      const hedgeKey = `${pos.hedgeExchange}:${pos.symbol}`;

      const primaryPrice = prices.get(primaryKey);
      const hedgePrice = prices.get(hedgeKey);

      // If we have real-time prices, recalculate profits
      if (primaryPrice && hedgePrice) {
        const realtimeProfit = this.calculateRealtimeProfit(pos, primaryPrice, hedgePrice);
        return {
          ...pos,
          currentPrimaryPrice: primaryPrice,
          currentHedgePrice: hedgePrice,
          grossProfit: realtimeProfit.grossProfit,
          netProfit: realtimeProfit.netProfit,
          unrealizedPnl: realtimeProfit.totalUnrealizedPnl
        };
      }

      // Return original position if no real-time prices
      return pos;
    });
  });

  private refreshSubscription?: Subscription;
  private priceSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5000;

  // Effect to resubscribe to symbols when positions change
  constructor() {
    effect(() => {
      const positions = this.positions();
      if (positions.length > 0) {
        // Resubscribe to all position symbols whenever positions change
        const symbols = new Set(positions.map(p => p.symbol));
        symbols.forEach(symbol => {
          if (!this.realtimeService.isConnected(symbol)) {
            this.realtimeService.subscribeToSymbol(symbol);
          }
        });
      }
    });
  }

  filteredPositions = computed(() => {
    const status = this.selectedStatus();
    const allPositions = this.positionsWithRealtimeProfit(); // Use real-time calculated positions

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
    this.subscribeToRealtimePrices();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    this.unsubscribeFromRealtimePrices();
  }

  loadPositions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const status = this.selectedStatus() === 'ALL' ? undefined : this.selectedStatus();

    // Load both Price Arbitrage and Graduated Entry positions in parallel
    forkJoin({
      priceArbitrage: this.priceArbitrageService.getPositions(status as PriceArbitrageStatus | undefined),
      graduatedEntry: this.graduatedEntryService.getPositions(false) // Only active positions
    }).subscribe({
      next: ({ priceArbitrage, graduatedEntry }) => {
        // Convert both types to unified format
        const unifiedPositions: UnifiedArbitragePosition[] = [
          ...this.convertPriceArbitragePositions(priceArbitrage),
          ...this.convertGraduatedEntryPositions(graduatedEntry)
        ];

        this.positions.set(unifiedPositions);
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
   * Convert Price Arbitrage positions to unified format
   */
  private convertPriceArbitragePositions(positions: PriceArbitragePositionDTO[]): UnifiedArbitragePosition[] {
    return positions.map(pos => ({
      id: pos.id,
      type: 'price' as const,
      symbol: pos.symbol,
      primaryExchange: pos.primaryExchange,
      hedgeExchange: pos.hedgeExchange,
      primaryLeverage: pos.primaryLeverage,
      hedgeLeverage: pos.hedgeLeverage,
      primaryMargin: pos.primaryMargin,
      hedgeMargin: pos.hedgeMargin,
      primarySide: 'SHORT', // Price arbitrage is always SHORT primary
      hedgeSide: 'LONG', // and LONG hedge
      status: pos.status,
      entryPrimaryPrice: pos.entryPrimaryPrice,
      entryHedgePrice: pos.entryHedgePrice,
      currentPrimaryPrice: pos.currentPrimaryPrice,
      currentHedgePrice: pos.currentHedgePrice,
      entrySpreadPercent: pos.entrySpreadPercent,
      currentSpreadPercent: pos.currentSpreadPercent,
      grossProfit: pos.totalPnl || 0,
      netProfit: pos.totalPnl || 0,
      totalFundingEarned: 0, // Price arbitrage doesn't track funding separately
      totalFees: pos.primaryFees + pos.hedgeFees,
      unrealizedPnl: this.priceArbitrageService.calculateUnrealizedPnl(pos),
      openedAt: pos.openedAt ? (typeof pos.openedAt === 'string' ? new Date(pos.openedAt) : pos.openedAt) : undefined,
      original: pos
    }));
  }

  /**
   * Convert Graduated Entry positions to unified format
   */
  private convertGraduatedEntryPositions(positions: GraduatedEntryPosition[]): UnifiedArbitragePosition[] {
    return positions.map(pos => {
      // Calculate entry spread percent
      const primaryEntryPrice = pos.primary.entryPrice || 0;
      const hedgeEntryPrice = pos.hedge.entryPrice || 0;
      const entrySpreadPercent = primaryEntryPrice > 0
        ? ((hedgeEntryPrice - primaryEntryPrice) / primaryEntryPrice) * 100
        : 0;

      // Calculate current spread percent
      const primaryCurrentPrice = pos.primary.currentPrice || primaryEntryPrice;
      const hedgeCurrentPrice = pos.hedge.currentPrice || hedgeEntryPrice;
      const currentSpreadPercent = primaryCurrentPrice > 0
        ? ((hedgeCurrentPrice - primaryCurrentPrice) / primaryCurrentPrice) * 100
        : 0;

      // Backend already handles funding check (returns 0 if fundingUpdateCount === 0)
      const totalFundingEarned = pos.primary.totalFundingEarned + pos.hedge.totalFundingEarned;

      return {
        id: pos.positionId,
        type: 'graduated' as const,
        symbol: pos.symbol,
        primaryExchange: pos.primary.exchange,
        hedgeExchange: pos.hedge.exchange,
        primaryLeverage: pos.primary.leverage,
        hedgeLeverage: pos.hedge.leverage,
        primaryMargin: (pos.primary.entryPrice || 0) * (pos.primary.filledQuantity || 0) / pos.primary.leverage,
        hedgeMargin: (pos.hedge.entryPrice || 0) * (pos.hedge.filledQuantity || 0) / pos.hedge.leverage,
        primarySide: pos.primary.side,
        hedgeSide: pos.hedge.side,
        status: pos.status.toUpperCase(),
        entryPrimaryPrice: primaryEntryPrice,
        entryHedgePrice: hedgeEntryPrice,
        currentPrimaryPrice: primaryCurrentPrice,
        currentHedgePrice: hedgeCurrentPrice,
        entrySpreadPercent,
        currentSpreadPercent,
        // Backend already calculated with actual funding only
        grossProfit: pos.grossProfit,
        netProfit: pos.netProfit,
        totalFundingEarned,
        totalFees: pos.primary.tradingFees + pos.hedge.tradingFees,
        unrealizedPnl: pos.totalUnrealizedPnl,
        openedAt: pos.startedAt,
        original: pos
      };
    });
  }

  private startAutoRefresh(): void {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(
        switchMap(() => {
          const status = this.selectedStatus() === 'ALL' ? undefined : this.selectedStatus();
          return forkJoin({
            priceArbitrage: this.priceArbitrageService.getPositions(status as PriceArbitrageStatus | undefined),
            graduatedEntry: this.graduatedEntryService.getPositions(false)
          });
        })
      )
      .subscribe({
        next: ({ priceArbitrage, graduatedEntry }) => {
          const unifiedPositions: UnifiedArbitragePosition[] = [
            ...this.convertPriceArbitragePositions(priceArbitrage),
            ...this.convertGraduatedEntryPositions(graduatedEntry)
          ];
          this.positions.set(unifiedPositions);
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

  openCloseDialog(position: UnifiedArbitragePosition): void {
    // Only allow closing Price Arbitrage positions for now
    // Graduated Entry positions have their own closing mechanism
    if (position.type !== 'price') {
      alert('Graduated Entry positions cannot be closed from this page.');
      return;
    }
    this.positionToClose.set(position);
    this.showCloseDialog.set(true);
  }

  cancelClose(): void {
    this.showCloseDialog.set(false);
    this.positionToClose.set(null);
  }

  confirmClose(): void {
    const position = this.positionToClose();
    if (!position || position.type !== 'price') return;

    this.isClosing.set(true);

    this.priceArbitrageService.closePosition(position.id)
      .subscribe({
        next: (result) => {
          console.log('Position closed successfully:', result);

          // Reload all positions after closing
          this.loadPositions();

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

  getUnrealizedPnl(position: UnifiedArbitragePosition): number {
    return position.unrealizedPnl;
  }

  getPnlDisplay(position: UnifiedArbitragePosition) {
    const pnl = this.getUnrealizedPnl(position);
    return formatPnlDisplay(pnl);
  }

  getHoldingTimeDisplay(position: UnifiedArbitragePosition): string {
    if (!position.openedAt) return this.translate('arbitrage.positions.na');
    return calculateHoldingTime(position.openedAt).formatted;
  }

  getCurrentSpreadDisplay(position: UnifiedArbitragePosition): string {
    if (position.currentSpreadPercent !== undefined) {
      return `${position.currentSpreadPercent.toFixed(4)}%`;
    }
    return this.translate('arbitrage.positions.na');
  }

  getEntrySpreadDisplay(position: UnifiedArbitragePosition): string {
    return `${position.entrySpreadPercent.toFixed(4)}%`;
  }

  getStatusClass(status: string): string {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'ERROR':
        return 'status-error';
      case 'PENDING':
      case 'INITIALIZING':
      case 'EXECUTING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'LIQUIDATED':
        return 'status-liquidated';
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

  formatEntryTime(date: Date | undefined): string {
    if (!date) return this.translate('arbitrage.positions.na');

    const entryDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - entryDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // If less than 60 minutes, show "X min ago"
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    // Otherwise show time in HH:MM format
    const hours = entryDate.getHours().toString().padStart(2, '0');
    const minutes = entryDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getFilterEnumValue(status: string): PriceArbitrageStatus {
    return status as PriceArbitrageStatus;
  }

  /**
   * Subscribe to real-time price updates for all position symbols
   */
  private subscribeToRealtimePrices(): void {
    this.priceSubscription = this.realtimeService.price$.subscribe((update: PriceUpdate) => {
      // Update price cache with exchange:symbol key
      const key = `${update.symbol}`;
      const currentCache = this.priceCache();
      const newCache = new Map(currentCache);

      // We need to map this to exchange-specific prices
      // For now, update all exchanges with the same symbol
      this.positions().forEach(pos => {
        if (pos.symbol === update.symbol) {
          newCache.set(`${pos.primaryExchange}:${pos.symbol}`, update.price);
          newCache.set(`${pos.hedgeExchange}:${pos.symbol}`, update.price);
        }
      });

      this.priceCache.set(newCache);
    });

    // Subscribe to symbols from positions
    const symbols = new Set(this.positions().map(p => p.symbol));
    symbols.forEach(symbol => {
      this.realtimeService.subscribeToSymbol(symbol);
    });
  }

  /**
   * Unsubscribe from real-time price updates
   */
  private unsubscribeFromRealtimePrices(): void {
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
    }
    this.realtimeService.closeAllConnections();
  }

  /**
   * Calculate real-time profit for a position using WebSocket prices
   */
  private calculateRealtimeProfit(
    position: UnifiedArbitragePosition,
    primaryPrice: number,
    hedgePrice: number
  ): {
    primaryUnrealizedPnl: number;
    hedgeUnrealizedPnl: number;
    totalUnrealizedPnl: number;
    grossProfit: number;
    netProfit: number;
  } {
    const primaryEntryPrice = position.entryPrimaryPrice || 0;
    const primaryQuantity = position.primaryMargin * position.primaryLeverage / primaryEntryPrice;

    const hedgeEntryPrice = position.entryHedgePrice || 0;
    const hedgeQuantity = position.hedgeMargin * position.hedgeLeverage / hedgeEntryPrice;

    // Calculate unrealized PnL for each side
    const primaryUnrealizedPnl = position.primarySide === 'LONG'
      ? (primaryPrice - primaryEntryPrice) * primaryQuantity
      : (primaryEntryPrice - primaryPrice) * primaryQuantity;

    const hedgeUnrealizedPnl = position.hedgeSide === 'LONG'
      ? (hedgePrice - hedgeEntryPrice) * hedgeQuantity
      : (hedgeEntryPrice - hedgePrice) * hedgeQuantity;

    const totalUnrealizedPnl = primaryUnrealizedPnl + hedgeUnrealizedPnl;

    // Calculate entry spread profit
    const primaryNotional = primaryEntryPrice * primaryQuantity;
    const hedgeNotional = hedgeEntryPrice * hedgeQuantity;
    const entrySpreadProfit = position.primarySide === 'LONG'
      ? hedgeNotional - primaryNotional
      : primaryNotional - hedgeNotional;

    // Total funding earned
    const totalFunding = position.totalFundingEarned;

    // Real-time Gross Profit = Entry Spread + Funding + Unrealized PnL
    const grossProfit = entrySpreadProfit + totalFunding + totalUnrealizedPnl;

    // Real-time Net Profit = Gross Profit - Fees
    const netProfit = grossProfit - position.totalFees;

    return {
      primaryUnrealizedPnl,
      hedgeUnrealizedPnl,
      totalUnrealizedPnl,
      grossProfit,
      netProfit
    };
  }
}