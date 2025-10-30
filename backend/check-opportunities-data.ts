/**
 * Check what data is being stored in triangular_arbitrage_opportunities table
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching recent opportunities from database...\n');

    const opportunities = await prisma.triangularArbitrageOpportunity.findMany({
      orderBy: { detectedAt: 'desc' },
      take: 10,
    });

    if (opportunities.length === 0) {
      console.log('No opportunities found in database');
      return;
    }

    console.log(`Found ${opportunities.length} opportunities:\n`);

    opportunities.forEach((opp: typeof opportunities[number], index: number) => {
      console.log(`\n=== Opportunity ${index + 1} ===`);
      console.log(`ID: ${opp.id}`);
      console.log(`Exchange: ${opp.exchange}`);
      console.log(`Triangle: ${opp.symbol1} -> ${opp.symbol2} -> ${opp.symbol3}`);
      console.log(`Assets: ${opp.baseAsset} / ${opp.quoteAsset} / ${opp.bridgeAsset}`);
      console.log(`Prices: ${opp.price1} / ${opp.price2} / ${opp.price3}`);
      console.log(`Theoretical Profit: ${opp.theoreticalProfit}%`);
      console.log(`Profit After Fees: ${opp.profitAfterFees}%`);
      console.log(`Detected At: ${opp.detectedAt}`);
      console.log(`Expires At: ${opp.expiresAt}`);
      console.log(`Was Executed: ${opp.wasExecuted}`);
    });

    console.log('\n\n=== Field Value Check ===');
    const firstOpp = opportunities[0];
    console.log('Field types and values for first opportunity:');
    console.log(`- symbol1: ${typeof firstOpp.symbol1} = "${firstOpp.symbol1}"`);
    console.log(`- symbol2: ${typeof firstOpp.symbol2} = "${firstOpp.symbol2}"`);
    console.log(`- symbol3: ${typeof firstOpp.symbol3} = "${firstOpp.symbol3}"`);
    console.log(`- baseAsset: ${typeof firstOpp.baseAsset} = "${firstOpp.baseAsset}"`);
    console.log(`- quoteAsset: ${typeof firstOpp.quoteAsset} = "${firstOpp.quoteAsset}"`);
    console.log(`- bridgeAsset: ${typeof firstOpp.bridgeAsset} = "${firstOpp.bridgeAsset}"`);
    console.log(`- price1: ${typeof firstOpp.price1} = ${firstOpp.price1}`);
    console.log(`- price2: ${typeof firstOpp.price2} = ${firstOpp.price2}`);
    console.log(`- price3: ${typeof firstOpp.price3} = ${firstOpp.price3}`);
    console.log(`- theoreticalProfit: ${typeof firstOpp.theoreticalProfit} = ${firstOpp.theoreticalProfit}`);
    console.log(`- profitAfterFees: ${typeof firstOpp.profitAfterFees} = ${firstOpp.profitAfterFees}`);

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
