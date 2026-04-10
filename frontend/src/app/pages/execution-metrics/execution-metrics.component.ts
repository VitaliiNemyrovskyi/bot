import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  BenchmarkService,
  BenchmarkAnalysis,
  BenchmarkRunSummary,
  LatencyStats,
} from '../../services/benchmark.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../../components/ui/icon/icon.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import {
  createChart,
  IChartApi,
  LineSeries,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  Time,
} from 'lightweight-charts';

/**
 * Flattened row for the latency table display
 */
interface LatencyTableRow {
  exchange: string;
  eventType: string;
  eventTypeLabel: string;
  stats: LatencyStats;
}

/**
 * Execution Metrics Page Component
 *
 * Operator-focused dashboard for viewing latency benchmarking results
 * across exchange connectors. Data density prioritized over aesthetics.
 */
@Component({
  selector: 'app-execution-metrics',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './execution-metrics.component.html',
  styleUrls: ['./execution-metrics.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionMetricsComponent implements OnInit, OnDestroy, AfterViewInit {
  private benchmarkService = inject(BenchmarkService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  @ViewChild('jitterChartContainer') jitterChartContainer!: ElementRef;
  @ViewChild('timeSyncChartContainer') timeSyncChartContainer!: ElementRef;

  // State signals
  runs = signal<BenchmarkRunSummary[]>([]);
  selectedAnalysis = signal<BenchmarkAnalysis | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedRunId = signal<string | null>(null);

  readonly isBenchmarkRunning = this.benchmarkService.isBenchmarkRunning$;
  readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');

  // Computed: flatten exchangeStats into table rows
  latencyTableRows = computed<LatencyTableRow[]>(() => {
    const analysis = this.selectedAnalysis();
    if (!analysis) return [];

    const rows: LatencyTableRow[] = [];
    for (const [exchange, typeMap] of Object.entries(analysis.exchangeStats)) {
      for (const [eventType, stats] of Object.entries(typeMap)) {
        rows.push({
          exchange,
          eventType,
          eventTypeLabel: this.getEventTypeLabel(eventType),
          stats,
        });
      }
    }
    return rows;
  });

  // Computed: DB write latency stats (from SYSTEM exchange)
  dbWriteStats = computed<LatencyStats | null>(() => {
    const analysis = this.selectedAnalysis();
    if (!analysis) return null;
    return analysis.exchangeStats['SYSTEM']?.['DB_WRITE_LATENCY'] ?? null;
  });

  // Computed: filter out SYSTEM/DB rows for exchange latency table
  exchangeLatencyRows = computed<LatencyTableRow[]>(() => {
    return this.latencyTableRows().filter(
      (row) => row.exchange !== 'SYSTEM'
    );
  });

  // Computed: time sync rows for dedicated section
  timeSyncRows = computed<LatencyTableRow[]>(() => {
    return this.latencyTableRows().filter(
      (row) => row.eventType === 'TIME_SYNC'
    );
  });

  // Computed: settlement jitter rows
  settlementJitterRows = computed<LatencyTableRow[]>(() => {
    return this.latencyTableRows().filter(
      (row) => row.eventType === 'SETTLEMENT_JITTER'
    );
  });

  private subscriptions: Subscription[] = [];
  private jitterChart: IChartApi | null = null;
  private timeSyncChart: IChartApi | null = null;

  ngOnInit(): void {
    this.loadBenchmarkRuns();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data loads
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.destroyCharts();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  /**
   * Load the list of benchmark runs
   */
  loadBenchmarkRuns(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const sub = this.benchmarkService.getBenchmarkResults({ limit: 50 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.runs.set(response.data.runs);
          // Auto-select most recent completed run
          const completedRun = response.data.runs.find((r) => r.completedAt);
          if (completedRun) {
            this.selectRun(completedRun.id);
          } else {
            this.isLoading.set(false);
          }
        } else {
          this.error.set(response.error ?? this.translate('execMetrics.loadError'));
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.message ?? this.translate('execMetrics.loadError'));
        this.isLoading.set(false);
      },
    });

    this.subscriptions.push(sub);
  }

  /**
   * Select a benchmark run and load its detailed analysis
   */
  selectRun(runId: string): void {
    this.selectedRunId.set(runId);
    this.isLoading.set(true);

    const sub = this.benchmarkService.getBenchmarkRunDetail(runId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedAnalysis.set(response.data);
          this.isLoading.set(false);
          // Render charts after data is available
          setTimeout(() => this.renderCharts(), 100);
        } else {
          this.error.set(response.error ?? this.translate('execMetrics.loadError'));
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.message ?? this.translate('execMetrics.loadError'));
        this.isLoading.set(false);
      },
    });

    this.subscriptions.push(sub);
  }

  /**
   * Start a new benchmark run with default configuration
   */
  startBenchmark(): void {
    // Placeholder: in production this would open a config dialog
    // For now, trigger with minimal defaults
    const sub = this.benchmarkService.startBenchmarkRun({
      runLabel: `Benchmark ${new Date().toISOString().slice(0, 16)}`,
      targets: [],
      enableOrderLatency: true,
      enableWsLatency: true,
      enableTimeSync: true,
      enableDbWriteLatency: true,
      timeSyncIterations: 10,
      dbWriteIterations: 10,
    }).subscribe({
      next: () => {
        // Reload runs after starting
        setTimeout(() => this.loadBenchmarkRuns(), 2000);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? err.message ?? this.translate('execMetrics.startError'));
      },
    });

    this.subscriptions.push(sub);
  }

  /**
   * Map backend event type strings to translated labels
   */
  getEventTypeLabel(eventType: string): string {
    const labelMap: Record<string, string> = {
      ORDER_LATENCY: this.translate('execMetrics.orderLatency'),
      WS_LATENCY: this.translate('execMetrics.wsLatency'),
      TIME_SYNC: this.translate('execMetrics.timeSync'),
      DB_WRITE_LATENCY: this.translate('execMetrics.dbWrite'),
      SETTLEMENT_JITTER: this.translate('execMetrics.settlementJitterType'),
    };
    return labelMap[eventType] ?? eventType;
  }

  /**
   * Format milliseconds to a readable duration string
   */
  formatDuration(ms: number | null): string {
    if (ms === null || ms === undefined) return '-';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  /**
   * Format a date string for display
   */
  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Format a latency value to 2 decimal places
   */
  formatLatency(value: number): string {
    return value.toFixed(2);
  }

  /**
   * Get CSS class for latency value severity
   */
  getLatencyClass(ms: number): string {
    if (ms < 50) return 'latency-good';
    if (ms < 150) return 'latency-ok';
    if (ms < 500) return 'latency-warn';
    return 'latency-bad';
  }

  /**
   * Check if a run is the currently selected one
   */
  isSelectedRun(runId: string): boolean {
    return this.selectedRunId() === runId;
  }

  /**
   * Render lightweight-charts for time sync and settlement jitter
   */
  private renderCharts(): void {
    this.destroyCharts();

    const analysis = this.selectedAnalysis();
    if (!analysis) return;

    // Render time sync chart if data available
    if (this.timeSyncRows().length > 0 && this.timeSyncChartContainer?.nativeElement) {
      this.renderTimeSyncChart();
    }

    // Render settlement jitter chart if data available
    if (this.settlementJitterRows().length > 0 && this.jitterChartContainer?.nativeElement) {
      this.renderJitterChart();
    }
  }

  /**
   * Create a simple line chart for time sync round-trip latency per exchange
   */
  private renderTimeSyncChart(): void {
    const container = this.timeSyncChartContainer?.nativeElement;
    if (!container) return;

    const isDark = this.isDark();

    this.timeSyncChart = createChart(container, {
      width: container.clientWidth || 600,
      height: 250,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1e1e1e' : '#ffffff' },
        textColor: isDark ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.3)' },
        horzLines: { color: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.3)' },
      },
      rightPriceScale: { borderColor: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.5)' },
      timeScale: { borderColor: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.5)' },
    });

    // Use time sync stats as bar-like visualization per exchange
    const rows = this.timeSyncRows();
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

    rows.forEach((row, index) => {
      const series = this.timeSyncChart!.addSeries(LineSeries, {
        color: colors[index % colors.length],
        lineWidth: 2,
        title: row.exchange,
      });

      // Create synthetic data points from stats (min, p95, mean, p99, max)
      const baseTime = Math.floor(Date.now() / 1000) - 300;
      const data: Array<{ time: Time; value: number }> = [
        { time: (baseTime) as UTCTimestamp, value: row.stats.min },
        { time: (baseTime + 60) as UTCTimestamp, value: row.stats.mean },
        { time: (baseTime + 120) as UTCTimestamp, value: row.stats.median },
        { time: (baseTime + 180) as UTCTimestamp, value: row.stats.p95 },
        { time: (baseTime + 240) as UTCTimestamp, value: row.stats.p99 },
        { time: (baseTime + 300) as UTCTimestamp, value: row.stats.max },
      ];

      series.setData(data);
    });

    this.timeSyncChart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (this.timeSyncChart && entries.length > 0) {
        const { width } = entries[0]!.contentRect;
        this.timeSyncChart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);
  }

  /**
   * Create a scatter-like chart for settlement jitter visualization
   */
  private renderJitterChart(): void {
    const container = this.jitterChartContainer?.nativeElement;
    if (!container) return;

    const isDark = this.isDark();

    this.jitterChart = createChart(container, {
      width: container.clientWidth || 600,
      height: 250,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1e1e1e' : '#ffffff' },
        textColor: isDark ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.3)' },
        horzLines: { color: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.3)' },
      },
      rightPriceScale: { borderColor: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.5)' },
      timeScale: { borderColor: isDark ? 'rgba(197,203,206,0.1)' : 'rgba(197,203,206,0.5)' },
    });

    // Render jitter as line per exchange (min -> mean -> p95 -> max)
    const rows = this.settlementJitterRows();
    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e'];

    rows.forEach((row, index) => {
      const series = this.jitterChart!.addSeries(LineSeries, {
        color: colors[index % colors.length],
        lineWidth: 2,
        title: `${row.exchange} Jitter`,
      });

      const baseTime = Math.floor(Date.now() / 1000) - 300;
      const data: Array<{ time: Time; value: number }> = [
        { time: (baseTime) as UTCTimestamp, value: row.stats.min },
        { time: (baseTime + 75) as UTCTimestamp, value: row.stats.mean - row.stats.stddev },
        { time: (baseTime + 150) as UTCTimestamp, value: row.stats.mean },
        { time: (baseTime + 225) as UTCTimestamp, value: row.stats.mean + row.stats.stddev },
        { time: (baseTime + 300) as UTCTimestamp, value: row.stats.max },
      ];

      series.setData(data);
    });

    this.jitterChart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (this.jitterChart && entries.length > 0) {
        const { width } = entries[0]!.contentRect;
        this.jitterChart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);
  }

  /**
   * Clean up chart instances
   */
  private destroyCharts(): void {
    if (this.jitterChart) {
      this.jitterChart.remove();
      this.jitterChart = null;
    }
    if (this.timeSyncChart) {
      this.timeSyncChart.remove();
      this.timeSyncChart = null;
    }
  }
}
