# Quick Start Guide

Get up and running in 10 minutes!

## Prerequisites Check

```bash
node --version  # Should be v18+
psql --version  # Should be v14+
git --version
```

## 1. Database Setup (2 minutes)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE auth_app_local;"

# Verify
psql -U postgres -d auth_app_local -c "SELECT 1"
```

## 2. Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.local .env

# Generate encryption key and update .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to ENCRYPTION_KEY in .env

# Update DATABASE_URL in .env:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"

# Setup database
npx prisma generate
npx prisma db push

# Start server
npm run dev
```

**Backend should be running at http://localhost:3000**

## 3. Frontend Setup (3 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start server
npm start
```

**Frontend should be running at http://localhost:4200**

## 4. First Time Use (2 minutes)

1. Open http://localhost:4200
2. Click **Register** and create account
3. Login with your credentials

## 5. Add Exchange (Optional)

### Get Testnet API Keys

**Bybit Testnet**:
1. Visit: https://testnet.bybit.com/
2. Register/Login
3. Go to API Management
4. Create API key with Trade permissions
5. Copy API Key and Secret

**BingX Testnet**:
1. Contact BingX support for testnet access
2. Or use mainnet with small amounts

### Add to Application

1. In the app, go to **Settings** → **Exchange Connections**
2. Click **Add Exchange Credentials**
3. Fill in:
   - Exchange: BYBIT
   - Environment: TESTNET
   - API Key: `your-api-key`
   - API Secret: `your-api-secret`
   - Label: "Bybit Test"
4. Click **Save**

## You're Ready!

Navigate to **Trading** → **Funding Rates** to see opportunities.

---

## Minimal .env Configuration

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

## Common Issues

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection error?**
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

**Prisma error?**
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Next Steps

- Read the full [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) for detailed instructions
- Test funding arbitrage on testnet
- Review security best practices
- Monitor your first trades

**Need help?** Check the troubleshooting section in the full guide.
