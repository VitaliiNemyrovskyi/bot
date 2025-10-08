# Bybit Wallet Balance Troubleshooting Guide

## Overview
This guide helps diagnose and fix issues with the Bybit wallet balance not displaying in the application.

## Bybit v5 API Requirements

### Required Headers
All authenticated requests to Bybit v5 API must include:

1. **X-BAPI-API-KEY**: Your API key
2. **X-BAPI-TIMESTAMP**: Current UTC timestamp in milliseconds
3. **X-BAPI-SIGN**: Request signature (HMAC SHA256)
4. **X-BAPI-SIGN-TYPE**: Set to `2` (for HMAC SHA256)
5. **X-BAPI-RECV-WINDOW**: Request validity window (default: 5000ms)

### Signature Generation (GET Requests)
```
signature_string = timestamp + api_key + recv_window + query_string
signature = HMAC_SHA256(signature_string, api_secret)
```

### Wallet Balance Endpoint
- **URL**: `/v5/account/wallet-balance`
- **Method**: GET
- **Required Parameter**: `accountType` (UNIFIED, CONTRACT, or SPOT)
- **Optional Parameter**: `coin` (filter by specific cryptocurrency)

## Common Issues and Solutions

### 1. API Key Authentication Errors

#### Error Code: 10003 (Invalid API Key)
**Symptoms**: `retCode: 10003`, `retMsg: "Invalid api key"`

**Causes**:
- API key is incorrect or has been deleted
- Using testnet API key with mainnet endpoint (or vice versa)
- API key contains whitespace or special characters

**Solutions**:
```bash
# Verify API key is for correct environment
# Testnet keys start with different prefixes than mainnet keys

# Check if using correct endpoint
# Testnet: https://api-testnet.bybit.com
# Mainnet: https://api.bybit.com
```

#### Error Code: 10004 (Signature Error)
**Symptoms**: `retCode: 10004`, `retMsg: "error sign"`

**Causes**:
- API secret is incorrect
- System time is not synchronized (NTP)
- Signature generation algorithm is wrong
- Parameters are not sorted correctly

**Solutions**:
```bash
# Check system time synchronization
sudo ntpdate -s time.nist.gov

# Verify API secret has no whitespace
echo -n "your-api-secret" | wc -c  # Should match expected length
```

### 2. Permission Errors

#### Error Code: 33004 (API Key Permissions)
**Symptoms**: `retCode: 33004`, `retMsg: "apikey has no permission"`

**Causes**:
- API key doesn't have "Account Info Read" permission
- API key doesn't have "Wallet" read permission

**Solutions**:
1. Go to Bybit Settings → API Management
2. Edit your API key
3. Enable the following permissions:
   - ✅ Read-Only
   - ✅ Account Info (Read)
   - ✅ Wallet (Read)
4. Save changes and wait 1-2 minutes for propagation

### 3. Account Type Issues

#### Error: Empty Balance Response
**Symptoms**: API returns successfully but `list` is empty

**Causes**:
- Account type doesn't exist for your account
- Using wrong account type (e.g., requesting UNIFIED on Classic account)

**Solutions**:
```typescript
// Check account type compatibility:
// UTA 2.0 accounts: Use "UNIFIED"
// UTA 1.0 accounts: Use "UNIFIED" or "CONTRACT"
// Classic accounts: Use "CONTRACT" or "SPOT"

// Try different account types:
const accountTypes = ['UNIFIED', 'CONTRACT', 'SPOT'];
for (const type of accountTypes) {
  try {
    const balance = await bybitService.getWalletBalance(type);
    console.log(`${type} balance:`, balance);
  } catch (err) {
    console.log(`${type} not available`);
  }
}
```

### 4. Network and Connectivity Issues

#### Error: Timeout or Connection Refused
**Symptoms**: Network timeout, ECONNREFUSED, or DNS resolution errors

**Causes**:
- Firewall blocking outbound connections
- IP whitelist configured on API key but server IP not added
- Network connectivity issues

**Solutions**:
```bash
# Test connectivity to Bybit API
curl -I https://api-testnet.bybit.com/v5/market/time
curl -I https://api.bybit.com/v5/market/time

# Check if your IP is whitelisted (if you configured IP whitelist)
curl ifconfig.me

# Verify DNS resolution
nslookup api-testnet.bybit.com
nslookup api.bybit.com
```

### 5. Time Synchronization Issues

#### Error Code: 10002 (Timestamp Error)
**Symptoms**: `retCode: 10002`, `retMsg: "timestamp is out of recv_window"`

**Causes**:
- System clock is out of sync (>5 seconds drift)
- Incorrect timezone configuration
- Using wrong timestamp format (should be milliseconds)

**Solutions**:
```bash
# Check system time
date -u

# Synchronize with NTP server
sudo systemctl stop systemd-timesyncd
sudo ntpdate -s time.nist.gov
sudo systemctl start systemd-timesyncd

# Or enable time sync in the SDK
const bybitService = new BybitService({
  apiKey: 'your-key',
  apiSecret: 'your-secret',
  testnet: true,
  enable_time_sync: true,  // Enable automatic time sync
  syncTimeBeforePrivateRequests: true  // Sync before each request
});
```

### 6. Database and Encryption Issues

#### Error: Failed to Decrypt API Keys
**Symptoms**: `Error: Failed to decrypt data - data may be corrupted or encryption key has changed`

**Causes**:
- ENCRYPTION_KEY environment variable changed
- Database contains API keys encrypted with different key
- Corrupted data in database

**Solutions**:
```bash
# Check if ENCRYPTION_KEY is set
echo $ENCRYPTION_KEY

# If you changed the encryption key, you need to re-save API keys
# Users must re-enter their API credentials in the app

# Verify encryption is working
npm run test-wallet  # Will validate encryption
```

#### Error: No API Keys Found
**Symptoms**: `code: 'NO_API_KEYS'`, wallet balance returns 403

**Causes**:
- User hasn't configured API keys
- API keys were deleted from database
- Database query is failing

**Solutions**:
```typescript
// Check if user has API keys
const hasKeys = await BybitKeysService.hasApiKeys(userId);
console.log('User has API keys:', hasKeys);

// Check API key info
const keyInfo = await BybitKeysService.getApiKeyInfo(userId);
console.log('API Key Info:', keyInfo);
```

## Diagnostic Steps

### Step 1: Run the Diagnostic Script
```bash
# Set environment variables for test credentials
export BYBIT_TEST_API_KEY="your-testnet-api-key"
export BYBIT_TEST_API_SECRET="your-testnet-api-secret"

# Run diagnostic test
npm run test-wallet
```

This will test:
- Direct SDK call
- BybitService wrapper
- API key validation
- Permission verification

### Step 2: Enable Debug Logging
```bash
# Enable HTTP trace for detailed request/response logging
export BYBITTRACE=1

# Run your application with debug logs
npm run dev
```

### Step 3: Check Application Logs
Look for these log messages:
```
[WalletBalance] Loading Bybit service for user: <userId>
[WalletBalance] Bybit service created - testnet: true/false
[WalletBalance] Fetching balance - accountType: UNIFIED, coin: all
[Bybit] Fetching wallet balance - accountType: UNIFIED, coin: all, testnet: true
[Bybit] Wallet balance response - retCode: 0, retMsg: OK
[Bybit] Wallet balance retrieved successfully - accounts: 1
[WalletBalance] Balance fetched successfully
```

### Step 4: Verify API Key Permissions
```typescript
// Use the API key info endpoint to check permissions
const bybitService = new BybitService({
  apiKey: 'your-key',
  apiSecret: 'your-secret',
  testnet: true
});

const keyInfo = await bybitService.getApiKeyInfo();
console.log('Permissions:', keyInfo.permissions);

// Should see:
// Wallet: ["AccountTransfer", "SubMemberTransfer", ...]
// Or at minimum read permissions
```

### Step 5: Test Different Account Types
```bash
# Test UNIFIED account (UTA 2.0)
curl -X GET \
  'https://api-testnet.bybit.com/v5/account/wallet-balance?accountType=UNIFIED' \
  -H 'X-BAPI-API-KEY: your-key' \
  -H 'X-BAPI-TIMESTAMP: timestamp' \
  -H 'X-BAPI-SIGN: signature' \
  -H 'X-BAPI-SIGN-TYPE: 2' \
  -H 'X-BAPI-RECV-WINDOW: 5000'

# Test CONTRACT account (Classic)
curl -X GET \
  'https://api-testnet.bybit.com/v5/account/wallet-balance?accountType=CONTRACT' \
  # ... same headers
```

## Best Practices

### 1. Error Handling
Always catch and log specific error codes:
```typescript
try {
  const balance = await bybitService.getWalletBalance('UNIFIED');
} catch (error: any) {
  if (error.retCode === 10003) {
    // Invalid API key - prompt user to reconfigure
  } else if (error.retCode === 10004) {
    // Signature error - check system time
  } else if (error.retCode === 33004) {
    // Permission error - guide user to enable permissions
  } else {
    // Generic error handling
    console.error('Wallet balance error:', error);
  }
}
```

### 2. Rate Limiting
Implement proper rate limiting to avoid API bans:
```typescript
const bybitService = new BybitService({
  apiKey: 'your-key',
  apiSecret: 'your-secret',
  testnet: true,
  enableRateLimit: true,  // Enable built-in rate limiting
  parseAPIRateLimits: true  // Parse rate limit headers
});
```

### 3. Caching
Cache wallet balance data to reduce API calls:
```typescript
// Cache balance for 30 seconds
const CACHE_TTL = 30 * 1000;
let cachedBalance: any = null;
let cacheTimestamp: number = 0;

async function getWalletBalanceCached() {
  const now = Date.now();
  if (cachedBalance && now - cacheTimestamp < CACHE_TTL) {
    return cachedBalance;
  }

  cachedBalance = await bybitService.getWalletBalance('UNIFIED');
  cacheTimestamp = now;
  return cachedBalance;
}
```

### 4. Retry Logic
Implement exponential backoff for transient errors:
```typescript
async function getWalletBalanceWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await bybitService.getWalletBalance('UNIFIED');
    } catch (error: any) {
      // Don't retry on authentication errors
      if (error.retCode === 10003 || error.retCode === 10004) {
        throw error;
      }

      // Retry on network or server errors
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Environment Variables Checklist

Ensure these environment variables are set:

```bash
# Required for encryption
ENCRYPTION_KEY=<64-character-hex-string>

# Optional: For default Bybit service instance
BYBIT_API_KEY=<your-api-key>
BYBIT_API_SECRET=<your-api-secret>

# Database connection
DATABASE_URL=<your-database-url>

# JWT for authentication
JWT_SECRET=<your-jwt-secret>

# Environment
NODE_ENV=development|production
```

## Testing Checklist

- [ ] API key is valid and active
- [ ] API key has correct permissions (Wallet, Account Info)
- [ ] Using correct environment (testnet vs mainnet)
- [ ] System time is synchronized
- [ ] ENCRYPTION_KEY is set and hasn't changed
- [ ] Database contains valid API keys for user
- [ ] User authentication is working
- [ ] Network connectivity to Bybit API
- [ ] No firewall blocking outbound HTTPS
- [ ] Logs show successful authentication
- [ ] Response contains wallet balance data

## Quick Fix Commands

```bash
# Generate new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test API connectivity
curl https://api-testnet.bybit.com/v5/market/time

# Check system time
date -u && curl -s https://api-testnet.bybit.com/v5/market/time | jq -r '.result.timeSecond' | xargs -I {} date -u -d @{}

# Run diagnostic test
BYBIT_TEST_API_KEY=xxx BYBIT_TEST_API_SECRET=yyy npm run test-wallet

# Enable debug mode
BYBITTRACE=1 npm run dev
```

## Support Resources

- [Bybit API Documentation](https://bybit-exchange.github.io/docs/v5/intro)
- [Bybit API Authentication Guide](https://bybit-exchange.github.io/docs/v5/guide)
- [Wallet Balance Endpoint Docs](https://bybit-exchange.github.io/docs/v5/account/wallet-balance)
- [Bybit API Error Codes](https://bybit-exchange.github.io/docs/v5/error)
- [Bybit API Status](https://bybit-status.com/)

## Common Error Codes Reference

| Code  | Message | Solution |
|-------|---------|----------|
| 0     | Success | All good! |
| 10001 | Parameter error | Check query parameters |
| 10002 | Timestamp error | Sync system time |
| 10003 | Invalid API key | Verify API key is correct |
| 10004 | Signature error | Check API secret and signature generation |
| 10005 | Permission denied | Enable required permissions on API key |
| 10006 | Too many requests | Implement rate limiting |
| 33004 | API key no permission | Enable Wallet/Account permissions |
| 110001 | Invalid account | Check account type |

