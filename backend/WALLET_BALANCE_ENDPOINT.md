# Bybit Wallet Balance Endpoint Documentation

## Overview

The Wallet Balance endpoint retrieves detailed wallet balance information from Bybit using API keys stored in the database for the authenticated user.

**Endpoint:** `GET /api/bybit/wallet-balance`

**File Location:** `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/app/api/bybit/wallet-balance/route.ts`

## Authentication

This endpoint requires a valid JWT Bearer token in the Authorization header.

```bash
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `accountType` | string | No | `UNIFIED` | The type of Bybit account. Valid values: `UNIFIED`, `CONTRACT`, `SPOT`, `INVESTMENT`, `OPTION`, `FUND` |
| `coin` | string | No | - | Specific coin to query (e.g., `USDT`, `BTC`, `ETH`). If not specified, returns balances for all coins. |

## Request Examples

### 1. Get UNIFIED Account Balance (Default)

```bash
curl -X GET "http://localhost:3000/api/bybit/wallet-balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get CONTRACT Account Balance

```bash
curl -X GET "http://localhost:3000/api/bybit/wallet-balance?accountType=CONTRACT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get UNIFIED Balance for Specific Coin

```bash
curl -X GET "http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&coin=USDT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Complete Test Flow

```bash
# Step 1: Login to get token
TOKEN=$(curl -s 'http://localhost:3000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"password123"}' \
  | jq -r '.token')

# Step 2: Get wallet balance
curl -s "http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "accountType": "UNIFIED",
        "totalEquity": "10234.56",
        "totalWalletBalance": "10000.00",
        "totalAvailableBalance": "9500.00",
        "totalMarginBalance": "10000.00",
        "totalInitialMargin": "500.00",
        "totalMaintenanceMargin": "250.00",
        "totalPerpUPL": "234.56",
        "accountIMRate": "0.05",
        "accountMMRate": "0.025",
        "accountLTV": "0.15",
        "coin": [
          {
            "coin": "USDT",
            "equity": "5000.00",
            "usdValue": "5000.00",
            "walletBalance": "5000.00",
            "free": "4500.00",
            "locked": "500.00",
            "availableToWithdraw": "4500.00",
            "borrowAmount": "0.00",
            "availableToBorrow": "10000.00",
            "accruedInterest": "0.00",
            "totalOrderIM": "300.00",
            "totalPositionIM": "200.00",
            "totalPositionMM": "100.00",
            "unrealisedPnl": "100.00",
            "cumRealisedPnl": "234.56",
            "bonus": "0.00",
            "collateralSwitch": true,
            "marginCollateral": true
          },
          {
            "coin": "BTC",
            "equity": "0.15",
            "usdValue": "5234.56",
            "walletBalance": "0.15",
            "free": "0.15",
            "locked": "0.00",
            "availableToWithdraw": "0.15",
            "borrowAmount": "0.00",
            "unrealisedPnl": "134.56",
            "cumRealisedPnl": "0.00"
          }
        ]
      }
    ]
  },
  "accountType": "UNIFIED",
  "coin": "USDT",
  "testnet": true,
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### Response Fields

#### Top Level
- `success` (boolean): Indicates if the request was successful
- `data` (object): Contains the Bybit API response
- `accountType` (string): The account type that was queried
- `coin` (string, optional): The specific coin that was queried (if specified)
- `testnet` (boolean): Whether the API keys are for testnet or mainnet
- `timestamp` (string): ISO 8601 timestamp of the response

#### Account Balance Details (`data.list[0]`)
- `accountType`: Account type (UNIFIED, CONTRACT, SPOT, etc.)
- `totalEquity`: Total equity in USD
- `totalWalletBalance`: Total wallet balance in USD
- `totalAvailableBalance`: Total available balance in USD
- `totalMarginBalance`: Total margin balance in USD
- `totalInitialMargin`: Total initial margin in USD
- `totalMaintenanceMargin`: Total maintenance margin in USD
- `totalPerpUPL`: Total unrealized P&L from perpetual contracts
- `accountIMRate`: Initial margin rate
- `accountMMRate`: Maintenance margin rate
- `accountLTV`: Loan-to-value ratio

#### Coin Balance Details (`data.list[0].coin[]`)
- `coin`: Coin name (e.g., USDT, BTC, ETH)
- `equity`: Total equity for this coin
- `usdValue`: USD value of the coin balance
- `walletBalance`: Total wallet balance
- `free`: Available balance (not locked)
- `locked`: Locked balance (in orders or positions)
- `availableToWithdraw`: Amount available for withdrawal
- `borrowAmount`: Amount borrowed (for margin trading)
- `availableToBorrow`: Amount available to borrow
- `accruedInterest`: Accrued interest
- `totalOrderIM`: Initial margin for open orders
- `totalPositionIM`: Initial margin for open positions
- `totalPositionMM`: Maintenance margin for open positions
- `unrealisedPnl`: Unrealized profit and loss
- `cumRealisedPnl`: Cumulative realized profit and loss
- `bonus`: Bonus balance
- `collateralSwitch`: Whether the coin can be used as collateral
- `marginCollateral`: Whether the coin is used as margin collateral

## Error Responses

### 400 Bad Request - Invalid Account Type

```json
{
  "success": false,
  "error": "Invalid account type",
  "message": "Account type must be one of: UNIFIED, CONTRACT, SPOT, INVESTMENT, OPTION, FUND",
  "code": "INVALID_ACCOUNT_TYPE",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### 401 Unauthorized - Missing or Invalid Token

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required. Please log in.",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### 403 Forbidden - No API Keys Configured

```json
{
  "success": false,
  "error": "API credentials not configured",
  "message": "Please configure your Bybit API credentials first. Go to Settings to add your API keys.",
  "code": "NO_API_KEYS",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch wallet balance",
  "message": "Bybit API Error: Invalid API key",
  "code": "BYBIT_API_ERROR",
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

## Implementation Details

### Key Features

1. **Authentication:** Uses `AuthService.authenticateRequest()` to verify JWT tokens
2. **Database Integration:** Uses `BybitService.createFromDatabase()` to load API keys from the database
3. **Query Parameter Validation:** Validates `accountType` against allowed values
4. **Error Handling:** Comprehensive error handling for authentication, validation, and API errors
5. **Flexible Queries:** Supports filtering by account type and specific coins

### Security Considerations

- API keys are never exposed in responses
- All requests require valid JWT authentication
- API keys are stored encrypted in the database
- Rate limiting is enabled by default in the BybitService

### Related Files

- **Service:** `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bybit.ts`
  - `BybitService.createFromDatabase()` - Loads API keys from database
  - `getWalletBalance()` - Calls Bybit API endpoint

- **Auth Service:** `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/auth.ts`
  - `authenticateRequest()` - Validates JWT tokens

- **Keys Service:** `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bybit-keys-service.ts`
  - Manages encrypted API key storage

## Bybit API Reference

This endpoint wraps the Bybit API endpoint:
- **Official Docs:** https://bybit-exchange.github.io/docs/v5/account/wallet-balance
- **Endpoint:** `GET /v5/account/wallet-balance`
- **Required Permissions:** Requires `Account` read permission

## Testing

A comprehensive test script is provided at:
```
/Users/vnemyrovskyi/IdeaProjects/bot/backend/test-wallet-balance.sh
```

Run the tests:
```bash
# Make sure the dev server is running first
npm run dev

# In another terminal, run the test script
./test-wallet-balance.sh
```

The test script will:
1. Authenticate and obtain a JWT token
2. Test the endpoint without authentication (should fail)
3. Test with default parameters (UNIFIED account)
4. Test with CONTRACT account type
5. Test with specific coin filter (USDT)
6. Test with invalid account type (should fail)

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get wallet balance with authorization
async function getWalletBalance(
  token: string,
  accountType: 'UNIFIED' | 'CONTRACT' = 'UNIFIED',
  coin?: string
): Promise<WalletBalanceResponse> {
  const params = new URLSearchParams();
  params.append('accountType', accountType);
  if (coin) params.append('coin', coin);

  const response = await fetch(
    `http://localhost:3000/api/bybit/wallet-balance?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Usage
const token = 'your_jwt_token';
const balance = await getWalletBalance(token, 'UNIFIED', 'USDT');
console.log('Total Equity:', balance.data.list[0].totalEquity);
```

### Python

```python
import requests

def get_wallet_balance(token, account_type='UNIFIED', coin=None):
    url = 'http://localhost:3000/api/bybit/wallet-balance'
    headers = {'Authorization': f'Bearer {token}'}
    params = {'accountType': account_type}
    if coin:
        params['coin'] = coin

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# Usage
token = 'your_jwt_token'
balance = get_wallet_balance(token, 'UNIFIED', 'USDT')
print(f"Total Equity: {balance['data']['list'][0]['totalEquity']}")
```

## Notes

- The endpoint returns data from Bybit's testnet by default in development mode
- Production deployments will use mainnet credentials
- API keys must have the `Account` read permission enabled
- Rate limiting is handled automatically by the BybitService
- The endpoint is stateless and does not cache balance data

## Changelog

### Version 1.0.0 (2025-10-01)
- Initial implementation
- Support for UNIFIED and CONTRACT account types
- Query parameter support for accountType and coin
- Comprehensive error handling
- Integration with database-stored API keys
