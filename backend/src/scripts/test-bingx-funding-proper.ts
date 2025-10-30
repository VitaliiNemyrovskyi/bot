import { PrismaClient } from '@prisma/client';
import { BingXService } from '../lib/bingx';
import { ExchangeCredentialsService } from '../lib/exchange-credentials-service';

const prisma = new PrismaClient();

async function testBingXFundingProper() {
  try {
    console.log('\n=== Testing BingX Funding History with Proper Decryption ===\n');

    // Get BingX credentials using proper service (handles decryption)
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      'admin_1',
      'BINGX'
    );

    if (!credentials) {
      console.log('❌ No BingX credentials found');
      return;
    }

    console.log(`Using credentials ID: ${credentials.id}`);
    console.log(`API Key (first 10 chars): ${credentials.apiKey.substring(0, 10)}...\n`);

    // Create BingX service
    const bingx = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: 'admin_1',
      credentialId: credentials.id,
    });

    // Sync time first
    console.log('1️⃣  Syncing time with BingX server...');
    await bingx.syncTime();
    console.log('✅ Time synced successfully\n');

    // Get position details
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' }
    });

    if (!position) {
      console.log('❌ Position not found');
      return;
    }

    console.log(`Position: ${position.positionId}`);
    console.log(`Symbol: ${position.symbol}`);
    console.log(`Hedge Exchange: ${position.hedgeExchange}`);
    console.log(`Created At: ${position.createdAt.toLocaleString()}\n`);

    // Test 1: Get balance (to verify credentials work)
    console.log('2️⃣  Testing getBalance() to verify credentials...');
    try {
      const balance = await bingx.getBalance();
      console.log('✅ Authentication successful! Balance retrieved:');
      console.log(`  Total: ${balance.total} USDT`);
      console.log(`  Available: ${balance.available} USDT\n`);
    } catch (error: any) {
      console.log(`❌ Authentication failed:`, error.message, '\n');
      return;
    }

    // Test 2: Get positions
    console.log('3️⃣  Checking BingX positions...');
    try {
      const positions = await bingx.getPositions();
      console.log(`✅ Found ${positions.length} position(s)\n`);

      const ensoPosition = positions.find(p => p.symbol === 'ENSO-USDT');
      if (ensoPosition) {
        console.log('ENSO-USDT position found:');
        console.log(`  Side: ${ensoPosition.side}`);
        console.log(`  Size: ${ensoPosition.size}`);
        console.log(`  Entry Price: ${ensoPosition.entryPrice}`);
        console.log(`  Unrealized PnL: ${ensoPosition.unrealisedPnl || ensoPosition.unrealizedPnl || 'N/A'}\n`);
      }
    } catch (error: any) {
      console.log(`❌ Get positions failed:`, error.message, '\n');
    }

    // Test 3: Try to get income history (funding fees)
    console.log('4️⃣  Testing getIncomeHistory() for funding fees...');
    try {
      const startTime = position.createdAt.getTime();
      const endTime = Date.now();

      // @ts-ignore - accessing internal method
      const incomeHistory = await bingx.getIncomeHistory({
        symbol: 'ENSOUSDT',
        incomeType: 'FUNDING_FEE',
        startTime,
        endTime,
        limit: 50,
      });

      console.log(`✅ getIncomeHistory() SUCCESS!`);
      console.log(`Response code: ${incomeHistory.code}`);
      console.log(`Records: ${incomeHistory.data?.length || 0}\n`);

      if (incomeHistory.data && incomeHistory.data.length > 0) {
        console.log('Recent funding payments:');
        incomeHistory.data.slice(0, 5).forEach((record: any, index: number) => {
          console.log(`\n[${index + 1}]`);
          console.log(`  Time: ${new Date(record.time || record.timestamp).toLocaleString()}`);
          console.log(`  Symbol: ${record.symbol}`);
          console.log(`  Income: ${record.income || record.amount}`);
          console.log(`  Type: ${record.incomeType}`);
        });
      } else {
        console.log('⚠️  No funding fee records found');
        console.log('\nPossible reasons:');
        console.log('  1. No funding events occurred yet for this position');
        console.log('  2. API key permissions might not include income history');
        console.log('  3. Symbol format might be different (ENSOUSDT vs ENSO-USDT)');
      }
    } catch (error: any) {
      console.log(`❌ getIncomeHistory() FAILED:`, error.message);
      console.log('\nThis error might indicate:');
      console.log('  - API key missing "Enable Reading" permission');
      console.log('  - Endpoint requires specific permissions\n');
    }

    // Test 4: Try alternative symbol format
    console.log('\n5️⃣  Trying alternative symbol format (ENSO-USDT)...');
    try {
      // @ts-ignore
      const incomeHistory = await bingx.getIncomeHistory({
        symbol: 'ENSO-USDT',
        incomeType: 'FUNDING_FEE',
        startTime: position.createdAt.getTime(),
        endTime: Date.now(),
        limit: 50,
      });

      console.log(`✅ Response code: ${incomeHistory.code}`);
      console.log(`Records: ${incomeHistory.data?.length || 0}`);

      if (incomeHistory.data && incomeHistory.data.length > 0) {
        console.log('\n✅ SUCCESS! Found funding records with ENSO-USDT format!');
        incomeHistory.data.slice(0, 3).forEach((record: any, index: number) => {
          console.log(`\n[${index + 1}]`);
          console.log(`  Time: ${new Date(record.time || record.timestamp).toLocaleString()}`);
          console.log(`  Income: ${record.income || record.amount}`);
        });
      }
    } catch (error: any) {
      console.log(`❌ Also failed with ENSO-USDT:`, error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBingXFundingProper();
