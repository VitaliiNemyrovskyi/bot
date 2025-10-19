/**
 * Liquidation Price Calculator Service
 *
 * CRITICAL SAFETY FEATURE: Calculates liquidation prices and monitors proximity to liquidation
 * for crypto futures positions on various exchanges.
 *
 * This service prevents catastrophic losses by:
 * 1. Calculating accurate liquidation prices based on exchange-specific formulas
 * 2. Monitoring position proximity to liquidation (alerts at 10% threshold)
 * 3. Supporting both Bybit and BingX perpetual futures with isolated margin
 *
 * FORMULAS RESEARCHED AND VERIFIED (January 2025):
 *
 * BYBIT USDT Perpetual (Isolated Margin):
 * - Long:  Liquidation Price = Entry Price - [(Initial Margin - Maintenance Margin) / Position Size]
 * - Short: Liquidation Price = Entry Price + [(Initial Margin - Maintenance Margin) / Position Size]
 * - Maintenance Margin = Position Value × MMR (Maintenance Margin Rate)
 * - Default MMR = 0.5% (varies by risk limit tier)
 *
 * BINGX USDT Perpetual (Isolated Margin):
 * - Uses similar formula to Bybit
 * - Long:  Liquidation Price = Entry Price × (1 - 1/Leverage + MMR)
 * - Short: Liquidation Price = Entry Price × (1 + 1/Leverage - MMR)
 * - Default MMR = 0.4% (varies by trading pair)
 *
 * SIMPLIFIED FORMULA (for quick estimates):
 * - Long:  Liquidation Price ≈ Entry Price × (1 - 1/Leverage + MMR)
 * - Short: Liquidation Price ≈ Entry Price × (1 + 1/Leverage - MMR)
 *
 * LIQUIDATION PROXIMITY:
 * - Calculated as: distance from current price to liquidation / distance from entry to liquidation
 * - If proximity > 0.9 (90%), position is within 10% of liquidation → ALERT!
 *
 * NOTE: These formulas do NOT include:
 * - Extra margin added manually
 * - Funding fees (ongoing)
 * - Trading fees to close position (estimated separately)
 *
 * For production use, always validate against exchange API's calculated liquidation price.
 */

export interface LiquidationCalculationParams {
  entryPrice: number;           // Position entry price (average)
  leverage: number;             // Leverage multiplier (e.g., 3 for 3x)
  side: 'long' | 'short';       // Position direction
  exchange: 'BYBIT' | 'BINGX';  // Exchange name
  maintenanceMarginRate?: number; // MMR (optional, uses default if not provided)
  positionSize?: number;        // Position size in contracts (for advanced calculation)
  initialMargin?: number;       // Initial margin in USDT (for advanced calculation)
  extraMargin?: number;         // Extra margin added (for advanced calculation)
}

export interface LiquidationCalculationResult {
  liquidationPrice: number;     // Calculated liquidation price
  mmr: number;                  // Maintenance margin rate used
  formula: string;              // Formula used for calculation
  warnings: string[];           // Any warnings about the calculation
}

export interface LiquidationProximityResult {
  liquidationPrice: number;     // Liquidation price
  currentPrice: number;         // Current market price
  entryPrice: number;           // Entry price
  distanceToLiquidation: number; // Distance from current to liquidation (in price units)
  distanceFromEntry: number;    // Distance from entry to liquidation (in price units)
  proximityRatio: number;       // 0.0 to 1.0+ (0.9+ = within 10% of liquidation)
  isInDanger: boolean;          // True if proximityRatio >= 0.9
  percentToLiquidation: number; // Percentage distance to liquidation (for display)
  side: 'long' | 'short';       // Position side
}

/**
 * Default Maintenance Margin Rates (MMR) by exchange
 *
 * These are conservative defaults. Actual MMR varies by:
 * - Risk limit tier (position size)
 * - Trading pair
 * - Account VIP level
 *
 * BYBIT: 0.5% for tier 1 (up to 2M USDT position value)
 * BINGX: 0.4% for most pairs (varies by symbol)
 */
const DEFAULT_MMR: Record<string, number> = {
  BYBIT: 0.005,  // 0.5%
  BINGX: 0.004,  // 0.4%
};

/**
 * Liquidation Calculator Service
 */
export class LiquidationCalculatorService {
  /**
   * Calculate liquidation price for a position
   *
   * @param params - Liquidation calculation parameters
   * @returns Liquidation price and calculation details
   * @throws Error if parameters are invalid
   */
  calculateLiquidationPrice(params: LiquidationCalculationParams): LiquidationCalculationResult {
    // Validate inputs
    this.validateParams(params);

    const {
      entryPrice,
      leverage,
      side,
      exchange,
      maintenanceMarginRate,
      positionSize,
      initialMargin,
      extraMargin,
    } = params;

    // Get MMR (use provided or default)
    const mmr = maintenanceMarginRate ?? DEFAULT_MMR[exchange];

    const warnings: string[] = [];

    // Use advanced formula if position details are provided
    if (positionSize && initialMargin !== undefined) {
      return this.calculateAdvancedLiquidationPrice(
        entryPrice,
        leverage,
        side,
        exchange,
        mmr,
        positionSize,
        initialMargin,
        extraMargin || 0
      );
    }

    // Use simplified formula (most common case)
    let liquidationPrice: number;
    let formula: string;

    if (side === 'long') {
      // Long position liquidation formula:
      // Liquidation Price = Entry Price × (1 - 1/Leverage + MMR)
      //
      // Explanation:
      // - (1 - 1/Leverage) = the point where initial margin is exhausted
      // - + MMR = add back maintenance margin requirement
      // - When price drops to this level, position has only maintenance margin left → liquidation
      liquidationPrice = entryPrice * (1 - 1 / leverage + mmr);
      formula = `Entry Price × (1 - 1/Leverage + MMR) = ${entryPrice} × (1 - 1/${leverage} + ${mmr})`;

      // Warn if liquidation price is very close to entry (high leverage)
      const dropPercentToLiquidation = ((entryPrice - liquidationPrice) / entryPrice) * 100;
      if (dropPercentToLiquidation < 2) {
        warnings.push(
          `WARNING: With ${leverage}x leverage, liquidation occurs at only ${dropPercentToLiquidation.toFixed(2)}% price drop. Consider reducing leverage.`
        );
      }
    } else {
      // Short position liquidation formula:
      // Liquidation Price = Entry Price × (1 + 1/Leverage - MMR)
      //
      // Explanation:
      // - (1 + 1/Leverage) = the point where initial margin is exhausted
      // - - MMR = subtract maintenance margin requirement
      // - When price rises to this level, position has only maintenance margin left → liquidation
      liquidationPrice = entryPrice * (1 + 1 / leverage - mmr);
      formula = `Entry Price × (1 + 1/Leverage - MMR) = ${entryPrice} × (1 + 1/${leverage} - ${mmr})`;

      // Warn if liquidation price is very close to entry (high leverage)
      const risePercentToLiquidation = ((liquidationPrice - entryPrice) / entryPrice) * 100;
      if (risePercentToLiquidation < 2) {
        warnings.push(
          `WARNING: With ${leverage}x leverage, liquidation occurs at only ${risePercentToLiquidation.toFixed(2)}% price rise. Consider reducing leverage.`
        );
      }
    }

    // Sanity check: liquidation price must be positive
    if (liquidationPrice <= 0) {
      throw new Error(
        `Invalid liquidation price calculated: ${liquidationPrice}. ` +
        `This should not happen with valid inputs. ` +
        `Entry=${entryPrice}, Leverage=${leverage}, Side=${side}, MMR=${mmr}`
      );
    }

    // Warn if using default MMR
    if (!maintenanceMarginRate) {
      warnings.push(
        `Using default MMR of ${(mmr * 100).toFixed(2)}% for ${exchange}. ` +
        `Actual MMR may vary by risk limit tier and trading pair.`
      );
    }

    return {
      liquidationPrice,
      mmr,
      formula,
      warnings,
    };
  }

  /**
   * Calculate liquidation price using advanced formula (with position size and margins)
   *
   * This is more accurate and follows the exact exchange formulas:
   * - Bybit: LP = Entry Price ± [(Initial Margin + Extra Margin - Maintenance Margin) / Position Size]
   * - BingX: Similar formula
   *
   * @private
   */
  private calculateAdvancedLiquidationPrice(
    entryPrice: number,
    leverage: number,
    side: 'long' | 'short',
    exchange: 'BYBIT' | 'BINGX',
    mmr: number,
    positionSize: number,
    initialMargin: number,
    extraMargin: number
  ): LiquidationCalculationResult {
    // Calculate maintenance margin
    const positionValue = positionSize * entryPrice;
    const maintenanceMargin = positionValue * mmr;

    // Calculate margin buffer (how much margin is above maintenance requirement)
    const marginBuffer = initialMargin + extraMargin - maintenanceMargin;

    let liquidationPrice: number;
    let formula: string;

    if (side === 'long') {
      // Long: LP = Entry Price - (Margin Buffer / Position Size)
      liquidationPrice = entryPrice - marginBuffer / positionSize;
      formula = `Entry - [(IM + Extra - MM) / Size] = ${entryPrice} - [(${initialMargin} + ${extraMargin} - ${maintenanceMargin.toFixed(2)}) / ${positionSize}]`;
    } else {
      // Short: LP = Entry Price + (Margin Buffer / Position Size)
      liquidationPrice = entryPrice + marginBuffer / positionSize;
      formula = `Entry + [(IM + Extra - MM) / Size] = ${entryPrice} + [(${initialMargin} + ${extraMargin} - ${maintenanceMargin.toFixed(2)}) / ${positionSize}]`;
    }

    const warnings: string[] = [];

    // Sanity check
    if (liquidationPrice <= 0) {
      throw new Error(
        `Invalid advanced liquidation price: ${liquidationPrice}. ` +
        `Entry=${entryPrice}, Side=${side}, PositionSize=${positionSize}, ` +
        `InitialMargin=${initialMargin}, MaintenanceMargin=${maintenanceMargin.toFixed(2)}`
      );
    }

    warnings.push('Using advanced formula with actual position margins.');

    return {
      liquidationPrice,
      mmr,
      formula,
      warnings,
    };
  }

  /**
   * Calculate liquidation proximity for a position
   *
   * Proximity ratio:
   * - 0.0 = at entry price (far from liquidation)
   * - 0.5 = halfway to liquidation
   * - 0.9 = 90% of the way to liquidation (DANGER! Within 10%)
   * - 1.0 = at liquidation price
   * - >1.0 = beyond liquidation (position would be liquidated)
   *
   * @param liquidationPrice - Calculated liquidation price
   * @param currentPrice - Current market price
   * @param entryPrice - Position entry price
   * @param side - Position side
   * @returns Proximity analysis with danger flag
   */
  calculateLiquidationProximity(
    liquidationPrice: number,
    currentPrice: number,
    entryPrice: number,
    side: 'long' | 'short'
  ): LiquidationProximityResult {
    let distanceToLiquidation: number;
    let distanceFromEntry: number;
    let proximityRatio: number;
    let percentToLiquidation: number;

    if (side === 'long') {
      // Long position: liquidation occurs when price drops
      // Distance to liquidation = current - liquidation (positive = safe, negative = liquidated)
      distanceToLiquidation = currentPrice - liquidationPrice;

      // Distance from entry to liquidation
      distanceFromEntry = entryPrice - liquidationPrice;

      // Proximity ratio = how much of the entry-to-liquidation distance has been traveled
      // 0.0 = at entry, 1.0 = at liquidation, >1.0 = beyond liquidation
      if (distanceFromEntry !== 0) {
        proximityRatio = (entryPrice - currentPrice) / distanceFromEntry;
      } else {
        // Edge case: entry price = liquidation price (should never happen with valid leverage)
        proximityRatio = currentPrice < entryPrice ? 1.0 : 0.0;
      }

      // Percentage remaining to liquidation (for display)
      percentToLiquidation = (distanceToLiquidation / currentPrice) * 100;
    } else {
      // Short position: liquidation occurs when price rises
      // Distance to liquidation = liquidation - current (positive = safe, negative = liquidated)
      distanceToLiquidation = liquidationPrice - currentPrice;

      // Distance from entry to liquidation
      distanceFromEntry = liquidationPrice - entryPrice;

      // Proximity ratio
      if (distanceFromEntry !== 0) {
        proximityRatio = (currentPrice - entryPrice) / distanceFromEntry;
      } else {
        // Edge case: entry price = liquidation price
        proximityRatio = currentPrice > entryPrice ? 1.0 : 0.0;
      }

      // Percentage remaining to liquidation (for display)
      percentToLiquidation = (distanceToLiquidation / currentPrice) * 100;
    }

    // Determine if position is in danger (within 10% of liquidation)
    // proximityRatio >= 0.9 means position has traveled 90% of the distance to liquidation
    const isInDanger = proximityRatio >= 0.9;

    return {
      liquidationPrice,
      currentPrice,
      entryPrice,
      distanceToLiquidation,
      distanceFromEntry,
      proximityRatio,
      isInDanger,
      percentToLiquidation,
      side,
    };
  }

  /**
   * Calculate both liquidation price and proximity in one call
   *
   * @param params - Liquidation calculation parameters
   * @param currentPrice - Current market price
   * @returns Combined calculation and proximity results
   */
  calculateLiquidationPriceAndProximity(
    params: LiquidationCalculationParams,
    currentPrice: number
  ): {
    calculation: LiquidationCalculationResult;
    proximity: LiquidationProximityResult;
  } {
    // Calculate liquidation price
    const calculation = this.calculateLiquidationPrice(params);

    // Calculate proximity
    const proximity = this.calculateLiquidationProximity(
      calculation.liquidationPrice,
      currentPrice,
      params.entryPrice,
      params.side
    );

    return {
      calculation,
      proximity,
    };
  }

  /**
   * Validate liquidation calculation parameters
   *
   * @private
   */
  private validateParams(params: LiquidationCalculationParams): void {
    const { entryPrice, leverage, side, exchange } = params;

    // Validate entry price
    if (!entryPrice || entryPrice <= 0) {
      throw new Error(`Invalid entry price: ${entryPrice}. Must be greater than 0.`);
    }

    // Validate leverage
    if (!leverage || leverage < 1) {
      throw new Error(`Invalid leverage: ${leverage}. Must be >= 1.`);
    }

    if (leverage > 125) {
      throw new Error(
        `Invalid leverage: ${leverage}. Maximum leverage is 125x. ` +
        `Using such high leverage is extremely risky and not recommended.`
      );
    }

    // Validate side
    if (side !== 'long' && side !== 'short') {
      throw new Error(`Invalid side: ${side}. Must be 'long' or 'short'.`);
    }

    // Validate exchange
    if (exchange !== 'BYBIT' && exchange !== 'BINGX') {
      throw new Error(`Unsupported exchange: ${exchange}. Supported: BYBIT, BINGX.`);
    }

    // Validate MMR if provided
    if (params.maintenanceMarginRate !== undefined) {
      const mmr = params.maintenanceMarginRate;
      if (mmr < 0 || mmr > 0.1) {
        throw new Error(
          `Invalid maintenance margin rate: ${mmr}. ` +
          `Expected range: 0.001 to 0.1 (0.1% to 10%).`
        );
      }
    }

    // Validate position size and margins if provided (for advanced calculation)
    if (params.positionSize !== undefined || params.initialMargin !== undefined) {
      if (!params.positionSize || params.positionSize <= 0) {
        throw new Error(`Invalid position size: ${params.positionSize}. Must be > 0.`);
      }

      if (params.initialMargin === undefined || params.initialMargin <= 0) {
        throw new Error(`Invalid initial margin: ${params.initialMargin}. Must be > 0.`);
      }

      if (params.extraMargin !== undefined && params.extraMargin < 0) {
        throw new Error(`Invalid extra margin: ${params.extraMargin}. Must be >= 0.`);
      }
    }
  }

  /**
   * Get default maintenance margin rate for an exchange
   *
   * @param exchange - Exchange name
   * @returns Default MMR as decimal (e.g., 0.005 = 0.5%)
   */
  getDefaultMMR(exchange: 'BYBIT' | 'BINGX'): number {
    return DEFAULT_MMR[exchange];
  }

  /**
   * Format liquidation proximity for display
   *
   * @param proximity - Proximity calculation result
   * @returns Human-readable proximity message
   */
  formatProximityMessage(proximity: LiquidationProximityResult): string {
    const { isInDanger, proximityRatio, percentToLiquidation, side } = proximity;

    if (proximityRatio >= 1.0) {
      return `🚨 LIQUIDATED: Current price has passed liquidation price!`;
    }

    if (isInDanger) {
      return (
        `⚠️ DANGER: Position is ${(proximityRatio * 100).toFixed(1)}% of the way to liquidation! ` +
        `Only ${Math.abs(percentToLiquidation).toFixed(2)}% price ${side === 'long' ? 'drop' : 'rise'} remaining.`
      );
    }

    if (proximityRatio >= 0.7) {
      return (
        `⚠️ WARNING: Position is ${(proximityRatio * 100).toFixed(1)}% of the way to liquidation. ` +
        `${Math.abs(percentToLiquidation).toFixed(2)}% price ${side === 'long' ? 'drop' : 'rise'} to liquidation.`
      );
    }

    return (
      `✓ Safe: ${(proximityRatio * 100).toFixed(1)}% to liquidation. ` +
      `${Math.abs(percentToLiquidation).toFixed(2)}% price ${side === 'long' ? 'drop' : 'rise'} remaining.`
    );
  }
}

// Export singleton instance
export const liquidationCalculatorService = new LiquidationCalculatorService();
