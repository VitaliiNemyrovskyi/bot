/**
 * Triangular Arbitrage Models
 *
 * Defines all TypeScript interfaces and types for the triangular arbitrage feature
 */

/**
 * Exchange identifier
 */
export type Exchange = 'BYBIT' | 'BINANCE' | 'BINGX' | 'MEXC' | 'GATEIO' | 'BITGET' | 'OKX';

/**
 * Trading triangle direction
 */
export type TriangleDirection = 'forward' | 'backward';

/**
 * Position status through execution lifecycle
 */
export type PositionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';

/**
 * Individual leg status
 */
export type LegStatus = 'pending' | 'executing' | 'completed' | 'error';

/**
 * Scanner status
 */
export type ScannerStatus = 'stopped' | 'scanning' | 'error';

/**
 * Triangle path configuration
 * Represents the three assets in a triangular arbitrage path
 */
export interface TrianglePath {
  assetA: string;  // Starting asset (e.g., 'USDT')
  assetB: string;  // Intermediate asset 1 (e.g., 'BTC')
  assetC: string;  // Intermediate asset 2 (e.g., 'ETH')
  direction: TriangleDirection;
}

/**
 * Price information for a trading pair
 */
export interface PairPrice {
  symbol: string;       // e.g., 'BTC/USDT'
  bidPrice: number;     // Best bid price
  askPrice: number;     // Best ask price
  lastPrice: number;    // Last traded price
  timestamp: number;
}

/**
 * Arbitrage opportunity detected by the scanner
 */
export interface TriangularOpportunity {
  id: string;
  exchange: Exchange;
  triangle: TrianglePath;

  // Price information for each leg
  leg1: PairPrice;  // Asset A → Asset B
  leg2: PairPrice;  // Asset B → Asset C
  leg3: PairPrice;  // Asset C → Asset A

  // Profitability metrics
  profitPercentage: number;         // Theoretical profit in % (mid prices, no spread)
  profitAmount: number;              // Theoretical profit in starting asset (USDT)
  estimatedSlippage: number;         // Estimated slippage in %
  netProfitPercentage: number;       // Profit after fees and slippage (legacy calculation)
  realisticProfitPercentage?: number; // Realistic profit accounting for bid/ask spread, fees, slippage, cost buffer
  realisticProfitAmount?: number;     // Realistic profit in starting asset (USDT)

  // Metadata
  detectedAt: number;            // Timestamp when detected
  expiresAt?: number;            // Optional expiration timestamp
  volume24h?: number;            // 24h volume indicator

  // Execution readiness
  isExecutable: boolean;         // Whether it meets execution criteria
  warningMessage?: string;       // Optional warning about execution
}

/**
 * Scanner configuration
 * Note: credentialId is optional - backend auto-selects active credential for the exchange
 */
export interface ScannerConfig {
  exchange: Exchange;
  credentialId?: string;         // Optional: ID of exchange credentials (auto-selected if not provided)
  minProfitPercentage: number;   // Minimum profit % to detect (default: 0.1)
  maxSlippage: number;           // Maximum acceptable slippage % (default: 0.1)
  positionSize: number;          // Position size in USDT
  autoExecute: boolean;          // Whether to auto-execute opportunities
  trianglePaths?: TrianglePath[]; // Specific paths to scan (optional)
}

/**
 * Scanner statistics
 */
export interface ScannerStats {
  status: ScannerStatus;
  opportunitiesDetectedToday: number;
  opportunitiesExecutedToday: number;
  totalProfitToday: number;      // Total profit in USDT
  avgProfitPercentage: number;
  scanningDuration: number;       // Time in ms scanner has been running
  lastOpportunityAt?: number;     // Timestamp of last opportunity
}

/**
 * Individual execution leg
 */
export interface ExecutionLeg {
  legNumber: 1 | 2 | 3;
  symbol: string;              // Trading pair symbol
  side: 'buy' | 'sell';
  status: LegStatus;

  // Order details
  orderId?: string;
  targetQuantity: number;
  filledQuantity: number;
  averagePrice?: number;

  // Execution metrics
  estimatedPrice: number;
  actualPrice?: number;
  slippage?: number;           // Actual slippage in %
  fee?: number;                // Trading fee in quote asset
  feePercentage?: number;      // Fee as percentage

  // Timing
  startedAt?: number;
  completedAt?: number;
  executionTimeMs?: number;

  // Error handling
  error?: string;
  retryCount?: number;
}

/**
 * Triangular arbitrage position
 */
export interface TriangularPosition {
  id: string;
  opportunityId: string;

  // Configuration
  exchange: Exchange;
  triangle: TrianglePath;
  config: ScannerConfig;

  // Status
  status: PositionStatus;

  // Financial metrics
  entryAmount: number;         // Starting amount in USDT
  expectedProfit: number;      // Expected profit in USDT
  expectedProfitPercentage: number;
  actualProfit?: number;       // Actual profit in USDT (when completed)
  actualProfitPercentage?: number;

  // Execution details
  legs: [ExecutionLeg, ExecutionLeg, ExecutionLeg];
  totalFees: number;
  totalSlippage: number;

  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  executionTimeMs?: number;

  // Error handling
  error?: string;
  errorLeg?: 1 | 2 | 3;        // Which leg failed
}

/**
 * Position filter criteria
 */
export interface PositionFilter {
  status?: PositionStatus[];
  exchange?: Exchange[];
  dateFrom?: Date;
  dateTo?: Date;
  minProfit?: number;
  maxProfit?: number;
}

/**
 * Position summary for display
 */
export interface PositionSummary {
  totalPositions: number;
  activePositions: number;
  completedPositions: number;
  failedPositions: number;
  totalProfit: number;
  totalLoss: number;
  avgProfitPercentage: number;
  successRate: number;          // Percentage of successful executions
}

/**
 * Real-time update message from SSE
 */
export interface TriangularArbitrageUpdate {
  type: 'connected' | 'heartbeat' | 'opportunity' | 'position' | 'scanner' | 'stats' | 'error';
  data: any; // Can be various types depending on event type
  timestamp: number;
}

/**
 * Execution request payload
 */
export interface ExecuteOpportunityRequest {
  opportunityId: string;
  positionSize?: number;        // Override default position size
  maxSlippage?: number;         // Override max slippage
}

/**
 * Execution response
 */
export interface ExecuteOpportunityResponse {
  success: boolean;
  positionId?: string;
  position?: TriangularPosition;
  error?: string;
}

/**
 * Export data format
 */
export interface PositionExportData {
  positions: TriangularPosition[];
  summary: PositionSummary;
  exportedAt: number;
  filters?: PositionFilter;
}
