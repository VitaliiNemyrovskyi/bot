/**
 * Test BingX trading fees API
 */

import { PrismaClient } from '@prisma/client';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';
import { BingXService } from './src/lib/bingx';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Finding active position...');
    const position = await prisma.graduatedEntryPosition.findFirst({
      where: { positionId: 'arb_1_1760860010874' },
      select: { userId: true, startedAt: true, symbol: true }
    });

    if (!position) {
      console.error('Position not found');
      process.exit(1);
    }

    console.log(`Position: ${position.symbol}, started: ${position.startedAt?.toISOString()}`);

    console.log('\nFetching BingX credentials...');
    const credentials = await ExchangeCredentialsService.getActiveCredentials(position.userId, 'BINGX');

    if (!credentials) {
      console.error('No active BingX credentials found');
      process.exit(1);
    }

    const bingx = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
    });

    await bingx.syncTime();
    console.log('Time synchronized\n');

    const symbolVariants = ['FUSDT', 'F-USDT'];

    // Test TRADING_FEE without startTime
    console.log('=== TEST: TRADING_FEE without startTime ===');
    for (const symbol of symbolVariants) {
      try {
        const result = await bingx.getIncomeHistory({
          symbol,
          incomeType: 'TRADING_FEE',
          limit: 20
        });
        console.log(`Symbol ${symbol}: ${result.data?.length || 0} records`);
        if (result.data && result.data.length > 0) {
          console.log('Found trading fees:', result.data.slice(0, 5));
        }
      } catch (error: any) {
        console.error(`Symbol ${symbol} error:`, error.message);
      }
    }

    // Test TRADING_FEE WITH startTime
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    console.log(`\n=== TEST: TRADING_FEE with startTime (${new Date(oneDayAgo).toISOString()}) ===`);
    for (const symbol of symbolVariants) {
      try {
        const result = await bingx.getIncomeHistory({
          symbol,
          incomeType: 'TRADING_FEE',
          startTime: oneDayAgo,
          limit: 20
        });
        console.log(`Symbol ${symbol}: ${result.data?.length || 0} records`);
        if (result.data && result.data.length > 0) {
          console.log('Found trading fees:', result.data.slice(0, 5));
        }
      } catch (error: any) {
        console.error(`Symbol ${symbol} error:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
