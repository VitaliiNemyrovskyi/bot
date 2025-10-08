# Bybit Integration - Developer Guide

## Quick Start

### Setup Environment Variables

Create a `.env.local` file:

```bash
# Required
ENCRYPTION_KEY=<generate-with-command-below>
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret-key"

# Optional - For Testing
BYBIT_TEST_API_KEY="your-testnet-api-key"
BYBIT_TEST_API_SECRET="your-testnet-api-secret"

# Optional - Debugging
BYBITTRACE=1  # Uncomment to enable detailed API logging
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Your Integration

```bash
# Install dependencies
npm install

# Run diagnostic test
BYBIT_TEST_API_KEY=xxx BYBIT_TEST_API_SECRET=yyy npm run test-wallet

# Start development server
npm run dev
```

## API Endpoints

### Get Wallet Balance
```http
GET /api/bybit/wallet-balance?accountType=UNIFIED&coin=USDT
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `accountType` (optional): UNIFIED, CONTRACT, or SPOT (default: UNIFIED)
- `coin` (optional): Specific coin to query (e.g., USDT, BTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "accountType": "UNIFIED",
        "totalEquity": "1234.56",
        "totalWalletBalance": "1234.56",
        "totalAvailableBalance": "1234.56",
        "coin": [
          {
            "coin": "USDT",
            "equity": "1000.00",
            "walletBalance": "1000.00",
            "usdValue": "1000.00"
          }
        ]
      }
    ]
  },
  "testnet": true,
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### Run Diagnostics
```http
GET /api/bybit/diagnostics
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "test": "Credentials Format Validation",
      "success": true,
      "message": "API credentials format is valid",
      "timestamp": "2025-10-01T13:00:00.000Z"
    }
  ],
  "summary": {
    "total": 6,
    "passed": 6,
    "failed": 0,
    "healthStatus": "healthy"
  }
}
```

## Using BybitService in Your Code

### Basic Usage

```typescript
import { BybitService } from '@/lib/bybit';

// Create service with credentials
const service = new BybitService({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  testnet: true,
  enableRateLimit: true
});

// Get wallet balance
const balance = await service.getWalletBalance('UNIFIED');
console.log('Total Equity:', balance.list[0].totalEquity);

// Get API key info
const keyInfo = await service.getApiKeyInfo();
console.log('Permissions:', keyInfo.permissions);
```

### Load from Database

```typescript
import { BybitService } from '@/lib/bybit';

// Create service from user's stored credentials
const service = await BybitService.createFromDatabase(userId);

if (!service) {
  throw new Error('User has not configured API keys');
}

const balance = await service.getWalletBalance('UNIFIED');
```

### Error Handling

```typescript
try {
  const balance = await service.getWalletBalance('UNIFIED');
} catch (error: any) {
  if (error.message.includes('Bybit API Error')) {
    // Extract error code from message
    const match = error.message.match(/\((\d+)\)/);
    const retCode = match ? parseInt(match[1]) : null;

    switch (retCode) {
      case 10003:
        console.error('Invalid API key');
        break;
      case 10004:
        console.error('Signature error');
        break;
      case 33004:
        console.error('Missing permissions');
        break;
      default:
        console.error('API error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Using BybitDiagnostics

### Run Full Diagnostics

```typescript
import { BybitDiagnostics } from '@/lib/bybit-diagnostics';

const results = await BybitDiagnostics.runFullDiagnostics(
  apiKey,
  apiSecret,
  testnet
);

// Print formatted report
const report = BybitDiagnostics.formatDiagnosticReport(results);
console.log(report);

// Check overall health
const allPassed = results.every(r => r.success);
if (!allPassed) {
  console.error('Some diagnostic tests failed');
}
```

### Quick Health Check

```typescript
import { BybitDiagnostics } from '@/lib/bybit-diagnostics';

const isHealthy = await BybitDiagnostics.quickHealthCheck(
  apiKey,
  apiSecret,
  testnet
);

if (!isHealthy) {
  console.error('Bybit API integration is not healthy');
}
```

## Managing API Keys

### Save API Keys

```typescript
import { BybitKeysService } from '@/lib/bybit-keys-service';

await BybitKeysService.saveApiKeys(userId, {
  apiKey: 'user-api-key',
  apiSecret: 'user-api-secret',
  testnet: true
});
```

### Get API Keys

```typescript
const keys = await BybitKeysService.getApiKeys(userId);
if (!keys) {
  console.log('User has not configured API keys');
}
```

### Check API Key Info

```typescript
const info = await BybitKeysService.getApiKeyInfo(userId);
console.log('Has keys:', info.hasKeys);
console.log('API key preview:', info.apiKeyPreview);
console.log('Testnet:', info.testnet);
```

### Delete API Keys

```typescript
const deleted = await BybitKeysService.deleteApiKeys(userId);
if (deleted) {
  console.log('API keys deleted successfully');
}
```

## Common Operations

### Get Account Balance

```typescript
const service = await BybitService.createFromDatabase(userId);
const balance = await service.getWalletBalance('UNIFIED');

console.log('Total Wallet Balance:', balance.list[0].totalWalletBalance);
console.log('Available Balance:', balance.list[0].totalAvailableBalance);

// List all coins with balance
balance.list[0].coin.forEach(coin => {
  if (parseFloat(coin.walletBalance) > 0) {
    console.log(`${coin.coin}: ${coin.walletBalance} (${coin.usdValue} USD)`);
  }
});
```

### Get Specific Coin Balance

```typescript
const balance = await service.getWalletBalance('UNIFIED', 'USDT');
const usdtCoin = balance.list[0].coin.find(c => c.coin === 'USDT');
console.log('USDT Balance:', usdtCoin?.walletBalance);
```

### Check API Key Permissions

```typescript
const keyInfo = await service.getApiKeyInfo();

// Check if has wallet permission
const hasWalletPermission = keyInfo.permissions.Wallet?.length > 0;
console.log('Has wallet permission:', hasWalletPermission);

// List all permissions
Object.entries(keyInfo.permissions).forEach(([key, value]) => {
  if (Array.isArray(value) && value.length > 0) {
    console.log(`${key}:`, value.join(', '));
  }
});
```

### Validate API Keys

```typescript
import { BybitKeysService } from '@/lib/bybit-keys-service';

const validation = await BybitKeysService.validateApiKeys(
  apiKey,
  apiSecret,
  testnet
);

if (!validation.valid) {
  console.error('Invalid API keys:', validation.error);
}
```

## Troubleshooting

### Enable Debug Logging

```bash
# Enable detailed HTTP request/response logging
export BYBITTRACE=1
npm run dev
```

### Run Diagnostics

```bash
# Command line
npm run test-wallet

# Or via API
curl -X GET http://localhost:3000/api/bybit/diagnostics \
  -H "Authorization: Bearer <token>"
```

### Check Logs

Application logs use prefixes for easy filtering:
- `[BybitService]` - Service initialization and operations
- `[Bybit]` - API calls and responses
- `[WalletBalance]` - Wallet balance endpoint
- `[Diagnostics]` - Diagnostic operations

```bash
# Filter logs in development
npm run dev | grep "\[Bybit"
```

### Common Issues

**Issue: "API credentials required"**
```typescript
// Make sure credentials are set before calling authenticated endpoints
const service = new BybitService({
  apiKey: process.env.BYBIT_API_KEY,
  apiSecret: process.env.BYBIT_API_SECRET,
  testnet: true
});
```

**Issue: "Invalid API key" (retCode: 10003)**
- Verify API key is correct
- Check if using testnet key with testnet: true
- Ensure no whitespace in credentials

**Issue: "Signature error" (retCode: 10004)**
- Verify API secret is correct
- Check system time is synchronized
- Ensure API secret has no whitespace

**Issue: "Missing permissions" (retCode: 33004)**
- Enable "Wallet" read permission on API key
- Enable "Account Info" permission
- Wait 1-2 minutes for changes to propagate

**Issue: Empty balance response**
- Try different account types (UNIFIED, CONTRACT, SPOT)
- Check if account actually has any balance
- Verify account type matches your Bybit account type

## Testing

### Unit Tests

```typescript
import { BybitService } from '@/lib/bybit';
import { BybitDiagnostics } from '@/lib/bybit-diagnostics';

describe('BybitService', () => {
  it('should create service with credentials', () => {
    const service = new BybitService({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      testnet: true
    });

    expect(service.hasCredentials()).toBe(true);
    expect(service.isTestnet()).toBe(true);
  });

  it('should validate credentials format', async () => {
    const result = await BybitDiagnostics.runFullDiagnostics(
      'test-key',
      'test-secret',
      true
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].test).toBe('Credentials Format Validation');
  });
});
```

### Integration Tests

```typescript
describe('Wallet Balance API', () => {
  it('should fetch wallet balance', async () => {
    const response = await fetch('/api/bybit/wallet-balance?accountType=UNIFIED', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.list).toHaveLength(1);
  });
});
```

## Best Practices

### 1. Always Use Rate Limiting

```typescript
const service = new BybitService({
  apiKey: 'your-key',
  apiSecret: 'your-secret',
  testnet: true,
  enableRateLimit: true  // Always enable
});
```

### 2. Cache Balance Data

```typescript
// Cache for 30 seconds
const CACHE_TTL = 30 * 1000;
let cachedBalance: any = null;
let cacheTimestamp: number = 0;

async function getBalanceCached(userId: string) {
  const now = Date.now();
  if (cachedBalance && now - cacheTimestamp < CACHE_TTL) {
    return cachedBalance;
  }

  const service = await BybitService.createFromDatabase(userId);
  cachedBalance = await service.getWalletBalance('UNIFIED');
  cacheTimestamp = now;

  return cachedBalance;
}
```

### 3. Handle Errors Gracefully

```typescript
async function getWalletBalanceSafe(userId: string) {
  try {
    const service = await BybitService.createFromDatabase(userId);
    if (!service) {
      return { success: false, error: 'NO_API_KEYS' };
    }

    const balance = await service.getWalletBalance('UNIFIED');
    return { success: true, data: balance };
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return {
      success: false,
      error: 'API_ERROR',
      message: error.message
    };
  }
}
```

### 4. Validate Before Saving

```typescript
import { BybitKeysService } from '@/lib/bybit-keys-service';

async function saveApiKeys(userId: string, apiKey: string, apiSecret: string, testnet: boolean) {
  // Validate first
  const validation = await BybitKeysService.validateApiKeys(apiKey, apiSecret, testnet);

  if (!validation.valid) {
    throw new Error(`Invalid API keys: ${validation.error}`);
  }

  // Then save
  await BybitKeysService.saveApiKeys(userId, {
    apiKey: apiKey.trim(),  // Trim whitespace
    apiSecret: apiSecret.trim(),
    testnet
  });
}
```

### 5. Use Diagnostics for Health Checks

```typescript
import { BybitDiagnostics } from '@/lib/bybit-diagnostics';

async function checkApiHealth(userId: string) {
  const keys = await BybitKeysService.getApiKeys(userId);
  if (!keys) return { healthy: false, reason: 'NO_KEYS' };

  const isHealthy = await BybitDiagnostics.quickHealthCheck(
    keys.apiKey,
    keys.apiSecret,
    keys.testnet
  );

  return { healthy: isHealthy };
}
```

## Resources

- **Troubleshooting Guide**: `/BYBIT_WALLET_TROUBLESHOOTING.md`
- **Fixes Summary**: `/BYBIT_FIXES_SUMMARY.md`
- **Bybit API Docs**: https://bybit-exchange.github.io/docs/v5/intro
- **Bybit API Status**: https://bybit-status.com/

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/bybit/wallet-balance` | GET | Required | Get wallet balance |
| `/api/bybit/diagnostics` | GET | Required | Run diagnostics |

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ENCRYPTION_KEY` | Yes | 64-char hex for encrypting API keys |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `BYBIT_TEST_API_KEY` | No | Testnet API key for testing |
| `BYBIT_TEST_API_SECRET` | No | Testnet API secret for testing |
| `BYBITTRACE` | No | Set to '1' to enable HTTP tracing |

## Support

For issues or questions:
1. Run diagnostics: `npm run test-wallet`
2. Check logs for `[Bybit]` prefixed messages
3. Review troubleshooting guide
4. Consult Bybit API documentation
