# Quick Start Guide: Exchange Credentials API

## What Was Built

A complete multi-exchange credential management system that allows users to:
- Store API credentials for multiple exchanges (Bybit, Binance, OKX, Kraken, Coinbase)
- Manage separate testnet and mainnet credentials
- Automatically validate credentials before saving
- Switch between different credential sets (active credential management)
- Securely encrypt all API keys using AES-256-GCM

## Quick Start

### 1. Database Setup

The database schema has been updated. Run:

```bash
# If you have existing data, the schema is already pushed
# Otherwise, push the schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. Migrate Existing Data (If Applicable)

If you have existing Bybit credentials in the `bybit_api_keys` table:

```bash
npx ts-node src/lib/migrations/migrate-bybit-to-exchange-credentials.ts
```

This will:
- Copy all existing credentials to the new table
- Set them as active
- Preserve encryption and timestamps
- Add "Migrated" labels

### 3. Test the API

Start your development server:

```bash
npm run dev
```

Run the test script:

```bash
./test-exchange-credentials.sh
```

### 4. Update Your Code

#### Old Way (Deprecated):
```typescript
import { BybitKeysService } from '@/lib/bybit-keys-service';

const keys = await BybitKeysService.getApiKeys(userId);
const bybitService = new BybitService({
  apiKey: keys.apiKey,
  apiSecret: keys.apiSecret,
  testnet: keys.testnet,
});
```

#### New Way:
```typescript
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { Exchange } from '@prisma/client';
import { BybitService } from '@/lib/bybit';

const credentials = await ExchangeCredentialsService.getActiveCredentials(
  userId,
  Exchange.BYBIT
);

if (!credentials) {
  throw new Error('No active Bybit credentials found');
}

const bybitService = new BybitService({
  apiKey: credentials.apiKey,
  apiSecret: credentials.apiSecret,
  testnet: credentials.environment === 'TESTNET',
});
```

## API Endpoints at a Glance

### List Credentials
```bash
GET /api/exchange-credentials
GET /api/exchange-credentials?exchange=BYBIT
GET /api/exchange-credentials?environment=TESTNET
GET /api/exchange-credentials?grouped=true
```

### Save/Update Credentials
```bash
POST /api/exchange-credentials
Body: {
  "exchange": "BYBIT",
  "environment": "TESTNET",
  "apiKey": "your-key",
  "apiSecret": "your-secret",
  "label": "My Label" // optional
}
```

### Activate Credential
```bash
PUT /api/exchange-credentials/:id/activate
```

### Delete Credential
```bash
DELETE /api/exchange-credentials/:id
```

### Get Active Credential
```bash
GET /api/exchange-credentials/active/BYBIT
```

## Frontend Integration Example

```typescript
// Save credentials
const saveBybitCredentials = async (apiKey: string, apiSecret: string, testnet: boolean) => {
  const response = await fetch('/api/exchange-credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      exchange: 'BYBIT',
      environment: testnet ? 'TESTNET' : 'MAINNET',
      apiKey,
      apiSecret,
      label: `Bybit ${testnet ? 'Testnet' : 'Mainnet'}`,
    }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to save credentials');
  }

  return data.data;
};

// List all credentials grouped by exchange
const getCredentials = async () => {
  const response = await fetch('/api/exchange-credentials?grouped=true', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data; // Array of { exchange, credentials[] }
};

// Activate a credential
const activateCredential = async (credentialId: string) => {
  const response = await fetch(`/api/exchange-credentials/${credentialId}/activate`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to activate credential');
  }

  return data.data;
};

// Delete a credential
const deleteCredential = async (credentialId: string) => {
  const response = await fetch(`/api/exchange-credentials/${credentialId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete credential');
  }
};
```

## Example UI Flow

1. **Settings Page**: List all credentials grouped by exchange
2. **Add Credentials**: Form to add new exchange credentials
3. **Credential Card**:
   - Shows masked API key (...XXXX)
   - Environment badge (TESTNET/MAINNET)
   - Active indicator
   - "Set Active" button (if not active)
   - "Delete" button
4. **Validation**: Real-time validation with exchange API before saving

## Security Notes

- All API keys are encrypted with AES-256-GCM
- API keys are validated with the exchange before saving
- Only last 4 characters of API key are shown in responses
- Full credentials only available server-side
- All endpoints require JWT authentication
- Users can only access their own credentials

## Adding Support for New Exchange

1. Add exchange to enum in `prisma/schema.prisma`
2. Implement validator in `src/lib/exchange-validators.ts`
3. Add case to dispatcher in `validateCredentials()`
4. Run `npx prisma db push && npx prisma generate`

Example for Binance:
```typescript
// In exchange-validators.ts
static async validateBinance(
  apiKey: string,
  apiSecret: string,
  environment: Environment
): Promise<ValidationResult> {
  try {
    // Your Binance API validation logic here
    const Binance = require('binance-api-node').default;
    const client = Binance({
      apiKey,
      apiSecret,
      test: environment === Environment.TESTNET,
    });

    await client.accountInfo();
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

// Add to dispatcher
case Exchange.BINANCE:
  return this.validateBinance(apiKey, apiSecret, environment);
```

## Troubleshooting

### Issue: "Credential validation failed"
- Check that API keys are correct
- Ensure API keys have correct permissions
- For Bybit: Requires read permission at minimum
- Check if using correct environment (testnet vs mainnet)

### Issue: "No active credentials found"
- Save at least one credential for the exchange
- First credential is automatically set as active
- Use the activate endpoint to switch active credential

### Issue: "Unauthorized" errors
- Ensure JWT token is valid
- Check Authorization header format: `Bearer <token>`
- Token might be expired (check expiry time)

## Documentation

- **Full API Documentation**: `/docs/EXCHANGE_CREDENTIALS_API.md`
- **Implementation Summary**: `/EXCHANGE_CREDENTIALS_IMPLEMENTATION.md`
- **Test Script**: `/test-exchange-credentials.sh`

## Support

For questions or issues:
1. Check the full API documentation
2. Review the implementation summary
3. Run the test script to verify setup
4. Check the service implementations for usage examples

---

**Last Updated**: October 1, 2025
**Status**: Production Ready
