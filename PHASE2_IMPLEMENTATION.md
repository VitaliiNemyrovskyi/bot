# Phase 2: Historical Spread Stability Metrics Implementation

**Branch:** `feature/phase2-spread-stability`
**Started:** 2025-10-17
**Status:** 🟡 In Progress (60% complete)

## 📊 Overview

Phase 2 adds historical spread stability analysis to the Funding Rate Arbitrage dashboard. This allows traders to assess how reliably an arbitrage opportunity maintains its spread over time (7-day and 30-day windows).

**Key Features:**
- Statistical analysis of historical funding rate spreads
- Stability scoring (0-100) with qualitative ratings
- Data quality indicators
- Trend detection (improving/stable/declining)
- Lazy-loaded metrics (only when user expands row)

---

## ✅ Completed (60%)

### 1. Statistical Utilities Service ✅
**File:** `/frontend/src/app/services/statistical-utils.service.ts`
- ✅ Created with full TDD approach (200+ test cases)
- ✅ Pure functions for all statistical calculations
- ✅ Comprehensive JSDoc documentation

**Functions:**
- `calculateAverage(values)` - Mean calculation
- `calculateStandardDeviation(values)` - Population std dev
- `calculateStabilityScore(avg, stdDev)` - 0-100 score based on coefficient of variation
- `getStabilityRating(score)` - Qualitative rating (excellent/good/moderate/poor)
- `getDataQuality(sampleSize, expected)` - Data completeness assessment
- `calculateStabilityTrend(score7d, score30d)` - Trend detection
- `calculateConfidenceScore(quality7d, quality30d)` - Confidence 0-1
- `formatPercentage(value, decimals)` - Display formatting

### 2. Frontend Models ✅
**File:** `/frontend/src/app/models/public-funding-rate.model.ts`

Added interfaces:
```typescript
export interface SpreadStabilityMetrics {
  average: number;
  averageFormatted: string;
  standardDeviation: number;
  standardDeviationFormatted: string;
  stabilityScore: number;
  stabilityRating: 'excellent' | 'good' | 'moderate' | 'poor';
  sampleSize: number;
  dataQuality: 'high' | 'medium' | 'low';
  periodDays: 7 | 30;
  startTimestamp?: number;
  endTimestamp?: number;
}
```

Extended `FundingRateOpportunity`:
```typescript
  spreadHistory7d?: SpreadStabilityMetrics;
  spreadHistory30d?: SpreadStabilityMetrics;
  spreadStabilityTrend?: 'improving' | 'stable' | 'declining';
  spreadStabilityConfidence?: number;
```

### 3. Backend API Endpoint ✅
**File:** `/backend/src/app/api/arbitrage/funding-rates/history/route.ts`

**Endpoint:** `GET /api/arbitrage/funding-rates/history`

**Query Params:**
- `symbol` - Trading pair (e.g., BTCUSDT)
- `exchange` - Exchange name (BYBIT, BINGX, MEXC)
- `days` - Period length (7 or 30)

**Response:**
```json
{
  "success": true,
  "data": [
    { "timestamp": 1234567890000, "fundingRate": 0.0001 },
    ...
  ],
  "metadata": {
    "symbol": "BTCUSDT",
    "exchange": "BYBIT",
    "days": 7,
    "count": 21
  }
}
```

**Implementation Status:**
- ✅ Bybit: Fully implemented with `/v5/market/history-fund-rate` API
- ⚠️ BingX: Returns empty array with "in progress" message
- ⚠️ MEXC: Returns empty array with "in progress" message

---

## 🚧 In Progress / TODO (40%)

### 4. Frontend Service Integration 🔨
**File:** `/frontend/src/app/services/public-funding-rates.service.ts`

**TODO:** Add Phase 2 methods

```typescript
import { StatisticalUtilsService } from './statistical-utils.service';

export class PublicFundingRatesService {
  constructor(
    private http: HttpClient,
    private statisticalUtils: StatisticalUtilsService // PHASE2: Add injection
  ) {}

  // PHASE2: Add this method
  /**
   * Load Phase 2 historical stability metrics for an opportunity
   * Fetches 7d and 30d funding rate history and calculates stability metrics
   */
  async loadPhase2Metrics(
    opportunity: FundingRateOpportunity
  ): Promise<FundingRateOpportunity> {
    try {
      const symbol = opportunity.symbol;
      const longExchange = opportunity.bestLong.exchange;
      const shortExchange = opportunity.bestShort.exchange;

      // Fetch historical funding rates for both exchanges (7d and 30d in parallel)
      const [
        longRates7d,
        shortRates7d,
        longRates30d,
        shortRates30d
      ] = await Promise.all([
        this.fetchFundingRateHistory(symbol, longExchange, 7),
        this.fetchFundingRateHistory(symbol, shortExchange, 7),
        this.fetchFundingRateHistory(symbol, longExchange, 30),
        this.fetchFundingRateHistory(symbol, shortExchange, 30)
      ]);

      // Calculate spreads from funding rates
      const spreads7d = this.calculateSpreads(longRates7d, shortRates7d);
      const spreads30d = this.calculateSpreads(longRates30d, shortRates30d);

      // Calculate stability metrics using StatisticalUtilsService
      const metrics7d = this.calculateStabilityMetrics(spreads7d, 7, 168); // 7 days * 24h * 1 sample/h = 168
      const metrics30d = this.calculateStabilityMetrics(spreads30d, 30, 720); // 30 * 24 = 720

      // Calculate trend and confidence
      const trend = this.statisticalUtils.calculateStabilityTrend(
        metrics7d.stabilityScore,
        metrics30d.stabilityScore
      );
      const confidence = this.statisticalUtils.calculateConfidenceScore(
        metrics7d.dataQuality,
        metrics30d.dataQuality
      );

      // Return updated opportunity
      return {
        ...opportunity,
        spreadHistory7d: metrics7d,
        spreadHistory30d: metrics30d,
        spreadStabilityTrend: trend,
        spreadStabilityConfidence: confidence
      };
    } catch (error) {
      console.error('[Phase 2] Failed to load metrics:', error);
      // Return unchanged opportunity on error (graceful degradation)
      return opportunity;
    }
  }

  // PHASE2: Add this helper
  private async fetchFundingRateHistory(
    symbol: string,
    exchange: string,
    days: 7 | 30
  ): Promise<Array<{ timestamp: number; fundingRate: number }>> {
    const url = `${this.baseUrl}/api/arbitrage/funding-rates/history?symbol=${symbol}&exchange=${exchange}&days=${days}`;

    const response = await firstValueFrom(
      this.http.get<{
        success: boolean;
        data: Array<{ timestamp: number; fundingRate: number }>;
      }>(url)
    );

    return response.success ? response.data : [];
  }

  // PHASE2: Add this helper
  private calculateSpreads(
    longRates: Array<{ timestamp: number; fundingRate: number }>,
    shortRates: Array<{ timestamp: number; fundingRate: number }>
  ): number[] {
    // Match timestamps and calculate spreads
    const spreads: number[] = [];

    for (const longRate of longRates) {
      const shortRate = shortRates.find(s => s.timestamp === longRate.timestamp);
      if (shortRate) {
        const spread = Math.abs(shortRate.fundingRate - longRate.fundingRate);
        spreads.push(spread);
      }
    }

    return spreads;
  }

  // PHASE2: Add this helper
  private calculateStabilityMetrics(
    spreads: number[],
    periodDays: 7 | 30,
    expectedSamples: number
  ): SpreadStabilityMetrics {
    const avg = this.statisticalUtils.calculateAverage(spreads);
    const stdDev = this.statisticalUtils.calculateStandardDeviation(spreads);

    if (avg === null || stdDev === null) {
      // No data available
      return {
        average: 0,
        averageFormatted: '0.00%',
        standardDeviation: 0,
        standardDeviationFormatted: '0.00%',
        stabilityScore: 0,
        stabilityRating: 'poor',
        sampleSize: 0,
        dataQuality: 'low',
        periodDays
      };
    }

    const score = this.statisticalUtils.calculateStabilityScore(avg, stdDev);
    const rating = this.statisticalUtils.getStabilityRating(score);
    const quality = this.statisticalUtils.getDataQuality(spreads.length, expectedSamples);

    return {
      average: avg,
      averageFormatted: this.statisticalUtils.formatPercentage(avg, 2),
      standardDeviation: stdDev,
      standardDeviationFormatted: this.statisticalUtils.formatPercentage(stdDev, 2),
      stabilityScore: score,
      stabilityRating: rating,
      sampleSize: spreads.length,
      dataQuality: quality,
      periodDays,
      startTimestamp: spreads.length > 0 ? Date.now() - (periodDays * 24 * 60 * 60 * 1000) : undefined,
      endTimestamp: spreads.length > 0 ? Date.now() : undefined
    };
  }
}
```

**Testing:**
```typescript
// Add to public-funding-rates.service.spec.ts
describe('Phase 2 - Historical Metrics', () => {
  it('should load Phase 2 metrics successfully', async () => {
    // Mock HTTP calls
    // Test metric calculations
    // Verify trend detection
  });

  it('should handle API errors gracefully', async () => {
    // Test error handling
  });
});
```

---

### 5. UI Integration - Expandable Rows 🔨
**Files to modify:**
- `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.ts`
- `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.html`
- `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.scss`

#### Component TypeScript Changes:

```typescript
// PHASE2: Add signals for loading state
loadingPhase2Metrics = signal<Set<string>>(new Set());
phase2MetricsCache = signal<Map<string, FundingRateOpportunity>>(new Map());

// PHASE2: Add method to load metrics on row expansion
async loadPhase2MetricsForSymbol(symbol: string): Promise<void> {
  // Check cache
  if (this.phase2MetricsCache().has(symbol)) {
    return;
  }

  // Find opportunity
  const opp = this.filteredOpportunities().find(o => o.symbol === symbol);
  if (!opp) return;

  // Set loading
  const loading = new Set(this.loadingPhase2Metrics());
  loading.add(symbol);
  this.loadingPhase2Metrics.set(loading);

  try {
    // Load metrics via service
    const updated = await this.publicFundingRatesService.loadPhase2Metrics(opp);

    // Update cache
    const cache = new Map(this.phase2MetricsCache());
    cache.set(symbol, updated);
    this.phase2MetricsCache.set(cache);
  } catch (error) {
    console.error('[Phase 2] Load failed:', error);
  } finally {
    // Clear loading
    const loading = new Set(this.loadingPhase2Metrics());
    loading.delete(symbol);
    this.loadingPhase2Metrics.set(loading);
  }
}

// PHASE2: Modify row expansion to trigger metrics load
toggleExpandRow(symbol: string): void {
  const current = this.expandedRowSymbol();

  if (current === symbol) {
    this.expandedRowSymbol.set(null);
  } else {
    this.expandedRowSymbol.set(symbol);
    // Trigger Phase 2 load
    this.loadPhase2MetricsForSymbol(symbol);
  }
}

// PHASE2: Helper to check loading state
isLoadingPhase2(symbol: string): boolean {
  return this.loadingPhase2Metrics().has(symbol);
}

// PHASE2: Helper to get metrics from cache
getPhase2Metrics(symbol: string): FundingRateOpportunity | undefined {
  return this.phase2MetricsCache().get(symbol);
}
```

#### Component HTML Changes:

Add in expandable row section (after existing subscription content):

```html
<!-- PHASE2: Spread Stability Analysis Section -->
<div class="phase2-stability-section">
  <h4 class="section-title">
    <ui-icon name="analytics" [size]="20"></ui-icon>
    Spread Stability Analysis
  </h4>

  @if (isLoadingPhase2(opp.symbol)) {
    <div class="loading-metrics">
      <ui-icon name="refresh" [size]="24" class="spinning"></ui-icon>
      <span>Loading historical data...</span>
    </div>
  } @else {
    @let metrics = getPhase2Metrics(opp.symbol);
    @if (metrics?.spreadHistory7d || metrics?.spreadHistory30d) {
      <div class="stability-metrics-grid">
        <!-- 7-Day Metrics Card -->
        @if (metrics.spreadHistory7d) {
          <div class="metric-card">
            <h5>7-Day Stability</h5>
            <div class="metric-row">
              <span class="label">Average Spread:</span>
              <span class="value">{{ metrics.spreadHistory7d.averageFormatted }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Std Deviation:</span>
              <span class="value">{{ metrics.spreadHistory7d.standardDeviationFormatted }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Stability Score:</span>
              <span class="value stability-score"
                    [ngClass]="'rating-' + metrics.spreadHistory7d.stabilityRating">
                {{ metrics.spreadHistory7d.stabilityScore }}/100
              </span>
            </div>
            <div class="metric-row">
              <span class="label">Rating:</span>
              <span class="badge" [ngClass]="'badge-' + metrics.spreadHistory7d.stabilityRating">
                {{ metrics.spreadHistory7d.stabilityRating }}
              </span>
            </div>
            <div class="metric-row">
              <span class="label">Data Quality:</span>
              <span class="badge" [ngClass]="'badge-' + metrics.spreadHistory7d.dataQuality">
                {{ metrics.spreadHistory7d.dataQuality }}
              </span>
            </div>
          </div>
        }

        <!-- 30-Day Metrics Card -->
        @if (metrics.spreadHistory30d) {
          <div class="metric-card">
            <h5>30-Day Stability</h5>
            <div class="metric-row">
              <span class="label">Average Spread:</span>
              <span class="value">{{ metrics.spreadHistory30d.averageFormatted }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Std Deviation:</span>
              <span class="value">{{ metrics.spreadHistory30d.standardDeviationFormatted }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Stability Score:</span>
              <span class="value stability-score"
                    [ngClass]="'rating-' + metrics.spreadHistory30d.stabilityRating">
                {{ metrics.spreadHistory30d.stabilityScore }}/100
              </span>
            </div>
            <div class="metric-row">
              <span class="label">Rating:</span>
              <span class="badge" [ngClass]="'badge-' + metrics.spreadHistory30d.stabilityRating">
                {{ metrics.spreadHistory30d.stabilityRating }}
              </span>
            </div>
            <div class="metric-row">
              <span class="label">Data Quality:</span>
              <span class="badge" [ngClass]="'badge-' + metrics.spreadHistory30d.dataQuality">
                {{ metrics.spreadHistory30d.dataQuality }}
              </span>
            </div>
          </div>
        }

        <!-- Trend Card -->
        @if (metrics.spreadStabilityTrend) {
          <div class="metric-card trend-card">
            <h5>Stability Trend</h5>
            <div class="trend-indicator" [ngClass]="'trend-' + metrics.spreadStabilityTrend">
              <ui-icon [name]="getTrendIcon(metrics.spreadStabilityTrend)" [size]="32"></ui-icon>
              <span class="trend-text">{{ metrics.spreadStabilityTrend | titlecase }}</span>
            </div>
            @if (metrics.spreadStabilityConfidence !== undefined) {
              <div class="confidence-bar">
                <span class="label">Confidence:</span>
                <div class="bar-container">
                  <div class="bar-fill"
                       [style.width.%]="metrics.spreadStabilityConfidence * 100"></div>
                </div>
                <span class="value">{{ (metrics.spreadStabilityConfidence * 100).toFixed(0) }}%</span>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="no-data">
        <ui-icon name="info" [size]="24"></ui-icon>
        <p>No historical data available for this pair</p>
      </div>
    }
  }
</div>
```

#### Component SCSS Changes:

```scss
// PHASE2: Add to arbitrage-funding.component.scss
.phase2-stability-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary, #1a1a1a);
  }

  .loading-metrics {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: var(--text-secondary, #666);
  }

  .stability-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .metric-card {
    padding: 1rem;
    background: var(--card-bg, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;

    h5 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      color: var(--text-secondary, #666);
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      .label {
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
      }

      .value {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary, #1a1a1a);

        &.stability-score {
          font-weight: 600;
          font-size: 1rem;

          &.rating-excellent { color: #16a34a; }
          &.rating-good { color: #ca8a04; }
          &.rating-moderate { color: #ea580c; }
          &.rating-poor { color: #dc2626; }
        }
      }

      .badge {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;

        &.badge-excellent { background: #dcfce7; color: #166534; }
        &.badge-good { background: #fef3c7; color: #854d0e; }
        &.badge-moderate { background: #fed7aa; color: #9a3412; }
        &.badge-poor { background: #fee2e2; color: #991b1b; }
        &.badge-high { background: #dbeafe; color: #1e40af; }
        &.badge-medium { background: #fef3c7; color: #854d0e; }
        &.badge-low { background: #fee2e2; color: #991b1b; }
      }
    }
  }

  .trend-card {
    .trend-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;

      &.trend-improving {
        color: #16a34a;
        ui-icon { color: #16a34a; }
      }

      &.trend-stable {
        color: #3b82f6;
        ui-icon { color: #3b82f6; }
      }

      &.trend-declining {
        color: #dc2626;
        ui-icon { color: #dc2626; }
      }

      .trend-text {
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .confidence-bar {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .label {
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
      }

      .bar-container {
        flex: 1;
        height: 8px;
        background: var(--border-color, #e5e7eb);
        border-radius: 4px;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #16a34a);
          transition: width 0.3s ease;
        }
      }

      .value {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-primary, #1a1a1a);
      }
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    color: var(--text-secondary, #666);

    p {
      margin: 0;
      font-size: 0.9rem;
    }
  }
}

// Helper for trend icons
.getTrendIcon(trend: string): string {
  switch (trend) {
    case 'improving': return 'trending_up';
    case 'declining': return 'trending_down';
    default: return 'trending_flat';
  }
}
```

---

### 6. Translations 📝
**File:** `/frontend/src/app/services/translations/funding-rates-translations.ts`

Add after line 261 (in each language section):

**English:**
```typescript
'fundingRates.phase2.title': 'Spread Stability Analysis',
'fundingRates.phase2.loading': 'Loading historical data...',
'fundingRates.phase2.7day': '7-Day Stability',
'fundingRates.phase2.30day': '30-Day Stability',
'fundingRates.phase2.avgSpread': 'Average Spread',
'fundingRates.phase2.stdDev': 'Std Deviation',
'fundingRates.phase2.stabilityScore': 'Stability Score',
'fundingRates.phase2.rating': 'Rating',
'fundingRates.phase2.dataQuality': 'Data Quality',
'fundingRates.phase2.trend': 'Stability Trend',
'fundingRates.phase2.confidence': 'Confidence',
'fundingRates.phase2.noData': 'No historical data available',
'fundingRates.stability.excellent': 'Excellent',
'fundingRates.stability.good': 'Good',
'fundingRates.stability.moderate': 'Moderate',
'fundingRates.stability.poor': 'Poor',
'fundingRates.trend.improving': 'Improving',
'fundingRates.trend.stable': 'Stable',
'fundingRates.trend.declining': 'Declining',
```

**Ukrainian:**
```typescript
'fundingRates.phase2.title': 'Аналіз стабільності спреду',
'fundingRates.phase2.loading': 'Завантаження історичних даних...',
'fundingRates.phase2.7day': 'Стабільність 7 днів',
'fundingRates.phase2.30day': 'Стабільність 30 днів',
'fundingRates.phase2.avgSpread': 'Середній спред',
'fundingRates.phase2.stdDev': 'Станд. відхилення',
'fundingRates.phase2.stabilityScore': 'Оцінка стабільності',
'fundingRates.phase2.rating': 'Рейтинг',
'fundingRates.phase2.dataQuality': 'Якість даних',
'fundingRates.phase2.trend': 'Тренд стабільності',
'fundingRates.phase2.confidence': 'Впевненість',
'fundingRates.phase2.noData': 'Історичні дані недоступні',
'fundingRates.stability.excellent': 'Відмінно',
'fundingRates.stability.good': 'Добре',
'fundingRates.stability.moderate': 'Помірно',
'fundingRates.stability.poor': 'Погано',
'fundingRates.trend.improving': 'Покращується',
'fundingRates.trend.stable': 'Стабільно',
'fundingRates.trend.declining': 'Погіршується',
```

**Russian:**
```typescript
'fundingRates.phase2.title': 'Анализ стабильности спреда',
'fundingRates.phase2.loading': 'Загрузка исторических данных...',
'fundingRates.phase2.7day': 'Стабильность 7 дней',
'fundingRates.phase2.30day': 'Стабильность 30 дней',
'fundingRates.phase2.avgSpread': 'Средний спред',
'fundingRates.phase2.stdDev': 'Станд. отклонение',
'fundingRates.phase2.stabilityScore': 'Оценка стабильности',
'fundingRates.phase2.rating': 'Рейтинг',
'fundingRates.phase2.dataQuality': 'Качество данных',
'fundingRates.phase2.trend': 'Тренд стабильности',
'fundingRates.phase2.confidence': 'Уверенность',
'fundingRates.phase2.noData': 'Исторические данные недоступны',
'fundingRates.stability.excellent': 'Отлично',
'fundingRates.stability.good': 'Хорошо',
'fundingRates.stability.moderate': 'Умеренно',
'fundingRates.stability.poor': 'Плохо',
'fundingRates.trend.improving': 'Улучшается',
'fundingRates.trend.stable': 'Стабильно',
'fundingRates.trend.declining': 'Ухудшается',
```

---

## 🧪 Testing

### Backend API Testing

Test Bybit historical endpoint:
```bash
curl "http://localhost:3000/api/arbitrage/funding-rates/history?symbol=BTCUSDT&exchange=BYBIT&days=7"
```

Expected response:
```json
{
  "success": true,
  "data": [
    { "timestamp": 1697500800000, "fundingRate": 0.0001 },
    ...
  ],
  "metadata": {
    "symbol": "BTCUSDT",
    "exchange": "BYBIT",
    "days": 7,
    "count": 21
  }
}
```

### Frontend Integration Testing

1. Navigate to `/arbitrage/funding` page
2. Find a BTCUSDT opportunity (Bybit exchange)
3. Click to expand row
4. Verify "Spread Stability Analysis" section appears
5. Verify loading indicator shows
6. Verify metrics populate after ~2-3 seconds
7. Check 7-day and 30-day cards display correctly
8. Verify trend indicator shows (improving/stable/declining)

---

## 📁 File Checklist

- ✅ `/frontend/src/app/services/statistical-utils.service.ts` - Created
- ✅ `/frontend/src/app/services/statistical-utils.service.spec.ts` - Created
- ✅ `/frontend/src/app/models/public-funding-rate.model.ts` - Updated
- ✅ `/backend/src/app/api/arbitrage/funding-rates/history/route.ts` - Created
- 🔨 `/frontend/src/app/services/public-funding-rates.service.ts` - TODO: Add Phase 2 methods
- 🔨 `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.ts` - TODO: Add signals and methods
- 🔨 `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.html` - TODO: Add Phase 2 UI section
- 🔨 `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.scss` - TODO: Add Phase 2 styles
- 📝 `/frontend/src/app/services/translations/funding-rates-translations.ts` - TODO: Add translations

---

## 🚀 Next Steps to Complete Phase 2

To continue this implementation in a new session, simply say:

```
"Phase 2 continue" або "Продовж Phase 2 імплементацію"
```

I will:
1. Read this `PHASE2_IMPLEMENTATION.md` file
2. Continue from the TODO sections
3. Complete the frontend service integration
4. Add UI components to expandable rows
5. Add translations
6. Test end-to-end functionality
7. Create final commit

---

## 📊 Progress Tracking

- ✅ Research & Planning: 100%
- ✅ Backend API: 100% (Bybit), 0% (BingX/MEXC - planned)
- ✅ Statistical Utils: 100%
- ✅ Frontend Models: 100%
- 🔨 Frontend Service: 0%
- 🔨 UI Integration: 0%
- 📝 Translations: 0%
- 🧪 Testing: 0%

**Overall Progress: 60%**

---

## 💡 Key Design Decisions

1. **Lazy Loading**: Phase 2 metrics only load when user expands row (prevents slow initial page load)
2. **Graceful Degradation**: If API fails, Phase 1 metrics still work
3. **Caching**: Metrics cached per symbol to avoid duplicate API calls
4. **Data Quality Indicators**: Users can see if data is reliable based on sample size
5. **Bybit First**: Start with Bybit (has full historical API), add BingX/MEXC later
6. **Pure Functions**: StatisticalUtilsService uses only pure functions for easy testing
7. **TDD Approach**: Tests written first, implementation second

---

## 🔗 Related Documentation

- [Bybit Historical Funding Rate API](https://bybit-exchange.github.io/docs/v5/market/history-fund-rate)
- [Statistical Formulas Reference](https://en.wikipedia.org/wiki/Coefficient_of_variation)
- Angular Signals: `/frontend/src/app/pages/arbitrage-funding/arbitrage-funding.component.ts`

---

**Last Updated:** 2025-10-17
**Branch:** `feature/phase2-spread-stability`
**Author:** Claude Code (Sonnet 4.5)
