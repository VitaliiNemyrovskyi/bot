/**
 * Test positions API endpoint
 */

import prisma from './src/lib/prisma.js';

async function testAPI() {
  console.log('🧪 Testing /api/arbitrage/positions endpoint...\n');

  try {
    // Get user
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('❌ No users found');
      return;
    }

    const userId = users[0].id;
    console.log(`Using user ID: ${userId}\n`);

    // Query positions directly from database
    const positions = await prisma.priceArbitragePosition.findMany({
      where: {
        userId,
        status: {
          in: ['OPENING', 'ACTIVE', 'CLOSING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${positions.length} active position(s) for user ${userId}:\n`);

    positions.forEach((pos, i) => {
      console.log(`Position ${i + 1}:`);
      console.log(`  ID: ${pos.id}`);
      console.log(`  Symbol: ${pos.symbol}`);
      console.log(`  Exchanges: ${pos.primaryExchange} / ${pos.hedgeExchange}`);
      console.log(`  Status: ${pos.status}`);
      console.log(`  Quantity: ${pos.primaryQuantity} / ${pos.hedgeQuantity}`);
      console.log(`  Entry Prices: ${pos.entryPrimaryPrice} / ${pos.entryHedgePrice}`);
      console.log(`  Fees: ${pos.primaryFees} / ${pos.hedgeFees}`);
      console.log(`  Credential IDs: ${pos.primaryCredentialId} / ${pos.hedgeCredentialId}`);
      console.log('');
    });

    // Check for AIAUSDT specifically
    const aiaPosition = positions.find(p => p.symbol === 'AIAUSDT');
    if (aiaPosition) {
      console.log('✅ AIAUSDT position found in query results');
    } else {
      console.log('❌ AIAUSDT position NOT found in query results');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
