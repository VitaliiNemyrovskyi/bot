#!/bin/bash

# Test script for the new Bybit Wallet Balance endpoint
# Usage: ./test-wallet-balance.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_ENDPOINT="${BASE_URL}/api/bybit/wallet-balance"

echo "=========================================="
echo "Bybit Wallet Balance Endpoint Test"
echo "=========================================="
echo ""

# Step 1: Login to get JWT token
echo "[1/5] Authenticating..."
echo "Endpoint: POST ${BASE_URL}/api/auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s "${BASE_URL}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get authentication token"
  echo "Please ensure the dev server is running: npm run dev"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Step 2: Test without authentication (should fail with 401)
echo "[2/5] Testing endpoint without authentication (should fail)..."
echo "Endpoint: GET ${API_ENDPOINT}"
echo ""

UNAUTH_RESPONSE=$(curl -s "${API_ENDPOINT}")
echo "Response:"
echo "$UNAUTH_RESPONSE" | jq '.'
echo ""

# Step 3: Test with default parameters (UNIFIED account)
echo "[3/5] Testing with default parameters (UNIFIED account)..."
echo "Endpoint: GET ${API_ENDPOINT}"
echo ""

DEFAULT_RESPONSE=$(curl -s "${API_ENDPOINT}" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response:"
echo "$DEFAULT_RESPONSE" | jq '.'
echo ""

# Step 4: Test with specific accountType
echo "[4/5] Testing with CONTRACT account type..."
echo "Endpoint: GET ${API_ENDPOINT}?accountType=CONTRACT"
echo ""

CONTRACT_RESPONSE=$(curl -s "${API_ENDPOINT}?accountType=CONTRACT" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response:"
echo "$CONTRACT_RESPONSE" | jq '.'
echo ""

# Step 5: Test with specific coin filter
echo "[5/5] Testing with specific coin (USDT)..."
echo "Endpoint: GET ${API_ENDPOINT}?accountType=UNIFIED&coin=USDT"
echo ""

COIN_RESPONSE=$(curl -s "${API_ENDPOINT}?accountType=UNIFIED&coin=USDT" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response:"
echo "$COIN_RESPONSE" | jq '.'
echo ""

# Test with invalid accountType
echo "[BONUS] Testing with invalid account type (should fail with 400)..."
echo "Endpoint: GET ${API_ENDPOINT}?accountType=INVALID"
echo ""

INVALID_RESPONSE=$(curl -s "${API_ENDPOINT}?accountType=INVALID" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response:"
echo "$INVALID_RESPONSE" | jq '.'
echo ""

echo "=========================================="
echo "Test Complete!"
echo "=========================================="
