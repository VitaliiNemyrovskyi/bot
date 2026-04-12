/**
 * POST /api/benchmark/run
 *
 * Start a latency benchmark run across one or more exchange connectors.
 * Accepts configuration for which measurement phases to enable and
 * optional settlement window timing for jitter analysis.
 *
 * Authentication required. Only ADMIN users can trigger benchmarks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import {
  latencyBenchmarkService,
  type BenchmarkRunConfig,
  type ExchangeBenchmarkTarget,
} from '@/services/latency-benchmark.service';
import prisma from '@/lib/prisma';

interface BenchmarkRunRequestBody {
  runLabel: string;
  targets: Array<{
    exchange: string;
    credentialId: string;
    symbols: string[];
  }>;
  settlementTime?: string;
  windowSeconds?: number;
  enableOrderLatency?: boolean;
  enableWsLatency?: boolean;
  enableTimeSync?: boolean;
  enableDbWriteLatency?: boolean;
  enableSettlementJitter?: boolean;
  enableRingBufferBenchmark?: boolean;
  enableUdsBenchmark?: boolean;
  timeSyncIterations?: number;
  dbWriteIterations?: number;
  ringBufferReadIterations?: number;
  udsRoundTripIterations?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Only ADMIN users can trigger benchmarks
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    if (dbUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: ADMIN role required' },
        { status: 403 },
      );
    }

    const body: BenchmarkRunRequestBody = await request.json();

    // Validate required fields
    if (!body.runLabel || !body.targets || body.targets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'runLabel and at least one target are required' },
        { status: 400 },
      );
    }

    // Resolve credentials for each target
    const resolvedTargets: ExchangeBenchmarkTarget[] = [];
    for (const target of body.targets) {
      if (!target.credentialId || !target.exchange || !target.symbols || target.symbols.length === 0) {
        return NextResponse.json(
          { success: false, error: `Invalid target: exchange, credentialId, and symbols are required` },
          { status: 400 },
        );
      }

      const credential = await prisma.exchangeCredentials.findFirst({
        where: {
          id: target.credentialId,
          userId: user.userId,
        },
      });

      if (!credential) {
        return NextResponse.json(
          { success: false, error: `Credential ${target.credentialId} not found for user` },
          { status: 404 },
        );
      }

      resolvedTargets.push({
        exchange: target.exchange,
        apiKey: credential.apiKey,
        apiSecret: credential.apiSecret,
        authToken: credential.authToken ?? undefined,
        symbols: target.symbols,
        userId: user.userId,
        credentialId: target.credentialId,
      });
    }

    // Build benchmark config
    const config: BenchmarkRunConfig = {
      runLabel: body.runLabel,
      targets: resolvedTargets,
      settlementTime: body.settlementTime ? new Date(body.settlementTime) : undefined,
      windowSeconds: body.windowSeconds,
      enableOrderLatency: body.enableOrderLatency ?? false,
      enableWsLatency: body.enableWsLatency ?? true,
      enableTimeSync: body.enableTimeSync ?? true,
      enableDbWriteLatency: body.enableDbWriteLatency ?? true,
      enableSettlementJitter: body.enableSettlementJitter ?? false,
      enableRingBufferBenchmark: body.enableRingBufferBenchmark ?? false,
      enableUdsBenchmark: body.enableUdsBenchmark ?? false,
      timeSyncIterations: body.timeSyncIterations ?? 10,
      dbWriteIterations: body.dbWriteIterations ?? 10,
      ringBufferReadIterations: body.ringBufferReadIterations ?? 100,
      udsRoundTripIterations: body.udsRoundTripIterations ?? 50,
    };

    // Settlement jitter requires a settlement time
    if (config.enableSettlementJitter && !config.settlementTime) {
      return NextResponse.json(
        { success: false, error: 'settlementTime is required when enableSettlementJitter is true' },
        { status: 400 },
      );
    }

    // Start benchmark (runs asynchronously; returns run ID immediately)
    const runId = await latencyBenchmarkService.run(config);

    return NextResponse.json({
      success: true,
      data: {
        runId,
        runLabel: config.runLabel,
        exchanges: resolvedTargets.map((t) => t.exchange),
        symbols: [...new Set(resolvedTargets.flatMap((t) => t.symbols))],
      },
      message: 'Benchmark run started',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API Benchmark] Error starting benchmark run:', message);

    const status = message.includes('already in progress') ? 409 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
