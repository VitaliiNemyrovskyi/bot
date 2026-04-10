import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { buildApiUrl } from '../config/app.config';

// Response interfaces matching backend API

export interface LatencyStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  stddev: number;
  jitter: number;
}

export interface BenchmarkAnalysis {
  runId: string;
  runLabel: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  totalEvents: number;
  errorCount: number;
  exchanges: string[];
  symbols: string[];
  exchangeStats: Record<string, Record<string, LatencyStats>>;
}

export interface BenchmarkRunSummary {
  id: string;
  runLabel: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  exchanges: string[];
  symbols: string[];
  settlementTime: string | null;
  windowSeconds: number | null;
  totalEvents: number | null;
  errorCount: number | null;
  createdAt: string;
}

export interface BenchmarkRunListResponse {
  success: boolean;
  data: {
    runs: BenchmarkRunSummary[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

export interface BenchmarkRunDetailResponse {
  success: boolean;
  data: BenchmarkAnalysis;
  error?: string;
}

export interface BenchmarkRunTarget {
  exchange: string;
  credentialId: string;
  symbols: string[];
}

export interface StartBenchmarkRequest {
  runLabel: string;
  targets: BenchmarkRunTarget[];
  settlementTime?: string;
  windowSeconds?: number;
  enableOrderLatency?: boolean;
  enableWsLatency?: boolean;
  enableTimeSync?: boolean;
  enableDbWriteLatency?: boolean;
  enableSettlementJitter?: boolean;
  timeSyncIterations?: number;
  dbWriteIterations?: number;
}

export interface StartBenchmarkResponse {
  success: boolean;
  data?: {
    runId: string;
    runLabel: string;
    exchanges: string[];
    symbols: string[];
  };
  message?: string;
  error?: string;
}

export interface BenchmarkResultsParams {
  limit?: number;
  offset?: number;
  since?: string;
  until?: string;
}

/**
 * Service for interacting with the latency benchmark API.
 * Provides methods to start benchmark runs, list results, and fetch detailed analysis.
 */
@Injectable({
  providedIn: 'root'
})
export class BenchmarkService {
  private isBenchmarkRunning = signal<boolean>(false);
  private isLoadingResults = signal<boolean>(false);

  readonly isBenchmarkRunning$ = this.isBenchmarkRunning.asReadonly();
  readonly isLoadingResults$ = this.isLoadingResults.asReadonly();

  constructor(private http: HttpClient) {}

  /**
   * Start a new benchmark run.
   * POST /api/benchmark/run
   */
  startBenchmarkRun(request: StartBenchmarkRequest): Observable<StartBenchmarkResponse> {
    this.isBenchmarkRunning.set(true);

    return this.http.post<StartBenchmarkResponse>(
      buildApiUrl('/benchmark/run'),
      request
    ).pipe(
      tap(() => this.isBenchmarkRunning.set(false)),
      catchError(error => {
        this.isBenchmarkRunning.set(false);
        console.error('Error starting benchmark run:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * List benchmark runs with pagination and date filtering.
   * GET /api/benchmark/results
   */
  getBenchmarkResults(params?: BenchmarkResultsParams): Observable<BenchmarkRunListResponse> {
    this.isLoadingResults.set(true);

    let httpParams = new HttpParams();
    if (params?.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params?.since) {
      httpParams = httpParams.set('since', params.since);
    }
    if (params?.until) {
      httpParams = httpParams.set('until', params.until);
    }

    return this.http.get<BenchmarkRunListResponse>(
      buildApiUrl('/benchmark/results'),
      { params: httpParams }
    ).pipe(
      tap(() => this.isLoadingResults.set(false)),
      catchError(error => {
        this.isLoadingResults.set(false);
        console.error('Error fetching benchmark results:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get detailed analysis for a specific benchmark run.
   * GET /api/benchmark/results/:runId
   */
  getBenchmarkRunDetail(runId: string): Observable<BenchmarkRunDetailResponse> {
    return this.http.get<BenchmarkRunDetailResponse>(
      buildApiUrl(`/benchmark/results/${runId}`)
    ).pipe(
      catchError(error => {
        console.error('Error fetching benchmark run detail:', error);
        return throwError(() => error);
      })
    );
  }
}
