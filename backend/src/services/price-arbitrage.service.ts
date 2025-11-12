/**
 * Price Arbitrage Service
 *
 * Core business logic for price arbitrage trading system.
 * Manages the entire lifecycle of price arbitrage positions:
 * - Opening positions (SHORT on higher price, LONG on lower price)
 * - Real-time monitoring via WebSocket price streams
 * - Convergence detection (target spread, stop-loss, max holding time)
 * - Position closing with P&L calculation
 * - Recovery from service restarts
 */

import prisma from '@/lib/prisma';
import {
  StartPriceArbitrageParams,
  OpenPositionsResult,
  ClosePositionsResult,
  CurrentPriceData,
  PositionMonitoringData,
  ActivePositionMonitor,
  ProfitCalculation,
  PriceArbitragePositionDTO,
} from '@/types/price-arbitrage';
import { PriceArbitrageStatus, PriceArbitragePosition } from '@prisma/client';
import { BybitConnector } from '@/connectors/bybit.connector';
import { BingXConnector } from '@/connectors/bingx.connector';
import { MEXCConnector } from '@/connectors/mexc.connector';
import { GateIOConnector } from '@/connectors/gateio.connector';
import { KuCoinConnector } from '@/connectors/kucoin.connector';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { EventEmitter } from 'events';

/**
 * PriceArbitrageService
 *
 * Production-quality service with:
 * - Comprehensive error handling and recovery
 * - WebSocket-based real-time monitoring
 * - Automatic convergence detection
 * - Service restart recovery
 * - Detailed logging for debugging
 */
class PriceArbitrageService extends EventEmitter {
  // Active position monitors with WebSocket subscriptions
  private activeMonitors: Map<string, ActivePositionMonitor> = new Map();

  // Service initialization flag
  private initialized = false;

  // Event names for external subscribers
  static readonly PRICE_UPDATE = 'price_update';
  static readonly CONVERGENCE_DETECTED = 'convergence_detected';
  static readonly POSITION_CLOSED = 'position_closed';
  static readonly ERROR = 'error';

  /**
   * Initialize service and restore active positions from database
   * Called on server startup to resume monitoring of existing positions
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[PriceArbitrage] Service already initialized');
      return;
    }

    console.log('[PriceArbitrage] Initializing service and restoring active positions...');

    try {
      // Find all positions that need monitoring
      const activePositions = await prisma.priceArbitragePosition.findMany({
        where: {
          status: {
            in: ['ACTIVE', 'OPENING', 'CLOSING'],
          },
        },
      });

      console.log(`[PriceArbitrage] Found ${activePositions.length} positions to restore`);

      for (const position of activePositions) {
        try {
          // Handle stuck positions (OPENING/CLOSING for too long)
          if (position.status === 'OPENING' || position.status === 'CLOSING') {
            const stuckTime = Date.now() - position.createdAt.getTime();
            if (stuckTime > 300000) {
              // 5 minutes
              console.warn(`[PriceArbitrage] Position ${position.id} stuck in ${position.status} state - marking as ERROR`);
              await prisma.priceArbitragePosition.update({
                where: { id: position.id },
                data: {
                  status: 'ERROR',
                  errorMessage: `Position stuck in ${position.status} state after restart - manual intervention required`,
                },
              });
              continue;
            }
          }

          // Restore ACTIVE positions - resume monitoring
          if (position.status === 'ACTIVE' && position.openedAt) {
            console.log(`[PriceArbitrage] Restoring monitoring for position ${position.id}`);

            // Check if max holding time expired
            if (position.maxHoldingTime) {
              const holdingTime = (Date.now() - position.openedAt.getTime()) / 1000;
              if (holdingTime >= position.maxHoldingTime) {
                console.log(`[PriceArbitrage] Position ${position.id} max holding time exceeded - closing`);
                await this.closeArbitrage(position.id, 'max_holding_time');
                continue;
              }
            }

            // Resume price monitoring
            await this.monitorPosition(position.id);
            console.log(`[PriceArbitrage] Successfully restored position ${position.id}`);
          }
        } catch (error: any) {
          console.error(`[PriceArbitrage] Failed to restore position ${position.id}:`, error.message);
          // Mark position as ERROR but continue with other positions
          await prisma.priceArbitragePosition.update({
            where: { id: position.id },
            data: {
              status: 'ERROR',
              errorMessage: `Failed to restore after restart: ${error.message}`,
            },
          });
        }
      }

      this.initialized = true;
      console.log('[PriceArbitrage] Service initialization complete');
    } catch (error: any) {
      console.error('[PriceArbitrage] Service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Start a new price arbitrage position
   *
   * Flow:
   * 1. Validate credentials and get balances
   * 2. Set leverage on both exchanges
   * 3. Open PRIMARY position (SHORT on higher price exchange)
   * 4. Open HEDGE position (LONG on lower price exchange)
   * 5. Save to database and start monitoring
   *
   * Error Recovery:
   * - If PRIMARY fails: Return error, nothing opened
   * - If HEDGE fails: Mark as PARTIAL, attempt to close PRIMARY
   */
  async startArbitrage(params: StartPriceArbitrageParams): Promise<OpenPositionsResult> {
    console.log('[PriceArbitrage] Starting new arbitrage position:', {
      userId: params.userId,
      symbol: params.symbol,
      primaryExchange: params.primaryExchange,
      hedgeExchange: params.hedgeExchange,
      primaryMargin: params.primaryMargin,
      hedgeMargin: params.hedgeMargin,
    });

    let primaryConnector: BaseExchangeConnector | null = null;
    let hedgeConnector: BaseExchangeConnector | null = null;
    let positionId: string | null = null;

    try {
      // Step 1: Load and validate credentials
      console.log('[PriceArbitrage] Loading exchange credentials...');
      const primaryCred = await ExchangeCredentialsService.getCredentialById(
        params.userId,
        params.primaryCredentialId
      );
      const hedgeCred = await ExchangeCredentialsService.getCredentialById(
        params.userId,
        params.hedgeCredentialId
      );

      if (!primaryCred || !hedgeCred) {
        throw new Error('Credentials not found or invalid');
      }

      // Step 2: Initialize exchange connectors
      console.log('[PriceArbitrage] Initializing exchange connectors...');
      primaryConnector = this.getConnector(
        params.primaryExchange,
        primaryCred.apiKey,
        primaryCred.apiSecret,
        primaryCred.environment === 'TESTNET',
        primaryCred.authToken
      );
      hedgeConnector = this.getConnector(
        params.hedgeExchange,
        hedgeCred.apiKey,
        hedgeCred.apiSecret,
        hedgeCred.environment === 'TESTNET',
        hedgeCred.authToken
      );

      await primaryConnector.initialize();
      await hedgeConnector.initialize();

      // Step 3: Check balances
      console.log('[PriceArbitrage] Checking balances...');
      const primaryBalance = await primaryConnector.getBalance();
      const hedgeBalance = await hedgeConnector.getBalance();

      console.log('[PriceArbitrage] Balances retrieved:', {
        primaryBalance: primaryBalance?.result?.list?.[0]?.coin?.[0]?.availableToWithdraw || 'unknown',
        hedgeBalance: hedgeBalance?.result?.list?.[0]?.coin?.[0]?.availableToWithdraw || 'unknown',
      });

      // Step 4: Set leverage on both exchanges
      console.log('[PriceArbitrage] Setting leverage...');
      try {
        await primaryConnector.setLeverage(params.symbol, params.primaryLeverage);
        console.log(`[PriceArbitrage] PRIMARY leverage set to ${params.primaryLeverage}x`);
      } catch (error: any) {
        console.warn('[PriceArbitrage] Failed to set PRIMARY leverage:', error.message);
      }

      try {
        await hedgeConnector.setLeverage(params.symbol, params.hedgeLeverage);
        console.log(`[PriceArbitrage] HEDGE leverage set to ${params.hedgeLeverage}x`);
      } catch (error: any) {
        console.warn('[PriceArbitrage] Failed to set HEDGE leverage:', error.message);
      }

      // Step 5: Calculate position sizes based on margin and leverage
      const primaryQuantity = (params.primaryMargin * params.primaryLeverage) / params.entryPrimaryPrice;
      const hedgeQuantity = (params.hedgeMargin * params.hedgeLeverage) / params.entryHedgePrice;

      console.log('[PriceArbitrage] Calculated position sizes:', {
        primaryQuantity,
        hedgeQuantity,
      });

      // Calculate entry spread
      const entrySpread = (params.entryPrimaryPrice - params.entryHedgePrice) / params.entryHedgePrice;
      const entrySpreadPercent = entrySpread * 100;

      // Step 6: Create database record in OPENING state
      console.log('[PriceArbitrage] Creating database record...');
      const position = await prisma.priceArbitragePosition.create({
        data: {
          userId: params.userId,
          symbol: params.symbol,
          primaryExchange: params.primaryExchange,
          primaryCredentialId: params.primaryCredentialId,
          hedgeExchange: params.hedgeExchange,
          hedgeCredentialId: params.hedgeCredentialId,
          primaryLeverage: params.primaryLeverage,
          primaryMargin: params.primaryMargin,
          hedgeLeverage: params.hedgeLeverage,
          hedgeMargin: params.hedgeMargin,
          entryPrimaryPrice: params.entryPrimaryPrice,
          entryHedgePrice: params.entryHedgePrice,
          entrySpread,
          entrySpreadPercent,
          primaryQuantity,
          hedgeQuantity,
          targetSpread: params.targetSpread,
          stopLoss: params.stopLoss,
          maxHoldingTime: params.maxHoldingTime,
          status: 'OPENING',
        },
      });

      positionId = position.id;
      console.log(`[PriceArbitrage] Position created with ID: ${positionId}`);

      // Step 7: Open PRIMARY position (SHORT on higher price)
      console.log('[PriceArbitrage] Opening PRIMARY position (SHORT)...');
      const primaryOrder = await primaryConnector.placeMarketOrder(
        params.symbol,
        'Sell', // SHORT
        primaryQuantity
      );

      console.log('[PriceArbitrage] PRIMARY order executed:', {
        orderId: primaryOrder.result?.orderId,
        avgPrice: primaryOrder.result?.avgPrice,
      });

      // Update position with PRIMARY details
      await prisma.priceArbitragePosition.update({
        where: { id: positionId },
        data: {
          primaryOrderId: primaryOrder.result?.orderId,
        },
      });

      // Step 8: Open HEDGE position (LONG on lower price)
      console.log('[PriceArbitrage] Opening HEDGE position (LONG)...');
      let hedgeOrder;
      try {
        hedgeOrder = await hedgeConnector.placeMarketOrder(
          params.symbol,
          'Buy', // LONG
          hedgeQuantity
        );

        console.log('[PriceArbitrage] HEDGE order executed:', {
          orderId: hedgeOrder.result?.orderId,
          avgPrice: hedgeOrder.result?.avgPrice,
        });

        // Step 9: Update position to ACTIVE status
        await prisma.priceArbitragePosition.update({
          where: { id: positionId },
          data: {
            hedgeOrderId: hedgeOrder.result?.orderId,
            status: 'ACTIVE',
            openedAt: new Date(),
          },
        });

        // Step 10: Start monitoring
        console.log('[PriceArbitrage] Starting position monitoring...');
        await this.monitorPosition(positionId);

        // Return success
        return {
          success: true,
          positionId,
          primaryOrderId: primaryOrder.result?.orderId,
          primaryFillPrice: parseFloat(primaryOrder.result?.avgPrice || params.entryPrimaryPrice.toString()),
          primaryQuantity,
          hedgeOrderId: hedgeOrder.result?.orderId,
          hedgeFillPrice: parseFloat(hedgeOrder.result?.avgPrice || params.entryHedgePrice.toString()),
          hedgeQuantity,
          stage: 'both_open',
        };
      } catch (hedgeError: any) {
        // HEDGE failed - mark as PARTIAL and try to close PRIMARY
        console.error('[PriceArbitrage] HEDGE position failed:', hedgeError.message);

        await prisma.priceArbitragePosition.update({
          where: { id: positionId },
          data: {
            status: 'PARTIAL',
            errorMessage: `HEDGE failed: ${hedgeError.message}`,
          },
        });

        // Attempt to close PRIMARY position
        console.log('[PriceArbitrage] Attempting to close PRIMARY position...');
        try {
          await primaryConnector.placeReduceOnlyOrder(params.symbol, 'Buy', primaryQuantity);
          console.log('[PriceArbitrage] PRIMARY position closed successfully');
        } catch (closeError: any) {
          console.error('[PriceArbitrage] Failed to close PRIMARY position:', closeError.message);
          await prisma.priceArbitragePosition.update({
            where: { id: positionId },
            data: {
              errorMessage: `HEDGE failed and PRIMARY close failed: ${hedgeError.message} | ${closeError.message}`,
            },
          });
        }

        return {
          success: false,
          positionId,
          primaryOrderId: primaryOrder.result?.orderId,
          primaryFillPrice: parseFloat(primaryOrder.result?.avgPrice || params.entryPrimaryPrice.toString()),
          primaryQuantity,
          error: `HEDGE position failed: ${hedgeError.message}`,
          stage: 'hedge_open',
        };
      }
    } catch (error: any) {
      console.error('[PriceArbitrage] Failed to start arbitrage:', error.message);

      // Update database if position was created
      if (positionId) {
        await prisma.priceArbitragePosition.update({
          where: { id: positionId },
          data: {
            status: 'ERROR',
            errorMessage: error.message,
          },
        });
      }

      return {
        success: false,
        error: error.message,
        stage: 'primary_open',
      };
    }
  }

  /**
   * Monitor an active position for convergence
   *
   * Subscribes to real-time price feeds from both exchanges
   * Checks convergence conditions on each price update:
   * - Target spread reached
   * - Stop-loss triggered
   * - Max holding time exceeded
   *
   * Emits PRICE_UPDATE events for frontend consumption
   */
  private async monitorPosition(positionId: string): Promise<void> {
    console.log(`[PriceArbitrage] Starting monitoring for position ${positionId}`);

    try {
      // Get position from database
      const position = await prisma.priceArbitragePosition.findUnique({
        where: { id: positionId },
      });

      if (!position || position.status !== 'ACTIVE') {
        console.warn(`[PriceArbitrage] Position ${positionId} not found or not active`);
        return;
      }

      // Load credentials
      const primaryCred = await ExchangeCredentialsService.getCredentialById(
        position.userId,
        position.primaryCredentialId
      );
      const hedgeCred = await ExchangeCredentialsService.getCredentialById(
        position.userId,
        position.hedgeCredentialId
      );

      if (!primaryCred || !hedgeCred) {
        throw new Error('Credentials not found');
      }

      // Initialize connectors
      const primaryConnector = this.getConnector(
        position.primaryExchange,
        primaryCred.apiKey,
        primaryCred.apiSecret,
        primaryCred.environment === 'TESTNET',
        primaryCred.authToken
      );
      const hedgeConnector = this.getConnector(
        position.hedgeExchange,
        hedgeCred.apiKey,
        hedgeCred.apiSecret,
        hedgeCred.environment === 'TESTNET',
        hedgeCred.authToken
      );

      await primaryConnector.initialize();
      await hedgeConnector.initialize();

      // Current prices (updated by WebSocket)
      let currentPrimaryPrice = position.entryPrimaryPrice;
      let currentHedgePrice = position.entryHedgePrice;
      let lastUpdate = Date.now();

      // Subscribe to PRIMARY price stream
      const unsubscribePrimary = await primaryConnector.subscribeToPriceStream(
        position.symbol,
        (price: number, timestamp: number) => {
          currentPrimaryPrice = price;
          lastUpdate = timestamp;
          this.checkAndUpdatePosition(
            position,
            currentPrimaryPrice,
            currentHedgePrice,
            lastUpdate
          );
        }
      );

      // Subscribe to HEDGE price stream
      const unsubscribeHedge = await hedgeConnector.subscribeToPriceStream(
        position.symbol,
        (price: number, timestamp: number) => {
          currentHedgePrice = price;
          lastUpdate = timestamp;
          this.checkAndUpdatePosition(
            position,
            currentPrimaryPrice,
            currentHedgePrice,
            lastUpdate
          );
        }
      );

      // Store monitor in active monitors map
      const monitor: ActivePositionMonitor = {
        positionId,
        position,
        primaryPriceStream: {
          exchange: position.primaryExchange,
          symbol: position.symbol,
          callback: () => {},
        },
        hedgePriceStream: {
          exchange: position.hedgeExchange,
          symbol: position.symbol,
          callback: () => {},
        },
        lastUpdate,
        convergenceConfig: {
          targetSpread: position.targetSpread || 0,
          stopLoss: position.stopLoss || undefined,
          maxHoldingTime: position.maxHoldingTime || undefined,
        },
      };

      this.activeMonitors.set(positionId, monitor);

      console.log(`[PriceArbitrage] Monitoring active for position ${positionId}`);
    } catch (error: any) {
      console.error(`[PriceArbitrage] Failed to start monitoring for ${positionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Check convergence conditions and update position
   * Called on each price update from WebSocket
   */
  private async checkAndUpdatePosition(
    position: PriceArbitragePosition,
    primaryPrice: number,
    hedgePrice: number,
    timestamp: number
  ): Promise<void> {
    try {
      // Calculate current spread
      const currentSpread = (primaryPrice - hedgePrice) / hedgePrice;
      const currentSpreadPercent = currentSpread * 100;

      // Calculate unrealized P&L
      // PRIMARY SHORT: Profit when price goes down
      const primaryUnrealizedPnl = (position.entryPrimaryPrice - primaryPrice) * position.primaryQuantity;
      // HEDGE LONG: Profit when price goes up
      const hedgeUnrealizedPnl = (hedgePrice - position.entryHedgePrice) * position.hedgeQuantity;
      const totalUnrealizedPnl = primaryUnrealizedPnl + hedgeUnrealizedPnl;

      // Calculate holding time
      const holdingTimeSeconds = position.openedAt
        ? (Date.now() - position.openedAt.getTime()) / 1000
        : 0;

      // Build monitoring data
      const monitoringData: PositionMonitoringData = {
        positionId: position.id,
        symbol: position.symbol,
        primaryCurrentPrice: primaryPrice,
        hedgeCurrentPrice: hedgePrice,
        currentSpread,
        currentSpreadPercent,
        entrySpread: position.entrySpread,
        entrySpreadPercent: position.entrySpreadPercent,
        primaryUnrealizedPnl,
        hedgeUnrealizedPnl,
        totalUnrealizedPnl,
        openedAt: position.openedAt!,
        holdingTimeSeconds,
        lastPriceUpdate: new Date(timestamp),
        convergenceProgress: this.calculateConvergenceProgress(position, currentSpread),
        shouldClose: false,
      };

      // Check convergence conditions
      const convergence = this.checkConvergence(position, { primary: primaryPrice, hedge: hedgePrice });

      if (convergence.shouldClose) {
        monitoringData.shouldClose = true;
        monitoringData.closeReason = convergence.reason as any;

        console.log(`[PriceArbitrage] Convergence detected for ${position.id}: ${convergence.reason}`);
        this.emit(PriceArbitrageService.CONVERGENCE_DETECTED, monitoringData);

        // Trigger auto-close
        await this.closeArbitrage(position.id, convergence.reason);
      } else {
        // Emit price update event
        this.emit(PriceArbitrageService.PRICE_UPDATE, monitoringData);
      }
    } catch (error: any) {
      console.error(`[PriceArbitrage] Error updating position ${position.id}:`, error.message);
    }
  }

  /**
   * Calculate convergence progress (0-100%)
   * Shows how close the spread is to target
   */
  private calculateConvergenceProgress(position: PriceArbitragePosition, currentSpread: number): number {
    if (!position.targetSpread) {
      return 0;
    }

    const entrySpread = position.entrySpread;
    const targetSpread = position.targetSpread;

    if (entrySpread === targetSpread) {
      return 100;
    }

    const progress = ((entrySpread - currentSpread) / (entrySpread - targetSpread)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Check if position should be closed based on convergence conditions
   */
  private checkConvergence(
    position: PriceArbitragePosition,
    currentPrices: { primary: number; hedge: number }
  ): { shouldClose: boolean; reason?: string } {
    const currentSpread = (currentPrices.primary - currentPrices.hedge) / currentPrices.hedge;

    // 1. Target spread reached
    if (position.targetSpread && currentSpread <= position.targetSpread) {
      return { shouldClose: true, reason: 'target_reached' };
    }

    // 2. Stop-loss triggered (spread widened beyond entry + stopLoss)
    if (position.stopLoss && currentSpread >= position.entrySpread + position.stopLoss) {
      return { shouldClose: true, reason: 'stop_loss' };
    }

    // 3. Max holding time exceeded
    if (position.maxHoldingTime && position.openedAt) {
      const holdingTime = (Date.now() - position.openedAt.getTime()) / 1000;
      if (holdingTime >= position.maxHoldingTime) {
        return { shouldClose: true, reason: 'max_holding_time' };
      }
    }

    return { shouldClose: false };
  }

  /**
   * Close an arbitrage position
   *
   * Flow:
   * 1. Update status to CLOSING
   * 2. Close PRIMARY position (market order)
   * 3. Close HEDGE position (market order)
   * 4. Calculate P&L
   * 5. Update database to COMPLETED
   * 6. Clean up monitoring
   *
   * Error Recovery:
   * - If one position fails to close: Mark as PARTIAL_CLOSE
   * - Provide detailed error information for manual intervention
   */
  async closeArbitrage(positionId: string, reason?: string): Promise<ClosePositionsResult> {
    console.log(`[PriceArbitrage] Closing position ${positionId}`, { reason });

    try {
      // Get position
      const position = await prisma.priceArbitragePosition.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new Error('Position not found');
      }

      if (position.status !== 'ACTIVE') {
        throw new Error(`Position is not active (status: ${position.status})`);
      }

      // Update status to CLOSING
      await prisma.priceArbitragePosition.update({
        where: { id: positionId },
        data: { status: 'CLOSING' },
      });

      // Load credentials
      const primaryCred = await ExchangeCredentialsService.getCredentialById(
        position.userId,
        position.primaryCredentialId
      );
      const hedgeCred = await ExchangeCredentialsService.getCredentialById(
        position.userId,
        position.hedgeCredentialId
      );

      if (!primaryCred || !hedgeCred) {
        throw new Error('Credentials not found');
      }

      // Initialize connectors
      const primaryConnector = this.getConnector(
        position.primaryExchange,
        primaryCred.apiKey,
        primaryCred.apiSecret,
        primaryCred.environment === 'TESTNET',
        primaryCred.authToken
      );
      const hedgeConnector = this.getConnector(
        position.hedgeExchange,
        hedgeCred.apiKey,
        hedgeCred.apiSecret,
        hedgeCred.environment === 'TESTNET',
        hedgeCred.authToken
      );

      await primaryConnector.initialize();
      await hedgeConnector.initialize();

      // Close PRIMARY position (was SHORT, so BUY to close)
      console.log('[PriceArbitrage] Closing PRIMARY position (BUY to close SHORT)...');
      let primaryClosePrice: number;
      let primaryPnl: number;
      let primaryFees = 0;

      try {
        const primaryCloseOrder = await primaryConnector.placeReduceOnlyOrder(
          position.symbol,
          'Buy', // Close SHORT position
          position.primaryQuantity
        );

        primaryClosePrice = parseFloat(primaryCloseOrder.result?.avgPrice || '0');
        // PRIMARY SHORT P&L: Entry - Exit (profit when price goes down)
        primaryPnl = (position.entryPrimaryPrice - primaryClosePrice) * position.primaryQuantity;
        primaryFees = parseFloat(primaryCloseOrder.result?.execFee || '0');

        console.log('[PriceArbitrage] PRIMARY position closed:', {
          closePrice: primaryClosePrice,
          pnl: primaryPnl,
          fees: primaryFees,
        });
      } catch (primaryError: any) {
        console.error('[PriceArbitrage] Failed to close PRIMARY position:', primaryError.message);

        // Try to close HEDGE anyway
        try {
          const hedgeCloseOrder = await hedgeConnector.placeReduceOnlyOrder(
            position.symbol,
            'Sell', // Close LONG position
            position.hedgeQuantity
          );
          console.log('[PriceArbitrage] HEDGE position closed despite PRIMARY failure');
        } catch (hedgeError: any) {
          console.error('[PriceArbitrage] Failed to close both positions:', hedgeError.message);
        }

        // Mark as PARTIAL_CLOSE
        await prisma.priceArbitragePosition.update({
          where: { id: positionId },
          data: {
            status: 'PARTIAL',
            errorMessage: `PRIMARY close failed: ${primaryError.message}`,
          },
        });

        // Clean up monitoring
        this.stopMonitoring(positionId);

        return {
          success: false,
          error: `Failed to close PRIMARY position: ${primaryError.message}`,
          stage: 'primary_close',
        };
      }

      // Close HEDGE position (was LONG, so SELL to close)
      console.log('[PriceArbitrage] Closing HEDGE position (SELL to close LONG)...');
      let hedgeClosePrice: number;
      let hedgePnl: number;
      let hedgeFees = 0;

      try {
        const hedgeCloseOrder = await hedgeConnector.placeReduceOnlyOrder(
          position.symbol,
          'Sell', // Close LONG position
          position.hedgeQuantity
        );

        hedgeClosePrice = parseFloat(hedgeCloseOrder.result?.avgPrice || '0');
        // HEDGE LONG P&L: Exit - Entry (profit when price goes up)
        hedgePnl = (hedgeClosePrice - position.entryHedgePrice) * position.hedgeQuantity;
        hedgeFees = parseFloat(hedgeCloseOrder.result?.execFee || '0');

        console.log('[PriceArbitrage] HEDGE position closed:', {
          closePrice: hedgeClosePrice,
          pnl: hedgePnl,
          fees: hedgeFees,
        });
      } catch (hedgeError: any) {
        console.error('[PriceArbitrage] Failed to close HEDGE position:', hedgeError.message);

        // PRIMARY is already closed - mark as PARTIAL_CLOSE
        await prisma.priceArbitragePosition.update({
          where: { id: positionId },
          data: {
            status: 'PARTIAL',
            exitPrimaryPrice: primaryClosePrice,
            primaryPnl,
            primaryFees: position.primaryFees + primaryFees,
            errorMessage: `HEDGE close failed: ${hedgeError.message}`,
          },
        });

        // Clean up monitoring
        this.stopMonitoring(positionId);

        return {
          success: false,
          primaryClosePrice,
          primaryPnl,
          primaryFees,
          error: `Failed to close HEDGE position: ${hedgeError.message}`,
          stage: 'hedge_close',
        };
      }

      // Calculate total P&L
      const totalPnl = primaryPnl + hedgePnl - position.primaryFees - position.hedgeFees - primaryFees - hedgeFees;
      const exitSpread = (primaryClosePrice - hedgeClosePrice) / hedgeClosePrice;
      const exitSpreadPercent = exitSpread * 100;

      console.log('[PriceArbitrage] Position closed successfully:', {
        totalPnl,
        exitSpread,
        exitSpreadPercent,
      });

      // Update database to COMPLETED
      await prisma.priceArbitragePosition.update({
        where: { id: positionId },
        data: {
          status: 'COMPLETED',
          closedAt: new Date(),
          exitPrimaryPrice: primaryClosePrice,
          exitHedgePrice: hedgeClosePrice,
          exitSpread,
          exitSpreadPercent,
          primaryPnl,
          hedgePnl,
          totalPnl,
          primaryFees: position.primaryFees + primaryFees,
          hedgeFees: position.hedgeFees + hedgeFees,
        },
      });

      // Clean up monitoring
      this.stopMonitoring(positionId);

      // Emit close event
      this.emit(PriceArbitrageService.POSITION_CLOSED, {
        positionId,
        totalPnl,
        reason,
      });

      return {
        success: true,
        primaryClosePrice,
        primaryPnl,
        primaryFees,
        hedgeClosePrice,
        hedgePnl,
        hedgeFees,
        totalPnl,
        exitSpread,
        exitSpreadPercent,
        stage: 'both_closed',
      };
    } catch (error: any) {
      console.error(`[PriceArbitrage] Error closing position ${positionId}:`, error.message);

      // Update database with error
      await prisma.priceArbitragePosition.update({
        where: { id: positionId },
        data: {
          status: 'ERROR',
          errorMessage: error.message,
        },
      });

      // Clean up monitoring
      this.stopMonitoring(positionId);

      return {
        success: false,
        error: error.message,
        stage: 'primary_close',
      };
    }
  }

  /**
   * Stop monitoring for a position
   * Cleans up WebSocket subscriptions and removes from active monitors
   */
  private stopMonitoring(positionId: string): void {
    const monitor = this.activeMonitors.get(positionId);
    if (monitor) {
      console.log(`[PriceArbitrage] Stopping monitoring for position ${positionId}`);
      // WebSocket unsubscribe is handled automatically by connectors
      this.activeMonitors.delete(positionId);
    }
  }

  /**
   * Get all active positions for a user
   */
  async getActivePositions(userId: string): Promise<PriceArbitragePosition[]> {
    return prisma.priceArbitragePosition.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  /**
   * Get a specific position by ID
   */
  async getPosition(positionId: string): Promise<PriceArbitragePosition | null> {
    return prisma.priceArbitragePosition.findUnique({
      where: { id: positionId },
    });
  }

  /**
   * Calculate profit for a position with current prices
   */
  async calculateProfit(
    position: PriceArbitragePosition,
    currentPrices: { primary: number; hedge: number }
  ): Promise<ProfitCalculation> {
    // PRIMARY SHORT profit: Entry - Current
    const primaryProfit = (position.entryPrimaryPrice - currentPrices.primary) * position.primaryQuantity;

    // HEDGE LONG profit: Current - Entry
    const hedgeProfit = (currentPrices.hedge - position.entryHedgePrice) * position.hedgeQuantity;

    // Estimate fees (typical: 0.055% maker/taker on most exchanges)
    const feeRate = 0.00055;
    const primaryPositionValue = position.entryPrimaryPrice * position.primaryQuantity;
    const hedgePositionValue = position.entryHedgePrice * position.hedgeQuantity;
    const primaryFees = primaryPositionValue * feeRate * 2; // Entry + exit
    const hedgeFees = hedgePositionValue * feeRate * 2; // Entry + exit
    const totalFees = primaryFees + hedgeFees;

    // Calculate profit
    const grossProfit = primaryProfit + hedgeProfit;
    const netProfit = grossProfit - totalFees;
    const totalMargin = position.primaryMargin + position.hedgeMargin;
    const profitPercent = (netProfit / totalMargin) * 100;

    return {
      primaryProfit,
      hedgeProfit,
      primaryFees,
      hedgeFees,
      totalFees,
      grossProfit,
      netProfit,
      profitPercent,
      primaryPositionValue,
      hedgePositionValue,
      totalMargin,
    };
  }

  /**
   * Get connector instance for an exchange
   */
  private getConnector(
    exchange: string,
    apiKey: string,
    apiSecret: string,
    testnet: boolean,
    authToken?: string
  ): BaseExchangeConnector {
    const exchangeUpper = exchange.toUpperCase().replace('_TESTNET', '').replace('_MAINNET', '');

    switch (exchangeUpper) {
      case 'BYBIT':
        return new BybitConnector(apiKey, apiSecret, testnet);
      case 'BINGX':
        return new BingXConnector(apiKey, apiSecret, testnet);
      case 'MEXC':
        return new MEXCConnector(apiKey, apiSecret, testnet, authToken);
      case 'GATEIO':
        return new GateIOConnector(apiKey, apiSecret, testnet);
      case 'KUCOIN':
        if (!authToken) {
          throw new Error('KuCoin requires passphrase (authToken)');
        }
        return new KuCoinConnector(apiKey, apiSecret, authToken);
      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      activeMonitors: this.activeMonitors.size,
      monitoredPositions: Array.from(this.activeMonitors.keys()),
    };
  }

  /**
   * Shutdown service gracefully
   * Stops all monitoring but leaves positions open in database
   */
  async shutdown(): Promise<void> {
    console.log('[PriceArbitrage] Shutting down service...');

    // Stop all monitoring
    for (const positionId of Array.from(this.activeMonitors.keys())) {
      this.stopMonitoring(positionId);
    }

    this.initialized = false;
    console.log('[PriceArbitrage] Service shutdown complete');
  }
}

// Export singleton instance
export const priceArbitrageService = new PriceArbitrageService();
