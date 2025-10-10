/**
 * Delete the corrupted HUSDT subscription
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteCorruptedSubscription() {
  const corruptedId = 'cmgia5fsl0005zqpt4blvx5iz';

  console.log(`🗑️  Deleting corrupted subscription: ${corruptedId}\n`);

  try {
    const deleted = await prisma.fundingArbitrageSubscription.delete({
      where: { id: corruptedId },
    });

    console.log(`✅ Successfully deleted corrupted subscription:`);
    console.log(`   ID: ${deleted.id}`);
    console.log(`   Symbol: "${deleted.symbol}"`);
    console.log(`   Status: ${deleted.status}`);
    console.log('');

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log(`ℹ️  Subscription ${corruptedId} not found - may have already been deleted\n`);
    } else {
      console.error('❌ Error deleting subscription:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteCorruptedSubscription()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
