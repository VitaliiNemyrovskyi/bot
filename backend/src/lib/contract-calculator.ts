/**
 * Contract Calculator Utility
 *
 * Unified system for calculating effective quantities across different exchanges
 * that have different contract specifications and rounding rules.
 */

export interface ContractSpecification {
  exchange: string;
  symbol: string;
  /** Multiplier for converting base currency to contracts (e.g., Gate.io quantoMultiplier, MEXC contractSize) */
  multiplier: number;
  /** Minimum order size in contracts */
  minOrderSize: number;
  /** Maximum order size in contracts */
  maxOrderSize: number;
}

export interface QuantityCalculation {
  /** Requested quantity in base currency */
  requestedQuantity: number;
  /** Number of contracts after conversion and rounding */
  contracts: number;
  /** Effective quantity in base currency after rounding (contracts * multiplier) */
  effectiveQuantity: number;
  /** The multiplier used */
  multiplier: number;
  /** Whether the quantity was adjusted due to min/max limits */
  wasAdjusted: boolean;
  /** Reason for adjustment if any */
  adjustmentReason?: string;
}

export class ContractCalculator {
  /**
   * Calculate the effective quantity that will actually be opened on an exchange
   * after applying contract conversion and rounding rules.
   */
  static calculateEffectiveQuantity(
    requestedQuantity: number,
    spec: ContractSpecification
  ): QuantityCalculation {
    const { multiplier, minOrderSize, maxOrderSize, exchange, symbol } = spec;

    // If multiplier is 1, exchange works in base currency (like Bybit for most pairs)
    if (multiplier === 1) {
      return {
        requestedQuantity,
        contracts: requestedQuantity,
        effectiveQuantity: requestedQuantity,
        multiplier: 1,
        wasAdjusted: false,
      };
    }

    // Convert from base currency to contracts
    let contracts = requestedQuantity / multiplier;

    // Round to integer number of contracts
    contracts = Math.round(contracts);

    let wasAdjusted = false;
    let adjustmentReason: string | undefined;

    // Check minimum
    if (contracts < minOrderSize) {
      contracts = minOrderSize;
      wasAdjusted = true;
      adjustmentReason = `Adjusted to minimum ${minOrderSize} contracts`;
    }

    // Check maximum
    if (contracts > maxOrderSize) {
      contracts = maxOrderSize;
      wasAdjusted = true;
      adjustmentReason = `Adjusted to maximum ${maxOrderSize} contracts`;
    }

    // Calculate effective quantity in base currency
    const effectiveQuantity = contracts * multiplier;

    return {
      requestedQuantity,
      contracts,
      effectiveQuantity,
      multiplier,
      wasAdjusted,
      adjustmentReason,
    };
  }

  /**
   * Calculate balanced quantities for two exchanges to ensure they open the same position size.
   * Returns the quantity that both exchanges should use to end up with the same effective amount.
   */
  static calculateBalancedQuantities(
    desiredQuantity: number,
    primarySpec: ContractSpecification,
    hedgeSpec: ContractSpecification
  ): {
    primaryQuantity: number;
    hedgeQuantity: number;
    effectiveQuantity: number;
    primaryCalculation: QuantityCalculation;
    hedgeCalculation: QuantityCalculation;
  } {
    // If both have multiplier 1, just use the desired quantity
    if (primarySpec.multiplier === 1 && hedgeSpec.multiplier === 1) {
      const primaryCalc = this.calculateEffectiveQuantity(desiredQuantity, primarySpec);
      const hedgeCalc = this.calculateEffectiveQuantity(desiredQuantity, hedgeSpec);

      return {
        primaryQuantity: desiredQuantity,
        hedgeQuantity: desiredQuantity,
        effectiveQuantity: desiredQuantity,
        primaryCalculation: primaryCalc,
        hedgeCalculation: hedgeCalc,
      };
    }

    // Find the exchange with the larger multiplier (more restrictive rounding)
    const maxMultiplier = Math.max(primarySpec.multiplier, hedgeSpec.multiplier);

    // Round the desired quantity to be a multiple of the largest multiplier
    // This ensures both exchanges can represent it exactly
    const contracts = Math.round(desiredQuantity / maxMultiplier);
    const balancedQuantity = contracts * maxMultiplier;

    // Calculate for both exchanges using this balanced quantity
    const primaryCalc = this.calculateEffectiveQuantity(balancedQuantity, primarySpec);
    const hedgeCalc = this.calculateEffectiveQuantity(balancedQuantity, hedgeSpec);

    // Use the minimum effective quantity to ensure we don't exceed desired amount
    const effectiveQuantity = Math.min(primaryCalc.effectiveQuantity, hedgeCalc.effectiveQuantity);

    // console.log('[ContractCalculator] Balanced quantity calculation:', {
    //   desiredQuantity,
    //   maxMultiplier,
    //   balancedQuantity,
    //   primaryEffective: primaryCalc.effectiveQuantity,
    //   hedgeEffective: hedgeCalc.effectiveQuantity,
    //   finalEffective: effectiveQuantity,
    // });

    return {
      primaryQuantity: balancedQuantity,
      hedgeQuantity: balancedQuantity,
      effectiveQuantity,
      primaryCalculation: primaryCalc,
      hedgeCalculation: hedgeCalc,
    };
  }

  /**
   * Calculate quantities for graduated entry that will be balanced across all parts.
   * Ensures each part opens the same effective amount on both exchanges.
   */
  static calculateGraduatedQuantities(
    totalQuantity: number,
    parts: number,
    primarySpec: ContractSpecification,
    hedgeSpec: ContractSpecification
  ): {
    quantityPerPart: number;
    effectiveQuantityPerPart: number;
    totalEffectiveQuantity: number;
    adjustedTotal: number;
  } {
    // Find the maximum multiplier
    const maxMultiplier = Math.max(primarySpec.multiplier, hedgeSpec.multiplier);

    // Calculate base quantity per part
    const baseQuantityPerPart = totalQuantity / parts;

    // Round to the nearest multiple of maxMultiplier
    const contracts = Math.round(baseQuantityPerPart / maxMultiplier);
    const quantityPerPart = contracts * maxMultiplier;

    // Calculate what will actually be opened per part
    const primaryCalc = this.calculateEffectiveQuantity(quantityPerPart, primarySpec);
    const hedgeCalc = this.calculateEffectiveQuantity(quantityPerPart, hedgeSpec);

    // Use the minimum to ensure balance
    const effectiveQuantityPerPart = Math.min(
      primaryCalc.effectiveQuantity,
      hedgeCalc.effectiveQuantity
    );

    const totalEffectiveQuantity = effectiveQuantityPerPart * parts;
    const adjustedTotal = quantityPerPart * parts;

    // console.log('[ContractCalculator] Graduated entry calculation:', {
    //   requestedTotal: totalQuantity,
    //   parts,
    //   baseQuantityPerPart,
    //   adjustedQuantityPerPart: quantityPerPart,
    //   effectiveQuantityPerPart,
    //   totalEffectiveQuantity,
    //   adjustedTotal,
    //   difference: totalQuantity - totalEffectiveQuantity,
    // });

    return {
      quantityPerPart,
      effectiveQuantityPerPart,
      totalEffectiveQuantity,
      adjustedTotal,
    };
  }
}
