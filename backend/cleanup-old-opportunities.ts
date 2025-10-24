/**
 * Cleanup Script: Delete old triangular arbitrage opportunities
 * Run with: npx tsx cleanup-old-opportunities.ts
 */

import prisma from './src/lib/prisma';

async function cleanup() {
  console.log('🧹 Cleaning up old Gate.io opportunities...');

  try {
    // Delete all non-Binance opportunities
    const result = await prisma.triangularArbitrageOpportunity.deleteMany({
      where: {
        exchange: {
          not: 'BINANCE',
        },
      },
    });

    console.log(`✅ Deleted ${result.count} old opportunities from database`);
    console.log('✨ Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
