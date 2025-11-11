/**
 * Simple script to fix missing entry prices for active positions
 * Run: npx tsx scripts/fix-entry-price.ts
 */

import prisma from '../src/lib/prisma';

async function fixEntryPrices() {
  try {
    console.log('Checking positions without entry prices...');

    // Find all active positions without entry prices
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { primaryEntryPrice: null },
          { hedgeEntryPrice: null },
        ],
      },
      select: {
        id: true,
        positionId: true,
        symbol: true,
        primaryExchange: true,
        hedgeExchange: true,
        primaryEntryPrice: true,
        hedgeEntryPrice: true,
        primaryCurrentPrice: true,
        hedgeCurrentPrice: true,
      },
    });

    console.log(`Found ${positions.length} positions to fix`);

    if (positions.length === 0) {
      console.log('✅ All positions have entry prices!');
      return;
    }

    for (const pos of positions) {
      console.log(`\nPosition: ${pos.positionId} (${pos.symbol})`);
      console.log(`  Primary (${pos.primaryExchange}): Entry=${pos.primaryEntryPrice}, Current=${pos.primaryCurrentPrice}`);
      console.log(`  Hedge (${pos.hedgeExchange}): Entry=${pos.hedgeEntryPrice}, Current=${pos.hedgeCurrentPrice}`);

      // If we have current prices, use them as entry prices
      const updates: any = {};

      if (!pos.primaryEntryPrice && pos.primaryCurrentPrice) {
        updates.primaryEntryPrice = pos.primaryCurrentPrice;
        console.log(`  → Setting primary entry price to current: ${pos.primaryCurrentPrice}`);
      }

      if (!pos.hedgeEntryPrice && pos.hedgeCurrentPrice) {
        updates.hedgeEntryPrice = pos.hedgeCurrentPrice;
        console.log(`  → Setting hedge entry price to current: ${pos.hedgeCurrentPrice}`);
      }

      if (Object.keys(updates).length > 0) {
        await prisma.graduatedEntryPosition.update({
          where: { id: pos.id },
          data: updates,
        });
        console.log(`  ✅ Updated!`);
      } else {
        console.log(`  ⚠️  No current prices available, cannot update`);
      }
    }

    console.log('\n✅ Done!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEntryPrices();
