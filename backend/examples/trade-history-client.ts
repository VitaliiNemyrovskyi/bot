/**
 * Trade History API Client Example
 *
 * This example demonstrates how to interact with the trade history API endpoint.
 */

import {
  TradeHistoryDTO,
  TradeHistoryResponse,
  TradeHistoryErrorResponse,
  TradeHistoryQueryParams,
  calculateTradeStatistics,
  filterTrades,
} from '../src/types/trade-history';

/**
 * Trade History API Client
 */
export class TradeHistoryClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Fetch trade history from the API
   */
  async getTradeHistory(
    params: TradeHistoryQueryParams
  ): Promise<TradeHistoryResponse> {
    const url = new URL('/api/arbitrage/trade-history', this.baseUrl);
    url.searchParams.set('symbol', params.symbol);
    url.searchParams.set('exchange', params.exchange);
    if (params.limit) {
      url.searchParams.set('limit', params.limit.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: TradeHistoryErrorResponse = await response.json();
      throw new Error(`${error.error}: ${error.message} (${error.code})`);
    }

    return await response.json();
  }

  /**
   * Fetch all trade history with pagination (fetches in batches)
   */
  async getAllTradeHistory(
    symbol: string,
    exchange: string,
    batchSize: number = 200
  ): Promise<TradeHistoryDTO[]> {
    const allTrades: TradeHistoryDTO[] = [];
    let hasMore = true;
    let currentBatch = 0;

    while (hasMore) {
      const response = await this.getTradeHistory({
        symbol,
        exchange,
        limit: batchSize,
      });

      allTrades.push(...response.data);

      // If we received fewer records than the limit, we've reached the end
      hasMore = response.data.length === batchSize;
      currentBatch++;

      // Safety limit to prevent infinite loops
      if (currentBatch > 100) {
        console.warn('Reached maximum batch limit (100 batches)');
        break;
      }
    }

    return allTrades;
  }
}

/**
 * Example Usage
 */
async function example() {
  // Initialize client
  const client = new TradeHistoryClient(
    'http://localhost:3000',
    'your_jwt_token_here'
  );

  try {
    // Example 1: Fetch recent trade history
    console.log('=== Example 1: Fetch Recent Trade History ===');
    const history = await client.getTradeHistory({
      symbol: 'BTCUSDT',
      exchange: 'BYBIT',
      limit: 50,
    });

    console.log(`Found ${history.count} trades`);
    console.log('Recent trades:');
    history.data.slice(0, 5).forEach((trade) => {
      console.log(`  - ${trade.symbol}: ${trade.netPnl?.toFixed(2)} USDT`);
    });

    // Example 2: Calculate statistics
    console.log('\n=== Example 2: Calculate Trade Statistics ===');
    const stats = calculateTradeStatistics(history.data);
    console.log('Statistics:');
    console.log(`  Total trades: ${stats.totalTrades}`);
    console.log(`  Win rate: ${stats.winRate.toFixed(2)}%`);
    console.log(`  Total net P&L: ${stats.totalNetPnl.toFixed(2)} USDT`);
    console.log(`  Average P&L: ${stats.averageNetPnl.toFixed(2)} USDT`);
    console.log(`  Total fees: ${stats.totalFees.toFixed(2)} USDT`);
    console.log(`  Largest win: ${stats.largestWin.toFixed(2)} USDT`);
    console.log(`  Largest loss: ${stats.largestLoss.toFixed(2)} USDT`);

    // Example 3: Filter trades
    console.log('\n=== Example 3: Filter Profitable Trades ===');
    const profitableTrades = filterTrades(history.data, {
      minNetPnl: 0.01, // Only profitable trades
    });
    console.log(`Found ${profitableTrades.length} profitable trades`);

    // Example 4: Filter by mode
    console.log('\n=== Example 4: Filter by Arbitrage Mode ===');
    const hedgedTrades = filterTrades(history.data, {
      mode: ['HEDGED'],
    });
    console.log(`Found ${hedgedTrades.length} hedged trades`);

    // Example 5: Analyze fees
    console.log('\n=== Example 5: Fee Analysis ===');
    const totalPrimaryFees = history.data.reduce(
      (sum, trade) => sum + (trade.primaryTradingFees || 0),
      0
    );
    const totalHedgeFees = history.data.reduce(
      (sum, trade) => sum + (trade.hedgeTradingFees || 0),
      0
    );
    console.log(`Total primary fees: ${totalPrimaryFees.toFixed(2)} USDT`);
    console.log(`Total hedge fees: ${totalHedgeFees.toFixed(2)} USDT`);
    console.log(
      `Fee percentage: ${((stats.totalFees / stats.totalRealizedPnl) * 100).toFixed(2)}%`
    );

    // Example 6: Analyze by position type
    console.log('\n=== Example 6: Analyze by Position Type ===');
    const longTrades = filterTrades(history.data, {
      positionType: ['long'],
    });
    const shortTrades = filterTrades(history.data, {
      positionType: ['short'],
    });
    const longStats = calculateTradeStatistics(longTrades);
    const shortStats = calculateTradeStatistics(shortTrades);

    console.log(`Long positions: ${longTrades.length} trades`);
    console.log(`  Win rate: ${longStats.winRate.toFixed(2)}%`);
    console.log(`  Avg P&L: ${longStats.averageNetPnl.toFixed(2)} USDT`);

    console.log(`Short positions: ${shortTrades.length} trades`);
    console.log(`  Win rate: ${shortStats.winRate.toFixed(2)}%`);
    console.log(`  Avg P&L: ${shortStats.averageNetPnl.toFixed(2)} USDT`);

    // Example 7: Time analysis
    console.log('\n=== Example 7: Time Analysis ===');
    const tradesWithDuration = history.data.filter(
      (trade) => trade.executedAt && trade.closedAt
    );
    const avgDuration =
      tradesWithDuration.reduce((sum, trade) => {
        const duration =
          new Date(trade.closedAt!).getTime() -
          new Date(trade.executedAt!).getTime();
        return sum + duration;
      }, 0) /
      tradesWithDuration.length /
      1000; // Convert to seconds

    console.log(
      `Average trade duration: ${(avgDuration / 60).toFixed(2)} minutes`
    );

    // Example 8: Funding rate analysis
    console.log('\n=== Example 8: Funding Rate Analysis ===');
    const avgFundingRate =
      history.data.reduce((sum, trade) => sum + trade.fundingRate, 0) /
      history.data.length;
    const highFundingTrades = history.data.filter(
      (trade) => Math.abs(trade.fundingRate) > 0.001
    );

    console.log(
      `Average funding rate: ${(avgFundingRate * 100).toFixed(4)}%`
    );
    console.log(
      `High funding rate trades (>0.1%): ${highFundingTrades.length}`
    );
    console.log(
      `Total funding earned: ${stats.totalFundingEarned.toFixed(2)} USDT`
    );
  } catch (error) {
    console.error('Error fetching trade history:', error);
  }
}

// Export for use in other modules
export { example };

// Run example if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
}
