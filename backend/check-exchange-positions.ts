/**
 * Check positions on exchanges for AIAUSDT
 */

import { GateIOConnector } from './src/connectors/gateio.connector.js';
import { BingXConnector } from './src/connectors/bingx.connector.js';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service.js';
import prisma from './src/lib/prisma.js';

async function checkPositions() {
  console.log('=== Checking AIAUSDT positions on exchanges ===\n');

  try {
    // Get credentials from database using proper service (handles decryption)
    console.log('📂 Loading and decrypting credentials from database...');

    // First get user ID (assuming first user for this test)
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('❌ No users found in database');
      return;
    }
    const userId = users[0].id;
    console.log(`   Using user ID: ${userId}`);

    // Get decrypted credentials using proper service
    const gateioCredentials = await ExchangeCredentialsService.getActiveCredentials(userId, 'GATEIO' as any);
    const bingxCredentials = await ExchangeCredentialsService.getActiveCredentials(userId, 'BINGX' as any);

    if (!gateioCredentials) {
      console.error('❌ No active Gate.io credentials found in database');
      return;
    }

    if (!bingxCredentials) {
      console.error('❌ No active BingX credentials found in database');
      return;
    }

    console.log('✅ Found and decrypted credentials for both exchanges');

    const gateioApiKey = gateioCredentials.apiKey;
    const gateioApiSecret = gateioCredentials.apiSecret;
    const bingxApiKey = bingxCredentials.apiKey;
    const bingxApiSecret = bingxCredentials.apiSecret;

    // Initialize Gate.io connector
    console.log('\n📡 Connecting to Gate.io...');
    const gateio = new GateIOConnector(gateioApiKey, gateioApiSecret);
    await gateio.initialize();

    // Get Gate.io positions
    const gateioPositions = await gateio.getPositions('AIAUSDT');
    console.log(`\n✅ Gate.io positions (${gateioPositions.length} found):`);

    gateioPositions.forEach((pos: any, index: number) => {
      const size = parseFloat(pos.size || '0');
      if (size !== 0) {
        console.log(`\n  Position ${index + 1}:`);
        console.log(`    Symbol: ${pos.contract || pos.symbol}`);
        console.log(`    Side: ${size > 0 ? 'LONG' : 'SHORT'}`);
        console.log(`    Size: ${Math.abs(size)}`);
        console.log(`    Leverage: ${pos.leverage}`);
        console.log(`    Entry Price: ${pos.entryPrice || pos.avgPrice || 'N/A'}`);
        console.log(`    RAW DATA:`, JSON.stringify(pos, null, 2));
      }
    });

    // Initialize BingX connector
    console.log('\n📡 Connecting to BingX...');
    const bingx = new BingXConnector(bingxApiKey, bingxApiSecret);
    await bingx.initialize();

    // Get BingX positions (try both formats)
    let bingxPositions = await bingx.getPositions('AIAUSDT');
    if (bingxPositions.length === 0) {
      console.log('  Trying with hyphenated format...');
      bingxPositions = await bingx.getPositions('AIA-USDT');
    }

    console.log(`\n✅ BingX positions (${bingxPositions.length} found):`);

    bingxPositions.forEach((pos: any, index: number) => {
      const size = parseFloat(pos.size || pos.positionAmt || '0');
      if (size !== 0) {
        console.log(`\n  Position ${index + 1}:`);
        console.log(`    Symbol: ${pos.symbol}`);
        console.log(`    Side: ${size > 0 ? 'LONG' : 'SHORT'}`);
        console.log(`    Size: ${Math.abs(size)}`);
        console.log(`    Leverage: ${pos.leverage}`);
        console.log(`    Entry Price: ${pos.entryPrice || pos.avgPrice || 'N/A'}`);
        console.log(`    RAW DATA:`, JSON.stringify(pos, null, 2));
      }
    });

    // Analyze for arbitrage pairs
    console.log('\n\n=== ARBITRAGE ANALYSIS ===\n');

    const gateioNonZero = gateioPositions.filter((p: any) => parseFloat(p.size || '0') !== 0);
    const bingxNonZero = bingxPositions.filter((p: any) => parseFloat(p.size || p.positionAmt || '0') !== 0);

    if (gateioNonZero.length === 0 && bingxNonZero.length === 0) {
      console.log('❌ No open positions found on either exchange');
      return;
    }

    if (gateioNonZero.length === 0) {
      console.log('⚠️  No positions on Gate.io');
    }

    if (bingxNonZero.length === 0) {
      console.log('⚠️  No positions on BingX');
    }

    if (gateioNonZero.length > 0 && bingxNonZero.length > 0) {
      console.log('Checking for matching arbitrage pairs...\n');

      for (const gPos of gateioNonZero) {
        const gSize = parseFloat(gPos.size || '0');
        const gSide = gSize > 0 ? 'LONG' : 'SHORT';
        const gLeverage = parseFloat(gPos.leverage || '1');

        for (const bPos of bingxNonZero) {
          const bSize = parseFloat(bPos.size || bPos.positionAmt || '0');
          const bSide = bSize > 0 ? 'LONG' : 'SHORT';
          const bLeverage = parseFloat(bPos.leverage || '1');

          const oppositeSides = gSide !== bSide;
          const sameSize = Math.abs(Math.abs(gSize) - Math.abs(bSize)) < 0.0001;
          const sameLeverage = gLeverage === bLeverage;

          console.log(`  Gate.io ${gSide} vs BingX ${bSide}:`);
          console.log(`    Opposite sides: ${oppositeSides ? '✅' : '❌'}`);
          console.log(`    Same size (${Math.abs(gSize)} vs ${Math.abs(bSize)}): ${sameSize ? '✅' : '❌'}`);
          console.log(`    Same leverage (${gLeverage}x vs ${bLeverage}x): ${sameLeverage ? '✅' : '❌'}`);

          if (oppositeSides && sameSize && sameLeverage) {
            console.log('\n  🎉 VALID ARBITRAGE PAIR FOUND!\n');
          } else {
            console.log('');
          }
        }
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    // Close database connection
    await prisma.$disconnect();
  }
}

checkPositions().catch(console.error);
