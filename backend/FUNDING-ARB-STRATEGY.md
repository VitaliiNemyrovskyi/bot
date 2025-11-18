# Funding Arbitrage Combined Strategy

## Overview

This system implements a **combined SHORT+LONG funding payment arbitrage strategy** on Bybit that exploits price movements around funding payment times.

## Strategy Summary

Based on analysis of REAL funding payment data, the strategy executes:

1. **SHORT Entry** (-3s before funding): Capture price drop before funding payment
2. **Position Flip** (0s at funding): Close SHORT and open LONG to receive funding payment
3. **LONG Exit** (+3s after funding): Capture price recovery

**Expected Profit**: +4-6% in ~6 seconds

## Real Data Results

Analysis of actual funding payments (19:00 UTC) showed:

### RESOLV/USDT
- SHORT profit: +2.44%
- LONG profit: +0.67%
- Funding received: +2.00%
- **Total: +5.12%** in 6.72 seconds

### RESOLVPERP
- SHORT profit: +2.93%
- LONG profit: +1.81%
- Funding received: +1.07%
- **Total: +5.81%** in 5.45 seconds

**Average profit: +5.46%** across test pairs

## Implementation

### 1. Core Services

#### FundingPaymentArbBot ([backend/src/services/funding-payment-arb.service.ts](backend/src/services/funding-payment-arb.service.ts))

Executes the combined strategy with precise timing:

```typescript
const bot = new FundingPaymentArbBot(config, bybitService);
const result = await bot.start();
```

**Features**:
- Precise timing synchronization with Bybit server
- Automatic SHORT entry at -3s
- Fast position flip (<100ms) using REST API
- LONG exit at +3s
- Full P&L calculation and reporting
- Emergency stop functionality

#### FundingArbMonitorService ([backend/src/services/funding-arb-monitor.service.ts](backend/src/services/funding-arb-monitor.service.ts))

Monitors funding rates and identifies opportunities:

```typescript
const monitor = getFundingArbMonitor({
  minFundingRate: -0.01, // -1% or more negative
  updateInterval: 60000, // Check every 1 minute
});

await monitor.start();
const opportunities = await monitor.findOpportunities();
```

**Features**:
- Automatic scanning for negative funding rates
- Calculates next funding payment time
- Estimates profit potential
- Identifies "ready" opportunities (within 10 minutes)
- Continuous monitoring with configurable interval

### 2. Trading Methods

Added to [backend/src/lib/bybit.ts](backend/src/lib/bybit.ts):

```typescript
// Open positions
await bybit.openShort(symbol, quantity);
await bybit.openLong(symbol, quantity);

// Close positions (with reduceOnly=true)
await bybit.closeShort(symbol, quantity);
await bybit.closeLong(symbol, quantity);

// Fast position flip
const { closeResult, openResult } = await bybit.flipPosition(
  symbol,
  quantity,
  true // SHORT → LONG
);
```

### 3. API Endpoints

All endpoints under `/api/funding-arb/`:

#### GET `/opportunities`
Get all funding arbitrage opportunities
- Query param: `?ready=true` - only opportunities within 10 minutes

```bash
curl http://localhost:3000/api/funding-arb/opportunities
```

#### POST `/monitor`
Start/stop the opportunity monitor

```bash
# Start
curl -X POST http://localhost:3000/api/funding-arb/monitor \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "config": {"minFundingRate": -0.01}}'

# Stop
curl -X POST http://localhost:3000/api/funding-arb/monitor \
  -d '{"action": "stop"}'
```

#### GET `/monitor`
Get monitor status

```bash
curl http://localhost:3000/api/funding-arb/monitor
```

#### POST `/execute`
Execute strategy on a specific opportunity

```bash
curl -X POST http://localhost:3000/api/funding-arb/execute \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RESOLV/USDT",
    "positionSize": "0.1",
    "userId": "your-user-id"
  }'
```

#### GET `/status`
Get current bot status

```bash
curl http://localhost:3000/api/funding-arb/status
```

#### POST `/stop`
Emergency stop running bot

```bash
curl -X POST http://localhost:3000/api/funding-arb/stop
```

## Testing

### API Test Script

Run the test script to verify all endpoints:

```bash
cd backend
npx tsx test-funding-arb-api.ts
```

This will test:
- Getting opportunities
- Starting/stopping monitor
- Checking monitor status
- Getting ready opportunities

### Analysis Scripts

Analyze historical funding payment recordings:

```bash
# Combined strategy analysis
npx tsx analyze-combined-strategy.ts

# Price movement timeline
npx tsx analyze-price-movement-timeline.ts

# SHORT-only strategy
npx tsx analyze-short-strategy.ts

# Find funding payment moment
npx tsx find-funding-payment-moment.ts
```

## How to Use

### 1. Start the Monitor

The monitor will continuously scan for profitable opportunities:

```typescript
const monitor = getFundingArbMonitor({
  minFundingRate: -0.01, // Only negative rates below -1%
  maxTimeBeforeFunding: 10 * 60 * 1000, // 10 minutes
  updateInterval: 60 * 1000, // Scan every minute
});

await monitor.start();
```

### 2. Get Best Opportunity

```typescript
const bestOpp = await monitor.getBestOpportunity();

if (bestOpp) {
  console.log(`Best: ${bestOpp.symbol}`);
  console.log(`Rate: ${bestOpp.fundingRatePercent}`);
  console.log(`Est. Profit: ${bestOpp.estimatedProfit.toFixed(2)}%`);
  console.log(`Time until funding: ${bestOpp.timeUntilFunding}ms`);
}
```

### 3. Execute Strategy

```typescript
const config: StrategyConfig = {
  userId: 'your-user-id',
  symbol: bestOpp.symbol,
  positionSize: '0.1', // BTC amount
  fundingPaymentTime: bestOpp.nextFundingTime,
  fundingRate: bestOpp.fundingRate,
};

const bot = new FundingPaymentArbBot(config, bybitService);
const result = await bot.start();

console.log('Total Profit:', result.profit?.totalProfit);
```

## Safety Features

1. **Time Validation**: Won't execute if less than 5 seconds until funding
2. **Position Verification**: Uses `reduceOnly=true` for closing orders
3. **Emergency Stop**: Can force-stop bot and attempt to close positions
4. **Error Handling**: Comprehensive error logging and recovery
5. **Server Time Sync**: Synchronizes with Bybit before execution

## Critical Requirements

1. **Timing Precision**: Strategy requires <100ms flip timing
2. **Server Location**: Lower latency = better execution
3. **Funding Rate**: Only works with NEGATIVE rates (LONG receives payment)
4. **Liquidity**: Requires sufficient market liquidity for fast execution
5. **Capital**: Enough margin for simultaneous SHORT and LONG positions during flip

## Risk Considerations

⚠️ **Important**: This is a high-frequency strategy with risks:

- **Timing Risk**: Delayed execution reduces profit
- **Slippage**: Market orders may have price slippage
- **Liquidity**: Low liquidity pairs may not fill fast enough
- **Position Flip**: Critical 100ms window for flip execution
- **Funding Timing**: Bybit funding payments occur at precise UTC times

## Next Steps

1. **UI Integration**: Add frontend interface for monitoring and control
2. **Live Testing**: Test on next funding payment (00:00, 08:00, 16:00 UTC)
3. **Performance Tuning**: Optimize flip timing and order execution
4. **Risk Management**: Add position size limits and daily profit caps
5. **Notifications**: Add alerts for profitable opportunities

## Files Created

### Services
- `backend/src/services/funding-payment-arb.service.ts` - Bot implementation
- `backend/src/services/funding-arb-monitor.service.ts` - Opportunity monitor

### API Routes
- `backend/src/app/api/funding-arb/opportunities/route.ts`
- `backend/src/app/api/funding-arb/monitor/route.ts`
- `backend/src/app/api/funding-arb/execute/route.ts`
- `backend/src/app/api/funding-arb/status/route.ts`
- `backend/src/app/api/funding-arb/stop/route.ts`

### Analysis Scripts
- `backend/analyze-combined-strategy.ts` - Combined strategy analysis
- `backend/analyze-price-movement-timeline.ts` - Timeline analysis
- `backend/analyze-short-strategy.ts` - SHORT-only analysis
- `backend/find-funding-payment-moment.ts` - Funding moment detection

### Testing
- `backend/test-funding-arb-api.ts` - API endpoint tests

### Documentation
- `backend/FUNDING-ARB-STRATEGY.md` (this file)

## Status

**✅ COMPLETE** - Ready for live testing on next funding payment

The strategy implementation is complete with:
- [x] Combined strategy bot
- [x] Opportunity monitoring service
- [x] API endpoints
- [x] Trading methods (SHORT, LONG, flip)
- [x] Testing scripts
- [x] Documentation

**Pending**:
- [ ] UI integration
- [ ] Live testing with real funds (SMALL amount first!)
