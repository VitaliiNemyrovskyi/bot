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

      // If not showing all, only show active positions (INITIALIZING, EXECUTING, ACTIVE)
      // ACTIVE = positions opened and being monitored
      if (!showAll) {
        whereClause.status = {
          in: ['INITIALIZING', 'EXECUTING', 'ACTIVE'],
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

      // Transform database positions to safe response format
      const safePositions = dbPositions.map(position => ({
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
          // Funding and profit tracking (initialized to 0 for new positions)
          lastFundingPaid: 0,
          totalFundingEarned: 0,
          tradingFees: 0,
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
          // Funding and profit tracking (initialized to 0 for new positions)
          lastFundingPaid: 0,
          totalFundingEarned: 0,
          tradingFees: 0,
        },
        graduatedEntry: {
          parts: position.graduatedParts,
          delayMs: position.graduatedDelayMs,
          currentPart: position.currentPart,
        },
        status: position.status.toLowerCase(),
        startedAt: position.startedAt,
        completedAt: position.completedAt,
        // Overall profit metrics (initialized to 0 for new positions)
        grossProfit: 0,
        netProfit: 0,
      }));

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

    console.log(`[API] Order quantity validation passed for both exchanges`);

    // Start graduated entry arbitrage position
    const testnet = primaryCredentials.environment === 'TESTNET';

    const positionId = await graduatedEntryArbitrageService.startPosition(
      {
        userId: user.userId,
        symbol,
        primaryExchange,
        primarySide: primarySide.toLowerCase() as 'long' | 'short',
        primaryLeverage,
        primaryQuantity,
        hedgeExchange,
        hedgeSide: hedgeSide.toLowerCase() as 'long' | 'short',
        hedgeLeverage,
        hedgeQuantity,
        graduatedEntryParts,
        graduatedEntryDelayMs,
      },
      {
        apiKey: primaryCredentials.apiKey,
        apiSecret: primaryCredentials.apiSecret,
        testnet,
        credentialId: primaryCredentials.id,
      },
      {
        apiKey: hedgeCredentials.apiKey,
        apiSecret: hedgeCredentials.apiSecret,
        testnet: hedgeCredentials.environment === 'TESTNET',
        credentialId: hedgeCredentials.id,
      }
    );

    console.log(`[API] Graduated Entry Arbitrage started successfully: ${positionId}`);

    return NextResponse.json({
      success: true,
      data: {
        positionId,
        symbol,
        primary: {
          exchange: primaryExchange,
          side: primarySide,
          leverage: primaryLeverage,
          quantity: primaryQuantity,
          environment: primaryCredentials.environment,
        },
        hedge: {
          exchange: hedgeExchange,
          side: hedgeSide,
          leverage: hedgeLeverage,
          quantity: hedgeQuantity,
          environment: hedgeCredentials.environment,
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
 * Validate order quantity against exchange requirements
 */
function validateOrderQuantity(
  symbolInfo: SymbolInfo,
  totalQuantity: number,
  graduatedParts: number
): { valid: boolean; error?: string; suggestion?: string } {
  const qtyPerPart = totalQuantity / graduatedParts;

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

  // Check quantity step
  const roundedQtyPerPart = Math.round(qtyPerPart / symbolInfo.qtyStep) * symbolInfo.qtyStep;
  const difference = Math.abs(qtyPerPart - roundedQtyPerPart);

  if (difference > symbolInfo.qtyStep * 0.001) {
    return {
      valid: false,
      error: `Quantity per part must be a multiple of ${symbolInfo.qtyStep}`,
      suggestion: `Adjust total quantity to ${(roundedQtyPerPart * graduatedParts).toFixed(symbolInfo.qtyPrecision)}`
    };
  }

  return { valid: true };
}
