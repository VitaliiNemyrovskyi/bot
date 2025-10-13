import { FundingArbitrageStatus, ArbitrageMode } from '@prisma/client';

/**
 * Trade History Data Transfer Object
 *
 * Represents a single closed funding arbitrage trade with all relevant details.
 */
export interface TradeHistoryDTO {
  /** Unique subscription ID */
  id: string;

  /** Trading symbol (e.g., "BTCUSDT") */
  symbol: string;

  /** ISO timestamp when positions were opened */
  executedAt: string | null;

  /** ISO timestamp when positions were closed */
  closedAt: string | null;

  /** Total position size in USDT (margin × leverage) */
  positionSizeUsdt: number;

  /** Funding payment earned/paid in USDT */
  fundingEarned: number | null;

  /** Total realized P&L before fees in USDT */
  realizedPnl: number | null;

  /** Average entry price for primary position */
  entryPrice: number | null;

  /** Exit price for primary position */
  exitPrice: number | null;

  /** Leverage multiplier used */
  leverage: number;

  /** Position size in base asset */
  quantity: number;

  /** Position status */
  status: FundingArbitrageStatus;

  /** Margin/collateral used in USDT */
  margin: number | null;

  /** Primary exchange name */
  primaryExchange: string;

  /** Hedge exchange name (null for NON_HEDGED mode) */
  hedgeExchange: string | null;

  /** Arbitrage mode */
  mode: ArbitrageMode;

  /** Position type: "long" or "short" */
  positionType: string;

  /** Funding rate at subscription time */
  fundingRate: number;

  /** Trading fees on primary exchange */
  primaryTradingFees: number | null;

  /** Trading fees on hedge exchange */
  hedgeTradingFees: number | null;

  /** Combined trading fees */
  totalFees: number;

  /** Net P&L after fees (realizedPnl - totalFees) */
  netPnl: number | null;
}

/**
 * Trade History API Response
 */
export interface TradeHistoryResponse {
  /** Indicates if the request was successful */
  success: boolean;

  /** Array of trade history records */
  data: TradeHistoryDTO[];

  /** Total number of records returned */
  count: number;

  /** Response timestamp */
  timestamp: string;
}

/**
 * Trade History API Error Response
 */
export interface TradeHistoryErrorResponse {
  /** Always false for error responses */
  success: false;

  /** Error type */
  error: string;

  /** Human-readable error message */
  message: string;

  /** Machine-readable error code */
  code: string;

  /** Response timestamp */
  timestamp: string;
}

/**
 * Trade History Query Parameters
 */
export interface TradeHistoryQueryParams {
  /** Trading symbol (required) */
  symbol: string;

  /** Primary exchange name (required) */
  exchange: string;

  /** Maximum number of records to return (optional, default: 50, max: 200) */
  limit?: number;
}

/**
 * Trade Statistics Aggregation
 *
 * Calculated statistics from a set of trades.
 */
export interface TradeStatistics {
  /** Total number of trades */
  totalTrades: number;

  /** Number of profitable trades */
  profitableTrades: number;

  /** Number of losing trades */
  losingTrades: number;

  /** Win rate as percentage (0-100) */
  winRate: number;

  /** Total realized P&L before fees */
  totalRealizedPnl: number;

  /** Total fees paid */
  totalFees: number;

  /** Total net P&L after fees */
  totalNetPnl: number;

  /** Average net P&L per trade */
  averageNetPnl: number;

  /** Largest winning trade */
  largestWin: number;

  /** Largest losing trade */
  largestLoss: number;

  /** Total funding earned */
  totalFundingEarned: number;
}

/**
 * Utility function to calculate trade statistics from trade history data
 */
export function calculateTradeStatistics(trades: TradeHistoryDTO[]): TradeStatistics {
  const totalTrades = trades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      profitableTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalRealizedPnl: 0,
      totalFees: 0,
      totalNetPnl: 0,
      averageNetPnl: 0,
      largestWin: 0,
      largestLoss: 0,
      totalFundingEarned: 0,
    };
  }

  let profitableTrades = 0;
  let losingTrades = 0;
  let totalRealizedPnl = 0;
  let totalFees = 0;
  let totalNetPnl = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let totalFundingEarned = 0;

  for (const trade of trades) {
    const netPnl = trade.netPnl ?? 0;
    const realizedPnl = trade.realizedPnl ?? 0;
    const fundingEarned = trade.fundingEarned ?? 0;

    // Count profitable/losing trades
    if (netPnl > 0) {
      profitableTrades++;
    } else if (netPnl < 0) {
      losingTrades++;
    }

    // Accumulate totals
    totalRealizedPnl += realizedPnl;
    totalFees += trade.totalFees;
    totalNetPnl += netPnl;
    totalFundingEarned += fundingEarned;

    // Track largest win/loss
    if (netPnl > largestWin) {
      largestWin = netPnl;
    }
    if (netPnl < largestLoss) {
      largestLoss = netPnl;
    }
  }

  const winRate = (profitableTrades / totalTrades) * 100;
  const averageNetPnl = totalNetPnl / totalTrades;

  return {
    totalTrades,
    profitableTrades,
    losingTrades,
    winRate,
    totalRealizedPnl,
    totalFees,
    totalNetPnl,
    averageNetPnl,
    largestWin,
    largestLoss,
    totalFundingEarned,
  };
}

/**
 * Trade History Filter Options
 *
 * Additional client-side filtering options.
 */
export interface TradeHistoryFilters {
  /** Filter by status */
  status?: FundingArbitrageStatus[];

  /** Filter by arbitrage mode */
  mode?: ArbitrageMode[];

  /** Filter by position type */
  positionType?: ('long' | 'short')[];

  /** Minimum net P&L */
  minNetPnl?: number;

  /** Maximum net P&L */
  maxNetPnl?: number;

  /** Start date (ISO string) */
  startDate?: string;

  /** End date (ISO string) */
  endDate?: string;
}

/**
 * Utility function to apply client-side filters to trade history
 */
export function filterTrades(
  trades: TradeHistoryDTO[],
  filters: TradeHistoryFilters
): TradeHistoryDTO[] {
  return trades.filter((trade) => {
    // Filter by status
    if (filters.status && !filters.status.includes(trade.status)) {
      return false;
    }

    // Filter by mode
    if (filters.mode && !filters.mode.includes(trade.mode)) {
      return false;
    }

    // Filter by position type
    if (filters.positionType && !filters.positionType.includes(trade.positionType as 'long' | 'short')) {
      return false;
    }

    // Filter by minimum net P&L
    if (filters.minNetPnl !== undefined && (trade.netPnl ?? 0) < filters.minNetPnl) {
      return false;
    }

    // Filter by maximum net P&L
    if (filters.maxNetPnl !== undefined && (trade.netPnl ?? 0) > filters.maxNetPnl) {
      return false;
    }

    // Filter by start date
    if (filters.startDate && trade.closedAt && trade.closedAt < filters.startDate) {
      return false;
    }

    // Filter by end date
    if (filters.endDate && trade.closedAt && trade.closedAt > filters.endDate) {
      return false;
    }

    return true;
  });
}
