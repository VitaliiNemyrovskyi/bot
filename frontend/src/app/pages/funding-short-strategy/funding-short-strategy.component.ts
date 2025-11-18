import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

interface StrategyConfig {
  enabled: boolean;
  paperTradingMode: boolean;
  entryOffsetMs: number;
  exitOffsetMs: number;
  maxPositionSizeUSDT: number;
  minFundingRate: number;
  stopLossPercent: number;
  allowedSymbols: string[];
  minLiquidity: number;
}

interface ActiveTrade {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  positionSizeUSDT: number;
  fundingRate: number;
  fundingPaymentTime: Date;
  status: string;
  realizedPnL?: number;
  fundingPaid?: number;
  paperTrade: boolean;
}

interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgProfitPercent: number;
  totalProfitUSDT: number;
}

@Component({
  selector: 'app-funding-short-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funding-short-strategy.component.html',
  styleUrls: ['./funding-short-strategy.component.scss']
})
export class FundingShortStrategyComponent implements OnInit, OnDestroy {
  // Signals
  isLoading = signal(false);
  isRunning = signal(false);
  config = signal<StrategyConfig | null>(null);
  activeTrades = signal<ActiveTrade[]>([]);
  statistics = signal<TradeStatistics | null>(null);
  recentTrades = signal<any[]>([]);
  error = signal<string | null>(null);

  // Edit mode
  editMode = signal(false);
  editedConfig = signal<Partial<StrategyConfig>>({});

  // Computed
  nextFundingTime = computed(() => {
    const now = new Date();
    const fundingHours = [0, 8, 16];
    const currentHour = now.getUTCHours();

    let nextHour = fundingHours.find(h => h > currentHour);

    if (nextHour === undefined) {
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      return tomorrow;
    }

    const nextFunding = new Date(now);
    nextFunding.setUTCHours(nextHour, 0, 0, 0);
    return nextFunding;
  });

  timeUntilFunding = computed(() => {
    const next = this.nextFundingTime();
    const now = new Date();
    const diff = next.getTime() - now.getTime();

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  private statusSubscription?: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStatus();

    // Auto-refresh every 5 seconds
    this.statusSubscription = interval(5000).subscribe(() => {
      if (!this.editMode()) {
        this.loadStatus();
      }
    });
  }

  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
  }

  async loadStatus() {
    try {
      const response: any = await this.http.get('/api/funding-short-strategy/status').toPromise();

      if (response.success) {
        this.config.set(response.config);
        this.isRunning.set(response.config.enabled);
        this.activeTrades.set(response.activeTrades || []);
        this.statistics.set(response.statistics);
        this.recentTrades.set(response.recentTrades || []);
        this.error.set(null);
      }
    } catch (error: any) {
      console.error('Error loading status:', error);
      this.error.set(error.error?.error || 'Failed to load status');
    }
  }

  async startStrategy() {
    if (!confirm('Start the funding SHORT strategy? Make sure you understand the risks!')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response: any = await this.http.post('/api/funding-short-strategy/start', {}).toPromise();

      if (response.success) {
        this.isRunning.set(true);
        await this.loadStatus();
      }
    } catch (error: any) {
      console.error('Error starting strategy:', error);
      this.error.set(error.error?.error || 'Failed to start strategy');
    } finally {
      this.isLoading.set(false);
    }
  }

  async stopStrategy() {
    if (!confirm('Stop the funding SHORT strategy? Active trades will be closed.')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response: any = await this.http.post('/api/funding-short-strategy/stop', {}).toPromise();

      if (response.success) {
        this.isRunning.set(false);
        await this.loadStatus();
      }
    } catch (error: any) {
      console.error('Error stopping strategy:', error);
      this.error.set(error.error?.error || 'Failed to stop strategy');
    } finally {
      this.isLoading.set(false);
    }
  }

  enableEditMode() {
    const current = this.config();
    if (current) {
      this.editedConfig.set({ ...current });
      this.editMode.set(true);
    }
  }

  cancelEdit() {
    this.editMode.set(false);
    this.editedConfig.set({});
  }

  async saveConfig() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response: any = await this.http.put('/api/funding-short-strategy/config', this.editedConfig()).toPromise();

      if (response.success) {
        this.config.set(response.config);
        this.editMode.set(false);
        this.editedConfig.set({});
      }
    } catch (error: any) {
      console.error('Error saving config:', error);
      this.error.set(error.error?.error || 'Failed to save configuration');
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ENTERED':
        return 'status-active';
      case 'EXITED':
        return 'status-completed';
      case 'PENDING_ENTRY':
      case 'PENDING_EXIT':
        return 'status-pending';
      case 'STOPPED':
        return 'status-stopped';
      default:
        return '';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value / 100);
  }
}
