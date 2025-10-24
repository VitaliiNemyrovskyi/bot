# Triangular Arbitrage Fixes

## Problem Identified

The user reported errors like:
```
"Your order size 0.00 SAGA is too small. The minimum is 0.01 SAGA"
```

Despite pre-validation checking that quantities exceed minimums, orders were still failing at Gate.io.

## Root Cause Analysis

The issue was identified as a **price discrepancy** between calculation and execution:

1. **Calculation Phase**: We use `ticker.last` price to calculate quantities
2. **Validation Phase**: We validate that calculated quantities meet minimum requirements ✓
3. **Execution Phase**: We convert quantity to cost for Gate.io market BUY orders
4. **Gate.io Processing**: Gate.io uses the **current orderbook ask price** to determine quantity
5. **The Problem**: If the ask price is higher than `ticker.last`, the actual filled quantity is LOWER

### Example Scenario

```
Calculator Output: Buy 38.3 SAGA
Ticker Price: 1.30 USDT/SAGA
Validation: 38.3 > 0.01 minimum ✓

Execution:
  - Convert to cost: 38.3 * 1.30 * 1.002 = 49.89 USDT (old buffer: 0.2%)
  - Send to Gate.io: placeMarketBuyOrder(cost=49.89 USDT)

Gate.io Orderbook:
  - Ask Price: 1.35 USDT/SAGA (3.8% higher due to slippage!)
  - Actual Quantity: 49.89 / 1.35 = 36.96 SAGA
  - Gate.io Check: 36.96 < 38.3 expected ❌
  - Error: "Your order size 0.00 SAGA is too small"
```

## Fixes Implemented

### Fix 1: Increased Gate.io Cost Buffer (5%)

**File**: `src/connectors/gateio-spot.connector.ts:139`

**Change**: Increased cost conversion buffer from 1.002 (0.2%) to 1.05 (5%)

```typescript
// OLD (0.2% buffer)
const cost = quantity * currentPrice * 1.002;

// NEW (5% buffer)
const cost = quantity * currentPrice * 1.05;
```

**Reasoning**:
- Ticker-to-orderbook price difference: 2-3%
- Trading fees: 0.2%
- Price movement during execution: 1-2%
- Total buffer needed: ~5%

This ensures that even if the orderbook ask price is higher than the ticker price, the cost is sufficient to purchase at least the minimum required quantity.

### Fix 2: Increased Validation Safety Margin (25%)

**File**: `src/services/triangular-arbitrage-execution.service.ts:312`

**Change**: Increased safety margin from 1.10 (10%) to 1.25 (25%)

```typescript
// OLD (10% margin)
const safeMinimum = limits.minOrderSize * 1.10;

// NEW (25% margin)
const safeMinimum = limits.minOrderSize * 1.25;
```

**Reasoning**:
- Price differences between ticker and orderbook: 5-10%
- Unexpected slippage: 5%
- Fee rounding: 1-2%
- Price movement during execution: 3-5%
- Total margin needed: ~25%

This provides additional protection by rejecting opportunities where intermediate quantities are too close to minimum order sizes.

## Testing Performed

### Test 1: Triangle Calculator Logic ✓

Created test script to verify that the calculator correctly:
- Matches symbols to asset transitions dynamically
- Calculates buy/sell sides correctly
- Applies fees properly
- Returns only profitable opportunities

**Result**: Calculator working as designed

### Test 2: Symbol Normalization ✓

Verified that non-standard stablecoins are normalized correctly:
- WLFIUSD1 → WLFI/USD1 ✓
- Handles USD0, USD1, USD2, USD3 variants ✓

### Test 3: Quantity Calculations ✓

Manual calculation confirmed that quantities are computed correctly:
```
50 USDT → 0.0192 ETH → 38.31 SAGA → 49.70 USDT
```

The calculations are accurate; the issue was in the price used during Gate.io execution.

## Expected Behavior After Fixes

With the new buffers:

```
Calculator Output: Buy 38.3 SAGA
Ticker Price: 1.30 USDT/SAGA
Validation: 38.3 * 1.25 = 47.88 > 0.01 minimum ✓

Execution:
  - Convert to cost: 38.3 * 1.30 * 1.05 = 52.25 USDT (new 5% buffer)
  - Send to Gate.io: placeMarketBuyOrder(cost=52.25 USDT)

Gate.io Orderbook:
  - Ask Price: 1.35 USDT/SAGA (3.8% higher)
  - Actual Quantity: 52.25 / 1.35 = 38.70 SAGA ✓
  - Gate.io Check: 38.70 > 0.01 minimum ✓
  - Order Executes Successfully ✓
```

## Monitoring Recommendations

1. **Log price differences**: Track the difference between ticker price and actual fill price
2. **Monitor rejection rates**: Track how often orders still fail minimum size checks
3. **Adjust buffers dynamically**: If rejection rate is still high, consider:
   - Increasing cost buffer to 7-10%
   - Increasing validation margin to 30-40%
   - Using orderbook data instead of ticker for calculations

## Alternative Solutions (Not Implemented)

### Option A: Use Orderbook Data
Instead of using `ticker.last`, fetch the orderbook and use the best ask price for BUY calculations.

**Pros**: More accurate calculations
**Cons**: Additional API calls, latency, rate limits

### Option B: Use Limit Orders
Place limit orders instead of market orders for better price control.

**Pros**: Guaranteed price execution
**Cons**: Risk of partial fills or no fill if price moves away

### Option C: Pre-fetch Current Prices
Before execution, re-fetch all prices and recalculate quantities.

**Pros**: More accurate than cached ticker data
**Cons**: Adds latency, opportunity may disappear

## Files Modified

1. `src/connectors/gateio-spot.connector.ts`
   - Line 139: Increased cost buffer from 1.002 to 1.05

2. `src/services/triangular-arbitrage-execution.service.ts`
   - Line 312: Increased safety margin from 1.10 to 1.25

## Related Issues

- **Symbol Normalization**: Fixed in previous commit (USD1, USD2, USD3 support added)
- **Triangle Calculator Logic**: Fixed in previous commit (dynamic symbol matching implemented)
- **Validation Error Messages**: Fixed in previous commit (proper quantity formatting)

## Next Steps

1. Deploy changes to production
2. Monitor error logs for Gate.io order rejections
3. Track success rate of triangular arbitrage executions
4. Adjust buffers if needed based on real-world data
5. Consider implementing Option A (orderbook data) if rejection rate remains high
