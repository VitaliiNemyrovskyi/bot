import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingChartComponent } from '../trading-chart/trading-chart.component';
import { RealtimeService } from '../../services/realtime.service';
import { ChartService } from '../../services/chart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, TradingChartComponent],
  template: `
    <div class="chart-demo-container">
      <div class="demo-header">
        <h2>📈 TradingView Chart with Bybit Integration</h2>
        <p>Real-time cryptocurrency charts powered by Bybit API</p>
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>BTCUSDT Chart</h3>
          <div class="chart-controls">
            <button (click)="refreshChart()" class="refresh-btn">🔄 Refresh</button>
          </div>
        </div>

        <app-trading-chart
          [initialSymbol]="'BTCUSDT'"
          [initialResolution]="'60'"
          (symbolChange)="onSymbolChange($event)">
        </app-trading-chart>
      </div>

      <!-- API Status -->
      <div class="api-status">
        <h4>API Status</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Backend Connection:</span>
            <span class="status-value connected">Connected</span>
          </div>
          <div class="status-item">
            <span class="status-label">Bybit API:</span>
            <span class="status-value connected">Active</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-demo-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .demo-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .demo-header p {
      color: #666;
      font-size: 16px;
    }

    .chart-section {
      margin-bottom: 30px;
      height: 600px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .chart-controls {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .refresh-btn {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .refresh-btn:hover {
      background: #0056b3;
    }

    .api-status {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .api-status h4 {
      margin-bottom: 15px;
      color: #333;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-weight: 500;
    }

    .status-value {
      font-weight: bold;
    }

    .status-value.connected {
      color: #28a745;
    }

    .status-value.disconnected {
      color: #dc3545;
    }
  `]
})
export class ChartDemoComponent implements OnInit, OnDestroy {
  selectedSymbol = 'BTCUSDT';

  private subscriptions: Subscription[] = [];

  constructor(
    private realtimeService: RealtimeService
  ) {}

  ngOnInit() {
    console.log('Chart demo component initialized');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.realtimeService.closeAllConnections();
  }

  onSymbolChange(symbol: string) {
    this.selectedSymbol = symbol;
    console.log('Symbol changed to:', symbol);
  }

  refreshChart() {
    console.log('Refreshing chart...');
  }
}