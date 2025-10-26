import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPosition() {
  const positionId = 'arb_1_1761461577842';

  // First, check current state
  const position = await prisma.graduatedEntryPosition.findFirst({
    where: { positionId },
  });

  if (!position) {
    console.log('Position not found!');
    return;
  }

  console.log('\n=== Current State ===');
  console.log(JSON.stringify({
    positionId: position.positionId,
    currentPart: position.currentPart,
    graduatedParts: position.graduatedParts,
    primaryFilledQty: position.primaryFilledQty,
    hedgeFilledQty: position.hedgeFilledQty,
    primaryOrderIds: position.primaryOrderIds,
    hedgeOrderIds: position.hedgeOrderIds,
    primaryLastFundingPaid: position.primaryLastFundingPaid,
    hedgeLastFundingPaid: position.hedgeLastFundingPaid,
    primaryTotalFundingEarned: position.primaryTotalFundingEarned,
    hedgeTotalFundingEarned: position.hedgeTotalFundingEarned,
  }, null, 2));

  // Based on logs, we know:
  // - All 5 parts completed successfully
  // - Each part had 500 quantity on each side
  // - Total: 2500 on primary (BINGX) and 2500 on hedge (BYBIT)
  // - Entry prices: primary 0.021597, hedge 0.0221286

  console.log('\n=== Updating Position Data ===');

  const updated = await prisma.graduatedEntryPosition.update({
    where: { id: position.id },
    data: {
      currentPart: 5, // All 5 parts completed
      primaryFilledQty: 2500, // Total filled on primary
      hedgeFilledQty: 2500, // Total filled on hedge
      primaryEntryPrice: 0.021597,
      hedgeEntryPrice: 0.0221286,
      // Note: We don't have the actual order IDs from logs, but we can leave them empty for now
      // The position is tracked via WebSocket, so this is mainly for UI display
    },
  });

  console.log('\n=== Updated Successfully ===');
  console.log(JSON.stringify({
    positionId: updated.positionId,
    currentPart: updated.currentPart,
    graduatedParts: updated.graduatedParts,
    primaryFilledQty: updated.primaryFilledQty,
    hedgeFilledQty: updated.hedgeFilledQty,
    primaryEntryPrice: updated.primaryEntryPrice,
    hedgeEntryPrice: updated.hedgeEntryPrice,
    primaryLastFundingPaid: updated.primaryLastFundingPaid,
    hedgeLastFundingPaid: updated.hedgeLastFundingPaid,
  }, null, 2));

  await prisma.$disconnect();
}

fixPosition().catch((err) => {
  console.error('Error fixing position:', err);
  process.exit(1);
});
