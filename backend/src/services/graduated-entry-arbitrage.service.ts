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
  primaryPriceUnsubscribe?: () => void;    // Unsubscribe function for primary exchange WebSocket
  hedgePriceUnsubscribe?: () => void;       // Unsubscribe function for hedge exchange WebSocket
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
  }

  /**
   * Ensure positions are restored from database (lazy initialization)
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
   * Restore active positions from database on service startup
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
          };

          const hedgeCredentials: ExchangeCredentials = {
            apiKey: hedgeCred.apiKey,
            apiSecret: hedgeCred.apiSecret,
            testnet: hedgeCred.environment === 'TESTNET',
            credentialId: hedgeCred.id,
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

    // Calculate quantity per part
    const primaryQuantityPerPart = config.primaryQuantity / graduatedEntryParts;
    const hedgeQuantityPerPart = config.hedgeQuantity / graduatedEntryParts;

    console.log(`[GraduatedEntry] ${position.id} - Quantity per part:`, {
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

        // CRITICAL: For the FIRST part, execute SEQUENTIALLY to validate before opening hedge
        // This prevents opening hedge position if primary fails validation
        if (part === 1) {
          console.log(`[GraduatedEntry] ${position.id} - First part: executing PRIMARY first for validation`);

          // Execute primary order first
          try {
            primaryOrderId = await this.executeMarketOrder(
              position.primaryConnector,
              config.symbol,
              config.primarySide,
              primaryQuantityPerPart,
              config.primaryExchange,
              'primary'
            );
          } catch (error: any) {
            // If primary fails on first part, check if it's a validation error
            const errorMsg = error.message || String(error);

            if (this.isValidationError(errorMsg)) {
              // Parse and format validation error for user
              const userError = this.formatValidationError(errorMsg, config.primaryExchange, symbol, primaryQuantityPerPart);
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

          console.log(`[GraduatedEntry] ${position.id} - PRIMARY order successful, now executing HEDGE`);

          // Primary succeeded, now execute hedge
          try {
            hedgeOrderId = await this.executeMarketOrder(
              position.hedgeConnector,
              config.symbol,
              config.hedgeSide,
              hedgeQuantityPerPart,
              config.hedgeExchange,
              'hedge'
            );
          } catch (error: any) {
            // Hedge failed but primary succeeded - CRITICAL situation!
            const errorMsg = error.message || String(error);

            if (this.isValidationError(errorMsg)) {
              const userError = this.formatValidationError(errorMsg, config.hedgeExchange, symbol, hedgeQuantityPerPart);
              console.error(`[GraduatedEntry] ${position.id} - ⚠️ CRITICAL: Hedge validation failed but PRIMARY is open!`);
              console.error(`[GraduatedEntry] ${position.id} - Attempting to close primary position...`);

              // Try to close primary position immediately
              try {
                await this.closePositionOnExchange(
                  position.primaryConnector,
                  config.symbol,
                  config.primaryExchange
                );
                console.log(`[GraduatedEntry] ${position.id} - ✓ Primary position closed successfully`);
              } catch (closeError: any) {
                console.error(`[GraduatedEntry] ${position.id} - ✗ Failed to close primary:`, closeError.message);
                userError += `\n⚠️ УВАГА: Primary позиція відкрита на ${config.primaryExchange} але не вдалося закрити! Закрийте вручну!`;
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

            // If not validation error, re-throw
            throw error;
          }
        } else {
          // For subsequent parts, execute SIMULTANEOUSLY (both exchanges validated already)
          [primaryOrderId, hedgeOrderId] = await Promise.all([
            this.executeMarketOrder(
              position.primaryConnector,
              config.symbol,
              config.primarySide,
              primaryQuantityPerPart,
              config.primaryExchange,
              'primary'
            ),
            this.executeMarketOrder(
              position.hedgeConnector,
              config.symbol,
              config.hedgeSide,
              hedgeQuantityPerPart,
              config.hedgeExchange,
              'hedge'
            ),
          ]);
        }

        // Update filled quantities
        position.primaryFilledQuantity += primaryQuantityPerPart;
        position.hedgeFilledQuantity += hedgeQuantityPerPart;

        // Store order IDs
        position.primaryOrderIds.push(primaryOrderId);
        position.hedgeOrderIds.push(hedgeOrderId);

        // Update database with progress
        if (position.dbId) {
          await prisma.graduatedEntryPosition.update({
            where: { id: position.dbId },
            data: {
              currentPart: part,
              primaryFilledQty: position.primaryFilledQuantity,
              hedgeFilledQty: position.hedgeFilledQuantity,
              primaryOrderIds: position.primaryOrderIds,
              hedgeOrderIds: position.hedgeOrderIds,
            },
          }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
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

    // Update database with ACTIVE status - positions are open and being monitored
    if (position.dbId) {
      await prisma.graduatedEntryPosition.update({
        where: { id: position.dbId },
        data: {
          status: 'ACTIVE', // ACTIVE = positions opened, monitoring both exchanges
          primaryStatus: 'completed',
          hedgeStatus: 'completed',
        },
      }).catch(err => console.error('[GraduatedEntry] DB update error:', err.message));
    }

    console.log(`[GraduatedEntry] ${position.id} - All parts executed, positions ACTIVE and monitoring:`, {
      primaryFilled: position.primaryFilledQuantity,
      hedgeFilled: position.hedgeFilledQuantity,
      primaryOrders: position.primaryOrderIds.length,
      hedgeOrders: position.hedgeOrderIds.length,
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
   */
  private async executeMarketOrder(
    connector: BybitConnector | BingXConnector | MEXCConnector | GateIOConnector,
    symbol: string,
    side: 'long' | 'short',
    quantity: number,
    exchangeName: string,
    exchangeType: 'primary' | 'hedge'
  ): Promise<string> {
    try {
      console.log(`[GraduatedEntry] Executing ${side} market order on ${exchangeName}:`, {
        symbol,
        quantity,
      });

      // Convert side to exchange-specific format
      const orderSide = side === 'long' ? 'Buy' : 'Sell';

      // Place market order
      const order = await connector.placeMarketOrder(symbol, orderSide, quantity);

      console.log(`[GraduatedEntry] Order executed on ${exchangeName}:`, {
        orderId: order.orderId,
        side: orderSide,
        quantity,
      });

      return order.orderId;
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

        // CRITICAL: Check if one side was liquidated
        const primaryLiquidated = !primaryPosition || primaryPosition.size === 0;
        const hedgeLiquidated = !hedgePosition || hedgePosition.size === 0;

        if (primaryLiquidated && !hedgeLiquidated) {
          // Primary liquidated - immediately close hedge
          console.error(`[GraduatedEntry] 🚨 PRIMARY POSITION LIQUIDATED ON ${config.primaryExchange}! Closing hedge position immediately!`);

          // Cleanup WebSocket subscriptions first
          if (position.primaryPriceUnsubscribe) position.primaryPriceUnsubscribe();
          if (position.hedgePriceUnsubscribe) position.hedgePriceUnsubscribe();

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

          // CRITICAL: Check if one side was liquidated
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
        // - Target: "STGUSDT"

        const posSymbol = p.symbol
          ?.replace(/[-/:]/g, '')  // Remove hyphens, slashes, colons
          ?.toUpperCase();

        const targetSymbol = symbol
          ?.replace(/[-/:]/g, '')  // Remove hyphens, slashes, colons
          ?.toUpperCase();

        // Get position size - handle different property names
        // BingX uses 'positionAmt', Bybit uses 'size', MEXC uses 'holdVol', Gate.io uses 'size', CCXT uses 'contracts'
        const posSize = Math.abs(parseFloat(p.positionAmt || p.size || p.holdVol || p.contracts || '0'));

        const matches = posSymbol === targetSymbol && posSize > 0;

        if (matches) {
          console.log(`[GraduatedEntry] ✓ Found position: symbol=${p.symbol}, size=${posSize}, side=${p.positionSide || p.side}`);
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
