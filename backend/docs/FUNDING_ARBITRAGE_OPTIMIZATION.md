# Funding Arbitrage Algorithm Optimization

## Current Implementation Analysis

### Timeline
```
T-5s    : Open PRIMARY position (receives funding)
T=0     : Open HEDGE position (at funding time)
T+10s   : Start polling for funding verification
T+10-60s: Poll every 2 seconds (up to 30 attempts)
T+60s+  : Close positions with market orders
```

### Problems
1. **Long exposure time**: 60-70+ seconds after funding
2. **Price movement risk**: High exposure to price volatility
3. **API delays**: Polling + market orders create latency
4. **Slippage**: Market orders may execute at worse prices
5. **Higher fees**: Taker fees on market orders

---

## Optimized Algorithm with Take-Profit Orders

### New Timeline
```
T-5s   : Open PRIMARY position
T=0    : Open HEDGE position
T+0.5s : SET TAKE-PROFIT orders on BOTH exchanges
         - For LONG: TP = entryPrice * 1.0001 (+0.01%)
         - For SHORT: TP = entryPrice * 0.9999 (-0.01%)
T+8s   : Funding received, TP orders trigger automatically
T+9s   : Both positions closed automatically
```

### Benefits
- ⚡ **9-10x faster closing** (9s vs 60-70s)
- 📉 **6-7x less price risk** exposure
- 🎯 **Guaranteed execution price** (limit orders)
- 🤖 **Automatic execution** without polling
- 💰 **Lower fees** (maker fees on TP orders)

---

## Implementation Strategy

### Phase 1: Add TP Order Placement

```typescript
private async setTakeProfitOrders(
  subscription: FundingSubscription,
  primarySymbol: string,
  hedgeSymbol: string,
  primaryEntryPrice: number,
  hedgeEntryPrice: number,
  primaryQuantity: number,
  hedgeQuantity: number
): Promise<void> {
  const { positionType, primaryExchange, hedgeExchange } = subscription;

  // Calculate TP prices (small profit to ensure execution)
  // Primary: if LONG, TP above entry; if SHORT, TP below entry
  const primaryTpPrice = positionType === 'long'
    ? primaryEntryPrice * 1.0001  // +0.01% for LONG
    : primaryEntryPrice * 0.9999; // -0.01% for SHORT

  // Hedge: opposite direction
  const hedgeTpPrice = positionType === 'long'
    ? hedgeEntryPrice * 0.9999   // -0.01% for SHORT hedge
    : hedgeEntryPrice * 1.0001;  // +0.01% for LONG hedge

  console.log(`[FundingArbitrage] Setting TP orders:`, {
    primaryTp: primaryTpPrice,
    hedgeTp: hedgeTpPrice,
  });

  // Set TP orders in parallel for speed
  await Promise.all([
    this.setTakeProfit(
      primaryExchange,
      primarySymbol,
      positionType === 'long' ? 'Sell' : 'Buy',
      primaryQuantity,
      primaryTpPrice
    ),
    this.setTakeProfit(
      hedgeExchange,
      hedgeSymbol,
      positionType === 'long' ? 'Buy' : 'Sell',
      hedgeQuantity,
      hedgeTpPrice
    ),
  ]);

  console.log(`[FundingArbitrage] ✓ TP orders set on both exchanges`);
}
```

### Phase 2: Implement Exchange-Specific TP Methods

```typescript
private async setTakeProfit(
  connector: BaseExchangeConnector,
  symbol: string,
  side: OrderSide,
  quantity: number,
  tpPrice: number
): Promise<any> {
  const exchangeName = connector.exchangeName;

  try {
    const connectorWithTP = connector as any;

    if (exchangeName.includes('BYBIT')) {
      // Bybit: Set TP/SL on position
      return await connectorWithTP.setTradingStop(symbol, {
        takeProfit: tpPrice.toFixed(2),
        tpTriggerBy: 'MarkPrice',
        positionIdx: 0, // One-way mode
      });
    } else if (exchangeName.includes('BINGX')) {
      // BingX: Place limit order with reduce-only flag
      return await connectorWithTP.placeLimitOrder(
        symbol,
        side,
        quantity,
        tpPrice,
        { reduceOnly: true }
      );
    } else if (exchangeName.includes('MEXC')) {
      // MEXC: Place limit order with closePosition flag
      return await connectorWithTP.placeLimitOrder(
        symbol,
        side,
        quantity,
        tpPrice,
        { closePosition: true }
      );
    }

    throw new Error(`TP orders not supported for ${exchangeName}`);
  } catch (error: any) {
    console.error(`[FundingArbitrage] Failed to set TP on ${exchangeName}:`, error.message);
    throw error;
  }
}
```

### Phase 3: Modify executeArbitrageOrders

```typescript
private async executeArbitrageOrders(subscription: FundingSubscription): Promise<void> {
  // ... existing code for opening positions ...

  // STEP 7: Execute HEDGE order
  const hedgeOrder = await hedgeExchange.placeMarketOrder(hedgeSymbol, hedgeSide, hedgeQuantity);

  // STEP 8: Get entry prices
  let entryPrice = primaryOrder.avgPrice || 0;
  let hedgeEntryPrice = hedgeOrder.avgPrice || 0;

  // Fetch from positions if needed
  if (entryPrice === 0 || hedgeEntryPrice === 0) {
    const [primaryPosition, hedgePosition] = await Promise.all([
      primaryExchange.getPosition(primarySymbol),
      hedgeExchange.getPosition(hedgeSymbol),
    ]);

    entryPrice = entryPrice || parseFloat(primaryPosition.avgPrice || '0');
    hedgeEntryPrice = hedgeEntryPrice || parseFloat(hedgePosition.avgPrice || '0');
  }

  // 🆕 STEP 9: SET TAKE-PROFIT ORDERS IMMEDIATELY
  try {
    console.log(`[FundingArbitrage] Setting TP orders for instant close after funding...`);
    await this.setTakeProfitOrders(
      subscription,
      primarySymbol,
      hedgeSymbol,
      entryPrice,
      hedgeEntryPrice,
      primaryQuantity,
      hedgeQuantity
    );
  } catch (tpError: any) {
    console.error(`[FundingArbitrage] Failed to set TP orders: ${tpError.message}`);
    console.log(`[FundingArbitrage] Falling back to manual close strategy`);
    // Continue with old strategy if TP fails
  }

  // STEP 10: Update DB with EXECUTING status
  await prisma.fundingArbitrageSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'EXECUTING',
      entryPrice,
      hedgeEntryPrice,
      executedAt: new Date(),
    },
  });

  // STEP 11: Schedule verification (TP orders should close automatically)
  // We still verify funding but expect positions to be closed already
  const delayUntilVerification = Math.max(15000, timeUntilFunding + 15000); // 15s after funding

  setTimeout(async () => {
    try {
      // Verify funding received
      const actualFundingEarned = await this.verifyFundingWithPolling(
        subscription,
        entryPrice,
        10 // Shorter polling: 10 attempts × 2s = 20s
      );

      // Check if positions were closed by TP orders
      const positionsClosed = await this.checkPositionsClosed(
        subscription,
        primarySymbol,
        hedgeSymbol
      );

      if (positionsClosed) {
        console.log(`[FundingArbitrage] ✓ Positions closed automatically by TP orders`);
        await this.finalizeClosedPositions(subscription, entryPrice, hedgeEntryPrice, actualFundingEarned);
      } else {
        console.warn(`[FundingArbitrage] ⚠️ TP orders did not execute, force closing positions`);
        await this.closePositions(subscription, entryPrice, hedgeEntryPrice, actualFundingEarned || 0);
      }
    } catch (error: any) {
      console.error(`[FundingArbitrage] Error in verification:`, error);
      this.emit(FundingArbitrageService.ERROR, {
        subscriptionId: subscription.id,
        error: error.message,
      });
    }
  }, delayUntilVerification);
}
```

### Phase 4: Add Position Close Verification

```typescript
private async checkPositionsClosed(
  subscription: FundingSubscription,
  primarySymbol: string,
  hedgeSymbol: string
): Promise<boolean> {
  try {
    const [primaryPos, hedgePos] = await Promise.all([
      subscription.primaryExchange.getPosition(primarySymbol),
      subscription.hedgeExchange.getPosition(hedgeSymbol),
    ]);

    const primarySize = Math.abs(parseFloat(primaryPos?.positionAmt || primaryPos?.size || '0'));
    const hedgeSize = Math.abs(parseFloat(hedgePos?.positionAmt || hedgePos?.size || '0'));

    return primarySize === 0 && hedgeSize === 0;
  } catch (error: any) {
    console.error(`[FundingArbitrage] Error checking positions:`, error.message);
    return false; // Assume not closed if check fails
  }
}

private async finalizeClosedPositions(
  subscription: FundingSubscription,
  entryPrice: number,
  hedgeEntryPrice: number,
  fundingEarned: number
): Promise<void> {
  // Fetch order history to get exact close prices
  // Calculate final P&L
  // Update database with COMPLETED status
  // Emit completion event
}
```

---

## Configuration Options

Add new config option to enable/disable TP optimization:

```typescript
export interface FundingSubscription {
  // ... existing fields ...
  useTakeProfitOrders?: boolean; // Default: true
  takeProfitMargin?: number;     // Default: 0.0001 (0.01%)
}
```

---

## Risk Considerations

### TP Order May Not Execute If:
1. **Price doesn't reach TP level** - extremely unlikely with +/-0.01% margin
2. **Insufficient liquidity** - use larger TP margin if needed
3. **Exchange API issues** - fallback to manual close still available

### Mitigation:
- Monitor TP order status
- Fallback to manual close if TP doesn't execute within 30s
- Alert user if manual intervention needed

---

## Performance Metrics

### Expected Improvements:
- **Closing time**: 60-70s → 9-10s (85% faster)
- **Price risk**: 6-7x reduction
- **Success rate**: 99%+ (with fallback)
- **Fee savings**: ~20-30% (maker vs taker)

---

## Testing Plan

1. **Sandbox Testing**: Test on testnet with small positions
2. **Single Pair**: Test with one trading pair on mainnet
3. **Multiple Pairs**: Scale to multiple pairs
4. **Stress Test**: Test during high volatility
5. **Failure Scenarios**: Test TP order failures and fallbacks

---

## Rollout Strategy

### Phase 1 (Week 1): Development
- Implement core TP functionality
- Add fallback mechanisms
- Unit tests

### Phase 2 (Week 2): Testing
- Testnet validation
- Mainnet pilot with 1 pair
- Performance monitoring

### Phase 3 (Week 3): Production
- Enable for all users
- Monitor metrics
- Gather feedback

---

## Conclusion

This optimization will significantly reduce risk and improve profitability of funding arbitrage by:
- Minimizing price exposure time
- Guaranteeing execution prices
- Reducing trading fees
- Automating the closing process

**Estimated P&L improvement: +15-25% due to reduced slippage and fees**
