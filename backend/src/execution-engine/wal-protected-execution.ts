/**
 * WAL-Protected Execution Layer
 *
 * Wraps exchange operations with write-ahead log entries to guarantee
 * crash recovery and auditability for the funding arbitrage service.
 *
 * Design principles:
 * - WAL entry is written BEFORE every exchange call (write-ahead guarantee)
 * - If the WAL write fails, the exchange call NEVER executes (fail-safe)
 * - Every exchange result (success or failure) is recorded in the WAL
 * - Critical alerts fire on rollback failures and capital-at-risk scenarios
 * - The wrapper does NOT rewrite the arbitrage service; it wraps exchange calls
 *
 * State flow for a HEDGED position lifecycle:
 *   INTENT -> PRIMARY_SUBMITTING -> PRIMARY_FILLED ->
 *   HEDGE_SUBMITTING -> ACTIVE -> CLOSE_TRIGGERED ->
 *   CLOSING -> COMPLETED
 *
 * On hedge failure:
 *   HEDGE_SUBMITTING -> ROLLING_BACK -> ROLLED_BACK (or ERROR)
 */

import { WALRepository } from './wal-repository';
import {
  PositionState,
  PositionStateMachine,
  PositionStateError,
} from './position-state-machine';
import { alertService } from '@/services/alert.service';
import { OrderSide } from '@/connectors/base-exchange.connector';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Metadata recorded alongside WAL entries for audit and recovery */
export interface LegExecutionMetadata {
  exchange: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderId?: string;
  avgPrice?: number;
  [key: string]: unknown;
}

/** Result returned by protected execution methods */
export interface ProtectedExecutionResult<T = unknown> {
  /** The raw order/response from the exchange */
  result: T;
  /** WAL sequence number for the transition that was confirmed */
  walSequence: number;
  /** Current state machine state after the operation */
  currentState: PositionState;
}

/** Context required to initialize a WAL-protected position lifecycle */
export interface PositionContext {
  positionId: string;
  userId: string;
  symbol: string;
  primaryExchange: string;
  hedgeExchange?: string;
}

// ---------------------------------------------------------------------------
// WAL-Protected Execution
// ---------------------------------------------------------------------------

/**
 * Provides WAL-protected wrappers around exchange operations.
 *
 * Each method follows the same pattern:
 * 1. Validate state transition is allowed
 * 2. Write PENDING WAL entry to PostgreSQL
 * 3. Execute the exchange call
 * 4. On success: confirm WAL entry, advance state machine
 * 5. On failure: mark WAL entry FAILED, fire alerts if capital at risk
 *
 * The caller (FundingArbitrageService) replaces direct exchange calls
 * with these wrapped methods. The existing service logic stays intact.
 */
export class WalProtectedExecution {
  private stateMachines: Map<string, PositionStateMachine> = new Map();

  constructor(private readonly walRepo: WALRepository) {}

  // -------------------------------------------------------------------------
  // Lifecycle: create / get / recover state machines
  // -------------------------------------------------------------------------

  /**
   * Initialize a new position lifecycle.
   * Creates the state machine and writes the INTENT WAL entry.
   * Returns the WAL sequence for the initial entry.
   */
  async initPosition(ctx: PositionContext): Promise<{
    walSequence: number;
    stateMachine: PositionStateMachine;
  }> {
    const sm = new PositionStateMachine(ctx.positionId, ctx.userId, PositionState.INTENT);

    // Write the INTENT entry BEFORE registering the state machine.
    // If WAL write fails, no state machine is left behind.
    let seq: number;
    try {
      seq = await this.walRepo.writePending({
        positionId: ctx.positionId,
        userId: ctx.userId,
        fromState: PositionState.INTENT,
        toState: PositionState.INTENT,
        reason: 'Position lifecycle initialized',
        symbol: ctx.symbol,
        exchanges: [ctx.primaryExchange, ctx.hedgeExchange].filter(Boolean) as string[],
        metadata: { symbol: ctx.symbol },
      });
    } catch (walError) {
      // WAL write failed: do NOT register the state machine
      throw walError;
    }

    await this.walRepo.confirm(seq, { symbol: ctx.symbol });

    // Only register after successful WAL write
    this.stateMachines.set(ctx.positionId, sm);

    return { walSequence: seq, stateMachine: sm };
  }

  /**
   * Retrieve the state machine for a position.
   * Returns undefined if the position is not tracked.
   */
  getStateMachine(positionId: string): PositionStateMachine | undefined {
    return this.stateMachines.get(positionId);
  }

  /**
   * Restore a state machine from WAL (used during crash recovery).
   */
  restoreStateMachine(
    positionId: string,
    userId: string,
    currentState: PositionState,
  ): PositionStateMachine {
    const sm = new PositionStateMachine(positionId, userId, currentState);
    this.stateMachines.set(positionId, sm);
    return sm;
  }

  /**
   * Remove the state machine when the position reaches a terminal state.
   */
  removeStateMachine(positionId: string): void {
    this.stateMachines.delete(positionId);
  }

  // -------------------------------------------------------------------------
  // Protected exchange operations
  // -------------------------------------------------------------------------

  /**
   * WAL-protected primary leg open.
   *
   * State: INTENT -> PRIMARY_SUBMITTING -> PRIMARY_FILLED
   *
   * @param ctx Position context
   * @param executeFn The actual exchange call (e.g., placeMarketOrder)
   * @param meta Metadata about the leg (exchange, symbol, side, quantity)
   * @returns The exchange order result, wrapped with WAL info
   */
  async openPrimaryLeg<T>(
    ctx: PositionContext,
    executeFn: () => Promise<T>,
    meta: LegExecutionMetadata,
  ): Promise<ProtectedExecutionResult<T>> {
    const sm = this.requireStateMachine(ctx.positionId);

    // -- Transition: INTENT -> PRIMARY_SUBMITTING --
    const submitSeq = await this.walTransition(
      sm,
      PositionState.PRIMARY_SUBMITTING,
      'Submitting primary leg order',
      ctx,
      meta,
    );

    // -- Execute the exchange call --
    let result: T;
    try {
      result = await executeFn();
    } catch (error: unknown) {
      await this.handleLegFailure(
        submitSeq,
        sm,
        ctx,
        error,
        'Primary leg order failed',
      );
      throw error;
    }

    // -- Confirm submission --
    const orderMeta = this.extractOrderMeta(result, meta);
    await this.walRepo.confirm(submitSeq, orderMeta);

    // -- Transition: PRIMARY_SUBMITTING -> PRIMARY_FILLED --
    const fillSeq = await this.walTransition(
      sm,
      PositionState.PRIMARY_FILLED,
      'Primary leg filled',
      ctx,
      orderMeta,
    );
    await this.walRepo.confirm(fillSeq, orderMeta);

    return {
      result,
      walSequence: fillSeq,
      currentState: sm.getState(),
    };
  }

  /**
   * WAL-protected hedge leg open.
   *
   * State: PRIMARY_FILLED -> HEDGE_SUBMITTING -> ACTIVE
   *
   * On failure, automatically initiates rollback of the primary leg.
   *
   * @param ctx Position context
   * @param executeFn The actual exchange call for the hedge leg
   * @param meta Metadata about the hedge leg
   * @param rollbackFn Function to close the primary leg if hedge fails
   * @returns The exchange order result, wrapped with WAL info
   */
  async openHedgeLeg<T>(
    ctx: PositionContext,
    executeFn: () => Promise<T>,
    meta: LegExecutionMetadata,
    rollbackFn: () => Promise<void>,
  ): Promise<ProtectedExecutionResult<T>> {
    const sm = this.requireStateMachine(ctx.positionId);

    // -- Transition: PRIMARY_FILLED -> HEDGE_SUBMITTING --
    const submitSeq = await this.walTransition(
      sm,
      PositionState.HEDGE_SUBMITTING,
      'Submitting hedge leg order',
      ctx,
      meta,
    );

    // -- Execute the exchange call --
    let result: T;
    try {
      result = await executeFn();
    } catch (hedgeError: unknown) {
      // Hedge failed: mark WAL, attempt rollback of primary
      await this.walRepo.markFailed(
        submitSeq,
        'HEDGE_ORDER_FAILED',
        hedgeError instanceof Error ? hedgeError.message : String(hedgeError),
      );

      await this.rollbackPrimary(ctx, sm, rollbackFn, hedgeError);

      // Re-throw the original hedge error
      throw hedgeError;
    }

    // -- Confirm hedge submission --
    const orderMeta = this.extractOrderMeta(result, meta);
    await this.walRepo.confirm(submitSeq, orderMeta);

    // -- Transition: HEDGE_SUBMITTING -> ACTIVE --
    const activeSeq = await this.walTransition(
      sm,
      PositionState.ACTIVE,
      'Both legs filled, position is active',
      ctx,
      orderMeta,
    );
    await this.walRepo.confirm(activeSeq, orderMeta);

    return {
      result,
      walSequence: activeSeq,
      currentState: sm.getState(),
    };
  }

  /**
   * WAL-protected position close (both legs or single leg).
   *
   * State: ACTIVE -> CLOSE_TRIGGERED -> CLOSING -> COMPLETED
   *
   * @param ctx Position context
   * @param executeFn The actual close execution
   * @param reason Why the close was triggered
   * @param meta Additional metadata
   */
  async closePosition<T>(
    ctx: PositionContext,
    executeFn: () => Promise<T>,
    reason: string,
    meta: Record<string, unknown>,
  ): Promise<ProtectedExecutionResult<T>> {
    const sm = this.requireStateMachine(ctx.positionId);

    // -- Transition: ACTIVE -> CLOSE_TRIGGERED --
    const triggerSeq = await this.walTransition(
      sm,
      PositionState.CLOSE_TRIGGERED,
      reason,
      ctx,
      meta,
    );
    await this.walRepo.confirm(triggerSeq, meta);

    // -- Transition: CLOSE_TRIGGERED -> CLOSING --
    const closingSeq = await this.walTransition(
      sm,
      PositionState.CLOSING,
      'Submitting close orders',
      ctx,
      meta,
    );

    // -- Execute the close --
    let result: T;
    try {
      result = await executeFn();
    } catch (error: unknown) {
      await this.handleLegFailure(
        closingSeq,
        sm,
        ctx,
        error,
        'Position close failed',
      );
      throw error;
    }

    // -- Confirm close --
    await this.walRepo.confirm(closingSeq, meta);

    // -- Transition: CLOSING -> COMPLETED --
    const completedSeq = await this.walTransition(
      sm,
      PositionState.COMPLETED,
      'Position fully closed',
      ctx,
      meta,
    );
    await this.walRepo.confirm(completedSeq, meta);

    // Cleanup: remove state machine for terminal state
    this.stateMachines.delete(ctx.positionId);

    return {
      result,
      walSequence: completedSeq,
      currentState: PositionState.COMPLETED,
    };
  }

  /**
   * WAL-protected single-leg open for NON_HEDGED mode.
   *
   * State: INTENT -> PRIMARY_SUBMITTING -> PRIMARY_FILLED -> ACTIVE
   *
   * Skips hedge states entirely and goes straight to ACTIVE.
   */
  async openSingleLeg<T>(
    ctx: PositionContext,
    executeFn: () => Promise<T>,
    meta: LegExecutionMetadata,
  ): Promise<ProtectedExecutionResult<T>> {
    const sm = this.requireStateMachine(ctx.positionId);

    // -- INTENT -> PRIMARY_SUBMITTING --
    const submitSeq = await this.walTransition(
      sm,
      PositionState.PRIMARY_SUBMITTING,
      'Submitting single-leg order (NON_HEDGED)',
      ctx,
      meta,
    );

    let result: T;
    try {
      result = await executeFn();
    } catch (error: unknown) {
      await this.handleLegFailure(
        submitSeq,
        sm,
        ctx,
        error,
        'Single-leg order failed (NON_HEDGED)',
      );
      throw error;
    }

    const orderMeta = this.extractOrderMeta(result, meta);
    await this.walRepo.confirm(submitSeq, orderMeta);

    // -- PRIMARY_SUBMITTING -> PRIMARY_FILLED --
    const fillSeq = await this.walTransition(
      sm,
      PositionState.PRIMARY_FILLED,
      'Single-leg filled (NON_HEDGED)',
      ctx,
      orderMeta,
    );
    await this.walRepo.confirm(fillSeq, orderMeta);

    // -- PRIMARY_FILLED -> HEDGE_SUBMITTING (skip hedge) -> ACTIVE
    // We go through HEDGE_SUBMITTING to maintain valid transition path
    // but immediately confirm it, as there is no hedge leg to execute
    const hedgeSkipSeq = await this.walTransition(
      sm,
      PositionState.HEDGE_SUBMITTING,
      'No hedge leg in NON_HEDGED mode, transitioning to ACTIVE',
      ctx,
      { ...orderMeta, mode: 'NON_HEDGED' },
    );
    await this.walRepo.confirm(hedgeSkipSeq, { mode: 'NON_HEDGED' });

    const activeSeq = await this.walTransition(
      sm,
      PositionState.ACTIVE,
      'Single-leg position active (NON_HEDGED)',
      ctx,
      orderMeta,
    );
    await this.walRepo.confirm(activeSeq, orderMeta);

    return {
      result,
      walSequence: activeSeq,
      currentState: sm.getState(),
    };
  }

  /**
   * Record a position cycle completion (reset to ACTIVE for recurring subscriptions).
   * This marks the WAL as COMPLETED then creates a fresh ACTIVE entry.
   * The state machine is NOT removed because the subscription continues.
   */
  async recordCycleCompletion(
    ctx: PositionContext,
    pnlData: Record<string, unknown>,
  ): Promise<number> {
    const sm = this.stateMachines.get(ctx.positionId);
    if (!sm) {
      // Position not WAL-tracked (legacy subscription); skip gracefully
      return 0;
    }

    // If already in COMPLETED, we just need a new INTENT for next cycle
    if (sm.getState() === PositionState.COMPLETED) {
      // Re-initialize for next cycle
      const newSm = new PositionStateMachine(
        ctx.positionId,
        ctx.userId,
        PositionState.INTENT,
      );
      this.stateMachines.set(ctx.positionId, newSm);

      const seq = await this.walRepo.writePending({
        positionId: ctx.positionId,
        userId: ctx.userId,
        fromState: PositionState.COMPLETED,
        toState: PositionState.INTENT,
        reason: 'Recurring subscription: new cycle started',
        symbol: ctx.symbol,
        metadata: pnlData,
      });
      await this.walRepo.confirm(seq, pnlData);
      return seq;
    }

    return 0;
  }

  /**
   * Transition to ERROR state for any unrecoverable failure.
   * Fires a CRITICAL alert.
   */
  async transitionToError(
    ctx: PositionContext,
    reason: string,
    errorDetails: Record<string, unknown>,
  ): Promise<void> {
    const sm = this.stateMachines.get(ctx.positionId);
    if (!sm) return;

    try {
      const fromState = sm.getState();
      sm.transition(PositionState.ERROR, reason);

      const seq = await this.walRepo.writePending({
        positionId: ctx.positionId,
        userId: ctx.userId,
        fromState,
        toState: PositionState.ERROR,
        reason,
        symbol: ctx.symbol,
        metadata: errorDetails,
      });
      await this.walRepo.markFailed(seq, 'UNRECOVERABLE_ERROR', reason);
    } catch (walError: unknown) {
      // WAL write itself failed; log but do not mask the original error
      console.error(
        `[WalProtectedExecution] Failed to write ERROR WAL entry for ${ctx.positionId}:`,
        walError instanceof Error ? walError.message : walError,
      );
    }

    await alertService.critical(`Position entered ERROR state: ${reason}`, {
      positionId: ctx.positionId,
      userId: ctx.userId,
      symbol: ctx.symbol,
      ...errorDetails,
    }).catch(() => {});
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /**
   * Validate transition, write PENDING WAL, advance state machine.
   * Returns the WAL sequence number.
   * Throws if WAL write fails (caller must NOT proceed with exchange call).
   */
  private async walTransition(
    sm: PositionStateMachine,
    toState: PositionState,
    reason: string,
    ctx: PositionContext,
    meta: Record<string, unknown>,
  ): Promise<number> {
    const fromState = sm.getState();

    // Validate transition before WAL write
    if (!sm.canTransition(toState)) {
      const msg =
        `Invalid transition: ${fromState} -> ${toState} for position ${ctx.positionId}`;
      await alertService.warning('Invalid state transition attempted', {
        positionId: ctx.positionId,
        fromState,
        toState,
        reason,
      }).catch(() => {});
      throw new PositionStateError(
        'position.invalid_state_transition' as any,
        msg,
        ctx.positionId,
        fromState,
        toState,
      );
    }

    // Write PENDING WAL entry BEFORE any exchange interaction
    const seq = await this.walRepo.writePending({
      positionId: ctx.positionId,
      userId: ctx.userId,
      fromState,
      toState,
      reason,
      symbol: ctx.symbol,
      exchanges: [ctx.primaryExchange, ctx.hedgeExchange].filter(Boolean) as string[],
      metadata: meta,
    });

    // Advance the in-memory state machine
    sm.transition(toState, reason);

    return seq;
  }

  /**
   * Handle a leg execution failure: mark WAL as FAILED, transition to ERROR,
   * and fire a CRITICAL alert.
   */
  private async handleLegFailure(
    walSequence: number,
    sm: PositionStateMachine,
    ctx: PositionContext,
    error: unknown,
    context: string,
  ): Promise<void> {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Mark the WAL entry as failed
    await this.walRepo.markFailed(walSequence, 'LEG_EXECUTION_FAILED', errorMsg).catch(
      (walErr: unknown) => {
        console.error(
          `[WalProtectedExecution] Failed to mark WAL entry ${walSequence} as FAILED:`,
          walErr instanceof Error ? walErr.message : walErr,
        );
      },
    );

    // Transition to ERROR if possible
    if (sm.canTransition(PositionState.ERROR)) {
      sm.transition(PositionState.ERROR, `${context}: ${errorMsg}`);

      // Write the ERROR transition WAL entry
      await this.walRepo.writePending({
        positionId: ctx.positionId,
        userId: ctx.userId,
        fromState: sm.getState(),
        toState: PositionState.ERROR,
        reason: `${context}: ${errorMsg}`,
        symbol: ctx.symbol,
        metadata: { originalError: errorMsg },
      }).catch(() => {});
    }

    // Fire alert for capital-at-risk states
    await alertService.critical(`${context}`, {
      positionId: ctx.positionId,
      userId: ctx.userId,
      symbol: ctx.symbol,
      error: errorMsg,
      state: sm.getState(),
    }).catch(() => {});
  }

  /**
   * Rollback the primary leg when hedge fails.
   * State: HEDGE_SUBMITTING -> ROLLING_BACK -> ROLLED_BACK (or ERROR)
   */
  private async rollbackPrimary(
    ctx: PositionContext,
    sm: PositionStateMachine,
    rollbackFn: () => Promise<void>,
    originalError: unknown,
  ): Promise<void> {
    const hedgeErrorMsg =
      originalError instanceof Error ? originalError.message : String(originalError);

    // -- Transition: HEDGE_SUBMITTING -> ROLLING_BACK --
    let rollbackSeq: number;
    try {
      rollbackSeq = await this.walTransition(
        sm,
        PositionState.ROLLING_BACK,
        `Hedge failed, rolling back primary leg: ${hedgeErrorMsg}`,
        ctx,
        { hedgeError: hedgeErrorMsg },
      );
    } catch (transitionError: unknown) {
      // Cannot transition to ROLLING_BACK; go to ERROR
      await alertService.critical('Rollback transition failed after hedge failure', {
        positionId: ctx.positionId,
        userId: ctx.userId,
        symbol: ctx.symbol,
        hedgeError: hedgeErrorMsg,
        transitionError:
          transitionError instanceof Error
            ? transitionError.message
            : String(transitionError),
      }).catch(() => {});
      return;
    }

    // -- Execute the rollback (close primary leg) --
    try {
      await rollbackFn();

      // Confirm rollback WAL entry
      await this.walRepo.confirm(rollbackSeq, {
        rollbackResult: 'PRIMARY_CLOSED',
        hedgeError: hedgeErrorMsg,
      });

      // -- Transition: ROLLING_BACK -> ROLLED_BACK --
      const rolledBackSeq = await this.walTransition(
        sm,
        PositionState.ROLLED_BACK,
        'Primary leg successfully rolled back',
        ctx,
        { hedgeError: hedgeErrorMsg },
      );
      await this.walRepo.confirm(rolledBackSeq, {
        hedgeError: hedgeErrorMsg,
        rollbackResult: 'SUCCESS',
      });

      // Terminal state: cleanup
      this.stateMachines.delete(ctx.positionId);

      await alertService.warning('Position rolled back after hedge failure', {
        positionId: ctx.positionId,
        userId: ctx.userId,
        symbol: ctx.symbol,
        hedgeError: hedgeErrorMsg,
      }).catch(() => {});
    } catch (rollbackError: unknown) {
      // CRITICAL: Rollback failed! Capital at risk!
      const rollbackErrMsg =
        rollbackError instanceof Error
          ? rollbackError.message
          : String(rollbackError);

      await this.walRepo.markFailed(
        rollbackSeq,
        'ROLLBACK_FAILED',
        rollbackErrMsg,
      ).catch(() => {});

      // Attempt ERROR transition
      if (sm.canTransition(PositionState.ERROR)) {
        sm.transition(
          PositionState.ERROR,
          `Rollback failed: ${rollbackErrMsg}`,
        );
      }

      await alertService.critical(
        'CAPITAL AT RISK: Rollback failed after hedge failure',
        {
          positionId: ctx.positionId,
          userId: ctx.userId,
          symbol: ctx.symbol,
          hedgeError: hedgeErrorMsg,
          rollbackError: rollbackErrMsg,
          action: 'MANUAL_INTERVENTION_REQUIRED',
        },
      ).catch(() => {});
    }
  }

  /**
   * Extract order metadata from an exchange response for WAL recording.
   */
  private extractOrderMeta(
    orderResult: unknown,
    baseMeta: LegExecutionMetadata,
  ): Record<string, unknown> {
    const order = orderResult as Record<string, unknown> | null;
    return {
      ...baseMeta,
      orderId: order?.['orderId'] ?? order?.['order_id'] ?? order?.['id'] ?? baseMeta.orderId,
      avgPrice:
        order?.['avgPrice'] ?? order?.['price'] ?? order?.['avg_price'] ?? baseMeta.avgPrice,
      filledQty: order?.['filledQty'] ?? order?.['executedQty'] ?? order?.['filled_qty'],
      status: order?.['status'] ?? order?.['orderStatus'],
    };
  }

  /**
   * Get the state machine or throw if not found.
   */
  private requireStateMachine(positionId: string): PositionStateMachine {
    const sm = this.stateMachines.get(positionId);
    if (!sm) {
      throw new Error(
        `No state machine found for position ${positionId}. ` +
        `Call initPosition() first or restoreStateMachine() for recovery.`,
      );
    }
    return sm;
  }
}
