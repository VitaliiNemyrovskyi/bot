/**
 * Test BingX income history API with different parameters
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

    // Test different combinations of parameters
    const symbolVariants = ['FUSDT', 'F-USDT'];
    const incomeTypes = ['FUNDING_FEE', 'COMMISSION', 'TRADING_FEE'];

    // Try without time filter first
    console.log('=== TEST 1: No time filter, no symbol ===');
    try {
      const result = await bingx.getIncomeHistory({
        incomeType: 'FUNDING_FEE',
        limit: 10
      });
      console.log(`Records found: ${result.data?.length || 0}`);
      if (result.data && result.data.length > 0) {
        console.log('Sample records:', result.data.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error:', error.message);
    }

    // Try with each symbol variant
    for (const symbol of symbolVariants) {
      console.log(`\n=== TEST 2: Symbol ${symbol}, no time filter ===`);
      try {
        const result = await bingx.getIncomeHistory({
          symbol,
          incomeType: 'FUNDING_FEE',
          limit: 10
        });
        console.log(`Records found: ${result.data?.length || 0}`);
        if (result.data && result.data.length > 0) {
          console.log('Found records:', result.data);
        }
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }

    // Try with startTime = 24 hours ago
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    console.log(`\n=== TEST 3: Last 24 hours (startTime: ${new Date(oneDayAgo).toISOString()}) ===`);
    for (const symbol of symbolVariants) {
      try {
        const result = await bingx.getIncomeHistory({
          symbol,
          incomeType: 'FUNDING_FEE',
          startTime: oneDayAgo,
          limit: 10
        });
        console.log(`Symbol ${symbol}: ${result.data?.length || 0} records`);
        if (result.data && result.data.length > 0) {
          console.log('Records:', result.data);
        }
      } catch (error: any) {
        console.error(`Symbol ${symbol} error:`, error.message);
      }
    }

    // Try all income types
    console.log(`\n=== TEST 4: All income types for FUSDT ===`);
    for (const incomeType of incomeTypes) {
      try {
        const result = await bingx.getIncomeHistory({
          symbol: 'FUSDT',
          incomeType,
          startTime: oneDayAgo,
          limit: 10
        });
        console.log(`${incomeType}: ${result.data?.length || 0} records`);
        if (result.data && result.data.length > 0) {
          console.log('Sample:', result.data[0]);
        }
      } catch (error: any) {
        console.error(`${incomeType} error:`, error.message);
      }
    }

    console.log(`\n=== TEST 5: All income types for F-USDT ===`);
    for (const incomeType of incomeTypes) {
      try {
        const result = await bingx.getIncomeHistory({
          symbol: 'F-USDT',
          incomeType,
          startTime: oneDayAgo,
          limit: 10
        });
        console.log(`${incomeType}: ${result.data?.length || 0} records`);
        if (result.data && result.data.length > 0) {
          console.log('Sample:', result.data[0]);
        }
      } catch (error: any) {
        console.error(`${incomeType} error:`, error.message);
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
