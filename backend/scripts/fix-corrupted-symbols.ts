/**
 * Script to find and fix corrupted subscription symbols in the database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCorruptedSymbols() {
  console.log('🔍 Scanning for corrupted subscription symbols...\n');

  try {
    // Get all active and waiting subscriptions
    const subscriptions = await prisma.fundingArbitrageSubscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'WAITING', 'EXECUTING'] },
      },
      select: {
        id: true,
        symbol: true,
        status: true,
        primaryExchange: true,
        hedgeExchange: true,
        createdAt: true,
      },
    });

    console.log(`Found ${subscriptions.length} active/waiting subscriptions\n`);

    const corruptedSubscriptions = [];

    for (const sub of subscriptions) {
      // Check for corrupted symbols
      const isCorrupted =
        sub.symbol.length < 6 ||  // Too short (like "4-USDT")
        !sub.symbol.includes('USDT') ||  // Missing USDT
        sub.symbol.startsWith('-') ||  // Starts with hyphen
        /^[0-9]/.test(sub.symbol);  // Starts with number only

      if (isCorrupted) {
        console.log(`❌ CORRUPTED subscription found:`);
        console.log(`   ID: ${sub.id}`);
        console.log(`   Symbol: "${sub.symbol}" (length: ${sub.symbol.length})`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Primary: ${sub.primaryExchange}`);
        console.log(`   Hedge: ${sub.hedgeExchange}`);
        console.log(`   Created: ${sub.createdAt.toISOString()}`);
        console.log('');

        corruptedSubscriptions.push(sub);
      } else {
        console.log(`✅ Valid: ${sub.id} - ${sub.symbol}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total subscriptions: ${subscriptions.length}`);
    console.log(`   Corrupted: ${corruptedSubscriptions.length}`);
    console.log(`   Valid: ${subscriptions.length - corruptedSubscriptions.length}`);

    if (corruptedSubscriptions.length > 0) {
      console.log(`\n⚠️  Action required:`);
      console.log(`   Delete these corrupted subscriptions using the UI or API`);
      console.log(`   Then create new subscriptions with correct symbols\n`);

      console.log(`🔧 To delete corrupted subscriptions, run:`);
      for (const sub of corruptedSubscriptions) {
        console.log(`   npx prisma db execute --stdin <<< "DELETE FROM \\"FundingArbitrageSubscriptions\\" WHERE id = '${sub.id}';"`);
      }
      console.log('');
    } else {
      console.log(`\n✨ No corrupted subscriptions found!\n`);
    }

  } catch (error: any) {
    console.error('❌ Error scanning subscriptions:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixCorruptedSymbols()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
