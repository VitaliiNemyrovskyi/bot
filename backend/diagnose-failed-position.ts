/**
 * Diagnostic script for failed triangular arbitrage position
 * Analyzes what went wrong with execution
 */

import prisma from './src/lib/prisma';

async function diagnosePosition(positionId: string) {
  console.log(`\n=== Diagnosing Position: ${positionId} ===\n`);

  const position = await prisma.triangularArbitragePosition.findUnique({
    where: { positionId },
  });

  if (!position) {
    console.error('Position not found!');
    return;
  }

  console.log('Basic Info:');
  console.log('  Exchange:', position.exchange);
  console.log('  Status:', position.status);
  console.log('  Error:', position.errorMessage);
  console.log('  Entry Quantity:', position.entryQuantity, 'USDT');
  console.log('  Expected Profit:', position.expectedProfitPercent.toFixed(4) + '%');
  console.log('');

  console.log('Triangle Configuration:');
  console.log('  Symbol 1:', position.symbol1);
  console.log('  Symbol 2:', position.symbol2);
  console.log('  Symbol 3:', position.symbol3);
  console.log('  Base Asset:', position.baseAsset);
  console.log('  Quote Asset:', position.quoteAsset);
  console.log('  Bridge Asset:', position.bridgeAsset);
  console.log('');

  // Analyze each leg
  console.log('Leg Execution Details:');
  console.log('');

  if (position.leg1ExecutedAt) {
    console.log('Leg 1: ✓ COMPLETED');
    console.log('  Symbol:', position.leg1Symbol);
    console.log('  Side:', position.leg1Side);
    console.log('  Order ID:', position.leg1OrderId);
    console.log('  Quantity:', position.leg1Quantity);
    console.log('  Filled Qty:', position.leg1FilledQty);
    console.log('  Avg Price:', position.leg1AvgPrice);
    console.log('  Fees:', position.leg1Fees);

    // Calculate actual output
    let leg1Output: number;
    if (position.leg1Side === 'Buy') {
      leg1Output = position.leg1FilledQty; // BUY: we got filledQty of base currency
    } else {
      leg1Output = position.leg1FilledQty * position.leg1AvgPrice; // SELL: we got (filledQty * price) of quote currency
    }
    console.log('  → Output for Leg 2:', leg1Output);
    console.log('');
  } else {
    console.log('Leg 1: ✗ NOT EXECUTED');
    console.log('');
  }

  if (position.leg2ExecutedAt) {
    console.log('Leg 2: ✓ COMPLETED');
    console.log('  Symbol:', position.leg2Symbol);
    console.log('  Side:', position.leg2Side);
    console.log('  Order ID:', position.leg2OrderId);
    console.log('  Quantity:', position.leg2Quantity);
    console.log('  Filled Qty:', position.leg2FilledQty);
    console.log('  Avg Price:', position.leg2AvgPrice);
    console.log('  Fees:', position.leg2Fees);

    // Calculate actual output
    let leg2Output: number;
    if (position.leg2Side === 'Buy') {
      leg2Output = position.leg2FilledQty; // BUY: we got filledQty of base currency
    } else {
      leg2Output = position.leg2FilledQty * position.leg2AvgPrice; // SELL: we got (filledQty * price) of quote currency
    }
    console.log('  → Output for Leg 3:', leg2Output);
    console.log('');
  } else {
    console.log('Leg 2: ✗ NOT EXECUTED');
    console.log('');
  }

  if (position.leg3ExecutedAt) {
    console.log('Leg 3: ✓ COMPLETED');
    console.log('  Symbol:', position.leg3Symbol);
    console.log('  Side:', position.leg3Side);
    console.log('  Order ID:', position.leg3OrderId);
    console.log('  Quantity:', position.leg3Quantity);
    console.log('  Filled Qty:', position.leg3FilledQty);
    console.log('  Avg Price:', position.leg3AvgPrice);
    console.log('  Fees:', position.leg3Fees);
    console.log('  → Final Output:', position.finalQuantity);
    console.log('');
  } else {
    console.log('Leg 3: ✗ FAILED');
    console.log('  Expected Symbol:', position.symbol3);
    console.log('');
  }

  // Analyze why Leg 3 might have failed
  if (!position.leg3ExecutedAt && position.leg2ExecutedAt) {
    console.log('=== Analyzing Leg 3 Failure ===');
    console.log('');

    // Calculate what Leg 3 needed
    let leg2Output: number;
    if (position.leg2Side === 'Buy') {
      leg2Output = position.leg2FilledQty;
    } else {
      leg2Output = position.leg2FilledQty * position.leg2AvgPrice;
    }

    console.log('Available for Leg 3:', leg2Output);
    console.log('Leg 3 Symbol:', position.symbol3);

    // Parse symbol to understand what currency we needed
    const symbol3 = position.symbol3;
    let baseAsset3, quoteAsset3;

    if (symbol3.includes('/')) {
      [baseAsset3, quoteAsset3] = symbol3.split('/');
    } else {
      // Try to parse Gate.io format
      const commonQuotes = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];
      quoteAsset3 = commonQuotes.find(q => symbol3.endsWith(q)) || 'USDT';
      baseAsset3 = symbol3.replace(quoteAsset3, '');
    }

    console.log('Leg 3 would have:', position.leg3Side, baseAsset3 + '/' + quoteAsset3);

    if (position.leg3Side === 'Buy') {
      console.log('→ Needed:', quoteAsset3, '(to buy', baseAsset3 + ')');
      console.log('→ Had:', leg2Output, quoteAsset3);
    } else {
      console.log('→ Needed:', baseAsset3, '(to sell for', quoteAsset3 + ')');
      console.log('→ Had:', leg2Output, baseAsset3);
    }
    console.log('');

    // Calculate losses from slippage/fees
    if (position.leg1ExecutedAt && position.leg2ExecutedAt) {
      console.log('=== Loss Analysis ===');

      let totalLoss = 0;

      // Leg 1 fees
      console.log('Leg 1 Fees:', position.leg1Fees);
      totalLoss += position.leg1Fees;

      // Leg 2 fees
      console.log('Leg 2 Fees:', position.leg2Fees);
      totalLoss += position.leg2Fees;

      // Slippage impact
      const leg1Slippage = position.leg1Slippage || 0;
      const leg2Slippage = position.leg2Slippage || 0;
      console.log('Leg 1 Slippage:', leg1Slippage.toFixed(4) + '%');
      console.log('Leg 2 Slippage:', leg2Slippage.toFixed(4) + '%');

      console.log('Total Fees Lost:', totalLoss);
      console.log('');

      // Calculate percentage loss
      const percentageLoss = (totalLoss / position.entryQuantity) * 100;
      console.log('Percentage Loss from Fees:', percentageLoss.toFixed(4) + '%');
      console.log('');
    }
  }

  console.log('=== Timestamps ===');
  console.log('Opportunity Detected:', position.opportunityDetectedAt);
  console.log('Execution Started:', position.executionStartedAt);
  console.log('Leg 1 Executed:', position.leg1ExecutedAt);
  console.log('Leg 2 Executed:', position.leg2ExecutedAt);
  console.log('Leg 3 Executed:', position.leg3ExecutedAt || 'N/A');
  console.log('');

  await prisma.$disconnect();
}

// Run diagnostic
const positionId = process.argv[2] || 'tri_arb_1761170024227';
diagnosePosition(positionId);
