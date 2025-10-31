import { Component, OnInit, OnDestroy, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriangularArbitrageService } from './services/triangular-arbitrage.service';
import { TranslationService } from '../../services/translation.service';
import {
  TriangularOpportunity,
  TriangularPosition,
  ScannerConfig,
  PositionFilter,
  Exchange,
  ScannerStatus,
  ScannerStats
} from '../../models/triangular-arbitrage.model';
import { Subscription } from 'rxjs';

// Child components
import { OpportunityScannerComponent } from './components/opportunity-scanner/opportunity-scanner.component';
import { OpportunityListComponent } from './components/opportunity-list/opportunity-list.component';
import { PositionHistoryComponent } from './components/position-history/position-history.component';

// UI components
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardContentComponent
} from '../../components/ui/card/card.component';

/**
 * Triangular Arbitrage Main Page
 *
 * Container component that orchestrates all triangular arbitrage functionality:
 * - Opportunity scanning controls
 * - Real-time opportunity display
 * - Position tracking and history
 */
@Component({
  selector: 'app-triangular-arbitrage',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    OpportunityScannerComponent,
    OpportunityListComponent,
    PositionHistoryComponent
  ],
  templateUrl: './triangular-arbitrage.component.html',
  styleUrls: ['./triangular-arbitrage.component.scss']
})
export class TriangularArbitrageComponent implements OnInit, OnDestroy {
  // Child component reference
  @ViewChild(OpportunityScannerComponent) scannerComponent?: OpportunityScannerComponent;

  // State
  readonly opportunities = signal<TriangularOpportunity[]>([]);
  readonly positions = signal<TriangularPosition[]>([]);
  readonly isLoadingOpportunities = signal<boolean>(false);
  readonly isLoadingPositions = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Service state
  readonly scannerStatus = this.arbitrageService.scannerStatus;
  readonly scannerStats = this.arbitrageService.scannerStats;
  readonly isConnected = this.arbitrageService.isConnected;
  readonly connectionError = this.arbitrageService.connectionError;

  // Active tab
  readonly activeTab = signal<'opportunities' | 'positions'>('opportunities');

  // Filters
  readonly positionFilter = signal<PositionFilter>({});

  // Scanner configuration per exchange (to track position size)
  private scannerConfigs = new Map<Exchange, ScannerConfig>();

  // Computed values
  readonly activePositions = computed(() =>
    this.positions().filter(p => p.status === 'executing' || p.status === 'pending')
  );

  readonly completedPositions = computed(() =>
    this.positions().filter(p => p.status === 'completed')
  );

  readonly hasActivePositions = computed(() => this.activePositions().length > 0);

  private subscriptions = new Subscription();

  constructor(
    private arbitrageService: TriangularArbitrageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load initial data
   */
  private loadInitialData(): void {
    // Load scanner status
    this.arbitrageService.getScannerStatus().subscribe({
      next: (response: any) => {
        // Response has: { isScanning, scanners: [...], stats }
        const activeExchanges = new Set<string>();

        if (response.isScanning && response.scanners && Array.isArray(response.scanners)) {
          // Restore only actively running scanners from backend
          for (const scannerData of response.scanners) {
            const exchange = scannerData.exchange as Exchange;
            const config = scannerData.config as ScannerConfig;
            const backendStats = scannerData.stats;

            activeExchanges.add(exchange);

            // Store config in memory
            if (config) {
              this.scannerConfigs.set(exchange, config);
              // Also persist to localStorage for future use
              localStorage.setItem(`scanner_config_${exchange}`, JSON.stringify(config));
            }

            // Transform backend stats to frontend ScannerStats format
            const stats: ScannerStats | null = backendStats ? {
              status: 'scanning',
              opportunitiesDetectedToday: backendStats.opportunitiesDetectedToday || 0,
              opportunitiesExecutedToday: 0, // Not yet tracked by backend
              totalProfitToday: backendStats.totalProfitToday || 0,
              avgProfitPercentage: 0, // Not yet tracked by backend
              scanningDuration: ((backendStats as any).runningFor || 0) * 1000, // Convert seconds to ms
              lastOpportunityAt: undefined // Not yet tracked by backend
            } : null;

            // Update scanner component with current state
            this.scannerComponent?.updateScannerState(
              exchange,
              'scanning',
              stats,
              config || null
            );
          }
        }

        // Clean up localStorage for inactive scanners
        const allExchanges: Exchange[] = ['BYBIT', 'BINANCE', 'BINGX', 'MEXC', 'GATEIO', 'BITGET', 'OKX'];
        for (const exchange of allExchanges) {
          if (!activeExchanges.has(exchange)) {
            // Remove inactive scanner from localStorage
            localStorage.removeItem(`scanner_config_${exchange}`);
            // Ensure scanner component doesn't show it
            this.scannerComponent?.updateScannerState(exchange, 'stopped');
          }
        }
      },
      error: (err) => console.error('Failed to load scanner status:', err)
    });

    // Load opportunities if scanner is active
    if (this.scannerStatus() === 'scanning') {
      this.loadOpportunities();
    }

    // Load recent positions
    this.loadPositions();
  }

  /**
   * Subscribe to real-time WebSocket updates
   */
  private subscribeToRealtimeUpdates(): void {
    // Opportunity updates
    this.subscriptions.add(
      this.arbitrageService.opportunities$.subscribe({
        next: (opportunity) => {
          console.log('[Component] Received opportunity from observable:', opportunity);
          const current = this.opportunities();
          console.log('[Component] Current opportunities count:', current.length);
          const index = current.findIndex(o => o.id === opportunity.id);

          if (index >= 0) {
            // Update existing
            console.log('[Component] Updating existing opportunity at index:', index);
            const updated = [...current];
            updated[index] = opportunity;
            this.opportunities.set(updated);
          } else {
            // Add new
            console.log('[Component] Adding new opportunity, total will be:', current.length + 1);
            this.opportunities.set([opportunity, ...current]);
          }
        },
        error: (err) => console.error('Opportunity stream error:', err)
      })
    );

    // Position updates
    this.subscriptions.add(
      this.arbitrageService.positions$.subscribe({
        next: (position) => {
          const current = this.positions();
          const index = current.findIndex(p => p.id === position.id);

          if (index >= 0) {
            // Update existing
            const updated = [...current];
            updated[index] = position;
            this.positions.set(updated);
          } else {
            // Add new
            this.positions.set([position, ...current]);
          }
        },
        error: (err) => console.error('Position stream error:', err)
      })
    );

    // Scanner stats updates
    this.subscriptions.add(
      this.arbitrageService.stats$.subscribe({
        next: (stats) => {
          // Stats are automatically updated in the service
        },
        error: (err) => console.error('Stats stream error:', err)
      })
    );

    // Scanner updates (for multi-exchange support)
    this.subscriptions.add(
      this.arbitrageService.scannerUpdates$.subscribe({
        next: (update) => {
          // Get config from memory or localStorage
          let config = this.scannerConfigs.get(update.exchange as Exchange);
          if (!config) {
            const stored = localStorage.getItem(`scanner_config_${update.exchange}`);
            if (stored) {
              config = JSON.parse(stored) as ScannerConfig;
              this.scannerConfigs.set(update.exchange as Exchange, config);
            }
          }

          // Transform backend stats to frontend ScannerStats format
          const backendStats: any = update.stats; // Backend uses different format
          const stats: ScannerStats | null = backendStats ? {
            status: update.status,
            opportunitiesDetectedToday: backendStats.opportunitiesDetectedToday || 0,
            opportunitiesExecutedToday: 0, // Not yet tracked by backend
            totalProfitToday: backendStats.totalProfitToday || 0,
            avgProfitPercentage: 0, // Not yet tracked by backend
            scanningDuration: (backendStats.runningFor || 0) * 1000, // Convert seconds to ms
            lastOpportunityAt: undefined // Not yet tracked by backend
          } : null;

          // Update scanner component with exchange-specific status
          this.scannerComponent?.updateScannerState(
            update.exchange as Exchange,
            update.status,
            stats,
            config || null
          );
        },
        error: (err) => console.error('Scanner update stream error:', err)
      })
    );
  }

  /**
   * Load opportunities from API
   */
  loadOpportunities(): void {
    this.isLoadingOpportunities.set(true);
    this.error.set(null);

    this.arbitrageService.getOpportunities().subscribe({
      next: (opportunities) => {
        this.opportunities.set(opportunities);
        this.isLoadingOpportunities.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load opportunities: ' + err.message);
        this.isLoadingOpportunities.set(false);
      }
    });
  }

  /**
   * Load positions from API
   */
  loadPositions(filter?: PositionFilter): void {
    this.isLoadingPositions.set(true);
    this.error.set(null);

    this.arbitrageService.getPositions(filter).subscribe({
      next: (positions) => {
        this.positions.set(positions);
        this.isLoadingPositions.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load positions: ' + err.message);
        this.isLoadingPositions.set(false);
      }
    });
  }

  /**
   * Handle scanner start
   */
  onScannerStart(config: ScannerConfig): void {
    // Store scanner config for later use (e.g., when executing opportunities)
    this.scannerConfigs.set(config.exchange, config);

    // Persist to localStorage to survive page reloads
    localStorage.setItem(`scanner_config_${config.exchange}`, JSON.stringify(config));

    this.arbitrageService.startScanning(config).subscribe({
      next: (response) => {
        if (response.success) {
          // Update scanner component with initial state
          this.scannerComponent?.updateScannerState(
            config.exchange,
            'scanning',
            null,
            config
          );
          this.loadOpportunities();
        }
      },
      error: (err) => {
        this.error.set('Failed to start scanner: ' + err.message);
        // Update scanner component with error state
        this.scannerComponent?.updateScannerState(
          config.exchange,
          'error',
          null,
          config
        );
      }
    });
  }

  /**
   * Handle scanner stop
   * @param exchange - Specific exchange to stop, or null to stop all
   */
  onScannerStop(exchange: Exchange | null): void {
    this.arbitrageService.stopScanning(exchange || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          // Update scanner component state
          if (exchange) {
            // Stopped specific exchange
            this.scannerComponent?.updateScannerState(exchange, 'stopped');
          } else {
            // Stopped all - clear all scanners in component
            // Get all active scanners and update them
            const activeScanners = this.scannerComponent?.activeScannersList() || [];
            activeScanners.forEach(scanner => {
              this.scannerComponent?.updateScannerState(scanner.exchange, 'stopped');
            });
            // Clear opportunities only when stopping all
            this.opportunities.set([]);
          }
        }
      },
      error: (err) => {
        this.error.set('Failed to stop scanner: ' + err.message);
      }
    });
  }

  /**
   * Handle opportunity execution
   */
  onExecuteOpportunity(opportunity: TriangularOpportunity): void {
    // Get position size from scanner config for this exchange
    let config = this.scannerConfigs.get(opportunity.exchange);
    let restoredFromStorage = false;

    // If not in memory, try to restore from localStorage
    if (!config) {
      const stored = localStorage.getItem(`scanner_config_${opportunity.exchange}`);
      if (stored) {
        const parsedConfig = JSON.parse(stored) as ScannerConfig;
        config = parsedConfig;
        this.scannerConfigs.set(opportunity.exchange, parsedConfig);
        restoredFromStorage = true;
      }
    }

    const positionSize = config?.positionSize;

    console.log('[TriArb Execute] Executing opportunity:', {
      exchange: opportunity.exchange,
      hasConfig: !!config,
      positionSize: positionSize,
      scannerConfigsSize: this.scannerConfigs.size,
      allExchanges: Array.from(this.scannerConfigs.keys()),
      restoredFromStorage
    });

    // Build execution request
    const request: any = { opportunityId: opportunity.id };
    if (positionSize) {
      request.positionSize = positionSize;
    }

    console.log('[TriArb Execute] Request payload:', request);

    this.arbitrageService.executeOpportunity(request).subscribe({
      next: (response) => {
        if (response.success && response.position) {
          // Add to positions list
          this.positions.set([response.position, ...this.positions()]);
          // Switch to positions tab to show execution
          this.activeTab.set('positions');
        }
      },
      error: (err) => {
        this.error.set('Failed to execute opportunity: ' + err.message);
      }
    });
  }

  /**
   * Handle position cancellation
   */
  onCancelPosition(positionId: string): void {
    this.arbitrageService.cancelPosition(positionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPositions();
        }
      },
      error: (err) => {
        this.error.set('Failed to cancel position: ' + err.message);
      }
    });
  }

  /**
   * Handle position deletion
   */
  onDeletePosition(positionId: string): void {
    this.arbitrageService.deletePosition(positionId).subscribe({
      next: (response) => {
        if (response.success) {
          // Remove from local state
          this.positions.set(this.positions().filter(p => p.id !== positionId));
        }
      },
      error: (err) => {
        this.error.set('Failed to delete position: ' + err.message);
      }
    });
  }

  /**
   * Handle filter change
   */
  onFilterChange(filter: PositionFilter): void {
    this.positionFilter.set(filter);
    this.loadPositions(filter);
  }

  /**
   * Switch active tab
   */
  setActiveTab(tab: 'opportunities' | 'positions'): void {
    this.activeTab.set(tab);
  }

  /**
   * Reconnect WebSocket
   */
  reconnect(): void {
    this.arbitrageService.reconnect();
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
