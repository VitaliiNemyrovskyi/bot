/**
 * Test script for funding rate collector
 */

import { getFundingRateCollector } from './src/services/funding-rate-collector.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Funding Rate Collector...\n');

  try {
    // Get collector instance
    const collector = getFundingRateCollector();

    // Start collection (will run once immediately)
    collector.start();

    // Wait for first collection to complete
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

    // Stop collector
    collector.stop();

    // Check database for results
    console.log('\n📊 Checking database...');

    const exchanges = ['BYBIT', 'BINANCE', 'GATEIO', 'OKX', 'KUCOIN', 'BITGET', 'BINGX'];

    for (const exchange of exchanges) {
      const count = await prisma.publicFundingRate.count({
        where: { exchange: exchange as any }
      });

      console.log(`  ${exchange}: ${count} symbols`);

      // Show sample data
      if (count > 0) {
        const samples = await prisma.publicFundingRate.findMany({
          where: { exchange: exchange as any },
          take: 3,
          orderBy: { timestamp: 'desc' }
        });

        samples.forEach(s => {
          const timeUntil = s.nextFundingTime.getTime() - Date.now();
          const minutesUntil = Math.floor(timeUntil / 1000 / 60);
          console.log(`    - ${s.symbol}: ${(s.fundingRate * 100).toFixed(4)}%, next in ${minutesUntil}min`);
        });
      }
    }

    console.log('\n✅ Test completed!');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
