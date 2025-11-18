import prisma from '../lib/prisma';

async function checkSymbolFormat() {
  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' },
      select: {
        positionId: true,
        symbol: true,
        primaryExchange: true,
        hedgeExchange: true,
        primaryLastFundingPaid: true,
        hedgeLastFundingPaid: true,
        lastFundingUpdate: true,
        primaryTotalFundingEarned: true,
        hedgeTotalFundingEarned: true,
      }
    });

    if (!position) {
      console.log('Position not found');
      return;
    }

    console.log('\n=== Position Details ===');
    console.log(`Position ID: ${position.positionId}`);
    console.log(`Symbol: "${position.symbol}"`);
    console.log(`Primary Exchange: ${position.primaryExchange}`);
    console.log(`Hedge Exchange: ${position.hedgeExchange}`);

    console.log('\n=== Primary (Bybit) Funding ===');
    console.log(`Last Funding Paid: ${position.primaryLastFundingPaid || 0} USDT`);
    console.log(`Last Funding Update: ${position.lastFundingUpdate?.toLocaleString() || 'N/A'}`);
    console.log(`Total Funding Earned: ${position.primaryTotalFundingEarned || 0} USDT`);

    console.log('\n=== Hedge (BingX) Funding ===');
    console.log(`Last Funding Paid: ${position.hedgeLastFundingPaid || 0} USDT`);
    console.log(`Last Funding Update: ${position.lastFundingUpdate?.toLocaleString() || 'N/A'}`);
    console.log(`Total Funding Earned: ${position.hedgeTotalFundingEarned || 0} USDT`);

    console.log('\n=== Symbol Format Analysis ===');
    console.log(`Original symbol: "${position.symbol}"`);
    console.log(`Has hyphen: ${position.symbol.includes('-')}`);
    console.log(`Length: ${position.symbol.length}`);

    // Show what funding tracker would try
    const symbolVariants = [
      position.symbol, // Original
      position.symbol.replace('-', ''), // Remove hyphen
      position.symbol.includes('-') ? position.symbol : `${position.symbol.slice(0, -4)}-${position.symbol.slice(-4)}`, // Add hyphen
    ];
    const uniqueSymbols = [...new Set(symbolVariants)];

    console.log('\nFunding tracker would try these variants:');
    uniqueSymbols.forEach((s, i) => {
      console.log(`  [${i + 1}] "${s}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSymbolFormat();
