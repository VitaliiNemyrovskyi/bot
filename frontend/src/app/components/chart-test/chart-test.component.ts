import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightweightChartComponent, GridConfig } from '../lightweight-chart/lightweight-chart.component';

@Component({
  selector: 'app-chart-test',
  standalone: true,
  imports: [CommonModule, LightweightChartComponent],
  template: `
    <div class="chart-test-container">
      <h2>Lightweight Chart Test</h2>
      <div class="chart-wrapper">
        <app-lightweight-chart
          symbol="BTCUSDT"
          [gridConfig]="testGridConfig">
        </app-lightweight-chart>
      </div>
    </div>
  `,
  styles: [`
    .chart-test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .chart-wrapper {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    h2 {
      margin-bottom: 20px;
      color: #333;
    }
  `]
})
export class ChartTestComponent {
  testGridConfig: GridConfig = {
    symbol: 'BTCUSDT',
    upperBound: 50000,
    lowerBound: 30000,
    gridCount: 10,
    gridSpacing: 1.0,
    strategyType: 'REGULAR'
  };
}
