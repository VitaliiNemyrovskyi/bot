/**
 * Test script to check BingX open positions
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching BingX credentials...');

    // Get BingX credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BINGX',
        isActive: true,
      },
    });

    if (!credentials) {
      console.error('No active BingX credentials found');
      process.exit(1);
    }

    console.log(`Found BingX credentials: ${credentials.id}`);

    // Import BingX service dynamically
    const { BingXService } = require('./dist/lib/bingx.js');

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
    const openPositions = positions.filter(p => {
      const size = Math.abs(parseFloat(p.positionAmt || '0'));
      return size > 0;
    });

    console.log(`Open positions: ${openPositions.length}\n`);

    if (openPositions.length > 0) {
      openPositions.forEach((pos, idx) => {
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

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
