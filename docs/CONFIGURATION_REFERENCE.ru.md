# Справочник по конфигурации

Полный справочник по всем параметрам конфигурации.

## Переменные окружения

### Конфигурация Backend

Все переменные окружения backend должны быть установлены в `/backend/.env`

#### Обязательные переменные

| Переменная | Тип | Описание | Пример |
|----------|------|-------------|---------|
| `NODE_ENV` | string | Режим окружения | `development`, `staging`, `production` |
| `PORT` | number | Порт сервера backend | `3000` |
| `DATABASE_URL` | string | Строка подключения PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | string | Секрет для подписи JWT токенов (мин. 32 символа) | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | string | Время истечения JWT токена | `1d`, `7d`, `30d` |
| `FRONTEND_URL` | string | URL frontend приложения | `http://localhost:4200` |
| `ENCRYPTION_KEY` | string | Ключ для шифрования API учетных данных (точно 32+ символа) | Сгенерируйте с помощью: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

#### Опциональные переменные

| Переменная | Тип | Описание | Пример |
|----------|------|-------------|---------|
| `GOOGLE_CLIENT_ID` | string | Google OAuth client ID | Получите в Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | string | Google OAuth client secret | Получите в Google Cloud Console |
| `POSTGRES_HOST` | string | PostgreSQL хост (альтернатива DATABASE_URL) | `localhost` |
| `POSTGRES_PORT` | number | PostgreSQL порт | `5432` |
| `POSTGRES_DB` | string | Имя базы данных | `auth_app_local` |
| `POSTGRES_USER` | string | Пользователь базы данных | `postgres` |
| `POSTGRES_PASSWORD` | string | Пароль базы данных | Ваш пароль |

---

### Конфигурация Frontend

Конфигурация в `/frontend/src/environments/`

#### environment.ts (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'your-google-client-id', // Optional
  appName: 'Trading Bot - Development'
};
```

#### environment.production.ts (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  googleClientId: 'your-google-client-id',
  appName: 'Trading Bot'
};
```

---

## Конфигурация базы данных

### Поддерживаемая база данных: PostgreSQL

| Настройка | Рекомендуемое значение | Примечания |
|---------|------------------|-------|
| Версия | 14+ | Минимальная поддерживаемая версия |
| Макс. подключений | 100+ | Настраивайте в зависимости от нагрузки |
| SSL режим | `require` (production) | `disable` для локальной разработки |
| Часовой пояс | UTC | Согласованная обработка временных меток |

### Формат строки подключения

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Примеры**:

```bash
# Локальная разработка
postgresql://postgres:password@localhost:5432/auth_app_local

# С SSL (production)
postgresql://user:pass@host:5432/db?sslmode=require

# Облачный провайдер (Railway, Supabase, и т.д.)
postgresql://user:pass@cloud-host.provider.com:5432/db?sslmode=require
```

---

## Конфигурация API бирж

### Поддерживаемые биржи

| Биржа | Тестовая сеть доступна | Макс. плечо | Примечания |
|----------|------------------|--------------|-------|
| **Bybit** | ✅ Да | 100x | Рекомендуется для начинающих |
| **BingX** | ❌ Нет | 125x | Обратитесь в поддержку для тестовой сети |
| **Binance** | ✅ Да | 125x | Строгие лимиты запросов |
| **OKX** | ✅ Да | 125x | Хорошая ликвидность |
| **Kraken** | ❌ Нет | 5x | Только спот |
| **Coinbase** | ✅ Да (Sandbox) | 3x | Ограниченный функционал |

### Требуемые разрешения API

**Для фандинг-арбитража**:
- ✅ Чтение: Аккаунт, Позиция, Ордер
- ✅ Запись: Торговля, Позиция
- ❌ Вывод: НЕ ТРЕБУЕТСЯ (более безопасно)

**Настройки безопасности**:
- Включите белый список IP (добавьте IP вашего сервера)
- Используйте API ключи без разрешений на вывод
- Меняйте ключи каждые 3-6 месяцев
- Используйте отдельные ключи для тестовой и основной сети

---

## Конфигурация торговли

### Настройки плеча

| Стратегия | Рекомендуемое плечо | Уровень риска |
|----------|---------------------|------------|
| Фандинг-арбитраж | 1-5x | Низкий |
| Сеточная торговля | 1-10x | Средний |
| Агрессивная торговля | 10-20x | Высокий |

**Плечо по умолчанию**: 3x (настраивается для каждой подписки)

### Лимиты позиций

Варьируются в зависимости от биржи и типа аккаунта. Уточните на вашей бирже.

### Настройки фандинг-арбитража

| Настройка | По умолчанию | Диапазон | Описание |
|---------|---------|-------|-------------|
| Плечо | 3x | 1-20x | Множитель позиции |
| Мин. ставка фандинга | 0.01% | - | Минимальная ставка для триггера |
| Окно исполнения | За 5с до | - | Когда открывать позиции |
| Макс. размер позиции | Определяется пользователем | - | Установите на основе толерантности к риску |

---

## Конфигурация безопасности

### Конфигурация JWT

```env
JWT_SECRET=minimum-32-character-secret-key-here
JWT_EXPIRES_IN=1d  # Опции: 1h, 1d, 7d, 30d
```

**Рекомендации**:
- Используйте не менее 64 символов для production
- Никогда не коммитьте JWT_SECRET в систему контроля версий
- Периодически меняйте секреты
- Используйте разные секреты для dev/staging/production

### Конфигурация шифрования

```env
ENCRYPTION_KEY=32-byte-hex-string-generated-securely
```

**Генерация безопасного ключа**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Важно**:
- Должен быть точно 32 байта (64 hex символа)
- Никогда не меняйте после сохранения зашифрованных данных
- Безопасно сохраните резервную копию этого ключа
- Потеря этого ключа означает потерю доступа к зашифрованным API учетным данным

---

## Конфигурация развертывания

### Development

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

### Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://prod-host:5432/auth_app_prod?sslmode=require
FRONTEND_URL=https://yourdomain.com
```

**Дополнительные настройки Production**:
- Включите ограничение частоты запросов
- Используйте SSL для подключений к базе данных
- Настройте мониторинг и логирование
- Настройте резервное копирование
- Используйте управление секретами окружения (AWS Secrets Manager и т.д.)

---

## Порты приложения

| Сервис | Порт | Настраивается | Примечания |
|---------|------|--------------|-------|
| Backend API | 3000 | ✅ Да (переменная PORT) | Next.js dev сервер |
| Frontend | 4200 | ✅ Да (ng serve --port) | Angular dev сервер |
| PostgreSQL | 5432 | ✅ Да (стандартный) | База данных |
| Prisma Studio | 5555 | ❌ Фиксированный | GUI базы данных (только dev) |

---

## Флаги функций

Настройте в коде приложения:

```typescript
// backend/src/config/features.ts
export const features = {
  googleAuth: true,          // Enable Google OAuth
  fundingArbitrage: true,     // Enable funding arbitrage
  gridTrading: false,         // Enable grid bots (WIP)
  backtesting: false,         // Enable backtesting (WIP)
  realTimeData: true,         // Enable WebSocket updates
  notifications: false,       // Enable push notifications (WIP)
};
```

---

## Настройка производительности

### Пул подключений к базе данных

```typescript
// In datasource configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  connection_limit = 10
  pool_timeout = 20
}
```

### Лимиты частоты запросов API

Настройте на основе лимитов биржи и вашего уровня подписки:

```typescript
// backend/src/config/rate-limits.ts
export const rateLimits = {
  bybit: {
    maxRequests: 120,    // per minute
    maxWebSocketSub: 500, // max subscriptions
  },
  bingx: {
    maxRequests: 600,    // per minute
  },
  binance: {
    maxRequests: 1200,   // per minute
    maxWeight: 6000,     // per minute
  }
};
```

---

## Конфигурация логирования

Установите уровни логов:

```env
LOG_LEVEL=info  # error, warn, info, debug, trace
LOG_FORMAT=json # json, pretty
```

**Уровни логов**:
- `error`: Только ошибки
- `warn`: Ошибки и предупреждения
- `info`: Общая информация (рекомендуется)
- `debug`: Детальная отладочная информация
- `trace`: Очень подробный (только dev)

---

## Устранение проблем с конфигурацией

### Проверка файла .env

```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✅ DATABASE_URL set' : '❌ DATABASE_URL missing')"
```

### Проверка длины ключа шифрования

```bash
node -e "const key = 'your-key-here'; console.log('Length:', key.length, '- Valid:', key.length >= 64 ? '✅' : '❌ Should be 64')"
```

### Тест подключения к базе данных

```bash
psql "$DATABASE_URL" -c "SELECT version();"
```

### Проверка надежности JWT Secret

JWT_SECRET должен быть:
- Не менее 32 символов (рекомендуется 64+)
- Случайным и непредсказуемым
- Никогда не передаваться и не коммититься в git

---

## Шаблон файла окружения

Сохраните как `/backend/.env`:

```env
# ==========================================
# ОБЯЗАТЕЛЬНАЯ КОНФИГУРАЦИЯ
# ==========================================

# Окружение
NODE_ENV=development
PORT=3000

# База данных
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"

# Безопасность
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
ENCRYPTION_KEY=your-64-character-hex-encryption-key-generated-securely

# Frontend
FRONTEND_URL=http://localhost:4200

# ==========================================
# ОПЦИОНАЛЬНАЯ КОНФИГУРАЦИЯ
# ==========================================

# Google OAuth (Опционально)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Подключение к базе данных (Альтернатива DATABASE_URL)
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=auth_app_local
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=password

# Логирование (Опционально)
# LOG_LEVEL=info
# LOG_FORMAT=pretty
```

---

## Чек-лист конфигурации

Перед развертыванием или запуском:

- [ ] DATABASE_URL установлен и протестирован
- [ ] JWT_SECRET безопасный (32+ символа)
- [ ] ENCRYPTION_KEY сгенерирован (64 hex символа)
- [ ] URL Frontend соответствует вашему домену
- [ ] API ключи биржи имеют правильные разрешения
- [ ] PostgreSQL запущен и доступен
- [ ] Версия Node.js 18+
- [ ] Все зависимости установлены
- [ ] Схема базы данных применена
- [ ] Файл .env не закоммичен в git
- [ ] Production секреты сохранены безопасно

---

**Нужна помощь?**

- См. [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) для детальной настройки
- См. [QUICK_START.md](./QUICK_START.md) для быстрой настройки
- Проверьте раздел устранения неполадок для частых проблем
