# Bybit Wallet Balance Endpoint - Quick Start

## Endpoint
```
GET /api/bybit/wallet-balance
```

## Quick Test

```bash
# 1. Start server
npm run dev

# 2. Get token and test (one-liner)
TOKEN=$(curl -s 'http://localhost:3000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"password123"}' \
  | jq -r '.token') && \
curl -s "http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

## Parameters
- `accountType` (optional): UNIFIED, CONTRACT, SPOT, INVESTMENT, OPTION, FUND (default: UNIFIED)
- `coin` (optional): USDT, BTC, ETH, etc.

## Examples

```bash
# Default (UNIFIED account)
curl "http://localhost:3000/api/bybit/wallet-balance" \
  -H "Authorization: Bearer $TOKEN"

# CONTRACT account
curl "http://localhost:3000/api/bybit/wallet-balance?accountType=CONTRACT" \
  -H "Authorization: Bearer $TOKEN"

# Specific coin
curl "http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&coin=USDT" \
  -H "Authorization: Bearer $TOKEN"
```

## Files
- **Endpoint:** `src/app/api/bybit/wallet-balance/route.ts`
- **Types:** `src/types/bybit.ts`
- **Test:** `test-wallet-balance.sh`
- **Docs:** `WALLET_BALANCE_ENDPOINT.md`

## Run Tests
```bash
./test-wallet-balance.sh
```
