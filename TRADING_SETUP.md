# Trading Grid Bot Setup Guide

This guide will help you set up and use the Trading Grid Bot system with indicator-based filters and backtesting capabilities.

## Overview

The Trading Grid Bot system includes:

- **Grid Trading Bot Engine**: Automated grid trading with customizable price levels
- **Indicator-Based Filters**: Entry/exit conditions using RSI, MACD, SMA, EMA, Bollinger Bands, etc.
- **Backtesting Engine**: Historical strategy testing with TradingView integration
- **Strategy Management**: Save, share, and optimize trading strategies
- **Real-time Dashboard**: Monitor active bots and performance
- **Risk Management**: Stop-loss, take-profit, and position sizing controls

## Features Implemented

### Backend (Next.js API)
- ✅ Grid Bot Engine (`/backend/src/lib/trading/GridBotEngine.ts`)
- ✅ Backtest Engine (`/backend/src/lib/trading/BacktestEngine.ts`)
- ✅ Technical Indicators (`/backend/src/lib/trading/indicators/TechnicalIndicators.ts`)
- ✅ Market Data Provider (`/backend/src/lib/trading/providers/MarketDataProvider.ts`)
- ✅ TradingView Provider (`/backend/src/lib/trading/providers/TradingViewProvider.ts`)
- ✅ API Routes:
  - `/api/trading/grid-bot` - Bot management
  - `/api/trading/backtest` - Backtesting
  - `/api/trading/strategies` - Strategy CRUD
- ✅ Database Models: GridBot, GridBotTrade, Backtest, Strategy

### Frontend (Angular)
- ✅ Grid Bot Dashboard (`/frontend/src/app/components/trading/grid-bot-dashboard/`)
- ✅ Bot Configuration Component (`/frontend/src/app/components/trading/grid-bot-config/`)
- ✅ Backtest Results Component (`/frontend/src/app/components/trading/backtest-results/`)
- ✅ Trading Services:
  - `GridBotService` - Bot management and market data
  - `StrategyService` - Strategy management and optimization
- ✅ Updated routing and navigation

## Quick Start

### 1. Database Setup
The database schema has been updated with trading-specific tables. Run:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push
```

### 2. Start the Backend
```bash
cd backend
npm run dev
```

### 3. Start the Frontend
```bash
cd frontend
npm start
```

### 4. Access the Trading Dashboard
- Navigate to `http://localhost:4200/trading`
- Login with your existing credentials
- The trading dashboard will be available in the main navigation

## Using the Trading Grid Bot

### Creating a New Bot

1. **Navigate to Trading Dashboard**
   - Click on "🤖 Trading" in the main navigation

2. **Configure Basic Settings**
   - Select trading symbol (BTC/USDT, ETH/USDT, etc.)
   - Set price range (upper and lower bounds)
   - Define grid levels (3-50 levels)
   - Set order size per level

3. **Add Entry Filters (Optional)**
   - RSI conditions (e.g., RSI < 30 for oversold)
   - MACD signals (e.g., MACD > Signal line)
   - Moving average conditions
   - Bollinger Bands breakouts
   - Custom indicator combinations

4. **Add Exit Filters (Optional)**
   - Stop-loss conditions
   - Take-profit targets
   - Market condition changes
   - Risk management rules

5. **Configure Risk Management**
   - Maximum active orders
   - Stop-loss percentage
   - Take-profit percentage

6. **Review and Launch**
   - Preview configuration summary
   - Start the bot

### Strategy Management

1. **Create Strategies**
   - Save filter combinations as reusable strategies
   - Share strategies with the community
   - Import popular strategies

2. **Backtest Strategies**
   - Test strategies on historical data
   - View performance metrics
   - Optimize parameters

3. **Strategy Analytics**
   - Win rate analysis
   - Risk-adjusted returns
   - Drawdown analysis
   - Sharpe ratio and other metrics

## Available Indicators

### Trend Indicators
- **SMA (Simple Moving Average)**: Trend direction
- **EMA (Exponential Moving Average)**: Responsive trend following
- **MACD**: Momentum and trend changes

### Momentum Indicators
- **RSI (Relative Strength Index)**: Overbought/oversold conditions
- **Stochastic**: Momentum oscillator
- **ADX (Average Directional Index)**: Trend strength

### Volatility Indicators
- **Bollinger Bands**: Price volatility and support/resistance

### Volume Indicators
- **Volume SMA**: Average volume analysis
- **Volume Ratio**: Volume comparison

## Grid Trading Strategy

The grid bot works by:

1. **Setting Price Levels**: Creates buy/sell orders at predetermined price intervals
2. **Profit from Volatility**: Profits from price movements within the grid range
3. **Automated Rebalancing**: Automatically places new orders as previous ones fill
4. **Risk Management**: Stops trading when exit conditions are met

### Example Grid Setup
```
Upper Price: $55,000
Lower Price: $45,000
Grid Levels: 10
Order Size: 0.001 BTC

Grid Spacing: $1,000
Total Investment: ~$250 (0.005 BTC * $50,000 avg price)
```

## Backtesting

### Running a Backtest

1. **Configure Parameters**
   - Select symbol and timeframe
   - Set date range for testing
   - Choose grid configuration
   - Add entry/exit filters

2. **Review Results**
   - Total P&L and ROI
   - Win rate and trade statistics
   - Maximum drawdown
   - Sharpe ratio and risk metrics
   - Equity curve visualization

3. **Export Results**
   - Download detailed trade history
   - Export configuration for reuse

## Risk Management

### Built-in Safety Features
- **Stop Loss**: Automatic bot shutdown on excessive losses
- **Take Profit**: Automatic bot shutdown on profit targets
- **Position Limits**: Maximum number of active orders
- **Market Condition Filters**: Exit on unfavorable conditions

### Best Practices
1. **Start Small**: Begin with small amounts to test strategies
2. **Diversify**: Use multiple bots with different strategies
3. **Monitor Regularly**: Check bot performance and market conditions
4. **Backtest First**: Always test strategies before live trading
5. **Set Clear Limits**: Define maximum loss and profit targets

## Market Data Sources

Currently configured for demo/mock data. To connect real market data:

1. **Binance API** (implemented mock in MarketDataProvider)
2. **TradingView** (mock implementation for backtesting)

### Adding Real Market Data
Update the providers in:
- `/backend/src/lib/trading/providers/MarketDataProvider.ts`
- `/backend/src/lib/trading/providers/TradingViewProvider.ts`

Add your API keys to the environment variables:
```env
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
TRADINGVIEW_API_KEY=your_tv_api_key
```

## Advanced Features

### Strategy Optimization
- Parameter optimization using genetic algorithms
- Walk-forward analysis
- Monte Carlo simulations

### Community Features
- Share strategies with other users
- Rate and review strategies
- Import popular strategies

### AI-Powered Features
- Strategy suggestion based on market conditions
- Automatic parameter optimization
- Risk assessment and recommendations

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **API Errors**
   - Verify authentication tokens
   - Check API rate limits

3. **Bot Not Starting**
   - Verify configuration parameters
   - Check market data connectivity

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Next Steps

1. **Connect Real Exchange APIs**
   - Implement live trading connectivity
   - Add webhook support for real-time updates

2. **Enhanced Analytics**
   - Portfolio-level analytics
   - Risk metrics dashboard
   - Performance attribution

3. **Mobile App**
   - React Native or Flutter app
   - Push notifications for alerts

4. **Advanced Order Types**
   - Trailing stops
   - OCO (One-Cancels-Other) orders
   - Iceberg orders

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the codebase documentation
3. Test with mock data first before live trading

## Disclaimer

⚠️ **Important**: This is a trading bot system. Always:
- Test thoroughly with paper trading first
- Never risk more than you can afford to lose
- Understand the risks of automated trading
- Comply with local regulations
- Use appropriate risk management

The system currently uses mock market data for demonstration purposes. Connect real market data feeds carefully and test extensively before live trading.