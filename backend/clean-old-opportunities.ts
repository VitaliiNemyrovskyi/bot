/**
 * Clean up old triangular arbitrage opportunities
 */

import prisma from './src/lib/prisma';

async function cleanupOldOpportunities() {
  console.log('🧹 Cleaning up old opportunities...\n');

  try {
    // Delete all non-BINANCE opportunities
    const deleteResult = await prisma.triangularArbitrageOpportunity.deleteMany({
      where: {
        exchange: {
          not: 'BINANCE',
        },
      },
    });

    console.log(`✅ Deleted ${deleteResult.count} old opportunities from other exchanges\n`);

    // Show remaining count
    const remaining = await prisma.triangularArbitrageOpportunity.count({
      where: {
        exchange: 'BINANCE',
      },
    });

    console.log(`📊 Remaining BINANCE opportunities: ${remaining}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldOpportunities();
