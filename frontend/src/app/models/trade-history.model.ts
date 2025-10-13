/**
 * Trade History Data Models
 *
 * This module defines TypeScript interfaces for trade history records
 * and API responses from the backend trade history endpoints.
 */

/**
 * Individual Trade History Record
 *
 * Represents a single completed trade with all relevant execution details,
 * profit/loss information, and position metadata.
 */
export interface TradeHistoryRecord {
  /** Unique identifier for the trade record */
  id: string;

  /** Trading pair symbol (e.g., BTCUSDT, ETHUSDT) */
  symbol: string;

  /** Exchange where the trade was executed */
  exchange: string;

  /** ISO 8601 timestamp when the position was opened */
  executedAt: string;

  /** ISO 8601 timestamp when the position was closed (null if still open) */
  closedAt: string | null;

  /** Position size in USDT */
  positionSizeUsdt: number;

  /** Total funding fees earned during the position lifecycle */
  fundingEarned: number;

  /** Realized profit/loss from the trade */
  realizedPnl: number;

  /** Entry price for the position */
  entryPrice: number;

  /** Exit price for the position (null if still open) */
  exitPrice: number | null;

  /** Leverage multiplier used for the trade */
  leverage: number;

  /** Quantity/size of the position in base asset units */
  quantity: number;

  /** Current status of the trade (e.g., 'OPEN', 'CLOSED', 'LIQUIDATED') */
  status: string;

  /** Position type (long or short) */
  positionType?: 'long' | 'short';

  /** Trading fees paid for opening the position */
  entryFee?: number;

  /** Trading fees paid for closing the position */
  exitFee?: number;

  /** Duration of the trade in seconds */
  duration?: number;

  /** Return on investment as a percentage */
  roi?: number;
}

/**
 * API Response for Trade History Queries
 *
 * Standard response envelope for trade history endpoints
 * following the established API response pattern.
 */
export interface TradeHistoryResponse {
  /** Indicates if the request was successful */
  success: boolean;

  /** Array of trade history records */
  data: TradeHistoryRecord[];

  /** Total count of records matching the query */
  count: number;

  /** Error message if success is false */
  error?: string;

  /** Additional metadata about pagination */
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Query Parameters for Trade History Requests
 *
 * Defines available filters and options when fetching trade history.
 */
export interface TradeHistoryQueryParams {
  /** Filter by trading pair symbol */
  symbol?: string;

  /** Filter by exchange */
  exchange?: string;

  /** Maximum number of records to return */
  limit?: number;

  /** Starting position for pagination */
  offset?: number;

  /** Filter by trade status */
  status?: 'OPEN' | 'CLOSED' | 'LIQUIDATED' | 'ALL';

  /** Start date for date range filter (ISO 8601) */
  startDate?: string;

  /** End date for date range filter (ISO 8601) */
  endDate?: string;

  /** Sort field */
  sortBy?: 'executedAt' | 'closedAt' | 'realizedPnl' | 'fundingEarned';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Trade Statistics Summary
 *
 * Aggregated statistics for a collection of trades.
 */
export interface TradeStatistics {
  /** Total number of trades */
  totalTrades: number;

  /** Number of profitable trades */
  profitableTrades: number;

  /** Number of losing trades */
  losingTrades: number;

  /** Win rate as a percentage (0-100) */
  winRate: number;

  /** Total profit/loss across all trades */
  totalPnl: number;

  /** Total funding fees earned */
  totalFunding: number;

  /** Average PnL per trade */
  averagePnl: number;

  /** Largest winning trade */
  largestWin: number;

  /** Largest losing trade */
  largestLoss: number;

  /** Total trading fees paid */
  totalFees: number;

  /** Net profit after fees */
  netProfit: number;

  /** Average return on investment percentage */
  averageRoi: number;
}
