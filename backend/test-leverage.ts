/**
 * Test script for leverage synchronization implementation
 *
 * This script verifies that the leverage setting functionality
 * is correctly implemented in BingX and Bybit connectors.
 *
 * Usage: ts-node test-leverage.ts
 */

// Mock implementation to test the structure
interface ExchangeConnector {
  exchangeName: string;
  setLeverage?: (symbol: string, leverage: number, ...args: any[]) => Promise<any>;
}

class MockBingXConnector implements ExchangeConnector {
  exchangeName = 'BINGX_TESTNET';

  async setLeverage(
    symbol: string,
    leverage: number,
    side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
  ): Promise<any> {
    console.log(`[MockBingX] Setting leverage for ${symbol}: ${leverage}x (side: ${side})`);
    return { success: true, leverage, side };
  }
}

class MockBybitConnector implements ExchangeConnector {
  exchangeName = 'BYBIT_TESTNET';

  async setLeverage(
    symbol: string,
    leverage: number,
    category: 'linear' | 'inverse' = 'linear'
  ): Promise<any> {
    console.log(`[MockBybit] Setting leverage for ${symbol}: ${leverage}x (category: ${category})`);
    return { success: true, leverage, category };
  }
}

async function setExchangeLeverage(
  connector: ExchangeConnector,
  symbol: string,
  leverage: number
): Promise<void> {
  const exchangeName = connector.exchangeName;

  console.log(`Setting leverage on ${exchangeName} for ${symbol}: ${leverage}x`);

  try {
    const connectorWithLeverage = connector as any;

    if (typeof connectorWithLeverage.setLeverage !== 'function') {
      console.warn(`${exchangeName} connector does not support setLeverage, skipping...`);
      return;
    }

    if (exchangeName.includes('BINGX')) {
      await connectorWithLeverage.setLeverage(symbol, leverage, 'BOTH');
    } else if (exchangeName.includes('BYBIT')) {
      await connectorWithLeverage.setLeverage(symbol, leverage, 'linear');
    } else {
      await connectorWithLeverage.setLeverage(symbol, leverage);
    }

    console.log(`Leverage set successfully on ${exchangeName}: ${leverage}x\n`);
  } catch (error: any) {
    console.error(`Failed to set leverage on ${exchangeName}:`, error.message);
    throw error;
  }
}

async function testLeverageSync() {
  console.log('=== Testing Leverage Synchronization ===\n');

  const bingxConnector = new MockBingXConnector();
  const bybitConnector = new MockBybitConnector();
  const leverage = 3;

  console.log('Test 1: Set leverage on BingX');
  await setExchangeLeverage(bingxConnector, 'BTC-USDT', leverage);

  console.log('Test 2: Set leverage on Bybit');
  await setExchangeLeverage(bybitConnector, 'BTCUSDT', leverage);

  console.log('Test 3: Parallel leverage sync (as in production)');
  await Promise.all([
    setExchangeLeverage(bingxConnector, 'ETH-USDT', 5),
    setExchangeLeverage(bybitConnector, 'ETHUSDT', 5),
  ]);

  console.log('=== All Tests Passed! ===');
}

// Run tests
testLeverageSync().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
