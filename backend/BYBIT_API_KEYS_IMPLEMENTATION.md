# Bybit API Keys Storage Implementation

## Overview

This document describes the implementation of secure storage and retrieval of Bybit API keys for authenticated users. The system uses PostgreSQL with Prisma ORM, AES-256 encryption, and includes a caching layer for optimal performance.

## Architecture

### Components

1. **Database Schema** (`/prisma/schema.prisma`)
   - BybitApiKey model with encrypted storage
   - One-to-one relationship with User model

2. **Encryption Service** (`/src/lib/encryption.ts`)
   - AES-256-GCM encryption
   - Secure key derivation using scrypt

3. **Database Service** (`/src/lib/bybit-keys-service.ts`)
   - CRUD operations for API keys
   - In-memory caching with 5-minute TTL
   - API key validation against Bybit

4. **API Endpoints** (`/src/app/api/bybit/api-keys/route.ts`)
   - POST: Save/update API keys
   - GET: Retrieve API key info
   - DELETE: Remove API keys

5. **Updated Bybit Service** (`/src/lib/bybit.ts`)
   - `createFromDatabase()` static method
   - Automatic key loading from database

## Database Schema

### BybitApiKey Model

```prisma
model BybitApiKey {
  id        String   @id @default(cuid())
  userId    String   @unique // One-to-one relationship

  // Encrypted API credentials
  apiKey    String   // Encrypted Bybit API key
  apiSecret String   // Encrypted Bybit API secret

  // Configuration
  testnet   Boolean  @default(true)

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bybit_api_keys")
}
```

### Key Features

- **One-to-one relationship**: Each user can have exactly one set of Bybit API keys
- **Cascade deletion**: API keys are automatically deleted when user is deleted
- **Encrypted storage**: API key and secret are stored encrypted in the database
- **Testnet support**: Boolean flag to indicate testnet vs mainnet

## Encryption Implementation

### Encryption Service (`/src/lib/encryption.ts`)

#### Features

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: scrypt with fixed salt
- **Security Features**:
  - Random IV (Initialization Vector) for each encryption
  - Authentication tag for data integrity verification
  - 256-bit encryption key

#### Methods

```typescript
class EncryptionService {
  // Encrypts a string
  static encrypt(plaintext: string): string

  // Decrypts an encrypted string
  static decrypt(encryptedData: string): string

  // Validates encryption configuration
  static validateConfiguration(): boolean

  // Generates a new encryption key
  static generateEncryptionKey(): string
}
```

#### Encrypted Data Format

```
iv:encrypted:authTag
```

All parts are hex-encoded.

## API Endpoints

### 1. POST /api/bybit/api-keys

Saves or updates user's Bybit API keys.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "apiKey": "string",
  "apiSecret": "string",
  "testnet": boolean
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "API keys saved successfully",
  "data": {
    "id": "key_id",
    "userId": "user_id",
    "testnet": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400`: Invalid request body or API key validation failed
- `401`: Unauthorized
- `500`: Internal server error

**Features**:
- Validates API keys by making a test call to Bybit
- Encrypts keys before storing
- Upserts (creates or updates) based on userId
- Invalidates cache after save

### 2. GET /api/bybit/api-keys

Retrieves user's API key information (without exposing secrets).

**Authentication**: Required (Bearer token)

**Success Response (200)** - Has Keys:
```json
{
  "success": true,
  "data": {
    "hasKeys": true,
    "testnet": true,
    "apiKeyPreview": "...XXXX",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Success Response (200)** - No Keys:
```json
{
  "success": true,
  "data": {
    "hasKeys": false
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Internal server error

**Security**:
- Only shows last 4 characters of API key (e.g., "...XXXX")
- Never exposes API secret

### 3. DELETE /api/bybit/api-keys

Deletes user's Bybit API keys.

**Authentication**: Required (Bearer token)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "API keys deleted successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: No API keys found
- `500`: Internal server error

**Features**:
- Invalidates cache after deletion
- Returns 404 if no keys exist

## Database Service

### BybitKeysService (`/src/lib/bybit-keys-service.ts`)

#### Methods

```typescript
class BybitKeysService {
  // Validates API keys with Bybit
  static async validateApiKeys(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<{ valid: boolean; error?: string }>

  // Saves or updates API keys
  static async saveApiKeys(
    userId: string,
    data: BybitApiKeyData
  ): Promise<object>

  // Gets API key info (without secret)
  static async getApiKeyInfo(userId: string): Promise<BybitApiKeyInfo>

  // Gets decrypted API keys (internal use)
  static async getApiKeys(userId: string): Promise<BybitApiKeyData | null>

  // Deletes API keys
  static async deleteApiKeys(userId: string): Promise<boolean>

  // Checks if user has API keys
  static async hasApiKeys(userId: string): Promise<boolean>

  // Cache management
  static clearCache(userId?: string): void
  static getCacheStats(): object
}
```

#### Caching Strategy

- **Cache TTL**: 5 minutes
- **Cache Key**: userId
- **Cached Data**: Decrypted API keys
- **Invalidation**: On save or delete operations

#### Security Features

1. **Automatic Encryption/Decryption**: All keys are automatically encrypted before storage and decrypted on retrieval
2. **Validation**: API keys are validated against Bybit before saving
3. **Cache Security**: Cache is in-memory and cleared on application restart
4. **No Logging**: API secrets are never logged

## Updated Bybit Integration

### BybitService Updates (`/src/lib/bybit.ts`)

#### New Static Method

```typescript
static async createFromDatabase(userId: string): Promise<BybitService | null>
```

Creates a BybitService instance with keys loaded from the database.

**Usage**:
```typescript
const bybitService = await BybitService.createFromDatabase(userId);
if (!bybitService) {
  // User has no API keys configured
  return error;
}

// Use service normally
const userInfo = await bybitService.getUserProfile();
```

#### Updated User Info Endpoint

The `/api/bybit/user/info` endpoint now:
1. Supports loading keys from database (primary method)
2. Supports header-based keys (for testing):
   - `X-Bybit-API-Key`: API key
   - `X-Bybit-API-Secret`: API secret
   - `X-Bybit-Testnet`: true/false

**Example with Database Keys**:
```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example with Header Keys (Testing)**:
```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Bybit-API-Key: YOUR_API_KEY" \
  -H "X-Bybit-API-Secret: YOUR_API_SECRET" \
  -H "X-Bybit-Testnet: true"
```

## Environment Variables

### Required Environment Variables

Add to `/backend/.env`:

```env
# Encryption Key for API Keys Storage (must be at least 32 characters)
# Generate a new key using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-64-character-hex-string-here
```

### Generating a Secure Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This generates a 64-character hex string suitable for use as `ENCRYPTION_KEY`.

## Migration Steps

### 1. Install Dependencies

Already completed. Installed packages:
- `@prisma/client`: Prisma client for database operations
- `prisma`: Prisma CLI for migrations
- `zod`: Schema validation for API endpoints

### 2. Update Database Schema

The schema has been pushed to the database using:

```bash
cd /Users/vnemyrovskyi/IdeaProjects/bot/backend
npx prisma db push
```

This created the `bybit_api_keys` table with the following structure:

```sql
CREATE TABLE bybit_api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  testnet BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript types and Prisma client.

## Testing Instructions

### 1. Setup

Ensure the following environment variables are set in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-64-character-hex-string
```

### 2. Start the Backend Server

```bash
cd /Users/vnemyrovskyi/IdeaProjects/bot/backend
npm run dev
```

### 3. Authenticate

First, obtain a JWT token by logging in:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'
```

Save the token from the response.

### 4. Test API Key Endpoints

#### Check if User Has API Keys

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (no keys):
```json
{
  "success": true,
  "data": {
    "hasKeys": false
  }
}
```

#### Save API Keys

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_BYBIT_API_KEY",
    "apiSecret": "YOUR_BYBIT_API_SECRET",
    "testnet": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "API keys saved successfully",
  "data": {
    "id": "...",
    "userId": "...",
    "testnet": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Verify Keys Were Saved

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "hasKeys": true,
    "testnet": true,
    "apiKeyPreview": "...XXXX",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Test Bybit User Info Endpoint

This should now use the stored API keys:

```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "uuid": "...",
    "username": "user@test.com",
    "memberType": 1,
    "status": 1,
    "vipLevel": "VIP 0",
    "createdAt": "..."
  }
}
```

#### Delete API Keys

```bash
curl -X DELETE http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "API keys deleted successfully"
}
```

### 5. Test Error Cases

#### Invalid API Keys

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "invalid-key",
    "apiSecret": "invalid-secret",
    "testnet": true
  }'
```

Expected response (400):
```json
{
  "success": false,
  "error": "Failed to validate API keys with Bybit",
  "code": "VALIDATION_FAILED"
}
```

#### No Authorization

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys
```

Expected response (401):
```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```

## Security Considerations

### 1. Encryption

- **Algorithm**: AES-256-GCM provides authenticated encryption
- **Key Management**: ENCRYPTION_KEY must be kept secret and backed up securely
- **IV Randomization**: Each encryption uses a unique random IV
- **Authentication**: GCM mode provides authentication to prevent tampering

### 2. Database Security

- **Parameterized Queries**: Prisma uses parameterized queries to prevent SQL injection
- **No Plain Text Storage**: API keys are never stored in plain text
- **Cascade Deletion**: Keys are automatically deleted when user is deleted

### 3. API Security

- **Authentication Required**: All endpoints require valid JWT token
- **Input Validation**: Request bodies are validated using Zod schemas
- **Rate Limiting**: Consider adding rate limiting for API key endpoints
- **No Secret Exposure**: API secrets are never returned in responses

### 4. Caching Security

- **In-Memory Only**: Cache is stored in memory, not persisted
- **TTL**: Cache entries expire after 5 minutes
- **Invalidation**: Cache is invalidated on updates/deletes
- **No Logging**: Cached keys are never logged

### 5. Validation

- **API Key Validation**: Keys are validated against Bybit before saving
- **Test Call**: Makes a real API call to verify credentials work
- **Error Handling**: Provides clear error messages without exposing sensitive data

## Best Practices

### For Development

1. Use testnet API keys for development
2. Never commit `.env` files
3. Use different encryption keys for each environment
4. Regularly rotate encryption keys (requires re-encryption of all stored keys)

### For Production

1. Use environment variables from a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
2. Enable rate limiting on API endpoints
3. Monitor for suspicious activity (multiple failed validations)
4. Implement audit logging for API key operations
5. Use HTTPS for all API communications
6. Consider implementing 2FA for API key management
7. Set up alerts for encryption failures
8. Backup ENCRYPTION_KEY securely

### For Operations

1. Regular backups of the database (including encrypted keys)
2. Secure backup of ENCRYPTION_KEY (required to decrypt stored keys)
3. Monitor cache hit rates for performance optimization
4. Set up monitoring for Bybit API failures
5. Implement graceful degradation if Bybit API is unavailable

## File Structure

```
backend/
├── prisma/
│   └── schema.prisma                      # Database schema with BybitApiKey model
├── src/
│   ├── lib/
│   │   ├── prisma.ts                      # Prisma client singleton
│   │   ├── encryption.ts                  # Encryption service (AES-256-GCM)
│   │   ├── bybit-keys-service.ts          # Database service for API keys
│   │   └── bybit.ts                       # Updated Bybit service
│   └── app/
│       └── api/
│           └── bybit/
│               ├── api-keys/
│               │   └── route.ts           # API key management endpoints
│               └── user/
│                   └── info/
│                       └── route.ts       # Updated user info endpoint
├── .env                                    # Environment variables (includes ENCRYPTION_KEY)
└── package.json                            # Updated dependencies
```

## Dependencies Added

```json
{
  "dependencies": {
    "@prisma/client": "^6.16.3",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "prisma": "^6.16.3"
  }
}
```

## Troubleshooting

### Encryption Errors

**Problem**: "ENCRYPTION_KEY environment variable is not set"

**Solution**: Ensure `ENCRYPTION_KEY` is set in `.env` file and is at least 32 characters long.

### Decryption Errors

**Problem**: "Failed to decrypt data - data may be corrupted or encryption key has changed"

**Solution**:
- Verify the `ENCRYPTION_KEY` hasn't changed since keys were encrypted
- If key was rotated, you'll need to decrypt with old key and re-encrypt with new key
- Check database for corrupted data

### Database Connection Errors

**Problem**: "Can't reach database server"

**Solution**:
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check database credentials and permissions

### API Key Validation Failures

**Problem**: "Failed to validate API keys with Bybit"

**Solution**:
- Verify API keys are correct and active in Bybit account
- Check if testnet flag matches the key type (testnet vs mainnet)
- Ensure Bybit API is accessible from your server
- Check for IP restrictions on Bybit API keys

### Cache Issues

**Problem**: Changes not reflected immediately

**Solution**:
- Cache has 5-minute TTL by default
- For immediate effect, call `BybitKeysService.clearCache(userId)`
- Consider reducing TTL if needed

## Future Enhancements

1. **Key Rotation**: Implement automatic encryption key rotation
2. **Multi-Exchange Support**: Extend to support other exchanges
3. **API Key Permissions**: Store and validate specific permissions
4. **Usage Tracking**: Track API calls made with stored keys
5. **Expiration Warnings**: Notify users when API keys are expiring
6. **Backup Keys**: Support for backup/secondary API keys
7. **Audit Logging**: Comprehensive audit trail for key operations
8. **IP Whitelisting**: Validate API calls against IP whitelist
9. **Rate Limiting**: Per-user rate limiting for API key operations
10. **Key Health Monitoring**: Periodic validation of stored keys

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in server console
3. Verify environment variables are set correctly
4. Test with Bybit API documentation directly
5. Check Prisma documentation for database issues

## License

This implementation is part of the bot project and follows the same license.
