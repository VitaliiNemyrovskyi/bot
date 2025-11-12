import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FundingRateSpreadChartComponent } from '../funding-rate-spread-chart/funding-rate-spread-chart.component';

interface ArbitrageOpportunity {
  symbol: string;
  spread: number;
  spreadPercentage: number;
  bestLongExchange: string;
  bestShortExchange: string;
  longFundingRate: number;
  shortFundingRate: number;
  currentPrice?: number;
  volume24h?: number;
  marketCap?: number;
  metrics?: {
    historicalStability?: number;
    avgSpread7d?: number;
    avgSpread30d?: number;
    spreadVolatility?: number;
    trendDirection?: 'stable' | 'increasing' | 'decreasing';
  };
}

@Component({
  selector: 'app-funding-spread-details',
  standalone: true,
  imports: [CommonModule, FundingRateSpreadChartComponent],
  templateUrl: './funding-spread-details.component.html',
  styleUrls: ['./funding-spread-details.component.scss']
})
export class FundingSpreadDetailsComponent {
  @Input({ required: true }) opportunity!: ArbitrageOpportunity;
  @Input() authToken?: string;

  // Computed signals for metrics
  stabilityScore = computed(() => {
    const stability = this.opportunity?.metrics?.historicalStability ?? 0;
    return Math.round(stability * 100);
  });

  stabilityRating = computed(() => {
    const score = this.stabilityScore();
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'low';
  });

  spreadQuality = computed(() => {
    const spread = this.opportunity?.spreadPercentage ?? 0;
    if (spread >= 0.15) return 'excellent';
    if (spread >= 0.10) return 'good';
    if (spread >= 0.05) return 'moderate';
    return 'low';
  });

  volatilityRating = computed(() => {
    const volatility = this.opportunity?.metrics?.spreadVolatility ?? 0;
    if (volatility < 0.02) return 'excellent';
    if (volatility < 0.05) return 'good';
    if (volatility < 0.10) return 'moderate';
    return 'high';
  });

  trendDirection = computed(() => {
    return this.opportunity?.metrics?.trendDirection ?? 'stable';
  });

  avg7d = computed(() => {
    return this.opportunity?.metrics?.avgSpread7d ?? 0;
  });

  avg30d = computed(() => {
    return this.opportunity?.metrics?.avgSpread30d ?? 0;
  });
}
