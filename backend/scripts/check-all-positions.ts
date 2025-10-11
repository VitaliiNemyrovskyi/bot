import { MEXCService } from '../src/lib/mexc';
import { BybitService } from '../src/lib/bybit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:aA0972454850!@localhost:5432/auth_app_local'
    }
  }
});

interface PositionInfo {
  exchange: string;
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice?: number;
  unrealizedPnl?: number;
  leverage?: number;
}

async function main() {
  console.log('\n🔍 CRITICAL: Checking for unhedged positions across exchanges\n');
  console.log('='.repeat(70));

  try {
    // Get admin credentials from database
    const mexcCreds = await prisma.exchangeCredentials.findFirst({
      where: {
        userId: 'admin_1',
        exchange: 'MEXC',
        isActive: true
      }
    });

    const bybitCreds = await prisma.exchangeCredentials.findFirst({
      where: {
        userId: 'admin_1',
        exchange: 'BYBIT',
        isActive: true
      }
    });

    if (!mexcCreds || !bybitCreds) {
      console.error('❌ Missing credentials for MEXC or Bybit');
      return;
    }

    const allPositions: PositionInfo[] = [];

    // Check MEXC positions
    console.log('\n📊 Checking MEXC Positions...\n');
    try {
      const mexcService = new MEXCService({
        apiKey: mexcCreds.apiKey,
        apiSecret: mexcCreds.apiSecret,
        authToken: mexcCreds.authToken,
        testnet: mexcCreds.environment === 'TESTNET',
        enableRateLimit: true
      });

      const mexcPositions = await mexcService.getPositions();

      if (mexcPositions.length === 0) {
        console.log('✅ No open positions on MEXC');
      } else {
        console.log(`⚠️  Found ${mexcPositions.length} open positions on MEXC:\n`);

        for (const pos of mexcPositions) {
          const holdVol = parseFloat(pos.holdVol);
          if (holdVol > 0) {
            const posInfo: PositionInfo = {
              exchange: 'MEXC',
              symbol: pos.symbol,
              side: pos.positionType === 1 ? 'LONG' : 'SHORT',
              size: holdVol,
              entryPrice: parseFloat(pos.holdAvgPrice),
              unrealizedPnl: parseFloat(pos.realised),
              leverage: pos.leverage
            };
            allPositions.push(posInfo);

            console.log(`  Symbol: ${pos.symbol}`);
            console.log(`  Side: ${posInfo.side}`);
            console.log(`  Size: ${holdVol}`);
            console.log(`  Entry Price: ${pos.holdAvgPrice}`);
            console.log(`  Unrealized PnL: ${pos.realised}`);
            console.log(`  Leverage: ${pos.leverage}x`);
            console.log(`  Position ID: ${pos.positionId}`);
            console.log(`  ---`);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error checking MEXC positions:', error.message);
    }

    // Check Bybit positions
    console.log('\n📊 Checking Bybit Positions...\n');
    try {
      const bybitService = new BybitService({
        apiKey: bybitCreds.apiKey,
        apiSecret: bybitCreds.apiSecret,
        testnet: bybitCreds.environment === 'TESTNET',
        enableRateLimit: true
      });

      const bybitPositions = await bybitService.getPositions('linear');

      if (bybitPositions.length === 0) {
        console.log('✅ No open positions on Bybit');
      } else {
        console.log(`⚠️  Found ${bybitPositions.length} open positions on Bybit:\n`);

        for (const pos of bybitPositions) {
          const size = parseFloat(pos.size);
          if (size > 0) {
            const posInfo: PositionInfo = {
              exchange: 'BYBIT',
              symbol: pos.symbol,
              side: pos.side,
              size: size,
              entryPrice: parseFloat(pos.entryPrice),
              markPrice: parseFloat(pos.markPrice),
              unrealizedPnl: parseFloat(pos.unrealisedPnl),
              leverage: parseFloat((pos as any).leverage || '1')
            };
            allPositions.push(posInfo);

            console.log(`  Symbol: ${pos.symbol}`);
            console.log(`  Side: ${pos.side}`);
            console.log(`  Size: ${size}`);
            console.log(`  Entry Price: ${pos.entryPrice}`);
            console.log(`  Mark Price: ${pos.markPrice}`);
            console.log(`  Unrealized PnL: ${pos.unrealisedPnl}`);
            console.log(`  Leverage: ${posInfo.leverage}x`);
            console.log(`  ---`);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error checking Bybit positions:', error.message);
      console.error('Stack:', error.stack);
    }

    // Analyze for unhedged positions
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 Analysis: Checking for Unhedged Positions\n');

    if (allPositions.length === 0) {
      console.log('✅ No positions found on either exchange - all clear!');
    } else {
      // Group by symbol
      const symbolGroups = new Map<string, PositionInfo[]>();

      for (const pos of allPositions) {
        // Normalize symbol format (MEXC uses BTC_USDT, Bybit uses BTCUSDT)
        const normalizedSymbol = pos.symbol.replace('_', '');

        if (!symbolGroups.has(normalizedSymbol)) {
          symbolGroups.set(normalizedSymbol, []);
        }
        symbolGroups.get(normalizedSymbol)!.push(pos);
      }

      let unhedgedFound = false;

      for (const [symbol, positions] of symbolGroups.entries()) {
        if (positions.length === 1) {
          // Only one position - UNHEDGED!
          console.log(`\n🚨 CRITICAL: UNHEDGED POSITION DETECTED!\n`);
          const pos = positions[0];
          console.log(`  Exchange: ${pos.exchange}`);
          console.log(`  Symbol: ${pos.symbol}`);
          console.log(`  Side: ${pos.side}`);
          console.log(`  Size: ${pos.size}`);
          console.log(`  Entry Price: ${pos.entryPrice}`);
          console.log(`  Unrealized PnL: ${pos.unrealizedPnl || 'N/A'}`);
          console.log(`\n  ⚠️  ACTION REQUIRED: Close this position immediately!`);
          console.log(`  Close via ${pos.exchange} web interface or API`);
          unhedgedFound = true;
        } else if (positions.length === 2) {
          // Two positions - check if properly hedged
          const mexcPos = positions.find(p => p.exchange === 'MEXC');
          const bybitPos = positions.find(p => p.exchange === 'BYBIT');

          if (mexcPos && bybitPos) {
            // Check if sides are opposite
            const isProperlyHedged =
              (mexcPos.side === 'LONG' && bybitPos.side === 'Sell') ||
              (mexcPos.side === 'SHORT' && bybitPos.side === 'Buy');

            if (isProperlyHedged) {
              console.log(`\n✅ ${symbol}: Properly hedged`);
              console.log(`  MEXC: ${mexcPos.side} ${mexcPos.size}`);
              console.log(`  Bybit: ${bybitPos.side} ${bybitPos.size}`);
            } else {
              console.log(`\n⚠️  ${symbol}: BOTH POSITIONS ON SAME SIDE!`);
              console.log(`  MEXC: ${mexcPos.side} ${mexcPos.side} ${mexcPos.size}`);
              console.log(`  Bybit: ${bybitPos.side} ${bybitPos.size}`);
              console.log(`  This is NOT a hedge - close one side!`);
              unhedgedFound = true;
            }
          }
        }
      }

      if (!unhedgedFound) {
        console.log('\n✅ All positions appear to be properly hedged');
      }
    }

    // Check subscriptions in ERROR status
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 Checking Subscriptions in ERROR Status\n');

    const errorSubs = await prisma.fundingArbitrageSubscription.findMany({
      where: {
        status: 'ERROR'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    if (errorSubs.length === 0) {
      console.log('✅ No subscriptions in ERROR status');
    } else {
      console.log(`Found ${errorSubs.length} subscriptions in ERROR status:\n`);

      for (const sub of errorSubs) {
        console.log(`  ID: ${sub.id.substring(0, 20)}...`);
        console.log(`  Symbol: ${sub.symbol}`);
        console.log(`  Primary Exchange: ${sub.primaryExchange}`);
        console.log(`  Hedge Exchange: ${sub.hedgeExchange}`);
        console.log(`  Executed At: ${sub.executedAt || 'Not executed'}`);
        console.log(`  Error: ${sub.errorMessage}`);
        console.log(`  Updated: ${sub.updatedAt}`);
        console.log(`  ---`);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Position check complete\n');
}

main().catch(console.error);
