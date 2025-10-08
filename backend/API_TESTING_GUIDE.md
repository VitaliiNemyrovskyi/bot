# Bybit API Keys - Testing Guide

Quick reference for testing the Bybit API keys implementation.

## Prerequisites

1. Backend server running: `npm run dev`
2. PostgreSQL database running
3. `.env` file configured with `ENCRYPTION_KEY`
4. Valid JWT token (from login)

## Get JWT Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'
```

Save the token from response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Export Token (for easier testing)

```bash
export TOKEN="your-jwt-token-here"
```

## 1. Check if User Has API Keys

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (No Keys)**:
```json
{
  "success": true,
  "data": {
    "hasKeys": false
  },
  "timestamp": "2024-10-01T..."
}
```

## 2. Save API Keys

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_BYBIT_API_KEY",
    "apiSecret": "YOUR_BYBIT_API_SECRET",
    "testnet": true
  }'
```

**Expected Response (Success)**:
```json
{
  "success": true,
  "message": "API keys saved successfully",
  "data": {
    "id": "clxxx...",
    "userId": "admin_1",
    "testnet": true,
    "createdAt": "2024-10-01T...",
    "updatedAt": "2024-10-01T..."
  },
  "timestamp": "2024-10-01T..."
}
```

**Expected Response (Invalid Keys)**:
```json
{
  "success": false,
  "error": "Failed to validate API keys with Bybit",
  "details": "Bybit API Error: Invalid API key",
  "code": "VALIDATION_FAILED",
  "timestamp": "2024-10-01T..."
}
```

## 3. Verify Keys Were Saved

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "hasKeys": true,
    "testnet": true,
    "apiKeyPreview": "...G1Dt",
    "createdAt": "2024-10-01T...",
    "updatedAt": "2024-10-01T..."
  },
  "timestamp": "2024-10-01T..."
}
```

## 4. Test Bybit User Info (Using Stored Keys)

```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userId": "12345678",
    "uuid": "abcd-1234-...",
    "username": "user@test.com",
    "memberType": 1,
    "status": 1,
    "vipLevel": "VIP 0",
    "createdAt": "2024-01-01T..."
  }
}
```

## 5. Test Bybit User Info (Using Header Keys)

For testing without saving to database:

```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Bybit-API-Key: YOUR_BYBIT_API_KEY" \
  -H "X-Bybit-API-Secret: YOUR_BYBIT_API_SECRET" \
  -H "X-Bybit-Testnet: true"
```

## 6. Update API Keys

Same endpoint as save (POST will upsert):

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "NEW_API_KEY",
    "apiSecret": "NEW_API_SECRET",
    "testnet": false
  }'
```

## 7. Delete API Keys

```bash
curl -X DELETE http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (Success)**:
```json
{
  "success": true,
  "message": "API keys deleted successfully",
  "timestamp": "2024-10-01T..."
}
```

**Expected Response (No Keys)**:
```json
{
  "success": false,
  "error": "No API keys found",
  "code": "NOT_FOUND",
  "timestamp": "2024-10-01T..."
}
```

## 8. Verify Deletion

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "hasKeys": false
  },
  "timestamp": "2024-10-01T..."
}
```

## Error Cases to Test

### 1. No Authorization Header

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys
```

**Expected**: 401 Unauthorized

### 2. Invalid Token

```bash
curl -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer invalid-token"
```

**Expected**: 401 Unauthorized

### 3. Invalid Request Body

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "",
    "apiSecret": "test"
  }'
```

**Expected**: 400 Validation Error

### 4. Invalid Bybit API Keys

```bash
curl -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "invalid-key",
    "apiSecret": "invalid-secret",
    "testnet": true
  }'
```

**Expected**: 400 Validation Failed

### 5. Access Bybit Without Keys

1. Delete keys (if any)
2. Try to access user info:

```bash
curl -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 403 No API Keys

```json
{
  "success": false,
  "error": "Bybit API keys not configured for this user. Please configure your API keys first.",
  "code": "NO_API_KEYS",
  "timestamp": "2024-10-01T..."
}
```

## Full Test Sequence

Complete test from start to finish:

```bash
#!/bin/bash

# 1. Login and get token
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}' | jq -r '.token')

echo "Token: $TOKEN"
echo ""

# 2. Check initial state (should be no keys)
echo "2. Checking initial state..."
curl -s -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 3. Save API keys
echo "3. Saving API keys..."
curl -s -X POST http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY",
    "apiSecret": "YOUR_API_SECRET",
    "testnet": true
  }' | jq
echo ""

# 4. Verify keys were saved
echo "4. Verifying keys..."
curl -s -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 5. Test Bybit user info
echo "5. Testing Bybit user info..."
curl -s -X GET http://localhost:3000/api/bybit/user/info \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 6. Delete keys
echo "6. Deleting keys..."
curl -s -X DELETE http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 7. Verify deletion
echo "7. Verifying deletion..."
curl -s -X GET http://localhost:3000/api/bybit/api-keys \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "Test sequence completed!"
```

Save as `test-bybit-keys.sh` and run:
```bash
chmod +x test-bybit-keys.sh
./test-bybit-keys.sh
```

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Bybit API Keys",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@test.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Check API Keys",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/bybit/api-keys",
          "host": ["{{baseUrl}}"],
          "path": ["api", "bybit", "api-keys"]
        }
      }
    },
    {
      "name": "Save API Keys",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"apiKey\": \"YOUR_API_KEY\",\n  \"apiSecret\": \"YOUR_API_SECRET\",\n  \"testnet\": true\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/bybit/api-keys",
          "host": ["{{baseUrl}}"],
          "path": ["api", "bybit", "api-keys"]
        }
      }
    },
    {
      "name": "Delete API Keys",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/bybit/api-keys",
          "host": ["{{baseUrl}}"],
          "path": ["api", "bybit", "api-keys"]
        }
      }
    },
    {
      "name": "Bybit User Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/bybit/user/info",
          "host": ["{{baseUrl}}"],
          "path": ["api", "bybit", "user", "info"]
        }
      }
    }
  ]
}
```

## Database Verification

Check the database directly:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'bybit_api_keys'
);

-- View all API keys (encrypted)
SELECT
  id,
  user_id,
  LEFT(api_key, 20) as api_key_preview,
  testnet,
  created_at,
  updated_at
FROM bybit_api_keys;

-- Count API keys per user
SELECT
  u.email,
  COUNT(b.id) as has_keys
FROM users u
LEFT JOIN bybit_api_keys b ON u.id = b.user_id
GROUP BY u.email;

-- Check specific user
SELECT
  b.*,
  u.email,
  u.name
FROM bybit_api_keys b
JOIN users u ON b.user_id = u.id
WHERE u.email = 'user@test.com';
```

## Troubleshooting

### Issue: "ENCRYPTION_KEY environment variable is not set"

**Solution**: Ensure `.env` file has:
```env
ENCRYPTION_KEY=your-64-character-hex-string
```

### Issue: "Failed to decrypt data"

**Solution**:
- Check if ENCRYPTION_KEY has changed
- Verify data in database is not corrupted
- Clear cache and try again

### Issue: "Failed to validate API keys with Bybit"

**Solution**:
- Verify API keys are correct in Bybit account
- Check testnet flag matches key type
- Ensure Bybit API is accessible
- Check API key permissions in Bybit

### Issue: "Database connection error"

**Solution**:
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database credentials
- Check network connectivity

## Tips

1. Use environment variables for tokens:
   ```bash
   export TOKEN="your-token"
   ```

2. Use jq for pretty JSON output:
   ```bash
   curl ... | jq
   ```

3. Save responses to files for comparison:
   ```bash
   curl ... > response.json
   ```

4. Test with different users to verify isolation

5. Monitor server logs for errors

6. Use Postman for easier interactive testing

7. Test both testnet and mainnet configurations

8. Verify caching by checking response times
