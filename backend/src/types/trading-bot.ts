export interface TradingBot {
  id: string;
  name: string;
  userId: string;
  symbol: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'ERROR' | 'BACKTESTING';
  config: BotConfiguration;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  performance?: BotPerformance;
}

export interface BotConfiguration {
  // Basic Configuration
  symbol: string;
  baseAsset: string;
  quoteAsset: string;

  // Grid Configuration
  gridStrategy: GridStrategy;
  gridRange: GridRange;

  // Entry/Exit Filters
  entryFilters: TradingFilter[];
  exitFilters: TradingFilter[];

  // Risk Management
  riskManagement: RiskManagement;

  // Timing Configuration
  timeRestrictions?: TimeRestrictions;

  // Chart Configuration for TradingView
  chartConfig?: ChartConfiguration;
}

export interface GridStrategy {
  type: 'REGULAR' | 'FIBONACCI' | 'LOGARITHMIC' | 'MULTIPLICATOR' | 'MARTINGALE';
  gridCount: number;
  // For regular grid
  gridSpacing?: number;
  // For fibonacci
  fibonacciLevels?: number[];
  // For logarithmic
  logBase?: number;
  // For multiplicator/martingale
  multiplier?: number;
  maxMultiplierSteps?: number;
}

export interface GridRange {
  upperBound: number;
  lowerBound: number;
  autoAdjust: boolean;
  supportResistanceLevels?: number[];
}

export interface TradingFilter {
  id: string;
  name: string;
  type: 'ENTRY' | 'EXIT';
  enabled: boolean;

  // Indicator-based filters
  indicators: IndicatorFilter[];

  // Time-based filters
  timeConditions?: TimeCondition[];

  // Price-based filters
  priceConditions?: PriceCondition[];

  // Combination logic
  logic: 'AND' | 'OR';
}

export interface IndicatorFilter {
  indicator: TechnicalIndicator;
  condition: ComparisonOperator;
  value: number | 'DYNAMIC';
  timeframe: string; // '1m', '5m', '15m', '1h', '4h', '1d'

  // For dynamic values (e.g., comparing two indicators)
  compareToIndicator?: TechnicalIndicator;
}

export interface TechnicalIndicator {
  type: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER_BANDS' | 'STOCHASTIC' |
        'FIBONACCI_RETRACEMENT' | 'SUPPORT_RESISTANCE' | 'VOLUME' | 'ATR';
  period: number;

  // Specific parameters for different indicators
  parameters?: {
    // For MACD
    fastPeriod?: number;
    slowPeriod?: number;
    signalPeriod?: number;

    // For Bollinger Bands
    standardDeviations?: number;

    // For Stochastic
    kPeriod?: number;
    dPeriod?: number;

    // For Fibonacci
    levels?: number[];
  };
}

export type ComparisonOperator =
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'EQUAL_TO'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'CROSSES_ABOVE'
  | 'CROSSES_BELOW'
  | 'DIVERGENCE_BULLISH'
  | 'DIVERGENCE_BEARISH';

export interface TimeCondition {
  type: 'TIME_RANGE' | 'SPECIFIC_TIME' | 'DELAY_AFTER_SIGNAL';
  startTime?: string; // HH:MM format
  endTime?: string;
  delayMinutes?: number;
  timezone?: string;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
}

export interface PriceCondition {
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PRICE_BETWEEN' | 'VOLATILITY_CHECK';
  value: number;
  secondValue?: number; // For PRICE_BETWEEN

  // For volatility
  volatilityPeriod?: number;
  volatilityThreshold?: number;
}

export interface RiskManagement {
  // Position sizing
  baseOrderSize: number;
  maxPositionSize: number;

  // Stop loss / Take profit
  stopLossPercentage?: number;
  takeProfitPercentage?: number;

  // Maximum number of open positions
  maxOpenOrders: number;

  // Maximum daily loss
  maxDailyLoss?: number;

  // Cool down periods
  coolDownAfterLoss?: number; // minutes
  coolDownAfterProfit?: number;
}

export interface TimeRestrictions {
  tradingHours: {
    start: string; // HH:MM
    end: string;
    timezone: string;
  };
  excludedDays: number[]; // 0-6, Sunday = 0

  // Specific entry/exit times
  scheduledEntryTimes?: string[];
  scheduledExitTime?: string;
  forceExitTime?: string; // Force close all positions at this time
}

export interface ChartConfiguration {
  timeframe: string;
  indicators: ChartIndicator[];
  drawings: ChartDrawing[];
  overlays: ChartOverlay[];
}

export interface ChartIndicator {
  type: string;
  settings: Record<string, any>;
  visible: boolean;
  style?: {
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
  };
}

export interface ChartDrawing {
  type: 'TREND_LINE' | 'HORIZONTAL_LINE' | 'RECTANGLE' | 'FIBONACCI';
  points: Array<{ time: number; value: number }>;
  style: {
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
  };
}

export interface ChartOverlay {
  type: 'GRID_LEVELS' | 'ENTRY_ZONES' | 'EXIT_ZONES' | 'SUPPORT_RESISTANCE';
  data: any;
  style: {
    color: string;
    opacity: number;
  };
}

export interface BotPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  totalPnLPercentage: number;
  maxDrawdown: number;
  sharpeRatio: number;

  // Recent performance
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;

  // Risk metrics
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;

  // Updated timestamps
  lastCalculatedAt: Date;
}

export interface BacktestRequest {
  botId: string;
  config: BotConfiguration;

  // Backtest parameters
  startDate: Date;
  endDate: Date;
  initialBalance: number;

  // Data requirements
  timeframe: string;
  dataSource: 'HISTORICAL' | 'LIVE';
}

export interface BacktestResult {
  id: string;
  botId: string;
  config: BotConfiguration;

  // Test parameters
  startDate: Date;
  endDate: Date;
  initialBalance: number;

  // Results
  finalBalance: number;
  totalReturn: number;
  totalReturnPercentage: number;
  maxDrawdown: number;
  sharpeRatio: number;

  // Trade statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;

  // Time-based performance
  dailyReturns: Array<{ date: Date; return: number }>;
  monthlyReturns: Array<{ month: string; return: number }>;

  // Trade details
  trades: BacktestTrade[];

  // Chart data for visualization
  equityCurve: Array<{ time: number; value: number }>;
  drawdownCurve: Array<{ time: number; value: number }>;

  // Metadata
  createdAt: Date;
  executionTime: number; // milliseconds
}

export interface BacktestTrade {
  id: string;
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  pnl: number;
  pnlPercentage: number;

  // Trigger information
  entryReason: string;
  exitReason: string;

  // Market conditions at trade time
  marketConditions?: {
    rsi?: number;
    macd?: number;
    volume?: number;
    volatility?: number;
  };
}

// Translation keys for multilingual support
export interface BotTranslationKeys {
  botName: string;
  botDescription: string;

  // Status translations
  statusActive: string;
  statusPaused: string;
  statusStopped: string;
  statusError: string;
  statusBacktesting: string;

  // Configuration sections
  gridConfiguration: string;
  entryFilters: string;
  exitFilters: string;
  riskManagement: string;

  // Grid strategies
  gridRegular: string;
  gridFibonacci: string;
  gridLogarithmic: string;
  gridMultiplicator: string;
  gridMartingale: string;

  // Indicators
  indicatorSMA: string;
  indicatorEMA: string;
  indicatorRSI: string;
  indicatorMACD: string;
  indicatorBollingerBands: string;

  // Actions
  createBot: string;
  editBot: string;
  deleteBot: string;
  startBot: string;
  pauseBot: string;
  stopBot: string;
  runBacktest: string;

  // Performance
  totalPnL: string;
  winRate: string;
  totalTrades: string;
  maxDrawdown: string;
}