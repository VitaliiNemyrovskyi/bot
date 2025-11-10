import prisma from './src/lib/prisma';
import { BybitService } from './src/lib/bybit';
import { BingXService } from './src/lib/bingx';
import { EncryptionService } from './src/lib/encryption';

async function checkPositions() {
  console.log('🔍 Checking positions on exchanges for AIAUSDT...\n');

  // Get user and credentials
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }

  const bybitCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'BYBIT' },
  });

  const bingxCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'BINGX' },
  });

  // Check Bybit
  if (bybitCreds && bybitCreds.apiKey && bybitCreds.apiSecret) {
    console.log('=== BYBIT POSITIONS ===');
    try {
      const apiKey = EncryptionService.decrypt(bybitCreds.apiKey);
      const apiSecret = EncryptionService.decrypt(bybitCreds.apiSecret);
      const bybit = new BybitService({ apiKey, apiSecret });

      const positions = await bybit.getPositions('linear', 'AIAUSDT');
      const activePositions = positions.filter((p: any) => parseFloat(p.size) > 0);

      if (activePositions.length === 0) {
        console.log('❌ No active AIAUSDT positions on Bybit\n');
      } else {
        activePositions.forEach((p: any) => {
          console.log(`✓ ${p.symbol} ${p.side}`);
          console.log(`  Size: ${p.size}`);
          console.log(`  Entry Price: $${p.avgPrice || p.entryPrice}`);
          console.log(`  Mark Price: $${p.markPrice}`);
          console.log(`  Unrealized PnL: ${p.unrealisedPnl}`);
          console.log(`  Take Profit: ${p.takeProfit || 'Not set'}`);
          console.log(`  Stop Loss: ${p.stopLoss || 'Not set'}`);
          console.log('');
        });
      }
    } catch (error: any) {
      console.log(`❌ Error checking Bybit: ${error.message}\n`);
    }
  }

  // Check BingX
  if (bingxCreds && bingxCreds.apiKey && bingxCreds.apiSecret) {
    console.log('=== BINGX POSITIONS ===');
    try {
      const apiKey = EncryptionService.decrypt(bingxCreds.apiKey);
      const apiSecret = EncryptionService.decrypt(bingxCreds.apiSecret);
      const bingx = new BingXService({ apiKey, apiSecret });

      const positions = await bingx.getPositions();
      const activePositions = positions.filter((p: any) =>
        parseFloat(p.positionAmt) !== 0 && (p.symbol === 'AIA-USDT' || p.symbol === 'AIAUSDT')
      );

      if (activePositions.length === 0) {
        console.log('❌ No active AIA-USDT positions on BingX\n');
      } else {
        activePositions.forEach((p: any) => {
          const size = Math.abs(parseFloat(p.positionAmt));
          const side = parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT';
          console.log(`✓ ${p.symbol} ${side}`);
          console.log(`  Size: ${size}`);
          console.log(`  Entry Price: $${p.avgPrice}`);
          console.log(`  Mark Price: $${p.markPrice || 'N/A'}`);
          console.log(`  Unrealized PnL: ${p.unrealizedProfit || 'N/A'}`);
          console.log('');
        });
      }
    } catch (error: any) {
      console.log(`❌ Error checking BingX: ${error.message}\n`);
    }
  }

  // Check database position
  console.log('=== DATABASE POSITION ===');
  const dbPosition = await prisma.graduatedEntryPosition.findUnique({
    where: { positionId: 'arb_1_1762721894118' },
  });

  if (dbPosition) {
    console.log(`Status: ${dbPosition.status}`);
    console.log(`Primary (${dbPosition.primaryExchange}): ${dbPosition.primaryFilledQty} @ $${dbPosition.primaryEntryPrice}`);
    console.log(`Hedge (${dbPosition.hedgeExchange}): ${dbPosition.hedgeFilledQty} @ $${dbPosition.hedgeEntryPrice}`);
    console.log(`Created: ${dbPosition.createdAt}`);
    console.log(`Completed: ${dbPosition.completedAt || 'Not completed'}`);
    if (dbPosition.errorMessage) {
      console.log(`Error: ${dbPosition.errorMessage}`);
    }
  }

  await prisma.$disconnect();
}

checkPositions().catch(console.error);
