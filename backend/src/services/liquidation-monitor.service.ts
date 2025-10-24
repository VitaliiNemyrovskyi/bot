/**
 * Liquidation Monitor Service
 *
 * Monitors active arbitrage positions for liquidation risk:
 * 1. Calculates liquidation prices and proximity
 * 2. Updates database with liquidation metrics
 * 3. Sends alerts when proximity > 80%
 * 4. OPTIONALLY auto-closes positions when proximity > 90% (if enabled)
 *
 * Protection Strategy Options:
 * A) Synchronized SL/TP: Set SL on one side = TP on other side (exchange-native)
 * B) Active monitoring: Monitor and close both positions when danger detected
 */

import { PrismaClient } from '@prisma/client';
import { LiquidationCalculator } from '@/lib/liquidation-calculator';
import { EventEmitter } from 'events';

interface MonitorConfig {
  checkIntervalMs: number;        // How often to check (default: 10000ms = 10s)
  dangerThreshold: number;        // Proximity threshold for warnings (default: 0.8 = 80%)
  criticalThreshold: number;      // Proximity threshold for auto-close (default: 0.9 = 90%)
  autoCloseEnabled: boolean;      // Whether to auto-close on critical proximity
}

interface PositionRisk {
  positionId: string;
  symbol: string;
  primaryProximity: number;
  hedgeProximity: number;
  primaryLiqPrice: number;
  hedgeLiqPrice: number;
  primaryInDanger: boolean;
  hedgeInDanger: boolean;
  shouldAutoClose: boolean;
}

export class LiquidationMonitorService extends EventEmitter {
  private prisma: PrismaClient;
  private monitorInterval: NodeJS.Timeout | null = null;
  private config: MonitorConfig;

  // Events
  static readonly POSITION_IN_DANGER = 'position_in_danger';
  static readonly POSITION_CRITICAL = 'position_critical';
  static readonly AUTO_CLOSE_TRIGGERED = 'auto_close_triggered';
  static readonly LIQUIDATION_UPDATED = 'liquidation_updated';

  constructor(config?: Partial<MonitorConfig>) {
    super();
    this.prisma = new PrismaClient();
    this.config = {
      checkIntervalMs: config?.checkIntervalMs || 10000, // 10 seconds
      dangerThreshold: config?.dangerThreshold || 0.8,   // 80%
      criticalThreshold: config?.criticalThreshold || 0.9, // 90%
      autoCloseEnabled: config?.autoCloseEnabled ?? true, // Default: enabled
    };
  }

  /**
   * Start monitoring all active positions
   */
  startMonitoring(): void {
    console.log('[LiquidationMonitor] Starting liquidation monitoring...', {
      checkInterval: `${this.config.checkIntervalMs}ms`,
      dangerThreshold: `${this.config.dangerThreshold * 100}%`,
      criticalThreshold: `${this.config.criticalThreshold * 100}%`,
      autoCloseEnabled: this.config.autoCloseEnabled,
    });

    // Run immediately
    this.checkAllPositions();

    // Then run periodically
    this.monitorInterval = setInterval(() => {
      this.checkAllPositions();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('[LiquidationMonitor] Stopped liquidation monitoring');
    }
  }

  /**
   * Check all active positions for liquidation risk
   */
  private async checkAllPositions(): Promise<void> {
    try {
      // Get all ACTIVE positions (not completed, error, or liquidated)
      const positions = await this.prisma.graduatedEntryPosition.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      if (positions.length === 0) {
        return; // No active positions
      }

      console.log(`[LiquidationMonitor] Checking ${positions.length} active position(s)...`);

      for (const position of positions) {
        try {
          await this.checkPosition(position);
        } catch (error: any) {
          console.error(`[LiquidationMonitor] Error checking position ${position.positionId}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error('[LiquidationMonitor] Error in checkAllPositions:', error.message);
    }
  }

  /**
   * Check a specific position for liquidation risk
   */
  private async checkPosition(position: any): Promise<void> {
    // Skip if entry prices are not available
    if (!position.primaryEntryPrice || !position.hedgeEntryPrice) {
      console.warn(`[LiquidationMonitor] Position ${position.positionId}: Entry prices not available, skipping`);
      return;
    }

    // Skip if current prices are not available
    if (!position.primaryCurrentPrice || !position.hedgeCurrentPrice) {
      console.warn(`[LiquidationMonitor] Position ${position.positionId}: Current prices not available, skipping`);
      return;
    }

    // Calculate liquidation prices
    const primaryLiq = LiquidationCalculator.calculateLiquidation(
      position.primaryExchange,
      {
        entryPrice: position.primaryEntryPrice,
        quantity: position.primaryFilledQty,
        leverage: position.primaryLeverage,
        side: position.primarySide,
      }
    );

    const hedgeLiq = LiquidationCalculator.calculateLiquidation(
      position.hedgeExchange,
      {
        entryPrice: position.hedgeEntryPrice,
        quantity: position.hedgeFilledQty,
        leverage: position.hedgeLeverage,
        side: position.hedgeSide,
      }
    );

    // Calculate proximity to liquidation
    const primaryProximity = LiquidationCalculator.calculateProximity(
      position.primaryCurrentPrice,
      position.primaryEntryPrice,
      primaryLiq.liquidationPrice,
      position.primarySide
    );

    const hedgeProximity = LiquidationCalculator.calculateProximity(
      position.hedgeCurrentPrice,
      position.hedgeEntryPrice,
      hedgeLiq.liquidationPrice,
      position.hedgeSide
    );

    // Check danger status
    const primaryInDanger = LiquidationCalculator.isInDanger(primaryProximity);
    const hedgeInDanger = LiquidationCalculator.isInDanger(hedgeProximity);
    const primaryCritical = LiquidationCalculator.isCritical(primaryProximity);
    const hedgeCritical = LiquidationCalculator.isCritical(hedgeProximity);

    // Update database
    await this.prisma.graduatedEntryPosition.update({
      where: { id: position.id },
      data: {
        primaryLiquidationPrice: primaryLiq.liquidationPrice,
        hedgeLiquidationPrice: hedgeLiq.liquidationPrice,
        primaryProximityRatio: primaryProximity,
        hedgeProximityRatio: hedgeProximity,
        primaryInDanger,
        hedgeInDanger,
        lastLiquidationCheck: new Date(),
      },
    });

    // Log status
    console.log(`[LiquidationMonitor] Position ${position.positionId} (${position.symbol}):`, {
      primary: {
        exchange: position.primaryExchange,
        side: position.primarySide,
        currentPrice: position.primaryCurrentPrice,
        liqPrice: primaryLiq.liquidationPrice.toFixed(6),
        proximity: `${(primaryProximity * 100).toFixed(1)}%`,
        inDanger: primaryInDanger,
        critical: primaryCritical,
      },
      hedge: {
        exchange: position.hedgeExchange,
        side: position.hedgeSide,
        currentPrice: position.hedgeCurrentPrice,
        liqPrice: hedgeLiq.liquidationPrice.toFixed(6),
        proximity: `${(hedgeProximity * 100).toFixed(1)}%`,
        inDanger: hedgeInDanger,
        critical: hedgeCritical,
      },
    });

    // Emit events and take action
    const risk: PositionRisk = {
      positionId: position.positionId,
      symbol: position.symbol,
      primaryProximity,
      hedgeProximity,
      primaryLiqPrice: primaryLiq.liquidationPrice,
      hedgeLiqPrice: hedgeLiq.liquidationPrice,
      primaryInDanger,
      hedgeInDanger,
      shouldAutoClose: (primaryCritical || hedgeCritical) && this.config.autoCloseEnabled,
    };

    // Emit danger warning (80%+)
    if (primaryInDanger || hedgeInDanger) {
      console.warn(`[LiquidationMonitor] ⚠️ DANGER: Position ${position.positionId} approaching liquidation!`);

      this.emit(LiquidationMonitorService.POSITION_IN_DANGER, risk);

      // Send alert notification (only once)
      if (!position.liquidationAlertSent) {
        await this.sendAlert(position, risk);
        await this.prisma.graduatedEntryPosition.update({
          where: { id: position.id },
          data: { liquidationAlertSent: true },
        });
      }
    }

    // Emit critical warning (90%+)
    if (primaryCritical || hedgeCritical) {
      console.error(`[LiquidationMonitor] 🚨 CRITICAL: Position ${position.positionId} at risk of liquidation!`);

      this.emit(LiquidationMonitorService.POSITION_CRITICAL, risk);

      // Auto-close if enabled
      if (this.config.autoCloseEnabled) {
        console.error(`[LiquidationMonitor] 🛡️ AUTO-CLOSE TRIGGERED for position ${position.positionId}`);
        this.emit(LiquidationMonitorService.AUTO_CLOSE_TRIGGERED, risk);

        // Trigger position closure
        // This will be handled by the graduated entry service
        // which listens to this event
      }
    }

    // Emit update event
    this.emit(LiquidationMonitorService.LIQUIDATION_UPDATED, risk);
  }

  /**
   * Send alert notification about liquidation danger
   */
  private async sendAlert(position: any, risk: PositionRisk): Promise<void> {
    console.warn('━'.repeat(80));
    console.warn('⚠️  LIQUIDATION DANGER ALERT');
    console.warn('━'.repeat(80));
    console.warn(`Position: ${position.positionId}`);
    console.warn(`Symbol: ${position.symbol}`);
    console.warn('');
    console.warn(`Primary (${position.primaryExchange} ${position.primarySide.toUpperCase()}):`);
    console.warn(`  Current Price: ${position.primaryCurrentPrice}`);
    console.warn(`  Liquidation Price: ${risk.primaryLiqPrice.toFixed(6)}`);
    console.warn(`  Proximity: ${(risk.primaryProximity * 100).toFixed(1)}%`);
    console.warn(`  Status: ${risk.primaryInDanger ? '⚠️ DANGER' : '✅ Safe'}`);
    console.warn('');
    console.warn(`Hedge (${position.hedgeExchange} ${position.hedgeSide.toUpperCase()}):`);
    console.warn(`  Current Price: ${position.hedgeCurrentPrice}`);
    console.warn(`  Liquidation Price: ${risk.hedgeLiqPrice.toFixed(6)}`);
    console.warn(`  Proximity: ${(risk.hedgeProximity * 100).toFixed(1)}%`);
    console.warn(`  Status: ${risk.hedgeInDanger ? '⚠️ DANGER' : '✅ Safe'}`);
    console.warn('');
    console.warn('RECOMMENDED ACTION:');
    if (risk.shouldAutoClose) {
      console.warn('  🛡️ Auto-close will be triggered if proximity reaches 90%');
    } else {
      console.warn('  📊 Monitor closely and consider manual closure');
    }
    console.warn('━'.repeat(80));

    // TODO: Add email/telegram/webhook notifications here
  }

  /**
   * Get current risk status for a position
   */
  async getPositionRisk(positionId: string): Promise<PositionRisk | null> {
    const position = await this.prisma.graduatedEntryPosition.findUnique({
      where: { positionId },
    });

    if (!position || !position.primaryLiquidationPrice || !position.hedgeLiquidationPrice) {
      return null;
    }

    return {
      positionId: position.positionId,
      symbol: position.symbol,
      primaryProximity: position.primaryProximityRatio || 0,
      hedgeProximity: position.hedgeProximityRatio || 0,
      primaryLiqPrice: position.primaryLiquidationPrice,
      hedgeLiqPrice: position.hedgeLiquidationPrice,
      primaryInDanger: position.primaryInDanger,
      hedgeInDanger: position.hedgeInDanger,
      shouldAutoClose: false,
    };
  }

  /**
   * Cleanup - disconnect from database
   */
  async cleanup(): Promise<void> {
    this.stopMonitoring();
    await this.prisma.$disconnect();
  }
}

// Singleton instance
export const liquidationMonitorService = new LiquidationMonitorService();
