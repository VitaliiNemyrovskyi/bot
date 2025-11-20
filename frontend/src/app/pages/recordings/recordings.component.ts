import { Component, OnInit, OnDestroy, AfterViewInit, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordingsService, RecordingSession, RecordingDataPoint } from '../../services/recordings.service';
import { Subscription, interval } from 'rxjs';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, Time } from 'lightweight-charts';

@Component({
  selector: 'app-recordings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recordings.component.html',
  styleUrls: ['./recordings.component.scss']
})
export class RecordingsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Chart elements
  chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  private chart: IChartApi | null = null;
  private lineSeries: ISeriesApi<'Line'> | null = null;
  private verticalLine: HTMLDivElement | null = null;
  // State signals
  sessions = signal<RecordingSession[]>([]);
  selectedSession = signal<RecordingSession | null>(null);
  recordingData = signal<RecordingDataPoint[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Playback state
  isPlaying = signal(false);
  currentIndex = signal(0);
  playbackSpeed = signal(1); // 1x, 2x, 5x, 10x
  playbackInterval?: Subscription;

  // Computed values
  currentDataPoint = computed(() => {
    const data = this.recordingData();
    const index = this.currentIndex();
    return data[index] || null;
  });

  orderBook = computed(() => {
    const point = this.currentDataPoint();
    if (!point) return null;

    return {
      bids: point.bid1Price && point.bid1Size ?
        [{ price: point.bid1Price, size: point.bid1Size }] : [],
      asks: point.ask1Price && point.ask1Size ?
        [{ price: point.ask1Price, size: point.ask1Size }] : []
    };
  });

  progress = computed(() => {
    const data = this.recordingData();
    const index = this.currentIndex();
    if (data.length === 0) return 0;
    return (index / (data.length - 1)) * 100;
  });

  constructor(private recordingsService: RecordingsService) {
    // Effect to update chart when current index changes
    effect(() => {
      const index = this.currentIndex();
      const data = this.recordingData();
      if (data.length > 0 && this.chart && index < data.length) {
        this.updateCurrentPositionMarker(index);
      }
    });

    // Effect to initialize chart when container becomes available
    effect(() => {
      const container = this.chartContainer();
      const data = this.recordingData();

      console.log('Chart effect triggered:', {
        hasContainer: !!container,
        dataLength: data.length,
        hasChart: !!this.chart
      });

      // Only initialize if we have data and container, but chart hasn't been created yet
      if (container && data.length > 0 && !this.chart) {
        console.log('Scheduling chart initialization...');
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          this.initializeChart();
        }, 0);
      }
    });
  }

  ngOnInit() {
    this.loadSessions();
  }

  ngAfterViewInit() {
    // Chart will be initialized by the effect when container is available
  }

  ngOnDestroy() {
    this.stop();
    this.destroyChart();
  }

  loadSessions() {
    this.loading.set(true);
    this.error.set(null);

    this.recordingsService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load recording sessions');
        this.loading.set(false);
        console.error('Error loading sessions:', err);
      }
    });
  }

  selectSession(session: RecordingSession) {
    if (this.selectedSession()?.id === session.id) return;

    this.stop();
    this.destroyChart(); // Clean up old chart before loading new session
    this.selectedSession.set(session);
    this.currentIndex.set(0);
    this.recordingData.set([]);
    this.loading.set(true);
    this.error.set(null);

    this.recordingsService.getSessionData(session.id).subscribe({
      next: (response) => {
        console.log('Loaded session data:', response.data.length, 'points');
        this.recordingData.set(response.data);
        this.loading.set(false);
        this.updateChartData(response.data);
      },
      error: (err) => {
        this.error.set('Failed to load recording data');
        this.loading.set(false);
        console.error('Error loading recording data:', err);
      }
    });
  }

  play() {
    if (this.isPlaying()) return;
    if (this.currentIndex() >= this.recordingData().length - 1) {
      this.currentIndex.set(0);
    }

    this.isPlaying.set(true);
    const speed = this.playbackSpeed();
    const intervalMs = Math.max(16, 100 / speed); // Min 16ms (60fps)

    this.playbackInterval = interval(intervalMs).subscribe(() => {
      const nextIndex = this.currentIndex() + 1;
      if (nextIndex >= this.recordingData().length) {
        this.stop();
      } else {
        this.currentIndex.set(nextIndex);
      }
    });
  }

  pause() {
    this.isPlaying.set(false);
    this.playbackInterval?.unsubscribe();
  }

  stop() {
    this.pause();
    this.currentIndex.set(0);
  }

  setSpeed(speed: number) {
    const wasPlaying = this.isPlaying();
    this.pause();
    this.playbackSpeed.set(speed);
    if (wasPlaying) {
      this.play();
    }
  }

  seekTo(percent: number) {
    const dataLength = this.recordingData().length;
    if (dataLength === 0) return;

    const index = Math.floor((percent / 100) * (dataLength - 1));
    this.currentIndex.set(Math.max(0, Math.min(index, dataLength - 1)));
  }

  onProgressBarClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    this.seekTo(percent);
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  formatNumber(num: number | undefined, decimals: number = 2): string {
    if (num === undefined) return 'N/A';
    return num.toFixed(decimals);
  }

  getMinPrice(): number {
    const data = this.recordingData();
    if (data.length === 0) return 0;
    return Math.min(...data.map(d => d.price));
  }

  getMaxPrice(): number {
    const data = this.recordingData();
    if (data.length === 0) return 0;
    return Math.max(...data.map(d => d.price));
  }

  // Chart methods
  private initializeChart() {
    const container = this.chartContainer()?.nativeElement;
    if (!container) {
      console.log('Chart container not found');
      return;
    }

    console.log('Initializing chart with container dimensions:', {
      width: container.clientWidth,
      height: container.clientHeight,
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight
    });

    // Ensure container has valid dimensions
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      console.error('Container has zero dimensions, retrying...');
      setTimeout(() => this.initializeChart(), 100);
      return;
    }

    this.chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: '#0a0e1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#334155',
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          const millis = date.getMilliseconds().toString().padStart(3, '0');
          return `${hours}:${minutes}:${seconds}.${millis}`;
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        mode: 0, // Normal scale mode
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758195',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4a5568',
        },
        horzLine: {
          color: '#758195',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4a5568',
        },
      },
    });

    console.log('Chart created successfully');

    this.lineSeries = this.chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 3,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    console.log('Line series added');

    // Create vertical line for playback position
    this.verticalLine = document.createElement('div');
    this.verticalLine.style.position = 'absolute';
    this.verticalLine.style.left = '0';
    this.verticalLine.style.top = '0';
    this.verticalLine.style.bottom = '0';
    this.verticalLine.style.width = '2px';
    this.verticalLine.style.backgroundColor = '#2196F3';
    this.verticalLine.style.pointerEvents = 'none';
    this.verticalLine.style.zIndex = '10';
    this.verticalLine.style.display = 'none';
    container.appendChild(this.verticalLine);

    // Set data if we have any
    const data = this.recordingData();
    if (data.length > 0) {
      console.log('Setting initial chart data after initialization');
      this.updateChartData(data);
    }
  }

  private updateChartData(data: RecordingDataPoint[]) {
    if (!this.lineSeries || data.length === 0) {
      console.log('Cannot update chart:', !this.lineSeries ? 'No line series' : 'No data');
      return;
    }

    // Convert data points to line chart format with millisecond precision
    // Sort and deduplicate by timestamp (lightweight-charts requires unique timestamps)
    const lineData: LineData[] = data
      .map(point => ({
        time: (point.timestamp / 1000) as Time, // Keep milliseconds as fractional seconds
        value: point.price,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((point, index, arr) => index === 0 || point.time !== arr[index - 1].time);

    console.log('Setting chart data:', lineData.length, 'points with millisecond precision');
    console.log('First point:', lineData[0]);
    console.log('Last point:', lineData[lineData.length - 1]);
    console.log('Price range:', Math.min(...lineData.map(d => d.value)), '-', Math.max(...lineData.map(d => d.value)));

    this.lineSeries.setData(lineData);
    this.chart?.timeScale().fitContent();
  }

  private updateCurrentPositionMarker(index: number) {
    if (!this.chart || !this.lineSeries || !this.verticalLine) return;

    const data = this.recordingData();
    if (index >= data.length) {
      this.verticalLine.style.display = 'none';
      return;
    }

    const currentPoint = data[index];
    const time = (currentPoint.timestamp / 1000) as Time; // Keep milliseconds precision

    // Get X coordinate for the time
    const coordinate = this.chart.timeScale().timeToCoordinate(time);

    if (coordinate !== null) {
      // Show and position the vertical line
      this.verticalLine.style.display = 'block';
      this.verticalLine.style.left = `${coordinate}px`;

      // Set visible range to show current position
      this.chart.timeScale().scrollToPosition(3, true);
    } else {
      this.verticalLine.style.display = 'none';
    }
  }

  private destroyChart() {
    if (this.verticalLine) {
      this.verticalLine.remove();
      this.verticalLine = null;
    }
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.lineSeries = null;
    }
  }
}
