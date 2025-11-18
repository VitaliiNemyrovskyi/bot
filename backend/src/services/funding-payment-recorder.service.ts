/**
 * Funding Payment Recorder Service
 *
 * Records price behavior around funding payment times for analysis.
 * Captures WebSocket data before/after funding payments to identify
 * optimal entry timing for funding arbitrage strategies.
 */

import { EventEmitter } from 'events';
import { RecordingStatus, Exchange } from '@prisma/client';
import { BybitService } from '@/lib/bybit';
import { BinanceService } from '@/lib/binance';
import { OKXService } from '@/lib/okx';
import { BitgetService } from '@/lib/bitget';
import { GateIORecorderService } from '@/lib/gateio-recorder';
import { KuCoinRecorderService } from '@/lib/kucoin-recorder';
import prisma from '@/lib/prisma';

// Type for supported exchange services
export type ExchangeService = BybitService | BinanceService | OKXService | BitgetService | GateIORecorderService | KuCoinRecorderService;

export interface RecordingConfig {
  userId?: string; // Optional for automated recordings
  symbol: string;
  exchange: Exchange;
  fundingRate: number;
  fundingPaymentTime: Date;
  fundingInterval: number;
  preRecordingSeconds?: number;
  postRecordingSeconds?: number;
}

export interface TimeSyncResult {
  bybitServerTime: Date;
  localTime: Date;
  networkLatencyMs: number;
  timeSyncAccuracy: number;
  timeOffset: number;
}

export interface RecordedDataPoint {
  bybitTimestamp: bigint; // Exchange server timestamp (Bybit/Binance) - field name kept for DB compatibility
  localTimestamp: bigint;
  relativeTimeMs: number; // Time relative to funding payment (calculated using exchange timestamp)
  lastPrice: number;
  markPrice?: number;
  indexPrice?: number;
  bid1Price?: number;
  ask1Price?: number;
  bidAskSpread?: number;
  volume24h?: number;
  turnover24h?: number;
  openInterest?: number;
  bid1Size?: number;
  ask1Size?: number;
  updateType?: string;
  sequence?: bigint;
}

/**
 * Recording Session Manager
 *
 * Manages a single recording session:
 * 1. Syncs time with Bybit
 * 2. Subscribes to WebSocket data
 * 3. Records all price updates in memory buffer
 * 4. Saves to database after completion
 * 5. Calculates analytics
 */
export class RecordingSession extends EventEmitter {
  private sessionId?: string;
  private config: Required<RecordingConfig>;
  private exchangeService: ExchangeService;
  private status: RecordingStatus = 'PREPARING';
  private dataBuffer: RecordedDataPoint[] = [];
  private recordingStartTime?: number;
  private fundingPaymentTimestamp: number;
  private timeSyncResult?: TimeSyncResult;
  private wsUnsubscribe?: () => void;
  private recordingTimer?: NodeJS.Timeout;
  private statusUpdateTimer?: NodeJS.Timeout;

  constructor(config: RecordingConfig, exchangeService: ExchangeService) {
    super();

    this.config = {
      ...config,
      preRecordingSeconds: config.preRecordingSeconds ?? 5,
      postRecordingSeconds: config.postRecordingSeconds ?? 30,
    };

    this.exchangeService = exchangeService;
    this.fundingPaymentTimestamp = this.config.fundingPaymentTime.getTime();
  }

  /**
   * Start the recording session
   */
  async start(): Promise<string> {
    try {
      // Create database record
      const session = await prisma.fundingPaymentRecordingSession.create({
        data: {
          userId: this.config.userId,
          symbol: this.config.symbol,
          exchange: this.config.exchange,
          fundingRate: this.config.fundingRate,
          fundingPaymentTime: this.config.fundingPaymentTime,
          fundingInterval: this.config.fundingInterval,
          preRecordingSeconds: this.config.preRecordingSeconds,
          postRecordingSeconds: this.config.postRecordingSeconds,
          status: 'PREPARING',
        },
      });

      this.sessionId = session.id;
      console.log(`[RecordingSession] Session created: ${this.sessionId}`);

      // Sync time with exchange
      await this.syncTimeWithExchange();

      // Calculate when to start recording
      const now = Date.now();
      const millisecondsUntilPayment = this.fundingPaymentTimestamp - now;
      const millisecondsUntilRecording = millisecondsUntilPayment - (this.config.preRecordingSeconds * 1000);

      console.log(`[RecordingSession] Timing:`, {
        now: new Date(now).toISOString(),
        fundingPayment: new Date(this.fundingPaymentTimestamp).toISOString(),
        millisecondsUntilPayment,
        millisecondsUntilRecording,
        startRecordingAt: new Date(now + millisecondsUntilRecording).toISOString(),
      });

      if (millisecondsUntilRecording <= 0) {
        throw new Error('Funding payment time is too soon or already passed');
      }

      // Update status to WAITING
      await this.updateStatus('WAITING');
      this.emit('status', { status: 'WAITING', millisecondsUntilRecording });

      // Schedule recording start
      this.recordingTimer = setTimeout(async () => {
        await this.startRecording();
      }, millisecondsUntilRecording);

      // Start status updates
      this.startStatusUpdates();

      return this.sessionId;
    } catch (error: any) {
      console.error('[RecordingSession] Failed to start:', error.message);
      await this.handleError(error);
      throw error;
    }
  }

  /**
   * Sync time with exchange server and measure latency
   */
  private async syncTimeWithExchange(): Promise<void> {
    try {
      const exchangeName = this.config.exchange;
      console.log(`[RecordingSession] Syncing time with ${exchangeName}...`);

      // Perform multiple sync attempts and take the best one
      const attempts = 2;
      const results: TimeSyncResult[] = [];

      for (let i = 0; i < attempts; i++) {
        const startTime = Date.now();
        const serverTimeMs = await this.exchangeService.getServerTime();
        const endTime = Date.now();

        const roundTripTime = endTime - startTime;
        const networkLatency = roundTripTime / 2;
        const midpoint = startTime + networkLatency;
        const timeOffset = serverTimeMs - midpoint;

        results.push({
          bybitServerTime: new Date(serverTimeMs),
          localTime: new Date(endTime),
          networkLatencyMs: networkLatency,
          timeSyncAccuracy: roundTripTime,
          timeOffset,
        });

        // Small delay between attempts
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Select the result with lowest latency (most accurate)
      const bestResult = results.reduce((best, current) =>
        current.networkLatencyMs < best.networkLatencyMs ? current : best
      );

      this.timeSyncResult = bestResult;

      console.log(`[RecordingSession] Time sync completed with ${exchangeName}:`, {
        attempts,
        bestLatency: bestResult.networkLatencyMs.toFixed(2) + 'ms',
        timeOffset: bestResult.timeOffset.toFixed(2) + 'ms',
        accuracy: bestResult.timeSyncAccuracy.toFixed(2) + 'ms',
      });

      // Update database
      if (this.sessionId) {
        await prisma.fundingPaymentRecordingSession.update({
          where: { id: this.sessionId },
          data: {
            bybitServerTime: bestResult.bybitServerTime,
            localTime: bestResult.localTime,
            networkLatencyMs: Math.round(bestResult.networkLatencyMs),
            timeSyncAccuracy: bestResult.timeSyncAccuracy,
          },
        });
      }

      this.emit('timeSync', bestResult);
    } catch (error: any) {
      console.error('[RecordingSession] Time sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Start recording WebSocket data
   */
  private async startRecording(): Promise<void> {
    try {
      console.log('[RecordingSession] Starting data recording...');
      this.recordingStartTime = Date.now();

      // Update status
      await this.updateStatus('RECORDING');
      this.emit('status', { status: 'RECORDING' });

      // Subscribe to WebSocket price stream
      await this.subscribeToWebSocket();

      // Schedule recording end
      const recordingDuration = (this.config.preRecordingSeconds + this.config.postRecordingSeconds) * 1000;
      setTimeout(async () => {
        await this.stopRecording();
      }, recordingDuration);

    } catch (error: any) {
      console.error('[RecordingSession] Failed to start recording:', error.message);
      await this.handleError(error);
    }
  }

  /**
   * Subscribe to exchange WebSocket for price data
   */
  private async subscribeToWebSocket(): Promise<void> {
    try {
      const exchangeName = this.config.exchange;
      console.log(`[RecordingSession] Subscribing to ${exchangeName} WebSocket for ${this.config.symbol}...`);

      // Convert symbol format: "ZORA/USDT" -> "ZORAUSDT"
      const normalizedSymbol = this.config.symbol.replace('/', '');
      console.log(`[RecordingSession] Using symbol format: ${normalizedSymbol}`);

      // Use exchange service WebSocket subscription
      this.exchangeService.subscribeToTicker(normalizedSymbol, (data: any) => {
        this.handleWebSocketData(data);
      });

      console.log(`[RecordingSession] ${exchangeName} WebSocket subscription active`);
    } catch (error: any) {
      console.error('[RecordingSession] Failed to subscribe to WebSocket:', error.message);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket data
   */
  private handleWebSocketData(data: any): void {
    try {
      // Debug: Log all incoming data to diagnose issues
      if (this.dataBuffer.length === 0) {
        console.log('[RecordingSession] First WebSocket data received:', JSON.stringify(data).substring(0, 200));
      }

      // Skip if not recording
      if (this.status !== 'RECORDING') {
        console.log('[RecordingSession] Skipping data - status:', this.status);
        return;
      }

      // Extract data from exchange WebSocket format
      // Both Bybit and Binance services transform data to consistent format:
      // { topic: 'tickers.BTCUSDT', type: 'snapshot', data: {...}, ts: 1234567890 }
      // Convert symbol format for comparison: "ZORA/USDT" -> "ZORAUSDT"
      const normalizedSymbol = this.config.symbol.replace('/', '');
      if (!data.topic || !data.topic.includes(`tickers.${normalizedSymbol}`)) {
        console.log(`[RecordingSession] Skipping data - topic mismatch. Expected: tickers.${normalizedSymbol}, Got: ${data.topic}`);
        return;
      }

      if (!data.data) {
        return;
      }

      const ticker = data.data;
      const exchangeTimestamp = BigInt(data.ts || Date.now()); // Exchange server timestamp (Bybit or Binance)
      const localTimestamp = BigInt(Date.now());
      // Use exchange timestamp for accurate timing relative to exchange server time
      const relativeTimeMs = Number(exchangeTimestamp) - this.fundingPaymentTimestamp;

      // Parse price data
      const lastPrice = parseFloat(ticker.lastPrice);
      if (isNaN(lastPrice) || lastPrice <= 0) {
        return; // Skip invalid data
      }

      // Calculate bid-ask spread
      const bid1Price = ticker.bid1Price ? parseFloat(ticker.bid1Price) : undefined;
      const ask1Price = ticker.ask1Price ? parseFloat(ticker.ask1Price) : undefined;
      const bidAskSpread = (bid1Price && ask1Price) ? ask1Price - bid1Price : undefined;

      // Create data point
      const dataPoint: RecordedDataPoint = {
        bybitTimestamp: exchangeTimestamp, // Store as bybitTimestamp for DB compatibility
        localTimestamp,
        relativeTimeMs,
        lastPrice,
        markPrice: ticker.markPrice ? parseFloat(ticker.markPrice) : undefined,
        indexPrice: ticker.indexPrice ? parseFloat(ticker.indexPrice) : undefined,
        bid1Price,
        ask1Price,
        bidAskSpread,
        volume24h: ticker.volume24h ? parseFloat(ticker.volume24h) : undefined,
        turnover24h: ticker.turnover24h ? parseFloat(ticker.turnover24h) : undefined,
        openInterest: ticker.openInterest ? parseFloat(ticker.openInterest) : undefined,
        bid1Size: ticker.bid1Size ? parseFloat(ticker.bid1Size) : undefined,
        ask1Size: ticker.ask1Size ? parseFloat(ticker.ask1Size) : undefined,
        updateType: data.type, // "snapshot" or "delta"
        sequence: data.seq ? BigInt(data.seq) : undefined,
      };

      // Add to buffer
      this.dataBuffer.push(dataPoint);

      // Log progress every 10 data points
      if (this.dataBuffer.length % 10 === 1) {
        console.log(`[RecordingSession] Captured ${this.dataBuffer.length} data points (relativeTime: ${relativeTimeMs}ms, price: ${lastPrice})`);
      }

      // Emit data point for real-time UI updates
      this.emit('dataPoint', {
        ...dataPoint,
        totalPoints: this.dataBuffer.length,
      });

    } catch (error: any) {
      console.error('[RecordingSession] Error handling WebSocket data:', error.message);
    }
  }

  /**
   * Stop recording and save data to database
   */
  private async stopRecording(): Promise<void> {
    try {
      console.log('[RecordingSession] Stopping recording...');

      // Unsubscribe from WebSocket
      if (this.wsUnsubscribe) {
        this.wsUnsubscribe();
      }
      this.exchangeService.unsubscribeAll();

      // Stop timers
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
      }
      if (this.statusUpdateTimer) {
        clearInterval(this.statusUpdateTimer);
      }

      console.log(`[RecordingSession] Recorded ${this.dataBuffer.length} data points`);

      // Save data to database
      await this.saveToDatabase();

      // Calculate analytics
      await this.calculateAnalytics();

      // Update status
      await this.updateStatus('COMPLETED');
      this.emit('status', { status: 'COMPLETED', totalPoints: this.dataBuffer.length });

      console.log('[RecordingSession] Recording completed successfully');
    } catch (error: any) {
      console.error('[RecordingSession] Failed to stop recording:', error.message);
      await this.handleError(error);
    }
  }

  /**
   * Save recorded data to database
   */
  private async saveToDatabase(): Promise<void> {
    if (!this.sessionId) {
      throw new Error('Session ID not set');
    }

    console.log(`[RecordingSession] Saving ${this.dataBuffer.length} points to database...`);

    // Batch insert data points (Prisma createMany is more efficient)
    const batchSize = 1000;
    for (let i = 0; i < this.dataBuffer.length; i += batchSize) {
      const batch = this.dataBuffer.slice(i, i + batchSize);

      await prisma.fundingPaymentDataPoint.createMany({
        data: batch.map(point => ({
          sessionId: this.sessionId!,
          bybitTimestamp: point.bybitTimestamp,
          localTimestamp: point.localTimestamp,
          relativeTimeMs: point.relativeTimeMs,
          lastPrice: point.lastPrice,
          markPrice: point.markPrice,
          indexPrice: point.indexPrice,
          bid1Price: point.bid1Price,
          ask1Price: point.ask1Price,
          bidAskSpread: point.bidAskSpread,
          volume24h: point.volume24h,
          turnover24h: point.turnover24h,
          openInterest: point.openInterest,
          bid1Size: point.bid1Size,
          ask1Size: point.ask1Size,
          updateType: point.updateType,
          sequence: point.sequence,
        })),
      });

      console.log(`[RecordingSession] Saved batch ${i / batchSize + 1} (${batch.length} points)`);
    }

    // Update session with total points
    await prisma.fundingPaymentRecordingSession.update({
      where: { id: this.sessionId },
      data: {
        totalDataPoints: this.dataBuffer.length,
        completedAt: new Date(),
      },
    });

    console.log('[RecordingSession] All data saved to database');
  }

  /**
   * Calculate analytics from recorded data
   */
  private async calculateAnalytics(): Promise<void> {
    if (!this.sessionId || this.dataBuffer.length === 0) {
      return;
    }

    console.log('[RecordingSession] Calculating analytics...');

    // Find data points before and after funding payment
    const beforePoints = this.dataBuffer.filter(p => p.relativeTimeMs < 0);
    const afterPoints = this.dataBuffer.filter(p => p.relativeTimeMs >= 0);

    if (beforePoints.length === 0 || afterPoints.length === 0) {
      console.warn('[RecordingSession] Insufficient data for analytics');
      return;
    }

    // Get price at funding payment (or closest to it)
    const closestToPayment = this.dataBuffer.reduce((closest, point) =>
      Math.abs(point.relativeTimeMs) < Math.abs(closest.relativeTimeMs) ? point : closest
    );
    const paymentPrice = closestToPayment.lastPrice;

    // Find maximum price drop
    let maxDropPercent = 0;
    let maxDropPoint: RecordedDataPoint | undefined;

    for (const point of afterPoints) {
      const dropPercent = ((paymentPrice - point.lastPrice) / paymentPrice) * 100;
      if (dropPercent > maxDropPercent) {
        maxDropPercent = dropPercent;
        maxDropPoint = point;
      }
    }

    // Calculate when price started dropping
    let priceDropStartTimeMs: number | undefined;
    for (const point of afterPoints) {
      const dropPercent = ((paymentPrice - point.lastPrice) / paymentPrice) * 100;
      if (dropPercent > 0.01) { // 0.01% threshold
        priceDropStartTimeMs = point.relativeTimeMs;
        break;
      }
    }

    // Calculate optimal entry (point with best risk/reward)
    // This is simplified - can be improved with more sophisticated analysis
    const optimalEntryPoint = maxDropPoint;
    const optimalTakeProfit = optimalEntryPoint
      ? optimalEntryPoint.lastPrice * 1.005 // Example: 0.5% profit target
      : undefined;

    // Update session with analytics
    await prisma.fundingPaymentRecordingSession.update({
      where: { id: this.sessionId },
      data: {
        priceDropPercent: maxDropPercent,
        priceDropStartTimeMs,
        maxPriceDropPercent: maxDropPercent,
        optimalEntryTimeMs: optimalEntryPoint?.relativeTimeMs,
        optimalEntryPrice: optimalEntryPoint?.lastPrice,
        optimalTakeProfitPrice: optimalTakeProfit,
      },
    });

    console.log('[RecordingSession] Analytics calculated:', {
      maxDropPercent: maxDropPercent.toFixed(4) + '%',
      dropStartTimeMs: priceDropStartTimeMs + 'ms',
      optimalEntryTimeMs: optimalEntryPoint?.relativeTimeMs + 'ms',
      optimalEntryPrice: optimalEntryPoint?.lastPrice,
    });

    this.emit('analytics', {
      maxDropPercent,
      priceDropStartTimeMs,
      optimalEntryTimeMs: optimalEntryPoint?.relativeTimeMs,
      optimalEntryPrice: optimalEntryPoint?.lastPrice,
    });
  }

  /**
   * Update session status
   */
  private async updateStatus(status: RecordingStatus): Promise<void> {
    this.status = status;

    if (this.sessionId) {
      await prisma.fundingPaymentRecordingSession.update({
        where: { id: this.sessionId },
        data: {
          status,
          ...(status === 'RECORDING' && { startedAt: new Date() }),
        },
      });
    }
  }

  /**
   * Handle errors
   */
  private async handleError(error: Error): Promise<void> {
    this.status = 'ERROR';

    if (this.sessionId) {
      await prisma.fundingPaymentRecordingSession.update({
        where: { id: this.sessionId },
        data: {
          status: 'ERROR',
          errorMessage: error.message,
        },
      });
    }

    this.emit('error', error);
  }

  /**
   * Send periodic status updates to client
   */
  private startStatusUpdates(): void {
    this.statusUpdateTimer = setInterval(() => {
      const now = Date.now();
      const millisecondsUntilPayment = this.fundingPaymentTimestamp - now;

      this.emit('countdown', {
        status: this.status,
        millisecondsUntilPayment,
        secondsUntilPayment: Math.max(0, Math.floor(millisecondsUntilPayment / 1000)),
        dataPointsRecorded: this.dataBuffer.length,
      });
    }, 1000); // Update every second
  }

  /**
   * Cancel the recording session
   */
  async cancel(): Promise<void> {
    console.log('[RecordingSession] Cancelling session...');

    // Clean up
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
    }
    if (this.statusUpdateTimer) {
      clearInterval(this.statusUpdateTimer);
    }
    if (this.wsUnsubscribe) {
      this.wsUnsubscribe();
    }
    this.exchangeService.unsubscribeAll();

    // Update status
    await this.updateStatus('CANCELLED');
    this.emit('status', { status: 'CANCELLED' });

    console.log('[RecordingSession] Session cancelled');
  }

  /**
   * Get current session data
   */
  getSessionData() {
    return {
      sessionId: this.sessionId,
      status: this.status,
      config: this.config,
      timeSyncResult: this.timeSyncResult,
      dataPointsRecorded: this.dataBuffer.length,
      fundingPaymentTimestamp: this.fundingPaymentTimestamp,
    };
  }
}

// Global session storage to persist across Next.js hot reloads
declare global {
  var __fundingPaymentRecordingSessions: Map<string, RecordingSession> | undefined;
}

global.__fundingPaymentRecordingSessions = global.__fundingPaymentRecordingSessions || new Map();

/**
 * Funding Payment Recorder Service
 *
 * Manages multiple recording sessions
 */
export class FundingPaymentRecorderService {
  private static get activeSessions(): Map<string, RecordingSession> {
    return global.__fundingPaymentRecordingSessions!;
  }

  /**
   * Start a new recording session
   */
  static async startRecording(
    config: RecordingConfig,
    exchangeService: ExchangeService
  ): Promise<RecordingSession> {
    console.log('[FundingPaymentRecorderService] Starting new recording session:', config);

    const session = new RecordingSession(config, exchangeService);
    const sessionId = await session.start();

    this.activeSessions.set(sessionId, session);

    // Auto-remove from active sessions when completed/error/cancelled
    session.once('status', (data) => {
      if (['COMPLETED', 'ERROR', 'CANCELLED'].includes(data.status)) {
        setTimeout(() => {
          this.activeSessions.delete(sessionId);
        }, 60000); // Keep for 1 minute after completion
      }
    });

    return session;
  }

  /**
   * Get active session by ID
   */
  static getSession(sessionId: string): RecordingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Cancel a recording session
   */
  static async cancelSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      await session.cancel();
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Get all active sessions
   */
  static getActiveSessions(): RecordingSession[] {
    return Array.from(this.activeSessions.values());
  }
}
