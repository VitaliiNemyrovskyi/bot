# 🐳 Docker Setup Guide - Trading Bot Platform

Повне керівництво по міграції та запуску проекту на новому комп'ютері за допомогою Docker.

## 📋 Зміст

- [Передумови](#передумови)
- [Швидкий старт](#швидкий-старт)
- [Детальна інструкція](#детальна-інструкція)
- [Управління контейнерами](#управління-контейнерами)
- [Налаштування змінних середовища](#налаштування-змінних-середовища)
- [Міграція даних](#міграція-даних)
- [Troubleshooting](#troubleshooting)

---

## 📦 Передумови

### Встановлення Docker

#### macOS
```bash
# Встановити Docker Desktop для Mac
# Завантажити з: https://www.docker.com/products/docker-desktop

# Або через Homebrew
brew install --cask docker

# Перевірити встановлення
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Оновити пакети
sudo apt-get update

# Встановити необхідні пакети
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Додати офіційний GPG ключ Docker
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Встановити репозиторій
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Встановити Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Додати користувача до групи docker (щоб не використовувати sudo)
sudo usermod -aG docker $USER
newgrp docker

# Перевірити встановлення
docker --version
docker compose version
```

#### Windows
```powershell
# Завантажити Docker Desktop для Windows
# З сайту: https://www.docker.com/products/docker-desktop

# Після встановлення, перевірити в PowerShell:
docker --version
docker-compose --version
```

### Перевірка встановлення

```bash
# Перевірити Docker
docker --version
# Очікуваний вивід: Docker version 24.x.x або новіше

# Перевірити Docker Compose
docker compose version
# Очікуваний вивід: Docker Compose version v2.x.x або новіше

# Перевірити, що Docker запущений
docker ps
# Повинно показати порожній список або запущені контейнери
```

---

## 🚀 Швидкий старт

### 1. Клонування проекту на новий комп'ютер

```bash
# Клонувати репозиторій
git clone <repository-url>
cd 0bot

# Або скопіювати з існуючого комп'ютера
# rsync -avz --exclude 'node_modules' --exclude '.git' /path/to/old/0bot /path/to/new/0bot
```

### 2. Налаштування змінних середовища

```bash
# Створити .env файл з прикладу
cp .env.example .env

# Відредагувати .env файл
nano .env  # або vim .env, або code .env
```

**Мінімально необхідні налаштування:**
```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-char-encryption-key
```

**Генерація безпечних ключів:**
```bash
# Згенерувати JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Згенерувати ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Запуск додатку

```bash
# Запустити всі сервіси
docker compose up -d

# Переглянути логи
docker compose logs -f

# Перевірити статус
docker compose ps
```

### 4. Доступ до додатку

- **Frontend**: http://localhost (порт 80)
- **Backend API**: http://localhost:3000
- **База даних**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

---

## 📖 Детальна інструкція

### Структура проекту

```
0bot/
├── backend/
│   ├── Dockerfile              # Docker образ для backend
│   ├── .dockerignore          # Ігнорувати файли при збірці
│   ├── prisma/
│   │   └── schema.prisma      # Схема бази даних
│   └── package.json
├── frontend/
│   ├── Dockerfile             # Docker образ для frontend
│   ├── nginx.conf             # Конфігурація Nginx
│   ├── .dockerignore          # Ігнорувати файли при збірці
│   └── package.json
├── docker-compose.yml         # Оркестрація всіх сервісів
├── .env.example              # Приклад змінних середовища
└── DOCKER_SETUP.md           # Цей файл
```

### Сервіси в Docker Compose

1. **postgres** - База даних PostgreSQL
   - Порт: 5432
   - Volume: postgres_data (персистентні дані)

2. **redis** - Кеш-сервер Redis
   - Порт: 6379
   - Volume: redis_data

3. **backend** - Next.js backend додаток
   - Порт: 3000
   - Залежить від: postgres, redis
   - Автоматично запускає міграції Prisma

4. **frontend** - Angular frontend з Nginx
   - Порт: 80
   - Проксує API запити до backend
   - Підтримка WebSocket

---

## 🔧 Управління контейнерами

### Базові команди

```bash
# Запустити всі сервіси
docker compose up -d

# Зупинити всі сервіси
docker compose down

# Перезапустити сервіси
docker compose restart

# Переглянути логи всіх сервісів
docker compose logs -f

# Переглянути логи конкретного сервісу
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Перевірити статус сервісів
docker compose ps

# Виконати команду в контейнері
docker compose exec backend sh
docker compose exec postgres psql -U postgres -d auth_app_local
```

### Збірка та оновлення

```bash
# Пересібрати образи
docker compose build

# Пересібрати без кешу
docker compose build --no-cache

# Пересібрати та перезапустити
docker compose up -d --build

# Оновити тільки один сервіс
docker compose up -d --build backend
```

### Очищення

```bash
# Зупинити та видалити контейнери
docker compose down

# Видалити контейнери та volumes (УВАГА: видаляє дані БД!)
docker compose down -v

# Видалити всі невикористані образи
docker image prune -a

# Видалити всі невикористані volumes
docker volume prune

# Повне очищення Docker
docker system prune -a --volumes
```

---

## 🔐 Налаштування змінних середовища

### Створення .env файлу

```bash
# Скопіювати приклад
cp .env.example .env
```

### Обов'язкові змінні

```env
# База даних
POSTGRES_DB=auth_app_local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Шифрування API ключів
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Опціональні змінні

```env
# Google OAuth (якщо використовується)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Exchange API ключі (можна налаштувати через UI)
BYBIT_API_KEY=
BYBIT_API_SECRET=
BINGX_API_KEY=
BINGX_API_SECRET=
```

### Генерація безпечних ключів

```bash
# JWT Secret (256 біт)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (256 біт)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Випадковий пароль
openssl rand -base64 32
```

---

## 💾 Міграція даних

### Експорт даних зі старого комп'ютера

```bash
# Експорт бази даних PostgreSQL
docker compose exec postgres pg_dump -U postgres auth_app_local > backup.sql

# Експорт .env файлу (ОБЕРЕЖНО: містить секрети!)
cp .env .env.backup

# Створити архів проекту (без node_modules)
tar -czf 0bot-backup.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.git' \
  0bot/
```

### Імпорт даних на новий комп'ютер

```bash
# 1. Розархівувати проект
tar -xzf 0bot-backup.tar.gz

# 2. Відновити .env файл
cp .env.backup .env

# 3. Запустити контейнери
cd 0bot
docker compose up -d

# 4. Дочекатися старту postgres (20-30 секунд)
docker compose logs -f postgres

# 5. Імпортувати базу даних
docker compose exec -T postgres psql -U postgres auth_app_local < backup.sql

# 6. Перезапустити backend
docker compose restart backend
```

### Міграції Prisma

```bash
# Виконати міграції вручну
docker compose exec backend npx prisma migrate deploy

# Згенерувати Prisma Client
docker compose exec backend npx prisma generate

# Переглянути статус міграцій
docker compose exec backend npx prisma migrate status

# Створити seed даних (якщо потрібно)
docker compose exec backend npx prisma db seed
```

---

## 🔍 Troubleshooting

### Проблема: Порти зайняті

**Помилка:**
```
Error: bind: address already in use
```

**Рішення:**
```bash
# Знайти процес, що використовує порт
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Змінити порти в .env
BACKEND_PORT=3001
FRONTEND_PORT=8080

# Або зупинити інші сервіси
docker compose down
```

### Проблема: База даних не підключається

**Помилка:**
```
Error: Can't reach database server
```

**Рішення:**
```bash
# Перевірити статус postgres
docker compose ps postgres

# Переглянути логи postgres
docker compose logs postgres

# Перезапустити postgres
docker compose restart postgres

# Перевірити здоров'я контейнера
docker compose exec postgres pg_isready -U postgres

# Перевірити підключення вручну
docker compose exec postgres psql -U postgres -d auth_app_local -c "\dt"
```

### Проблема: Frontend показує помилки API

**Помилка:**
```
HTTP Error 502 Bad Gateway
```

**Рішення:**
```bash
# Перевірити статус backend
docker compose ps backend
docker compose logs backend

# Перевірити підключення backend -> postgres
docker compose exec backend sh -c "nc -zv postgres 5432"

# Перезапустити сервіси у правильному порядку
docker compose down
docker compose up -d postgres redis
sleep 10
docker compose up -d backend
sleep 10
docker compose up -d frontend
```

### Проблема: Повільна збірка образів

**Рішення:**
```bash
# Використати BuildKit для швидшої збірки
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose build

# Очистити build cache якщо потрібно
docker builder prune
```

### Проблема: Prisma міграції не виконуються

**Помилка:**
```
Migration engine error: Can't reach database server
```

**Рішення:**
```bash
# Перевірити DATABASE_URL
docker compose exec backend sh -c 'echo $DATABASE_URL'

# Виконати міграції вручну
docker compose exec backend npx prisma migrate deploy

# Якщо не працює, зайти в контейнер
docker compose exec backend sh
npx prisma migrate status
npx prisma migrate deploy
```

### Проблема: Volume permissions

**Помилка:**
```
Permission denied: '/var/lib/postgresql/data'
```

**Рішення:**
```bash
# Видалити volume та створити заново
docker compose down -v
docker volume rm 0bot_postgres_data
docker compose up -d

# Або змінити права
docker compose exec postgres chown -R postgres:postgres /var/lib/postgresql/data
```

---

## 📊 Моніторинг та логи

### Перевірка здоров'я сервісів

```bash
# Статус всіх сервісів
docker compose ps

# Healthcheck статус
docker inspect --format='{{.State.Health.Status}}' 0bot-backend
docker inspect --format='{{.State.Health.Status}}' 0bot-frontend
docker inspect --format='{{.State.Health.Status}}' 0bot-postgres

# Використання ресурсів
docker stats
```

### Робота з логами

```bash
# Реал-тайм логи
docker compose logs -f

# Логи з timestamp
docker compose logs -f --timestamps

# Останні 100 рядків
docker compose logs --tail=100

# Логи конкретного сервісу
docker compose logs -f backend

# Експорт логів
docker compose logs > logs.txt
```

### Тестування API

```bash
# Healthcheck endpoints
curl http://localhost:3000/api/health
curl http://localhost/health

# Backend API
curl http://localhost:3000/api/user/balance

# Frontend
curl http://localhost/
```

---

## 🔄 Оновлення додатку

### Оновлення з Git

```bash
# Зупинити сервіси
docker compose down

# Оновити код
git pull origin main

# Пересібрати образи
docker compose build

# Запустити сервіси
docker compose up -d

# Виконати міграції (якщо є)
docker compose exec backend npx prisma migrate deploy
```

### Rollback до попередньої версії

```bash
# Зупинити сервіси
docker compose down

# Повернутися до попереднього коміту
git checkout <previous-commit-hash>

# Пересібрати та запустити
docker compose up -d --build
```

---

## 🚀 Production Deployment

### Налаштування для production

```bash
# Створити production .env
cp .env.example .env.production

# Відредагувати production налаштування
nano .env.production
```

**Production .env:**
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
POSTGRES_PASSWORD=very-secure-password
JWT_SECRET=production-jwt-secret-key
ENCRYPTION_KEY=production-encryption-key
```

### Запуск в production

```bash
# Використати production .env
docker compose --env-file .env.production up -d

# Або з SSL/TLS (додати nginx-proxy)
# Див. окрему документацію
```

---

## 📚 Додаткові ресурси

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Angular Docker Deployment](https://angular.io/guide/deployment)

---

## 🆘 Підтримка

Якщо виникли проблеми:

1. Перевірте логи: `docker compose logs -f`
2. Перевірте статус: `docker compose ps`
3. Перегляньте документацію: `SETUP.md`, `ARCHITECTURE.md`
4. Створіть issue в GitHub репозиторії

---

## ✅ Чеклист міграції

- [ ] Docker встановлено та працює
- [ ] Проект склоновано на новий комп'ютер
- [ ] Створено .env файл з правильними налаштуваннями
- [ ] Згенеровано безпечні ключі (JWT_SECRET, ENCRYPTION_KEY)
- [ ] Запущено `docker compose up -d`
- [ ] Перевірено статус всіх сервісів: `docker compose ps`
- [ ] Frontend доступний на http://localhost
- [ ] Backend API відповідає на http://localhost:3000
- [ ] База даних підключена (перевірити логи backend)
- [ ] Імпортовано дані зі старого комп'ютера (якщо потрібно)
- [ ] Міграції Prisma виконано успішно
- [ ] Перевірено функціональність додатку

---

**Успішної міграції! 🎉**
