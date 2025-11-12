/**
 * Check if AIAUSDT position was imported to database
 */

import prisma from './src/lib/prisma.js';

async function checkPosition() {
  console.log('🔍 Checking for imported AIAUSDT position in database...\n');

  try {
    // Find all AIAUSDT positions
    const positions = await prisma.priceArbitragePosition.findMany({
      where: {
        symbol: 'AIAUSDT',
        primaryExchange: 'GATEIO',
        hedgeExchange: 'BINGX',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (positions.length === 0) {
      console.log('❌ No AIAUSDT positions found in database');
      return;
    }

    console.log(`✅ Found ${positions.length} AIAUSDT position(s):\n`);

    positions.forEach((pos, i) => {
      console.log(`Position ${i + 1}:`);
      console.log(`  ID: ${pos.id}`);
      console.log(`  Symbol: ${pos.symbol}`);
      console.log(`  Primary Exchange: ${pos.primaryExchange}`);
      console.log(`  Hedge Exchange: ${pos.hedgeExchange}`);
      console.log(`  Status: ${pos.status}`);
      console.log(`  Primary Quantity: ${pos.primaryQuantity}`);
      console.log(`  Hedge Quantity: ${pos.hedgeQuantity}`);
      console.log(`  Primary Leverage: ${pos.primaryLeverage}x`);
      console.log(`  Hedge Leverage: ${pos.hedgeLeverage}x`);
      console.log(`  Entry Primary Price: ${pos.entryPrimaryPrice}`);
      console.log(`  Entry Hedge Price: ${pos.entryHedgePrice}`);
      console.log(`  Primary Fees: ${pos.primaryFees || 'N/A'}`);
      console.log(`  Hedge Fees: ${pos.hedgeFees || 'N/A'}`);
      console.log(`  Created At: ${pos.createdAt}`);
      console.log(`  Opened At: ${pos.openedAt || 'N/A'}`);
      console.log('');
    });

    // Check if status is ACTIVE
    const activePositions = positions.filter(p => p.status === 'ACTIVE');
    console.log(`Active positions: ${activePositions.length}/${positions.length}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosition();
