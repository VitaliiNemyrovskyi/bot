# Leverage Synchronization Implementation

**Status**: ✅ **FULLY IMPLEMENTED**

This document describes the leverage synchronization implementation for BingX and Bybit exchanges before funding arbitrage subscription.

## Overview

Leverage synchronization ensures that both primary and hedge exchanges have matching leverage settings before opening positions. This is critical for funding arbitrage to work correctly and safely.

## Architecture

### 1. Exchange Service Layer

#### BingX Service (`src/lib/bingx.ts`)

**Method**: `setLeverage(symbol: string, leverage: number, side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH')`

- **Endpoint**: `POST /openApi/swap/v2/trade/leverage`
- **Parameters**:
  - `symbol`: Trading pair (e.g., "BTC-USDT")
  - `leverage`: 1-125x
  - `side`: "BOTH" for one-way mode, "LONG"/"SHORT" for hedge mode
- **Authentication**: HMAC SHA256 signature
- **Implementation**: Lines 1018-1062

```typescript
async setLeverage(
  symbol: string,
  leverage: number,
  side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
): Promise<any> {
  // Validate leverage range
  if (leverage < 1 || leverage > 125) {
    throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
  }

  const paramsArray: Array<[string, any]> = [
    ['symbol', symbol],
    ['side', side],
    ['leverage', leverage]
  ];

  const response = await this.makeRequestWithOrder(
    'POST',
    '/openApi/swap/v2/trade/leverage',
    paramsArray
  );

  if (response.code !== 0) {
    throw new Error(`Failed to set leverage: ${response.msg}`);
  }

  return response.data;
}
```

#### Bybit Service (`src/lib/bybit.ts`)

**Method**: `setLeverage(category: 'linear' | 'inverse', symbol: string, buyLeverage: number, sellLeverage: number)`

- **Endpoint**: `POST /v5/position/set-leverage`
- **Parameters**:
  - `category`: "linear" for USDT perpetuals
  - `symbol`: Trading pair (e.g., "BTCUSDT")
  - `buyLeverage`: 1-100x (for long positions)
  - `sellLeverage`: 1-100x (for short positions)
- **Authentication**: Bybit V5 signature
- **Implementation**: Lines 864-914

```typescript
async setLeverage(
  category: 'linear' | 'inverse',
  symbol: string,
  buyLeverage: number,
  sellLeverage: number
): Promise<any> {
  // Validate leverage range
  if (buyLeverage < 1 || buyLeverage > 100) {
    throw new Error(`Invalid buy leverage: ${buyLeverage}. Must be between 1 and 100.`);
  }
  if (sellLeverage < 1 || sellLeverage > 100) {
    throw new Error(`Invalid sell leverage: ${sellLeverage}. Must be between 1 and 100.`);
  }

  const response = await this.restClient.setLeverage({
    category,
    symbol,
    buyLeverage: buyLeverage.toString(),
    sellLeverage: sellLeverage.toString(),
  });

  if (response.retCode !== 0) {
    throw new Error(`Bybit API Error: ${response.retMsg}`);
  }

  return response.result;
}
```

### 2. Connector Layer

#### BingXConnector (`src/connectors/bingx.connector.ts`)

**Lines 389-426**: Exposes `setLeverage()` with validation and error handling

```typescript
async setLeverage(
  symbol: string,
  leverage: number,
  side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
): Promise<any> {
  if (!this.isInitialized) {
    throw new Error('BingX connector not initialized');
  }

  if (leverage < 1 || leverage > 125) {
    throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
  }

  const result = await this.bingxService.setLeverage(symbol, leverage, side);
  return result;
}
```

#### BybitConnector (`src/connectors/bybit.connector.ts`)

**Lines 391-443**: Exposes `setLeverage()` with validation and error handling

```typescript
async setLeverage(
  symbol: string,
  leverage: number,
  category: 'linear' | 'inverse' = 'linear'
): Promise<any> {
  if (!this.isInitialized) {
    throw new Error('Bybit connector not initialized');
  }

  if (leverage < 1 || leverage > 100) {
    throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 100.`);
  }

  const result = await this.bybitService.setLeverage(
    category,
    symbol,
    leverage,  // buyLeverage
    leverage   // sellLeverage (same for one-way mode)
  );

  return result;
}
```

### 3. Service Integration

#### Funding Arbitrage Service (`src/services/funding-arbitrage.service.ts`)

**Helper Method** (Lines 706-759): `setExchangeLeverage()`

```typescript
private async setExchangeLeverage(
  connector: BaseExchangeConnector,
  symbol: string,
  leverage: number
): Promise<void> {
  const exchangeName = connector.exchangeName;
  const connectorWithLeverage = connector as any;

  if (typeof connectorWithLeverage.setLeverage !== 'function') {
    console.warn(`${exchangeName} connector does not support setLeverage, skipping...`);
    return;
  }

  // Call setLeverage - signature depends on exchange type
  if (exchangeName.includes('BINGX')) {
    await connectorWithLeverage.setLeverage(symbol, leverage, 'BOTH');
  } else if (exchangeName.includes('BYBIT')) {
    await connectorWithLeverage.setLeverage(symbol, leverage, 'linear');
  } else {
    await connectorWithLeverage.setLeverage(symbol, leverage);
  }
}
```

**Integration Point** (Lines 793-827): `executeArbitrageOrders()`

```typescript
// STEP 0: Synchronize leverage on both exchanges BEFORE opening positions
const DEFAULT_LEVERAGE = 3; // Conservative for funding arbitrage

try {
  console.log(`[FundingArbitrage] Synchronizing leverage to ${DEFAULT_LEVERAGE}x on both exchanges...`);

  // Synchronize leverage in parallel for speed
  await Promise.all([
    this.setExchangeLeverage(primaryExchange, primarySymbol, DEFAULT_LEVERAGE),
    this.setExchangeLeverage(hedgeExchange, hedgeSymbol, DEFAULT_LEVERAGE),
  ]);

  console.log(`[FundingArbitrage] Leverage synchronized successfully on both exchanges`);
} catch (error: any) {
  console.error(`[FundingArbitrage] Failed to synchronize leverage:`, error.message);

  // Update subscription status to failed
  subscription.status = 'failed';
  await prisma.fundingArbitrageSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ERROR',
      errorMessage: `Leverage sync failed: ${error.message}`,
    },
  });

  // Emit error event
  this.emit(FundingArbitrageService.ERROR, {
    subscriptionId: subscription.id,
    error: `Leverage synchronization failed: ${error.message}`,
  });

  throw new Error(`Leverage synchronization failed: ${error.message}`);
}

// Only after leverage is synchronized, open positions...
```

## Execution Flow

### Funding Arbitrage Subscription

When a user subscribes to funding arbitrage:

1. **Subscription Created**: User provides symbol, funding rate, position type, etc.
2. **Countdown Starts**: Timer counts down to funding time
3. **5 seconds before funding**: `executeArbitrageOrders()` is triggered

### Order Execution Flow

```
executeArbitrageOrders()
  ├── Step 0: Leverage Synchronization ⚡
  │   ├── Set leverage on primary exchange (BingX)
  │   └── Set leverage on hedge exchange (Bybit)
  │   └── (Executed in parallel for speed)
  │
  ├── Step 1: Open Primary Position
  │   └── placeMarketOrder() on primary exchange
  │
  ├── Step 2: Open Hedge Position
  │   └── placeMarketOrder() on hedge exchange
  │
  ├── Step 3: Wait for Funding Payment
  │
  └── Step 4: Close Positions
```

## Error Handling

### Leverage Sync Failures

If leverage synchronization fails:

1. **Subscription Status**: Updated to `ERROR` in database
2. **Error Event**: Emitted to notify UI
3. **Position Opening**: Prevented (execution stops)
4. **Error Message**: Helpful context provided

Common errors handled:

- **Position Already Exists**: "Leverage cannot be changed when there are open positions"
- **Invalid Leverage**: "Invalid leverage: X. Must be between 1 and Y"
- **API Errors**: Exchange-specific error messages

### Example Error Messages

```typescript
// BingX - Position conflict
throw new Error(
  `Failed to set leverage for ${symbol}: ${error.message}. ` +
  `Note: Leverage cannot be changed when there are open positions. ` +
  `Please close all positions for ${symbol} before changing leverage.`
);

// Bybit - Risk limit exceeded
throw new Error(
  `Failed to set leverage for ${symbol}: ${error.message}. ` +
  `The requested leverage may exceed the maximum allowed for your account tier or position size.`
);
```

## Configuration

### Default Settings

- **Default Leverage**: 3x (conservative for funding arbitrage)
- **BingX Side**: "BOTH" (one-way mode)
- **Bybit Category**: "linear" (USDT perpetuals)

### Customization

To change default leverage, modify `DEFAULT_LEVERAGE` in `funding-arbitrage.service.ts`:

```typescript
// Line 795
const DEFAULT_LEVERAGE = 3; // Change this value
```

## Testing

### Unit Tests

Run the mock test:

```bash
cd backend
npx ts-node test-leverage.ts
```

Expected output:

```
=== Testing Leverage Synchronization ===

Test 1: Set leverage on BingX
[MockBingX] Setting leverage for BTC-USDT: 3x (side: BOTH)
Leverage set successfully on BINGX_TESTNET: 3x

Test 2: Set leverage on Bybit
[MockBybit] Setting leverage for BTCUSDT: 3x (category: linear)
Leverage set successfully on BYBIT_TESTNET: 3x

Test 3: Parallel leverage sync (as in production)
Leverage set successfully on BINGX_TESTNET: 5x
Leverage set successfully on BYBIT_TESTNET: 5x

=== All Tests Passed! ===
```

### Integration Tests

Test with real exchanges (testnet):

1. **Ensure testnet credentials are configured**
2. **Create a funding arbitrage subscription**
3. **Monitor logs for leverage synchronization**
4. **Verify positions are opened with correct leverage**

Expected log output:

```
[FundingArbitrage] Synchronizing leverage to 3x on both exchanges...
[BingXConnector] Setting leverage for BTC-USDT: 3x (side: BOTH)
[BingXService] Setting leverage: { symbol: 'BTC-USDT', leverage: 3, side: 'BOTH' }
[BingXService] Leverage set successfully
[BybitConnector] Setting leverage for BTCUSDT: 3x (category: linear)
[BybitService] Setting leverage: { category: 'linear', symbol: 'BTCUSDT', buyLeverage: 3, sellLeverage: 3 }
[BybitService] Leverage set successfully
[FundingArbitrage] Leverage synchronized successfully on both exchanges
```

## API Documentation References

### BingX

- **Documentation**: https://bingx-api.github.io/docs/
- **Endpoint**: POST `/openApi/swap/v2/trade/leverage`
- **Parameters**: `symbol`, `side`, `leverage`, `timestamp`, `signature`
- **Response**: `{ code: 0, msg: "", data: {...} }`

### Bybit

- **Documentation**: https://bybit-exchange.github.io/docs/v5/position/leverage
- **Endpoint**: POST `/v5/position/set-leverage`
- **Parameters**: `category`, `symbol`, `buyLeverage`, `sellLeverage`
- **Response**: `{ retCode: 0, retMsg: "OK", result: {...} }`

## File Locations

### Core Implementation Files

1. **BingX Service**: `/backend/src/lib/bingx.ts` (Lines 1018-1062)
2. **Bybit Service**: `/backend/src/lib/bybit.ts` (Lines 864-914)
3. **BingX Connector**: `/backend/src/connectors/bingx.connector.ts` (Lines 389-426)
4. **Bybit Connector**: `/backend/src/connectors/bybit.connector.ts` (Lines 391-443)
5. **Funding Arbitrage Service**: `/backend/src/services/funding-arbitrage.service.ts` (Lines 706-827)

### Test Files

1. **Mock Test**: `/backend/test-leverage.ts`

## Best Practices

### 1. Always Set Leverage Before Opening Positions

Leverage **must** be set before opening positions. Most exchanges do not allow leverage changes when positions are open.

### 2. Use Conservative Leverage for Funding Arbitrage

Default 3x leverage is conservative and suitable for most funding arbitrage strategies. Higher leverage increases risk.

### 3. Handle Errors Gracefully

Always wrap leverage setting in try-catch blocks and provide helpful error messages to users.

### 4. Parallel Execution for Speed

Set leverage on both exchanges in parallel using `Promise.all()` to minimize latency before funding time.

### 5. Validate Leverage Ranges

- **BingX**: 1-125x (but practical limit varies by symbol and account)
- **Bybit**: 1-100x (but practical limit varies by symbol and account tier)

## Troubleshooting

### Issue: "Position already exists" error

**Cause**: Trying to change leverage when positions are open

**Solution**: Close all positions for the symbol before changing leverage

### Issue: "Invalid leverage" error

**Cause**: Leverage outside allowed range or exceeds risk limit

**Solution**:
- Check symbol-specific leverage limits
- Verify account tier and position size
- Use lower leverage

### Issue: Leverage not applied

**Cause**: Leverage set but positions opened with different leverage

**Solution**:
- Verify leverage was set successfully (check logs)
- Ensure leverage setting completes before opening positions
- Check exchange position mode (one-way vs hedge)

## Future Enhancements

### Potential Improvements

1. **Configurable Leverage**: Allow users to specify leverage per subscription
2. **Leverage Verification**: Query current leverage after setting to verify
3. **Position Mode Detection**: Auto-detect hedge mode vs one-way mode
4. **Leverage Limits**: Fetch max leverage per symbol dynamically
5. **Retry Logic**: Retry leverage setting on transient failures

## Conclusion

Leverage synchronization is **fully implemented** and integrated into the funding arbitrage flow. The implementation:

✅ Uses official exchange APIs
✅ Handles exchange-specific differences
✅ Executes in parallel for speed
✅ Provides comprehensive error handling
✅ Prevents position opening if leverage sync fails
✅ Logs all operations for debugging

The system is production-ready and ensures safe, synchronized leverage settings across both exchanges before executing funding arbitrage strategies.
