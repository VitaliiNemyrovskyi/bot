/**
 * Triangular Arbitrage Calculator
 *
 * Pure calculation logic for triangular arbitrage opportunities.
 * Follows functional programming principles - no side effects, fully testable.
 */

export interface TrianglePrices {
  symbol1: string; // e.g., "BTCUSDT"
  symbol2: string; // e.g., "ETHBTC"
  symbol3: string; // e.g., "ETHUSDT"
  price1: number; // Current price of symbol1 (last/mid)
  price2: number; // Current price of symbol2
  price3: number; // Current price of symbol3
  bid1?: number; // Bid price for symbol1 (for SELL orders)
  ask1?: number; // Ask price for symbol1 (for BUY orders)
  bid2?: number;
  ask2?: number;
  bid3?: number;
  ask3?: number;
}

export interface TriangleConfig {
  baseAsset: string; // e.g., "USDT"
  quoteAsset: string; // e.g., "BTC"
  bridgeAsset: string; // e.g., "ETH"
  makerFeeRate: number; // e.g., 0.0001 (0.01%)
  takerFeeRate: number; // e.g., 0.0006 (0.06%)
  exchange?: string; // e.g., "GATEIO" for exchange-specific handling
}

export interface TradeLeg {
  leg: 1 | 2 | 3;
  symbol: string;
  side: 'Buy' | 'Sell';
  inputAmount: number;
  outputAmount: number;
  fee: number;
}

export interface ArbitrageResult {
  direction: 'forward' | 'backward';
  profitPercent: number; // Theoretical profit (mid price, no slippage)
  profitAmount: number;
  finalAmount: number;
  legs: TradeLeg[];
  realisticProfitPercent?: number; // Realistic profit (bid/ask, slippage, cost buffer)
  realisticProfitAmount?: number;
  realisticFinalAmount?: number;
}

/**
 * Triangular Arbitrage Calculator
 *
 * Calculates profit for triangular arbitrage opportunities
 */
export class TriangularArbitrageCalculator {
  /**
   * Calculate profit for both forward and backward directions
   * Returns the more profitable direction
   */
  static calculateOptimalProfit(
    startAmount: number,
    prices: TrianglePrices,
    config: TriangleConfig
  ): ArbitrageResult | null {
    const forwardProfit = this.calculateForward(startAmount, prices, config);
    const backwardProfit = this.calculateBackward(startAmount, prices, config);

    // If both directions are invalid, return null
    if (!forwardProfit && !backwardProfit) {
      return null;
    }

    // If one direction is invalid, return the other (if profitable)
    if (!forwardProfit) {
      return backwardProfit && backwardProfit.profitPercent > 0 ? backwardProfit : null;
    }
    if (!backwardProfit) {
      return forwardProfit && forwardProfit.profitPercent > 0 ? forwardProfit : null;
    }

    // Both directions are valid - return the more profitable one
    if (forwardProfit.profitPercent > backwardProfit.profitPercent) {
      return forwardProfit.profitPercent > 0 ? forwardProfit : null;
    } else {
      return backwardProfit.profitPercent > 0 ? backwardProfit : null;
    }
  }

  /**
   * Determine which asset is the base and which is the quote in a symbol
   * Returns [baseAsset, quoteAsset]
   * Handles both formats: "BTCUSDT" and "BTC/USDT"
   */
  private static parseSymbol(symbol: string): [string, string] {
    // If symbol contains "/", it's already in CCXT format
    if (symbol.includes('/')) {
      const [base, quote] = symbol.split('/');
      return [base, quote];
    }

    // Otherwise, parse from concatenated format
    const quoteAssets = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BNB', 'DAI', 'USD'];

    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        return [base, quote];
      }
    }

    // Fallback
    const base = symbol.slice(0, -4);
    const quote = symbol.slice(-4);
    return [base, quote];
  }

  /**
   * Calculate forward triangle: A → B → C → A
   * Example: USDT → USDC → FLOKI → USDT
   *
   * For each leg, we need to determine if we BUY or SELL based on:
   * - What asset we currently have
   * - What asset we want to get
   * - How the symbol is structured (which asset is base/quote)
   *
   * IMPORTANT: We determine which symbol to use for each leg dynamically
   * based on which assets we're trading, not by fixed symbol order.
   */
  private static calculateForward(
    startAmount: number,
    prices: TrianglePrices,
    config: TriangleConfig
  ): ArbitrageResult | null {
    const legs: TradeLeg[] = [];
    let currentAmount = startAmount;
    let currentAsset = config.baseAsset;

    // Parse all symbols once
    const parsedSymbols = [
      { symbol: prices.symbol1, price: prices.price1, ...this.parseSymbol(prices.symbol1) },
      { symbol: prices.symbol2, price: prices.price2, ...this.parseSymbol(prices.symbol2) },
      { symbol: prices.symbol3, price: prices.price3, ...this.parseSymbol(prices.symbol3) },
    ];

    // Leg 1: base → quote (e.g., USDT → USDC)
    const leg1Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.quoteAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg1Result) return null;

    legs.push({ ...leg1Result, leg: 1 });
    currentAmount = leg1Result.outputAmount;
    currentAsset = config.quoteAsset;

    // Leg 2: quote → bridge (e.g., USDC → FLOKI)
    const leg2Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.bridgeAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg2Result) return null;

    legs.push({ ...leg2Result, leg: 2 });
    currentAmount = leg2Result.outputAmount;
    currentAsset = config.bridgeAsset;

    // Leg 3: bridge → base (e.g., FLOKI → USDT)
    const leg3Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.baseAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg3Result) return null;

    legs.push({ ...leg3Result, leg: 3 });

    const finalAmount = leg3Result.outputAmount;
    const profitAmount = finalAmount - startAmount;
    const profitPercent = (profitAmount / startAmount) * 100;

    return {
      direction: 'forward',
      profitPercent,
      profitAmount,
      finalAmount,
      legs,
    };
  }

  /**
   * Execute a single leg of the arbitrage triangle
   * Finds the correct symbol and calculates the trade
   */
  private static executeLeg(
    inputAmount: number,
    fromAsset: string,
    toAsset: string,
    parsedSymbols: Array<{ symbol: string; price: number; 0: string; 1: string }>,
    feeRate: number
  ): Omit<TradeLeg, 'leg'> | null {
    // Find the symbol that trades these two assets
    const matchingSymbol = parsedSymbols.find(
      (s) =>
        (s[0] === fromAsset && s[1] === toAsset) ||
        (s[0] === toAsset && s[1] === fromAsset)
    );

    if (!matchingSymbol) return null;

    const [base, quote] = [matchingSymbol[0], matchingSymbol[1]];
    let outputAmount: number;
    let side: 'Buy' | 'Sell';

    // Determine if we buy or sell
    if (fromAsset === quote && toAsset === base) {
      // We have quote, want base → BUY (price is base/quote, so divide)
      outputAmount = inputAmount / matchingSymbol.price;
      side = 'Buy';
    } else if (fromAsset === base && toAsset === quote) {
      // We have base, want quote → SELL (price is base/quote, so multiply)
      outputAmount = inputAmount * matchingSymbol.price;
      side = 'Sell';
    } else {
      return null;
    }

    const fee = outputAmount * feeRate;
    outputAmount = outputAmount - fee;

    return {
      symbol: matchingSymbol.symbol,
      side,
      inputAmount,
      outputAmount,
      fee,
    };
  }

  /**
   * Calculate backward triangle: A → C → B → A
   * Example: USDT → FLOKI → USDC → USDT
   */
  private static calculateBackward(
    startAmount: number,
    prices: TrianglePrices,
    config: TriangleConfig
  ): ArbitrageResult | null {
    const legs: TradeLeg[] = [];
    let currentAmount = startAmount;
    let currentAsset = config.baseAsset;

    // Parse all symbols once
    const parsedSymbols = [
      { symbol: prices.symbol1, price: prices.price1, ...this.parseSymbol(prices.symbol1) },
      { symbol: prices.symbol2, price: prices.price2, ...this.parseSymbol(prices.symbol2) },
      { symbol: prices.symbol3, price: prices.price3, ...this.parseSymbol(prices.symbol3) },
    ];

    // Leg 1: base → bridge (e.g., USDT → FLOKI)
    const leg1Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.bridgeAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg1Result) return null;

    legs.push({ ...leg1Result, leg: 1 });
    currentAmount = leg1Result.outputAmount;
    currentAsset = config.bridgeAsset;

    // Leg 2: bridge → quote (e.g., FLOKI → USDC)
    const leg2Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.quoteAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg2Result) return null;

    legs.push({ ...leg2Result, leg: 2 });
    currentAmount = leg2Result.outputAmount;
    currentAsset = config.quoteAsset;

    // Leg 3: quote → base (e.g., USDC → USDT)
    const leg3Result = this.executeLeg(
      currentAmount,
      currentAsset,
      config.baseAsset,
      parsedSymbols,
      config.takerFeeRate
    );

    if (!leg3Result) return null;

    legs.push({ ...leg3Result, leg: 3 });

    const finalAmount = leg3Result.outputAmount;
    const profitAmount = finalAmount - startAmount;
    const profitPercent = (profitAmount / startAmount) * 100;

    return {
      direction: 'backward',
      profitPercent,
      profitAmount,
      finalAmount,
      legs,
    };
  }

  /**
   * Adjust for slippage (reduce expected output by slippage %)
   */
  static adjustForSlippage(
    result: ArbitrageResult,
    slippagePercent: number
  ): ArbitrageResult {
    const slippageFactor = 1 - slippagePercent / 100;
    const startAmount = result.finalAmount - result.profitAmount;

    const adjustedFinalAmount = result.finalAmount * slippageFactor;
    const adjustedProfitAmount = adjustedFinalAmount - startAmount;
    const adjustedProfitPercent = (adjustedProfitAmount / startAmount) * 100;

    return {
      ...result,
      finalAmount: adjustedFinalAmount,
      profitAmount: adjustedProfitAmount,
      profitPercent: adjustedProfitPercent,
    };
  }

  /**
   * Check if opportunity meets minimum profit threshold
   */
  static isProfitable(
    result: ArbitrageResult,
    minProfitPercent: number
  ): boolean {
    return result.profitPercent >= minProfitPercent;
  }

  /**
   * Calculate effective profit after slippage
   */
  static calculateEffectiveProfit(
    result: ArbitrageResult,
    slippagePercent: number,
    minProfitPercent: number
  ): { isProfitable: boolean; effectiveProfit: ArbitrageResult } {
    const effectiveProfit = this.adjustForSlippage(result, slippagePercent);
    const isProfitable = this.isProfitable(effectiveProfit, minProfitPercent);

    return {
      isProfitable,
      effectiveProfit,
    };
  }

  /**
   * Calculate REALISTIC profit accounting for ALL real-world factors:
   * - Bid/ask spread (use ask for BUY, bid for SELL)
   * - Trading fees (taker fees)
   * - Gate.io cost buffer (5% for market BUY orders)
   * - Slippage (additional 0.5%)
   * - Precision rounding losses (0.1%)
   *
   * This gives a conservative estimate of actual profit after execution
   */
  static calculateRealisticProfit(
    startAmount: number,
    prices: TrianglePrices,
    config: TriangleConfig,
    direction: 'forward' | 'backward'
  ): number {
    const parsedSymbols = [
      {
        symbol: prices.symbol1,
        price: prices.price1,
        bid: prices.bid1 || prices.price1,
        ask: prices.ask1 || prices.price1,
        ...this.parseSymbol(prices.symbol1)
      },
      {
        symbol: prices.symbol2,
        price: prices.price2,
        bid: prices.bid2 || prices.price2,
        ask: prices.ask2 || prices.price2,
        ...this.parseSymbol(prices.symbol2)
      },
      {
        symbol: prices.symbol3,
        price: prices.price3,
        bid: prices.bid3 || prices.price3,
        ask: prices.ask3 || prices.price3,
        ...this.parseSymbol(prices.symbol3)
      },
    ];

    const isGateIO = config.exchange === 'GATEIO';
    const feeRate = config.takerFeeRate;

    // Additional factors (optimized based on real Gate.io orderbook data)
    const SLIPPAGE = 0.0002; // 0.02% slippage (measured from real USDT pairs)
    const PRECISION_LOSS = 0.001; // 0.1% for rounding
    const GATEIO_COST_BUFFER = 0.005; // 0.5% cost buffer for BUY orders (optimal value)

    let currentAmount = startAmount;
    let currentAsset = config.baseAsset;

    // Helper to execute realistic leg
    const executeRealisticLeg = (
      amount: number,
      fromAsset: string,
      toAsset: string
    ): number => {
      const matchingSymbol = parsedSymbols.find(
        (s) => (s[0] === fromAsset && s[1] === toAsset) || (s[0] === toAsset && s[1] === fromAsset)
      );

      if (!matchingSymbol) return 0;

      const [base, quote] = [matchingSymbol[0], matchingSymbol[1]];
      let outputAmount: number;
      let isBuyOrder: boolean;

      if (fromAsset === quote && toAsset === base) {
        // BUY order: use ASK price (higher price, less favorable)
        isBuyOrder = true;
        const effectivePrice = matchingSymbol.ask * (1 + SLIPPAGE);
        outputAmount = amount / effectivePrice;

        // Gate.io cost buffer reduction for BUY orders
        if (isGateIO) {
          outputAmount = outputAmount / (1 + GATEIO_COST_BUFFER);
        }
      } else if (fromAsset === base && toAsset === quote) {
        // SELL order: use BID price (lower price, less favorable)
        isBuyOrder = false;
        const effectivePrice = matchingSymbol.bid * (1 - SLIPPAGE);
        outputAmount = amount * effectivePrice;
      } else {
        return 0;
      }

      // Apply trading fees
      const fee = outputAmount * feeRate;
      outputAmount = outputAmount - fee;

      // Apply precision rounding loss
      outputAmount = outputAmount * (1 - PRECISION_LOSS);

      return outputAmount;
    };

    // Execute three legs based on direction
    if (direction === 'forward') {
      // Leg 1: base → quote
      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.quoteAsset);
      if (currentAmount === 0) return -100; // Failed
      currentAsset = config.quoteAsset;

      // Leg 2: quote → bridge
      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.bridgeAsset);
      if (currentAmount === 0) return -100;
      currentAsset = config.bridgeAsset;

      // Leg 3: bridge → base
      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.baseAsset);
      if (currentAmount === 0) return -100;
    } else {
      // Backward direction: base → bridge → quote → base
      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.bridgeAsset);
      if (currentAmount === 0) return -100;
      currentAsset = config.bridgeAsset;

      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.quoteAsset);
      if (currentAmount === 0) return -100;
      currentAsset = config.quoteAsset;

      currentAmount = executeRealisticLeg(currentAmount, currentAsset, config.baseAsset);
      if (currentAmount === 0) return -100;
    }

    const profitAmount = currentAmount - startAmount;
    const profitPercent = (profitAmount / startAmount) * 100;

    return profitPercent;
  }
}
