import prisma from '../lib/prisma';
import { ConnectorStateCache } from '../services/connector-state-cache.service';

async function testCachedConnector() {
  try {
    console.log('\n=== Testing Cached Connector ===\n');

    // Get the position
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' }
    });

    if (!position) {
      console.log('❌ Position not found');
      return;
    }

    console.log(`Position: ${position.positionId}`);
    console.log(`Hedge Exchange: ${position.hedgeExchange}`);
    console.log(`Hedge Credential ID: ${position.hedgeCredentialId}\n`);

    // Try to get the connector from cache
    const connectorId = `admin_1_${position.hedgeCredentialId}`;
    console.log(`Looking for cached connector: ${connectorId}\n`);

    // Get connector from cache
    const connector = await ConnectorStateCache.getConnector(
      'admin_1',
      position.hedgeExchange || 'BINGX',
      position.hedgeCredentialId || ''
    );

    if (!connector) {
      console.log('❌ No connector found in cache');
      return;
    }

    console.log('✅ Found connector in cache!\n');

    // Test 1: Try to get balance using cached connector
    console.log('1️⃣  Testing getBalance() with CACHED connector...');
    try {
      const balance = await connector.getBalance();
      console.log('✅ getBalance() SUCCESS with cached connector!');
      console.log('Balance:', JSON.stringify(balance, null, 2), '\n');
    } catch (error: any) {
      console.log('❌ getBalance() FAILED with cached connector:', error.message, '\n');
    }

    // Test 2: Try to get positions using cached connector
    console.log('2️⃣  Testing getPositions() with CACHED connector...');
    try {
      const positions = await connector.getPositions();
      console.log(`✅ getPositions() SUCCESS with cached connector!`);
      console.log(`Found ${positions.length} positions\n`);
    } catch (error: any) {
      console.log('❌ getPositions() FAILED with cached connector:', error.message, '\n');
    }

    // Test 3: Try to get income history using cached connector
    console.log('3️⃣  Testing getIncomeHistory() with CACHED connector...');
    try {
      // @ts-ignore - accessing internal method
      const incomeHistory = await connector.getIncomeHistory({
        symbol: 'ENSO-USDT',
        incomeType: 'FUNDING_FEE',
        limit: 10,
      });
      console.log('✅ getIncomeHistory() SUCCESS with cached connector!');
      console.log(`Response code: ${incomeHistory.code}`);
      console.log(`Records: ${incomeHistory.data?.length || 0}\n`);
    } catch (error: any) {
      console.log('❌ getIncomeHistory() FAILED with cached connector:', error.message, '\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCachedConnector();
