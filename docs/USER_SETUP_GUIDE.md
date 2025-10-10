# User Setup Guide - Cryptocurrency Trading Bot Platform

## Table of Contents

1. [Overview](#overview)
2. [What is This Application?](#what-is-this-application)
3. [Prerequisites](#prerequisites)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Exchange Configuration](#exchange-configuration)
7. [Running the Application](#running-the-application)
8. [Using the Application](#using-the-application)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Overview

This is a full-stack cryptocurrency trading bot platform that enables automated trading strategies, including funding rate arbitrage. The application consists of:

- **Backend**: Next.js API server with PostgreSQL database
- **Frontend**: Angular-based web interface
- **Supported Exchanges**: Bybit, Binance, BingX, OKX, Kraken, Coinbase

---

## What is This Application?

This platform provides:

### Core Features
- **Authentication**: Secure user authentication with JWT and Google OAuth
- **Exchange Integration**: Connect multiple cryptocurrency exchange accounts
- **Funding Arbitrage**: Automated funding rate arbitrage strategies
- **Grid Trading Bots**: Customizable grid trading bots
- **Backtesting**: Test trading strategies against historical data
- **Real-time Data**: Live funding rates and price charts
- **Portfolio Management**: Track your positions and P&L across exchanges

### Funding Arbitrage Strategy
The platform specializes in funding rate arbitrage - profiting from the periodic funding payments in perpetual futures contracts. The bot:
1. Opens a position on one exchange (primary)
2. Opens an opposite position on another exchange (hedge)
3. Collects funding payments
4. Closes both positions after funding

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Exchange Accounts

You'll need API keys from at least one supported exchange:
- **Bybit**: https://www.bybit.com/
- **BingX**: https://bingx.com/
- **Binance**: https://www.binance.com/
- **OKX**: https://www.okx.com/

**Important**: Start with testnet/demo accounts to avoid risking real funds while learning.

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure PostgreSQL Database

#### Option A: Local PostgreSQL Installation

1. Create a database:
```bash
psql -U postgres
CREATE DATABASE auth_app_local;
\q
```

2. Verify connection:
```bash
psql -U postgres -d auth_app_local -c "SELECT 1"
```

#### Option B: Cloud PostgreSQL (Railway, Supabase, etc.)

1. Create a database instance on your preferred cloud provider
2. Note your connection string (format: `postgresql://username:password@host:port/database`)

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.local .env
```

Edit the `.env` file with your configuration:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database Connection
# Replace with your actual PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_app_local"

# PostgreSQL Connection Details (if using separate variables)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=auth_app_local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD

# JWT Configuration
# Generate a secure random string (at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-for-local-development-replace-this
JWT_EXPIRES_IN=1d

# Google OAuth (Optional)
# Get credentials from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:4200

# Encryption Key for API Keys Storage
# IMPORTANT: Must be exactly 32 characters or more
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 4. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace the `ENCRYPTION_KEY` value in your `.env` file.

### 5. Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 6. Start the Backend Server

```bash
npm run dev
```

The backend should now be running at `http://localhost:3000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
import { appConfig } from '../app/config/app.config';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'your-google-client-id', // Optional: for Google OAuth
  appName: 'Trading Bot - Development'
};
```

### 3. Start the Frontend Server

```bash
npm start
```

The frontend should now be running at `http://localhost:4200`

---

## Exchange Configuration

### 1. Create Exchange API Keys

#### For Bybit:

1. Log in to Bybit
2. Go to API Management: https://www.bybit.com/app/user/api-management
3. Create a new API key with these permissions:
   - **Read**: Position, Order, Wallet
   - **Write**: Trade, Position
4. **Important**: Enable "Derivatives" trading
5. Save your API Key and Secret securely

#### For BingX:

1. Log in to BingX
2. Go to API Management: https://bingx.com/en-us/account/api/
3. Create a new API key with these permissions:
   - **Perpetual Futures**: Read + Write
4. Save your API Key and Secret securely

#### For Binance:

1. Log in to Binance
2. Go to API Management: https://www.binance.com/en/my/settings/api-management
3. Create a new API key
4. Enable "Futures" trading
5. Save your API Key and Secret securely

### 2. Add API Keys to Application

1. Open the application at `http://localhost:4200`
2. Register/Login to your account
3. Navigate to **Settings** → **Exchange Connections**
4. Click **Add Exchange Credentials**
5. Fill in the form:
   - **Exchange**: Select your exchange (e.g., BYBIT)
   - **Environment**: Choose TESTNET (recommended) or MAINNET
   - **API Key**: Paste your API key
   - **API Secret**: Paste your API secret
   - **Label**: Give it a friendly name (e.g., "Bybit Testnet Main")
   - **Active**: Check to set as active
6. Click **Save**

**Important Security Notes**:
- API keys are encrypted before storage using AES-256-CBC
- Never share your API keys with anyone
- Use IP whitelist restrictions on exchange side when possible
- Start with testnet accounts
- Only enable required permissions (don't give withdrawal permission)

---

## Running the Application

### Development Mode

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
cd frontend
npm start
```

### Production Mode

#### Build Backend
```bash
cd backend
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build
# Serve the dist folder with a web server
```

---

## Using the Application

### 1. Create Your Account

1. Open `http://localhost:4200`
2. Click **Register**
3. Fill in email and password
4. Verify your account (if email verification is enabled)

### 2. Connect Exchange Accounts

Follow the steps in [Exchange Configuration](#exchange-configuration)

### 3. Set Up Funding Arbitrage

1. Navigate to **Trading** → **Funding Rates**
2. Browse available funding rate opportunities
3. Click on a symbol to see details
4. Click **Subscribe** to set up arbitrage
5. Configure:
   - **Primary Exchange**: Where you'll take the funding payment
   - **Hedge Exchange**: Where you'll take the opposite position
   - **Quantity**: How much to trade
   - **Leverage**: Multiplier (1-20x recommended, default 3x)
6. Click **Confirm**

### 4. Monitor Your Positions

1. Navigate to **Dashboard**
2. View active subscriptions
3. Monitor P&L and funding earned
4. Check position status

### 5. View History

1. Navigate to **Trading** → **History**
2. Review closed positions
3. Analyze performance metrics

---

## Troubleshooting

### Database Connection Issues

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql

   # Windows
   # Check Services app for PostgreSQL service
   ```

2. Test connection:
   ```bash
   psql -U postgres -d auth_app_local -c "SELECT 1"
   ```

3. Check DATABASE_URL in `.env` matches your PostgreSQL configuration

### Backend Won't Start

**Error**: `Port 3000 already in use`

**Solution**:
1. Kill the process using port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or change the port in `.env`:
   ```env
   PORT=3001
   ```

### Exchange API Errors

**Error**: `Invalid signature` or `Authentication failed`

**Solution**:
1. Verify API keys are correct (no extra spaces)
2. Check API key permissions on exchange
3. Verify system time is synchronized (exchanges require accurate time)
4. Check if API key is IP-restricted (add your IP to whitelist)

**Error**: `Insufficient balance`

**Solution**:
1. Ensure you have funds in your exchange account
2. Check you're using the correct account type (Spot vs Futures)
3. Verify margin is available for leveraged trades

**Error**: `Leverage cannot be changed when there are open positions`

**Solution**:
1. Close all open positions for that symbol
2. Then retry the arbitrage subscription
3. Or use a different symbol

### Frontend Build Errors

**Error**: `Module not found` or `Can't resolve...`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues

**Error**: `Prisma Client not generated`

**Solution**:
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Security Best Practices

### 1. API Key Security

- Never commit `.env` files to git
- Use `.env.local` for local development
- Rotate API keys periodically
- Use separate keys for testnet and mainnet
- Enable IP whitelisting on exchanges
- Use read-only keys where possible
- Never grant withdrawal permissions

### 2. Database Security

- Use strong PostgreSQL passwords
- Don't expose database port to the internet
- Regular backups
- Use SSL connections in production

### 3. Application Security

- Change default JWT_SECRET immediately
- Use strong passwords
- Enable two-factor authentication (when available)
- Keep Node.js and dependencies updated
- Monitor for security vulnerabilities: `npm audit`

### 4. Trading Security

- Start with small amounts
- Always test on testnet first
- Set stop-loss limits
- Monitor positions regularly
- Never invest more than you can afford to lose

### 5. Environment Variables

Never share or commit:
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `DATABASE_URL`
- `GOOGLE_CLIENT_SECRET`
- Any API keys or secrets

---

## Additional Resources

### Documentation

- **Prisma**: https://www.prisma.io/docs/
- **Next.js**: https://nextjs.org/docs
- **Angular**: https://angular.io/docs
- **Bybit API**: https://bybit-exchange.github.io/docs/v5/intro
- **BingX API**: https://bingx-api.github.io/docs/

### Support

- Check `LEVERAGE_SYNC_VERIFICATION.md` for leverage sync details
- Review `LEVERAGE_SYNC_IMPLEMENTATION.md` for technical details
- See project README.md for API endpoints

### Development

- Frontend runs on port 4200
- Backend runs on port 3000
- Database typically on port 5432
- Hot reload enabled in development mode

---

## Quick Start Checklist

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed and running
- [ ] Database created (`auth_app_local`)
- [ ] Backend `.env` file configured
- [ ] Encryption key generated
- [ ] Backend dependencies installed (`npm install`)
- [ ] Database schema created (`npx prisma db push`)
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend dependencies installed
- [ ] Frontend environment configured
- [ ] Frontend server running (`npm start`)
- [ ] Account created in the app
- [ ] Exchange API keys obtained
- [ ] Exchange credentials added to app
- [ ] First test arbitrage on testnet
- [ ] Monitor results

---

**Congratulations!** You're now ready to use the cryptocurrency trading bot platform.

For questions or issues, please review the troubleshooting section or check the project documentation.

**Disclaimer**: Cryptocurrency trading involves substantial risk. This software is provided as-is without any warranties. Always test thoroughly on testnet before using real funds.
