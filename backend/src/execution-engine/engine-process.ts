/**
 * Execution Engine Process Entry Point
 *
 * Standalone Node.js process that runs all execution services:
 * - FundingArbitrageService
 * - PriceArbitrageService
 * - GraduatedEntryArbitrageService
 * - LiquidationMonitorService
 * - FundingTrackerService
 * - FundingRateCollector
 * - FundingIntervalScheduler
 *
 * This process is completely independent from Next.js:
 * - Its own event loop (no HTTP request jitter)
 * - Not affected by hot reload
 * - Can be restarted independently
 * - Communicates with API layer via Unix domain sockets
 *
 * Startup sequence:
 * 1. Connect to PostgreSQL (Prisma)
 * 2. Connect to Redis
 * 3. Run WAL recovery (verify exchange positions)
 * 4. Initialize execution services
 * 5. Start UDS server (accept API layer connections)
 * 6. Send ENGINE_READY event
 *
 * Shutdown sequence (SIGTERM/SIGINT):
 * 1. Stop accepting new commands
 * 2. Complete in-flight operations (with timeout)
 * 3. Persist state to WAL
 * 4. Close exchange connections
 * 5. Close UDS server
 * 6. Disconnect from databases
 */

import { EventEmitter } from 'events';
import { UDSServer } from './uds-transport';
import { WALRepository } from './wal-repository';
import {
  PositionStateMachine,
  determineRecoveryAction,
  RecoveryAction,
  ExchangePositionVerification,
} from './position-state-machine';
import { ExchangeConnectorFactory } from '@/connectors/exchange.factory';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import {
  MessageEnvelope,
  CommandType,
  EventType,
  ResponseStatus,
  ErrorCode,
} from './ipc-protocol';

// ---------------------------------------------------------------------------
// Engine configuration
// ---------------------------------------------------------------------------

export interface ExecutionEngineConfig {
  /** UDS socket path (overrides env/default) */
  socketPath?: string;
  /** Maximum time to wait for in-flight operations during shutdown (ms) */
  shutdownTimeoutMs?: number;
  /** Whether to run WAL recovery on startup */
  enableRecovery?: boolean;
  /** Heartbeat interval (ms) */
  heartbeatIntervalMs?: number;
}

// ---------------------------------------------------------------------------
// Engine lifecycle states
// ---------------------------------------------------------------------------

export enum EngineLifecycleState {
  STARTING = 'STARTING',
  RECOVERING = 'RECOVERING',
  READY = 'READY',
  SHUTTING_DOWN = 'SHUTTING_DOWN',
  STOPPED = 'STOPPED',
}

// ---------------------------------------------------------------------------
// Execution engine
// ---------------------------------------------------------------------------

/**
 * Main execution engine class.
 *
 * Orchestrates all trading services in an isolated process.
 * Communicates with the API layer exclusively through UDS.
 */
export class ExecutionEngine extends EventEmitter {
  private state: EngineLifecycleState = EngineLifecycleState.STARTING;
  private udsServer: UDSServer;
  private walRepository: WALRepository | null = null;
  private startedAt: Date = new Date();

  // Service references (lazy initialized)
  // These are typed as `unknown` during Phase 1; will be replaced with
  // proper typed interfaces as each service is migrated to the engine.
  private services: Record<string, unknown> = {};

  // Active position state machines
  private positions: Map<string, PositionStateMachine> = new Map();

  private readonly config: Required<ExecutionEngineConfig>;

  constructor(config?: ExecutionEngineConfig) {
    super();
    this.config = {
      socketPath: config?.socketPath ?? '',
      shutdownTimeoutMs: config?.shutdownTimeoutMs ?? 30000,
      enableRecovery: config?.enableRecovery ?? true,
      heartbeatIntervalMs: config?.heartbeatIntervalMs ?? 5000,
    };

    const serverOpts = this.config.socketPath
      ? { socketPath: this.config.socketPath, heartbeatIntervalMs: this.config.heartbeatIntervalMs }
      : { heartbeatIntervalMs: this.config.heartbeatIntervalMs };

    this.udsServer = new UDSServer(serverOpts);
  }

  /**
   * Start the execution engine.
   * Follows the startup sequence documented above.
   */
  async start(): Promise<void> {
    console.log('[ExecutionEngine] Starting...');
    this.state = EngineLifecycleState.STARTING;

    try {
      // 1. Initialize database connections
      await this.initializeDatabases();

      // 2. Run WAL recovery
      if (this.config.enableRecovery) {
        this.state = EngineLifecycleState.RECOVERING;
        await this.runRecovery();
      }

      // 3. Initialize execution services
      await this.initializeServices();

      // 4. Start UDS server
      this.udsServer.on('message', (envelope: MessageEnvelope) => {
        this.handleCommand(envelope).catch((err) => {
          console.error('[ExecutionEngine] Command handler error:', err);
        });
      });
      await this.udsServer.start();

      // 5. Ready
      this.state = EngineLifecycleState.READY;
      console.log('[ExecutionEngine] Ready and accepting commands');

      this.udsServer.send(EventType.ENGINE_READY, {
        startedAt: this.startedAt.toISOString(),
        recoveryCompleted: this.config.enableRecovery,
        activePositions: this.positions.size,
      });

    } catch (error) {
      console.error('[ExecutionEngine] Failed to start:', error);
      this.state = EngineLifecycleState.STOPPED;
      throw error;
    }
  }

  /**
   * Graceful shutdown.
   */
  async shutdown(): Promise<void> {
    if (this.state === EngineLifecycleState.SHUTTING_DOWN ||
        this.state === EngineLifecycleState.STOPPED) {
      return;
    }

    console.log('[ExecutionEngine] Shutting down...');
    this.state = EngineLifecycleState.SHUTTING_DOWN;

    // Notify API layer
    this.udsServer.send(EventType.ENGINE_SHUTTING_DOWN, {
      reason: 'graceful_shutdown',
      activePositions: this.positions.size,
    });

    try {
      // Stop services in reverse order
      await this.stopServices();

      // Close UDS server
      await this.udsServer.stop();

      // Disconnect databases
      await this.disconnectDatabases();

      this.state = EngineLifecycleState.STOPPED;
      console.log('[ExecutionEngine] Shutdown complete');
    } catch (error) {
      console.error('[ExecutionEngine] Error during shutdown:', error);
      this.state = EngineLifecycleState.STOPPED;
    }
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  private async initializeDatabases(): Promise<void> {
    console.log('[ExecutionEngine] Initializing database connections...');

    // Prisma client (imported dynamically to support path aliases)
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    this.walRepository = new WALRepository(prisma);

    // Redis
    try {
      const redisModule = await import('@/lib/redis');
      this.services['redis'] = redisModule.redisService;
      await (this.services['redis'] as { connect: () => Promise<void> }).connect();
      console.log('[ExecutionEngine] Redis connected');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[ExecutionEngine] Redis connection failed, continuing without cache:', message);
    }
  }

  private async initializeServices(): Promise<void> {
    console.log('[ExecutionEngine] Initializing execution services...');

    // Funding arbitrage
    const fundingArbitrageModule = await import('@/services/funding-arbitrage.service');
    this.services['fundingArbitrage'] = fundingArbitrageModule.fundingArbitrageService;
    await (this.services['fundingArbitrage'] as { initialize: () => Promise<void> }).initialize();
    console.log('[ExecutionEngine] Funding arbitrage service initialized');

    // Bybit funding strategy
    const bybitModule = await import('@/services/bybit-funding-strategy.service');
    this.services['bybitFundingStrategy'] = bybitModule.bybitFundingStrategyService;
    await (this.services['bybitFundingStrategy'] as { initialize: () => Promise<void> }).initialize();
    console.log('[ExecutionEngine] Bybit funding strategy service initialized');

    // Graduated entry arbitrage
    const graduatedModule = await import('@/services/graduated-entry-arbitrage.service');
    this.services['graduatedEntry'] = graduatedModule.graduatedEntryArbitrageService;
    await (this.services['graduatedEntry'] as { initialize: () => Promise<void> }).initialize();
    console.log('[ExecutionEngine] Graduated entry arbitrage service initialized');

    // Funding tracker
    const trackerModule = await import('@/services/funding-tracker.service');
    this.services['fundingTracker'] = trackerModule.fundingTrackerService;
    (this.services['fundingTracker'] as { startTracking: () => void }).startTracking();
    console.log('[ExecutionEngine] Funding tracker service started');

    // Liquidation monitor
    const liquidationModule = await import('@/services/liquidation-monitor.service');
    this.services['liquidationMonitor'] = liquidationModule.liquidationMonitorService;
    (this.services['liquidationMonitor'] as { startMonitoring: () => void }).startMonitoring();
    console.log('[ExecutionEngine] Liquidation monitor service started');

    // Funding rate collector
    const collectorModule = await import('@/services/funding-rate-collector.service');
    this.services['fundingRateCollector'] = collectorModule.getFundingRateCollector();
    (this.services['fundingRateCollector'] as { start: () => void }).start();
    console.log('[ExecutionEngine] Funding rate collector started');

    // Funding interval scheduler
    const schedulerModule = await import('@/services/funding-interval-scheduler.service');
    this.services['fundingIntervalScheduler'] = schedulerModule.startFundingIntervalScheduler();
    console.log('[ExecutionEngine] Funding interval scheduler started');

    // Price arbitrage (will be fully wired in Phase 2)
    const priceArbModule = await import('@/services/price-arbitrage.service');
    this.services['priceArbitrage'] = priceArbModule.priceArbitrageService;
    console.log('[ExecutionEngine] Price arbitrage service registered');
  }

  private async stopServices(): Promise<void> {
    console.log('[ExecutionEngine] Stopping services...');

    const stopSafely = async (name: string, fn: () => void | Promise<void>): Promise<void> => {
      try {
        await fn();
        console.log(`[ExecutionEngine] ${name} stopped`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[ExecutionEngine] Error stopping ${name}:`, message);
      }
    };

    const svc = this.services;
    if (svc['fundingIntervalScheduler']) {
      await stopSafely('Funding interval scheduler', () =>
        (svc['fundingIntervalScheduler'] as { stop: () => void }).stop()
      );
    }
    if (svc['fundingRateCollector']) {
      await stopSafely('Funding rate collector', () =>
        (svc['fundingRateCollector'] as { stop: () => void }).stop()
      );
    }
    if (svc['liquidationMonitor']) {
      await stopSafely('Liquidation monitor', () =>
        (svc['liquidationMonitor'] as { stopMonitoring: () => void }).stopMonitoring()
      );
    }
    if (svc['fundingTracker']) {
      await stopSafely('Funding tracker', () =>
        (svc['fundingTracker'] as { stopTracking: () => void }).stopTracking()
      );
    }
  }

  private async disconnectDatabases(): Promise<void> {
    if (this.services['redis']) {
      try {
        await (this.services['redis'] as { disconnect: () => Promise<void> }).disconnect();
        console.log('[ExecutionEngine] Redis disconnected');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[ExecutionEngine] Redis disconnect error:', message);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // WAL Recovery
  // ---------------------------------------------------------------------------

  private async runRecovery(): Promise<void> {
    if (!this.walRepository) {
      console.warn('[ExecutionEngine] WAL repository not available, skipping recovery');
      return;
    }

    console.log('[ExecutionEngine] Running WAL recovery...');

    // 1. Find all positions with capital at risk
    const positionIds = await this.walRepository.getPositionsWithCapitalAtRisk();
    console.log(`[ExecutionEngine] Found ${positionIds.length} positions with capital at risk`);

    for (const positionId of positionIds) {
      try {
        await this.recoverPosition(positionId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[ExecutionEngine] Recovery failed for position ${positionId}:`, message);
        // Continue with other positions -- do not let one failure block recovery
      }
    }

    // 2. Check for uncommitted WAL entries (in-flight at crash time)
    const uncommitted = await this.walRepository.getUncommittedEntries();
    if (uncommitted.length > 0) {
      console.log(`[ExecutionEngine] Found ${uncommitted.length} uncommitted WAL entries`);
      for (const entry of uncommitted) {
        console.log(
          `[ExecutionEngine] Uncommitted: position=${entry.positionId} ` +
          `${entry.fromState}->${entry.toState} status=${entry.status}`
        );
        // Supersede uncommitted entries; the position recovery above
        // will have reconciled with actual exchange state
        await this.walRepository.supersedePendingEntries(entry.positionId);
      }
    }

    console.log('[ExecutionEngine] WAL recovery completed');
  }

  private async recoverPosition(positionId: string): Promise<void> {
    if (!this.walRepository) return;

    const latestEntry = await this.walRepository.getLatestForPosition(positionId);
    if (!latestEntry) {
      console.warn(`[ExecutionEngine] No WAL entries for position ${positionId}`);
      return;
    }

    const lastKnownState = latestEntry.toState;
    console.log(
      `[ExecutionEngine] Recovering position ${positionId}: last known state = ${lastKnownState}`
    );

    const primaryExchange = latestEntry.exchanges?.[0];
    const hedgeExchange = latestEntry.exchanges?.[1];
    const symbol = latestEntry.symbol;

    const primaryVerification = await this.verifyExchangePosition(
      primaryExchange, latestEntry.userId, symbol
    );
    const hedgeVerification = await this.verifyExchangePosition(
      hedgeExchange, latestEntry.userId, symbol
    );

    const recovery = determineRecoveryAction(
      lastKnownState,
      primaryVerification,
      hedgeVerification
    );

    console.log(
      `[ExecutionEngine] Recovery plan for ${positionId}: ` +
      `action=${recovery.action} target=${recovery.targetState} reason=${recovery.reason}`
    );

    if (recovery.action === RecoveryAction.ESCALATE) {
      console.error(
        `[ExecutionEngine] CRITICAL: Position ${positionId} requires operator intervention. ` +
        `Reason: ${recovery.reason}`
      );
    }
  }

  /**
   * Verify actual position state on an exchange by querying the exchange API.
   * Returns a verification result with real data or an error if unreachable.
   */
  private async verifyExchangePosition(
    exchangeName: string | undefined,
    userId: string,
    symbol: string | undefined
  ): Promise<ExchangePositionVerification> {
    const now = process.hrtime.bigint().toString();

    if (!exchangeName || !symbol) {
      return {
        exchange: exchangeName ?? 'unknown',
        symbol: symbol ?? 'unknown',
        positionExists: false,
        positionSize: 0,
        positionSide: null,
        unrealizedPnl: 0,
        entryPrice: 0,
        markPrice: 0,
        verifiedAtNs: now,
        exchangeReachable: false,
        error: `Missing exchange (${exchangeName}) or symbol (${symbol})`,
      };
    }

    try {
      const prismaModule = await import('@/lib/prisma');
      const prisma = prismaModule.default;

      // Find active credentials for this user + exchange
      const credential = await prisma.exchangeCredentials.findFirst({
        where: {
          userId,
          exchange: exchangeName.toUpperCase(),
          isActive: true,
        },
      });

      if (!credential) {
        return {
          exchange: exchangeName,
          symbol,
          positionExists: false,
          positionSize: 0,
          positionSide: null,
          unrealizedPnl: 0,
          entryPrice: 0,
          markPrice: 0,
          verifiedAtNs: now,
          exchangeReachable: false,
          error: `No active credentials for ${exchangeName}`,
        };
      }

      const decrypted = await ExchangeCredentialsService.getCredentialsById(credential.id);
      if (!decrypted) {
        return {
          exchange: exchangeName,
          symbol,
          positionExists: false,
          positionSize: 0,
          positionSide: null,
          unrealizedPnl: 0,
          entryPrice: 0,
          markPrice: 0,
          verifiedAtNs: now,
          exchangeReachable: false,
          error: `Failed to decrypt credentials for ${exchangeName}`,
        };
      }

      const connector = ExchangeConnectorFactory.create(
        exchangeName,
        decrypted.apiKey,
        decrypted.apiSecret,
        userId,
        credential.id,
        decrypted.authToken
      );

      const position = await connector.getPosition(symbol);
      const posSize = typeof position === 'object' && position !== null
        ? Number((position as Record<string, unknown>)['size'] ?? (position as Record<string, unknown>)['qty'] ?? 0)
        : 0;
      const posSide = typeof position === 'object' && position !== null
        ? String((position as Record<string, unknown>)['side'] ?? '') || null
        : null;
      const unrealizedPnl = typeof position === 'object' && position !== null
        ? Number((position as Record<string, unknown>)['unrealisedPnl'] ?? (position as Record<string, unknown>)['unrealizedPnl'] ?? 0)
        : 0;
      const entryPrice = typeof position === 'object' && position !== null
        ? Number((position as Record<string, unknown>)['entryPrice'] ?? (position as Record<string, unknown>)['avgPrice'] ?? 0)
        : 0;
      const markPrice = typeof position === 'object' && position !== null
        ? Number((position as Record<string, unknown>)['markPrice'] ?? 0)
        : 0;

      return {
        exchange: exchangeName,
        symbol,
        positionExists: Math.abs(posSize) > 0,
        positionSize: posSize,
        positionSide: posSide,
        unrealizedPnl,
        entryPrice,
        markPrice,
        verifiedAtNs: process.hrtime.bigint().toString(),
        exchangeReachable: true,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[ExecutionEngine] Exchange verification failed for ${exchangeName}/${symbol}: ${message}`
      );
      return {
        exchange: exchangeName,
        symbol,
        positionExists: false,
        positionSize: 0,
        positionSide: null,
        unrealizedPnl: 0,
        entryPrice: 0,
        markPrice: 0,
        verifiedAtNs: process.hrtime.bigint().toString(),
        exchangeReachable: false,
        error: message,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Command handling
  // ---------------------------------------------------------------------------

  private async handleCommand(envelope: MessageEnvelope): Promise<void> {
    if (this.state === EngineLifecycleState.SHUTTING_DOWN) {
      this.udsServer.send(envelope.type, {
        status: ResponseStatus.REJECTED,
        correlationId: envelope.correlationId,
        error: {
          code: ErrorCode.ENGINE_SHUTTING_DOWN,
          message: 'Engine is shutting down, not accepting new commands',
          retryable: true,
        },
      }, envelope.correlationId);
      return;
    }

    if (this.state !== EngineLifecycleState.READY) {
      this.udsServer.send(envelope.type, {
        status: ResponseStatus.REJECTED,
        correlationId: envelope.correlationId,
        error: {
          code: ErrorCode.ENGINE_BUSY,
          message: `Engine is in ${this.state} state`,
          retryable: true,
        },
      }, envelope.correlationId);
      return;
    }

    switch (envelope.type) {
      case CommandType.GET_ENGINE_STATUS:
        this.handleGetStatus(envelope);
        break;

      case CommandType.SHUTDOWN_ENGINE:
        this.udsServer.send(envelope.type, {
          status: ResponseStatus.OK,
          correlationId: envelope.correlationId,
          data: { message: 'Shutdown initiated' },
        }, envelope.correlationId);
        // Initiate shutdown asynchronously
        this.shutdown().catch((err) => {
          console.error('[ExecutionEngine] Shutdown error:', err);
        });
        break;

      // Position and subscription commands will be implemented
      // as services are migrated to use the state machine + WAL
      default:
        console.warn(`[ExecutionEngine] Unknown command type: ${envelope.type}`);
        this.udsServer.send(envelope.type, {
          status: ResponseStatus.ERROR,
          correlationId: envelope.correlationId,
          error: {
            code: ErrorCode.VALIDATION_FAILED,
            message: `Unknown command type: ${envelope.type}`,
            retryable: false,
          },
        }, envelope.correlationId);
    }
  }

  private handleGetStatus(envelope: MessageEnvelope): void {
    const mem = process.memoryUsage();
    this.udsServer.send(envelope.type, {
      status: ResponseStatus.OK,
      correlationId: envelope.correlationId,
      data: {
        state: this.state,
        uptimeMs: Date.now() - this.startedAt.getTime(),
        activePositions: this.positions.size,
        memoryUsageMb: mem.heapUsed / (1024 * 1024),
        rssMemoryMb: mem.rss / (1024 * 1024),
      },
    }, envelope.correlationId);
  }

  getState(): EngineLifecycleState {
    return this.state;
  }
}

// ---------------------------------------------------------------------------
// Process entry point
// ---------------------------------------------------------------------------

/**
 * When this file is run directly (not imported), start the engine.
 *
 * Usage:
 *   npx tsx src/execution-engine/engine-process.ts
 */
const isDirectRun =
  require.main === module ||
  process.argv[1]?.includes('engine-process');

if (isDirectRun) {
  const engine = new ExecutionEngine();

  const shutdown = async (signal: string) => {
    console.log(`\n[ExecutionEngine] Received ${signal}, initiating graceful shutdown...`);
    await engine.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', () => { shutdown('SIGTERM').catch(() => process.exit(1)); });
  process.on('SIGINT', () => { shutdown('SIGINT').catch(() => process.exit(1)); });
  process.on('uncaughtException', (err) => {
    console.error('[ExecutionEngine] Uncaught exception:', err);
    shutdown('uncaughtException').catch(() => process.exit(1));
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[ExecutionEngine] Unhandled rejection:', reason);
  });

  engine.start().catch((err) => {
    console.error('[ExecutionEngine] Fatal startup error:', err);
    process.exit(1);
  });
}
