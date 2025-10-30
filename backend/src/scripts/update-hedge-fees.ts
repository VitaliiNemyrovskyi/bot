import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHedgeFees() {
  try {
    // Get the position
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' }
    });

    if (!position) {
      console.log('Position not found');
      return;
    }

    console.log('\n=== Position Before Update ===');
    console.log('Position ID:', position.positionId);
    console.log('Symbol:', position.symbol);
    console.log('Hedge Exchange:', position.hedgeExchange);
    console.log('Hedge Entry Price:', position.hedgeEntryPrice?.toString());
    console.log('Hedge Filled Qty (from DB):', position.hedgeFilledQty?.toString());
    console.log('Hedge Quantity (planned):', position.hedgeQuantity?.toString());
    console.log('Current Hedge Trading Fees:', position.hedgeTradingFees?.toString() || '0');
    console.log('Current Primary Trading Fees:', position.primaryTradingFees?.toString() || '0');

    // Calculate hedge trading fees
    const hedgeEntryPrice = position.hedgeEntryPrice ? parseFloat(position.hedgeEntryPrice.toString()) : null;
    // Use hedgeFilledQty if available, otherwise fall back to hedgeQuantity (for old positions)
    const hedgeFilledQty = position.hedgeFilledQty
      ? parseFloat(position.hedgeFilledQty.toString())
      : (position.hedgeQuantity ? parseFloat(position.hedgeQuantity.toString()) : null);
    const hedgeFeeRate = 0.0005; // BingX taker fee: 0.05%

    if (!hedgeEntryPrice || !hedgeFilledQty) {
      console.log('\nCannot calculate fees - missing entry price or quantity');
      console.log('Hedge Entry Price:', hedgeEntryPrice);
      console.log('Hedge Filled Qty:', position.hedgeFilledQty?.toString());
      console.log('Hedge Quantity (fallback):', position.hedgeQuantity?.toString());
      return;
    }

    const calculatedHedgeFee = hedgeFilledQty * hedgeEntryPrice * hedgeFeeRate;

    console.log('\n=== Fee Calculation ===');
    console.log('Hedge Entry Price:', hedgeEntryPrice);
    console.log('Hedge Filled Quantity:', hedgeFilledQty);
    console.log('Hedge Fee Rate:', hedgeFeeRate, '(0.05%)');
    console.log('Formula: quantity * price * feeRate');
    console.log(`Calculation: ${hedgeFilledQty} * ${hedgeEntryPrice} * ${hedgeFeeRate}`);
    console.log('Calculated Hedge Fee:', calculatedHedgeFee.toFixed(8), 'USDT');

    // Update the position
    const updated = await prisma.graduatedEntryPosition.update({
      where: { positionId: 'arb_1_1761815638197' },
      data: {
        hedgeTradingFees: calculatedHedgeFee
      }
    });

    console.log('\n=== Position After Update ===');
    console.log('Updated Hedge Trading Fees:', updated.hedgeTradingFees?.toString());
    console.log('\n✅ Successfully updated hedge trading fees!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHedgeFees();
