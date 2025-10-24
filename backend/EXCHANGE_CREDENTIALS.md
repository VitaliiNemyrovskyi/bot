# Exchange Credentials - Important Implementation Details

## ⚠️ CRITICAL: API Credentials Encryption

### Problem
API keys and secrets are **stored encrypted** in the PostgreSQL database using `EncryptionService`. If you try to use credentials directly from Prisma queries, they will be in encrypted form and API calls will fail with authentication errors like:
- BingX: `{"code":100413,"msg":"Incorrect apiKey"}`
- MEXC: `{"code":10072,"msg":"Api key info invalid"}`
- Bybit: `API key is invalid`

### Solution
**ALWAYS decrypt credentials before passing them to exchange connectors:**

```typescript
import { EncryptionService } from '@/lib/encryption';

// ❌ WRONG - Using encrypted credentials
const credentials = await prisma.exchangeCredentials.findFirst({
  where: { exchange: 'BINGX', isActive: true }
});

const connector = new SomeConnector(
  credentials.apiKey,      // ❌ This is encrypted!
  credentials.apiSecret    // ❌ This is encrypted!
);

// ✅ CORRECT - Decrypt before use
const decryptedApiKey = EncryptionService.decrypt(credentials.apiKey);
const decryptedApiSecret = EncryptionService.decrypt(credentials.apiSecret);

const connector = new SomeConnector(
  decryptedApiKey,         // ✅ Properly decrypted
  decryptedApiSecret       // ✅ Properly decrypted
);
```

### Where This Matters
- ✅ `ExchangeCredentialsService.getCredential()` - Already handles decryption
- ❌ Direct Prisma queries - You must decrypt manually
- ❌ Custom API routes - You must decrypt manually
- ❌ Background jobs/workers - You must decrypt manually

### How to Identify Encrypted Keys
Encrypted keys are much longer than normal API keys:
- **Normal BingX API key**: 64-85 characters
- **Encrypted in DB**: 200-250 characters
- **Starts with**: Random characters (not the actual key prefix)

---

## BingX Spot API Specificcommon Issues

### 1. Separate Futures vs Spot APIs

**Problem**: BingX has different API endpoints for Futures and Spot trading:
- Futures: `/openApi/swap/v2/...`
- Spot: `/openApi/spot/v1/...`

**Solution**:
- Use `BingXSpotConnector` for spot trading (triangular arbitrage)
- Use `BingXService` (in `/lib/bingx.ts`) for futures trading
- **DO NOT** use CCXT for BingX Spot - it has known bugs (#24379, #24883, #24907)

### 2. API Key Permissions

BingX API keys can have multiple permissions, but they must be **enabled when creating the key**:
- ✅ Read
- ✅ Spot Trading
- ✅ Perpetual Futures Trading

**Important**: If you enable permissions AFTER creating the key, you may need to create a **NEW** API key. Updating permissions on existing keys sometimes doesn't work properly.

### 3. Symbol Format

BingX Spot uses **hyphenated** symbol format:
- ❌ Wrong: `BTCUSDT`
- ✅ Correct: `BTC-USDT`

The `BingXSpotConnector` has a `convertSymbolToBingXFormat()` method to handle this.

### 4. Symbol Status Field

BingX Spot API returns symbol `status` as a **NUMBER**, not a string:
- ❌ Wrong: `filter(s => s.status === 'TRADING')`
- ✅ Correct: `filter(s => s.status === 1)`

Status values:
- `1` = Trading (active symbol)
- `0` = Not trading (delisted or suspended)
- `10` = Other state

**Best practice**: Also check `apiStateBuy === true && apiStateSell === true` for additional safety.

### 5. Time Synchronization Issues

**Error**: `{"code":100421,"msg":"Null timestamp or timestamp mismatch"}`

**Root Cause**: BingX's server time endpoint may return time in seconds (10 digits) OR milliseconds (13 digits), depending on the API version.

**Solution**: Always check the length of the server time and convert if needed:

```typescript
let serverTime = data.data?.serverTime || data.serverTime;

// BingX may return time in seconds (10 digits) or milliseconds (13 digits)
if (serverTime && serverTime.toString().length === 10) {
  serverTime = serverTime * 1000;  // Convert to milliseconds
}
```

### 6. Authentication Signature

BingX Spot API signature requirements:
- **Parameter order**: Insertion order (NOT alphabetically sorted)
- **Encoding for signature**: NO URL encoding
- **Encoding for URL**: WITH URL encoding
- **Hash algorithm**: HMAC SHA256
- **Output format**: Hexadecimal (not Base64)
- **Header**: `X-BX-APIKEY` (not `X-BINGX-APIKEY`)

Example:
```typescript
// 1. Build params in insertion order
const params = {
  symbol: 'BTC-USDT',
  timestamp: 1761050657000
};

// 2. Generate signature (NO URL encoding)
const queryString = Object.entries(params)
  .map(([key, value]) => `${key}=${value}`)
  .join('&');

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(queryString)
  .digest('hex');  // ✅ HEX, not base64!

// 3. Build URL (WITH URL encoding)
const url = baseUrl + endpoint + '?' +
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&') +
  `&signature=${signature}`;
```

---

## Testing Exchange Connectors

### Quick Test Script

Create a test script like `/backend/test-bingx-spot.ts`:

```typescript
import { EncryptionService } from './src/lib/encryption';
import prisma from './src/lib/prisma';

async function testExchange() {
  const credentials = await prisma.exchangeCredentials.findFirst({
    where: { exchange: 'BINGX', isActive: true }
  });

  // ✅ DECRYPT!
  const apiKey = EncryptionService.decrypt(credentials.apiKey);
  const apiSecret = EncryptionService.decrypt(credentials.apiSecret);

  console.log('API Key Length:', apiKey.length);  // Should be 64-85, not 200+

  // Test your connector...
}
```

Run with: `npx tsx test-bingx-spot.ts`

---

## Common Error Codes

### BingX
- `100413` - Incorrect API key (key is encrypted or wrong)
- `100421` - Timestamp mismatch (time sync issue)
- `100001` - Signature verification failed (wrong signature algorithm)

### MEXC
- `10072` - API key info invalid (key is encrypted or permissions missing)
- `30013` - Signature error (wrong signature method)

### Bybit
- `401` - API key is invalid (key is encrypted or expired)
- `10003` - Invalid API key (permissions missing)

---

## Best Practices

1. **Always decrypt credentials** when getting them from database
2. **Use ExchangeCredentialsService** when possible (handles decryption automatically)
3. **Test with separate script** before integrating into main codebase
4. **Log API key lengths** during debugging (encrypted = 200+, decrypted = 64-128)
5. **Check time synchronization** for timestamp-sensitive APIs
6. **Add detailed logging** during authentication to diagnose issues
7. **Handle different time formats** (seconds vs milliseconds)

---

## Quick Checklist Before Implementing New Exchange

- [ ] Check if API keys need encryption (they do!)
- [ ] Implement time synchronization if required
- [ ] Verify signature generation method (HMAC SHA256/SHA512, hex/base64)
- [ ] Check parameter ordering (alphabetical vs insertion order)
- [ ] Test with public endpoints first (no auth)
- [ ] Test with authenticated endpoints
- [ ] Add proper error handling for common error codes
- [ ] Document exchange-specific quirks

---

**Last Updated**: October 21, 2025
**Related Files**:
- `/backend/src/lib/encryption.ts` - Encryption/decryption service
- `/backend/src/lib/exchange-credentials-service.ts` - Credential management
- `/backend/src/connectors/bingx-spot.connector.ts` - BingX Spot implementation
- `/backend/src/app/api/triangular-arbitrage/scan/start/route.ts` - Example usage
