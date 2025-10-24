/**
 * Check what opportunities are in the database
 */

import prisma from './src/lib/prisma';

async function checkDB() {
  console.log('📊 Checking database opportunities...\n');

  try {
    // Count by exchange
    const allOpportunities = await prisma.triangularArbitrageOpportunity.findMany({
      select: {
        id: true,
        exchange: true,
        symbol1: true,
        symbol2: true,
        symbol3: true,
        baseAsset: true,
        bridgeAsset: true,
        quoteAsset: true,
        theoreticalProfit: true,
        detectedAt: true,
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: 10,
    });

    console.log(`Total opportunities in DB: ${allOpportunities.length}\n`);

    if (allOpportunities.length > 0) {
      console.log('Recent opportunities:');
      allOpportunities.forEach((opp, i) => {
        console.log(`${i + 1}. [${opp.exchange}] ${opp.symbol1} → ${opp.symbol2} → ${opp.symbol3}`);
        console.log(`   Assets: ${opp.baseAsset} → ${opp.bridgeAsset} → ${opp.quoteAsset}`);
        console.log(`   Profit: ${opp.theoreticalProfit}%`);
        console.log(`   Detected: ${opp.detectedAt}\n`);
      });
    }

    // Count by exchange
    const byExchange = await prisma.triangularArbitrageOpportunity.groupBy({
      by: ['exchange'],
      _count: {
        id: true,
      },
    });

    console.log('\nOpportunities by exchange:');
    byExchange.forEach((group) => {
      console.log(`  ${group.exchange}: ${group._count.id}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
