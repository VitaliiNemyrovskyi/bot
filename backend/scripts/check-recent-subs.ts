import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:aA0972454850!@localhost:5432/auth_app_local'
    }
  }
});

async function main() {
  const subs = await prisma.fundingArbitrageSubscription.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  console.log('\n📋 Recent Subscriptions (Last 10):\n');

  for (const sub of subs) {
    console.log(`ID: ${sub.id.substring(0, 20)}...`);
    console.log(`Symbol: ${sub.symbol}`);
    console.log(`Primary: ${sub.primaryExchange}`);
    console.log(`Hedge: ${sub.hedgeExchange}`);
    console.log(`Status: ${sub.status}`);
    console.log(`Created: ${sub.createdAt}`);
    console.log(`Executed: ${sub.executedAt || 'Not executed'}`);
    console.log(`Entry Price: ${sub.entryPrice || 'N/A'}`);
    console.log(`Hedge Entry Price: ${sub.hedgeEntryPrice || 'N/A'}`);
    console.log(`Error: ${sub.errorMessage || 'None'}`);
    console.log('---\n');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
