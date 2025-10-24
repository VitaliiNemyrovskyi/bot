/**
 * Liquidation Price Calculator
 *
 * Calculates liquidation prices for leveraged positions on different exchanges.
 * Each exchange has different liquidation formulas and maintenance margin requirements.
 */

export interface LiquidationParams {
  entryPrice: number;
  quantity: number;
  leverage: number;
  side: 'long' | 'short';
  maintenanceMarginRate?: number; // Exchange-specific, defaults provided
}

export interface LiquidationResult {
  liquidationPrice: number;
  maintenanceMargin: number;
  initialMargin: number;
  bankruptcyPrice: number;
  safeStopLoss: number;      // 20% away from liquidation
  criticalStopLoss: number;  // 10% away from liquidation
}

/**
 * Calculate liquidation price for a leveraged position
 *
 * Formula (simplified):
 * For LONG: Liq Price = Entry Price * (1 - (1 / Leverage) + MMR)
 * For SHORT: Liq Price = Entry Price * (1 + (1 / Leverage) - MMR)
 *
 * Where MMR = Maintenance Margin Rate
 */
export class LiquidationCalculator {

  /**
   * Default maintenance margin rates by exchange
   * These are approximate - actual rates vary by contract
   */
  private static readonly MAINTENANCE_MARGIN_RATES = {
    BYBIT: 0.005,   // 0.5% for most contracts
    BINGX: 0.005,   // 0.5%
    GATEIO: 0.005,  // 0.5%
    MEXC: 0.005,    // 0.5%
  };

  /**
   * Calculate liquidation price for any exchange
   */
  static calculateLiquidation(
    exchange: string,
    params: LiquidationParams
  ): LiquidationResult {
    const mmr = params.maintenanceMarginRate ||
                this.MAINTENANCE_MARGIN_RATES[exchange.toUpperCase() as keyof typeof this.MAINTENANCE_MARGIN_RATES] ||
                0.005;

    const { entryPrice, leverage, side } = params;

    let liquidationPrice: number;
    let bankruptcyPrice: number;

    if (side === 'long') {
      // For LONG positions: liquidation when price drops
      // Liq = Entry * (1 - (1/Leverage) + MMR)
      const liquidationMultiplier = 1 - (1 / leverage) + mmr;
      liquidationPrice = entryPrice * liquidationMultiplier;

      // Bankruptcy price (100% loss): Entry * (1 - 1/Leverage)
      bankruptcyPrice = entryPrice * (1 - 1 / leverage);
    } else {
      // For SHORT positions: liquidation when price rises
      // Liq = Entry * (1 + (1/Leverage) - MMR)
      const liquidationMultiplier = 1 + (1 / leverage) - mmr;
      liquidationPrice = entryPrice * liquidationMultiplier;

      // Bankruptcy price (100% loss): Entry * (1 + 1/Leverage)
      bankruptcyPrice = entryPrice * (1 + 1 / leverage);
    }

    // Calculate margins
    const positionValue = entryPrice * params.quantity;
    const initialMargin = positionValue / leverage;
    const maintenanceMargin = positionValue * mmr;

    // Calculate safe stop-loss levels
    let safeStopLoss: number;
    let criticalStopLoss: number;

    if (side === 'long') {
      // Safe SL: 20% away from liquidation (towards entry price)
      const distanceToLiq = entryPrice - liquidationPrice;
      safeStopLoss = liquidationPrice + distanceToLiq * 0.2;
      criticalStopLoss = liquidationPrice + distanceToLiq * 0.1;
    } else {
      // Safe SL: 20% away from liquidation (towards entry price)
      const distanceToLiq = liquidationPrice - entryPrice;
      safeStopLoss = liquidationPrice - distanceToLiq * 0.2;
      criticalStopLoss = liquidationPrice - distanceToLiq * 0.1;
    }

    return {
      liquidationPrice,
      maintenanceMargin,
      initialMargin,
      bankruptcyPrice,
      safeStopLoss,
      criticalStopLoss,
    };
  }

  /**
   * Calculate proximity to liquidation (0.0 to 1.0+)
   * 0.0 = at entry price
   * 0.9 = 90% of the way to liquidation (DANGER!)
   * 1.0 = at liquidation price
   * >1.0 = beyond liquidation
   */
  static calculateProximity(
    currentPrice: number,
    entryPrice: number,
    liquidationPrice: number,
    side: 'long' | 'short'
  ): number {
    if (side === 'long') {
      // For LONG: liquidation is below entry
      // Proximity = (Entry - Current) / (Entry - Liq)
      const totalDistance = entryPrice - liquidationPrice;
      const currentDistance = entryPrice - currentPrice;
      return currentDistance / totalDistance;
    } else {
      // For SHORT: liquidation is above entry
      // Proximity = (Current - Entry) / (Liq - Entry)
      const totalDistance = liquidationPrice - entryPrice;
      const currentDistance = currentPrice - entryPrice;
      return currentDistance / totalDistance;
    }
  }

  /**
   * Check if position is in danger (proximity > 80%)
   */
  static isInDanger(proximity: number): boolean {
    return proximity >= 0.8;
  }

  /**
   * Check if position is critical (proximity > 90%)
   */
  static isCritical(proximity: number): boolean {
    return proximity >= 0.9;
  }

  /**
   * Calculate synchronized SL/TP levels for arbitrage pair
   *
   * Key concept: When primary hits SL, hedge should hit TP at same price
   *
   * Returns: {
   *   primaryStopLoss, primaryTakeProfit,
   *   hedgeStopLoss, hedgeTakeProfit
   * }
   */
  static calculateSynchronizedSLTP(params: {
    primaryEntryPrice: number;
    primarySide: 'long' | 'short';
    primaryLeverage: number;
    primaryExchange: string;
    hedgeEntryPrice: number;
    hedgeSide: 'long' | 'short';
    hedgeLeverage: number;
    hedgeExchange: string;
    stopLossDistancePercent?: number; // Default: 20% away from liquidation
  }): {
    primaryStopLoss: number;
    primaryTakeProfit: number;
    hedgeStopLoss: number;
    hedgeTakeProfit: number;
    explanation: string;
  } {
    const stopLossPercent = params.stopLossDistancePercent || 0.2;

    // Calculate liquidation for primary
    const primaryLiq = this.calculateLiquidation(params.primaryExchange, {
      entryPrice: params.primaryEntryPrice,
      quantity: 1, // Not needed for price calculation
      leverage: params.primaryLeverage,
      side: params.primarySide,
    });

    // Calculate liquidation for hedge
    const hedgeLiq = this.calculateLiquidation(params.hedgeExchange, {
      entryPrice: params.hedgeEntryPrice,
      quantity: 1,
      leverage: params.hedgeLeverage,
      side: params.hedgeSide,
    });

    let primaryStopLoss: number;
    let primaryTakeProfit: number;
    let hedgeStopLoss: number;
    let hedgeTakeProfit: number;
    let explanation: string;

    // Typical arbitrage: Primary LONG, Hedge SHORT
    if (params.primarySide === 'long' && params.hedgeSide === 'short') {
      // If price drops:
      //   - Primary (long) loses → needs SL
      //   - Hedge (short) profits → should TP
      primaryStopLoss = primaryLiq.safeStopLoss;
      hedgeTakeProfit = primaryStopLoss; // Close hedge at same price

      // If price rises:
      //   - Primary (long) profits → should TP
      //   - Hedge (short) loses → needs SL
      hedgeStopLoss = hedgeLiq.safeStopLoss;
      primaryTakeProfit = hedgeStopLoss; // Close primary at same price

      explanation =
        `Primary LONG SL at ${primaryStopLoss.toFixed(6)} = Hedge SHORT TP\n` +
        `Hedge SHORT SL at ${hedgeStopLoss.toFixed(6)} = Primary LONG TP\n` +
        `Primary liquidation: ${primaryLiq.liquidationPrice.toFixed(6)}\n` +
        `Hedge liquidation: ${hedgeLiq.liquidationPrice.toFixed(6)}`;
    }
    // Reverse arbitrage: Primary SHORT, Hedge LONG
    else if (params.primarySide === 'short' && params.hedgeSide === 'long') {
      // If price rises:
      //   - Primary (short) loses → needs SL
      //   - Hedge (long) profits → should TP
      primaryStopLoss = primaryLiq.safeStopLoss;
      hedgeTakeProfit = primaryStopLoss;

      // If price drops:
      //   - Primary (short) profits → should TP
      //   - Hedge (long) loses → needs SL
      hedgeStopLoss = hedgeLiq.safeStopLoss;
      primaryTakeProfit = hedgeStopLoss;

      explanation =
        `Primary SHORT SL at ${primaryStopLoss.toFixed(6)} = Hedge LONG TP\n` +
        `Hedge LONG SL at ${hedgeStopLoss.toFixed(6)} = Primary SHORT TP\n` +
        `Primary liquidation: ${primaryLiq.liquidationPrice.toFixed(6)}\n` +
        `Hedge liquidation: ${hedgeLiq.liquidationPrice.toFixed(6)}`;
    } else {
      throw new Error(`Invalid arbitrage pair: primary ${params.primarySide}, hedge ${params.hedgeSide}`);
    }

    return {
      primaryStopLoss,
      primaryTakeProfit,
      hedgeStopLoss,
      hedgeTakeProfit,
      explanation,
    };
  }
}
