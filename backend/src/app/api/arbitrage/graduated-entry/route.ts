/**
 * GET /api/arbitrage/graduated-entry
 * Get all active graduated entry arbitrage positions for the authenticated user
 *
 * POST /api/arbitrage/graduated-entry
 * Start Graduated Entry Arbitrage Position
 * Opens positions simultaneously on two exchanges with graduated entry (smooth accumulation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';
import { BingXService } from '@/lib/bingx';
import { BybitService } from '@/lib/bybit';
import { MEXCService } from '@/lib/mexc';
import prisma from '@/lib/prisma';

interface SymbolInfo {
  symbol: string;
  exchange: string;
  minOrderQty: number;
  minOrderValue?: number;
  qtyStep: number;
  pricePrecision: number;
  qtyPrecision: number;
  maxOrderQty?: number;
  maxLeverage?: number;
}

/**
 * GET handler - Get all graduated entry positions for user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check query parameter for showing all positions
    const searchParams = request.nextUrl.searchParams;
    const showAll = searchParams.get('showAll') === 'true';

    console.log(`[API] Getting graduated entry positions for user ${user.userId} (showAll: ${showAll})`);

    // Get positions from database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const whereClause: any = {
        userId: user.userId,
      };

      // If not showing all, exclude only COMPLETED positions
      // Show: INITIALIZING, EXECUTING, ACTIVE, ERROR, LIQUIDATED, CANCELLED
      if (!showAll) {
        whereClause.status = {
          not: 'COMPLETED',
        };
      }

      const dbPositions = await prisma.graduatedEntryPosition.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limit to 50 most recent
      });

      console.log(`[API] Found ${dbPositions.length} positions for user ${user.userId}`);

      // Transform database positions to safe response format with real-time profit calculation
      const safePositions = dbPositions.map(position => {
        // Calculate real-time unrealized PnL from current prices
        const primaryEntryPrice = position.primaryEntryPrice || 0;
        const primaryCurrentPrice = position.primaryCurrentPrice || primaryEntryPrice;
        const primaryQuantity = position.primaryFilledQty || 0;

        const hedgeEntryPrice = position.hedgeEntryPrice || 0;
        const hedgeCurrentPrice = position.hedgeCurrentPrice || hedgeEntryPrice;
        const hedgeQuantity = position.hedgeFilledQty || 0;

        // Calculate unrealized PnL for each side
        // Primary side (usually LONG): (currentPrice - entryPrice) * quantity
        const primaryUnrealizedPnl = position.primarySide === 'LONG'
          ? (primaryCurrentPrice - primaryEntryPrice) * primaryQuantity
          : (primaryEntryPrice - primaryCurrentPrice) * primaryQuantity;

        // Hedge side (usually SHORT): (entryPrice - currentPrice) * quantity
        const hedgeUnrealizedPnl = position.hedgeSide === 'SHORT'
          ? (hedgeEntryPrice - hedgeCurrentPrice) * hedgeQuantity
          : (hedgeCurrentPrice - hedgeEntryPrice) * hedgeQuantity;

        // Total unrealized PnL
        const totalUnrealizedPnl = primaryUnrealizedPnl + hedgeUnrealizedPnl;

        // Calculate entry spread profit (from opening positions at different prices)
        const primaryNotional = primaryEntryPrice * primaryQuantity;
        const hedgeNotional = hedgeEntryPrice * hedgeQuantity;
        const entrySpreadProfit = position.primarySide === 'LONG'
          ? hedgeNotional - primaryNotional  // Bought low (primary), sold high (hedge)
          : primaryNotional - hedgeNotional;  // Sold high (primary), bought low (hedge)

        // Only show funding values if at least one actual funding payment occurred
        // fundingUpdateCount === 0 means no real payments yet (only projected/estimated values)
        const hasFundingPayments = (position.fundingUpdateCount || 0) > 0;
        const actualPrimaryFundingPaid = hasFundingPayments ? (position.primaryLastFundingPaid || 0) : 0;
        const actualPrimaryFundingEarned = hasFundingPayments ? (position.primaryTotalFundingEarned || 0) : 0;
        const actualHedgeFundingPaid = hasFundingPayments ? (position.hedgeLastFundingPaid || 0) : 0;
        const actualHedgeFundingEarned = hasFundingPayments ? (position.hedgeTotalFundingEarned || 0) : 0;

        // Total actual funding (0 if no payments occurred yet)
        const totalActualFunding = actualPrimaryFundingEarned + actualHedgeFundingEarned;

        // Total fees
        const totalFees = (position.primaryTradingFees || 0) + (position.hedgeTradingFees || 0);

        // Real-time Gross Profit = Entry Spread + Actual Funding + Unrealized PnL
        const realtimeGrossProfit = entrySpreadProfit + totalActualFunding + totalUnrealizedPnl;

        // Real-time Net Profit = Gross Profit - Fees
        const realtimeNetProfit = realtimeGrossProfit - totalFees;

        // Log entry prices and funding for debugging
        if (position.positionId === 'arb_1_1762851015457') {
          console.log(`[API GET] Position ${position.positionId} RAW DB DATA:`, {
            primaryEntryPrice: position.primaryEntryPrice,
            hedgeEntryPrice: position.hedgeEntryPrice,
            primaryCurrentPrice: position.primaryCurrentPrice,
            hedgeCurrentPrice: position.hedgeCurrentPrice,
            primaryLastFundingPaid: position.primaryLastFundingPaid,
            primaryTotalFundingEarned: position.primaryTotalFundingEarned,
            hedgeLastFundingPaid: position.hedgeLastFundingPaid,
            hedgeTotalFundingEarned: position.hedgeTotalFundingEarned,
            fundingUpdateCount: position.fundingUpdateCount,
          });
          console.log(`[API GET] Position ${position.positionId} AFTER PROCESSING:`, {
            hasFundingPayments,
            actualPrimaryFundingPaid,
            actualPrimaryFundingEarned,
            actualHedgeFundingPaid,
            actualHedgeFundingEarned,
            totalActualFunding,
          });
        }

        return {
          positionId: position.positionId,
          symbol: position.symbol,
          primary: {
            exchange: position.primaryExchange,
            side: position.primarySide,
            leverage: position.primaryLeverage,
            quantity: position.primaryQuantity,
            filledQuantity: position.primaryFilledQty,
            orderIds: position.primaryOrderIds,
            status: position.primaryStatus,
            errorMessage: position.primaryErrorMessage,
            // Real funding and profit data from database
            // Only show actual funding if at least one payment occurred
            lastFundingPaid: actualPrimaryFundingPaid,
            totalFundingEarned: actualPrimaryFundingEarned,
            tradingFees: position.primaryTradingFees || 0,
            entryPrice: position.primaryEntryPrice,
            currentPrice: position.primaryCurrentPrice,
            unrealizedPnl: primaryUnrealizedPnl,
            // Liquidation data
            liquidationPrice: position.primaryLiquidationPrice,
            proximityRatio: position.primaryProximityRatio,
            inDanger: position.primaryInDanger,
            // Stop Loss and Take Profit
            stopLoss: position.primaryStopLoss,
            takeProfit: position.primaryTakeProfit,
          },
          hedge: {
            exchange: position.hedgeExchange,
            side: position.hedgeSide,
            leverage: position.hedgeLeverage,
            quantity: position.hedgeQuantity,
            filledQuantity: position.hedgeFilledQty,
            orderIds: position.hedgeOrderIds,
            status: position.hedgeStatus,
            errorMessage: position.hedgeErrorMessage,
            // Real funding and profit data from database
            // Only show actual funding if at least one payment occurred
            lastFundingPaid: actualHedgeFundingPaid,
            totalFundingEarned: actualHedgeFundingEarned,
            tradingFees: position.hedgeTradingFees || 0,
            entryPrice: position.hedgeEntryPrice,
            currentPrice: position.hedgeCurrentPrice,
            unrealizedPnl: hedgeUnrealizedPnl,
            // Liquidation data
            liquidationPrice: position.hedgeLiquidationPrice,
            proximityRatio: position.hedgeProximityRatio,
            inDanger: position.hedgeInDanger,
            // Stop Loss and Take Profit
            stopLoss: position.hedgeStopLoss,
            takeProfit: position.hedgeTakeProfit,
          },
          graduatedEntry: {
            parts: position.graduatedParts,
            delayMs: position.graduatedDelayMs,
            currentPart: position.currentPart,
          },
          status: position.status.toLowerCase(),
          startedAt: position.startedAt,
          completedAt: position.completedAt,
          // Real-time profit metrics (calculated from current prices)
          entrySpreadProfit,
          totalUnrealizedPnl,
          grossProfit: realtimeGrossProfit,
          netProfit: realtimeNetProfit,
          lastFundingUpdate: position.lastFundingUpdate,
          fundingUpdateCount: position.fundingUpdateCount || 0,
          // Liquidation monitoring status
          monitoring: {
            enabled: position.isMonitoringEnabled,
            status: position.monitoringStatus,
            lastCheck: position.lastMonitoringCheck,
          },
        };
      });

      return NextResponse.json({
        success: true,
        data: safePositions,
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error('[API] Error getting graduated entry positions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get graduated entry positions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Start new graduated entry position
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      symbol,
      primaryExchange,
      primarySide,  // 'long' or 'short'
      primaryLeverage = 10,
      primaryQuantity,
      hedgeExchange,
      hedgeSide,  // 'long' or 'short'
      hedgeLeverage = 10,
      hedgeQuantity,
      graduatedEntryParts = 5, // Number of parts to split the order
      graduatedEntryDelayMs = 2000, // Delay between parts in milliseconds
    } = body;

    // Validate required fields
    if (!symbol || !primaryExchange || !hedgeExchange) {
      return NextResponse.json(
        { success: false, error: 'Symbol, primaryExchange, and hedgeExchange are required' },
        { status: 400 }
      );
    }

    if (!primaryQuantity || !hedgeQuantity) {
      return NextResponse.json(
        { success: false, error: 'Quantity is required for both exchanges' },
        { status: 400 }
      );
    }

    // Validate sides
    if (!['long', 'short'].includes(primarySide?.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Primary side must be "long" or "short"' },
        { status: 400 }
      );
    }

    if (!['long', 'short'].includes(hedgeSide?.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Hedge side must be "long" or "short"' },
        { status: 400 }
      );
    }

    // Validate leverage
    if (primaryLeverage < 1 || primaryLeverage > 125) {
      return NextResponse.json(
        { success: false, error: 'Primary leverage must be between 1 and 125' },
        { status: 400 }
      );
    }

    if (hedgeLeverage < 1 || hedgeLeverage > 125) {
      return NextResponse.json(
        { success: false, error: 'Hedge leverage must be between 1 and 125' },
        { status: 400 }
      );
    }

    // Validate graduated entry parameters
    if (graduatedEntryParts < 1 || graduatedEntryParts > 20) {
      return NextResponse.json(
        { success: false, error: 'Graduated entry parts must be between 1 and 20' },
        { status: 400 }
      );
    }

    if (graduatedEntryDelayMs < 100 || graduatedEntryDelayMs > 60000) {
      return NextResponse.json(
        { success: false, error: 'Graduated entry delay must be between 100ms and 60000ms' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting Graduated Entry Arbitrage for user ${user.userId}:`, {
      symbol,
      primary: { exchange: primaryExchange, side: primarySide, leverage: primaryLeverage, quantity: primaryQuantity },
      hedge: { exchange: hedgeExchange, side: hedgeSide, leverage: hedgeLeverage, quantity: hedgeQuantity },
      graduatedEntryParts,
      graduatedEntryDelayMs,
    });

    // Get credentials for primary exchange
    const primaryCredentials = await ExchangeCredentialsService.getActiveCredentials(
      user.userId,
      primaryExchange.toUpperCase()
    );

    if (!primaryCredentials) {
      return NextResponse.json(
        {
          success: false,
          error: `No ${primaryExchange} credentials found. Please add API keys in Profile -> Trading Platforms.`,
        },
        { status: 400 }
      );
    }

    // Get credentials for hedge exchange
    const hedgeCredentials = await ExchangeCredentialsService.getActiveCredentials(
      user.userId,
      hedgeExchange.toUpperCase()
    );

    if (!hedgeCredentials) {
      return NextResponse.json(
        {
          success: false,
          error: `No ${hedgeExchange} credentials found. Please add API keys in Profile -> Trading Platforms.`,
        },
        { status: 400 }
      );
    }

    // Validate primary exchange order quantity
    console.log(`[API] Validating primary exchange (${primaryExchange}) order quantity...`);
    const primarySymbolInfo = await getSymbolInfo(primaryExchange, symbol);

    if (!primarySymbolInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Symbol ${symbol} not found on ${primaryExchange}`,
        },
        { status: 400 }
      );
    }

    const primaryValidation = validateOrderQuantity(
      primarySymbolInfo,
      primaryQuantity,
      graduatedEntryParts
    );

    if (!primaryValidation.valid) {
      console.error(`[API] Primary exchange validation failed:`, primaryValidation);
      return NextResponse.json(
        {
          success: false,
          error: `Primary exchange (${primaryExchange}): ${primaryValidation.error}`,
          suggestion: primaryValidation.suggestion,
        },
        { status: 400 }
      );
    }

    // Use adjusted quantity if provided (automatically rounded to meet exchange requirements)
    const adjustedPrimaryQuantity = primaryValidation.adjustedQuantity !== undefined
      ? primaryValidation.adjustedQuantity
      : primaryQuantity;

    if (primaryValidation.adjustedQuantity !== undefined) {
      console.log(`[API] Primary quantity adjusted: ${primaryQuantity} → ${adjustedPrimaryQuantity}`);
    }

    // Validate hedge exchange order quantity
    console.log(`[API] Validating hedge exchange (${hedgeExchange}) order quantity...`);
    const hedgeSymbolInfo = await getSymbolInfo(hedgeExchange, symbol);

    if (!hedgeSymbolInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Symbol ${symbol} not found on ${hedgeExchange}`,
        },
        { status: 400 }
      );
    }

    const hedgeValidation = validateOrderQuantity(
      hedgeSymbolInfo,
      hedgeQuantity,
      graduatedEntryParts
    );

    if (!hedgeValidation.valid) {
      console.error(`[API] Hedge exchange validation failed:`, hedgeValidation);
      return NextResponse.json(
        {
          success: false,
          error: `Hedge exchange (${hedgeExchange}): ${hedgeValidation.error}`,
          suggestion: hedgeValidation.suggestion,
        },
        { status: 400 }
      );
    }

    // Use adjusted quantity if provided (automatically rounded to meet exchange requirements)
    const adjustedHedgeQuantity = hedgeValidation.adjustedQuantity !== undefined
      ? hedgeValidation.adjustedQuantity
      : hedgeQuantity;

    if (hedgeValidation.adjustedQuantity !== undefined) {
      console.log(`[API] Hedge quantity adjusted: ${hedgeQuantity} → ${adjustedHedgeQuantity}`);
    }

    // CRITICAL: Use the SAME quantity for BOTH exchanges (SOLID principle)
    // Take the minimum of both adjusted quantities to ensure compatibility with BOTH exchanges
    const finalQuantity = Math.min(adjustedPrimaryQuantity, adjustedHedgeQuantity);

    // Check if quantity was adjusted - if yes, show error to user instead of silently changing
    if (finalQuantity !== primaryQuantity || finalQuantity !== hedgeQuantity) {
      const primaryChanged = adjustedPrimaryQuantity !== primaryQuantity;
      const hedgeChanged = adjustedHedgeQuantity !== hedgeQuantity;

      let errorMessage = `Quantity cannot be evenly divided into ${graduatedEntryParts} parts for both exchanges.\n`;

      if (primaryChanged) {
        errorMessage += `${primaryExchange}: ${primaryQuantity} → ${adjustedPrimaryQuantity} (adjusted)\n`;
      }
      if (hedgeChanged) {
        errorMessage += `${hedgeExchange}: ${hedgeQuantity} → ${adjustedHedgeQuantity} (adjusted)\n`;
      }

      // Calculate valid suggestions
      const qtyPerPart = finalQuantity / graduatedEntryParts;
      const lowerQty = Math.floor(primaryQuantity / qtyPerPart) * qtyPerPart;
      const upperQty = Math.ceil(primaryQuantity / qtyPerPart) * qtyPerPart;

      errorMessage += `\nValid quantities for ${graduatedEntryParts} parts:`;
      if (lowerQty > 0 && lowerQty !== primaryQuantity) {
        errorMessage += `\n  • ${lowerQty} (${lowerQty / graduatedEntryParts} per part)`;
      }
      if (upperQty !== primaryQuantity) {
        errorMessage += `\n  • ${upperQty} (${upperQty / graduatedEntryParts} per part)`;
      }

      console.error(`[API] Quantity adjustment required:`, errorMessage);

      return NextResponse.json(
        {
          success: false,
          error: errorMessage.trim(),
        },
        { status: 400 }
      );
    }

    console.log(`[API] Order quantity validation passed for both exchanges`);
    console.log(`[API] Final quantities: Primary=${finalQuantity}, Hedge=${finalQuantity}`);

    // Check for delisting on exchanges that support this check
    // Currently only Bybit provides deliveryTime data
    const exchangesToCheck = [];
    if (primaryExchange.toUpperCase() === 'BYBIT') {
      exchangesToCheck.push({ exchange: primaryExchange, role: 'primary' });
    }
    if (hedgeExchange.toUpperCase() === 'BYBIT') {
      exchangesToCheck.push({ exchange: hedgeExchange, role: 'hedge' });
    }

    if (exchangesToCheck.length > 0) {
      console.log(`[API] Checking delisting status for ${symbol} on ${exchangesToCheck.map(e => e.exchange).join(', ')}...`);

      try {
        // Check delisting using Bybit service (no auth required for public data)
        const bybitService = new BybitService({ enableRateLimit: true });
        const delistingInfo = await bybitService.checkDelisting(symbol, 'linear', 7); // 7-day threshold

        if (delistingInfo.isDelisting) {
          const daysRemaining = delistingInfo.daysUntilDelivery?.toFixed(1) || 'unknown';
          const deliveryDate = delistingInfo.deliveryTime > 0
            ? new Date(delistingInfo.deliveryTime).toISOString()
            : 'unknown';

          console.error(`[API] ⚠️ Symbol ${symbol} is being delisted on Bybit:`, {
            daysUntilDelivery: daysRemaining,
            deliveryTime: deliveryDate,
            status: delistingInfo.status,
          });

          const affectedExchanges = exchangesToCheck.map(e => e.exchange).join(' and ');

          return NextResponse.json(
            {
              success: false,
              error: `Symbol ${symbol} is being delisted on ${affectedExchanges}`,
              message: `This symbol will be settled/closed in approximately ${daysRemaining} days (${deliveryDate}). ` +
                       `New positions cannot be opened. Please choose a different symbol.`,
              delistingInfo: {
                symbol: symbol,
                exchange: 'BYBIT',
                daysUntilDelivery: parseFloat(daysRemaining),
                deliveryTime: deliveryDate,
              }
            },
            { status: 400 }
          );
        } else {
          console.log(`[API] ✓ Symbol ${symbol} is not being delisted on Bybit (perpetual contract)`);
        }
      } catch (delistingCheckError: any) {
        // Log error but don't block position creation
        // (delisting check is a safety feature, not critical)
        console.warn(`[API] Warning: Failed to check delisting status for ${symbol}:`, delistingCheckError.message);
      }
    }

    // Start graduated entry arbitrage position
    const testnet = primaryCredentials.environment === 'TESTNET';

    const positionId = await graduatedEntryArbitrageService.startPosition(
      {
        userId: user.userId,
        symbol,
        primaryExchange,
        primarySide: primarySide.toLowerCase() as 'long' | 'short',
        primaryLeverage,
        primaryQuantity: finalQuantity,
        hedgeExchange,
        hedgeSide: hedgeSide.toLowerCase() as 'long' | 'short',
        hedgeLeverage,
        hedgeQuantity: finalQuantity,
        graduatedEntryParts,
        graduatedEntryDelayMs,
      },
      {
        apiKey: primaryCredentials.apiKey,
        apiSecret: primaryCredentials.apiSecret,
        testnet,
        credentialId: primaryCredentials.id,
        authToken: primaryCredentials.authToken,
      },
      {
        apiKey: hedgeCredentials.apiKey,
        apiSecret: hedgeCredentials.apiSecret,
        testnet: hedgeCredentials.environment === 'TESTNET',
        credentialId: hedgeCredentials.id,
        authToken: hedgeCredentials.authToken,
      }
    );

    console.log(`[API] Graduated Entry Arbitrage started successfully: ${positionId}`);

    // Fetch position from database to get entry prices
    const dbPosition = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId },
    });

    return NextResponse.json({
      success: true,
      data: {
        positionId,
        symbol,
        primary: {
          exchange: primaryExchange,
          side: primarySide,
          leverage: primaryLeverage,
          quantity: adjustedPrimaryQuantity,
          environment: primaryCredentials.environment,
          entryPrice: dbPosition?.primaryEntryPrice || undefined,
        },
        hedge: {
          exchange: hedgeExchange,
          side: hedgeSide,
          leverage: hedgeLeverage,
          quantity: adjustedHedgeQuantity,
          environment: hedgeCredentials.environment,
          entryPrice: dbPosition?.hedgeEntryPrice || undefined,
        },
        graduatedEntry: {
          parts: graduatedEntryParts,
          delayMs: graduatedEntryDelayMs,
        },
      },
      message: 'Graduated Entry Arbitrage position started successfully',
    });
  } catch (error: any) {
    console.error('[API] Error starting Graduated Entry Arbitrage:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start Graduated Entry Arbitrage',
      },
      { status: 500 }
    );
  }
}

/**
 * Normalize symbol for BingX exchange
 * Converts symbols like "MERLUSDT" to "MERL-USDT"
 */
function normalizeSymbolForBingX(symbol: string): string {
  // If already has hyphen, return as-is
  if (symbol.includes('-')) {
    return symbol;
  }

  // BingX perpetual futures use USDT or USDC as quote currency
  // Insert hyphen before the quote currency
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4); // Remove 'USDT'
    return `${base}-USDT`;
  }

  if (symbol.endsWith('USDC')) {
    const base = symbol.slice(0, -4); // Remove 'USDC'
    return `${base}-USDC`;
  }

  // If no known quote currency, return as-is
  return symbol;
}

/**
 * Normalize symbol for Gate.io exchange
 * Converts symbols like "NVDAXUSDT" to "NVDAX_USDT"
 */
function normalizeSymbolForGateIO(symbol: string): string {
  // If already has underscore, return as-is
  if (symbol.includes('_')) {
    return symbol;
  }

  // Gate.io perpetual futures use USDT or USDC as quote currency
  // Insert underscore before the quote currency
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4); // Remove 'USDT'
    return `${base}_USDT`;
  }

  if (symbol.endsWith('USDC')) {
    const base = symbol.slice(0, -4); // Remove 'USDC'
    return `${base}_USDC`;
  }

  // If no known quote currency, return as-is
  return symbol;
}

/**
 * Normalize symbol for MEXC exchange
 * Converts symbols like "NMRUSDT" to "NMR_USDT"
 */
function normalizeSymbolForMEXC(symbol: string): string {
  // If already has underscore, return as-is
  if (symbol.includes('_')) {
    return symbol;
  }

  // MEXC perpetual futures use USDT or USDC as quote currency
  // Insert underscore before the quote currency
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4); // Remove 'USDT'
    return `${base}_USDT`;
  }

  if (symbol.endsWith('USDC')) {
    const base = symbol.slice(0, -4); // Remove 'USDC'
    return `${base}_USDC`;
  }

  // If no known quote currency, return as-is
  return symbol;
}

/**
 * Get symbol information for an exchange
 */
async function getSymbolInfo(exchange: string, symbol: string): Promise<SymbolInfo | null> {
  try {
    switch (exchange.toUpperCase()) {
      case 'BINGX':
        // Normalize symbol for BingX (e.g., MERLUSDT -> MERL-USDT)
        const bingxSymbol = normalizeSymbolForBingX(symbol);
        console.log(`[SymbolInfo] BingX symbol normalized: ${symbol} -> ${bingxSymbol}`);
        return await getBingXSymbolInfo(bingxSymbol);
      case 'BYBIT':
        return await getBybitSymbolInfo(symbol);
      case 'GATEIO':
        // Normalize symbol for Gate.io (e.g., NVDAXUSDT -> NVDAX_USDT)
        const gateioSymbol = normalizeSymbolForGateIO(symbol);
        console.log(`[SymbolInfo] Gate.io symbol normalized: ${symbol} -> ${gateioSymbol}`);
        return await getGateIOSymbolInfo(gateioSymbol);
      case 'MEXC':
        // Normalize symbol for MEXC (e.g., NMRUSDT -> NMR_USDT)
        const mexcSymbol = normalizeSymbolForMEXC(symbol);
        console.log(`[SymbolInfo] MEXC symbol normalized: ${symbol} -> ${mexcSymbol}`);
        return await getMEXCSymbolInfo(mexcSymbol);
      default:
        console.warn(`[SymbolInfo] Unsupported exchange: ${exchange}`);
        return null;
    }
  } catch (error: any) {
    console.error(`[SymbolInfo] Error fetching symbol info for ${symbol} on ${exchange}:`, error.message);
    return null;
  }
}

/**
 * Get BingX symbol information
 */
async function getBingXSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const bingx = new BingXService({
      apiKey: 'dummy',
      apiSecret: 'dummy',
      enableRateLimit: false,
    });

    const contracts = await bingx.getContracts();
    const contract = contracts.find((c: any) => c.symbol === symbol);

    if (!contract) {
      console.warn(`[BingX] Symbol ${symbol} not found in contracts list`);
      return null;
    }

    return {
      symbol: contract.symbol,
      exchange: 'BINGX',
      minOrderQty: parseFloat(contract.tradeMinQuantity || contract.minQty || '0.001'),
      minOrderValue: contract.volume ? parseFloat(contract.volume) : undefined,
      qtyStep: parseFloat(contract.size || '0.001'),
      pricePrecision: parseInt(contract.pricePrecision || '2'),
      qtyPrecision: parseInt(contract.quantityPrecision || '3'),
      maxOrderQty: contract.maxQty ? parseFloat(contract.maxQty) : undefined,
      maxLeverage: contract.maxLeverage ? parseInt(contract.maxLeverage) : undefined,
    };
  } catch (error: any) {
    console.error('[BingX] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get Bybit symbol information
 */
async function getBybitSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const bybit = new BybitService({
      enableRateLimit: false,
    });

    const response = await bybit.getInstrumentsInfo('linear', symbol);

    if (!response.list || response.list.length === 0) {
      console.warn(`[Bybit] Symbol ${symbol} not found`);
      return null;
    }

    const instrument = response.list[0];

    return {
      symbol: instrument.symbol,
      exchange: 'BYBIT',
      minOrderQty: parseFloat(instrument.lotSizeFilter?.minOrderQty || '0.001'),
      minOrderValue: instrument.lotSizeFilter?.minOrderAmt ? parseFloat(instrument.lotSizeFilter.minOrderAmt) : undefined,
      qtyStep: parseFloat(instrument.lotSizeFilter?.qtyStep || '0.001'),
      pricePrecision: parseInt(instrument.priceFilter?.tickSize?.split('.')[1]?.length || '2'),
      qtyPrecision: parseInt(instrument.lotSizeFilter?.basePrecision || '3'),
      maxOrderQty: instrument.lotSizeFilter?.maxOrderQty ? parseFloat(instrument.lotSizeFilter.maxOrderQty) : undefined,
      maxLeverage: instrument.leverageFilter?.maxLeverage ? parseFloat(instrument.leverageFilter.maxLeverage) : undefined,
    };
  } catch (error: any) {
    console.error('[Bybit] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get Gate.io symbol information
 */
async function getGateIOSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const url = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gate.io API error: ${response.status} ${response.statusText}`);
    }

    const contracts = await response.json();

    // Find the contract for this symbol
    const contract = contracts.find((c: any) => c.name === symbol);

    if (!contract) {
      console.warn(`[Gate.io] Symbol ${symbol} not found in contracts list`);
      return null;
    }

    // CRITICAL: Gate.io uses quanto_multiplier for contract-to-base-currency conversion
    // Example: AVNT_USDT has quanto_multiplier=10, meaning 1 contract = 10 AVNT
    // We MUST multiply minOrderQty and qtyStep by quanto_multiplier to get values in base currency
    const quantoMultiplier = parseFloat(contract.quanto_multiplier || '1');

    console.log(`[Gate.io] Found contract for ${symbol}:`, {
      order_size_min: contract.order_size_min,
      order_size_max: contract.order_size_max,
      quanto_multiplier: contract.quanto_multiplier,
      order_price_round: contract.order_price_round,
      mark_price_round: contract.mark_price_round,
      leverage_max: contract.leverage_max,
    });

    // Calculate precision from rounding values
    const pricePrecision = contract.mark_price_round ? contract.mark_price_round.split('.')[1]?.length || 2 : 2;
    const qtyPrecision = contract.order_size_min ? Math.abs(Math.log10(parseFloat(contract.order_size_min))) : 3;

    // Convert contract sizes to base currency amounts by multiplying with quanto_multiplier
    const minOrderQtyInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;
    const qtyStepInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;
    const maxOrderQtyInBaseCurrency = contract.order_size_max ? parseFloat(contract.order_size_max) * quantoMultiplier : undefined;

    return {
      symbol: contract.name,
      exchange: 'GATEIO',
      minOrderQty: minOrderQtyInBaseCurrency,
      minOrderValue: undefined,
      qtyStep: qtyStepInBaseCurrency,
      pricePrecision: parseInt(pricePrecision.toString()),
      qtyPrecision: Math.ceil(qtyPrecision),
      maxOrderQty: maxOrderQtyInBaseCurrency,
      maxLeverage: contract.leverage_max ? parseInt(contract.leverage_max) : undefined,
    };
  } catch (error: any) {
    console.error('[Gate.io] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get MEXC symbol information
 */
async function getMEXCSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const mexc = new MEXCService({
      apiKey: 'dummy',
      apiSecret: 'dummy',
      enableRateLimit: false,
    });

    const contractDetails = await mexc.getContractDetails(symbol);

    if (!contractDetails) {
      console.warn(`[MEXC] Symbol ${symbol} not found`);
      return null;
    }

    // Handle array or single contract response
    const contract = Array.isArray(contractDetails)
      ? contractDetails.find((c: any) => c.symbol === symbol) || contractDetails[0]
      : contractDetails;

    // Calculate qtyStep from precision
    const qtyStep = contract.volPrecision !== undefined
      ? Math.pow(10, -contract.volPrecision)
      : parseFloat(contract.minVol || '0.001');

    // Price precision
    const pricePrecision = contract.pricePrecision !== undefined
      ? contract.pricePrecision
      : 2;

    return {
      symbol: contract.symbol,
      exchange: 'MEXC',
      minOrderQty: parseFloat(contract.minVol || '0.001'),
      minOrderValue: undefined,
      qtyStep,
      pricePrecision,
      qtyPrecision: contract.volPrecision !== undefined ? contract.volPrecision : 3,
      maxOrderQty: contract.maxVol ? parseFloat(contract.maxVol) : undefined,
      maxLeverage: contract.maxLeverage ? parseInt(contract.maxLeverage) : undefined,
    };
  } catch (error: any) {
    console.error('[MEXC] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Validate and adjust order quantity against exchange requirements
 * Automatically rounds quantities to meet exchange step requirements
 */
function validateOrderQuantity(
  symbolInfo: SymbolInfo,
  totalQuantity: number,
  graduatedParts: number
): { valid: boolean; error?: string; suggestion?: string; adjustedQuantity?: number } {
  let qtyPerPart = totalQuantity / graduatedParts;

  // Automatically round quantity per part to meet step requirements
  // This prevents floating point precision issues and ensures valid orders
  // ALWAYS use step-based rounding for consistency (works for both integers and decimals)
  qtyPerPart = Math.round(qtyPerPart / symbolInfo.qtyStep) * symbolInfo.qtyStep;

  // Recalculate total quantity based on rounded parts
  const adjustedQuantity = qtyPerPart * graduatedParts;

  // Check if quantity per part meets minimum requirement
  if (qtyPerPart < symbolInfo.minOrderQty) {
    const minTotalQty = symbolInfo.minOrderQty * graduatedParts;
    const maxParts = Math.floor(totalQuantity / symbolInfo.minOrderQty);

    let suggestion: string;
    if (graduatedParts === 1 || maxParts === 0) {
      suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)}`;
    } else {
      suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)} or reduce graduated parts to ${maxParts}`;
    }

    return {
      valid: false,
      error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) is below minimum (${symbolInfo.minOrderQty})`,
      suggestion
    };
  }

  // Check maximum quantity if defined
  if (symbolInfo.maxOrderQty && qtyPerPart > symbolInfo.maxOrderQty) {
    return {
      valid: false,
      error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) exceeds maximum (${symbolInfo.maxOrderQty})`,
      suggestion: `Decrease quantity or increase graduated parts`
    };
  }

  return {
    valid: true,
    adjustedQuantity: adjustedQuantity
  };
}

/**
 * PATCH handler - Enable/disable liquidation monitoring for a position
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { positionId, isMonitoringEnabled } = body;

    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'positionId is required' },
        { status: 400 }
      );
    }

    if (typeof isMonitoringEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isMonitoringEnabled must be a boolean' },
        { status: 400 }
      );
    }

    console.log(`[API] Updating monitoring status for position ${positionId}: ${isMonitoringEnabled}`);

    // Update database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const position = await prisma.graduatedEntryPosition.findFirst({
        where: {
          positionId: positionId,
          userId: user.userId,
        },
      });

      if (!position) {
        return NextResponse.json(
          { success: false, error: 'Position not found' },
          { status: 404 }
        );
      }

      // Update monitoring status
      await prisma.graduatedEntryPosition.update({
        where: { id: position.id },
        data: {
          isMonitoringEnabled,
          monitoringStatus: isMonitoringEnabled ? 'active' : 'disabled',
          updatedAt: new Date(),
        },
      });

      console.log(`[API] ✓ Monitoring ${isMonitoringEnabled ? 'enabled' : 'disabled'} for position ${positionId}`);

      return NextResponse.json({
        success: true,
        data: {
          positionId,
          isMonitoringEnabled,
          monitoringStatus: isMonitoringEnabled ? 'active' : 'disabled',
        },
        message: `Monitoring ${isMonitoringEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error('[API] Error updating monitoring status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update monitoring status',
      },
      { status: 500 }
    );
  }
}
