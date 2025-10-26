/**
 * Script to check if liquidation monitoring is active for graduated entry positions
 *
 * Usage: node scripts/check-liquidation-monitoring.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMonitoring() {
  try {
    console.log('🔍 Checking liquidation monitoring status...\n');

    // Get all ACTIVE positions
    const activePositions = await prisma.graduatedEntryPosition.findMany({
      where: { status: 'ACTIVE' },
      select: {
        positionId: true,
        symbol: true,
        primaryExchange: true,
        hedgeExchange: true,
        lastLiquidationCheck: true,
        primaryInDanger: true,
        hedgeInDanger: true,
        primaryLiquidationPrice: true,
        hedgeLiquidationPrice: true,
        primaryCurrentPrice: true,
        hedgeCurrentPrice: true,
        updatedAt: true,
      },
      orderBy: { lastLiquidationCheck: 'desc' },
    });

    if (activePositions.length === 0) {
      console.log('ℹ️  No active positions found. Monitoring is idle.\n');
      process.exit(0);
    }

    console.log(`✅ Found ${activePositions.length} active position(s) being monitored:\n`);

    for (const pos of activePositions) {
      const now = new Date();
      const lastCheck = pos.lastLiquidationCheck ? new Date(pos.lastLiquidationCheck) : null;
      const secondsSinceCheck = lastCheck ? Math.floor((now - lastCheck) / 1000) : null;

      console.log(`📊 Position: ${pos.positionId}`);
      console.log(`   Symbol: ${pos.symbol}`);
      console.log(`   Exchanges: ${pos.primaryExchange} ⇄ ${pos.hedgeExchange}`);

      if (lastCheck) {
        console.log(`   Last check: ${lastCheck.toISOString()} (${secondsSinceCheck}s ago)`);

        if (secondsSinceCheck < 10) {
          console.log(`   Status: 🟢 ACTIVELY MONITORED (checked ${secondsSinceCheck}s ago)`);
        } else if (secondsSinceCheck < 60) {
          console.log(`   Status: 🟡 MONITORING (checked ${secondsSinceCheck}s ago)`);
        } else {
          console.log(`   Status: 🔴 STALE (last check ${secondsSinceCheck}s ago - possible issue!)`);
        }
      } else {
        console.log(`   Status: ⚪ NOT STARTED (no liquidation checks yet)`);
      }

      // Show liquidation status
      if (pos.primaryInDanger || pos.hedgeInDanger) {
        console.log(`   ⚠️  DANGER: Position approaching liquidation!`);
        if (pos.primaryInDanger) console.log(`      - Primary in danger`);
        if (pos.hedgeInDanger) console.log(`      - Hedge in danger`);
      } else {
        console.log(`   ✅ SAFE: Position not in danger`);
      }

      // Show prices if available
      if (pos.primaryCurrentPrice && pos.primaryLiquidationPrice) {
        const primaryDiff = ((pos.primaryCurrentPrice - pos.primaryLiquidationPrice) / pos.primaryLiquidationPrice * 100).toFixed(2);
        console.log(`   Primary: current=${pos.primaryCurrentPrice}, liq=${pos.primaryLiquidationPrice} (${primaryDiff}% away)`);
      }

      if (pos.hedgeCurrentPrice && pos.hedgeLiquidationPrice) {
        const hedgeDiff = ((pos.hedgeLiquidationPrice - pos.hedgeCurrentPrice) / pos.hedgeCurrentPrice * 100).toFixed(2);
        console.log(`   Hedge: current=${pos.hedgeCurrentPrice}, liq=${pos.hedgeLiquidationPrice} (${hedgeDiff}% away)`);
      }

      console.log('');
    }

    console.log('✅ Liquidation monitoring is ACTIVE\n');

  } catch (error) {
    console.error('❌ Error checking monitoring status:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMonitoring();
