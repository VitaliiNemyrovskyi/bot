# Bybit Asset Info Integration

## Overview
This document describes the new `/api/bybit/asset-info` endpoint that fetches asset information from Bybit using the GET /v5/asset/transfer/query-asset-info API.

## Backend Implementation

### File: `/backend/src/lib/bybit.ts`

Added `getAssetInfo()` method to the BybitService class:

```typescript
/**
 * Get Asset Information
 * Retrieves asset information for different account types
 * Endpoint: GET /v5/asset/transfer/query-asset-info
 *
 * @param accountType - Optional account type (SPOT, CONTRACT, UNIFIED, etc.)
 * @param coin - Optional specific coin to query
 * @returns Asset information including available balance, locked amount, etc.
 */
async getAssetInfo(accountType?: string, coin?: string) {
  try {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API credentials required for this operation');
    }

    const params: any = {};
    if (accountType) params.accountType = accountType;
    if (coin) params.coin = coin;

    const response = await this.restClient.getAssetInfo(params);

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`);
    }

    return response.result;
  } catch (error) {
    console.error('Error fetching asset info:', error);
    throw error;
  }
}
```

### File: `/backend/src/app/api/bybit/asset-info/route.ts`

Created new API endpoint following the pattern of existing Bybit endpoints:

**Endpoint:** `GET /api/bybit/asset-info`

**Query Parameters:**
- `accountType` (optional): SPOT, CONTRACT, UNIFIED, INVESTMENT, OPTION, FUND
- `coin` (optional): BTC, ETH, USDT, etc.

**Authentication:** Required (Bearer JWT token)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "status": "SUCCESS",
      "assets": [
        {
          "coin": "BTC",
          "frozen": "0.00000000",
          "free": "0.00000000",
          "withdraw": "0.00000000"
        }
      ]
    }
  },
  "accountType": "SPOT",
  "coin": "BTC",
  "testnet": false,
  "timestamp": "2025-10-01T13:00:00.000Z"
}
```

**Error Responses:**
- 400: Invalid accountType
- 401: Unauthorized (missing or invalid token)
- 403: No API keys configured
- 500: Internal server error

## Frontend Implementation

### File: `/frontend/src/app/services/bybit-user.service.ts`

Added TypeScript interfaces:

```typescript
/**
 * Asset Information for a single coin
 */
export interface BybitAssetItem {
  coin: string;
  frozen: string;
  free: string;
  withdraw: string;
  [key: string]: any; // Allow for additional fields from API
}

/**
 * Asset Information for an account type
 */
export interface BybitAccountAssetInfo {
  status: string;
  assets: BybitAssetItem[];
}

/**
 * Complete Asset Information Response
 */
export interface BybitAssetInfoResponse {
  success: boolean;
  data: {
    spot?: BybitAccountAssetInfo;
    contract?: BybitAccountAssetInfo;
    unified?: BybitAccountAssetInfo;
    investment?: BybitAccountAssetInfo;
    option?: BybitAccountAssetInfo;
    fund?: BybitAccountAssetInfo;
    [key: string]: any; // Allow for dynamic account types
  };
  accountType?: string;
  coin?: string;
  testnet: boolean;
  timestamp: string;
}
```

Added service method:

```typescript
/**
 * Get asset information from Bybit
 * Retrieves detailed asset information for different account types
 * @param accountType - Optional account type (SPOT, CONTRACT, UNIFIED, etc.)
 * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
 * @returns Observable<BybitAssetInfoResponse>
 */
getAssetInfo(accountType?: string, coin?: string): Observable<BybitAssetInfoResponse> {
  let url = getEndpointUrl('bybit', 'assetInfo');

  const params: string[] = [];
  if (accountType) {
    params.push(`accountType=${accountType.toUpperCase()}`);
  }
  if (coin) {
    params.push(`coin=${coin.toUpperCase()}`);
  }

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  return this.http.get<BybitAssetInfoResponse>(url).pipe(
    catchError(error => {
      console.error('Error fetching asset info:', error);
      const errorMessage = this.handleError(error);
      return throwError(() => new Error(errorMessage));
    })
  );
}
```

### File: `/frontend/src/app/config/app.config.ts`

Added endpoint configuration:

```typescript
bybit: {
  userInfo: '/bybit/user-info',
  testConnection: '/bybit/user-info',
  apiKeys: '/bybit/api-keys',
  deleteApiKeys: '/bybit/api-keys',
  storedApiKeys: '/bybit/api-keys',
  walletBalance: '/bybit/wallet-balance',
  assetInfo: '/bybit/asset-info'  // NEW
}
```

## Usage Examples

### Backend Usage (Node.js/Next.js)

```typescript
import { BybitService } from '@/lib/bybit';

// Create service with stored credentials
const service = await BybitService.createFromDatabase(userId);

// Get all asset info
const allAssets = await service.getAssetInfo();

// Get asset info for specific account type
const spotAssets = await service.getAssetInfo('SPOT');

// Get asset info for specific coin
const btcAssets = await service.getAssetInfo(undefined, 'BTC');

// Get asset info for specific account type and coin
const spotBTC = await service.getAssetInfo('SPOT', 'BTC');
```

### Frontend Usage (Angular)

```typescript
import { BybitUserService } from '@/services/bybit-user.service';

export class MyComponent {
  constructor(private bybitService: BybitUserService) {}

  // Get all asset info
  getAllAssets() {
    this.bybitService.getAssetInfo().subscribe({
      next: (response) => {
        console.log('Asset info:', response.data);

        // Access SPOT assets
        if (response.data.spot) {
          console.log('SPOT assets:', response.data.spot.assets);
        }

        // Access UNIFIED assets
        if (response.data.unified) {
          console.log('UNIFIED assets:', response.data.unified.assets);
        }
      },
      error: (error) => {
        console.error('Failed to fetch asset info:', error);
      }
    });
  }

  // Get SPOT assets only
  getSpotAssets() {
    this.bybitService.getAssetInfo('SPOT').subscribe({
      next: (response) => {
        console.log('SPOT asset info:', response.data);
      },
      error: (error) => {
        console.error('Failed to fetch SPOT asset info:', error);
      }
    });
  }

  // Get BTC asset info across all account types
  getBTCAssets() {
    this.bybitService.getAssetInfo(undefined, 'BTC').subscribe({
      next: (response) => {
        console.log('BTC asset info:', response.data);
      },
      error: (error) => {
        console.error('Failed to fetch BTC asset info:', error);
      }
    });
  }

  // Get USDT info in SPOT account
  getSpotUSDT() {
    this.bybitService.getAssetInfo('SPOT', 'USDT').subscribe({
      next: (response) => {
        if (response.data.spot) {
          const usdtAsset = response.data.spot.assets.find(
            asset => asset.coin === 'USDT'
          );
          if (usdtAsset) {
            console.log('USDT Balance:', usdtAsset.free);
            console.log('USDT Frozen:', usdtAsset.frozen);
            console.log('USDT Withdrawable:', usdtAsset.withdraw);
          }
        }
      },
      error: (error) => {
        console.error('Failed to fetch SPOT USDT info:', error);
      }
    });
  }
}
```

## API Testing with curl

```bash
# Get all asset info (requires authentication token)
curl -X GET "http://localhost:3000/api/bybit/asset-info" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get SPOT account assets
curl -X GET "http://localhost:3000/api/bybit/asset-info?accountType=SPOT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get BTC assets across all accounts
curl -X GET "http://localhost:3000/api/bybit/asset-info?coin=BTC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get USDT in SPOT account
curl -X GET "http://localhost:3000/api/bybit/asset-info?accountType=SPOT&coin=USDT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

1. **JWT Authentication**: Uses stored user credentials from database
2. **Query Parameter Validation**: Validates account types before making API calls
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Type Safety**: Full TypeScript interfaces for request/response data
5. **Flexible Queries**: Support for filtering by account type and coin
6. **Consistent Pattern**: Follows existing endpoint patterns in the codebase
7. **Database Integration**: Loads API keys from database using BybitService.createFromDatabase()

## Related Files

### Backend
- `/backend/src/lib/bybit.ts` - BybitService with getAssetInfo method
- `/backend/src/app/api/bybit/asset-info/route.ts` - API endpoint handler

### Frontend
- `/frontend/src/app/services/bybit-user.service.ts` - Service with getAssetInfo method
- `/frontend/src/app/config/app.config.ts` - Endpoint configuration

## Documentation

- Bybit API Documentation: https://bybit-exchange.github.io/docs/v5/asset/balance/asset-info
- API Method: `GET /v5/asset/transfer/query-asset-info`
