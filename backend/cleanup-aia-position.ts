/**
 * Cleanup script to remove old AIAUSDT position before testing
 */

import prisma from './src/lib/prisma.js';

async function cleanup() {
  console.log('🧹 Cleaning up old AIAUSDT positions...\n');

  try {
    const result = await prisma.priceArbitragePosition.deleteMany({
      where: {
        symbol: 'AIAUSDT',
        primaryExchange: 'GATEIO',
        hedgeExchange: 'BINGX',
      },
    });

    console.log(`✅ Deleted ${result.count} position(s)`);
    console.log('\nYou can now test the auto-detection by visiting:');
    console.log('http://localhost:4200/arbitrage/chart/AIAUSDT/GATEIO/BINGX/combined\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
