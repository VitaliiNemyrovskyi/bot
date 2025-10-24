# 🛡️ Liquidation Protection System

## Огляд

Система автоматичного захисту від ліквідації для leveraged arbitrage позицій. Включає:

1. **Liquidation Calculator** - розрахунок liquidation price для різних бірж
2. **Liquidation Monitor** - постійний моніторинг ризику ліквідації
3. **Auto-Close Protection** - автоматичне закриття позицій при критичному ризику
4. **Alert System** - попередження про небезпеку

## Архітектура

```
┌─────────────────────────────────────────────────────────────┐
│  Liquidation Monitor Service (runs every 10 seconds)       │
│  - Monitors all ACTIVE positions                           │
│  - Calculates liquidation proximity                        │
│  - Updates database with risk metrics                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Proximity >= 80%
                              ▼
              ┌───────────────────────────────┐
              │  DANGER ALERT (80%-89%)       │
              │  - Log warning                │
              │  - Send notification          │
              │  - Update database flag       │
              └───────────────────────────────┘
                              │
                              │ Proximity >= 90%
                              ▼
              ┌───────────────────────────────┐
              │  CRITICAL - AUTO-CLOSE        │
              │  - Trigger emergency close    │
              │  - Close PRIMARY position     │
              │  - Close HEDGE position       │
              │  - Update status to COMPLETED │
              └───────────────────────────────┘
```

## Компоненти

### 1. LiquidationCalculator (`/lib/liquidation-calculator.ts`)

Розраховує liquidation price та proximity для позицій:

```typescript
// Приклад використання
const liq = LiquidationCalculator.calculateLiquidation('BYBIT', {
  entryPrice: 100,
  quantity: 1,
  leverage: 3,
  side: 'long'
});

console.log(liq.liquidationPrice);  // ~66.5 (price drops 33%)
console.log(liq.safeStopLoss);      // ~73.3 (20% away from liq)
console.log(liq.criticalStopLoss);  // ~69.9 (10% away from liq)
```

**Ключові формули:**

For LONG (3x leverage):
- Liquidation Price = Entry × (1 - 1/3 + 0.005) = Entry × 0.672
- При 3x, втрата 33% від entry = ліквідація
- Safe SL встановлюється на відстані 20% від liquidation

For SHORT (3x leverage):
- Liquidation Price = Entry × (1 + 1/3 - 0.005) = Entry × 1.328
- При 3x, зростання 33% від entry = ліквідація

### 2. Liquidation Monitor Service (`/services/liquidation-monitor.service.ts`)

Автоматичний моніторинг усіх активних позицій:

**Параметри:**
- `checkIntervalMs`: 10000 (10 секунд)
- `dangerThreshold`: 0.8 (80%)
- `criticalThreshold`: 0.9 (90%)
- `autoCloseEnabled`: true

**Процес моніторингу:**

1. Кожні 10 секунд перевіряє всі ACTIVE позиції
2. Для кожної позиції:
   - Розраховує liquidation price
   - Обчислює proximity (current vs liq)
   - Оновлює БД з метриками
3. Якщо proximity >= 80%:
   - Відправляє DANGER alert
   - Встановлює `liquidationAlertSent = true`
4. Якщо proximity >= 90%:
   - Емітує `AUTO_CLOSE_TRIGGERED` event
   - Graduated Entry Service автоматично закриває обидві позиції

**Події:**
- `POSITION_IN_DANGER` - proximity >= 80%
- `POSITION_CRITICAL` - proximity >= 90%
- `AUTO_CLOSE_TRIGGERED` - ініціює emergency close
- `LIQUIDATION_UPDATED` - оновлення метрик

### 3. Emergency Close (`graduated-entry-arbitrage.service.ts`)

Автоматичне закриття при критичному ризику:

```typescript
async emergencyClosePosition(positionId: string, reason: string)
```

**Дії:**
1. Знаходить позицію в пам'яті
2. Відписується від price updates
3. Закриває PRIMARY position
4. Закриває HEDGE position (паралельно)
5. Оновлює статус в БД на COMPLETED
6. Видаляє з активних позицій

**Логування:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ EMERGENCY POSITION CLOSURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position ID: arb_1_1234567890
Reason: Automatic liquidation protection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[GraduatedEntry] 🚨 Closing BOTH positions to prevent liquidation...
[GraduatedEntry] ✅ EMERGENCY CLOSE SUCCESSFUL - Both positions closed
[GraduatedEntry] ✓ Position arb_1_1234567890 emergency closed and removed
```

## База даних

**Поля в `graduated_entry_positions`:**

```sql
-- Liquidation tracking
primaryLiquidationPrice   FLOAT    -- Розрахована liq price для primary
hedgeLiquidationPrice     FLOAT    -- Розрахована liq price для hedge
primaryProximityRatio     FLOAT    -- 0.0-1.0+ (0.9 = 90% до ліквідації)
hedgeProximityRatio       FLOAT    -- 0.0-1.0+
primaryInDanger           BOOLEAN  -- TRUE якщо proximity >= 80%
hedgeInDanger             BOOLEAN  -- TRUE якщо proximity >= 80%
lastLiquidationCheck      TIMESTAMP -- Час останньої перевірки
liquidationAlertSent      BOOLEAN  -- TRUE після відправки alert
```

## Запуск системи

Система автоматично запускається при старті backend:

```typescript
// instrumentation.ts
const { liquidationMonitorService } = await import('@/services/liquidation-monitor.service');
liquidationMonitorService.startMonitoring();
```

Graduated Entry Service підписується на події:

```typescript
liquidationMonitorService.on('AUTO_CLOSE_TRIGGERED', async (risk) => {
  await graduatedEntryService.emergencyClosePosition(risk.positionId, 'Liquidation protection');
});
```

## Приклад роботи

### Сценарій: Long на Bybit, Short на Gate.io, 3x leverage

**Початкова ситуація:**
- Entry Price: 1.00 USDT
- Leverage: 3x
- Liquidation (Long): ~0.672 USDT (drop 33%)
- Safe SL: ~0.732 USDT

**Моніторинг:**

| Current Price | Proximity | Status | Action |
|--------------|-----------|---------|--------|
| 1.00 | 0% | ✅ Safe | None |
| 0.90 | 31% | ✅ Safe | None |
| 0.80 | 61% | ✅ Safe | None |
| 0.75 | **76%** | ⚠️ Warning | Log warning |
| 0.73 | **82%** | 🚨 DANGER | Send alert |
| 0.70 | **91%** | 🛡️ CRITICAL | **AUTO-CLOSE** |

**При auto-close:**
1. Закривається Long на Bybit
2. Закривається Short на Gate.io
3. Статус → COMPLETED
4. Reason: "Automatic liquidation protection"

## Налаштування

### Зміна порогів

Відредагуйте `instrumentation.ts`:

```typescript
const { liquidationMonitorService, LiquidationMonitorService } = await import('@/services/liquidation-monitor.service');

// Створити з кастомними налаштуваннями
const customMonitor = new LiquidationMonitorService({
  checkIntervalMs: 5000,      // Перевіряти кожні 5 сек
  dangerThreshold: 0.7,       // Alert при 70%
  criticalThreshold: 0.85,    // Auto-close при 85%
  autoCloseEnabled: true,     // Увімкнути auto-close
});

customMonitor.startMonitoring();
```

### Вимкнення auto-close

```typescript
const monitor = new LiquidationMonitorService({
  autoCloseEnabled: false,  // Тільки alerts, без auto-close
});
```

## Альтернатива: Synchronized SL/TP

Замість active monitoring можна використати нативні SL/TP ордери:

```typescript
// Розрахувати синхронізовані SL/TP
const sltp = LiquidationCalculator.calculateSynchronizedSLTP({
  primaryEntryPrice: 1.00,
  primarySide: 'long',
  primaryLeverage: 3,
  primaryExchange: 'BYBIT',
  hedgeEntryPrice: 1.00,
  hedgeSide: 'short',
  hedgeLeverage: 3,
  hedgeExchange: 'GATEIO',
});

console.log(sltp);
// {
//   primaryStopLoss: 0.732,     // Primary SL
//   primaryTakeProfit: 1.328,   // = Hedge SL price
//   hedgeStopLoss: 1.328,       // Hedge SL
//   hedgeTakeProfit: 0.732,     // = Primary SL price
//   explanation: "..."
// }
```

**Концепція:**
- Коли Primary досягає SL → Hedge досягає TP
- Коли Hedge досягає SL → Primary досягає TP
- Обидві позиції закриваються одночасно біржами

## Тестування

```bash
# Запустити backend
npm run dev

# Перевірити логи
tail -f /tmp/backend.log | grep "LiquidationMonitor\|EMERGENCY"

# Створити тестову позицію з високим leverage
# Чекати на price movements
# Спостерігати за proximity updates
```

## Переваги системи

✅ **Автоматичний захист** - не потрібно постійно моніторити
✅ **Двосторонній** - захищає обидві позиції арбітражу
✅ **Швидкий** - перевірка кожні 10 секунд
✅ **Гнучкий** - налаштовувані пороги
✅ **Прозорий** - детальне логування всіх дій
✅ **Надійний** - працює навіть після рестарту backend

## Обмеження

⚠️ **Network latency** - можлива затримка між detect і close
⚠️ **Flash crashes** - екстремальні рухи можуть ліквідувати до спрацювання
⚠️ **API rate limits** - може затримати закриття
⚠️ **Partial fills** - можлива неповна ліквідація однієї сторони

## Рекомендації

1. **Не використовуйте занадто високий leverage** (максимум 3-5x для arbitrage)
2. **Налаштуйте lower thresholds для volatile assets** (60% danger, 75% critical)
3. **Регулярно перевіряйте логи** на наявність alerts
4. **Встановіть backup manual monitoring** на перші дні
5. **Тестуйте на малих позиціях** перед використанням великих сум

## Додаткові можливості

### Notifications (TODO)

Додати email/telegram/webhook notifications:

```typescript
// liquidation-monitor.service.ts - sendAlert()
// TODO: Implement email notifications
// TODO: Implement Telegram bot integration
// TODO: Implement webhook callbacks
```

### Dashboard (TODO)

Візуалізація ризиків в real-time:

- Real-time proximity charts
- Historical liquidation events
- Risk heatmap per position
- Alert history log

## Контакти

Якщо виникли питання або проблеми з системою захисту - перевірте логи та БД.

---

**🛡️ Stay safe! Trade smart!**
