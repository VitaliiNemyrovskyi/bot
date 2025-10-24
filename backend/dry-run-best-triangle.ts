/**
 * Dry-Run Analysis for Best Triangle
 *
 * Performs detailed step-by-step calculation with:
 * - Real Gate.io prices (bid/ask)
 * - Corrected 1.5% cost buffer for BUY orders
 * - All realistic factors (fees, slippage, precision loss)
 * - Comparison of theoretical vs realistic profit
 */

import ccxt from 'ccxt';
import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';

interface TriangleTest {
  name: string;
  symbols: [string, string, string];
  assets: {
    base: string;
    quote: string;
    bridge: string;
  };
}

// Test triangles (all start with USDT, using actual Gate.io pairs)
const TEST_TRIANGLES: TriangleTest[] = [
  {
    name: 'USDT → BTC → ETH → USDT',
    symbols: ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'],
    assets: { base: 'USDT', quote: 'BTC', bridge: 'ETH' }
  },
  {
    name: 'USDT → USDC → FLOKI → USDT',
    symbols: ['USDC/USDT', 'FLOKI/USDC', 'FLOKI/USDT'],
    assets: { base: 'USDT', quote: 'USDC', bridge: 'FLOKI' }
  },
  {
    name: 'USDT → ETH → MATIC → USDT',
    symbols: ['ETH/USDT', 'MATIC/ETH', 'MATIC/USDT'],
    assets: { base: 'USDT', quote: 'ETH', bridge: 'MATIC' }
  },
  {
    name: 'USDT → BTC → DOGE → USDT',
    symbols: ['BTC/USDT', 'DOGE/BTC', 'DOGE/USDT'],
    assets: { base: 'USDT', quote: 'BTC', bridge: 'DOGE' }
  },
  {
    name: 'USDT → ETH → LINK → USDT',
    symbols: ['ETH/USDT', 'LINK/ETH', 'LINK/USDT'],
    assets: { base: 'USDT', quote: 'ETH', bridge: 'LINK' }
  },
];

async function fetchRealPrices(exchange: ccxt.gateio, symbols: string[]) {
  console.log(`\n📊 Fetching real prices from Gate.io...`);

  const prices = [];

  for (const symbol of symbols) {
    try {
      const ticker = await exchange.fetchTicker(symbol);
      const orderbook = await exchange.fetchOrderBook(symbol, 5);

      prices.push({
        symbol,
        last: ticker.last || 0,
        bid: orderbook.bids[0]?.[0] || ticker.bid || ticker.last || 0,
        ask: orderbook.asks[0]?.[0] || ticker.ask || ticker.last || 0,
      });

      console.log(`  ${symbol}: last=${ticker.last}, bid=${prices[prices.length - 1].bid}, ask=${prices[prices.length - 1].ask}`);
    } catch (error: any) {
      console.error(`  ❌ Failed to fetch ${symbol}: ${error.message}`);
      throw error;
    }
  }

  return prices;
}

function performDetailedDryRun(
  triangle: TriangleTest,
  prices: Array<{ symbol: string; last: number; bid: number; ask: number }>,
  startAmount: number
) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 DRY-RUN ANALYSIS: ${triangle.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nStarting Position: ${startAmount} ${triangle.assets.base}`);
  console.log(`Triangle: ${triangle.assets.base} → ${triangle.assets.quote} → ${triangle.assets.bridge} → ${triangle.assets.base}`);
  console.log(`Symbols: ${triangle.symbols.join(' → ')}`);

  // Configuration
  const TAKER_FEE = 0.002; // 0.2%
  const SLIPPAGE = 0.005; // 0.5%
  const PRECISION_LOSS = 0.001; // 0.1%
  const GATEIO_COST_BUFFER = 0.015; // 1.5% (corrected from 5%)

  console.log(`\n📋 Configuration:`);
  console.log(`  Taker Fee: ${(TAKER_FEE * 100).toFixed(2)}%`);
  console.log(`  Slippage: ${(SLIPPAGE * 100).toFixed(2)}%`);
  console.log(`  Precision Loss: ${(PRECISION_LOSS * 100).toFixed(2)}%`);
  console.log(`  Gate.io Cost Buffer (BUY orders): ${(GATEIO_COST_BUFFER * 100).toFixed(2)}%`);

  // Calculate theoretical profit (using last/mid prices)
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📊 THEORETICAL PROFIT (using last prices, no spread)`);
  console.log(`${'─'.repeat(80)}`);

  const theoreticalResult = TriangularArbitrageCalculator.calculateOptimalProfit(
    startAmount,
    {
      symbol1: prices[0].symbol,
      symbol2: prices[1].symbol,
      symbol3: prices[2].symbol,
      price1: prices[0].last,
      price2: prices[1].last,
      price3: prices[2].last,
    },
    {
      baseAsset: triangle.assets.base,
      quoteAsset: triangle.assets.quote,
      bridgeAsset: triangle.assets.bridge,
      makerFeeRate: TAKER_FEE,
      takerFeeRate: TAKER_FEE,
    }
  );

  if (theoreticalResult) {
    console.log(`\nDirection: ${theoreticalResult.direction}`);
    theoreticalResult.legs.forEach((leg, i) => {
      console.log(`  Leg ${i + 1}: ${leg.side} ${leg.symbol}`);
      console.log(`    Input: ${leg.inputAmount.toFixed(8)}`);
      console.log(`    Output: ${leg.outputAmount.toFixed(8)}`);
      console.log(`    Fee: ${leg.fee.toFixed(8)} (${(TAKER_FEE * 100).toFixed(2)}%)`);
    });
    console.log(`\n✅ Final Amount: ${theoreticalResult.finalAmount.toFixed(8)} ${triangle.assets.base}`);
    console.log(`💰 Theoretical Profit: ${theoreticalResult.profitAmount.toFixed(8)} ${triangle.assets.base} (${theoreticalResult.profitPercent.toFixed(3)}%)`);
  } else {
    console.log(`❌ No profitable direction found`);
  }

  // Calculate realistic profit (using bid/ask, all factors)
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🎯 REALISTIC PROFIT (bid/ask spread + all execution factors)`);
  console.log(`${'─'.repeat(80)}`);

  const direction = theoreticalResult?.direction || 'forward';
  let currentAmount = startAmount;
  let currentAsset = triangle.assets.base;

  // Helper to execute realistic leg
  const executeRealisticLeg = (
    legNum: number,
    amount: number,
    fromAsset: string,
    toAsset: string
  ): number => {
    console.log(`\n🔹 LEG ${legNum}: Convert ${fromAsset} → ${toAsset}`);
    console.log(`  Input: ${amount.toFixed(8)} ${fromAsset}`);

    // Find the symbol for this leg
    const symbolIdx = triangle.symbols.findIndex(s => {
      const [base, quote] = s.split('/');
      return (base === fromAsset && quote === toAsset) || (base === toAsset && quote === fromAsset);
    });

    if (symbolIdx === -1) {
      console.log(`  ❌ No symbol found for ${fromAsset}/${toAsset}`);
      return 0;
    }

    const priceData = prices[symbolIdx];
    const [base, quote] = priceData.symbol.split('/');

    let outputAmount: number;
    let isBuyOrder: boolean;
    let effectivePrice: number;

    if (fromAsset === quote && toAsset === base) {
      // BUY order: use ASK price (higher, less favorable)
      isBuyOrder = true;
      effectivePrice = priceData.ask * (1 + SLIPPAGE);
      outputAmount = amount / effectivePrice;

      console.log(`  📈 BUY ${base} with ${quote}`);
      console.log(`  Ask price: ${priceData.ask.toFixed(8)}`);
      console.log(`  Effective price (with ${(SLIPPAGE * 100).toFixed(2)}% slippage): ${effectivePrice.toFixed(8)}`);
      console.log(`  Raw output: ${outputAmount.toFixed(8)} ${base}`);

      // Gate.io cost buffer reduction for BUY orders
      const beforeBuffer = outputAmount;
      outputAmount = outputAmount / (1 + GATEIO_COST_BUFFER);
      console.log(`  Gate.io cost buffer (-${(GATEIO_COST_BUFFER * 100).toFixed(2)}%): ${beforeBuffer.toFixed(8)} → ${outputAmount.toFixed(8)}`);

    } else if (fromAsset === base && toAsset === quote) {
      // SELL order: use BID price (lower, less favorable)
      isBuyOrder = false;
      effectivePrice = priceData.bid * (1 - SLIPPAGE);
      outputAmount = amount * effectivePrice;

      console.log(`  📉 SELL ${base} for ${quote}`);
      console.log(`  Bid price: ${priceData.bid.toFixed(8)}`);
      console.log(`  Effective price (with ${(SLIPPAGE * 100).toFixed(2)}% slippage): ${effectivePrice.toFixed(8)}`);
      console.log(`  Raw output: ${outputAmount.toFixed(8)} ${quote}`);
    } else {
      console.log(`  ❌ Invalid asset pair: ${fromAsset} → ${toAsset}`);
      return 0;
    }

    // Apply trading fees
    const fee = outputAmount * TAKER_FEE;
    outputAmount = outputAmount - fee;
    console.log(`  Trading fee (-${(TAKER_FEE * 100).toFixed(2)}%): ${fee.toFixed(8)} → ${outputAmount.toFixed(8)}`);

    // Apply precision rounding loss
    const beforePrecision = outputAmount;
    outputAmount = outputAmount * (1 - PRECISION_LOSS);
    console.log(`  Precision loss (-${(PRECISION_LOSS * 100).toFixed(2)}%): ${beforePrecision.toFixed(8)} → ${outputAmount.toFixed(8)}`);

    console.log(`  ✅ Final output: ${outputAmount.toFixed(8)} ${toAsset}`);

    return outputAmount;
  };

  // Execute three legs based on direction
  if (direction === 'forward') {
    // Leg 1: base → quote
    currentAmount = executeRealisticLeg(1, currentAmount, currentAsset, triangle.assets.quote);
    if (currentAmount === 0) {
      console.log(`\n❌ Leg 1 failed`);
      return;
    }
    currentAsset = triangle.assets.quote;

    // Leg 2: quote → bridge
    currentAmount = executeRealisticLeg(2, currentAmount, currentAsset, triangle.assets.bridge);
    if (currentAmount === 0) {
      console.log(`\n❌ Leg 2 failed`);
      return;
    }
    currentAsset = triangle.assets.bridge;

    // Leg 3: bridge → base
    currentAmount = executeRealisticLeg(3, currentAmount, currentAsset, triangle.assets.base);
    if (currentAmount === 0) {
      console.log(`\n❌ Leg 3 failed`);
      return;
    }
  } else {
    // Backward: base → bridge → quote → base
    currentAmount = executeRealisticLeg(1, currentAmount, currentAsset, triangle.assets.bridge);
    if (currentAmount === 0) return;
    currentAsset = triangle.assets.bridge;

    currentAmount = executeRealisticLeg(2, currentAmount, currentAsset, triangle.assets.quote);
    if (currentAmount === 0) return;
    currentAsset = triangle.assets.quote;

    currentAmount = executeRealisticLeg(3, currentAmount, currentAsset, triangle.assets.base);
    if (currentAmount === 0) return;
  }

  const realisticFinalAmount = currentAmount;
  const realisticProfitAmount = realisticFinalAmount - startAmount;
  const realisticProfitPercent = (realisticProfitAmount / startAmount) * 100;

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📊 FINAL RESULTS`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`\n💼 Starting Amount: ${startAmount.toFixed(8)} ${triangle.assets.base}`);
  console.log(`💰 Final Amount (Realistic): ${realisticFinalAmount.toFixed(8)} ${triangle.assets.base}`);
  console.log(`\n📈 Theoretical Profit: ${theoreticalResult?.profitAmount.toFixed(8)} ${triangle.assets.base} (${theoreticalResult?.profitPercent.toFixed(3)}%)`);
  console.log(`📉 Realistic Profit: ${realisticProfitAmount.toFixed(8)} ${triangle.assets.base} (${realisticProfitPercent.toFixed(3)}%)`);
  console.log(`\n⚠️  Execution Cost: ${((theoreticalResult?.profitPercent || 0) - realisticProfitPercent).toFixed(3)}% (difference between theoretical and realistic)`);

  if (realisticProfitPercent > 0) {
    console.log(`\n✅ PROFITABLE! Net gain: ${realisticProfitPercent.toFixed(3)}%`);
  } else {
    console.log(`\n❌ NOT PROFITABLE! Net loss: ${Math.abs(realisticProfitPercent).toFixed(3)}%`);
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

async function main() {
  console.log(`\n🚀 Starting Dry-Run Analysis with Corrected 1.5% Cost Buffer`);
  console.log(`${'='.repeat(80)}\n`);

  // Initialize Gate.io exchange
  const exchange = new ccxt.gateio({
    enableRateLimit: true,
    timeout: 30000,
    options: {
      defaultType: 'spot',
    },
  });

  await exchange.loadMarkets();
  console.log(`✅ Gate.io markets loaded`);

  const START_AMOUNT = 50; // USDT

  // Test each triangle and find the most profitable one
  const results = [];

  for (const triangle of TEST_TRIANGLES) {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`Testing: ${triangle.name}`);
    console.log(`${'═'.repeat(80)}`);

    try {
      const prices = await fetchRealPrices(exchange, triangle.symbols);

      // Calculate realistic profit using calculator
      const realisticProfitPercent = TriangularArbitrageCalculator.calculateRealisticProfit(
        START_AMOUNT,
        {
          symbol1: prices[0].symbol,
          symbol2: prices[1].symbol,
          symbol3: prices[2].symbol,
          price1: prices[0].last,
          price2: prices[1].last,
          price3: prices[2].last,
          bid1: prices[0].bid,
          ask1: prices[0].ask,
          bid2: prices[1].bid,
          ask2: prices[1].ask,
          bid3: prices[2].bid,
          ask3: prices[2].ask,
        },
        {
          baseAsset: triangle.assets.base,
          quoteAsset: triangle.assets.quote,
          bridgeAsset: triangle.assets.bridge,
          makerFeeRate: 0.002,
          takerFeeRate: 0.002,
          exchange: 'GATEIO',
        },
        'forward'
      );

      results.push({
        triangle,
        prices,
        realisticProfitPercent,
      });

      console.log(`\n📊 Quick Result: Realistic Profit = ${realisticProfitPercent.toFixed(3)}%`);

    } catch (error: any) {
      console.error(`❌ Failed to test ${triangle.name}: ${error.message}`);
    }
  }

  // Find the best triangle
  results.sort((a, b) => b.realisticProfitPercent - a.realisticProfitPercent);

  if (results.length === 0) {
    console.log(`\n❌ No triangles could be tested`);
    return;
  }

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🏆 BEST TRIANGLE FOUND`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`\n${results[0].triangle.name}: ${results[0].realisticProfitPercent.toFixed(3)}% realistic profit`);

  // Perform detailed dry-run on the best triangle
  performDetailedDryRun(results[0].triangle, results[0].prices, START_AMOUNT);

  // Show summary of all tested triangles
  console.log(`\n📊 Summary of All Tested Triangles:`);
  console.log(`${'─'.repeat(80)}`);
  results.forEach((r, i) => {
    const status = r.realisticProfitPercent > 0 ? '✅' : '❌';
    console.log(`${i + 1}. ${status} ${r.triangle.name}: ${r.realisticProfitPercent.toFixed(3)}%`);
  });
  console.log(`${'─'.repeat(80)}\n`);
}

main().catch(console.error);
