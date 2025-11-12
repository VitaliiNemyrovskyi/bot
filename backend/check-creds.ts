import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const credentials = await prisma.exchangeCredentials.findMany({
    where: { userId: 'admin_1' }
  });
  
  console.log('\n📋 Exchange Credentials:');
  credentials.forEach((cred: typeof credentials[number]) => {
    console.log(`\n${cred.exchange} (${cred.environment}):`);
    console.log(`  ID: ${cred.id}`);
    console.log(`  Label: ${cred.label}`);
    console.log(`  Active: ${cred.isActive}`);
    console.log(`  API Key Length: ${cred.apiKey.length}`);
    console.log(`  API Secret Length: ${cred.apiSecret.length}`);
    const keyPreview = cred.apiKey.substring(0, 50);
    console.log(`  API Key (encrypted, first 50): ${keyPreview}...`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
