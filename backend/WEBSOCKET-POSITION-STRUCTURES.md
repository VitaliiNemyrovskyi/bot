# WebSocket Position & Funding Payment Structures

## Overview
This document explains what objects are passed via WebSocket when you open positions and how to detect funding payments on Binance and Bybit.

---

## 🔷 BYBIT WebSocket Position Stream

### Connection
```typescript
wss://stream.bybit.com/v5/private
// Subscribe to: "position"
```

### Position Update Object

```json
{
  "id": "5923240c6880ab-26fa-4cf0-9aec-fefefl414",
  "topic": "position",
  "creationTime": 1697682817044,
  "data": [
    {
      "positionIdx": 0,
      "tradeMode": 0,
      "riskId": 1,
      "riskLimitValue": "2000000",
      "symbol": "BTCUSDT",
      "side": "Buy",
      "size": "0.1",
      "entryPrice": "27326.5",
      "leverage": "10",
      "positionValue": "2732.65",
      "positionBalance": "273.265",
      "markPrice": "28184.5",
      "positionIM": "273.265",
      "positionMM": "13.66325",
      "takeProfit": "0",
      "stopLoss": "0",
      "trailingStop": "0",
      "unrealisedPnl": "85.8",

      // 🎯 FUNDING DETECTION FIELDS
      "curRealisedPnl": "1.26",        // ⚡ Changes when funding is paid!
      "cumRealisedPnl": "-25.06579337", // Total realized PnL (cumulative)

      "sessionAvgPrice": "27326.5",
      "createdTime": "1694402496913",
      "updatedTime": "1697682817038",
      "tpslMode": "Full",
      "liqPrice": "25000.5",
      "bustPrice": "24500.0",
      "category": "linear",
      "positionStatus": "Normal",
      "adlRankIndicator": 2
    }
  ]
}
```

### Key Fields for Funding Detection

| Field | Type | Description |
|-------|------|-------------|
| `curRealisedPnl` | string | **Real-time realized PnL for current position** - changes when funding is paid |
| `cumRealisedPnl` | string | Cumulative realized PnL (all time) |
| `unrealisedPnl` | string | Unrealized PnL (mark-to-market) |
| `updatedTime` | string | Timestamp of last update |

### ⚡ Funding Payment Detection

When funding payment occurs:
```typescript
ws.on('position', (data) => {
  const position = data.data[0];

  // Compare curRealisedPnl with previous value
  const pnlChange = parseFloat(position.curRealisedPnl) - previousPnl;

  if (Math.abs(pnlChange) > 0.001 && position.size !== "0") {
    console.log('🔔 FUNDING PAYMENT DETECTED!');
    console.log('Amount:', pnlChange);
    console.log('Time:', new Date(position.updatedTime).toISOString());

    // ⚡ IMMEDIATE ACTION: Close LONG, Open SHORT
  }

  previousPnl = parseFloat(position.curRealisedPnl);
});
```

---

## 🔶 BINANCE Futures WebSocket User Data Stream

### Connection
```typescript
// Step 1: Get listenKey via REST API
POST https://fapi.binance.com/fapi/v1/listenKey

// Step 2: Connect to WebSocket
wss://fstream.binance.com/ws/<listenKey>

// Keep-alive: Extend listenKey every 30 minutes
PUT https://fapi.binance.com/fapi/v1/listenKey
```

### ACCOUNT_UPDATE Event

```json
{
  "e": "ACCOUNT_UPDATE",           // Event type
  "E": 1564745798939,              // Event time
  "T": 1564745798938,              // Transaction time
  "a": {
    "m": "FUNDING_FEE",            // 🎯 Event reason type
    "B": [                         // Balances (only changed assets)
      {
        "a": "USDT",               // Asset
        "wb": "122624.12345678",   // Wallet balance
        "cw": "100.12345678",      // Cross wallet balance
        "bc": "-0.06234500"        // ⚡ Balance change (funding fee amount)
      }
    ],
    "P": [                         // Positions (only changed positions)
      {
        "s": "BTCUSDT",            // Symbol
        "pa": "1",                 // Position amount
        "ep": "9000.00000",        // Entry price
        "bep": "9000.00000",       // Breakeven price
        "cr": "200",               // ⚡ Accumulated realized profit
        "up": "0.23455",           // Unrealized PnL
        "mt": "cross",             // Margin type
        "iw": "0.00000000",        // Isolated wallet balance
        "ps": "BOTH"               // Position side
      }
    ]
  }
}
```

### Event Reason Types (m field)

| Reason | Description |
|--------|-------------|
| `DEPOSIT` | Deposit funds |
| `WITHDRAW` | Withdraw funds |
| `ORDER` | Order execution |
| `FUNDING_FEE` | **⚡ Funding fee payment** |
| `WITHDRAW_REJECT` | Withdrawal rejected |
| `ADJUSTMENT` | Balance adjustment |
| `INSURANCE_CLEAR` | Insurance fund clear |
| `ADMIN_DEPOSIT` | Admin deposit |
| `ADMIN_WITHDRAW` | Admin withdrawal |
| `MARGIN_TRANSFER` | Margin transfer |
| `MARGIN_TYPE_CHANGE` | Margin type change |
| `ASSET_TRANSFER` | Asset transfer |
| `OPTIONS_PREMIUM_FEE` | Options premium fee |
| `OPTIONS_SETTLE_PROFIT` | Options settlement profit |
| `AUTO_EXCHANGE` | Auto exchange |
| `COIN_SWAP_DEPOSIT` | Coin swap deposit |
| `COIN_SWAP_WITHDRAW` | Coin swap withdrawal |

### Key Fields for Funding Detection

| Field | Type | Description |
|-------|------|-------------|
| `a.m` | string | **Event reason** - will be "FUNDING_FEE" for funding payments |
| `a.B[].bc` | string | **Balance change** - funding fee amount (negative if paid, positive if received) |
| `a.B[].wb` | string | Updated wallet balance |
| `a.P[].cr` | string | **Accumulated realized profit** - includes funding fees |

### ⚡ Funding Payment Detection

```typescript
ws.on('message', (data) => {
  const event = JSON.parse(data);

  if (event.e === 'ACCOUNT_UPDATE') {
    const reason = event.a.m;

    // 🎯 Direct funding fee detection
    if (reason === 'FUNDING_FEE') {
      console.log('🔔 FUNDING PAYMENT DETECTED!');

      const balanceChanges = event.a.B;
      const positions = event.a.P;

      balanceChanges.forEach(balance => {
        console.log(`Asset: ${balance.a}`);
        console.log(`Funding Amount: ${balance.bc}`); // Negative = paid, Positive = received
        console.log(`New Balance: ${balance.wb}`);
      });

      // ⚡ IMMEDIATE ACTION: Close LONG, Open SHORT
    }
  }
});
```

---

## 📊 Comparison: Bybit vs Binance

| Feature | Bybit | Binance |
|---------|-------|---------|
| **Funding Detection Method** | Monitor `curRealisedPnl` changes | Check `m === "FUNDING_FEE"` |
| **Detection Clarity** | Indirect (PnL change) | ✅ Direct (event reason) |
| **Funding Amount** | Calculate from PnL delta | ✅ Direct in `bc` field |
| **Real-time Updates** | ✅ Immediate | ✅ Immediate |
| **Connection Type** | Single persistent WS | Requires listenKey (expires 60min) |
| **Keep-alive Required** | ❌ No | ✅ Yes (every 30-60 min) |

---

## 🎯 OPTIMAL STRATEGY IMPLEMENTATION

### Strategy: LONG Trigger → SHORT Scalp

```typescript
class FundingPaymentTriggerStrategy {
  private longPositionPnl: number = 0;
  private fundingDetected: boolean = false;

  async execute(exchange: 'BYBIT' | 'BINANCE', symbol: string, fundingTime: Date) {
    // 1. Connect to position WebSocket
    const ws = await this.connectWebSocket(exchange);

    // 2. Open small LONG position 10 seconds before funding
    const entryTime = fundingTime.getTime() - 10000;
    await this.waitUntil(entryTime);

    const longPosition = await this.openLong(symbol, 5); // 5 USDT
    this.longPositionPnl = longPosition.realisedPnl;

    console.log('✅ LONG position opened, monitoring for funding...');

    // 3. Listen for funding payment
    if (exchange === 'BYBIT') {
      this.detectFundingBybit(ws, symbol);
    } else {
      this.detectFundingBinance(ws, symbol);
    }
  }

  private detectFundingBybit(ws: WebSocket, symbol: string) {
    ws.on('position', async (data) => {
      const position = data.data.find((p: any) => p.symbol === symbol);
      if (!position) return;

      const currentPnl = parseFloat(position.curRealisedPnl);
      const pnlChange = Math.abs(currentPnl - this.longPositionPnl);

      // Funding payment detected (PnL changed)
      if (pnlChange > 0.001 && !this.fundingDetected) {
        this.fundingDetected = true;

        console.log('⚡⚡⚡ FUNDING PAYMENT DETECTED (Bybit)!');
        console.log(`   PnL Change: ${pnlChange.toFixed(4)}`);
        console.log(`   Time: ${new Date(position.updatedTime).toISOString()}`);

        await this.executeTrade(symbol);
      }
    });
  }

  private detectFundingBinance(ws: WebSocket, symbol: string) {
    ws.on('message', async (msg) => {
      const event = JSON.parse(msg);

      if (event.e === 'ACCOUNT_UPDATE' && event.a.m === 'FUNDING_FEE') {
        this.fundingDetected = true;

        const fundingAmount = event.a.B.find((b: any) => b.a === 'USDT')?.bc || '0';

        console.log('⚡⚡⚡ FUNDING PAYMENT DETECTED (Binance)!');
        console.log(`   Funding Amount: ${fundingAmount}`);
        console.log(`   Time: ${new Date(event.E).toISOString()}`);

        await this.executeTrade(symbol);
      }
    });
  }

  private async executeTrade(symbol: string) {
    const startTime = Date.now();

    // 1. Open SHORT immediately (PRIORITY - catch the drop!)
    await this.openShort(symbol, 100); // Real position size
    console.log(`✅ SHORT opened (+${Date.now() - startTime}ms)`);

    // 2. Close LONG (cleanup trigger position)
    await this.closeLong(symbol);
    console.log(`✅ LONG closed (+${Date.now() - startTime}ms)`);

    // 3. Monitor for price bottom
    this.monitorForExit(symbol, startTime);
  }

  private async monitorForExit(symbol: string, startTime: number) {
    const priceWs = await this.connectPriceWebSocket(symbol);

    let previousPrice = 0;
    let consecutiveUps = 0;

    priceWs.on('ticker', async (data) => {
      const currentPrice = parseFloat(data.lastPrice);
      const elapsed = Date.now() - startTime;

      // Calculate velocity
      if (previousPrice > 0) {
        const velocity = (currentPrice - previousPrice) / previousPrice;

        // Price reversing up
        if (velocity > 0.0001) {
          consecutiveUps++;
        } else {
          consecutiveUps = 0;
        }

        // Exit conditions
        if (
          consecutiveUps >= 2 ||    // Price bouncing
          elapsed > 6000            // Max hold time (6 seconds)
        ) {
          console.log('🎯 EXIT SIGNAL - Closing SHORT');
          await this.closeShort(symbol);

          const profit = await this.calculateProfit();
          console.log(`💰 Trade complete! Profit: ${profit.toFixed(4)}%`);
          process.exit(0);
        }
      }

      previousPrice = currentPrice;
    });
  }
}
```

---

## ⏱️ Performance Timing

### Expected Latency Breakdown

| Step | Bybit | Binance | Notes |
|------|-------|---------|-------|
| **Funding occurs** | 0ms | 0ms | T=0 |
| **WebSocket event** | +10ms | +10ms | Push notification |
| **Event processing** | +5ms | +5ms | Parse JSON |
| **Open SHORT order** | +60ms | +70ms | 🎯 Priority! Catch the drop |
| **Close LONG order** | +60ms | +70ms | Cleanup trigger position |
| **Total reaction time** | **135ms** | **155ms** | ⚡ Ultra-fast |

### Price Movement Window

Based on analysis of GATEIO RESOLV/USDT recording:
- **Drop starts**: ~69ms BEFORE scheduled funding (00:00:59.931)
- **Max drop**: +4.931s (5 seconds after drop start)
- **Drop magnitude**: -1.42%

**Available profit window**: ~4.8 seconds
**Our reaction time**: ~135-155ms
**Remaining profit window**: ~4.6 seconds ✅

---

## 🎯 Key Takeaways

### Bybit ✅
- **Pros**: Simple persistent connection, no keep-alive needed
- **Cons**: Indirect detection (must monitor PnL changes)
- **Best for**: Production systems (stable connection)

### Binance ✅
- **Pros**: Direct funding event (`m: "FUNDING_FEE"`), clear funding amount
- **Cons**: Requires listenKey management, keep-alive every 30-60min
- **Best for**: Development/testing (explicit funding events)

### Recommendation
**Use BINANCE for funding trigger detection** - explicit `FUNDING_FEE` event makes implementation cleaner and more reliable. The listenKey management overhead is worth the clarity.

---

## 📝 Implementation Checklist

- [ ] Create listenKey manager service (Binance)
- [ ] Implement WebSocket reconnection logic
- [ ] Add funding payment detection handlers
- [ ] Test with small LONG position (5 USDT)
- [ ] Implement SHORT entry logic
- [ ] Add price velocity monitoring
- [ ] Implement exit strategy (velocity reversal)
- [ ] Add comprehensive error handling
- [ ] Test latency (target <150ms reaction)
- [ ] Add performance metrics logging

---

## ⚠️ Important Notes

1. **Binance listenKey expires after 60 minutes** - must extend via PUT request every 30-60 minutes
2. **Only changed balances/positions are sent** - not full account state
3. **Funding fee event includes ONLY the affected asset** - position may or may not be included
4. **Isolated positions get both balance AND position update** during funding
5. **Bybit `curRealisedPnl` changes ONLY for current position** - not cumulative across positions
