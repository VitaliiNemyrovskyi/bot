/**
 * Public Funding Rate Models
 * For displaying funding rate data fetched directly from exchange public APIs
 */

export interface ExchangeFundingRate {
  exchange: string;           // 'BYBIT', 'BINGX', 'MEXC'
  symbol: string;             // Normalized symbol (BTCUSDT)
  originalSymbol: string;     // Original exchange symbol (BTC-USDT, BTC/USDT:USDT)
  fundingRate: string;        // Current funding rate as string (e.g., "0.0001")
  nextFundingTime: number;    // Next funding time timestamp (ms)
  lastPrice: string;          // Current mark/last price
  fundingInterval?: string;   // Funding interval (8h, 4h, 1h)

  // Additional data for advanced metrics
  volume24h?: string;         // 24h trading volume
  openInterest?: string;      // Open interest (outstanding contracts)
  high24h?: string;           // 24h high price
  low24h?: string;            // 24h low price
}

export interface FundingRateOpportunity {
  symbol: string;                        // Normalized symbol (BTCUSDT)
  exchanges: ExchangeFundingRate[];      // All exchanges for this symbol

  // Funding spread (difference between best long and best short funding rates)
  maxFundingSpread: number;              // Max spread as decimal (e.g., 0.0015 = 0.15%)
  maxFundingSpreadPercent: string;       // Max spread as percentage string (e.g., "0.15%")

  // Best exchanges for arbitrage
  bestLong: ExchangeFundingRate;         // Lowest (most negative) funding rate - open LONG here
  bestShort: ExchangeFundingRate;        // Highest (most positive) funding rate - open SHORT here

  // Price spread (difference between exchange prices)
  priceSpread: number;                   // Price spread as decimal (e.g., 0.0004 = 0.04%)
  priceSpreadPercent: string;            // Price spread as percentage string (e.g., "0.04%")
  priceSpreadUsdt: string;               // Absolute price difference in USDT (e.g., "25.50")

  // Metadata
  fundingPeriodicity?: string;           // Human-readable funding period (e.g., "2г 35хв/8h")
  nextFundingTime: number;               // Earliest next funding time across all exchanges

  // Phase 1 Advanced Metrics (calculated immediately with existing data)
  timeToFunding: string;                 // Time until next funding (e.g., "2h 15m")
  estimatedAPR: number;                  // Gross Annual Percentage Rate (before fees)
  estimatedAPRFormatted: string;         // Formatted APR (e.g., "164.25%")
  totalFees: number;                     // Total trading fees for 4 trades (2 opens + 2 closes)
  totalFeesFormatted: string;            // Formatted fees (e.g., "0.22%")
  netAPR: number;                        // Net APR after fees deduction
  netAPRFormatted: string;               // Formatted net APR (e.g., "150.03%")
  volume24h?: number;                    // Combined 24h volume across exchanges (optional)
  volume24hFormatted?: string;           // Formatted volume (e.g., "$1.2M")
  openInterest?: number;                 // Combined open interest (optional)
  openInterestFormatted?: string;        // Formatted OI (e.g., "$45.3M")
  volatility24h?: number;                // Simple 24h volatility as decimal
  volatility24hFormatted?: string;       // Formatted volatility (e.g., "3.45%")

  // Phase 2 Historical Spread Stability Metrics (requires backend API calls)
  // Loaded lazily on-demand when user expands row for performance
  spreadHistory7d?: SpreadStabilityMetrics;   // 7-day historical stability analysis
  spreadHistory30d?: SpreadStabilityMetrics;  // 30-day historical stability analysis

  // Comparison metrics (comparing 7d vs 30d)
  spreadStabilityTrend?: 'improving' | 'stable' | 'declining'; // Trend direction
  spreadStabilityConfidence?: number;    // Confidence score 0-1 based on data quality
}

/**
 * Spread Stability Metrics
 *
 * Statistical analysis of historical spread stability over a time period.
 * Used to assess how reliably an arbitrage opportunity maintains its spread.
 */
export interface SpreadStabilityMetrics {
  // Core statistics
  average: number;                       // Average spread over period (decimal, e.g., 0.0015)
  averageFormatted: string;              // Formatted average (e.g., "0.15%")
  standardDeviation: number;             // Standard deviation of spread (decimal)
  standardDeviationFormatted: string;    // Formatted std dev (e.g., "0.03%")

  // Derived stability score
  stabilityScore: number;                // 0-100 score (100 = most stable, 0 = highly volatile)
  stabilityRating: 'excellent' | 'good' | 'moderate' | 'poor'; // Qualitative rating

  // Data quality indicators
  sampleSize: number;                    // Number of data points analyzed
  dataQuality: 'high' | 'medium' | 'low'; // Quality based on sample size completeness

  // Time period metadata
  periodDays: 7 | 30;                    // Period length in days
  startTimestamp?: number;               // Start of analysis period (ms)
  endTimestamp?: number;                 // End of analysis period (ms)

  // Historical data for charting
  historicalData?: Array<{               // Array of spread data points with timestamps
    timestamp: number;                   // Timestamp in milliseconds
    spread: number;                      // Spread value as decimal (e.g., 0.0015)
  }>;
}

export interface FundingRatesLoadState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  opportunities: FundingRateOpportunity[];
}
