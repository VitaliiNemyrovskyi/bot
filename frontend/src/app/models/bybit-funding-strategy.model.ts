/**
 * Bybit Funding Strategy Models
 *
 * Models for both Regular Funding Strategy and Precise Timing Strategy
 */

// ============================================================================
// Common Types
// ============================================================================

export type StrategyStatus =
  | 'initializing'
  | 'monitoring'
  | 'executing'
  | 'position_1_open'
  | 'funding_time'
  | 'both_open'
  | 'cycling'
  | 'completed'
  | 'error';

export type PositionSide = 'Buy' | 'Sell';
export type PositionSideConfig = 'Auto' | 'Buy' | 'Sell';

// ============================================================================
// Regular Funding Strategy (opens 5s BEFORE funding time)
// ============================================================================

export interface FundingStrategyConfig {
  symbol: string;
  leverage: number; // e.g., 10
  margin: number; // in USDT, e.g., 100
  side: PositionSide; // Position side to collect funding
  executionDelay: number; // Seconds before funding to open position (default: 5)
  takeProfitPercent: number; // Percentage of expected funding (default: 90 = 90%)
  stopLossPercent: number; // Stop loss percentage (default: 50 = 50% of expected funding)
  credentialId?: string; // Optional: specific credential ID
}

export interface StartFundingStrategyRequest {
  symbol: string;
  leverage?: number;
  margin?: number;
  side?: PositionSide;
  executionDelay?: number;
  takeProfitPercent?: number;
  stopLossPercent?: number;
  credentialId?: string;
}

export interface StartFundingStrategyResponse {
  success: boolean;
  data?: {
    strategyId: string;
    symbol: string;
    leverage: number;
    margin: number;
    side: PositionSide;
    executionDelay: number;
    takeProfitPercent: number;
    stopLossPercent: number;
    environment: 'TESTNET' | 'MAINNET';
  };
  message?: string;
  error?: string;
}

// ============================================================================
// Precise Timing Strategy (opens 20ms AFTER funding time)
// ============================================================================

export interface PreciseTimingStrategyConfig {
  symbol: string;
  leverage: number; // e.g., 10
  margin: number; // in USDT, e.g., 100
  positionSide: PositionSideConfig; // 'Auto' = determine from funding rate, otherwise manual
  takeProfitPercent: number; // Percentage of expected funding (default: 90 = 90%)
  stopLossPercent: number; // Stop loss percentage (default: 50 = 50% of expected funding)
  timingOffset: number; // Milliseconds after funding time to execute (default: 20ms)
  autoRepeat: boolean; // If true, automatically repeat strategy for next funding cycle
  enableWebSocketMonitoring?: boolean; // Enable real-time position monitoring (default: true)
  credentialId?: string; // Optional: specific credential ID
}

export interface StartPreciseTimingStrategyRequest {
  symbol: string;
  leverage?: number;
  margin?: number;
  positionSide?: PositionSideConfig;
  takeProfitPercent?: number;
  stopLossPercent?: number;
  timingOffset?: number;
  autoRepeat?: boolean;
  enableWebSocketMonitoring?: boolean;
  credentialId?: string;
}

export interface StartPreciseTimingStrategyResponse {
  success: boolean;
  data?: {
    strategyId: string;
    symbol: string;
    leverage: number;
    margin: number;
    positionSide: PositionSideConfig;
    takeProfitPercent: number;
    stopLossPercent: number;
    timingOffset: number;
    autoRepeat: boolean;
    enableWebSocketMonitoring: boolean;
    environment: 'TESTNET' | 'MAINNET';
  };
  message?: string;
  error?: string;
}

// ============================================================================
// Active Strategy (response from GET /api/bybit-funding-strategy)
// ============================================================================

export interface ActiveStrategy {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  margin: number;
  fundingRate: number;
  nextFundingTime: number; // timestamp in ms
  secondsRemaining: number;
  status: StrategyStatus;
  hasPosition: boolean;
  positionSize: number;
  entryPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  positionReopenCount: number;
  realizedPnl?: number;
  errorMessage?: string;
}

export interface GetActiveStrategiesResponse {
  success: boolean;
  data?: ActiveStrategy[];
  error?: string;
}

// ============================================================================
// Stop Strategy
// ============================================================================

export interface StopStrategyRequest {
  strategyId: string;
}

export interface StopStrategyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// Strategy Events (for WebSocket or EventSource)
// ============================================================================

export interface StrategyCountdownEvent {
  strategyId: string;
  symbol: string;
  secondsRemaining: number;
  fundingRate: number;
  nextFundingTime: number;
}

export interface StrategyPositionOpeningEvent {
  strategyId: string;
  symbol: string;
  side: PositionSide;
  price: number;
  margin: number;
  leverage: number;
  positionNumber: number;
}

export interface StrategyPositionOpenedEvent {
  strategyId: string;
  positionNumber: number;
  side: PositionSide;
  tpPrice: number;
  slPrice: number;
  entryPrice: number;
}

export interface StrategyPositionClosedEvent {
  strategyId: string;
  positionNumber: number;
  side: PositionSide;
  reason: 'tp' | 'sl' | 'funding' | 'tp_or_sl' | 'take_profit_reached' | 'stop_loss_reached';
  price?: number;
  trigger?: 'failsafe' | 'websocket';
}

export interface StrategyFundingCollectedEvent {
  strategyId: string;
  amount: number;
  fundingRate: number;
  positionReopenCount: number;
}

export interface StrategyErrorEvent {
  strategyId: string;
  error: string;
  action?: string;
  positionNumber?: number;
}

export interface StrategyPositionReopeningEvent {
  strategyId: string;
  positionNumber?: number;
  attempt: number;
  secondsRemaining: number;
  reason?: string;
}
