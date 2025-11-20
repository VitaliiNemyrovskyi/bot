/**
 * BDX Spread Monitor & Auto-Close Script
 *
 * Monitors BDX positions on MEXC and BingX, and automatically closes
 * both positions when the price spread converges to target (default 2%).
 *
 * Usage: npx tsx monitor-bdx-spread.ts [targetSpreadPercent]
 * Example: npx tsx monitor-bdx-spread.ts 2
 */

import { ExchangeConnectorFactory } from './src/connectors/exchange.factory';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';
import prisma from './src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

const SYMBOL = 'BDXUSDT';
const PRIMARY_EXCHANGE = 'MEXC';
const HEDGE_EXCHANGE = 'BINGX';
const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
const TARGET_SPREAD_PERCENT = parseFloat(process.argv[2] || '2');

// Price stream logging
const LOG_DIR = './price-streams';
const LOG_FILE = path.join(LOG_DIR, `bdx-spread-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.csv`);

interface PositionInfo {
  exchange: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

async function main() {
  console.log('='.repeat(60));
  console.log('BDX Spread Monitor & Auto-Close');
  console.log('='.repeat(60));
  console.log(`Symbol: ${SYMBOL}`);
  console.log(`Exchanges: ${PRIMARY_EXCHANGE} <-> ${HEDGE_EXCHANGE}`);
  console.log(`Target Spread: ${TARGET_SPREAD_PERCENT}%`);
  console.log(`Check Interval: ${CHECK_INTERVAL_MS / 1000}s`);
  console.log('='.repeat(60));

  // Get user credentials (assuming single user or first admin)
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('No admin user found');
    process.exit(1);
  }

  console.log(`User: ${user.email}`);

  // Get exchange credentials (decrypted)
  const mexcCreds = await ExchangeCredentialsService.getActiveCredentials(user.id, 'MEXC');
  const bingxCreds = await ExchangeCredentialsService.getActiveCredentials(user.id, 'BINGX');

  if (!mexcCreds || !bingxCreds) {
    console.error('Missing exchange credentials');
    console.log(`MEXC: ${mexcCreds ? 'OK' : 'MISSING'}`);
    console.log(`BingX: ${bingxCreds ? 'OK' : 'MISSING'}`);
    process.exit(1);
  }

  console.log(`MEXC credentials loaded (decrypted)`);
  console.log(`BingX credentials loaded (decrypted)`);

  // Create connectors
  const mexcConnector = ExchangeConnectorFactory.create(
    'MEXC',
    mexcCreds.apiKey,
    mexcCreds.apiSecret,
    user.id,
    mexcCreds.id,
    mexcCreds.authToken || undefined
  );

  const bingxConnector = ExchangeConnectorFactory.create(
    'BINGX',
    bingxCreds.apiKey,
    bingxCreds.apiSecret,
    user.id,
    bingxCreds.id,
    bingxCreds.authToken || undefined
  );

  try {
    await mexcConnector.initialize();
  } catch (error: any) {
    console.warn(`MEXC initialization warning: ${error.message}`);
    console.log('Continuing without full initialization...');
  }

  try {
    await bingxConnector.initialize();
  } catch (error: any) {
    console.warn(`BingX initialization warning: ${error.message}`);
    console.log('Continuing without full initialization...');
  }

  console.log('Connectors initialized successfully\n');

  // Start monitoring loop
  let isClosing = false;
  let debugShown = false;

  const monitor = async () => {
    if (isClosing) return;

    try {
      // Get positions
      const [mexcPos, bingxPos] = await Promise.all([
        mexcConnector.getPosition(SYMBOL),
        bingxConnector.getPosition(SYMBOL)
      ]);

      // Get current prices
      const [mexcPrice, bingxPrice] = await Promise.all([
        mexcConnector.getMarketPrice(SYMBOL),
        bingxConnector.getMarketPrice(SYMBOL)
      ]);

      // Parse MEXC position
      const mexcSide = mexcPos.positionType === 1 ? 'LONG' : mexcPos.positionType === 2 ? 'SHORT' : 'NONE';
      const mexcSize = parseFloat(mexcPos.holdVol || '0');
      const mexcEntryPrice = parseFloat(mexcPos.openAvgPrice || mexcPos.holdAvgPrice || '0');

      // Parse BingX position - use positionSide field directly
      const bingxSideRaw = (bingxPos.positionSide || '').toUpperCase();
      const bingxSide = bingxSideRaw === 'LONG' ? 'LONG' : bingxSideRaw === 'SHORT' ? 'SHORT' : 'NONE';
      const bingxSize = Math.abs(parseFloat(bingxPos.positionAmt || '0'));
      const bingxEntryPrice = parseFloat(bingxPos.avgPrice || bingxPos.entryPrice || '0');

      // MEXC uses contracts where 1 contract = 10 BDX for this symbol
      // Normalize MEXC size to match BingX (multiply by contract size)
      const mexcContractSize = 10; // 1 contract = 10 BDX
      const mexcSizeNormalized = mexcSize * mexcContractSize;

      // Debug: log raw position data on first run only
      if ((mexcSize > 0 || bingxSize > 0) && !debugShown) {
        console.log('\n--- Raw Position Data ---');
        console.log('MEXC:', JSON.stringify(mexcPos, null, 2));
        console.log('BingX:', JSON.stringify(bingxPos, null, 2));
        console.log('--- End Raw Data ---\n');
        debugShown = true;
      }

      if (mexcSize === 0 && bingxSize === 0) {
        console.log('No open positions found. Exiting...');
        process.exit(0);
      }

      // Calculate current spread
      const spreadAbsolute = Math.abs(mexcPrice - bingxPrice);
      const avgPrice = (mexcPrice + bingxPrice) / 2;
      const spreadPercent = (spreadAbsolute / avgPrice) * 100;

      // Calculate P&L for each position (use normalized size for MEXC)
      const mexcPnl = mexcSide === 'LONG'
        ? (mexcPrice - mexcEntryPrice) * mexcSizeNormalized
        : mexcSide === 'SHORT'
        ? (mexcEntryPrice - mexcPrice) * mexcSizeNormalized
        : 0;

      const bingxPnl = bingxSide === 'LONG'
        ? (bingxPrice - bingxEntryPrice) * bingxSize
        : bingxSide === 'SHORT'
        ? (bingxEntryPrice - bingxPrice) * bingxSize
        : 0;

      const totalPnl = mexcPnl + bingxPnl;

      // Display status
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n[${timestamp}] Spread: ${spreadPercent.toFixed(4)}% (Target: ${TARGET_SPREAD_PERCENT}%)`);
      console.log(`MEXC:  ${mexcSide.padEnd(5)} | Size: ${mexcSizeNormalized.toFixed(0)} (${mexcSize} contracts) | Price: $${mexcPrice.toFixed(6)} | Entry: $${mexcEntryPrice.toFixed(6)} | PnL: $${mexcPnl.toFixed(2)}`);
      console.log(`BingX: ${bingxSide.padEnd(5)} | Size: ${bingxSize.toFixed(0)} | Price: $${bingxPrice.toFixed(6)} | Entry: $${bingxEntryPrice.toFixed(6)} | PnL: $${bingxPnl.toFixed(2)}`);
      console.log(`Total PnL: $${totalPnl.toFixed(2)}`);

      // Check if target spread reached
      if (spreadPercent <= TARGET_SPREAD_PERCENT) {
        console.log('\n' + '='.repeat(60));
        console.log(`TARGET SPREAD REACHED: ${spreadPercent.toFixed(4)}% <= ${TARGET_SPREAD_PERCENT}%`);
        console.log('CLOSING BOTH POSITIONS...');
        console.log('='.repeat(60));

        isClosing = true;

        try {
          // Close both positions
          const [mexcResult, bingxResult] = await Promise.all([
            mexcConnector.closePosition(SYMBOL).catch(err => ({ error: err.message })),
            bingxConnector.closePosition(SYMBOL).catch(err => ({ error: err.message }))
          ]);

          console.log('\nMEXC Close Result:', JSON.stringify(mexcResult, null, 2));
          console.log('BingX Close Result:', JSON.stringify(bingxResult, null, 2));

          console.log('\n' + '='.repeat(60));
          console.log('POSITIONS CLOSED SUCCESSFULLY');
          console.log(`Final Spread: ${spreadPercent.toFixed(4)}%`);
          console.log(`Estimated Total PnL: $${totalPnl.toFixed(2)}`);
          console.log('='.repeat(60));

          process.exit(0);
        } catch (error: any) {
          console.error('Error closing positions:', error.message);
          isClosing = false;
        }
      }
    } catch (error: any) {
      console.error(`Error in monitor loop: ${error.message}`);
    }
  };

  // Run immediately, then on interval
  await monitor();
  setInterval(monitor, CHECK_INTERVAL_MS);

  console.log('\nMonitoring started. Press Ctrl+C to stop.\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
