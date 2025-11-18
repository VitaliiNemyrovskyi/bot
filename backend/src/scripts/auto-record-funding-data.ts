/**
 * Automatic Funding Data Recorder
 *
 * Monitors funding rates on Bybit and Binance and automatically records
 * price data around funding payment times for symbols with negative funding rates.
 *
 * Strategy:
 * 1. Check funding rates every 1 minute
 * 2. Find symbols with funding rates >= 1% (absolute value)
 * 3. Schedule recordings 3 minutes before funding payment (for preparation)
 * 4. Record 20 seconds BEFORE → 60 seconds (1 min) AFTER funding payment
 * 5. Save to database for later analysis
 */

import prisma from '../lib/prisma';
import { BybitService } from '@/lib/bybit';
import { BinanceService } from '@/lib/binance';
import { OKXService } from '@/lib/okx';
import { BitgetService } from '@/lib/bitget';
import { GateIORecorderService } from '@/lib/gateio-recorder';
import { KuCoinRecorderService } from '@/lib/kucoin-recorder';
import { FundingPaymentRecorderService, RecordingConfig, ExchangeService } from '@/services/funding-payment-recorder.service';

interface RecordingSchedule {
  symbol: string;
  exchange: 'BYBIT' | 'BINANCE' | 'OKX' | 'GATEIO' | 'BITGET' | 'KUCOIN';
  fundingRate: number;
  fundingPaymentTime: Date;
  fundingInterval: number;
  scheduled: boolean;
  recordingStarted: boolean;
}

class AutoRecorder {
  private bybitService: BybitService;
  private binanceService: BinanceService;
  private okxService: OKXService;
  private bitgetService: BitgetService;
  private gateioService: GateIORecorderService;
  private kucoinService: KuCoinRecorderService;
  private scheduledRecordings: Map<string, RecordingSchedule> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 1 * 60 * 1000; // 1 minute
  private readonly MIN_FUNDING_RATE_ABS = 0.01; // 1% absolute value (records rates <= -1% or >= +1%)
  private readonly SCHEDULE_BEFORE_FUNDING_MS = 3 * 60 * 1000; // 3 minutes before (time to prepare)

  constructor() {
    // Initialize exchange services
    this.bybitService = new BybitService({
      apiKey: process.env['BYBIT_API_KEY'],
      apiSecret: process.env['BYBIT_API_SECRET'],
    });

    this.binanceService = new BinanceService({
      apiKey: process.env['BINANCE_API_KEY'],
      apiSecret: process.env['BINANCE_API_SECRET'],
    });

    this.okxService = new OKXService({
      apiKey: process.env['OKX_API_KEY'],
      apiSecret: process.env['OKX_API_SECRET'],
      password: process.env['OKX_API_PASSWORD'],
    });

    this.bitgetService = new BitgetService({
      apiKey: process.env['BITGET_API_KEY'],
      apiSecret: process.env['BITGET_API_SECRET'],
      password: process.env['BITGET_API_PASSWORD'],
    });

    this.gateioService = new GateIORecorderService({
      apiKey: process.env['GATEIO_API_KEY'],
      apiSecret: process.env['GATEIO_API_SECRET'],
    });

    this.kucoinService = new KuCoinRecorderService({
      apiKey: process.env['KUCOIN_API_KEY'],
      apiSecret: process.env['KUCOIN_API_SECRET'],
      password: process.env['KUCOIN_API_PASSWORD'],
    });

    console.log('🤖 Auto Recorder initialized with 6 exchanges (BYBIT, BINANCE, OKX, BITGET, GATEIO, KUCOIN)');
  }

  /**
   * Start automatic monitoring and recording
   */
  async start(): Promise<void> {
    console.log('\n🚀 Starting Automatic Funding Data Recorder\n');
    console.log('Configuration:');
    console.log(`  Check interval: ${this.CHECK_INTERVAL_MS / 60000} minutes`);
    console.log(`  Min funding rate (absolute): ${(this.MIN_FUNDING_RATE_ABS * 100).toFixed(2)}%`);
    console.log(`  Schedule before funding: ${this.SCHEDULE_BEFORE_FUNDING_MS / 60000} minutes`);
    console.log(`  Recording: 20 seconds BEFORE → 60 seconds (1 min) AFTER funding`);
    console.log('');

    // Clean up orphaned sessions from previous runs
    await this.cleanupOrphanedSessions();

    // Initial check
    await this.checkAndScheduleRecordings();

    // Set up periodic checks
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkAndScheduleRecordings();
      } catch (error: any) {
        console.error('❌ Error in periodic check:', error.message);
        // Don't crash - continue monitoring
      }
    }, this.CHECK_INTERVAL_MS);

    console.log('✅ Auto Recorder is now running. Press Ctrl+C to stop.\n');
  }

  /**
   * Clean up orphaned sessions from previous runs
   */
  private async cleanupOrphanedSessions(): Promise<void> {
    try {
      console.log('🧹 Cleaning up orphaned sessions from previous runs...');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const result = await prisma.fundingPaymentRecordingSession.updateMany({
        where: {
          status: {
            in: ['RECORDING', 'WAITING']
          },
          createdAt: {
            lt: fiveMinutesAgo
          }
        },
        data: {
          status: 'CANCELLED',
          errorMessage: 'Session orphaned - auto-recorder process was terminated before completion',
          completedAt: new Date(),
        }
      });

      if (result.count > 0) {
        console.log(`✅ Cleaned up ${result.count} orphaned sessions\n`);
      } else {
        console.log('✅ No orphaned sessions found\n');
      }
    } catch (error: any) {
      console.error('⚠️  Failed to cleanup orphaned sessions:', error.message);
      // Don't crash on cleanup failure
    }
  }

  /**
   * Stop automatic monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🛑 Auto Recorder stopped');
  }

  /**
   * Check funding rates and schedule recordings
   */
  private async checkAndScheduleRecordings(): Promise<void> {
    console.log(`\n🔍 [${new Date().toISOString()}] Checking funding rates...`);

    try {
      // Check all exchanges
      await this.checkExchange('BYBIT');
      await this.checkExchange('BINANCE');
      await this.checkExchange('OKX');
      await this.checkExchange('GATEIO');
      await this.checkExchange('BITGET');
      await this.checkExchange('KUCOIN');

      // Show scheduled recordings
      this.showScheduledRecordings();

    } catch (error: any) {
      console.error('❌ Error checking funding rates:', error.message);
    }
  }

  /**
   * Check funding rates for a specific exchange
   */
  private async checkExchange(exchange: 'BYBIT' | 'BINANCE' | 'OKX' | 'GATEIO' | 'BITGET' | 'KUCOIN'): Promise<void> {
    try {
      console.log(`\n📊 Checking ${exchange}...`);

      // Fetch funding rates from database
      const fundingRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange,
          fundingRate: {
            lte: -this.MIN_FUNDING_RATE_ABS, // <= -1% (more negative)
          },
        },
        orderBy: {
          fundingRate: 'asc', // Most negative first
        },
        take: 10, // Top 10 opportunities
      });

      if (fundingRates.length === 0) {
        console.log(`   No opportunities found (all rates above -${(this.MIN_FUNDING_RATE_ABS * 100).toFixed(2)}%)`);
        return;
      }

      console.log(`   Found ${fundingRates.length} opportunities:`);

      for (const rate of fundingRates) {
        const nextFundingTime = this.calculateNextFundingTime(rate.nextFundingTime, rate.fundingInterval);
        const timeUntilFunding = nextFundingTime.getTime() - Date.now();
        const scheduleKey = `${exchange}_${rate.symbol}`;

        // Show opportunity
        console.log(`   • ${rate.symbol.padEnd(12)} - Rate: ${(rate.fundingRate * 100).toFixed(4)}% - Next: ${this.formatTimeUntil(timeUntilFunding)}`);

        // Check if we should schedule recording
        if (timeUntilFunding > 0 && timeUntilFunding <= this.SCHEDULE_BEFORE_FUNDING_MS) {
          // Check if already scheduled
          if (this.scheduledRecordings.has(scheduleKey)) {
            const existing = this.scheduledRecordings.get(scheduleKey)!;
            if (existing.scheduled || existing.recordingStarted) {
              continue; // Already scheduled or started
            }
          }

          // Schedule new recording
          await this.scheduleRecording({
            symbol: rate.symbol,
            exchange,
            fundingRate: rate.fundingRate,
            fundingPaymentTime: nextFundingTime,
            fundingInterval: rate.fundingInterval,
            scheduled: false,
            recordingStarted: false,
          });
        }
      }

    } catch (error: any) {
      console.error(`❌ Error checking ${exchange}:`, error.message);
    }
  }

  /**
   * Schedule a recording session
   */
  private async scheduleRecording(schedule: RecordingSchedule): Promise<void> {
    const scheduleKey = `${schedule.exchange}_${schedule.symbol}`;
    const timeUntilFunding = schedule.fundingPaymentTime.getTime() - Date.now();

    // Check if there's enough time (need at least 30 seconds for preparation + preRecording)
    const MIN_TIME_NEEDED = 30 * 1000; // 30 seconds minimum
    if (timeUntilFunding < MIN_TIME_NEEDED) {
      console.log(`   ⚠️  Too late to schedule ${scheduleKey} - funding in ${(timeUntilFunding / 1000).toFixed(0)}s (need at least 30s)`);
      return;
    }

    console.log(`   ✅ Scheduled ${scheduleKey} - recording session starting now (funding in ${(timeUntilFunding / 1000 / 60).toFixed(1)} minutes)`);

    // Mark as scheduled
    schedule.scheduled = true;
    this.scheduledRecordings.set(scheduleKey, schedule);

    // Start recording immediately - RecordingService will handle timing internally
    // It will sync time, prepare, and start recording at the right moment
    await this.startRecording(scheduleKey);
  }

  /**
   * Start a recording session
   */
  private async startRecording(scheduleKey: string): Promise<void> {
    const schedule = this.scheduledRecordings.get(scheduleKey);
    if (!schedule || schedule.recordingStarted) {
      return;
    }

    try {
      console.log(`\n📹 Starting recording: ${scheduleKey}`);
      console.log(`   Symbol: ${schedule.symbol}`);
      console.log(`   Exchange: ${schedule.exchange}`);
      console.log(`   Funding Rate: ${(schedule.fundingRate * 100).toFixed(4)}%`);
      console.log(`   Funding Time: ${schedule.fundingPaymentTime.toISOString()}`);

      // Mark as started
      schedule.recordingStarted = true;
      this.scheduledRecordings.set(scheduleKey, schedule);

      // Create recording config
      const config: RecordingConfig = {
        // userId omitted for automated system recordings
        symbol: schedule.symbol,
        exchange: schedule.exchange,
        fundingRate: schedule.fundingRate,
        fundingPaymentTime: schedule.fundingPaymentTime,
        fundingInterval: schedule.fundingInterval,
        preRecordingSeconds: 20, // 20 seconds before funding
        postRecordingSeconds: 60, // 60 seconds (1 minute) after funding
      };

      // Select exchange service
      let exchangeService: ExchangeService;
      switch (schedule.exchange) {
        case 'BYBIT':
          exchangeService = this.bybitService;
          break;
        case 'BINANCE':
          exchangeService = this.binanceService;
          break;
        case 'OKX':
          exchangeService = this.okxService;
          break;
        case 'GATEIO':
          exchangeService = this.gateioService;
          break;
        case 'BITGET':
          exchangeService = this.bitgetService;
          break;
        case 'KUCOIN':
          exchangeService = this.kucoinService;
          break;
        default:
          throw new Error(`Unknown exchange: ${schedule.exchange}`);
      }

      // Start recording
      const session = await FundingPaymentRecorderService.startRecording(config, exchangeService);

      // Listen for completion
      session.on('status', (data) => {
        if (data.status === 'COMPLETED') {
          console.log(`\n✅ Recording completed: ${scheduleKey}`);
          console.log(`   Total data points: ${data.totalPoints}`);
          // Remove from scheduled
          this.scheduledRecordings.delete(scheduleKey);
        } else if (data.status === 'ERROR') {
          console.error(`\n❌ Recording failed: ${scheduleKey}`);
          this.scheduledRecordings.delete(scheduleKey);
        }
      });

      console.log(`   Recording session started successfully`);

    } catch (error: any) {
      console.error(`❌ Failed to start recording ${scheduleKey}:`, error.message);
      this.scheduledRecordings.delete(scheduleKey);
    }
  }

  /**
   * Calculate next funding time based on interval
   */
  private calculateNextFundingTime(nextFundingTime: Date, fundingInterval: number): Date {
    const now = Date.now();
    let fundingTime = new Date(nextFundingTime).getTime();

    // If funding time has passed, calculate next occurrence
    while (fundingTime < now) {
      fundingTime += fundingInterval * 60 * 60 * 1000; // Convert hours to ms
    }

    return new Date(fundingTime);
  }

  /**
   * Format time until funding
   */
  private formatTimeUntil(ms: number): string {
    if (ms < 0) return 'PASSED';

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Show currently scheduled recordings
   */
  private showScheduledRecordings(): void {
    if (this.scheduledRecordings.size === 0) {
      return;
    }

    console.log(`\n📅 Scheduled Recordings (${this.scheduledRecordings.size}):`);
    console.log('─'.repeat(80));

    for (const [key, schedule] of this.scheduledRecordings.entries()) {
      const timeUntil = schedule.fundingPaymentTime.getTime() - Date.now();
      const status = schedule.recordingStarted ? '🔴 Recording' : '🟡 Scheduled';

      console.log(`${status} ${key.padEnd(20)} | ` +
        `Rate: ${(schedule.fundingRate * 100).toFixed(4)}% | ` +
        `Time: ${this.formatTimeUntil(timeUntil)}`);
    }

    console.log('─'.repeat(80));
  }
}

// Export singleton instance for use in instrumentation
export const autoRecorder = new AutoRecorder();

// Main execution (for standalone running)
async function main() {
  const recorder = autoRecorder;

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️  Unhandled Promise Rejection:', reason);
    console.error('Promise:', promise);
    // Don't crash on unhandled rejection - log and continue
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    // Don't crash - log and continue
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Shutting down...');
    recorder.stop();
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Shutting down...');
    recorder.stop();
    await prisma.$disconnect();
    process.exit(0);
  });

  // Start the recorder
  await recorder.start();
}

// Run
main().catch(async (error) => {
  console.error('❌ Fatal error:', error);
  console.error('Stack:', error.stack);
  await prisma.$disconnect();
  process.exit(1);
});
