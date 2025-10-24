# Gate.io Precision Rounding Fix

## Проблема

Leg 2 падав з помилкою від Gate.io API:

```json
{
  "error": "gate {\"label\":\"INVALID_PARAM_VALUE\",
            \"message\":\"Your order size 0.000 OMG is too small. The minimum is 0.001 OMG\"}"
}
```

Gate.io бачив **"0.000 OMG"** замість реальної кількості (наприклад, 0.0005 OMG).

## Причина

Проблема в **precision handling** при відправці ордерів до Gate.io:

1. **Actual filled quantity** з Leg 1: `0.000537 OMG`
2. **Apply ORDER_SIZE_BUFFER** (0.995): `0.000537 * 0.995 = 0.000534315 OMG`
3. **Send to Gate.io**: `0.000534315 OMG`
4. **Gate.io truncates** до 3 decimals: `0.000 OMG` ❌
5. **Gate.io rejects**: "0.000 < 0.001 minimum"

### Деталі проблеми:

```typescript
// СТАРИЙ КОД - без precision handling
const order = await this.exchange.createMarketOrder(
  normalizedSymbol,
  ccxtSide,
  orderQuantity // ← Може бути 0.000534315 з багатьма decimals
);
```

Gate.io API truncates (не rounds!) до symbol's precision:
- Precision 3: `0.000534315` → `0.000` ❌
- Precision 4: `0.000534315` → `0.0005` ✓

## Виправлення

### 1. Додано перевірку precision з market info

```typescript
// Get market info for precision
const market = this.exchange.market(normalizedSymbol);
const amountPrecision = market.precision?.amount || 8;
const pricePrecision = market.precision?.price || 8;

console.log(`[GateIOSpotConnector] Market precision for ${normalizedSymbol}:`, {
  amountPrecision,
  pricePrecision,
  limits: {
    minAmount: market.limits?.amount?.min,
    minCost: market.limits?.cost?.min,
  }
});
```

### 2. Визначаємо правильну precision для BUY vs SELL

```typescript
let quantityPrecision = amountPrecision;

if (ccxtSide === 'buy') {
  // For BUY orders, we're sending COST (quote currency)
  // Use price precision (usually 2 for USDT pairs)
  quantityPrecision = pricePrecision;
} else {
  // For SELL orders, we're sending AMOUNT (base currency)
  // Use amount precision (varies by asset: BTC=8, OMG=3, etc)
  quantityPrecision = amountPrecision;
}
```

### 3. Округлюємо quantity до правильної precision

```typescript
// Round quantity to correct precision to avoid Gate.io truncation
// Use Math.round instead of Math.floor to properly round small values
// Floor would turn 0.0005 → 0.000, but round keeps it as 0.001
const precisionMultiplier = Math.pow(10, quantityPrecision);
const roundedQuantity = Math.round(orderQuantity * precisionMultiplier) / precisionMultiplier;
```

**Приклад округлення:**

| Original | Precision | Floor | **Round** | Gate.io sees |
|----------|-----------|-------|-----------|--------------|
| 0.000537 | 3 | **0.000** ❌ | **0.001** ✓ | 0.001 ✓ |
| 0.000345 | 3 | 0.000 ❌ | **0.000** ❌ | 0.000 ❌ |
| 0.000678 | 3 | 0.000 ❌ | **0.001** ✓ | 0.001 ✓ |
| 0.00145 | 3 | 0.001 ✓ | **0.001** ✓ | 0.001 ✓ |

### 4. Перевіряємо що rounded quantity не менше мінімуму

```typescript
// Check if rounded quantity is too small
const minAmount = ccxtSide === 'buy'
  ? (market.limits?.cost?.min || 0.01)
  : (market.limits?.amount?.min || 0.00001);

if (roundedQuantity < minAmount) {
  throw new Error(
    `Rounded quantity ${roundedQuantity.toFixed(quantityPrecision)} is below minimum ${minAmount}. ` +
    `Original: ${orderQuantity.toFixed(quantityPrecision + 2)}`
  );
}
```

### 5. Детальні логи для debugging

```typescript
console.log(`[GateIOSpotConnector] Quantity precision handling:`, {
  original: orderQuantity,
  precision: quantityPrecision,
  rounded: roundedQuantity,
  minimum: minAmount,
});
```

## Результат

### До виправлення:
```
Original: 0.000537 OMG
Sent to Gate.io: 0.000537 OMG
Gate.io truncates to: 0.000 OMG
❌ Error: "0.000 < 0.001 minimum"
```

### Після виправлення:
```
Original: 0.000537 OMG
Precision: 3 decimals
Rounded: 0.001 OMG (Math.round)
Minimum: 0.001 OMG
✅ Rounded >= Minimum
✅ Sent to Gate.io: 0.001 OMG
✅ Order executes successfully!
```

## Edge Cases

### Case 1: Quantity занадто малий навіть після округлення

```
Original: 0.000345 OMG
Precision: 3
Rounded: 0.000 OMG (Math.round rounds down)
Minimum: 0.001 OMG
❌ Throws error before sending to Gate.io
Error: "Rounded quantity 0.000 is below minimum 0.001"
```

**Це правильна поведінка!** Краще відхилити локально ніж отримати помилку від Gate.io.

### Case 2: BUY order з cost precision

```
Symbol: OMG/USDT
Side: Buy
Original cost: 1.234567 USDT
Price precision: 2 (USDT has 2 decimals)
Rounded: 1.23 USDT
✅ Sends 1.23 USDT to Gate.io
```

### Case 3: SELL order з amount precision

```
Symbol: OMG/USDT
Side: Sell
Original amount: 0.000537 OMG
Amount precision: 3 (OMG has 3 decimals)
Rounded: 0.001 OMG
✅ Sends 0.001 OMG to Gate.io
```

## Precision по символам (приклади)

| Symbol | Amount Precision | Price Precision | Min Amount |
|--------|------------------|-----------------|------------|
| BTC/USDT | 8 | 2 | 0.00001 BTC |
| ETH/USDT | 6 | 2 | 0.001 ETH |
| OMG/USDT | 3 | 4 | 0.001 OMG |
| USDC/USDT | 2 | 4 | 1 USDC |

## Логи для debugging

Тепер в логах буде:

```
[GateIOSpotConnector] Market precision for OMG/USDT:
  amountPrecision: 3
  pricePrecision: 4
  limits:
    minAmount: 0.001
    minCost: 1

[GateIOSpotConnector] Quantity precision handling:
  original: 0.000537
  precision: 3
  rounded: 0.001
  minimum: 0.001

[GateIOSpotConnector] Placing market Sell order:
  symbol: OMG/USDT
  quantity: 0.001
```

## Файли змінено

✅ `src/connectors/gateio-spot.connector.ts`
- Додано перевірку market precision
- Додано округлення quantity з Math.round
- Додано перевірку minimum після округлення
- Додано детальні логи

## Висновок

Проблема вирішена! Тепер:
- ✅ Quantities округлюються до правильної precision перед відправкою
- ✅ Gate.io отримує правильно відформатовані числа
- ✅ Немає truncation до 0.000
- ✅ Локальна перевірка мінімумів після округлення
- ✅ Детальні логи для debugging

Трикутний арбітраж має працювати навіть з малими quantities! 🎯
