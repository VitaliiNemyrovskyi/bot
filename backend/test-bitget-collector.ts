/**
 * Test Bitget funding rate collection
 *
 * Usage: npx tsx test-bitget-collector.ts
 */

import { PrismaClient } from '@prisma/client';

async function testBitgetCollection() {
  const prisma = new PrismaClient();

  console.log('Testing Bitget funding collection...\n');

  // Test symbol fetch
  const symbol = 'RIVER/USDT';
  const bitgetSymbol = symbol.replace('/', '');

  try {
    console.log(`Fetching funding for ${symbol} (Bitget format: ${bitgetSymbol})...\n`);

    const response = await fetch('https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ API request failed:', response.status);
      return;
    }

    const data = await response.json();

    if (data.code !== '00000' || !data.data) {
      console.error('❌ API error:', data.msg || 'Unknown error');
      return;
    }

    // Find RIVER symbol
    const fundingInfo = data.data.find((item: any) => item.symbol === bitgetSymbol);

    if (!fundingInfo) {
      console.error(`❌ Symbol ${bitgetSymbol} not found in Bitget response`);
      return;
    }

    console.log('✓ Funding data fetched successfully:');
    console.log('  Symbol:', fundingInfo.symbol);
    console.log('  Funding Rate:', fundingInfo.fundingRate);
    console.log('  Next Update:', fundingInfo.nextUpdate, '→', new Date(parseInt(fundingInfo.nextUpdate)));
    console.log('  Interval:', fundingInfo.fundingRateInterval, 'hours');
    console.log('');

    // Test database upsert
    const fundingRate = parseFloat(fundingInfo.fundingRate || '0');
    const nextFundingTime = new Date(parseInt(fundingInfo.nextUpdate || '0'));
    const intervalHours = parseInt(fundingInfo.fundingRateInterval || '8');

    console.log('Testing database upsert...');

    const result = await prisma.publicFundingRate.upsert({
      where: {
        symbol_exchange: {
          symbol,
          exchange: 'BITGET',
        },
      },
      update: {
        fundingRate,
        nextFundingTime,
        fundingInterval: intervalHours,
        timestamp: new Date(),
      },
      create: {
        symbol,
        exchange: 'BITGET',
        fundingRate,
        nextFundingTime,
        fundingInterval: intervalHours,
      },
    });

    console.log('✓ Database record created/updated:');
    console.log('  ID:', result.id);
    console.log('  Symbol:', result.symbol);
    console.log('  Exchange:', result.exchange);
    console.log('  Funding Rate:', result.fundingRate.toString());
    console.log('  Next Funding Time:', result.nextFundingTime);
    console.log('  Funding Interval:', result.fundingInterval);
    console.log('');

    // Verify we can read it back
    console.log('Verifying database read...');

    const stored = await prisma.publicFundingRate.findUnique({
      where: {
        symbol_exchange: {
          symbol,
          exchange: 'BITGET',
        },
      },
    });

    if (stored) {
      console.log('✓ Successfully read from database:');
      console.log('  Funding Rate:', stored.fundingRate.toString());
      console.log('  Next Funding Time:', stored.nextFundingTime);
      console.log('  Funding Interval:', stored.fundingInterval);
    } else {
      console.error('❌ Failed to read from database');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testBitgetCollection();
