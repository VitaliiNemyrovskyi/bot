#!/bin/bash

# Test script for Funding Arbitrage Revenue API
# Usage: ./test-revenue-api.sh [session_token]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"
API_ENDPOINT="/api/funding-arbitrage/revenue"

# Session token (pass as argument or set default)
SESSION_TOKEN="${1:-your_session_token_here}"

echo -e "${YELLOW}=== Funding Arbitrage Revenue API Test Suite ===${NC}\n"

# Test 1: Get all revenue data (last 30 days)
echo -e "${YELLOW}Test 1: Get all revenue data (last 30 days)${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.'
echo -e "\n${GREEN}✓ Test 1 complete${NC}\n"

# Test 2: Get revenue for specific date range
echo -e "${YELLOW}Test 2: Get revenue for specific date range${NC}"
START_DATE="2025-01-01T00:00:00Z"
END_DATE="2025-12-31T23:59:59Z"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}?startDate=${START_DATE}&endDate=${END_DATE}" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.filters, .data.summary'
echo -e "\n${GREEN}✓ Test 2 complete${NC}\n"

# Test 3: Filter by symbol
echo -e "${YELLOW}Test 3: Filter by symbol (BTCUSDT)${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}?symbol=BTCUSDT" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.summary, .data.bySymbol'
echo -e "\n${GREEN}✓ Test 3 complete${NC}\n"

# Test 4: Filter by exchange
echo -e "${YELLOW}Test 4: Filter by exchange (BYBIT)${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}?exchange=BYBIT" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.summary, .data.byExchange'
echo -e "\n${GREEN}✓ Test 4 complete${NC}\n"

# Test 5: Combined filters
echo -e "${YELLOW}Test 5: Combined filters (BTCUSDT + BYBIT)${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}?symbol=BTCUSDT&exchange=BYBIT" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.summary'
echo -e "\n${GREEN}✓ Test 5 complete${NC}\n"

# Test 6: Invalid date range (should return 400)
echo -e "${YELLOW}Test 6: Invalid date range (should return 400)${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}?startDate=2025-12-31&endDate=2025-01-01" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.success, .error, .message'
echo -e "\n${GREEN}✓ Test 6 complete${NC}\n"

# Test 7: Check timeline aggregation
echo -e "${YELLOW}Test 7: Check timeline aggregation${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.timeline[0:5]'
echo -e "\n${GREEN}✓ Test 7 complete${NC}\n"

# Test 8: Check individual deals structure
echo -e "${YELLOW}Test 8: Check individual deals structure${NC}"
curl -s -X GET "${BASE_URL}${API_ENDPOINT}" \
  -H "Cookie: session=${SESSION_TOKEN}" \
  | jq '.data.deals[0]'
echo -e "\n${GREEN}✓ Test 8 complete${NC}\n"

echo -e "${GREEN}=== All tests complete ===${NC}"
