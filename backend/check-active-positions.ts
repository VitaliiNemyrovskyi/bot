/**
 * Check active graduated entry positions in database
 * This script checks if there are any active positions and their funding data
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking graduated entry positions...\n');

    // Get all non-completed positions
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        status: {
          not: 'COMPLETED',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${positions.length} active positions\n`);

    if (positions.length === 0) {
      console.log('No active positions found.');
      return;
    }

    // Display each position
    for (const pos of positions) {
      console.log('='.repeat(80));
      console.log(`Position ID: ${pos.positionId}`);
      console.log(`Symbol: ${pos.symbol}`);
      console.log(`Status: ${pos.status}`);
      console.log(`Created: ${pos.createdAt.toISOString()}`);
      console.log(`Started: ${pos.startedAt.toISOString()}`);
      console.log('');

      console.log('PRIMARY EXCHANGE:');
      console.log(`  Exchange: ${pos.primaryExchange}`);
      console.log(`  Side: ${pos.primarySide}`);
      console.log(`  Leverage: ${pos.primaryLeverage}x`);
      console.log(`  Quantity: ${pos.primaryQuantity}`);
      console.log(`  Entry Price: ${pos.primaryEntryPrice !== null ? pos.primaryEntryPrice : 'N/A'}`);
      console.log(`  Current Price: ${pos.primaryCurrentPrice !== null ? pos.primaryCurrentPrice : 'N/A'}`);
      console.log(`  Last Funding Paid: ${pos.primaryLastFundingPaid} USDT`);
      console.log(`  Total Funding Earned: ${pos.primaryTotalFundingEarned} USDT`);
      console.log(`  Trading Fees: ${pos.primaryTradingFees} USDT`);
      console.log('');

      console.log('HEDGE EXCHANGE:');
      console.log(`  Exchange: ${pos.hedgeExchange}`);
      console.log(`  Side: ${pos.hedgeSide}`);
      console.log(`  Leverage: ${pos.hedgeLeverage}x`);
      console.log(`  Quantity: ${pos.hedgeQuantity}`);
      console.log(`  Entry Price: ${pos.hedgeEntryPrice !== null ? pos.hedgeEntryPrice : 'N/A'}`);
      console.log(`  Current Price: ${pos.hedgeCurrentPrice !== null ? pos.hedgeCurrentPrice : 'N/A'}`);
      console.log(`  Last Funding Paid: ${pos.hedgeLastFundingPaid} USDT`);
      console.log(`  Total Funding Earned: ${pos.hedgeTotalFundingEarned} USDT`);
      console.log(`  Trading Fees: ${pos.hedgeTradingFees} USDT`);
      console.log('');

      console.log('PROFIT SUMMARY:');
      console.log(`  Gross Profit: ${pos.grossProfit} USDT`);
      console.log(`  Net Profit: ${pos.netProfit} USDT`);
      console.log('');

      console.log('FUNDING TRACKER STATUS:');
      console.log(`  Last Update: ${pos.lastFundingUpdate ? pos.lastFundingUpdate.toISOString() : 'Never'}`);
      console.log(`  Update Count: ${pos.fundingUpdateCount}`);
      console.log('');
    }

    console.log('='.repeat(80));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
