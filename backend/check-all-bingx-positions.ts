import prisma from './src/lib/prisma';
import { BingXService } from './src/lib/bingx';
import { EncryptionService } from './src/lib/encryption';

async function checkAllPositions() {
  console.log('📊 Checking ALL BingX positions...\n');

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

    console.log('📍 Fetching all open positions from BingX...\n');
    const positions = await bingx.getPositions();

    if (!positions || positions.length === 0) {
      console.log('✓ No open positions found on BingX');
      return;
    }

    const openPositions = positions.filter((p: any) => parseFloat(p.positionAmt) !== 0);

    console.log(`Found ${openPositions.length} open position(s):\n`);

    openPositions.forEach((pos: any, idx: number) => {
      const size = Math.abs(parseFloat(pos.positionAmt));
      const side = parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT';

      console.log(`${idx + 1}. ${pos.symbol}`);
      console.log(`   Side: ${side}`);
      console.log(`   Size: ${size}`);
      console.log(`   Entry: $${pos.avgPrice || 'N/A'}`);
      console.log(`   Mark: $${pos.markPrice || 'N/A'}`);
      console.log(`   Leverage: ${pos.leverage || 'N/A'}x`);
      console.log(`   Unrealized PnL: ${pos.unrealizedProfit || 'N/A'}`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  await prisma.$disconnect();
}

checkAllPositions().catch(console.error);
