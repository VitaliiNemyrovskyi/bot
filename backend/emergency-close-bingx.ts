import prisma from './src/lib/prisma';
import { BingXService } from './src/lib/bingx';
import { EncryptionService } from './src/lib/encryption';

async function closePosition() {
  console.log('🚨 EMERGENCY: Closing unhedged BingX position AIA-USDT...\n');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }

  const bingxCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'BINGX' },
  });

  if (!bingxCreds || !bingxCreds.apiKey || !bingxCreds.apiSecret) {
    console.log('❌ No BingX credentials found');
    return;
  }

  try {
    const apiKey = EncryptionService.decrypt(bingxCreds.apiKey);
    const apiSecret = EncryptionService.decrypt(bingxCreds.apiSecret);
    const bingx = new BingXService({ apiKey, apiSecret });

    // Check current position
    console.log('📊 Checking current position...');
    const positions = await bingx.getPositions();
    const aiaPosition = positions.find((p: any) =>
      (p.symbol === 'AIA-USDT' || p.symbol === 'AIAUSDT') && parseFloat(p.positionAmt) !== 0
    );

    if (!aiaPosition) {
      console.log('✓ No open position found - already closed');
      return;
    }

    const size = Math.abs(parseFloat(aiaPosition.positionAmt));
    const side = parseFloat(aiaPosition.positionAmt) > 0 ? 'LONG' : 'SHORT';

    console.log(`\n📍 Current Position:`);
    console.log(`  Symbol: ${aiaPosition.symbol}`);
    console.log(`  Side: ${side}`);
    console.log(`  Size: ${size}`);
    console.log(`  Entry: $${aiaPosition.avgPrice}`);
    console.log(`  Mark: $${aiaPosition.markPrice || 'N/A'}`);
    console.log(`  Unrealized PnL: ${aiaPosition.unrealizedProfit || 'N/A'}\n`);

    // Close position
    console.log('🔴 Closing position...');
    const result = await bingx.closePosition(aiaPosition.symbol, side);

    console.log('✅ Position closed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

    // Update database
    console.log('\n💾 Updating database...');
    await prisma.graduatedEntryPosition.updateMany({
      where: {
        symbol: 'AIAUSDT',
        status: { in: ['ACTIVE', 'ERROR'] },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        errorMessage: 'Emergency close: Bybit position closed (likely SL triggered), BingX manually closed',
      },
    });

    console.log('✓ Database updated\n');
    console.log('🎯 Emergency close completed successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  await prisma.$disconnect();
}

closePosition().catch(console.error);
