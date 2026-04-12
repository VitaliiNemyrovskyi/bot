/**
 * Tests for WalProtectedExecution
 *
 * Verifies that exchange operations are properly wrapped with WAL entries,
 * state transitions are validated, and failure paths trigger alerts.
 */

import {
  WalProtectedExecution,
  PositionContext,
  LegExecutionMetadata,
} from '../wal-protected-execution';
import { PositionState } from '../position-state-machine';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock alertService before importing the module under test
jest.mock('@/services/alert.service', () => ({
  alertService: {
    critical: jest.fn().mockResolvedValue(undefined),
    warning: jest.fn().mockResolvedValue(undefined),
    info: jest.fn().mockResolvedValue(undefined),
  },
}));

import { alertService } from '@/services/alert.service';

/** In-memory WAL repository mock */
function createMockWalRepo() {
  let sequence = 0;
  const entries: Array<{
    sequence: number;
    status: string;
    fromState: string;
    toState: string;
    reason: string;
    errorCode?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }> = [];

  return {
    entries,
    writePending: jest.fn().mockImplementation(async (params: any) => {
      sequence++;
      entries.push({
        sequence,
        status: 'PENDING',
        fromState: params.fromState,
        toState: params.toState,
        reason: params.reason,
      });
      return sequence;
    }),
    markExecuting: jest.fn().mockResolvedValue(undefined),
    confirm: jest.fn().mockImplementation(async (seq: number, meta?: any) => {
      const entry = entries.find(e => e.sequence === seq);
      if (entry) {
        entry.status = 'CONFIRMED';
        if (meta) entry.metadata = meta;
      }
    }),
    markFailed: jest.fn().mockImplementation(async (seq: number, code: string, msg: string) => {
      const entry = entries.find(e => e.sequence === seq);
      if (entry) {
        entry.status = 'FAILED';
        entry.errorCode = code;
        entry.errorMessage = msg;
      }
    }),
    getUncommittedEntries: jest.fn().mockResolvedValue([]),
    getLatestForPosition: jest.fn().mockResolvedValue(null),
    getEntriesForPosition: jest.fn().mockResolvedValue([]),
    getPositionsWithCapitalAtRisk: jest.fn().mockResolvedValue([]),
    supersedePendingEntries: jest.fn().mockResolvedValue(0),
  };
}

function createTestContext(): PositionContext {
  return {
    positionId: 'test-pos-001',
    userId: 'user-001',
    symbol: 'BTCUSDT',
    primaryExchange: 'BYBIT',
    hedgeExchange: 'BINGX',
  };
}

function createPrimaryMeta(): LegExecutionMetadata {
  return {
    exchange: 'BYBIT',
    symbol: 'BTCUSDT',
    side: 'Buy',
    quantity: 0.1,
  };
}

function createHedgeMeta(): LegExecutionMetadata {
  return {
    exchange: 'BINGX',
    symbol: 'BTC-USDT',
    side: 'Sell',
    quantity: 0.1,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WalProtectedExecution', () => {
  let walExec: WalProtectedExecution;
  let mockWal: ReturnType<typeof createMockWalRepo>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWal = createMockWalRepo();
    walExec = new WalProtectedExecution(mockWal as any);
  });

  describe('initPosition', () => {
    it('should create a state machine and write INTENT WAL entry', async () => {
      const ctx = createTestContext();
      const result = await walExec.initPosition(ctx);

      expect(result.stateMachine.getState()).toBe(PositionState.INTENT);
      expect(result.walSequence).toBe(1);
      expect(mockWal.writePending).toHaveBeenCalledTimes(1);
      expect(mockWal.confirm).toHaveBeenCalledTimes(1);
    });

    it('should register the state machine for future lookups', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);

      const sm = walExec.getStateMachine(ctx.positionId);
      expect(sm).toBeDefined();
      expect(sm!.getState()).toBe(PositionState.INTENT);
    });
  });

  describe('openPrimaryLeg', () => {
    it('should transition INTENT -> PRIMARY_SUBMITTING -> PRIMARY_FILLED on success', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);

      const mockOrder = { orderId: 'order-123', avgPrice: 50000, status: 'FILLED' };
      const result = await walExec.openPrimaryLeg(
        ctx,
        async () => mockOrder,
        createPrimaryMeta(),
      );

      expect(result.result).toBe(mockOrder);
      expect(result.currentState).toBe(PositionState.PRIMARY_FILLED);
      // 1 init + 2 transitions (PRIMARY_SUBMITTING, PRIMARY_FILLED)
      expect(mockWal.writePending).toHaveBeenCalledTimes(3);
    });

    it('should mark WAL as FAILED and fire alert on exchange error', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);

      const exchangeError = new Error('Exchange rejected order');

      await expect(
        walExec.openPrimaryLeg(
          ctx,
          async () => { throw exchangeError; },
          createPrimaryMeta(),
        )
      ).rejects.toThrow('Exchange rejected order');

      expect(mockWal.markFailed).toHaveBeenCalled();
      expect(alertService.critical).toHaveBeenCalled();
    });
  });

  describe('openHedgeLeg', () => {
    let ctx: PositionContext;

    beforeEach(async () => {
      ctx = createTestContext();
      await walExec.initPosition(ctx);
      // Open primary first
      await walExec.openPrimaryLeg(
        ctx,
        async () => ({ orderId: 'primary-001' }),
        createPrimaryMeta(),
      );
    });

    it('should transition PRIMARY_FILLED -> HEDGE_SUBMITTING -> ACTIVE on success', async () => {
      const mockHedgeOrder = { orderId: 'hedge-001', avgPrice: 50100, status: 'FILLED' };
      const rollbackFn = jest.fn();

      const result = await walExec.openHedgeLeg(
        ctx,
        async () => mockHedgeOrder,
        createHedgeMeta(),
        rollbackFn,
      );

      expect(result.result).toBe(mockHedgeOrder);
      expect(result.currentState).toBe(PositionState.ACTIVE);
      expect(rollbackFn).not.toHaveBeenCalled();
    });

    it('should rollback primary on hedge failure', async () => {
      const rollbackFn = jest.fn().mockResolvedValue(undefined);

      await expect(
        walExec.openHedgeLeg(
          ctx,
          async () => { throw new Error('Insufficient margin'); },
          createHedgeMeta(),
          rollbackFn,
        )
      ).rejects.toThrow('Insufficient margin');

      // Rollback should have been called
      expect(rollbackFn).toHaveBeenCalledTimes(1);

      // WAL should record the failure and rollback
      expect(mockWal.markFailed).toHaveBeenCalled();

      // State should be ROLLED_BACK (terminal)
      const sm = walExec.getStateMachine(ctx.positionId);
      // State machine is removed on ROLLED_BACK (terminal state)
      expect(sm).toBeUndefined();
    });

    it('should fire CRITICAL alert when rollback itself fails', async () => {
      const rollbackFn = jest.fn().mockRejectedValue(new Error('Rollback connection timeout'));

      await expect(
        walExec.openHedgeLeg(
          ctx,
          async () => { throw new Error('Hedge exchange error'); },
          createHedgeMeta(),
          rollbackFn,
        )
      ).rejects.toThrow('Hedge exchange error');

      // Should fire critical alert for capital at risk
      const criticalCalls = (alertService.critical as jest.Mock).mock.calls;
      const capitalAtRiskAlert = criticalCalls.find(
        (call: any[]) => call[0].includes('CAPITAL AT RISK'),
      );
      expect(capitalAtRiskAlert).toBeDefined();
    });
  });

  describe('closePosition', () => {
    let ctx: PositionContext;

    beforeEach(async () => {
      ctx = createTestContext();
      await walExec.initPosition(ctx);
      await walExec.openPrimaryLeg(
        ctx,
        async () => ({ orderId: 'primary-001' }),
        createPrimaryMeta(),
      );
      await walExec.openHedgeLeg(
        ctx,
        async () => ({ orderId: 'hedge-001' }),
        createHedgeMeta(),
        jest.fn(),
      );
    });

    it('should transition ACTIVE -> CLOSE_TRIGGERED -> CLOSING -> COMPLETED', async () => {
      const closeResult = { success: true, primaryClosed: true, hedgeClosed: true };

      const result = await walExec.closePosition(
        ctx,
        async () => closeResult,
        'Funding payment received',
        { strategy: 'ultra-fast-ws' },
      );

      expect(result.result).toBe(closeResult);
      expect(result.currentState).toBe(PositionState.COMPLETED);

      // State machine should be removed (terminal state)
      expect(walExec.getStateMachine(ctx.positionId)).toBeUndefined();
    });

    it('should fire alert and record WAL on close failure', async () => {
      await expect(
        walExec.closePosition(
          ctx,
          async () => { throw new Error('Close timeout'); },
          'Funding payment received',
          {},
        )
      ).rejects.toThrow('Close timeout');

      expect(mockWal.markFailed).toHaveBeenCalled();
      expect(alertService.critical).toHaveBeenCalled();
    });
  });

  describe('openSingleLeg (NON_HEDGED)', () => {
    it('should transition through all states to ACTIVE', async () => {
      const ctx = { ...createTestContext(), hedgeExchange: undefined };
      await walExec.initPosition(ctx);

      const mockOrder = { orderId: 'single-001', avgPrice: 50000 };
      const result = await walExec.openSingleLeg(
        ctx,
        async () => mockOrder,
        createPrimaryMeta(),
      );

      expect(result.result).toBe(mockOrder);
      expect(result.currentState).toBe(PositionState.ACTIVE);
    });
  });

  describe('recordCycleCompletion', () => {
    it('should reset state machine for next cycle after COMPLETED', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);
      await walExec.openPrimaryLeg(ctx, async () => ({}), createPrimaryMeta());
      await walExec.openHedgeLeg(ctx, async () => ({}), createHedgeMeta(), jest.fn());
      await walExec.closePosition(ctx, async () => ({}), 'Test close', {});

      // State machine removed after COMPLETED
      expect(walExec.getStateMachine(ctx.positionId)).toBeUndefined();

      // Record cycle completion should not throw for missing SM
      const seq = await walExec.recordCycleCompletion(ctx, { pnl: 1.5 });
      expect(seq).toBe(0); // No SM found, returns 0 gracefully
    });
  });

  describe('transitionToError', () => {
    it('should transition to ERROR and fire CRITICAL alert', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);

      await walExec.transitionToError(ctx, 'Leverage sync failed', {
        exchange: 'BYBIT',
      });

      expect(alertService.critical).toHaveBeenCalledWith(
        expect.stringContaining('Position entered ERROR state'),
        expect.objectContaining({ positionId: ctx.positionId }),
      );
    });
  });

  describe('WAL write-ahead guarantee', () => {
    it('should NOT execute exchange call if WAL write fails', async () => {
      // Make WAL write fail
      const failingWal = createMockWalRepo();
      failingWal.writePending.mockRejectedValue(new Error('Database connection lost'));
      const walExecFailing = new WalProtectedExecution(failingWal as any);

      const ctx = createTestContext();
      // initPosition will fail because WAL write fails
      await expect(walExecFailing.initPosition(ctx)).rejects.toThrow('Database connection lost');

      // No state machine should exist
      expect(walExecFailing.getStateMachine(ctx.positionId)).toBeUndefined();
    });

    it('should write WAL BEFORE executing exchange call on primary open', async () => {
      const ctx = createTestContext();
      await walExec.initPosition(ctx);

      const executionOrder: string[] = [];
      let seqCounter = mockWal.entries.length;

      // Override writePending to track call order
      mockWal.writePending.mockImplementation(async (params: any) => {
        executionOrder.push('WAL_WRITE');
        seqCounter++;
        mockWal.entries.push({
          sequence: seqCounter,
          status: 'PENDING',
          fromState: params.fromState,
          toState: params.toState,
          reason: params.reason,
        });
        return seqCounter;
      });

      const exchangeFn = jest.fn().mockImplementation(async () => {
        executionOrder.push('EXCHANGE_CALL');
        return { orderId: 'test' };
      });

      await walExec.openPrimaryLeg(ctx, exchangeFn, createPrimaryMeta());

      // WAL write must come BEFORE exchange call
      const walIndex = executionOrder.indexOf('WAL_WRITE');
      const exchangeIndex = executionOrder.indexOf('EXCHANGE_CALL');
      expect(walIndex).toBeLessThan(exchangeIndex);
    });
  });
});
