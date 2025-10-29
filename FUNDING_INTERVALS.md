# Funding Intervals - Architecture Documentation

## Critical Understanding

**Funding intervals can vary by SYMBOL and can change over time.**

This means:
- A symbol like BTC/USDT on MEXC might have 8h funding today
- Tomorrow the same symbol might switch to 4h or 1h funding
- Different symbols on the same exchange can have different intervals

## Architecture

### Backend (Source of Truth)

The backend API (`/api/arbitrage/funding-rates`) provides funding data with **two priority levels**:

1. **Primary Source: CCXT API** (line 471-475 in route.ts)
   ```typescript
   if (rate.fundingIntervalFromApi && rate.fundingIntervalFromApi > 0) {
     fundingIntervalHours = rate.fundingIntervalFromApi;
     fundingInterval = `${fundingIntervalHours}h`;
   }
   ```
   - CCXT fetches the interval directly from each exchange's API
   - This is the **real, current interval** for each symbol
   - Always prefer this when available

2. **Fallback: Default Exchange Interval** (line 477-481 in route.ts)
   ```typescript
   else {
     fundingInterval = getDefaultFundingInterval(result.exchange);
     fundingIntervalHours = parseInt(fundingInterval);
   }
   ```
   - Only used when CCXT doesn't provide the interval
   - See `getDefaultFundingInterval()` for default values

### Frontend (Display Only)

The frontend **NEVER calculates funding intervals or nextFundingTime locally**.

#### Data Sources (in priority order):

1. **WebSocket Data** (for real-time updates)
   - BYBIT: Provides `nextFundingTime` in WebSocket ticker ✓
   - OKX: Provides `nextFundingTime` in WebSocket ticker ✓
   - BingX: No funding data in WebSocket → uses fundingRatesMap ✓
   - MEXC: No `nextFundingTime` in WebSocket → uses fundingRatesMap ✓
   - Gate.io: No WebSocket → uses API polling ✓

2. **Backend API** (`/api/arbitrage/funding-rates`)
   - Used for initial data load
   - Used when WebSocket doesn't provide funding data
   - Provides both `nextFundingTime` and `fundingInterval`

3. **fundingRatesMap** (in-memory cache)
   - Stores funding data from backend API
   - Used by exchanges that don't provide funding in WebSocket

## Display Logic

The `formatFundingInfo()` method in `arbitrage-chart.component.ts` (line 1895):
- Takes `nextFundingTime` (timestamp in milliseconds)
- Takes `fundingIntervalStr` (e.g., "8h", "4h", "1h")
- **Only displays the data** - never calculates nextFundingTime

```typescript
formatFundingInfo(rate: string, nextFundingTime: number, fundingIntervalStr?: string): string {
  // Calculate time remaining using simple UTC math
  const now = Date.now();
  const remaining = nextFundingTime - now;

  // Format as HH:MM
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  // Display: "rate / time / interval"
  return `${rateFormatted} / ${timeFormatted} / ${intervalFormatted}`;
}
```

## Common Mistakes to Avoid

### ❌ WRONG: Hardcoding intervals in frontend

```typescript
// NEVER do this:
case 'MEXC':
  // Assume MEXC always has 1h funding
  nextFundingTime = calculateNextHourlyFunding();
```

**Why this is wrong:**
- MEXC (or any exchange) might use 1h, 4h, or 8h depending on the symbol
- The interval can change tomorrow
- You'll show incorrect countdown timers

### ❌ WRONG: Calculating nextFundingTime locally

```typescript
// NEVER do this:
const nextHour = currentHour + 1;
nextFundingTime = Date.UTC(year, month, day, nextHour, 0, 0);
```

**Why this is wrong:**
- You don't know the actual funding schedule
- Exchange might have irregular funding times
- Will cause timezone bugs and incorrect displays

### ✅ CORRECT: Use data from backend/WebSocket

```typescript
// ALWAYS do this:
case 'MEXC':
  price = parseFloat(data.data.lastPrice);
  fundingRate = data.data.fundingRate?.toString();
  // nextFundingTime comes from fundingRatesMap (set by backend API)
```

## Testing Strategy

Tests verify the **display logic** works correctly:
- ✓ Countdown timer shows correct time remaining
- ✓ No timezone offset is added (UTC safety)
- ✓ Works with any interval (1h, 4h, 8h)
- ✓ Handles edge cases (funding in past, midnight rollover)

See:
- `/frontend/src/app/components/trading/arbitrage-chart/funding-time.spec.ts`
- `/frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.spec.ts`

## Exchange-Specific Behavior

### BINANCE
- **Intervals**: Primarily 8h (00:00, 08:00, 16:00 UTC)
- **Variations**: Some symbols may use 4h or other intervals
- CCXT provides interval via API ✓

### BYBIT
- **Intervals**: 1h, 2h, 4h, 8h (varies by symbol!)
- **Distribution** (as of 2025-10-29):
  - 1h (60min): 35 symbols
  - 2h (120min): 14 symbols
  - 4h (240min): 256 symbols ← Most common
  - 8h (480min): 195 symbols
- WebSocket provides `nextFundingTime` ✓
- API provides `fundingInterval` in minutes ✓
- **Never assume 8h!** Always check API data

### BingX
- **Intervals**: Primarily 8h
- **Variations**: Unknown (API doesn't clearly expose interval)
- WebSocket does NOT provide funding data ✗
- Uses backend API + fundingRatesMap ✓

### MEXC
- **Intervals**: 1h, 4h, 8h (varies by symbol!)
- **Real Examples**:
  - SHELL/USDT: 4h (`collectCycle=4`)
  - COAI/USDT: 8h (`collectCycle=8`)
  - BTC/USDT: 8h (`collectCycle=8`)
- WebSocket does NOT provide `nextFundingTime` ✗
- **Must use** individual API: `/api/v1/contract/funding_rate/{symbol}` ✓
- Returns: `collectCycle` (hours), `nextSettleTime` (ms timestamp)

### Gate.io
- **Intervals**: 1h, 2h, 4h, 8h (varies by symbol!)
- **Distribution** (as of 2025-10-29):
  - 1h (3600s): 79 symbols
  - 2h (7200s): 8 symbols
  - 4h (14400s): 342 symbols ← Most common
  - 8h (28800s): 162 symbols
- No WebSocket support in current implementation ✗
- Uses API polling every 30 seconds ✓
- API provides `funding_interval` in seconds ✓
- **Never assume 8h!** Always check API data

### OKX
- **Intervals**: Primarily 8h
- **Variations**: Some symbols may use 4h
- WebSocket provides `nextFundingTime` ✓
- CCXT provides interval via API ✓

## Debugging

When investigating funding time issues:

1. **Check backend logs** for `[FundingInterval]`:
   ```
   [FundingInterval] MEXC COAI/USDT: CCXT provided interval: 4h
   [FundingInterval] MEXC COAI/USDT: interval=4h, nextFunding=2025-10-29T18:00:00.000Z
   ```

2. **Check if CCXT provided the interval**:
   - Look for "CCXT provided interval" → using real exchange data ✓
   - Look for "Using default" → fallback (might be inaccurate) ⚠️

3. **Verify nextFundingTime in WebSocket**:
   ```typescript
   console.log('[ArbitrageChart] WebSocket data:', {
     nextFundingTime,
     formatted: new Date(nextFundingTime).toISOString()
   });
   ```

4. **Check fundingRatesMap**:
   ```typescript
   console.log('[ArbitrageChart] fundingRatesMap:', this.fundingRatesMap);
   ```

## Related Files

- Backend:
  - `/backend/src/app/api/arbitrage/funding-rates/route.ts` - Main API endpoint
  - `/backend/src/lib/ccxt-service.ts` - CCXT integration

- Frontend:
  - `/frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts` - Display logic
  - `/frontend/src/app/components/trading/arbitrage-chart/funding-time.spec.ts` - Tests

## History

- **2025-10-29**: Discovered critical bug where MEXC nextFundingTime was calculated locally with wrong assumptions
- **Fix**: Removed all local nextFundingTime calculations, rely solely on backend API
- **Lesson**: Never assume funding intervals are constant - always get them from the exchange API
