import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, interval, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FarmService, FundingOpportunity } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FundingRateMiniChartComponent } from '../../components/funding-rate-mini-chart/funding-rate-mini-chart.component';
import { HttpClient } from '@angular/common/http';

interface RecordingStatus {
  sessionId: string;
  status: 'PREPARING' | 'WAITING' | 'RECORDING' | 'COMPLETED' | 'CANCELLED' | 'ERROR';
  millisecondsUntilPayment?: number;
  secondsUntilPayment?: number;
  dataPointsRecorded?: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, FundingRateMiniChartComponent],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss']
})
export class FarmComponent implements OnInit, OnDestroy {
  public allOpportunities$!: Observable<FundingOpportunity[]>;
  public filteredOpportunities$!: Observable<FundingOpportunity[]>;
  public availableExchanges: string[] = [];
  public selectedExchanges: string[] = [];
  public currentTime$!: Observable<number>;

  // Selected pairs for charts (max 6)
  public selectedPairs: Set<string> = new Set();
  public readonly MAX_SELECTED_PAIRS = 6;

  // Table collapse state (start collapsed by default)
  public isTableCollapsed = true;

  // Recording sessions: key = "symbol-exchange", value = status
  public recordingSessions = new Map<string, RecordingStatus>();
  private sseConnections = new Map<string, EventSource>();

  private selectedExchangesSubject = new BehaviorSubject<string[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private farmService: FarmService,
    private http: HttpClient
  ) { }

  /**
   * Get unique key for pair (symbol + exchange)
   */
  getPairKey(op: FundingOpportunity): string {
    return `${op.symbol}-${op.exchange}`;
  }

  ngOnInit(): void {
    // Update current time every second for countdown
    this.currentTime$ = interval(1000).pipe(
      startWith(0),
      map(() => Date.now()),
      takeUntil(this.destroy$)
    );

    // Poll for funding opportunities every 30 seconds
    this.allOpportunities$ = interval(30000).pipe(
      startWith(0), // Start immediately
      switchMap(() => this.farmService.getFundingOpportunities()),
      map(opportunities => {
        const exchanges = [...new Set(opportunities.map(op => op.exchange))].sort();
        this.availableExchanges = exchanges;
        if (this.selectedExchanges.length === 0) {
          // Default to BYBIT only, user can enable others manually
          const bybitExists = exchanges.includes('BYBIT');
          this.selectedExchanges = bybitExists ? ['BYBIT'] : (exchanges.length > 0 ? [exchanges[0]] : []);
          this.selectedExchangesSubject.next(this.selectedExchanges);
        }

        console.log(`[Farm] Fetched ${opportunities.length} funding opportunities`);
        return opportunities;
      }),
      takeUntil(this.destroy$)
    );

    this.filteredOpportunities$ = combineLatest([
      this.allOpportunities$,
      this.selectedExchangesSubject.asObservable().pipe(startWith(this.selectedExchanges))
    ]).pipe(
      map(([opportunities, selectedExchanges]) => {
        let filtered = opportunities;
        if (selectedExchanges.length > 0) {
          filtered = opportunities.filter(op => selectedExchanges.includes(op.exchange));
        }

        // Auto-select top 4 pairs by absolute funding rate on first load (from filtered list)
        if (this.selectedPairs.size === 0 && filtered.length > 0) {
          const top4 = filtered
            .slice()
            .sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate))
            .slice(0, 4);
          top4.forEach(op => this.selectedPairs.add(this.getPairKey(op)));
          console.log(`[Farm] Auto-selected top 4 pairs:`, Array.from(this.selectedPairs));
          console.log(`[Farm] Top 4 opportunities:`, top4.map(op => ({ symbol: op.symbol, exchange: op.exchange })));
        }

        console.log(`[Farm] Filtered opportunities count: ${filtered.length}, Selected pairs: ${this.selectedPairs.size}`);
        return filtered;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    console.log('[Farm] Component destroyed, cleaning up subscriptions');

    // Close all SSE connections
    this.sseConnections.forEach((sse, key) => {
      console.log(`[Farm] Closing SSE connection: ${key}`);
      sse.close();
    });
    this.sseConnections.clear();

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Calculate countdown to next funding time
   * Returns formatted string in HH:MM:SS format
   */
  getCountdown(nextFundingTime: Date): string {
    const now = Date.now();
    const fundingTime = nextFundingTime.getTime();
    const diff = fundingTime - now;

    if (diff <= 0) {
      return '00:00:00';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  toggleExchangeFilter(exchange: string): void {
    const currentIndex = this.selectedExchanges.indexOf(exchange);
    if (currentIndex === -1) {
      this.selectedExchanges.push(exchange);
    } else {
      this.selectedExchanges.splice(currentIndex, 1);
    }
    this.selectedExchangesSubject.next(this.selectedExchanges);
  }

  isExchangeSelected(exchange: string): boolean {
    return this.selectedExchanges.includes(exchange);
  }

  trackByExchange(index: number, exchange: string): string { return exchange; }

  /**
   * Track by function for opportunities list
   * Prevents re-rendering of chart components when opportunities list updates
   */
  trackByPair(index: number, op: FundingOpportunity): string {
    return `${op.symbol}-${op.exchange}`;
  }

  /**
   * Toggle pair selection for charts
   */
  togglePairSelection(op: FundingOpportunity): void {
    const key = this.getPairKey(op);

    if (this.selectedPairs.has(key)) {
      this.selectedPairs.delete(key);
    } else {
      if (this.selectedPairs.size >= this.MAX_SELECTED_PAIRS) {
        // Remove first selected pair if max reached
        const firstKey = this.selectedPairs.values().next().value;
        if (firstKey) {
          this.selectedPairs.delete(firstKey);
        }
      }
      this.selectedPairs.add(key);
    }
  }

  /**
   * Check if pair is selected
   */
  isPairSelected(op: FundingOpportunity): boolean {
    return this.selectedPairs.has(this.getPairKey(op));
  }

  /**
   * Get list of selected opportunities for charts
   */
  get selectedOpportunities(): FundingOpportunity[] {
    // Need to get actual opportunities from the observable
    // This will be populated from template
    return [];
  }

  /**
   * Toggle table collapse state
   */
  toggleTableCollapse(): void {
    this.isTableCollapsed = !this.isTableCollapsed;
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedPairs.clear();
  }

  /**
   * Open recording modal/dialog
   * For now, just start recording immediately (modal can be added later)
   */
  openRecordModal(op: FundingOpportunity): void {
    if (op.exchange !== 'BYBIT') {
      console.warn('[Farm] Recording is only supported for BYBIT exchange');
      return;
    }

    // Check if already recording this pair
    const key = this.getPairKey(op);
    if (this.recordingSessions.has(key)) {
      console.warn('[Farm] Already recording this pair');
      return;
    }

    // Start recording with default settings
    this.startRecording(op);
  }

  /**
   * Start TEST recording with short delay (30 seconds)
   */
  async startTestRecording(op: FundingOpportunity): Promise<void> {
    if (op.exchange !== 'BYBIT') {
      console.warn('[Farm] Test recording is only supported for BYBIT exchange');
      return;
    }

    const key = this.getPairKey(op);
    if (this.recordingSessions.has(key)) {
      console.warn('[Farm] Already recording this pair');
      return;
    }

    try {
      console.log(`[Farm] Starting TEST recording for ${key}`);

      // Call TEST API endpoint
      const response = await this.http.post<any>('/api/funding-payment/recordings/test', {
        symbol: op.symbol,
        delaySeconds: 30, // Funding payment in 30 seconds
      }).toPromise();

      if (!response.success) {
        throw new Error(response.error || 'Failed to start test recording');
      }

      const sessionId = response.sessionId;
      console.log(`[Farm] ✅ Test recording started: ${sessionId} (funding payment in 30s)`);

      // Store initial status
      this.recordingSessions.set(key, {
        sessionId,
        status: response.status || 'PREPARING',
        millisecondsUntilPayment: response.millisecondsUntilPayment,
      });

      // Connect to SSE stream for real-time updates
      this.connectToRecordingStream(key, sessionId);

    } catch (error: any) {
      console.error('[Farm] ❌ Failed to start test recording:', error);
    }
  }

  /**
   * Start recording session
   */
  async startRecording(op: FundingOpportunity): Promise<void> {
    const key = this.getPairKey(op);

    try {
      console.log(`[Farm] Starting recording for ${key}`);

      // Call API to start recording
      const response = await this.http.post<any>('/api/funding-payment/recordings', {
        symbol: op.symbol,
        exchange: op.exchange,
        fundingRate: op.fundingRate,
        fundingPaymentTime: op.nextFundingTime,
        fundingInterval: op.fundingInterval,
        preRecordingSeconds: 5,
        postRecordingSeconds: 30,
      }).toPromise();

      if (!response.success) {
        throw new Error(response.error || 'Failed to start recording');
      }

      const sessionId = response.sessionId;
      console.log(`[Farm] Recording started: ${sessionId}`);

      // Store initial status
      this.recordingSessions.set(key, {
        sessionId,
        status: response.status || 'PREPARING',
        millisecondsUntilPayment: response.millisecondsUntilPayment,
      });

      // Connect to SSE stream for real-time updates
      this.connectToRecordingStream(key, sessionId);

    } catch (error: any) {
      console.error('[Farm] ❌ Failed to start recording:', error);
    }
  }

  /**
   * Connect to Server-Sent Events stream for real-time recording updates
   */
  private connectToRecordingStream(key: string, sessionId: string): void {
    // Get auth token from localStorage and add it to URL as query parameter
    // (EventSource doesn't support custom headers)
    const token = localStorage.getItem('auth_token');
    const url = `/api/funding-payment/recordings/${sessionId}/stream${token ? `?token=${token}` : ''}`;

    console.log(`[Farm] Connecting to SSE stream: ${url}`);

    const eventSource = new EventSource(url);

    eventSource.addEventListener('connected', (event: MessageEvent) => {
      console.log('[Farm SSE] Connected:', event.data);
    });

    eventSource.addEventListener('status', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('[Farm SSE] Status update:', data);

      const currentStatus = this.recordingSessions.get(key);
      if (currentStatus) {
        this.recordingSessions.set(key, {
          ...currentStatus,
          status: data.status,
        });
      }
    });

    eventSource.addEventListener('countdown', (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      const currentStatus = this.recordingSessions.get(key);
      if (currentStatus) {
        this.recordingSessions.set(key, {
          ...currentStatus,
          status: data.status,
          millisecondsUntilPayment: data.millisecondsUntilPayment,
          secondsUntilPayment: data.secondsUntilPayment,
          dataPointsRecorded: data.dataPointsRecorded,
        });
      }
    });

    eventSource.addEventListener('dataPoint', (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      const currentStatus = this.recordingSessions.get(key);
      if (currentStatus) {
        this.recordingSessions.set(key, {
          ...currentStatus,
          dataPointsRecorded: data.totalPoints,
        });
      }
    });

    eventSource.addEventListener('analytics', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('[Farm SSE] Analytics:', data);
      // Could show this in UI
    });

    eventSource.addEventListener('error', (event: MessageEvent) => {
      console.error('[Farm SSE] Error:', event.data);
      const data = JSON.parse(event.data);

      const currentStatus = this.recordingSessions.get(key);
      if (currentStatus) {
        this.recordingSessions.set(key, {
          ...currentStatus,
          status: 'ERROR',
          errorMessage: data.message,
        });
      }
    });

    eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
      // Keep-alive
    });

    eventSource.onerror = (error) => {
      console.error('[Farm SSE] Connection error:', error);
      eventSource.close();
      this.sseConnections.delete(key);
    };

    // Store connection for cleanup
    this.sseConnections.set(key, eventSource);
  }

  /**
   * Cancel active recording
   */
  async cancelRecording(op: FundingOpportunity): Promise<void> {
    const key = this.getPairKey(op);
    const status = this.recordingSessions.get(key);

    if (!status) {
      return;
    }

    try {
      console.log(`[Farm] Cancelling recording: ${status.sessionId}`);

      await this.http.post<any>(`/api/funding-payment/recordings/${status.sessionId}/cancel`, {}).toPromise();

      console.log(`[Farm] Recording cancelled: ${status.sessionId}`);

      // Close SSE connection
      const sse = this.sseConnections.get(key);
      if (sse) {
        sse.close();
        this.sseConnections.delete(key);
      }

      // Remove from map
      this.recordingSessions.delete(key);

    } catch (error: any) {
      console.error('[Farm] ❌ Failed to cancel recording:', error);
    }
  }

  /**
   * Get recording status for a pair
   */
  getRecordingStatus(op: FundingOpportunity): RecordingStatus | undefined {
    return this.recordingSessions.get(this.getPairKey(op));
  }

  /**
   * Check if recording can be cancelled
   */
  canCancelRecording(op: FundingOpportunity): boolean {
    const status = this.getRecordingStatus(op);
    return status !== undefined && !['COMPLETED', 'CANCELLED', 'ERROR'].includes(status.status);
  }

  /**
   * Get human-readable status message
   */
  getRecordingStatusMessage(op: FundingOpportunity): string {
    const status = this.getRecordingStatus(op);
    if (!status) return '';

    switch (status.status) {
      case 'PREPARING':
        return 'Syncing time with Bybit...';
      case 'WAITING':
        return 'Waiting for funding payment...';
      case 'RECORDING':
        return 'Recording price data...';
      case 'COMPLETED':
        return 'Recording completed!';
      case 'CANCELLED':
        return 'Recording cancelled';
      case 'ERROR':
        return `Error: ${status.errorMessage || 'Unknown error'}`;
      default:
        return '';
    }
  }

  /**
   * Format countdown (milliseconds to HH:MM:SS)
   */
  formatCountdown(milliseconds: number): string {
    if (milliseconds <= 0) {
      return '00:00:00';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }
}
