import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { OpportunityDetectionService } from '@/services/triangular-arbitrage-opportunity.service';
import { ExchangeConnectorFactory } from '@/connectors/exchange.factory';
import { EncryptionService } from '@/lib/encryption';
import prisma from '@/lib/prisma';

/**
 * POST /api/triangular-arbitrage/scan/start
 * Start scanning for triangular arbitrage opportunities
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    const body = await request.json();

    // 🔍 DEBUG: Log the incoming request body
    console.log('🔍 [TriArb] Incoming POST request body:', JSON.stringify(body, null, 2));

    const {
      exchange = 'BYBIT',
      credentialId,
      minProfitPercentage = 0.1,
      maxSlippage = 0.1,
      positionSize = 100,
      autoExecute = false,
    } = body;

    console.log('🔍 [TriArb] Parsed exchange value:', exchange);

    // Get credentials - either from provided ID or auto-select active credential
    let credentials;
    if (credentialId) {
      // Use provided credential ID
      credentials = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credentials || credentials.userId !== userId) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 400 }
        );
      }
    } else {
      // Auto-select active credential for this exchange
      credentials = await prisma.exchangeCredentials.findFirst({
        where: {
          userId: userId,
          exchange: exchange,
          isActive: true,
        },
      });

      if (!credentials) {
        return NextResponse.json(
          { error: `No active ${exchange} credentials found. Please add exchange credentials first.` },
          { status: 400 }
        );
      }
    }

    // Decrypt API credentials (they're stored encrypted in database)
    const decryptedApiKey = EncryptionService.decrypt(credentials.apiKey);
    const decryptedApiSecret = EncryptionService.decrypt(credentials.apiSecret);

    console.log(`[TriArb] Decrypted credentials for ${exchange}:`, {
      encryptedKeyLength: credentials.apiKey.length,
      decryptedKeyLength: decryptedApiKey.length,
      decryptedKeyPrefix: decryptedApiKey.substring(0, 10) + '...',
      encryptedSecretLength: credentials.apiSecret.length,
      decryptedSecretLength: decryptedApiSecret.length,
    });

    // Get tradable symbols based on exchange type
    let symbols: string[];
    let connector: any; // Store connector for reuse
    const exchangeUpper = exchange.toUpperCase();

    if (exchangeUpper === 'BYBIT') {
      // Bybit: Use custom connector for perpetual futures
      connector = ExchangeConnectorFactory.create(
        exchange,
        decryptedApiKey,
        decryptedApiSecret,
        userId,
        credentials.id
      );
      await connector.initialize();

      const symbolsInfo = await connector.getInstrumentsInfo({ category: 'linear' });
      symbols = symbolsInfo.list
        .filter((s: any) => s.status === 'Trading')
        .map((s: any) => s.symbol);
      console.log(`[TriArb] Found ${symbols.length} tradable symbols on Bybit linear`);
    } else if (exchangeUpper === 'BINGX') {
      // BingX Spot: Use native BingX Spot connector (CCXT has bugs with BingX)
      console.log(`[TriArb] Creating native BingX Spot connector`);

      const { BingXSpotConnector } = await import('@/connectors/bingx-spot.connector');

      connector = new BingXSpotConnector(
        decryptedApiKey,
        decryptedApiSecret,
        userId,
        credentials.id
      );

      await connector.initialize();
      const allSymbols = await connector.getTradableSymbols();

      // BingX returns symbols in hyphenated format (BTC-USDT)
      // Convert to standard format (BTCUSDT) for triangle detection
      symbols = allSymbols;
      console.log(`[TriArb] Found ${symbols.length} tradable symbols on BingX Spot`);
    } else if (['BINANCE', 'MEXC', 'GATE', 'GATEIO'].includes(exchangeUpper)) {
      // Spot exchanges: Use CCXT connector for spot trading
      console.log(`[TriArb] Creating CCXT connector for ${exchange} spot market`);

      // Import CCXT connector directly for spot trading
      const { CCXTExchangeConnector } = await import('@/connectors/ccxt-exchange.connector');

      // Map exchange names to CCXT IDs
      const ccxtId = exchangeUpper === 'GATEIO' || exchangeUpper === 'GATE' ? 'gate' : exchange.toLowerCase();

      connector = new CCXTExchangeConnector(
        ccxtId,
        decryptedApiKey,
        decryptedApiSecret,
        false, // testnet
        userId,
        credentials.id,
        'spot' // Use spot market for triangular arbitrage
      );

      await connector.initialize();
      const allSymbols = await connector.getTradableSymbols();

      // Convert from CCXT format (BTC/USDT) to standard format (BTCUSDT)
      symbols = allSymbols.map((s: string) => s.replace('/', ''));
      console.log(`[TriArb] Found ${symbols.length} tradable symbols on ${exchange} Spot`);
    } else {
      throw new Error(`Exchange "${exchange}" is not supported for triangular arbitrage yet. Supported: BYBIT (futures), BINANCE, MEXC, BINGX, GATE.IO (spot)`);
    }

    // Create scanner instance (now supports multiple exchanges per user)
    const scanner = OpportunityDetectionService.getInstance(userId, exchange, {
      userId: userId,
      exchange,
      credentialId,
      minProfitPercent: minProfitPercentage,
      maxSlippagePercent: maxSlippage,
      positionSize,
      autoExecute,
      makerFeeRate: credentials.makerFeeRate || 0.0001,
      takerFeeRate: credentials.takerFeeRate || 0.0006,
      connector, // Pass connector for reuse in execution
    });

    // Start scanning
    await scanner.start(symbols);

    const status = scanner.getStatus();

    // Verify scanner is in the Map
    const allScannersForUser = OpportunityDetectionService.getAllInstancesForUser(userId);
    console.log(`[TriArb] Scanner created - Verification:`, {
      userId,
      exchange,
      scannersInMap: allScannersForUser.length,
      scannerExchanges: allScannersForUser.map(s => s.getConfig().exchange),
    });

    return NextResponse.json({
      success: true,
      scanId: `scan_${userId}_${Date.now()}`,
      status: 'running',
      config: {
        exchange,
        minProfitPercent: minProfitPercentage,
        maxSlippagePercent: maxSlippage,
        autoExecute,
        trianglesCount: status.stats.trianglesMonitored,
      },
      message: 'Scanner started successfully',
    });
  } catch (error: any) {
    console.error('[TriArb] Error starting scanner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start scanner' },
      { status: 500 }
    );
  }
}
