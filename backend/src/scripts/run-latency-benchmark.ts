/**
 * Standalone Latency Benchmark Runner
 *
 * Runs benchmark measurements across multiple funding settlement windows.
 * Can be executed directly with ts-node or via package.json script.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' src/scripts/run-latency-benchmark.ts
 *
 * Environment variables required:
 *   DATABASE_URL - PostgreSQL connection string
 *
 * The script reads exchange credentials from the database for the specified user.
 * It calculates the next funding settlement time and schedules benchmark probes
 * around each settlement window.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScriptConfig {
  userId: string;
  exchanges: string[];
  symbols: string[];
  settlementCount: number;
  windowSeconds: number;
  timeSyncIterations: number;
  dbWriteIterations: number;
}

/**
 * Parse command-line arguments into script configuration.
 * All arguments are passed via environment variables to avoid shell parsing issues.
 */
function parseConfig(): ScriptConfig {
  const userId = process.env['BENCHMARK_USER_ID'];
  if (!userId) {
    throw new Error('BENCHMARK_USER_ID environment variable is required');
  }

  const exchanges = process.env['BENCHMARK_EXCHANGES'];
  if (!exchanges) {
    throw new Error('BENCHMARK_EXCHANGES environment variable is required (comma-separated, e.g. "BYBIT,BINGX")');
  }

  const symbols = process.env['BENCHMARK_SYMBOLS'];
  if (!symbols) {
    throw new Error('BENCHMARK_SYMBOLS environment variable is required (comma-separated, e.g. "BTCUSDT,ETHUSDT")');
  }

  const settlementCount = parseInt(process.env['BENCHMARK_SETTLEMENT_COUNT'] ?? '1', 10);
  const windowSeconds = parseInt(process.env['BENCHMARK_WINDOW_SECONDS'] ?? '30', 10);
  const timeSyncIterations = parseInt(process.env['BENCHMARK_TIMESYNC_ITERATIONS'] ?? '20', 10);
  const dbWriteIterations = parseInt(process.env['BENCHMARK_DB_ITERATIONS'] ?? '10', 10);

  return {
    userId,
    exchanges: exchanges.split(',').map((e) => e.trim().toUpperCase()),
    symbols: symbols.split(',').map((s) => s.trim()),
    settlementCount,
    windowSeconds,
    timeSyncIterations,
    dbWriteIterations,
  };
}

/**
 * Calculate the next funding settlement time.
 * Most perpetual futures settle funding at 00:00, 08:00, 16:00 UTC.
 */
function getNextSettlementTime(): Date {
  const now = new Date();
  const currentHour = now.getUTCHours();

  // Settlement hours: 0, 8, 16
  const settlementHours = [0, 8, 16];
  let nextSettlementHour = settlementHours.find((h) => h > currentHour);

  const settlement = new Date(now);
  settlement.setUTCMinutes(0, 0, 0);

  if (nextSettlementHour !== undefined) {
    settlement.setUTCHours(nextSettlementHour);
  } else {
    // Next settlement is tomorrow at 00:00 UTC
    settlement.setUTCDate(settlement.getUTCDate() + 1);
    settlement.setUTCHours(0);
  }

  return settlement;
}

/**
 * Get the settlement time after a given settlement time
 */
function getFollowingSettlement(after: Date): Date {
  const next = new Date(after.getTime() + 8 * 60 * 60 * 1000);
  return next;
}

/**
 * Load exchange credentials for the specified user and exchanges
 */
async function loadCredentials(
  userId: string,
  exchanges: string[],
): Promise<
  Array<{
    exchange: string;
    apiKey: string;
    apiSecret: string;
    authToken: string | null;
    credentialId: string;
  }>
> {
  const credentials = await prisma.exchangeCredentials.findMany({
    where: {
      userId,
      exchange: { in: exchanges as any[] },
      isActive: true,
    },
    select: {
      id: true,
      exchange: true,
      apiKey: true,
      apiSecret: true,
      authToken: true,
    },
  });

  return credentials.map((c) => ({
    exchange: c.exchange,
    apiKey: c.apiKey,
    apiSecret: c.apiSecret,
    authToken: c.authToken,
    credentialId: c.id,
  }));
}

/**
 * Sleep for the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run the benchmark for a single settlement window
 */
async function runSettlementBenchmark(
  config: ScriptConfig,
  settlementTime: Date,
  settlementIndex: number,
): Promise<string> {
  // Dynamically import the benchmark service (uses @/ path aliases via ts-node)
  const { LatencyBenchmarkService } = await import('../services/latency-benchmark.service');
  const service = new LatencyBenchmarkService();

  const credentials = await loadCredentials(config.userId, config.exchanges);

  if (credentials.length === 0) {
    throw new Error(
      `No active credentials found for user ${config.userId} on exchanges: ${config.exchanges.join(', ')}`,
    );
  }

  const targets = credentials.map((cred) => ({
    exchange: cred.exchange,
    apiKey: cred.apiKey,
    apiSecret: cred.apiSecret,
    authToken: cred.authToken ?? undefined,
    symbols: config.symbols,
    userId: config.userId,
    credentialId: cred.credentialId,
  }));

  const runLabel = `settlement_${settlementTime.toISOString()}_${settlementIndex + 1}of${config.settlementCount}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`[Benchmark] Settlement window ${settlementIndex + 1}/${config.settlementCount}`);
  console.log(`[Benchmark] Settlement time: ${settlementTime.toISOString()}`);
  console.log(`[Benchmark] Exchanges: ${credentials.map((c) => c.exchange).join(', ')}`);
  console.log(`[Benchmark] Symbols: ${config.symbols.join(', ')}`);
  console.log(`[Benchmark] Window: ${config.windowSeconds}s`);
  console.log(`${'='.repeat(80)}\n`);

  const runId = await service.run({
    runLabel,
    targets,
    settlementTime,
    windowSeconds: config.windowSeconds,
    enableOrderLatency: true,
    enableWsLatency: true,
    enableTimeSync: true,
    enableDbWriteLatency: true,
    enableSettlementJitter: true,
    enableRingBufferBenchmark: false,
    enableUdsBenchmark: false,
    timeSyncIterations: config.timeSyncIterations,
    dbWriteIterations: config.dbWriteIterations,
    ringBufferReadIterations: 0,
    udsRoundTripIterations: 0,
  });

  return runId;
}

/**
 * Print summary analysis for a completed run
 */
async function printRunSummary(runId: string): Promise<void> {
  const { analyzeBenchmarkRun } = await import('../services/latency-benchmark.service');
  const analysis = await analyzeBenchmarkRun(runId);

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`  Run: ${analysis.runLabel}`);
  console.log(`  Duration: ${analysis.durationMs?.toFixed(1)}ms`);
  console.log(`  Events: ${analysis.totalEvents} (${analysis.errorCount} errors)`);
  console.log(`${'─'.repeat(80)}`);

  for (const [exchange, typeStats] of Object.entries(analysis.exchangeStats)) {
    console.log(`\n  Exchange: ${exchange}`);
    for (const [eventType, stats] of Object.entries(typeStats)) {
      console.log(`    ${eventType}:`);
      console.log(`      count=${stats.count}  min=${stats.min.toFixed(2)}ms  median=${stats.median.toFixed(2)}ms  p95=${stats.p95.toFixed(2)}ms  p99=${stats.p99.toFixed(2)}ms  max=${stats.max.toFixed(2)}ms  jitter=${stats.jitter.toFixed(2)}ms`);
    }
  }

  console.log(`${'─'.repeat(80)}\n`);
}

/**
 * Main entry point
 */
async function main() {
  console.log('[Benchmark] Latency Benchmark Runner');
  console.log('[Benchmark] Starting...\n');

  const config = parseConfig();

  console.log(`[Benchmark] Configuration:`);
  console.log(`  User ID: ${config.userId}`);
  console.log(`  Exchanges: ${config.exchanges.join(', ')}`);
  console.log(`  Symbols: ${config.symbols.join(', ')}`);
  console.log(`  Settlement windows: ${config.settlementCount}`);
  console.log(`  Window size: ${config.windowSeconds}s`);
  console.log(`  Time sync iterations: ${config.timeSyncIterations}`);
  console.log(`  DB write iterations: ${config.dbWriteIterations}`);

  const runIds: string[] = [];
  let nextSettlement = getNextSettlementTime();

  for (let i = 0; i < config.settlementCount; i++) {
    // Wait until the settlement window is approaching
    const probeStartMs = nextSettlement.getTime() - (config.windowSeconds / 2) * 1000;
    const waitMs = probeStartMs - Date.now();

    // Run time sync, WS latency, order latency, and DB write probes first
    // (before the settlement window opens)
    const earlyStartMs = probeStartMs - 120_000; // Start 2 minutes before window
    const earlyWaitMs = earlyStartMs - Date.now();

    if (earlyWaitMs > 0) {
      const waitMinutes = (earlyWaitMs / 60_000).toFixed(1);
      console.log(`\n[Benchmark] Waiting ${waitMinutes} minutes until pre-settlement probes (settlement: ${nextSettlement.toISOString()})...`);
      await sleep(earlyWaitMs);
    }

    try {
      const runId = await runSettlementBenchmark(config, nextSettlement, i);
      runIds.push(runId);
      console.log(`[Benchmark] Run completed: ${runId}`);

      await printRunSummary(runId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Benchmark] Settlement ${i + 1} failed:`, message);
    }

    // Move to next settlement window
    nextSettlement = getFollowingSettlement(nextSettlement);
  }

  // Final summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[Benchmark] All settlement windows completed`);
  console.log(`[Benchmark] Run IDs: ${runIds.join(', ')}`);
  console.log(`${'='.repeat(80)}\n`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('[Benchmark] Fatal error:', error);
  prisma.$disconnect().finally(() => process.exit(1));
});
