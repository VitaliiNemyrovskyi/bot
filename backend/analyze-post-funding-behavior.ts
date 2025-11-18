/**
 * Post-Funding Behavior Analyzer
 *
 * Analyzes what happens AFTER funding payment time to find profitable
 * entry opportunities that don't require paying negative funding rates.
 *
 * Strategy:
 * 1. Price drops BEFORE funding (arbitrage traders enter SHORT despite cost)
 * 2. After funding payment, SHORT traders may exit (buy to close)
 * 3. This buying pressure could cause price recovery
 * 4. We want to capture this recovery by entering LONG after funding
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PostFundingAnalysis {
  sessionId: string;
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingPaymentTime: Date;

  // Pre-funding behavior
  maxDropBeforeFunding: number; // % drop before funding
  maxDropTimeMs: number; // When max drop occurred (negative = before funding)

  // Post-funding behavior
  priceAtFunding: number; // Price at funding time
  lowestPriceAfterFunding: number; // Lowest price after funding
  maxDropAfterFunding: number; // % drop after funding time
  maxDropAfterTimeMs: number; // When max drop after funding occurred

  // Recovery analysis
  hasRecovery: boolean;
  recoveryStartTimeMs: number | null; // When recovery starts (ms after funding)
  recoveryPercent: number | null; // How much price recovered
  recoveryDurationMs: number | null; // How long recovery took

  // Opportunity assessment
  longOpportunity: boolean; // Is there a profitable LONG entry after funding?
  longEntryTimeMs: number | null; // Optimal LONG entry time (ms after funding)
  longExitTimeMs: number | null; // Optimal LONG exit time
  longProfitPercent: number | null; // Expected profit from LONG trade

  totalDataPoints: number;
}

async function analyzePostFundingBehavior() {
  console.log('\n📊 POST-FUNDING BEHAVIOR ANALYZER\n');
  console.log('='.repeat(80));

  // Fetch completed recordings with good data
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: {
        gte: 100
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50,
    include: {
      dataPoints: {
        orderBy: {
          bybitTimestamp: 'asc'
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No completed recordings found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings to analyze\n`);
  console.log('='.repeat(80));

  const analysisResults: PostFundingAnalysis[] = [];

  for (const session of sessions) {
    console.log(`\n📊 Analyzing: ${session.exchange} ${session.symbol}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime?.toISOString()}`);
    console.log(`   Funding Rate: ${((session.fundingRate || 0) * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    if (!session.fundingPaymentTime || session.dataPoints.length < 50) {
      console.log('   ⚠️  Skipping - insufficient data');
      continue;
    }

    const result = analyzeSession(session);

    if (result) {
      analysisResults.push(result);

      console.log(`\n   Pre-Funding:`);
      console.log(`      Max Drop: ${result.maxDropBeforeFunding.toFixed(4)}% at ${result.maxDropTimeMs}ms`);

      console.log(`\n   Post-Funding:`);
      console.log(`      Max Drop After: ${result.maxDropAfterFunding.toFixed(4)}% at +${result.maxDropAfterTimeMs}ms`);

      if (result.hasRecovery) {
        console.log(`\n   💰 Recovery Detected:`);
        console.log(`      Starts: +${result.recoveryStartTimeMs}ms after funding`);
        console.log(`      Recovery: ${result.recoveryPercent?.toFixed(4)}%`);
        console.log(`      Duration: ${result.recoveryDurationMs}ms`);
      }

      if (result.longOpportunity) {
        console.log(`\n   🎯 LONG Opportunity:`);
        console.log(`      Entry: +${result.longEntryTimeMs}ms after funding`);
        console.log(`      Exit: +${result.longExitTimeMs}ms after funding`);
        console.log(`      Expected Profit: ${result.longProfitPercent?.toFixed(4)}%`);
      } else {
        console.log(`\n   ❌ No profitable LONG opportunity found`);
      }
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('='.repeat(80));

  if (analysisResults.length === 0) {
    console.log('\n❌ No valid analysis results\n');
    return;
  }

  const withRecovery = analysisResults.filter(r => r.hasRecovery);
  const withLongOpp = analysisResults.filter(r => r.longOpportunity);

  console.log(`\nTotal Recordings: ${analysisResults.length}`);
  console.log(`With Price Recovery: ${withRecovery.length} (${(withRecovery.length / analysisResults.length * 100).toFixed(1)}%)`);
  console.log(`With LONG Opportunity: ${withLongOpp.length} (${(withLongOpp.length / analysisResults.length * 100).toFixed(1)}%)`);

  if (withLongOpp.length > 0) {
    const avgEntryTime = average(withLongOpp.map(r => r.longEntryTimeMs!));
    const medianEntryTime = median(withLongOpp.map(r => r.longEntryTimeMs!));
    const avgProfit = average(withLongOpp.map(r => r.longProfitPercent!));
    const medianProfit = median(withLongOpp.map(r => r.longProfitPercent!));

    console.log('\n💰 LONG TRADE OPPORTUNITIES:');
    console.log(`   Average Entry Time: +${avgEntryTime.toFixed(0)}ms after funding`);
    console.log(`   Median Entry Time: +${medianEntryTime.toFixed(0)}ms after funding`);
    console.log(`   Average Profit: ${avgProfit.toFixed(4)}%`);
    console.log(`   Median Profit: ${medianProfit.toFixed(4)}%`);

    // Top opportunities
    console.log('\n\n' + '='.repeat(80));
    console.log('🏆 TOP LONG OPPORTUNITIES (by profit %)');
    console.log('='.repeat(80));
    console.log('');
    console.log('Symbol       Funding%   Entry(ms)  Exit(ms)   Profit%');
    console.log('-'.repeat(80));

    const topOpportunities = [...withLongOpp]
      .sort((a, b) => (b.longProfitPercent || 0) - (a.longProfitPercent || 0))
      .slice(0, 10);

    for (const opp of topOpportunities) {
      const symbol = opp.symbol.padEnd(12);
      const funding = ((opp.fundingRate * 100).toFixed(3) + '%').padEnd(10);
      const entry = `+${opp.longEntryTimeMs}`.padEnd(10);
      const exit = `+${opp.longExitTimeMs}`.padEnd(10);
      const profit = (opp.longProfitPercent?.toFixed(3) + '%').padEnd(10);

      console.log(`${symbol} ${funding} ${entry} ${exit} ${profit}`);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 RECOMMENDED STRATEGY');
  console.log('='.repeat(80));

  if (withLongOpp.length === 0) {
    console.log('\n⚠️  No profitable LONG opportunities found in current data');
    console.log('   Price drops may not recover within recording window');
    console.log('   Consider analyzing longer post-funding periods');
  } else {
    const medianEntryTime = median(withLongOpp.map(r => r.longEntryTimeMs!));
    const medianProfit = median(withLongOpp.map(r => r.longProfitPercent!));

    console.log(`\n📌 RECOMMENDED: Enter LONG ${medianEntryTime.toFixed(0)}ms AFTER funding payment`);
    console.log(`📌 Expected Median Profit: ${medianProfit.toFixed(4)}%`);
    console.log(`📌 Success Rate: ${(withLongOpp.length / analysisResults.length * 100).toFixed(1)}%`);

    console.log('\n💡 Why This Works:');
    console.log('   1. Arbitrage traders SHORT before funding (despite paying funding)');
    console.log('   2. They capture 3-4% drop but pay 1-2% funding cost');
    console.log('   3. After funding payment, they close SHORT (buy to close)');
    console.log('   4. This buying pressure causes price recovery');
    console.log('   5. Enter LONG after funding to capture recovery (NO funding cost)');

    console.log('\n⚠️  Important:');
    console.log('   - Wait for funding payment to complete (avoid paying funding)');
    console.log('   - Enter LONG during the recovery phase');
    console.log('   - Exit when recovery slows or reverses');
    console.log('   - Monitor for sufficient liquidity');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Analyze a single session for post-funding behavior
 */
function analyzeSession(session: any): PostFundingAnalysis | null {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  // Split data into pre and post funding
  const preFundingPoints = dataPoints.filter((p: any) =>
    Number(p.bybitTimestamp) < fundingTimeMs
  );

  const postFundingPoints = dataPoints.filter((p: any) =>
    Number(p.bybitTimestamp) >= fundingTimeMs
  );

  if (preFundingPoints.length < 10 || postFundingPoints.length < 10) {
    return null;
  }

  // Find price at funding time (baseline)
  const fundingPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - fundingTimeMs) < Math.abs(closestTime - fundingTimeMs)
      ? point : closest;
  });

  const priceAtFunding = fundingPoint.lastPrice;

  // Analyze pre-funding drop
  const maxPreFundingDrop = preFundingPoints.reduce((max: any, point: any) => {
    const dropPercent = (priceAtFunding - point.lastPrice) / priceAtFunding * 100;
    return dropPercent > max.drop ? { drop: dropPercent, point } : max;
  }, { drop: 0, point: fundingPoint });

  const maxDropBeforeFunding = maxPreFundingDrop.drop;
  const maxDropTimeMs = Number(maxPreFundingDrop.point.bybitTimestamp) - fundingTimeMs;

  // Analyze post-funding behavior
  const lowestPostPoint = postFundingPoints.reduce((lowest: any, point: any) =>
    point.lastPrice < lowest.lastPrice ? point : lowest
  );

  const lowestPriceAfterFunding = lowestPostPoint.lastPrice;
  const maxDropAfterFunding = (priceAtFunding - lowestPriceAfterFunding) / priceAtFunding * 100;
  const maxDropAfterTimeMs = Number(lowestPostPoint.bybitTimestamp) - fundingTimeMs;

  // Detect recovery (price rising from lowest point)
  const RECOVERY_THRESHOLD = 0.05; // 0.05% recovery to be significant
  let hasRecovery = false;
  let recoveryStartTimeMs: number | null = null;
  let recoveryPercent: number | null = null;
  let recoveryDurationMs: number | null = null;
  let recoveryPeakPoint: any = null;

  // Find points after the lowest point
  const pointsAfterLowest = postFundingPoints.filter((p: any) =>
    Number(p.bybitTimestamp) > Number(lowestPostPoint.bybitTimestamp)
  );

  if (pointsAfterLowest.length > 0) {
    // Find highest point after lowest
    const highestAfterLowest = pointsAfterLowest.reduce((highest: any, point: any) =>
      point.lastPrice > highest.lastPrice ? point : highest
    );

    const recovery = (highestAfterLowest.lastPrice - lowestPriceAfterFunding) / lowestPriceAfterFunding * 100;

    if (recovery >= RECOVERY_THRESHOLD) {
      hasRecovery = true;
      recoveryStartTimeMs = Number(lowestPostPoint.bybitTimestamp) - fundingTimeMs;
      recoveryPercent = recovery;
      recoveryPeakPoint = highestAfterLowest;
      recoveryDurationMs = Number(highestAfterLowest.bybitTimestamp) - Number(lowestPostPoint.bybitTimestamp);
    }
  }

  // Assess LONG opportunity
  let longOpportunity = false;
  let longEntryTimeMs: number | null = null;
  let longExitTimeMs: number | null = null;
  let longProfitPercent: number | null = null;

  const MIN_PROFIT = 0.1; // Minimum 0.1% profit to be worthwhile

  if (hasRecovery && recoveryPercent! >= MIN_PROFIT) {
    longOpportunity = true;
    // Entry: at lowest point after funding
    longEntryTimeMs = recoveryStartTimeMs;
    // Exit: at recovery peak
    longExitTimeMs = Number(recoveryPeakPoint.bybitTimestamp) - fundingTimeMs;
    longProfitPercent = recoveryPercent;
  }

  return {
    sessionId: session.id,
    symbol: session.symbol,
    exchange: session.exchange,
    fundingRate: session.fundingRate || 0,
    fundingPaymentTime: session.fundingPaymentTime,

    maxDropBeforeFunding,
    maxDropTimeMs,

    priceAtFunding,
    lowestPriceAfterFunding,
    maxDropAfterFunding,
    maxDropAfterTimeMs,

    hasRecovery,
    recoveryStartTimeMs,
    recoveryPercent,
    recoveryDurationMs,

    longOpportunity,
    longEntryTimeMs,
    longExitTimeMs,
    longProfitPercent,

    totalDataPoints: dataPoints.length,
  };
}

/**
 * Helper functions
 */
function average(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

// Run the analysis
analyzePostFundingBehavior()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
