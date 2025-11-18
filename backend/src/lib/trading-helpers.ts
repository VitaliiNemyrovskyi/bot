import { NextRequest } from 'next/server';
import { AuthService, JWTPayload } from './auth';
import { BybitService, OrderRequest, Position, Order } from './bybit';
import prisma from './prisma';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

/**
 * Order placement request validation schema
 */
export interface OrderPlacementRequest {
  credentialId: string;
  category: 'linear' | 'spot';
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: 'Market' | 'Limit';
  qty: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  takeProfit?: string;
  stopLoss?: string;
  tpTriggerBy?: string;
  slTriggerBy?: string;
}

/**
 * Position close request validation schema
 */
export interface PositionCloseRequest {
  credentialId: string;
  category: 'linear' | 'spot';
  symbol: string;
  side: 'Buy' | 'Sell';
  qty?: string;
}

/**
 * Authenticate request and extract user information
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ success: boolean; user?: JWTPayload; error?: string }> {
  try {
    const authResult = await AuthService.authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error || 'Unauthorized'
      };
    }

    return {
      success: true,
      user: authResult.user
    };
  } catch (error: any) {
    console.error('[Auth] Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Get exchange credential for user and verify ownership
 */
export async function getCredentialForUser(
  credentialId: string,
  userId: string
): Promise<{ success: boolean; credential?: any; error?: string }> {
  try {
    // First, try to get from ExchangeCredentials (new system)
    const credential = await prisma.exchangeCredentials.findFirst({
      where: {
        id: credentialId,
        userId: userId
      }
    });

    if (credential) {
      return {
        success: true,
        credential
      };
    }

    // Fallback to legacy BybitApiKey if not found in ExchangeCredentials
    const legacyCredential = await prisma.bybitApiKey.findFirst({
      where: {
        id: credentialId,
        userId: userId
      }
    });

    if (legacyCredential) {
      return {
        success: true,
        credential: {
          id: legacyCredential.id,
          userId: legacyCredential.userId,
          exchange: 'BYBIT',
          environment: legacyCredential.testnet ? 'TESTNET' : 'MAINNET',
          apiKey: legacyCredential.apiKey,
          apiSecret: legacyCredential.apiSecret,
          isActive: true
        }
      };
    }

    return {
      success: false,
      error: 'Credential not found or access denied'
    };
  } catch (error: any) {
    console.error('[TradingHelpers] Error fetching credential:', error);
    return {
      success: false,
      error: 'Failed to fetch credential'
    };
  }
}

/**
 * Create Bybit service client for credential
 */
export async function createBybitClientForCredential(
  credential: any
): Promise<{ success: boolean; client?: BybitService; error?: string }> {
  try {
    // In production, decrypt API keys here
    // For now, we assume keys are stored encrypted and need decryption
    const apiKey = credential.apiKey; // TODO: Add decryption
    const apiSecret = credential.apiSecret; // TODO: Add decryption

    if (!apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Invalid API credentials'
      };
    }

    const client = new BybitService({
      apiKey,
      apiSecret,
      enableRateLimit: true,
      userId: credential.userId
    });

    return {
      success: true,
      client
    };
  } catch (error: any) {
    console.error('[TradingHelpers] Error creating Bybit client:', error);
    return {
      success: false,
      error: 'Failed to initialize trading client'
    };
  }
}

/**
 * Validate order placement request
 */
export function validateOrderRequest(
  data: any
): { valid: boolean; errors?: string[]; order?: OrderPlacementRequest } {
  const errors: string[] = [];

  // Required fields
  if (!data.credentialId || typeof data.credentialId !== 'string') {
    errors.push('credentialId is required and must be a string');
  }

  if (!data.category || !['linear', 'spot'].includes(data.category)) {
    errors.push('category is required and must be either "linear" or "spot"');
  }

  if (!data.symbol || typeof data.symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  }

  if (!data.side || !['Buy', 'Sell'].includes(data.side)) {
    errors.push('side is required and must be either "Buy" or "Sell"');
  }

  if (!data.orderType || !['Market', 'Limit'].includes(data.orderType)) {
    errors.push('orderType is required and must be either "Market" or "Limit"');
  }

  if (!data.qty || typeof data.qty !== 'string') {
    errors.push('qty is required and must be a string');
  } else {
    const qtyNum = parseFloat(data.qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      errors.push('qty must be a positive number');
    }
  }

  // Limit order validation
  if (data.orderType === 'Limit') {
    if (!data.price || typeof data.price !== 'string') {
      errors.push('price is required for Limit orders');
    } else {
      const priceNum = parseFloat(data.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.push('price must be a positive number');
      }
    }

    if (data.timeInForce && !['GTC', 'IOC', 'FOK'].includes(data.timeInForce)) {
      errors.push('timeInForce must be one of: GTC, IOC, FOK');
    }
  }

  // Optional TP/SL validation
  if (data.takeProfit) {
    const tpNum = parseFloat(data.takeProfit);
    if (isNaN(tpNum) || tpNum <= 0) {
      errors.push('takeProfit must be a positive number');
    }
  }

  if (data.stopLoss) {
    const slNum = parseFloat(data.stopLoss);
    if (isNaN(slNum) || slNum <= 0) {
      errors.push('stopLoss must be a positive number');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    order: data as OrderPlacementRequest
  };
}

/**
 * Validate position close request
 */
export function validatePositionCloseRequest(
  data: any
): { valid: boolean; errors?: string[]; request?: PositionCloseRequest } {
  const errors: string[] = [];

  if (!data.credentialId || typeof data.credentialId !== 'string') {
    errors.push('credentialId is required and must be a string');
  }

  if (!data.category || !['linear', 'spot'].includes(data.category)) {
    errors.push('category is required and must be either "linear" or "spot"');
  }

  if (!data.symbol || typeof data.symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  }

  if (!data.side || !['Buy', 'Sell'].includes(data.side)) {
    errors.push('side is required and must be either "Buy" or "Sell"');
  }

  if (data.qty) {
    const qtyNum = parseFloat(data.qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      errors.push('qty must be a positive number if provided');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    request: data as PositionCloseRequest
  };
}

/**
 * Log trading operation for audit trail
 */
export async function logTradingOperation(params: {
  userId: string;
  operation: string;
  symbol?: string;
  orderType?: string;
  side?: string;
  qty?: string;
  price?: string;
  status: 'success' | 'error';
  errorMessage?: string;
  metadata?: any;
}): Promise<void> {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: params.userId,
      operation: params.operation,
      symbol: params.symbol,
      orderType: params.orderType,
      side: params.side,
      qty: params.qty,
      price: params.price,
      status: params.status,
      errorMessage: params.errorMessage,
      metadata: params.metadata
    };

    // Log to console (in production, send to logging service)
    // console.log('[Trading Operation]', JSON.stringify(logEntry, null, 2));

    // TODO: In production, store in database or send to logging service
    // await prisma.tradingLog.create({ data: logEntry });
  } catch (error: any) {
    console.error('[TradingHelpers] Error logging trading operation:', error);
    // Don't throw - logging failures shouldn't break the trading flow
  }
}

/**
 * Format order response for API
 */
export function formatOrderResponse(order: any): any {
  return {
    orderId: order.orderId,
    orderLinkId: order.orderLinkId,
    symbol: order.symbol,
    side: order.side,
    orderType: order.orderType,
    qty: order.qty,
    price: order.price,
    orderStatus: order.orderStatus,
    timeInForce: order.timeInForce,
    createdTime: order.createdTime,
    updatedTime: order.updatedTime,
    avgPrice: order.avgPrice,
    cumExecQty: order.cumExecQty,
    cumExecValue: order.cumExecValue,
    cumExecFee: order.cumExecFee
  };
}

/**
 * Format position response for API
 */
export function formatPositionResponse(position: Position): any {
  return {
    symbol: position.symbol,
    side: position.side,
    size: position.size,
    positionValue: position.positionValue,
    entryPrice: position.entryPrice,
    markPrice: position.markPrice,
    liqPrice: position.liqPrice,
    unrealisedPnl: position.unrealisedPnl,
    cumRealisedPnl: position.cumRealisedPnl,
    takeProfit: position.takeProfit,
    stopLoss: position.stopLoss,
    createdTime: position.createdTime,
    updatedTime: position.updatedTime
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  code: string = 'ERROR',
  status: number = 500
): { response: ApiResponse; status: number } {
  return {
    response: {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString()
    },
    status
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): { response: ApiResponse<T>; status: number } {
  return {
    response: {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    status: 200
  };
}

/**
 * Handle Bybit API errors and convert to standard format
 */
export function handleBybitError(error: any): { response: ApiResponse; status: number } {
  console.error('[Bybit Error]', error);

  const errorMessage = error.message || 'Unknown error';

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return createErrorResponse(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  // Insufficient balance
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return createErrorResponse(
      'Insufficient balance to execute this order',
      'INSUFFICIENT_BALANCE',
      400
    );
  }

  // Invalid symbol
  if (errorMessage.includes('invalid symbol') || errorMessage.includes('not found')) {
    return createErrorResponse(
      'Invalid trading symbol',
      'INVALID_SYMBOL',
      400
    );
  }

  // Invalid order parameters
  if (errorMessage.includes('invalid') || errorMessage.includes('parameter')) {
    return createErrorResponse(
      errorMessage,
      'INVALID_PARAMETERS',
      400
    );
  }

  // Generic Bybit API error
  if (errorMessage.includes('Bybit API Error')) {
    return createErrorResponse(
      errorMessage,
      'BYBIT_API_ERROR',
      400
    );
  }

  // Unknown error
  return createErrorResponse(
    'Trading operation failed',
    'TRADING_ERROR',
    500
  );
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize error message (remove sensitive information)
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove API keys, secrets, and other sensitive data
  return message
    .replace(/api[_-]?key[:\s=]+[\w-]+/gi, 'api_key=***')
    .replace(/secret[:\s=]+[\w-]+/gi, 'secret=***')
    .replace(/token[:\s=]+[\w-]+/gi, 'token=***');
}

/**
 * Calculate total unrealized PnL from positions
 */
export function calculateTotalUnrealizedPnl(positions: Position[]): string {
  const total = positions.reduce((sum, pos) => {
    const pnl = parseFloat(pos.unrealisedPnl || '0');
    return sum + pnl;
  }, 0);

  return total.toFixed(8);
}

/**
 * Validate query parameters for order history
 */
export function validateOrderHistoryParams(searchParams: URLSearchParams): {
  valid: boolean;
  errors?: string[];
  params?: {
    category: 'linear' | 'spot';
    symbol?: string;
    orderStatus?: string;
    limit: number;
  };
} {
  const errors: string[] = [];

  const category = searchParams.get('category') as 'linear' | 'spot' || 'linear';
  if (!['linear', 'spot'].includes(category)) {
    errors.push('category must be either "linear" or "spot"');
  }

  const limitStr = searchParams.get('limit');
  let limit = 50;
  if (limitStr) {
    limit = parseInt(limitStr);
    if (isNaN(limit) || limit < 1 || limit > 200) {
      errors.push('limit must be between 1 and 200');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    params: {
      category,
      symbol: searchParams.get('symbol') || undefined,
      orderStatus: searchParams.get('orderStatus') || undefined,
      limit
    }
  };
}
