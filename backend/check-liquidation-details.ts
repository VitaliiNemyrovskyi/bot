/**
 * Check liquidation details for AVNTUSDT position
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761256044784' }
    });

    if (!position) {
      console.log('Position not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('LIQUIDATION DETAILS FOR AVNTUSDT POSITION');
    console.log('='.repeat(80));
    console.log('');

    console.log('POSITION INFO:');
    console.log(`  Position ID: ${position.positionId}`);
    console.log(`  Status: ${position.status}`);
    console.log(`  Error Message: ${position.errorMessage || 'None'}`);
    console.log(`  Created: ${position.createdAt.toISOString()}`);
    console.log(`  Started: ${position.startedAt.toISOString()}`);
    console.log(`  Completed: ${position.completedAt ? position.completedAt.toISOString() : 'Still active'}`);
    console.log('');

    console.log('PRIMARY (BYBIT) - LONG 3x:');
    console.log(`  Entry Price: ${position.primaryEntryPrice || 'Not recorded'}`);
    console.log(`  Current Price: ${position.primaryCurrentPrice || 'N/A'}`);
    console.log(`  Liquidation Price: ${position.primaryLiquidationPrice || 'Not recorded'}`);
    console.log(`  Proximity Ratio: ${position.primaryProximityRatio || 'Not recorded'}`);
    console.log(`  In Danger: ${position.primaryInDanger}`);
    console.log(`  Quantity: ${position.primaryQuantity}`);
    console.log(`  Filled: ${position.primaryFilledQty}`);
    console.log(`  Leverage: ${position.primaryLeverage}x`);
    console.log('');

    console.log('HEDGE (GATEIO) - SHORT 3x:');
    console.log(`  Entry Price: ${position.hedgeEntryPrice || 'Not recorded'}`);
    console.log(`  Current Price: ${position.hedgeCurrentPrice || 'N/A'}`);
    console.log(`  Liquidation Price: ${position.hedgeLiquidationPrice || 'Not recorded'}`);
    console.log(`  Proximity Ratio: ${position.hedgeProximityRatio || 'Not recorded'}`);
    console.log(`  In Danger: ${position.hedgeInDanger}`);
    console.log(`  Quantity: ${position.hedgeQuantity}`);
    console.log(`  Filled: ${position.hedgeFilledQty}`);
    console.log(`  Leverage: ${position.hedgeLeverage}x`);
    console.log('');

    console.log('FINANCIAL SUMMARY:');
    console.log(`  Primary Funding: ${position.primaryTotalFundingEarned} USDT`);
    console.log(`  Primary Fees: ${position.primaryTradingFees} USDT`);
    console.log(`  Hedge Funding: ${position.hedgeTotalFundingEarned} USDT`);
    console.log(`  Hedge Fees: ${position.hedgeTradingFees} USDT`);
    console.log(`  Gross Profit: ${position.grossProfit} USDT`);
    console.log(`  Net Profit: ${position.netProfit} USDT`);
    console.log('');

    console.log('LIQUIDATION MONITORING:');
    console.log(`  Last Check: ${position.lastLiquidationCheck ? position.lastLiquidationCheck.toISOString() : 'Never'}`);
    console.log(`  Alert Sent: ${position.liquidationAlertSent}`);
    console.log('');

    console.log('ANALYSIS:');
    if (position.primaryEntryPrice && position.primaryCurrentPrice) {
      const priceChange = ((position.primaryCurrentPrice - position.primaryEntryPrice) / position.primaryEntryPrice) * 100;
      console.log(`  Price change from entry: ${priceChange.toFixed(2)}%`);
      console.log(`  With 3x leverage, position change: ${(priceChange * 3).toFixed(2)}%`);

      if (Math.abs(priceChange * 3) > 100) {
        console.log(`  ⚠️ This exceeds 100% of margin - liquidation expected!`);
      }
    } else {
      console.log(`  ⚠️ Entry price not recorded - cannot calculate price change`);
    }

    console.log('');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
