/**
 * COMPREHENSIVE QUANTITATIVE ANALYSIS OF FUNDING PAYMENT RECORDINGS
 *
 * This script performs rigorous statistical analysis to find OPTIMAL entry/exit points
 * for trading around funding payments with maximum risk-adjusted returns.
 *
 * Analysis Components:
 * 1. Statistical Price Behavior Analysis
 * 2. Entry Point Optimization (SHORT and LONG strategies)
 * 3. Exit Point Optimization
 * 4. Risk-Adjusted Performance Metrics
 * 5. Market Condition Segmentation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Trading fees (Bybit)
  makerFeePercent: 0.02,  // 0.02% maker fee
  takerFeePercent: 0.055, // 0.055% taker fee

  // Slippage assumptions
  lowSlippagePercent: 0.01,  // 0.01% for good liquidity
  medSlippagePercent: 0.03,  // 0.03% for medium liquidity
  highSlippagePercent: 0.05, // 0.05% for poor liquidity

  // Position sizing
  defaultPositionSize: 100, // USDT

  // Risk parameters
  maxDrawdownThreshold: -2.0, // -2% max acceptable drawdown
  minWinRate: 0.60, // 60% minimum win rate

  // Statistical significance
  minSampleSize: 10, // Reduced for limited dataset
  confidenceLevel: 0.95,
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SessionData {
  id: string;
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingPaymentTime: Date;
  dataPoints: DataPoint[];
}

interface DataPoint {
  bybitTimestamp: bigint;
  relativeTimeMs: number;
  lastPrice: number;
  markPrice: number | null;
  volume24h: number | null;
  openInterest: number | null;
}

interface TradeResult {
  sessionId: string;
  symbol: string;
  fundingRate: number;

  entryTimeMs: number;
  entryPrice: number;
  exitTimeMs: number;
  exitPrice: number;

  priceMove: number; // % (positive = profitable for strategy)
  grossProfitPercent: number;

  fundingCost: number; // % (negative if we pay, positive if we receive)
  tradingFees: number; // %
  slippage: number; // %

  netProfitPercent: number;

  maxFavorableMovePercent: number; // Max profit potential during trade
  maxAdverseMovePercent: number; // Max loss potential (drawdown)

  holdingPeriodMs: number;
}

interface StrategyPerformance {
  strategyName: string;
  entryTimeMs: number;
  exitTimeMs: number;

  trades: TradeResult[];

  // Return statistics
  meanReturn: number;
  medianReturn: number;
  stdDevReturn: number;

  // Risk statistics
  maxDrawdown: number;
  avgDrawdown: number;
  valueAtRisk95: number; // 95th percentile worst loss

  // Performance metrics
  sharpeRatio: number;
  sortinoRatio: number;
  profitFactor: number;
  winRate: number;

  // Trade statistics
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;

  // Confidence intervals
  returnCI95Lower: number;
  returnCI95Upper: number;

  // Sample quality
  sampleSize: number;
  isStatisticallySignificant: boolean;
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

function mean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
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

function stdDev(numbers: number[]): number {
  if (numbers.length < 2) return 0;
  const avg = mean(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const variance = mean(squareDiffs);
  return Math.sqrt(variance);
}

function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
}

function confidenceInterval95(numbers: number[]): { lower: number; upper: number } {
  const avg = mean(numbers);
  const std = stdDev(numbers);
  const n = numbers.length;
  const marginOfError = 1.96 * (std / Math.sqrt(n)); // 1.96 for 95% CI

  return {
    lower: avg - marginOfError,
    upper: avg + marginOfError,
  };
}

function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
  if (returns.length < 2) return 0;
  const avgReturn = mean(returns);
  const std = stdDev(returns);
  if (std === 0) return 0;
  return (avgReturn - riskFreeRate) / std;
}

function calculateSortinoRatio(returns: number[], riskFreeRate: number = 0): number {
  if (returns.length < 2) return 0;
  const avgReturn = mean(returns);
  const negativeReturns = returns.filter(r => r < 0);
  if (negativeReturns.length === 0) return Infinity;
  const downsideStd = stdDev(negativeReturns);
  if (downsideStd === 0) return 0;
  return (avgReturn - riskFreeRate) / downsideStd;
}

function calculateProfitFactor(trades: TradeResult[]): number {
  const grossProfit = trades.filter(t => t.netProfitPercent > 0)
    .reduce((sum, t) => sum + t.netProfitPercent, 0);
  const grossLoss = Math.abs(trades.filter(t => t.netProfitPercent < 0)
    .reduce((sum, t) => sum + t.netProfitPercent, 0));

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadCompletedSessions(): Promise<SessionData[]> {
  console.log('\n📊 Loading completed recording sessions...\n');

  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: {
        gte: 100, // Minimum 100 data points for quality
      },
    },
    orderBy: {
      fundingPaymentTime: 'desc',
    },
    include: {
      dataPoints: {
        orderBy: {
          relativeTimeMs: 'asc',
        },
      },
    },
  });

  console.log(`✅ Loaded ${sessions.length} sessions`);
  console.log(`   Total data points: ${sessions.reduce((sum, s) => sum + s.dataPoints.length, 0).toLocaleString()}`);

  // Data quality assessment
  const highQuality = sessions.filter(s => s.dataPoints.length >= 500);
  const mediumQuality = sessions.filter(s => s.dataPoints.length >= 200 && s.dataPoints.length < 500);
  const lowQuality = sessions.filter(s => s.dataPoints.length < 200);

  console.log(`\n📈 Data Quality Distribution:`);
  console.log(`   High (≥500 points): ${highQuality.length} sessions`);
  console.log(`   Medium (200-499): ${mediumQuality.length} sessions`);
  console.log(`   Low (<200): ${lowQuality.length} sessions`);

  return sessions as any;
}

// ============================================================================
// TRADE SIMULATION
// ============================================================================

function simulateTrade(
  session: SessionData,
  entryOffsetMs: number,
  exitOffsetMs: number,
  isShort: boolean,
  assumeFundingAvoided: boolean = false
): TradeResult | null {
  const { dataPoints, fundingRate } = session;
  const fundingTimeMs = session.fundingPaymentTime.getTime();

  // Find entry point
  const targetEntryMs = fundingTimeMs + entryOffsetMs;
  const entryPoint = dataPoints.reduce((closest, point) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetEntryMs) < Math.abs(closestTime - targetEntryMs)
      ? point : closest;
  });

  if (!entryPoint) return null;

  // Find exit point
  const targetExitMs = fundingTimeMs + exitOffsetMs;
  const exitPoint = dataPoints.reduce((closest, point) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetExitMs) < Math.abs(closestTime - targetExitMs)
      ? point : closest;
  });

  if (!exitPoint) return null;

  const entryPrice = entryPoint.lastPrice;
  const exitPrice = exitPoint.lastPrice;

  // Calculate price movement (positive = price increase)
  const rawPriceMove = ((exitPrice - entryPrice) / entryPrice) * 100;

  // For SHORT: profit when price drops (inverse)
  const priceMove = isShort ? -rawPriceMove : rawPriceMove;

  // Determine if funding is paid/received
  let fundingCost = 0;
  if (!assumeFundingAvoided) {
    if (isShort) {
      // SHORT with negative funding: we PAY (cost is negative value of fundingRate)
      fundingCost = fundingRate * 100; // fundingRate is already negative, so this is a cost
    } else {
      // LONG with negative funding: we RECEIVE (benefit is positive absolute value)
      fundingCost = -fundingRate * 100; // Convert to positive
    }
  }

  // Calculate costs
  const tradingFees = CONFIG.takerFeePercent * 2; // Entry + exit
  const slippage = CONFIG.medSlippagePercent * 2; // Entry + exit

  // Calculate gross and net profit
  const grossProfitPercent = priceMove;
  const netProfitPercent = grossProfitPercent + fundingCost - tradingFees - slippage;

  // Find max favorable and adverse moves during holding period
  const holdingPeriod = dataPoints.filter(p => {
    const t = Number(p.bybitTimestamp);
    return t >= Number(entryPoint.bybitTimestamp) && t <= Number(exitPoint.bybitTimestamp);
  });

  let maxFavorableMove = 0;
  let maxAdverseMove = 0;

  for (const point of holdingPeriod) {
    const currentMove = ((point.lastPrice - entryPrice) / entryPrice) * 100;
    const adjustedMove = isShort ? -currentMove : currentMove;

    if (adjustedMove > maxFavorableMove) maxFavorableMove = adjustedMove;
    if (adjustedMove < maxAdverseMove) maxAdverseMove = adjustedMove;
  }

  return {
    sessionId: session.id,
    symbol: session.symbol,
    fundingRate: session.fundingRate,

    entryTimeMs: entryOffsetMs,
    entryPrice,
    exitTimeMs: exitOffsetMs,
    exitPrice,

    priceMove,
    grossProfitPercent,

    fundingCost,
    tradingFees,
    slippage,

    netProfitPercent,

    maxFavorableMovePercent: maxFavorableMove,
    maxAdverseMovePercent: maxAdverseMove,

    holdingPeriodMs: exitOffsetMs - entryOffsetMs,
  };
}

// ============================================================================
// STRATEGY EVALUATION
// ============================================================================

function evaluateStrategy(
  sessions: SessionData[],
  entryOffsetMs: number,
  exitOffsetMs: number,
  isShort: boolean,
  strategyName: string,
  assumeFundingAvoided: boolean = false
): StrategyPerformance | null {
  const trades: TradeResult[] = [];

  for (const session of sessions) {
    const trade = simulateTrade(session, entryOffsetMs, exitOffsetMs, isShort, assumeFundingAvoided);
    if (trade) trades.push(trade);
  }

  if (trades.length < CONFIG.minSampleSize) {
    console.log(`⚠️  ${strategyName}: Insufficient sample size (${trades.length} < ${CONFIG.minSampleSize})`);
    return null;
  }

  const returns = trades.map(t => t.netProfitPercent);
  const drawdowns = trades.map(t => t.maxAdverseMovePercent);

  const wins = trades.filter(t => t.netProfitPercent > 0);
  const losses = trades.filter(t => t.netProfitPercent <= 0);

  const ci = confidenceInterval95(returns);

  return {
    strategyName,
    entryTimeMs: entryOffsetMs,
    exitTimeMs: exitOffsetMs,

    trades,

    meanReturn: mean(returns),
    medianReturn: median(returns),
    stdDevReturn: stdDev(returns),

    maxDrawdown: Math.min(...drawdowns),
    avgDrawdown: mean(drawdowns),
    valueAtRisk95: percentile(returns, 0.05),

    sharpeRatio: calculateSharpeRatio(returns),
    sortinoRatio: calculateSortinoRatio(returns),
    profitFactor: calculateProfitFactor(trades),
    winRate: wins.length / trades.length,

    avgWin: wins.length > 0 ? mean(wins.map(t => t.netProfitPercent)) : 0,
    avgLoss: losses.length > 0 ? mean(losses.map(t => t.netProfitPercent)) : 0,
    largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.netProfitPercent)) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.netProfitPercent)) : 0,

    returnCI95Lower: ci.lower,
    returnCI95Upper: ci.upper,

    sampleSize: trades.length,
    isStatisticallySignificant: trades.length >= CONFIG.minSampleSize && ci.lower > 0,
  };
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function runComprehensiveAnalysis() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 COMPREHENSIVE QUANTITATIVE ANALYSIS OF FUNDING PAYMENT TRADING');
  console.log('='.repeat(100));

  // Load data
  const sessions = await loadCompletedSessions();

  if (sessions.length < CONFIG.minSampleSize) {
    console.log(`\n❌ Insufficient data: ${sessions.length} sessions (need ${CONFIG.minSampleSize})`);
    return;
  }

  // Segment by funding rate magnitude
  const highNegativeFunding = sessions.filter(s => s.fundingRate < -0.01); // < -1%
  const medNegativeFunding = sessions.filter(s => s.fundingRate >= -0.01 && s.fundingRate < -0.005);
  const lowNegativeFunding = sessions.filter(s => s.fundingRate >= -0.005 && s.fundingRate < 0);

  console.log(`\n📊 Funding Rate Distribution:`);
  console.log(`   High negative (< -1%): ${highNegativeFunding.length} sessions`);
  console.log(`   Medium negative (-1% to -0.5%): ${medNegativeFunding.length} sessions`);
  console.log(`   Low negative (-0.5% to 0%): ${lowNegativeFunding.length} sessions`);

  // ============================================================================
  // SECTION 1: SHORT STRATEGY OPTIMIZATION
  // ============================================================================

  console.log('\n\n' + '='.repeat(100));
  console.log('📉 SECTION 1: SHORT STRATEGY OPTIMIZATION');
  console.log('='.repeat(100));
  console.log('\nGoal: Enter SHORT before funding, capture price drop, minimize funding cost\n');

  const shortStrategies: StrategyPerformance[] = [];

  // Test various entry/exit combinations for SHORT
  const shortEntries = [-5000, -2000, -1000, -500, -200, 0, 200, 500];
  const shortExits = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000];

  for (const entry of shortEntries) {
    for (const exit of shortExits) {
      if (exit - entry < 3000) continue; // Minimum 3s holding period

      const assumeFundingAvoided = entry >= -5000 && entry <= 5000;
      const strategy = evaluateStrategy(
        sessions,
        entry,
        exit,
        true, // isShort
        `SHORT Entry:${entry}ms Exit:${exit}ms`,
        assumeFundingAvoided
      );

      if (strategy) shortStrategies.push(strategy);
    }
  }

  // Sort by Sharpe ratio (risk-adjusted returns)
  shortStrategies.sort((a, b) => b.sharpeRatio - a.sharpeRatio);

  console.log('\n🏆 TOP 10 SHORT STRATEGIES (by Sharpe Ratio):');
  console.log('\n' + '-'.repeat(100));
  console.log('Rank  Entry(ms)  Exit(ms)  Median%  Mean%   Sharpe  Sortino  WinRate  PF    MaxDD%  Samples');
  console.log('-'.repeat(100));

  for (let i = 0; i < Math.min(10, shortStrategies.length); i++) {
    const s = shortStrategies[i];
    if (!s) continue;
    console.log(
      `${(i + 1).toString().padStart(4)}  ` +
      `${s.entryTimeMs.toString().padStart(9)}  ` +
      `${s.exitTimeMs.toString().padStart(8)}  ` +
      `${s.medianReturn.toFixed(3).padStart(7)}  ` +
      `${s.meanReturn.toFixed(3).padStart(6)}  ` +
      `${s.sharpeRatio.toFixed(2).padStart(6)}  ` +
      `${s.sortinoRatio.toFixed(2).padStart(7)}  ` +
      `${(s.winRate * 100).toFixed(1).padStart(7)}  ` +
      `${s.profitFactor.toFixed(2).padStart(4)}  ` +
      `${s.maxDrawdown.toFixed(2).padStart(6)}  ` +
      `${s.sampleSize.toString().padStart(7)}`
    );
  }

  // ============================================================================
  // SECTION 2: LONG STRATEGY OPTIMIZATION
  // ============================================================================

  console.log('\n\n' + '='.repeat(100));
  console.log('📈 SECTION 2: LONG STRATEGY OPTIMIZATION');
  console.log('='.repeat(100));
  console.log('\nGoal: Enter LONG after funding, capture recovery, receive funding payment\n');

  const longStrategies: StrategyPerformance[] = [];

  // Test various entry/exit combinations for LONG
  const longEntries = [0, 500, 1000, 2000, 3000, 5000, 10000, 15000, 20000];
  const longExits = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

  for (const entry of longEntries) {
    for (const exit of longExits) {
      if (exit - entry < 5000) continue; // Minimum 5s holding period

      const strategy = evaluateStrategy(
        sessions,
        entry,
        exit,
        false, // isLong
        `LONG Entry:${entry}ms Exit:${exit}ms`,
        false // Must hold through funding to receive payment
      );

      if (strategy) longStrategies.push(strategy);
    }
  }

  // Sort by Sharpe ratio
  longStrategies.sort((a, b) => b.sharpeRatio - a.sharpeRatio);

  console.log('\n🏆 TOP 10 LONG STRATEGIES (by Sharpe Ratio):');
  console.log('\n' + '-'.repeat(100));
  console.log('Rank  Entry(ms)  Exit(ms)  Median%  Mean%   Sharpe  Sortino  WinRate  PF    MaxDD%  Samples');
  console.log('-'.repeat(100));

  for (let i = 0; i < Math.min(10, longStrategies.length); i++) {
    const s = longStrategies[i];
    if (!s) continue;
    console.log(
      `${(i + 1).toString().padStart(4)}  ` +
      `${s.entryTimeMs.toString().padStart(9)}  ` +
      `${s.exitTimeMs.toString().padStart(8)}  ` +
      `${s.medianReturn.toFixed(3).padStart(7)}  ` +
      `${s.meanReturn.toFixed(3).padStart(6)}  ` +
      `${s.sharpeRatio.toFixed(2).padStart(6)}  ` +
      `${s.sortinoRatio.toFixed(2).padStart(7)}  ` +
      `${(s.winRate * 100).toFixed(1).padStart(7)}  ` +
      `${s.profitFactor.toFixed(2).padStart(4)}  ` +
      `${s.maxDrawdown.toFixed(2).padStart(6)}  ` +
      `${s.sampleSize.toString().padStart(7)}`
    );
  }

  // ============================================================================
  // SECTION 3: FINAL RECOMMENDATIONS
  // ============================================================================

  console.log('\n\n' + '='.repeat(100));
  console.log('🎯 SECTION 3: EXECUTIVE SUMMARY & RECOMMENDATIONS');
  console.log('='.repeat(100));

  const bestShort = shortStrategies[0];
  const bestLong = longStrategies[0];

  console.log('\n📊 OPTIMAL STRATEGIES:\n');

  console.log('1️⃣  BEST SHORT STRATEGY:');
  if (bestShort) {
    console.log(`   Entry: ${bestShort.entryTimeMs}ms ${bestShort.entryTimeMs < 0 ? 'BEFORE' : 'AFTER'} funding`);
    console.log(`   Exit: ${bestShort.exitTimeMs}ms AFTER funding`);
    console.log(`   Expected Return: ${bestShort.medianReturn.toFixed(4)}% (median), ${bestShort.meanReturn.toFixed(4)}% (mean)`);
    console.log(`   95% Confidence Interval: [${bestShort.returnCI95Lower.toFixed(4)}%, ${bestShort.returnCI95Upper.toFixed(4)}%]`);
    console.log(`   Win Rate: ${(bestShort.winRate * 100).toFixed(1)}%`);
    console.log(`   Sharpe Ratio: ${bestShort.sharpeRatio.toFixed(2)} (risk-adjusted return)`);
    console.log(`   Max Drawdown: ${bestShort.maxDrawdown.toFixed(2)}%`);
    console.log(`   Profit Factor: ${bestShort.profitFactor.toFixed(2)}`);
    console.log(`   Sample Size: ${bestShort.sampleSize} trades`);
    console.log(`   Statistical Significance: ${bestShort.isStatisticallySignificant ? '✅ YES' : '⚠️  NO'}`);
  }

  console.log('\n2️⃣  BEST LONG STRATEGY:');
  if (bestLong) {
    console.log(`   Entry: ${bestLong.entryTimeMs}ms AFTER funding`);
    console.log(`   Exit: ${bestLong.exitTimeMs}ms AFTER funding`);
    console.log(`   Expected Return: ${bestLong.medianReturn.toFixed(4)}% (median), ${bestLong.meanReturn.toFixed(4)}% (mean)`);
    console.log(`   95% Confidence Interval: [${bestLong.returnCI95Lower.toFixed(4)}%, ${bestLong.returnCI95Upper.toFixed(4)}%]`);
    console.log(`   Win Rate: ${(bestLong.winRate * 100).toFixed(1)}%`);
    console.log(`   Sharpe Ratio: ${bestLong.sharpeRatio.toFixed(2)} (risk-adjusted return)`);
    console.log(`   Max Drawdown: ${bestLong.maxDrawdown.toFixed(2)}%`);
    console.log(`   Profit Factor: ${bestLong.profitFactor.toFixed(2)}`);
    console.log(`   Sample Size: ${bestLong.sampleSize} trades`);
    console.log(`   Statistical Significance: ${bestLong.isStatisticallySignificant ? '✅ YES' : '⚠️  NO'}`);
  }

  console.log('\n\n💡 RECOMMENDED IMPLEMENTATION:\n');

  if (bestShort && bestLong) {
    if (bestShort.sharpeRatio > bestLong.sharpeRatio) {
      console.log('✅ PRIORITIZE: SHORT STRATEGY');
      console.log(`   Higher risk-adjusted returns (Sharpe: ${bestShort.sharpeRatio.toFixed(2)} vs ${bestLong.sharpeRatio.toFixed(2)})`);
    } else {
      console.log('✅ PRIORITIZE: LONG STRATEGY');
      console.log(`   Higher risk-adjusted returns (Sharpe: ${bestLong.sharpeRatio.toFixed(2)} vs ${bestShort.sharpeRatio.toFixed(2)})`);
    }

    console.log('\n⚠️  RISK MANAGEMENT:');
    console.log(`   Position Size: Start with $${CONFIG.defaultPositionSize} USDT per trade`);
    console.log(`   Stop Loss: ${CONFIG.maxDrawdownThreshold}% max drawdown`);
    console.log(`   Max Leverage: 3x-5x (for controlled risk)`);
    console.log(`   Trade Frequency: Max 3 trades/day (funding times: 00:00, 08:00, 16:00 UTC)`);

    console.log('\n📈 PROJECTED MONTHLY PERFORMANCE (with $1,000 capital):');
    const bestStrategy = bestShort.sharpeRatio > bestLong.sharpeRatio ? bestShort : bestLong;
    const tradesPerMonth = 3 * 30; // 3 funding times/day * 30 days
    const expectedMonthlyReturn = bestStrategy.medianReturn * tradesPerMonth;

    console.log(`   Strategy: ${bestStrategy === bestShort ? 'SHORT' : 'LONG'}`);
    console.log(`   Expected trades/month: ${tradesPerMonth}`);
    console.log(`   Median return/trade: ${bestStrategy.medianReturn.toFixed(4)}%`);
    console.log(`   Expected monthly return: ${expectedMonthlyReturn.toFixed(2)}%`);
    console.log(`   Expected monthly profit: $${(1000 * expectedMonthlyReturn / 100).toFixed(2)}`);
  }

  console.log('\n\n' + '='.repeat(100));
  console.log('✅ COMPREHENSIVE ANALYSIS COMPLETE');
  console.log('='.repeat(100) + '\n');
}

// ============================================================================
// EXECUTION
// ============================================================================

runComprehensiveAnalysis()
  .then(() => {
    console.log('✅ Analysis completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
