import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/middleware/auth';
import { BacktestResult, BacktestTrade, BotConfiguration } from '@/types/trading-bot';

const backtests = new Map<string, BacktestResult>();

function generateBacktestId(): string {
  return `backtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function simulateBacktest(
  config: BotConfiguration,
  startDate: Date,
  endDate: Date,
  initialBalance: number,
  _timeframe: string
): Omit<BacktestResult, 'id' | 'createdAt' | 'executionTime'> {
  const trades: BacktestTrade[] = [];
  const dailyReturns: Array<{ date: Date; return: number }> = [];
  const equityCurve: Array<{ time: number; value: number }> = [];
  const drawdownCurve: Array<{ time: number; value: number }> = [];

  let currentBalance = initialBalance;
  let maxBalance = initialBalance;
  let totalTrades = 0;
  let winningTrades = 0;
  let losingTrades = 0;

  // Simulate trading based on grid strategy
  const durationMs = endDate.getTime() - startDate.getTime();
  const daysCount = Math.ceil(durationMs / (24 * 60 * 60 * 1000));

  // Generate random trades based on grid configuration
  const gridCount = config.gridStrategy.gridCount;
  const expectedTradesPerDay = Math.max(1, Math.floor(gridCount / 5)); // Conservative estimate

  for (let day = 0; day < daysCount; day++) {
    const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    let dayPnL = 0;

    // Simulate trades for this day
    const tradesCount = Math.floor(Math.random() * expectedTradesPerDay * 2);

    for (let i = 0; i < tradesCount; i++) {
      const tradeId = `trade_${totalTrades + 1}`;
      const entryTime = new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      const exitTime = new Date(entryTime.getTime() + (Math.random() * 2 + 0.5) * 60 * 60 * 1000);

      // Simulate price movement based on grid range
      const midPrice = (config.gridRange.upperBound + config.gridRange.lowerBound) / 2;
      const priceVolatility = (config.gridRange.upperBound - config.gridRange.lowerBound) * 0.1;

      const entryPrice = midPrice + (Math.random() - 0.5) * priceVolatility;
      const exitPrice = entryPrice + (Math.random() - 0.5) * priceVolatility * 0.3;

      const quantity = config.riskManagement.baseOrderSize;
      const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';

      let pnl: number;
      if (side === 'BUY') {
        pnl = (exitPrice - entryPrice) * quantity;
      } else {
        pnl = (entryPrice - exitPrice) * quantity;
      }

      // Apply some randomness and strategy effectiveness
      const strategyEffectiveness = getStrategyEffectiveness(config.gridStrategy.type);
      pnl *= strategyEffectiveness;

      const pnlPercentage = (pnl / (entryPrice * quantity)) * 100;

      if (pnl > 0) {
        winningTrades++;
      } else {
        losingTrades++;
      }

      const trade: BacktestTrade = {
        id: tradeId,
        entryTime,
        exitTime,
        entryPrice,
        exitPrice,
        quantity,
        side,
        pnl,
        pnlPercentage,
        entryReason: getEntryReason(config),
        exitReason: getExitReason(config),
        marketConditions: {
          rsi: Math.random() * 100,
          macd: Math.random() * 2 - 1,
          volume: Math.random() * 1000000,
          volatility: Math.random() * 5
        }
      };

      trades.push(trade);
      totalTrades++;
      dayPnL += pnl;
    }

    currentBalance += dayPnL;
    maxBalance = Math.max(maxBalance, currentBalance);

    dailyReturns.push({
      date: currentDate,
      return: dayPnL
    });

    equityCurve.push({
      time: currentDate.getTime(),
      value: currentBalance
    });

    const drawdown = ((maxBalance - currentBalance) / maxBalance) * 100;
    drawdownCurve.push({
      time: currentDate.getTime(),
      value: drawdown
    });
  }

  // Calculate performance metrics
  const totalReturn = currentBalance - initialBalance;
  const totalReturnPercentage = (totalReturn / initialBalance) * 100;
  const maxDrawdown = Math.max(...drawdownCurve.map(d => d.value));

  // Calculate Sharpe ratio (simplified)
  const avgDailyReturn = dailyReturns.reduce((sum, d) => sum + d.return, 0) / dailyReturns.length;
  const returnVariance = dailyReturns.reduce((sum, d) => sum + Math.pow(d.return - avgDailyReturn, 2), 0) / dailyReturns.length;
  const returnStd = Math.sqrt(returnVariance);
  const sharpeRatio = returnStd > 0 ? (avgDailyReturn / returnStd) * Math.sqrt(252) : 0;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageWin = winningTrades > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades) : 0;
  const profitFactor = averageLoss > 0 ? averageWin / averageLoss : 0;

  // Generate monthly returns
  const monthlyReturns = generateMonthlyReturns(dailyReturns);

  return {
    botId: '',
    config,
    startDate,
    endDate,
    initialBalance,
    finalBalance: currentBalance,
    totalReturn,
    totalReturnPercentage,
    maxDrawdown,
    sharpeRatio,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    dailyReturns,
    monthlyReturns,
    trades,
    equityCurve,
    drawdownCurve
  };
}

function getStrategyEffectiveness(strategyType: string): number {
  switch (strategyType) {
    case 'REGULAR': return 0.8 + Math.random() * 0.4; // 80-120%
    case 'FIBONACCI': return 0.85 + Math.random() * 0.3; // 85-115%
    case 'LOGARITHMIC': return 0.75 + Math.random() * 0.5; // 75-125%
    case 'MULTIPLICATOR': return 0.7 + Math.random() * 0.6; // 70-130%
    case 'MARTINGALE': return 0.6 + Math.random() * 0.8; // 60-140%
    default: return 0.8 + Math.random() * 0.4;
  }
}

function getEntryReason(config: BotConfiguration): string {
  if (config.entryFilters.length > 0) {
    const filter = config.entryFilters[Math.floor(Math.random() * config.entryFilters.length)];
    if (filter) {
      return `Entry filter: ${filter.name}`;
    }
  }
  return 'Grid level reached';
}

function getExitReason(config: BotConfiguration): string {
  if (config.exitFilters.length > 0) {
    const filter = config.exitFilters[Math.floor(Math.random() * config.exitFilters.length)];
    if (filter) {
      return `Exit filter: ${filter.name}`;
    }
  }
  const reasons = ['Take profit', 'Stop loss', 'Grid rebalance', 'Time-based exit'];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  return reason || 'Grid level reached';
}

function generateMonthlyReturns(dailyReturns: Array<{ date: Date; return: number }>): Array<{ month: string; return: number }> {
  const monthlyMap = new Map<string, number>();

  dailyReturns.forEach(daily => {
    const monthKey = `${daily.date.getFullYear()}-${String(daily.date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + daily.return);
  });

  return Array.from(monthlyMap.entries()).map(([month, returnValue]) => ({
    month,
    return: returnValue
  }));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      symbol,
      timeframe,
      startDate,
      endDate,
      gridConfig,
      filters,
      initialBalance
    } = await request.json();

    if (!symbol || !timeframe || !startDate || !endDate || !initialBalance) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, timeframe, startDate, endDate, initialBalance' },
        { status: 400 }
      );
    }

    // Create bot configuration from request
    const config: BotConfiguration = {
      symbol,
      baseAsset: symbol.split('/')[0] || 'BTC',
      quoteAsset: symbol.split('/')[1] || 'USDT',
      gridStrategy: gridConfig?.gridStrategy || {
        type: 'REGULAR',
        gridCount: 10,
        gridSpacing: 1.0
      },
      gridRange: gridConfig?.gridRange || {
        upperBound: 50000,
        lowerBound: 30000,
        autoAdjust: false
      },
      entryFilters: filters?.entryFilters || [],
      exitFilters: filters?.exitFilters || [],
      riskManagement: {
        baseOrderSize: 10,
        maxPositionSize: 1000,
        maxOpenOrders: 20,
        ...gridConfig?.riskManagement
      },
      timeRestrictions: gridConfig?.timeRestrictions,
      chartConfig: gridConfig?.chartConfig
    };

    // Run backtest simulation
    const backtestResult = simulateBacktest(
      config,
      new Date(startDate),
      new Date(endDate),
      initialBalance,
      timeframe
    );

    // Create backtest record
    const backtestId = generateBacktestId();
    const executionTime = Date.now() - startTime;

    const fullBacktestResult: BacktestResult = {
      id: backtestId,
      ...backtestResult,
      createdAt: new Date(),
      executionTime
    };

    backtests.set(backtestId, fullBacktestResult);

    return NextResponse.json({
      success: true,
      backtestId,
      results: {
        totalReturn: fullBacktestResult.totalReturn,
        totalReturnPercentage: fullBacktestResult.totalReturnPercentage,
        totalTrades: fullBacktestResult.totalTrades,
        winRate: fullBacktestResult.winRate,
        maxDrawdown: fullBacktestResult.maxDrawdown,
        sharpeRatio: fullBacktestResult.sharpeRatio,
        profitFactor: fullBacktestResult.profitFactor
      }
    });
  } catch (error) {
    console.error('Backtest POST error:', error);
    return NextResponse.json({ error: 'Failed to run backtest' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const backtestId = url.searchParams.get('backtestId');

    if (backtestId) {
      const backtest = backtests.get(backtestId);
      if (!backtest) {
        return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
      }
      return NextResponse.json(backtest);
    }

    // Return all backtests (in a real implementation, filter by user)
    const allBacktests = Array.from(backtests.values());
    return NextResponse.json(allBacktests);
  } catch (error) {
    console.error('Backtest GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch backtests' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const backtestId = url.searchParams.get('backtestId');

    if (!backtestId) {
      return NextResponse.json({ error: 'Backtest ID is required' }, { status: 400 });
    }

    const backtest = backtests.get(backtestId);
    if (!backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
    }

    backtests.delete(backtestId);

    return NextResponse.json({
      success: true,
      message: 'Backtest deleted successfully'
    });
  } catch (error) {
    console.error('Backtest DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete backtest' }, { status: 500 });
  }
}