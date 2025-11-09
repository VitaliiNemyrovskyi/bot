import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { ExchangeConnectorFactory } from '@/connectors/exchange.factory';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import prisma from '@/lib/prisma';
import { PriceArbitrageStatus } from '@prisma/client';

/**
 * GET /api/arbitrage/positions/detect
 *
 * Detects existing arbitrage positions on exchanges and imports them to the database.
 *
 * This endpoint checks both exchanges for open positions and looks for valid arbitrage pairs:
 * - One LONG position on one exchange
 * - One SHORT position on the other exchange
 * - Same symbol
 * - Same quantity (exactly)
 * - Same leverage (exactly)
 *
 * If a valid pair is found and no position exists in the database for this symbol/exchange pair,
 * it will automatically create a new position record.
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., AIAUSDT) - Required
 * - primaryExchange: First exchange name (e.g., GATEIO) - Required
 * - hedgeExchange: Second exchange name (e.g., BINGX) - Required
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "detected": true,
 *   "position": {
 *     "id": "xxx",
 *     "symbol": "AIAUSDT",
 *     "primaryExchange": "GATEIO",
 *     "hedgeExchange": "BINGX",
 *     ...
 *   },
 *   "message": "Existing arbitrage position detected and imported"
 * }
 *
 * Response (No Position Found - 200):
 * {
 *   "success": true,
 *   "detected": false,
 *   "message": "No matching arbitrage positions found on exchanges"
 * }
 *
 * Response (Error - 400/401/500):
 * {
 *   "success": false,
 *   "error": "Error type",
 *   "message": "Detailed error message",
 *   "code": "ERROR_CODE"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    console.log('[DetectPositionAPI] Authenticating user...');
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const primaryExchange = searchParams.get('primaryExchange');
    const hedgeExchange = searchParams.get('hedgeExchange');

    if (!symbol || !primaryExchange || !hedgeExchange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'symbol, primaryExchange, and hedgeExchange are required',
          code: 'MISSING_PARAMS',
        },
        { status: 400 }
      );
    }

    console.log('[DetectPositionAPI] Checking for positions:', {
      userId,
      symbol,
      primaryExchange,
      hedgeExchange,
    });

    // 3. Check if position already exists in database
    const existingPosition = await prisma.priceArbitragePosition.findFirst({
      where: {
        userId,
        symbol,
        primaryExchange,
        hedgeExchange,
        status: {
          in: ['OPENING', 'ACTIVE', 'CLOSING'],
        },
      },
    });

    if (existingPosition) {
      console.log('[DetectPositionAPI] Position already exists in database:', existingPosition.id);
      return NextResponse.json({
        success: true,
        detected: false,
        alreadyExists: true,
        message: 'Position already exists in database',
        positionId: existingPosition.id,
      });
    }

    // 4. Get credentials for both exchanges
    const primaryCredentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      primaryExchange as any
    );
    const hedgeCredentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      hedgeExchange as any
    );

    if (!primaryCredentials || !hedgeCredentials) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing credentials',
          message: 'Exchange credentials not found. Please configure your API keys.',
          code: 'CREDENTIALS_NOT_FOUND',
        },
        { status: 400 }
      );
    }

    // 5. Initialize connectors
    let primaryConnector: BaseExchangeConnector;
    let hedgeConnector: BaseExchangeConnector;

    try {
      primaryConnector = getConnector(
        primaryExchange,
        primaryCredentials.apiKey,
        primaryCredentials.apiSecret,
        primaryCredentials.environment === 'TESTNET',
        primaryCredentials.authToken
      );
      hedgeConnector = getConnector(
        hedgeExchange,
        hedgeCredentials.apiKey,
        hedgeCredentials.apiSecret,
        hedgeCredentials.environment === 'TESTNET',
        hedgeCredentials.authToken
      );

      await primaryConnector.initialize();
      await hedgeConnector.initialize();
    } catch (error: any) {
      console.error('[DetectPositionAPI] Failed to initialize connectors:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Connector initialization failed',
          message: error.message,
          code: 'CONNECTOR_INIT_FAILED',
        },
        { status: 500 }
      );
    }

    // 6. Get positions from both exchanges
    console.log('[DetectPositionAPI] Fetching positions from exchanges...');
    const [primaryPositions, hedgePositions] = await Promise.all([
      primaryConnector.getPositions(symbol).catch((err) => {
        console.error(`[DetectPositionAPI] Error fetching ${primaryExchange} positions:`, err.message);
        return [];
      }),
      hedgeConnector.getPositions(symbol).catch((err) => {
        console.error(`[DetectPositionAPI] Error fetching ${hedgeExchange} positions:`, err.message);
        return [];
      }),
    ]);

    console.log('[DetectPositionAPI] Positions found:', {
      primary: primaryPositions.length,
      hedge: hedgePositions.length,
    });

    // 7. Find matching arbitrage pairs
    const matchedPair = findMatchingArbitragePair(
      primaryPositions,
      hedgePositions,
      symbol,
      primaryExchange,
      hedgeExchange
    );

    if (!matchedPair) {
      console.log('[DetectPositionAPI] No matching arbitrage pairs found');
      return NextResponse.json({
        success: true,
        detected: false,
        message: 'No matching arbitrage positions found on exchanges',
        details: {
          primaryPositionsCount: primaryPositions.length,
          hedgePositionsCount: hedgePositions.length,
        },
      });
    }

    console.log('[DetectPositionAPI] Matching arbitrage pair found:', matchedPair);

    // 8. Create position in database
    const newPosition = await createPositionFromExchangeData(
      userId,
      symbol,
      matchedPair,
      primaryExchange,
      hedgeExchange,
      primaryCredentials.id,
      hedgeCredentials.id
    );

    console.log('[DetectPositionAPI] Position imported successfully:', newPosition.id);

    return NextResponse.json({
      success: true,
      detected: true,
      position: {
        id: newPosition.id,
        symbol: newPosition.symbol,
        primaryExchange: newPosition.primaryExchange,
        hedgeExchange: newPosition.hedgeExchange,
        primaryLeverage: newPosition.primaryLeverage,
        primaryQuantity: newPosition.primaryQuantity,
        hedgeLeverage: newPosition.hedgeLeverage,
        hedgeQuantity: newPosition.hedgeQuantity,
        status: newPosition.status,
        createdAt: newPosition.createdAt,
        openedAt: newPosition.openedAt,
      },
      message: 'Existing arbitrage position detected and imported',
    });
  } catch (error: any) {
    console.error('[DetectPositionAPI] Unexpected error:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Get appropriate exchange connector using the factory
 * Supports all custom connectors (BYBIT, BINGX, MEXC, GATEIO)
 * and CCXT exchanges (BITGET, BINANCE, OKX, KUCOIN, etc.)
 */
function getConnector(
  exchange: string,
  apiKey: string,
  apiSecret: string,
  isTestnet: boolean,
  authToken?: string | null
): BaseExchangeConnector {
  return ExchangeConnectorFactory.create(
    exchange,
    apiKey,
    apiSecret,
    undefined, // userId
    undefined, // credentialId
    authToken || undefined
  );
}

/**
 * Find matching arbitrage pair from positions on two exchanges
 */
function findMatchingArbitragePair(
  primaryPositions: any[],
  hedgePositions: any[],
  symbol: string,
  primaryExchange: string,
  hedgeExchange: string
): {
  primaryPosition: any;
  hedgePosition: any;
} | null {
  console.log('[DetectPositionAPI] Analyzing positions for arbitrage pairs...');

  // Filter positions for the specific symbol
  const primarySymbolPositions = primaryPositions.filter((p) => {
    const posSize = parseFloat(p.size || p.positionAmt || '0');
    return posSize !== 0;
  });

  const hedgeSymbolPositions = hedgePositions.filter((p) => {
    const posSize = parseFloat(p.size || p.positionAmt || '0');
    return posSize !== 0;
  });

  console.log('[DetectPositionAPI] Filtered positions:', {
    primary: primarySymbolPositions.length,
    hedge: hedgeSymbolPositions.length,
  });

  // Try to find matching pairs
  for (const primaryPos of primarySymbolPositions) {
    const primarySide = getPositionSide(primaryPos);
    const primarySize = getPositionSize(primaryPos, primaryExchange);
    const primaryLeverage = parseFloat(primaryPos.leverage || '1');

    console.log('[DetectPositionAPI] Checking primary position:', {
      exchange: primaryExchange,
      side: primarySide,
      size: primarySize,
      leverage: primaryLeverage,
    });

    for (const hedgePos of hedgeSymbolPositions) {
      const hedgeSide = getPositionSide(hedgePos);
      const hedgeSize = getPositionSize(hedgePos, hedgeExchange);
      const hedgeLeverage = parseFloat(hedgePos.leverage || '1');

      console.log('[DetectPositionAPI] Checking hedge position:', {
        exchange: hedgeExchange,
        side: hedgeSide,
        size: hedgeSize,
        leverage: hedgeLeverage,
      });

      // Check if positions form a valid arbitrage pair
      const isValidPair =
        primarySide !== hedgeSide && // Opposite directions
        Math.abs(primarySize - hedgeSize) < 0.0001 && // Same size (with small tolerance for floating point)
        primaryLeverage === hedgeLeverage; // Same leverage

      if (isValidPair) {
        console.log('[DetectPositionAPI] ✓ Valid arbitrage pair found!');
        return {
          primaryPosition: primaryPos,
          hedgePosition: hedgePos,
        };
      } else {
        console.log('[DetectPositionAPI] ✗ Not a valid pair:', {
          oppositeSides: primarySide !== hedgeSide,
          sameSize: Math.abs(primarySize - hedgeSize) < 0.0001,
          sameLeverage: primaryLeverage === hedgeLeverage,
        });
      }
    }
  }

  return null;
}

/**
 * Get position size (quantity of coins) - handles different exchange formats
 */
function getPositionSize(position: any, exchange: string): number {
  // Gate.io uses value/mark_price for position size
  if (exchange.toUpperCase() === 'GATEIO' || exchange.toUpperCase() === 'GATE') {
    if (position.value && position.mark_price) {
      const value = Math.abs(parseFloat(position.value));
      const markPrice = parseFloat(position.mark_price);
      return value / markPrice;
    }
  }

  // BingX and other exchanges use positionAmt or size directly
  if (position.positionAmt) {
    return Math.abs(parseFloat(position.positionAmt));
  }

  if (position.size) {
    return Math.abs(parseFloat(position.size));
  }

  return 0;
}

/**
 * Get position side (LONG or SHORT)
 */
function getPositionSide(position: any): 'LONG' | 'SHORT' {
  // Check various fields that indicate position side
  if (position.side) {
    const side = position.side.toUpperCase();
    if (side === 'LONG' || side === 'BUY') return 'LONG';
    if (side === 'SHORT' || side === 'SELL') return 'SHORT';
  }

  // Check position amount/size sign
  const size = parseFloat(position.size || position.positionAmt || '0');
  if (size > 0) return 'LONG';
  if (size < 0) return 'SHORT';

  // Default to LONG if unclear
  return 'LONG';
}

/**
 * Create position record in database from exchange data
 */
async function createPositionFromExchangeData(
  userId: string,
  symbol: string,
  matchedPair: { primaryPosition: any; hedgePosition: any },
  primaryExchange: string,
  hedgeExchange: string,
  primaryCredentialId: string,
  hedgeCredentialId: string
) {
  const { primaryPosition, hedgePosition } = matchedPair;

  // Extract position data using proper parsing functions
  const primaryEntryPrice = parseFloat(primaryPosition.entryPrice || primaryPosition.entry_price || primaryPosition.avgPrice || '0');
  const hedgeEntryPrice = parseFloat(hedgePosition.entryPrice || hedgePosition.entry_price || hedgePosition.avgPrice || '0');
  const primaryLeverage = parseFloat(primaryPosition.leverage || '1');
  const hedgeLeverage = parseFloat(hedgePosition.leverage || '1');
  const positionSize = getPositionSize(primaryPosition, primaryExchange);

  // Calculate margin (size * entry price / leverage)
  const primaryMargin = (positionSize * primaryEntryPrice) / primaryLeverage;
  const hedgeMargin = (positionSize * hedgeEntryPrice) / hedgeLeverage;

  // Calculate spread
  const entrySpread = Math.abs(primaryEntryPrice - hedgeEntryPrice) / ((primaryEntryPrice + hedgeEntryPrice) / 2);
  const entrySpreadPercent = entrySpread * 100;

  // Get credentials to calculate entry fees
  const primaryCredentials = await prisma.exchangeCredentials.findUnique({
    where: { id: primaryCredentialId },
    select: { takerFeeRate: true, exchange: true }
  });
  const hedgeCredentials = await prisma.exchangeCredentials.findUnique({
    where: { id: hedgeCredentialId },
    select: { takerFeeRate: true, exchange: true }
  });

  // Default fee rates per exchange (if not set in credentials)
  const getDefaultFeeRate = (exchange: string): number => {
    const exchangeUpper = exchange.toUpperCase();
    switch (exchangeUpper) {
      case 'BINGX': return 0.0004; // 0.04% taker fee
      case 'BYBIT': return 0.0006; // 0.06% taker fee
      case 'BITGET': return 0.0006; // 0.06% taker fee
      case 'GATEIO':
      case 'GATE': return 0.0005; // 0.05% taker fee
      case 'BINANCE': return 0.0004; // 0.04% taker fee
      case 'OKX': return 0.0008; // 0.08% taker fee
      case 'MEXC': return 0.0006; // 0.06% taker fee
      case 'KUCOIN': return 0.001; // 0.1% taker fee
      default: return 0.0005; // Default 0.05%
    }
  };

  // Calculate entry fees (position value * fee rate)
  const primaryPositionValue = positionSize * primaryEntryPrice;
  const hedgePositionValue = positionSize * hedgeEntryPrice;

  const primaryFeeRate = primaryCredentials?.takerFeeRate ?? getDefaultFeeRate(primaryCredentials?.exchange || primaryExchange);
  const hedgeFeeRate = hedgeCredentials?.takerFeeRate ?? getDefaultFeeRate(hedgeCredentials?.exchange || hedgeExchange);

  const primaryFees = primaryPositionValue * primaryFeeRate;
  const hedgeFees = hedgePositionValue * hedgeFeeRate;

  console.log('[DetectPositionAPI] Calculated entry fees:', {
    primaryPositionValue,
    primaryFeeRate,
    primaryFees,
    hedgePositionValue,
    hedgeFeeRate,
    hedgeFees
  });

  // Create position in database
  const position = await prisma.priceArbitragePosition.create({
    data: {
      userId,
      symbol,
      primaryExchange,
      hedgeExchange,
      primaryCredentialId,
      hedgeCredentialId,
      primaryLeverage,
      primaryMargin,
      primaryQuantity: positionSize,
      hedgeLeverage,
      hedgeMargin,
      hedgeQuantity: positionSize,
      entryPrimaryPrice: primaryEntryPrice,
      entryHedgePrice: hedgeEntryPrice,
      entrySpread,
      entrySpreadPercent,
      primaryFees,
      hedgeFees,
      status: 'ACTIVE' as PriceArbitrageStatus,
      openedAt: new Date(), // Mark as opened (imported from exchange)
    },
  });

  return position;
}
