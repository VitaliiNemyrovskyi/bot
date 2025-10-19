# Funding Rate Metrics - Quick Reference

## ✅ PHASE 1: QUICK WINS (Implement Now)

### 1. ⏱️ TIME TO FUNDING
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** None (calculation only)
- **Formula:** `(nextFundingTime - Date.now()) → "2h 15m"`

### 2. 💰 ESTIMATED APR
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** None (calculation only)
- **Formula:** `fundingSpread × 3 × 365 × 100 = APR%`
- **Example:** `0.0015 × 3 × 365 = 164.25%`

### 3. 💵 TOTAL FEES (Hardcoded)
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** None (hardcoded rates)
- **Rates:**
  - Bybit: 0.055% taker
  - BingX: 0.05% taker
  - MEXC: 0.03% taker
- **Formula:** `(fee1 + fee2) × 2 trades = total%`

### 4. 💸 NET APR
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** None (calculation only)
- **Formula:** `grossAPR - (totalFees × 3 × 365)`

### 5. 📊 24h VOLUME
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** Already available
- **Data:**
  - Bybit: `volume24h`, `turnover24h`
  - BingX: `volume`, `quoteVolume`
  - MEXC: `volume24`, `amount24`

### 6. 📈 OPEN INTEREST
- **Feasibility:** ⚠️ PARTIAL
- **Difficulty:** 🟡 Medium
- **API:** Partially available
- **Data:**
  - Bybit: ✅ `openInterest`, `openInterestValue`
  - BingX: ❌ Not in ticker (show "N/A")
  - MEXC: ✅ `holdVol`

### 7. 📉 VOLATILITY (Simple)
- **Feasibility:** ✅ YES
- **Difficulty:** 🟢 Easy
- **API:** Already available
- **Formula:** `((high24h - low24h) / low24h) × 100`

---

## ⏸️ PHASE 2: BACKEND REQUIRED (Plan for Later)

### 8. 📊 FUNDING HISTORY (24h)
- **Feasibility:** ⚠️ PARTIAL
- **Difficulty:** 🔴 Hard
- **Requirements:**
  - Backend database (PostgreSQL)
  - Cron job (store every 8h)
  - API endpoints:
    - Bybit: ✅ `/v5/market/history-fund-rate`
    - BingX: ❌ Unknown
    - MEXC: ✅ `/api/v1/contract/funding_rate/history`
- **Display:** `"AVG: -1.5% | MIN: -2.1% | MAX: -0.8%"`

### 9. 💵 DYNAMIC FEES
- **Feasibility:** ⚠️ PARTIAL
- **Difficulty:** 🟡 Medium
- **Requirements:**
  - Fetch from authenticated endpoints
  - Cache in database
- **Bybit:** ✅ `/v5/account/fee-rate`

---

## ❌ NOT RECOMMENDED (Too Complex / Not Available)

### 10. 💧 LIQUIDITY DEPTH (±2%)
- **Reason:** Too slow, rate-limited, heavy API calls
- **Alternative:** Show volume as proxy

### 11. ⚖️ LONG/SHORT RATIO
- **Reason:** Not available via public APIs
- **Alternative:** Use third-party (CoinGlass) if critical

### 12. 🔗 PRICE CORRELATION
- **Reason:** Complex calculation, low value
- **Status:** Phase 3 (optional)

---

## IMPLEMENTATION CHECKLIST

### Phase 1 (8-12 hours)
```
[ ] 1. Add timeToFunding() calculation
[ ] 2. Add estimatedAPR() calculation
[ ] 3. Add hardcoded FEES object
[ ] 4. Add totalFees() calculation
[ ] 5. Add netAPR() calculation
[ ] 6. Display 24h volume (already fetched)
[ ] 7. Display open interest (Bybit/MEXC)
[ ] 8. Add simple volatility calculation
[ ] 9. Update table columns
[ ] 10. Add filters for new metrics
[ ] 11. Test calculations
[ ] 12. Translate new strings
```

### Phase 2 (40-80 hours)
```
[ ] 1. Design database schema
[ ] 2. Create migration script
[ ] 3. Implement cron job
[ ] 4. Create historical stats endpoint
[ ] 5. Integrate with frontend
[ ] 6. Add dynamic fee fetching
[ ] 7. Test with real data
```

---

## CODE SNIPPETS

### TypeScript (Component)
```typescript
// Add to funding-rates.component.ts

readonly FEES = {
  BYBIT: 0.055,
  BINGX: 0.05,
  MEXC: 0.03
};

calculateAPR(fundingSpread: number): number {
  return fundingSpread * 3 * 365 * 100;
}

calculateFees(longExchange: string, shortExchange: string): number {
  return (this.FEES[longExchange] + this.FEES[shortExchange]) * 2;
}

calculateNetAPR(apr: number, fees: number): number {
  const feeAPR = fees * 3 * 365;
  return apr - feeAPR;
}

formatTimeToFunding(nextFundingTime: number): string {
  const time = nextFundingTime - Date.now();
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
```

### HTML Template
```html
<td>{{ calculateAPR(opp.fundingSpread) | number:'1.2-2' }}%</td>
<td>{{ calculateFees(opp.bestLong.exchange, opp.bestShort.exchange) }}%</td>
<td [class.positive]="netAPR > 0">{{ netAPR | number:'1.2-2' }}%</td>
<td>{{ formatVolume(opp.exchanges[0].volume24h) }}</td>
<td>{{ formatTimeToFunding(opp.exchanges[0].nextFundingTime) }}</td>
```

---

## FORMULAS

### APR Calculation
```
APR = fundingSpread × fundingsPerDay × daysPerYear
    = 0.0015 × 3 × 365
    = 1.6425
    = 164.25%
```

### Fee Calculation
```
Total Fees = (longFee + shortFee) × 2
           = (0.055 + 0.05) × 2
           = 0.21%
```

### Net APR Calculation
```
Gross APR = 164.25%
Fee APR = 0.21% × 3 × 365 = 230.55%
Net APR = 164.25% - 230.55% = -66.3% ❌ (not profitable)

// Better spread example:
Gross APR = 600%
Fee APR = 230.55%
Net APR = 600% - 230.55% = 369.45% ✅ (profitable)
```

---

## TYPICAL FEE STRUCTURE

| Exchange | Maker  | Taker  | Total (4 trades) |
|----------|--------|--------|------------------|
| Bybit    | 0.02%  | 0.055% | 0.22%           |
| BingX    | 0.02%  | 0.05%  | 0.20%           |
| MEXC     | 0.00%  | 0.03%  | 0.12%           |

---

## RECOMMENDED TABLE LAYOUT

```
| Symbol | Exchanges | Spread | APR   | Net APR | Fees  | Volume  | OI     | Funding | Chart |
|--------|-----------|--------|-------|---------|-------|---------|--------|---------|-------|
| BTC    | BY+BX     | 0.25%  | 273%  | 32%  ✅ | 0.22% | $2.3B   | 45K    | 2h 15m  | 📊   |
| ETH    | BY+MX     | 0.10%  | 110%  | -121% ❌| 0.21% | $1.1B   | 120K   | 2h 15m  | 📊   |
```

---

## TRANSLATION KEYS (Add to all languages)

```typescript
fundingRates: {
  metrics: {
    timeToFunding: 'Time to Funding',
    estimatedAPR: 'Est. APR',
    totalFees: 'Total Fees',
    netAPR: 'Net APR',
    volume24h: '24h Volume',
    openInterest: 'Open Interest',
    volatility: 'Volatility',
    fundingHistory: 'Funding History (24h)'
  }
}
```

---

## NEXT STEPS

1. ✅ Review analysis document
2. 🔜 Implement Phase 1 metrics
3. 🔜 Test calculations with real data
4. 🔜 Add translations
5. ⏸️ Plan Phase 2 backend work

**Estimated Delivery:** Phase 1 in 1-2 days
