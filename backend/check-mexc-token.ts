import prisma from './src/lib/prisma';

async function main() {
  const mexcCreds = await prisma.exchangeCredentials.findMany({
    where: { exchange: 'MEXC' },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  if (mexcCreds.length === 0) {
    console.log('❌ No MEXC credentials found');
    return;
  }

  mexcCreds.forEach((cred, index) => {
    console.log(`\n${index + 1}. MEXC Credential:`);
    console.log('   ID:', cred.id);
    console.log('   Label:', cred.label);
    console.log('   Active:', cred.isActive);
    console.log('   API Key:', cred.apiKey ? `${cred.apiKey.substring(0, 8)}...` : 'NOT SET');
    console.log('   API Secret:', cred.apiSecret ? `${cred.apiSecret.substring(0, 8)}...` : 'NOT SET');
    console.log('   Auth Token:', cred.authToken ? `${cred.authToken.substring(0, 20)}... (length: ${cred.authToken.length})` : '❌ NOT SET');
    console.log('   Created:', cred.createdAt);
  });

  const activeCred = mexcCreds.find(c => c.isActive);
  if (activeCred) {
    console.log('\n✅ Active MEXC credential found');
    console.log('   Has authToken:', !!activeCred.authToken);
    if (activeCred.authToken) {
      console.log('   Token length:', activeCred.authToken.length);
      console.log('   Token prefix:', activeCred.authToken.substring(0, 30) + '...');
    }
  } else {
    console.log('\n⚠️  No active MEXC credential');
  }

  await prisma.$disconnect();
}

main();
