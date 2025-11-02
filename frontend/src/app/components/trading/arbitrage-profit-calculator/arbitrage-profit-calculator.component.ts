import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProfitBreakdown {
  fundingIncome: number;
  entrySpread: number;
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

  // Exchange fee rates (percentage)
  private readonly EXCHANGE_FEES: Record<string, number> = {
    'BYBIT': 0.055,
    'BINGX': 0.05,
    'MEXC': 0.03,
    'BINANCE': 0.04,
    'GATEIO': 0.05,
    'BITGET': 0.06,
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
   */
  private calculateCombinedProfit(): ProfitBreakdown {
    const collateral = this._positionSize(); // User input = collateral (margin)
    const leverage = this._leverage();
    const positionSize = collateral * leverage; // Real position size with leverage
    const primaryPrice = this._primaryPrice();
    const hedgePrice = this._hedgePrice();
    const primaryFundingRate = this._primaryFundingRate();
    const hedgeFundingRate = this._hedgeFundingRate();
    const fundingInterval = this._fundingInterval();
    const primaryExchange = this._primaryExchange();
    const hedgeExchange = this._hedgeExchange();

    // DEBUG: Log funding rates
    console.log('💰 [Calculator] Funding rates:', {
      primaryFundingRate,
      hedgeFundingRate,
      fundingInterval,
      positionSize,
      collateral,
      leverage
    });

    // 1. Calculate funding income for 24 hours
    const fundingsPerDay = 24 / fundingInterval; // 3 payments (8h) or 6 payments (4h)

    // Calculate position size in coins
    const avgPrice = (primaryPrice + hedgePrice) / 2;
    const positionSizeInCoins = positionSize / avgPrice;

    // Funding per payment (assuming we're long on one and short on other)
    // Long position pays negative funding (receives if rate is positive)
    // Short position receives negative funding (pays if rate is positive)
    const primaryFundingPerPayment = positionSize * (primaryFundingRate / 100);
    const hedgeFundingPerPayment = positionSize * (hedgeFundingRate / 100);

    // Total daily funding (we capture the spread between the two rates)
    const dailyFundingIncome = Math.abs(primaryFundingPerPayment - hedgeFundingPerPayment) * fundingsPerDay;

    // 2. Calculate entry spread P&L
    const priceSpread = Math.abs(primaryPrice - hedgePrice);
    const entrySpreadProfit = priceSpread * positionSizeInCoins;

    // 3. Calculate trading fees (4 transactions: open long, open short, close long, close short)
    const primaryFee = this.EXCHANGE_FEES[primaryExchange] || 0.055;
    const hedgeFee = this.EXCHANGE_FEES[hedgeExchange] || 0.055;
    const totalFees = positionSize * (primaryFee + hedgeFee) * 2 / 100;

    // 4. Calculate net profit and ROI
    const netProfit = dailyFundingIncome + entrySpreadProfit - totalFees;

    // Calculate collateral (margin) for 2 positions (long + short)
    const totalCollateral = collateral * 2;

    // ROI is profit relative to collateral
    const roi = (netProfit / totalCollateral) * 100;
    const apy = roi * 365;

    return {
      fundingIncome: dailyFundingIncome,
      entrySpread: entrySpreadProfit,
      tradingFees: totalFees,
      netProfit: netProfit,
      roi: roi,
      apy: apy
    };
  }

  /**
   * Calculate profit for Price Only strategy
   */
  private calculatePriceOnlyProfit(): ProfitBreakdown {
    const collateral = this._positionSize(); // User input = collateral (margin)
    const leverage = this._leverage();
    const positionSize = collateral * leverage; // Real position size with leverage
    const primaryPrice = this._primaryPrice();
    const hedgePrice = this._hedgePrice();
    const primaryExchange = this._primaryExchange();
    const hedgeExchange = this._hedgeExchange();

    // 1. Calculate price spread profit
    const avgPrice = (primaryPrice + hedgePrice) / 2;
    const positionSizeInCoins = positionSize / avgPrice;
    const priceSpread = Math.abs(primaryPrice - hedgePrice);
    const spreadProfit = priceSpread * positionSizeInCoins;

    // 2. Calculate trading fees (4 transactions)
    const primaryFee = this.EXCHANGE_FEES[primaryExchange] || 0.055;
    const hedgeFee = this.EXCHANGE_FEES[hedgeExchange] || 0.055;
    const totalFees = positionSize * (primaryFee + hedgeFee) * 2 / 100;

    // 3. Calculate net profit and ROI
    const netProfit = spreadProfit - totalFees;

    // Calculate collateral (margin) for 2 positions (long + short)
    const totalCollateral = collateral * 2;

    // ROI is profit relative to collateral
    const roi = (netProfit / totalCollateral) * 100;

    return {
      fundingIncome: 0, // Not applicable for price only
      entrySpread: spreadProfit,
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