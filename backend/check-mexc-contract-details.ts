import { MEXCService } from './src/lib/mexc';
import prisma from './src/lib/prisma';

async function main() {
  // Get MEXC credentials
  const mexcCred = await prisma.exchangeCredentials.findFirst({
    where: { exchange: 'MEXC', isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!mexcCred || !mexcCred.authToken) {
    console.log('❌ No active MEXC credentials with authToken found');
    return;
  }

  const mexc = new MEXCService({
    apiKey: mexcCred.apiKey,
    apiSecret: mexcCred.apiSecret,
    authToken: mexcCred.authToken,
    enableRateLimit: true
  });

  console.log('\n📊 Fetching P_USDT contract details from MEXC...\n');

  try {
    const allDetails = await mexc.getContractDetails('P_USDT');
    console.log('Contract Details:', JSON.stringify(allDetails, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await prisma.$disconnect();
}

main();
