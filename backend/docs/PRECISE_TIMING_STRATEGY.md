# Precise Timing Strategy

Стратегия с точным таймингом для открытия позиций ровно через 20мс после времени фандинга с компенсацией латентности.

## 📋 Обзор

Эта стратегия открывает позицию **точно в 00:00:00.020** (20 миллисекунд после фандинга) с автоматической компенсацией сетевой задержки.

### Ключевые особенности:

1. **Точная синхронизация времени** - Синхронизация с сервером Bybit каждые 5 секунд
2. **Авто-определение стороны** - Автоматически определяет какую сторону открывать по funding rate
3. **Компенсация латентности** - Отправляет ордер заранее чтобы он исполнился точно в целевое время
4. **WebSocket мониторинг** - Опциональный real-time мониторинг позиций
5. **Авто-повтор** - Возможность автоматически повторять на следующий цикл фандинга
6. **TP/SL защита** - Автоматические Take Profit и Stop Loss

## 🎯 Как это работает

### 1. Синхронизация времени

```
Каждые 5 секунд:
offset = serverTime - (localTime + latency/2)
```

### 2. Определение стороны позиции

**Режим "Auto"** (рекомендуется):
- Положительный funding rate (> 0) → Открывает **LONG** (Buy)
  - Лонги платят шортам → открываем лонг чтобы заплатить и получить hedge profit
- Отрицательный funding rate (< 0) → Открывает **SHORT** (Sell)
  - Шорты платят лонгам → открываем шорт чтобы заплатить и получить hedge profit

**Ручной режим**:
- Указываете 'Buy' или 'Sell' напрямую

### 3. Расчет времени с компенсацией

```
targetTime = fundingTime + 20ms        // 00:00:00.020
latency = estimateLatency()            // Измеряем RTT/2
sendTime = targetTime - latency        // Отправляем раньше!
```

**Пример**:
- Funding time: `2025-10-13 16:00:00.000`
- Target execution: `2025-10-13 16:00:00.020`
- Measured latency: `50ms`
- Order send time: `2025-10-13 15:59:59.970` (на 30ms раньше цели)

### 4. Исполнение ордера

Ордер исполняется точно в `targetTime` благодаря компенсации латентности.

## 💻 Использование

### Конфигурация

```typescript
import { bybitFundingStrategyService } from './services/bybit-funding-strategy.service';

const config = {
  // Основные параметры
  userId: 'user_123',
  symbol: 'BTCUSDT',
  leverage: 10,                        // Кредитное плечо
  margin: 100,                         // Маржа в USDT

  // Настройка стороны
  positionSide: 'Auto',                // 'Auto', 'Buy', или 'Sell'

  // Take Profit / Stop Loss
  takeProfitPercent: 90,               // 90% от ожидаемого funding
  stopLossPercent: 50,                 // 50% от ожидаемого funding

  // Тайминг
  timingOffset: 20,                    // Миллисекунды после фандинга

  // Дополнительные настройки
  autoRepeat: true,                    // Авто-повтор на следующий цикл
  enableWebSocketMonitoring: true,     // WebSocket мониторинг
};

// Запуск стратегии
const strategyId = await bybitFundingStrategyService.startPreciseTimingStrategy(
  config,
  apiKey,
  apiSecret,
  false,  // testnet (false = mainnet)
  credentialId
);
```

### Параметры конфигурации

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `userId` | string | ID пользователя | `"user_123"` |
| `symbol` | string | Торговая пара | `"BTCUSDT"` |
| `leverage` | number | Кредитное плечо | `10` |
| `margin` | number | Маржа в USDT | `100` |
| `positionSide` | `'Auto'` \| `'Buy'` \| `'Sell'` | Сторона позиции | `"Auto"` |
| `takeProfitPercent` | number | % от expected funding для TP | `90` |
| `stopLossPercent` | number | % от expected funding для SL | `50` |
| `timingOffset` | number | Миллисекунды после фандинга | `20` |
| `autoRepeat` | boolean | Авто-повтор | `true` |
| `enableWebSocketMonitoring` | boolean | WebSocket мониторинг | `true` |

## 📊 Мониторинг

### События стратегии

```typescript
// Обратный отсчет
bybitFundingStrategyService.on('countdown', (data) => {
  console.log(`⏰ ${data.secondsRemaining}s до фандинга`);
});

// Открытие позиции
bybitFundingStrategyService.on('position_opening', (data) => {
  console.log(`🔓 Открываем ${data.side} позицию по ${data.symbol}`);
});

// Позиция открыта
bybitFundingStrategyService.on('position_opened', (data) => {
  console.log(`✅ Позиция открыта: Entry=${data.entryPrice}, TP=${data.tpPrice}, SL=${data.slPrice}`);
});

// Позиция закрыта
bybitFundingStrategyService.on('position_closed', (data) => {
  console.log(`🔒 Позиция закрыта: ${data.reason}`);
});

// Ошибка
bybitFundingStrategyService.on('error', (data) => {
  console.error(`❌ Ошибка: ${data.error}`);
});
```

## 🧪 Тестирование

### Dry-run тест (без API ключей)

```bash
npx tsx src/test-precise-timing-dry-run.ts
```

Проверяет:
- ✅ Существование методов
- ✅ Логику определения стороны
- ✅ Корректность расчетов

### Полный тест (с testnet)

```bash
# Добавьте ключи в .env.local:
# BYBIT_TESTNET_API_KEY=your_key
# BYBIT_TESTNET_API_SECRET=your_secret

npx tsx src/test-precise-timing-strategy.ts
```

## 📈 Примеры

### Пример 1: Auto режим с авто-повтором

```typescript
const strategyId = await bybitFundingStrategyService.startPreciseTimingStrategy(
  {
    userId: 'admin_1',
    symbol: 'BTCUSDT',
    leverage: 10,
    margin: 100,
    positionSide: 'Auto',      // Авто-определение
    takeProfitPercent: 90,
    stopLossPercent: 50,
    timingOffset: 20,
    autoRepeat: true,          // Повторять каждый цикл
    enableWebSocketMonitoring: true,
  },
  apiKey,
  apiSecret,
  false  // mainnet
);
```

### Пример 2: Ручной режим, без авто-повтора

```typescript
const strategyId = await bybitFundingStrategyService.startPreciseTimingStrategy(
  {
    userId: 'admin_1',
    symbol: 'ETHUSDT',
    leverage: 5,
    margin: 50,
    positionSide: 'Buy',       // Всегда Buy
    takeProfitPercent: 80,
    stopLossPercent: 60,
    timingOffset: 30,          // Через 30ms после фандинга
    autoRepeat: false,         // Один раз
    enableWebSocketMonitoring: false,  // Без WebSocket
  },
  apiKey,
  apiSecret,
  true  // testnet
);
```

## 🎓 Логика определения стороны (Auto режим)

### Почему открываем сторону которая ПЛАТИТ?

Эта стратегия предназначена для **второй позиции** в dual-strategy:

1. **До фандинга (00:00:00)**: Первая позиция собирает funding
2. **После фандинга (+20ms)**: Вторая позиция (эта стратегия) - hedge

Пример:
- Funding rate = **+0.01%** (положительный)
- Лонги платят шортам
- **Мы открываем LONG** через 20ms после фандинга
- Первая позиция (SHORT) уже получила funding
- Вторая позиция (LONG) хеджирует первую
- Net exposure = 0 (нейтральная позиция)

## 📝 Технические детали

### Расчет TP/SL

```
expectedFunding = margin × leverage × |fundingRate|
tpProfit = expectedFunding × (takeProfitPercent / 100)
slLoss = expectedFunding × (stopLossPercent / 100)

For LONG:
  TP Price = entryPrice + (tpProfit / positionSize)
  SL Price = entryPrice - (slLoss / positionSize)

For SHORT:
  TP Price = entryPrice - (tpProfit / positionSize)
  SL Price = entryPrice + (slLoss / positionSize)
```

### Измерение латентности

```typescript
const startTime = Date.now();
await bybitService.getServerTime();
const endTime = Date.now();

const roundTripTime = endTime - startTime;
const latency = Math.ceil(roundTripTime / 2);
```

Типичная латентность: 30-100ms в зависимости от локации.

## 🚨 Важные замечания

1. **Не используйте большие позиции на первом тесте** - начните с минимальной маржи
2. **Testnet для тестирования** - всегда сначала тестируйте на testnet
3. **Проверьте funding time** - убедитесь что до фандинга достаточно времени
4. **Мониторинг обязателен** - следите за логами при первом запуске
5. **API ключи** - храните в безопасности, используйте только чтение/торговлю

## 🔗 Связанные файлы

- `/backend/src/services/bybit-funding-strategy.service.ts` - Основной сервис
- `/backend/src/lib/bybit.ts` - Bybit API и синхронизация времени
- `/backend/src/connectors/bybit.connector.ts` - Bybit connector
- `/backend/src/test-precise-timing-strategy.ts` - Полный тест
- `/backend/src/test-precise-timing-dry-run.ts` - Dry-run тест

## ❓ FAQ

**Q: Почему 20ms а не 0ms?**
A: Дает небольшой запас чтобы гарантировать что фандинг уже начислен.

**Q: Что если latency изменится?**
A: Синхронизация происходит каждые 5 секунд, латентность обновляется перед каждым исполнением.

**Q: Можно изменить timingOffset?**
A: Да, можно установить любое значение (рекомендуется 10-50ms).

**Q: Что делать если позиция не открылась?**
A: Проверьте логи на ошибки, убедитесь что:
  - Достаточно маржи на аккаунте
  - Leverage правильно установлен
  - Symbol существует и активен

**Q: Работает ли на mainnet?**
A: Да, передайте `false` в параметр `testnet`.

## 📞 Поддержка

Если возникли вопросы или проблемы, проверьте:
1. Логи backend (`npm run dev`)
2. Статус стратегии: `bybitFundingStrategyService.getStrategy(strategyId)`
3. События (см. раздел "Мониторинг")

---

**Версия документации**: 1.0
**Дата**: 13 октября 2025
**Статус**: ✅ Готово к использованию
