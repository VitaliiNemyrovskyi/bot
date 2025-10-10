# Руководство по быстрому старту

Запустите за 10 минут!

## Проверка требований

```bash
node --version  # Должно быть v18+
psql --version  # Должно быть v14+
git --version
```

## 1. Настройка базы данных (2 минуты)

```bash
# Создайте базу данных
psql -U postgres -c "CREATE DATABASE auth_app_local;"

# Проверьте
psql -U postgres -d auth_app_local -c "SELECT 1"
```

## 2. Настройка Backend (3 минуты)

```bash
cd backend

# Установите зависимости
npm install

# Создайте файл .env
cp .env.local .env

# Сгенерируйте ключ шифрования и обновите .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Скопируйте вывод в ENCRYPTION_KEY в .env

# Обновите DATABASE_URL в .env:
# DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/auth_app_local"

# Настройте базу данных
npx prisma generate
npx prisma db push

# Запустите сервер
npm run dev
```

**Backend должен работать на http://localhost:3000**

## 3. Настройка Frontend (3 минуты)

```bash
cd frontend

# Установите зависимости
npm install

# Запустите сервер
npm start
```

**Frontend должен работать на http://localhost:4200**

## 4. Первое использование (2 минуты)

1. Откройте http://localhost:4200
2. Нажмите **Регистрация** и создайте аккаунт
3. Войдите с вашими учетными данными

## 5. Добавьте биржу (Необязательно)

### Получите тестовые API ключи

**Bybit Testnet**:
1. Посетите: https://testnet.bybit.com/
2. Зарегистрируйтесь/Войдите
3. Перейдите в Управление API
4. Создайте API ключ с разрешениями Trade
5. Скопируйте API ключ и секрет

**BingX Testnet**:
1. Свяжитесь с поддержкой BingX для доступа к testnet
2. Или используйте mainnet с небольшими суммами

### Добавьте в приложение

1. В приложении перейдите в **Настройки** → **Подключения к биржам**
2. Нажмите **Добавить учетные данные биржи**
3. Заполните:
   - Биржа: BYBIT
   - Окружение: TESTNET
   - API ключ: `ваш-api-ключ`
   - API секрет: `ваш-api-секрет`
   - Метка: "Bybit Test"
4. Нажмите **Сохранить**

## Вы готовы!

Перейдите в **Торговля** → **Ставки финансирования**, чтобы увидеть возможности.

---

## Минимальная конфигурация .env

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/auth_app_local"
JWT_SECRET=ваш-длинный-случайный-секрет-здесь-минимум-32-символа
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
ENCRYPTION_KEY=ваш-сгенерированный-ключ-шифрования-из-шага-2
```

---

## Распространенные проблемы

**Порт уже используется?**
```bash
# Завершите процесс на порту 3000
lsof -ti:3000 | xargs kill -9
```

**Ошибка подключения к базе данных?**
```bash
# Проверьте, что PostgreSQL запущен
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

**Ошибка Prisma?**
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Следующие шаги

- Прочитайте полное [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) для подробных инструкций
- Протестируйте арбитраж финансирования на testnet
- Просмотрите лучшие практики безопасности
- Мониторьте ваши первые сделки

**Нужна помощь?** Проверьте раздел устранения неполадок в полном руководстве.
