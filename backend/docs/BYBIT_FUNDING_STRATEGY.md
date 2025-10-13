# Bybit Funding Strategy - Automated TP/SL Management

## Обзор

Автоматическая стратегия для сбора фандинг-платежей на Bybit с использованием Take-Profit и Stop-Loss для защиты прибыли.

### Как работает стратегия

1. **Мониторинг времени до фандинга** через WebSocket
2. **Открытие позиции за 5 секунд до фандинга** с автоматическими TP/SL
3. **Take-Profit = 90% от ожидаемого фандинга** (защита прибыли до движения рынка)
4. **Переоткрытие позиции** если она закрылась по TP/SL до начисления фандинга
5. **Сбор фандинга** в 00:00:00

### Пример расчёта

```typescript
Параметры:
- Margin: 100 USDT
- Leverage: 10x
- Funding Rate: 2% (0.02)

Расчёт:
- Position Value = 100 * 10 = 1,000 USDT
- Expected Funding = 1,000 * 0.02 = 20 USDT
- Take Profit = 20 * 0.9 = 18 USDT (90%)
- Stop Loss = 20 * 0.2 = 4 USDT (20%)

Position Size = 1,000 / Current Price

Для LONG (Buy):
- TP Price = Entry Price + (18 / Position Size)
- SL Price = Entry Price - (10 / Position Size)

Для SHORT (Sell):
- TP Price = Entry Price - (18 / Position Size)
- SL Price = Entry Price + (10 / Position Size)
```

## API Endpoints

### 1. Запуск стратегии

```http
POST /api/bybit-funding-strategy/start
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "symbol": "BTCUSDT",           // Required: Trading pair
  "leverage": 10,                 // Optional: Leverage (default: 10, range: 1-125)
  "margin": 100,                  // Optional: Margin in USDT (default: 100)
  "side": "Buy",                  // Optional: "Buy" or "Sell" (default: "Buy")
  "executionDelay": 5,            // Optional: Seconds before funding (default: 5)
  "takeProfitPercent": 90,        // Optional: % of expected funding (default: 90)
  "stopLossPercent": 20,          // Optional: % of expected funding (default: 20)
  "credentialId": "xxx"           // Optional: Specific credential ID
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "strategyId": "strategy_1_1234567890",
    "symbol": "BTCUSDT",
    "leverage": 10,
    "margin": 100,
    "side": "Buy",
    "executionDelay": 5,
    "takeProfitPercent": 90,
    "stopLossPercent": 20,
    "environment": "TESTNET"
  },
  "message": "Funding strategy started successfully"
}
```

### 2. Получить все активные стратегии

```http
GET /api/bybit-funding-strategy
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "strategy_1_1234567890",
      "symbol": "BTCUSDT",
      "side": "Buy",
      "leverage": 10,
      "margin": 100,
      "fundingRate": 0.0001,
      "nextFundingTime": 1234567890000,
      "secondsRemaining": 3600,
      "status": "monitoring",
      "hasPosition": false,
      "positionSize": 0,
      "entryPrice": 0,
      "takeProfitPrice": 0,
      "stopLossPrice": 0,
      "positionReopenCount": 0
    }
  ]
}
```

### 3. Получить информацию о стратегии

```http
GET /api/bybit-funding-strategy/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "strategy_1_1234567890",
    "symbol": "BTCUSDT",
    "side": "Buy",
    "leverage": 10,
    "margin": 100,
    "executionDelay": 5,
    "takeProfitPercent": 90,
    "stopLossPercent": 20,
    "fundingRate": 0.0001,
    "nextFundingTime": 1234567890000,
    "secondsRemaining": 3600,
    "currentPrice": 50000.00,
    "status": "position_open",
    "hasPosition": true,
    "positionSize": 0.02,
    "entryPrice": 50000.00,
    "takeProfitPrice": 50900.00,
    "stopLossPrice": 49500.00,
    "positionReopenCount": 1,
    "lastExecutionTime": 1234567890000
  }
}
```

### 4. Остановить стратегию

```http
DELETE /api/bybit-funding-strategy/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "message": "Strategy stopped successfully"
}
```

## События (WebSocket)

Сервис генерирует следующие события:

### COUNTDOWN
Отправляется каждую секунду во время обратного отсчёта.

```typescript
{
  strategyId: string;
  symbol: string;
  secondsRemaining: number;
  fundingRate: number;
  nextFundingTime: number;
}
```

### POSITION_OPENING
Отправляется при начале открытия позиции.

```typescript
{
  strategyId: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  price: number;
  margin: number;
  leverage: number;
}
```

### POSITION_OPENED
Отправляется когда позиция открыта с TP/SL.

```typescript
{
  strategyId: string;
  position: any;
  tpPrice: number;
  slPrice: number;
  entryPrice: number;
}
```

### POSITION_REOPENING
Отправляется при переоткрытии позиции.

```typescript
{
  strategyId: string;
  attempt: number;
  secondsRemaining: number;
}
```

### FUNDING_COLLECTED
Отправляется при успешном сборе фандинга.

```typescript
{
  strategyId: string;
  amount: number;
  fundingRate: number;
  positionReopenCount: number;
}
```

### ERROR
Отправляется при ошибке.

```typescript
{
  strategyId: string;
  error: string;
  action?: string;
}
```

## Использование в коде

### TypeScript/Node.js

```typescript
import { bybitFundingStrategyService } from '@/services/bybit-funding-strategy.service';

// Запуск стратегии
const strategyId = await bybitFundingStrategyService.startStrategy(
  {
    userId: user.userId,
    symbol: 'BTCUSDT',
    leverage: 10,
    margin: 100,
    side: 'Buy',
    executionDelay: 5,
    takeProfitPercent: 90,
    stopLossPercent: 20,
  },
  apiKey,
  apiSecret,
  testnet
);

// Подписка на события
bybitFundingStrategyService.on('countdown', (event) => {
  console.log(`Time remaining: ${event.secondsRemaining}s`);
});

bybitFundingStrategyService.on('position_opened', (event) => {
  console.log(`Position opened at ${event.entryPrice}`);
  console.log(`TP: ${event.tpPrice}, SL: ${event.slPrice}`);
});

bybitFundingStrategyService.on('funding_collected', (event) => {
  console.log(`Funding collected: ${event.amount} USDT`);
});

// Остановка стратегии
await bybitFundingStrategyService.stopStrategy(strategyId);
```

### cURL Examples

**Запуск стратегии:**

```bash
curl -X POST http://localhost:3000/api/bybit-funding-strategy/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "leverage": 10,
    "margin": 100,
    "side": "Buy"
  }'
```

**Получить статус:**

```bash
curl http://localhost:3000/api/bybit-funding-strategy/strategy_1_1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Остановить стратегию:**

```bash
curl -X DELETE http://localhost:3000/api/bybit-funding-strategy/strategy_1_1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Тестирование

### Тестовый скрипт

Используйте тестовый скрипт для проверки работы стратегии:

```bash
# 1. Установите переменные окружения
export BYBIT_TESTNET_API_KEY="your_api_key"
export BYBIT_TESTNET_API_SECRET="your_api_secret"

# 2. Запустите тест
npx tsx src/test-funding-strategy.ts
```

### Ожидаемый вывод

```
================================================================================
BYBIT FUNDING STRATEGY TEST
================================================================================

Configuration:
{
  "userId": "test_user",
  "symbol": "BTCUSDT",
  "leverage": 10,
  "margin": 100,
  "side": "Buy",
  "executionDelay": 5,
  "takeProfitPercent": 90,
  "stopLossPercent": 20
}

================================================================================

🚀 Starting strategy...

✅ Strategy started: strategy_1_1234567890

Strategy Details:
  Next Funding Time: 2025-01-15 16:00:00
  Time Remaining: 3589m 45s
  Current Funding Rate: 0.0100%
  Current Price: $50000.00
  Expected Funding: 10.00 USDT
  Take Profit Target: 9.00 USDT (90%)

ℹ️  Monitoring strategy... Press Ctrl+C to stop

⏱️  COUNTDOWN: 3589:45 | Funding Rate: 0.0100%
⏱️  COUNTDOWN: 3589:35 | Funding Rate: 0.0100%
...
⏱️  COUNTDOWN: 0:05 | Funding Rate: 0.0100%

================================================================================
📈 OPENING POSITION
================================================================================
Symbol: BTCUSDT
Side: Buy
Price: $50000.00
Margin: 100 USDT
Leverage: 10x
================================================================================

================================================================================
✅ POSITION OPENED WITH TP/SL
================================================================================
Entry Price: $50000.00
Take Profit: $50450.00
Stop Loss:   $49750.00
================================================================================

⏱️  COUNTDOWN: 0:00 | Funding Rate: 0.0100%

================================================================================
💰 FUNDING COLLECTED!
================================================================================
Amount: 10.00 USDT
Funding Rate: 0.0100%
Position Reopens: 1x
================================================================================

✅ Funding collected! Strategy will stop in 5 seconds...

✅ Strategy stopped successfully
```

## Важные замечания

### 1. Требования к API ключам

- API ключи должны иметь права на торговлю (Trade permissions)
- Рекомендуется использовать testnet для тестирования

### 2. Плечо (Leverage)

- Должно быть установлено **до** открытия позиции
- Не может быть изменено при открытой позиции
- Диапазон: 1-125x (зависит от символа)

### 3. Расчёт размера позиции

```
Position Value = Margin * Leverage
Position Size = Position Value / Current Price
```

### 4. Минимальный размер ордера

- Размер позиции должен соответствовать минимальным требованиям Bybit
- Сервис автоматически корректирует размер согласно qtyStep

### 5. Время выполнения

- По умолчанию позиция открывается за 5 секунд до фандинга
- Это время можно настроить через параметр `executionDelay`

### 6. Переоткрытие позиций

- Если позиция закрывается по TP/SL до времени фандинга, она автоматически переоткрывается
- Количество переоткрытий отслеживается в `positionReopenCount`

### 7. Рекомендации

- Используйте умеренное плечо (3-10x) для снижения риска
- Установите адекватный Stop-Loss (рекомендуется 20% от ожидаемого фандинга)
- Мониторьте ликвидность символа перед запуском стратегии

## Решение проблем

### Ошибка: "Position cannot be opened"

- Проверьте, что leverage установлен корректно
- Убедитесь, что у вас достаточно средств на балансе
- Проверьте минимальный размер ордера для символа

### Ошибка: "Failed to set trading stop"

- Убедитесь, что позиция была успешно открыта
- Проверьте, что цены TP/SL находятся в допустимом диапазоне

### Позиция не открывается

- Проверьте countdown timer в логах
- Убедитесь, что до фандинга осталось больше executionDelay секунд
- Проверьте баланс и доступные средства

### WebSocket не подключается

- Проверьте API ключи и их права
- Убедитесь, что используете правильный режим (testnet/mainnet)
- Проверьте интернет-соединение

## Безопасность

1. **Никогда не коммитьте API ключи** в репозиторий
2. Используйте переменные окружения для хранения ключей
3. Ограничьте права API ключей (только Trade)
4. Установите IP whitelist в настройках Bybit
5. Используйте testnet для тестирования
6. Мониторьте активные стратегии
7. Устанавливайте адекватные Stop-Loss

## License

MIT
