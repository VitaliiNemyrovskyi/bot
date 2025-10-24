import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  TriangularOpportunity,
  TriangularPosition,
  ScannerConfig,
  ScannerStats,
  PositionFilter,
  PositionSummary,
  ExecuteOpportunityRequest,
  ExecuteOpportunityResponse,
  TriangularArbitrageUpdate,
  ScannerStatus
} from '../../../models/triangular-arbitrage.model';

/**
 * Triangular Arbitrage Service
 *
 * Manages all API interactions for the triangular arbitrage feature:
 * - Scanner control (start/stop)
 * - Opportunity detection and retrieval
 * - Position execution and management
 * - Real-time updates via WebSocket
 */
@Injectable({
  providedIn: 'root'
})
export class TriangularArbitrageService {
  private readonly API_BASE = '/api/triangular-arbitrage';
  private ws?: EventSource | any;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimeout?: any;

  // State signals
  private _scannerStatus = signal<ScannerStatus>('stopped');
  readonly scannerStatus = computed(() => {
    const status = this._scannerStatus();
    console.log('[Service] scannerStatus getter called, returning:', status);
    return status;
  });
  readonly currentConfig = signal<ScannerConfig | null>(null);
  readonly scannerStats = signal<ScannerStats>({
    status: 'stopped',
    opportunitiesDetectedToday: 0,
    opportunitiesExecutedToday: 0,
    totalProfitToday: 0,
    avgProfitPercentage: 0,
    scanningDuration: 0
  });

  // Real-time data streams
  private readonly opportunitySubject = new Subject<TriangularOpportunity>();
  private readonly positionSubject = new Subject<TriangularPosition>();
  private readonly statsSubject = new Subject<ScannerStats>();
  private readonly scannerUpdateSubject = new Subject<{ exchange: string; status: ScannerStatus; stats?: ScannerStats }>();

  // Public observables
  readonly opportunities$ = this.opportunitySubject.asObservable();
  readonly positions$ = this.positionSubject.asObservable();
  readonly stats$ = this.statsSubject.asObservable();
  readonly scannerUpdates$ = this.scannerUpdateSubject.asObservable();

  // Connection status
  readonly isConnected = signal<boolean>(false);
  readonly connectionError = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  // ============= Scanner Control =============

  /**
   * Start scanning for arbitrage opportunities
   */
  startScanning(config: ScannerConfig): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.API_BASE}/scan/start`,
      config
    ).pipe(
      map(response => {
        if (response.success) {
          this.currentConfig.set(config);
          console.log('[Service] Setting scannerStatus to: scanning (from startScanning)');
          this._scannerStatus.set('scanning');
        }
        return response;
      }),
      catchError(error => {
        console.log('[Service] Setting scannerStatus to: error (from startScanning error)');
        this._scannerStatus.set('error');
        throw error;
      })
    );
  }

  /**
   * Stop scanning
   * @param exchange - Optional: specific exchange to stop. If not provided, stops all scanners
   */
  stopScanning(exchange?: string): Observable<{ success: boolean; message?: string }> {
    const body = exchange ? { exchange } : {};
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.API_BASE}/scan/stop`,
      body
    ).pipe(
      map(response => {
        if (response.success) {
          // Only update global status if stopping all
          if (!exchange) {
            console.log('[Service] Setting scannerStatus to: stopped (from stopScanning)');
            this._scannerStatus.set('stopped');
            this.currentConfig.set(null);
          }
        }
        return response;
      })
    );
  }

  /**
   * Get current scanner status
   */
  getScannerStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/scan/status`).pipe(
      map(response => {
        // API returns { success, isScanning, scanners, stats }
        // Derive status from isScanning
        const status: ScannerStatus = response.isScanning ? 'scanning' : 'stopped';
        console.log('[Service] Setting scannerStatus to:', status, '(from getScannerStatus, isScanning:', response.isScanning + ')');
        this._scannerStatus.set(status);

        // Set aggregated stats with derived status
        const stats: ScannerStats = {
          status,
          opportunitiesDetectedToday: response.stats?.opportunitiesDetectedToday || 0,
          opportunitiesExecutedToday: response.stats?.opportunitiesExecutedToday || 0,
          totalProfitToday: response.stats?.totalProfitToday || 0,
          avgProfitPercentage: response.stats?.avgProfitPercentage || 0,
          scanningDuration: response.stats?.runningFor || 0,
        };
        this.scannerStats.set(stats);

        // Return full response including scanners array
        return response;
      })
    );
  }

  // ============= Opportunities =============

  /**
   * Get current opportunities
   */
  getOpportunities(filters?: {
    minProfit?: number;
    maxSlippage?: number;
    exchange?: string;
  }): Observable<TriangularOpportunity[]> {
    let params = new HttpParams();

    if (filters?.minProfit !== undefined) {
      params = params.set('minProfit', filters.minProfit.toString());
    }
    if (filters?.maxSlippage !== undefined) {
      params = params.set('maxSlippage', filters.maxSlippage.toString());
    }
    if (filters?.exchange) {
      params = params.set('exchange', filters.exchange);
    }

    return this.http.get<{ opportunities: TriangularOpportunity[]; count: number }>(
      `${this.API_BASE}/opportunities`,
      { params }
    ).pipe(
      map(response => response.opportunities)
    );
  }

  /**
   * Execute a specific opportunity
   */
  executeOpportunity(
    request: ExecuteOpportunityRequest
  ): Observable<ExecuteOpportunityResponse> {
    return this.http.post<ExecuteOpportunityResponse>(
      `${this.API_BASE}/execute`,
      request
    );
  }

  // ============= Positions =============

  /**
   * Get positions with optional filters
   */
  getPositions(filters?: PositionFilter): Observable<TriangularPosition[]> {
    let params = new HttpParams();

    if (filters?.status && filters.status.length > 0) {
      params = params.set('status', filters.status.join(','));
    }
    if (filters?.exchange && filters.exchange.length > 0) {
      params = params.set('exchange', filters.exchange.join(','));
    }
    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }
    if (filters?.minProfit !== undefined) {
      params = params.set('minProfit', filters.minProfit.toString());
    }
    if (filters?.maxProfit !== undefined) {
      params = params.set('maxProfit', filters.maxProfit.toString());
    }

    return this.http.get<{ positions: TriangularPosition[]; count: number; summary: PositionSummary }>(
      `${this.API_BASE}/positions`,
      { params }
    ).pipe(
      map(response => response.positions)
    );
  }

  /**
   * Get a specific position by ID
   */
  getPosition(id: string): Observable<TriangularPosition> {
    return this.http.get<TriangularPosition>(`${this.API_BASE}/positions/${id}`);
  }

  /**
   * Cancel an in-progress position
   */
  cancelPosition(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(
      `${this.API_BASE}/positions/${id}`
    );
  }

  /**
   * Delete a completed position from history
   */
  deletePosition(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(
      `${this.API_BASE}/positions/${id}/delete`
    );
  }

  /**
   * Get position summary statistics
   */
  getPositionSummary(filters?: PositionFilter): Observable<PositionSummary> {
    let params = new HttpParams();

    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return this.http.get<PositionSummary>(
      `${this.API_BASE}/positions/summary`,
      { params }
    );
  }

  // ============= Server-Sent Events Connection =============

  /**
   * Initialize SSE connection for real-time updates
   */
  private initializeWebSocket(): void {
    // For SSE, we need to use full URL in development because EventSource
    // doesn't go through Angular proxy like HttpClient does
    const isDev = window.location.port === '4200';
    const baseUrl = isDev ? 'http://localhost:3000' : '';

    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[TriangularArbitrage] No auth token found');
      this.connectionError.set('Authentication required');
      return;
    }

    // Add token as query parameter since EventSource doesn't support headers
    const sseUrl = `${baseUrl}${this.API_BASE}/stream?token=${encodeURIComponent(token)}`;

    console.log('[TriangularArbitrage] Connecting to SSE:', sseUrl.replace(/token=[^&]+/, 'token=***'));

    try {
      const eventSource = new EventSource(sseUrl, {
        withCredentials: true
      });

      this.ws = eventSource as any; // Store as 'ws' to maintain compatibility

      eventSource.onopen = () => {
        console.log('[TriangularArbitrage] SSE connected');
        this.isConnected.set(true);
        this.connectionError.set(null);
        this.reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const update: TriangularArbitrageUpdate = JSON.parse(event.data);
          this.handleWebSocketUpdate(update);
        } catch (error) {
          console.error('[TriangularArbitrage] Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[TriangularArbitrage] SSE error:', error);
        this.connectionError.set('Connection error');
        this.isConnected.set(false);

        // Close and attempt reconnect
        eventSource.close();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[TriangularArbitrage] Failed to create SSE:', error);
      this.connectionError.set('Failed to create connection');
    }
  }

  /**
   * Handle incoming SSE updates
   */
  private handleWebSocketUpdate(update: TriangularArbitrageUpdate): void {
    switch (update.type) {
      case 'connected':
        console.log('[TriangularArbitrage] Connected:', update.data);
        break;

      case 'heartbeat':
        // Update connection timestamp
        this.isConnected.set(true);
        break;

      case 'opportunity':
        console.log('[TriangularArbitrage] Received opportunity event:', update.data);
        this.opportunitySubject.next(update.data as TriangularOpportunity);
        break;

      case 'position':
        this.positionSubject.next(update.data as TriangularPosition);
        break;

      case 'scanner':
        const scannerData = update.data as any;
        console.log('[Service] Received scanner event:', scannerData);
        if (scannerData.status) {
          console.log('[Service] Setting scannerStatus to:', scannerData.status);
          this._scannerStatus.set(scannerData.status);
        } else {
          console.warn('[Service] Scanner event has no status!', scannerData);
        }
        if (scannerData.stats) {
          this.scannerStats.set(scannerData.stats);
        }
        // Emit scanner update with exchange information
        if (scannerData.exchange) {
          this.scannerUpdateSubject.next({
            exchange: scannerData.exchange,
            status: scannerData.status,
            stats: scannerData.stats
          });
        }
        break;

      case 'stats':
        this.statsSubject.next(update.data as ScannerStats);
        break;

      case 'error':
        console.error('[TriangularArbitrage] Server error:', update.data);
        const errorData = update.data as { message?: string };
        this.connectionError.set(errorData?.message || 'Server error');
        break;

      default:
        console.warn('[TriangularArbitrage] Unknown update type:', update.type);
    }
  }

  /**
   * Send a message (not used with SSE - SSE is one-way)
   */
  private sendMessage(message: any): void {
    // SSE is server-to-client only, no need to send messages
    console.log('[TriangularArbitrage] SSE does not support sending messages');
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('[TriangularArbitrage] Max reconnection attempts reached');
      this.connectionError.set('Connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`[TriangularArbitrage] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.initializeWebSocket();
    }, delay);
  }

  /**
   * Manually reconnect SSE
   */
  reconnect(): void {
    this.reconnectAttempts = 0;
    if (this.ws) {
      (this.ws as any).close();
    }
    this.initializeWebSocket();
  }

  /**
   * Cleanup when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      (this.ws as any).close();
    }
  }

  // ============= Utility Methods =============

  /**
   * Format triangle path for display
   */
  formatTriangle(assetA: string, assetB: string, assetC: string): string {
    return `${assetA} → ${assetB} → ${assetC}`;
  }

  /**
   * Calculate estimated execution time based on historical data
   */
  getEstimatedExecutionTime(): number {
    // Returns estimated time in milliseconds
    // TODO: Calculate from historical position data
    return 5000; // 5 seconds default
  }

  /**
   * Export positions to CSV
   */
  exportPositionsToCSV(positions: TriangularPosition[]): string {
    const headers = [
      'Position ID',
      'Exchange',
      'Triangle',
      'Status',
      'Entry Amount',
      'Expected Profit',
      'Actual Profit',
      'Profit %',
      'Total Fees',
      'Total Slippage',
      'Execution Time (ms)',
      'Created At',
      'Completed At'
    ];

    const rows = positions.map(pos => [
      pos.id,
      pos.exchange,
      this.formatTriangle(pos.triangle.assetA, pos.triangle.assetB, pos.triangle.assetC),
      pos.status,
      pos.entryAmount.toFixed(2),
      pos.expectedProfit.toFixed(2),
      pos.actualProfit?.toFixed(2) || 'N/A',
      pos.actualProfitPercentage?.toFixed(2) || 'N/A',
      pos.totalFees.toFixed(4),
      pos.totalSlippage.toFixed(4),
      pos.executionTimeMs || 'N/A',
      new Date(pos.createdAt).toISOString(),
      pos.completedAt ? new Date(pos.completedAt).toISOString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent: string, filename: string = 'triangular-arbitrage-positions.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
