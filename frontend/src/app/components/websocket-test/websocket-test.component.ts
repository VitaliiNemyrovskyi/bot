import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BybitService } from '../../services/bybit.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="websocket-test">
      <h2>WebSocket Test - Real-time BTCUSDT Data</h2>

      <div class="connection-info">
        <p><strong>Connection Status:</strong>
          <span [class]="'status-' + connectionStatus">{{ connectionStatus }}</span>
        </p>
        <p><strong>WebSocket URL:</strong> wss://stream.bybit.com/v5/public/spot</p>
        <p><strong>Active Subscriptions:</strong> {{ activeSubscriptions.length }}</p>
        <ul>
          <li *ngFor="let sub of activeSubscriptions">{{ sub }}</li>
        </ul>
      </div>

      <div class="controls">
        <button (click)="startTest()" [disabled]="isRunning">Start Kline Test</button>
        <button (click)="startTickerTest()" [disabled]="isRunning">Start Ticker Test</button>
        <button (click)="stopTest()" [disabled]="!isRunning">Stop Test</button>
      </div>

      <div class="data-display">
        <h3>Latest Data Points (Last 10):</h3>
        <div class="data-items">
          <div *ngFor="let data of latestData" class="data-item">
            <strong>{{ formatTime(data.time) }}</strong>:
            O: {{ data.open }} | H: {{ data.high }} | L: {{ data.low }} | C: {{ data.close }}
            <span [class]="data.close > data.open ? 'green' : 'red'">
              ({{ data.close > data.open ? '+' : '' }}{{ ((data.close - data.open) / data.open * 100).toFixed(2) }}%)
            </span>
          </div>
        </div>
      </div>

      <div class="logs">
        <h3>Logs:</h3>
        <div class="log-items">
          <div *ngFor="let log of logs" class="log-item">
            {{ log.time }}: {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .websocket-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      font-family: monospace;
    }

    .connection-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .status-connected { color: green; font-weight: bold; }
    .status-connecting { color: orange; font-weight: bold; }
    .status-disconnected { color: red; font-weight: bold; }

    .controls {
      margin: 20px 0;
    }

    .controls button {
      margin-right: 10px;
      padding: 10px 20px;
      font-size: 14px;
    }

    .data-display, .logs {
      margin: 20px 0;
    }

    .data-item, .log-item {
      padding: 5px;
      margin: 2px 0;
      background: #f9f9f9;
      border-left: 3px solid #ddd;
      font-size: 12px;
    }

    .green { color: green; }
    .red { color: red; }

    .log-items {
      max-height: 200px;
      overflow-y: auto;
    }
  `]
})
export class WebSocketTestComponent implements OnInit, OnDestroy {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  activeSubscriptions: string[] = [];
  latestData: any[] = [];
  logs: { time: string, message: string }[] = [];
  isRunning = false;

  private subscription?: Subscription;
  private statusSubscription?: Subscription;

  constructor(private bybitService: BybitService) {}

  ngOnInit(): void {
    this.log('Component initialized');

    // Subscribe to connection status
    this.statusSubscription = this.bybitService.getWebSocketConnectionState().subscribe(status => {
      this.connectionStatus = status;
      this.activeSubscriptions = this.bybitService.getActiveSubscriptions();
      this.log(`Connection status changed to: ${status}`);
    });
  }

  ngOnDestroy(): void {
    this.stopTest();
    this.statusSubscription?.unsubscribe();
  }

  startTest(): void {
    this.log('Starting Bybit V5 WebSocket kline test...');
    this.isRunning = true;
    this.latestData = [];

    // Subscribe to real-time BTCUSDT kline data
    this.subscription = this.bybitService.subscribeToRealtimeKline('BTCUSDT', '1').subscribe({
      next: (data) => {
        this.log(`📊 Kline Data: Close=${data.close}, Volume=${data.volume}`);

        // Add to latest data (keep only last 10)
        this.latestData.unshift(data);
        if (this.latestData.length > 10) {
          this.latestData = this.latestData.slice(0, 10);
        }
      },
      error: (error) => {
        this.log(`❌ Error: ${error.message || error}`);
      }
    });

    this.activeSubscriptions = this.bybitService.getActiveSubscriptions();
  }

  startTickerTest(): void {
    this.log('Starting Bybit V5 WebSocket ticker test...');
    this.isRunning = true;
    this.latestData = [];

    // Subscribe to real-time BTCUSDT ticker data
    this.subscription = this.bybitService.subscribeToRealtimeTicker('BTCUSDT').subscribe({
      next: (data) => {
        this.log(`📈 Ticker Data: Price=${data.lastPrice}, Change=${data.price24hPcnt}%`);

        // Convert ticker data to display format
        const displayData = {
          time: new Date(data.timestamp).toISOString(),
          open: data.prevPrice24h,
          high: data.highPrice24h,
          low: data.lowPrice24h,
          close: data.lastPrice
        };

        // Add to latest data (keep only last 10)
        this.latestData.unshift(displayData);
        if (this.latestData.length > 10) {
          this.latestData = this.latestData.slice(0, 10);
        }
      },
      error: (error) => {
        this.log(`❌ Error: ${error.message || error}`);
      }
    });

    this.activeSubscriptions = this.bybitService.getActiveSubscriptions();
  }

  stopTest(): void {
    this.log('Stopping WebSocket test...');
    this.isRunning = false;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Unsubscribe from both kline and ticker
    this.bybitService.unsubscribeFromRealtimeKline('BTCUSDT', '1');
    this.bybitService.unsubscribeFromRealtimeTicker('BTCUSDT');
    this.activeSubscriptions = this.bybitService.getActiveSubscriptions();
  }

  formatTime(time: string | number): string {
    const timestamp = typeof time === 'number' ? time * 1000 : new Date(time).getTime();
    return new Date(timestamp).toLocaleTimeString();
  }

  private log(message: string): void {
    this.logs.unshift({
      time: new Date().toLocaleTimeString(),
      message
    });

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }

    console.log(`WebSocket Test: ${message}`);
  }
}