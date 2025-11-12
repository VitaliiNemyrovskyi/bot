import prisma from './src/lib/prisma';
import { GateIOService } from './src/lib/gateio';
import { EncryptionService } from './src/lib/encryption';

async function checkGateIOPositions() {
  console.log('📊 Checking Gate.io AIA positions...\n');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }

  const gateIOCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'GATEIO' },
  });

  if (!gateIOCreds || !gateIOCreds.apiKey || !gateIOCreds.apiSecret) {
    console.log('❌ No Gate.io credentials found');
    return;
  }

  try {
    const apiKey = EncryptionService.decrypt(gateIOCreds.apiKey);
    const apiSecret = EncryptionService.decrypt(gateIOCreds.apiSecret);
    const gateio = new GateIOService({ apiKey, apiSecret });

    console.log('📍 Fetching Gate.io positions...\n');

    // Gate.io uses AIA_USDT format
    const positions = await gateio.getPositions('AIA_USDT');

    if (!positions || positions.length === 0) {
      console.log('✓ No AIA_USDT positions found on Gate.io\n');
      return;
    }

    console.log(`Found ${positions.length} position(s):\n`);

    positions.forEach((pos: any, idx: number) => {
      console.log(`${idx + 1}. ${pos.contract || pos.symbol}`);
      console.log(`   Size: ${pos.size || pos.amount}`);
      console.log(`   Entry Price: $${pos.entry_price || pos.avgPrice || 'N/A'}`);
      console.log(`   Mark Price: $${pos.mark_price || pos.markPrice || 'N/A'}`);
      console.log(`   Leverage: ${pos.leverage || 'N/A'}x`);
      console.log(`   Value: ${pos.value || 'N/A'}`);
      console.log(`   Unrealized PnL: ${pos.unrealised_pnl || pos.unrealizedPnl || 'N/A'}`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response?.data || error.response);
    }
  }

  await prisma.$disconnect();
}

checkGateIOPositions().catch(console.error);
