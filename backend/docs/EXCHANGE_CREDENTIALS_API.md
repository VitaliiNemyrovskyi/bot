# Exchange Credentials API Documentation

## Overview

The Exchange Credentials API provides a robust system for managing API credentials for multiple cryptocurrency exchanges with support for both testnet and mainnet environments.

### Supported Exchanges
- **Bybit** (fully implemented with validation)
- **Binance** (placeholder, ready for implementation)
- **OKX** (placeholder, ready for implementation)
- **Kraken** (placeholder, ready for implementation)
- **Coinbase** (placeholder, ready for implementation)

### Key Features
- Multi-exchange support with separate testnet/mainnet credentials
- AES-256-GCM encryption for API keys and secrets
- Automatic credential validation before saving
- Active credential management (one active per exchange)
- Grouped credential listing by exchange
- In-memory caching (5-minute TTL) for performance
- Comprehensive error handling and validation
- Migration support from legacy bybit_api_keys table

## Architecture

### Database Schema

```prisma
enum Exchange {
  BYBIT
  BINANCE
  OKX
  KRAKEN
  COINBASE
}

enum Environment {
  TESTNET
  MAINNET
}

model ExchangeCredentials {
  id          String      @id @default(cuid())
  userId      String
  exchange    Exchange
  environment Environment
  apiKey      String      // Encrypted
  apiSecret   String      // Encrypted
  label       String?
  isActive    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, exchange, environment])
  @@index([userId])
  @@index([userId, exchange])
  @@index([userId, exchange, isActive])
}
```

### Service Layer

**ExchangeCredentialsService** (`/src/lib/exchange-credentials-service.ts`)
- `saveCredentials()` - Save/update credentials with validation
- `getCredentials()` - Retrieve credentials (filtered or all)
- `getCredentialsGrouped()` - Get credentials grouped by exchange
- `getActiveCredentials()` - Get decrypted active credentials for internal use
- `setActiveCredentials()` - Set a credential as active
- `deleteCredentials()` - Delete credentials
- `hasCredentials()` - Check if user has credentials

**ExchangeValidators** (`/src/lib/exchange-validators.ts`)
- `validateBybit()` - Validates Bybit credentials
- `validateBinance()` - Placeholder for Binance validation
- `validateOKX()` - Placeholder for OKX validation
- `validateKraken()` - Placeholder for Kraken validation
- `validateCoinbase()` - Placeholder for Coinbase validation
- `validateCredentials()` - Main dispatcher

## API Endpoints

### 1. List All Credentials

**GET** `/api/exchange-credentials`

Returns all exchange credentials for the authenticated user.

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `exchange` (optional): Filter by exchange (BYBIT, BINANCE, etc.)
- `environment` (optional): Filter by environment (TESTNET, MAINNET)
- `grouped` (optional): Return credentials grouped by exchange (true/false)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "userId": "user_123",
      "exchange": "BYBIT",
      "environment": "TESTNET",
      "apiKeyMasked": "...XXXX",
      "label": "My Bybit Testnet",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (200) - Grouped**:
```json
{
  "success": true,
  "data": [
    {
      "exchange": "BYBIT",
      "credentials": [
        {
          "id": "clx1234567890",
          "userId": "user_123",
          "exchange": "BYBIT",
          "environment": "TESTNET",
          "apiKeyMasked": "...XXXX",
          "label": "My Bybit Testnet",
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        {
          "id": "clx0987654321",
          "userId": "user_123",
          "exchange": "BYBIT",
          "environment": "MAINNET",
          "apiKeyMasked": "...YYYY",
          "label": "My Bybit Mainnet",
          "isActive": false,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401`: Unauthorized (missing or invalid token)
- `400`: Invalid exchange or environment parameter
- `500`: Internal server error

---

### 2. Save/Update Credentials

**POST** `/api/exchange-credentials`

Creates or updates exchange credentials. If credentials already exist for the same exchange and environment, they will be updated. Validates credentials with the exchange API before saving.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "exchange": "BYBIT",
  "environment": "TESTNET",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret",
  "label": "My Bybit Testnet" // optional
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Credentials saved successfully",
  "data": {
    "id": "clx1234567890",
    "userId": "user_123",
    "exchange": "BYBIT",
    "environment": "TESTNET",
    "apiKeyMasked": "...XXXX",
    "label": "My Bybit Testnet",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400`: Validation error (invalid request body)
- `400`: Validation failed (invalid API credentials)
- `401`: Unauthorized
- `500`: Internal server error

**Error Codes**:
- `VALIDATION_ERROR`: Request body validation failed
- `VALIDATION_FAILED`: API credential validation failed
- `INVALID_EXCHANGE`: Invalid exchange value
- `INVALID_ENVIRONMENT`: Invalid environment value

---

### 3. Activate Credentials

**PUT** `/api/exchange-credentials/:id/activate`

Sets a specific credential as active for its exchange. Automatically deactivates all other credentials for the same exchange.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `id`: Credential ID to activate

**Response (200)**:
```json
{
  "success": true,
  "message": "Credential activated successfully",
  "data": {
    "id": "clx1234567890",
    "userId": "user_123",
    "exchange": "BYBIT",
    "environment": "TESTNET",
    "apiKeyMasked": "...XXXX",
    "label": "My Bybit Testnet",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400`: Credential ID is required
- `401`: Unauthorized
- `403`: Forbidden (credential doesn't belong to user)
- `404`: Credential not found
- `500`: Internal server error

---

### 4. Delete Credentials

**DELETE** `/api/exchange-credentials/:id`

Deletes a specific credential. If deleting the active credential, automatically activates another credential for the same exchange if available.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `id`: Credential ID to delete

**Response (200)**:
```json
{
  "success": true,
  "message": "Credential deleted successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400`: Credential ID is required
- `401`: Unauthorized
- `403`: Forbidden (credential doesn't belong to user)
- `404`: Credential not found
- `500`: Internal server error

---

### 5. Get Active Credentials

**GET** `/api/exchange-credentials/active/:exchange`

Gets the currently active credentials for a specific exchange. Used by trading services to fetch the correct credentials.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `exchange`: Exchange name (BYBIT, BINANCE, OKX, KRAKEN, COINBASE)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "exchange": "BYBIT",
    "environment": "TESTNET",
    "apiKeyMasked": "...XXXX",
    "label": "My Bybit Testnet",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (200) - No Active Credentials**:
```json
{
  "success": true,
  "data": null,
  "message": "No active credentials found for BYBIT",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400`: Invalid exchange parameter
- `401`: Unauthorized
- `500`: Internal server error

---

## Security Considerations

### Encryption
- All API keys and secrets are encrypted using AES-256-GCM
- Each encryption uses a unique random IV (Initialization Vector)
- Authentication tags ensure data integrity
- Encryption key derived from `ENCRYPTION_KEY` environment variable using scrypt

### Validation
- Credentials are validated with the exchange API before saving
- Invalid credentials are rejected and not stored
- Validation responses include permission details

### Caching
- Decrypted credentials cached in memory for 5 minutes
- Cache automatically invalidated on updates/deletes
- Cache is secure (only accessible within service layer)

### Authorization
- All endpoints require JWT authentication
- Users can only access their own credentials
- Attempting to access another user's credentials returns 403 Forbidden

## Migration from Legacy System

### Data Migration Script

A migration script is provided to migrate existing `bybit_api_keys` records to the new `exchange_credentials` table:

**File**: `/src/lib/migrations/migrate-bybit-to-exchange-credentials.ts`

**Usage**:
```bash
npx ts-node src/lib/migrations/migrate-bybit-to-exchange-credentials.ts
```

**What it does**:
1. Fetches all existing Bybit API keys
2. Creates corresponding ExchangeCredentials records
3. Maps `testnet` field to appropriate Environment enum
4. Sets migrated credentials as active
5. Preserves original timestamps
6. Adds "Migrated" label for identification
7. Skips records that already exist
8. Preserves legacy table for backward compatibility

**Migration Summary**:
```
Starting migration of Bybit API keys to Exchange Credentials...

Found 5 Bybit API key records to migrate

✅ Migrated credentials for user user@example.com (TESTNET)
✅ Migrated credentials for user user2@example.com (MAINNET)
...

=== Migration Summary ===
Total records found: 5
Successfully migrated: 5
Skipped (already exists): 0
Errors: 0
```

### Backward Compatibility

The `bybit_api_keys` table is preserved during migration for backward compatibility. Once you've verified the migration was successful and updated all services to use the new API, you can safely drop the old table.

## Usage Examples

### Frontend Integration

```typescript
// Save credentials
const saveCredentials = async (
  exchange: string,
  environment: string,
  apiKey: string,
  apiSecret: string,
  label?: string
) => {
  const response = await fetch('/api/exchange-credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      exchange,
      environment,
      apiKey,
      apiSecret,
      label,
    }),
  });

  return response.json();
};

// Get all credentials grouped by exchange
const getCredentials = async () => {
  const response = await fetch('/api/exchange-credentials?grouped=true', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};

// Activate specific credential
const activateCredential = async (credentialId: string) => {
  const response = await fetch(`/api/exchange-credentials/${credentialId}/activate`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};

// Delete credential
const deleteCredential = async (credentialId: string) => {
  const response = await fetch(`/api/exchange-credentials/${credentialId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};

// Get active credentials for Bybit
const getActiveBybitCredentials = async () => {
  const response = await fetch('/api/exchange-credentials/active/BYBIT', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};
```

### Backend Service Integration

```typescript
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BybitService } from '@/lib/bybit';
import { Exchange } from '@prisma/client';

// Get active Bybit credentials and create service
const getBybitService = async (userId: string) => {
  const credentials = await ExchangeCredentialsService.getActiveCredentials(
    userId,
    Exchange.BYBIT
  );

  if (!credentials) {
    throw new Error('No active Bybit credentials found');
  }

  return new BybitService({
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    testnet: credentials.environment === 'TESTNET',
  });
};

// Use in a route handler
export async function POST(request: NextRequest) {
  const authResult = await AuthService.authenticateRequest(request);
  const userId = authResult.user.userId;

  const bybitService = await getBybitService(userId);
  const accountInfo = await bybitService.getAccountInfo();

  return NextResponse.json({ success: true, data: accountInfo });
}
```

## Adding New Exchange Support

To add support for a new exchange:

1. **Add to Exchange enum** (`prisma/schema.prisma`):
   ```prisma
   enum Exchange {
     BYBIT
     BINANCE
     OKX
     KRAKEN
     COINBASE
     NEW_EXCHANGE  // Add here
   }
   ```

2. **Implement validator** (`src/lib/exchange-validators.ts`):
   ```typescript
   static async validateNewExchange(
     apiKey: string,
     apiSecret: string,
     environment: Environment
   ): Promise<ValidationResult> {
     try {
       // Implement validation logic
       // Make test API call to verify credentials
       return { valid: true };
     } catch (error: any) {
       return { valid: false, error: error.message };
     }
   }
   ```

3. **Add to dispatcher**:
   ```typescript
   static async validateCredentials(
     exchange: Exchange,
     environment: Environment,
     apiKey: string,
     apiSecret: string
   ): Promise<ValidationResult> {
     switch (exchange) {
       // ... existing cases
       case Exchange.NEW_EXCHANGE:
         return this.validateNewExchange(apiKey, apiSecret, environment);
       default:
         return { valid: false, error: `Unsupported exchange: ${exchange}` };
     }
   }
   ```

4. **Run migration**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

## Testing

### Manual Testing with cURL

```bash
# Save credentials
curl -X POST http://localhost:3000/api/exchange-credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "exchange": "BYBIT",
    "environment": "TESTNET",
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "label": "Test Credentials"
  }'

# List credentials
curl http://localhost:3000/api/exchange-credentials?grouped=true \
  -H "Authorization: Bearer YOUR_TOKEN"

# Activate credential
curl -X PUT http://localhost:3000/api/exchange-credentials/CREDENTIAL_ID/activate \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete credential
curl -X DELETE http://localhost:3000/api/exchange-credentials/CREDENTIAL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active Bybit credentials
curl http://localhost:3000/api/exchange-credentials/active/BYBIT \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Codes Reference

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Missing or invalid authentication token |
| `VALIDATION_ERROR` | Request body validation failed |
| `VALIDATION_FAILED` | API credential validation with exchange failed |
| `NOT_FOUND` | Requested credential not found |
| `ALREADY_EXISTS` | Credential already exists (not currently used) |
| `INTERNAL_ERROR` | Internal server error |
| `INVALID_EXCHANGE` | Invalid exchange value provided |
| `INVALID_ENVIRONMENT` | Invalid environment value provided |
| `ENCRYPTION_FAILED` | Failed to encrypt credentials |
| `DECRYPTION_FAILED` | Failed to decrypt credentials |

## Performance Considerations

- Credentials are cached in memory for 5 minutes after decryption
- Cache is automatically invalidated on updates/deletes
- Database queries use indexes on `userId`, `exchange`, and `isActive`
- Grouped queries are optimized with single database call
- Validation happens before encryption to avoid unnecessary work

## Future Enhancements

1. **Rate Limiting**: Add rate limiting per exchange/user
2. **Audit Logging**: Track all credential access and modifications
3. **2FA for Updates**: Require 2FA for credential updates
4. **IP Whitelisting**: Store and validate IP restrictions
5. **Credential Rotation**: Auto-remind users to rotate keys periodically
6. **Read-Only Mode**: Support read-only API keys with limited permissions
7. **Multi-Region**: Support region-specific endpoints for exchanges
8. **Webhook Notifications**: Notify users of credential usage/changes
