# Довідник конфігурації

Повний довідник для всіх параметрів конфігурації.

## Змінні середовища

### Конфігурація Backend

Всі змінні середовища backend мають бути встановлені в `/backend/.env`

#### Обов'язкові змінні

| Змінна | Тип | Опис | Приклад |
|----------|------|-------------|---------|
| `NODE_ENV` | string | Режим середовища | `development`, `staging`, `production` |
| `PORT` | number | Порт backend сервера | `3000` |
| `DATABASE_URL` | string | Рядок підключення PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | string | Секрет для підпису JWT токенів (мін. 32 символи) | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | string | Час закінчення JWT токену | `1d`, `7d`, `30d` |
| `FRONTEND_URL` | string | URL frontend додатка | `http://localhost:4200` |
| `ENCRYPTION_KEY` | string | Ключ для шифрування API облікових даних (рівно 32+ символи) | Згенеруйте за допомогою: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

#### Опціональні змінні

| Змінна | Тип | Опис | Приклад |
|----------|------|-------------|---------|
| `GOOGLE_CLIENT_ID` | string | ID клієнта Google OAuth | Отримайте з Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | string | Секрет клієнта Google OAuth | Отримайте з Google Cloud Console |
| `POSTGRES_HOST` | string | Хост PostgreSQL (альтернатива DATABASE_URL) | `localhost` |
| `POSTGRES_PORT` | number | Порт PostgreSQL | `5432` |
| `POSTGRES_DB` | string | Назва бази даних | `auth_app_local` |
| `POSTGRES_USER` | string | Користувач бази даних | `postgres` |
| `POSTGRES_PASSWORD` | string | Пароль бази даних | Ваш пароль |

---

### Конфігурація Frontend

Конфігурація в `/frontend/src/environments/`

#### environment.ts (Розробка)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'your-google-client-id', // Опціонально
  appName: 'Trading Bot - Development'
};
```

#### environment.production.ts (Продакшен)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  googleClientId: 'your-google-client-id',
  appName: 'Trading Bot'
};
```

---

## Конфігурація бази даних

### Підтримувана база даних: PostgreSQL

| Налаштування | Рекомендоване значення | Примітки |
|---------|------------------|-------|
| Версія | 14+ | Мінімальна підтримувана версія |
| Max Connections | 100+ | Налаштуйте залежно від навантаження |
| SSL Mode | `require` (продакшен) | `disable` для локальної розробки |
| Timezone | UTC | Послідовна обробка часових міток |

### Формат рядка підключення

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Приклади**:

```bash
# Локальна розробка
postgresql://postgres:password@localhost:5432/auth_app_local

# З SSL (продакшен)
postgresql://user:pass@host:5432/db?sslmode=require

# Хмарний провайдер (Railway, Supabase тощо)
postgresql://user:pass@cloud-host.provider.com:5432/db?sslmode=require
```

---

## Конфігурація Exchange API

### Підтримувані біржі

| Біржа | Testnet доступний | Макс. кредитне плече | Примітки |
|----------|------------------|--------------|-------|
| **Bybit** | ✅ Так | 100x | Рекомендовано для початківців |
| **BingX** | ❌ Ні | 125x | Зверніться до підтримки для testnet |
| **Binance** | ✅ Так | 125x | Суворі обмеження швидкості |
| **OKX** | ✅ Так | 125x | Хороша ліквідність |
| **Kraken** | ❌ Ні | 5x | Тільки спот |
| **Coinbase** | ✅ Так (Sandbox) | 3x | Обмежені функції |

### Необхідні дозволи API

**Для арбітражу фінансування**:
- ✅ Read: Account, Position, Order
- ✅ Write: Trade, Position
- ❌ Withdraw: НЕ ПОТРІБНО (більш безпечно)

**Налаштування безпеки**:
- Увімкніть білий список IP (додайте IP вашого сервера)
- Використовуйте API ключі без дозволів на виведення коштів
- Змінюйте ключі кожні 3-6 місяців
- Використовуйте окремі ключі для testnet та mainnet

---

## Конфігурація торгівлі

### Налаштування кредитного плеча

| Стратегія | Рекомендоване кредитне плече | Рівень ризику |
|----------|---------------------|------------|
| Арбітраж фінансування | 1-5x | Низький |
| Сіткова торгівля | 1-10x | Середній |
| Агресивна торгівля | 10-20x | Високий |

**Кредитне плече за замовчуванням**: 3x (налаштовується для кожної підписки)

### Ліміти позицій

Залежить від біржі та типу облікового запису. Перевірте на вашій біржі.

### Налаштування арбітражу фінансування

| Налаштування | За замовчуванням | Діапазон | Опис |
|---------|---------|-------|-------------|
| Leverage | 3x | 1-20x | Множник позиції |
| Min Funding Rate | 0.01% | - | Мінімальна ставка для запуску |
| Execution Window | 5s перед | - | Коли відкривати позиції |
| Max Position Size | Визначено користувачем | - | Встановіть відповідно до толерантності до ризику |

---

## Конфігурація безпеки

### Конфігурація JWT

```env
JWT_SECRET=minimum-32-character-secret-key-here
JWT_EXPIRES_IN=1d  # Варіанти: 1h, 1d, 7d, 30d
```

**Рекомендації**:
- Використовуйте принаймні 64 символи для продакшену
- Ніколи не комітьте JWT_SECRET до системи контролю версій
- Періодично змінюйте секрети
- Використовуйте різні секрети для dev/staging/production

### Конфігурація шифрування

```env
ENCRYPTION_KEY=32-byte-hex-string-generated-securely
```

**Згенеруйте безпечний ключ**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Важливо**:
- Має бути рівно 32 байти (64 hex символи)
- Ніколи не змінюйте після збереження зашифрованих даних
- Зробіть резервну копію цього ключа безпечно
- Втрата цього ключа означає втрату доступу до зашифрованих API облікових даних

---

## Конфігурація розгортання

### Розробка

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/auth_app_local
FRONTEND_URL=http://localhost:4200
```

### Staging

```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://staging-host:5432/auth_app_staging?sslmode=require
FRONTEND_URL=https://staging.yourdomain.com
```

### Продакшен

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://prod-host:5432/auth_app_prod?sslmode=require
FRONTEND_URL=https://yourdomain.com
```

**Додаткові налаштування для продакшену**:
- Увімкніть обмеження швидкості
- Використовуйте SSL для з'єднань з базою даних
- Налаштуйте моніторинг та логування
- Налаштуйте резервні копії
- Використовуйте управління секретами середовища (AWS Secrets Manager тощо)

---

## Порти додатка

| Служба | Порт | Налаштовується | Примітки |
|---------|------|--------------|-------|
| Backend API | 3000 | ✅ Так (змінна PORT) | Next.js dev сервер |
| Frontend | 4200 | ✅ Так (ng serve --port) | Angular dev сервер |
| PostgreSQL | 5432 | ✅ Так (стандартний) | База даних |
| Prisma Studio | 5555 | ❌ Фіксований | GUI бази даних (тільки dev) |

---

## Прапорці функцій

Налаштуйте в коді додатка:

```typescript
// backend/src/config/features.ts
export const features = {
  googleAuth: true,          // Увімкнути Google OAuth
  fundingArbitrage: true,     // Увімкнути арбітраж фінансування
  gridTrading: false,         // Увімкнути сіткові боти (в розробці)
  backtesting: false,         // Увімкнути бектестинг (в розробці)
  realTimeData: true,         // Увімкнути оновлення WebSocket
  notifications: false,       // Увімкнути push-сповіщення (в розробці)
};
```

---

## Налаштування продуктивності

### Пул з'єднань з базою даних

```typescript
// У конфігурації datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Налаштування пулу з'єднань
  connection_limit = 10
  pool_timeout = 20
}
```

### Обмеження швидкості API

Налаштуйте відповідно до лімітів біржі та вашого рівня підписки:

```typescript
// backend/src/config/rate-limits.ts
export const rateLimits = {
  bybit: {
    maxRequests: 120,    // на хвилину
    maxWebSocketSub: 500, // макс. підписки
  },
  bingx: {
    maxRequests: 600,    // на хвилину
  },
  binance: {
    maxRequests: 1200,   // на хвилину
    maxWeight: 6000,     // на хвилину
  }
};
```

---

## Конфігурація логування

Встановіть рівні логування:

```env
LOG_LEVEL=info  # error, warn, info, debug, trace
LOG_FORMAT=json # json, pretty
```

**Рівні логування**:
- `error`: Тільки помилки
- `warn`: Помилки та попередження
- `info`: Загальна інформація (рекомендовано)
- `debug`: Детальна інформація для налагодження
- `trace`: Дуже детально (тільки dev)

---

## Усунення проблем з конфігурацією

### Перевірка файлу .env

```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✅ DATABASE_URL встановлено' : '❌ DATABASE_URL відсутнє')"
```

### Перевірка довжини ключа шифрування

```bash
node -e "const key = 'your-key-here'; console.log('Довжина:', key.length, '- Валідний:', key.length >= 64 ? '✅' : '❌ Має бути 64')"
```

### Тест з'єднання з базою даних

```bash
psql "$DATABASE_URL" -c "SELECT version();"
```

### Перевірка стійкості JWT Secret

JWT_SECRET має бути:
- Принаймні 32 символи (рекомендовано 64+)
- Випадковим та непередбачуваним
- Ніколи не розголошувати і не комітити до git

---

## Шаблон файлу середовища

Збережіть як `/backend/.env`:

```env
# ==========================================
# ОБОВ'ЯЗКОВА КОНФІГУРАЦІЯ
# ==========================================

# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
ENCRYPTION_KEY=your-64-character-hex-encryption-key-generated-securely

# Frontend
FRONTEND_URL=http://localhost:4200

# ==========================================
# ОПЦІОНАЛЬНА КОНФІГУРАЦІЯ
# ==========================================

# Google OAuth (Опціонально)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Connection (Альтернатива DATABASE_URL)
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=auth_app_local
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=password

# Logging (Опціонально)
# LOG_LEVEL=info
# LOG_FORMAT=pretty
```

---

## Контрольний список конфігурації

Перед розгортанням або запуском:

- [ ] DATABASE_URL встановлено та протестовано
- [ ] JWT_SECRET безпечний (32+ символів)
- [ ] ENCRYPTION_KEY згенеровано (64 hex символи)
- [ ] URL Frontend відповідає вашому домену
- [ ] API ключі біржі мають правильні дозволи
- [ ] PostgreSQL працює та доступний
- [ ] Версія Node.js 18+
- [ ] Всі залежності встановлено
- [ ] Схема бази даних застосована
- [ ] Файл .env не закомічено до git
- [ ] Секрети продакшену збережено безпечно

---

**Потрібна допомога?**

- Див. [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) для детального налаштування
- Див. [QUICK_START.md](./QUICK_START.md) для швидкого налаштування
- Перевірте розділ усунення несправностей для типових проблем
