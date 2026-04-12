import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as net from 'net';
import prisma from '@/lib/prisma';
import { BenchmarkEventType } from '@prisma/client';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import { ExchangeConnectorFactory } from '@/connectors/exchange.factory';
import { websocketManager } from '@/services/websocket-manager.service';
import {
  RING_BUFFER_SLOT_SIZE,
  RING_BUFFER_HEADER_SIZE,
  SHM_PATH_DEFAULT,
  SHM_PATH_ENV,
  UDS_SOCKET_PATH_DEFAULT,
  UDS_SOCKET_PATH_ENV,
} from '@/execution-engine/ipc-protocol';

/**
 * Configuration for a single exchange benchmark target
 */
export interface ExchangeBenchmarkTarget {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  authToken?: string;
  symbols: string[];
  userId?: string;
  credentialId?: string;
}

/**
 * Configuration for a full benchmark run
 */
export interface BenchmarkRunConfig {
  runLabel: string;
  targets: ExchangeBenchmarkTarget[];
  settlementTime?: Date;
  windowSeconds?: number;
  enableOrderLatency: boolean;
  enableWsLatency: boolean;
  enableTimeSync: boolean;
  enableDbWriteLatency: boolean;
  enableSettlementJitter: boolean;
  enableRingBufferBenchmark: boolean;
  enableUdsBenchmark: boolean;
  timeSyncIterations: number;
  dbWriteIterations: number;
  ringBufferReadIterations: number;
  udsRoundTripIterations: number;
}

/**
 * Raw event captured during benchmarking
 */
interface RawBenchmarkEvent {
  eventType: BenchmarkEventType;
  exchange: string;
  symbol?: string;
  startNs: bigint;
  endNs: bigint;
  payload?: Record<string, unknown>;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Latency Benchmark Service
 *
 * Measures end-to-end latency across all exchange connectors, WebSocket streams,
 * time synchronization accuracy, database writes, and settlement window jitter.
 *
 * Design principles:
 * - Read-only observation where possible (no real orders in observation mode)
 * - High-resolution timestamps via process.hrtime.bigint() (nanosecond precision)
 * - All raw data persisted to PostgreSQL for post-hoc statistical analysis
 * - Non-interfering with production execution (separate benchmark mode)
 */
export class LatencyBenchmarkService extends EventEmitter {
  private runId: string | null = null;
  private connectors: Map<string, BaseExchangeConnector> = new Map();
  private unsubscribeFns: Array<() => void> = [];
  private isRunning = false;

  static readonly EVENT_STARTED = 'benchmark:started';
  static readonly EVENT_PROGRESS = 'benchmark:progress';
  static readonly EVENT_COMPLETED = 'benchmark:completed';
  static readonly EVENT_ERROR = 'benchmark:error';

  /**
   * Execute a full benchmark run with the given configuration.
   * Returns the benchmark run ID for later analysis.
   */
  async run(config: BenchmarkRunConfig): Promise<string> {
    if (this.isRunning) {
      throw new Error('Benchmark already in progress');
    }

    this.isRunning = true;
    const runStartNs = process.hrtime.bigint();
    const events: RawBenchmarkEvent[] = [];

    try {
      // Create the benchmark run record
      const exchangeNames = config.targets.map((t) => t.exchange);
      const allSymbols = [...new Set(config.targets.flatMap((t) => t.symbols))];

      const benchmarkRun = await prisma.benchmarkRun.create({
        data: {
          runLabel: config.runLabel,
          startedAt: new Date(),
          exchanges: exchangeNames,
          symbols: allSymbols,
          settlementTime: config.settlementTime ?? null,
          windowSeconds: config.windowSeconds ?? null,
          config: JSON.parse(JSON.stringify({
            enableOrderLatency: config.enableOrderLatency,
            enableWsLatency: config.enableWsLatency,
            enableTimeSync: config.enableTimeSync,
            enableDbWriteLatency: config.enableDbWriteLatency,
            enableSettlementJitter: config.enableSettlementJitter,
            enableRingBufferBenchmark: config.enableRingBufferBenchmark,
            enableUdsBenchmark: config.enableUdsBenchmark,
            timeSyncIterations: config.timeSyncIterations,
            dbWriteIterations: config.dbWriteIterations,
            ringBufferReadIterations: config.ringBufferReadIterations,
            udsRoundTripIterations: config.udsRoundTripIterations,
          })),
        },
      });

      this.runId = benchmarkRun.id;
      this.emit(LatencyBenchmarkService.EVENT_STARTED, { runId: this.runId, config });
      console.log(`[LatencyBenchmark] Run started: ${this.runId} (${config.runLabel})`);

      // Initialize all connectors
      await this.initializeConnectors(config.targets);

      // Execute benchmark phases sequentially (order matters for settlement window timing)
      if (config.enableTimeSync) {
        const timeSyncEvents = await this.measureTimeSyncLatency(config);
        events.push(...timeSyncEvents);
        this.emitProgress('timeSync', timeSyncEvents.length);
      }

      if (config.enableWsLatency) {
        const wsEvents = await this.measureWebSocketLatency(config);
        events.push(...wsEvents);
        this.emitProgress('wsLatency', wsEvents.length);
      }

      if (config.enableDbWriteLatency) {
        const dbEvents = await this.measureDbWriteLatency(config);
        events.push(...dbEvents);
        this.emitProgress('dbWriteLatency', dbEvents.length);
      }

      if (config.enableOrderLatency) {
        const orderEvents = await this.measureOrderLatency(config);
        events.push(...orderEvents);
        this.emitProgress('orderLatency', orderEvents.length);
      }

      if (config.enableRingBufferBenchmark) {
        const rbEvents = await this.measureRingBufferReadThroughput(config);
        events.push(...rbEvents);
        this.emitProgress('ringBufferRead', rbEvents.length);
      }

      if (config.enableUdsBenchmark) {
        const udsEvents = await this.measureUdsRoundTrip(config);
        events.push(...udsEvents);
        this.emitProgress('udsRoundTrip', udsEvents.length);
      }

      if (config.enableSettlementJitter && config.settlementTime) {
        const jitterEvents = await this.measureSettlementJitter(config);
        events.push(...jitterEvents);
        this.emitProgress('settlementJitter', jitterEvents.length);
      }

      // Persist all events in a single batch
      await this.persistEvents(this.runId, events);

      // Finalize the run record
      const runEndNs = process.hrtime.bigint();
      const durationMs = Number(runEndNs - runStartNs) / 1_000_000;
      const errorCount = events.filter((e) => e.isError).length;

      await prisma.benchmarkRun.update({
        where: { id: this.runId },
        data: {
          completedAt: new Date(),
          durationMs,
          totalEvents: events.length,
          errorCount,
        },
      });

      console.log(`[LatencyBenchmark] Run completed: ${this.runId} (${events.length} events, ${errorCount} errors, ${durationMs.toFixed(1)}ms)`);
      this.emit(LatencyBenchmarkService.EVENT_COMPLETED, {
        runId: this.runId,
        totalEvents: events.length,
        errorCount,
        durationMs,
      });

      return this.runId;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[LatencyBenchmark] Run failed:`, message);
      this.emit(LatencyBenchmarkService.EVENT_ERROR, { runId: this.runId, error: message });

      if (this.runId) {
        await prisma.benchmarkRun.update({
          where: { id: this.runId },
          data: {
            completedAt: new Date(),
            durationMs: Number(process.hrtime.bigint() - runStartNs) / 1_000_000,
            errorCount: events.filter((e) => e.isError).length,
            totalEvents: events.length,
          },
        }).catch((e: Error) => console.error(`[LatencyBenchmark] Failed to update run record:`, e.message));
      }

      throw error;
    } finally {
      await this.cleanup();
      this.isRunning = false;
    }
  }

  /**
   * Initialize exchange connectors for all benchmark targets
   */
  private async initializeConnectors(targets: ExchangeBenchmarkTarget[]): Promise<void> {
    for (const target of targets) {
      const key = target.exchange.toUpperCase();
      if (this.connectors.has(key)) {
        continue;
      }

      console.log(`[LatencyBenchmark] Initializing connector: ${key}`);
      const connector = ExchangeConnectorFactory.create(
        target.exchange,
        target.apiKey,
        target.apiSecret,
        target.userId,
        target.credentialId,
        target.authToken,
      );

      await connector.initialize();
      this.connectors.set(key, connector);
      console.log(`[LatencyBenchmark] Connector initialized: ${key}`);
    }
  }

  /**
   * Measure time synchronization accuracy between local clock and each exchange.
   * Uses getMarketPrice as a lightweight REST probe to measure round-trip time
   * and derives clock offset from exchange response timestamps.
   */
  private async measureTimeSyncLatency(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];

    for (const target of config.targets) {
      const connector = this.connectors.get(target.exchange.toUpperCase());
      if (!connector) {
        continue;
      }

      const symbol = target.symbols[0];
      if (!symbol) {
        continue;
      }

      for (let i = 0; i < config.timeSyncIterations; i++) {
        const startNs = process.hrtime.bigint();
        const localTimeBefore = Date.now();

        try {
          await connector.getMarketPrice(symbol);
          const localTimeAfter = Date.now();
          const endNs = process.hrtime.bigint();

          // Round-trip time in ms
          const roundTripMs = localTimeAfter - localTimeBefore;
          // Estimated one-way latency (half round-trip)
          const estimatedOneWayMs = roundTripMs / 2;

          events.push({
            eventType: 'TIME_SYNC',
            exchange: target.exchange,
            symbol,
            startNs,
            endNs,
            payload: {
              localTimeBefore,
              localTimeAfter,
              roundTripMs,
              estimatedOneWayMs,
              iteration: i,
            },
            isError: false,
          });
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'TIME_SYNC',
            exchange: target.exchange,
            symbol,
            startNs,
            endNs,
            payload: { iteration: i },
            isError: true,
            errorMessage: message,
          });
        }
      }
    }

    return events;
  }

  /**
   * Measure WebSocket subscription-to-first-callback latency per exchange/symbol.
   * Subscribes to the price stream and measures time until first data arrives.
   */
  private async measureWebSocketLatency(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];

    for (const target of config.targets) {
      const connector = this.connectors.get(target.exchange.toUpperCase());
      if (!connector) {
        continue;
      }

      for (const symbol of target.symbols) {
        const startNs = process.hrtime.bigint();

        try {
          const result = await this.measureSingleWsLatency(connector, target.exchange, symbol);
          events.push(result);
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'WS_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs,
            endNs,
            payload: {},
            isError: true,
            errorMessage: message,
          });
        }
      }
    }

    return events;
  }

  /**
   * Measure time from subscribeToPriceStream call to receiving the first price callback.
   * Enforces a timeout to prevent indefinite waiting.
   */
  private measureSingleWsLatency(
    connector: BaseExchangeConnector,
    exchange: string,
    symbol: string,
  ): Promise<RawBenchmarkEvent> {
    const WS_TIMEOUT_MS = 30_000;

    return new Promise((resolve) => {
      const startNs = process.hrtime.bigint();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const endNs = process.hrtime.bigint();
          resolve({
            eventType: 'WS_LATENCY',
            exchange,
            symbol,
            startNs,
            endNs,
            payload: { timedOut: true, timeoutMs: WS_TIMEOUT_MS },
            isError: true,
            errorMessage: `WebSocket first-message timeout after ${WS_TIMEOUT_MS}ms`,
          });
        }
      }, WS_TIMEOUT_MS);

      connector
        .subscribeToPriceStream(symbol, (price: number, timestamp: number) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            const endNs = process.hrtime.bigint();

            resolve({
              eventType: 'WS_LATENCY',
              exchange,
              symbol,
              startNs,
              endNs,
              payload: {
                firstPrice: price,
                exchangeTimestamp: timestamp,
                localTimestamp: Date.now(),
              },
              isError: false,
            });
          }
        })
        .then((unsub) => {
          this.unsubscribeFns.push(unsub);
          // If already resolved (timeout), unsubscribe immediately
          if (resolved) {
            unsub();
          }
        })
        .catch((error: unknown) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            const endNs = process.hrtime.bigint();
            const message = error instanceof Error ? error.message : String(error);
            resolve({
              eventType: 'WS_LATENCY',
              exchange,
              symbol,
              startNs,
              endNs,
              payload: {},
              isError: true,
              errorMessage: message,
            });
          }
        });
    });
  }

  /**
   * Measure database write latency by inserting and deleting a benchmark event row.
   * This directly tests Prisma-through-PostgreSQL round-trip performance.
   */
  private async measureDbWriteLatency(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];

    for (let i = 0; i < config.dbWriteIterations; i++) {
      const startNs = process.hrtime.bigint();

      try {
        // Insert a throwaway row to measure write latency
        const record = await prisma.benchmarkEvent.create({
          data: {
            benchmarkRunId: this.runId!,
            eventType: 'DB_WRITE_LATENCY',
            exchange: 'SYSTEM',
            startNs: startNs,
            endNs: BigInt(0), // Placeholder, will be updated
            latencyNs: BigInt(0),
            latencyMs: 0,
            payload: { iteration: i, operation: 'probe_write' },
          },
        });

        const endNs = process.hrtime.bigint();

        // Update the probe row with actual measurements
        const latencyNs = endNs - startNs;
        const latencyMs = Number(latencyNs) / 1_000_000;

        await prisma.benchmarkEvent.update({
          where: { id: record.id },
          data: {
            endNs,
            latencyNs,
            latencyMs,
            payload: {
              iteration: i,
              operation: 'probe_write',
              table: 'benchmark_events',
              probeId: record.id,
            },
          },
        });

        // Track in our local events array (but skip persisting since already written)
        events.push({
          eventType: 'DB_WRITE_LATENCY',
          exchange: 'SYSTEM',
          startNs,
          endNs,
          payload: {
            iteration: i,
            operation: 'probe_write',
            table: 'benchmark_events',
            probeId: record.id,
            alreadyPersisted: true,
          },
          isError: false,
        });
      } catch (error: unknown) {
        const endNs = process.hrtime.bigint();
        const message = error instanceof Error ? error.message : String(error);
        events.push({
          eventType: 'DB_WRITE_LATENCY',
          exchange: 'SYSTEM',
          startNs,
          endNs,
          payload: { iteration: i, operation: 'probe_write' },
          isError: true,
          errorMessage: message,
        });
      }
    }

    return events;
  }

  /**
   * Measure order placement latency (trade decision to order acknowledgment).
   * Uses getMarketPrice + getBalance as a read-only proxy for order flow latency
   * to avoid placing real orders in benchmark mode.
   *
   * For actual order latency measurement, call measureRealOrderLatency() with
   * explicit confirmation that you accept real order placement on a test account.
   */
  private async measureOrderLatency(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];

    for (const target of config.targets) {
      const connector = this.connectors.get(target.exchange.toUpperCase());
      if (!connector) {
        continue;
      }

      for (const symbol of target.symbols) {
        // Phase 1: Market price fetch latency (REST API round-trip)
        const priceStartNs = process.hrtime.bigint();
        try {
          const price = await connector.getMarketPrice(symbol);
          const priceEndNs = process.hrtime.bigint();

          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: priceStartNs,
            endNs: priceEndNs,
            payload: {
              phase: 'market_price_fetch',
              price,
              description: 'REST API round-trip for market price (proxy for order pre-flight)',
            },
            isError: false,
          });
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: priceStartNs,
            endNs,
            payload: { phase: 'market_price_fetch' },
            isError: true,
            errorMessage: message,
          });
        }

        // Phase 2: Balance check latency (authenticated REST API round-trip)
        const balanceStartNs = process.hrtime.bigint();
        try {
          await connector.getBalance();
          const balanceEndNs = process.hrtime.bigint();

          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: balanceStartNs,
            endNs: balanceEndNs,
            payload: {
              phase: 'balance_check',
              description: 'Authenticated REST API round-trip for balance (proxy for order auth latency)',
            },
            isError: false,
          });
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: balanceStartNs,
            endNs,
            payload: { phase: 'balance_check' },
            isError: true,
            errorMessage: message,
          });
        }

        // Phase 3: Position check latency
        const posStartNs = process.hrtime.bigint();
        try {
          await connector.getPosition(symbol);
          const posEndNs = process.hrtime.bigint();

          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: posStartNs,
            endNs: posEndNs,
            payload: {
              phase: 'position_check',
              description: 'Authenticated REST API round-trip for position query',
            },
            isError: false,
          });
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'ORDER_LATENCY',
            exchange: target.exchange,
            symbol,
            startNs: posStartNs,
            endNs,
            payload: { phase: 'position_check' },
            isError: true,
            errorMessage: message,
          });
        }
      }
    }

    return events;
  }

  /**
   * Measure real order placement latency on a test/sandbox account.
   * THIS PLACES REAL ORDERS. Only use with test accounts or minimum order sizes.
   *
   * @param connector - Initialized exchange connector
   * @param exchange - Exchange name
   * @param symbol - Trading symbol
   * @param side - Order side (Buy/Sell)
   * @param quantity - Order quantity (use minimum allowed)
   */
  async measureRealOrderLatency(
    connector: BaseExchangeConnector,
    exchange: string,
    symbol: string,
    side: 'Buy' | 'Sell',
    quantity: number,
  ): Promise<RawBenchmarkEvent> {
    const startNs = process.hrtime.bigint();

    try {
      const result = await connector.placeMarketOrder(symbol, side, quantity);
      const endNs = process.hrtime.bigint();

      return {
        eventType: 'ORDER_LATENCY',
        exchange,
        symbol,
        startNs,
        endNs,
        payload: {
          phase: 'real_order',
          orderId: result?.orderId ?? result?.result?.orderId,
          side,
          quantity,
          ackTimestamp: Date.now(),
        },
        isError: false,
      };
    } catch (error: unknown) {
      const endNs = process.hrtime.bigint();
      const message = error instanceof Error ? error.message : String(error);
      return {
        eventType: 'ORDER_LATENCY',
        exchange,
        symbol,
        startNs,
        endNs,
        payload: { phase: 'real_order', side, quantity },
        isError: true,
        errorMessage: message,
      };
    }
  }

  /**
   * Measure latency jitter during the funding settlement window.
   * Runs continuous probes (market price fetches) for `windowSeconds` seconds
   * centered around the settlement time, recording the offset from settlement.
   */
  private async measureSettlementJitter(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];
    const settlementTime = config.settlementTime!;
    const windowSeconds = config.windowSeconds ?? 30;
    const halfWindow = windowSeconds / 2;

    // Calculate when to start probing
    const probeStartTime = new Date(settlementTime.getTime() - halfWindow * 1000);
    const probeEndTime = new Date(settlementTime.getTime() + halfWindow * 1000);

    // Wait until probe start time
    const waitMs = probeStartTime.getTime() - Date.now();
    if (waitMs > 0) {
      console.log(`[LatencyBenchmark] Waiting ${(waitMs / 1000).toFixed(1)}s until settlement window opens...`);
      await this.sleep(waitMs);
    }

    console.log(`[LatencyBenchmark] Settlement jitter measurement started (window: ${windowSeconds}s)`);

    // Continuous probing loop until window closes
    while (Date.now() < probeEndTime.getTime()) {
      const secondsFromSettlement = (Date.now() - settlementTime.getTime()) / 1000;

      // Probe all targets in parallel
      const probePromises = config.targets.map(async (target) => {
        const connector = this.connectors.get(target.exchange.toUpperCase());
        if (!connector) {
          return;
        }

        const symbol = target.symbols[0];
        if (!symbol) {
          return;
        }

        const startNs = process.hrtime.bigint();
        try {
          await connector.getMarketPrice(symbol);
          const endNs = process.hrtime.bigint();

          events.push({
            eventType: 'SETTLEMENT_JITTER',
            exchange: target.exchange,
            symbol,
            startNs,
            endNs,
            payload: {
              secondsFromSettlement: parseFloat(secondsFromSettlement.toFixed(3)),
              measurementType: 'market_price_probe',
              settlementTime: settlementTime.toISOString(),
            },
            isError: false,
          });
        } catch (error: unknown) {
          const endNs = process.hrtime.bigint();
          const message = error instanceof Error ? error.message : String(error);
          events.push({
            eventType: 'SETTLEMENT_JITTER',
            exchange: target.exchange,
            symbol,
            startNs,
            endNs,
            payload: {
              secondsFromSettlement: parseFloat(secondsFromSettlement.toFixed(3)),
              measurementType: 'market_price_probe',
              settlementTime: settlementTime.toISOString(),
            },
            isError: true,
            errorMessage: message,
          });
        }
      });

      await Promise.all(probePromises);

      // Brief pause between probe rounds to avoid rate limiting
      // 200ms gives ~5 probes/second per exchange
      await this.sleep(200);
    }

    console.log(`[LatencyBenchmark] Settlement jitter measurement completed (${events.length} probes)`);
    return events;
  }

  /**
   * Measure ring buffer read throughput and per-read latency.
   *
   * Opens the shared memory file at the configured SHM_PATH and performs
   * sequential reads (header refresh + slot refresh) to measure:
   * - Per-read latency (nanoseconds) for pread syscalls
   * - Sustainable read throughput (reads/second)
   *
   * This benchmarks the TypeScript reader side of the SPSC ring buffer,
   * which is the bottleneck in the C++ -> TypeScript market data path.
   */
  private async measureRingBufferReadThroughput(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];
    const shmPath = process.env[SHM_PATH_ENV] ?? SHM_PATH_DEFAULT;
    const iterations = config.ringBufferReadIterations;

    console.log(`[LatencyBenchmark] Ring buffer read benchmark: ${iterations} iterations on ${shmPath}`);

    let fd: number;
    try {
      fd = fs.openSync(shmPath, 'r');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[LatencyBenchmark] Cannot open ring buffer at ${shmPath}: ${message}`);
      events.push({
        eventType: 'RING_BUFFER_READ',
        exchange: 'SYSTEM',
        startNs: process.hrtime.bigint(),
        endNs: process.hrtime.bigint(),
        payload: { error: 'shm_file_not_found', path: shmPath },
        isError: true,
        errorMessage: message,
      });
      return events;
    }

    try {
      const stats = fs.fstatSync(fd);
      const totalBytes = stats.size;

      if (totalBytes < RING_BUFFER_HEADER_SIZE) {
        events.push({
          eventType: 'RING_BUFFER_READ',
          exchange: 'SYSTEM',
          startNs: process.hrtime.bigint(),
          endNs: process.hrtime.bigint(),
          payload: { error: 'shm_file_too_small', size: totalBytes },
          isError: true,
          errorMessage: `Ring buffer file too small: ${totalBytes} bytes`,
        });
        return events;
      }

      const headerBuf = Buffer.alloc(RING_BUFFER_HEADER_SIZE);
      const slotBuf = Buffer.alloc(RING_BUFFER_SLOT_SIZE);

      // Warm-up: read header once to page in memory
      fs.readSync(fd, headerBuf, 0, RING_BUFFER_HEADER_SIZE, 0);

      // Read the slot count from the header to compute valid slot offsets
      const slotCount = headerBuf.readUInt32LE(8);

      for (let i = 0; i < iterations; i++) {
        const startNs = process.hrtime.bigint();

        // Simulate a full tryRead() cycle: header + slot + slot (torn check)
        fs.readSync(fd, headerBuf, 0, RING_BUFFER_HEADER_SIZE, 0);

        // Read a slot at a pseudo-random offset within the valid range
        const slotIndex = i % (slotCount || 1);
        const slotOffset = RING_BUFFER_HEADER_SIZE + slotIndex * RING_BUFFER_SLOT_SIZE;

        if (slotOffset + RING_BUFFER_SLOT_SIZE <= totalBytes) {
          fs.readSync(fd, slotBuf, 0, RING_BUFFER_SLOT_SIZE, slotOffset);
          // Second read for torn-write detection
          fs.readSync(fd, slotBuf, 0, RING_BUFFER_SLOT_SIZE, slotOffset);
        }

        const endNs = process.hrtime.bigint();

        events.push({
          eventType: 'RING_BUFFER_READ',
          exchange: 'SYSTEM',
          startNs,
          endNs,
          payload: {
            iteration: i,
            slotIndex,
            syscalls: 3,
            headerBytes: RING_BUFFER_HEADER_SIZE,
            slotBytes: RING_BUFFER_SLOT_SIZE,
          },
          isError: false,
        });
      }

      // Compute aggregate stats for logging
      const latencies = events
        .filter((e) => !e.isError)
        .map((e) => Number(e.endNs - e.startNs));

      if (latencies.length > 0) {
        const sorted = [...latencies].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)]!;
        const p95 = sorted[Math.floor(sorted.length * 0.95)]!;
        const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const throughput = Math.round(1_000_000_000 / mean);

        console.log(`[LatencyBenchmark] Ring buffer read results:` +
          ` median=${(median / 1000).toFixed(1)}us` +
          ` p95=${(p95 / 1000).toFixed(1)}us` +
          ` throughput=${throughput} reads/sec`);
      }
    } finally {
      fs.closeSync(fd);
    }

    return events;
  }

  /**
   * Measure Unix domain socket round-trip time.
   *
   * Connects to the execution engine UDS, sends a GET_ENGINE_STATUS command,
   * and measures the time until the response is received. This captures the
   * full IPC overhead: JSON serialization, kernel socket transfer, JSON
   * deserialization, and response processing.
   *
   * If the UDS is not available (engine not running), records an error event.
   */
  private async measureUdsRoundTrip(config: BenchmarkRunConfig): Promise<RawBenchmarkEvent[]> {
    const events: RawBenchmarkEvent[] = [];
    const socketPath = process.env[UDS_SOCKET_PATH_ENV] ?? UDS_SOCKET_PATH_DEFAULT;
    const iterations = config.udsRoundTripIterations;

    console.log(`[LatencyBenchmark] UDS round-trip benchmark: ${iterations} iterations on ${socketPath}`);

    // Check if socket file exists
    if (!fs.existsSync(socketPath)) {
      console.warn(`[LatencyBenchmark] UDS socket not found at ${socketPath}`);
      events.push({
        eventType: 'UDS_ROUND_TRIP',
        exchange: 'SYSTEM',
        startNs: process.hrtime.bigint(),
        endNs: process.hrtime.bigint(),
        payload: { error: 'socket_not_found', path: socketPath },
        isError: true,
        errorMessage: `UDS socket not found at ${socketPath}`,
      });
      return events;
    }

    // Connect to UDS
    let socket: net.Socket;
    try {
      socket = await this.connectToUds(socketPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      events.push({
        eventType: 'UDS_ROUND_TRIP',
        exchange: 'SYSTEM',
        startNs: process.hrtime.bigint(),
        endNs: process.hrtime.bigint(),
        payload: { error: 'connect_failed', path: socketPath },
        isError: true,
        errorMessage: message,
      });
      return events;
    }

    try {
      for (let i = 0; i < iterations; i++) {
        const startNs = process.hrtime.bigint();

        try {
          await this.sendUdsPing(socket, i);
          const endNs = process.hrtime.bigint();

          events.push({
            eventType: 'UDS_ROUND_TRIP',
            exchange: 'SYSTEM',
            startNs,
            endNs,
            payload: {
              iteration: i,
              commandType: 'cmd:get_engine_status',
            },
            isError: false,
          });
        } catch (err: unknown) {
          const endNs = process.hrtime.bigint();
          const message = err instanceof Error ? err.message : String(err);
          events.push({
            eventType: 'UDS_ROUND_TRIP',
            exchange: 'SYSTEM',
            startNs,
            endNs,
            payload: { iteration: i },
            isError: true,
            errorMessage: message,
          });
        }
      }

      // Compute aggregate stats for logging
      const latencies = events
        .filter((e) => !e.isError)
        .map((e) => Number(e.endNs - e.startNs));

      if (latencies.length > 0) {
        const sorted = [...latencies].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)]!;
        const p95 = sorted[Math.floor(sorted.length * 0.95)]!;
        const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;

        console.log(`[LatencyBenchmark] UDS round-trip results:` +
          ` median=${(median / 1_000_000).toFixed(2)}ms` +
          ` p95=${(p95 / 1_000_000).toFixed(2)}ms` +
          ` mean=${(mean / 1_000_000).toFixed(2)}ms`);
      }
    } finally {
      socket.destroy();
    }

    return events;
  }

  /**
   * Connect to the execution engine UDS.
   */
  private connectToUds(socketPath: string): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ path: socketPath }, () => {
        resolve(socket);
      });

      socket.on('error', (err) => {
        reject(err);
      });

      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('UDS connection timeout'));
      }, 5000);

      socket.once('connect', () => {
        clearTimeout(timeout);
      });
    });
  }

  /**
   * Send a length-prefixed JSON command over UDS and wait for response.
   * Uses GET_ENGINE_STATUS as a lightweight ping command.
   */
  private sendUdsPing(socket: net.Socket, seq: number): Promise<void> {
    const RESPONSE_TIMEOUT_MS = 5000;

    return new Promise((resolve, reject) => {
      const correlationId = `benchmark-${Date.now()}-${seq}`;

      const envelope = {
        seq,
        timestampNs: process.hrtime.bigint().toString(),
        correlationId,
        type: 'cmd:get_engine_status',
        payload: {},
      };

      const json = JSON.stringify(envelope);
      const payloadBuf = Buffer.from(json, 'utf-8');
      const header = Buffer.alloc(4);
      header.writeUInt32BE(payloadBuf.length, 0);

      const frame = Buffer.concat([header, payloadBuf]);

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('UDS ping timeout'));
      }, RESPONSE_TIMEOUT_MS);

      const onData = (_data: Buffer) => {
        // Any response means the round-trip completed.
        // We do not parse the response for benchmark purposes --
        // we only need the timing.
        cleanup();
        resolve();
      };

      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      const cleanup = () => {
        clearTimeout(timeout);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
      };

      socket.on('data', onData);
      socket.on('error', onError);
      socket.write(frame);
    });
  }

  /**
   * Persist raw benchmark events to PostgreSQL in batch.
   * Skips events that were already persisted during measurement (DB_WRITE_LATENCY probes).
   */
  private async persistEvents(runId: string, events: RawBenchmarkEvent[]): Promise<void> {
    const toInsert = events.filter(
      (e) => !(e.payload && (e.payload as Record<string, unknown>)['alreadyPersisted']),
    );

    if (toInsert.length === 0) {
      return;
    }

    console.log(`[LatencyBenchmark] Persisting ${toInsert.length} events...`);

    // Batch insert in chunks to avoid oversized queries
    const BATCH_SIZE = 100;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);

      await prisma.benchmarkEvent.createMany({
        data: batch.map((event) => ({
          benchmarkRunId: runId,
          eventType: event.eventType,
          exchange: event.exchange,
          symbol: event.symbol ?? null,
          startNs: event.startNs,
          endNs: event.endNs,
          latencyNs: event.endNs - event.startNs,
          latencyMs: Number(event.endNs - event.startNs) / 1_000_000,
          payload: event.payload ? JSON.parse(JSON.stringify(event.payload)) : null,
          isError: event.isError,
          errorMessage: event.errorMessage ?? null,
        })),
      });
    }
  }

  /**
   * Clean up resources (WebSocket subscriptions, connector references)
   */
  private async cleanup(): Promise<void> {
    console.log(`[LatencyBenchmark] Cleaning up ${this.unsubscribeFns.length} subscriptions...`);

    for (const unsub of this.unsubscribeFns) {
      try {
        unsub();
      } catch (_error: unknown) {
        // Ignore cleanup errors
      }
    }

    this.unsubscribeFns = [];
    this.connectors.clear();
    this.runId = null;
  }

  /**
   * Emit progress event for monitoring
   */
  private emitProgress(phase: string, eventCount: number): void {
    console.log(`[LatencyBenchmark] Phase '${phase}' completed: ${eventCount} events`);
    this.emit(LatencyBenchmarkService.EVENT_PROGRESS, {
      runId: this.runId,
      phase,
      eventCount,
    });
  }

  /**
   * Promise-based sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Analyze benchmark results for a given run ID.
 * Returns aggregate statistics grouped by exchange and event type.
 */
export async function analyzeBenchmarkRun(runId: string): Promise<BenchmarkAnalysis> {
  const events = await prisma.benchmarkEvent.findMany({
    where: { benchmarkRunId: runId },
    orderBy: { recordedAt: 'asc' },
  });

  const run = await prisma.benchmarkRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    throw new Error(`Benchmark run not found: ${runId}`);
  }

  const byExchange = new Map<string, Map<string, number[]>>();

  for (const event of events) {
    if (event.isError) {
      continue;
    }

    const exchangeMap = byExchange.get(event.exchange) ?? new Map<string, number[]>();
    byExchange.set(event.exchange, exchangeMap);

    const latencies = exchangeMap.get(event.eventType) ?? [];
    latencies.push(event.latencyMs);
    exchangeMap.set(event.eventType, latencies);
  }

  const exchangeStats: Record<string, Record<string, LatencyStats>> = {};

  for (const [exchange, typeMap] of byExchange.entries()) {
    exchangeStats[exchange] = {};
    for (const [eventType, latencies] of typeMap.entries()) {
      exchangeStats[exchange][eventType] = computeLatencyStats(latencies);
    }
  }

  return {
    runId,
    runLabel: run.runLabel,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    durationMs: run.durationMs,
    totalEvents: events.length,
    errorCount: events.filter((e) => e.isError).length,
    exchanges: run.exchanges,
    symbols: run.symbols,
    exchangeStats,
  };
}

/**
 * Compute descriptive statistics for an array of latency values
 */
function computeLatencyStats(values: number[]): LatencyStats {
  if (values.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0, stddev: 0, jitter: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0]!;
  const max = sorted[count - 1]!;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const median = count % 2 === 0
    ? (sorted[count / 2 - 1]! + sorted[count / 2]!) / 2
    : sorted[Math.floor(count / 2)]!;

  const p95 = sorted[Math.floor(count * 0.95)]!;
  const p99 = sorted[Math.floor(count * 0.99)]!;

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stddev = Math.sqrt(variance);

  // Jitter: standard deviation of consecutive differences
  let jitter = 0;
  if (count > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < count; i++) {
      diffs.push(Math.abs(sorted[i]! - sorted[i - 1]!));
    }
    const diffMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    jitter = Math.sqrt(diffs.reduce((acc, d) => acc + Math.pow(d - diffMean, 2), 0) / diffs.length);
  }

  return { count, min, max, mean, median, p95, p99, stddev, jitter };
}

export interface LatencyStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  stddev: number;
  jitter: number;
}

export interface BenchmarkAnalysis {
  runId: string;
  runLabel: string;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  totalEvents: number;
  errorCount: number;
  exchanges: string[];
  symbols: string[];
  exchangeStats: Record<string, Record<string, LatencyStats>>;
}

// Export singleton instance
export const latencyBenchmarkService = new LatencyBenchmarkService();
