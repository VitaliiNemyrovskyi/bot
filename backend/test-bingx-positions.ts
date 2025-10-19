/**
 * Test script to check BingX open positions
 */

import { PrismaClient } from '@prisma/client';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';
import { BingXService } from './src/lib/bingx';

const prisma = new PrismaClient();

async function main() {
  try {
    // First, get the userId from the graduated entry position
    console.log('Finding active position...');
    const position = await prisma.graduatedEntryPosition.findFirst({
      where: { positionId: 'arb_1_1760860010874' },
      select: { userId: true, hedgeExchange: true }
    });

    if (!position) {
      console.error('Position not found');
      process.exit(1);
    }

    console.log(`Found position with userId: ${position.userId}`);
    console.log(`Hedge exchange: ${position.hedgeExchange}`);

    console.log('\nFetching BingX credentials...');

    // Get BingX credentials (automatically decrypts)
    const credentials = await ExchangeCredentialsService.getActiveCredentials(position.userId, 'BINGX');

    if (!credentials) {
      console.error('No active BingX credentials found');
      process.exit(1);
    }

    console.log(`Found BingX credentials: ${credentials.id}`);

    const bingx = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
    });

    // Sync time
    await bingx.syncTime();
    console.log('Time synchronized');

    // Get positions
    console.log('\nFetching positions...');
    const positions = await bingx.getPositions();

    console.log(`\nTotal positions: ${positions.length}`);

    // Filter open positions
    const openPositions = positions.filter((p: any) => {
      const size = Math.abs(parseFloat(p.positionAmt || '0'));
      return size > 0;
    });

    console.log(`Open positions: ${openPositions.length}\n`);

    if (openPositions.length > 0) {
      openPositions.forEach((pos: any, idx: number) => {
        console.log(`Position ${idx + 1}:`);
        console.log(`  Symbol: ${pos.symbol}`);
        console.log(`  Side: ${parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT'}`);
        console.log(`  Position Amount: ${pos.positionAmt}`);
        console.log(`  Entry Price: ${pos.avgPrice}`);
        console.log(`  Mark Price: ${pos.markPrice}`);
        console.log(`  Unrealized PnL: ${pos.unrealizedProfit}`);
        console.log(`  Leverage: ${pos.leverage}x`);
        console.log('');
      });
    } else {
      console.log('No open positions found');
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
