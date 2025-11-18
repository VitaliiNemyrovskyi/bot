import prisma from '../lib/prisma';
import { BybitService } from '../lib/bybit';
import { ExchangeCredentialsService } from '../lib/exchange-credentials-service';

async function testBybitFundingHistory() {
  try {
    console.log('\n=== Testing Bybit Funding History for ENSOUSDT ===\n');

    // Get Bybit credentials using proper service (handles decryption)
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      'admin_1',
      'BYBIT'
    );

    if (!credentials) {
      console.log('❌ No Bybit credentials found');
      return;
    }

    console.log(`Using credentials ID: ${credentials.id}`);
    console.log(`API Key (first 10 chars): ${credentials.apiKey.substring(0, 10)}...\n`);

    // Create Bybit service
    const bybit = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: 'admin_1',
      credentialId: credentials.id,
    });

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
    console.log(`Primary Exchange: ${position.primaryExchange}`);
    console.log(`Created At: ${position.createdAt.toLocaleString()}\n`);

    // Test 1: Try getTransactionLog with type='SETTLEMENT' (for ACTIVE positions)
    console.log('1️⃣  Testing getTransactionLog with type=SETTLEMENT (for active positions)...');
    try {
      const startTime = position.createdAt.getTime(); // Position creation time
      const endTime = Date.now();

      const transactionLog = await bybit.getTransactionLog({
        accountType: 'UNIFIED',
        category: 'linear',
        type: 'SETTLEMENT', // This should return funding fee settlements
        startTime,
        endTime,
        limit: 50,
      });

      console.log(`✅ getTransactionLog SUCCESS!`);
      console.log(`Total records: ${transactionLog.length}`);

      // Filter for ENSOUSDT funding
      const ensoFunding = transactionLog.filter((log: any) =>
        log.symbol === 'ENSOUSDT' && log.type === 'SETTLEMENT'
      );

      console.log(`ENSOUSDT funding records: ${ensoFunding.length}\n`);

      if (ensoFunding.length > 0) {
        console.log('Recent ENSOUSDT funding payments:');
        ensoFunding.slice(0, 5).forEach((log: any, index: number) => {
          console.log(`\n[${index + 1}]`);
          console.log(`  Time: ${new Date(parseInt(log.transactionTime)).toLocaleString()}`);
          console.log(`  Amount: ${log.change} ${log.currency}`);
          console.log(`  Balance After: ${log.balance}`);
          console.log(`  Type: ${log.type}`);
        });
      } else {
        console.log('⚠️  No ENSOUSDT funding records found');
        console.log('\nLet me show you what symbols we DO have in transaction log:');
        const symbols = [...new Set(transactionLog.map((log: any) => log.symbol))];
        console.log(`Symbols found: ${symbols.join(', ')}`);
      }
    } catch (error: any) {
      console.log(`❌ getTransactionLog FAILED:`, error.message);
    }

    // Test 2: Try getClosedPnL (for comparison - this won't work for active positions)
    console.log('\n\n2️⃣  Testing getClosedPnL (this should return nothing for active positions)...');
    try {
      const startTime = position.createdAt.getTime();
      const endTime = Date.now();

      const closedPnl = await bybit.getClosedPnL({
        category: 'linear',
        symbol: 'ENSOUSDT',
        startTime,
        endTime,
        limit: 50,
      });

      console.log(`✅ getClosedPnL SUCCESS (but likely empty for active position)`);
      console.log(`Records: ${closedPnl.list?.length || 0}`);

      if (closedPnl.list && closedPnl.list.length > 0) {
        console.log('\nClosed P&L records:');
        closedPnl.list.slice(0, 3).forEach((record: any, index: number) => {
          console.log(`\n[${index + 1}]`);
          console.log(`  Symbol: ${record.symbol}`);
          console.log(`  Closed P&L: ${record.closedPnl}`);
          console.log(`  Closed Time: ${new Date(parseInt(record.updatedTime)).toLocaleString()}`);
        });
      } else {
        console.log('⚠️  No closed P&L records (expected for active position)');
      }
    } catch (error: any) {
      console.log(`❌ getClosedPnL FAILED:`, error.message);
    }

    // Test 3: Check the actual position to see current funding
    console.log('\n\n3️⃣  Checking actual Bybit position...');
    try {
      const positions = await bybit.getPositions({ symbol: 'ENSOUSDT' });

      if (positions.length > 0) {
        const pos = positions[0];
        console.log(`✅ Found ENSOUSDT position!`);
        console.log(`  Side: ${pos.side}`);
        console.log(`  Size: ${pos.size}`);
        console.log(`  Entry Price: ${pos.entryPrice}`);
        console.log(`  Unrealized PnL: ${pos.unrealisedPnl || pos.unrealizedPnl || 'N/A'}`);
        console.log(`  Cumulative Realized PnL: ${(pos as any).cumRealisedPnl || 'N/A'}`);
      } else {
        console.log('⚠️  No ENSOUSDT position found on Bybit');
      }
    } catch (error: any) {
      console.log(`❌ getPositions FAILED:`, error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBybitFundingHistory();
