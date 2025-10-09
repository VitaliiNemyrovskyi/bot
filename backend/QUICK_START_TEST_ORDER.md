# Quick Start: Test Order Endpoint

## 1. Get Your Authentication Token

```bash
# Login and get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Extract the token from the response
export AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 2. Get Your Credential ID

```bash
# List your exchange credentials
curl -X GET http://localhost:3000/api/credentials \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Extract the credential ID for your desired exchange
export CREDENTIAL_ID="cm2xyz123abc..."
```

## 3. Test a Simple Order

### BingX Test Order (No Execution)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "exchange": "BINGX",
    "credentialId": "'$CREDENTIAL_ID'",
    "testMode": true,
    "order": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "positionSide": "LONG",
      "type": "MARKET",
      "quantity": 0.001
    }
  }' | jq '.'
```

### Bybit Test Order (No Execution)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "exchange": "BYBIT",
    "credentialId": "'$CREDENTIAL_ID'",
    "testMode": true,
    "order": {
      "symbol": "BTCUSDT",
      "side": "BUY",
      "type": "MARKET",
      "quantity": 0.001
    }
  }' | jq '.'
```

## 4. Use the Test Script

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Set environment variables
export AUTH_TOKEN="your-jwt-token"
export CREDENTIAL_ID="your-credential-id"
export EXCHANGE="BINGX"  # or BYBIT

# Run the test script
npx ts-node test-order-endpoint.ts
```

## 5. Understanding the Response

The response includes four main sections:

### Request Details
Shows exactly what was sent to the exchange:
```json
{
  "request": {
    "method": "POST",
    "endpoint": "/openApi/swap/v2/trade/order/test",
    "params": { "symbol": "BTC-USDT", ... },
    "timestamp": 1728475200123
  }
}
```

### Response Details
Shows what the exchange returned:
```json
{
  "response": {
    "statusCode": 200,
    "data": { "code": 0, "msg": "success", ... }
  }
}
```

### Debug Information
Includes helpful debugging data:
```json
{
  "debug": {
    "exchange": "BINGX",
    "environment": "TESTNET",
    "timeSyncStatus": { "offset": 123, ... },
    "quantityAdjustment": { "original": 0.001, "adjusted": 0.001, ... },
    "orderDetails": { "original": {...}, "prepared": {...} }
  }
}
```

### Timing Metrics
Shows performance data:
```json
{
  "executionTime": 234,
  "totalTime": 567
}
```

## Common Issues and Solutions

### Issue: "Unauthorized" Error
**Solution**: Verify your AUTH_TOKEN is valid and not expired
```bash
# Check token expiration
echo $AUTH_TOKEN | cut -d'.' -f2 | base64 -d | jq '.exp'
```

### Issue: "Credentials not found"
**Solution**: Verify the credential ID is correct
```bash
# List all credentials to find the right ID
curl -X GET http://localhost:3000/api/credentials \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.credentials[].id'
```

### Issue: "Symbol not found"
**Solution**: Check symbol format (BTC-USDT for BingX, BTCUSDT for Bybit)
```bash
# Get available symbols for BingX
curl -X GET "http://localhost:3000/api/bingx/test-order?credentialId=$CREDENTIAL_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data[].symbol' | head -20
```

### Issue: "Quantity too small"
**Solution**: Check the `quantityAdjustment` in the response debug section
```json
{
  "quantityAdjustment": {
    "rules": {
      "minQuantity": 0.001  // Must be at least this amount
    }
  }
}
```

### Issue: "Time synchronization error"
**Solution**: Check the `timeSyncStatus` in the response
- If offset > 1000ms, the server time may be out of sync
- Restart the server to force a fresh time sync

## Next Steps

1. ✅ Test with `testMode: true` to validate parameters
2. ✅ Review the debug information to understand any adjustments
3. ✅ Check timing metrics to ensure acceptable performance
4. ⚠️  Switch to `testMode: false` only when ready to execute real orders
5. 📊 Monitor the exchange account after executing real orders

## Safety Reminders

- **ALWAYS** use `testMode: true` first
- **VERIFY** symbol format matches the exchange
- **CHECK** quantity meets minimum requirements
- **ENSURE** sufficient balance in the exchange account
- **REVIEW** API key permissions (must allow trading)

## Example: Complete Flow

```bash
#!/bin/bash

# 1. Login
echo "Step 1: Logging in..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

AUTH_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')
echo "Token: ${AUTH_TOKEN:0:20}..."

# 2. Get credentials
echo "Step 2: Getting credentials..."
CREDS=$(curl -s -X GET http://localhost:3000/api/credentials \
  -H "Authorization: Bearer $AUTH_TOKEN")

CREDENTIAL_ID=$(echo $CREDS | jq -r '.credentials[0].id')
echo "Credential ID: $CREDENTIAL_ID"

# 3. Test order
echo "Step 3: Testing order..."
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "exchange": "BINGX",
    "credentialId": "'$CREDENTIAL_ID'",
    "testMode": true,
    "order": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "positionSide": "LONG",
      "type": "MARKET",
      "quantity": 0.001
    }
  }' | jq '{success, executionTime, response: .response.data}'

echo "Done!"
```

Save this as `test-flow.sh` and run:
```bash
chmod +x test-flow.sh
./test-flow.sh
```

## Resources

- **Full Documentation**: `TEST_ORDER_ENDPOINT.md`
- **Test Script**: `test-order-endpoint.ts`
- **HTTP Examples**: `test-order-examples.http`
- **API Endpoint**: `/backend/src/app/api/test-order/route.ts`
