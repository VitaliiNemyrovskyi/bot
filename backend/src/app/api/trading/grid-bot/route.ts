import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/middleware/auth';
import { TradingBot, BotConfiguration } from '@/types/trading-bot';

// In-memory storage for trading bots
const gridBots = new Map<string, TradingBot>();

// Helper function to generate bot ID
function generateBotId(): string {
  return `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await validateUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const botId = url.searchParams.get('botId');

    if (botId) {
      // Return specific bot
      const bot = gridBots.get(botId);
      if (!bot || bot.userId !== user.id) {
        return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
      }
      return NextResponse.json(bot);
    }

    // Return all bots for user
    const bots = Array.from(gridBots.values()).filter(bot => bot.userId === user.id);
    return NextResponse.json(bots);
  } catch (error) {
    console.error('Grid bot GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, config } = await request.json();

    // Validate required fields
    if (!name || !config || !config.symbol) {
      return NextResponse.json({
        error: 'Missing required fields: name, config.symbol'
      }, { status: 400 });
    }

    // Create new trading bot
    const botId = generateBotId();
    const now = new Date();

    const tradingBot: TradingBot = {
      id: botId,
      name,
      userId: user.id,
      symbol: config.symbol,
      status: 'STOPPED',
      config: {
        // Basic configuration
        symbol: config.symbol,
        baseAsset: config.baseAsset || config.symbol.split('/')[0] || 'BTC',
        quoteAsset: config.quoteAsset || config.symbol.split('/')[1] || 'USDT',

        // Grid strategy configuration
        gridStrategy: config.gridStrategy || {
          type: 'REGULAR',
          gridCount: config.gridCount || 10,
          gridSpacing: config.gridSpacing || 1.0
        },

        // Grid range
        gridRange: config.gridRange || {
          upperBound: config.upperBound || 50000,
          lowerBound: config.lowerBound || 30000,
          autoAdjust: config.autoAdjust || false
        },

        // Entry/Exit filters
        entryFilters: config.entryFilters || [],
        exitFilters: config.exitFilters || [],

        // Risk management
        riskManagement: config.riskManagement || {
          baseOrderSize: config.baseOrderSize || 10,
          maxPositionSize: config.maxPositionSize || 1000,
          maxOpenOrders: config.maxOpenOrders || 20
        },

        // Time restrictions
        timeRestrictions: config.timeRestrictions,

        // Chart configuration
        chartConfig: config.chartConfig
      },
      createdAt: now,
      updatedAt: now,
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        dailyPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        lastCalculatedAt: now
      }
    };

    gridBots.set(botId, tradingBot);

    return NextResponse.json({
      success: true,
      bot: tradingBot,
      message: 'Trading bot created successfully'
    });
  } catch (error) {
    console.error('Trading bot POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, action, config } = await request.json();

    const bot = gridBots.get(botId);
    if (!bot || bot.userId !== user.id) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Update bot based on action
    switch (action) {
      case 'start':
        bot.status = 'RUNNING';
        break;
      case 'stop':
        bot.status = 'STOPPED';
        break;
      case 'pause':
        bot.status = 'PAUSED';
        break;
      case 'update':
        if (config) {
          bot.config = { ...bot.config, ...config };
        }
        break;
    }

    bot.updatedAt = new Date();
    gridBots.set(botId, bot);

    return NextResponse.json({
      success: true,
      status: bot.status,
      message: `Bot ${action}ed successfully`
    });
  } catch (error) {
    console.error('Grid bot PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const botId = url.searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    const bot = gridBots.get(botId);
    if (!bot || bot.userId !== user.id) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    gridBots.delete(botId);

    return NextResponse.json({
      success: true,
      message: 'Bot deleted successfully'
    });
  } catch (error) {
    console.error('Grid bot DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
