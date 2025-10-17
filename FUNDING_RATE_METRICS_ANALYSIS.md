# Funding Rate Arbitrage Metrics - Feasibility Analysis

## Executive Summary

This document analyzes the feasibility of adding advanced metrics to the funding rate arbitrage dashboard. The analysis covers **API availability**, **implementation difficulty**, and **recommended prioritization** for each metric.

---

## Current Data Available (Already Fetched)

### Bybit
- ✅ `fundingRate` - Current funding rate
- ✅ `nextFundingTime` - Next funding payment timestamp
- ✅ `lastPrice` - Current price
- ✅ `openInterest` - Open interest (size)
- ✅ `openInterestValue` - Open interest in USD
- ✅ `volume24h` - 24h trading volume
- ✅ `turnover24h` - 24h trading turnover in USD
- ✅ `highPrice24h`, `lowPrice24h` - 24h price range
- ✅ `price24hPcnt` - 24h price change percentage

### BingX
- ✅ `fundingRate` - Current funding rate
- ✅ `fundingTime` - Next funding payment timestamp
- ✅ `lastPrice` - Current price
- ✅ `volume` - Volume
- ✅ `quoteVolume` - Quote volume
- ✅ `highPrice`, `lowPrice` - 24h price range
- ❌ `openInterest` - NOT available in ticker endpoint

### MEXC
- ✅ `fundingRate` - Current funding rate
- ✅ `nextSettleTime` - Next funding payment timestamp
- ✅ `lastPrice` - Current price
- ✅ `volume24` - 24h volume
- ✅ `amount24` - 24h amount
- ✅ `holdVol` - Open interest (holdings volume)
- ✅ `high24Price`, `lower24Price` - 24h price range
- ✅ `fairPrice`, `indexPrice` - Mark price and index price

---

## PRIORITY METRICS ANALYSIS

### 1. ⏱️ TIME TO FUNDING
**Feasibility:** ✅ YES - **EASY**
**API Required:** None (calculation only)
**Difficulty:** 🟢 Easy (Frontend calculation)

**Implementation:**
```typescript
// Formula
const timeToFunding = nextFundingTime - Date.now();
const hours = Math.floor(timeToFunding / (1000 * 60 * 60));
const minutes = Math.floor((timeToFunding % (1000 * 60 * 60)) / (1000 * 60));
const formatted = `${hours}h ${minutes}m`;
```

**Data Source:**
- Bybit: `nextFundingTime` (already available)
- BingX: `fundingTime` (already available)
- MEXC: `nextSettleTime` (already available)

**Recommendation:** ✅ **Implement immediately** - No API changes needed, pure frontend calculation.

---

### 2. 📊 FUNDING HISTORY (24h) - AVG/MIN/MAX
**Feasibility:** ⚠️ PARTIAL - **HARD**
**API Required:** Historical funding rate endpoint + backend storage
**Difficulty:** 🔴 Hard (Requires backend implementation)

**API Availability:**

#### Bybit
✅ **Available**: `/v5/market/history-fund-rate`
- Returns historical funding rates with timestamps
- Funding settles every 8 hours (00:00, 08:00, 16:00 UTC)
- Need to fetch last 3 records for 24h average

#### BingX
❌ **Unknown** - Need to investigate if historical funding endpoint exists
- Current docs don't show historical funding rate endpoint
- May need to store rates over time in backend database

#### MEXC
✅ **Available**: `/api/v1/contract/funding_rate/history`
- Returns paginated historical funding rates
- Can fetch last 24h of data

**Implementation Requirements:**
1. **Backend Storage** (PostgreSQL recommended):
   - Table: `funding_rate_history`
   - Columns: `symbol`, `exchange`, `funding_rate`, `timestamp`
   - Cron job: Store rates every 8 hours

2. **Backend Endpoint**: `/api/funding-rates/historical-stats`
   ```typescript
   {
     symbol: "BTC-USDT",
     exchange: "BYBIT",
     period: "24h",
     avg: 0.0125,
     min: 0.008,
     max: 0.018
   }
   ```

3. **Alternative (No Storage)**: Fetch on-demand
   - Call Bybit/MEXC historical endpoints
   - Calculate stats in real-time
   - ⚠️ Slower, rate-limited, no BingX support

**Recommendation:** ⏸️ **Phase 2** - Requires database setup and cron jobs.

---

### 3. 💰 ESTIMATED APR
**Feasibility:** ✅ YES - **EASY**
**API Required:** None (calculation only)
**Difficulty:** 🟢 Easy (Frontend calculation)

**Formula:**
```typescript
// APR = fundingSpread × fundingsPerDay × 365
const fundingsPerDay = 3; // Most exchanges: 8-hour intervals
const apr = Math.abs(fundingSpread) * fundingsPerDay * 365;

// Example:
// fundingSpread = 0.15% = 0.0015
// APR = 0.0015 × 3 × 365 = 164.25%
```

**Considerations:**
- **Bybit**: 3 funding intervals per day (8 hours)
- **BingX**: 3 funding intervals per day (8 hours)
- **MEXC**: 3 funding intervals per day (8 hours)
- Some pairs may have different intervals (check `fundingIntervalHour` on Bybit)

**Implementation:**
```typescript
// In arbitrage calculation
const fundingSpread = Math.abs(bestLongRate - bestShortRate);
const fundingsPerDay = 3; // or get from exchange data
const estimatedAPR = fundingSpread * fundingsPerDay * 365 * 100; // as percentage
```

**Recommendation:** ✅ **Implement immediately** - Simple calculation, high value.

---

### 4. 💵 FEES TOTAL
**Feasibility:** ⚠️ PARTIAL - **MEDIUM**
**API Required:** Fee rate endpoint (already available for Bybit)
**Difficulty:** 🟡 Medium (Need fee data from APIs)

**Fee Structure (Typical):**

#### Bybit
✅ **Available**: `/v5/account/fee-rate` (authenticated)
- Standard: Maker 0.02%, Taker 0.055%
- VIP tiers: Lower fees

#### BingX
⚠️ **Available** but requires documentation lookup
- Standard: Maker 0.02%, Taker 0.05%
- Website shows fee schedule: https://bingx.com/en/support/articles/11263240298255

#### MEXC
⚠️ **Available** but requires documentation lookup
- Standard: Maker 0.00%, Taker 0.03%
- Website shows fee schedule

**Implementation:**

**Option 1: Hardcoded Fees** (Quick)
```typescript
const EXCHANGE_FEES = {
  BYBIT: { maker: 0.0002, taker: 0.00055 },
  BINGX: { maker: 0.0002, taker: 0.0005 },
  MEXC: { maker: 0, taker: 0.0003 }
};

// Calculate total fees for arbitrage
const totalFees = (
  EXCHANGE_FEES[longExchange].taker + // Entry on long side
  EXCHANGE_FEES[shortExchange].taker + // Entry on short side
  EXCHANGE_FEES[longExchange].taker + // Exit on long side
  EXCHANGE_FEES[shortExchange].taker // Exit on short side
);
```

**Option 2: Dynamic Fees** (Better but complex)
- Create backend endpoint: `/api/exchange-fees/:exchange/:symbol`
- Fetch user-specific fee rates from authenticated endpoints
- Cache in database with daily refresh

**Display:**
```typescript
// Example output
feesTotal: "0.22%" // (0.055% × 4 trades for Bybit taker)
netAPR: 164.03% // (APR - fees)
```

**Recommendation:**
- ✅ **Phase 1**: Hardcoded standard fees
- ⏸️ **Phase 2**: Dynamic fee fetching

---

## VERY USEFUL METRICS

### 5. 📈 OPEN INTEREST
**Feasibility:** ⚠️ PARTIAL - **MEDIUM**
**API Required:** Already available (partially)
**Difficulty:** 🟡 Medium (Need to add for BingX)

**Current Status:**

#### Bybit
✅ **Already Available**
- `openInterest` - Position size
- `openInterestValue` - USD value
- Source: Ticker endpoint (`/v5/market/tickers`)

#### BingX
❌ **NOT Available in Ticker**
- Need to investigate if separate endpoint exists
- May require `/openApi/swap/v2/quote/openInterest` endpoint

#### MEXC
✅ **Already Available**
- `holdVol` - Open interest (holdings volume)
- Source: Ticker endpoint (`/api/v1/contract/ticker`)

**Implementation:**
1. **Bybit & MEXC**: Already fetched, just display
2. **BingX**: Need to add endpoint or mark as "N/A"

**Display Format:**
```
Open Interest: 1,234,567 BTC ($45.2M)
```

**Recommendation:** ✅ **Phase 1** - Bybit/MEXC already available, add BingX later.

---

### 6. 📊 24h VOLUME
**Feasibility:** ✅ YES - **EASY**
**API Required:** Already available
**Difficulty:** 🟢 Easy (Already fetched)

**Current Status:**

#### Bybit
✅ **Already Available**
- `volume24h` - 24h volume in coins
- `turnover24h` - 24h volume in USD

#### BingX
✅ **Already Available**
- `volume` - Volume
- `quoteVolume` - Quote volume (USD)

#### MEXC
✅ **Already Available**
- `volume24` - 24h volume
- `amount24` - 24h amount (USD)

**Implementation:**
```typescript
// Just display the existing data
<td>{{ formatVolume(exchange.volume24h) }}</td>
```

**Recommendation:** ✅ **Implement immediately** - Data already fetched.

---

### 7. 💧 LIQUIDITY DEPTH (±2% from price)
**Feasibility:** ❌ NO - **VERY HARD**
**API Required:** Order book endpoint (requires multiple API calls)
**Difficulty:** 🔴 Very Hard (Performance issues)

**API Availability:**

#### Bybit
✅ **Available**: `/v5/market/orderbook`
- Returns order book with bids/asks
- ⚠️ Requires separate API call per symbol
- ⚠️ Heavy data, rate-limited

#### BingX
✅ **Available**: `/openApi/swap/v2/quote/depth`
- Returns order book
- ⚠️ Requires separate API call per symbol

#### MEXC
✅ **Available**: `/api/v1/contract/depth/:symbol`
- Returns order book
- ⚠️ Requires separate API call per symbol

**Challenges:**
1. **Performance**: Need to fetch order book for 50-100+ symbols
2. **Rate Limiting**: Will hit rate limits quickly
3. **Calculation**: Need to sum bid/ask volumes within ±2% price range
4. **Frontend Load**: Large data transfer, slow rendering

**Implementation (If Attempted):**
```typescript
// Backend endpoint: /api/liquidity-depth/:exchange/:symbol
async function calculateLiquidityDepth(symbol, exchange) {
  const orderBook = await fetchOrderBook(exchange, symbol);
  const currentPrice = orderBook.lastPrice;
  const upperBound = currentPrice * 1.02;
  const lowerBound = currentPrice * 0.98;

  const bidLiquidity = orderBook.bids
    .filter(([price]) => price >= lowerBound)
    .reduce((sum, [price, qty]) => sum + (price * qty), 0);

  const askLiquidity = orderBook.asks
    .filter(([price]) => price <= upperBound)
    .reduce((sum, [price, qty]) => sum + (price * qty), 0);

  return bidLiquidity + askLiquidity;
}
```

**Recommendation:** ❌ **NOT RECOMMENDED** - Too slow, rate-limited, complex.

---

### 8. ⚖️ LONG/SHORT RATIO
**Feasibility:** ❌ NO - **NOT AVAILABLE**
**API Required:** Position ratio endpoint (not publicly available)
**Difficulty:** 🔴 Very Hard (May not exist)

**API Availability:**

#### Bybit
❌ **NOT Available** via public API
- Long/short ratio shown on website but not in API docs
- May require special access or aggregate position data

#### BingX
❌ **NOT Available**
- Not found in API documentation

#### MEXC
❌ **NOT Available**
- Not found in API documentation

**Alternative Data Sources:**
- **CoinGlass.com** - Third-party aggregator (https://www.coinglass.com/)
  - Provides long/short ratio for major exchanges
  - ⚠️ Requires separate API key/subscription
  - ⚠️ Not real-time, may have delays

**Recommendation:** ❌ **NOT FEASIBLE** - Use third-party data if critical.

---

## ADDITIONAL METRICS

### 9. 🔗 PRICE CORRELATION (1h)
**Feasibility:** ⚠️ PARTIAL - **HARD**
**API Required:** Historical price data (Kline/candlestick)
**Difficulty:** 🔴 Hard (Requires statistical calculations)

**API Availability:**

#### Bybit
✅ **Available**: `/v5/market/kline`
- Returns candlestick data
- Intervals: 1m, 3m, 5m, 15m, 30m, 1h, 4h, 1d

#### BingX
✅ **Available**: `/openApi/swap/v2/quote/klines`
- Returns candlestick data

#### MEXC
✅ **Available**: `/api/v1/contract/kline/:symbol`
- Returns candlestick data

**Implementation:**
```typescript
// Fetch 1h candlestick data for both exchanges
const bybitPrices = await fetchKline('BYBIT', symbol, '1h', 60);
const bingxPrices = await fetchKline('BINGX', symbol, '1h', 60);

// Calculate Pearson correlation coefficient
function correlation(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b);
  const sumY = y.reduce((a, b) => a + b);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  return (n * sumXY - sumX * sumY) /
         Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
}

const corr = correlation(bybitPrices, bingxPrices);
// Result: 0.95 = 95% correlation
```

**Recommendation:** ⏸️ **Phase 3** - Nice to have, but not critical.

---

### 10. 📉 VOLATILITY (24h)
**Feasibility:** ⚠️ PARTIAL - **MEDIUM**
**API Required:** Price data (already available) or historical candlesticks
**Difficulty:** 🟡 Medium (Calculation complexity)

**Two Approaches:**

**Option 1: Simple (from existing data)**
```typescript
// Use existing 24h high/low
const volatility = ((high24h - low24h) / low24h) * 100;
// Example: 3.2% daily volatility
```

**Option 2: Standard Deviation (better but requires historical data)**
```typescript
// Fetch 24h of 1-minute candlesticks
const prices = await fetch24hPrices(symbol, exchange);
const mean = prices.reduce((a, b) => a + b) / prices.length;
const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
const stdDev = Math.sqrt(variance);
const volatility = (stdDev / mean) * 100;
```

**Recommendation:**
- ✅ **Phase 1**: Simple high/low range
- ⏸️ **Phase 2**: Standard deviation with historical data

---

### 11. 📊 HISTORICAL SPREAD STABILITY (7d/30d)
**Feasibility:** ❌ NO - **VERY HARD**
**API Required:** Backend database with historical spread data
**Difficulty:** 🔴 Very Hard (Requires long-term data collection)

**Requirements:**
1. **Database**: Store funding spreads over time
2. **Data Collection**: Cron job running every hour/day
3. **Statistical Analysis**: Calculate standard deviation of spreads

**Implementation:**
```sql
-- Database schema
CREATE TABLE funding_spreads (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(50),
  spread DECIMAL(10, 8),
  timestamp TIMESTAMP
);

-- Query for 7-day stability
SELECT
  symbol,
  STDDEV(spread) as spread_volatility,
  AVG(spread) as avg_spread
FROM funding_spreads
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY symbol;
```

**Recommendation:** ⏸️ **Phase 3** - Start collecting data now for future use.

---

### 12. 💸 NET PROFIT (after fees)
**Feasibility:** ✅ YES - **EASY**
**API Required:** None (calculation from existing data)
**Difficulty:** 🟢 Easy (Frontend calculation)

**Formula:**
```typescript
// Components
const fundingSpread = bestLongRate - bestShortRate;
const totalFees = 0.0022; // 0.22% (4 trades × 0.055%)
const fundingsPerDay = 3;
const daysPerYear = 365;

// Calculations
const grossAPR = fundingSpread * fundingsPerDay * daysPerYear;
const feeAPR = totalFees * fundingsPerDay * daysPerYear; // Annualized fees
const netAPR = grossAPR - feeAPR;

// Example:
// fundingSpread = 0.0015 (0.15%)
// grossAPR = 0.0015 × 3 × 365 = 164.25%
// feeAPR = 0.0022 × 3 × 365 = 240.9%
// netAPR = 164.25% - 240.9% = -76.65% ❌ (not profitable)

// Better example with larger spread:
// fundingSpread = 0.005 (0.5%)
// grossAPR = 0.005 × 3 × 365 = 547.5%
// feeAPR = 0.0022 × 3 × 365 = 240.9%
// netAPR = 547.5% - 240.9% = 306.6% ✅ (profitable)
```

**Display:**
```
Estimated APR: 547.5%
Total Fees: 240.9%
Net APR: 306.6% ✅
```

**Recommendation:** ✅ **Implement immediately** - Critical for decision-making.

---

## IMPLEMENTATION ROADMAP

### ✅ Phase 1: Quick Wins (1-2 days)
**No backend changes, pure frontend calculations**

1. ⏱️ **Time to Funding** - Format: "2h 15m"
2. 💰 **Estimated APR** - Formula: `spread × 3 × 365`
3. 💵 **Fees Total** - Hardcoded exchange fees
4. 💸 **Net APR** - APR minus fees
5. 📊 **24h Volume** - Display existing data
6. 📈 **Open Interest** - Display Bybit/MEXC (mark BingX as N/A)
7. 📉 **Volatility (Simple)** - Use high/low range

**Estimated Effort:** 8-12 hours
**Value:** High - Immediate improvement to decision-making

---

### ⏸️ Phase 2: Backend Enhancements (1-2 weeks)
**Requires backend endpoints and API integrations**

1. 📊 **Funding History (24h)** - Backend storage + historical API calls
   - Create database table for funding history
   - Cron job to store rates every 8 hours
   - API endpoint: `/api/funding-rates/historical-stats`
   - Display: "AVG: -1.5% | MIN: -2.1% | MAX: -0.8%"

2. 💵 **Dynamic Fees** - User-specific fee rates
   - Fetch from authenticated endpoints
   - Cache in database

3. 📈 **BingX Open Interest** - Add missing data
   - Research BingX open interest endpoint
   - Integrate if available

**Estimated Effort:** 40-80 hours
**Value:** Medium-High - Better insights and personalization

---

### ⏸️ Phase 3: Advanced Analytics (Future)
**Nice to have, not critical**

1. 🔗 **Price Correlation** - Statistical analysis
2. 📉 **Volatility (Advanced)** - Standard deviation
3. 📊 **Spread Stability** - Historical analysis

**Estimated Effort:** 60-100 hours
**Value:** Medium - Enhanced analytics for power users

---

### ❌ NOT RECOMMENDED
**Too complex, not worth the effort, or not available**

1. 💧 **Liquidity Depth** - Too slow, rate-limited
2. ⚖️ **Long/Short Ratio** - Not available via public APIs

---

## RECOMMENDED UI/UX LAYOUT

### Table View (Compact)
```
| Symbol | Exchanges | Spread | APR  | Net APR | Fees  | Volume 24h | OI     | Next Funding | Actions |
|--------|-----------|--------|------|---------|-------|------------|--------|--------------|---------|
| BTC    | BY+BX     | 0.25%  | 273% | 32%     | 0.24% | $2.3B      | 45K BTC| 2h 15m      | [Chart] |
```

### Expanded Row (Detailed)
```
┌──────────────────────────────────────────────────────────────────────┐
│ BTC-USDT Arbitrage Opportunity                                       │
├──────────────────────────────────────────────────────────────────────┤
│ Funding Metrics:                                                     │
│ • Current Spread: 0.25% (Bybit -0.10% / BingX +0.15%)              │
│ • 24h History: AVG: 0.22% | MIN: 0.15% | MAX: 0.30%                │
│ • Estimated APR: 273.75% (0.25% × 3 × 365)                          │
│ • Total Fees: 0.24% per cycle (0.96% daily)                         │
│ • Net APR: 32.85% ✅                                                 │
│                                                                       │
│ Market Metrics:                                                      │
│ • 24h Volume: $2.3B (Bybit: $1.8B, BingX: $500M)                   │
│ • Open Interest: 45,234 BTC = $1.95B (Bybit: 40K, BingX: 5K)      │
│ • 24h Volatility: 3.2%                                              │
│                                                                       │
│ Next Funding: 2h 15m (16:00 UTC)                                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Filters & Settings
```
┌─ Filters ──────────────────────────────────────────────┐
│ Min APR: [ 50%  ] Max Fees: [ 1%   ]                 │
│ Min Volume: [ $100M ] Min OI: [ $10M ]               │
│ Next Funding < [ 4h ] Show History: [✓]              │
└────────────────────────────────────────────────────────┘
```

---

## EXACT FORMULAS & CALCULATIONS

### Time to Funding
```typescript
const timeToFunding = nextFundingTime - Date.now();
const hours = Math.floor(timeToFunding / 3600000);
const minutes = Math.floor((timeToFunding % 3600000) / 60000);
return `${hours}h ${minutes}m`;
```

### Estimated APR
```typescript
const fundingSpread = Math.abs(bestLongRate - bestShortRate);
const fundingsPerDay = 3; // 8-hour intervals
const daysPerYear = 365;
const estimatedAPR = fundingSpread * fundingsPerDay * daysPerYear * 100;
```

### Total Fees (Standard Rates)
```typescript
const FEES = {
  BYBIT: 0.055, // 0.055% taker
  BINGX: 0.05,  // 0.05% taker
  MEXC: 0.03    // 0.03% taker
};

// 4 trades total (2 entries + 2 exits)
const totalFees = (
  FEES[longExchange] + // Entry long
  FEES[shortExchange] + // Entry short
  FEES[longExchange] + // Exit long
  FEES[shortExchange] // Exit short
) / 100; // Convert to decimal

// Example: Bybit-BingX arbitrage
// totalFees = (0.055 + 0.05 + 0.055 + 0.05) / 100 = 0.0021 = 0.21%
```

### Net APR
```typescript
const grossAPR = estimatedAPR;
const feeAPR = totalFees * fundingsPerDay * daysPerYear * 100;
const netAPR = grossAPR - feeAPR;

// Profitability check
const isProfitable = netAPR > 0;
```

### 24h Funding History (when available)
```typescript
// Fetch from backend: /api/funding-rates/historical-stats?symbol=BTC-USDT&exchange=BYBIT
const stats = {
  avg: rates.reduce((a, b) => a + b) / rates.length,
  min: Math.min(...rates),
  max: Math.max(...rates)
};
```

### Volatility (Simple)
```typescript
const volatility = ((high24h - low24h) / low24h) * 100;
// Example: (45000 - 43500) / 43500 = 3.45%
```

---

## TYPICAL FEE STRUCTURES

### Bybit
- **Standard Account**:
  - Maker: 0.02%
  - Taker: 0.055%
- **VIP 1**: Maker -0.01%, Taker 0.05%
- **VIP 2+**: Lower fees (check tier)

### BingX
- **Standard Account**:
  - Maker: 0.02%
  - Taker: 0.05%
- **VIP**: Lower fees based on volume

### MEXC
- **Standard Account**:
  - Maker: 0.00%
  - Taker: 0.03%
- **VIP**: Lower taker fees

---

## CACHING STRATEGIES

### Frontend
```typescript
// Cache expensive calculations for 30 seconds
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

function getCachedAPR(symbol, fundingSpread) {
  const key = `apr_${symbol}_${fundingSpread}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  const apr = calculateAPR(fundingSpread);
  cache.set(key, { value: apr, timestamp: Date.now() });
  return apr;
}
```

### Backend
```typescript
// Cache historical stats for 1 hour
const HISTORICAL_CACHE_TTL = 3600000; // 1 hour

// Cache fees for 24 hours
const FEES_CACHE_TTL = 86400000; // 24 hours
```

---

## SAMPLE CODE SNIPPETS

### Angular Component (Frontend)
```typescript
// funding-rates.component.ts

// Add new computed signals
timeToFunding = computed(() => {
  const opp = this.selectedOpportunity();
  if (!opp) return null;

  const time = opp.exchanges[0].nextFundingTime - Date.now();
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
});

estimatedAPR = computed(() => {
  const opp = this.selectedOpportunity();
  if (!opp || !opp.fundingSpread) return null;

  const spread = parseFloat(opp.fundingSpread);
  const apr = spread * 3 * 365 * 100;
  return apr.toFixed(2) + '%';
});

totalFees = computed(() => {
  const opp = this.selectedOpportunity();
  if (!opp) return null;

  const longFee = this.FEES[opp.bestLong.exchange];
  const shortFee = this.FEES[opp.bestShort.exchange];
  const total = (longFee + shortFee) * 2; // 2 trades each side
  return total.toFixed(4) + '%';
});

netAPR = computed(() => {
  const apr = parseFloat(this.estimatedAPR() || '0');
  const fees = parseFloat(this.totalFees() || '0');
  const feeAPR = fees * 3 * 365;
  const net = apr - feeAPR;
  return net.toFixed(2) + '%';
});

// Fee structure (hardcoded for Phase 1)
FEES = {
  BYBIT: 0.055,
  BINGX: 0.05,
  MEXC: 0.03
};
```

### HTML Template
```html
<!-- Arbitrage table with new columns -->
<table>
  <thead>
    <tr>
      <th>Symbol</th>
      <th>Spread</th>
      <th>Est. APR</th>
      <th>Fees</th>
      <th>Net APR</th>
      <th>Volume 24h</th>
      <th>OI</th>
      <th>Next Funding</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let opp of filteredArbitrageOpportunities()">
      <td>{{ opp.symbol }}</td>
      <td>{{ (parseFloat(opp.fundingSpread) * 100).toFixed(3) }}%</td>
      <td>{{ calculateAPR(opp) }}</td>
      <td>{{ calculateFees(opp) }}</td>
      <td [class.positive]="calculateNetAPR(opp) > 0">
        {{ calculateNetAPR(opp) }}
      </td>
      <td>{{ formatVolume(opp.exchanges[0].volume24h) }}</td>
      <td>{{ formatOI(opp.exchanges[0].openInterest) }}</td>
      <td>{{ formatTimeToFunding(opp.exchanges[0].nextFundingTime) }}</td>
      <td>
        <button (click)="viewChart(opp)">Chart</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Backend Endpoint (Phase 2)
```typescript
// /api/funding-rates/historical-stats/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const exchange = searchParams.get('exchange');
  const period = searchParams.get('period') || '24h';

  // Query database for historical rates
  const rates = await prisma.fundingRateHistory.findMany({
    where: {
      symbol,
      exchange,
      timestamp: {
        gte: new Date(Date.now() - parsePeriod(period))
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  // Calculate statistics
  const fundingRates = rates.map(r => parseFloat(r.fundingRate));
  const stats = {
    avg: average(fundingRates),
    min: Math.min(...fundingRates),
    max: Math.max(...fundingRates),
    count: fundingRates.length
  };

  return NextResponse.json({ success: true, data: stats });
}
```

---

## CONCLUSION

### ✅ Implement Immediately (Phase 1)
1. Time to Funding
2. Estimated APR
3. Total Fees (hardcoded)
4. Net APR
5. 24h Volume
6. Open Interest (Bybit/MEXC)
7. Simple Volatility

**Total Effort:** 8-12 hours
**Value:** High

### ⏸️ Consider Later (Phase 2)
1. Funding History (24h) - Requires backend
2. Dynamic Fees
3. BingX Open Interest

**Total Effort:** 40-80 hours
**Value:** Medium-High

### ❌ Not Recommended
1. Liquidity Depth (too slow)
2. Long/Short Ratio (not available)
3. Price Correlation (complex, low value)

---

## NEXT STEPS

1. **Review this analysis** with stakeholders
2. **Prioritize metrics** based on user needs
3. **Start Phase 1** implementation (quick wins)
4. **Plan database schema** for Phase 2 (historical data)
5. **Set up cron jobs** to start collecting historical funding rates

**Estimated Timeline:**
- Phase 1: 1-2 days
- Phase 2: 1-2 weeks
- Phase 3: Future (optional)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-17
**Author:** Claude Code Assistant
