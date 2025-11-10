import prisma from './src/lib/prisma';
import { BybitService } from './src/lib/bybit';
import { EncryptionService } from './src/lib/encryption';

async function checkCurrentState() {
  console.log('📊 Checking current state of AIA positions...\n');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }

  // Check Bybit positions
  const bybitCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'BYBIT' },
  });

  if (bybitCreds && bybitCreds.apiKey && bybitCreds.apiSecret) {
    try {
      const apiKey = EncryptionService.decrypt(bybitCreds.apiKey);
      const apiSecret = EncryptionService.decrypt(bybitCreds.apiSecret);
      const bybit = new BybitService({ apiKey, apiSecret });

      console.log('=== BYBIT POSITIONS ===');
      const positions = await bybit.getPositions('linear', 'AIAUSDT');
      const aiaPosition = positions.find((p: any) =>
        p.symbol === 'AIAUSDT' && parseFloat(p.size) > 0
      );

      if (aiaPosition) {
        const side = aiaPosition.side === 'Buy' ? 'LONG' : 'SHORT';
        console.log(`✓ AIAUSDT: ${side} ${aiaPosition.size} @ $${aiaPosition.avgPrice}`);
        console.log(`  Mark Price: $${aiaPosition.markPrice || 'N/A'}`);
        console.log(`  Leverage: ${aiaPosition.leverage || 'N/A'}x`);
        console.log(`  Unrealized PnL: ${aiaPosition.unrealisedPnl || 'N/A'}\n`);
      } else {
        console.log('✓ No AIAUSDT positions\n');
      }
    } catch (error: any) {
      console.error('❌ Bybit Error:', error.message);
    }
  }

  // Check Price Arbitrage positions in DB
  console.log('=== PRICE ARBITRAGE POSITIONS (DB) ===');
  const priceArbPositions = await prisma.priceArbitragePosition.findMany({
    where: {
      symbol: 'AIAUSDT',
      status: { not: 'COMPLETED' },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (priceArbPositions.length === 0) {
    console.log('✓ No active Price Arbitrage positions\n');
  } else {
    priceArbPositions.forEach((pos, idx) => {
      console.log(`${idx + 1}. Position ID: ${pos.id.substring(0, 12)}...`);
      console.log(`   Status: ${pos.status}`);
      console.log(`   Primary: ${pos.primaryExchange} ${pos.primaryQuantity} @ $${pos.entryPrimaryPrice || 'N/A'}`);
      console.log(`   Hedge: ${pos.hedgeExchange} ${pos.hedgeQuantity} @ $${pos.entryHedgePrice || 'N/A'}`);
      console.log(`   Spread: ${pos.entrySpreadPercent}%`);
      console.log(`   Created: ${pos.createdAt}`);
      if (pos.openedAt) console.log(`   Opened: ${pos.openedAt}`);
      console.log('');
    });
  }

  // Check Graduated Entry positions in DB
  console.log('=== GRADUATED ENTRY POSITIONS (DB) ===');
  const graduatedPositions = await prisma.graduatedEntryPosition.findMany({
    where: {
      symbol: 'AIAUSDT',
      status: { not: 'COMPLETED' },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (graduatedPositions.length === 0) {
    console.log('✓ No active Graduated Entry positions\n');
  } else {
    graduatedPositions.forEach((pos, idx) => {
      console.log(`${idx + 1}. Position ID: ${pos.positionId}`);
      console.log(`   Status: ${pos.status}`);
      console.log(`   Primary: ${pos.primaryExchange} ${pos.primaryQuantity} @ $${pos.primaryEntryPrice || 'N/A'}`);
      console.log(`   Hedge: ${pos.hedgeExchange} ${pos.hedgeQuantity} @ $${pos.hedgeEntryPrice || 'N/A'}`);
      console.log(`   Created: ${pos.createdAt}`);
      if (pos.startedAt) console.log(`   Started: ${pos.startedAt}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

checkCurrentState().catch(console.error);
