/**
 * Latency Benchmark Runner
 *
 * Executes a comprehensive latency benchmark across configured exchange connectors.
 * Can be scheduled around funding settlement windows for jitter analysis.
 *
 * Usage:
 *   # Basic run (all probes except settlement jitter)
 *   npx tsx scripts/run-latency-benchmark.ts
 *
 *   # Settlement window run (waits for next settlement and measures jitter)
 *   npx tsx scripts/run-latency-benchmark.ts --settlement
 *
 *   # Settlement window with custom window size (seconds)
 *   npx tsx scripts/run-latency-benchmark.ts --settlement --window 60
 *
 *   # Analyze a previous run
 *   npx tsx scripts/run-latency-benchmark.ts --analyze <runId>
 *
 * Environment variables (required for exchange access):
 *   BENCHMARK_EXCHANGES - Comma-separated exchange names (e.g., "BYBIT,BINGX,BINANCE")
 *   BENCHMARK_SYMBOLS - Comma-separated symbols (e.g., "BTCUSDT,ETHUSDT")
 *   BENCHMARK_<EXCHANGE>_API_KEY - API key per exchange (e.g., BENCHMARK_BYBIT_API_KEY)
 *   BENCHMARK_<EXCHANGE>_API_SECRET - API secret per exchange
 *   BENCHMARK_<EXCHANGE>_AUTH_TOKEN - Optional auth token/passphrase per exchange
 *   BENCHMARK_TIME_SYNC_ITERATIONS - Number of time sync probes (default: 10)
 *   BENCHMARK_DB_WRITE_ITERATIONS - Number of DB write probes (default: 20)
 */

import prisma from '../src/lib/prisma';
import {
  LatencyBenchmarkService,
  analyzeBenchmarkRun,
  type BenchmarkRunConfig,
  type ExchangeBenchmarkTarget,
} from '../src/services/latency-benchmark.service';

function getEnvRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

function getEnvOptional(key: string): string | undefined {
  return process.env[key] || undefined;
}

function getEnvInt(key: string, fallbackEnvKey?: string): number | undefined {
  const value = process.env[key];
  if (value) {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  if (fallbackEnvKey) {
    const fallbackValue = process.env[fallbackEnvKey];
    if (fallbackValue) {
      const parsed = parseInt(fallbackValue, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

/**
 * Calculate the next funding settlement time (typically every 8 hours at 00:00, 08:00, 16:00 UTC)
 */
function getNextSettlementTime(): Date {
  const now = new Date();
  const utcHours = now.getUTCHours();

  // Standard 8-hour funding schedule: 00:00, 08:00, 16:00 UTC
  const settlementHours = [0, 8, 16];
  let nextHour: number | undefined;

  for (const hour of settlementHours) {
    if (hour > utcHours || (hour === utcHours && now.getUTCMinutes() < 59)) {
      nextHour = hour;
      break;
    }
  }

  const nextSettlement = new Date(now);
  nextSettlement.setUTCMinutes(0, 0, 0);

  if (nextHour !== undefined) {
    nextSettlement.setUTCHours(nextHour);
  } else {
    // Next day at 00:00 UTC
    nextSettlement.setUTCDate(nextSettlement.getUTCDate() + 1);
    nextSettlement.setUTCHours(0);
  }

  return nextSettlement;
}

/**
 * Build benchmark targets from environment variables
 */
function buildTargets(): ExchangeBenchmarkTarget[] {
  const exchanges = getEnvRequired('BENCHMARK_EXCHANGES').split(',').map((e) => e.trim().toUpperCase());
  const symbols = getEnvRequired('BENCHMARK_SYMBOLS').split(',').map((s) => s.trim());

  const targets: ExchangeBenchmarkTarget[] = [];

  for (const exchange of exchanges) {
    const apiKey = getEnvRequired(`BENCHMARK_${exchange}_API_KEY`);
    const apiSecret = getEnvRequired(`BENCHMARK_${exchange}_API_SECRET`);
    const authToken = getEnvOptional(`BENCHMARK_${exchange}_AUTH_TOKEN`);

    targets.push({
      exchange,
      apiKey,
      apiSecret,
      authToken,
      symbols,
    });
  }

  return targets;
}

/**
 * Print analysis results to console in a readable format
 */
function printAnalysis(analysis: Awaited<ReturnType<typeof analyzeBenchmarkRun>>): void {
  console.log('\n' + '='.repeat(80));
  console.log('LATENCY BENCHMARK ANALYSIS');
  console.log('='.repeat(80));
  console.log(`Run ID:       ${analysis.runId}`);
  console.log(`Label:        ${analysis.runLabel}`);
  console.log(`Started:      ${analysis.startedAt.toISOString()}`);
  console.log(`Completed:    ${analysis.completedAt?.toISOString() ?? 'N/A'}`);
  console.log(`Duration:     ${analysis.durationMs?.toFixed(1) ?? 'N/A'}ms`);
  console.log(`Total Events: ${analysis.totalEvents}`);
  console.log(`Errors:       ${analysis.errorCount}`);
  console.log(`Exchanges:    ${analysis.exchanges.join(', ')}`);
  console.log(`Symbols:      ${analysis.symbols.join(', ')}`);

  for (const [exchange, typeStats] of Object.entries(analysis.exchangeStats)) {
    console.log(`\n--- ${exchange} ---`);

    for (const [eventType, stats] of Object.entries(typeStats)) {
      console.log(`  ${eventType} (n=${stats.count}):`);
      console.log(`    min:    ${stats.min.toFixed(2)}ms`);
      console.log(`    mean:   ${stats.mean.toFixed(2)}ms`);
      console.log(`    median: ${stats.median.toFixed(2)}ms`);
      console.log(`    p95:    ${stats.p95.toFixed(2)}ms`);
      console.log(`    p99:    ${stats.p99.toFixed(2)}ms`);
      console.log(`    max:    ${stats.max.toFixed(2)}ms`);
      console.log(`    stddev: ${stats.stddev.toFixed(2)}ms`);
      console.log(`    jitter: ${stats.jitter.toFixed(2)}ms`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle --analyze mode
  const analyzeIndex = args.indexOf('--analyze');
  if (analyzeIndex !== -1) {
    const runId = args[analyzeIndex + 1];
    if (!runId) {
      console.error('Usage: --analyze <runId>');
      process.exit(1);
    }

    console.log(`Analyzing benchmark run: ${runId}...`);
    const analysis = await analyzeBenchmarkRun(runId);
    printAnalysis(analysis);
    await prisma.$disconnect();
    return;
  }

  // Build configuration
  const isSettlement = args.includes('--settlement');
  const windowIndex = args.indexOf('--window');
  const windowSeconds = windowIndex !== -1 ? parseInt(args[windowIndex + 1]!, 10) : 30;

  const targets = buildTargets();
  const timeSyncIterations = getEnvInt('BENCHMARK_TIME_SYNC_ITERATIONS') ?? 10;
  const dbWriteIterations = getEnvInt('BENCHMARK_DB_WRITE_ITERATIONS') ?? 20;

  let settlementTime: Date | undefined;
  if (isSettlement) {
    settlementTime = getNextSettlementTime();
    const waitMs = settlementTime.getTime() - Date.now() - (windowSeconds / 2) * 1000;
    console.log(`Next funding settlement: ${settlementTime.toISOString()}`);
    console.log(`Window: ${windowSeconds}s`);
    if (waitMs > 0) {
      console.log(`Waiting ${(waitMs / 1000 / 60).toFixed(1)} minutes until settlement window opens...`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const label = isSettlement
    ? `settlement_${settlementTime!.toISOString().replace(/[:.]/g, '-')}`
    : `adhoc_${timestamp}`;

  const config: BenchmarkRunConfig = {
    runLabel: label,
    targets,
    settlementTime,
    windowSeconds: isSettlement ? windowSeconds : undefined,
    enableOrderLatency: true,
    enableWsLatency: true,
    enableTimeSync: true,
    enableDbWriteLatency: true,
    enableSettlementJitter: isSettlement,
    timeSyncIterations,
    dbWriteIterations,
  };

  console.log('\nBenchmark configuration:');
  console.log(`  Label:              ${config.runLabel}`);
  console.log(`  Exchanges:          ${targets.map((t) => t.exchange).join(', ')}`);
  console.log(`  Symbols:            ${[...new Set(targets.flatMap((t) => t.symbols))].join(', ')}`);
  console.log(`  Settlement mode:    ${isSettlement}`);
  console.log(`  Time sync probes:   ${timeSyncIterations}`);
  console.log(`  DB write probes:    ${dbWriteIterations}`);
  console.log('');

  // Run benchmark
  const service = new LatencyBenchmarkService();

  service.on(LatencyBenchmarkService.EVENT_PROGRESS, (data: { phase: string; eventCount: number }) => {
    console.log(`  [progress] ${data.phase}: ${data.eventCount} events`);
  });

  const runId = await service.run(config);

  // Print analysis
  const analysis = await analyzeBenchmarkRun(runId);
  printAnalysis(analysis);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Benchmark failed:', error);
  prisma.$disconnect().finally(() => process.exit(1));
});
