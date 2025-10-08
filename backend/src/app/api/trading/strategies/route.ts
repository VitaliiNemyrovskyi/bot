import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/middleware/auth';

// Mock data store for strategies
const strategies = new Map();

// Add some default strategies
const defaultStrategies = [
  {
    id: 'strategy_1',
    userId: null, // public strategy
    name: 'RSI Grid Strategy',
    description: 'Grid trading with RSI entry signals',
    entryFilters: [{ type: 'rsi', value: 30, condition: 'below' }],
    exitFilters: [{ type: 'rsi', value: 70, condition: 'above' }],
    isPublic: true,
    timesUsed: 45,
    averageReturn: 12.5,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'strategy_2',
    userId: null,
    name: 'MACD Crossover Grid',
    description: 'Grid bot triggered by MACD crossovers',
    entryFilters: [{ type: 'macd', condition: 'bullish_crossover' }],
    exitFilters: [{ type: 'macd', condition: 'bearish_crossover' }],
    isPublic: true,
    timesUsed: 23,
    averageReturn: 8.7,
    createdAt: new Date('2024-01-15'),
  }
];

// Initialize default strategies
defaultStrategies.forEach(strategy => {
  strategies.set(strategy.id, strategy);
});

export async function GET(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includePublic = url.searchParams.get('includePublic') !== 'false';

    let userStrategies = Array.from(strategies.values()).filter(strategy => {
      if (strategy.userId === user.id) return true;
      if (includePublic && strategy.isPublic) return true;
      return false;
    });

    return NextResponse.json(userStrategies);
  } catch (error) {
    console.error('Strategies GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, entryFilters, exitFilters, isPublic } = await request.json();

    // Create new strategy
    const strategyId = `strategy_${Date.now()}`;
    const strategy = {
      id: strategyId,
      userId: user.id,
      name,
      description,
      entryFilters,
      exitFilters,
      isPublic: isPublic || false,
      timesUsed: 0,
      averageReturn: null,
      createdAt: new Date(),
    };

    strategies.set(strategyId, strategy);

    return NextResponse.json({
      success: true,
      strategy
    });
  } catch (error) {
    console.error('Strategies POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}