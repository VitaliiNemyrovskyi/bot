/**
 * Check revenue data in database
 * Tests the revenue API endpoint and shows what's actually stored
 */

const TOKEN = process.env.AUTH_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbl8xIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1OTMyOTY2NCwiZXhwIjoxNzU5NDE2MDY0fQ.SBSJqPSNEdPtvw8HJUWfd0f0i54g78BI8VqEPVl2oSE";

async function checkRevenueData() {
  console.log('='.repeat(80));
  console.log('Checking Revenue Data');
  console.log('='.repeat(80));

  try {
    // Call revenue API
    const response = await fetch('http://localhost:3000/api/funding-arbitrage/revenue', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    console.log('\n📊 Revenue API Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      const { summary, bySymbol, byExchange, deals, timeline } = data.data;

      console.log('\n' + '='.repeat(80));
      console.log('📈 SUMMARY STATISTICS');
      console.log('='.repeat(80));
      console.log(`Total Deals: ${summary.totalDeals}`);
      console.log(`Total Revenue: $${summary.totalRevenue?.toFixed(4) || 0}`);
      console.log(`Total Funding Earned: $${summary.totalFundingEarned?.toFixed(4) || 0}`);
      console.log(`Average Revenue/Deal: $${summary.avgRevenuePerDeal?.toFixed(4) || 0}`);
      console.log(`Win Rate: ${summary.winRate?.toFixed(2) || 0}%`);
      console.log(`Profitable Deals: ${summary.profitableDeals}`);
      console.log(`Losing Deals: ${summary.losingDeals}`);

      if (summary.bestDeal) {
        console.log(`\nBest Deal: ${summary.bestDeal.symbol} - $${summary.bestDeal.revenue?.toFixed(4)}`);
      }

      if (summary.worstDeal) {
        console.log(`Worst Deal: ${summary.worstDeal.symbol} - $${summary.worstDeal.revenue?.toFixed(4)}`);
      }

      console.log('\n' + '='.repeat(80));
      console.log('📊 DEALS LIST');
      console.log('='.repeat(80));

      if (deals && deals.length > 0) {
        deals.forEach((deal: any, index: number) => {
          console.log(`\nDeal #${index + 1}:`);
          console.log(`  Symbol: ${deal.symbol}`);
          console.log(`  Position: ${deal.positionType}`);
          console.log(`  Quantity: ${deal.quantity}`);
          console.log(`  Funding Rate: ${(deal.fundingRate * 100).toFixed(4)}%`);
          console.log(`  Entry Price: $${deal.entryPrice?.toFixed(2) || 0}`);
          console.log(`  Hedge Entry: $${deal.hedgeEntryPrice?.toFixed(2) || 0}`);
          console.log(`  Funding Earned: $${deal.fundingEarned?.toFixed(4) || 0}`);
          console.log(`  Realized P&L: $${deal.realizedPnl?.toFixed(4) || 0}`);
          console.log(`  Executed: ${deal.executedAt || 'N/A'}`);
          console.log(`  Closed: ${deal.closedAt || 'N/A'}`);
        });
      } else {
        console.log('\n⚠️  No deals found!');
      }

      console.log('\n' + '='.repeat(80));
      console.log('🔍 TIMELINE');
      console.log('='.repeat(80));
      if (timeline && timeline.length > 0) {
        timeline.forEach((day: any) => {
          console.log(`${day.date}: ${day.deals} deals, $${day.revenue?.toFixed(4)} revenue`);
        });
      }
    } else {
      console.log('\n❌ API Error:', data.message || data.error);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

// Also check database directly via Prisma
async function checkDatabaseDirectly() {
  console.log('\n' + '='.repeat(80));
  console.log('💾 Checking Database Directly (via Prisma)');
  console.log('='.repeat(80));

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Get all subscriptions for user admin_1
    const subscriptions = await prisma.fundingArbitrageSubscription.findMany({
      where: {
        userId: 'admin_1'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Show last 20
    });

    console.log(`\nFound ${subscriptions.length} total subscriptions in database`);

    // Count by status
    const statusCounts = subscriptions.reduce((acc: any, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Show completed deals
    const completed = subscriptions.filter(sub => sub.status === 'COMPLETED');
    console.log(`\n✅ Completed deals: ${completed.length}`);

    if (completed.length > 0) {
      console.log('\nCompleted deals details:');
      completed.forEach((sub, index) => {
        console.log(`\nDeal #${index + 1}:`);
        console.log(`  ID: ${sub.id}`);
        console.log(`  Symbol: ${sub.symbol}`);
        console.log(`  Position: ${sub.positionType}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Realized P&L: $${sub.realizedPnl?.toFixed(4) || 0}`);
        console.log(`  Funding Earned: $${sub.fundingEarned?.toFixed(4) || 0}`);
        console.log(`  Created: ${sub.createdAt.toISOString()}`);
        console.log(`  Executed: ${sub.executedAt?.toISOString() || 'N/A'}`);
        console.log(`  Closed: ${sub.closedAt?.toISOString() || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  No COMPLETED deals found in database!');
      console.log('\nShowing other statuses:');
      subscriptions.slice(0, 5).forEach((sub, index) => {
        console.log(`\n${index + 1}. ${sub.symbol} - ${sub.status}`);
        console.log(`   Created: ${sub.createdAt.toISOString()}`);
        console.log(`   Realized P&L: ${sub.realizedPnl !== null ? `$${sub.realizedPnl.toFixed(4)}` : 'NULL'}`);
        console.log(`   Closed At: ${sub.closedAt?.toISOString() || 'NULL'}`);
        console.log(`   Error Message: ${sub.errorMessage || 'NULL'}`);
      });
    }

    // Show ERROR deals specifically
    const errorDeals = subscriptions.filter(sub => sub.status === 'ERROR');
    if (errorDeals.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('❌ ERROR DEALS - DETAILED ANALYSIS');
      console.log('='.repeat(80));
      errorDeals.forEach((sub, index) => {
        console.log(`\n❌ Error Deal #${index + 1}:`);
        console.log(`   ID: ${sub.id}`);
        console.log(`   Symbol: ${sub.symbol}`);
        console.log(`   Primary Exchange: ${sub.primaryExchange}`);
        console.log(`   Hedge Exchange: ${sub.hedgeExchange}`);
        console.log(`   Position Type: ${sub.positionType}`);
        console.log(`   Quantity: ${sub.quantity}`);
        console.log(`   Created: ${sub.createdAt.toISOString()}`);
        console.log(`   Updated: ${sub.updatedAt.toISOString()}`);
        console.log(`   ERROR MESSAGE: ${sub.errorMessage || 'No error message recorded'}`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await checkRevenueData();
  await checkDatabaseDirectly();
}

main();
