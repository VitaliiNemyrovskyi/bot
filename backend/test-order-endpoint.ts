/**
 * Test Script for /api/test-order Endpoint
 *
 * This script tests the universal test order endpoint with detailed logging
 * for both BingX and Bybit exchanges.
 *
 * Usage:
 *   npx ts-node test-order-endpoint.ts
 *
 * Environment Variables Required:
 *   - API_BASE_URL: Base URL of the API (default: http://localhost:3000)
 *   - AUTH_TOKEN: JWT authentication token
 *   - CREDENTIAL_ID: Exchange credential ID from database
 *   - EXCHANGE: BINGX or BYBIT
 */

interface TestOrderRequest {
  exchange: 'BINGX' | 'BYBIT';
  credentialId: string;
  order: {
    symbol: string;
    side: 'BUY' | 'SELL';
    positionSide?: 'LONG' | 'SHORT';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
  };
  testMode?: boolean;
}

interface TestOrderResponse {
  success: boolean;
  request: {
    method: string;
    endpoint: string;
    params: Record<string, any>;
    queryString: string;
    timestamp: number;
    headers: Record<string, string>;
  };
  response: {
    statusCode: number;
    data: any;
    error?: string;
  };
  executionTime: number;
  totalTime: number;
  debug: {
    exchange: string;
    environment: string;
    testMode: boolean;
    timeSyncStatus?: any;
    orderDetails: any;
  };
  error?: string;
  message?: string;
  timestamp: string;
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const CREDENTIAL_ID = process.env.CREDENTIAL_ID || '';
const EXCHANGE = (process.env.EXCHANGE || 'BINGX') as 'BINGX' | 'BYBIT';

async function testOrder(request: TestOrderRequest): Promise<TestOrderResponse> {
  console.log('\n=== Test Order Request ===');
  console.log('Exchange:', request.exchange);
  console.log('Credential ID:', request.credentialId);
  console.log('Test Mode:', request.testMode ?? true);
  console.log('Order:', JSON.stringify(request.order, null, 2));
  console.log('========================\n');

  const response = await fetch(`${BASE_URL}/api/test-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  console.log('\n=== Test Order Response ===');
  console.log('HTTP Status:', response.status);
  console.log('Success:', data.success);
  console.log('Total Time:', data.totalTime, 'ms');
  console.log('===========================\n');

  return data;
}

function printDetailedResponse(response: TestOrderResponse) {
  console.log('\n==================== DETAILED RESPONSE ====================\n');

  // 1. Request Details
  console.log('REQUEST DETAILS:');
  console.log('  Method:', response.request?.method);
  console.log('  Endpoint:', response.request?.endpoint);
  console.log('  Timestamp:', response.request?.timestamp);
  console.log('  Query String:', response.request?.queryString?.substring(0, 100) + '...');
  console.log('  Headers:', JSON.stringify(response.request?.headers, null, 2));
  console.log('  Parameters:', JSON.stringify(response.request?.params, null, 2));

  console.log('\n-----------------------------------------------------------\n');

  // 2. Response Details
  console.log('RESPONSE DETAILS:');
  console.log('  Status Code:', response.response?.statusCode);
  if (response.response?.error) {
    console.log('  Error:', response.response.error);
  }
  console.log('  Data:', JSON.stringify(response.response?.data, null, 2));

  console.log('\n-----------------------------------------------------------\n');

  // 3. Debug Information
  console.log('DEBUG INFORMATION:');
  console.log('  Exchange:', response.debug?.exchange);
  console.log('  Environment:', response.debug?.environment);
  console.log('  Test Mode:', response.debug?.testMode);

  if (response.debug?.timeSyncStatus) {
    console.log('  Time Sync Status:');
    console.log('    Offset:', response.debug.timeSyncStatus.offset, 'ms');
    console.log('    Last Sync:', new Date(response.debug.timeSyncStatus.lastSyncTime).toISOString());
    console.log('    Sync Age:', response.debug.timeSyncStatus.syncAge, 'ms');
  }

  if (response.debug?.quantityAdjustment) {
    console.log('  Quantity Adjustment:');
    console.log('    Original:', response.debug.quantityAdjustment.original);
    console.log('    Adjusted:', response.debug.quantityAdjustment.adjusted);
    console.log('    Was Adjusted:', response.debug.quantityAdjustment.wasAdjusted);
    console.log('    Rules:', JSON.stringify(response.debug.quantityAdjustment.rules, null, 4));
  }

  if (response.debug?.contractRules) {
    console.log('  Contract Rules (BingX):');
    console.log(JSON.stringify(response.debug.contractRules, null, 4));
  }

  if (response.debug?.instrumentInfo) {
    console.log('  Instrument Info (Bybit):');
    console.log(JSON.stringify(response.debug.instrumentInfo, null, 4));
  }

  console.log('  Order Details:');
  console.log('    Original:', JSON.stringify(response.debug?.orderDetails?.original, null, 4));
  console.log('    Prepared:', JSON.stringify(response.debug?.orderDetails?.prepared, null, 4));

  console.log('\n-----------------------------------------------------------\n');

  // 4. Performance Metrics
  console.log('PERFORMANCE METRICS:');
  console.log('  Execution Time:', response.executionTime, 'ms');
  console.log('  Total Time:', response.totalTime, 'ms');
  console.log('  Timestamp:', response.timestamp);

  console.log('\n===========================================================\n');
}

async function main() {
  console.log('\n🚀 Testing /api/test-order Endpoint\n');

  if (!AUTH_TOKEN) {
    console.error('❌ ERROR: AUTH_TOKEN environment variable is required');
    console.log('\nUsage:');
    console.log('  export AUTH_TOKEN="your-jwt-token"');
    console.log('  export CREDENTIAL_ID="your-credential-id"');
    console.log('  export EXCHANGE="BINGX"  # or BYBIT');
    console.log('  npx ts-node test-order-endpoint.ts\n');
    process.exit(1);
  }

  if (!CREDENTIAL_ID) {
    console.error('❌ ERROR: CREDENTIAL_ID environment variable is required');
    process.exit(1);
  }

  // Test cases based on exchange
  const testCases: TestOrderRequest[] = [];

  if (EXCHANGE === 'BINGX') {
    testCases.push(
      // Test Case 1: BingX Market Order (Test Mode)
      {
        exchange: 'BINGX',
        credentialId: CREDENTIAL_ID,
        testMode: true,
        order: {
          symbol: 'BTC-USDT',
          side: 'BUY',
          positionSide: 'LONG',
          type: 'MARKET',
          quantity: 0.001,
        },
      },
      // Test Case 2: BingX Limit Order (Test Mode)
      {
        exchange: 'BINGX',
        credentialId: CREDENTIAL_ID,
        testMode: true,
        order: {
          symbol: 'ETH-USDT',
          side: 'SELL',
          positionSide: 'SHORT',
          type: 'LIMIT',
          quantity: 0.01,
          price: 3500,
        },
      }
    );
  } else {
    testCases.push(
      // Test Case 1: Bybit Market Order (Test Mode)
      {
        exchange: 'BYBIT',
        credentialId: CREDENTIAL_ID,
        testMode: true,
        order: {
          symbol: 'BTCUSDT',
          side: 'BUY',
          type: 'MARKET',
          quantity: 0.001,
        },
      },
      // Test Case 2: Bybit Limit Order (Test Mode)
      {
        exchange: 'BYBIT',
        credentialId: CREDENTIAL_ID,
        testMode: true,
        order: {
          symbol: 'ETHUSDT',
          side: 'SELL',
          type: 'LIMIT',
          quantity: 0.01,
          price: 3500,
        },
      }
    );
  }

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TEST CASE ${i + 1}/${testCases.length}: ${testCase.exchange} ${testCase.order.type} Order`);
    console.log('='.repeat(70));

    try {
      const response = await testOrder(testCase);

      if (response.success) {
        console.log('✅ Test PASSED\n');
        printDetailedResponse(response);
      } else {
        console.log('❌ Test FAILED\n');
        console.log('Error:', response.error || response.message);
        if (response.response) {
          console.log('Response:', JSON.stringify(response.response, null, 2));
        }
      }
    } catch (error: any) {
      console.log('❌ Test FAILED with exception\n');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }

    // Wait between tests
    if (i < testCases.length - 1) {
      console.log('\nWaiting 2 seconds before next test...\n');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✨ All tests completed\n');
}

// Run tests
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
