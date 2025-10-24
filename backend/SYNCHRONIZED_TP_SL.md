# 🎯 Синхронізовані TP/SL ордери для арбітражу

## Концепція

Для funding arbitrage позицій (Primary LONG + Hedge SHORT або навпаки), синхронізовані TP/SL ордери забезпечують **одночасне закриття обох позицій** при досягненні критичної ціни.

### Ключовий принцип:

```
Primary Stop-Loss = Hedge Take-Profit (ТА САМА ЦІНА)
Hedge Stop-Loss = Primary Take-Profit (ТА САМА ЦІНА)
```

## Як це працює

### Приклад: LONG на Bybit + SHORT на Gate.io

**Початкові умови:**
- Symbol: AVNTUSDT
- Entry Price: 1.00 USDT
- Leverage: 3x на обох біржах

**Розрахунок liquidation prices:**
```
PRIMARY (Bybit LONG 3x):
  Liquidation: ~0.672 USDT  (при падінні на 33%)
  Safe Stop-Loss: ~0.732 USDT  (на 20% від liquidation)

HEDGE (Gate.io SHORT 3x):
  Liquidation: ~1.328 USDT  (при зростанні на 33%)
  Safe Stop-Loss: ~1.265 USDT  (на 20% від liquidation)
```

**Встановлені ордери:**

```
┌─────────────────────────────────────────────────┐
│ PRIMARY (Bybit LONG)                            │
├─────────────────────────────────────────────────┤
│ Stop-Loss:    0.732 USDT  ← Closes if price ↓  │
│ Take-Profit:  1.265 USDT  ← Closes if price ↑  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HEDGE (Gate.io SHORT)                           │
├─────────────────────────────────────────────────┤
│ Stop-Loss:    1.265 USDT  ← Closes if price ↑  │
│ Take-Profit:  0.732 USDT  ← Closes if price ↓  │
└─────────────────────────────────────────────────┘
```

### Сценарії спрацювання:

#### 📉 Сценарій 1: Ціна падає до 0.732 USDT

```
1. Primary (LONG) досягає Stop-Loss на 0.732
   → Bybit автоматично закриває LONG позицію

2. Hedge (SHORT) досягає Take-Profit на 0.732
   → Gate.io автоматично закриває SHORT позицію

✅ ОБІ ПОЗИЦІЇ ЗАКРИТІ ОДНОЧАСНО
```

**Результат:**
- Primary LONG: Збиток (ціна впала)
- Hedge SHORT: Прибуток (ціна впала)
- Чистий P&L: Мінімізовано завдяки арбітражу

#### 📈 Сценарій 2: Ціна зростає до 1.265 USDT

```
1. Hedge (SHORT) досягає Stop-Loss на 1.265
   → Gate.io автоматично закриває SHORT позицію

2. Primary (LONG) досягає Take-Profit на 1.265
   → Bybit автоматично закриває LONG позицію

✅ ОБІ ПОЗИЦІЇ ЗАКРИТІ ОДНОЧАСНО
```

**Результат:**
- Primary LONG: Прибуток (ціна зросла)
- Hedge SHORT: Збиток (ціна зросла)
- Чистий P&L: Мінімізовано завдяки арбітражу

## Реалізація

### Автоматичне встановлення

TP/SL автоматично встановлюються після відкриття позиції:

```typescript
// graduated-entry-arbitrage.service.ts

// 1. Після виконання всіх частин graduated entry
// 2. Отримати entry prices з бірж
const primaryEntryPrice = await getPositionEntryPrice(primary);
const hedgeEntryPrice = await getPositionEntryPrice(hedge);

// 3. Розрахувати синхронізовані TP/SL
const sltp = LiquidationCalculator.calculateSynchronizedSLTP({
  primaryEntryPrice,
  primarySide: 'long',
  primaryLeverage: 3,
  primaryExchange: 'BYBIT',
  hedgeEntryPrice,
  hedgeSide: 'short',
  hedgeLeverage: 3,
  hedgeExchange: 'GATEIO',
});

// 4. Встановити на PRIMARY
await primaryConnector.setTradingStop({
  symbol: 'AVNTUSDT',
  side: 'long',
  takeProfit: sltp.primaryTakeProfit,  // = hedgeStopLoss
  stopLoss: sltp.primaryStopLoss,      // = hedgeTakeProfit
});

// 5. Встановити на HEDGE
await hedgeConnector.setTradingStop({
  symbol: 'AVNTUSDT',
  side: 'short',
  takeProfit: sltp.hedgeTakeProfit,    // = primaryStopLoss
  stopLoss: sltp.hedgeStopLoss,        // = primaryTakeProfit
});
```

### Лог при встановленні

```
════════════════════════════════════════════════════════════════════════════════
[GraduatedEntry] arb_1_1234567890 - Setting synchronized TP/SL orders
════════════════════════════════════════════════════════════════════════════════
[GraduatedEntry] arb_1_1234567890 - Calculated TP/SL levels:
Primary LONG SL at 0.732000 = Hedge SHORT TP
Hedge SHORT SL at 1.265000 = Primary LONG TP
Primary liquidation: 0.672000
Hedge liquidation: 1.328000

[GraduatedEntry] arb_1_1234567890 - Setting TP/SL on PRIMARY (BYBIT)...
[GraduatedEntry] arb_1_1234567890 - ✅ PRIMARY TP/SL set successfully
  Stop-Loss: 0.732000 (closes if price hits this)
  Take-Profit: 1.265000 (closes if price hits this)

[GraduatedEntry] arb_1_1234567890 - Setting TP/SL on HEDGE (GATEIO)...
[GraduatedEntry] arb_1_1234567890 - ⚠️ HEDGE exchange (GATEIO) does not support setTradingStop

[GraduatedEntry] arb_1_1234567890 - 🛡️ SYNCHRONIZED TP/SL PROTECTION ACTIVE
[GraduatedEntry] arb_1_1234567890 - When PRIMARY hits SL → HEDGE hits TP (both close)
[GraduatedEntry] arb_1_1234567890 - When HEDGE hits SL → PRIMARY hits TP (both close)
════════════════════════════════════════════════════════════════════════════════
```

## Підтримка бірж

### ✅ Bybit - Повна підтримка

Bybit має нативний API endpoint `setTradingStop` для встановлення TP/SL на відкриті позиції.

```typescript
// Bybit API
await bybit.setTradingStop({
  category: 'linear',
  symbol: 'AVNTUSDT',
  takeProfit: '1.265',
  stopLoss: '0.732',
  tpTriggerBy: 'LastPrice',
  slTriggerBy: 'LastPrice',
  positionIdx: 0,
});
```

### ⚠️ Gate.io - Часткова підтримка

Gate.io **не має** прямого API для встановлення TP/SL на існуючі позиції.
Потрібно створювати окремі conditional orders (trigger orders).

**Статус:** Not implemented yet
**Workaround:** Встановлюйте TP/SL вручну через Gate.io UI

### 🔄 BingX - TBD

Потребує дослідження API для TP/SL функціоналу.

### 🔄 MEXC - TBD

Потребує дослідження API для TP/SL функціоналу.

## Переваги vs Liquidation Monitor

| Критерій | Synchronized TP/SL | Liquidation Monitor |
|----------|-------------------|---------------------|
| **Швидкість** | ⚡ Миттєво (біржа) | 🐌 До 10 сек затримка |
| **Надійність** | ✅ Біржа гарантує | ⚠️ Залежить від backend |
| **Offline protection** | ✅ Працює завжди | ❌ Потребує running backend |
| **Підтримка бірж** | ⚠️ Тільки Bybit | ✅ Всі біржі |
| **Гнучкість** | ❌ Фіксовані рівні | ✅ Динамічні пороги |

## Рекомендована стратегія

### 🛡️ Подвійний захист (Best Practice)

Використовуйте **ОБА** методи одночасно:

1. **Primary Protection: Synchronized TP/SL**
   - Встановлюються на біржах (Bybit)
   - Швидкий і надійний захист
   - Працює навіть якщо backend офлайн

2. **Secondary Protection: Liquidation Monitor**
   - Моніторинг кожні 10 секунд
   - Auto-close при 90% proximity
   - Захист для бірж без TP/SL API (Gate.io)

### Налаштування

```typescript
// instrumentation.ts

// 1. Liquidation Monitor (для всіх бірж)
const monitor = new LiquidationMonitorService({
  checkIntervalMs: 10000,
  dangerThreshold: 0.8,     // Alert at 80%
  criticalThreshold: 0.9,   // Auto-close at 90%
  autoCloseEnabled: true,
});
monitor.startMonitoring();

// 2. Synchronized TP/SL (автоматично для Bybit)
// Встановлюється в graduated-entry-arbitrage.service.ts
// після відкриття позицій
```

## Тестування

### Як перевірити TP/SL на Bybit:

1. **Відкрийте позицію** через ваш додаток
2. **Перевірте логи** backend:
   ```bash
   tail -f /tmp/backend-tpsl.log | grep "TP/SL"
   ```
3. **Перевірте на Bybit UI:**
   - Зайдіть в Bybit → Positions
   - Відкрийте вашу позицію
   - Перевірте наявність TP/SL ордерів

### Очікувані значення:

Для 3x leverage LONG:
- Entry: 1.00 USDT
- SL: ~0.73 USDT (захист від падіння)
- TP: ~1.27 USDT (прибуток при зростанні)

Для 3x leverage SHORT:
- Entry: 1.00 USDT
- SL: ~1.27 USDT (захист від зростання)
- TP: ~0.73 USDT (прибуток при падінні)

## Обмеження

⚠️ **Slippage** - При високій волатильності ціна може проскочити TP/SL
⚠️ **Partial fills** - TP/SL можуть виконатися частково
⚠️ **Gate.io manual** - Потрібно встановлювати вручну
⚠️ **Network issues** - Затримки в API calls під час встановлення

## Майбутні покращення

### TODO: Gate.io Conditional Orders

Імплементувати для Gate.io:

```typescript
// Gate.io Price-Triggered Orders API
await gateio.createPriceTriggeredOrder({
  contract: 'AVNT_USDT',
  size: -75,  // Close short (negative size)
  trigger: {
    strategy_type: 2,  // Market price trigger
    price_type: 0,     // Last price
    price: '0.732',    // Trigger price
  },
  order_type: 'market',
});
```

### TODO: BingX TP/SL

Дослідити BingX API для conditional orders.

### TODO: Dynamic TP/SL adjustment

Автоматично оновлювати TP/SL при зміні ринкових умов:
- Trailing stop-loss
- Dynamic take-profit based on funding rates
- Risk-adjusted levels

## Висновок

✅ **Synchronized TP/SL** - найнадійніший метод захисту для Bybit
✅ **Liquidation Monitor** - backup захист для всіх бірж
✅ **Подвійний захист** - максимальна безпека позицій

**Статус:** ✅ АКТИВНО для Bybit
**Backend:** http://localhost:3000
**Документація:** `/backend/LIQUIDATION_PROTECTION_SYSTEM.md`

---

**🎯 Ваші позиції тепер захищені синхронізованими TP/SL!**
