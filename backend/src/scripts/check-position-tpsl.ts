import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPositionTPSL() {
  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761803950733' }
    });

    if (!position) {
      console.log('Position not found');
      return;
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════');
    console.log('POSITION: arb_1_1761803950733 (PIGGYUSDT)');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    console.log('STATUS:', position.status);
    console.log('SYMBOL:', position.symbol);
    console.log('\n--- EXCHANGES ---');
    console.log('PRIMARY:', position.primaryExchange);
    console.log('HEDGE:', position.hedgeExchange);

    console.log('\n--- ENTRY PRICES ---');
    console.log('PRIMARY Entry Price:', position.primaryEntryPrice?.toString());
    console.log('HEDGE Entry Price:', position.hedgeEntryPrice?.toString());

    console.log('\n--- SIDES ---');
    console.log('PRIMARY Side:', position.primarySide);
    console.log('HEDGE Side:', position.hedgeSide);

    console.log('\n--- LEVERAGE ---');
    console.log('PRIMARY Leverage:', position.primaryLeverage);
    console.log('HEDGE Leverage:', position.hedgeLeverage);

    console.log('\n--- STOP LOSS & TAKE PROFIT (SET BY SYSTEM) ---');
    console.log('PRIMARY Stop Loss:', position.primaryStopLoss?.toString() || 'NOT SET');
    console.log('PRIMARY Take Profit:', position.primaryTakeProfit?.toString() || 'NOT SET');
    console.log('HEDGE Stop Loss:', position.hedgeStopLoss?.toString() || 'NOT SET');
    console.log('HEDGE Take Profit:', position.hedgeTakeProfit?.toString() || 'NOT SET');

    console.log('\n--- LIQUIDATION PRICES (CALCULATED) ---');
    console.log('PRIMARY Liquidation:', position.primaryLiquidationPrice?.toString() || 'NOT AVAILABLE');
    console.log('HEDGE Liquidation:', position.hedgeLiquidationPrice?.toString() || 'NOT AVAILABLE');

    console.log('\n--- CURRENT PRICES (LAST UPDATE) ---');
    console.log('PRIMARY Current Price:', position.primaryCurrentPrice?.toString() || 'NOT AVAILABLE');
    console.log('HEDGE Current Price:', position.hedgeCurrentPrice?.toString() || 'NOT AVAILABLE');

    console.log('\n--- TIMESTAMPS ---');
    console.log('Created At:', position.createdAt);
    console.log('Updated At:', position.updatedAt);

    console.log('\n═══════════════════════════════════════════════════════════════════════');

    // Now let's check if the TP/SL was hit
    if (position.primaryEntryPrice && position.primaryStopLoss && position.primaryTakeProfit) {
      const entryPrice = parseFloat(position.primaryEntryPrice.toString());
      const stopLoss = parseFloat(position.primaryStopLoss.toString());
      const takeProfit = parseFloat(position.primaryTakeProfit.toString());
      const currentPrice = position.primaryCurrentPrice ? parseFloat(position.primaryCurrentPrice.toString()) : null;

      console.log('\n--- PRIMARY (BYBIT) ANALYSIS ---');
      console.log(`Entry: ${entryPrice.toFixed(8)}`);
      console.log(`Stop Loss: ${stopLoss.toFixed(8)} (${((stopLoss - entryPrice) / entryPrice * 100).toFixed(2)}% from entry)`);
      console.log(`Take Profit: ${takeProfit.toFixed(8)} (${((takeProfit - entryPrice) / entryPrice * 100).toFixed(2)}% from entry)`);
      
      if (currentPrice) {
        console.log(`Current: ${currentPrice.toFixed(8)} (${((currentPrice - entryPrice) / entryPrice * 100).toFixed(2)}% from entry)`);
        
        if (position.primarySide === 'LONG') {
          if (currentPrice <= stopLoss) {
            console.log('\n🔴 STOP LOSS HIT! Price dropped below SL.');
          } else if (currentPrice >= takeProfit) {
            console.log('\n🟢 TAKE PROFIT HIT! Price rose above TP.');
          }
        } else {
          if (currentPrice >= stopLoss) {
            console.log('\n🔴 STOP LOSS HIT! Price rose above SL.');
          } else if (currentPrice <= takeProfit) {
            console.log('\n🟢 TAKE PROFIT HIT! Price dropped below TP.');
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPositionTPSL();
