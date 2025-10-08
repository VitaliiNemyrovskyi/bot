#!/bin/bash

# Exchange Credentials API Test Script
# Tests all endpoints for the Exchange Credentials API

set -e  # Exit on error

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ${1}${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to make API request and pretty print
api_request() {
    local METHOD=$1
    local ENDPOINT=$2
    local DATA=$3
    local DESCRIPTION=$4

    print_info "$DESCRIPTION"
    echo "Request: $METHOD $ENDPOINT"

    if [ -n "$DATA" ]; then
        echo "Body: $DATA"
    fi

    echo ""

    local RESPONSE
    if [ "$METHOD" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_BASE}${ENDPOINT}")
    elif [ "$METHOD" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$DATA" \
            "${API_BASE}${ENDPOINT}")
    elif [ "$METHOD" = "PUT" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_BASE}${ENDPOINT}")
    elif [ "$METHOD" = "DELETE" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_BASE}${ENDPOINT}")
    fi

    # Split response body and status code
    BODY=$(echo "$RESPONSE" | sed '$d')
    STATUS=$(echo "$RESPONSE" | tail -n 1)

    echo "Status: $STATUS"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""

    # Return the body for further processing
    echo "$BODY"
}

# Main test flow
main() {
    print_header "Exchange Credentials API Test Suite"

    # Check if server is running
    print_info "Checking if server is running..."
    if ! curl -s "${BASE_URL}" > /dev/null; then
        print_error "Server is not running on ${BASE_URL}"
        print_info "Please start the development server with: npm run dev"
        exit 1
    fi
    print_success "Server is running"

    # Step 1: Get authentication token
    print_header "Step 1: Authentication"
    print_info "Logging in to get authentication token..."

    LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@test.com","password":"password123"}')

    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token // empty')

    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        print_error "Failed to get authentication token"
        echo "Response: $LOGIN_RESPONSE"
        print_warning "Please ensure you have a test user with email: admin@test.com and password: password123"
        exit 1
    fi

    print_success "Authenticated successfully"
    echo "Token: ${TOKEN:0:20}..."

    # Step 2: Test GET without credentials
    print_header "Step 2: List Credentials (Empty)"
    api_request "GET" "/exchange-credentials" "" "Fetching all credentials (should be empty initially)"

    # Step 3: Test POST - Create Bybit testnet credentials
    print_header "Step 3: Create Bybit Testnet Credentials"
    print_warning "Note: This will fail if you don't have valid Bybit testnet API keys"
    print_info "Replace the API keys below with your actual Bybit testnet keys"

    CREATE_RESPONSE=$(api_request "POST" "/exchange-credentials" \
        '{"exchange":"BYBIT","environment":"TESTNET","apiKey":"your-api-key","apiSecret":"your-api-secret","label":"My Bybit Testnet"}' \
        "Creating Bybit testnet credentials")

    CREDENTIAL_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id // empty')

    if [ -n "$CREDENTIAL_ID" ] && [ "$CREDENTIAL_ID" != "null" ]; then
        print_success "Credential created with ID: $CREDENTIAL_ID"
    else
        print_warning "Credential creation may have failed (expected if using placeholder keys)"
    fi

    # Step 4: Test GET with credentials
    print_header "Step 4: List All Credentials"
    api_request "GET" "/exchange-credentials" "" "Fetching all credentials"

    # Step 5: Test GET grouped
    print_header "Step 5: List Credentials Grouped by Exchange"
    api_request "GET" "/exchange-credentials?grouped=true" "" "Fetching grouped credentials"

    # Step 6: Test GET filtered by exchange
    print_header "Step 6: List Credentials Filtered by Exchange"
    api_request "GET" "/exchange-credentials?exchange=BYBIT" "" "Fetching Bybit credentials only"

    # Step 7: Test GET filtered by environment
    print_header "Step 7: List Credentials Filtered by Environment"
    api_request "GET" "/exchange-credentials?environment=TESTNET" "" "Fetching testnet credentials only"

    # Step 8: Test GET active credentials for Bybit
    print_header "Step 8: Get Active Bybit Credentials"
    api_request "GET" "/exchange-credentials/active/BYBIT" "" "Fetching active Bybit credentials"

    # Only proceed with modify/delete tests if we have a credential ID
    if [ -n "$CREDENTIAL_ID" ] && [ "$CREDENTIAL_ID" != "null" ]; then
        # Step 9: Create another credential (mainnet)
        print_header "Step 9: Create Bybit Mainnet Credentials"
        CREATE_MAINNET_RESPONSE=$(api_request "POST" "/exchange-credentials" \
            '{"exchange":"BYBIT","environment":"MAINNET","apiKey":"your-mainnet-api-key","apiSecret":"your-mainnet-api-secret","label":"My Bybit Mainnet"}' \
            "Creating Bybit mainnet credentials")

        MAINNET_CREDENTIAL_ID=$(echo "$CREATE_MAINNET_RESPONSE" | jq -r '.data.id // empty')

        if [ -n "$MAINNET_CREDENTIAL_ID" ] && [ "$MAINNET_CREDENTIAL_ID" != "null" ]; then
            # Step 10: Activate mainnet credential
            print_header "Step 10: Activate Mainnet Credentials"
            api_request "PUT" "/exchange-credentials/${MAINNET_CREDENTIAL_ID}/activate" "" "Activating mainnet credentials"

            # Step 11: Verify active credential changed
            print_header "Step 11: Verify Active Credentials Changed"
            api_request "GET" "/exchange-credentials/active/BYBIT" "" "Fetching active Bybit credentials (should be mainnet now)"
        fi

        # Step 12: Delete testnet credential
        print_header "Step 12: Delete Testnet Credentials"
        api_request "DELETE" "/exchange-credentials/${CREDENTIAL_ID}" "" "Deleting testnet credentials"

        # Step 13: List credentials after deletion
        print_header "Step 13: List Credentials After Deletion"
        api_request "GET" "/exchange-credentials" "" "Fetching all credentials after deletion"
    else
        print_warning "Skipping activate/delete tests (no credential ID available)"
        print_info "To test these endpoints, use valid Bybit API keys"
    fi

    # Step 14: Test error handling - Invalid exchange
    print_header "Step 14: Test Error Handling - Invalid Exchange"
    api_request "GET" "/exchange-credentials/active/INVALID_EXCHANGE" "" "Testing with invalid exchange (should return 400)"

    # Step 15: Test error handling - Invalid credential ID
    print_header "Step 15: Test Error Handling - Invalid Credential ID"
    api_request "DELETE" "/exchange-credentials/nonexistent-id" "" "Testing with invalid credential ID (should return 404)"

    print_header "Test Suite Complete"
    print_success "All tests executed"
    print_info "Review the results above to ensure everything works as expected"
    print_warning "Some tests may show errors/warnings if using placeholder API keys"
}

# Run tests
main
