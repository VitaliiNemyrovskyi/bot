/**
 * Find ALL subscriptions including failed/error ones
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllSubscriptions() {
  console.log('🔍 Finding ALL subscriptions...\n');

  try {
    const subscriptions = await prisma.fundingArbitrageSubscription.findMany({
      select: {
        id: true,
        symbol: true,
        status: true,
        primaryExchange: true,
        hedgeExchange: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    console.log(`Found ${subscriptions.length} subscriptions (last 20):\n`);

    for (const sub of subscriptions) {
      const icon = sub.symbol.length < 6 ? '❌' : '✅';
      console.log(`${icon} ${sub.id}`);
      console.log(`   Symbol: "${sub.symbol}" (length: ${sub.symbol.length})`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Primary: ${sub.primaryExchange}`);
      console.log(`   Hedge: ${sub.hedgeExchange}`);
      console.log(`   Created: ${sub.createdAt.toISOString()}`);
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

findAllSubscriptions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
