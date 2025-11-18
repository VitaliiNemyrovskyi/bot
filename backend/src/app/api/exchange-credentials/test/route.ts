import { NextRequest, NextResponse } from 'next/server';
import { RestClientV5 } from 'bybit-api';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import ccxt from 'ccxt';

/**
 * POST /api/exchange-credentials/test
 * Test exchange API credentials without saving them
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exchange, apiKey, apiSecret, authToken, passphrase } = body;

    // Validate required fields
    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Exchange, API key, and API secret are required',
        },
        { status: 400 }
      );
    }

    // Mainnet only (testnet support removed)

    // Test credentials based on exchange type
    if (exchange.toUpperCase() === 'BYBIT') {
      // Test Bybit credentials
      const client = new RestClientV5({
        key: apiKey,
        secret: apiSecret,
      });

      try {
        // Test by calling getQueryApiKey endpoint
        const response = await client.getQueryApiKey();

        if (response.retCode !== 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: response.retMsg || 'Failed to validate API keys with Bybit',
              code: 'VALIDATION_FAILED',
            },
            { status: 400 }
          );
        }

        // Extract permissions
        const result = response.result as any;
        const permissions: string[] = [];
        if (result.permissions) {
          Object.entries(result.permissions).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              permissions.push(...value.map(v => `${key}:${v}`));
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          data: {
            exchange: 'BYBIT',
            accountType: result.unified === 1 ? 'UNIFIED' : 'CLASSIC',
            permissions,
            vipLevel: result.vipLevel,
            readOnly: result.readOnly === 1,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Bybit API validation error:', error);

        // Handle Bybit-specific errors
        if (error.code === 401 || error.message?.includes('Invalid')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'BINANCE') {
      // Test Binance credentials using CCXT
      try {
        const binanceExchange = new ccxt.binance({
          apiKey,
          secret: apiSecret,
          enableRateLimit: true,
          options: {
            defaultType: 'future',  // Use USDⓈ-M Futures
            adjustForTimeDifference: true,
          },
        });

        // Test by fetching balance - this will validate the credentials
        const balance = await binanceExchange.fetchBalance();

        // Extract USDT balance info
        const usdtTotal = (balance as any).total?.USDT || 0;
        const usdtFree = (balance as any).free?.USDT || 0;

        console.log('[BINANCE] Credentials validated successfully');

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            totalBalance: usdtTotal.toString(),
            availableBalance: usdtFree.toString(),
            currency: 'USDT',
            accountType: 'futures',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Binance API validation error:', error);

        // Handle Binance-specific errors
        const errorMsg = error.message || '';

        if (errorMsg.includes('Invalid API-key') || errorMsg.includes('Signature') || errorMsg.includes('Authentication')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'OKX') {
      // Validate OKX requires passphrase
      if (!passphrase || passphrase.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing passphrase',
            message: 'OKX requires a passphrase. Please provide your OKX API passphrase.',
            code: 'MISSING_PASSPHRASE',
          },
          { status: 400 }
        );
      }

      // Test OKX credentials
      try {
        const okxExchange = new ccxt.okx({
          apiKey,
          secret: apiSecret,
          password: passphrase.trim(),
          enableRateLimit: true,
          options: {
            defaultType: 'swap',  // USDT perpetual swaps
          },
        });

        // Test by fetching balance - this will validate the credentials
        const balance = await okxExchange.fetchBalance({ type: 'swap' });

        // Extract USDT balance info
        const usdtTotal = (balance as any).total?.USDT || 0;
        const usdtFree = (balance as any).free?.USDT || 0;

        console.log('[OKX] Credentials validated successfully');

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            totalBalance: usdtTotal.toString(),
            availableBalance: usdtFree.toString(),
            currency: 'USDT',
            accountType: 'swap',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('OKX API validation error:', error);

        // Handle OKX-specific errors
        const errorMsg = error.message || '';

        if (errorMsg.includes('Invalid API Key') || errorMsg.includes('Invalid sign') || errorMsg.includes('Authentication')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key, secret, or passphrase is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('Passphrase')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid passphrase',
              message: 'The provided passphrase is incorrect',
              code: 'INVALID_PASSPHRASE',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'BINGX') {
      // Test BingX credentials
      const bingxService = new BingXService({
        apiKey,
        apiSecret,
        enableRateLimit: true,
      });

      try {
        // CRITICAL: Sync time with BingX server before making authenticated requests
        // BingX requires accurate timestamps to prevent signature verification failures
        await bingxService.syncTime();

        // Test by calling getBalance endpoint (V3 API)
        const balance = await bingxService.getBalance();

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            balance: balance.balance,
            equity: balance.equity,
            availableMargin: balance.availableMargin,
            asset: balance.asset,
            accountType: 'futures',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('BingX API validation error:', error);

        // Handle BingX-specific errors
        if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'MEXC') {
      // Test MEXC credentials
      const mexcService = new MEXCService({
        apiKey,
        apiSecret,
        authToken,
        enableRateLimit: true,
      });

      try {
        // Test by calling getAccountInfo endpoint
        const accountInfo = await mexcService.getAccountInfo();

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            currency: accountInfo.currency,
            equity: accountInfo.equity,
            availableBalance: accountInfo.availableBalance,
            cashBalance: accountInfo.cashBalance,
            unrealized: accountInfo.unrealized,
            accountType: 'futures',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('MEXC API validation error:', error);

        // Handle MEXC-specific errors
        if (error.message?.includes('602') || error.message?.includes('invalid') || error.message?.includes('Invalid')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'GATEIO') {
      // Test Gate.io credentials using CCXT
      try {
        const gateioExchange = new ccxt.gate({
          apiKey,
          secret: apiSecret,
          enableRateLimit: true,
        });

        // Test by fetching balance - this will validate the credentials
        const balance = await gateioExchange.fetchBalance({ type: 'swap' });

        // Extract USDT balance info
        const usdtTotal = (balance as any).total?.USDT || 0;
        const usdtFree = (balance as any).free?.USDT || 0;

        console.log('[GATEIO] Credentials validated successfully');

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            totalBalance: usdtTotal.toString(),
            availableBalance: usdtFree.toString(),
            currency: 'USDT',
            accountType: 'swap',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Gate.io API validation error:', error);

        // Handle Gate.io-specific errors
        const errorMsg = error.message || '';

        if (errorMsg.includes('USER_NOT_FOUND') || errorMsg.includes('please transfer funds first')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Futures account not activated',
              message: 'Gate.io futures account not activated. Please transfer funds to your Gate.io futures account first to activate it.',
              code: 'ACCOUNT_NOT_ACTIVATED',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('Invalid') || errorMsg.includes('Authentication')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'BITGET') {
      // Validate Bitget requires passphrase
      if (!passphrase || passphrase.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing passphrase',
            message: 'Bitget requires a passphrase. Please provide your Bitget API passphrase.',
            code: 'MISSING_PASSPHRASE',
          },
          { status: 400 }
        );
      }

      // Test Bitget credentials using CCXT
      try {
        const bitgetExchange = new ccxt.bitget({
          apiKey,
          secret: apiSecret,
          password: passphrase.trim(),
          enableRateLimit: true,
          options: {
            defaultType: 'swap',  // USDT perpetual swaps
          },
        });

        // Test by fetching balance - this will validate the credentials
        const balance = await bitgetExchange.fetchBalance({ type: 'swap' });

        // Extract USDT balance info
        const usdtTotal = (balance as any).total?.USDT || 0;
        const usdtFree = (balance as any).free?.USDT || 0;

        console.log('[BITGET] Credentials validated successfully');

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            totalBalance: usdtTotal.toString(),
            availableBalance: usdtFree.toString(),
            currency: 'USDT',
            accountType: 'swap',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Bitget API validation error:', error);

        // Handle Bitget-specific errors
        const errorMsg = error.message || '';

        if (errorMsg.includes('Invalid') || errorMsg.includes('Authentication') || errorMsg.includes('Signature')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'KUCOIN') {
      // Validate KuCoin requires passphrase
      if (!passphrase || passphrase.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing passphrase',
            message: 'KuCoin requires a passphrase. Please provide your KuCoin API passphrase.',
            code: 'MISSING_PASSPHRASE',
          },
          { status: 400 }
        );
      }

      // Test KuCoin credentials using custom connector
      try {
        console.log('[KUCOIN] Testing KuCoin credentials with custom connector...');
        console.log('[KUCOIN] API Key:', apiKey.substring(0, 8) + '...');
        console.log('[KUCOIN] Passphrase length:', passphrase.trim().length);

        // Use ExchangeConnectorFactory to create KuCoin connector
        const { ExchangeConnectorFactory } = await import('@/connectors/exchange.factory');

        const kucoinConnector = ExchangeConnectorFactory.create(
          'KUCOIN',
          apiKey,
          apiSecret,
          undefined, // userId
          undefined, // credentialId
          passphrase // authToken (passphrase for KuCoin)
        );

        // Initialize connector
        console.log('[KUCOIN] Initializing connector...');
        await kucoinConnector.initialize();

        // Fetch balance to validate credentials
        console.log('[KUCOIN] Fetching balance...');
        const balance = await kucoinConnector.getBalance();

        console.log('[KUCOIN] Balance response:', JSON.stringify(balance, null, 2));

        // Extract USDT balance info
        const usdtTotal = (balance as any).total?.USDT || 0;
        const usdtFree = (balance as any).free?.USDT || 0;

        console.log('[KUCOIN] Credentials validated successfully');
        console.log('[KUCOIN] USDT Total:', usdtTotal, 'Free:', usdtFree);

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          accountPreview: {
            totalBalance: usdtTotal.toString(),
            availableBalance: usdtFree.toString(),
            currency: 'USDT',
            accountType: 'spot',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('KuCoin API validation error:', error);
        console.error('KuCoin error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });

        // Handle KuCoin-specific errors
        const errorMsg = error.message || '';

        // KuCoin error codes: https://docs.kucoin.com/#error-codes
        if (errorMsg.includes('400000') || errorMsg.includes('KC-API-KEY-INVALID')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API Key',
              message: 'The provided API key is invalid or does not exist',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('400001') || errorMsg.includes('KC-API-SIGN-INVALID') || errorMsg.includes('Signature')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid signature',
              message: 'The API secret or passphrase is invalid. Please check your credentials.',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('400002') || errorMsg.includes('KC-API-PASSPHRASE') || errorMsg.includes('Passphrase') || errorMsg.includes('passphrase')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid passphrase',
              message: 'The provided passphrase is incorrect',
              code: 'INVALID_PASSPHRASE',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('400003') || errorMsg.includes('KC-API-KEY-EXPIRED')) {
          return NextResponse.json(
            {
              success: false,
              error: 'API Key expired',
              message: 'Your API key has expired. Please generate a new one.',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('400004') || errorMsg.includes('KC-API-PERMISSION')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions',
              message: 'Your API key does not have the required permissions. Please enable "General" and "Trade" permissions.',
              code: 'INSUFFICIENT_PERMISSIONS',
            },
            { status: 400 }
          );
        }

        if (errorMsg.includes('Invalid') || errorMsg.includes('Authentication')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key, secret, or passphrase is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported exchange',
          message: `Exchange ${exchange} is not supported`,
          code: 'UNSUPPORTED_EXCHANGE',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error testing exchange credentials:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to test credentials',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
