import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';

/**
 * GET /api/trading/user-info
 *
 * Fetches comprehensive user information from Bybit including:
 * - API key information and permissions
 * - Account configuration (margin mode, trading settings)
 * - Detailed wallet balance for all coins
 * - Trading fee rates
 *
 * Query Parameters:
 * - type: (optional) Specific type of info to fetch
 *   - 'api-key': API key information only
 *   - 'account': Account configuration only
 *   - 'wallet': Wallet balance only
 *   - 'fees': Fee rates only
 *   - 'profile': All information (default)
 * - accountType: (optional) For wallet balance - 'UNIFIED', 'CONTRACT', or 'SPOT' (default: 'UNIFIED')
 * - coin: (optional) Specific coin for wallet balance
 * - category: (optional) For fee rates - 'linear', 'spot', or 'option' (default: 'linear')
 * - symbol: (optional) Specific symbol for fee rates
 *
 * Request Headers Required:
 * - x-api-key: Bybit API key
 * - x-api-secret: Bybit API secret
 */
export async function GET(request: NextRequest) {
  try {
    // Extract API credentials from headers
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = request.headers.get('x-api-secret');
    const testnet = request.headers.get('x-testnet') !== 'false';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing API credentials',
          message: 'Please provide x-api-key and x-api-secret headers'
        },
        { status: 401 }
      );
    }

    // Create Bybit service instance with provided credentials
    const bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true
    });

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const infoType = searchParams.get('type') || 'profile';
    const accountType = (searchParams.get('accountType') as 'UNIFIED' | 'CONTRACT' | 'SPOT') || 'UNIFIED';
    const coin = searchParams.get('coin');
    const category = (searchParams.get('category') as 'linear' | 'spot' | 'option') || 'linear';
    const symbol = searchParams.get('symbol');

    // Fetch requested information based on type
    let result: any;
    let metadata: any = {
      timestamp: new Date().toISOString(),
      testnet,
      infoType
    };

    switch (infoType) {
      case 'api-key':
        result = await bybitService.getApiKeyInfo();
        metadata.description = 'API key information including permissions and expiration';
        break;

      case 'account':
        result = await bybitService.getUserAccountInfo();
        metadata.description = 'Account configuration including margin mode and trading settings';
        break;

      case 'wallet':
        result = await bybitService.getDetailedWalletBalance(accountType, coin || undefined);
        metadata.accountType = accountType;
        if (coin) metadata.coin = coin;
        metadata.description = 'Detailed wallet balance information';
        break;

      case 'fees':
        result = await bybitService.getFeeRate(category, symbol || undefined);
        metadata.category = category;
        if (symbol) metadata.symbol = symbol;
        metadata.description = 'Trading fee rates';
        break;

      case 'profile':
      default:
        result = await bybitService.getUserProfile();
        metadata.description = 'Complete user profile including all available information';
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata
    });

  } catch (error: any) {
    console.error('Error fetching user info:', error);

    // Determine error status code
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.message?.includes('API credentials')) {
      statusCode = 401;
      errorMessage = error.message;
    } else if (error.message?.includes('Bybit API Error')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message?.includes('Network') || error.message?.includes('timeout')) {
      statusCode = 503;
      errorMessage = 'Service temporarily unavailable';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/trading/user-info/check-permission
 *
 * Check if the API key has specific permissions
 *
 * Request Body:
 * {
 *   "permissionType": "ContractTrade" | "Spot" | "Wallet" | "Options" | "Derivatives",
 *   "permission": "Order" | "SpotTrade" | "AccountTransfer" etc.
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API credentials from headers
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = request.headers.get('x-api-secret');
    const testnet = request.headers.get('x-testnet') !== 'false';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing API credentials',
          message: 'Please provide x-api-key and x-api-secret headers'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { permissionType, permission } = body;

    if (!permissionType || !permission) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Please provide permissionType and permission in request body'
        },
        { status: 400 }
      );
    }

    // Create Bybit service instance
    const bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true
    });

    // Check permission
    const hasPermission = await bybitService.hasPermission(permissionType, permission);

    return NextResponse.json({
      success: true,
      data: {
        permissionType,
        permission,
        hasPermission
      },
      metadata: {
        timestamp: new Date().toISOString(),
        testnet
      }
    });

  } catch (error: any) {
    console.error('Error checking permission:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check permission',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
