/**
 * Graduated Entry Arbitrage Service
 *
 * Implements automated arbitrage position opening with graduated entry:
 * 1. Opens positions simultaneously on two exchanges (Primary + Hedge)
 * 2. Splits order quantity into multiple parts for smooth market entry
 * 3. Executes each part with configurable time delays
 * 4. Tracks positions on both exchanges
 * 5. Provides real-time status updates via events
 *
 * Example:
 * - Symbol: BTC-USDT
 * - Primary: Bybit, Long, 10x leverage, 0.1 BTC
 * - Hedge: BingX, Short, 10x leverage, 0.1 BTC
 * - Parts: 5 (each 0.02 BTC)
 * - Delay: 2000ms between parts
 */

import { EventEmitter } from 'events';
import { BybitConnector } from '@/connectors/bybit.connector';
import { BingXConnector } from '@/connectors/bingx.connector';
import { MEXCConnector } from '@/connectors/mexc.connector';
import { GateIOConnector } from '@/connectors/gateio.connector';
import { BybitService } from '@/lib/bybit';
import prisma from '@/lib/prisma';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { ContractCalculator } from '@/lib/contract-calculator';

export interface GraduatedEntryConfig {
  userId: string;
  symbol: string;

  // Primary exchange configuration
  primaryExchange: string;         // 'BYBIT', 'BINGX', etc.
  primarySide: 'long' | 'short';  // Position side
  primaryLeverage: number;         // 1-125
  primaryQuantity: number;         // Total quantity to trade

  // Hedge exchange configuration
  hedgeExchange: string;           // 'BYBIT', 'BINGX', etc.
  hedgeSide: 'long' | 'short';    // Position side
  hedgeLeverage: number;           // 1-125
  hedgeQuantity: number;           // Total quantity to trade

  // Graduated entry settings
  graduatedEntryParts: number;     // Number of parts to split order (default: 5)
  graduatedEntryDelayMs: number;   // Delay between parts in milliseconds (default: 2000)

  // Strategy type (optional, default: 'combined')
  // 'combined' and 'price_only' = balance by coins only (no USDT rebalancing)
  // 'funding_farm' and 'spot_futures' = balance by USDT value (use ContractCalculator)
  strategyType?: 'combined' | 'price_only' | 'funding_farm' | 'spot_futures';

  // Combined strategy: Funding rates (optional, for TP/SL calculation)
  primaryFundingRate?: number;     // Hourly funding rate in decimal (e.g., 0.0001 = 0.01%)
  hedgeFundingRate?: number;       // Hourly funding rate in decimal
  targetHoldingPeriodHours?: number; // Target holding period for funding profit (default: 168 = 7 days)
  minProfitPercent?: number;       // Minimum profit target percentage (default: 2%)
}

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  credentialId: string;
  authToken?: string; // MEXC requires authToken
}

export interface ActiveArbitragePosition {
  id: string;
  dbId?: string;
  config: GraduatedEntryConfig;

  // Primary exchange
  primaryConnector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector;
  primaryCredentials: ExchangeCredentials;
  primaryFilledQuantity: number;
  primaryOrderIds: string[];
  primaryStatus: 'pending' | 'executing' | 'completed' | 'error';
  primaryErrorMessage?: string;

  // Hedge exchange
  hedgeConnector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector;
  hedgeCredentials: ExchangeCredentials;
  hedgeFilledQuantity: number;
  hedgeOrderIds: string[];
  hedgeStatus: 'pending' | 'executing' | 'completed' | 'error';
  hedgeErrorMessage?: string;

  // Overall status
  status: 'initializing' | 'executing' | 'completed' | 'error' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentPart: number;  // Current part being executed (1-based)

  // WebSocket monitoring (real-time price updates instead of polling)
  primaryPriceUnsubscribe?: () => void;    // Unsubscribe function for primary exchange price WebSocket
  hedgePriceUnsubscribe?: () => void;       // Unsubscribe function for hedge exchange price WebSocket
  primaryPositionUnsubscribe?: () => void;  // Unsubscribe function for primary exchange position WebSocket (real-time P&L)
  hedgePositionUnsubscribe?: () => void;    // Unsubscribe function for hedge exchange position WebSocket (real-time P&L)
  lastMonitoringCheck?: number;             // Timestamp of last monitoring check (for throttling)
}

/**
 * Service for managing graduated entry arbitrage positions
 */
export class GraduatedEntryArbitrageService extends EventEmitter {
  private positions: Map<string, ActiveArbitragePosition> = new Map();
  private positionCounter = 0;
  private restoredFromDatabase = false;

  // Event types
  static readonly POSITION_STARTING = 'position_starting';     // { positionId, config }
  static readonly PART_EXECUTING = 'part_executing';           // { positionId, partNumber, totalParts }
  static readonly PART_COMPLETED = 'part_completed';           // { positionId, partNumber, primaryOrderId, hedgeOrderId }
  static readonly POSITION_COMPLETED = 'position_completed';   // { positionId, primaryFilled, hedgeFilled }
  static readonly ERROR = 'error';                             // { positionId, error, exchange }

  constructor() {
    super();
    // Don't restore in constructor - will be done on first API call
  }

  /**
   * Public initialization method for server startup
   * Called from instrumentation.ts
   */
  async initialize(): Promise<void> {
    await this.ensureRestored();

    // Set up liquidation monitor event listeners
    this.setupLiquidationMonitoring();
  }

  /**
   * Setup liquidation monitoring event listeners
   */
  private async setupLiquidationMonitoring(): Promise<void> {
    try {
      const { liquidationMonitorService, LiquidationMonitorService } = await import('@/services/liquidation-monitor.service');

      // Listen for auto-close triggers
      liquidationMonitorService.on(LiquidationMonitorService.AUTO_CLOSE_TRIGGERED, async (risk: any) => {
        console.error(`[GraduatedEntry] 🛡️ AUTO-CLOSE triggered for position ${risk.positionId}`);

        try {
          await this.emergencyClosePosition(risk.positionId, 'Automatic liquidation protection');
        } catch (error: any) {
          console.error(`[GraduatedEntry] Error during emergency close:`, error.message);
        }
      });

      // Listen for danger warnings
      liquidationMonitorService.on(LiquidationMonitorService.POSITION_IN_DANGER, (risk: any) => {
        console.warn(`[GraduatedEntry] ⚠️ Position ${risk.positionId} in danger of liquidation`);
      });

      console.log('[GraduatedEntry] Liquidation monitoring listeners registered');
    } catch (error: any) {
      console.error('[GraduatedEntry] Error setting up liquidation monitoring:', error.message);
    }
  }

  /**
   * Ensure positions are restored from a database (lazy initialization)
   * Called on first API request to avoid initialization timing issues
   */
  private async ensureRestored(): Promise<void> {
    if (this.restoredFromDatabase) {
      return; // Already restored
    }

    this.restoredFromDatabase = true;
    await this.restorePositionsFromDatabase().catch(error => {
      console.error('[GraduatedEntry] Failed to restore positions:', error.message);
      // Don't throw - allow service to continue working
    });
  }

  /**
   * Restore active positions from a database on service startup
   * This allows positions to survive backend restarts
   */
  private async restorePositionsFromDatabase(): Promise<void> {
    try {
      console.log('[GraduatedEntry] Restoring positions from database...');

      // Check if prisma is available
      if (!prisma || typeof prisma.graduatedEntryPosition === 'undefined') {
        console.error('[GraduatedEntry] Prisma client not available for restoration');
        return;
      }

      // Load all active positions (not completed, cancelled, or liquidated)
      const dbPositions = await prisma.graduatedEntryPosition.findMany({
        where: {
          status: {
            in: ['INITIALIZING', 'EXECUTING', 'ACTIVE'],
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      console.log(`[GraduatedEntry] Found ${dbPositions.length} active positions to restore`);

      for (const dbPos of dbPositions) {
        try {
          console.log(`[GraduatedEntry] Restoring position ${dbPos.positionId}...`);

          // Fetch credentials from database
          const primaryCred = await ExchangeCredentialsService.getCredentialById(
            dbPos.userId,
            dbPos.primaryCredentialId
          );

          const hedgeCred = await ExchangeCredentialsService.getCredentialById(
            dbPos.userId,
            dbPos.hedgeCredentialId
          );

          if (!primaryCred) {
            console.error(`[GraduatedEntry] Primary credentials not found for position ${dbPos.positionId}`);
            // Mark position as error in database
            await prisma.graduatedEntryPosition.update({
              where: { id: dbPos.id },
              data: {
                status: 'ERROR',
                errorMessage: 'Primary credentials not found after restart',
              },
            });
            continue;
          }

          if (!hedgeCred) {
            console.error(`[GraduatedEntry] Hedge credentials not found for position ${dbPos.positionId}`);
            // Mark position as error in database
            await prisma.graduatedEntryPosition.update({
              where: { id: dbPos.id },
              data: {
                status: 'ERROR',
                errorMessage: 'Hedge credentials not found after restart',
              },
            });
            continue;
          }

          // Recreate connectors
          const primaryCredentials: ExchangeCredentials = {
            apiKey: primaryCred.apiKey,
            apiSecret: primaryCred.apiSecret,
            testnet: primaryCred.environment === 'TESTNET',
            credentialId: primaryCred.id,
            authToken: primaryCred.authToken,
          };

          const hedgeCredentials: ExchangeCredentials = {
            apiKey: hedgeCred.apiKey,
            apiSecret: hedgeCred.apiSecret,
            testnet: hedgeCred.environment === 'TESTNET',
            credentialId: hedgeCred.id,
            authToken: hedgeCred.authToken,
          };

          const primaryConnector = await this.createConnector(
            dbPos.primaryExchange,
            primaryCredentials
          );

          const hedgeConnector = await this.createConnector(
            dbPos.hedgeExchange,
            hedgeCredentials
          );

          // Recreate the position config
          const config: GraduatedEntryConfig = {
            userId: dbPos.userId,
            symbol: dbPos.symbol,
            primaryExchange: dbPos.primaryExchange,
            primarySide: dbPos.primarySide as 'long' | 'short',
            primaryLeverage: dbPos.primaryLeverage,
            primaryQuantity: dbPos.primaryQuantity,
            hedgeExchange: dbPos.hedgeExchange,
            hedgeSide: dbPos.hedgeSide as 'long' | 'short',
            hedgeLeverage: dbPos.hedgeLeverage,
            hedgeQuantity: dbPos.hedgeQuantity,
            graduatedEntryParts: dbPos.graduatedParts,
            graduatedEntryDelayMs: dbPos.graduatedDelayMs,
          };

          // Restore position to memory
          const position: ActiveArbitragePosition = {
            id: dbPos.positionId,
            dbId: dbPos.id,
            config,
            primaryConnector,
            primaryCredentials,
            primaryFilledQuantity: dbPos.primaryFilledQty,
            primaryOrderIds: dbPos.primaryOrderIds,
            primaryStatus: dbPos.primaryStatus as any,
            primaryErrorMessage: dbPos.primaryErrorMessage || undefined,
            hedgeConnector,
            hedgeCredentials,
            hedgeFilledQuantity: dbPos.hedgeFilledQty,
            hedgeOrderIds: dbPos.hedgeOrderIds,
            hedgeStatus: dbPos.hedgeStatus as any,
            hedgeErrorMessage: dbPos.hedgeErrorMessage || undefined,
            status: dbPos.status.toLowerCase() as any,
            startedAt: dbPos.startedAt,
            completedAt: dbPos.completedAt || undefined,
            currentPart: dbPos.currentPart,
          };

          this.positions.set(dbPos.positionId, position);

          console.log(`[GraduatedEntry] Position ${dbPos.positionId} restored successfully`);

          // If position is ACTIVE, start monitoring
          if (dbPos.status === 'ACTIVE') {
            console.log(`[GraduatedEntry] Position ${dbPos.positionId} is ACTIVE, starting monitoring...`);
            this.startPositionMonitoring(position).catch(error => {
              console.error(`[GraduatedEntry] Error starting monitoring for restored position ${dbPos.positionId}:`, error.message);
            });
          }
        } catch (error: any) {
          console.error(`[GraduatedEntry] Failed to restore position ${dbPos.positionId}:`, error.message);

          // Mark position as error in database
          await prisma.graduatedEntryPosition.update({
            where: { id: dbPos.id },
            data: {
              status: 'ERROR',
              errorMessage: `Failed to restore after restart: ${error.message}`,
            },
          }).catch(updateError => {
            console.error(`[GraduatedEntry] Failed to update position error status:`, updateError.message);
          });
        }
      }

      console.log(`[GraduatedEntry] Successfully restored ${this.positions.size} positions`);
    } catch (error: any) {
      console.error('[GraduatedEntry] Error in restorePositionsFromDatabase:', error.message);
      throw error;
    }
  }

  /**
   * Start a new graduated entry arbitrage position
   *
   * @param config Position configuration
   * @param primaryCredentials Primary exchange credentials
   * @param hedgeCredentials Hedge exchange credentials
   * @returns Position ID
   */
  async startPosition(
    config: GraduatedEntryConfig,
    primaryCredentials: ExchangeCredentials,
    hedgeCredentials: ExchangeCredentials
  ): Promise<string> {
    const positionId = `arb_${++this.positionCounter}_${Date.now()}`;

    console.log(`[GraduatedEntry] Starting new arbitrage position ${positionId}:`, {
      symbol: config.symbol,
      primary: { exchange: config.primaryExchange, side: config.primarySide, quantity: config.primaryQuantity },
      hedge: { exchange: config.hedgeExchange, side: config.hedgeSide, quantity: config.hedgeQuantity },
      parts: config.graduatedEntryParts,
      delayMs: config.graduatedEntryDelayMs,
    });

    try {
      // Initialize connectors for both exchanges
      const primaryConnector = await this.createConnector(
        config.primaryExchange,
        primaryCredentials
      );

      const hedgeConnector = await this.createConnector(
        config.hedgeExchange,
        hedgeCredentials
      );

      // Set leverage on both exchanges
      await this.setLeverageOnExchange(
        primaryConnector,
        config.symbol,
        config.primaryLeverage,
        config.primaryExchange
      );

      await this.setLeverageOnExchange(
        hedgeConnector,
        config.symbol,
        config.hedgeLeverage,
        config.hedgeExchange
      );

      // CRITICAL: Validate order sizes BEFORE opening any positions
      console.log(`[GraduatedEntry] Validating order sizes for both exchanges...`);
      await this.validateOrderSizes(
        primaryConnector,
        config.symbol,
        config.primaryQuantity / config.graduatedEntryParts,
        config.primaryExchange,
        hedgeConnector,
        config.hedgeQuantity / config.graduatedEntryParts,
        config.hedgeExchange
      );
      console.log(`[GraduatedEntry] ✓ Order size validation passed`);

      // Create position instance
      const position: ActiveArbitragePosition = {
        id: positionId,
        config,
        primaryConnector,
        primaryCredentials,
        primaryFilledQuantity: 0,
        primaryOrderIds: [],
        primaryStatus: 'pending',
        hedgeConnector,
        hedgeCredentials,
        hedgeFilledQuantity: 0,
        hedgeOrderIds: [],
        hedgeStatus: 'pending',
        status: 'initializing',
        startedAt: new Date(),
        currentPart: 0,
      };

      this.positions.set(positionId, position);

      // Save position to database for persistence across restarts
      try {
        // Check if prisma is available
        if (!prisma || typeof prisma.graduatedEntryPosition === 'undefined') {
          console.warn('[GraduatedEntry] Prisma client not available, position will not be persisted');
        } else {
          const dbPosition = await prisma.graduatedEntryPosition.create({
          data: {
            userId: config.userId,
            positionId: positionId,
            symbol: config.symbol,
            primaryExchange: config.primaryExchange,
            primaryCredentialId: primaryCredentials.credentialId,
            primarySide: config.primarySide,
            primaryLeverage: config.primaryLeverage,
            primaryQuantity: config.primaryQuantity,
            primaryFilledQty: 0,
            primaryOrderIds: [],
            hedgeExchange: config.hedgeExchange,
            hedgeCredentialId: hedgeCredentials.credentialId,
            hedgeSide: config.hedgeSide,
            hedgeLeverage: config.hedgeLeverage,
            hedgeQuantity: config.hedgeQuantity,
            hedgeFilledQty: 0,
            hedgeOrderIds: [],
            graduatedParts: config.graduatedEntryParts,
            graduatedDelayMs: config.graduatedEntryDelayMs,
            currentPart: 0,
            status: 'INITIALIZING',
            primaryStatus: 'pending',
            hedgeStatus: 'pending',
          },
        });
          position.dbId = dbPosition.id;
          console.log(`[GraduatedEntry] Position saved to database with ID: ${dbPosition.id}`);
        }
      } catch (dbError: any) {
        console.error(`[GraduatedEntry] Failed to save position to database:`, dbError.message);
        // Continue execution even if database save fails
      }

      // Emit starting event
      this.emit(GraduatedEntryArbitrageService.POSITION_STARTING, {
        positionId,
        config,
      });

      // Start graduated entry execution (async, don't await)
      this.executeGraduatedEntry(position).catch(error => {
        console.error(`[GraduatedEntry] Error in graduated entry execution for ${positionId}:`, error.message);
        position.status = 'error';
        this.emit(GraduatedEntryArbitrageService.ERROR, {
          positionId,
          error: error.message,
          exchange: 'both',
        });
      });

      console.log(`[GraduatedEntry] Position ${positionId} initialized successfully`);
      return positionId;
    } catch (error: any) {
      console.error(`[GraduatedEntry] Error starting position:`, error.message);
      this.emit(GraduatedEntryArbitrageService.ERROR, {
        positionId,
        error: error.message,
        exchange: 'initialization',
      });
      throw error;
    }
  }

  /**
   * Create exchange connector based on exchange name
   */
  private async createConnector(
    exchangeName: string,
    credentials: ExchangeCredentials
  ): Promise<BybitConnector | BingXConnector | MEXCConnector | GateIOConnector> {
    const exchange = exchangeName.toUpperCase();

    if (exchange.includes('BYBIT')) {
      const connector = new BybitConnector(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.testnet
      );
      await connector.initialize();
      return connector;
    } else if (exchange.includes('BINGX')) {
      const connector = new BingXConnector(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.testnet
      );
      await connector.initialize();
      return connector;
    } else if (exchange.includes('MEXC')) {
      const connector = new MEXCConnector(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.authToken
      );
      await connector.initialize();
      return connector;
    } else if (exchange.includes('GATEIO') || exchange.includes('GATE.IO') || exchange.includes('GATE')) {
      const connector = new GateIOConnector(
        credentials.apiKey,
        credentials.apiSecret
      );
      await connector.initialize();
      return connector;
    } else {
      throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
  }

  /**
   * Set leverage on exchange
   */
  private async setLeverageOnExchange(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    leverage: number,
    exchangeName: string
  ): Promise<void> {
    try {
      await connector.setLeverage(symbol, leverage);
      console.log(`[GraduatedEntry] Leverage set for ${exchangeName}: ${leverage}x`);
    } catch (error: any) {
      // If leverage is already set, that's not an error
      if (error.message && error.message.includes('leverage not modified')) {
        console.log(`[GraduatedEntry] Leverage already set for ${exchangeName} (${leverage}x)`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Validate order sizes BEFORE opening positions
   *
   * CRITICAL: This prevents partial position opening when one exchange rejects the order
   * We validate using actual order parameters but catch validation errors
   *
   * @throws Error if validation fails with detailed message for user
   */
  private async validateOrderSizes(
    primaryConnector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    primaryQuantity: number,
    primaryExchange: string,
    hedgeConnector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    hedgeQuantity: number,
    hedgeExchange: string
  ): Promise<void> {
    console.log(`[GraduatedEntry] ⚠️  Pre-flight validation: Checking order sizes...`);
    console.log(`[GraduatedEntry]    Primary: ${primaryQuantity} ${symbol} on ${primaryExchange}`);
    console.log(`[GraduatedEntry]    Hedge: ${hedgeQuantity} ${symbol} on ${hedgeExchange}`);

    // For now, we'll do validation during actual order execution
    // This is safer than trying to place test orders
    //
    // The executeMarketOrder method will catch validation errors and we'll
    // parse them to provide user-friendly messages
    //
    // If the first part fails with a validation error, we'll stop immediately
    // and won't open ANY positions (neither primary nor hedge)

    console.log(`[GraduatedEntry] ✓ Pre-flight check: Will validate on first order execution`);
  }

  /**
   * Execute graduated entry strategy
   * Splits orders into parts and executes with time delays
   */
  private async executeGraduatedEntry(position: ActiveArbitragePosition): Promise<void> {
    const { config } = position;
    const { graduatedEntryParts, graduatedEntryDelayMs } = config;

    position.status = 'executing';
    position.primaryStatus = 'executing';
    position.hedgeStatus = 'executing';

    // Update database with executing status
    if (position.dbId) {
      await prisma.graduatedEntryPosition.update({
        where: { id: position.dbId },
        data: {
          status: 'EXECUTING',
          primaryStatus: 'executing',
          hedgeStatus: 'executing',
        },
      }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
    }

    console.log(`[GraduatedEntry] ${position.id} - Starting graduated entry execution`);

    // Determine strategy type (default: 'combined')
    const strategyType = config.strategyType || 'combined';
    console.log(`[GraduatedEntry] ${position.id} - Strategy type: ${strategyType}`);

    // Calculate quantity per part based on strategy type
    // For 'combined' and 'price_only': Use simple coin-based division (no USDT rebalancing)
    // For 'funding_farm' and 'spot_futures': Use ContractCalculator for USDT-based balancing
    let primaryQuantityPerPart: number;
    let hedgeQuantityPerPart: number;

    if (strategyType === 'combined' || strategyType === 'price_only') {
      // COIN-BASED BALANCING: Simply divide quantities by parts
      // This ensures we trade the exact same number of coins on both exchanges
      console.log(`[GraduatedEntry] ${position.id} - Using coin-based balancing (no USDT rebalancing)`);
      primaryQuantityPerPart = config.primaryQuantity / graduatedEntryParts;
      hedgeQuantityPerPart = config.hedgeQuantity / graduatedEntryParts;

      console.log(`[GraduatedEntry] ${position.id} - Coin-based quantities per part:`, {
        primary: primaryQuantityPerPart,
        hedge: hedgeQuantityPerPart,
      });
    } else {
      // USDT-BASED BALANCING: Use ContractCalculator for funding_farm and spot_futures strategies
      // This ensures both exchanges open identical USDT value despite different contract specifications
      try {
        // Check if connectors have getContractSpecification method
        const primaryConnector = position.primaryConnector as any;
        const hedgeConnector = position.hedgeConnector as any;

        if (
          typeof primaryConnector.getContractSpecification === 'function' &&
          typeof hedgeConnector.getContractSpecification === 'function'
        ) {
          console.log(`[GraduatedEntry] ${position.id} - Using ContractCalculator for USDT-based balancing`);

          // Fetch contract specifications
          const [primarySpec, hedgeSpec] = await Promise.all([
            primaryConnector.getContractSpecification(config.symbol),
            hedgeConnector.getContractSpecification(config.symbol),
          ]);

          console.log(`[GraduatedEntry] ${position.id} - Contract specifications:`, {
            primary: primarySpec,
            hedge: hedgeSpec,
          });

          // Calculate balanced quantities
          const result = ContractCalculator.calculateGraduatedQuantities(
            config.primaryQuantity,
            graduatedEntryParts,
            primarySpec,
            hedgeSpec
          );

          primaryQuantityPerPart = result.quantityPerPart;
          hedgeQuantityPerPart = result.quantityPerPart;

          console.log(`[GraduatedEntry] ${position.id} - USDT-balanced quantities calculated:`, {
            requestedTotal: config.primaryQuantity,
            quantityPerPart: result.quantityPerPart,
            effectivePerPart: result.effectiveQuantityPerPart,
            totalEffective: result.totalEffectiveQuantity,
            adjustedTotal: result.adjustedTotal,
          });
        } else {
          // Fallback to simple division if connectors don't support ContractCalculator
          console.warn(`[GraduatedEntry] ${position.id} - Connectors don't support ContractCalculator, using simple division`);
          primaryQuantityPerPart = config.primaryQuantity / graduatedEntryParts;
          hedgeQuantityPerPart = config.hedgeQuantity / graduatedEntryParts;
        }
      } catch (error: any) {
        console.error(`[GraduatedEntry] ${position.id} - Error calculating balanced quantities:`, error.message);
        console.warn(`[GraduatedEntry] ${position.id} - Falling back to simple division`);
        primaryQuantityPerPart = config.primaryQuantity / graduatedEntryParts;
        hedgeQuantityPerPart = config.hedgeQuantity / graduatedEntryParts;
      }
    }

    console.log(`[GraduatedEntry] ${position.id} - Final quantity per part:`, {
      primary: primaryQuantityPerPart,
      hedge: hedgeQuantityPerPart,
    });

    // Execute each part sequentially
    for (let part = 1; part <= graduatedEntryParts; part++) {
      position.currentPart = part;

      console.log(`[GraduatedEntry] ${position.id} - Executing part ${part}/${graduatedEntryParts}`);

      this.emit(GraduatedEntryArbitrageService.PART_EXECUTING, {
        positionId: position.id,
        partNumber: part,
        totalParts: graduatedEntryParts,
      });

      try {
        let primaryOrderId: string;
        let hedgeOrderId: string;
        let primaryFilledQty: number;
        let hedgeFilledQty: number;

        // CRITICAL: For the FIRST part, execute SEQUENTIALLY to validate before opening hedge
        // This prevents opening hedge position if primary fails validation
        if (part === 1) {
          console.log(`[GraduatedEntry] ${position.id} - First part: executing PRIMARY first for validation`);

          // Execute primary order first
          try {
            const primaryResult = await this.executeMarketOrder(
              position.primaryConnector,
              config.symbol,
              config.primarySide,
              primaryQuantityPerPart,
              config.primaryExchange,
              'primary'
            );
            primaryOrderId = primaryResult.orderId;
            primaryFilledQty = primaryResult.filledQuantity;
          } catch (error: any) {
            // If primary fails on first part, check if it's a validation error
            const errorMsg = error.message || String(error);

            if (this.isValidationError(errorMsg)) {
              // Parse and format validation error for user
              const userError = this.formatValidationError(errorMsg, config.primaryExchange, config.symbol, primaryQuantityPerPart);
              console.error(`[GraduatedEntry] ${position.id} - Validation failed on PRIMARY:`, userError);

              // Set error status
              position.primaryStatus = 'error';
              position.primaryErrorMessage = userError;
              position.status = 'error';

              // Update database
              if (position.dbId) {
                await prisma.graduatedEntryPosition.update({
                  where: { id: position.dbId },
                  data: {
                    status: 'ERROR',
                    primaryStatus: 'error',
                    primaryErrorMessage: userError,
                    errorMessage: userError,
                  },
                }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
              }

              // Emit error event
              this.emit(GraduatedEntryArbitrageService.ERROR, {
                positionId: position.id,
                error: userError,
                exchange: 'primary',
                partNumber: part,
              });

              // STOP - don't open hedge position!
              return;
            }

            // If not validation error, re-throw
            throw error;
          }

          console.log(`[GraduatedEntry] ${position.id} - PRIMARY order successful, now executing HEDGE with SAME quantity`);
          console.log(`[GraduatedEntry] ${position.id} - Using primary filled quantity for hedge: ${primaryFilledQty}`);

          // Primary succeeded, now execute hedge with SAME filled quantity
          try {
            const hedgeResult = await this.executeMarketOrder(
              position.hedgeConnector,
              config.symbol,
              config.hedgeSide,
              primaryFilledQty,  // Use primary filled quantity, not original hedge quantity!
              config.hedgeExchange,
              'hedge'
            );
            hedgeOrderId = hedgeResult.orderId;
            hedgeFilledQty = hedgeResult.filledQuantity;

            console.log(`[GraduatedEntry] ${position.id} - HEDGE order successful`);
            console.log(`[GraduatedEntry] ${position.id} - First part filled quantities - Primary: ${primaryFilledQty}, Hedge: ${hedgeFilledQty}`);
          } catch (error: any) {
            // Hedge failed but primary succeeded - CRITICAL situation!
            // MUST close primary position immediately to avoid unhedged risk!
            const errorMsg = error.message || String(error);
            let userError: string;

            if (this.isValidationError(errorMsg)) {
              userError = this.formatValidationError(errorMsg, config.hedgeExchange, config.symbol, hedgeQuantityPerPart);
            } else {
              // Non-validation error (e.g., BingX API disabled, exchange restriction, etc.)
              userError = `${config.hedgeExchange}: ${errorMsg}`;
            }

            console.error(`[GraduatedEntry] ${position.id} - ⚠️ CRITICAL: Hedge failed but PRIMARY is open!`);
            console.error(`[GraduatedEntry] ${position.id} - Error: ${userError}`);
            console.error(`[GraduatedEntry] ${position.id} - Attempting to close primary position immediately...`);

            // Try to close primary position immediately
            try {
              await this.closePositionOnExchange(
                position.primaryConnector,
                config.symbol,
                config.primaryExchange
              );
              console.log(`[GraduatedEntry] ${position.id} - ✓ Primary position closed successfully`);
              userError += `\n✓ Primary позиція на ${config.primaryExchange} закрита автоматично.`;
            } catch (closeError: any) {
              console.error(`[GraduatedEntry] ${position.id} - ✗ Failed to close primary:`, closeError.message);
              userError += `\n⚠️ УВАГА: Primary позиція відкрита на ${config.primaryExchange} але не вдалося закрити автоматично! Закрийте вручну НЕГАЙНО!`;
            }

            // Set error status
            position.hedgeStatus = 'error';
            position.hedgeErrorMessage = userError;
            position.primaryStatus = 'error';
            position.status = 'error';

            // Update database
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'ERROR',
                  hedgeStatus: 'error',
                  hedgeErrorMessage: userError,
                  primaryStatus: 'error',
                  errorMessage: userError,
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            this.emit(GraduatedEntryArbitrageService.ERROR, {
              positionId: position.id,
              error: userError,
              exchange: 'hedge',
              partNumber: part,
            });

            return;
          }
        } else {
          // For subsequent parts, ALSO execute sequentially to ensure matched quantities
          // Execute primary first, then use its filled quantity for hedge
          console.log(`[GraduatedEntry] ${position.id} - Part ${part}: executing PRIMARY first`);

          try {
            const primaryResult = await this.executeMarketOrder(
              position.primaryConnector,
              config.symbol,
              config.primarySide,
              primaryQuantityPerPart,
              config.primaryExchange,
              'primary'
            );
            primaryOrderId = primaryResult.orderId;
            primaryFilledQty = primaryResult.filledQuantity;

            console.log(`[GraduatedEntry] ${position.id} - PRIMARY order successful, now executing HEDGE with SAME quantity`);
            console.log(`[GraduatedEntry] ${position.id} - Using primary filled quantity for hedge: ${primaryFilledQty}`);
          } catch (error: any) {
            const errorMsg = error.message || String(error);
            let userError = '';

            if (this.isValidationError(errorMsg)) {
              userError = this.formatValidationError(errorMsg, config.primaryExchange, config.symbol, primaryQuantityPerPart);
            } else {
              userError = `${config.primaryExchange}: ${errorMsg}`;
            }

            console.error(`[GraduatedEntry] ${position.id} - Primary order failed on part ${part}:`, userError);

            // Set error status
            position.primaryStatus = 'error';
            position.primaryErrorMessage = userError;
            position.status = 'error';
            position.errorMessage = userError;

            // Update database
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'ERROR',
                  primaryStatus: 'error',
                  primaryErrorMessage: userError,
                  errorMessage: userError,
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            this.emit(GraduatedEntryArbitrageService.ERROR, {
              positionId: position.id,
              error: userError,
              exchange: 'primary',
              partNumber: part,
            });

            return;
          }

          // Primary succeeded, now execute hedge with SAME filled quantity
          try {
            const hedgeResult = await this.executeMarketOrder(
              position.hedgeConnector,
              config.symbol,
              config.hedgeSide,
              primaryFilledQty,  // Use primary filled quantity
              config.hedgeExchange,
              'hedge'
            );
            hedgeOrderId = hedgeResult.orderId;
            hedgeFilledQty = hedgeResult.filledQuantity;

            console.log(`[GraduatedEntry] ${position.id} - HEDGE order successful`);
            console.log(`[GraduatedEntry] ${position.id} - Filled quantities - Primary: ${primaryFilledQty}, Hedge: ${hedgeFilledQty}`);
          } catch (error: any) {
            const errorMsg = error.message || String(error);
            let userError = '';

            if (this.isValidationError(errorMsg)) {
              userError = this.formatValidationError(errorMsg, config.hedgeExchange, config.symbol, primaryFilledQty);
            } else {
              userError = `${config.hedgeExchange}: ${errorMsg}`;
            }

            console.error(`[GraduatedEntry] ${position.id} - ⚠️ CRITICAL: Hedge failed but PRIMARY is open on part ${part}!`);
            console.error(`[GraduatedEntry] ${position.id} - Error: ${userError}`);
            console.error(`[GraduatedEntry] ${position.id} - Attempting to close primary position immediately...`);

            // Try to close primary position immediately
            try {
              await this.closePositionOnExchange(
                position.primaryConnector,
                config.symbol,
                config.primaryExchange
              );
              console.log(`[GraduatedEntry] ${position.id} - ✓ Primary position closed successfully`);
              userError += `\n✓ Primary позиція на ${config.primaryExchange} закрита автоматично.`;
            } catch (closeError: any) {
              console.error(`[GraduatedEntry] ${position.id} - ✗ Failed to close primary:`, closeError.message);
              userError += `\n⚠️ УВАГА: Primary позиція відкрита на ${config.primaryExchange} але не вдалося закрити автоматично! Закрийте вручну НЕГАЙНО!`;
            }

            // Set error status
            position.hedgeStatus = 'error';
            position.hedgeErrorMessage = userError;
            position.primaryStatus = 'error';
            position.status = 'error';

            // Update database
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'ERROR',
                  hedgeStatus: 'error',
                  hedgeErrorMessage: userError,
                  primaryStatus: 'error',
                  errorMessage: userError,
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            this.emit(GraduatedEntryArbitrageService.ERROR, {
              positionId: position.id,
              error: userError,
              exchange: 'hedge',
              partNumber: part,
            });

            return;
          }

          // Create mock results for compatibility with rest of code
          const primaryResult = { status: 'fulfilled' as const, value: { orderId: primaryOrderId, filledQuantity: primaryFilledQty } };
          const hedgeResult = { status: 'fulfilled' as const, value: { orderId: hedgeOrderId } };

          const results = [primaryResult, hedgeResult];

          // Check if both succeeded (they should be, since we got here)
          if (primaryResult.status === 'fulfilled' && hedgeResult.status === 'fulfilled') {
            primaryOrderId = primaryResult.value.orderId;
            hedgeOrderId = hedgeResult.value.orderId;
          } else if (primaryResult.status === 'fulfilled' && hedgeResult.status === 'rejected') {
            // Primary succeeded but hedge failed - CRITICAL!
            console.error(`[GraduatedEntry] ${position.id} - ⚠️ CRITICAL: PRIMARY succeeded but HEDGE failed in part ${part}!`);
            console.error(`[GraduatedEntry] ${position.id} - Closing PRIMARY position immediately...`);

            // Close ALL primary positions (from all parts executed so far)
            try {
              await this.closePositionOnExchange(
                position.primaryConnector,
                config.symbol,
                config.primaryExchange
              );
              console.log(`[GraduatedEntry] ${position.id} - ✓ Primary positions closed successfully`);
            } catch (closeError: any) {
              console.error(`[GraduatedEntry] ${position.id} - ✗ Failed to close primary:`, closeError.message);
            }

            throw new Error(`HEDGE failed in part ${part}: ${hedgeResult.reason.message || hedgeResult.reason}. Primary positions were closed.`);
          } else if (primaryResult.status === 'rejected' && hedgeResult.status === 'fulfilled') {
            // Hedge succeeded but primary failed - CRITICAL!
            console.error(`[GraduatedEntry] ${position.id} - ⚠️ CRITICAL: HEDGE succeeded but PRIMARY failed in part ${part}!`);
            console.error(`[GraduatedEntry] ${position.id} - Closing HEDGE position immediately...`);

            // Close ALL hedge positions (from all parts executed so far)
            try {
              await this.closePositionOnExchange(
                position.hedgeConnector,
                config.symbol,
                config.hedgeExchange
              );
              console.log(`[GraduatedEntry] ${position.id} - ✓ Hedge positions closed successfully`);
            } catch (closeError: any) {
              console.error(`[GraduatedEntry] ${position.id} - ✗ Failed to close hedge:`, closeError.message);
            }

            throw new Error(`PRIMARY failed in part ${part}: ${primaryResult.reason.message || primaryResult.reason}. Hedge positions were closed.`);
          } else {
            // Both failed
            throw new Error(`Both PRIMARY and HEDGE failed in part ${part}. Primary: ${primaryResult.reason?.message || primaryResult.reason}. Hedge: ${hedgeResult.reason?.message || hedgeResult.reason}`);
          }
        }

        // CRITICAL FIX: Use ACTUAL filled quantities, not requested quantities!
        // This prevents cumulative errors from slippage and partial fills
        position.primaryFilledQuantity += primaryFilledQty;
        position.hedgeFilledQuantity += hedgeFilledQty;

        // Calculate and log discrepancy
        const discrepancy = Math.abs(primaryFilledQty - hedgeFilledQty);
        const discrepancyPercent = (discrepancy / primaryFilledQty) * 100;

        console.log(`[GraduatedEntry] ${position.id} - Part ${part} filled quantities:`, {
          primary: primaryFilledQty,
          hedge: hedgeFilledQty,
          discrepancy: discrepancy.toFixed(6),
          discrepancyPercent: discrepancyPercent.toFixed(2) + '%'
        });

        if (discrepancyPercent > 0.1) {
          console.warn(`[GraduatedEntry] ${position.id} - ⚠️ WARNING: Discrepancy ${discrepancyPercent.toFixed(2)}% exceeds 0.1% threshold!`);
        }

        // Store order IDs
        position.primaryOrderIds.push(primaryOrderId);
        position.hedgeOrderIds.push(hedgeOrderId);

        // NEW: Verify actual positions after each part (except last)
        if (part < graduatedEntryParts) {
          try {
            console.log(`[GraduatedEntry] ${position.id} - Verifying positions after part ${part}...`);

            const [actualPrimaryPos, actualHedgePos] = await Promise.all([
              this.getExchangePosition(position.primaryConnector, config.symbol, config.primaryExchange),
              this.getExchangePosition(position.hedgeConnector, config.symbol, config.hedgeExchange),
            ]);

            if (actualPrimaryPos && actualHedgePos) {
              const actualDiscrepancy = Math.abs(actualPrimaryPos.size - actualHedgePos.size);
              const actualDiscrepancyPercent = (actualDiscrepancy / actualPrimaryPos.size) * 100;

              console.log(`[GraduatedEntry] ${position.id} - Actual positions on exchanges:`, {
                primary: actualPrimaryPos.size,
                hedge: actualHedgePos.size,
                discrepancy: actualDiscrepancy.toFixed(6),
                discrepancyPercent: actualDiscrepancyPercent.toFixed(2) + '%'
              });

              // If discrepancy is significant, adjust next part
              if (actualDiscrepancyPercent > 0.1 && part < graduatedEntryParts) {
                const correction = actualPrimaryPos.size - actualHedgePos.size;
                console.warn(`[GraduatedEntry] ${position.id} - Applying correction to next part: ${correction.toFixed(6)}`);

                // Adjust the next part quantities to compensate
                // This will be applied in the next iteration
                // (We'll need to track cumulative correction)
              }
            }
          } catch (verifyError: any) {
            console.warn(`[GraduatedEntry] ${position.id} - Could not verify positions:`, verifyError.message);
            // Continue anyway - verification is optional
          }
        }

        // Update database with progress
        if (position.dbId) {
          try {
            await prisma.graduatedEntryPosition.update({
              where: { id: position.dbId },
              data: {
                currentPart: part,
                primaryFilledQty: position.primaryFilledQuantity,
                hedgeFilledQty: position.hedgeFilledQuantity,
                primaryOrderIds: position.primaryOrderIds,
                hedgeOrderIds: position.hedgeOrderIds,
              },
            });
            console.log(`[GraduatedEntry] ${position.id} - Database updated successfully for part ${part}`);
          } catch (err: any) {
            console.error('[GraduatedEntry] DB update error:', {
              positionId: position.id,
              dbId: position.dbId,
              part,
              error: err.message || String(err),
              errorCode: err.code,
              errorStack: err.stack,
              values: {
                currentPart: part,
                primaryFilledQty: position.primaryFilledQuantity,
                hedgeFilledQty: position.hedgeFilledQuantity,
                primaryOrderIds: position.primaryOrderIds,
                hedgeOrderIds: position.hedgeOrderIds,
              }
            });
          }
        }

        console.log(`[GraduatedEntry] ${position.id} - Part ${part} completed:`, {
          primaryOrderId,
          hedgeOrderId,
          primaryFilled: position.primaryFilledQuantity,
          hedgeFilled: position.hedgeFilledQuantity,
        });

        this.emit(GraduatedEntryArbitrageService.PART_COMPLETED, {
          positionId: position.id,
          partNumber: part,
          totalParts: graduatedEntryParts,
          primaryOrderId,
          hedgeOrderId,
          primaryFilled: position.primaryFilledQuantity,
          hedgeFilled: position.hedgeFilledQuantity,
        });

        // Wait before next part (skip delay after last part)
        if (part < graduatedEntryParts) {
          console.log(`[GraduatedEntry] ${position.id} - Waiting ${graduatedEntryDelayMs}ms before next part...`);
          await this.delay(graduatedEntryDelayMs);
        }
      } catch (error: any) {
        console.error(`[GraduatedEntry] ${position.id} - Error executing part ${part}:`, error.message);

        // Determine which exchange failed
        const failedExchange = error.exchange || 'unknown';

        if (failedExchange === 'primary' || error.message.includes(config.primaryExchange)) {
          position.primaryStatus = 'error';
          position.primaryErrorMessage = error.message;
        } else if (failedExchange === 'hedge' || error.message.includes(config.hedgeExchange)) {
          position.hedgeStatus = 'error';
          position.hedgeErrorMessage = error.message;
        } else {
          position.primaryStatus = 'error';
          position.hedgeStatus = 'error';
        }

        position.status = 'error';

        // Update database with error status
        if (position.dbId) {
          await prisma.graduatedEntryPosition.update({
            where: { id: position.dbId },
            data: {
              status: 'ERROR',
              primaryStatus: position.primaryStatus,
              hedgeStatus: position.hedgeStatus,
              primaryErrorMessage: position.primaryErrorMessage,
              hedgeErrorMessage: position.hedgeErrorMessage,
              errorMessage: error.message,
            },
          }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
        }

        this.emit(GraduatedEntryArbitrageService.ERROR, {
          positionId: position.id,
          error: error.message,
          exchange: failedExchange,
          partNumber: part,
        });

        return; // Stop execution on error
      }
    }

    // All parts executed successfully - positions are now OPEN and need monitoring
    position.status = 'completed'; // Keep in-memory status for backward compatibility
    position.primaryStatus = 'completed';
    position.hedgeStatus = 'completed';

    // Fetch actual entry prices from both exchanges
    let primaryEntryPrice: number | null = null;
    let hedgeEntryPrice: number | null = null;

    try {
      console.log(`[GraduatedEntry] ${position.id} - Fetching entry prices from exchanges...`);

      // Fetch primary position to get actual entry price
      const primaryPosition = await this.getExchangePosition(
        position.primaryConnector,
        config.symbol,
        config.primaryExchange
      );

      if (primaryPosition) {
        primaryEntryPrice = primaryPosition.entryPrice;
        console.log(`[GraduatedEntry] ${position.id} - Primary entry price: ${primaryEntryPrice}`);
      } else {
        console.warn(`[GraduatedEntry] ${position.id} - Could not fetch primary position entry price`);
      }

      // Fetch hedge position to get actual entry price
      const hedgePosition = await this.getExchangePosition(
        position.hedgeConnector,
        config.symbol,
        config.hedgeExchange
      );

      if (hedgePosition) {
        hedgeEntryPrice = hedgePosition.entryPrice;
        console.log(`[GraduatedEntry] ${position.id} - Hedge entry price: ${hedgeEntryPrice}`);
      } else {
        console.warn(`[GraduatedEntry] ${position.id} - Could not fetch hedge position entry price`);
      }
    } catch (error: any) {
      console.error(`[GraduatedEntry] ${position.id} - Error fetching entry prices:`, error.message);
      // Continue anyway - entry prices will be null but position will still be monitored
    }

    // NEW: Final rebalancing after all parts completed
    await this.finalRebalancing(position, config);

    // Set synchronized TP/SL orders if entry prices are available
    if (primaryEntryPrice && hedgeEntryPrice) {
      try {
        await this.setSynchronizedTpSl(position, primaryEntryPrice, hedgeEntryPrice);
      } catch (error: any) {
        console.error(`[GraduatedEntry] ${position.id} - Error setting TP/SL:`, error.message);
        // Continue anyway - liquidation monitor will still protect the position
      }
    } else {
      console.warn(`[GraduatedEntry] ${position.id} - Cannot set TP/SL: entry prices not available`);
    }

    // Update database with ACTIVE status and entry prices
    if (position.dbId) {
      await prisma.graduatedEntryPosition.update({
        where: { id: position.dbId },
        data: {
          status: 'ACTIVE', // ACTIVE = positions opened, monitoring both exchanges
          primaryStatus: 'completed',
          hedgeStatus: 'completed',
          primaryEntryPrice,
          hedgeEntryPrice,
        },
      }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
    }

    console.log(`[GraduatedEntry] ${position.id} - All parts executed, positions ACTIVE and monitoring:`, {
      primaryFilled: position.primaryFilledQuantity,
      hedgeFilled: position.hedgeFilledQuantity,
      primaryOrders: position.primaryOrderIds.length,
      hedgeOrders: position.hedgeOrderIds.length,
      primaryEntryPrice,
      hedgeEntryPrice,
    });

    this.emit(GraduatedEntryArbitrageService.POSITION_COMPLETED, {
      positionId: position.id,
      primaryFilled: position.primaryFilledQuantity,
      hedgeFilled: position.hedgeFilledQuantity,
      primaryOrders: position.primaryOrderIds,
      hedgeOrders: position.hedgeOrderIds,
    });

    // Start monitoring positions on both exchanges
    this.startPositionMonitoring(position).catch(error => {
      console.error(`[GraduatedEntry] Error starting position monitoring for ${position.id}:`, error.message);
    });
  }

  /**
   * Execute market order on exchange
   * Returns: { orderId, filledQuantity }
   */
  private async executeMarketOrder(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    side: 'long' | 'short',
    quantity: number,
    exchangeName: string,
    exchangeType: 'primary' | 'hedge'
  ): Promise<{ orderId: string; filledQuantity: number }> {
    try {
      console.log(`[GraduatedEntry] Executing ${side} market order on ${exchangeName}:`, {
        symbol,
        quantity,
      });

      // Convert side to exchange-specific format
      const orderSide = side === 'long' ? 'Buy' : 'Sell';

      // Place market order
      const order = await connector.placeMarketOrder(symbol, orderSide, quantity);

      // Get filled quantity from order response (if available) or use requested quantity as fallback
      const filledQuantity = order.filledQuantity || quantity;

      console.log(`[GraduatedEntry] Order executed on ${exchangeName}:`, {
        orderId: order.orderId,
        side: orderSide,
        requestedQuantity: quantity,
        filledQuantity,
      });

      return {
        orderId: order.orderId,
        filledQuantity,
      };
    } catch (error: any) {
      console.error(`[GraduatedEntry] Error executing order on ${exchangeName}:`, error.message);

      // Add exchange context to error
      const enrichedError: any = new Error(`${exchangeName} order failed: ${error.message}`);
      enrichedError.exchange = exchangeType;
      enrichedError.originalError = error;

      throw enrichedError;
    }
  }

  /**
   * Delay helper function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is a validation error (minimum quantity, etc.)
   */
  private isValidationError(errorMsg: string): boolean {
    const lowerMsg = errorMsg.toLowerCase();
    return (
      lowerMsg.includes('minimum') ||
      lowerMsg.includes('min qty') ||
      lowerMsg.includes('minqty') ||
      lowerMsg.includes('min order') ||
      lowerMsg.includes('lot size') ||
      lowerMsg.includes('invalid quantity') ||
      lowerMsg.includes('invalid amount')
    );
  }

  /**
   * Format validation error for user-friendly display
   */
  private formatValidationError(errorMsg: string, exchange: string, symbol: string, quantity: number): string {
    // Try to parse minimum quantity from error
    const minMatch = errorMsg.match(/minimum order amount is (\d+(?:\.\d+)?)\s*(\w+)/i) ||
                    errorMsg.match(/minimum.*?(\d+(?:\.\d+)?)/i) ||
                    errorMsg.match(/min.*?qty.*?(\d+(?:\.\d+)?)/i);

    if (minMatch) {
      const minQty = parseFloat(minMatch[1]);
      const asset = minMatch[2] || symbol.replace(/USDT|USDC|USD/gi, '');

      return (
        `${exchange}: Помилка валідації - кількість ${quantity} ${asset} менше мінімальної.\n` +
        `Мінімальна кількість: ${minQty} ${asset}.\n` +
        `Збільште кількість до ${minQty} або більше.`
      );
    }

    // Generic validation error
    return `${exchange}: Помилка валідації - ${errorMsg}`;
  }

  /**
   * Stop a position and close all open positions on both exchanges
   *
   * CRITICAL FIX: Enhanced logging, error handling, and WebSocket cleanup
   */
  async stopPosition(positionId: string): Promise<void> {
    console.log(`[GraduatedEntry] ========================================`);
    console.log(`[GraduatedEntry] STOP POSITION REQUEST: ${positionId}`);
    console.log(`[GraduatedEntry] ========================================`);

    const position = this.positions.get(positionId);
    if (!position) {
      console.error(`[GraduatedEntry] ✗ Position ${positionId} not found in memory`);
      throw new Error(`Position ${positionId} not found in memory. It may have been cleared after backend restart.`);
    }

    console.log(`[GraduatedEntry] Position found in memory:`, {
      positionId,
      symbol: position.config.symbol,
      primaryExchange: position.config.primaryExchange,
      hedgeExchange: position.config.hedgeExchange,
      status: position.status
    });

    try {
      // CRITICAL: Cleanup WebSocket subscriptions FIRST to stop monitoring
      console.log(`[GraduatedEntry] Cleaning up WebSocket subscriptions...`);
      if (position.primaryPriceUnsubscribe) {
        try {
          position.primaryPriceUnsubscribe();
          console.log(`[GraduatedEntry] ✓ Primary WebSocket unsubscribed`);
        } catch (error: any) {
          console.warn(`[GraduatedEntry] Warning: Failed to unsubscribe primary WebSocket:`, error.message);
        }
      }
      if (position.hedgePriceUnsubscribe) {
        try {
          position.hedgePriceUnsubscribe();
          console.log(`[GraduatedEntry] ✓ Hedge WebSocket unsubscribed`);
        } catch (error: any) {
          console.warn(`[GraduatedEntry] Warning: Failed to unsubscribe hedge WebSocket:`, error.message);
        }
      }
      if (position.primaryPositionUnsubscribe) {
        try {
          position.primaryPositionUnsubscribe();
          console.log(`[GraduatedEntry] ✓ Primary position WebSocket unsubscribed`);
        } catch (error: any) {
          console.warn(`[GraduatedEntry] Warning: Failed to unsubscribe primary position WebSocket:`, error.message);
        }
      }
      if (position.hedgePositionUnsubscribe) {
        try {
          position.hedgePositionUnsubscribe();
          console.log(`[GraduatedEntry] ✓ Hedge position WebSocket unsubscribed`);
        } catch (error: any) {
          console.warn(`[GraduatedEntry] Warning: Failed to unsubscribe hedge position WebSocket:`, error.message);
        }
      }

      // Close positions on both exchanges with detailed logging
      console.log(`[GraduatedEntry] Closing positions on both exchanges...`);

      const [primaryResult, hedgeResult] = await Promise.allSettled([
        this.closePositionOnExchange(
          position.primaryConnector,
          position.config.symbol,
          position.config.primaryExchange
        ),
        this.closePositionOnExchange(
          position.hedgeConnector,
          position.config.symbol,
          position.config.hedgeExchange
        ),
      ]);

      // Log results from both exchanges
      console.log(`[GraduatedEntry] Primary exchange close result:`, primaryResult);
      console.log(`[GraduatedEntry] Hedge exchange close result:`, hedgeResult);

      // Check if any critical errors occurred
      const primaryFailed = primaryResult.status === 'rejected';
      const hedgeFailed = hedgeResult.status === 'rejected';

      if (primaryFailed && hedgeFailed) {
        throw new Error(
          `Failed to close positions on both exchanges. ` +
          `Primary: ${(primaryResult as PromiseRejectedResult).reason}. ` +
          `Hedge: ${(hedgeResult as PromiseRejectedResult).reason}`
        );
      } else if (primaryFailed) {
        console.warn(`[GraduatedEntry] ⚠️ Primary position close failed: ${(primaryResult as PromiseRejectedResult).reason}`);
      } else if (hedgeFailed) {
        console.warn(`[GraduatedEntry] ⚠️ Hedge position close failed: ${(hedgeResult as PromiseRejectedResult).reason}`);
      }

      position.status = 'cancelled';
      position.completedAt = new Date();

      // Update database with COMPLETED status (positions manually closed)
      if (position.dbId) {
        console.log(`[GraduatedEntry] Updating database position ${position.dbId} to COMPLETED`);
        await prisma.graduatedEntryPosition.update({
          where: { id: position.dbId },
          data: {
            status: 'COMPLETED', // COMPLETED = positions closed successfully
            completedAt: position.completedAt,
          },
        }).catch(err => console.error('[GraduatedEntry] ✗ DB update error:', err.message));
      }

      console.log(`[GraduatedEntry] ✓ Position ${positionId} stopped and marked as COMPLETED`);
      console.log(`[GraduatedEntry] ========================================`);
    } catch (error: any) {
      console.error(`[GraduatedEntry] ✗ Error stopping position ${positionId}:`, error.message);
      console.error(`[GraduatedEntry] ========================================`);
      throw error;
    }
  }

  /**
   * Final rebalancing after all parts are executed
   *
   * Checks position sizes on both exchanges and rebalances if discrepancy > 0.5%
   * - If balance >= 100% of entry amount: buy more on smaller position
   * - If balance < 100%: sell from larger position
   */
  private async finalRebalancing(
    position: ActiveArbitragePosition,
    config: GraduatedEntryConfig
  ): Promise<void> {
    const { id } = position;

    try {
      console.log(`[GraduatedEntry] ${id} - 🔄 Starting final rebalancing check...`);

      // Get actual position sizes from both exchanges
      const [primaryPosition, hedgePosition] = await Promise.all([
        this.getExchangePosition(position.primaryConnector, config.symbol, config.primaryExchange),
        this.getExchangePosition(position.hedgeConnector, config.symbol, config.hedgeExchange),
      ]);

      if (!primaryPosition || !hedgePosition) {
        console.warn(`[GraduatedEntry] ${id} - ⚠️ Cannot rebalance: position not found on one or both exchanges`);
        return;
      }

      const primarySize = primaryPosition.size;
      const hedgeSize = hedgePosition.size;
      const discrepancy = Math.abs(primarySize - hedgeSize);
      const discrepancyPercent = (discrepancy / Math.max(primarySize, hedgeSize)) * 100;

      console.log(`[GraduatedEntry] ${id} - Final position sizes:`, {
        primary: primarySize,
        hedge: hedgeSize,
        discrepancy: discrepancy.toFixed(6),
        discrepancyPercent: discrepancyPercent.toFixed(2) + '%',
      });

      // Check if rebalancing is needed
      if (discrepancyPercent <= 0.1) {
        console.log(`[GraduatedEntry] ${id} - ✅ Discrepancy ${discrepancyPercent.toFixed(2)}% is within acceptable range (≤0.1%)`);
        return;
      }

      console.warn(`[GraduatedEntry] ${id} - ⚠️ Discrepancy ${discrepancyPercent.toFixed(2)}% exceeds 0.1% threshold! Starting rebalancing...`);

      // Determine which side needs adjustment
      const needsMoreOnPrimary = primarySize < hedgeSize;
      const largerExchange = needsMoreOnPrimary ? config.hedgeExchange : config.primaryExchange;
      const smallerExchange = needsMoreOnPrimary ? config.primaryExchange : config.hedgeExchange;
      const smallerConnector = needsMoreOnPrimary ? position.primaryConnector : position.hedgeConnector;
      const largerConnector = needsMoreOnPrimary ? position.hedgeConnector : position.primaryConnector;

      // Get available balance on the exchange that needs adjustment
      const totalEntryValue = config.primaryQuantity; // USDT value of entry
      const requiredBalance = totalEntryValue; // 100% of entry amount

      // Get available balance
      let availableBalance = 0;
      try {
        const balanceInfo = await (needsMoreOnPrimary ? position.primaryConnector : position.hedgeConnector).getAccountBalance();
        availableBalance = balanceInfo.availableBalance || 0;
        console.log(`[GraduatedEntry] ${id} - Available balance on ${needsMoreOnPrimary ? 'primary' : 'hedge'}: ${availableBalance} USDT`);
      } catch (balanceError: any) {
        console.error(`[GraduatedEntry] ${id} - Could not fetch balance:`, balanceError.message);
        console.warn(`[GraduatedEntry] ${id} - Skipping rebalancing due to balance fetch error`);
        return;
      }

      // Decide rebalancing action
      if (availableBalance >= requiredBalance) {
        // Strategy 1: Buy more on smaller position
        console.log(`[GraduatedEntry] ${id} - ✅ Sufficient balance (${availableBalance} USDT >= ${requiredBalance} USDT)`);
        console.log(`[GraduatedEntry] ${id} - 📈 Rebalancing: BUY ${discrepancy.toFixed(6)} on ${smallerExchange}`);

        try {
          const side = needsMoreOnPrimary ? config.primarySide : config.hedgeSide;
          await this.executeMarketOrder(
            smallerConnector,
            config.symbol,
            side,
            discrepancy,
            smallerExchange,
            needsMoreOnPrimary ? 'primary' : 'hedge'
          );

          console.log(`[GraduatedEntry] ${id} - ✅ Rebalancing order executed successfully`);
        } catch (rebalanceError: any) {
          console.error(`[GraduatedEntry] ${id} - ❌ Rebalancing order failed:`, rebalanceError.message);
          console.warn(`[GraduatedEntry] ${id} - Position remains unbalanced - manual intervention may be required`);
        }
      } else {
        // Strategy 2: Sell from larger position
        console.log(`[GraduatedEntry] ${id} - ⚠️ Insufficient balance (${availableBalance} USDT < ${requiredBalance} USDT)`);
        console.log(`[GraduatedEntry] ${id} - 📉 Rebalancing: SELL ${discrepancy.toFixed(6)} from ${largerExchange}`);

        try {
          // Sell means: if larger position is long → sell, if short → buy back
          const largerSide = needsMoreOnPrimary ? config.hedgeSide : config.primarySide;
          const oppositeSide: 'long' | 'short' = largerSide === 'long' ? 'short' : 'long';

          await this.executeMarketOrder(
            largerConnector,
            config.symbol,
            oppositeSide, // Opposite side to reduce position
            discrepancy,
            largerExchange,
            needsMoreOnPrimary ? 'hedge' : 'primary'
          );

          console.log(`[GraduatedEntry] ${id} - ✅ Rebalancing order executed successfully`);
        } catch (rebalanceError: any) {
          console.error(`[GraduatedEntry] ${id} - ❌ Rebalancing order failed:`, rebalanceError.message);
          console.warn(`[GraduatedEntry] ${id} - Position remains unbalanced - manual intervention may be required`);
        }
      }

      // Verify rebalancing result
      try {
        await this.delay(2000); // Wait for order to settle

        const [newPrimaryPos, newHedgePos] = await Promise.all([
          this.getExchangePosition(position.primaryConnector, config.symbol, config.primaryExchange),
          this.getExchangePosition(position.hedgeConnector, config.symbol, config.hedgeExchange),
        ]);

        if (newPrimaryPos && newHedgePos) {
          const newDiscrepancy = Math.abs(newPrimaryPos.size - newHedgePos.size);
          const newDiscrepancyPercent = (newDiscrepancy / Math.max(newPrimaryPos.size, newHedgePos.size)) * 100;

          console.log(`[GraduatedEntry] ${id} - After rebalancing:`, {
            primary: newPrimaryPos.size,
            hedge: newHedgePos.size,
            discrepancy: newDiscrepancy.toFixed(6),
            discrepancyPercent: newDiscrepancyPercent.toFixed(2) + '%',
          });

          if (newDiscrepancyPercent <= 0.5) {
            console.log(`[GraduatedEntry] ${id} - ✅ Rebalancing successful! Discrepancy now ${newDiscrepancyPercent.toFixed(2)}%`);
          } else {
            console.warn(`[GraduatedEntry] ${id} - ⚠️ Discrepancy still ${newDiscrepancyPercent.toFixed(2)}% after rebalancing`);
          }
        }
      } catch (verifyError: any) {
        console.warn(`[GraduatedEntry] ${id} - Could not verify rebalancing result:`, verifyError.message);
      }
    } catch (error: any) {
      console.error(`[GraduatedEntry] ${id} - Error in final rebalancing:`, error.message);
      // Don't throw - rebalancing is optional, position is still valid
    }
  }

  /**
   * Set synchronized TP/SL orders on both exchanges
   * Key concept: Primary SL = Hedge TP, Hedge SL = Primary TP
   * This ensures both positions close simultaneously when one side is triggered
   */
  private async setSynchronizedTpSl(
    position: ActiveArbitragePosition,
    primaryEntryPrice: number,
    hedgeEntryPrice: number
  ): Promise<void> {
    const { config } = position;

    console.log('═'.repeat(80));
    console.log(`[GraduatedEntry] ${position.id} - Setting synchronized TP/SL orders`);
    console.log('═'.repeat(80));

    // Import liquidation calculator
    const { LiquidationCalculator } = await import('@/lib/liquidation-calculator');

    // Determine if we should use funding-aware TP/SL or liquidation-based TP/SL
    const hasFundingRates = config.primaryFundingRate !== undefined && config.hedgeFundingRate !== undefined;

    let sltp: {
      primaryStopLoss: number;
      primaryTakeProfit: number;
      hedgeStopLoss: number;
      hedgeTakeProfit: number;
      explanation: string;
    };

    if (hasFundingRates) {
      // COMBINED STRATEGY: Use funding-aware TP/SL
      console.log(`[GraduatedEntry] ${position.id} - Using COMBINED STRATEGY TP/SL (funding-aware)`);
      sltp = LiquidationCalculator.calculateCombinedStrategyTPSL({
        primaryEntryPrice,
        primarySide: config.primarySide,
        primaryLeverage: config.primaryLeverage,
        primaryExchange: config.primaryExchange,
        primaryFundingRate: config.primaryFundingRate!,
        hedgeEntryPrice,
        hedgeSide: config.hedgeSide,
        hedgeLeverage: config.hedgeLeverage,
        hedgeExchange: config.hedgeExchange,
        hedgeFundingRate: config.hedgeFundingRate!,
        targetHoldingPeriodHours: config.targetHoldingPeriodHours,
        minProfitPercent: config.minProfitPercent,
      });
    } else {
      // PRICE-ONLY STRATEGY: Use liquidation-based TP/SL
      console.log(`[GraduatedEntry] ${position.id} - Using PRICE-ONLY STRATEGY TP/SL (liquidation-based)`);
      sltp = LiquidationCalculator.calculateSynchronizedSLTP({
        primaryEntryPrice,
        primarySide: config.primarySide,
        primaryLeverage: config.primaryLeverage,
        primaryExchange: config.primaryExchange,
        hedgeEntryPrice,
        hedgeSide: config.hedgeSide,
        hedgeLeverage: config.hedgeLeverage,
        hedgeExchange: config.hedgeExchange,
      });
    }

    console.log(`[GraduatedEntry] ${position.id} - Calculated TP/SL levels:`);
    console.log(sltp.explanation);
    console.log('');

    // Track results
    let primarySuccess = false;
    let hedgeSuccess = false;
    let primaryError: string | null = null;
    let hedgeError: string | null = null;

    // Set TP/SL on PRIMARY exchange
    console.log(`[GraduatedEntry] ${position.id} - Setting TP/SL on PRIMARY (${config.primaryExchange})...`);

    if (typeof position.primaryConnector.setTradingStop === 'function') {
      try {
        await position.primaryConnector.setTradingStop({
          symbol: config.symbol,
          side: config.primarySide,
          takeProfit: sltp.primaryTakeProfit,
          stopLoss: sltp.primaryStopLoss,
        });
        primarySuccess = true;
        console.log(`[GraduatedEntry] ${position.id} - ✅ PRIMARY TP/SL set successfully`);
        console.log(`  Stop-Loss: ${sltp.primaryStopLoss.toFixed(6)} (closes if price hits this)`);
        console.log(`  Take-Profit: ${sltp.primaryTakeProfit.toFixed(6)} (closes if price hits this)`);
      } catch (error: any) {
        primaryError = error.message;

        // Check if TP/SL are already set (not an error, just skip)
        if (error.message.includes('not modified') || error.message.includes('already set')) {
          console.log(`[GraduatedEntry] ${position.id} - ℹ️ PRIMARY TP/SL already set, skipping`);
          primarySuccess = true; // Consider it success since TP/SL exist
        } else {
          console.error(`[GraduatedEntry] ${position.id} - ❌ Failed to set PRIMARY TP/SL:`, error.message);
        }
      }
    } else {
      console.warn(`[GraduatedEntry] ${position.id} - ⚠️ PRIMARY exchange (${config.primaryExchange}) does not support setTradingStop`);
    }

    console.log('');

    // Set TP/SL on HEDGE exchange (always try, even if primary failed)
    console.log(`[GraduatedEntry] ${position.id} - Setting TP/SL on HEDGE (${config.hedgeExchange})...`);
    console.log(`[GraduatedEntry] ${position.id} - Hedge connector type:`, position.hedgeConnector.constructor.name);
    console.log(`[GraduatedEntry] ${position.id} - setTradingStop exists?`, typeof position.hedgeConnector.setTradingStop);
    console.log(`[GraduatedEntry] ${position.id} - setTradingStop is function?`, typeof position.hedgeConnector.setTradingStop === 'function');

    if (typeof position.hedgeConnector.setTradingStop === 'function') {
      try {
        await position.hedgeConnector.setTradingStop({
          symbol: config.symbol,
          side: config.hedgeSide,
          takeProfit: sltp.hedgeTakeProfit,
          stopLoss: sltp.hedgeStopLoss,
        });
        hedgeSuccess = true;
        console.log(`[GraduatedEntry] ${position.id} - ✅ HEDGE TP/SL set successfully`);
        console.log(`  Stop-Loss: ${sltp.hedgeStopLoss.toFixed(6)} (closes if price hits this)`);
        console.log(`  Take-Profit: ${sltp.hedgeTakeProfit.toFixed(6)} (closes if price hits this)`);
      } catch (error: any) {
        hedgeError = error.message;

        // Check if TP/SL are already set (not an error, just skip)
        if (error.message.includes('not modified') || error.message.includes('already set')) {
          console.log(`[GraduatedEntry] ${position.id} - ℹ️ HEDGE TP/SL already set, skipping`);
          hedgeSuccess = true; // Consider it success since TP/SL exist
        } else {
          console.error(`[GraduatedEntry] ${position.id} - ❌ Failed to set HEDGE TP/SL:`, error.message);
        }
      }
    } else {
      console.warn(`[GraduatedEntry] ${position.id} - ⚠️ HEDGE exchange (${config.hedgeExchange}) does not support setTradingStop`);
    }

    console.log('');

    // Summary
    if (primarySuccess || hedgeSuccess) {
      console.log(`[GraduatedEntry] ${position.id} - 🛡️ SYNCHRONIZED TP/SL PROTECTION ACTIVE`);
      console.log(`[GraduatedEntry] ${position.id} - When PRIMARY hits SL → HEDGE hits TP (both close)`);
      console.log(`[GraduatedEntry] ${position.id} - When HEDGE hits SL → PRIMARY hits TP (both close)`);

      if (primarySuccess && hedgeSuccess) {
        console.log(`[GraduatedEntry] ${position.id} - ✅ TP/SL set on BOTH exchanges`);
      } else if (primarySuccess) {
        console.log(`[GraduatedEntry] ${position.id} - ⚠️ TP/SL set on PRIMARY only (HEDGE: ${hedgeError})`);
      } else if (hedgeSuccess) {
        console.log(`[GraduatedEntry] ${position.id} - ⚠️ TP/SL set on HEDGE only (PRIMARY: ${primaryError})`);
      }
    } else {
      // Both failed - this is a real error
      console.error(`[GraduatedEntry] ${position.id} - ❌ FAILED to set TP/SL on both exchanges`);
      throw new Error(`Failed to set TP/SL: PRIMARY (${primaryError}), HEDGE (${hedgeError})`);
    }

    console.log('═'.repeat(80));
  }

  /**
   * Emergency close position (triggered by liquidation protection)
   * Closes BOTH positions immediately to prevent liquidation
   */
  async emergencyClosePosition(positionId: string, reason: string): Promise<void> {
    console.error('━'.repeat(80));
    console.error(`🛡️ EMERGENCY POSITION CLOSURE`);
    console.error('━'.repeat(80));
    console.error(`Position ID: ${positionId}`);
    console.error(`Reason: ${reason}`);
    console.error('━'.repeat(80));

    const position = this.positions.get(positionId);

    if (!position) {
      console.error(`[GraduatedEntry] Position ${positionId} not found in memory`);
      throw new Error(`Position ${positionId} not found`);
    }

    try {
      // Unsubscribe from price updates
      if (position.primaryPriceUnsubscribe) {
        position.primaryPriceUnsubscribe();
      }
      if (position.hedgePriceUnsubscribe) {
        position.hedgePriceUnsubscribe();
      }
      // Unsubscribe from position updates
      if (position.primaryPositionUnsubscribe) {
        position.primaryPositionUnsubscribe();
      }
      if (position.hedgePositionUnsubscribe) {
        position.hedgePositionUnsubscribe();
      }

      // Close BOTH positions immediately
      console.error(`[GraduatedEntry] 🚨 Closing BOTH positions to prevent liquidation...`);

      const [primaryResult, hedgeResult] = await Promise.allSettled([
        this.closePositionOnExchange(
          position.primaryConnector,
          position.config.symbol,
          position.config.primaryExchange
        ),
        this.closePositionOnExchange(
          position.hedgeConnector,
          position.config.symbol,
          position.config.hedgeExchange
        ),
      ]);

      // Check results
      const primarySuccess = primaryResult.status === 'fulfilled';
      const hedgeSuccess = hedgeResult.status === 'fulfilled';

      if (primarySuccess && hedgeSuccess) {
        console.error(`[GraduatedEntry] ✅ EMERGENCY CLOSE SUCCESSFUL - Both positions closed`);
      } else if (primarySuccess) {
        console.error(`[GraduatedEntry] ⚠️ Primary closed, hedge failed: ${(hedgeResult as PromiseRejectedResult).reason}`);
      } else if (hedgeSuccess) {
        console.error(`[GraduatedEntry] ⚠️ Hedge closed, primary failed: ${(primaryResult as PromiseRejectedResult).reason}`);
      } else {
        console.error(`[GraduatedEntry] ❌ BOTH closures failed!`);
        throw new Error('Emergency close failed on both exchanges');
      }

      // Update position status
      position.status = 'cancelled';
      position.completedAt = new Date();

      // Update database
      if (position.dbId) {
        await prisma.graduatedEntryPosition.update({
          where: { id: position.dbId },
          data: {
            status: 'COMPLETED',
            completedAt: position.completedAt,
            errorMessage: `Emergency close: ${reason}`,
          },
        }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
      }

      // Remove from active positions
      this.positions.delete(positionId);

      console.error(`[GraduatedEntry] ✓ Position ${positionId} emergency closed and removed`);
      console.error('━'.repeat(80));
    } catch (error: any) {
      console.error(`[GraduatedEntry] ❌ Emergency close error:`, error.message);
      console.error('━'.repeat(80));
      throw error;
    }
  }

  /**
   * Manually sync TP/SL for an existing position
   * This can be called from API to set synchronized TP/SL on existing positions
   *
   * @param positionId The position ID to sync
   * @param userId The user ID (for security validation)
   */
  async syncTpSlForPosition(positionId: string, userId: string): Promise<void> {
    console.log(`[GraduatedEntry] Syncing TP/SL for position ${positionId}`);

    // First try to find position in memory
    let position = this.positions.get(positionId);

    // If not in memory, load from database
    if (!position) {
      console.log(`[GraduatedEntry] Position not in memory, loading from database...`);

      const dbPos = await prisma.graduatedEntryPosition.findFirst({
        where: {
          positionId: positionId,
          userId: userId,
        },
      });

      if (!dbPos) {
        throw new Error(`Position ${positionId} not found or does not belong to user`);
      }

      // Allow syncing for ACTIVE and ERROR positions (in case positions are actually open on exchanges)
      if (dbPos.status !== 'ACTIVE' && dbPos.status !== 'ERROR') {
        throw new Error(`Position ${positionId} is not active (status: ${dbPos.status})`);
      }

      // If position has ERROR status, warn user but proceed
      if (dbPos.status === 'ERROR') {
        console.warn(`[GraduatedEntry] ⚠️ Warning: Setting TP/SL for position with ERROR status. Make sure positions are actually open on exchanges!`);
      }

      // Load credentials and create connectors
      const primaryCred = await ExchangeCredentialsService.getCredentialById(
        dbPos.userId,
        dbPos.primaryCredentialId
      );

      const hedgeCred = await ExchangeCredentialsService.getCredentialById(
        dbPos.userId,
        dbPos.hedgeCredentialId
      );

      if (!primaryCred || !hedgeCred) {
        throw new Error('Credentials not found for this position');
      }

      // Create connectors
      const primaryCredentials: ExchangeCredentials = {
        apiKey: primaryCred.apiKey,
        apiSecret: primaryCred.apiSecret,
        testnet: primaryCred.environment === 'TESTNET',
        credentialId: primaryCred.id,
        authToken: primaryCred.authToken,
      };

      const hedgeCredentials: ExchangeCredentials = {
        apiKey: hedgeCred.apiKey,
        apiSecret: hedgeCred.apiSecret,
        testnet: hedgeCred.environment === 'TESTNET',
        credentialId: hedgeCred.id,
        authToken: hedgeCred.authToken,
      };

      const primaryConnector = await this.createConnector(
        dbPos.primaryExchange,
        primaryCredentials
      );

      const hedgeConnector = await this.createConnector(
        dbPos.hedgeExchange,
        hedgeCredentials
      );

      // Create position config
      const config: GraduatedEntryConfig = {
        userId: dbPos.userId,
        symbol: dbPos.symbol,
        primaryExchange: dbPos.primaryExchange,
        primarySide: dbPos.primarySide as 'long' | 'short',
        primaryLeverage: dbPos.primaryLeverage,
        primaryQuantity: dbPos.primaryQuantity,
        hedgeExchange: dbPos.hedgeExchange,
        hedgeSide: dbPos.hedgeSide as 'long' | 'short',
        hedgeLeverage: dbPos.hedgeLeverage,
        hedgeQuantity: dbPos.hedgeQuantity,
        graduatedEntryParts: dbPos.graduatedParts,
        graduatedEntryDelayMs: dbPos.graduatedDelayMs,
      };

      // Create temporary position object
      position = {
        id: dbPos.positionId,
        dbId: dbPos.id,
        config,
        primaryConnector,
        primaryCredentials,
        primaryFilledQuantity: dbPos.primaryFilledQty,
        primaryOrderIds: dbPos.primaryOrderIds,
        primaryStatus: dbPos.primaryStatus as any,
        hedgeConnector,
        hedgeCredentials,
        hedgeFilledQuantity: dbPos.hedgeFilledQty,
        hedgeOrderIds: dbPos.hedgeOrderIds,
        hedgeStatus: dbPos.hedgeStatus as any,
        status: dbPos.status.toLowerCase() as any,
        startedAt: dbPos.startedAt,
        completedAt: dbPos.completedAt || undefined,
        currentPart: dbPos.currentPart,
      };
    }

    // Fetch current entry prices from exchanges
    let primaryEntryPrice: number | null = null;
    let hedgeEntryPrice: number | null = null;

    const primaryPosition = await this.getExchangePosition(
      position.primaryConnector,
      position.config.symbol,
      position.config.primaryExchange
    );

    if (primaryPosition) {
      primaryEntryPrice = primaryPosition.entryPrice;
    }

    const hedgePosition = await this.getExchangePosition(
      position.hedgeConnector,
      position.config.symbol,
      position.config.hedgeExchange
    );

    if (hedgePosition) {
      hedgeEntryPrice = hedgePosition.entryPrice;
    }

    // Validate we have entry prices
    if (!primaryEntryPrice || !hedgeEntryPrice) {
      throw new Error('Could not fetch entry prices from exchanges. Make sure positions are still open.');
    }

    // Call setSynchronizedTpSl
    await this.setSynchronizedTpSl(position, primaryEntryPrice, hedgeEntryPrice);

    console.log(`[GraduatedEntry] ✅ TP/SL synchronized successfully for position ${positionId}`);
  }

  /**
   * Close position on exchange
   *
   * CRITICAL FIX: Enhanced logging and better error handling
   */
  private async closePositionOnExchange(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    exchangeName: string
  ): Promise<void> {
    console.log(`[GraduatedEntry] --> Closing position on ${exchangeName} for ${symbol}`);

    try {
      const result = await connector.closePosition(symbol);
      console.log(`[GraduatedEntry] ✓ Position closed on ${exchangeName}:`, result);
    } catch (error: any) {
      const errorMsg = error.message || String(error);

      // If no position exists, that's not an error - log and continue
      if (errorMsg.toLowerCase().includes('no position') ||
          errorMsg.toLowerCase().includes('no open position') ||
          errorMsg.toLowerCase().includes('nothing to close')) {
        console.log(`[GraduatedEntry] ✓ No position to close on ${exchangeName} (already closed or never opened)`);
        return; // Success - nothing to close
      }

      // Any other error is critical
      console.error(`[GraduatedEntry] ✗ CRITICAL: Failed to close position on ${exchangeName}:`, errorMsg);
      console.error(`[GraduatedEntry] Full error:`, error);
      throw new Error(`${exchangeName}: ${errorMsg}`);
    }
  }

  /**
   * Start continuous monitoring of positions on both exchanges using WebSocket
   * Uses real-time mark price updates instead of HTTP polling
   * CRITICAL: If one side is liquidated, immediately close the other side
   */
  private async startPositionMonitoring(position: ActiveArbitragePosition): Promise<void> {
    const { id, config } = position;
    const MONITORING_THROTTLE_MS = 1000; // Throttle checks to max once per second

    console.log(`[GraduatedEntry] Starting WebSocket-based position monitoring for ${id}`);

    // Helper function to check positions on both exchanges
    const checkPositions = async () => {
      // Throttle checks to avoid spamming
      const now = Date.now();
      if (position.lastMonitoringCheck && (now - position.lastMonitoringCheck) < MONITORING_THROTTLE_MS) {
        return; // Skip check if too soon
      }
      position.lastMonitoringCheck = now;

      try {
        // Check if position still exists in memory
        if (!this.positions.has(id)) {
          console.log(`[GraduatedEntry] Position ${id} removed, stopping monitoring`);
          // Cleanup WebSocket subscriptions
          if (position.primaryPriceUnsubscribe) {
            position.primaryPriceUnsubscribe();
          }
          if (position.hedgePriceUnsubscribe) {
            position.hedgePriceUnsubscribe();
          }
          if (position.primaryPositionUnsubscribe) {
            position.primaryPositionUnsubscribe();
          }
          if (position.hedgePositionUnsubscribe) {
            position.hedgePositionUnsubscribe();
          }
          return;
        }

        // Get current positions from both exchanges
        const [primaryPosition, hedgePosition] = await Promise.all([
          this.getExchangePosition(position.primaryConnector, config.symbol, config.primaryExchange),
          this.getExchangePosition(position.hedgeConnector, config.symbol, config.hedgeExchange),
        ]);

        console.log(`[GraduatedEntry] WebSocket monitoring ${id}:`, {
          primary: primaryPosition ? `${primaryPosition.size} @ ${primaryPosition.side}` : 'NO POSITION',
          hedge: hedgePosition ? `${hedgePosition.size} @ ${hedgePosition.side}` : 'NO POSITION',
        });

        // CRITICAL BUG FIX: DISABLED faulty liquidation detection
        // Previous logic had a critical flaw: it treated API errors as liquidations!
        // Problem: getExchangePosition() returns null for BOTH:
        //   1. Actual liquidation (correct)
        //   2. API errors/timeouts (WRONG - causes false liquidations)
        // This caused position arb_1_1761293126654 to be incorrectly liquidated
        // when both positions were safe (proximity ratios: -0.08 and 0.014)

        // NEW: Proper price-based liquidation detection
        await this.checkLiquidationByPrice(position, primaryPosition, hedgePosition);

        /* DISABLED - OLD FAULTY LIQUIDATION DETECTION
        const primaryLiquidated = !primaryPosition || primaryPosition.size === 0;
        const hedgeLiquidated = !hedgePosition || hedgePosition.size === 0;

        if (primaryLiquidated && !hedgeLiquidated) {
          // Primary liquidated - immediately close hedge
          console.error(`[GraduatedEntry] 🚨 PRIMARY POSITION LIQUIDATED ON ${config.primaryExchange}! Closing hedge position immediately!`);

          // Cleanup WebSocket subscriptions first
          if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
          if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
          if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
          if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

          try {
            await this.closePositionOnExchange(
              position.hedgeConnector,
              config.symbol,
              config.hedgeExchange
            );

            // Update status to LIQUIDATED
            position.status = 'cancelled';
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'LIQUIDATED',
                  errorMessage: `Primary position liquidated on ${config.primaryExchange}. Hedge position closed automatically.`,
                  completedAt: new Date(),
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            console.log(`[GraduatedEntry] Hedge position closed. Position ${id} marked as LIQUIDATED.`);
          } catch (error: any) {
            console.error(`[GraduatedEntry] Failed to close hedge position after primary liquidation:`, error.message);
          }
        } else if (hedgeLiquidated && !primaryLiquidated) {
          // Hedge liquidated - immediately close primary
          console.error(`[GraduatedEntry] 🚨 HEDGE POSITION LIQUIDATED ON ${config.hedgeExchange}! Closing primary position immediately!`);

          // Cleanup WebSocket subscriptions first
          if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
          if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
          if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
          if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

          try {
            await this.closePositionOnExchange(
              position.primaryConnector,
              config.symbol,
              config.primaryExchange
            );

            // Update status to LIQUIDATED
            position.status = 'cancelled';
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'LIQUIDATED',
                  errorMessage: `Hedge position liquidated on ${config.hedgeExchange}. Primary position closed automatically.`,
                  completedAt: new Date(),
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            console.log(`[GraduatedEntry] Primary position closed. Position ${id} marked as LIQUIDATED.`);
          } catch (error: any) {
            console.error(`[GraduatedEntry] Failed to close primary position after hedge liquidation:`, error.message);
          }
        } else if (primaryLiquidated && hedgeLiquidated) {
          // Both liquidated
          console.error(`[GraduatedEntry] 🚨 BOTH POSITIONS LIQUIDATED!`);

          // Cleanup WebSocket subscriptions
          if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
          if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
          if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
          if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

          position.status = 'cancelled';
          if (position.dbId) {
            await prisma.graduatedEntryPosition.update({
              where: { id: position.dbId },
              data: {
                status: 'LIQUIDATED',
                errorMessage: 'Both positions were liquidated.',
                completedAt: new Date(),
              },
            }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
          }
        }
        END OF DISABLED FAULTY LIQUIDATION DETECTION */
      } catch (error: any) {
        console.error(`[GraduatedEntry] Error in monitoring check for ${id}:`, error.message);
        // Continue monitoring even if one check fails
      }
    };

    try {
      // Subscribe to price updates via WebSocket for both exchanges
      // For BingX, use mark price subscription (more stable, used for liquidations)
      // For Bybit, use ticker subscription (similar behavior)

      const primaryExchange = config.primaryExchange.toUpperCase();
      const hedgeExchange = config.hedgeExchange.toUpperCase();

      // Subscribe to primary exchange WebSocket
      if (primaryExchange.includes('BINGX')) {
        // BingX: Use mark price WebSocket stream
        if (typeof (position.primaryConnector as any).subscribeToMarkPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to BingX mark price WebSocket for ${config.symbol}...`);
          position.primaryPriceUnsubscribe = await (position.primaryConnector as any).subscribeToMarkPriceStream(
            config.symbol,
            (price: number) => {
              console.log(`[GraduatedEntry] ${id} - BingX mark price update: ${price}`);
              checkPositions();
            }
          );
        }
      } else if (primaryExchange.includes('BYBIT')) {
        // Bybit: Use price stream (ticker)
        if (typeof (position.primaryConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Bybit price WebSocket for ${config.symbol}...`);
          position.primaryPriceUnsubscribe = await (position.primaryConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Bybit price update: ${price}`);
              checkPositions();
            }
          );
        }
      } else if (primaryExchange.includes('MEXC')) {
        // MEXC: Use price stream (ticker)
        if (typeof (position.primaryConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to MEXC price WebSocket for ${config.symbol}...`);
          position.primaryPriceUnsubscribe = await (position.primaryConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - MEXC price update: ${price}`);
              checkPositions();
            }
          );
        }
      } else if (primaryExchange.includes('GATEIO') || primaryExchange.includes('GATE')) {
        // Gate.io: Use price stream (ticker) or mark price stream
        if (typeof (position.primaryConnector as any).subscribeToMarkPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Gate.io mark price WebSocket for ${config.symbol}...`);
          position.primaryPriceUnsubscribe = await (position.primaryConnector as any).subscribeToMarkPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Gate.io mark price update: ${price}`);
              checkPositions();
            }
          );
        } else if (typeof (position.primaryConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Gate.io price WebSocket for ${config.symbol}...`);
          position.primaryPriceUnsubscribe = await (position.primaryConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Gate.io price update: ${price}`);
              checkPositions();
            }
          );
        }
      }

      // Subscribe to hedge exchange WebSocket
      if (hedgeExchange.includes('BINGX')) {
        // BingX: Use mark price WebSocket stream
        if (typeof (position.hedgeConnector as any).subscribeToMarkPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to BingX mark price WebSocket for ${config.symbol}...`);
          position.hedgePriceUnsubscribe = await (position.hedgeConnector as any).subscribeToMarkPriceStream(
            config.symbol,
            (price: number) => {
              console.log(`[GraduatedEntry] ${id} - BingX mark price update: ${price}`);
              checkPositions();
            }
          );
        }

        // BingX: Subscribe to position updates for real-time P&L
        if (typeof (position.hedgeConnector as any).subscribeToPositions === 'function') {
          console.log(`[GraduatedEntry] Subscribing to BingX position updates for real-time P&L...`);
          try {
            await (position.hedgeConnector as any).subscribeToPositions((positionUpdate: any) => {
              console.log(`[GraduatedEntry] ${id} - BingX position update received:`, {
                positions: positionUpdate.positions.length,
                eventTime: new Date(positionUpdate.eventTime).toISOString()
              });

              // Find matching position for this symbol
              const matchingPosition = positionUpdate.positions.find((p: any) =>
                p.symbol === this.normalizeSymbolForBingX(config.symbol)
              );

              if (matchingPosition && position.dbId) {
                console.log(`[GraduatedEntry] ${id} - Updating BingX hedge P&L:`, {
                  unrealizedProfit: matchingPosition.unrealizedProfit,
                  realizedProfit: matchingPosition.realizedProfit
                });

                // Update database with current price for liquidation monitoring
                // Note: P&L is calculated on frontend, not stored in DB
                prisma.graduatedEntryPosition.update({
                  where: { id: position.dbId },
                  data: {
                    hedgeCurrentPrice: parseFloat(matchingPosition.entryPrice) || undefined,
                    lastMonitoringCheck: new Date(),
                    updatedAt: new Date()
                  }
                }).catch(err => console.error(`[GraduatedEntry] Failed to update monitoring data:`, err.message));
              }
            });
            console.log(`[GraduatedEntry] ✓ Subscribed to BingX position updates`);
          } catch (error: any) {
            console.error(`[GraduatedEntry] Failed to subscribe to BingX positions:`, error.message);
          }
        }
      } else if (hedgeExchange.includes('BYBIT')) {
        // Bybit: Use price stream (ticker)
        if (typeof (position.hedgeConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Bybit price WebSocket for ${config.symbol}...`);
          position.hedgePriceUnsubscribe = await (position.hedgeConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Bybit price update: ${price}`);
              checkPositions();
            }
          );
        }
      } else if (hedgeExchange.includes('MEXC')) {
        // MEXC: Use price stream (ticker)
        if (typeof (position.hedgeConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to MEXC price WebSocket for ${config.symbol}...`);
          position.hedgePriceUnsubscribe = await (position.hedgeConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - MEXC price update: ${price}`);
              checkPositions();
            }
          );
        }
      } else if (hedgeExchange.includes('GATEIO') || hedgeExchange.includes('GATE')) {
        // Gate.io: Use price stream (ticker) or mark price stream
        if (typeof (position.hedgeConnector as any).subscribeToMarkPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Gate.io mark price WebSocket for ${config.symbol}...`);
          position.hedgePriceUnsubscribe = await (position.hedgeConnector as any).subscribeToMarkPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Gate.io mark price update: ${price}`);
              checkPositions();
            }
          );
        } else if (typeof (position.hedgeConnector as any).subscribeToPriceStream === 'function') {
          console.log(`[GraduatedEntry] Subscribing to Gate.io price WebSocket for ${config.symbol}...`);
          position.hedgePriceUnsubscribe = await (position.hedgeConnector as any).subscribeToPriceStream(
            config.symbol,
            (price: number, timestamp: number) => {
              console.log(`[GraduatedEntry] ${id} - Gate.io price update: ${price}`);
              checkPositions();
            }
          );
        }
      }

      console.log(`[GraduatedEntry] ✓ WebSocket monitoring started for ${id}`);

      // Perform initial check
      await checkPositions();

    } catch (error: any) {
      console.error(`[GraduatedEntry] Error starting WebSocket monitoring for ${id}:`, error.message);
      // Fall back to HTTP polling if WebSocket fails
      console.log(`[GraduatedEntry] Falling back to HTTP polling for ${id}`);
      this.startPollingMonitoring(position);
    }
  }

  /**
   * Fallback: HTTP polling-based monitoring (if WebSocket fails)
   */
  private async startPollingMonitoring(position: ActiveArbitragePosition): Promise<void> {
    const { id, config } = position;
    const monitoringIntervalMs = 5000; // Check every 5 seconds

    console.log(`[GraduatedEntry] Starting HTTP polling monitoring for ${id}`);

    // Monitor positions in a loop
    const monitorLoop = async () => {
      while (position.status === 'completed') {
        try {
          await this.delay(monitoringIntervalMs);

          // Check if position still exists
          if (!this.positions.has(id)) {
            console.log(`[GraduatedEntry] Position ${id} removed, stopping monitoring`);
            return;
          }

          // Get current positions from both exchanges
          const [primaryPosition, hedgePosition] = await Promise.all([
            this.getExchangePosition(position.primaryConnector, config.symbol, config.primaryExchange),
            this.getExchangePosition(position.hedgeConnector, config.symbol, config.hedgeExchange),
          ]);

          console.log(`[GraduatedEntry] Polling monitoring ${id}:`, {
            primary: primaryPosition ? `${primaryPosition.size} @ ${primaryPosition.side}` : 'NO POSITION',
            hedge: hedgePosition ? `${hedgePosition.size} @ ${hedgePosition.side}` : 'NO POSITION',
          });

          // CRITICAL BUG FIX: Use proper price-based liquidation detection (same as WebSocket monitoring)
          await this.checkLiquidationByPrice(position, primaryPosition, hedgePosition);

          /* DISABLED - OLD FAULTY LIQUIDATION DETECTION
          const primaryLiquidated = !primaryPosition || primaryPosition.size === 0;
          const hedgeLiquidated = !hedgePosition || hedgePosition.size === 0;

          if (primaryLiquidated && !hedgeLiquidated) {
            // Primary liquidated - immediately close hedge
            console.error(`[GraduatedEntry] 🚨 PRIMARY POSITION LIQUIDATED ON ${config.primaryExchange}! Closing hedge position immediately!`);

            try {
              await this.closePositionOnExchange(
                position.hedgeConnector,
                config.symbol,
                config.hedgeExchange
              );

              // Update status to LIQUIDATED
              position.status = 'cancelled';
              if (position.dbId) {
                await prisma.graduatedEntryPosition.update({
                  where: { id: position.dbId },
                  data: {
                    status: 'LIQUIDATED',
                    errorMessage: `Primary position liquidated on ${config.primaryExchange}. Hedge position closed automatically.`,
                    completedAt: new Date(),
                  },
                }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
              }

              console.log(`[GraduatedEntry] Hedge position closed. Position ${id} marked as LIQUIDATED.`);
              return; // Stop monitoring
            } catch (error: any) {
              console.error(`[GraduatedEntry] Failed to close hedge position after primary liquidation:`, error.message);
            }
          } else if (hedgeLiquidated && !primaryLiquidated) {
            // Hedge liquidated - immediately close primary
            console.error(`[GraduatedEntry] 🚨 HEDGE POSITION LIQUIDATED ON ${config.hedgeExchange}! Closing primary position immediately!`);

            try {
              await this.closePositionOnExchange(
                position.primaryConnector,
                config.symbol,
                config.primaryExchange
              );

              // Update status to LIQUIDATED
              position.status = 'cancelled';
              if (position.dbId) {
                await prisma.graduatedEntryPosition.update({
                  where: { id: position.dbId },
                  data: {
                    status: 'LIQUIDATED',
                    errorMessage: `Hedge position liquidated on ${config.hedgeExchange}. Primary position closed automatically.`,
                    completedAt: new Date(),
                  },
                }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
              }

              console.log(`[GraduatedEntry] Primary position closed. Position ${id} marked as LIQUIDATED.`);
              return; // Stop monitoring
            } catch (error: any) {
              console.error(`[GraduatedEntry] Failed to close primary position after hedge liquidation:`, error.message);
            }
          } else if (primaryLiquidated && hedgeLiquidated) {
            // Both liquidated
            console.error(`[GraduatedEntry] 🚨 BOTH POSITIONS LIQUIDATED!`);

            position.status = 'cancelled';
            if (position.dbId) {
              await prisma.graduatedEntryPosition.update({
                where: { id: position.dbId },
                data: {
                  status: 'LIQUIDATED',
                  errorMessage: 'Both positions were liquidated.',
                  completedAt: new Date(),
                },
              }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
            }

            return; // Stop monitoring
          }
          END OF DISABLED FAULTY LIQUIDATION DETECTION */
        } catch (error: any) {
          console.error(`[GraduatedEntry] Error in polling monitoring loop for ${id}:`, error.message);
          // Continue monitoring even if one check fails
        }
      }
    };

    // Start monitoring loop (don't await - let it run in background)
    monitorLoop().catch(error => {
      console.error(`[GraduatedEntry] Polling monitoring loop crashed for ${id}:`, error.message);
    });
  }

  /**
   * NEW: Proper price-based liquidation detection
   *
   * This method uses calculated liquidation prices and current market prices
   * to determine if a position is truly liquidated, instead of relying on
   * position size checks which can produce false positives due to API errors.
   *
   * Detection criteria:
   * 1. Position no longer exists on exchange (getExchangePosition returns null)
   * 2. Current market price has crossed the calculated liquidation price
   * 3. Both checks must be true to confirm liquidation (prevents false positives)
   *
   * @param position - Active arbitrage position
   * @param primaryPosition - Primary position from exchange API (or null if API error)
   * @param hedgePosition - Hedge position from exchange API (or null if API error)
   */
  private async checkLiquidationByPrice(
    position: ActiveArbitragePosition,
    primaryPosition: { size: number; side: string; entryPrice: number } | null,
    hedgePosition: { size: number; side: string; entryPrice: number } | null
  ): Promise<void> {
    const { id, config } = position;

    // Skip if we don't have entry prices from database
    const dbPosition = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: id },
      select: {
        primaryEntryPrice: true,
        hedgeEntryPrice: true,
        primaryLeverage: true,
        hedgeLeverage: true,
        primarySide: true,
        hedgeSide: true,
      }
    });

    if (!dbPosition?.primaryEntryPrice || !dbPosition?.hedgeEntryPrice) {
      console.log(`[GraduatedEntry] ${id} - Cannot check liquidation: missing entry prices`);
      return; // Cannot verify liquidation without entry prices
    }

    // Import liquidation calculator
    const { liquidationCalculatorService } = await import('@/services/liquidation-calculator.service');

    try {
      // Get current market prices
      const [primaryPrice, hedgePrice] = await Promise.all([
        this.getCurrentMarketPrice(position.primaryConnector, config.symbol),
        this.getCurrentMarketPrice(position.hedgeConnector, config.symbol),
      ]);

      if (!primaryPrice || !hedgePrice) {
        console.warn(`[GraduatedEntry] ${id} - Cannot check liquidation: failed to get current prices`);
        return; // Skip check if we can't get prices
      }

      // Calculate liquidation prices
      const primaryLiqCalc = liquidationCalculatorService.calculateLiquidationPrice({
        entryPrice: dbPosition.primaryEntryPrice,
        leverage: dbPosition.primaryLeverage,
        side: dbPosition.primarySide as 'long' | 'short',
        exchange: config.primaryExchange.toUpperCase().includes('BYBIT') ? 'BYBIT' : 'BINGX',
      });

      const hedgeLiqCalc = liquidationCalculatorService.calculateLiquidationPrice({
        entryPrice: dbPosition.hedgeEntryPrice,
        leverage: dbPosition.hedgeLeverage,
        side: dbPosition.hedgeSide as 'long' | 'short',
        exchange: config.hedgeExchange.toUpperCase().includes('BYBIT') ? 'BYBIT' : 'BINGX',
      });

      // Check if price has crossed liquidation threshold
      const primaryPriceCrossed = dbPosition.primarySide === 'long'
        ? primaryPrice <= primaryLiqCalc.liquidationPrice * 1.02 // 2% buffer for long
        : primaryPrice >= primaryLiqCalc.liquidationPrice * 0.98; // 2% buffer for short

      const hedgePriceCrossed = dbPosition.hedgeSide === 'long'
        ? hedgePrice <= hedgeLiqCalc.liquidationPrice * 1.02
        : hedgePrice >= hedgeLiqCalc.liquidationPrice * 0.98;

      // CRITICAL: Only trigger liquidation if BOTH conditions are met:
      // 1. Position no longer exists (or size = 0) on exchange
      // 2. Current price has crossed calculated liquidation price
      const primaryLiquidated = (!primaryPosition || primaryPosition.size === 0) && primaryPriceCrossed;
      const hedgeLiquidated = (!hedgePosition || hedgePosition.size === 0) && hedgePriceCrossed;

      console.log(`[GraduatedEntry] ${id} - Liquidation check:`, {
        primary: {
          exists: !!primaryPosition,
          size: primaryPosition?.size || 0,
          currentPrice: primaryPrice,
          liqPrice: primaryLiqCalc.liquidationPrice,
          priceCrossed: primaryPriceCrossed,
          liquidated: primaryLiquidated,
        },
        hedge: {
          exists: !!hedgePosition,
          size: hedgePosition?.size || 0,
          currentPrice: hedgePrice,
          liqPrice: hedgeLiqCalc.liquidationPrice,
          priceCrossed: hedgePriceCrossed,
          liquidated: hedgeLiquidated,
        }
      });

      // Handle liquidation scenarios
      if (primaryLiquidated && !hedgeLiquidated) {
        console.error(`[GraduatedEntry] 🚨 PRIMARY LIQUIDATION CONFIRMED (price-based check)`);
        console.error(`[GraduatedEntry] Primary: current=${primaryPrice}, liq=${primaryLiqCalc.liquidationPrice}`);
        await this.handlePrimaryLiquidation(position, config);
      } else if (hedgeLiquidated && !primaryLiquidated) {
        console.error(`[GraduatedEntry] 🚨 HEDGE LIQUIDATION CONFIRMED (price-based check)`);
        console.error(`[GraduatedEntry] Hedge: current=${hedgePrice}, liq=${hedgeLiqCalc.liquidationPrice}`);
        await this.handleHedgeLiquidation(position, config);
      } else if (primaryLiquidated && hedgeLiquidated) {
        console.error(`[GraduatedEntry] 🚨 BOTH POSITIONS LIQUIDATED (price-based check)`);
        await this.handleBothLiquidated(position);
      } else if (!primaryPosition && !hedgePosition) {
        // Both positions missing but prices are safe - likely API error
        console.warn(`[GraduatedEntry] ⚠️ Both positions not found but prices are SAFE - likely API error`);
        console.warn(`[GraduatedEntry] Primary: current=${primaryPrice}, liq=${primaryLiqCalc.liquidationPrice}`);
        console.warn(`[GraduatedEntry] Hedge: current=${hedgePrice}, liq=${hedgeLiqCalc.liquidationPrice}`);
        console.warn(`[GraduatedEntry] NOT triggering liquidation - waiting for next check`);
      }
    } catch (error: any) {
      console.error(`[GraduatedEntry] Error in price-based liquidation check for ${id}:`, error.message);
      // Don't trigger liquidation on error - better to miss one check than false positive
    }
  }

  /**
   * Handle primary position liquidation
   */
  private async handlePrimaryLiquidation(position: ActiveArbitragePosition, config: GraduatedEntryConfig): Promise<void> {
    const { id } = position;

    // Cleanup WebSocket subscriptions
    if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
    if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
    if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
    if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

    try {
      await this.closePositionOnExchange(
        position.hedgeConnector,
        config.symbol,
        config.hedgeExchange
      );

      position.status = 'cancelled';
      if (position.dbId) {
        await prisma.graduatedEntryPosition.update({
          where: { id: position.dbId },
          data: {
            status: 'LIQUIDATED',
            errorMessage: `Primary position liquidated on ${config.primaryExchange}. Hedge position closed automatically.`,
            completedAt: new Date(),
          },
        }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
      }

      this.positions.delete(id);
      console.log(`[GraduatedEntry] ${id} - Hedge closed after primary liquidation`);
    } catch (error: any) {
      console.error(`[GraduatedEntry] Failed to close hedge after primary liquidation:`, error.message);
    }
  }

  /**
   * Handle hedge position liquidation
   */
  private async handleHedgeLiquidation(position: ActiveArbitragePosition, config: GraduatedEntryConfig): Promise<void> {
    const { id } = position;

    // Cleanup WebSocket subscriptions
    if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
    if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
    if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
    if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

    try {
      await this.closePositionOnExchange(
        position.primaryConnector,
        config.symbol,
        config.primaryExchange
      );

      position.status = 'cancelled';
      if (position.dbId) {
        await prisma.graduatedEntryPosition.update({
          where: { id: position.dbId },
          data: {
            status: 'LIQUIDATED',
            errorMessage: `Hedge position liquidated on ${config.hedgeExchange}. Primary position closed automatically.`,
            completedAt: new Date(),
          },
        }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
      }

      this.positions.delete(id);
      console.log(`[GraduatedEntry] ${id} - Primary closed after hedge liquidation`);
    } catch (error: any) {
      console.error(`[GraduatedEntry] Failed to close primary after hedge liquidation:`, error.message);
    }
  }

  /**
   * Handle both positions liquidated
   */
  private async handleBothLiquidated(position: ActiveArbitragePosition): Promise<void> {
    const { id } = position;

    // Cleanup WebSocket subscriptions
    if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
    if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();
    if (position.primaryPositionUnsubscribe) position.primaryPositionUnsubscribe();
    if (position.hedgePositionUnsubscribe) position.hedgePositionUnsubscribe();

    position.status = 'cancelled';
    if (position.dbId) {
      await prisma.graduatedEntryPosition.update({
        where: { id: position.dbId },
        data: {
          status: 'LIQUIDATED',
          errorMessage: 'Both positions were liquidated.',
          completedAt: new Date(),
        },
      }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
    }

    this.positions.delete(id);
    console.log(`[GraduatedEntry] ${id} - Both positions liquidated`);
  }

  /**
   * Get current market price from connector
   */
  private async getCurrentMarketPrice(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string
  ): Promise<number | null> {
    try {
      // All connectors have getMarketPrice method
      const price = await connector.getMarketPrice(symbol);
      return price || null;
    } catch (error: any) {
      console.error(`[GraduatedEntry] Error getting market price for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get position from exchange
   * Returns position details or null if no position exists
   *
   * CRITICAL FIX: Handles different position property names across exchanges
   * - BingX uses: positionAmt, avgPrice, positionSide
   * - Bybit/CCXT uses: size, entryPrice, side
   * - MEXC uses: holdVol, holdAvgPrice, positionType
   * - Gate.io uses: size, entry_price, contract
   */
  private async getExchangePosition(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    exchangeName: string
  ): Promise<{ size: number; side: string; entryPrice: number } | null> {
    try {
      const positions = await connector.getPositions(symbol);

      console.log(`[GraduatedEntry] getExchangePosition: ${exchangeName} returned ${positions.length} positions for ${symbol}`);

      // Find position for this symbol
      const position = positions.find((p: any) => {
        // Normalize symbol comparison to handle different formats:
        // - BingX: "STG-USDT"
        // - Bybit: "STGUSDT" or "STG/USDT:USDT" (perpetual swap format)
        // - Gate.io: "STG_USDT" (uses 'contract' field, not 'symbol')
        // - Target: "STGUSDT"

        // Gate.io uses 'contract' field, others use 'symbol'
        const posSymbolRaw = p.symbol || p.contract;
        const posSymbol = posSymbolRaw
          ?.replace(/[-/:_]/g, '')  // Remove hyphens, slashes, colons, underscores
          ?.toUpperCase();

        const targetSymbol = symbol
          ?.replace(/[-/:_]/g, '')  // Remove hyphens, slashes, colons, underscores
          ?.toUpperCase();

        // Get position size - handle different property names
        // BingX uses 'positionAmt', Bybit uses 'size', MEXC uses 'holdVol', Gate.io uses 'size', CCXT uses 'contracts'
        const posSize = Math.abs(parseFloat(p.positionAmt || p.size || p.holdVol || p.contracts || '0'));

        const matches = posSymbol === targetSymbol && posSize > 0;

        if (matches) {
          console.log(`[GraduatedEntry] ✓ Found position: symbol=${posSymbolRaw}, size=${posSize}, side=${p.positionSide || p.side || p.mode}`);
        }

        return matches;
      });

      if (!position) {
        console.log(`[GraduatedEntry] No position found for ${symbol} on ${exchangeName}`);
        return null;
      }

      // Extract size - handle different property names
      // BingX: positionAmt, Bybit: size, MEXC: holdVol, Gate.io: size
      const size = Math.abs(parseFloat(position.positionAmt || position.size || position.holdVol || position.contracts || '0'));

      // Extract side - BingX uses 'positionSide', others use 'side'
      // Gate.io: positive size = long, negative size = short (already handled by size extraction)
      const side = position.positionSide || position.side || 'unknown';

      // Extract entry price - handle different property names
      // BingX: avgPrice, Bybit: entryPrice, MEXC: holdAvgPrice, Gate.io: entry_price
      const entryPrice = parseFloat(position.avgPrice || position.entryPrice || position.holdAvgPrice || position.entry_price || '0');

      return {
        size,
        side,
        entryPrice,
      };
    } catch (error: any) {
      console.error(`[GraduatedEntry] Error getting position from ${exchangeName}:`, error.message);
      return null;
    }
  }

  /**
   * Normalize symbol for BingX (add hyphen before USDT)
   * BingX requires format like "BTC-USDT" instead of "BTCUSDT"
   */
  private normalizeSymbolForBingX(symbol: string): string {
    if (symbol.includes('-')) {
      return symbol; // Already normalized
    }

    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      return `${base}-USDT`;
    }

    if (symbol.endsWith('USDC')) {
      const base = symbol.slice(0, -4);
      return `${base}-USDC`;
    }

    return symbol;
  }

  /**
   * Get position status
   */
  getPosition(positionId: string): ActiveArbitragePosition | undefined {
    return this.positions.get(positionId);
  }

  /**
   * Get all active positions
   */
  getAllPositions(): ActiveArbitragePosition[] {
    return Array.from(this.positions.values());
  }

  /**
   * Get positions for a specific user
   */
  async getUserPositions(userId: string): Promise<ActiveArbitragePosition[]> {
    await this.ensureRestored();
    return Array.from(this.positions.values()).filter(
      position => position.config.userId === userId
    );
  }
}

// Export singleton instance
export const graduatedEntryArbitrageService = new GraduatedEntryArbitrageService();
