/**
 * Funding Payment Arbitrage Bot - SHORT After Funding Strategy
 *
 * Strategy for NEGATIVE funding rate:
 * 1. Wait for funding payment at 0s (no position during payment)
 * 2. Open SHORT at 0s (moment of funding, via WebSocket API for ultra-low latency)
 * 3. Close SHORT at +3s after funding (capture price drop)
 *
 * Expected profit: +0.6-1.7% in ~3 seconds
 * Based on recorded data analysis:
 * - Price drops 0s → +3s: +0.7-1.8% profit on SHORT
 * - Taker fees (entry + exit): -0.11%
 * - Net profit: +0.59-1.69%
 *
 * Key advantages:
 * - No funding payment risk (not in position at 0s)
 * - Immediate SHORT entry at 0s captures maximum price drop
 * - Ultra-low latency WebSocket API execution (5-20ms)
 */

import { PrismaClient } from '@prisma/client';
import { BybitService } from '../lib/bybit';
import prisma from '../lib/prisma';

export interface StrategyConfig {
  userId: string;
  symbol: string;
  positionSize: string; // e.g., "0.1" BTC
  fundingPaymentTime: Date;
  fundingRate: number;
  stopLoss?: number; // Optional stop loss percentage
  maxSlippage?: number; // Optional max slippage percentage
}

export interface StrategyResult {
  success: boolean;
  symbol: string;
  fundingRate: number;

  shortEntry: {
    time: Date;
    price: number;
    orderId: string;
  } | null;

  shortExit: {
    time: Date;
    price: number;
    orderId: string;
  } | null;

  profit: {
    shortPnL: number; // % P&L from SHORT position (price drop)
    fees: number; // % fees (taker entry + exit)
    totalProfit: number; // % net profit
  } | null;

  errors: string[];
}

export class FundingPaymentArbBot {
  private bybit: BybitService;
  private config: StrategyConfig;
  private prisma: PrismaClient;
  private timers: NodeJS.Timeout[] = [];
  private result: StrategyResult;
  private isRunning: boolean = false;

  constructor(config: StrategyConfig, bybit: BybitService) {
    this.config = config;
    this.bybit = bybit;
    this.prisma = prisma;
    this.result = {
      success: false,
      symbol: config.symbol,
      fundingRate: config.fundingRate,
      shortEntry: null,
      shortExit: null,
      profit: null,
      errors: [],
    };
  }

  /**
   * Start the arbitrage strategy
   * Schedules all actions with precise timing
   */
  async start(): Promise<StrategyResult> {
    if (this.isRunning) {
      throw new Error('Strategy is already running');
    }

    this.isRunning = true;

    try {
      console.log('🚀 Starting Funding Payment Arbitrage Strategy (SHORT After Funding)');
      console.log(`   Symbol: ${this.config.symbol}`);
      console.log(`   Funding Rate: ${(this.config.fundingRate * 100).toFixed(4)}%`);
      console.log(`   Position Size: ${this.config.positionSize}`);
      console.log(`   Funding Time: ${this.config.fundingPaymentTime.toISOString()}`);

      // Sync time with Bybit
      await this.bybit.syncTime();

      const now = Date.now();
      const fundingTime = this.config.fundingPaymentTime.getTime();
      const timeUntilFunding = fundingTime - now;

      if (timeUntilFunding < 1000) {
        throw new Error(`Too close to funding time (${(timeUntilFunding / 1000).toFixed(1)}s). Need at least 1 second.`);
      }

      console.log(`   Time until funding: ${(timeUntilFunding / 1000).toFixed(1)}s`);
      console.log(`\n💡 Strategy: Wait for funding → Open SHORT at 0s → Close +3s`);
      console.log(`   Expected profit: +0.6-1.7% from price drop (minus 0.11% fees)`);

      // Schedule SHORT entry (at 0s, moment of funding)
      const shortEntryDelay = timeUntilFunding;
      console.log(`\n📅 Scheduling SHORT entry in ${(shortEntryDelay / 1000).toFixed(2)}s (at funding time 0s)`);

      const shortEntryTimer = setTimeout(async () => {
        await this.executeShortEntry();
      }, shortEntryDelay);
      this.timers.push(shortEntryTimer);

      // Schedule SHORT exit (+3000ms after funding)
      const shortExitDelay = timeUntilFunding + 3000;
      console.log(`📅 Scheduling SHORT exit in ${(shortExitDelay / 1000).toFixed(1)}s (3s after funding)`);

      const shortExitTimer = setTimeout(async () => {
        await this.executeShortExit();
      }, shortExitDelay);
      this.timers.push(shortExitTimer);

      // Wait for strategy completion
      await this.waitForCompletion(shortExitDelay + 5000);

      return this.result;

    } catch (error: any) {
      console.error('❌ Strategy failed:', error.message);
      this.result.errors.push(error.message);
      this.result.success = false;
      this.cleanup();
      return this.result;
    }
  }

  /**
   * Execute SHORT entry (at 0s, moment of funding)
   * Uses WebSocket API for ultra-low latency (5-20ms execution)
   */
  private async executeShortEntry(): Promise<void> {
    try {
      console.log('\n📉 Opening SHORT position via WebSocket API...');
      console.log('   Timing: 0s (moment of funding payment)');
      const startTime = Date.now();

      const result = await this.bybit.openShortWS(
        this.config.symbol,
        this.config.positionSize,
        false // Not reduce-only
      );

      const duration = Date.now() - startTime;
      console.log(`✅ SHORT opened via WS in ${duration}ms`);
      console.log(`   Order ID: ${result.orderId}`);
      console.log(`   Price: $${result.avgPrice}`);
      console.log(`   ⏳ Holding SHORT for 3s to capture price drop...`);

      this.result.shortEntry = {
        time: new Date(),
        price: parseFloat(result.avgPrice),
        orderId: result.orderId,
      };

    } catch (error: any) {
      console.error('❌ Failed to open SHORT:', error.message);
      this.result.errors.push(`SHORT entry failed: ${error.message}`);
      this.cleanup();
    }
  }

  /**
   * Execute SHORT exit (+3s after funding)
   * Uses WebSocket API for ultra-low latency
   */
  private async executeShortExit(): Promise<void> {
    try {
      console.log('\n💰 Closing SHORT position via WebSocket API...');
      console.log('   Timing: 3s AFTER funding payment');
      const startTime = Date.now();

      const result = await this.bybit.closeShortWS(
        this.config.symbol,
        this.config.positionSize
      );

      const duration = Date.now() - startTime;
      console.log(`✅ SHORT closed via WS in ${duration}ms`);
      console.log(`   Order ID: ${result.orderId}`);
      console.log(`   Price: $${result.avgPrice}`);

      this.result.shortExit = {
        time: new Date(),
        price: parseFloat(result.avgPrice),
        orderId: result.orderId,
      };

      // Calculate final results
      this.calculateResults();

    } catch (error: any) {
      console.error('❌ Failed to close SHORT:', error.message);
      this.result.errors.push(`SHORT exit failed: ${error.message}`);
      this.cleanup();
    }
  }

  /**
   * Calculate final profit/loss
   */
  private calculateResults(): void {
    if (!this.result.shortEntry || !this.result.shortExit) {
      console.error('❌ Cannot calculate results - missing execution data');
      return;
    }

    const entryPrice = this.result.shortEntry.price;
    const exitPrice = this.result.shortExit.price;

    // SHORT P&L: profit when price drops (entry > exit)
    const shortPnL = ((entryPrice - exitPrice) / entryPrice) * 100;

    // Bybit taker fees: 0.055% per trade
    const takerFeePerTrade = 0.055;
    const totalFees = takerFeePerTrade * 2; // Entry + Exit

    // Net profit = SHORT P&L - Fees
    const totalProfit = shortPnL - totalFees;

    this.result.profit = {
      shortPnL,
      fees: totalFees,
      totalProfit,
    };

    this.result.success = totalProfit > 0 && this.result.errors.length === 0;

    console.log('\n' + '='.repeat(70));
    console.log('💰 STRATEGY RESULTS');
    console.log('='.repeat(70));

    console.log(`\n📉 SHORT POSITION:`);
    console.log(`   Entry (0s):      $${entryPrice.toFixed(6)}`);
    console.log(`   Exit  (+3000ms): $${exitPrice.toFixed(6)}`);
    console.log(`   Price Drop:      ${entryPrice > exitPrice ? '+' : ''}${shortPnL.toFixed(4)}%`);

    console.log(`\n💵 BREAKDOWN:`);
    console.log(`   SHORT P&L (price drop): ${shortPnL >= 0 ? '+' : ''}${shortPnL.toFixed(4)}%`);
    console.log(`   Taker Fees (2x 0.055%): -${totalFees.toFixed(4)}%`);

    console.log(`\n💰 NET PROFIT:`);
    console.log(`   ──────────────────`);
    console.log(`   TOTAL: ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(4)}%`);

    const totalDuration = this.result.shortExit.time.getTime() - this.result.shortEntry.time.getTime();
    console.log(`\n⏱️  TIMING:`);
    console.log(`   Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   WS API latency: ~5-20ms per order`);

    console.log('\n' + '='.repeat(70));

    if (this.result.success) {
      console.log('✅ Strategy executed successfully!');
      console.log(`   Profit: ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(4)}% in ${(totalDuration / 1000).toFixed(2)}s`);
    } else {
      console.log('⚠️  Strategy completed with errors or loss');
    }

    console.log('='.repeat(70) + '\n');
  }

  /**
   * Wait for strategy completion
   */
  private async waitForCompletion(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.cleanup();
        resolve();
      }, timeout);
    });
  }

  /**
   * Cleanup timers and resources
   */
  private cleanup(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    this.isRunning = false;
  }

  /**
   * Stop the strategy (emergency stop)
   */
  async stop(): Promise<void> {
    console.log('🛑 Emergency stop requested');
    this.cleanup();

    // Try to close any open SHORT position via WebSocket API
    try {
      console.log('Attempting to close SHORT position via WS...');
      await this.bybit.closeShortWS(this.config.symbol, this.config.positionSize).catch(() => {});
    } catch (error) {
      console.error('Error during emergency stop:', error);
    }
  }

  /**
   * Get current result
   */
  getResult(): StrategyResult {
    return this.result;
  }
}
