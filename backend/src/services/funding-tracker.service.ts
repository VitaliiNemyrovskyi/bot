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

      // Update database
      await this.prisma.graduatedEntryPosition.update({
        where: { positionId },
        data: {
          primaryLastFundingPaid: primaryData?.lastFunding || 0,
          primaryTotalFundingEarned: primaryData?.totalFunding || 0,
          primaryTradingFees: primaryData?.fees || 0,
          primaryCurrentPrice: primaryData?.currentPrice || position.primaryCurrentPrice,

          hedgeLastFundingPaid: hedgeData?.lastFunding || 0,
          hedgeTotalFundingEarned: hedgeData?.totalFunding || 0,
          hedgeTradingFees: hedgeData?.fees || 0,
          hedgeCurrentPrice: hedgeData?.currentPrice || position.hedgeCurrentPrice,

          grossProfit,
          netProfit,

          lastFundingUpdate: new Date(),
          fundingUpdateCount: position.fundingUpdateCount + 1,
        },
      });

      console.log(`[FundingTracker] Updated position ${positionId}:`, {
        primaryFunding: primaryData?.totalFunding || 0,
        hedgeFunding: hedgeData?.totalFunding || 0,
        totalFees,
        netProfit,
      });

      return {
        positionId,
        primaryFunding: {
          lastPaid: primaryData?.lastFunding || 0,
          totalEarned: primaryData?.totalFunding || 0,
          fees: primaryData?.fees || 0,
          currentPrice: primaryData?.currentPrice || 0,
        },
        hedgeFunding: {
          lastPaid: hedgeData?.lastFunding || 0,
          totalEarned: hedgeData?.totalFunding || 0,
          fees: hedgeData?.fees || 0,
          currentPrice: hedgeData?.currentPrice || 0,
        },
        grossProfit,
        netProfit,
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

      // Get closed P&L data (includes funding payments)
      // Bybit API: /v5/position/closed-pnl
      const closedPnl = await bybit.getClosedPnL({
        category: 'linear',
        symbol,
        startTime: startTime.getTime(),
        limit: 100,
      });

      if (!closedPnl || !closedPnl.list || closedPnl.list.length === 0) {
        console.log(`[FundingTracker] No Bybit P&L data for ${symbol}`);
        return { lastFunding: 0, totalFunding: 0, fees: 0, currentPrice: 0 };
      }

      // Calculate funding totals
      let totalFunding = 0;
      let lastFunding = 0;
      let totalFees = 0;

      for (const pnl of closedPnl.list) {
        // closedPnl is funding payment (positive = received, negative = paid)
        const funding = parseFloat(pnl.closedPnl || '0');
        totalFunding += funding;

        // Track last funding payment
        if (Math.abs(funding) > Math.abs(lastFunding)) {
          lastFunding = funding;
        }

        // Sum up fees
        const fee = Math.abs(parseFloat(pnl.cumExecFee || '0'));
        totalFees += fee;
      }

      // Get current mark price
      const ticker = await bybit.getTickers({
        category: 'linear',
        symbol,
      });

      const currentPrice = ticker?.list?.[0]?.markPrice
        ? parseFloat(ticker.list[0].markPrice)
        : 0;

      console.log(`[FundingTracker] Bybit ${symbol}:`, {
        lastFunding,
        totalFunding,
        totalFees,
        currentPrice,
        recordCount: closedPnl.list.length,
      });

      return {
        lastFunding,
        totalFunding,
        fees: totalFees,
        currentPrice,
      };
    } catch (error: any) {
      console.error('[FundingTracker] Bybit funding fetch error:', error.message);
      return null;
    }
  }

  /**
   * Fetch funding data from BingX
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
      });

      // BingX uses income history endpoint for funding
      // GET /openApi/swap/v2/user/income
      const incomeHistory = await bingx.getIncomeHistory({
        symbol,
        incomeType: 'FUNDING_FEE',
        startTime: startTime.getTime(),
        limit: 100,
      });

      if (!incomeHistory || !incomeHistory.data || incomeHistory.data.length === 0) {
        console.log(`[FundingTracker] No BingX income data for ${symbol}`);
        return { lastFunding: 0, totalFunding: 0, fees: 0, currentPrice: 0 };
      }

      // Calculate funding totals
      let totalFunding = 0;
      let lastFunding = 0;

      for (const income of incomeHistory.data) {
        const funding = parseFloat(income.income || '0');
        totalFunding += funding;

        // Track last funding payment
        if (Math.abs(funding) > Math.abs(lastFunding)) {
          lastFunding = funding;
        }
      }

      // Get trading fees separately
      const feesHistory = await bingx.getIncomeHistory({
        symbol,
        incomeType: 'COMMISSION',
        startTime: startTime.getTime(),
        limit: 100,
      });

      let totalFees = 0;
      if (feesHistory?.data) {
        for (const fee of feesHistory.data) {
          totalFees += Math.abs(parseFloat(fee.income || '0'));
        }
      }

      // Get current mark price
      const ticker = await bingx.getTickerPrice(symbol);
      const currentPrice = ticker?.price ? parseFloat(ticker.price) : 0;

      console.log(`[FundingTracker] BingX ${symbol}:`, {
        lastFunding,
        totalFunding,
        totalFees,
        currentPrice,
        fundingRecords: incomeHistory.data.length,
        feeRecords: feesHistory?.data?.length || 0,
      });

      return {
        lastFunding,
        totalFunding,
        fees: totalFees,
        currentPrice,
      };
    } catch (error: any) {
      console.error('[FundingTracker] BingX funding fetch error:', error.message);
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
