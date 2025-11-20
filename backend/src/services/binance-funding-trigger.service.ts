/**
 * Binance Funding Payment Trigger Strategy
 *
 * Strategy:
 * 1. Open small LONG position (5 USDT) before funding payment
 * 2. Connect to User Data Stream WebSocket
 * 3. Detect funding payment via ACCOUNT_UPDATE event (m: "FUNDING_FEE")
 * 4. Immediately open SHORT position to catch post-funding price drop
 * 5. Close LONG trigger position
 * 6. Monitor for exit signal (price reversal or timeout)
 * 7. Close SHORT and calculate profit
 */

import WebSocket from 'ws';
import { BinanceService } from '../lib/binance';
import { EventEmitter } from 'events';

interface FundingTriggerConfig {
  symbol: string; // e.g., "BTCUSDT"
  fundingTime: Date; // Scheduled funding time
  triggerPositionUsdt: number; // Size of LONG trigger position (e.g., 5)
  mainPositionUsdt: number; // Size of SHORT scalp position (e.g., 100)
  maxHoldTimeSeconds: number; // Maximum time to hold SHORT (e.g., 6)
  apiKey: string;
  apiSecret: string;
}

interface FundingEvent {
  fundingAmount: number;
  asset: string;
  newBalance: number;
  timestamp: number;
}

interface TradeResult {
  success: boolean;
  shortEntryPrice?: number;
  shortExitPrice?: number;
  grossProfitPercent?: number;
  fundingCost?: number;
  netProfitPercent?: number;
  holdTimeMs?: number;
  error?: string;
}

export class BinanceFundingTriggerService extends EventEmitter {
  private binanceService: BinanceService;
  private config: FundingTriggerConfig;
  private listenKey?: string;
  private userDataWs?: WebSocket;
  private priceWs?: WebSocket;

  // State tracking
  private longPositionOpened: boolean = false;
  private fundingDetected: boolean = false;
  private shortPositionOpened: boolean = false;
  private isActive: boolean = false;

  // Performance metrics
  private fundingDetectionTime?: number;
  private shortEntryTime?: number;
  private shortExitTime?: number;
  private shortEntryPrice?: number;
  private shortExitPrice?: number;
  private fundingAmount?: number;

  // Price monitoring
  private previousPrice: number = 0;
  private consecutiveUps: number = 0;

  constructor(config: FundingTriggerConfig) {
    super();
    this.config = config;

    // Initialize Binance service
    this.binanceService = new BinanceService({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      enableRateLimit: true,
    });

    console.log('[BinanceFundingTrigger] Service initialized');
    console.log(`  Symbol: ${config.symbol}`);
    console.log(`  Funding Time: ${config.fundingTime.toISOString()}`);
    console.log(`  Trigger Position: ${config.triggerPositionUsdt} USDT`);
    console.log(`  Main Position: ${config.mainPositionUsdt} USDT`);
  }

  /**
   * Start the funding trigger strategy
   */
  async execute(): Promise<TradeResult> {
    try {
      this.isActive = true;
      console.log('\n🚀 STARTING BINANCE FUNDING TRIGGER STRATEGY');
      console.log('='.repeat(70));

      // Step 1: Initialize Binance service
      await this.binanceService.initialize();
      console.log('✅ Binance service initialized');

      // Step 2: Create listenKey for User Data Stream
      await this.createListenKey();
      console.log(`✅ ListenKey created: ${this.listenKey?.substring(0, 20)}...`);

      // Step 3: Connect to User Data Stream WebSocket
      await this.connectUserDataStream();
      console.log('✅ User Data Stream connected');

      // Step 4: Wait until 10 seconds before funding
      const timeUntilEntry = this.config.fundingTime.getTime() - Date.now() - 10000;

      if (timeUntilEntry > 0) {
        console.log(`\n⏳ Waiting ${(timeUntilEntry / 1000).toFixed(1)}s until entry time...`);
        await this.sleep(timeUntilEntry);
      }

      // Step 5: Open LONG trigger position
      await this.openLongTrigger();

      // Step 6: Wait for funding payment detection
      console.log('\n👀 MONITORING FOR FUNDING PAYMENT...');
      const result = await this.waitForFundingAndExecute();

      // Step 7: Cleanup
      await this.cleanup();

      return result;

    } catch (error: any) {
      console.error('\n❌ STRATEGY FAILED:', error.message);
      await this.cleanup();

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create listenKey for User Data Stream
   */
  private async createListenKey(): Promise<void> {
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/listenKey', {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create listenKey: ${response.statusText}`);
      }

      const data = await response.json();
      this.listenKey = data.listenKey;

      // Keep-alive: Extend listenKey every 30 minutes
      setInterval(async () => {
        await this.extendListenKey();
      }, 30 * 60 * 1000);

    } catch (error: any) {
      console.error('[BinanceFundingTrigger] Failed to create listenKey:', error.message);
      throw error;
    }
  }

  /**
   * Extend listenKey to keep it alive
   */
  private async extendListenKey(): Promise<void> {
    if (!this.listenKey) return;

    try {
      await fetch('https://fapi.binance.com/fapi/v1/listenKey', {
        method: 'PUT',
        headers: {
          'X-MBX-APIKEY': this.config.apiKey,
        },
      });

      console.log('[BinanceFundingTrigger] ListenKey extended');
    } catch (error: any) {
      console.error('[BinanceFundingTrigger] Failed to extend listenKey:', error.message);
    }
  }

  /**
   * Connect to User Data Stream WebSocket
   */
  private async connectUserDataStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://fstream.binance.com/ws/${this.listenKey}`;
      this.userDataWs = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        reject(new Error('User Data Stream connection timeout'));
      }, 10000);

      this.userDataWs.on('open', () => {
        clearTimeout(timeout);
        console.log('[BinanceFundingTrigger] User Data Stream opened');
        resolve();
      });

      this.userDataWs.on('message', (data: Buffer) => {
        this.handleUserDataMessage(data);
      });

      this.userDataWs.on('error', (error: Error) => {
        console.error('[BinanceFundingTrigger] User Data Stream error:', error.message);
      });

      this.userDataWs.on('close', () => {
        console.log('[BinanceFundingTrigger] User Data Stream closed');
      });

      // Keep-alive: Send ping every 3 minutes
      setInterval(() => {
        if (this.userDataWs && this.userDataWs.readyState === WebSocket.OPEN) {
          this.userDataWs.ping();
        }
      }, 180000);
    });
  }

  /**
   * Handle User Data Stream message
   */
  private handleUserDataMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Check for ACCOUNT_UPDATE event with FUNDING_FEE
      if (message.e === 'ACCOUNT_UPDATE' && message.a?.m === 'FUNDING_FEE') {
        this.fundingDetectionTime = Date.now();

        // Extract funding amount
        const balances = message.a.B || [];
        const usdtBalance = balances.find((b: any) => b.a === 'USDT');

        if (usdtBalance) {
          this.fundingAmount = parseFloat(usdtBalance.bc); // Balance change
        }

        console.log('\n⚡⚡⚡ FUNDING PAYMENT DETECTED!');
        console.log(`   Time: ${new Date(this.fundingDetectionTime).toISOString()}`);
        console.log(`   Funding Amount: ${this.fundingAmount?.toFixed(6)} USDT`);
        console.log(`   Detection Latency: ${this.fundingDetectionTime - this.config.fundingTime.getTime()}ms`);

        // Emit funding detected event
        this.emit('fundingDetected', {
          fundingAmount: this.fundingAmount,
          asset: 'USDT',
          newBalance: parseFloat(usdtBalance.wb),
          timestamp: this.fundingDetectionTime,
        });

        this.fundingDetected = true;
      }

    } catch (error: any) {
      console.error('[BinanceFundingTrigger] Error handling User Data message:', error.message);
    }
  }

  /**
   * Open LONG trigger position
   */
  private async openLongTrigger(): Promise<void> {
    console.log('\n📍 OPENING LONG TRIGGER POSITION');
    console.log('='.repeat(70));

    try {
      // Get current price
      const currentPrice = await this.binanceService.getCurrentPrice(this.config.symbol);
      console.log(`   Current Price: ${currentPrice}`);

      // Calculate quantity
      const quantity = (this.config.triggerPositionUsdt / currentPrice).toFixed(3);
      console.log(`   Quantity: ${quantity}`);

      // Open LONG position via WebSocket API (ultra-fast)
      const order = await this.binanceService.openLongWS(this.config.symbol, quantity);

      console.log(`✅ LONG trigger opened!`);
      console.log(`   Order ID: ${order.orderId}`);
      console.log(`   Entry Price: ${order.avgPrice}`);

      this.longPositionOpened = true;

    } catch (error: any) {
      console.error('❌ Failed to open LONG trigger:', error.message);
      throw error;
    }
  }

  /**
   * Wait for funding payment and execute trade
   */
  private async waitForFundingAndExecute(): Promise<TradeResult> {
    return new Promise((resolve) => {
      // Listen for funding detection
      this.once('fundingDetected', async (event: FundingEvent) => {
        try {
          // Execute trade immediately
          const result = await this.executeTrade();
          resolve(result);
        } catch (error: any) {
          resolve({
            success: false,
            error: error.message,
          });
        }
      });

      // Timeout after 30 seconds if no funding detected
      setTimeout(() => {
        if (!this.fundingDetected) {
          console.log('\n⚠️  TIMEOUT: No funding payment detected');
          resolve({
            success: false,
            error: 'Timeout: No funding payment detected within 30 seconds',
          });
        }
      }, 30000);
    });
  }

  /**
   * Execute trade: Open SHORT, Close LONG, Monitor exit
   */
  private async executeTrade(): Promise<TradeResult> {
    const tradeStartTime = Date.now();

    try {
      // STEP 1: Open SHORT position immediately (PRIORITY!)
      console.log('\n🎯 OPENING SHORT POSITION');
      console.log('='.repeat(70));

      const currentPrice = await this.binanceService.getCurrentPrice(this.config.symbol);
      const shortQuantity = (this.config.mainPositionUsdt / currentPrice).toFixed(3);

      const shortOrder = await this.binanceService.openShortWS(this.config.symbol, shortQuantity);
      this.shortEntryTime = Date.now();
      this.shortEntryPrice = parseFloat(shortOrder.avgPrice);
      this.shortPositionOpened = true;

      console.log(`✅ SHORT opened in ${this.shortEntryTime - tradeStartTime}ms`);
      console.log(`   Order ID: ${shortOrder.orderId}`);
      console.log(`   Entry Price: ${this.shortEntryPrice}`);

      // STEP 2: Close LONG trigger position
      console.log('\n🧹 CLOSING LONG TRIGGER POSITION');

      const longQuantity = (this.config.triggerPositionUsdt / currentPrice).toFixed(3);
      const longCloseOrder = await this.binanceService.closeLongWS(this.config.symbol, longQuantity);

      console.log(`✅ LONG closed in ${Date.now() - tradeStartTime}ms`);
      console.log(`   Order ID: ${longCloseOrder.orderId}`);

      // STEP 3: Monitor for exit
      console.log('\n👀 MONITORING FOR EXIT SIGNAL');
      console.log('='.repeat(70));

      await this.monitorForExit(shortQuantity);

      // Calculate results
      if (!this.shortExitPrice || !this.shortEntryPrice) {
        throw new Error('Missing price data');
      }

      const priceChange = ((this.shortExitPrice - this.shortEntryPrice) / this.shortEntryPrice) * 100;
      const grossProfitPercent = -priceChange; // SHORT profits when price drops

      const fundingCostPercent = this.fundingAmount
        ? (this.fundingAmount / this.config.mainPositionUsdt) * 100
        : 0;

      const netProfitPercent = grossProfitPercent + fundingCostPercent;

      const holdTimeMs = this.shortExitTime! - this.shortEntryTime!;

      console.log('\n💰 TRADE RESULTS');
      console.log('='.repeat(70));
      console.log(`   Entry Price: ${this.shortEntryPrice}`);
      console.log(`   Exit Price: ${this.shortExitPrice}`);
      console.log(`   Price Change: ${priceChange.toFixed(4)}%`);
      console.log(`   Gross Profit: ${grossProfitPercent.toFixed(4)}%`);
      console.log(`   Funding Cost: ${fundingCostPercent.toFixed(4)}%`);
      console.log(`   Net Profit: ${netProfitPercent.toFixed(4)}%`);
      console.log(`   Hold Time: ${(holdTimeMs / 1000).toFixed(2)}s`);
      console.log('\n' + (netProfitPercent > 0 ? '✅ PROFITABLE TRADE!' : '❌ LOSING TRADE'));

      return {
        success: true,
        shortEntryPrice: this.shortEntryPrice,
        shortExitPrice: this.shortExitPrice,
        grossProfitPercent,
        fundingCost: fundingCostPercent,
        netProfitPercent,
        holdTimeMs,
      };

    } catch (error: any) {
      console.error('\n❌ Trade execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Monitor for exit signal
   */
  private async monitorForExit(shortQuantity: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Connect to price WebSocket
      this.binanceService.subscribeToTicker(this.config.symbol, async (data: any) => {
        try {
          const currentPrice = parseFloat(data.data.lastPrice);
          const elapsed = Date.now() - this.shortEntryTime!;

          // Calculate velocity
          if (this.previousPrice > 0) {
            const velocity = (currentPrice - this.previousPrice) / this.previousPrice;

            // Price reversing up
            if (velocity > 0.0001) {
              this.consecutiveUps++;
            } else {
              this.consecutiveUps = 0;
            }

            // Exit conditions
            const priceReversing = this.consecutiveUps >= 2;
            const timeoutReached = elapsed > this.config.maxHoldTimeSeconds * 1000;

            if (priceReversing || timeoutReached) {
              const reason = priceReversing ? 'Price reversal detected' : 'Max hold time reached';

              console.log(`\n🎯 EXIT SIGNAL: ${reason}`);
              console.log(`   Current Price: ${currentPrice}`);
              console.log(`   Elapsed: ${(elapsed / 1000).toFixed(2)}s`);

              // Close SHORT position
              const closeOrder = await this.binanceService.closeShortWS(this.config.symbol, shortQuantity);
              this.shortExitTime = Date.now();
              this.shortExitPrice = parseFloat(closeOrder.avgPrice);

              console.log(`\n✅ SHORT CLOSED`);
              console.log(`   Order ID: ${closeOrder.orderId}`);
              console.log(`   Exit Price: ${this.shortExitPrice}`);

              // Stop price monitoring
              this.binanceService.unsubscribeAll();

              resolve();
            }
          }

          this.previousPrice = currentPrice;

        } catch (error: any) {
          console.error('Error in exit monitoring:', error.message);
          reject(error);
        }
      });

      // Emergency timeout
      setTimeout(() => {
        reject(new Error('Exit monitoring timeout'));
      }, (this.config.maxHoldTimeSeconds + 5) * 1000);
    });
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up resources...');

    // Close WebSockets
    if (this.userDataWs) {
      this.userDataWs.close();
    }

    this.binanceService.unsubscribeAll();

    // Delete listenKey
    if (this.listenKey) {
      try {
        await fetch('https://fapi.binance.com/fapi/v1/listenKey', {
          method: 'DELETE',
          headers: {
            'X-MBX-APIKEY': this.config.apiKey,
          },
        });
        console.log('✅ ListenKey deleted');
      } catch (error: any) {
        console.error('Failed to delete listenKey:', error.message);
      }
    }

    this.isActive = false;
    console.log('✅ Cleanup complete');
  }

  /**
   * Stop the strategy
   */
  async stop(): Promise<void> {
    console.log('\n⚠️  Stopping strategy...');
    this.isActive = false;
    await this.cleanup();
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
