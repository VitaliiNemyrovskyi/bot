# Посібник швидкого старту

Почніть працювати за 10 хвилин!

## Перевірка передумов

```bash
node --version  # Має бути v18+
psql --version  # Має бути v14+
git --version
```

## 1. Налаштування бази даних (2 хвилини)

```bash
# Створіть базу даних
psql -U postgres -c "CREATE DATABASE auth_app_local;"

# Перевірте
psql -U postgres -d auth_app_local -c "SELECT 1"
```

## 2. Налаштування Backend (3 хвилини)

```bash
cd backend

# Встановіть залежності
npm install

# Створіть файл .env
cp .env.local .env

# Згенеруйте ключ шифрування та оновіть .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Скопіюйте вивід в ENCRYPTION_KEY у .env

# Оновіть DATABASE_URL у .env:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"

# Налаштуйте базу даних
npx prisma generate
npx prisma db push

# Запустіть сервер
npm run dev
```

**Backend має працювати на http://localhost:3000**

## 3. Налаштування Frontend (3 хвилини)

```bash
cd frontend

# Встановіть залежності
npm install

# Запустіть сервер
npm start
```

**Frontend має працювати на http://localhost:4200**

## 4. Перше використання (2 хвилини)

1. Відкрийте http://localhost:4200
2. Натисніть **Register** та створіть обліковий запис
3. Увійдіть з вашими обліковими даними

## 5. Додайте біржу (Опціонально)

### Отримайте API ключі Testnet

**Bybit Testnet**:
1. Відвідайте: https://testnet.bybit.com/
2. Зареєструйтеся/Увійдіть
3. Перейдіть до API Management
4. Створіть API ключ з дозволами Trade
5. Скопіюйте API Key та Secret

**BingX Testnet**:
1. Зверніться до підтримки BingX для доступу до testnet
2. Або використовуйте mainnet з невеликими сумами

### Додайте до додатка

1. У додатку перейдіть до **Settings** → **Exchange Connections**
2. Натисніть **Add Exchange Credentials**
3. Заповніть:
   - Exchange: BYBIT
   - Environment: TESTNET
   - API Key: `your-api-key`
   - API Secret: `your-api-secret`
   - Label: "Bybit Test"
4. Натисніть **Save**

## Ви готові!

Перейдіть до **Trading** → **Funding Rates**, щоб побачити можливості.

---

## Мінімальна конфігурація .env

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"
JWT_SECRET=your-long-random-secret-here-at-least-32-characters
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
ENCRYPTION_KEY=your-generated-encryption-key-from-step-2
```

---

## Типові проблеми

**Порт вже використовується?**
```bash
# Завершіть процес на порту 3000
lsof -ti:3000 | xargs kill -9
```

**Помилка з'єднання з базою даних?**
```bash
# Перевірте, чи працює PostgreSQL
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

**Помилка Prisma?**
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Наступні кроки

- Прочитайте повний [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) для детальних інструкцій
- Протестуйте арбітраж фінансування на testnet
- Перегляньте найкращі практики безпеки
- Моніторте ваші перші торги

**Потрібна допомога?** Перевірте розділ усунення несправностей у повному посібнику.
