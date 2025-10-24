/**
 * Test Real Slippage and Cost Buffer
 *
 * Analyzes real Gate.io orderbook data to determine:
 * 1. Actual slippage for different order sizes
 * 2. Optimal cost buffer for market BUY orders
 * 3. Bid/ask spread statistics
 */

import ccxt from 'ccxt';

interface OrderbookAnalysis {
  symbol: string;
  bidAskSpread: number;
  bidAskSpreadPercent: number;
  slippageFor50USDT: number;
  slippageFor100USDT: number;
  slippageFor200USDT: number;
  optimalCostBuffer: number;
  liquidity: {
    totalBidVolume: number;
    totalAskVolume: number;
    top5BidVolume: number;
    top5AskVolume: number;
  };
}

async function analyzeOrderbook(
  exchange: ccxt.gateio,
  symbol: string,
  testAmount: number = 50
): Promise<OrderbookAnalysis | null> {
  try {
    // Fetch ticker and orderbook
    const [ticker, orderbook] = await Promise.all([
      exchange.fetchTicker(symbol),
      exchange.fetchOrderBook(symbol, 20), // Get top 20 levels
    ]);

    const midPrice = ticker.last || (ticker.bid + ticker.ask) / 2;
    const bidPrice = ticker.bid;
    const askPrice = ticker.ask;

    // Calculate bid/ask spread
    const bidAskSpread = askPrice - bidPrice;
    const bidAskSpreadPercent = (bidAskSpread / midPrice) * 100;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 Analyzing ${symbol}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Mid Price: ${midPrice.toFixed(8)}`);
    console.log(`Bid: ${bidPrice.toFixed(8)} | Ask: ${askPrice.toFixed(8)}`);
    console.log(`Spread: ${bidAskSpread.toFixed(8)} (${bidAskSpreadPercent.toFixed(3)}%)`);

    // Calculate slippage for different order sizes
    const calculateSlippage = (usdAmount: number, side: 'buy' | 'sell'): number => {
      const levels = side === 'buy' ? orderbook.asks : orderbook.bids;
      let remainingUSD = usdAmount;
      let totalTokens = 0;
      let totalCost = 0;

      for (const [price, volume] of levels) {
        const levelCostUSD = side === 'buy'
          ? volume * price  // For buying, cost = amount * price
          : volume * price; // For selling, same calculation

        if (remainingUSD <= levelCostUSD) {
          // This level can fill the remaining order
          const tokensFromLevel = side === 'buy'
            ? remainingUSD / price
            : remainingUSD / price;

          totalTokens += tokensFromLevel;
          totalCost += remainingUSD;
          remainingUSD = 0;
          break;
        } else {
          // Take the entire level
          totalTokens += volume;
          totalCost += levelCostUSD;
          remainingUSD -= levelCostUSD;
        }
      }

      if (remainingUSD > 0) {
        console.warn(`⚠️  Not enough liquidity for ${usdAmount} USD ${side} order`);
        return 999; // Not enough liquidity
      }

      // Calculate average execution price
      const avgPrice = totalCost / totalTokens;

      // Calculate slippage vs mid price
      const referencePrice = side === 'buy' ? askPrice : bidPrice;
      const slippage = Math.abs(avgPrice - referencePrice) / referencePrice * 100;

      return slippage;
    };

    const slippageFor50 = calculateSlippage(50, 'buy');
    const slippageFor100 = calculateSlippage(100, 'buy');
    const slippageFor200 = calculateSlippage(200, 'buy');

    console.log(`\n📈 Slippage Analysis (BUY orders):`);
    console.log(`  50 USD:  ${slippageFor50.toFixed(3)}%`);
    console.log(`  100 USD: ${slippageFor100.toFixed(3)}%`);
    console.log(`  200 USD: ${slippageFor200.toFixed(3)}%`);

    // Calculate optimal cost buffer
    // This is the percentage difference between ticker.last and first ask level
    const tickerLastVsAsk = ((askPrice - ticker.last!) / ticker.last!) * 100;

    // Add safety margin for price movement
    const priceMovementBuffer = 0.3; // 0.3% for typical price movement
    const optimalCostBuffer = Math.max(
      tickerLastVsAsk + priceMovementBuffer,
      0.5 // Minimum 0.5%
    );

    console.log(`\n💰 Cost Buffer Analysis:`);
    console.log(`  Ticker.last vs Ask: ${tickerLastVsAsk.toFixed(3)}%`);
    console.log(`  Price movement buffer: ${priceMovementBuffer.toFixed(3)}%`);
    console.log(`  Optimal cost buffer: ${optimalCostBuffer.toFixed(3)}%`);
    console.log(`  Current cost buffer: 1.500% (may be too high!)`);

    // Calculate liquidity metrics
    const top5BidVolume = orderbook.bids.slice(0, 5).reduce((sum, [_, vol]) => sum + vol, 0);
    const top5AskVolume = orderbook.asks.slice(0, 5).reduce((sum, [_, vol]) => sum + vol, 0);
    const totalBidVolume = orderbook.bids.reduce((sum, [_, vol]) => sum + vol, 0);
    const totalAskVolume = orderbook.asks.reduce((sum, [_, vol]) => sum + vol, 0);

    const top5BidVolumeUSD = top5BidVolume * midPrice;
    const top5AskVolumeUSD = top5AskVolume * midPrice;

    console.log(`\n💧 Liquidity (top 5 levels):`);
    console.log(`  Bid volume: ${top5BidVolume.toFixed(4)} tokens ($${top5BidVolumeUSD.toFixed(2)} USD)`);
    console.log(`  Ask volume: ${top5AskVolume.toFixed(4)} tokens ($${top5AskVolumeUSD.toFixed(2)} USD)`);
    console.log(`  Total bid volume: ${totalBidVolume.toFixed(4)} tokens`);
    console.log(`  Total ask volume: ${totalAskVolume.toFixed(4)} tokens`);

    return {
      symbol,
      bidAskSpread,
      bidAskSpreadPercent,
      slippageFor50USDT: slippageFor50,
      slippageFor100USDT: slippageFor100,
      slippageFor200USDT: slippageFor200,
      optimalCostBuffer,
      liquidity: {
        totalBidVolume,
        totalAskVolume,
        top5BidVolume,
        top5AskVolume,
      },
    };
  } catch (error: any) {
    console.error(`❌ Error analyzing ${symbol}:`, error.message);
    return null;
  }
}

async function main() {
  console.log(`\n🚀 Testing Real Slippage and Cost Buffer on Gate.io`);
  console.log(`${'='.repeat(80)}\n`);

  // Initialize Gate.io
  const exchange = new ccxt.gateio({
    enableRateLimit: true,
    timeout: 30000,
    options: {
      defaultType: 'spot',
    },
  });

  await exchange.loadMarkets();
  console.log(`✅ Markets loaded\n`);

  // Test symbols commonly used in triangular arbitrage
  const testSymbols = [
    'BTC/USDT',
    'ETH/USDT',
    'ETH/BTC',
    'BNB/USDT',
    'SOL/USDT',
    'DOGE/USDT',
    'DOGE/BTC',
    'MATIC/USDT',
    'MATIC/ETH',
    'LINK/USDT',
    'LINK/ETH',
  ];

  const results: OrderbookAnalysis[] = [];

  for (const symbol of testSymbols) {
    const result = await analyzeOrderbook(exchange, symbol, 50);
    if (result) {
      results.push(result);
    }
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary statistics
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 SUMMARY STATISTICS`);
  console.log(`${'='.repeat(80)}\n`);

  const avgBidAskSpread = results.reduce((sum, r) => sum + r.bidAskSpreadPercent, 0) / results.length;
  const avgSlippage50 = results.reduce((sum, r) => sum + r.slippageFor50USDT, 0) / results.length;
  const avgSlippage100 = results.reduce((sum, r) => sum + r.slippageFor100USDT, 0) / results.length;
  const avgSlippage200 = results.reduce((sum, r) => sum + r.slippageFor200USDT, 0) / results.length;
  const avgOptimalBuffer = results.reduce((sum, r) => sum + r.optimalCostBuffer, 0) / results.length;

  console.log(`Average Bid/Ask Spread: ${avgBidAskSpread.toFixed(3)}%`);
  console.log(`\nAverage Slippage (BUY orders):`);
  console.log(`  50 USD:  ${avgSlippage50.toFixed(3)}%`);
  console.log(`  100 USD: ${avgSlippage100.toFixed(3)}%`);
  console.log(`  200 USD: ${avgSlippage200.toFixed(3)}%`);
  console.log(`\nAverage Optimal Cost Buffer: ${avgOptimalBuffer.toFixed(3)}%`);

  // Recommendations
  console.log(`\n${'='.repeat(80)}`);
  console.log(`💡 RECOMMENDATIONS`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Current settings:`);
  console.log(`  SLIPPAGE = 0.500% per leg`);
  console.log(`  COST_BUFFER = 1.500% per BUY leg\n`);

  console.log(`Recommended settings based on real data:`);
  console.log(`  SLIPPAGE = ${avgSlippage50.toFixed(3)}% per leg (for 50 USD orders)`);
  console.log(`  COST_BUFFER = ${avgOptimalBuffer.toFixed(3)}% per BUY leg\n`);

  const slippageSavings = (0.500 - avgSlippage50) * 3; // 3 legs
  const bufferSavings = (1.500 - avgOptimalBuffer) * 2; // 2 BUY legs
  const totalSavings = slippageSavings + bufferSavings;

  console.log(`Potential savings:`);
  console.log(`  Slippage reduction: ${slippageSavings.toFixed(3)}%`);
  console.log(`  Cost buffer reduction: ${bufferSavings.toFixed(3)}%`);
  console.log(`  TOTAL SAVINGS: ${totalSavings.toFixed(3)}%\n`);

  if (totalSavings > 0) {
    console.log(`✅ This could improve profitability by ${totalSavings.toFixed(3)}%!`);
    console.log(`   Example: -5.31% → ${(-5.31 + totalSavings).toFixed(2)}%`);
  } else {
    console.log(`⚠️  Current settings are already conservative.`);
  }

  // Export results to JSON
  const fs = require('fs');
  fs.writeFileSync(
    'slippage-buffer-analysis.json',
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        summary: {
          avgBidAskSpread,
          avgSlippage50,
          avgSlippage100,
          avgSlippage200,
          avgOptimalBuffer,
          potentialSavings: totalSavings,
        },
      },
      null,
      2
    )
  );

  console.log(`\n✅ Results saved to slippage-buffer-analysis.json`);
}

main().catch(console.error);
