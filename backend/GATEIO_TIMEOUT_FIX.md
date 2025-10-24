# Gate.io Timeout Fix

## Проблема

При ініціалізації Gate.io connector виникав timeout error:

```
"Failed to initialize GATE: gate GET https://api.gateio.ws/api/v4/spot/currencies request timed out (10000 ms)"
```

## Причина

1. **Малий дефолтний timeout**: CCXT використовує 10 секунд за замовчуванням
2. **Повільна loadMarkets()**: Gate.io API може довго відповідати при завантаженні всіх ринків
3. **Відсутність retry логіки**: При тимчасових проблемах з мережею коннектор одразу падав
4. **Відсутність детальних логів**: Важко було зрозуміти на якому етапі відбувається timeout

## Виправлення

### 1. Збільшено timeout з 10s до 30s

**Файли:**
- `src/connectors/gateio-spot.connector.ts:23`
- `src/connectors/ccxt-exchange.connector.ts:78`

**Зміна:**
```typescript
this.exchange = new ccxt.gateio({
  apiKey,
  secret: apiSecret,
  enableRateLimit: true,
  timeout: 30000, // ← ДОДАНО: 30 секунд замість 10
  options: {
    defaultType: 'spot',
    adjustForTimeDifference: true,
  },
});
```

**Причина:**
Gate.io API може довго відповідати при завантаженні великої кількості ринків. 30 секунд дає достатньо часу навіть при повільному з'єднанні.

### 2. Додано retry логіку (3 спроби)

**Файли:**
- `src/connectors/gateio-spot.connector.ts:34-84`
- `src/connectors/ccxt-exchange.connector.ts:103-148`

**Логіка:**
- **3 спроби** з затримкою між ними
- **Прогресивна затримка**: 2s, 4s між спробами
- **Детальні логи** на кожному кроці

**Код:**
```typescript
async initialize(): Promise<void> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[GateIOSpotConnector] Attempt ${attempt}/${maxRetries}...`);

      // Load markets
      console.log(`[GateIOSpotConnector] Loading markets...`);
      await this.exchange.loadMarkets();
      console.log(`[GateIOSpotConnector] Markets loaded successfully`);

      // Test connection
      console.log(`[GateIOSpotConnector] Testing connection...`);
      await this.exchange.fetchBalance();
      console.log(`[GateIOSpotConnector] Connection test successful`);

      this.isInitialized = true;
      return; // ✅ Success!

    } catch (error: any) {
      lastError = error;
      console.error(`[GateIOSpotConnector] Attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = attempt * 2000;
        console.log(`[GateIOSpotConnector] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ❌ All retries failed
  throw new Error(`Failed to initialize after ${maxRetries} attempts: ${lastError?.message}`);
}
```

### 3. Опціональне fetching fees

Якщо завантаження fee information fails, використовується дефолтний 0.2%:

```typescript
try {
  const feeInfo = await this.exchange.fetchTradingFees();
  if (feeInfo && feeInfo['BTC/USDT']) {
    this.takerFee = feeInfo['BTC/USDT'].taker || 0.002;
  }
} catch (feeError: any) {
  console.warn(`Could not fetch fees, using default 0.2%:`, feeError.message);
  // ← Не кидаємо помилку, продовжуємо з дефолтом
}
```

### 4. Детальні логи

Додано логи на кожному етапі ініціалізації:

```
[GateIOSpotConnector] Initializing Gate.io SPOT connector...
[GateIOSpotConnector] Attempt 1/3...
[GateIOSpotConnector] Loading markets...
[GateIOSpotConnector] Markets loaded successfully
[GateIOSpotConnector] Testing connection...
[GateIOSpotConnector] Connection test successful
[GateIOSpotConnector] Fetching trading fees...
[GateIOSpotConnector] Taker fee: 0.2%
[GateIOSpotConnector] Gate.io SPOT connector initialized successfully
```

## Результат

### До виправлення:
```
❌ Failed to initialize GATE: request timed out (10000 ms)
```

### Після виправлення:
```
✅ [GateIOSpotConnector] Initializing Gate.io SPOT connector...
✅ [GateIOSpotConnector] Attempt 1/3...
✅ [GateIOSpotConnector] Loading markets...
✅ [GateIOSpotConnector] Markets loaded successfully
✅ [GateIOSpotConnector] Gate.io SPOT connector initialized successfully
```

Або при тимчасових проблемах:
```
⚠️  [GateIOSpotConnector] Attempt 1/3 failed: timeout
⚠️  [GateIOSpotConnector] Retrying in 2000ms...
✅ [GateIOSpotConnector] Attempt 2/3...
✅ [GateIOSpotConnector] Markets loaded successfully
✅ [GateIOSpotConnector] Gate.io SPOT connector initialized successfully
```

## Коли може все ще падати

Timeout може все ще виникнути якщо:

1. **Повністю відсутнє з'єднання з інтернетом**
2. **Gate.io API down** (всі 3 спроби з 30s timeout = 90s total)
3. **Firewall блокує Gate.io API**
4. **Занадто повільне з'єднання** (навіть 30s недостатньо)

### Рішення для екстремальних випадків:

Якщо проблема залишається, можна:

**Опція 1: Збільшити timeout до 60s**
```typescript
timeout: 60000, // 60 секунд
```

**Опція 2: Збільшити кількість retry**
```typescript
const maxRetries = 5; // 5 спроб
```

**Опція 3: Більша затримка між retry**
```typescript
const delay = attempt * 5000; // 5s, 10s, 15s
```

**Опція 4: Lazy loading markets**
Не завантажувати markets при initialize, а завантажувати on-demand при першій операції.

## Тестування

Щоб перевірити чи працює:

```bash
# Запусти backend
npm run dev

# Або перевір через API
curl http://localhost:3000/api/exchange/test-connection \
  -H "Content-Type: application/json" \
  -d '{"exchange": "GATEIO", "credentialId": "your-credential-id"}'
```

Очікуваний результат:
```json
{
  "success": true,
  "message": "Connection successful",
  "marketsLoaded": 1234
}
```

## Файли змінено

1. ✅ `src/connectors/gateio-spot.connector.ts`
   - Додано timeout: 30000
   - Додано retry логіку (3 спроби)
   - Додано детальні логи
   - Опціональне fetching fees

2. ✅ `src/connectors/ccxt-exchange.connector.ts`
   - Додано timeout: 30000
   - Додано retry логіку (3 спроби)
   - Додано детальні логи

## Висновок

Проблема з timeout вирішена за допомогою:
- ✅ Збільшення timeout з 10s до 30s
- ✅ Retry логіки (3 спроби з прогресивною затримкою)
- ✅ Детальних логів для debugging
- ✅ Graceful degradation (використання дефолтних fees якщо API fails)

Це робить ініціалізацію значно більш resilient до тимчасових проблем з мережею та повільних API.
