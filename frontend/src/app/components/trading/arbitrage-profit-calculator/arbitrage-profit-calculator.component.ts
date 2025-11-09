import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { calculateFundingSpread, SpreadStrategyType } from '@shared/lib';

interface ProfitBreakdown {
  entrySpread: number;
  fundingIncome: number;
  spreadClosingProfit: number;
  tradingFees: number;
  netProfit: number;
  roi: number;
  apy?: number;
}

@Component({
  selector: 'app-arbitrage-profit-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arbitrage-profit-calculator.component.html',
  styleUrls: ['./arbitrage-profit-calculator.component.scss']
})
export class ArbitrageProfitCalculatorComponent {
  constructor() {
    console.log('🎯 [Calculator] Component constructed!');
  }

  @Input({ required: true }) set strategy(value: string) {
    console.log('📝 [Input] strategy SET:', value);
    this._strategy.set(value);
  }

  @Input({ required: true }) set primaryExchange(value: string) {
    console.log('📝 [Input] primaryExchange SET:', value);
    this._primaryExchange.set(value);
  }

  @Input({ required: true }) set hedgeExchange(value: string) {
    console.log('📝 [Input] hedgeExchange SET:', value);
    this._hedgeExchange.set(value);
  }

  @Input({ required: true }) set primaryPrice(value: number) {
    console.log('📝 [Input] primaryPrice SET:', value);
    this._primaryPrice.set(value);
  }

  @Input({ required: true }) set hedgePrice(value: number) {
    console.log('📝 [Input] hedgePrice SET:', value);
    this._hedgePrice.set(value);
  }

  @Input({ required: true }) set primaryFundingRate(value: number) {
    console.log('⚡ [Input] primaryFundingRate SET:', value, typeof value);
    this._primaryFundingRate.set(value);
  }

  @Input({ required: true }) set hedgeFundingRate(value: number) {
    console.log('⚡ [Input] hedgeFundingRate SET:', value, typeof value);
    this._hedgeFundingRate.set(value);
  }

  @Input({ required: true }) set fundingInterval(value: number) {
    console.log('📝 [Input] fundingInterval SET:', value);
    this._fundingInterval.set(value);
  }

  @Input({ required: true }) set positionSize(value: number) {
    console.log('📝 [Input] positionSize SET:', value, '(will be set to:', value || 0, ')');
    this._positionSize.set(value || 0);
  }

  @Input() set leverage(value: number) {
    console.log('📝 [Input] leverage SET:', value, '(will be set to:', value || 1, ')');
    this._leverage.set(value || 1);
  }

  // Internal signals
  private _strategy = signal<string>('combined');
  private _primaryExchange = signal<string>('');
  private _hedgeExchange = signal<string>('');
  private _primaryPrice = signal<number>(0);
  private _hedgePrice = signal<number>(0);
  private _primaryFundingRate = signal<number>(0);
  private _hedgeFundingRate = signal<number>(0);
  private _fundingInterval = signal<number>(8);
  private _positionSize = signal<number>(0);
  private _leverage = signal<number>(1);

  // Exchange fee rates (Maker/Taker average in percentage)
  private readonly EXCHANGE_FEES: Record<string, number> = {
    'BYBIT': 0.055,   // 0.055% average
    'BINGX': 0.05,    // 0.05% average
    'MEXC': 0.03,     // 0.03% average
    'BINANCE': 0.04,  // 0.04% average
    'GATEIO': 0.05,   // 0.05% average
    'BITGET': 0.06,   // 0.06% average
    'OKX': 0.05,      // 0.05% average
  };

  /**
   * Public getter for strategy (needed in template)
   */
  get currentStrategy(): string {
    return this._strategy();
  }

  /**
   * Calculate profit breakdown based on strategy type
   */
  profitBreakdown = computed<ProfitBreakdown | null>(() => {
    const strategy = this._strategy();
    const positionSize = this._positionSize();
    const leverage = this._leverage();
    const primaryPrice = this._primaryPrice();
    const hedgePrice = this._hedgePrice();
    const primaryFundingRate = this._primaryFundingRate();
    const hedgeFundingRate = this._hedgeFundingRate();

    console.log('🔥 [computed] Inputs:', {
      strategy,
      positionSize,
      leverage,
      primaryPrice,
      hedgePrice,
      primaryFundingRate,
      hedgeFundingRate
    });

    // Return null if position size is invalid
    if (!positionSize || positionSize <= 0) {
      return null;
    }

    if (strategy === 'combined') {
      return this.calculateCombinedProfit();
    } else if (strategy === 'price_only') {
      return this.calculatePriceOnlyProfit();
    }

    return null;
  });

  /**
   * Calculate profit for Combined strategy (Funding + Price)
   *
   * Uses centralized funding spread calculator from @shared/lib
   *
   * Net Profit Formula (WITHOUT leverage - leverage only affects margin):
   * Net Profit = [Funding Spread × Quantity × Hours] + [(Spread) × Quantity] - Fees
   *
   * Funding Spread is calculated by centralized function:
   * - Automatically determines which exchange is primary (LONG) and which is hedge (SHORT)
   * - Primary = exchange with higher |funding rate|
   * - Formula: Math.abs(primary_rate_per_hour) + hedge_rate_per_hour
   */
  private calculateCombinedProfit(): ProfitBreakdown {
    const quantity = this._positionSize(); // Quantity (e.g. 0.5 BTC) - WITHOUT leverage
    const primaryPrice = this._primaryPrice(); // Price on primary exchange
    const hedgePrice = this._hedgePrice(); // Price on hedge exchange
    const primaryFundingRate = this._primaryFundingRate(); // in % (e.g. -0.8)
    const hedgeFundingRate = this._hedgeFundingRate(); // in % (e.g. -0.4)
    const fundingInterval = this._fundingInterval(); // 4 or 8 hours
    const primaryExchange = this._primaryExchange();
    const hedgeExchange = this._hedgeExchange();

    // Nominal position value in USD (for fee calculation)
    const primaryPositionValue = quantity * primaryPrice;
    const hedgePositionValue = quantity * hedgePrice;

    console.log('💰 [Calculator] Combined Profit Calculation (without leverage):', {
      quantity,
      primaryPrice,
      hedgePrice,
      primaryPositionValue: primaryPositionValue.toFixed(2),
      hedgePositionValue: hedgePositionValue.toFixed(2),
      primaryFundingRate,
      hedgeFundingRate,
      fundingInterval
    });

    // 1. Calculate Funding Spread using centralized function
    // ==================================================================
    // Function automatically determines which exchange is primary (LONG) and which is hedge (SHORT)
    const fundingSpread = calculateFundingSpread(
      {
        rate: primaryFundingRate / 100, // convert % to decimal (-0.8% → -0.008)
        intervalHours: fundingInterval,
        exchange: primaryExchange
      },
      {
        rate: hedgeFundingRate / 100, // convert % to decimal (-0.4% → -0.004)
        intervalHours: fundingInterval,
        exchange: hedgeExchange
      },
      SpreadStrategyType.COMBINED
    );

    console.log('📊 [Funding Spread from @shared/lib]:', {
      spreadPerHour: fundingSpread.spreadPerHour,
      spreadPercentFormatted: fundingSpread.spreadPercentFormatted,
      primaryExchange: fundingSpread.primaryExchange,
      hedgeExchange: fundingSpread.hedgeExchange,
      primaryRatePerHour: fundingSpread.primaryRatePerHour,
      hedgeRatePerHour: fundingSpread.hedgeRatePerHour
    });

    // Funding income for 24 hours (WITHOUT leverage)
    // ====================================
    // Account for funding payment interval (4h or 8h)
    // Formula (WITHOUT leverage):
    // 1. Position value = quantity × avgPrice
    // 2. Income per interval = spreadPerHour × fundingInterval × positionValue
    // 3. Number of payments per day = 24 / fundingInterval
    // 4. Daily income = (income per interval) × (number of payments)
    const avgPrice = (primaryPrice + hedgePrice) / 2;
    const positionValue = quantity * avgPrice;
    const fundingPeriodsPerDay = 24 / fundingInterval; // 3 for 8h, 6 for 4h
    const fundingIncomePerPeriod = fundingSpread.spreadPerHour * fundingInterval * positionValue;
    const dailyFundingIncome = fundingIncomePerPeriod * fundingPeriodsPerDay;

    console.log('📊 [Funding Income (without leverage)]:', {
      spreadPerHour: (fundingSpread.spreadPerHour * 100).toFixed(4) + '% per hour',
      fundingInterval: fundingInterval + 'h',
      fundingPeriodsPerDay: fundingPeriodsPerDay,
      quantity,
      avgPrice: avgPrice.toFixed(2),
      positionValue: positionValue.toFixed(2),
      fundingIncomePerPeriod: fundingIncomePerPeriod.toFixed(2),
      dailyFundingIncome: dailyFundingIncome.toFixed(2)
    });

    // 2. Entry Spread Profit (WITHOUT leverage)
    // =========================================
    // Profit from price difference at entry (same as in active-positions)
    // Entry profit = (hedge price - primary price) * quantity
    const priceSpread = hedgePrice - primaryPrice;
    const entrySpreadProfit = priceSpread * quantity;

    console.log('📈 [Entry Spread Profit (without leverage)]:', {
      primaryPrice,
      hedgePrice,
      priceSpread: priceSpread.toFixed(2),
      quantity,
      entrySpreadProfit: entrySpreadProfit.toFixed(2)
    });

    // 3. Trading Fees (4 trades: open+close on both exchanges, WITHOUT leverage)
    // =========================================================
    const primaryFee = this.EXCHANGE_FEES[fundingSpread.primaryExchange] || 0.055;
    const hedgeFee = this.EXCHANGE_FEES[fundingSpread.hedgeExchange] || 0.055;
    // Fees are calculated from position value (quantity * price)
    const totalFees = (primaryPositionValue * 2 * primaryFee / 100) + (hedgePositionValue * 2 * hedgeFee / 100);

    console.log('💸 [Fees (without leverage)]:', {
      primaryExchange: fundingSpread.primaryExchange,
      hedgeExchange: fundingSpread.hedgeExchange,
      primaryFee: primaryFee + '%',
      hedgeFee: hedgeFee + '%',
      primaryPositionValue: primaryPositionValue.toFixed(2),
      hedgePositionValue: hedgePositionValue.toFixed(2),
      totalFees: totalFees.toFixed(2)
    });

    // 4. Net Profit and ROI (WITHOUT leverage)
    // ==========================
    // Main formula: Funding Income + Entry Spread - Fees
    const grossProfit = dailyFundingIncome + entrySpreadProfit;
    const netProfit = grossProfit - totalFees;

    // ROI is calculated from position value (not margin)
    const roi = (netProfit / positionValue) * 100;
    const apy = roi * 365;

    console.log('✅ [Result (without leverage)]:', {
      grossProfit: grossProfit.toFixed(2),
      netProfit: netProfit.toFixed(2),
      positionValue: positionValue.toFixed(2),
      roi: roi.toFixed(2) + '%',
      apy: apy.toFixed(0) + '%'
    });

    return {
      entrySpread: entrySpreadProfit,
      fundingIncome: dailyFundingIncome,
      spreadClosingProfit: entrySpreadProfit,
      tradingFees: totalFees,
      netProfit: netProfit,
      roi: roi,
      apy: apy
    };
  }

  /**
   * Calculate profit for Price Only strategy (Instant Arbitrage)
   *
   * Formula (WITHOUT leverage - leverage only affects margin):
   * Net Profit = [(Spread) × Quantity] - Fees
   */
  private calculatePriceOnlyProfit(): ProfitBreakdown {
    const quantity = this._positionSize(); // Quantity (e.g. 0.5 BTC) - WITHOUT leverage
    const primaryPrice = this._primaryPrice(); // Price on exchange A
    const hedgePrice = this._hedgePrice(); // Price on exchange B
    const primaryExchange = this._primaryExchange();
    const hedgeExchange = this._hedgeExchange();

    // Nominal position value in USD (for fee calculation)
    const primaryPositionValue = quantity * primaryPrice;
    const hedgePositionValue = quantity * hedgePrice;
    const avgPrice = (primaryPrice + hedgePrice) / 2;
    const positionValue = quantity * avgPrice;

    console.log('💰 [Calculator] Price Only Profit Calculation (without leverage):', {
      quantity,
      primaryPrice,
      hedgePrice,
      primaryPositionValue: primaryPositionValue.toFixed(2),
      hedgePositionValue: hedgePositionValue.toFixed(2)
    });

    // 1. Spread Profit (WITHOUT leverage - same as in active-positions)
    const priceSpread = hedgePrice - primaryPrice; // P_B - P_A
    const spreadPercentage = (priceSpread / primaryPrice) * 100;
    const spreadProfit = priceSpread * quantity; // WITHOUT leverage

    console.log('📈 [Spread (without leverage)]:', {
      priceSpread: priceSpread.toFixed(2),
      spreadPercentage: spreadPercentage.toFixed(4) + '%',
      quantity,
      spreadProfit: spreadProfit.toFixed(2)
    });

    // 2. Trading Fees (4 trades, WITHOUT leverage)
    const primaryFee = this.EXCHANGE_FEES[primaryExchange] || 0.055;
    const hedgeFee = this.EXCHANGE_FEES[hedgeExchange] || 0.055;
    const totalFees = (primaryPositionValue * 2 * primaryFee / 100) + (hedgePositionValue * 2 * hedgeFee / 100);

    console.log('💸 [Fees (without leverage)]:', {
      primaryFee: primaryFee + '%',
      hedgeFee: hedgeFee + '%',
      primaryPositionValue: primaryPositionValue.toFixed(2),
      hedgePositionValue: hedgePositionValue.toFixed(2),
      totalFees: totalFees.toFixed(2)
    });

    // 3. Net Profit and ROI (WITHOUT leverage)
    const netProfit = spreadProfit - totalFees;
    const roi = (netProfit / positionValue) * 100;

    console.log('✅ [Result (without leverage)]:', {
      netProfit: netProfit.toFixed(2),
      positionValue: positionValue.toFixed(2),
      roi: roi.toFixed(2) + '%'
    });

    return {
      entrySpread: spreadProfit, // Entry spread profit (price difference at entry)
      fundingIncome: 0, // Not applicable for price only
      spreadClosingProfit: spreadProfit,
      tradingFees: totalFees,
      netProfit: netProfit,
      roi: roi,
      apy: undefined // Not applicable for instant profit
    };
  }

  /**
   * Check if profit is positive
   */
  isProfitable = computed(() => {
    const breakdown = this.profitBreakdown();
    return breakdown && breakdown.netProfit > 0;
  });

  /**
   * Check if calculator has valid data
   */
  hasValidData = computed(() => {
    return this._positionSize() > 0 &&
           this._primaryPrice() > 0 &&
           this._hedgePrice() > 0;
  });
}
