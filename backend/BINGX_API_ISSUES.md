# BingX API Implementation Issues and Solutions

## Date: 2025-10-19

## Summary
During implementation of BingX funding data collection for Active Arbitrage Positions page, we encountered critical issues with BingX API that prevented retrieval of both funding fee history and trading fee data.

---

## Problem 1: Missing BingX Funding Data

### Symptoms
- Frontend displaying zeros for BingX funding payments
- Backend logs showing: `BingX income history (FUNDING_FEE) response: { recordCount: 0 }`
- Position data in UI showed only Bybit funding, BingX side was empty

### Root Cause
**BingX API Bug with `startTime` parameter**

The BingX `/openApi/swap/v2/user/income` endpoint has a critical bug:
- When `startTime` parameter is included in the request, API returns **0 records** even when data exists
- This affects ALL income types: `FUNDING_FEE`, `TRADING_FEE`, `COMMISSION`

### Testing Evidence

#### Test 1: Without startTime (WORKS ✅)
```typescript
await bingx.getIncomeHistory({
  symbol: 'F-USDT',
  incomeType: 'FUNDING_FEE',
  limit: 100
});
// Result: 2 records found
// - income: '-0.00025214' (2025-10-19 12:00:18)
// - income: '-0.06327304' (2025-10-19 08:00:07)
```

#### Test 2: With startTime (FAILS ❌)
```typescript
const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
await bingx.getIncomeHistory({
  symbol: 'F-USDT',
  incomeType: 'FUNDING_FEE',
  startTime: oneDayAgo,
  limit: 100
});
// Result: 0 records (even though data exists within timeframe)
```

### Solution
**File:** `/backend/src/services/funding-tracker.service.ts:466-479`

**Changed from:**
```typescript
// STEP 1: Get funding fee history
incomeHistory = await bingx.getIncomeHistory({
  symbol: symbolVariant,
  incomeType: 'FUNDING_FEE',
  startTime: startTime.getTime(),  // ❌ Causes 0 records
  limit: 100,
});
```

**Changed to:**
```typescript
// BingX API has issues with startTime parameter - it returns 0 records even when data exists
// Fetch without startTime and filter results manually
incomeHistory = await bingx.getIncomeHistory({
  symbol: symbolVariant,
  incomeType: 'FUNDING_FEE',
  // DO NOT use startTime - BingX API has issues with it
  limit: 100,
});
```

---

## Problem 2: Missing BingX Trading Fees

### Symptoms
- Database field `hedgeTradingFees` showing 0.00000000
- Backend logs: `BingX trading fee history response: { recordCount: 0 }`
- Net profit calculations incorrect due to missing fee data

### Root Cause
**Same BingX API Bug**

The trading fee endpoint uses the same `/openApi/swap/v2/user/income` API with `incomeType: 'TRADING_FEE'`, which has the same `startTime` parameter bug.

### Testing Evidence

#### Test 1: Without startTime (WORKS ✅)
```typescript
await bingx.getIncomeHistory({
  symbol: 'F-USDT',
  incomeType: 'TRADING_FEE',
  limit: 20
});
// Result: 5 records found
// Each fee: -0.00499792 USDT (Position opening fee)
// Total: ~0.025 USDT
```

#### Test 2: With startTime (FAILS ❌)
```typescript
await bingx.getIncomeHistory({
  symbol: 'F-USDT',
  incomeType: 'TRADING_FEE',
  startTime: oneDayAgo,
  limit: 20
});
// Result: 0 records
```

### Solution
**File:** `/backend/src/services/funding-tracker.service.ts:538-545`

**Changed from:**
```typescript
// STEP 2: Get trading fees
const feesHistory = await bingx.getIncomeHistory({
  symbol: usedSymbol,
  incomeType: 'TRADING_FEE',
  startTime: startTime.getTime(),  // ❌ Causes 0 records
  limit: 100,
});
```

**Changed to:**
```typescript
// STEP 2: Get trading fees
// Same as funding fees - BingX API doesn't work with startTime parameter
const feesHistory = await bingx.getIncomeHistory({
  symbol: usedSymbol,
  incomeType: 'TRADING_FEE',
  // DO NOT use startTime - BingX API has issues with it
  limit: 100,
});
```

---

## Problem 3: BingX Symbol Format Mismatch

### Symptoms
- Symbol "FUSDT" returns 0 records
- Symbol "F-USDT" returns correct data

### Root Cause
**BingX uses hyphenated symbol format**

Database stores symbols as "FUSDT" (no hyphen), but BingX API requires "F-USDT" (with hyphen before last 4 characters).

### Solution
**File:** `/backend/src/services/funding-tracker.service.ts:451-458`

Symbol variant generation already implemented:
```typescript
const symbolVariants = [
  symbol,                    // Original: "FUSDT"
  symbol.replace('-', ''),   // Remove hyphen: "F-USDT" -> "FUSDT"
  symbol.includes('-')
    ? symbol
    : `${symbol.slice(0, -4)}-${symbol.slice(-4)}`, // Add hyphen: "FUSDT" -> "F-USDT"
];

// Try each variant until one returns data
for (const symbolVariant of uniqueSymbols) {
  // ...
}
```

This logic tries multiple symbol formats and uses the first one that returns data.

---

## Final Results After Fix

### Position: arb_1_1760860010874

**Bybit (Long Position):**
- Funding Received: +0.22278488 USDT
- Trading Fees: 0.02755 USDT

**BingX (Short Position):**
- Funding Paid: -0.06352518 USDT (2 payments) ✅
- Trading Fees: 0.024987 USDT (5 fees) ✅
- Fee breakdown:
  - 07:47:01: -0.00499792 USDT
  - 07:46:59: -0.00499792 USDT
  - 07:46:57: -0.00499792 USDT
  - 07:46:55: -0.00499792 USDT
  - 07:46:53: -0.00499532 USDT

**Totals:**
- Gross Profit: 0.1593 USDT (0.2228 - 0.0635)
- Total Fees: 0.0525 USDT
- Net Profit: 0.1067 USDT ✅

---

## Important Notes for Future Development

### 1. BingX API Limitations
- **NEVER use `startTime` parameter** with `/openApi/swap/v2/user/income` endpoint
- Always fetch all available records and filter client-side if needed
- Use `limit` parameter to control result set size (max 1000)

### 2. Symbol Format Handling
- Always implement symbol variant logic when working with BingX
- Database may store different format than API expects
- Test both "SYMBOL" and "S-YMBOL" formats

### 3. Testing Strategy
When debugging BingX data issues:
```bash
# Create test script
cd backend
npx tsx test-bingx-fees.ts

# Test both with and without parameters
# Compare recordCount in responses
```

### 4. Hot Reload Issues
- Next.js may not pick up changes in server-side code (instrumentation.ts)
- Always do a full restart when changing funding-tracker.service.ts:
```bash
kill -9 $(lsof -ti:3000)
PORT=3000 npm run dev
```

---

## Related Files Modified

1. `/backend/src/services/funding-tracker.service.ts`
   - Line 466-479: Removed startTime from FUNDING_FEE query
   - Line 538-545: Removed startTime from TRADING_FEE query

2. `/backend/test-bingx-fees.ts` (created for testing)
   - Comprehensive test script to verify API behavior
   - Tests both with and without startTime parameter

---

## Lessons Learned

1. **Trust the test data over assumptions**: User's screenshot showed fees existed, but API returned 0 records. Created test script to prove the issue.

2. **Document API quirks**: BingX API has undocumented limitations. Always test thoroughly and document findings.

3. **Symbol format variations**: Different exchanges use different formats. Always implement fallback logic.

4. **Server-side caching**: Next.js instrumentation may cache old code. Full restart required for changes to take effect.

---

## References

- BingX API Documentation: https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20User's%20Profit%20and%20Loss%20of%20Swap%20Account%20Fund%20Flow
- Test script location: `/backend/test-bingx-fees.ts`
- Issue reported: 2025-10-19
- Status: ✅ RESOLVED
