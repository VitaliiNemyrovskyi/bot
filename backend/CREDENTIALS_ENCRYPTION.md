# API Credentials Encryption - Important Notes

## Critical Information

**⚠️ NEVER read API credentials directly from the database!**

All API credentials (apiKey, apiSecret, authToken) are **ENCRYPTED** in the database using `EncryptionService`.

## Correct Way to Get Credentials

### ✅ DO: Use ExchangeCredentialsService

```typescript
import { ExchangeCredentialsService } from '../lib/exchange-credentials-service';

// Get decrypted credentials for a user and exchange
const credentials = await ExchangeCredentialsService.getActiveCredentials(
  'admin_1',  // userId
  'BYBIT'     // exchange: 'BYBIT' | 'BINGX' | 'BINANCE' | etc.
);

if (credentials) {
  // These are DECRYPTED and ready to use
  const apiKey = credentials.apiKey;
  const apiSecret = credentials.apiSecret;

  // Create exchange service
  const bybit = new BybitService({
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    enableRateLimit: true,
    userId: 'admin_1',
    credentialId: credentials.id,
  });
}
```

### ❌ DON'T: Read directly from Prisma

```typescript
// ❌ WRONG - These credentials are ENCRYPTED!
const credentials = await prisma.exchangeCredentials.findFirst({
  where: { exchange: 'BYBIT', isActive: true }
});

// ❌ This will FAIL - apiKey and apiSecret are encrypted strings!
const bybit = new BybitService({
  apiKey: credentials.apiKey,      // ❌ ENCRYPTED - won't work!
  apiSecret: credentials.apiSecret, // ❌ ENCRYPTED - won't work!
});
```

## Why This Matters

When you read credentials directly from the database:
- They are encrypted strings (e.g., `f2c4ea72f925f99376313376ff0d88f9:ffecb4cd5eff30e993b118fee6735777559f:34b023a416c8a48210d9f5267e2ce94f`)
- Exchange APIs will reject them with errors like:
  - Bybit: `API key is invalid` (401)
  - BingX: `Incorrect apiKey` (100413)

## ExchangeCredentialsService Features

- ✅ **Automatic decryption** of API keys
- ✅ **In-memory caching** with 5-minute TTL for performance
- ✅ **Multiple credentials** per exchange support
- ✅ **Active credential management**

## Examples from Real Code

### Graduated Entry Service
```typescript
// The graduated entry service gets credentials through ConnectorStateCache,
// which internally uses ExchangeCredentialsService
const connector = await ConnectorStateCache.getConnector(
  userId,
  exchange,
  credentialId
);
```

### Test Scripts
```typescript
// ✅ CORRECT way in test scripts
import { ExchangeCredentialsService } from '../lib/exchange-credentials-service';

const credentials = await ExchangeCredentialsService.getActiveCredentials(
  'admin_1',
  'BINGX'
);

const bingx = new BingXService({
  apiKey: credentials.apiKey,      // ✅ Decrypted
  apiSecret: credentials.apiSecret, // ✅ Decrypted
  enableRateLimit: true,
  userId: 'admin_1',
  credentialId: credentials.id,
});
```

## Encryption Details

- **Service**: `EncryptionService` in `/src/lib/encryption.ts`
- **Algorithm**: AES-256-CBC
- **Key Source**: `ENCRYPTION_KEY` environment variable
- **Format**: `iv:encryptedData:authTag` (colon-separated)

## When Creating New Scripts

Always remember:
1. ✅ Import `ExchangeCredentialsService`
2. ✅ Use `getActiveCredentials(userId, exchange)`
3. ❌ Never use `prisma.exchangeCredentials.findFirst()` directly for getting usable credentials
4. ❌ Never pass raw database credentials to exchange services

## Historical Context

This issue has occurred multiple times when creating test scripts that read credentials directly from the database without decryption. The symptoms are always API authentication errors even though the credentials are valid in the database.

**Remember**: If you get authentication errors from exchange APIs, check if credentials are being decrypted properly!

## Related Files

- `/src/lib/encryption.ts` - Encryption service
- `/src/lib/exchange-credentials-service.ts` - Credential management
- `/src/services/connector-state-cache.service.ts` - Connector caching (uses ExchangeCredentialsService)
