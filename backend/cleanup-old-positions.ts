/**
 * Cleanup script to mark old CANCELLED, ERROR, and LIQUIDATED positions as COMPLETED
 */

import { PrismaClient } from '@prisma/client';

async function cleanupOldPositions() {
  const prisma = new PrismaClient();

  try {
    console.log('Cleaning up old positions...\n');

    // Find positions with CANCELLED, ERROR, or LIQUIDATED status
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        status: {
          in: ['CANCELLED', 'ERROR', 'LIQUIDATED']
        }
      }
    });

    console.log(`Found ${positions.length} positions to clean up:\n`);

    if (positions.length === 0) {
      console.log('No positions to clean up.');
      return;
    }

    positions.forEach((pos: typeof positions[number], index: number) => {
      console.log(`${index + 1}. ${pos.positionId} - ${pos.symbol} - Status: ${pos.status}`);
    });

    console.log('\nUpdating all positions to COMPLETED status...\n');

    // Update all positions to COMPLETED
    const result = await prisma.graduatedEntryPosition.updateMany({
      where: {
        status: {
          in: ['CANCELLED', 'ERROR', 'LIQUIDATED']
        }
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    console.log(`✓ Successfully updated ${result.count} positions to COMPLETED status`);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error cleaning up positions:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldPositions();
