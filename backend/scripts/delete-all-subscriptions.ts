/**
 * Delete ALL funding arbitrage subscriptions
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllSubscriptions() {
  console.log('🗑️  Deleting ALL funding arbitrage subscriptions...\n');

  try {
    // First, show what we're about to delete
    const subscriptions = await prisma.fundingArbitrageSubscription.findMany({
      select: {
        id: true,
        symbol: true,
        status: true,
        primaryExchange: true,
        hedgeExchange: true,
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions to delete:\n`);

    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.id}`);
      console.log(`   Symbol: ${sub.symbol}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   ${sub.primaryExchange} ↔️ ${sub.hedgeExchange}\n`);
    });

    // Delete all subscriptions
    const result = await prisma.fundingArbitrageSubscription.deleteMany({});

    console.log(`\n✅ Successfully deleted ${result.count} subscriptions\n`);
    console.log('✨ Database is now clean - ready for fresh subscriptions!\n');

  } catch (error: any) {
    console.error('❌ Error deleting subscriptions:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllSubscriptions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
