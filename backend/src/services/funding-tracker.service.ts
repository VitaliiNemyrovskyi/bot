/**
 * Funding Tracker Service
 *
 * Tracks funding payments and trading fees for active arbitrage positions.
 * Fetches data from exchange APIs and updates database records with actual P&L.
 *
 * Features:
 * - Fetches funding payment history from Bybit, BingX, and other supported exchanges
 * - Calculates cumulative funding earned/paid for each position
 * - Tracks trading fees from position entries
 * - Updates net profit = gross funding - fees
 * - Runs periodically for all active positions
 *
 * Exchange-specific implementations:
 * - Bybit: Uses /v5/position/closed-pnl endpoint for funding history
 * - BingX: Uses /openApi/swap/v2/user/income endpoint for income history
 */

import { PrismaClient } from '@prisma/client';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';

interface FundingUpdate {
  positionId: string;
  primaryFunding: {
    lastPaid: number;
    totalEarned: number;
    fees: number;
    currentPrice: number;
  };
  hedgeFunding: {
    lastPaid: number;
    totalEarned: number;
    fees: number;
    currentPrice: number;
  };
  grossProfit: number;
  netProfit: number;
}

export class FundingTrackerService {
  private prisma: PrismaClient;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_FREQUENCY_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Start periodic funding tracking for all active positions
   */
  startTracking(): void {
    console.log('[FundingTracker] Starting periodic funding tracking...');

    // Run immediately
    this.updateAllPositions();

    // Then run every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateAllPositions();
    }, this.UPDATE_FREQUENCY_MS);
  }

  /**
   * Stop periodic tracking
   */
  stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[FundingTracker] Stopped periodic funding tracking');
    }
  }

  /**
   * Update funding data for all active positions
   */
  async updateAllPositions(): Promise<void> {
    try {
      console.log('[FundingTracker] Updating funding data for all active positions...');

      // Get all active positions (ACTIVE status)
      const positions = await this.prisma.graduatedEntryPosition.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      console.log(`[FundingTracker] Found ${positions.length} active positions to update`);

      // Update each position
      for (const position of positions) {
        try {
          await this.updatePosition(position.positionId);
        } catch (error: any) {
          console.error(`[FundingTracker] Error updating position ${position.positionId}:`, error.message);
          // Continue with other positions
        }
      }

      console.log('[FundingTracker] Funding update completed');
    } catch (error: any) {
      console.error('[FundingTracker] Error in updateAllPositions:', error.message);
    }
  }

  /**
   * Update funding data for a specific position
   */
  async updatePosition(positionId: string): Promise<FundingUpdate | null> {
    try {
      // Get position from database
      const position = await this.prisma.graduatedEntryPosition.findUnique({
        where: { positionId },
      });

      if (!position) {
        console.warn(`[FundingTracker] Position ${positionId} not found`);
        return null;
      }

      console.log(`[FundingTracker] Updating position ${positionId} (${position.symbol})`);

      // Fetch funding data from both exchanges
      const [primaryData, hedgeData] = await Promise.all([
        this.fetchExchangeFunding(
          position.userId,
          position.primaryExchange,
          position.primaryCredentialId,
          position.symbol,
          position.primarySide,
          position.startedAt
        ),
        this.fetchExchangeFunding(
          position.userId,
          position.hedgeExchange,
          position.hedgeCredentialId,
          position.symbol,
          position.hedgeSide,
          position.startedAt
        ),
      ]);

      if (!primaryData && !hedgeData) {
        console.warn(`[FundingTracker] No funding data available for position ${positionId}`);
        return null;
      }

      // Calculate totals
      const grossProfit = (primaryData?.totalFunding || 0) + (hedgeData?.totalFunding || 0);
      const totalFees = (primaryData?.fees || 0) + (hedgeData?.fees || 0);
      const netProfit = grossProfit - totalFees;

      // IMPORTANT: Trust real fees from exchange API over calculated fees
      // Graduated entry calculates fees based on fee rates (which may be default 0.055% if not synced)
      // Exchange API provides ACTUAL fees paid, which is the source of truth
      // We use exchange fees if available, otherwise keep existing calculated fees
      const primaryFeesUpdate = primaryData?.fees !== undefined
        ? primaryData.fees  // Use real fees from exchange API
        : (position.primaryTradingFees || 0);  // Keep existing fees if API data unavailable

      const hedgeFeesUpdate = hedgeData?.fees !== undefined
        ? hedgeData.fees  // Use real fees from exchange API
        : (position.hedgeTradingFees || 0);  // Keep existing fees if API data unavailable

      const totalFeesUpdate = primaryFeesUpdate + hedgeFeesUpdate;
      const netProfitUpdate = grossProfit - totalFeesUpdate;

      console.log(`[FundingTracker] Fees update for ${positionId}:`, {
        existingPrimary: position.primaryTradingFees,
        fetchedPrimary: primaryData?.fees,
        updatedPrimary: primaryFeesUpdate,
        existingHedge: position.hedgeTradingFees,
        fetchedHedge: hedgeData?.fees,
        updatedHedge: hedgeFeesUpdate,
      });

      // Update database
      await this.prisma.graduatedEntryPosition.update({
        where: { positionId },
        data: {
          primaryLastFundingPaid: primaryData?.lastFunding || 0,
          primaryTotalFundingEarned: primaryData?.totalFunding || 0,
          primaryTradingFees: primaryFeesUpdate,
          primaryCurrentPrice: primaryData?.currentPrice || position.primaryCurrentPrice,

          hedgeLastFundingPaid: hedgeData?.lastFunding || 0,
          hedgeTotalFundingEarned: hedgeData?.totalFunding || 0,
          hedgeTradingFees: hedgeFeesUpdate,
          hedgeCurrentPrice: hedgeData?.currentPrice || position.hedgeCurrentPrice,

          grossProfit,
          netProfit: netProfitUpdate,

          lastFundingUpdate: new Date(),
          fundingUpdateCount: position.fundingUpdateCount + 1,
        },
      });

      console.log(`[FundingTracker] Updated position ${positionId}:`, {
        primaryFunding: primaryData?.totalFunding || 0,
        hedgeFunding: hedgeData?.totalFunding || 0,
        totalFees: totalFeesUpdate,
        netProfit: netProfitUpdate,
      });

      return {
        positionId,
        primaryFunding: {
          lastPaid: primaryData?.lastFunding || 0,
          totalEarned: primaryData?.totalFunding || 0,
          fees: primaryFeesUpdate,
          currentPrice: primaryData?.currentPrice || 0,
        },
        hedgeFunding: {
          lastPaid: hedgeData?.lastFunding || 0,
          totalEarned: hedgeData?.totalFunding || 0,
          fees: hedgeFeesUpdate,
          currentPrice: hedgeData?.currentPrice || 0,
        },
        grossProfit,
        netProfit: netProfitUpdate,
      };
    } catch (error: any) {
      console.error(`[FundingTracker] Error updating position ${positionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch funding and fee data from a specific exchange
   */
  private async fetchExchangeFunding(
    userId: string,
    exchange: string,
    credentialId: string,
    symbol: string,
    side: string,
    startTime: Date
  ): Promise<{ lastFunding: number; totalFunding: number; fees: number; currentPrice: number } | null> {
    try {
      // Get credentials
      const credentials = await ExchangeCredentialsService.getCredentialsById(credentialId);
      if (!credentials) {
        console.warn(`[FundingTracker] Credentials ${credentialId} not found`);
        return null;
      }

      const exchangeUpper = exchange.toUpperCase();

      switch (exchangeUpper) {
        case 'BYBIT':
          return await this.fetchBybitFunding(credentials, symbol, side, startTime);
        case 'BINGX':
          return await this.fetchBingXFunding(credentials, symbol, side, startTime);
        default:
          console.warn(`[FundingTracker] Unsupported exchange: ${exchange}`);
          return null;
      }
    } catch (error: any) {
      console.error(`[FundingTracker] Error fetching funding for ${exchange}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch funding data from Bybit
   *
   * IMPORTANT: For ACTIVE/OPEN positions, we use:
   * 1. Transaction log (type='SETTLEMENT') for funding fee payments
   * 2. Execution list for trading fees
   *
   * The closed-pnl endpoint only works for CLOSED positions.
   */
  private async fetchBybitFunding(
    credentials: any,
    symbol: string,
    side: string,
    startTime: Date
  ): Promise<{ lastFunding: number; totalFunding: number; fees: number; currentPrice: number } | null> {
    try {
      const bybit = new BybitService({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        testnet: credentials.environment === 'TESTNET',
      });

      console.log(`[FundingTracker] Fetching Bybit data for ${symbol}, side=${side}, since ${startTime.toISOString()}`);

      // STEP 1: Get funding fee settlements using transaction log
      // This works for ACTIVE/OPEN positions (unlike closed-pnl)
      const transactionLog = await bybit.getTransactionLog({
        accountType: 'UNIFIED',
        category: 'linear',
        currency: 'USDT',
        type: 'SETTLEMENT', // Funding fee settlements
        startTime: startTime.getTime(),
        limit: 50,
      });

      console.log(`[FundingTracker] Bybit transaction log (SETTLEMENT) response:`, {
        recordCount: transactionLog?.length || 0,
        symbol,
      });

      // Calculate funding totals from SETTLEMENT transactions
      let totalFunding = 0;
      let lastFunding = 0;
      let fundingCount = 0;

      if (transactionLog && transactionLog.length > 0) {
        // Filter by symbol and sum funding payments
        for (const tx of transactionLog) {
          // Check if transaction is for our symbol
          if (tx.symbol === symbol) {
            // Funding fee is in the 'cashFlow' field
            // Positive = received, negative = paid
            const funding = parseFloat(tx.cashFlow || '0');
            totalFunding += funding;
            fundingCount++;

            console.log(`[FundingTracker] Bybit funding settlement:`, {
              symbol: tx.symbol,
              cashFlow: tx.cashFlow,
              transactionTime: new Date(parseInt(tx.transactionTime)).toISOString(),
              type: tx.type,
            });

            // Track last funding payment (by absolute value)
            if (Math.abs(funding) > Math.abs(lastFunding)) {
              lastFunding = funding;
            }
          }
        }
      }

      console.log(`[FundingTracker] Bybit ${symbol} funding summary:`, {
        fundingCount,
        totalFunding,
        lastFunding,
      });

      // STEP 2: Get trading fees from execution history
      // NOTE: Large execution fees at funding times (00:00, 08:00, 16:00) are actually funding payments
      const executions = await bybit.getExecutionList({
        category: 'linear',
        symbol,
        startTime: startTime.getTime(),
        limit: 50,
      });

      console.log(`[FundingTracker] Bybit execution list response:`, {
        recordCount: executions?.list?.length || 0,
        symbol,
      });

      let totalFees = 0;
      // Lower threshold for small positions - funding can be as low as $0.01
      const FUNDING_FEE_THRESHOLD = 0.01; // Fees larger than this are likely funding payments

      if (executions?.list && executions.list.length > 0) {
        for (const exec of executions.list) {
          const feeValue = parseFloat(exec.execFee || '0');
          const feeAbs = Math.abs(feeValue);
          const execTime = new Date(parseInt(exec.execTime));
          const execHour = execTime.getUTCHours();
          const execMinute = execTime.getUTCMinutes();

          // Check if this is a funding payment:
          // 1. Large fee (> threshold)
          // 2. Executed at funding time (00:00, 08:00, 16:00 UTC)
          const isFundingTime = (execHour === 0 || execHour === 8 || execHour === 16) && execMinute === 0;
          const isLargeFee = feeAbs > FUNDING_FEE_THRESHOLD;

          // Log ALL executions to debug funding detection
          console.log(`[FundingTracker] Bybit execution for ${symbol}:`, {
            execFee: exec.execFee,
            feeAbs,
            execTime: execTime.toISOString(),
            execHour,
            execMinute,
            isFundingTime,
            isLargeFee,
            willCountAsFunding: isLargeFee && isFundingTime,
            side: exec.side,
            execQty: exec.execQty,
          });

          if (isLargeFee && isFundingTime) {
            // This is a funding payment
            // IMPORTANT: Negative execFee = Positive funding income (received)
            //            Positive execFee = Negative funding payment (paid)
            // So we need to INVERT the sign
            const fundingAmount = -feeValue;

            console.log(`[FundingTracker] Bybit FUNDING PAYMENT detected:`, {
              symbol: exec.symbol,
              execFee: exec.execFee,
              execTime: execTime.toISOString(),
              side: exec.side,
              fundingAmount: fundingAmount,
              note: feeValue < 0 ? 'RECEIVED (negative fee)' : 'PAID (positive fee)',
            });

            totalFunding += fundingAmount;
            fundingCount++;

            if (Math.abs(fundingAmount) > Math.abs(lastFunding)) {
              lastFunding = fundingAmount;
            }
          } else {
            // Regular trading fee
            totalFees += feeAbs;

            console.log(`[FundingTracker] Bybit execution fee:`, {
              symbol: exec.symbol,
              execFee: exec.execFee,
              execTime: execTime.toISOString(),
              side: exec.side,
              execQty: exec.execQty,
            });
          }
        }
      }

      // STEP 3: Get current mark price
      const tickers = await bybit.getTicker('linear', symbol);
      const currentPrice = tickers?.[0]?.markPrice
        ? parseFloat(tickers[0].markPrice)
        : 0;

      console.log(`[FundingTracker] Bybit ${symbol} final summary:`, {
        fundingPayments: fundingCount,
        totalFunding,
        lastFunding,
        totalFees,
        currentPrice,
      });

      return {
        lastFunding,
        totalFunding,
        fees: totalFees,
        currentPrice,
      };
    } catch (error: any) {
      console.error('[FundingTracker] Bybit funding fetch error:', {
        symbol,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Fetch funding data from BingX
   *
   * BingX API endpoints:
   * - /openApi/swap/v2/user/income - Get income history (funding fees, commissions)
   *
   * Symbol format: BingX uses different formats like "BTC-USDT" or "FUSDT"
   * Need to handle both formats.
   */
  private async fetchBingXFunding(
    credentials: any,
    symbol: string,
    side: string,
    startTime: Date
  ): Promise<{ lastFunding: number; totalFunding: number; fees: number; currentPrice: number } | null> {
    try {
      const bingx = new BingXService({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        enableRateLimit: true,
        userId: credentials.userId,
        credentialId: credentials.id,
      });

      // Sync time first
      await bingx.syncTime();

      console.log(`[FundingTracker] Fetching BingX data for ${symbol}, side=${side}, since ${startTime.toISOString()}`);

      // BingX symbol format handling:
      // The database might store "FUSDT" but BingX API might need "F-USDT" or vice versa
      // Try both formats if needed
      const symbolVariants = [
        symbol, // Original format (e.g., "FUSDT")
        symbol.replace('-', ''), // Remove hyphen (e.g., "F-USDT" -> "FUSDT")
        symbol.includes('-') ? symbol : `${symbol.slice(0, -4)}-${symbol.slice(-4)}`, // Add hyphen before last 4 chars (e.g., "FUSDT" -> "F-USDT")
      ];

      // Remove duplicates
      const uniqueSymbols = [...new Set(symbolVariants)];

      console.log(`[FundingTracker] BingX symbol variants to try:`, uniqueSymbols);

      // Try fetching with each symbol variant
      let incomeHistory: any = null;
      let usedSymbol = symbol;

      // BingX API has issues with startTime parameter - it returns 0 records even when data exists
      // Fetch without startTime and filter results manually
      for (const symbolVariant of uniqueSymbols) {
        try {
          console.log(`[FundingTracker] Trying BingX symbol: ${symbolVariant}`);

          // STEP 1: Get funding fee history WITHOUT startTime filter
          // BingX API returns empty results when startTime is used
          incomeHistory = await bingx.getIncomeHistory({
            symbol: symbolVariant,
            incomeType: 'FUNDING_FEE',
            // DO NOT use startTime - BingX API has issues with it
            limit: 100,
          });

          console.log(`[FundingTracker] BingX income history (FUNDING_FEE) response for ${symbolVariant}:`, {
            code: incomeHistory.code,
            msg: incomeHistory.msg,
            recordCount: incomeHistory.data?.length || 0,
          });

          // If successful AND has data, use this symbol
          if (incomeHistory.code === 0 && incomeHistory.data && incomeHistory.data.length > 0) {
            usedSymbol = symbolVariant;
            console.log(`[FundingTracker] Successfully fetched data with symbol: ${symbolVariant} (${incomeHistory.data.length} records)`);
            break;
          } else if (incomeHistory.code === 0 && (!incomeHistory.data || incomeHistory.data.length === 0)) {
            console.log(`[FundingTracker] Symbol ${symbolVariant} returned success but 0 records, trying next variant...`);
            // Continue to next variant
          }
        } catch (error: any) {
          console.log(`[FundingTracker] Symbol ${symbolVariant} failed:`, error.message);
          // Continue to next variant
        }
      }

      if (!incomeHistory || incomeHistory.code !== 0) {
        console.warn(`[FundingTracker] No BingX income data for any symbol variant of ${symbol}`);
        return { lastFunding: 0, totalFunding: 0, fees: 0, currentPrice: 0 };
      }

      // Calculate funding totals
      let totalFunding = 0;
      let lastFunding = 0;
      let fundingCount = 0;

      if (incomeHistory.data && incomeHistory.data.length > 0) {
        for (const income of incomeHistory.data) {
          // Only count funding payments AFTER position start time
          const fundingTime = new Date(income.time);
          if (fundingTime < startTime) {
            continue; // Skip funding before position start
          }

          const funding = parseFloat(income.income || '0');
          totalFunding += funding;
          fundingCount++;

          console.log(`[FundingTracker] BingX funding payment:`, {
            symbol: income.symbol,
            income: income.income,
            time: fundingTime.toISOString(),
            incomeType: income.incomeType,
          });

          // Track last funding payment (by absolute value)
          if (Math.abs(funding) > Math.abs(lastFunding)) {
            lastFunding = funding;
          }
        }
      }

      console.log(`[FundingTracker] BingX ${usedSymbol} funding summary:`, {
        fundingCount,
        totalFunding,
        lastFunding,
      });

      // STEP 2: Get trading fees
      // Same as funding fees - BingX API doesn't work with startTime parameter
      const feesHistory = await bingx.getIncomeHistory({
        symbol: usedSymbol,
        incomeType: 'TRADING_FEE',
        // DO NOT use startTime - BingX API has issues with it
        limit: 100,
      });

      console.log(`[FundingTracker] BingX trading fee history response:`, {
        code: feesHistory.code,
        msg: feesHistory.msg,
        recordCount: feesHistory.data?.length || 0,
      });

      let totalFees = 0;

      if (feesHistory?.data && feesHistory.data.length > 0) {
        for (const fee of feesHistory.data) {
          // Only count fees AFTER position start time
          const feeTime = new Date(fee.time);
          if (feeTime < startTime) {
            console.log(`[FundingTracker] BingX trading fee SKIPPED (before position start):`, {
              symbol: fee.symbol,
              income: fee.income,
              time: feeTime.toISOString(),
              positionStart: startTime.toISOString(),
            });
            continue; // Skip fees before position start
          }

          // Trading fee is negative, so take absolute value
          const feeAmount = Math.abs(parseFloat(fee.income || '0'));
          totalFees += feeAmount;

          console.log(`[FundingTracker] BingX trading fee:`, {
            symbol: fee.symbol,
            income: fee.income,
            time: feeTime.toISOString(),
          });
        }
      }

      // STEP 3: Get current mark price
      const ticker = await bingx.getTickerPrice(usedSymbol);
      const currentPrice = ticker?.price ? parseFloat(ticker.price) : 0;

      console.log(`[FundingTracker] BingX ${usedSymbol} final summary:`, {
        fundingPayments: fundingCount,
        totalFunding,
        lastFunding,
        totalFees,
        currentPrice,
      });

      return {
        lastFunding,
        totalFunding,
        fees: totalFees,
        currentPrice,
      };
    } catch (error: any) {
      console.error('[FundingTracker] BingX funding fetch error:', {
        symbol,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Cleanup - disconnect from database
   */
  async cleanup(): Promise<void> {
    this.stopTracking();
    await this.prisma.$disconnect();
  }
}

// Singleton instance
export const fundingTrackerService = new FundingTrackerService();
