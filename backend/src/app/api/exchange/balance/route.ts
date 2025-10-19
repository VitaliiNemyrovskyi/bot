/**
 * GET /api/exchange/balance
 * Get account balance for a specific exchange
 *
 * Query params:
 * - exchange: BINGX | BYBIT | MEXC | GATEIO | BITGET
 */

import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { BybitService } from '@/lib/bybit';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { AuthService } from '@/lib/auth';
import { Exchange } from '@prisma/client';
import ccxt from 'ccxt';

interface ExchangeBalance {
  exchange: string;
  totalBalance: string; // Total wallet balance in USDT
  availableBalance: string; // Available balance for trading
  usedBalance?: string; // Balance locked in positions
  currency: string; // Usually USDT
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    const searchParams = request.nextUrl.searchParams;
    const exchange = searchParams.get('exchange')?.toUpperCase();

    if (!exchange) {
      return NextResponse.json(
        { success: false, error: 'Exchange parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Getting balance for exchange ${exchange}, userId: ${userId}`);

    // Get exchange credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(userId, exchange as Exchange);

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: `No credentials found for ${exchange}. Please add API keys in settings.` },
        { status: 404 }
      );
    }

    let balance: ExchangeBalance | null = null;

    switch (exchange) {
      case 'BINGX':
        balance = await getBingXBalance(credentials.apiKey, credentials.apiSecret);
        break;
      case 'BYBIT':
        balance = await getBybitBalance(credentials.apiKey, credentials.apiSecret);
        break;
      case 'GATEIO':
        balance = await getGateIOBalance(credentials.apiKey, credentials.apiSecret);
        break;
      case 'BITGET':
      case 'MEXC':
        return NextResponse.json(
          { success: false, error: `${exchange} balance not yet implemented` },
          { status: 501 }
        );
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported exchange: ${exchange}` },
          { status: 400 }
        );
    }

    if (!balance) {
      return NextResponse.json(
        { success: false, error: `Failed to retrieve balance from ${exchange}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    console.error('[API] Error getting exchange balance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get balance' },
      { status: 500 }
    );
  }
}

/**
 * Get BingX balance
 */
async function getBingXBalance(apiKey: string, apiSecret: string): Promise<ExchangeBalance | null> {
  try {
    const bingx = new BingXService({
      apiKey,
      apiSecret,
      enableRateLimit: false,
    });

    const accountInfo = await bingx.getBalance();

    console.log(`[BingX] Balance retrieved:`, {
      balance: accountInfo.balance,
      availableMargin: accountInfo.availableMargin,
      usedMargin: accountInfo.usedMargin,
    });

    return {
      exchange: 'BINGX',
      totalBalance: accountInfo.balance || '0',
      availableBalance: accountInfo.availableMargin || '0',
      usedBalance: accountInfo.usedMargin || '0',
      currency: 'USDT',
    };
  } catch (error: any) {
    console.error('[BingX] Error getting balance:', error.message);
    throw error;
  }
}

/**
 * Get Bybit balance
 */
async function getBybitBalance(apiKey: string, apiSecret: string): Promise<ExchangeBalance | null> {
  try {
    const bybit = new BybitService({
      apiKey,
      apiSecret,
      enableRateLimit: false,
    });

    // Get unified account balance (for USDT perpetual contracts)
    const walletBalance = await bybit.getWalletBalance('UNIFIED', 'USDT');

    if (!walletBalance || !walletBalance.list || walletBalance.list.length === 0) {
      throw new Error('No wallet balance data returned from Bybit');
    }

    const account = walletBalance.list[0];
    const usdtCoin = account.coin?.find((c: any) => c.coin === 'USDT');

    if (!usdtCoin) {
      console.warn('[Bybit] No USDT balance found, returning zero balance');
      return {
        exchange: 'BYBIT',
        totalBalance: '0',
        availableBalance: '0',
        usedBalance: '0',
        currency: 'USDT',
      };
    }

    console.log(`[Bybit] Balance retrieved:`, {
      walletBalance: usdtCoin.walletBalance,
      availableToWithdraw: usdtCoin.availableToWithdraw,
      equity: usdtCoin.equity,
    });

    return {
      exchange: 'BYBIT',
      totalBalance: usdtCoin.walletBalance || '0',
      availableBalance: usdtCoin.availableToWithdraw || '0',
      usedBalance: (parseFloat(usdtCoin.walletBalance || '0') - parseFloat(usdtCoin.availableToWithdraw || '0')).toFixed(2),
      currency: 'USDT',
    };
  } catch (error: any) {
    console.error('[Bybit] Error getting balance:', error.message);
    throw error;
  }
}

/**
 * Get Gate.io balance
 */
async function getGateIOBalance(apiKey: string, apiSecret: string): Promise<ExchangeBalance | null> {
  try {
    console.log('[Gate.io] Fetching balance...');

    // Create Gate.io exchange instance using CCXT
    const exchange = new ccxt.gate({
      apiKey,
      secret: apiSecret,
      enableRateLimit: true,
    });

    // Fetch USDT perpetual futures balance
    // Gate.io uses 'swap' market type for perpetual futures
    const balance = await exchange.fetchBalance({ type: 'swap' });

    console.log('[Gate.io] Balance data received:', {
      total: balance.total,
      free: balance.free,
      used: balance.used,
    });

    // Extract USDT balance
    const usdtTotal = balance.total?.USDT || 0;
    const usdtFree = balance.free?.USDT || 0;
    const usdtUsed = balance.used?.USDT || 0;

    console.log(`[Gate.io] USDT Balance:`, {
      total: usdtTotal,
      free: usdtFree,
      used: usdtUsed,
    });

    return {
      exchange: 'GATEIO',
      totalBalance: usdtTotal.toString(),
      availableBalance: usdtFree.toString(),
      usedBalance: usdtUsed.toString(),
      currency: 'USDT',
    };
  } catch (error: any) {
    console.error('[Gate.io] Error getting balance:', error.message);
    throw error;
  }
}
