# Funding Tracker Service - API Endpoint Fix

## Problem Summary

The funding tracker service was not correctly fetching funding payment data from exchanges for ACTIVE/OPEN positions:

**Expected Data:**
- Bybit: 1 funding payment of 0.2227 USDT, trading fee -0.0275 USDT
- BingX: 1 funding payment of -0.0632 USDT, trading fee -0.0249 USDT

**Actual Behavior:**
```
[BybitService] Closed P&L response: { recordCount: 0 }
[BingXService] Income history response: { recordCount: 0 }
```

## Root Cause Analysis

### 1. Bybit Issue
**Problem:** Using `/v5/position/closed-pnl` endpoint which ONLY returns data for CLOSED positions.

**Why it failed:** The position status is ACTIVE (open), so the endpoint returned 0 records.

**Solution:** Switch to `/v5/account/transaction-log` with `type='SETTLEMENT'` for funding fees and `/v5/execution/list` for trading fees. These endpoints work for ACTIVE/OPEN positions.

### 2. BingX Issue
**Problem:** Potentially incorrect symbol format and insufficient debugging.

**Why it failed:** BingX API may use different symbol formats (e.g., "FUSDT" vs "F-USDT"), and there was no retry logic.

**Solution:** Implement symbol format auto-detection with multiple variants, add comprehensive logging, and ensure proper time synchronization.

---

## Changes Made

### 1. Updated Bybit Service (`backend/src/lib/bybit.ts`)

#### Added Method: `getExecutionList()`
```typescript
/**
 * Get execution/trade history (for trading fees)
 * Endpoint: GET /v5/execution/list
 *
 * This endpoint returns execution records including trading fees.
 * Use this to fetch actual trading fees from position entry/exit trades.
 */
async getExecutionList(params: {
  category: 'linear' | 'inverse' | 'option' | 'spot';
  symbol?: string;
  orderId?: string;
  startTime?: number;
  endTime?: number;
  execType?: string;
  limit?: number;
  cursor?: string;
}): Promise<any>
```

**Purpose:** Fetches trading fee data from execution history (trades).

#### Updated Method: `getTransactionLog()`
**Enhanced with:**
- Clear documentation explaining it works for ACTIVE positions
- Better logging showing record counts
- Comments explaining type='SETTLEMENT' is for funding fees

#### Updated Method: `getClosedPnL()`
**Enhanced with:**
- Warning documentation that it ONLY works for CLOSED positions
- Recommendation to use `getTransactionLog()` for open positions

---

### 2. Updated Funding Tracker Service (`backend/src/services/funding-tracker.service.ts`)

#### Complete Rewrite: `fetchBybitFunding()`

**OLD Approach (BROKEN):**
```typescript
// ❌ WRONG: Used closed-pnl endpoint (only for CLOSED positions)
const closedPnl = await bybit.getClosedPnL({
  category: 'linear',
  symbol,
  startTime: startTime.getTime(),
  limit: 100,
});
```

**NEW Approach (CORRECT):**
```typescript
// ✅ STEP 1: Get funding fee settlements (works for ACTIVE positions)
const transactionLog = await bybit.getTransactionLog({
  accountType: 'UNIFIED',
  category: 'linear',
  currency: 'USDT',
  type: 'SETTLEMENT', // Funding fee settlements
  startTime: startTime.getTime(),
  limit: 50,
});

// Filter by symbol and sum funding payments
for (const tx of transactionLog) {
  if (tx.symbol === symbol) {
    const funding = parseFloat(tx.cashFlow || '0');
    totalFunding += funding;
  }
}

// ✅ STEP 2: Get trading fees from execution history
const executions = await bybit.getExecutionList({
  category: 'linear',
  symbol,
  startTime: startTime.getTime(),
  limit: 50,
});

for (const exec of executions.list) {
  const fee = Math.abs(parseFloat(exec.execFee || '0'));
  totalFees += fee;
}

// ✅ STEP 3: Get current mark price
const tickers = await bybit.getTicker('linear', symbol);
const currentPrice = parseFloat(tickers[0].markPrice);
```

**Key Improvements:**
1. Uses correct endpoints for ACTIVE positions
2. Separates funding fees from trading fees
3. Detailed logging at each step showing what's fetched
4. Filters transactions by symbol before summing

---

#### Enhanced: `fetchBingXFunding()`

**Key Improvements:**

1. **Symbol Format Auto-Detection:**
```typescript
// Try multiple symbol formats
const symbolVariants = [
  symbol,                    // Original (e.g., "FUSDT")
  symbol.replace('-', ''),   // Remove hyphen (e.g., "F-USDT" -> "FUSDT")
  `${symbol.slice(0, -4)}-${symbol.slice(-4)}`, // Add hyphen (e.g., "FUSDT" -> "F-USDT")
];

// Try each variant until one succeeds
for (const symbolVariant of uniqueSymbols) {
  incomeHistory = await bingx.getIncomeHistory({
    symbol: symbolVariant,
    incomeType: 'FUNDING_FEE',
    startTime: startTime.getTime(),
    limit: 100,
  });

  if (incomeHistory.code === 0) {
    usedSymbol = symbolVariant;
    break;
  }
}
```

2. **Time Synchronization:**
```typescript
// Ensure time sync before API calls
await bingx.syncTime();
```

3. **Comprehensive Logging:**
- Logs each symbol variant attempt
- Shows API response codes and messages
- Logs individual funding payments and fees
- Shows final summary with counts

4. **Separate Fee Fetching:**
```typescript
// Fetch funding fees
const fundingHistory = await bingx.getIncomeHistory({
  symbol: usedSymbol,
  incomeType: 'FUNDING_FEE',
  ...
});

// Fetch trading fees separately
const feesHistory = await bingx.getIncomeHistory({
  symbol: usedSymbol,
  incomeType: 'COMMISSION',
  ...
});
```

---

## API Endpoints Now Used

### Bybit (for ACTIVE positions)

| Endpoint | Purpose | Type Filter | Returns |
|----------|---------|-------------|---------|
| `/v5/account/transaction-log` | Funding fees | `type='SETTLEMENT'` | Funding payments with cashFlow field |
| `/v5/execution/list` | Trading fees | - | Trade executions with execFee field |
| `/v5/market/tickers` | Current price | - | Mark price for position value |

### BingX (for ACTIVE positions)

| Endpoint | Purpose | Income Type | Returns |
|----------|---------|-------------|---------|
| `/openApi/swap/v2/user/income` | Funding fees | `FUNDING_FEE` | Funding payments |
| `/openApi/swap/v2/user/income` | Trading fees | `COMMISSION` | Commission fees |
| `/openApi/swap/v2/quote/ticker` | Current price | - | Last/mark price |

---

## Testing the Fix

### Option 1: Trigger Manual Update via API

```bash
# Update specific position
curl -X POST http://localhost:3000/api/arbitrage/funding-tracker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"positionId": "arb_1_1760860010874"}'

# Update all active positions
curl -X POST http://localhost:3000/api/arbitrage/funding-tracker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

### Option 2: Wait for Automatic Update
The funding tracker runs automatically every 5 minutes for all active positions.

---

## Expected Log Output (After Fix)

### Bybit - Success Case:
```
[FundingTracker] Fetching Bybit data for FUSDT, side=Buy, since 2025-10-19T...
[BybitService] Fetching transaction log with params: {...}
[BybitService] Transaction log response: { recordCount: 2 }
[FundingTracker] Bybit funding settlement: {
  symbol: 'FUSDT',
  cashFlow: '0.2227',
  transactionTime: '2025-10-19T12:00:00.000Z',
  type: 'SETTLEMENT'
}
[FundingTracker] Bybit FUSDT funding summary: {
  fundingCount: 1,
  totalFunding: 0.2227,
  lastFunding: 0.2227
}
[BybitService] Fetching execution list with params: {...}
[BybitService] Execution list response: { recordCount: 1 }
[FundingTracker] Bybit execution fee: {
  symbol: 'FUSDT',
  execFee: '-0.0275',
  execTime: '2025-10-19T08:00:00.000Z',
  side: 'Buy',
  execQty: '1.0'
}
[FundingTracker] Bybit FUSDT final summary: {
  fundingPayments: 1,
  totalFunding: 0.2227,
  lastFunding: 0.2227,
  totalFees: 0.0275,
  currentPrice: 0.9998
}
```

### BingX - Success Case:
```
[FundingTracker] Fetching BingX data for FUSDT, side=Sell, since 2025-10-19T...
[FundingTracker] BingX symbol variants to try: [ 'FUSDT', 'F-USDT' ]
[FundingTracker] Trying BingX symbol: FUSDT
[FundingTracker] BingX income history (FUNDING_FEE) response for FUSDT: {
  code: 0,
  msg: 'success',
  recordCount: 1
}
[FundingTracker] Successfully fetched data with symbol: FUSDT
[FundingTracker] BingX funding payment: {
  symbol: 'FUSDT',
  income: '-0.0632',
  time: '2025-10-19T12:00:00.000Z',
  incomeType: 'FUNDING_FEE'
}
[FundingTracker] BingX FUSDT funding summary: {
  fundingCount: 1,
  totalFunding: -0.0632,
  lastFunding: -0.0632
}
[FundingTracker] BingX commission history response: {
  code: 0,
  msg: 'success',
  recordCount: 1
}
[FundingTracker] BingX commission: {
  symbol: 'FUSDT',
  income: '-0.0249',
  time: '2025-10-19T08:00:00.000Z'
}
[FundingTracker] BingX FUSDT final summary: {
  fundingPayments: 1,
  totalFunding: -0.0632,
  lastFunding: -0.0632,
  totalFees: 0.0249,
  currentPrice: 0.9997
}
```

---

## Database Updates

After successful funding fetch, the database record will be updated with:

```typescript
{
  // Bybit (Primary Exchange)
  primaryLastFundingPaid: 0.2227,
  primaryTotalFundingEarned: 0.2227,
  primaryTradingFees: 0.0275,
  primaryCurrentPrice: 0.9998,

  // BingX (Hedge Exchange)
  hedgeLastFundingPaid: -0.0632,
  hedgeTotalFundingEarned: -0.0632,
  hedgeTradingFees: 0.0249,
  hedgeCurrentPrice: 0.9997,

  // Total P&L
  grossProfit: 0.1595,  // 0.2227 + (-0.0632)
  netProfit: 0.1071,    // 0.1595 - 0.0275 - 0.0249

  // Metadata
  lastFundingUpdate: new Date(),
  fundingUpdateCount: position.fundingUpdateCount + 1
}
```

---

## Files Modified

1. **`backend/src/lib/bybit.ts`**
   - Added `getExecutionList()` method
   - Enhanced `getTransactionLog()` with better docs
   - Enhanced `getClosedPnL()` with warning docs

2. **`backend/src/services/funding-tracker.service.ts`**
   - Completely rewrote `fetchBybitFunding()` to use correct endpoints
   - Enhanced `fetchBingXFunding()` with symbol auto-detection
   - Added comprehensive logging throughout

3. **`/Users/vnemyrovskyi/IdeaProjects/0bot/FUNDING_TRACKER_FIX.md`** (this file)
   - Complete documentation of changes

---

## Verification Checklist

- [x] Bybit now uses `/v5/account/transaction-log` for funding fees (ACTIVE positions)
- [x] Bybit now uses `/v5/execution/list` for trading fees
- [x] BingX implements symbol format auto-detection
- [x] BingX properly synchronizes time before API calls
- [x] Both exchanges have detailed logging for debugging
- [x] Backend compiles successfully without errors
- [x] API endpoint exists at `/api/arbitrage/funding-tracker` for manual testing

---

## Next Steps

1. **Test with real position:**
   - Call the API endpoint with `positionId: "arb_1_1760860010874"`
   - Check backend logs for detailed output
   - Verify database is updated with correct values

2. **Monitor automatic updates:**
   - The service runs every 5 minutes automatically
   - Check logs for successful updates
   - Verify all active positions are being tracked

3. **Verify data accuracy:**
   - Compare fetched values with exchange UI
   - Confirm funding payments match expected amounts
   - Validate trading fees are correct

---

## Technical Details

### Why Transaction Log Works for Active Positions

The `/v5/account/transaction-log` endpoint returns ALL account transactions, including:
- **SETTLEMENT**: Funding fee payments (every 8 hours)
- **TRADE**: Trade executions
- **TRANSFER**: Fund transfers
- **FEE**: Various fees

By filtering with `type='SETTLEMENT'` and matching the symbol, we get funding payments for BOTH active and closed positions.

### Why Closed P&L Failed

The `/v5/position/closed-pnl` endpoint is designed for **post-mortem analysis** of closed positions. It only populates records when a position is fully closed (size = 0). For active positions, this endpoint returns an empty list.

### Symbol Format Handling

BingX uses different symbol formats across their APIs:
- Spot: `BTC-USDT` (with hyphen)
- Perpetual: `BTCUSDT` or `BTC-USDT` (varies)
- Some contracts: `FUSDT` (no base currency)

The auto-detection tries all reasonable variants to ensure compatibility.

---

## Success Criteria

The fix is successful when:

1. Bybit returns funding payment: **0.2227 USDT**
2. Bybit returns trading fee: **0.0275 USDT**
3. BingX returns funding payment: **-0.0632 USDT**
4. BingX returns trading fee: **0.0249 USDT**
5. Database shows correct net profit: **0.1071 USDT**
6. Logs show detailed breakdown of each transaction

---

**Generated:** 2025-10-19
**Position ID:** arb_1_1760860010874
**Status:** ACTIVE
**Symbol:** FUSDT
**Exchanges:** Bybit (Primary) / BingX (Hedge)
