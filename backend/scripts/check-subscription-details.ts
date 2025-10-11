import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:aA0972454850!@localhost:5432/auth_app_local'
    }
  }
});

async function main() {
  console.log('\n📋 HYPERUSDT Subscription Details\n');
  console.log('='.repeat(70));

  const activeSub = await prisma.fundingArbitrageSubscription.findFirst({
    where: {
      symbol: 'HYPERUSDT',
      status: 'ACTIVE'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!activeSub) {
    console.log('❌ No ACTIVE HYPERUSDT subscription found');
    await prisma.$disconnect();
    return;
  }

  const now = new Date();
  const fundingTime = activeSub.nextFundingTime;
  const timeUntilFunding = fundingTime ? fundingTime.getTime() - now.getTime() : null;

  console.log(`ID: ${activeSub.id}`);
  console.log(`Symbol: ${activeSub.symbol}`);
  console.log(`Status: ${activeSub.status}`);
  console.log(`\nExchange Setup:`);
  console.log(`  Primary: ${activeSub.primaryExchange} (${activeSub.positionType})`);
  console.log(`  Hedge: ${activeSub.hedgeExchange}`);
  console.log(`\nPosition Details:`);
  console.log(`  Quantity: ${activeSub.quantity}`);
  console.log(`  Leverage: ${activeSub.leverage}x`);
  console.log(`  Margin: ${activeSub.margin || 'N/A'}`);
  console.log(`\nTiming:`);
  console.log(`  Created: ${activeSub.createdAt}`);
  console.log(`  Next Funding Time: ${fundingTime || 'N/A'}`);
  console.log(`  Current Time: ${now}`);

  if (timeUntilFunding !== null) {
    const hours = Math.floor(timeUntilFunding / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilFunding % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilFunding % (1000 * 60)) / 1000);

    if (timeUntilFunding > 0) {
      console.log(`  Time Until Execution: ${hours}h ${minutes}m ${seconds}s`);
      console.log(`  ⏰ Subscription is WAITING for next funding time`);
    } else {
      console.log(`  Time Since Funding: ${Math.abs(hours)}h ${Math.abs(minutes)}m ${Math.abs(seconds)}s AGO`);
      console.log(`  ⚠️  Funding time has PASSED - should have executed!`);
    }
  }

  console.log(`\nExecution Status:`);
  console.log(`  Executed At: ${activeSub.executedAt || 'Not executed yet'}`);
  console.log(`  Entry Price: ${activeSub.entryPrice || 'N/A'}`);
  console.log(`  Hedge Entry Price: ${activeSub.hedgeEntryPrice || 'N/A'}`);
  console.log(`  Error: ${activeSub.errorMessage || 'None'}`);

  console.log(`\nFunding Rate:`);
  console.log(`  Rate: ${activeSub.fundingRate}`);
  console.log(`  Earned: ${activeSub.fundingEarned || '0'}`);

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Analysis:\n');

  if (!activeSub.executedAt && timeUntilFunding && timeUntilFunding > 0) {
    console.log('✅ Subscription is properly scheduled and waiting for execution.');
    console.log('   The system will attempt to execute when the funding time arrives.');
  } else if (!activeSub.executedAt && timeUntilFunding && timeUntilFunding <= 0) {
    console.log('⚠️  ISSUE DETECTED: Funding time has passed but execution did not occur!');
    console.log('   Possible causes:');
    console.log('   - Server was not running at the funding time');
    console.log('   - Connector initialization failed');
    console.log('   - Execution logic encountered an error');
  } else if (activeSub.executedAt) {
    console.log('✅ Subscription has been executed.');
    console.log('   Positions should be open on both exchanges.');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
