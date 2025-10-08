# Test All Coins Balance Endpoint

## Endpoint
`GET /api/bybit/all-coins-balance`

## Description
This endpoint retrieves all coins balance from Bybit, including the FUND (Funding wallet) account, using the GET /v5/asset/transfer/query-account-coins-balance API.

## Query Parameters
- `accountType` (optional): Account type to query (UNIFIED, SPOT, CONTRACT, FUND, OPTION, etc.)
  - Default: FUND
- `coin` (optional): Specific coin to query (BTC, ETH, USDT, etc.)

## Authentication
Required: Bearer token (JWT)

## Testing Examples

### 1. Get all coins in FUND wallet (default)
```bash
curl -X GET 'http://localhost:3000/api/bybit/all-coins-balance' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2. Get all coins in UNIFIED account
```bash
curl -X GET 'http://localhost:3000/api/bybit/all-coins-balance?accountType=UNIFIED' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3. Get specific coin (USDT) in FUND wallet
```bash
curl -X GET 'http://localhost:3000/api/bybit/all-coins-balance?accountType=FUND&coin=USDT' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 4. Get all coins in SPOT account
```bash
curl -X GET 'http://localhost:3000/api/bybit/all-coins-balance?accountType=SPOT' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Expected Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "memberId": "123456",
    "accountType": "FUND",
    "balance": [
      {
        "coin": "USDT",
        "transferBalance": "124405.65",
        "walletBalance": "124405.65",
        "bonus": "0"
      },
      {
        "coin": "BTC",
        "transferBalance": "0.5",
        "walletBalance": "0.5",
        "bonus": "0"
      }
    ]
  },
  "accountType": "FUND",
  "testnet": false,
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

## Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required. Please log in.",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### 403 - No API Keys
```json
{
  "success": false,
  "error": "API credentials not configured",
  "message": "Please configure your Bybit API credentials first. Go to Settings to add your API keys.",
  "code": "NO_API_KEYS",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### 400 - Invalid Account Type
```json
{
  "success": false,
  "error": "Invalid account type",
  "message": "Account type must be one of: SPOT, CONTRACT, UNIFIED, INVESTMENT, OPTION, FUND",
  "code": "INVALID_ACCOUNT_TYPE",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

## Frontend Usage

### Using the Service
```typescript
import { BybitUserService } from '@/app/services/bybit-user.service';

// Inject the service
constructor(private bybitUserService: BybitUserService) {}

// Get all coins in FUND wallet (default)
this.bybitUserService.getAllCoinsBalance().subscribe({
  next: (response) => {
    console.log('All coins balance:', response);
    // Access balance data
    response.data.balance.forEach(coin => {
      console.log(`${coin.coin}: ${coin.transferBalance}`);
    });
  },
  error: (error) => {
    console.error('Error:', error);
  }
});

// Get all coins in UNIFIED account
this.bybitUserService.getAllCoinsBalance('UNIFIED').subscribe({
  next: (response) => {
    console.log('UNIFIED balance:', response);
  }
});

// Get specific coin (USDT) in FUND wallet
this.bybitUserService.getAllCoinsBalance('FUND', 'USDT').subscribe({
  next: (response) => {
    console.log('USDT balance:', response);
  }
});
```

## Key Differences from asset-info Endpoint

1. **FUND Wallet Support**: This endpoint can query the FUND (Funding wallet) where your 124,405.65 balance likely is
2. **Different Data Structure**: Returns `transferBalance`, `walletBalance`, and `bonus` fields for each coin
3. **Multiple Account Types**: Can query FUND, UNIFIED, SPOT, CONTRACT, OPTION, etc.
4. **Comprehensive Balance**: Shows all balances that can be transferred between accounts

## Implementation Files

### Backend
- `/backend/src/lib/bybit.ts` - Added `getAllCoinsBalance()` method to BybitService
- `/backend/src/app/api/bybit/all-coins-balance/route.ts` - New API route handler

### Frontend
- `/frontend/src/app/services/bybit-user.service.ts` - Added TypeScript interfaces and `getAllCoinsBalance()` method
- `/frontend/src/app/config/app.config.ts` - Added endpoint configuration

## Notes
- The endpoint defaults to FUND account type to help retrieve funding wallet balances
- Uses stored API keys from the database (JWT authentication required)
- Supports all account types: UNIFIED, SPOT, CONTRACT, FUND, OPTION, INVESTMENT
- Can filter by specific coin if needed
