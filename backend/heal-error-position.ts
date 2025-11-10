/**
 * Script to heal ERROR status positions by:
 * 1. Checking if positions actually exist on exchanges
 * 2. Fetching current entry prices
 * 3. Setting up TP/SL
 * 4. Updating status to ACTIVE
 */

import prisma from './src/lib/prisma';
import { BybitService } from './src/lib/bybit';
import { BingXService } from './src/lib/bingx';
import { EncryptionService } from './src/lib/encryption';

interface ExchangePosition {
  symbol: string;
  side: 'Buy' | 'Sell';
  size: number;
  entryPrice: number;
  leverage: number;
}

async function getBybitPosition(
  symbol: string,
  apiKey: string,
  apiSecret: string
): Promise<ExchangePosition | null> {
  try {
    const bybit = new BybitService({ apiKey, apiSecret });
    // Get positions for specific symbol
    const positions = await bybit.getPositions('linear', symbol);

    const position = positions.find(
      (p: any) => p.symbol === symbol && parseFloat(p.size) > 0
    );

    if (!position) return null;

    return {
      symbol: position.symbol,
      side: position.side,
      size: parseFloat(position.size),
      entryPrice: parseFloat(position.avgPrice || position.entryPrice || '0'),
      leverage: parseFloat(position.leverage || '1'),
    };
  } catch (error) {
    console.error('Error fetching Bybit position:', error);
    return null;
  }
}

async function getBingXPosition(
  symbol: string,
  apiKey: string,
  apiSecret: string
): Promise<ExchangePosition | null> {
  try {
    const bingx = new BingXService({ apiKey, apiSecret });
    const positions = await bingx.getPositions();

    const position = positions.find(
      (p: any) => p.symbol === symbol && parseFloat(p.positionAmt) !== 0
    );

    if (!position) return null;

    const size = Math.abs(parseFloat(position.positionAmt));
    const side = parseFloat(position.positionAmt) > 0 ? 'Buy' : 'Sell';

    return {
      symbol: position.symbol,
      side,
      size,
      entryPrice: parseFloat(position.avgPrice || '0'),
      leverage: parseFloat(position.leverage || '1'),
    };
  } catch (error) {
    console.error('Error fetching BingX position:', error);
    return null;
  }
}

async function setBybitTPSL(
  symbol: string,
  side: 'Buy' | 'Sell',
  takeProfit: number,
  stopLoss: number,
  apiKey: string,
  apiSecret: string
): Promise<boolean> {
  try {
    const bybit = new BybitService({ apiKey, apiSecret });
    await bybit.setTradingStop({
      symbol,
      positionIdx: 0, // One-way mode
      takeProfit: takeProfit.toFixed(6),
      stopLoss: stopLoss.toFixed(6),
    });
    return true;
  } catch (error) {
    console.error('Error setting Bybit TP/SL:', error);
    return false;
  }
}

async function setBingXTPSL(
  symbol: string,
  side: 'Buy' | 'Sell',
  takeProfit: number,
  stopLoss: number,
  apiKey: string,
  apiSecret: string
): Promise<boolean> {
  try {
    const bingx = new BingXService({ apiKey, apiSecret });
    // BingX might not have setTradingStop method, try it anyway
    if (typeof (bingx as any).setTradingStop === 'function') {
      await (bingx as any).setTradingStop({
        symbol,
        takeProfit: takeProfit.toFixed(6),
        stopLoss: stopLoss.toFixed(6),
      });
      return true;
    } else {
      console.log('   BingX does not support setTradingStop - skipping');
      return false;
    }
  } catch (error) {
    console.error('Error setting BingX TP/SL:', error);
    return false;
  }
}

async function healPosition(positionId: string) {
  console.log(`\n🔧 Healing position: ${positionId}\n`);

  // 1. Find the position in database
  const position = await prisma.graduatedEntryPosition.findUnique({
    where: { positionId },
    include: { user: true },
  });

  if (!position) {
    console.error('❌ Position not found in database');
    return;
  }

  console.log(`Symbol: ${position.symbol}`);
  console.log(`Primary: ${position.primaryExchange} (${position.primarySide})`);
  console.log(`Hedge: ${position.hedgeExchange} (${position.hedgeSide})`);
  console.log(`Current Status: ${position.status}`);
  console.log(`Error: ${position.errorMessage}\n`);

  // 2. Get exchange credentials
  const primaryCreds = await prisma.exchangeCredentials.findFirst({
    where: {
      userId: position.userId,
      exchange: position.primaryExchange,
    },
  });

  const hedgeCreds = await prisma.exchangeCredentials.findFirst({
    where: {
      userId: position.userId,
      exchange: position.hedgeExchange,
    },
  });

  if (!primaryCreds || !hedgeCreds) {
    console.error('❌ Exchange credentials not found');
    return;
  }

  // Validate credentials are not null
  if (!primaryCreds.apiKey || !primaryCreds.apiSecret) {
    console.error(`❌ Invalid ${position.primaryExchange} credentials (apiKey or apiSecret is null)`);
    return;
  }
  if (!hedgeCreds.apiKey || !hedgeCreds.apiSecret) {
    console.error(`❌ Invalid ${position.hedgeExchange} credentials (apiKey or apiSecret is null)`);
    return;
  }

  // Decrypt credentials
  console.log('🔓 Decrypting API credentials...');
  const primaryApiKey = EncryptionService.decrypt(primaryCreds.apiKey);
  const primaryApiSecret = EncryptionService.decrypt(primaryCreds.apiSecret);
  const hedgeApiKey = EncryptionService.decrypt(hedgeCreds.apiKey);
  const hedgeApiSecret = EncryptionService.decrypt(hedgeCreds.apiSecret);

  console.log(`✓ Primary ${position.primaryExchange} credentials decrypted`);
  console.log(`✓ Hedge ${position.hedgeExchange} credentials decrypted\n`);

  // 3. Check positions on exchanges
  console.log('📊 Checking positions on exchanges...');

  let primaryPosition: ExchangePosition | null = null;
  let hedgePosition: ExchangePosition | null = null;

  if (position.primaryExchange === 'BYBIT') {
    primaryPosition = await getBybitPosition(
      position.symbol,
      primaryApiKey,
      primaryApiSecret
    );
  } else if (position.primaryExchange === 'BINGX') {
    // Normalize symbol for BingX (add hyphen: AIAUSDT -> AIA-USDT)
    const bingxSymbol = position.symbol.replace(/([A-Z]+)(USDT)$/, '$1-$2');
    console.log(`   BingX symbol: ${position.symbol} -> ${bingxSymbol}`);
    primaryPosition = await getBingXPosition(
      bingxSymbol,
      primaryApiKey,
      primaryApiSecret
    );
  }

  if (position.hedgeExchange === 'BYBIT') {
    hedgePosition = await getBybitPosition(
      position.symbol,
      hedgeApiKey,
      hedgeApiSecret
    );
  } else if (position.hedgeExchange === 'BINGX') {
    // Normalize symbol for BingX (add hyphen: AIAUSDT -> AIA-USDT)
    const bingxSymbol = position.symbol.replace(/([A-Z]+)(USDT)$/, '$1-$2');
    console.log(`   BingX symbol: ${position.symbol} -> ${bingxSymbol}`);
    hedgePosition = await getBingXPosition(
      bingxSymbol,
      hedgeApiKey,
      hedgeApiSecret
    );
  }

  if (!primaryPosition && !hedgePosition) {
    console.log('❌ No positions found on exchanges. Cannot heal.');
    console.log('   This position should be deleted instead.');
    return;
  }

  if (!primaryPosition || !hedgePosition) {
    console.log('⚠️  WARNING: Only one side of the position exists!');
    console.log(`   Primary (${position.primaryExchange}): ${primaryPosition ? '✓ Found' : '✗ Not found'}`);
    console.log(`   Hedge (${position.hedgeExchange}): ${hedgePosition ? '✓ Found' : '✗ Not found'}`);
    console.log('   This is dangerous - position is unhedged!');

    const answer = await new Promise<string>(resolve => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('   Continue anyway? (yes/no): ', (ans: string) => {
        rl.close();
        resolve(ans);
      });
    });

    if (answer.toLowerCase() !== 'yes') {
      console.log('Aborting heal process');
      return;
    }
  }

  console.log(`\n✓ Primary position: ${primaryPosition?.size} @ $${primaryPosition?.entryPrice}`);
  console.log(`✓ Hedge position: ${hedgePosition?.size} @ $${hedgePosition?.entryPrice}\n`);

  // 4. Calculate TP/SL levels
  // Use default values if not set in database
  const takeProfitPercent = position.takeProfitPercent || 1.5; // Default 1.5%
  const stopLossPercent = position.stopLossPercent || 3.0; // Default 3.0%

  console.log(`TP/SL percentages: TP=${takeProfitPercent}%, SL=${stopLossPercent}%`);

  let primaryTP = 0;
  let primarySL = 0;
  let hedgeTP = 0;
  let hedgeSL = 0;

  if (primaryPosition) {
    if (primaryPosition.side === 'Buy') {
      primaryTP = primaryPosition.entryPrice * (1 + takeProfitPercent / 100);
      primarySL = primaryPosition.entryPrice * (1 - stopLossPercent / 100);
    } else {
      primaryTP = primaryPosition.entryPrice * (1 - takeProfitPercent / 100);
      primarySL = primaryPosition.entryPrice * (1 + stopLossPercent / 100);
    }
  }

  if (hedgePosition) {
    if (hedgePosition.side === 'Buy') {
      hedgeTP = hedgePosition.entryPrice * (1 + takeProfitPercent / 100);
      hedgeSL = hedgePosition.entryPrice * (1 - stopLossPercent / 100);
    } else {
      hedgeTP = hedgePosition.entryPrice * (1 - takeProfitPercent / 100);
      hedgeSL = hedgePosition.entryPrice * (1 + stopLossPercent / 100);
    }
  }

  console.log('🎯 Calculated TP/SL levels:');
  if (primaryPosition) {
    console.log(`   Primary (${position.primaryExchange}): TP=$${primaryTP.toFixed(6)} SL=$${primarySL.toFixed(6)}`);
  }
  if (hedgePosition) {
    console.log(`   Hedge (${position.hedgeExchange}): TP=$${hedgeTP.toFixed(6)} SL=$${hedgeSL.toFixed(6)}`);
  }
  console.log();

  // 5. Set TP/SL on exchanges
  let primaryTPSLSuccess = false;
  let hedgeTPSLSuccess = false;

  if (primaryPosition && primaryTP > 0 && primarySL > 0) {
    console.log(`Setting TP/SL on ${position.primaryExchange}...`);
    if (position.primaryExchange === 'BYBIT') {
      primaryTPSLSuccess = await setBybitTPSL(
        position.symbol,
        primaryPosition.side,
        primaryTP,
        primarySL,
        primaryApiKey,
        primaryApiSecret
      );
    } else if (position.primaryExchange === 'BINGX') {
      const bingxSymbol = position.symbol.replace(/([A-Z]+)(USDT)$/, '$1-$2');
      primaryTPSLSuccess = await setBingXTPSL(
        bingxSymbol,
        primaryPosition.side,
        primaryTP,
        primarySL,
        primaryApiKey,
        primaryApiSecret
      );
    }
    console.log(primaryTPSLSuccess ? '✓ Success' : '✗ Failed');
  }

  if (hedgePosition && hedgeTP > 0 && hedgeSL > 0) {
    console.log(`Setting TP/SL on ${position.hedgeExchange}...`);
    if (position.hedgeExchange === 'BYBIT') {
      hedgeTPSLSuccess = await setBybitTPSL(
        position.symbol,
        hedgePosition.side,
        hedgeTP,
        hedgeSL,
        hedgeApiKey,
        hedgeApiSecret
      );
    } else if (position.hedgeExchange === 'BINGX') {
      const bingxSymbol = position.symbol.replace(/([A-Z]+)(USDT)$/, '$1-$2');
      hedgeTPSLSuccess = await setBingXTPSL(
        bingxSymbol,
        hedgePosition.side,
        hedgeTP,
        hedgeSL,
        hedgeApiKey,
        hedgeApiSecret
      );
    }
    console.log(hedgeTPSLSuccess ? '✓ Success' : '✗ Failed');
  }

  // 6. Update database
  console.log('\n💾 Updating database...');

  const newStatus = (primaryPosition && hedgePosition && primaryTPSLSuccess && hedgeTPSLSuccess)
    ? 'ACTIVE'
    : 'ERROR';

  await prisma.graduatedEntryPosition.update({
    where: { id: position.id },
    data: {
      status: newStatus,
      primaryEntryPrice: primaryPosition?.entryPrice || position.primaryEntryPrice,
      hedgeEntryPrice: hedgePosition?.entryPrice || position.hedgeEntryPrice,
      primaryFilledQty: primaryPosition?.size || position.primaryFilledQty,
      hedgeFilledQty: hedgePosition?.size || position.hedgeFilledQty,
      primaryTakeProfit: primaryTP || null,
      primaryStopLoss: primarySL || null,
      hedgeTakeProfit: hedgeTP || null,
      hedgeStopLoss: hedgeSL || null,
      errorMessage: newStatus === 'ACTIVE'
        ? null
        : `Partial heal: Primary TP/SL: ${primaryTPSLSuccess ? 'OK' : 'Failed'}, Hedge TP/SL: ${hedgeTPSLSuccess ? 'OK' : 'Failed'}`,
    },
  });

  console.log(`✓ Position updated to status: ${newStatus}\n`);

  if (newStatus === 'ACTIVE') {
    console.log('🎉 Position successfully healed!');
  } else {
    console.log('⚠️  Position partially healed. Check error message.');
  }
}

// Main execution
const positionId = process.argv[2];

if (!positionId) {
  console.error('Usage: npx tsx heal-error-position.ts <positionId>');
  process.exit(1);
}

healPosition(positionId)
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
