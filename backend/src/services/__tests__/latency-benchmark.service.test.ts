import {
  LatencyBenchmarkService,
  analyzeBenchmarkRun,
  type BenchmarkRunConfig,
  type ExchangeBenchmarkTarget,
} from '../latency-benchmark.service';
import prisma from '@/lib/prisma';

// Mock connector - must use var for jest.mock hoisting compatibility
var mockConnector: any; // eslint-disable-line no-var

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  benchmarkRun: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  benchmarkEvent: {
    create: jest.fn(),
    update: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
}));

jest.mock('@/connectors/exchange.factory', () => ({
  ExchangeConnectorFactory: {
    create: jest.fn().mockImplementation(() => mockConnector),
  },
}));

// Mock websocket manager
jest.mock('@/services/websocket-manager.service', () => ({
  websocketManager: {
    subscribe: jest.fn(),
    closeAll: jest.fn(),
  },
}));

describe('LatencyBenchmarkService', () => {
  let service: LatencyBenchmarkService;

  const mockTarget: ExchangeBenchmarkTarget = {
    exchange: 'BYBIT',
    apiKey: 'test-key',
    apiSecret: 'test-secret',
    symbols: ['BTCUSDT'],
  };

  const mockRunId = 'run_test123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock connector for each test
    mockConnector = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getMarketPrice: jest.fn().mockResolvedValue(50000),
      getBalance: jest.fn().mockResolvedValue({ available: 1000 }),
      getPosition: jest.fn().mockResolvedValue({ size: 0 }),
      subscribeToPriceStream: jest.fn(),
      placeMarketOrder: jest.fn(),
      exchangeName: 'MOCK',
      isConnected: jest.fn().mockReturnValue(true),
    };

    service = new LatencyBenchmarkService();

    // Setup default mock returns
    (prisma.benchmarkRun.create as jest.Mock).mockResolvedValue({
      id: mockRunId,
      runLabel: 'test_run',
      startedAt: new Date(),
      exchanges: ['BYBIT'],
      symbols: ['BTCUSDT'],
    });

    (prisma.benchmarkRun.update as jest.Mock).mockResolvedValue({});
    (prisma.benchmarkEvent.createMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.benchmarkEvent.create as jest.Mock).mockResolvedValue({
      id: 'evt_test',
      benchmarkRunId: mockRunId,
    });
    (prisma.benchmarkEvent.update as jest.Mock).mockResolvedValue({});
  });

  describe('run', () => {
    it('should create a benchmark run and return the run ID', async () => {
      // Setup WS mock to resolve immediately
      mockConnector.subscribeToPriceStream.mockImplementation(
        (_symbol: string, callback: (price: number, timestamp: number) => void) => {
          // Simulate immediate price callback
          setTimeout(() => callback(50000, Date.now()), 10);
          return Promise.resolve(() => {});
        },
      );

      const config: BenchmarkRunConfig = {
        runLabel: 'test_basic',
        targets: [mockTarget],
        enableOrderLatency: true,
        enableWsLatency: true,
        enableTimeSync: true,
        enableDbWriteLatency: true,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 2,
        dbWriteIterations: 2,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      const runId = await service.run(config);

      expect(runId).toBe(mockRunId);
      expect(prisma.benchmarkRun.create).toHaveBeenCalledTimes(1);
      expect(prisma.benchmarkRun.update).toHaveBeenCalledTimes(1);

      // Verify run was finalized
      const updateCall = (prisma.benchmarkRun.update as jest.Mock).mock.calls[0]?.[0];
      expect(updateCall.where.id).toBe(mockRunId);
      expect(updateCall.data.completedAt).toBeDefined();
      expect(updateCall.data.totalEvents).toBeGreaterThan(0);
    });

    it('should throw if already running', async () => {
      mockConnector.subscribeToPriceStream.mockImplementation(
        (_symbol: string, callback: (price: number, timestamp: number) => void) => {
          setTimeout(() => callback(50000, Date.now()), 10);
          return Promise.resolve(() => {});
        },
      );

      const config: BenchmarkRunConfig = {
        runLabel: 'test_concurrent',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: false,
        enableTimeSync: true,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      // Start first run
      const runPromise = service.run(config);

      // Try to start a second run concurrently
      await expect(service.run(config)).rejects.toThrow('Benchmark already in progress');

      // Let first run complete
      await runPromise;
    });

    it('should record time sync events for each iteration', async () => {
      const config: BenchmarkRunConfig = {
        runLabel: 'test_timesync',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: false,
        enableTimeSync: true,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 5,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      await service.run(config);

      // Should call getMarketPrice 5 times for time sync
      expect(mockConnector.getMarketPrice).toHaveBeenCalledTimes(5);

      // Events should have been persisted
      expect(prisma.benchmarkEvent.createMany).toHaveBeenCalled();
      const createManyCall = (prisma.benchmarkEvent.createMany as jest.Mock).mock.calls[0]?.[0];
      expect(createManyCall.data.length).toBe(5);
    });

    it('should handle connector errors gracefully', async () => {
      mockConnector.getMarketPrice.mockRejectedValueOnce(new Error('Network timeout'));

      const config: BenchmarkRunConfig = {
        runLabel: 'test_error_handling',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: false,
        enableTimeSync: true,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      // Should not throw - errors are captured as events
      const runId = await service.run(config);
      expect(runId).toBe(mockRunId);

      // Verify error event was persisted
      const createManyCall = (prisma.benchmarkEvent.createMany as jest.Mock).mock.calls[0]?.[0];
      const errorEvents = createManyCall.data.filter((e: { isError: boolean }) => e.isError);
      expect(errorEvents.length).toBe(1);
      expect(errorEvents[0].errorMessage).toBe('Network timeout');
    });

    it('should measure order latency across three phases', async () => {
      const config: BenchmarkRunConfig = {
        runLabel: 'test_order_latency',
        targets: [mockTarget],
        enableOrderLatency: true,
        enableWsLatency: false,
        enableTimeSync: false,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      await service.run(config);

      // Three phases: market_price_fetch, balance_check, position_check
      expect(mockConnector.getMarketPrice).toHaveBeenCalledWith('BTCUSDT');
      expect(mockConnector.getBalance).toHaveBeenCalledTimes(1);
      expect(mockConnector.getPosition).toHaveBeenCalledWith('BTCUSDT');

      const createManyCall = (prisma.benchmarkEvent.createMany as jest.Mock).mock.calls[0]?.[0];
      expect(createManyCall.data.length).toBe(3);

      const phases = createManyCall.data.map(
        (e: { payload: { phase: string } }) => JSON.parse(JSON.stringify(e.payload)).phase,
      );
      expect(phases).toContain('market_price_fetch');
      expect(phases).toContain('balance_check');
      expect(phases).toContain('position_check');
    });

    it('should measure WebSocket subscription-to-callback latency', async () => {
      let capturedCallback: ((price: number, timestamp: number) => void) | null = null;

      mockConnector.subscribeToPriceStream.mockImplementation(
        (_symbol: string, callback: (price: number, timestamp: number) => void) => {
          capturedCallback = callback;
          // Simulate exchange sending first tick after 50ms
          setTimeout(() => callback(50000, Date.now()), 50);
          return Promise.resolve(() => {});
        },
      );

      const config: BenchmarkRunConfig = {
        runLabel: 'test_ws_latency',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: true,
        enableTimeSync: false,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      await service.run(config);

      expect(mockConnector.subscribeToPriceStream).toHaveBeenCalledWith('BTCUSDT', expect.any(Function));

      const createManyCall = (prisma.benchmarkEvent.createMany as jest.Mock).mock.calls[0]?.[0];
      const wsEvents = createManyCall.data.filter(
        (e: { eventType: string }) => e.eventType === 'WS_LATENCY',
      );
      expect(wsEvents.length).toBe(1);
      expect(wsEvents[0].isError).toBe(false);
    });

    it('should measure DB write latency with direct probe inserts', async () => {
      const config: BenchmarkRunConfig = {
        runLabel: 'test_db_latency',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: false,
        enableTimeSync: false,
        enableDbWriteLatency: true,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 3,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      await service.run(config);

      // DB write probes create records directly
      expect(prisma.benchmarkEvent.create).toHaveBeenCalledTimes(3);
      expect(prisma.benchmarkEvent.update).toHaveBeenCalledTimes(3);

      // The probe events are marked as alreadyPersisted so they skip batch insert
      // Only non-DB_WRITE events would go through createMany
    });

    it('should use high-resolution timestamps (BigInt nanoseconds)', async () => {
      const config: BenchmarkRunConfig = {
        runLabel: 'test_hires_timestamps',
        targets: [mockTarget],
        enableOrderLatency: false,
        enableWsLatency: false,
        enableTimeSync: true,
        enableDbWriteLatency: false,
        enableSettlementJitter: false,
        enableRingBufferBenchmark: false,
        enableUdsBenchmark: false,
        timeSyncIterations: 1,
        dbWriteIterations: 1,
        ringBufferReadIterations: 0,
        udsRoundTripIterations: 0,
      };

      await service.run(config);

      const createManyCall = (prisma.benchmarkEvent.createMany as jest.Mock).mock.calls[0]?.[0];
      const event = createManyCall.data[0];

      // Verify BigInt timestamp fields
      expect(typeof event.startNs).toBe('bigint');
      expect(typeof event.endNs).toBe('bigint');
      expect(typeof event.latencyNs).toBe('bigint');
      expect(event.startNs > BigInt(0)).toBe(true);
      expect(event.endNs >= event.startNs).toBe(true);
      expect(event.latencyNs).toBe(event.endNs - event.startNs);

      // latencyMs should be a regular number (float)
      expect(typeof event.latencyMs).toBe('number');
      expect(event.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('measureRealOrderLatency', () => {
    it('should measure actual order placement latency', async () => {
      mockConnector.placeMarketOrder.mockResolvedValue({
        orderId: 'order_123',
        result: { orderId: 'order_123' },
      });

      const event = await service.measureRealOrderLatency(
        mockConnector as any,
        'BYBIT',
        'BTCUSDT',
        'Buy',
        0.001,
      );

      expect(event.eventType).toBe('ORDER_LATENCY');
      expect(event.exchange).toBe('BYBIT');
      expect(event.isError).toBe(false);
      expect((event.payload as any).phase).toBe('real_order');
      expect((event.payload as any).orderId).toBe('order_123');
      expect(mockConnector.placeMarketOrder).toHaveBeenCalledWith('BTCUSDT', 'Buy', 0.001);
    });

    it('should capture order placement errors', async () => {
      mockConnector.placeMarketOrder.mockRejectedValue(new Error('Insufficient balance'));

      const event = await service.measureRealOrderLatency(
        mockConnector as any,
        'BYBIT',
        'BTCUSDT',
        'Buy',
        0.001,
      );

      expect(event.isError).toBe(true);
      expect(event.errorMessage).toBe('Insufficient balance');
    });
  });
});

describe('analyzeBenchmarkRun', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should compute aggregate statistics from benchmark events', async () => {
    (prisma.benchmarkRun.findUnique as jest.Mock).mockResolvedValue({
      id: 'run_analysis',
      runLabel: 'test_analysis',
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: 5000,
      exchanges: ['BYBIT'],
      symbols: ['BTCUSDT'],
    });

    (prisma.benchmarkEvent.findMany as jest.Mock).mockResolvedValue([
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 50, isError: false },
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 55, isError: false },
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 60, isError: false },
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 45, isError: false },
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 200, isError: false },
      { eventType: 'WS_LATENCY', exchange: 'BYBIT', latencyMs: 120, isError: false },
      { eventType: 'WS_LATENCY', exchange: 'BYBIT', latencyMs: 130, isError: false },
      { eventType: 'TIME_SYNC', exchange: 'BYBIT', latencyMs: 999, isError: true, errorMessage: 'timeout' },
    ]);

    const analysis = await analyzeBenchmarkRun('run_analysis');

    expect(analysis.runId).toBe('run_analysis');
    expect(analysis.totalEvents).toBe(8);
    expect(analysis.errorCount).toBe(1);

    // TIME_SYNC stats (5 non-error events: 45, 50, 55, 60, 200)
    const timeSyncStats = analysis.exchangeStats['BYBIT']!['TIME_SYNC']!;
    expect(timeSyncStats.count).toBe(5);
    expect(timeSyncStats.min).toBe(45);
    expect(timeSyncStats.max).toBe(200);
    expect(timeSyncStats.mean).toBe(82);
    expect(timeSyncStats.median).toBe(55);

    // WS_LATENCY stats (2 events: 120, 130)
    const wsStats = analysis.exchangeStats['BYBIT']!['WS_LATENCY']!;
    expect(wsStats.count).toBe(2);
    expect(wsStats.min).toBe(120);
    expect(wsStats.max).toBe(130);
    expect(wsStats.mean).toBe(125);
  });

  it('should throw if run not found', async () => {
    (prisma.benchmarkRun.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.benchmarkEvent.findMany as jest.Mock).mockResolvedValue([]);

    await expect(analyzeBenchmarkRun('nonexistent')).rejects.toThrow('Benchmark run not found');
  });
});
