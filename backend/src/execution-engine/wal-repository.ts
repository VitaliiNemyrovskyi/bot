/**
 * Write-Ahead Log Repository
 *
 * Persists state transitions to PostgreSQL BEFORE exchange calls.
 * Provides crash recovery by replaying uncommitted entries and
 * reconciling with actual exchange state.
 *
 * Schema is designed for:
 * - Append-only writes (fast inserts)
 * - Efficient recovery queries (index on positionId + status)
 * - Audit trail (never deleted, only status updated)
 */

import { PrismaClient } from '@prisma/client';
import {
  PositionState,
  WALEntry,
  WALEntryStatus,
  CAPITAL_AT_RISK_STATES,
} from './position-state-machine';

/**
 * WAL Repository - writes state transition intentions to PostgreSQL
 * before any exchange interaction occurs.
 */
export class WALRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Write a PENDING WAL entry BEFORE executing the transition.
   * This is the "write-ahead" part: if the process crashes after this
   * but before the exchange call, recovery can detect and reconcile.
   *
   * Returns the WAL sequence number.
   */
  async writePending(params: {
    positionId: string;
    userId: string;
    fromState: PositionState;
    toState: PositionState;
    reason: string;
    symbol?: string;
    exchanges?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<number> {
    const entry = await this.prisma.positionWAL.create({
      data: {
        positionId: params.positionId,
        userId: params.userId,
        fromState: params.fromState,
        toState: params.toState,
        reason: params.reason,
        status: WALEntryStatus.PENDING,
        symbol: params.symbol,
        exchanges: params.exchanges ?? [],
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });

    return entry.sequence;
  }

  /**
   * Mark a WAL entry as EXECUTING (exchange call started).
   * Includes exchange order IDs when available.
   */
  async markExecuting(
    sequence: number,
    exchangeOrderIds?: string[]
  ): Promise<void> {
    await this.prisma.positionWAL.update({
      where: { sequence },
      data: {
        status: WALEntryStatus.EXECUTING,
        exchangeOrderIds: exchangeOrderIds ?? [],
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Confirm a WAL entry (transition succeeded, exchange verified).
   */
  async confirm(
    sequence: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.prisma.positionWAL.update({
      where: { sequence },
      data: {
        status: WALEntryStatus.CONFIRMED,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark a WAL entry as FAILED (transition did not succeed).
   */
  async markFailed(
    sequence: number,
    errorCode: string,
    errorMessage: string
  ): Promise<void> {
    await this.prisma.positionWAL.update({
      where: { sequence },
      data: {
        status: WALEntryStatus.FAILED,
        errorCode,
        errorMessage,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get all uncommitted (PENDING or EXECUTING) WAL entries.
   * Used during crash recovery to find transitions that were in-flight.
   */
  async getUncommittedEntries(): Promise<WALEntry[]> {
    const entries = await this.prisma.positionWAL.findMany({
      where: {
        status: { in: [WALEntryStatus.PENDING, WALEntryStatus.EXECUTING] },
      },
      orderBy: { sequence: 'asc' },
    });

    return entries.map(this.mapToWALEntry);
  }

  /**
   * Get the latest WAL entry for a position.
   * Used to determine the last known state during recovery.
   */
  async getLatestForPosition(positionId: string): Promise<WALEntry | null> {
    const entry = await this.prisma.positionWAL.findFirst({
      where: { positionId },
      orderBy: { sequence: 'desc' },
    });

    return entry ? this.mapToWALEntry(entry) : null;
  }

  /**
   * Get all WAL entries for a position, ordered by sequence.
   * Used for full audit trail and recovery analysis.
   */
  async getEntriesForPosition(positionId: string): Promise<WALEntry[]> {
    const entries = await this.prisma.positionWAL.findMany({
      where: { positionId },
      orderBy: { sequence: 'asc' },
    });

    return entries.map(this.mapToWALEntry);
  }

  /**
   * Get all positions that have capital at risk (non-terminal states
   * according to the state machine). Used during startup recovery.
   */
  async getPositionsWithCapitalAtRisk(): Promise<string[]> {
    const capitalAtRiskStates = Array.from(CAPITAL_AT_RISK_STATES);

    // Find distinct position IDs where the latest WAL entry has a
    // capital-at-risk toState and is CONFIRMED (meaning the position
    // actually reached that state)
    const results = await this.prisma.$queryRaw<Array<{ positionId: string }>>`
      SELECT DISTINCT pw."positionId"
      FROM "position_wal" pw
      INNER JOIN (
        SELECT "positionId", MAX(sequence) as max_seq
        FROM "position_wal"
        WHERE status = 'CONFIRMED'
        GROUP BY "positionId"
      ) latest ON pw."positionId" = latest."positionId" AND pw.sequence = latest.max_seq
      WHERE pw."toState" = ANY(${capitalAtRiskStates}::text[])
    `;

    return results.map(r => r.positionId);
  }

  /**
   * Supersede all PENDING/EXECUTING entries for a position.
   * Used when recovery determines a different course of action.
   */
  async supersedePendingEntries(positionId: string): Promise<number> {
    const result = await this.prisma.positionWAL.updateMany({
      where: {
        positionId,
        status: { in: [WALEntryStatus.PENDING, WALEntryStatus.EXECUTING] },
      },
      data: {
        status: WALEntryStatus.SUPERSEDED,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  private mapToWALEntry(raw: {
    sequence: number;
    positionId: string;
    userId: string;
    fromState: string;
    toState: string;
    reason: string;
    status: string;
    exchangeOrderIds: string[];
    exchanges: string[];
    symbol: string | null;
    metadata: unknown;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): WALEntry {
    return {
      sequence: raw.sequence,
      positionId: raw.positionId,
      userId: raw.userId,
      fromState: raw.fromState as PositionState,
      toState: raw.toState as PositionState,
      reason: raw.reason,
      status: raw.status as WALEntryStatus,
      exchangeOrderIds: raw.exchangeOrderIds,
      exchanges: raw.exchanges,
      symbol: raw.symbol ?? undefined,
      metadata: raw.metadata as Record<string, unknown> | undefined,
      errorCode: raw.errorCode ?? undefined,
      errorMessage: raw.errorMessage ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
