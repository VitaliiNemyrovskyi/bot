import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeLastTrade() {
  const position = await prisma.triangularArbitragePosition.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!position) {
    console.log('No positions found');
    return;
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('          TRIANGULAR ARBITRAGE ANALYSIS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Position ID: ${position.positionId}`);
  console.log(`Status: ${position.status}`);
  console.log(`Exchange: ${position.exchange}`);
  console.log(`Created: ${position.createdAt}`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('INITIAL INVESTMENT');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Entry Quantity: ${position.entryQuantity} USDT`);
  console.log(`Expected Return: ${position.expectedReturnQuantity} USDT`);
  console.log(`Expected Profit: ${position.expectedProfitAmount} USDT (${position.expectedProfitPercent}%)`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('LEG 1 - BUY');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Symbol: ${position.leg1Symbol}`);
  console.log(`Side: ${position.leg1Side}`);
  console.log(`Order Quantity: ${position.leg1Quantity}`);
  console.log(`Filled Quantity: ${position.leg1FilledQty} ${position.quoteAsset}`);
  console.log(`Avg Price: ${position.leg1AvgPrice} USDT per ${position.quoteAsset}`);
  console.log(`Fees: ${position.leg1Fees}`);
  const leg1Cost = (position.leg1FilledQty || 0) * (position.leg1AvgPrice || 0);
  console.log(`Cost: ${leg1Cost.toFixed(2)} USDT`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('LEG 2 - SELL');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Symbol: ${position.leg2Symbol}`);
  console.log(`Side: ${position.leg2Side}`);
  console.log(`Order Quantity: ${position.leg2Quantity}`);
  console.log(`Filled Quantity: ${position.leg2FilledQty} ${position.quoteAsset}`);
  console.log(`Avg Price: ${position.leg2AvgPrice} ${position.bridgeAsset} per ${position.quoteAsset}`);
  console.log(`Fees: ${position.leg2Fees}`);
  const leg2Output = (position.leg2FilledQty || 0) * (position.leg2AvgPrice || 0);
  console.log(`Output: ${leg2Output} ${position.bridgeAsset}`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('LEG 3 - SELL');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Symbol: ${position.leg3Symbol}`);
  console.log(`Side: ${position.leg3Side}`);
  console.log(`Order Quantity: ${position.leg3Quantity}`);
  console.log(`Filled Quantity: ${position.leg3FilledQty} ${position.bridgeAsset}`);
  console.log(`Avg Price: ${position.leg3AvgPrice} USDT per ${position.bridgeAsset}`);
  console.log(`Fees: ${position.leg3Fees}`);
  const leg3Output = (position.leg3FilledQty || 0) * (position.leg3AvgPrice || 0);
  console.log(`Final Output: ${leg3Output.toFixed(2)} USDT`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('FINAL RESULTS');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Final Quantity: ${position.finalQuantity} USDT`);
  console.log(`Actual Profit: ${position.actualProfitAmount} USDT (${position.actualProfitPercent}%)`);
  console.log(`Total Fees: ${position.totalFees}`);
  console.log(`Total Slippage: ${position.totalSlippage}%`);

  console.log('\n───────────────────────────────────────────────────────');
  console.log('LOSS ANALYSIS');
  console.log('───────────────────────────────────────────────────────');

  const expectedProfit = position.expectedProfitAmount || 0;
  const actualProfit = position.actualProfitAmount || 0;
  const lossAmount = expectedProfit - actualProfit;

  console.log(`Expected Profit: ${expectedProfit.toFixed(4)} USDT`);
  console.log(`Actual Profit: ${actualProfit.toFixed(4)} USDT`);
  console.log(`Loss vs Expected: ${lossAmount.toFixed(4)} USDT`);

  const totalFees = (position.leg1Fees || 0) + (position.leg2Fees || 0) + (position.leg3Fees || 0);
  console.log(`\nTotal Trading Fees: ${totalFees} (${((totalFees / (position.entryQuantity || 1)) * 100).toFixed(4)}%)`);
  console.log(`Slippage Impact: ${position.totalSlippage}%`);

  // Calculate individual leg impacts
  console.log('\n───────────────────────────────────────────────────────');
  console.log('LEG-BY-LEG BREAKDOWN');
  console.log('───────────────────────────────────────────────────────');

  console.log(`\nLeg 1 Impact:`);
  console.log(`  Expected to spend: ~${position.entryQuantity} USDT`);
  console.log(`  Actually spent: ${leg1Cost.toFixed(2)} USDT`);
  console.log(`  Difference: ${(leg1Cost - (position.entryQuantity || 0)).toFixed(2)} USDT`);

  console.log(`\nLeg 2 Impact:`);
  console.log(`  Sold ${position.leg2FilledQty} ${position.quoteAsset}`);
  console.log(`  Got ${leg2Output} ${position.bridgeAsset}`);

  console.log(`\nLeg 3 Impact:`);
  console.log(`  Sold ${position.leg3FilledQty} ${position.bridgeAsset}`);
  console.log(`  Got ${leg3Output.toFixed(2)} USDT`);
  console.log(`  Expected to get: ${position.expectedReturnQuantity} USDT`);
  console.log(`  Shortfall: ${((position.expectedReturnQuantity || 0) - leg3Output).toFixed(2)} USDT`);

  if (position.errorMessage) {
    console.log('\n───────────────────────────────────────────────────────');
    console.log('ERROR');
    console.log('───────────────────────────────────────────────────────');
    console.log(position.errorMessage);
  }

  await prisma.$disconnect();
}

analyzeLastTrade();
