import prisma from './src/lib/prisma';

async function main() {
  const position = await prisma.graduatedEntryPosition.findUnique({
    where: { positionId: 'arb_1_1762721894118' }
  });

  if (!position) {
    console.log('Position not found');
    return;
  }

  console.log('\n=== POSITION STATUS ===');
  console.log(`Status: ${position.status}`);
  console.log(`\nEntry Prices:`);
  console.log(`  Primary (${position.primaryExchange}): $${position.primaryEntryPrice}`);
  console.log(`  Hedge (${position.hedgeExchange}): $${position.hedgeEntryPrice}`);
  console.log(`\nFilled Quantities:`);
  console.log(`  Primary: ${position.primaryFilledQty}`);
  console.log(`  Hedge: ${position.hedgeFilledQty}`);
  console.log(`\nTP/SL Settings:`);
  console.log(`  Primary TP: $${position.primaryTakeProfit || 'Not set'}`);
  console.log(`  Primary SL: $${position.primaryStopLoss || 'Not set'}`);
  console.log(`  Hedge TP: $${position.hedgeTakeProfit || 'Not set'}`);
  console.log(`  Hedge SL: $${position.hedgeStopLoss || 'Not set'}`);

  if (position.errorMessage) {
    console.log(`\nError: ${position.errorMessage}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
