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

  /**
   * Calculate synchronized TP/SL for COMBINED STRATEGY (Price Spread + Funding Rates)
   *
   * This function accounts for BOTH:
   * 1. Immediate price spread profit/loss
   * 2. Accumulated funding rate profit over time
   *
   * Unlike calculateSynchronizedSLTP which only considers liquidation prices,
   * this function optimizes TP/SL for maximizing funding income.
   */
  static calculateCombinedStrategyTPSL(params: {
    primaryEntryPrice: number;
    primarySide: 'long' | 'short';
    primaryLeverage: number;
    primaryExchange: string;
    primaryFundingRate: number;       // Hourly rate in decimal (e.g., 0.0001 = 0.01%)
    hedgeEntryPrice: number;
    hedgeSide: 'long' | 'short';
    hedgeLeverage: number;
    hedgeExchange: string;
    hedgeFundingRate: number;         // Hourly rate in decimal
    targetHoldingPeriodHours?: number; // Default: 168 (7 days)
    minProfitPercent?: number;        // Default: 2%
  }): {
    primaryStopLoss: number;
    primaryTakeProfit: number;
    hedgeStopLoss: number;
    hedgeTakeProfit: number;
    explanation: string;
  } {
    // Defaults
    const targetPeriod = params.targetHoldingPeriodHours || 168; // 7 days
    const minProfit = params.minProfitPercent || 2; // 2%

    // 1. Calculate NET funding cash flow per hour
    // LONG with negative funding = receive (shorts pay longs)
    // SHORT with negative funding = pay (you pay longs)
    const primaryFundingCashFlow = params.primarySide === 'long'
      ? -params.primaryFundingRate  // LONG: receive if rate negative
      : params.primaryFundingRate;   // SHORT: pay if rate negative

    const hedgeFundingCashFlow = params.hedgeSide === 'long'
      ? -params.hedgeFundingRate
      : params.hedgeFundingRate;

    const netFundingPerHour = primaryFundingCashFlow + hedgeFundingCashFlow;
    const netFundingPercent = netFundingPerHour * 100; // Convert to percentage

    // 2. Calculate expected funding profit over target period
    const expectedFundingProfit = netFundingPercent * targetPeriod;

    // 3. Calculate entry price spread
    const entrySpreadPercent = ((params.hedgeEntryPrice - params.primaryEntryPrice) / params.primaryEntryPrice) * 100;

    // 4. Calculate liquidation prices for safety (fallback protection)
    const primaryLiq = this.calculateLiquidation(params.primaryExchange, {
      entryPrice: params.primaryEntryPrice,
      quantity: 1,
      leverage: params.primaryLeverage,
      side: params.primarySide,
    });

    const hedgeLiq = this.calculateLiquidation(params.hedgeExchange, {
      entryPrice: params.hedgeEntryPrice,
      quantity: 1,
      leverage: params.hedgeLeverage,
      side: params.hedgeSide,
    });

    // 5. Calculate TP/SL levels
    let primaryStopLoss: number;
    let primaryTakeProfit: number;
    let hedgeStopLoss: number;
    let hedgeTakeProfit: number;
    let explanation: string;

    // Calculate target profit percentage
    // Target = Entry spread + Expected funding + Min profit buffer
    const targetProfitPercent = Math.abs(entrySpreadPercent) + expectedFundingProfit + minProfit;

    // Calculate maximum acceptable loss
    // Conservative: Allow loss up to 50% of expected funding profit
    const maxAcceptableLossPercent = Math.max(expectedFundingProfit * 0.5, minProfit);

    if (params.primarySide === 'long' && params.hedgeSide === 'short') {
      // PRIMARY LONG, HEDGE SHORT
      // Price drops → Primary loses, Hedge profits
      // Price rises → Primary profits, Hedge loses

      // TP: Set at target profit above primary entry
      // When price rises to this level, close both for profit
      const tpPriceChange = (targetProfitPercent / 100) * params.primaryEntryPrice;
      primaryTakeProfit = params.primaryEntryPrice + tpPriceChange;
      hedgeTakeProfit = primaryTakeProfit; // Synchronized

      // SL: Set conservatively to protect against excessive loss
      // But allow some loss since funding compensates
      const slPriceChange = (maxAcceptableLossPercent / 100) * params.primaryEntryPrice;
      primaryStopLoss = Math.max(
        params.primaryEntryPrice - slPriceChange,  // Funding-aware SL
        primaryLiq.safeStopLoss                     // Never worse than liquidation protection
      );
      hedgeStopLoss = primaryStopLoss; // Synchronized

      explanation =
        `Combined Strategy TP/SL (PRIMARY LONG, HEDGE SHORT):\n` +
        `\n` +
        `Entry Spread: ${entrySpreadPercent.toFixed(4)}%\n` +
        `NET Funding: ${netFundingPercent.toFixed(4)}% per hour\n` +
        `Expected Funding (${targetPeriod}h): ${expectedFundingProfit.toFixed(2)}%\n` +
        `Target Profit: ${targetProfitPercent.toFixed(2)}%\n` +
        `\n` +
        `PRIMARY LONG:\n` +
        `  Entry: ${params.primaryEntryPrice.toFixed(6)}\n` +
        `  TP: ${primaryTakeProfit.toFixed(6)} (+${targetProfitPercent.toFixed(2)}%)\n` +
        `  SL: ${primaryStopLoss.toFixed(6)} (-${maxAcceptableLossPercent.toFixed(2)}%)\n` +
        `  Liquidation: ${primaryLiq.liquidationPrice.toFixed(6)}\n` +
        `\n` +
        `HEDGE SHORT:\n` +
        `  Entry: ${params.hedgeEntryPrice.toFixed(6)}\n` +
        `  TP: ${hedgeTakeProfit.toFixed(6)} (synchronized)\n` +
        `  SL: ${hedgeStopLoss.toFixed(6)} (synchronized)\n` +
        `  Liquidation: ${hedgeLiq.liquidationPrice.toFixed(6)}`;

    } else if (params.primarySide === 'short' && params.hedgeSide === 'long') {
      // PRIMARY SHORT, HEDGE LONG
      // Price rises → Primary loses, Hedge profits
      // Price drops → Primary profits, Hedge loses

      // TP: Set at target profit below primary entry
      const tpPriceChange = (targetProfitPercent / 100) * params.primaryEntryPrice;
      primaryTakeProfit = params.primaryEntryPrice - tpPriceChange;
      hedgeTakeProfit = primaryTakeProfit; // Synchronized

      // SL: Set conservatively above entry
      const slPriceChange = (maxAcceptableLossPercent / 100) * params.primaryEntryPrice;
      primaryStopLoss = Math.min(
        params.primaryEntryPrice + slPriceChange,  // Funding-aware SL
        primaryLiq.safeStopLoss                     // Never worse than liquidation protection
      );
      hedgeStopLoss = primaryStopLoss; // Synchronized

      explanation =
        `Combined Strategy TP/SL (PRIMARY SHORT, HEDGE LONG):\n` +
        `\n` +
        `Entry Spread: ${entrySpreadPercent.toFixed(4)}%\n` +
        `NET Funding: ${netFundingPercent.toFixed(4)}% per hour\n` +
        `Expected Funding (${targetPeriod}h): ${expectedFundingProfit.toFixed(2)}%\n` +
        `Target Profit: ${targetProfitPercent.toFixed(2)}%\n` +
        `\n` +
        `PRIMARY SHORT:\n` +
        `  Entry: ${params.primaryEntryPrice.toFixed(6)}\n` +
        `  TP: ${primaryTakeProfit.toFixed(6)} (+${targetProfitPercent.toFixed(2)}%)\n` +
        `  SL: ${primaryStopLoss.toFixed(6)} (-${maxAcceptableLossPercent.toFixed(2)}%)\n` +
        `  Liquidation: ${primaryLiq.liquidationPrice.toFixed(6)}\n` +
        `\n` +
        `HEDGE LONG:\n` +
        `  Entry: ${params.hedgeEntryPrice.toFixed(6)}\n` +
        `  TP: ${hedgeTakeProfit.toFixed(6)} (synchronized)\n` +
        `  SL: ${hedgeStopLoss.toFixed(6)} (synchronized)\n` +
        `  Liquidation: ${hedgeLiq.liquidationPrice.toFixed(6)}`;

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
