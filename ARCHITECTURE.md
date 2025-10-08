# Trading Bot Platform - System Architecture

## Overview

This is a cryptocurrency trading bot platform with a real-time dashboard for monitoring and configuring automated trading strategies. The system consists of an Angular frontend and a Next.js backend, integrated with cryptocurrency exchange APIs (primarily Bybit).

## Technology Stack

### Frontend
- **Framework**: Angular 18
- **Language**: TypeScript 5.4.5
- **Charts**: lightweight-charts 5.0.8
- **State Management**: RxJS 7.8.0
- **UI Components**: Custom components with Angular Material patterns
- **Build Tool**: Angular CLI 18.0.0

### Backend
- **Framework**: Next.js 15.5.2
- **Runtime**: Node.js
- **Language**: TypeScript 5.x
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Exchange Integration**: bybit-api 4.3.1

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
│                                                                │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │   Angular SPA      │  │   Service Worker   │                │
│  │   (Frontend)       │  │   (PWA Support)    │                │
│  └────────────────────┘  └────────────────────┘                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ├─── HTTP/REST ───┐
                              │                 │
                              ├─── WebSocket ───┤
                              │                 │
┌─────────────────────────────▼─────────────────▼───────────────┐
│                      APPLICATION LAYER                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Next.js Backend Server                    │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │   │
│  │  │ Auth API     │  │ Trading API   │  │  User API   │  │   │
│  │  │ - Login      │  │ - Strategies  │  │  - Profile  │  │   │
│  │  │ - Register   │  │ - Grid Bot    │  │  - Prefs    │  │   │
│  │  │ - Google     │  │ - Backtest    │  │  - Messages │  │   │
│  │  └──────────────┘  └───────────────┘  └─────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      INTEGRATION LAYER                        │
│                                                               │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │   Bybit API        │  │   Other Exchanges  │               │
│  │   - REST API       │  │   (Future)         │               │
│  │   - WebSocket V5   │  │                    │               │
│  └────────────────────┘  └────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
AppComponent (Root)
│
├── NavbarComponent (Header/Navigation)
│
├── RouterOutlet
│   ├── HomeComponent (Dashboard)
│   ├── LoginComponent (Authentication)
│   ├── ProfileComponent (User Profile)
│   │
│   ├── Trading Features
│   │   ├── BotConfigPageComponent
│   │   ├── BotConfigFormComponent
│   │   ├── GridBotDashboardComponent
│   │   └── EntryFilterComponent
│   │
│   ├── Charts & Visualization
│   │   ├── LightweightChartComponent (Real-time candlestick charts)
│   │   ├── TradingChartComponent
│   │   ├── ChartTestComponent
│   │   └── WebsocketTestComponent
│   │
│   └── UI Components (Reusable)
│       ├── ButtonComponent
│       ├── CardComponent
│       ├── DialogComponent
│       ├── InputComponent
│       ├── SelectComponent
│       ├── TableComponent
│       ├── TabsComponent
│       └── ThemeToggleComponent
│
└── FooterComponent
```

### Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│                                                             │
│  Core Services                                              │
│  ├── AuthService           - User authentication            │
│  ├── UserService           - User management                │
│  └── ThemeService          - Theme switching (dark/light)   │
│                                                             │
│  Data Services                                              │
│  ├── BybitService          - Main Bybit integration         │
│  ├── BybitWebSocketService - WebSocket connection manager   │
│  ├── TradingService        - Trading operations             │
│  ├── GridBotService        - Grid trading bot logic         │
│  └── StrategyService       - Trading strategies             │
│                                                             │
│  Utility Services                                           │
│  ├── ChartService          - Chart data processing          │
│  ├── TranslationService    - i18n support                   │
│  ├── RealtimeService       - Real-time data streams         │
│  └── GoogleAuthService     - Google OAuth integration       │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Real-Time Market Data

The platform provides real-time cryptocurrency market data visualization through WebSocket connections to Bybit exchange.

**Data Flow**: `Bybit WebSocket → BybitWebSocketService → BybitService → Components`

Key components:
- `LightweightChartComponent`: Displays candlestick charts using lightweight-charts library
- `BybitWebSocketService`: Manages WebSocket connections and message routing
- `BybitService`: Provides high-level API combining REST and WebSocket data

### 2. Trading Bot Configuration

Users can configure automated trading bots with various strategies:
- Grid trading bots
- Custom entry/exit filters
- Backtesting capabilities
- Multi-exchange support (planned)

### 3. User Management

- JWT-based authentication
- Google OAuth integration
- User profiles and preferences
- Notification system
- Message center

### 4. Theme System

Dynamic theme switching between light and dark modes using signals and effects.

## Data Flow Patterns

### Real-Time Candle Updates

```
1. Component subscribes to getRealTimeKlineData()
   └── bybit.service.ts

2. Service fetches initial historical data (REST API)
   └── GET /v5/market/kline

3. Service subscribes to WebSocket stream
   └── bybit-websocket.service.ts → subscribeToKline()

4. WebSocket receives messages
   └── handleKlineData() transforms and routes data

5. Service combines initial + real-time data
   └── BehaviorSubject emits updated array

6. Component receives updates
   ├── First emission: setData() - loads all historical data
   └── Subsequent emissions: update() - updates last candle only
```

### Authentication Flow

```
1. User submits credentials
   └── LoginComponent

2. Request sent to backend
   └── POST /api/auth/login

3. Backend validates credentials
   ├── Password verification (bcrypt)
   └── JWT token generation

4. Frontend stores token
   ├── AuthService
   └── localStorage/sessionStorage

5. Subsequent requests include token
   └── HTTP Interceptor adds Authorization header

6. Protected routes check auth status
   └── AuthGuard
```

## Backend API Structure

### API Routes

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   └── GET  /google
│
├── /user
│   ├── GET  /profile
│   ├── PUT  /profile
│   ├── GET  /preferences
│   ├── PUT  /preferences
│   ├── GET  /messages
│   ├── POST /messages/:id/read
│   ├── POST /messages/read-all
│   └── GET  /notifications
│
├── /trading
│   ├── GET  /platforms
│   ├── GET  /strategies
│   ├── GET  /symbols
│   ├── GET  /chart
│   ├── GET  /stream (WebSocket)
│   │
│   ├── /config
│   │   ├── GET  /
│   │   ├── POST /
│   │   └── PUT  /
│   │
│   ├── /grid-bot
│   │   ├── GET  /
│   │   ├── POST /
│   │   └── PUT  /
│   │
│   ├── /api-keys
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── PUT    /:platformId
│   │   ├── DELETE /:platformId
│   │   └── POST   /:platformId/test
│   │
│   ├── /balance
│   │   ├── GET  /
│   │   └── POST /refresh
│   │
│   ├── /orders
│   │   └── GET  /
│   │
│   └── /backtest
│       └── POST /
│
└── /subscriptions
    └── GET  /
```

## Security

### Authentication
- JWT tokens with expiration
- HTTP-only cookies (recommended)
- Password hashing with bcrypt
- Google OAuth 2.0 integration

### API Security
- API key encryption
- Request validation
- Rate limiting (recommended)
- CORS configuration

### Frontend Security
- Auth guards on protected routes
- Token refresh mechanism
- XSS prevention
- CSRF protection

## Performance Optimizations

### Frontend
- Lazy loading of routes
- OnPush change detection strategy
- RxJS operators for efficient data streams
- WebSocket connection pooling
- Chart data windowing (keep last 1000 candles)

### Backend
- Connection pooling for database
- Caching strategies
- API response compression
- Efficient data transformation

## Deployment

### Frontend Deployment
```bash
# Build for production
cd frontend
npm run build

# Output: dist/frontend
# Serve with any static file server
```

### Backend Deployment
```bash
# Build for production
cd backend
npm run build

# Start production server
npm start
```

### Environment Variables

**Frontend** (`proxy.conf.js`):
- Target backend URL for development proxy

**Backend** (`.env`):
- `JWT_SECRET` - Secret key for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- Database connection strings
- API keys for exchanges

## Development Workflow

### Running Locally

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   # Runs on http://localhost:4200
   # Proxies /api/* to backend
   ```

### Testing

Frontend:
```bash
npm test        # Unit tests
npm run e2e     # End-to-end tests
```

## Future Enhancements

1. **Multi-Exchange Support**
   - Binance integration
   - Coinbase integration
   - Kraken integration

2. **Advanced Features**
   - Machine learning strategy optimization
   - Portfolio management
   - Risk management tools
   - Advanced backtesting

3. **Infrastructure**
   - WebSocket fallback mechanisms
   - Database integration for persistence
   - Redis for caching
   - Monitoring and logging

4. **UI/UX**
   - Mobile responsive design
   - Progressive Web App (PWA) features
   - Real-time notifications
   - Advanced charting tools

## Monitoring and Logging

### Frontend Logging
- Console logging with prefixes:
  - `[CHART]` - Chart component
  - `[BYBIT SERVICE]` - Bybit service layer
  - `[WS SERVICE]` - WebSocket service

### Backend Logging
- Request/response logging
- Error tracking
- Performance metrics
- API usage analytics

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check Bybit API status
   - Verify WebSocket URL
   - Check network connectivity
   - Review browser console for errors

2. **Chart Not Updating**
   - Verify WebSocket connection state
   - Check subscription flow in console logs
   - Ensure data format matches expectations
   - Verify lightweight-charts version compatibility

3. **Authentication Errors**
   - Verify JWT token validity
   - Check token expiration
   - Ensure backend is running
   - Verify credentials

## References

- [Angular Documentation](https://angular.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bybit API V5 Documentation](https://bybit-exchange.github.io/docs/v5/intro)
- [lightweight-charts Documentation](https://tradingview.github.io/lightweight-charts/)
- [RxJS Documentation](https://rxjs.dev/)
