/**
 * Position State Machine with Write-Ahead Logging
 *
 * Hardened position state management with:
 * - Explicit state transition diagram (invalid transitions throw)
 * - Write-ahead logging to PostgreSQL BEFORE exchange calls
 * - Exchange position verification on recovery (not just time-based ERROR marking)
 * - Atomic two-leg position opens with explicit rollback
 * - Failure hierarchy: protect capital > log everything > alert operator > recover
 *
 * Every state transition is:
 * 1. Validated against the transition table
 * 2. Written to WAL (PostgreSQL) with the intended transition
 * 3. Executed (exchange call or internal)
 * 4. Confirmed in WAL with the result
 *
 * On crash recovery:
 * - Replay uncommitted WAL entries
 * - Verify actual exchange state for each pending transition
 * - Reconcile and advance to correct state
 */

import { z } from 'zod';
import { ErrorCode } from './ipc-protocol';

// ---------------------------------------------------------------------------
// Position states
// ---------------------------------------------------------------------------

export enum PositionState {
  /** Initial state, WAL entry created, no exchange calls yet */
  INTENT = 'INTENT',
  /** Primary leg order submitted to exchange */
  PRIMARY_SUBMITTING = 'PRIMARY_SUBMITTING',
  /** Primary leg confirmed filled on exchange */
  PRIMARY_FILLED = 'PRIMARY_FILLED',
  /** Hedge leg order submitted to exchange */
  HEDGE_SUBMITTING = 'HEDGE_SUBMITTING',
  /** Both legs filled, position is active */
  ACTIVE = 'ACTIVE',
  /** Monitoring detected close condition (convergence, SL, etc.) */
  CLOSE_TRIGGERED = 'CLOSE_TRIGGERED',
  /** Close orders submitted to exchange */
  CLOSING = 'CLOSING',
  /** Primary leg closed */
  PRIMARY_CLOSED = 'PRIMARY_CLOSED',
  /** Both legs closed, P&L calculated */
  COMPLETED = 'COMPLETED',
  /** Rollback in progress (closing succeeded leg because other failed) */
  ROLLING_BACK = 'ROLLING_BACK',
  /** Rollback completed */
  ROLLED_BACK = 'ROLLED_BACK',
  /** Unrecoverable error, requires operator intervention */
  ERROR = 'ERROR',
  /** User cancelled before execution */
  CANCELLED = 'CANCELLED',
}

// ---------------------------------------------------------------------------
// Valid state transitions
// ---------------------------------------------------------------------------

/**
 * State transition table.
 * Key: current state. Value: set of valid next states.
 * Any transition not in this table is REJECTED.
 */
export const VALID_TRANSITIONS: Record<PositionState, Set<PositionState>> = {
  [PositionState.INTENT]: new Set([
    PositionState.PRIMARY_SUBMITTING,
    PositionState.CANCELLED,
    PositionState.ERROR,
  ]),
  [PositionState.PRIMARY_SUBMITTING]: new Set([
    PositionState.PRIMARY_FILLED,
    PositionState.ERROR,       // Exchange rejected
    PositionState.CANCELLED,   // Timeout, user cancel
  ]),
  [PositionState.PRIMARY_FILLED]: new Set([
    PositionState.HEDGE_SUBMITTING,
    PositionState.ROLLING_BACK, // Hedge connector failed to init
    PositionState.ERROR,
  ]),
  [PositionState.HEDGE_SUBMITTING]: new Set([
    PositionState.ACTIVE,       // Hedge filled
    PositionState.ROLLING_BACK, // Hedge rejected -> rollback primary
    PositionState.ERROR,
  ]),
  [PositionState.ACTIVE]: new Set([
    PositionState.CLOSE_TRIGGERED,
    PositionState.CLOSING,      // Direct close (user request)
    PositionState.ERROR,        // Exchange disconnection, data inconsistency
  ]),
  [PositionState.CLOSE_TRIGGERED]: new Set([
    PositionState.CLOSING,
    PositionState.ERROR,
  ]),
  [PositionState.CLOSING]: new Set([
    PositionState.PRIMARY_CLOSED,
    PositionState.COMPLETED,    // Both legs closed atomically
    PositionState.ERROR,
  ]),
  [PositionState.PRIMARY_CLOSED]: new Set([
    PositionState.COMPLETED,
    PositionState.ERROR,        // Hedge close failed
  ]),
  [PositionState.COMPLETED]: new Set([]),  // Terminal state
  [PositionState.ROLLING_BACK]: new Set([
    PositionState.ROLLED_BACK,
    PositionState.ERROR,        // Rollback itself failed -> CRITICAL
  ]),
  [PositionState.ROLLED_BACK]: new Set([]), // Terminal state
  [PositionState.ERROR]: new Set([
    PositionState.ROLLING_BACK, // Operator-initiated recovery
    PositionState.CLOSING,      // Operator-initiated close
    PositionState.COMPLETED,    // Operator-confirmed resolved
  ]),
  [PositionState.CANCELLED]: new Set([]),   // Terminal state
};

/**
 * Terminal states: no further transitions allowed (except ERROR which allows recovery)
 */
export const TERMINAL_STATES = new Set([
  PositionState.COMPLETED,
  PositionState.ROLLED_BACK,
  PositionState.CANCELLED,
]);

/**
 * States that hold capital on exchanges (require verification on recovery)
 */
export const CAPITAL_AT_RISK_STATES = new Set([
  PositionState.PRIMARY_SUBMITTING,
  PositionState.PRIMARY_FILLED,
  PositionState.HEDGE_SUBMITTING,
  PositionState.ACTIVE,
  PositionState.CLOSE_TRIGGERED,
  PositionState.CLOSING,
  PositionState.PRIMARY_CLOSED,
  PositionState.ROLLING_BACK,
  PositionState.ERROR,
]);

// ---------------------------------------------------------------------------
// WAL entry schema
// ---------------------------------------------------------------------------

export enum WALEntryStatus {
  /** Transition intended but not yet executed */
  PENDING = 'PENDING',
  /** Exchange call in progress */
  EXECUTING = 'EXECUTING',
  /** Transition confirmed (exchange verified) */
  CONFIRMED = 'CONFIRMED',
  /** Transition failed */
  FAILED = 'FAILED',
  /** Superseded by a newer entry (conflict resolution) */
  SUPERSEDED = 'SUPERSEDED',
}

export const WALEntrySchema = z.object({
  /** Auto-incrementing WAL sequence number */
  sequence: z.number().int().positive(),
  /** Position ID this entry belongs to */
  positionId: z.string(),
  /** User ID (for access control) */
  userId: z.string(),
  /** State BEFORE this transition */
  fromState: z.nativeEnum(PositionState),
  /** Intended state AFTER this transition */
  toState: z.nativeEnum(PositionState),
  /** Why this transition is happening */
  reason: z.string(),
  /** WAL entry status */
  status: z.nativeEnum(WALEntryStatus),
  /** Exchange order IDs involved (for verification) */
  exchangeOrderIds: z.array(z.string()).optional(),
  /** Exchange name(s) involved */
  exchanges: z.array(z.string()).optional(),
  /** Symbol */
  symbol: z.string().optional(),
  /** Arbitrary metadata (prices, quantities, etc.) */
  metadata: z.record(z.string(), z.unknown()).optional(),
  /** Error details if status === FAILED */
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  /** Timestamps */
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WALEntry = z.infer<typeof WALEntrySchema>;

// ---------------------------------------------------------------------------
// State machine logic
// ---------------------------------------------------------------------------

export class PositionStateMachine {
  private currentState: PositionState;
  private readonly positionId: string;
  private readonly userId: string;
  private transitionHistory: Array<{
    from: PositionState;
    to: PositionState;
    reason: string;
    timestamp: Date;
  }> = [];

  constructor(positionId: string, userId: string, initialState: PositionState = PositionState.INTENT) {
    this.positionId = positionId;
    this.userId = userId;
    this.currentState = initialState;
  }

  /**
   * Validate whether a transition is allowed
   */
  canTransition(toState: PositionState): boolean {
    const allowed = VALID_TRANSITIONS[this.currentState];
    return allowed !== undefined && allowed.has(toState);
  }

  /**
   * Execute a state transition (in-memory only; WAL write is caller's responsibility)
   * Throws if the transition is invalid.
   */
  transition(toState: PositionState, reason: string): void {
    if (!this.canTransition(toState)) {
      throw new PositionStateError(
        ErrorCode.POSITION_INVALID_STATE_TRANSITION,
        `Invalid transition: ${this.currentState} -> ${toState}. ` +
        `Allowed: [${Array.from(VALID_TRANSITIONS[this.currentState] || []).join(', ')}]`,
        this.positionId,
        this.currentState,
        toState
      );
    }

    const from = this.currentState;
    this.currentState = toState;
    this.transitionHistory.push({
      from,
      to: toState,
      reason,
      timestamp: new Date(),
    });
  }

  getState(): PositionState {
    return this.currentState;
  }

  getPositionId(): string {
    return this.positionId;
  }

  getUserId(): string {
    return this.userId;
  }

  isTerminal(): boolean {
    return TERMINAL_STATES.has(this.currentState);
  }

  hasCapitalAtRisk(): boolean {
    return CAPITAL_AT_RISK_STATES.has(this.currentState);
  }

  getHistory(): ReadonlyArray<{
    from: PositionState;
    to: PositionState;
    reason: string;
    timestamp: Date;
  }> {
    return this.transitionHistory;
  }
}

// ---------------------------------------------------------------------------
// Custom error type for state machine violations
// ---------------------------------------------------------------------------

export class PositionStateError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly positionId: string,
    public readonly fromState: PositionState,
    public readonly toState: PositionState
  ) {
    super(message);
    this.name = 'PositionStateError';
  }
}

// ---------------------------------------------------------------------------
// Recovery procedure specification
// ---------------------------------------------------------------------------

/**
 * Exchange position verification result.
 * Used during crash recovery to determine actual exchange state.
 */
export interface ExchangePositionVerification {
  exchange: string;
  symbol: string;
  /** Whether a position exists on this exchange */
  positionExists: boolean;
  /** Position size (0 if no position) */
  positionSize: number;
  /** Position side if exists */
  positionSide: 'long' | 'short' | null;
  /** Unrealized P&L */
  unrealizedPnl: number;
  /** Entry price */
  entryPrice: number;
  /** Mark price at verification time */
  markPrice: number;
  /** Verification timestamp (nanoseconds) */
  verifiedAtNs: string;
  /** Whether the exchange was reachable */
  exchangeReachable: boolean;
  /** Error if exchange was unreachable */
  error?: string;
}

/**
 * Recovery decision for a position after crash.
 * The recovery procedure uses WAL + exchange verification to decide.
 */
export enum RecoveryAction {
  /** Resume normal operation (position is in expected state) */
  RESUME = 'RESUME',
  /** Close all legs (position is inconsistent) */
  EMERGENCY_CLOSE = 'EMERGENCY_CLOSE',
  /** Rollback succeeded leg (other leg failed) */
  ROLLBACK = 'ROLLBACK',
  /** Mark as completed (positions already closed) */
  MARK_COMPLETED = 'MARK_COMPLETED',
  /** Escalate to operator (cannot determine safe action) */
  ESCALATE = 'ESCALATE',
}

export interface RecoveryPlan {
  positionId: string;
  walEntries: WALEntry[];
  primaryVerification: ExchangePositionVerification;
  hedgeVerification: ExchangePositionVerification;
  action: RecoveryAction;
  reason: string;
  /** The state to transition to after recovery */
  targetState: PositionState;
}

/**
 * Recovery decision logic.
 *
 * Priority: protect capital > log everything > alert operator > recover
 *
 * Decision matrix:
 *
 * | Last WAL State       | Primary on Exchange | Hedge on Exchange | Action          |
 * |---------------------|---------------------|-------------------|-----------------|
 * | INTENT              | No                  | No                | MARK_COMPLETED  |
 * | PRIMARY_SUBMITTING  | No                  | No                | MARK_COMPLETED  |
 * | PRIMARY_SUBMITTING  | Yes                 | No                | ROLLBACK        |
 * | PRIMARY_FILLED      | Yes                 | No                | ROLLBACK        |
 * | HEDGE_SUBMITTING    | Yes                 | No                | ROLLBACK        |
 * | HEDGE_SUBMITTING    | Yes                 | Yes               | RESUME (ACTIVE) |
 * | ACTIVE              | Yes                 | Yes               | RESUME          |
 * | ACTIVE              | Yes                 | No                | EMERGENCY_CLOSE |
 * | ACTIVE              | No                  | Yes               | EMERGENCY_CLOSE |
 * | ACTIVE              | No                  | No                | MARK_COMPLETED  |
 * | CLOSING             | Partial/Full        | Partial/Full      | EMERGENCY_CLOSE |
 * | Any                 | Unreachable         | Unreachable       | ESCALATE        |
 */
export function determineRecoveryAction(
  lastWalState: PositionState,
  primary: ExchangePositionVerification,
  hedge: ExchangePositionVerification
): { action: RecoveryAction; targetState: PositionState; reason: string } {

  // If either exchange is unreachable, we cannot safely determine state -> escalate
  if (!primary.exchangeReachable || !hedge.exchangeReachable) {
    return {
      action: RecoveryAction.ESCALATE,
      targetState: PositionState.ERROR,
      reason: `Exchange unreachable during recovery. Primary: ${primary.exchangeReachable}, Hedge: ${hedge.exchangeReachable}. ` +
              `Errors: ${primary.error || 'none'}, ${hedge.error || 'none'}`,
    };
  }

  const hasPrimary = primary.positionExists && primary.positionSize !== 0;
  const hasHedge = hedge.positionExists && hedge.positionSize !== 0;

  // No positions on either exchange
  if (!hasPrimary && !hasHedge) {
    return {
      action: RecoveryAction.MARK_COMPLETED,
      targetState: PositionState.COMPLETED,
      reason: `No positions found on either exchange. Last WAL state: ${lastWalState}`,
    };
  }

  // Both positions exist
  if (hasPrimary && hasHedge) {
    // Positions are hedged, resume monitoring
    if (
      lastWalState === PositionState.ACTIVE ||
      lastWalState === PositionState.HEDGE_SUBMITTING ||
      lastWalState === PositionState.CLOSE_TRIGGERED
    ) {
      return {
        action: RecoveryAction.RESUME,
        targetState: PositionState.ACTIVE,
        reason: `Both positions exist on exchanges. Resuming from ${lastWalState}`,
      };
    }
    // Unexpected state with both positions open -> close to protect capital
    return {
      action: RecoveryAction.EMERGENCY_CLOSE,
      targetState: PositionState.CLOSING,
      reason: `Both positions exist but WAL state is ${lastWalState}. Emergency close to protect capital.`,
    };
  }

  // Only primary exists (hedge missing or closed)
  if (hasPrimary && !hasHedge) {
    // If we were still opening, rollback the primary
    if (
      lastWalState === PositionState.PRIMARY_SUBMITTING ||
      lastWalState === PositionState.PRIMARY_FILLED ||
      lastWalState === PositionState.HEDGE_SUBMITTING
    ) {
      return {
        action: RecoveryAction.ROLLBACK,
        targetState: PositionState.ROLLING_BACK,
        reason: `Primary position exists but hedge does not. Last WAL: ${lastWalState}. Rolling back primary.`,
      };
    }
    // If we were closing, continue emergency close
    return {
      action: RecoveryAction.EMERGENCY_CLOSE,
      targetState: PositionState.CLOSING,
      reason: `Only primary exists, hedge already closed. Last WAL: ${lastWalState}. Closing primary.`,
    };
  }

  // Only hedge exists (primary missing or closed)
  if (!hasPrimary && hasHedge) {
    return {
      action: RecoveryAction.EMERGENCY_CLOSE,
      targetState: PositionState.CLOSING,
      reason: `Only hedge exists, primary missing. Last WAL: ${lastWalState}. Closing hedge to protect capital.`,
    };
  }

  // Should not reach here, but escalate as safety
  return {
    action: RecoveryAction.ESCALATE,
    targetState: PositionState.ERROR,
    reason: `Unexpected state combination. Primary: ${hasPrimary}, Hedge: ${hasHedge}, WAL: ${lastWalState}`,
  };
}
