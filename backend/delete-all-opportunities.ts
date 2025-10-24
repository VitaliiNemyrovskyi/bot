/**
 * Delete ALL triangular arbitrage opportunities
 */

import prisma from './src/lib/prisma';

async function deleteAll() {
  console.log('🗑️  Deleting ALL opportunities from database...\n');

  try {
    const result = await prisma.triangularArbitrageOpportunity.deleteMany({});
    console.log(`✅ Deleted ${result.count} opportunities`);
    console.log('✨ Database is now completely clean!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAll();
