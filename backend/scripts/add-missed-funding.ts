import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissedFunding() {
  const positionId = 'arb_1_1761461577842';

  console.log('Adding missed funding for position:', positionId);

  // The funding payment at 07:00:03 UTC was 0.18518168 USDT
  const missedFunding = 0.18518168;

  const updated = await prisma.graduatedEntryPosition.update({
    where: { positionId },
    data: {
      primaryLastFundingPaid: missedFunding,
      primaryTotalFundingEarned: missedFunding,
      // Recalculate net profit
      grossProfit: missedFunding,
      netProfit: missedFunding, // Will be adjusted when fees are tracked
    },
  });

  console.log('Updated position with missed funding:');
  console.log({
    positionId: updated.positionId,
    primaryLastFundingPaid: updated.primaryLastFundingPaid,
    primaryTotalFundingEarned: updated.primaryTotalFundingEarned,
    grossProfit: updated.grossProfit,
    netProfit: updated.netProfit,
  });

  await prisma.$disconnect();
}

addMissedFunding().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
