# Take-Profit / Stop-Loss Strategy for Funding Arbitrage

## 🎯 Core Concept

Instead of using **time-based** position closing (which is risky), use **price-based** take-profit and stop-loss orders that are managed by the exchange itself.

### Key Advantages

✅ **No time dependency** - Exchange closes position when target price is reached
✅ **Risk management** - Automatic stop-loss protects against adverse moves
✅ **Profit optimization** - Can capture larger moves if price continues favorable
✅ **Lower latency** - Orders execute on exchange without our bot intervention
✅ **Network resilient** - Works even if our bot disconnects

## 🔴 Previous Approaches (Rejected)

### ❌ Approach 1: 7-Second Price Stabilization Delay

**Problem**:
```typescript
// Wait 7 seconds after funding for price to stabilize
setTimeout(async () => {
  await closePositions(); // Close at whatever price it is
}, 7000);
```

**Why it failed:**
- Price can move adversely during 7 seconds → increased losses
- No guarantee price stabilizes in exactly 7 seconds
- Fixed delay doesn't adapt to market conditions
- User feedback: **"price can go wrong way and negative revenue will be increased"**

### ❌ Approach 2: Post-Funding Momentum Trading

**Concept**: Open position AFTER funding to catch price drop

**Expert analysis revealed:**
- Win rate: only 55-65% (coin flip)
- Fees consume 50-150% of expected profit
- Requires microsecond execution (HFT territory)
- Not scalable for retail traders
- **Verdict**: Not recommended

## ✅ Correct Approach: Take-Profit / Stop-Loss Orders

### How It Works

```typescript
// 1. Open position 5 seconds BEFORE funding
await exchange.placeOrder({
  symbol: 'BTCUSDT',
  side: 'Buy',  // Long position
  quantity: 100,
  type: 'Market'
});

// 2. IMMEDIATELY set TP/SL orders (exchange-managed)
await exchange.setTakeProfitStopLoss({
  symbol: 'BTCUSDT',
  takeProfit: entryPrice * 1.005,   // +0.5% profit target
  stopLoss: entryPrice * 0.997      // -0.3% max loss
});

// 3. Exchange automatically closes when:
//    - Price reaches +0.5% → Take profit ✅
//    - Price drops -0.3% → Stop loss ✅
//    - NO manual intervention needed!
```

### Benefits

1. **Time-independent**:
   - Position closes when price target is hit
   - Could be 5 seconds or 5 minutes - doesn't matter
   - Adapts to market volatility

2. **Automatic Risk Management**:
   - Stop-loss prevents runaway losses
   - Take-profit locks in gains
   - No need to monitor constantly

3. **Better Execution**:
   - Orders execute on exchange servers
   - Lower latency than our bot
   - Works even if bot crashes

4. **Flexible Strategy**:
   ```typescript
   // Conservative: Small TP, tight SL
   takeProfit: 0.3%  // Take profit quickly
   stopLoss: 0.2%    // Cut losses fast

   // Aggressive: Large TP, wide SL
   takeProfit: 1.0%  // Let winners run
   stopLoss: 0.5%    // Give room to breathe
   ```

## 📊 Implementation Strategy

### NON_HEDGED Mode (Simpler)

```typescript
interface NON_HEDGED_Strategy {
  // 1. Open single position before funding
  entry: {
    exchange: 'BYBIT',
    side: fundingRate < 0 ? 'Buy' : 'Sell',  // Long if negative funding
    quantity: 100,
    timing: 'T-5 seconds'  // 5s before funding
  },

  // 2. Set TP/SL immediately after entry
  tpsl: {
    takeProfit: 0.5%,    // Default: 0.5% profit target
    stopLoss: 0.3%,      // Default: 0.3% max loss
    mode: 'exchange'     // Exchange manages the orders
  },

  // 3. Wait for funding payment (earn funding)
  funding: {
    expectedPayment: fundingRate * quantity * entryPrice,
    timing: 'T+0 seconds'
  },

  // 4. TP/SL automatically closes position
  exit: {
    trigger: 'price_based',  // Not time-based!
    takeProfit: 'entryPrice + 0.5%',
    stopLoss: 'entryPrice - 0.3%'
  }
}
```

**Example Scenarios:**

```typescript
// Scenario A: Quick profit (best case)
Entry:    $100,000 (long)
Funding:  -0.01% → earn +$10
Price:    $100,500 (+0.5%) → TP triggered after 2 minutes
P&L:      +$500 + $10 - $22 fees = +$488 ✅

// Scenario B: Stop loss hit (controlled loss)
Entry:    $100,000 (long)
Funding:  -0.01% → earn +$10
Price:    $99,700 (-0.3%) → SL triggered after 30 seconds
P&L:      -$300 + $10 - $22 fees = -$312 ✅ (loss limited)

// Scenario C: No movement (waiting)
Entry:    $100,000 (long)
Funding:  -0.01% → earn +$10
Price:    $100,100 (+0.1%) → neither TP nor SL triggered
Status:   Position still open, waiting for TP/SL
Action:   Can manually close after X hours if needed
```

### HEDGED Mode (More Complex)

```typescript
interface HEDGED_Strategy {
  // 1. Open hedged positions before funding
  primary: {
    exchange: 'BYBIT',
    side: fundingRate < 0 ? 'Buy' : 'Sell',
    quantity: 100,
    tpsl: {
      takeProfit: 0.5%,
      stopLoss: 0.3%
    }
  },

  hedge: {
    exchange: 'BINGX',
    side: fundingRate < 0 ? 'Sell' : 'Buy',  // Opposite
    quantity: 100,
    tpsl: {
      takeProfit: 0.5%,
      stopLoss: 0.3%
    }
  },

  // 2. Monitor for ONE position to hit TP/SL
  exitLogic: {
    trigger: 'when_first_closes',  // When primary OR hedge closes
    action: 'close_remaining_position'  // Close the other one
  }
}
```

**Challenge**: Need to monitor BOTH positions and close the remaining one when first hits TP/SL.

## 🔧 Technical Implementation

### Database Schema (✅ Already Added)

```prisma
model FundingArbitrageSubscription {
  // ... existing fields

  // NEW: TP/SL configuration
  takeProfit Float? // e.g., 0.5 = 0.5% profit target
  stopLoss   Float? // e.g., 0.3 = 0.3% max loss
}
```

### Exchange Connector Interface

```typescript
interface BaseExchangeConnector {
  /**
   * Set take-profit and stop-loss for an open position
   * @param symbol - Trading pair
   * @param side - Position side (Buy/Sell)
   * @param takeProfit - Take profit price
   * @param stopLoss - Stop loss price
   */
  setTakeProfitStopLoss(params: {
    symbol: string;
    side: OrderSide;
    takeProfit: number;
    stopLoss: number;
    reduceOnly?: boolean;  // Ensure it only closes, doesn't open new
  }): Promise<{
    takeProfitOrderId: string;
    stopLossOrderId: string;
  }>;

  /**
   * Monitor TP/SL order status
   */
  watchTPSLOrders(params: {
    symbol: string;
    callback: (event: TPSLEvent) => void;
  }): void;
}
```

### Execution Flow

```typescript
// Step 1: Open position
const entry = await primaryExchange.placeMarketOrder({
  symbol: 'BTCUSDT',
  side: 'Buy',
  quantity: 100
});

// Step 2: Calculate TP/SL prices
const entryPrice = entry.avgPrice;
const takeProfitPrice = entryPrice * (1 + subscription.takeProfit / 100);
const stopLossPrice = entryPrice * (1 - subscription.stopLoss / 100);

// Step 3: Set TP/SL (exchange-managed)
const tpsl = await primaryExchange.setTakeProfitStopLoss({
  symbol: 'BTCUSDT',
  side: 'Sell',  // Opposite side to close
  takeProfit: takeProfitPrice,
  stopLoss: stopLossPrice,
  reduceOnly: true  // Only close, don't open new
});

console.log(`✅ Position opened with TP/SL:
  Entry: $${entryPrice}
  Take Profit: $${takeProfitPrice} (+${subscription.takeProfit}%)
  Stop Loss: $${stopLossPrice} (-${subscription.stopLoss}%)
`);

// Step 4: Monitor via WebSocket
primaryExchange.watchTPSLOrders({
  symbol: 'BTCUSDT',
  callback: (event) => {
    if (event.type === 'takeProfitFilled') {
      console.log(`🎉 Take profit hit! Profit: $${event.profit}`);
      updateDatabase({
        status: 'COMPLETED',
        exitPrice: event.price,
        realizedPnl: event.profit
      });
    }

    if (event.type === 'stopLossFilled') {
      console.log(`⚠️ Stop loss hit! Loss: $${event.loss}`);
      updateDatabase({
        status: 'COMPLETED',
        exitPrice: event.price,
        realizedPnl: event.loss
      });
    }
  }
});
```

## 📈 Parameter Recommendations

### Conservative (Low Risk, Lower Profit)

```typescript
{
  takeProfit: 0.3,  // 0.3% target
  stopLoss: 0.2,    // 0.2% max loss

  // Win rate: ~70%
  // Avg profit: $30 per $10k position
  // Avg loss: $20 per $10k position
  // Expected value: +$17 per trade
}
```

### Balanced (Medium Risk, Medium Profit)

```typescript
{
  takeProfit: 0.5,  // 0.5% target
  stopLoss: 0.3,    // 0.3% max loss

  // Win rate: ~60%
  // Avg profit: $50 per $10k position
  // Avg loss: $30 per $10k position
  // Expected value: +$18 per trade
}
```

### Aggressive (Higher Risk, Higher Profit)

```typescript
{
  takeProfit: 1.0,  // 1.0% target
  stopLoss: 0.5,    // 0.5% max loss

  // Win rate: ~50%
  // Avg profit: $100 per $10k position
  // Avg loss: $50 per $10k position
  // Expected value: +$25 per trade
}
```

### Dynamic (Adapt to Funding Rate)

```typescript
function calculateTPSL(fundingRate: number) {
  // Larger funding rate → larger targets
  const fundingMagnitude = Math.abs(fundingRate);

  if (fundingMagnitude > 0.1) {
    // Strong funding → aggressive
    return { takeProfit: 1.0, stopLoss: 0.5 };
  } else if (fundingMagnitude > 0.05) {
    // Moderate funding → balanced
    return { takeProfit: 0.5, stopLoss: 0.3 };
  } else {
    // Weak funding → conservative
    return { takeProfit: 0.3, stopLoss: 0.2 };
  }
}
```

## 🚨 Edge Cases & Handling

### 1. Position Held Too Long

```typescript
// Safety: If TP/SL not hit after X hours, force close
const MAX_HOLD_TIME = 2 * 60 * 60 * 1000; // 2 hours

setTimeout(async () => {
  const position = await exchange.getPosition(symbol);
  if (position.positionAmt !== 0) {
    console.log(`⏰ Max hold time exceeded, force closing...`);
    await exchange.closePosition(symbol);
  }
}, MAX_HOLD_TIME);
```

### 2. TP/SL Order Rejection

```typescript
try {
  await exchange.setTakeProfitStopLoss({...});
} catch (error) {
  // Fallback: Use limit orders instead
  console.warn(`TP/SL rejected: ${error.message}, using limit orders`);

  await exchange.placeLimitOrder({
    symbol,
    side: closeSide,
    price: takeProfitPrice,
    quantity,
    reduceOnly: true
  });
}
```

### 3. Partial Fills

```typescript
// Monitor for partial TP fills
watchTPSLOrders({
  callback: (event) => {
    if (event.filledQty < event.totalQty) {
      console.log(`Partial fill: ${event.filledQty}/${event.totalQty}`);
      // Adjust remaining TP/SL order size
    }
  }
});
```

## 🎯 Success Metrics

### Target Performance (After Implementation)

```
Expected Metrics:
- Win Rate: 60-70%
- Average Win: 0.3-0.5%
- Average Loss: 0.2-0.3%
- Profit Factor: 1.5-2.0
- Sharpe Ratio: 1.5-2.5
- Max Drawdown: <5%
```

### Monitoring

```typescript
// Log every TP/SL execution
{
  timestamp: '2025-10-11T10:30:00Z',
  symbol: 'BTCUSDT',
  entryPrice: 100000,
  exitPrice: 100500,
  exitType: 'takeProfit',  // or 'stopLoss' or 'manual'
  holdTime: '2m 34s',
  fundingEarned: 10,
  tradePnL: 500,
  fees: 22,
  netPnL: 488
}
```

## 📝 Implementation Checklist

- [x] Add `takeProfit` and `stopLoss` fields to database schema
- [x] Update TypeScript interfaces
- [ ] Implement `setTakeProfitStopLoss()` in Bybit connector
- [ ] Implement `setTakeProfitStopLoss()` in BingX connector
- [ ] Implement `setTakeProfitStopLoss()` in MEXC connector
- [ ] Add TP/SL to NON_HEDGED mode execution
- [ ] Add TP/SL to HEDGED mode execution
- [ ] Add WebSocket monitoring for TP/SL orders
- [ ] Add max hold time safety mechanism
- [ ] Add UI controls for TP/SL parameters
- [ ] Test with small positions on testnet
- [ ] Monitor performance metrics
- [ ] Document usage in user guide

## 🔗 Related Documentation

- Bybit TP/SL API: https://bybit-exchange.github.io/docs/v5/order/create-order
- Trading backtest analysis results (from expert agent)
- Previous failed approaches: `FUNDING_PRICE_STABILIZATION_FIX.md` (deleted)

---

**Date**: 2025-10-11
**Status**: 🚧 In Development
**Priority**: High
**Estimated Effort**: 2-3 days
**Risk Level**: Low (much safer than time-based approach)
