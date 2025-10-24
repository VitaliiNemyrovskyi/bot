import { GateIOConnector } from './src/connectors/gateio.connector';
import prisma from './src/lib/prisma';

async function main() {
  // Get Gate.io credentials
  const gateioC cred = await prisma.exchangeCredentials.findFirst({
    where: { exchange: 'GATEIO', isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!gateioC cred) {
    console.log('❌ No active Gate.io credentials found');
    return;
  }

  console.log('✅ Using Gate.io credentials:', {
    id: gateioC cred.id,
    label: gateioC cred.label,
    apiKeyPrefix: gateioC cred.apiKey.substring(0, 8) + '...'
  });

  const gateio = new GateIOConnector(gateioC cred.apiKey, gateioC cred.apiSecret);
  await gateio.initialize();

  console.log('\n📊 Checking P_USDT position on Gate.io...\n');

  try {
    const position = await gateio.getPosition('P_USDT');
    console.log('Position found:', JSON.stringify(position, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await prisma.$disconnect();
}

main();
