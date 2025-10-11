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

async function main() {
  console.log('\n🔍 URGENT: Checking for HYPERUSDT positions\n');
  console.log('='.repeat(70));

  try {
    // Get credentials
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
      console.error('❌ Missing credentials');
      return;
    }

    // Check MEXC for HYPERUSDT position
    console.log('\n📊 Checking MEXC for HYPERUSDT position...\n');
    try {
      const mexcService = new MEXCService({
        apiKey: mexcCreds.apiKey,
        apiSecret: mexcCreds.apiSecret,
        authToken: mexcCreds.authToken,
        testnet: mexcCreds.environment === 'TESTNET',
        enableRateLimit: true
      });

      const mexcPositions = await mexcService.getPositions();
      const hyperPosition = mexcPositions.find(p => p.symbol === 'HYPER_USDT');

      if (hyperPosition) {
        const holdVol = parseFloat(hyperPosition.holdVol);
        if (holdVol > 0) {
          console.log('🚨 CRITICAL: HYPERUSDT POSITION FOUND ON MEXC!\n');
          console.log(`  Symbol: ${hyperPosition.symbol}`);
          console.log(`  Side: ${hyperPosition.positionType === 1 ? 'LONG' : 'SHORT'}`);
          console.log(`  Size: ${holdVol}`);
          console.log(`  Entry Price: ${hyperPosition.holdAvgPrice}`);
          console.log(`  Unrealized PnL: ${hyperPosition.realised}`);
          console.log(`  Leverage: ${hyperPosition.leverage}x`);
          console.log(`  Position ID: ${hyperPosition.positionId}`);
        } else {
          console.log('✅ No HYPERUSDT position on MEXC (size is 0)');
        }
      } else {
        console.log('✅ No HYPERUSDT position on MEXC');
      }
    } catch (error: any) {
      console.error('❌ Error checking MEXC:', error.message);
    }

    // Check Bybit for HYPERUSDT position
    console.log('\n📊 Checking Bybit for HYPERUSDT position...\n');
    try {
      const bybitService = new BybitService({
        apiKey: bybitCreds.apiKey,
        apiSecret: bybitCreds.apiSecret,
        testnet: bybitCreds.environment === 'TESTNET',
        enableRateLimit: true
      });

      const bybitPositions = await bybitService.getPositions('linear');
      const hyperPosition = bybitPositions.find(p => p.symbol === 'HYPERUSDT');

      if (hyperPosition) {
        const size = parseFloat(hyperPosition.size);
        if (size > 0) {
          console.log('🚨 CRITICAL: HYPERUSDT POSITION FOUND ON BYBIT!\n');
          console.log(`  Symbol: ${hyperPosition.symbol}`);
          console.log(`  Side: ${hyperPosition.side}`);
          console.log(`  Size: ${size}`);
          console.log(`  Entry Price: ${hyperPosition.entryPrice}`);
          console.log(`  Mark Price: ${hyperPosition.markPrice}`);
          console.log(`  Unrealized PnL: ${hyperPosition.unrealisedPnl}`);
        } else {
          console.log('✅ No HYPERUSDT position on Bybit (size is 0)');
        }
      } else {
        console.log('✅ No HYPERUSDT position on Bybit');
      }
    } catch (error: any) {
      console.error('❌ Error checking Bybit:', error.message);
    }

    // Check the subscription status
    console.log('\n📋 Checking ACTIVE subscription status...\n');
    const activeSub = await prisma.fundingArbitrageSubscription.findFirst({
      where: {
        symbol: 'HYPERUSDT',
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (activeSub) {
      console.log(`ID: ${activeSub.id}`);
      console.log(`Symbol: ${activeSub.symbol}`);
      console.log(`Primary: ${activeSub.primaryExchange} (should open on MEXC)`);
      console.log(`Hedge: ${activeSub.hedgeExchange} (should open on BYBIT)`);
      console.log(`Status: ${activeSub.status}`);
      console.log(`Created: ${activeSub.createdAt}`);
      console.log(`Executed: ${activeSub.executedAt || 'Not executed'}`);
      console.log(`Entry Price: ${activeSub.entryPrice || 'N/A'}`);
      console.log(`Hedge Entry Price: ${activeSub.hedgeEntryPrice || 'N/A'}`);
      console.log(`Error: ${activeSub.errorMessage || 'None'}`);
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Check complete\n');
}

main().catch(console.error);
