# Тести для перевірки виправлень трикутного арбітражу

## Швидкий запуск всіх тестів

```bash
# В директорії backend
npm run test:triangular-arbitrage
```

Або запускай тести окремо:

## 1. Тест буферів (ГОЛОВНИЙ) ⭐
**Показує як нова стратегія вирішує проблему**

```bash
npx tsx test-buffer-comparison.ts
```

**Що перевіряє:**
- ✅ Порівняння старої (0.2% буфер) vs нової (5% буфер) стратегії
- ✅ Демонструє як нові буфери компенсують різницю між ticker і orderbook ціною
- ✅ Тестує екстремальний сценарій з 10% slippage

**Очікуваний результат:**
```
Old Strategy:
  Filled: 36.96 SAGA
  Status: ⚠️  PASSED (but risky)

New Strategy:
  Filled: 38.73 SAGA (+4.8%)
  Status: ✅ SUCCESS
```

---

## 2. Тест калькулятора з прибутком
**Перевіряє що калькулятор правильно працює**

```bash
npx tsx test-clear-profit.ts
```

**Що перевіряє:**
- ✅ Калькулятор знаходить profitable можливості
- ✅ Правильно розраховує leg-и
- ✅ Правильно застосовує fees

**Очікуваний результат:**
```
✅ CALCULATOR WORKING! Profitable opportunity found:
   Direction: forward
   Profit: 14.72 USDT (1.4721%)
```

---

## 3. Детальний debug тест
**Показує як працює symbol matching і calculations**

```bash
npx tsx test-triangle-debug.ts
```

**Що перевіряє:**
- ✅ Parsing символів (USDCUSDT → base: USDC, quote: USDT)
- ✅ Symbol matching для кожного leg
- ✅ Визначення BUY/SELL sides
- ✅ Розрахунок кількостей на кожному етапі

**Очікуваний результат:**
```
→ Finding symbol for: USDT → USDC
  ✓ Found: USDCUSDT (base=USDC, quote=USDT)
  → Have USDT (quote), want USDC (base) → BUY
```

---

## 4. Тест з різними position sizes
**Перевіряє як quantity змінюється залежно від position size**

```bash
npx tsx test-profitable-triangle.ts
```

**Що перевіряє:**
- ✅ Різні position sizes (100, 500, 1000, 5000 USDT)
- ✅ Перевірка мінімальних order sizes
- ✅ Розрахунок після slippage

---

## 5. Базовий тест quantities
**Швидка перевірка основної логіки**

```bash
npx tsx test-triangle-quantities.ts
```

---

## Unit тести (якщо є Jest/Vitest)

Перевір чи є test script в package.json:

```bash
npm test
```

Або:

```bash
npm run test:unit
npm run test:integration
```

---

## Що тестувати на реальній біржі

⚠️ **ВАЖЛИВО**: Перед тестуванням на реальній біржі:

1. **Перевір з невеликою сумою** (мінімум: 10-20 USDT)
2. **Подивись логи** на наявність помилок
3. **Перевір баланс** до і після

### Тест на Gate.io з реальним API:

```bash
# Створи тестовий скрипт або використай API endpoint
curl -X POST http://localhost:3000/api/triangular-arbitrage/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "credentialId": "your-gateio-credential-id",
    "triangleId": "test-triangle-id",
    "positionSize": 20
  }'
```

---

## Моніторинг після deployment

Після деплою відслідковуй:

1. **Логи помилок**:
   ```bash
   grep "Your order size" /var/log/app.log
   grep "INVALID_PARAM_VALUE" /var/log/app.log
   ```

2. **Success rate**:
   - Перевір скільки ордерів проходить успішно
   - Порівняй з попереднім success rate

3. **Actual fill quantities**:
   - Порівнюй expected vs actual filled quantities
   - Якщо різниця > 5%, можливо потрібно збільшити буфер до 7-10%

---

## Очікувані результати після виправлень

✅ Ордери на Gate.io виконуються успішно
✅ Немає помилок "order size too small"
✅ Actual filled quantity ≥ expected quantity (завдяки 5% буферу)
✅ Validation відхиляє занадто малі можливості (25% margin)

---

## Troubleshooting

**Якщо все ще є помилки "order size too small":**

1. Збільш cost buffer з 5% до 7-10%:
   - Файл: `src/connectors/gateio-spot.connector.ts:139`
   - Зміни `1.05` на `1.07` або `1.10`

2. Збільш validation margin з 25% до 30-40%:
   - Файл: `src/services/triangular-arbitrage-execution.service.ts:312`
   - Зміни `1.25` на `1.30` або `1.40`

3. Використай orderbook замість ticker для більш точних цін

**Якщо profit занадто малий через буфери:**

Це нормально! 5% буфер означає що ми витрачаємо трохи більше, але гарантуємо виконання ордеру. Profit все одно буде позитивний якщо opportunity > 0.5-1%.
