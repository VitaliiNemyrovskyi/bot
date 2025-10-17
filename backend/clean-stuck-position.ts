import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanStuckPosition() {
  try {
    console.log('\n=== Cleaning Stuck Position ===\n');

    // Update stuck position to ERROR status
    const result = await prisma.graduatedEntryPosition.update({
      where: { positionId: 'arb_1_1760653123556' },
      data: {
        status: 'ERROR',
        errorMessage: 'Position stuck in EXECUTING state - no progress made. Cleaned up.',
      },
    });

    console.log('✅ Position updated:');
    console.log(`   ID: ${result.positionId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.errorMessage}`);
    console.log('\n✅ Done!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanStuckPosition();
