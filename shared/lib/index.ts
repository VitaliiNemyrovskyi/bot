/**
 * Shared Library Entry Point
 *
 * This module exports all shared utilities and types that are used
 * across both backend and frontend.
 *
 * Usage in backend:
 * ```typescript
 * import { calculateFundingSpread, FundingRateInput } from '@shared/lib';
 * ```
 *
 * Usage in frontend:
 * ```typescript
 * import { calculateFundingSpread, FundingRateInput } from '@shared/lib';
 * ```
 *
 * @module @shared/lib
 */

// ===== TYPE EXPORTS =====
export type {
  FundingRateInput,
  FundingSpreadResult,
  FundingRateColorClass,
} from './funding-spread-types';

export {
  SpreadStrategyType,
} from './funding-spread-types';

export type {
  PriceSpreadResult,
} from './price-spread-calculator';

// ===== CALCULATION FUNCTIONS =====
export {
  calculateFundingSpread,
  calculateCombinedFundingSpread,
  calculatePriceOnlyFundingSpread,
  calculateFundingSpreadWithCustomSides,
  normalizeFundingRateTo1h,
} from './funding-spread-calculator';

export {
  calculatePriceSpread,
  formatPriceSpreadPercent,
} from './price-spread-calculator';

// ===== FORMATTING FUNCTIONS =====
export {
  formatFundingRateDisplay,
  formatFundingRateNormalized,
  getFundingRateColorClass,
} from './funding-spread-calculator';
