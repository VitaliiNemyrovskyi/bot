# Configuration Reference

Complete reference for all configuration options.

## Environment Variables

### Backend Configuration

All backend environment variables should be set in `/backend/.env`

#### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NODE_ENV` | string | Environment mode | `development`, `staging`, `production` |
| `PORT` | number | Backend server port | `3000` |
| `DATABASE_URL` | string | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | string | Secret for JWT token signing (min 32 chars) | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | string | JWT token expiration time | `1d`, `7d`, `30d` |
| `FRONTEND_URL` | string | Frontend application URL | `http://localhost:4200` |
| `ENCRYPTION_KEY` | string | Key for encrypting API credentials (exactly 32+ chars) | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

#### Optional Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `GOOGLE_CLIENT_ID` | string | Google OAuth client ID | Get from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | string | Google OAuth client secret | Get from Google Cloud Console |
| `POSTGRES_HOST` | string | PostgreSQL host (alternative to DATABASE_URL) | `localhost` |
| `POSTGRES_PORT` | number | PostgreSQL port | `5432` |
| `POSTGRES_DB` | string | Database name | `auth_app_local` |
| `POSTGRES_USER` | string | Database user | `postgres` |
| `POSTGRES_PASSWORD` | string | Database password | Your password |

---

### Frontend Configuration

Configuration in `/frontend/src/environments/`

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

## Database Configuration

### Supported Database: PostgreSQL

| Setting | Recommended Value | Notes |
|---------|------------------|-------|
| Version | 14+ | Minimum supported version |
| Max Connections | 100+ | Adjust based on load |
| SSL Mode | `require` (production) | `disable` for local dev |
| Timezone | UTC | Consistent timestamp handling |

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Examples**:

```bash
# Local development
postgresql://postgres:password@localhost:5432/auth_app_local

# With SSL (production)
postgresql://user:pass@host:5432/db?sslmode=require

# Cloud provider (Railway, Supabase, etc.)
postgresql://user:pass@cloud-host.provider.com:5432/db?sslmode=require
```

---

## Exchange API Configuration

### Supported Exchanges

| Exchange | Testnet Available | Max Leverage | Notes |
|----------|------------------|--------------|-------|
| **Bybit** | ✅ Yes | 100x | Recommended for beginners |
| **BingX** | ❌ No | 125x | Contact support for testnet |
| **Binance** | ✅ Yes | 125x | Strict rate limits |
| **OKX** | ✅ Yes | 125x | Good liquidity |
| **Kraken** | ❌ No | 5x | Spot only |
| **Coinbase** | ✅ Yes (Sandbox) | 3x | Limited features |

### API Permissions Required

**For Funding Arbitrage**:
- ✅ Read: Account, Position, Order
- ✅ Write: Trade, Position
- ❌ Withdraw: NOT REQUIRED (more secure)

**Security Settings**:
- Enable IP whitelist (add your server IP)
- Use API keys without withdrawal permissions
- Rotate keys every 3-6 months
- Use separate keys for testnet and mainnet

---

## Trading Configuration

### Leverage Settings

| Strategy | Recommended Leverage | Risk Level |
|----------|---------------------|------------|
| Funding Arbitrage | 1-5x | Low |
| Grid Trading | 1-10x | Medium |
| Aggressive Trading | 10-20x | High |

**Default Leverage**: 3x (configurable per subscription)

### Position Limits

Varies by exchange and account type. Check with your exchange.

### Funding Arbitrage Settings

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| Leverage | 3x | 1-20x | Position multiplier |
| Min Funding Rate | 0.01% | - | Minimum rate to trigger |
| Execution Window | 5s before | - | When to open positions |
| Max Position Size | User defined | - | Set based on risk tolerance |

---

## Security Configuration

### JWT Configuration

```env
JWT_SECRET=minimum-32-character-secret-key-here
JWT_EXPIRES_IN=1d  # Options: 1h, 1d, 7d, 30d
```

**Recommendations**:
- Use at least 64 characters for production
- Never commit JWT_SECRET to version control
- Rotate secrets periodically
- Use different secrets for dev/staging/production

### Encryption Configuration

```env
ENCRYPTION_KEY=32-byte-hex-string-generated-securely
```

**Generate Secure Key**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**:
- Must be exactly 32 bytes (64 hex characters)
- Never change after storing encrypted data
- Backup this key securely
- Losing this key means losing access to encrypted API credentials

---

## Deployment Configuration

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

**Additional Production Settings**:
- Enable rate limiting
- Use SSL for database connections
- Set up monitoring and logging
- Configure backups
- Use environment secrets management (AWS Secrets Manager, etc.)

---

## Application Ports

| Service | Port | Configurable | Notes |
|---------|------|--------------|-------|
| Backend API | 3000 | ✅ Yes (PORT env var) | Next.js dev server |
| Frontend | 4200 | ✅ Yes (ng serve --port) | Angular dev server |
| PostgreSQL | 5432 | ✅ Yes (standard) | Database |
| Prisma Studio | 5555 | ❌ Fixed | Database GUI (dev only) |

---

## Feature Flags

Configure in application code:

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

## Performance Tuning

### Database Connection Pool

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

### API Rate Limits

Adjust based on exchange limits and your subscription tier:

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

## Logging Configuration

Set log levels:

```env
LOG_LEVEL=info  # error, warn, info, debug, trace
LOG_FORMAT=json # json, pretty
```

**Log Levels**:
- `error`: Only errors
- `warn`: Errors and warnings
- `info`: General information (recommended)
- `debug`: Detailed debugging info
- `trace`: Very verbose (dev only)

---

## Troubleshooting Configuration Issues

### Validate .env File

```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✅ DATABASE_URL set' : '❌ DATABASE_URL missing')"
```

### Check Encryption Key Length

```bash
node -e "const key = 'your-key-here'; console.log('Length:', key.length, '- Valid:', key.length >= 64 ? '✅' : '❌ Should be 64')"
```

### Test Database Connection

```bash
psql "$DATABASE_URL" -c "SELECT version();"
```

### Verify JWT Secret Strength

JWT_SECRET should be:
- At least 32 characters (64+ recommended)
- Random and unpredictable
- Never shared or committed to git

---

## Environment File Template

Save as `/backend/.env`:

```env
# ==========================================
# REQUIRED CONFIGURATION
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
# OPTIONAL CONFIGURATION
# ==========================================

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Connection (Alternative to DATABASE_URL)
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=auth_app_local
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=password

# Logging (Optional)
# LOG_LEVEL=info
# LOG_FORMAT=pretty
```

---

## Configuration Checklist

Before deploying or running:

- [ ] DATABASE_URL is set and tested
- [ ] JWT_SECRET is secure (32+ chars)
- [ ] ENCRYPTION_KEY is generated (64 hex chars)
- [ ] Frontend URL matches your domain
- [ ] Exchange API keys have correct permissions
- [ ] PostgreSQL is running and accessible
- [ ] Node.js version is 18+
- [ ] All dependencies installed
- [ ] Database schema is pushed
- [ ] .env file is not committed to git
- [ ] Production secrets are stored securely

---

**Need Help?**

- See [USER_SETUP_GUIDE.md](./USER_SETUP_GUIDE.md) for detailed setup
- See [QUICK_START.md](./QUICK_START.md) for fast setup
- Check troubleshooting section for common issues
